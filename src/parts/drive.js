// ================= v36 : VÉHICULES CONDUISIBLES (voitures et véhicules garées) =================
// F près d'un véhicule : monter ; W/S accélérer, freiner, marche arrière ; A/D diriger ; Espace frein à main ; F : descendre (à l'arrêt).
// Collisions avec les obstacles (dégâts du véhicule et du conducteur), soldats écrasés, fumée/incendie via destruct.js, moteur sonore.
var DRV={on:0,r:null,v:0,h:0,st:0,x:0,z:0,len:4.6,wid:2.2,hgt:1.5,vmax:28,yo:0,cd:0,hint:null,ht:0,snd:null,pit:0,rol:0,bump:0,hn:0,lt:null,wm:0};
function drvNear(){let b=null,bd=3.6;for(const r of dstS().list){if(r.st>0||r.hp<=0||r.drv)continue;const dy=P.gy-(r.e&&r.e.position?r.e.position.y:r.y);if(dy>2.4||dy<-2)continue;const d=Math.hypot(r.x-P.x,r.z-P.z);if(d<bd){bd=d;b=r}}return b}
function drvSound(on){try{if(!on){if(DRV.snd){DRV.snd.o.stop();DRV.snd=null}return}AC=AC||new AudioContext();const o=AC.createOscillator(),f=AC.createBiquadFilter(),g=AC.createGain();o.type='sawtooth';f.type='lowpass';f.frequency.value=700;g.gain.value=.05;o.connect(f);f.connect(g);g.connect(AC.destination);o.start();DRV.snd={o,g,f}}catch(e){}}
// cellules de navigation des bots : la caisse d'un véhicule est retirée quand il roule (drvNav(bx,0)) et reposée à l'arrêt (drvNav(bx,1)) ;
// en la retirant on ne libère pas ce qui reste bloqué par un autre obstacle, l'eau profonde ou le bord de la carte
function drvNav(o,on){const m=.3,rg=b=>[Math.max(0,Math.ceil((b.x0-m+MH)/NS-.5)),Math.min(NGN-1,Math.floor((b.x1+m+MH)/NS-.5)),Math.max(0,Math.ceil((b.z0-m+MH)/NS-.5)),Math.min(NGN-1,Math.floor((b.z1+m+MH)/NS-.5))],[i0,i1,j0,j1]=rg(o);
for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++)NAVB[j*NGN+i]=on?1:0;if(on)return;
const db=new Set(doors.map(d=>d.box));for(const b of boxes){if(b===o||db.has(b)||b.y0>1.7)continue;const[a0,a1,c0,c1]=rg(b);for(let j=Math.max(j0,c0);j<=Math.min(j1,c1);j++)for(let i=Math.max(i0,a0);i<=Math.min(i1,a1);i++)NAVB[j*NGN+i]=1}
for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const k=j*NGN+i,x=nX(k),z=nZ(k);if(Math.abs(x)>MH-1.4||Math.abs(z)>MH-1.4||(x>ZN.x0-2.6&&x<ZN.x1+2.6&&z>ZN.z0-2.6)||wDep(x,z)>.6)NAVB[k]=1}}
function drvEnter(r){if(DRV.on||HM.dead||ac.on||bench)return;const g=r.px.geometry.parameters,len=Math.max(g.width,g.depth),wid=Math.min(g.width,g.depth),hh=g.height;
if(r.h===undefined)r.h=r.e.rotation.y;r.drv=1;const i=boxes.indexOf(r.bx);if(i>=0)boxes.splice(i,1);try{drvNav(r.bx,0)}catch(e){}
r.px.geometry.dispose();r.px.geometry=new THREE.BoxGeometry(wid,hh,len);r.px.rotation.y=r.h;r.e.rotation.order='YXZ';
Object.assign(DRV,{on:1,r,v:0,h:r.h,st:0,x:r.x,z:r.z,len,wid,hgt:hh,vmax:len>6?17:28,yo:r.y-GH(r.x,r.z),cd:0,pit:0,rol:0,bump:0,hn:0,wm:0});drvLights(true);
gun.visible=false;P.yaw=DRV.h;P.pitch=-.2;DRV.fp=0;P.st=1;mdown=false;ads=false;drvSound(true);hlMsg('Conduite : W/S, A/D, Espace frein à main, H vue conducteur, F sortir');snd(220,.12,.12,'square')}
function drvExit(force){if(!DRV.on)return;const r=DRV.r;if(!force&&Math.abs(DRV.v)>4)return hlMsg('Arrête-toi pour descendre');
const c=Math.cos(DRV.h),s=Math.sin(DRV.h),d=DRV.wid/2+.9,L=DRV.len/2+.9;let q=[-c*d,s*d];for(const t of [[-c*d,s*d],[c*d,-s*d],[s*L,c*L],[-s*L,-c*L]])if(free_(DRV.x+t[0],DRV.z+t[1])){q=t;break}P.x=DRV.x+q[0];P.z=DRV.z+q[1];P.gy=GH(P.x,P.z);P.vy=0;P.air=0;
r.drv=0;DRV.on=0;DRV.v=0;drvLights(false);if(DRV.spd)DRV.spd.style.display='none';gun.visible=true;if(typeof canStand==='function'&&canStand())P.st=0;drvSound(false);
const w=Math.abs(Math.sin(DRV.h))*DRV.len/2+Math.abs(Math.cos(DRV.h))*DRV.wid/2,l=Math.abs(Math.cos(DRV.h))*DRV.len/2+Math.abs(Math.sin(DRV.h))*DRV.wid/2;
r.bx.x0=DRV.x-w;r.bx.x1=DRV.x+w;r.bx.z0=DRV.z-l;r.bx.z1=DRV.z+l;if(!boxes.includes(r.bx))boxes.push(r.bx);try{drvNav(r.bx,1)}catch(e){}if(DRV.hint)DRV.hint.style.display='none'}
// eau : profondeur maximale sous l'empreinte du véhicule (centre, avant, arrière) ; les ponts (sol à WL+0,55) ne comptent pas comme de l'eau
function drvWater(x,z,h,len){const fx=-Math.sin(h)*len/2,fz=-Math.cos(h)*len/2;return Math.max(wDep(x,z),wDep(x+fx,z+fz),wDep(x-fx,z-fz))}
const DRV_WMAX=.45;
// nuit : phares (sprites additifs, pas de lumière dynamique : pas de recompilation de shaders) et feux arrière
function drvNight(){return typeof TOD!=='undefined'&&(TOD.t>19.5||TOD.t<5.5)}
function drvLights(on){const r=DRV.r;if(!on){if(DRV.lt){if(DRV.lt.parent)DRV.lt.parent.remove(DRV.lt);DRV.lt=null}return}
if(!r||!r.e||typeof flareT==='undefined')return;const g=new THREE.Group(),h=DRV.hgt,w=DRV.wid*.3,L=DRV.len/2;
const mk=(x,z,col,sz)=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:flareT,color:col,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,toneMapped:false,fog:false}));s.scale.set(sz,sz,1);s.position.set(x,h*.4,z);g.add(s)};
mk(-w,-L-.1,0xfff2c8,1.6);mk(w,-L-.1,0xfff2c8,1.6);mk(-w,L+.1,0xff2a1a,.7);mk(w,L+.1,0xff2a1a,.7);g.visible=false;g.userData.noLayer=1;r.e.add(g);DRV.lt=g}
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
function drvTick(dt){if(DRV.on&&typeof BLE!=='undefined'&&BLE.out>0){K.KeyW=K.KeyS=K.KeyA=K.KeyD=false}
if(DRV.on&&$('ov').style.display!=='none'){if(DRV.snd&&AC)DRV.snd.g.gain.value=0;return}
if(!DRV.on){DRV.ht-=dt;if(DRV.ht<=0){DRV.ht=.3;const n=P.gy!==undefined&&!HM.dead&&!ac.on&&!bench&&$('ov').style.display==='none'&&!nb&&!ndR&&!invNear()?drvNear():null;if(!DRV.hint){const d=document.createElement('div');d.style.cssText='position:fixed;left:50%;bottom:150px;transform:translateX(-50%);font:13px monospace;color:#dfe8d0;text-shadow:0 0 4px #000;pointer-events:none;z-index:6;display:none';document.body.appendChild(d);DRV.hint=d}
DRV.hint.textContent='F — Conduire';DRV.hint.style.display=n?'block':'none'}return}
gun.visible=false;const r=DRV.r;if(HM.dead||r.st>=1||r.hp<=0){if(r.st>=1||r.hp<=0){hlMsg('Le véhicule est en feu !');if(!HM.dead){const sp=Math.abs(DRV.v);hlApply('a',6,'o');hlApply('t',5,'o');if(sp>8){hlApply('ll',(sp-8)*1.5,'f');hlApply('rl',(sp-8)*1.5,'f')}}}drvExit(true);return}
const f=(K.KeyW?1:0)-(K.KeyS?1:0),s=(K.KeyA?1:0)-(K.KeyD?1:0),hb=K.Space;let v=DRV.v,a;
if(hb)a=-Math.sign(v)*Math.min(Math.abs(v)/dt,16);else if(f>0)a=v<0?-Math.sign(v)*14:7*Math.max(0,1-v/DRV.vmax);else if(f<0)a=v>.3?-14:(v>-8?-4:0);else a=-Math.sign(v)*Math.min(Math.abs(v)/dt,2.2);
if(!hb&&Math.abs(DRV.pit)>.1)a-=9.81*Math.sin(DRV.pit)*.5;
v+=a*dt*(1-Math.min(.5,r.hp<r.max*.3?(1-r.hp/(r.max*.3))*.5:0))*drvGrip();DRV.v=v;
const tg=s*.55/(1+Math.abs(v)/9);DRV.st+=(tg-DRV.st)*Math.min(1,dt*6);DRV.h+=(v/(DRV.len*.6))*Math.tan(DRV.st)*dt*(.5+.5*drvGrip());
let nx=DRV.x-Math.sin(DRV.h)*v*dt,nz=DRV.z-Math.cos(DRV.h)*v*dt;const gy=GH(DRV.x,DRV.z),lim=(typeof MH!=='undefined'?MH:500)-4;nx=Math.max(-lim,Math.min(lim,nx));nz=Math.max(-lim,Math.min(lim,nz));
const q=drvCol(nx,nz,gy);nx=q[0];nz=q[1];DRV.cd-=dt;
if(drvWater(nx,nz,DRV.h,DRV.len)>DRV_WMAX&&drvWater(nx,nz,DRV.h,DRV.len)>drvWater(DRV.x,DRV.z,DRV.h,DRV.len)){nx=DRV.x;nz=DRV.z;DRV.v*=Math.max(0,1-dt*8);v=DRV.v;DRV.wm-=dt;if(DRV.wm<=0){DRV.wm=2;hlMsg('Eau trop profonde')}}
if(q[2]&&DRV.cd<=0){const sp=Math.abs(v);if(sp>3.5){DRV.cd=.3;const dm=(sp-3.5)*18;dstHit(r,null,dm,'p');snd(rnd(80,140),.2,.25,'sawtooth');if(sp>12)hlApply('t',(sp-12)*2.2,'x',null);if(sp>16)hlApply('h',(sp-16)*2,'x',null);FXP.shake=Math.max(FXP.shake||0,Math.min(.8,sp/25))}DRV.v*=-.2}
for(const b of bots){if(b.dead>0||b.bout)continue;const g=b.g.position,dx=g.x-nx+Math.sin(DRV.h)*DRV.len*.3,dz=g.z-nz+Math.cos(DRV.h)*DRV.len*.3;if(Math.abs(dx)<DRV.len&&Math.abs(dz)<DRV.len&&Math.hypot(dx,dz)<DRV.wid/2+.55&&Math.abs(v)>2.5){bhHit(b,'t',90*Math.abs(v)/10,'o');b.pk=1;aiHit(b);if(b.hp<=0)onKill(b,false);DRV.v*=.93;snd(rnd(100,160),.15,.2,'square')}}
if(Math.abs(v)>3&&!DRV.fp){let df=DRV.h-P.yaw;df=Math.atan2(Math.sin(df),Math.cos(df));P.yaw+=df*Math.min(1,dt*1.2)*Math.min(1,Math.abs(v)/12)*(v>0?1:0)}
DRV.x=nx;DRV.z=nz;const gc=GH(nx,nz),fx=-Math.sin(DRV.h),fz=-Math.cos(DRV.h),yF=GH(nx+fx*DRV.len/2,nz+fz*DRV.len/2),yB=GH(nx-fx*DRV.len/2,nz-fz*DRV.len/2);const cx=Math.cos(DRV.h),cz=-Math.sin(DRV.h),hwd=DRV.wid/2,yR=GH(nx+cx*hwd,nz+cz*hwd),yL=GH(nx-cx*hwd,nz-cz*hwd),cl=(a,m)=>Math.max(-m,Math.min(m,a));DRV.pit+=(cl(Math.atan2(yF-yB,DRV.len),.6)-DRV.pit)*Math.min(1,dt*8);DRV.rol+=(cl(Math.atan2(yR-yL,DRV.wid),.5)-DRV.rol)*Math.min(1,dt*8);
const e=r.e;e.position.set(nx,gc+DRV.yo,nz);e.rotation.y=DRV.h;e.rotation.x=DRV.pit;e.rotation.z=DRV.rol;r.x=nx;r.z=nz;r.h=DRV.h;r.px.position.set(nx,gc+DRV.yo+DRV.hgt/2,nz);r.px.rotation.y=DRV.h;r.px.updateMatrixWorld();
const c=Math.cos(DRV.h),sn=Math.sin(DRV.h),lx=-.42,lz=-DRV.len*.06;P.x=nx+lx*c+lz*sn;P.z=nz-lx*sn+lz*c;P.gy=gc;P.vy=0;P.air=0;P.st=1;
DRV.cy=gc+DRV.yo+1.18+Math.sin(performance.now()*.03*Math.min(1,Math.abs(v)/20))*.012*Math.min(1,Math.abs(v)/10);DRV.bump=0;
if(DRV.lt)DRV.lt.visible=drvNight();DRV.hn=Math.max(0,DRV.hn-dt);if(mdown&&DRV.hn<=0){DRV.hn=.8;snd(330,.4,.25,'square');snd(415,.4,.2,'square');noise(P.x,P.z,38)}
if(DRV.snd&&AC){const th=f>0?1:0;DRV.snd.o.frequency.value=38+Math.abs(v)*5.5+th*10;DRV.snd.g.gain.value=.03+.03*Math.min(1,Math.abs(v)/15)+th*.015}
if(!DRV.spd){const d=document.createElement('div');d.style.cssText='position:fixed;right:24px;bottom:110px;font:20px monospace;color:#dfe8d0;text-shadow:0 0 4px #000;pointer-events:none;z-index:6';document.body.appendChild(d);DRV.spd=d}
DRV.spd.style.display='block';DRV.spd.textContent=Math.round(Math.abs(v)*3.6)+' km/h'+(r.hp<r.max*.6?' · ⚠':'');if(DRV.hint)DRV.hint.style.display='none'}
addEventListener('keydown',e=>{if(e.code==='KeyH'&&!e.repeat&&DRV.on){DRV.fp=!DRV.fp;if(DRV.fp)P.pitch=0}});
addEventListener('keydown',e=>{if(e.repeat||e.code!=='KeyF'||$('ov').style.display!=='none'||ac.on||bench)return;if(DRV.on){drvExit();if(!DRV.on&&DRV.spd)DRV.spd.style.display='none'}else if(!nb&&!ndR&&!invNear()){const r=drvNear();if(r)drvEnter(r)}});
