// ================= RÉALISME (v43) : vent lisible, météo automatique, lune, fouille, lampe/laser =================
const _rv=new THREE.Vector3();
const REA={ok:0,t:0};
function reaOk(x,z){return wDist(x,z)>6&&!(typeof inRoom==='function'&&inRoom(x,z)>=0)&&Math.abs(x)<125&&Math.abs(z)<125}

// ---------- 1. Vent : lu dans l'herbe (penchée dans le sens du vent balistique, rafales qui se déplacent avec lui) ----------
const VNT={sp:0,ang:0};
function vntTick(dt){balWind();VNT.sp=Math.hypot(BAL.wx||0,BAL.wz||0);VNT.ang=Math.atan2(BAL.wz||0,BAL.wx||0)}

// ---------- 2. Météo automatique + effets (bruit étouffé, adhérence) ----------
const WXA={t:260,lock:0,last:0};
// clair, nuageux, pluie, orage, brouillard
const WXT=[[.45,.4,0,0,.15],[.3,.3,.3,0,.1],[0,.35,.35,.3,0],[0,.2,.8,0,0],[.5,.4,.1,0,0]];
function wxaNext(){const cur=TOD.tgt,w=WXT[cur].slice(),h=TOD.t;
 if(h>4.3&&h<8.8&&cur<=1)w[4]+=.5;if(h>11&&h<17&&cur===0)w[1]+=.15;
 if(cur<=1)w[cur]=Math.max(0,w[cur]-.2);
 let s=0;for(let i=0;i<5;i++){if(i===cur)w[i]=0;s+=w[i]}let r=Math.random()*s;for(let i=0;i<5;i++){r-=w[i];if(r<=0)return i}return (cur+1)%5}
function wxaTick(dt){
 if(TOD.tgt!==WXA.last)WXA.lock=600
 if(WXA.lock>0){WXA.lock-=dt;WXA.last=TOD.tgt;return}
 WXA.t-=dt;if(WXA.t<=0){WXA.t=rnd(170,380);TOD.tgt=wxaNext()}
 WXA.last=TOD.tgt}
const noise0=noise;noise=function(x,z,r){noise0(x,z,r*(1-.3*wcur[2]))};
function drvGrip(){return 1-.3*(typeof WET!=='undefined'?WET.v:0)-(wcur[2]>.5?.08:0)}

// ---------- 3. Lune : phases (cycle de 8 jours), position réelle, éclairage, vision nocturne ----------
const MOO={day:3,pt:14.2,p:0,ill:1,ico:'🌕'};
const MICO=['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘'];
function mooPhase(day,t){return (((day+t/24)/8)%1+1)%1}
function mooIll(p){return .5-.5*Math.cos(p*6.2832)}
function moonDir(ang,v){const a=ang+6.2832*MOO.p;return v.set(-Math.cos(a)*.9,Math.sin(a)*.82,-.45).normalize()}
function moonVis(){return .75+.5*MOO.ill}
function mooTick(dt){if(TOD.t<MOO.pt-12)MOO.day++;MOO.pt=TOD.t;MOO.p=mooPhase(MOO.day,TOD.t);MOO.ill=mooIll(MOO.p);MOO.ico=MICO[Math.round(MOO.p*8)%8];
 // vision nocturne : plus de grain et moins de gain par nouvelle lune
 if(NVG.m===1&&NVG.el){const dk=TOD.t>19.5||TOD.t<5.8;NVG.el.style.backdropFilter=NVG.el.style.webkitBackdropFilter='grayscale(1) sepia(1) hue-rotate(70deg) saturate(4) brightness('+(dk?(1.5+.7*MOO.ill).toFixed(2):2.1)+') contrast(1.15)';if(NVG.nc)NVG.nc.style.opacity=dk?(.12+.4*(1-MOO.ill)).toFixed(2):'';}}

// ---------- 4. Fouille : corps et caisses à fouiller maintenant F ----------
const FOU={cap:null,p:null,cr:[],el:null,hint:0,ns:0};
const fouIS=invSpawn;invSpawn=function(){if(FOU.cap){FOU.cap.push([].slice.call(arguments));return{m:new THREE.Object3D()}}return fouIS.apply(null,arguments)};
const fouIL=invLoot;invLoot=function(b){if(b.sur){fouIL(b);return}FOU.cap=[];const c=FOU.cap;try{fouIL(b)}finally{FOU.cap=null}b.stash=c.length?c:null};
function fouBuild(){
 const bm=new THREE.MeshLambertMaterial({color:0x6b5334}),lm=new THREE.MeshLambertMaterial({color:0x7d6340}),bg=new THREE.BoxGeometry(.9,.5,.6),lg=new THREE.BoxGeometry(.96,.07,.66);lg.translate(0,0,.33);
 let n=0;for(let i=0;i<80&&n<8;i++){const x=rnd(-120,120),z=rnd(-120,120);if(!reaOk(x,z))continue;
  const g=new THREE.Group(),body=new THREE.Mesh(bg,bm),hinge=new THREE.Group(),lid=new THREE.Mesh(lg,lm);body.position.y=.25;hinge.position.set(0,.53,-.33);hinge.add(lid);lid.position.z=0;
  g.add(body,hinge);g.position.set(x,GH(x,z),z);g.rotation.y=rnd(0,6.28);S.add(g);
  const r=Math.random,st=[];const add=(id,q)=>st.push([id,q]);
  add('z'+((r()*4)|0),r()<.5?30:15);if(r()<.7)add('bd',1+((r()*2)|0));if(r()<.3)add('tq',1);if(r()<.2)add('sp',1);if(r()<.18)add('kit',1);if(r()<.3)add('g'+((r()*4)|0),1);if(r()<.2)add('pl',1);
  FOU.cr.push({g,hinge,x,z,st,open:0,a:0});n++}}
function fouLoose(){return invNear()}
function fouTarget(){let b=null,bd=2.2;
 for(const o of bots){if(!o.stash||!o.dead||o.sur)continue;const d=Math.hypot(o.g.position.x-P.x,o.g.position.z-P.z);if(d<bd){bd=d;b={k:'b',o,d,n:o.stash.length}}}
 for(const c of FOU.cr){if(c.open)continue;const d=Math.hypot(c.x-P.x,c.z-P.z);if(d<bd){bd=d;b={k:'c',o:c,d,n:c.st.length}}}
 return b}
function fouMsg(h){if(!FOU.el){const d=document.createElement('div');d.style.cssText='position:fixed;left:50%;bottom:26%;transform:translateX(-50%);font:13px monospace;color:#dfe8d0;text-shadow:0 1px 3px #000;pointer-events:none;z-index:6;text-align:center;display:none';document.body.appendChild(d);FOU.el=d}
 FOU.el.style.display=h?'block':'none';if(h)FOU.el.innerHTML=h}
function fouDone(t){
 const o=t.o;let n=0;
 if(t.k==='b'){for(const a of o.stash){fouIS(a[0],a[1],a[2],Math.max(a[3],GH(a[2],a[4])+.3),a[4],a[5],a[6],a[7]);n++}o.stash=null}
 else{const a0=Math.random()*6.28;for(const a of o.st){const an=a0+n*2.4,d=1.1+(n%2)*.35;fouIS(a[0],a[1],o.x+Math.cos(an)*d,GH(o.x,o.z)+.4,o.z+Math.sin(an)*d,0,0);n++}o.open=1;o.st=[]}
 FOU.ns++;hlMsg(n+' objet'+(n>1?'s':'')+' trouvé'+(n>1?'s':''));snd(480,.06,.1,'triangle')}
function fouTick(dt){
 for(const c of FOU.cr){if(c.open&&c.a<1.3){c.a=Math.min(1.3,c.a+dt*2.5);c.hinge.rotation.x=-c.a}}
 FOU.hint-=dt;const held=!!K.KeyF,mv=K.KeyW||K.KeyA||K.KeyS||K.KeyD;
 if(FOU.p){const p=FOU.p;if(!held||mv||P.hp<p.hp-.1||HM.dead||ac.on||(p.t.k==='b'?!p.t.o.stash:p.t.o.open)||Math.hypot((p.t.k==='b'?p.t.o.g.position.x:p.t.o.x)-P.x,(p.t.k==='b'?p.t.o.g.position.z:p.t.o.z)-P.z)>2.6){FOU.p=null;fouMsg('');return}
  p.e+=dt;p.nz-=dt;if(p.nz<=0){p.nz=.8;noise(P.x,P.z,6)}
  if(p.e>=p.T){const t=p.t;FOU.p=null;fouMsg('');fouDone(t)}else fouMsg('Fouille… '+Math.round(p.e/p.T*100)+' %');return}
 if(FOU.hint>0)return;FOU.hint=.15;
 if(ac.on||HM.dead||bench||DRV.on||INV.open||fouLoose()){fouMsg('');return}
 const t=fouTarget();if(!t){fouMsg('');return}
 fouMsg('Maintiens [F] : fouiller '+(t.k==='b'?'le corps':'la caisse'));
 if(held&&!mv)FOU.p={t,e:0,T:t.k==='b'?Math.min(4,1.3+.55*t.n):2.6,hp:P.hp,nz:.2}}

// ---------- 5. Bruit et lumière : lampe, laser, éclairage des bâtiments ----------
const LUM={t:0,n:{lamp:0,laser:0,fen:0},dot:null,dt:0};
const fwdP=v=>{const cp=Math.cos(P.pitch||0);return v.set(-Math.sin(P.yaw)*cp,Math.sin(P.pitch||0),-Math.cos(P.yaw)*cp)};
function lumLaser(){const m=wmGet(WSEL);return m.l||0}
function lumDot(dt){
 if(!LUM.dot){LUM.dot=new THREE.Mesh(new THREE.SphereGeometry(.035,6,5),new THREE.MeshBasicMaterial({color:0xff2a1a,fog:false,depthTest:false,transparent:true,opacity:.95}));LUM.dot.renderOrder=9;LUM.dot.visible=false;S.add(LUM.dot)}
 LUM.dt-=dt;const l=lumLaser();const vis=l===1||(l===2&&NVG.m===1);
 if(!vis||ac.on||HM.dead||!gun.visible){LUM.dot.visible=false;return}
 if(LUM.dt>0)return;LUM.dt=.05;
 fwdP(_rv);_la.copy(C.position);RC.set(_la,_rv);RC.far=140;const hs=RC.intersectObjects(ray);let h=null;for(const x of hs)if(!x.object.userData.glass){h=x;break}
 if(h){LUM.dot.position.copy(h.point);LUM.dot.scale.setScalar(Math.max(1,h.distance*.12));LUM.dot.material.color.setHex(l===2?0x7dff9a:0xff2a1a);LUM.dot.visible=true}else LUM.dot.visible=false}
function lumTick(dt){
 lumDot(dt);LUM.t-=dt;if(LUM.t>0)return;LUM.t=.5;
 if(ac.on||HM.dead||P.hp<=0||DRV.on)return;
 const night=TOD.t>19.5||TOD.t<5.8,rm=inRoom(P.x,P.z)>=0;fwdP(_rv);
 const lamp=flOn&&(night||wcur[3]<.5||rm),las=lumLaser()===1&&(night||wcur[3]<.6),day=lumLaser()===1;
 const lit=ILON&&rm&&night;
 if(!lamp&&!las&&!day&&!lit)return;
 for(const b of bots){if(b.dead||b.sur||b.blind>0)continue;const g=b.g.position,dx=g.x-P.x,dz=g.z-P.z,d=Math.hypot(dx,dz);if(d<2||d>100)continue;
  const al=(dx*_rv.x+dz*_rv.z)/(d*Math.hypot(_rv.x,_rv.z)+1e-6);
  if(lamp&&al>.88&&d<=(rm?34:100)&&losClear(P.x,C.position.y,P.z,g.x,g.y+1.4,g.z)){if(!b.alert)LUM.n.lamp++;aiAlert(b,P.x,P.z,0);continue}
  if((las||day)&&al>.985&&d<=(night?80:30)&&losClear(P.x,C.position.y,P.z,g.x,g.y+1.4,g.z)){if(!b.alert)LUM.n.laser++;aiAlert(b,P.x,P.z,0);continue}
  if(lit&&d>8&&d<60&&inRoom(g.x,g.z)<0&&Math.random()<.2&&!b.alert){LUM.n.fen++;aiAlert(b,P.x,P.z,2)}}}

// ---------- 6. Outils de test : F8 (2e appui) gèle les bots, F7 fait apparaître un ennemi devant soi ----------
const ENF={keep:new Set(),last:null,zone:'',dm:0,el:null};
const au0=aiUpdate;aiUpdate=function(dt,inz){if(!ENM.fz)return au0(dt,inz);
 for(const b of bots){if(b.dead>50&&!ENF.keep.has(b)){b.g.visible=false;continue}if(b.dead>0){botDead(b,dt);continue}b.dorm=0;b.g.visible=true;b.mvA=0;b.see=false;b.path=null;b.cd=Math.max(b.cd||0,1);b.fl=0;b.relT=0;b.stun=0;try{bhUpdate(b,0);sldUpdate(b,.001,false)}catch(e){}}};
const bh0=bhHit;bhHit=function(b,z,dm,k){const r=bh0(b,z,dm,k);ENF.last=b;ENF.zone=z;ENF.dm=dm;return r};
function enfFreeze(){ENF.keep=new Set();for(const b of bots)if(!(b.dead>50)&&!b.sur){b.dead=99;b.g.visible=false}return enfSpawn()?1:0}
function enfSpawn(){
 if(ac.on||HM.dead)return;if(ENM.off){ENM.off=0;bots.forEach(b=>{if(b.dead>50){b.dead=0;spawn(b)}})}
 let c=bots.find(b=>b.dead>0&&!ENF.keep.has(b)),bd=-1;if(!c)for(const b of bots){if(b.sur||ENF.keep.has(b))continue;const d=Math.hypot(b.g.position.x-P.x,b.g.position.z-P.z);if(d>bd){bd=d;c=b}}
 if(!c)return;const fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw);let ok=0;
 for(const d of[9,7,12,5]){const x=P.x+fx*d,z=P.z+fz*d;if(typeof free_==='function'&&!free_(x,z))continue;spawn(c);c.g.position.set(x,GH(x,z),z);aiReset(c,c.ty);c.g.rotation.y=c.yaw=Math.atan2(P.x-x,P.z-z);c.g.visible=true;c.dorm=0;ENF.keep.add(c);ok=1;if(!ENM.fz)aiAlert(c,P.x,P.z,0);break}
 hlMsg(ok?(ENM.fz?'Ennemi gelé devant toi':'Ennemi apparu devant toi'):'Pas de place devant toi');return ok?c:null}
addEventListener('keydown',e=>{if(e.code==='F7'&&!e.repeat&&$('ov').style.display==='none'){e.preventDefault();enfSpawn()}});
function enfHud(){
 if(!ENF.el){const d=document.createElement('div');d.style.cssText='position:fixed;right:10px;top:42%;font:11px monospace;color:#dfe8d0;background:rgba(10,16,10,.7);border:1px solid #3d5230;padding:6px 8px;pointer-events:none;z-index:6;display:none;line-height:1.5';document.body.appendChild(d);ENF.el=d}
 const b=ENF.last;if(!ENM.fz||!b||b.dead>0&&!b.zh){ENF.el.style.display='none';return}
 const z=b.zh,m=b.zm,r=k=>Math.max(0,Math.round(z[k]))+'/'+Math.round(m[k]);
 ENF.el.style.display='block';ENF.el.innerHTML='<b>BOT GELÉ</b> '+(b.dead>0?'(mort)':'')+'<br>dernier impact : '+(HZN[ENF.zone]||ENF.zone)+' −'+Math.round(ENF.dm)+'<br>tête '+r('h')+' · thorax '+r('t')+' · ventre '+r('a')+'<br>bras G '+r('la')+' · D '+r('ra')+'<br>jambe G '+r('ll')+' · D '+r('rl')+(b.fxl&12?' (fracture)':'')+'<br>vitesse de marche : '+Math.round((b.hm||1)*100)+' %<br>sang '+Math.round(b.blood)+' % · visée ×'+(b.aimM||1).toFixed(1)}

// ---------- tick global ----------
function reaTick(dt){
 if(!REA.ok){if(P.gy===undefined)return;REA.ok=1;try{fouBuild()}catch(e){console.error('rea',e)}}
 vntTick(dt);wxaTick(dt);mooTick(dt);fouTick(dt);lumTick(dt);if(typeof blsTick==='function')blsTick(dt);if(typeof wpxTick==='function')wpxTick(dt);enfHud()}
