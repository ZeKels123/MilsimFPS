// ================= TRÉBUCHEMENT EN RECULANT (v29b) =================
// Reculer sans regarder derrière soi : petite chance de trébucher par mètre parcouru (plus forte en sprint, de nuit,
// sous la pluie, en pente, jambes blessées ou essoufflé) ; un obstacle bas ou un cadavre derrière le joueur fait trébucher presque à coup sûr.
const TRB={t:0,dur:1.1,cd:0,dp:0,m:1,px:0,pz:0,ok:0,n:0,p:0};
function trbChance(){let p=.006;const st=P.st||0;if(st===1)p*=.4;if(K.ShiftLeft&&st===0)p*=2;if(ads)p*=1.3;
const tn=TOD.t>20.3||TOD.t<5;if(tn)p*=1.6;if(wcur[2]>.4)p*=1.4;
const sl=Math.abs(GH(P.x+.6,P.z)-GH(P.x-.6,P.z))+Math.abs(GH(P.x,P.z+.6)-GH(P.x,P.z-.6));p*=1+Math.min(1.5,sl*1.6);
if(HM.z&&HMAX&&((HM.z.ll<HMAX.ll*.5)||(HM.z.rl<HMAX.rl*.5)))p*=2;if(HM.sta<.3)p*=1.6;return p}
// obstacle derrière le joueur : cadavre ou objet bas (hauteur 0,15 à 0,7 m)
function trbBehind(){const fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw),bx=P.x-fx*.55,bz=P.z-fz*.55;
for(const b of bots){if(!(b.dead>0)||b.dorm)continue;const g=b.g.position;if(Math.abs(g.x-bx)<.6&&Math.abs(g.z-bz)<.6&&Math.hypot(g.x-bx,g.z-bz)<.6&&Math.abs(g.y-P.gy)<1)return'cadavre'}
for(const o of boxes){if(o.y1===undefined||o.stair)continue;const h=o.y1-P.gy;if(h<.15||h>.7||o.y0>P.gy+.5)continue;if(bx>o.x0-.1&&bx<o.x1+.1&&bz>o.z0-.1&&bz<o.z1+.1)return'obstacle'}return''}
function trbFall(why){TRB.t=TRB.dur;TRB.cd=6;TRB.n++;TRB.dp=0;ads=false;noise(P.x,P.z,26);snd(rnd(70,100),.14,.3,'sawtooth');FXP.shake=Math.max(FXP.shake,.5);
hlApply(Math.random()<.5?'ll':'rl',2.5,'f');hlMsg(why==='cadavre'?'Tu butes sur un corps en reculant !':why==='obstacle'?'Tu butes sur un obstacle en reculant !':'Tu trébuches en reculant !')}
function trbTick(dt){if(TRB.cd>0)TRB.cd-=dt;
if(P.gy===undefined||HM.dead||ac.on||bench||free||$('ov').style.display!=='none'){TRB.ok=0;TRB.m=1;return}
const mv=Math.hypot(P.x-TRB.px,P.z-TRB.pz);TRB.px=P.x;TRB.pz=P.z;
if(TRB.t>0){TRB.t-=dt;const k=1-TRB.t/TRB.dur;TRB.m=k<.35?0:.3+.5*(k-.35);
// la vue bascule vers le haut pendant la chute puis revient
const want=k<.35?.5*Math.sin(k/.35*Math.PI/2):.5*(1-(k-.35)/.65);const d=want-TRB.dp;P.pitch+=d;TRB.dp=want;cd=Math.max(cd,.2);
if(TRB.t<=0){TRB.m=1;P.pitch-=TRB.dp;TRB.dp=0}return}
TRB.m=1;
if(!TRB.ok){TRB.ok=1;return}
if(TRB.cd>0||P.air||P.mant||(P.st||0)===2||!(K.KeyS&&!K.KeyW)||mv<1e-4||mv>1)return;
const w=trbBehind();if(w){if(Math.random()<Math.min(1,dt*6)){trbFall(w)}return}
if(Math.random()<trbChance()*mv)trbFall('')}
