// ================= JOUR / NUIT + MÉTÉO (v4) =================
const TOD={t:14.2,spd:1/32,wx:0,tgt:0,envT:-9,envW:-1};
const WXN=['Clair','Nuageux','Pluie','Orage','Brouillard'],WXI=['☀','⛅','🌧','⛈','🌫'];
// cover, grey, rain, fogNear, fogFar, sunK, wind
const WXD=[[.12,0,0,1,1,1,.2],[.7,.35,0,.8,.85,.6,.4],[.95,.72,.75,.4,.55,.28,.8],[1,.92,1,.28,.42,.16,1.4],[.6,.55,0,.07,.2,.4,0]];
const wcur=WXD[0].slice();
const TK=[[-.30,0x02050d,0x0a1220,0xff7a3a,0,0x1a2a4a,0x07090e,.46,1.3],[-.08,0x0c1630,0x2a2a44,0xff7a3a,0,0x23365a,0x0b0c12,.42,1.2],[-.01,0x1c2a52,0x7a5a62,0xff7a3a,.05,0x4a5a8a,0x1c1a1a,.36,1.05],
[.07,0x3a5a98,0xf0a878,0xff9a50,.6,0x8a9ac8,0x3a3226,.3,.9],[.22,0x4676b6,0xd6d2c0,0xffd8a0,1.05,0xa8c4f0,0x4e4630,.3,.84],[.65,0x4f84c4,0xc3d0cc,0xfff0d8,1.25,0xbcd2ff,0x5a5238,.3,.82]];
const _c=[0,1,2,3].map(()=>new THREE.Color()),_w=new THREE.Color(1,1,1);
function kfSky(e){let i=0;while(i<TK.length-2&&e>TK[i+1][0])i++;const a=TK[i],b=TK[i+1],k=Math.max(0,Math.min(1,(e-a[0])/(b[0]-a[0])));
const col=(j,o)=>o.setHex(a[j]).lerp(_c[3].setHex(b[j]),k),num=j=>a[j]+(b[j]-a[j])*k;
return{top:col(1,new THREE.Color()),hor:col(2,new THREE.Color()),sunC:col(3,new THREE.Color()),sunI:num(4),hs:col(5,new THREE.Color()),hg:col(6,new THREE.Color()),hI:num(7),exp:num(8)}}
// météo : pluie en segments (shader), éclairs, tonnerre, bruit de pluie
const RN=3200,rg=new THREE.BufferGeometry(),rp=new Float32Array(RN*6),ri=new Float32Array(RN*2),re=new Float32Array(RN*2);
for(let i=0;i<RN;i++){const x=Math.random(),y=Math.random(),z=Math.random();for(let k=0;k<2;k++){rp.set([x,y,z],i*6+k*3);ri[i*2+k]=i/RN;re[i*2+k]=k}}
rg.setAttribute('position',new THREE.BufferAttribute(rp,3));rg.setAttribute('aId',new THREE.BufferAttribute(ri,1));rg.setAttribute('aEnd',new THREE.BufferAttribute(re,1));
const rainU={uCam:{value:new THREE.Vector3()},uT:{value:0},uAmt:{value:0},uWind:{value:0},uIn:{value:0},uLum:{value:1}};
const rainM=new THREE.ShaderMaterial({uniforms:rainU,transparent:true,depthWrite:false,fog:false,
vertexShader:`attribute float aId,aEnd;uniform vec3 uCam;uniform float uT,uAmt,uWind;varying float vA;
void main(){if(aId>uAmt){gl_Position=vec4(2.,2.,2.,1.);vA=0.;return;}
vec3 b=position;float BW=26.,H=16.;
float x=uCam.x+mod(b.x*BW-uCam.x,BW)-BW*.5,z=uCam.z+mod(b.z*BW-uCam.z,BW)-BW*.5,y=uCam.y+mod(b.y*H-uT*(13.+aId*5.)-uCam.y,H)-H*.35;
vec3 p=vec3(x,y,z)+aEnd*vec3(uWind*.06,.55,uWind*.02);
vA=(1.-aEnd*.7)*(.55);gl_Position=projectionMatrix*viewMatrix*vec4(p,1.);}`,
fragmentShader:`uniform float uIn,uLum;varying float vA;void main(){gl_FragColor=vec4(vec3(.72,.8,.92)*uLum,vA*(1.-uIn)*.55);}`});
const rain=new THREE.LineSegments(rg,rainM);rain.frustumCulled=false;rain.renderOrder=5;S.add(rain);
// lampe torche + lumières intérieures
const fl=new THREE.SpotLight(0xfff0d6,0,34,.4,.55,1.2);fl.position.set(.14,-.12,0);C.add(fl,fl.target);fl.target.position.set(0,0,-8);let flOn=false;
const inL=new THREE.PointLight(0xffe2b0,0,8,1.6),inL2=new THREE.PointLight(0xffe2b0,0,8,1.6);S.add(inL,inL2);
// HUD
const wxEl=document.createElement('div');wxEl.style.cssText='position:fixed;bottom:10px;left:50%;transform:translateX(-50%);font:12px monospace;color:#dfe8d0;text-shadow:0 1px 3px #000;pointer-events:none;opacity:.85;letter-spacing:.05em;text-align:center;z-index:5';document.body.appendChild(wxEl);
addEventListener('keydown',e=>{if(e.repeat)return;if(e.code==='KeyN'){TOD.t=(TOD.t+(e.shiftKey?-1:2)+24)%24}if(e.code==='KeyM'){TOD.tgt=(TOD.tgt+1)%5}if(e.code==='KeyL'){flOn=!flOn;snd(900,.04,.1,'square')}});
// bruit de pluie / tonnerre
let rainG=null;function rainAudio(a){try{AC=AC||new AudioContext();if(!rainG){const n=AC.sampleRate*2,b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;const s=AC.createBufferSource(),f=AC.createBiquadFilter();s.buffer=b;s.loop=true;f.type='bandpass';f.frequency.value=3200;f.Q.value=.35;rainG=AC.createGain();rainG.gain.value=0;s.connect(f).connect(rainG).connect(AC.destination);s.start()}rainG.gain.value+=(a-rainG.gain.value)*.05}catch(e){}}
function thunder(){try{AC=AC||new AudioContext();const n=AC.sampleRate*3.2,b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);let l=0;for(let i=0;i<n;i++){l=l*.97+(Math.random()*2-1)*.03;d[i]=l*Math.pow(1-i/n,2.2)*14}
const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=b;f.type='lowpass';f.frequency.value=380;g.gain.value=.9;s.connect(f).connect(g).connect(AC.destination);s.start()}catch(e){}}
let ltT=6,ltF=0,thT=-1;
const sunV=new THREE.Vector3(),moonV=new THREE.Vector3(),_g=new THREE.Color();
function inRoom(x,z){let k=-1;for(let i=0;i<ROOMS.length;i++){const r=ROOMS[i];if(Math.abs(x-r.x)<r.hx&&Math.abs(z-r.z)<r.hz){k=i;break}}return k}
function todUpdate(dt){
TOD.t=(TOD.t+dt*TOD.spd)%24;
for(let i=0;i<7;i++)wcur[i]+=(WXD[TOD.tgt][i]-wcur[i])*Math.min(1,dt*.35);
const cov=wcur[0],gr=wcur[1],rn=wcur[2],fN=wcur[3],fF=wcur[4],sK=wcur[5],wd=wcur[6];
const ang=(TOD.t-6)/12*Math.PI;sunV.set(-Math.cos(ang)*.9,Math.sin(ang)*.82,.5).normalize();const e=sunV.y;SUND.copy(sunV);
moonV.set(-sunV.x*.8,Math.max(.4,-sunV.y*.9+.15),-sunV.z).normalize();skyU.uMoonD.value.copy(moonV);
const k=kfSky(Math.max(-.3,Math.min(.65,e)));
// éclairs
if(TOD.tgt===3){ltT-=dt;if(ltT<=0){ltF=1;ltT=rnd(5,14);thT=rnd(.4,2.6)}}if(ltF>0)ltF=Math.max(0,ltF-dt*3.2);const fz=ltF>0?(Math.sin(ltF*18)>-.2?ltF:ltF*.3):0;if(thT>0){thT-=dt;if(thT<=0)thunder()}
_g.setScalar(.5);const grey=g=>g.lerp(_g.setScalar((g.r*.3+g.g*.55+g.b*.15)*.9),gr*.75);
grey(k.top);grey(k.hor);
skyU.uTop.value.copy(k.top);skyU.uHor.value.copy(k.hor);skyU.uSunC.value.copy(k.sunC);skyU.uCov.value=cov;skyU.uGrey.value=gr;skyU.uStar.value=Math.max(0,Math.min(1,(-e-.02)/.12))*(1-cov*.95);skyU.uFlash.value=fz;
const lf=Math.max(.1,Math.min(1,.12+e*3.2));skyU.uCl.value.copy(k.hor).lerp(_w,.45).multiplyScalar(lf*(1-.35*gr)*1.05);
// lumière directionnelle : soleil le jour, lune la nuit
const dayK=Math.max(0,Math.min(1,e/.1)),moonK=Math.max(0,Math.min(1,(-e-.02)/.12));
if(e>0){LDIR.copy(sunV);sun.color.copy(k.sunC);sun.intensity=k.sunI*sK*dayK}else{LDIR.copy(moonV);sun.color.setHex(0x9db6ff);sun.intensity=.5*moonK*(1-cov*.5)}
hemi.color.copy(k.hs);hemi.groundColor.copy(k.hg);hemi.intensity=k.hI*(1+gr*.35)+fz*1.6;
R.toneMappingExposure=k.exp*(1+gr*.08);
fog0.color.copy(k.hor).multiplyScalar(.92+fz*.6);fog0.near=24*fN*(e<0?.7:1);fog0.far=120*fF*(e<0?.8:1);if(!ac.on){S.fog=fog0}
// pluie
rainU.uCam.value.copy(C.position);rainU.uT.value+=dt;rainU.uAmt.value=rn;rainU.uWind.value=wd;rainU.uLum.value=Math.max(.25,lf);rain.visible=rn>.02&&!ac.on;
const ri=inRoom(C.position.x,C.position.z),ind=ri>=0&&C.position.y<roofTop(C.position.x,C.position.z);rainU.uIn.value+=((ind?1:0)-rainU.uIn.value)*Math.min(1,dt*6);
rainMix(rn,ind,C.position.y);
floor.material.roughness=1-.55*Math.min(1,rn*1.3);floor.material.color.setScalar(1-.28*Math.min(1,rn*1.2));
// lumières intérieures
const night=Math.max(0,Math.min(1,.5-e*4)),I=(.3+.95*night)*(ind?1:0);
if(ri>=0){const r=ROOMS[ri],r2=ROOMS[ri^1];inL.position.set(r.x,2.3,r.z);inL2.position.set(r2.x,2.3,r2.z);inL.intensity+=(I*1.2-inL.intensity)*Math.min(1,dt*8);inL2.intensity+=(I*.8-inL2.intensity)*Math.min(1,dt*8)}else{inL.intensity*=Math.max(0,1-dt*8);inL2.intensity*=Math.max(0,1-dt*8)}
fl.intensity=flOn?3.2:0;
// recalcul de l'environnement (reflets PBR) quand le ciel a assez changé
const sig=TOD.t+cov*3+gr*3;if(Math.abs(sig-TOD.envW)>.28&&fz<.05&&performance.now()-TOD.envT>4000){TOD.envW=sig;TOD.envT=performance.now();const o=S.environment;S.environment=mkEnv(R);if(o&&o.dispose)o.dispose()}
// matériaux de la bascule sol <-> lune : ombres
// HUD
const hh=Math.floor(TOD.t),mm=Math.floor((TOD.t-hh)*60);wxEl.innerHTML=(hh<10?'0':'')+hh+':'+(mm<10?'0':'')+mm+' · '+WXI[TOD.tgt]+' '+WXN[TOD.tgt]+(flOn?' · lampe ON':'')+'<br><span style="opacity:.55">[N] heure · [M] météo · [L] lampe</span>';wxEl.style.display=ac.on?'none':'block'}
