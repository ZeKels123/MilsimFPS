// ================= MONDE VIVANT (v38) : feu d'herbe qui se propage, rafales de vent, oiseaux =================
const MON={fire:[],fmap:new Map(),birds:[],t:0,bi:null,wi:null,n:{ign:0,spread:0,flush:0},ft:0,ht:0};
const FC=2.5;
function fireKey(x,z){return Math.round(x/FC)+','+Math.round(z/FC)}
function fireCan(x,z){return WET.v<=.55&&grassOk(x,z)}
function grassOk(x,z){if(wDep(x,z)>.05||wDist(x,z)<1.6&&wDist(x,z)>-.3)return false;if(typeof inRoom==='function'&&inRoom(x,z)>=0)return false;return surfKind(x,GH(x,z),z,null)==='grass'}
function fireIgnite(x,z,r){let n=0;r=r||FC;const lo=r<FC?0:-r,hi=r<FC?0:r;for(let a=lo;a<=hi;a+=FC)for(let c=lo;c<=hi;c+=FC){if(a*a+c*c>r*r)continue;const px=x+a,pz=z+c,k=fireKey(px,pz);if(MON.fmap.has(k)||MON.fire.length>=90||!fireCan(px,pz))continue;const f={x:Math.round(px/FC)*FC,z:Math.round(pz/FC)*FC,t:rnd(14,22),e:0,d:0};MON.fire.push(f);MON.fmap.set(k,f);n++}MON.n.ign+=n;return n}
const _mf=new THREE.Vector3(),_mv=new THREE.Vector3();
const dstBlast0=dstBlast;dstBlast=function(x,y,z,R){dstBlast0(x,y,z,R);try{if(y<GH(x,z)+3)fireIgnite(x,z,Math.min(6,R*.45))}catch(e){}};
function fireTick(dt){const wd=WND.d.value,wl=Math.hypot(wd.x,wd.y)||1,wx=wd.x/wl,wz=wd.y/wl,ws=.4+WND.s.value;MON.ft+=dt;
 for(let i=MON.fire.length-1;i>=0;i--){const f=MON.fire[i];f.t-=dt;if(f.t<=0){MON.fire.splice(i,1);MON.fmap.delete(fireKey(f.x,f.z));continue}
  const gy=GH(f.x,f.z);f.e-=dt;if(f.e<=0&&Math.hypot(f.x-P.x,f.z-P.z)<70){f.e=.22;_mf.set(f.x+rnd(-1,1),gy+.3,f.z+rnd(-1,1));_mv.set(wx*ws*.6,rnd(.8,1.6),wz*ws*.6);emit(_mf,_mv,{life:.9,size:1.3,grow:.6,color:0xff7a22,a:.8,add:1});
   if(Math.random()<.5){_mv.set(wx*ws,rnd(1.2,2.2),wz*ws);emit(_mf,_mv,{life:2.6,size:2,grow:1.2,color:0x55524e,a:.4})}}
  // propagation : plus probable sous le vent, sol sec
  f.d-=dt;if(f.d<=0){f.d=1;for(const [a,c] of [[1,0],[-1,0],[0,1],[0,-1]]){const al=a*wx+c*wz,p=(.1+Math.max(0,al)*.22*ws)*(1-WET.v);if(Math.random()<p){if(fireIgnite(f.x+a*FC,f.z+c*FC,.1))MON.n.spread++}}}
  // dégâts : joueur et bots
  if(Math.abs(f.x-P.x)<FC&&Math.abs(f.z-P.z)<FC&&P.gy<gy+1.6&&!HM.dead&&!ac.on){f.h=(f.h||0)-dt;if(f.h<=0){f.h=.5;try{hlHurt(3,'x')}catch(e){}}}
  for(const b of bots){if(b.dead||b.dorm)continue;const g=b.g.position;if(Math.abs(f.x-g.x)<FC&&Math.abs(f.z-g.z)<FC){if(b.fleeT<=0&&!b.lvl&&!b.route){const a=Math.atan2(g.x-f.x,g.z-f.z)+rnd(-.5,.5);AI.budget=Math.max(AI.budget,1);if(goTo(b,g.x+Math.sin(a)*10,g.z+Math.cos(a)*10,2.4,'fle'))b.fleeT=3}b.burn=(b.burn||0)+dt;if(b.burn>1.5){b.burn=0;b.hp-=b.T.hp*.12;if(b.hp<=0)botDie(b)}}}}}
// rafales : la force et la direction du vent (donc aussi la balistique) varient lentement
function windTick(dt){MON.ht+=dt;const g=Math.max(0,Math.sin(MON.ht*.37)*Math.sin(MON.ht*.91+1))*(.25+wcur[6]*.6);WND.s.value+=g*dt*1.5;const d=WND.d.value,a=Math.atan2(d.y,d.x)+Math.sin(MON.ht*.05)*dt*.12,l=Math.hypot(d.x,d.y)||1;d.set(Math.cos(a)*l,Math.sin(a)*l)}
// oiseaux : volées au sol qui s'envolent au bruit ou à l'approche, et alertent les bots proches
const NB=6,PB=5;
function birdInit(){const bg=new THREE.SphereGeometry(.09,5,4);bg.scale(1,.8,1.7);const wg=new THREE.PlaneGeometry(.34,.14);wg.rotateX(-Math.PI/2);wg.translate(.17,0,0);
 MON.bi=new THREE.InstancedMesh(bg,new THREE.MeshBasicMaterial({color:0x1a1a1c}),NB*PB);MON.wi=new THREE.InstancedMesh(wg,new THREE.MeshBasicMaterial({color:0x222226,side:THREE.DoubleSide}),NB*PB*2);
 for(const m of [MON.bi,MON.wi]){m.frustumCulled=false;m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);S.add(m)}
 for(let f=0;f<NB;f++){const fl={x:0,z:0,st:0,t:0,b:[],dir:0};for(let i=0;i<PB;i++)fl.b.push({ox:rnd(-2,2),oz:rnd(-2,2),y:0,ph:rnd(0,6),h:rnd(1,3)});birdPlace(fl);MON.birds.push(fl)}}
function birdPlace(fl){for(let n=0;n<30;n++){const a=Math.random()*6.28,r=rnd(35,110),x=P.x+Math.cos(a)*r,z=P.z+Math.sin(a)*r;if(nFree(x,z)&&grassOk(x,z)&&Math.abs(x)<(typeof AR!=='undefined'?AR-10:300)){fl.x=x;fl.z=z;fl.st=0;fl.t=0;fl.b.forEach(b=>{b.y=0});return}}fl.x=1e5;fl.z=1e5;fl.st=0}
const _mbm=new THREE.Matrix4(),_mbq=new THREE.Quaternion(),_mbp=new THREE.Vector3(),_mbs=new THREE.Vector3(1,1,1),_mbe=new THREE.Euler();
function birdTick(dt){if(!MON.bi)birdInit();let wi=0;
 for(let f=0;f<NB;f++){const fl=MON.birds[f],d=Math.hypot(fl.x-P.x,fl.z-P.z);
  if(fl.st===0){if(d>170)birdPlace(fl);
   const loud=NZ.n!==fl.nz&&Math.hypot(NZ.x-fl.x,NZ.z-fl.z)<Math.max(25,NZ.r*1.6);fl.nz=NZ.n;
   if(d<9||(loud&&d<120)){fl.st=1;fl.t=0;fl.dir=Math.atan2(fl.x-P.x,fl.z-P.z)+rnd(-.6,.6);MON.n.flush++;for(const b of bots){if(b.dead||b.see||b.alert)continue;if(Math.hypot(b.g.position.x-fl.x,b.g.position.z-fl.z)<30)aiAlert(b,fl.x,fl.z,3)}}}
  else{fl.t+=dt;fl.x+=Math.sin(fl.dir)*7*dt;fl.z+=Math.cos(fl.dir)*7*dt;if(fl.t>14||d>190){birdPlace(fl)}}
  const gy=GH(fl.x,fl.z);
  for(let i=0;i<PB;i++){const b=fl.b[i];let y,x=fl.x+b.ox,z=fl.z+b.oz,wing=0;
   if(fl.st===0){y=gy+.05;b.ph+=dt*(1+i*.3);wing=-.25;_mbs.set(1,1+Math.max(0,Math.sin(b.ph*3))*.1,1)}
   else{b.y=Math.min(b.y+dt*(2.2+b.h*.6),6+b.h*2.5);y=gy+b.y;b.ph+=dt*22;wing=Math.sin(b.ph)*.9;_mbs.set(1,1,1)}
   const yaw=fl.st?fl.dir:i*1.3;_mbe.set(0,yaw,0);_mbq.setFromEuler(_mbe);_mbp.set(x,y,z);const k=fl.x>9e4?0:1;
   _mbm.compose(_mbp,_mbq,_mbs.clone().multiplyScalar(k));MON.bi.setMatrixAt(f*PB+i,_mbm);
   for(const sd of [1,-1]){_mbe.set(0,yaw+(sd<0?Math.PI:0),wing*(sd<0?-1:1));_mbq.setFromEuler(_mbe);_mbm.compose(_mbp,_mbq,_mbs.clone().multiplyScalar(k));MON.wi.setMatrixAt(wi++,_mbm)}}}
 MON.bi.instanceMatrix.needsUpdate=true;MON.wi.instanceMatrix.needsUpdate=true}
function monTick(dt){windTick(dt);fireTick(dt);birdTick(dt)}
