// ================= PERCEPTION DES BOTS (v38) : reconnaissance progressive, bruit de pas par sol, fatigue =================
const PERC={px:0,pz:0,v:0,max:0,el:null,bar:null,n:0};
// Un bot qui a une ligne de vue ne « confirme » pas le joueur d'un coup : la jauge b.rcg monte à une vitesse qui dépend de la distance,
// de la posture, du mouvement, de l'angle (vision périphérique), de l'alerte et du tir récent. À moins de 7 m : immédiat.
function percTime(b,pd){let da=Math.atan2(P.x-b.g.position.x,P.z-b.g.position.z)-b.yaw;da=Math.abs(Math.atan2(Math.sin(da),Math.cos(da)));
 let T=.2+pd*.028;T*=P.st===2?2.4:P.st===1?1.5:1;T*=PERC.v>3.5?.65:PERC.v<.3?1.4:1;if(da>.9)T*=1.7;if(b.alert)T*=.5;if((AI.heat||0)>3)T*=.4;if((TOD.t>20.2||TOD.t<5.2)&&typeof flOn!=='undefined'&&flOn)T*=.5;return T}
function percGate(b,vis,pd,dt){if(!vis){b.rcg=Math.max(0,(b.rcg||0)-dt*.6);return false}
 if(b.see||pd<7){b.rcg=1;return true}
 b.rcg=(b.rcg||0)+dt/percTime(b,pd);
 if(b.rcg>=1){b.rcg=1;return true}
 if(b.rcg>.5&&!b.alert)aiAlert(b,P.x+rnd(-6,6),P.z+rnd(-6,6),3);
 return false}
// bruit des pas : rayon selon le sol, la posture et l'allure
const PERC_R={grass:3.5,mud:3,water:14,wood:11,conc:12,stair:13};
const sfxFoot2=sfxFoot;
sfxFoot=function(x,y,z,kind,vol,bot){sfxFoot2(x,y,z,kind,vol,bot);try{if(bot||(kind!=='step'&&kind!=='land'))return;const k=surfKind(x,y,z,P.sup);const m=(P.st===2?.25:P.st===1?.55:1)*(K.ShiftLeft&&P.st===0?1.7:1)*(kind==='land'?2:1);noise(P.x,P.z,(PERC_R[k]||8)*m)}catch(e){}};
// fatigue des bots : après ~9 s de course, ils ralentissent jusqu'à récupération
function percTired(b,dt){if(b.stm===undefined)b.stm=1;if(b.path&&b.spK>=2){b.stm=Math.max(0,b.stm-dt*.11)}else b.stm=Math.min(1,b.stm+dt*.07);
 if(b.stm<=0)b.tired=1;else if(b.stm>.5)b.tired=0;if(b.tired&&b.spK>1.3)b.spK=1.3}
function percTick(dt){if(!PERC.el){const e=document.createElement('div');e.style.cssText='position:fixed;left:50%;top:7%;transform:translateX(-50%);width:90px;height:5px;background:rgba(0,0,0,.45);border:1px solid rgba(220,230,200,.35);z-index:8;pointer-events:none;opacity:0;transition:opacity .25s';const f=document.createElement('div');f.style.cssText='height:100%;width:0;background:#e0b040';e.appendChild(f);document.body.appendChild(e);PERC.el=e;PERC.bar=f}
 const v=Math.hypot(P.x-PERC.px,P.z-PERC.pz)/Math.max(dt,.001);PERC.px=P.x;PERC.pz=P.z;PERC.v+=(Math.min(v,12)-PERC.v)*Math.min(1,dt*6);
 let m=0;for(const b of bots){if(b.dead||b.dorm)continue;percTired(b,dt);if(b.rcg>m&&!b.see)m=b.rcg}PERC.max=m;PERC.el.style.opacity=m>.05?1:0;PERC.bar.style.width=(m*100|0)+'%';PERC.bar.style.background=m>.6?'#d05030':'#e0b040'}
