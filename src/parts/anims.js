// ================= ANIMATIONS DES BOTS ET PERFORMANCE (v40) =================
// Bras levés (reddition, signes) : rotation de la chaîne du bras autour de l'épaule, appliquée après le placement de l'arme.
const ANM={n:{sign:0,cull:0,shadow:0},ch:null};
function anmChains(){if(ANM.ch)return ANM.ch;const B=SLD.bones,ch={};for(const side of['Left','Right']){const r=SLS.ix[side+'Arm'],l=[r];for(let i=0;i<B.length;i++){let p=B[i].par;while(p>=0){if(p===r){l.push(i);break}p=B[p].par}}ch[side]=l}return ANM.ch=ch}
const _aq=new THREE.Quaternion(),_ak=new THREE.Quaternion(),_ad=new THREE.Vector3(),_at=new THREE.Vector3(),_ap=new THREE.Vector3(),_aI=new THREE.Quaternion();
function sldArms(b,sd){const ch=anmChains(),k=b.armK;for(const side of['Left','Right']){if(b.armM==='sign'&&side==='Right')continue;
  const sx=side==='Left'?1:-1,bn=sd.bones,r=bn[SLS.ix[side+'Arm']],f=bn[SLS.ix[side+'ForeArm']];_ap.copy(r.position);_ad.copy(f.position).sub(_ap).normalize();
  if(b.armM==='up')_at.set(sx*.3,1,.12);else _at.set(sx*.45,.85,.3);_at.normalize();_aq.setFromUnitVectors(_ad,_at);_ak.copy(_aI).slerp(_aq,k);
  for(const i of ch[side]){const o=bn[i];o.position.sub(_ap).applyQuaternion(_ak).add(_ap);o.quaternion.premultiply(_ak)}}}
function anmSign(b){b.armM='sign';b.armT=1.8;ANM.n.sign++}
function anmTick(dt){wmTick();let sh=0;const cam=C.position;
 for(const b of bots){const sd=b.sld;if(!sd)continue;
  // cibles d'animation des bras
  let tg=0;if(b.dead){tg=0}else if(b.sur){b.armM='up';tg=1}else if(b.armT>0){b.armT-=dt;tg=Math.sin(Math.min(1,b.armT/1.8)*Math.PI)>.05?1:0}
  b.armK=(b.armK||0)+(tg-(b.armK||0))*Math.min(1,dt*(tg?5:3));if(b.armK<.01)b.armK=0;
  // blessé évacué : démarche baissée
  const e=b.evac;if(e&&e.ph===1&&e.w&&!e.w.dead)e.w.crA=Math.max(e.w.crA,.9);
  if(!b.dead&&!b.dorm){const g=b.g.position,d=Math.hypot(g.x-cam.x,g.z-cam.z);const sc=d<70;if(sd.sm.castShadow!==sc){sd.sm.castShadow=sc;sh++}}}
 ANM.n.shadow+=sh}

// soldiers derrière la caméra (à plus de 14 m) : ni animation ni rendu
const sldUpdate1=sldUpdate;
sldUpdate=function(b,dt,mv){const sd=b.sld;if(sd&&!b.dead){const g=b.g.position,cam=C.position,dx=g.x-cam.x,dz=g.z-cam.z,d=Math.hypot(dx,dz);_at.set(0,0,-1).applyQuaternion(C.quaternion);
  if(d>14&&(dx*_at.x+dz*_at.z)/d<-.45){if(!sd.cul){sd.cul=1;ANM.n.cull++}sd.sg.visible=false;return}}
 if(sd)sd.cul=0;sldUpdate1(b,dt,mv)};

// ---- réapparition : plus aucune pose résiduelle de la vie précédente (corps couché, bras levés, traînage, clip de mort, inclinaison)
function anmReset(b){b.armK=0;b.armM=null;b.armT=0;b.g.rotation.x=0;b.g.rotation.z=0;b.dmr=0;b.dty=0;b.drt=1;b.drg=null;b.drgP=0;b.blsLean=0;b.prn=0;b.prA=0;b.stk=0;b.fall=0;b.dk=0;b.dair=0;
 const sd=b.sld;if(sd){sd.cur='fire';sd.pv=null;sd.t=0;sd.pt=0;sd.bl=1;sd.acc=0;sd.md=0;sd.ms=1;sd.vf=sd.vl=0;sd.lx=undefined;sd.blY=0;sd.cul=0;sd.crw=0;sd.hz=0;sd.cwY=sd.cwZ=0;sd.cyA=0;sd.cy0=undefined;sd.sg.quaternion.identity();sd.sg.position.set(0,0,0);sd.sg.rotation.set(0,0,0)}}
{const aR0=aiReset;aiReset=function(b,ty){aR0.apply(this,arguments);try{anmReset(b)}catch(e){console.error('anmReset',e)}}}
