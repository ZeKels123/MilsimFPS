// ================= v34 : vision nocturne et thermique, sol mouillé, empreintes =================
// voir plus bas : jumelles de vision nocturne (nvSet, nvTick, nvFx). Thermique : les soldats vivants chauffent (blanc), les cadavres refroidissent.
// La pluie mouille peu à peu le sol (plus sombre, plus brillant, empreintes plus marquées, pas qui clapotent), il sèche ensuite.
// Jumelles de vision nocturne (v59) : objet d'inventaire « nv » (+ piles « pn »), relevées / abaissées avec ` (animation, vision coupée pendant ce temps),
// [ : nocturne <-> thermique, ' : illuminateur infrarouge. Rendu = UN passage shader dans post.js (NVFX_), actif seulement jumelles abaissées.
// État lisible par les autres modules : NVG.m (vision active 0/1/2), NVG.st ('off'|'down'|'on'|'up'), NVG.a (0..1), NVG.blockAds (en transition), NVG.irOn.
const NVG={m:0,want:1,on:false,a:0,st:'off',bat:1,ir:false,irOn:false,hs:false,burn:0,sat:0,over:0,gain:4,amb:0,swapT:0,t:0,heat:false,blockAds:false,w1:0,w2:0,w3:0,el:null,tx:null,bar:null},WET={v:0,mat:null,c0:null,r0:1},FP={n:0,max:140,im:null,age:[],t:0,side:1};
const nvHas=()=>(HM.inv&&HM.inv.nv>0)|0;
function nvInit(){if(NVG.el)return;const d=document.createElement('div');d.style.cssText='position:fixed;left:50%;top:7%;transform:translateX(-50%);pointer-events:none;z-index:3;display:none;text-align:center;font:12px monospace;letter-spacing:.2em;color:#9dffb0;text-shadow:0 0 6px #2f6';
d.innerHTML='<span></span><div style="margin:4px auto 0;width:90px;height:3px;background:rgba(0,0,0,.45)"><i style="display:block;height:100%;width:100%;background:#9dffb0"></i></div>';
document.body.appendChild(d);NVG.el=d;NVG.tx=d.querySelector('span');NVG.bar=d.querySelector('i')}
function nvMsg(t){if(typeof hlMsg==='function')hlMsg(t)}
function nvSet(m,instant){nvInit();if(m){if(!nvHas()){nvMsg('Pas de jumelles de vision nocturne');return false}if(NVG.hs){nvMsg('Jumelles hors service : tubes grillés');return false}
 if(NVG.bat<=0&&!(HM.inv.pn>0)){nvMsg('Batterie vide : aucune pile');return false}NVG.want=m===2?2:1;NVG.on=true;if(NVG.bat<=0)nvSwap();if(instant)NVG.a=1}
 else{NVG.on=false;if(instant)NVG.a=0}
 nvDerive();if(!m){NVG.heat=false;nvHeat(0)}snd(m?640:420,.05,.1,'square');return true}
function nvToggle(){return nvSet(NVG.on?0:NVG.want)}
function nvSwap(manual){if(!(HM.inv.pn>0)){if(manual)nvMsg('Plus de piles');return false}if(manual&&NVG.bat>.9){nvMsg('Piles encore pleines');return false}
 HM.inv.pn--;NVG.bat=1;NVG.swapT=1.4;NVG.w1=0;nvMsg('Piles remplacées');snd(300,.08,.1,'square');if(INV.open)invRender();return true}
function nvReset(){NVG.on=false;NVG.a=0;NVG.bat=1;NVG.hs=false;NVG.burn=0;NVG.sat=0;NVG.over=0;NVG.swapT=0;NVG.w1=NVG.w2=NVG.w3=0;nvDerive();if(NVG.heat){NVG.heat=false;nvHeat(0)}}
function nvDerive(){const act=NVG.on&&NVG.a>=.999&&NVG.swapT<=0&&NVG.bat>0&&!NVG.hs;NVG.m=act?NVG.want:0;NVG.irOn=!!(NVG.ir&&NVG.m===1);
 NVG.st=NVG.on?(NVG.a>=.999?'on':'down'):(NVG.a>.001?'up':'off');NVG.blockAds=NVG.a>.001&&NVG.a<.999;
 if(NVG.el){NVG.el.style.display=NVG.m?'block':'none';if(NVG.m){NVG.tx.textContent=(NVG.m===2?'THERMIQUE':'VISION NOCTURNE')+(NVG.irOn?' · IR':'')+' '+Math.round(NVG.bat*100)+' %';const lo=NVG.bat<.2;NVG.tx.style.color=lo?'#ffb060':NVG.m===2?'#eee':'#9dffb0';NVG.bar.style.width=Math.round(NVG.bat*100)+'%';NVG.bar.style.background=lo?'#ff9040':NVG.m===2?'#eee':'#9dffb0'}}}
// lumière ambiante 0..1 (soleil + ciel, réduite en intérieur) : sert au gain automatique et à la surexposition de jour
function nvAmb(){const rm=typeof inRoom==='function'&&inRoom(P.x,P.z)>=0;return Math.max(0,Math.min(1,(sun.intensity+hemi.intensity*.5)/2))*(rm?.35:1)}
// uniforms du shader ; renvoie true tant que le passage doit tourner (jumelles abaissées ou en mouvement)
function nvFx(){if(NVG.a<=.002||ac.on||bench)return false;const u=PP.nv&&PP.nv.uniforms;if(!u)return !!PP.nv;
 const amb=NVG.amb,night=Math.max(0,1-amb*3);const th=NVG.want===2;u.uMode.value=th?2:1;u.uA.value=NVG.a*NVG.a*(3-2*NVG.a);u.uSc.value=VSX.sc;
 u.uGain.value=(th?1.2:NVG.gain)*(NVG.m?1:NVG.a*NVG.a*(NVG.on&&NVG.a>=.999?0:.3));u.uT.value=(performance.now()%1e5)/1e3;u.uFlash.value=NVG.sat;u.uOver.value=NVG.m===1?NVG.over:0;u.uIR.value=NVG.irOn?1:0;
 u.uNoise.value=(.16+.34*night*(1-(typeof MOO!=='undefined'?MOO.ill:.5))+NVG.burn*.04)*(th?.6:1);u.uLow.value=NVG.bat<.12&&NVG.m?(Math.random()<.18?.5:0):0;
 return true}
function nvHeat(on){for(const b of bots){const s=b.sld;if(!s||!s.mats)continue;const h=on?(b.dead>0?Math.max(0,Math.min(1,b.dead/BOT_CORPSE)):1):0;for(const m of s.mats)if(m.emissive)m.emissive.setScalar(h*.95)}}
function nvTick(dt){nvInit();
 if(HM.dead>0||P.hp<=0){if(NVG.on||NVG.a>0)nvSet(0,true)}
 else if(!nvHas()&&(NVG.on||NVG.a>0))nvSet(0,true);// jumelles jetées / perdues : vision coupée
 const sp=NVG.on?(1/.55):(1/.4);NVG.a=NVG.on?Math.min(1,NVG.a+dt*sp):Math.max(0,NVG.a-dt*sp);if(NVG.swapT>0)NVG.swapT-=dt;
 NVG.amb=nvAmb();const amb=NVG.amb,mo=typeof MOO!=='undefined'?MOO.ill:.5;
 NVG.gain=1.1+(5.2+1.8*(1-mo))*(1-Math.max(0,Math.min(1,(amb-.1)/.5)));NVG.over=Math.max(0,Math.min(1,(amb-.45)/.2));
 nvDerive();
 if(NVG.m){const k=NVG.m===2?1/420:1/600;NVG.bat=Math.max(0,NVG.bat-dt*(k+(NVG.irOn?1/1500:0)));
  if(NVG.bat<.2&&!NVG.w1){NVG.w1=1;nvMsg('Jumelles : batterie faible ('+Math.round(NVG.bat*100)+' %)')}
  if(NVG.bat<=0){if(!nvSwap()){nvMsg('Batterie vide : jumelles relevées');nvSet(0)}}
  // éblouissement : flash de grenade, tir au flash non masqué, lampe blanche (l'IR est invisible des bots mais la lampe les alerte et sature les tubes)
  let s=0;if(typeof FXP!=='undefined'&&FXP.flash>0)s=Math.max(s,Math.min(1.5,FXP.flash*.45));if(flashT>0&&!A.supp)s=Math.max(s,.5);
  if(typeof flOn!=='undefined'&&flOn&&NVG.m===1){s=Math.max(s,.65);if(!NVG.w3){NVG.w3=1;nvMsg('Lampe blanche : tubes éblouis, coupe-la (IR : touche &#39;)')}}else NVG.w3=0;
  NVG.sat=Math.max(NVG.sat,s);
  // plein jour : surexposition, puis tubes grillés
  if(NVG.m===1&&NVG.over>.35){NVG.burn+=dt*NVG.over;if(NVG.burn>1.2&&!NVG.w2){NVG.w2=1;nvMsg('Surexposition : relève les jumelles !')}
   if(NVG.burn>6){NVG.hs=true;nvMsg('TUBES GRILLÉS : jumelles hors service');nvSet(0)}}
  else if(NVG.burn>0){NVG.burn=Math.max(0,NVG.burn-dt*.3);if(NVG.burn<.5)NVG.w2=0}}
 NVG.sat=Math.max(0,NVG.sat-dt*(NVG.sat>.9?1.1:1.8));
 if(NVG.m&&!NVG.el.style.display)NVG.el.style.display='block';
 nvDerive();
 const th=NVG.m===2;if(th!==NVG.heat){NVG.heat=th;nvHeat(th)}else if(th){NVG.t-=dt;if(NVG.t<=0){NVG.t=.25;nvHeat(1)}}}
// sol mouillé
function wetTick(dt,rain){if(rain===undefined)rain=(typeof rainU!=='undefined'?rainU.uAmt.value:0);WET.v=Math.max(0,Math.min(1,WET.v+(rain>.15?rain*dt/70:-dt/240)));
if(!WET.mat){const g=S.children.find(m=>m.isMesh&&m.geometry&&m.geometry.index&&m.geometry.index.count>1e6&&m.material&&m.material.color);if(g&&g.material.roughness!==undefined){WET.mat=g.material;WET.c0=g.material.color.clone();WET.r0=g.material.roughness}else WET.mat=0}
if(WET.mat){const w=WET.v;WET.mat.color.copy(WET.c0).multiplyScalar(1-.3*w);WET.mat.roughness=Math.max(.4,WET.r0-.45*w)}
if(FP.im)FP.im.material.opacity=.16+.5*WET.v}
// empreintes
function fpInit(){if(FP.im)return;const c=document.createElement('canvas');c.width=64;c.height=128;const g=c.getContext('2d');g.fillStyle='rgba(255,255,255,.95)';g.beginPath();g.ellipse(32,38,17,32,0,0,7);g.fill();g.beginPath();g.ellipse(32,100,13,19,0,0,7);g.fill();g.globalCompositeOperation='destination-out';g.fillStyle='rgba(0,0,0,.6)';for(let i=0;i<5;i++){g.fillRect(14,18+i*11,36,3)}
const t=new THREE.CanvasTexture(c),geo=new THREE.PlaneGeometry(.13,.3);geo.rotateX(-Math.PI/2);const m=new THREE.MeshBasicMaterial({map:t,color:0x2a2018,transparent:true,opacity:.2,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4});
FP.im=new THREE.InstancedMesh(geo,m,FP.max);FP.im.frustumCulled=false;const z=new THREE.Matrix4().makeScale(0,0,0);for(let i=0;i<FP.max;i++){FP.im.setMatrixAt(i,z);FP.age[i]=1e9}S.add(FP.im)}
const _npm=new THREE.Matrix4(),_npq=new THREE.Quaternion(),_npv=new THREE.Vector3(),_nps=new THREE.Vector3(1,1,1),_npy=new THREE.Vector3(0,1,0);
const _fpn=new THREE.Vector3(),_fpq=new THREE.Quaternion();
function fpAdd(x,z,yaw){fpInit();const i=FP.n++%FP.max,s=(FP.side=-FP.side)*.1;_npq.setFromAxisAngle(_npy,yaw);{const e=.4,nx=GH(x-e,z)-GH(x+e,z),nz=GH(x,z-e)-GH(x,z+e);_fpn.set(nx,2*e,nz).normalize();_fpq.setFromUnitVectors(_npy,_fpn);_npq.premultiply(_fpq)}_npv.set(x+Math.cos(yaw)*s,GH(x,z)+.02,z-Math.sin(yaw)*s);_npm.compose(_npv,_npq,_nps);FP.im.setMatrixAt(i,_npm);FP.age[i]=0;FP.im.instanceMatrix.needsUpdate=true}
function fpTick(dt){if(!FP.im)return;FP.t+=dt;if(FP.t<1)return;const d=FP.t;FP.t=0;const life=70+WET.v*170;let ch=0;for(let i=0;i<FP.max;i++){if(FP.age[i]<1e8){FP.age[i]+=d;if(FP.age[i]>life){FP.age[i]=1e9;FP.im.setMatrixAt(i,new THREE.Matrix4().makeScale(0,0,0));ch=1}}}if(ch)FP.im.instanceMatrix.needsUpdate=true}
function sfxFoot(x,y,z,kind,vol,bot) {sfxFoot0(x,y,z,kind,vol,bot);try{if(kind!=='step')return;const k=surfKind(x,y,z,bot?null:P.sup);if(k!=='grass'&&k!=='mud')return;
if(bot){if(Math.hypot(x-P.x,z-P.z)>45)return;fpAdd(x,z,bot.g?bot.g.rotation.y:Math.random()*6.28)}else{fpAdd(x,z,P.yaw);if(WET.v>.4&&typeof AU!=='undefined'&&AU.ready)nz(.06,'bandpass',1700+rnd(-200,200),.9,.05*WET.v,AOUT(),.8,.1)}}catch(e){}}
function nightTick(dt){nvTick(dt);wetTick(dt);fpTick(dt)}
addEventListener('keydown',e=>{if(e.repeat||$('ov').style.display!=='none'||ac.on||bench)return;
 if(e.code==='Backquote'||e.code==='BracketLeft'||e.code==='Quote'){e.preventDefault();
  if(typeof adsT!=='undefined'&&adsT>.3){nvMsg('Baisse l’arme pour manipuler les jumelles');return}
  if(e.code==='Backquote')nvToggle();
  else if(e.code==='BracketLeft'){NVG.want=NVG.want===1?2:1;if(NVG.on&&NVG.a>=.999){nvDerive()}nvMsg(NVG.want===2?'Jumelles : mode thermique':'Jumelles : vision nocturne')}
  else{NVG.ir=!NVG.ir;nvDerive();nvMsg(NVG.ir?'Illuminateur infrarouge activé (visible uniquement avec les jumelles)':'Illuminateur infrarouge coupé')}}});
