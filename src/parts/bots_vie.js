// ---- v60 : relève des tireurs de mirador (nouveau fichier, branché par build.py : bvTick(dt) dans aiUpdate)
// Un tireur en poste sur un mirador n'en descend plus tout seul quand il est tranquille : il tient jusqu'à l'arrivée de son remplaçant (ou 4 min sans relève).
// Au bout de BVR.T s de garde, un autre soldat libre proche monte par l'escalier ; dès qu'il est en place, le premier redescend.
const BVR={T:50,max:240,rng:62,acc:0,n:0,on:true};
function bvPost(c,h,from){if(c.lvl||c.route||c.after||!h.roofPosts)return false;c.lk.x=from.lk.x;c.lk.z=from.lk.z;let bp=null,bq=-9;
for(const p of h.roofPosts){if(p.occ>0)continue;const dx=c.lk.x-p[0],dz=c.lk.z-p[1],d=Math.hypot(dx,dz)||1,q=(dx*Math.sin(p[2])+dz*Math.cos(p[2]))/d;if(q>bq){bq=q;bp=p}}
if(!bp)return false;const route=[h.iA,h.iB,h.rA,h.rB,h.rL].concat(bp[3]?[h.rM]:[],[bp]),F=h.iF;
if(!goTo(c,F[0],F[1],2.2,'ups'))return false;c.after={route:route.map(q=>[q[0],q[1]]),post:bp,lvl:2,h:h,F:[F[0],F[1]]};h.occ=(h.occ||0)+1;bp.occ=1;return true}
function bvOn(b){return b.lvl===2&&b.hh&&b.hh.tower&&!b.route&&!(b.dead>0)}
function bvTick(dt){if(!BVR.on)return;
for(const b of bots){if(!bvOn(b)){if(b.bvT)b.bvT=0;continue}
 if(b.hp>=b.T.hp*.4&&b.hold>12&&b.hold<900)b.hold=12;if(b.st==='hold')b.bvT=(b.bvT||0)+dt}
if((BVR.acc+=dt)<2)return;BVR.acc=0;
for(const h of UPH){if(!h.tower)continue;const on=bots.filter(b=>bvOn(b)&&b.hh===h&&b.st==='hold');
 if(h.relv){const c=h.relv,pend=c.after&&c.after.h===h;
  if(c.dead>0||(!pend&&c.hh!==h)){h.relv=null;continue}
  if(c.hh===h&&c.lvl===2&&c.st==='hold'){const old=on.filter(b=>b!==c).sort((a,b)=>(b.bvT||0)-(a.bvT||0))[0];if(old){old.hold=999;BVR.n++}h.relv=null}
  continue}
 const o=on.filter(b=>(b.bvT||0)>BVR.T).sort((a,b)=>(b.bvT||0)-(a.bvT||0))[0];if(!o)continue;
 if(on.length===1&&o.bvT>BVR.max){o.hold=999;continue}
 if(on.length>=2){o.hold=999;BVR.n++;continue}
 if((h.occ||0)>=2)continue;
 let c=null,bd=1e9;for(const b of bots){if(b===o||b.dead>0||b.lvl||b.route||b.after||b.sur||b.dorm||b.unarm||b.alert||b.seenT<8||b.hp<b.T.hp*.6)continue;const d=Math.hypot(b.g.position.x-h.cx,b.g.position.z-h.cz)+(b.ty===2?0:12);if(d<BVR.rng&&d<bd){bd=d;c=b}}
 if(c){AI.budget=Math.max(AI.budget,1);if(bvPost(c,h,o))h.relv=c}}}
