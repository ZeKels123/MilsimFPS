// ================= v6 : JOUEUR — niveaux, saut, enjambement, accroupi, couché =================
Object.assign(P,{gy:undefined,vy:0,st:0,eh:1.7,bh:1.5,mant:null,sup:null,fall:0});
const STH=[1.7,1.1,.5],STS=[1,.5,.2],STN=['debout','accroupi','couché'];
function canStand(){RC.set(_la.set(P.x,P.gy+.3,P.z),_lb.set(0,1,0));RC.far=1.55;return !RC.intersectObjects(solids)[0]}
function lvMantle(){const fx_=-Math.sin(P.yaw),fz_=-Math.cos(P.yaw);let best=null,bd=1e9;
for(const s of LSURF){if(!s.gl||!s.gl.userData.glass.dead)continue;const cx=(s.x0+s.x1)/2,cz=(s.z0+s.z1)/2,dx=cx-P.x,dz=cz-P.z,d=Math.hypot(dx,dz);if(d>1.7||d<.05||(dx*fx_+dz*fz_)/d<.4)continue;const dy=s.y-P.gy;if(dy<-.4||dy>1.35)continue;if(d<bd){bd=d;best=s}}
if(!best)return false;const cx=(best.x0+best.x1)/2,cz=(best.z0+best.z1)/2;P.mant={t:0,x0:P.x,z0:P.z,y0:P.gy,x1:cx,z1:cz,y1:best.y};P.st=0;if(typeof sfxFoot==='function')sfxFoot(P.x,P.gy,P.z,'vault',1);return true}
function lvJump(){if(!HJMP()||P.mant||P.vy>0||P.gy>groundAt(P.x,P.z,P.gy,.55)+.15)return;if(lvMantle())return;P.vy=5.6;P.air=1}
addEventListener('keydown',e=>{if(e.repeat||$('ov').style.display!=='none'||ac.on||bench)return;
if(e.code==='ControlLeft'){const n=(P.st+1)%3;if(n===0&&!canStand())return;P.st=n}else if(e.code==='KeyP'){if(P.st===2){if(canStand())P.st=1}else P.st=2}
else if(e.code==='Space'){if(P.st>0){if(canStand())P.st=0}else lvJump()}});
function lvReset(){hlReset();P.gy=GH(P.x,P.z);P.vy=0;P.st=0;P.mant=null;P.eh=1.7}
function lvStep(dt){if(P.gy===undefined)P.gy=GH(P.x,P.z);
const m=P.mant;if(m){m.t+=dt/.5;const k=Math.min(1,m.t),e=k*k*(3-2*k);P.x=m.x0+(m.x1-m.x0)*e;P.z=m.z0+(m.z1-m.z0)*e;P.gy=m.y0+(m.y1-m.y0)*e+Math.sin(Math.PI*k)*.3;if(k>=1){P.mant=null;P.gy=m.y1;P.vy=0;P.st=1}}
else{const g=groundAt(P.x,P.z,P.gy,P.st?.4:.55);P.sup=GSUP;
if(P.vy>0||P.gy>g+.5){P.vy-=22*dt;P.gy+=P.vy*dt;P.air=1;if(P.gy<=g&&P.vy<=0){const v=-P.vy;P.gy=g;P.vy=0;P.air=0;if(v>3)sfxFoot(P.x,P.gy,P.z,'land',Math.min(1.4,v/8));if(v>6)hlFall(v)}}
else{P.air=0;P.gy+=(g-P.gy)*Math.min(1,dt*18);P.vy=0}}
const vault=P.sup&&P.sup.gl&&!P.air,want=vault?Math.min(STH[P.st],1.0):STH[P.st];P.eh+=(want-P.eh)*Math.min(1,dt*(want<P.eh?9:6));P.bh=P.eh*.88}
