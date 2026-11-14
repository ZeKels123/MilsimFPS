// ================= EFFORT : poids, fatigue, souffle (v30) =================
// Complète l'inventaire (charge -> vitesse) et l'endurance : la charge fatigue aussi à la marche et dans les côtes, réduit le saut,
// ralentit le passage en visée, rend la visée instable et la chute plus dure. Maintenir [Maj] en visée retient le souffle.
// Soldat entraîné : ~22 s de sprint à charge légère (~14 s à pleine charge), récupération complète en ~6 s à l'arrêt ; la marche ne fatigue qu'au-delà de 70 % de charge
const STA={spr:.045,reg:.16,walk:.003,jump:.025,hold:6};
const EFF={hb:0,hbT:0,gasp:0,br:0,px:0,pz:0,pgy:0,ok:0,sl:0};
const effLoad=()=>typeof invLoad==='function'?invLoad():0;
// 0 sous 50 % de charge, 1 à 100 %, jusqu'à 1,6 en surcharge
const effK=()=>Math.max(0,Math.min(1.6,(effLoad()-.5)/.5));
const effJump=()=>(1-.22*Math.min(1,effK()))*(HM.sta<.08?.75:1);
const effJumpCost=()=>{HM.sta=Math.max(0,HM.sta-STA.jump*(1+effK()))};
const effADS=()=>1-.3*Math.min(1,effK())-(HM.sta<.25?.15:0);
// tremblement et dispersion : on enveloppe les versions de health.js
function hlTremor() {return Math.min(1.6,(hlTremor0()+effK()*.2+(SUR.on?SUR.tr:0))*(EFF.gasp>0?1.8:1)*(1-.85*EFF.hb))}
function HAIM() {return HAIM0()*(1+.25*effK())*(1-.3*EFF.hb)*(EFF.gasp>0?1.2:1)}
function effBar(){if(HM.sta>.995&&!EFF.hb&&!EFF.gasp)return'';const c=HM.sta<.25?'#e04a3a':HM.sta<.5?'#e6c04a':'#8fae5a';
return'<div style="width:96px;height:4px;background:#2a2f2a;margin-top:3px"><i style="display:block;height:4px;width:'+Math.round(HM.sta*100)+'%;background:'+c+'"></i></div>'+(EFF.gasp>0?'<span style="color:#e04a3a;font-size:11px">à bout de souffle</span>':EFF.hb>.3?'<span style="color:#cfe3c0;font-size:11px">souffle retenu</span>':'')}
function effBreath(){try{if(typeof AC==='undefined'||!AC)return;auInit();if(!AU.ready)return;nz(.55,'bandpass',900,.8,.12,AOUT(),.9,.12)}catch(e){}}
function effTick(dt){
if(P.gy===undefined||HM.dead||ac.on||bench||free||$('ov').style.display!=='none'){EFF.ok=0;EFF.hb=0;return}
const mx=P.x-EFF.px,mz=P.z-EFF.pz,m=Math.hypot(mx,mz),gy=GH(P.x,P.z),dgy=gy-EFF.pgy;EFF.px=P.x;EFF.pz=P.z;EFF.pgy=gy;
if(!EFF.ok){EFF.ok=1;return}
const mvg=m>.3*dt&&m<2*dt*8&&!P.air&&(P.st||0)<2,ld=effLoad();
if(mvg&&HM.sta>0){const sl=dgy/Math.max(m,1e-3);EFF.sl=sl;const spr=K.ShiftLeft&&(P.st||0)===0&&!ads;
let d=dt*STA.walk*Math.max(0,ld-.7)/.3*((P.st||0)===1?.5:1);if(sl>.12)d+=dt*.025*Math.min(1,(sl-.12)*3)*(1+effK())*(spr?1.5:1);HM.sta=Math.max(0,HM.sta-d)}
// retenue du souffle : [Maj] maintenu en visée
const maxT=STA.hold*(.5+.5*HM.sta);
if(EFF.gasp>0){EFF.gasp-=dt;EFF.hb=0}
else if(ads&&K.ShiftLeft&&!reloading&&HM.sta>.08&&EFF.hbT<maxT){EFF.hb=Math.min(1,EFF.hb+dt*5);EFF.hbT+=dt;HM.sta=Math.max(0,HM.sta-dt*.02)}
else{if(EFF.hb>.5&&EFF.hbT>=maxT){EFF.gasp=1.8;EFF.hb=0;effBreath()}EFF.hb=Math.max(0,EFF.hb-dt*3);EFF.hbT=Math.max(0,EFF.hbT-dt*(ads&&K.ShiftLeft?0:1.2))}
// essoufflement audible
EFF.br-=dt;if(HM.sta<.25&&EFF.br<=0){EFF.br=1.9-Math.min(.8,(.25-HM.sta)*3);effBreath();noise(P.x,P.z,9)}}
