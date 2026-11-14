// ================= v36 : VÉHICULES CONDUISIBLES (voitures et véhicules garées) =================
// F près d'un véhicule : monter ; W/S accélérer, freiner, marche arrière ; A/D diriger ; Espace frein à main ; F : descendre (à l'arrêt).
// Collisions avec les obstacles (dégâts du véhicule et du conducteur), soldats écrasés, fumée/incendie via destruct.js, moteur sonore.
var DRV={on:0,r:null,v:0,h:0,st:0,x:0,z:0,len:4.6,wid:2.2,hgt:1.5,vmax:28,yo:0,cd:0,hint:null,ht:0,snd:null,pit:0,bump:0};
function drvNear(){let b=null,bd=3.6;for(const r of dstS().list){if(r.st>0||r.hp<=0||r.drv)continue;const d=Math.hypot(r.x-P.x,r.z-P.z);if(d<bd){bd=d;b=r}}return b}
function drvSound(on){try{if(!on){if(DRV.snd){DRV.snd.o.stop();DRV.snd=null}return}AC=AC||new AudioContext();const o=AC.createOscillator(),f=AC.createBiquadFilter(),g=AC.createGain();o.type='sawtooth';f.type='lowpass';f.frequency.value=700;g.gain.value=.05;o.connect(f);f.connect(g);g.connect(AC.destination);o.start();DRV.snd={o,g,f}}catch(e){}}
function drvEnter(r){if(DRV.on||HM.dead||ac.on||bench)return;const g=r.px.geometry.parameters,len=Math.max(g.width,g.depth),wid=Math.min(g.width,g.depth),hh=g.height;
if(r.h===undefined)r.h=r.e.rotation.y;r.drv=1;const i=boxes.indexOf(r.bx);if(i>=0)boxes.splice(i,1);
r.px.geometry.dispose();r.px.geometry=new THREE.BoxGeometry(wid,hh,len);r.px.rotation.y=r.h;r.e.rotation.order='YXZ';
Object.assign(DRV,{on:1,r,v:0,h:r.h,st:0,x:r.x,z:r.z,len,wid,hgt:hh,vmax:len>6?17:28,yo:r.y-GH(r.x,r.z),cd:0,pit:0,bump:0});
gun.visible=false;P.yaw=DRV.h;P.pitch=-.2;DRV.fp=0;P.st=1;mdown=false;ads=false;drvSound(true);hlMsg('Conduite : W/S, A/D, Espace frein à main, H vue conducteur, F sortir');snd(220,.12,.12,'square')}
function drvExit(force){if(!DRV.on)return;const r=DRV.r;if(!force&&Math.abs(DRV.v)>4)return hlMsg('Arrête-toi pour descendre');
const c=Math.cos(DRV.h),s=Math.sin(DRV.h),d=DRV.wid/2+.9;P.x=DRV.x-c*d;P.z=DRV.z+s*d;P.gy=GH(P.x,P.z);P.vy=0;P.air=0;
r.drv=0;DRV.on=0;DRV.v=0;gun.visible=true;if(typeof canStand==='function'&&canStand())P.st=0;drvSound(false);
const w=Math.abs(Math.sin(DRV.h))*DRV.len/2+Math.abs(Math.cos(DRV.h))*DRV.wid/2,l=Math.abs(Math.cos(DRV.h))*DRV.len/2+Math.abs(Math.sin(DRV.h))*DRV.wid/2;
r.bx.x0=DRV.x-w;r.bx.x1=DRV.x+w;r.bx.z0=DRV.z-l;r.bx.z1=DRV.z+l;if(!boxes.includes(r.bx))boxes.push(r.bx);if(DRV.hint)DRV.hint.style.display='none'}
function drvCol(nx,nz,gy){let imp=0;const f=_drf.set(-Math.sin(DRV.h),0,-Math.cos(DRV.h)),rad=DRV.wid/2,L=DRV.len;
for(const off of[-L/2+rad,0,L/2-rad]){let px=nx+f.x*off,pz=nz+f.z*off;for(const o of boxes){if(o.y0!==undefined&&(o.y1<gy+.35||o.y0>gy+1.5))continue;const cx=Math.max(o.x0,Math.min(px,o.x1)),cz=Math.max(o.z0,Math.min(pz,o.z1)),ax=px-cx,az=pz-cz,dd=Math.hypot(ax,az);
if(dd<rad){let pen=rad-dd,nxn,nzn;if(dd>1e-4){nxn=ax/dd;nzn=az/dd}else{nxn=px-(o.x0+o.x1)/2;nzn=pz-(o.z0+o.z1)/2;const l=Math.hypot(nxn,nzn)||1;nxn/=l;nzn/=l;pen=rad}nx+=nxn*pen;nz+=nzn*pen;px+=nxn*pen;pz+=nzn*pen;imp=1}}}
return[nx,nz,imp]}
const _drf=new THREE.Vector3();
// caméra : poursuite autour du véhicule (souris pour tourner autour), H pour la vue du conducteur
const _drc=new THREE.Raycaster(),_dro=new THREE.Vector3(),_drd=new THREE.Vector3();
function drvCam(){if(DRV.fp){C.position.set(P.x,DRV.cy,P.z);return}
const cp=Math.cos(P.pitch);_drd.set(-Math.sin(P.yaw)*cp,Math.sin(P.pitch),-Math.cos(P.yaw)*cp);_dro.set(DRV.x,DRV.cy-1.18+DRV.hgt+.2,DRV.z);let D=DRV.len*1.45+1.5;
const D0=D;DRV.cam=drvCamDist(D0);C.position.copy(_dro).addScaledVector(_drd,-DRV.cam);C.position.y+=.3;const gy=GH(C.position.x,C.position.z)+.45;if(C.position.y<gy)C.position.y=gy}
// collision caméra : 5 rayons (centre + écarts latéraux/verticaux) pour ne pas traverser les angles de bâtiments, recul immédiat, retour progressif
function drvCamDist(D){const back=_drd.clone().negate(),rx=_drd.z,rz=-_drd.x,rl=Math.hypot(rx,rz)||1;let m=D;
 for(const [lx,ly] of [[0,0],[.5,0],[-.5,0],[0,.45],[0,-.3]]){_dv.set(_dro.x+rx/rl*lx,_dro.y+ly,_dro.z+rz/rl*lx);_drc.set(_dv,back);_drc.far=D;const hs=_drc.intersectObjects(ray,false).filter(h=>h.object!==DRV.r.px);if(hs.length)m=Math.min(m,Math.max(1.2,hs[0].distance-.5))}
 if(DRV.cam===undefined||m<DRV.cam)return m;return Math.min(m,DRV.cam+.18)}
const _dv=new THREE.Vector3();
function drvTick(dt){
if(!DRV.on){DRV.ht-=dt;if(DRV.ht<=0){DRV.ht=.3;const n=P.gy!==undefined&&!HM.dead&&!ac.on&&!bench&&$('ov').style.display==='none'&&!nb&&!ndR&&!invNear()?drvNear():null;if(!DRV.hint){const d=document.createElement('div');d.style.cssText='position:fixed;left:50%;bottom:150px;transform:translateX(-50%);font:13px monospace;color:#dfe8d0;text-shadow:0 0 4px #000;pointer-events:none;z-index:6;display:none';document.body.appendChild(d);DRV.hint=d}
DRV.hint.textContent='F — Conduire';DRV.hint.style.display=n?'block':'none'}return}
gun.visible=false;const r=DRV.r;if(HM.dead||r.st>=1||r.hp<=0){if(r.st>=1||r.hp<=0)hlMsg('Le véhicule est en feu !');drvExit(true);return}
const f=(K.KeyW?1:0)-(K.KeyS?1:0),s=(K.KeyA?1:0)-(K.KeyD?1:0),hb=K.Space;let v=DRV.v,a;
if(hb)a=-Math.sign(v)*Math.min(Math.abs(v)/dt,16);else if(f>0)a=v<0?-Math.sign(v)*14:7*Math.max(0,1-v/DRV.vmax);else if(f<0)a=v>.3?-14:(v>-8?-4:0);else a=-Math.sign(v)*Math.min(Math.abs(v)/dt,2.2);
v+=a*dt*(1-Math.min(.5,r.hp<r.max*.3?(1-r.hp/(r.max*.3))*.5:0));DRV.v=v;
const tg=s*.55/(1+Math.abs(v)/9);DRV.st+=(tg-DRV.st)*Math.min(1,dt*6);DRV.h+=(v/(DRV.len*.6))*Math.tan(DRV.st)*dt;
let nx=DRV.x-Math.sin(DRV.h)*v*dt,nz=DRV.z-Math.cos(DRV.h)*v*dt;const gy=GH(DRV.x,DRV.z),lim=(typeof MH!=='undefined'?MH:500)-4;nx=Math.max(-lim,Math.min(lim,nx));nz=Math.max(-lim,Math.min(lim,nz));
const q=drvCol(nx,nz,gy);nx=q[0];nz=q[1];DRV.cd-=dt;
if(q[2]&&DRV.cd<=0){const sp=Math.abs(v);if(sp>3.5){DRV.cd=.3;const dm=(sp-3.5)*18;dstHit(r,null,dm);snd(rnd(80,140),.2,.25,'sawtooth');if(sp>12)hlApply('t',(sp-12)*2.2,'x',null);FXP.shake=Math.max(FXP.shake||0,Math.min(.8,sp/25))}DRV.v*=-.2}
for(const b of bots){if(b.dead>0||b.bout)continue;const g=b.g.position,dx=g.x-nx+Math.sin(DRV.h)*DRV.len*.3,dz=g.z-nz+Math.cos(DRV.h)*DRV.len*.3;if(Math.abs(dx)<DRV.len&&Math.abs(dz)<DRV.len&&Math.hypot(dx,dz)<DRV.wid/2+.55&&Math.abs(v)>2.5){bhHit(b,'t',90*Math.abs(v)/10,'o');b.pk=1;aiHit(b);if(b.hp<=0)onKill(b,false);DRV.v*=.93;snd(rnd(100,160),.15,.2,'square')}}
if(Math.abs(v)>3&&!DRV.fp){let df=DRV.h-P.yaw;df=Math.atan2(Math.sin(df),Math.cos(df));P.yaw+=df*Math.min(1,dt*1.2)*Math.min(1,Math.abs(v)/12)*(v>0?1:0)}
DRV.x=nx;DRV.z=nz;const gc=GH(nx,nz),fx=-Math.sin(DRV.h),fz=-Math.cos(DRV.h),yF=GH(nx+fx*DRV.len/2,nz+fz*DRV.len/2),yB=GH(nx-fx*DRV.len/2,nz-fz*DRV.len/2);DRV.pit+=(Math.atan2(yF-yB,DRV.len)-DRV.pit)*Math.min(1,dt*8);
const e=r.e;e.position.set(nx,gc+DRV.yo,nz);e.rotation.y=DRV.h;e.rotation.x=DRV.pit;r.x=nx;r.z=nz;r.h=DRV.h;r.px.position.set(nx,gc+DRV.yo+DRV.hgt/2,nz);r.px.rotation.y=DRV.h;r.px.updateMatrixWorld();
const c=Math.cos(DRV.h),sn=Math.sin(DRV.h),lx=-.42,lz=-DRV.len*.06;P.x=nx+lx*c+lz*sn;P.z=nz-lx*sn+lz*c;P.gy=gc;P.vy=0;P.air=0;P.st=1;
DRV.cy=gc+DRV.yo+1.18+Math.sin(performance.now()*.03*Math.min(1,Math.abs(v)/20))*.012*Math.min(1,Math.abs(v)/10);DRV.bump=0;
if(DRV.snd&&AC){const th=f>0?1:0;DRV.snd.o.frequency.value=38+Math.abs(v)*5.5+th*10;DRV.snd.g.gain.value=.03+.03*Math.min(1,Math.abs(v)/15)+th*.015}
if(!DRV.spd){const d=document.createElement('div');d.style.cssText='position:fixed;right:24px;bottom:110px;font:20px monospace;color:#dfe8d0;text-shadow:0 0 4px #000;pointer-events:none;z-index:6';document.body.appendChild(d);DRV.spd=d}
DRV.spd.style.display='block';DRV.spd.textContent=Math.round(Math.abs(v)*3.6)+' km/h'+(r.hp<r.max*.6?' · ⚠':'');if(DRV.hint)DRV.hint.style.display='none'}
addEventListener('keydown',e=>{if(e.code==='KeyH'&&!e.repeat&&DRV.on){DRV.fp=!DRV.fp;if(DRV.fp)P.pitch=0}});
addEventListener('keydown',e=>{if(e.repeat||e.code!=='KeyF'||$('ov').style.display!=='none'||ac.on||bench)return;if(DRV.on){drvExit();if(!DRV.on&&DRV.spd)DRV.spd.style.display='none'}else if(!nb&&!ndR&&!invNear()){const r=drvNear();if(r)drvEnter(r)}});
