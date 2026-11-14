// ================= v35 : survie (soif, faim, froid) et ramassage chronométré =================
// Soif et faim baissent avec l'effort ; le froid dépend de l'heure, de la pluie, de l'abri (bâtiment) et des feux proches.
// Boire : F au bord de l'eau, ou [=] une gourde ; manger : [-] une ration. \\ active/désactive la survie (mode long).
// Ramasser un objet prend du temps (selon sa masse) et s'interrompt si on bouge ou si on est touché.
var SUR={on:(function(){try{return localStorage.getItem('mfps_surv')!=='0'}catch(e){return true}})(),w:1,f:1,c:1,tr:0,act:null,pk:null,el:null,t:0,m:[0,0,0],ph:0};
function survAmb(){const sun=Math.max(0,Math.sin((TOD.t-6)/12*Math.PI)),rain=(typeof rainU!=='undefined'?rainU.uAmt.value:0);return 5+14*sun-4*rain}
function survFire(){if(typeof BRL==='undefined')return 0;for(const b of BRL){const q=b.userData.barrel;if(q&&typeof brFireR==='function'&&brFireR(q)>0&&Math.hypot(q.x-P.x,q.z-P.z)<5)return 1}return 0}
// froid : variation par seconde
function survColdRate(amb,indoor,fire,mv,rain){let r=0;if(amb<11)r-=(11-amb)/11*.0012*(1+rain*1.5)*(mv?.7:1);if(indoor)r+=.0025;else if(amb>13)r+=.0008*Math.min(1,(amb-13)/6);if(fire)r+=.012;return r}
function survMsg(t){if(typeof hlMsg==='function')hlMsg(t)}
function survStart(k){if(SUR.act||HM.dead||ac.on||bench)return;const i=HM.inv;
if(k==='eat'){if(i.rt<1)return survMsg('Plus de rations');if(SUR.f>.9)return survMsg('Pas faim');SUR.act={k,t:0,T:3.5,l:'Repas…'}}
else if(k==='drink'){if(i.bt<1)return survMsg('Plus de gourdes');if(SUR.w>.9)return survMsg('Pas soif');SUR.act={k,t:0,T:2.5,l:'Boire…'}}
else if(k==='lake'){if(SUR.w>.92)return survMsg('Pas soif');SUR.act={k,t:0,T:4.5,l:'Boire à la source…'}}snd(300,.08,.1,'triangle')}
function survDone(a){if(a.k==='eat'){HM.inv.rt--;SUR.f=Math.min(1,SUR.f+.45)}else if(a.k==='drink'){HM.inv.bt--;SUR.w=Math.min(1,SUR.w+.4)}else SUR.w=Math.min(1,SUR.w+.45);snd(520,.1,.12,'sine')}
function survWater(){if(typeof wDep!=='function')return 0;const fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw);return wDep(P.x,P.z)>.02||wDep(P.x+fx*1.2,P.z+fz*1.2)>.02?1:0}
function invPick() {if(SUR.pk)return;const e=invNear();if(!e)return;const kg=e.id==='B'?3:Math.min(4,(invDef(e.id).kg||.1)*(e.q||1)),T=e.id==='B'?2.5:Math.min(2.2,.3+.5*kg);if(T<.4){invPick0();return}SUR.pk={t:0,T,e,hp:P.hp,m:0}}
function survTick(dt){
if(SUR.pk){const k=SUR.pk,mv=K.KeyW||K.KeyA||K.KeyS||K.KeyD;if(mv||P.hp<k.hp-.1||HM.dead||!INV.gnd.includes(k.e)||invNear()!==k.e){SUR.pk=null;survMsg('Ramassage interrompu')}else{k.t+=dt;k.m-=dt;if(k.m<=0){k.m=.25;survMsg('Ramassage… '+Math.round(k.t/k.T*100)+' %')}if(k.t>=k.T){SUR.pk=null;invPick0()}}}
if(SUR.act){const a=SUR.act;if(K.ShiftLeft&&(K.KeyW||K.KeyA||K.KeyS||K.KeyD)||mdown||HM.dead){SUR.act=null;survMsg('Action interrompue')}else{a.t+=dt;a.m=(a.m||0)-dt;if(a.m<=0){a.m=.3;survMsg(a.l+' '+Math.round(a.t/a.T*100)+' %')}if(a.t>=a.T){SUR.act=null;survDone(a)}}}
if(!SUR.on||P.gy===undefined||HM.dead||$('ov').style.display!=='none'){if(SUR.el&&SUR.el.style.display!=='none')SUR.el.style.display='none';return}
const mv=K.KeyW||K.KeyA||K.KeyS||K.KeyD,ef=typeof effK==='function'?effK():0,rain=(typeof rainU!=='undefined'?rainU.uAmt.value:0),amb=survAmb();
SUR.w=Math.max(0,SUR.w-dt*.0004*(1+1.5*ef+(amb>22?.5:0)));SUR.f=Math.max(0,SUR.f-dt*.00018*(1+ef));
SUR.c=Math.max(0,Math.min(1,SUR.c+dt*survColdRate(amb,typeof inRoom==='function'&&inRoom(P.x,P.z)>=0,survFire(),mv,rain)));
let tr=0;if(SUR.w<.25){HM.sta=Math.max(0,HM.sta-dt*.005*(1-SUR.w/.25));tr+=(1-SUR.w/.25)*.25;if(SUR.w<.08)HM.sta=Math.min(HM.sta,.6)}
if(SUR.f<.2){HM.sta=Math.max(0,HM.sta-dt*.003*(1-SUR.f/.2));tr+=(1-SUR.f/.2)*.12}
if(SUR.c<.45){tr+=(1-SUR.c/.45)*.45;HM.sta=Math.max(0,HM.sta-dt*.004*(1-SUR.c/.45));if(SUR.c<.12)HM.sta=Math.min(HM.sta,.5)}
SUR.tr=tr;const lv=[SUR.w<.3?1:0,SUR.f<.3?1:0,SUR.c<.5?1:0];['Tu as soif','Tu as faim','Tu as froid'].forEach((t,i)=>{if(lv[i]&&!SUR.m[i])survMsg(t);SUR.m[i]=lv[i]});
SUR.t-=dt;if(SUR.t<=0){SUR.t=.5;survHud()}}
function survHud(){if(!SUR.el){const d=document.createElement('div');d.style.cssText='position:fixed;left:14px;bottom:262px;z-index:6;pointer-events:none;font:11px monospace;color:#dfe8d0;text-shadow:0 0 3px #000;width:96px';document.body.appendChild(d);SUR.el=d}
const L=[['Soif',SUR.w],['Faim',SUR.f],['Chaleur',SUR.c]].filter(q=>q[1]<.7),w=survWater()&&SUR.w<.9;let h='';for(const q of L){const c=q[1]<.25?'#e04a3a':q[1]<.5?'#e6c04a':'#8fae5a';h+='<div>'+q[0]+'<div style="height:3px;background:#2a2f2a"><i style="display:block;height:3px;width:'+Math.round(q[1]*100)+'%;background:'+c+'"></i></div></div>'}
if(w&&!SUR.act)h+='<div style="margin-top:3px;color:#9fd0ff">[F] boire</div>';SUR.el.innerHTML=h;SUR.el.style.display=h?'block':'none'}
addEventListener('keydown',e=>{if(e.repeat||$('ov').style.display!=='none'||ac.on||bench)return;
if(e.code==='Minus')survStart('eat');else if(e.code==='Equal')survStart('drink');
else if(e.code==='KeyF'&&SUR.on&&!DRV.on&&!nb&&!ndR&&!invNear()&&survWater())survStart('lake');
else if(e.code==='Backslash'){SUR.on=!SUR.on;try{localStorage.setItem('mfps_surv',SUR.on?'1':'0')}catch(x){}survMsg(SUR.on?'Survie activée (soif, faim, froid)':'Survie désactivée')}});
