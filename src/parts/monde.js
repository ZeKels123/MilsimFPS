// ================= MONDE VIVANT (v38) : feu d'herbe qui se propage, rafales de vent (la faune — oiseaux, lapins, chevreuils — est dans nature2.js) =================
const MON={fire:[],fmap:new Map(),t:0,n:{ign:0,spread:0},ft:0,ht:0};
const FC=2.5;
function fireKey(x,z){return Math.round(x/FC)+','+Math.round(z/FC)}
function fireCan(x,z){return WET.v<=.55&&grassOk(x,z)}
function grassOk(x,z){if(wDep(x,z)>.05||wDist(x,z)<1.6&&wDist(x,z)>-.3)return false;if(typeof inRoom==='function'&&inRoom(x,z)>=0)return false;return surfKind(x,GH(x,z),z,null)==='grass'}
function fireIgnite(x,z,r){let n=0;r=r||FC;const lo=r<FC?0:-r,hi=r<FC?0:r;for(let a=lo;a<=hi;a+=FC)for(let c=lo;c<=hi;c+=FC){if(a*a+c*c>r*r)continue;const px=x+a,pz=z+c,k=fireKey(px,pz);if(MON.fmap.has(k)||MON.fire.length>=90||!fireCan(px,pz))continue;const f={x:Math.round(px/FC)*FC,z:Math.round(pz/FC)*FC,t:rnd(14,22),e:0,d:0};MON.fire.push(f);MON.fmap.set(k,f);n++}MON.n.ign+=n;return n}
const _mf=new THREE.Vector3(),_mv=new THREE.Vector3();
const dstBlast0=dstBlast;dstBlast=function(x,y,z,R,n){dstBlast0(x,y,z,R,n);try{if(y<GH(x,z)+3)fireIgnite(x,z,Math.min(6,R*.45))}catch(e){}};
function fireTick(dt){const wd=WND.d.value,wl=Math.hypot(wd.x,wd.y)||1,wx=wd.x/wl,wz=wd.y/wl,ws=.4+WND.s.value;MON.ft+=dt;
 for(let i=MON.fire.length-1;i>=0;i--){const f=MON.fire[i];f.t-=dt;if(f.t<=0){MON.fire.splice(i,1);MON.fmap.delete(fireKey(f.x,f.z));continue}
  const gy=GH(f.x,f.z);f.e-=dt;if(f.e<=0&&Math.hypot(f.x-P.x,f.z-P.z)<70){f.e=.22;_mf.set(f.x+rnd(-1,1),gy+.3,f.z+rnd(-1,1));_mv.set(wx*ws*.6,rnd(.8,1.6),wz*ws*.6);emit(_mf,_mv,{life:.9,size:1.3,grow:.6,color:0xff7a22,a:.8,add:1,lo:1});
   if(Math.random()<.5){_mv.set(wx*ws,rnd(1.2,2.2),wz*ws);emit(_mf,_mv,{life:2.6,size:2,grow:1.2,color:0x55524e,a:.4,lo:1})}}
  // propagation : plus probable sous le vent, sol sec
  f.d-=dt;if(f.d<=0){f.d=1;for(const [a,c] of [[1,0],[-1,0],[0,1],[0,-1]]){const al=a*wx+c*wz,p=(.1+Math.max(0,al)*.22*ws)*(1-WET.v);if(Math.random()<p){if(fireIgnite(f.x+a*FC,f.z+c*FC,.1))MON.n.spread++}}}
  // dégâts : joueur et bots
  if(Math.abs(f.x-P.x)<FC&&Math.abs(f.z-P.z)<FC&&P.gy<gy+1.6&&!HM.dead&&!ac.on){f.h=(f.h||0)-dt;if(f.h<=0){f.h=.5;try{hlHurt(3,'x')}catch(e){}}}
  for(const b of bots){if(b.dead||b.dorm)continue;const g=b.g.position;if(Math.abs(f.x-g.x)<FC&&Math.abs(f.z-g.z)<FC){if(b.fleeT<=0&&!b.lvl&&!b.route){const a=Math.atan2(g.x-f.x,g.z-f.z)+rnd(-.5,.5);AI.budget=Math.max(AI.budget,1);if(goTo(b,g.x+Math.sin(a)*10,g.z+Math.cos(a)*10,2.4,'fle'))b.fleeT=3}b.burn=(b.burn||0)+dt;if(b.burn>1.5){b.burn=0;b.hp-=b.T.hp*.12;if(b.hp<=0)botDie(b)}}}}}
// rafales : la force et la direction du vent (donc aussi la balistique) varient lentement
function windTick(dt){MON.ht+=dt;const g=Math.max(0,Math.sin(MON.ht*.37)*Math.sin(MON.ht*.91+1))*(.25+wcur[6]*.6);WND.s.value+=g*dt*1.5;const d=WND.d.value,a=Math.atan2(d.y,d.x)+Math.sin(MON.ht*.05)*dt*.12,l=Math.hypot(d.x,d.y)||1;d.set(Math.cos(a)*l,Math.sin(a)*l)}
function monTick(dt){windTick(dt);fireTick(dt)}
