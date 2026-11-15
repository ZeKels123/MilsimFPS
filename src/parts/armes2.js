// ================= v45 : recul propre à chaque arme, fatigue des bras, saleté (poussière/boue) =================
// Déjà présents : pénétration par matériau et calibre (ballistics.js), usure/chaleur/pluie/enrayage/nettoyage (weapon.js), recul par arme (c.rec) et par position.
const WPX={bl:0,n:0,fat:0,msgF:0,t:0};
// recul cumulé en rafale (remonte vite, retombe à l'arrêt du tir) et dérive latérale propre à chaque arme (motif répétable, donc apprenable)
function wpDrift(){const c=WC[WSEL]||{rec:1};WPX.bl=Math.min(1,WPX.bl+.05+(c.rec||1)*.03);WPX.n++;
 return Math.sin(WPX.n*(.55+.09*(WSEL%4))+WSEL*2.1)*.55*Math.min(1,.35+WPX.bl)}
const wpxLoad=()=>Math.max(0,(typeof effK==='function'?effK():0));
{const r0=wpRecoil;wpRecoil=function(){const c=WC[WSEL]||{rec:1},fl=c.rec<1.6?(1.6+(c.rec-1)*.5)/c.rec:1;return r0()*fl*(/Reclamer/.test(c.n)?1.75:1)*(1+WPX.bl*.45)*(1+WPX.fat*.4)*(1+wpxLoad()*.12)};
 const s0=wpSpread;wpSpread=function(){return s0()*(1+WPX.fat*.5)*(1+wpxLoad()*.1)};}
// saleté : poussière à plat ventre au sec, boue à plat ventre sous la pluie, chute violente ; chaque arme a la sienne
{const j0=wpJamP;wpJamP=function(s){return Math.min(.35,j0(s)*(1+(s.dirt||0)*7))};
 const c0=wpCleanStart;wpCleanStart=function(){const s=wpS(WSEL);if(!s.jam&&s.wear<.03&&(s.dirt||0)>.03&&!WPN.cl&&!reloading&&!bench){const w=s.wear;s.wear=.031;c0();s.wear=w;return}c0()};
 const t0=wpTick;wpTick=function(dt){const cl=WPN.cl;t0(dt);if(cl>0&&WPN.cl===0&&WPN.msg==='Arme nettoyée')wpS(WSEL).dirt=0};
 const h0=wpHud;wpHud=function(){const s=wpS(WSEL),h=h0();return(s.dirt||0)>.03?h.replace('</small>',' · saleté '+Math.round(s.dirt*100)+' %</small>'):h};
 const f0=hlFall;hlFall=function(v){f0(v);if(v>7)for(const i in WPS)WPS[i].dirt=Math.min(1,(WPS[i].dirt||0)+Math.min(.2,(v-7)*.03))}}
function wpxTick(dt){if(P.gy===undefined||typeof WSEL==='undefined')return;WPX.t+=dt;
 WPX.bl=Math.max(0,WPX.bl-dt*2.4);if(WPX.bl<.04)WPX.n=0;
 const w=(typeof WKG!=='undefined'?WKG[WSEL]:3)||3,hold=!ac.on&&!HM.dead&&(ads||mdown)&&!K.ShiftLeft;
 if(hold){const up=(w/9.5)*.035*(ads?1:.6)*(1+wpxLoad())*(1+(HM.sta<.4?.6:0))*(WPN.rest?.3:1)*(P.st===2?.7:1);WPX.fat=Math.min(1,WPX.fat+up*dt)}
 else WPX.fat=Math.max(0,WPX.fat-dt*(K.ShiftLeft?.2:.12));
 if(WPX.fat>.65&&!WPX.msgF){WPX.msgF=1;try{hlMsg('Bras fatigués : la visée vacille')}catch(e){}}else if(WPX.fat<.4)WPX.msgF=0;
 const s=wpS(WSEL),mv=K.KeyW||K.KeyA||K.KeyS||K.KeyD;
 if(P.st===2&&mv){const rain=(typeof rainU!=='undefined'?rainU.uAmt.value:0);s.dirt=Math.min(1,(s.dirt||0)+dt*(rain>.3?.03:.012))}}
