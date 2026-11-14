// ================= v34 : vision nocturne et thermique, sol mouillé, empreintes =================
// ² / § (touche Backquote) : vision nocturne -> thermique -> arrêt. Les soldats vivants chauffent (blanc), les cadavres refroidissent.
// La pluie mouille peu à peu le sol (plus sombre, plus brillant, empreintes plus marquées, pas qui clapotent), il sèche ensuite.
const NVG={m:0,el:null,nz:null,nc:null,t:0,nt:0},WET={v:0,mat:null,c0:null,r0:1},FP={n:0,max:140,im:null,age:[],t:0,side:1};
function nvInit(){if(NVG.el)return;const d=document.createElement('div');d.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:3;display:none;transition:none';
d.innerHTML='<div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 50%,transparent 0,transparent 36vmin,rgba(0,0,0,.55) 46vmin,#000 56vmin)"></div><canvas width="256" height="256" style="position:absolute;inset:0;width:100%;height:100%;mix-blend-mode:screen;opacity:.05;image-rendering:pixelated"></canvas><span style="position:absolute;left:50%;top:7%;transform:translateX(-50%);font:12px monospace;letter-spacing:.2em;color:#9dffb0;text-shadow:0 0 6px #2f6"></span>';
document.body.appendChild(d);NVG.el=d;NVG.nc=d.querySelector('canvas');NVG.nz=NVG.nc.getContext('2d')}
function nvSet(m){nvInit();NVG.m=m;const d=NVG.el;d.style.display=m?'block':'none';
d.style.backdropFilter=d.style.webkitBackdropFilter=m===1?'grayscale(1) sepia(1) hue-rotate(70deg) saturate(4) brightness(2.1) contrast(1.15)':m===2?'grayscale(1) contrast(1.55) brightness(.9)':'';
d.querySelector('span').textContent=m===1?'VISION NOCTURNE':m===2?'THERMIQUE':'';d.querySelector('span').style.color=m===2?'#eee':'#9dffb0';if(!m)nvHeat(0);snd(m?640:420,.05,.1,'square')}
function nvHeat(on){for(const b of bots){const s=b.sld;if(!s||!s.mats)continue;const h=on?(b.dead>0?Math.max(0,Math.min(1,b.dead/BOT_CORPSE)):1):0;for(const m of s.mats)if(m.emissive)m.emissive.setScalar(h*.95)}}
function nvTick(dt){if(!NVG.m)return;NVG.t-=dt;NVG.nt-=dt;if(NVG.nt<=0){NVG.nt=.12;const g=NVG.nz,im=g.createImageData(256,256);for(let i=0;i<im.data.length;i+=4){const v=(Math.random()*255)|0;im.data[i]=im.data[i+1]=im.data[i+2]=v;im.data[i+3]=255}g.putImageData(im,0,0)}
if(NVG.t<=0){NVG.t=.25;nvHeat(NVG.m===2)}}
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
function fpAdd(x,z,yaw){fpInit();const i=FP.n++%FP.max,s=(FP.side=-FP.side)*.1;_npq.setFromAxisAngle(_npy,yaw);_npv.set(x+Math.cos(yaw)*s,GH(x,z)+.02,z-Math.sin(yaw)*s);_npm.compose(_npv,_npq,_nps);FP.im.setMatrixAt(i,_npm);FP.age[i]=0;FP.im.instanceMatrix.needsUpdate=true}
function fpTick(dt){if(!FP.im)return;FP.t+=dt;if(FP.t<1)return;const d=FP.t;FP.t=0;const life=70+WET.v*170;let ch=0;for(let i=0;i<FP.max;i++){if(FP.age[i]<1e8){FP.age[i]+=d;if(FP.age[i]>life){FP.age[i]=1e9;FP.im.setMatrixAt(i,new THREE.Matrix4().makeScale(0,0,0));ch=1}}}if(ch)FP.im.instanceMatrix.needsUpdate=true}
function sfxFoot(x,y,z,kind,vol,bot) {sfxFoot0(x,y,z,kind,vol,bot);try{if(kind!=='step')return;const k=surfKind(x,y,z,bot?null:P.sup);if(k!=='grass'&&k!=='mud')return;
if(bot){if(Math.hypot(x-P.x,z-P.z)>45)return;fpAdd(x,z,bot.g?bot.g.rotation.y:Math.random()*6.28)}else{fpAdd(x,z,P.yaw);if(WET.v>.4&&typeof AU!=='undefined'&&AU.ready)nz(.06,'bandpass',1700+rnd(-200,200),.9,.05*WET.v,AOUT(),.8,.1)}}catch(e){}}
function nightTick(dt){nvTick(dt);wetTick(dt);fpTick(dt)}
addEventListener('keydown',e=>{if(e.code==='Backquote'&&!e.repeat&&$('ov').style.display==='none'&&!ac.on&&!bench){e.preventDefault();nvSet((NVG.m+1)%3)}});
