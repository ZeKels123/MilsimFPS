// ================= ARMES RÉALISTES (v32) =================
// Usure, chaleur du canon, enrayages, chambre (+1), modes de tir (clic molette), nettoyage (maintenir H), recul selon la position et l'appui.
const WPS={},WPN={rng:Math.random,msg:'',rest:0,cl:0};
const wpS=i=>WPS[i]||(WPS[i]={wear:0,heat:0,jam:0,clr:0,hot:0,mode:0,bst:0});
// modes autorisés : tableau d'indices (0 auto, 1 semi, 2 rafale de 3)
function wpModes(i){const c=WC[i];if(c.semi)return[1];if(/HMG/.test(c.n))return[0];return/MP9/.test(c.n)?[0,1]:[0,1,2]}
function wpMode(i){const m=wpModes(i),s=wpS(i);return m[Math.min(s.mode,m.length-1)]}
const WPMN=['AUTO','SEMI','RAFALE ×3'];
// arme à chargeur amovible : un coup peut rester dans la chambre au rechargement tactique
function wpnCh(){const c=WC[WSEL];return /Fusil$|MP9|Pistolet|HMG/.test(c.n)&&!/pompe|précision/.test(c.n)?1:0}
function wpHeatShot(c){return/HMG/.test(c.n)?.02:/pompe|précision/.test(c.n)?.03:/Pistolet|MP9/.test(c.n)?.012:.017}
// probabilité d'enrayage d'un coup
function wpJamP(s){const rain=(typeof rainU!=='undefined'?rainU.uAmt.value:0);return Math.min(.2,(1/9000)*(1+s.wear*40)*(1+Math.max(0,s.heat-.6)*5)*(1+rain*.8)*(A.supp?1.3:1))}
function wpnMsg(t){WPN.msg=t;WPN.mt=2.5;if(typeof hlMsg==='function')hlMsg(t)}
// appui : un obstacle à hauteur de poitrine devant, mais pas à hauteur des yeux (rebord, muret)
const _wr=new THREE.Raycaster(),_wo=new THREE.Vector3(),_wd=new THREE.Vector3();
function wpRest(){if(P.gy===undefined)return 0;_wd.set(-Math.sin(P.yaw),0,-Math.cos(P.yaw));let r=0;for(const dy of[.55,1.0]){_wo.set(P.x,P.gy+Math.min(P.eh,1.7)-dy,P.z);_wr.set(_wo,_wd);_wr.far=.75;if(_wr.intersectObjects(ray,false).length){r=1;break}}
if(r){_wo.set(P.x,P.gy+P.eh+.05,P.z);_wr.set(_wo,_wd);_wr.far=.75;if(_wr.intersectObjects(ray,false).length)r=0}return r}
function wpRecoil(){const c=WC[WSEL],st=Math.min(2,P.st||0);let k=[1,.8,.6][st];WPN.rest=wpRest();if(WPN.rest)k*=.72;if(/HMG/.test(c.n)&&st===2)k*=.5;return k}
function wpSpread(){const s=wpS(WSEL),st=Math.min(2,P.st||0);return(1+Math.max(0,s.heat-.5)*.8)*(1+s.wear*.3)*(ads?1:[1,.85,.7][st])}
// avant le tir : enrayage ?
function wpPre(){if(reloading||plateT>0||ac.on||ammo<=0)return false;const s=wpS(WSEL);if(s.jam||s.clr>0||s.hot)return true;
if(WPN.rng()<wpJamP(s)){s.jam=1;s.bst=0;cd=.3;snd(900,.03,.12,'square');wpnMsg('ENRAYAGE — [R] pour dégager');return true}return false}
function wpPost(){const c=WC[WSEL],s=wpS(WSEL),rain=(typeof rainU!=='undefined'?rainU.uAmt.value:0);s.wear=Math.min(1,s.wear+.0004*(1+rain*.5));s.heat=Math.min(1.4,s.heat+wpHeatShot(c));if(s.bst>0)s.bst--;
if(s.heat>=1&&/HMG/.test(c.n)&&!s.hot){s.hot=1;s.bst=0;wpnMsg('SURCHAUFFE — laisse refroidir le canon')}}
// gâchette : modes de tir
function wpTrig(){if(DRV.on)return false;const s=wpS(WSEL);if(s.jam){if(!mdPrev){snd(900,.03,.12,'square');wpnMsg('ENRAYAGE — [R] pour dégager')}return false}
if(s.clr>0||s.hot)return false;if(s.bst>0)return true;const m=wpMode(WSEL);if(m===0)return true;if(mdPrev)return false;if(m===2)s.bst=3;return true}
function wpBst(){const s=wpS(WSEL);return s.bst>0&&!s.jam&&!s.hot&&s.clr<=0}
// R : dégager un enrayage (prend du temps, la cartouche est éjectée)
function wpClear(){const s=wpS(WSEL);if(s.clr>0)return true;if(s.jam){s.clr=1.6;snd(300,.12,.15,'square');wpnMsg('Désenrayage…');return true}return false}
function wpFin(){const s=wpS(WSEL);s.jam=0;if(ammo>0)ammo--;snd(520,.08,.12,'triangle')}
// nettoyage : 3 s à l'établi, 10 s sur le terrain (immobile, sans tirer)
function wpCleanStart(){if(WPN.cl>0||reloading||bench)return;const s=wpS(WSEL);if(s.wear<.03&&!s.jam)return wpnMsg('Arme propre');WPN.cl=.001;WPN.cT=(typeof nb!=='undefined'&&nb)?3:10;snd(260,.1,.1,'triangle');wpnMsg('Nettoyage de l’arme…')}
let _wsm=0;
function wpTick(dt){const s=wpS(WSEL),c=WC[WSEL],rain=(typeof rainU!=='undefined'?rainU.uAmt.value:0);
if(WPN.mt>0){WPN.mt-=dt;if(WPN.mt<=0)WPN.msg=''}
for(const i in WPS){const q=WPS[i];q.heat=Math.max(0,q.heat-dt*.05*(1+rain*1.5)*(i==WSEL&&mdown?.4:1));if(q.hot&&q.heat<.6){q.hot=0;if(i==WSEL)wpnMsg('Canon refroidi')}}
if(K.KeyH&&WPN.cl<=0&&!bench&&!reloading&&!mdown){WPN.h=(WPN.h||0)+dt;if(WPN.h>1.2){WPN.h=-99;wpCleanStart()}}else if(!K.KeyH)WPN.h=0;
if(s.clr>0){s.clr-=dt;if(s.clr<=0){s.clr=0;wpFin()}}
if(WPN.cl>0){const mv=K.KeyW||K.KeyA||K.KeyS||K.KeyD||mdown||reloading||bench;if(mv){WPN.cl=0;wpnMsg('Nettoyage interrompu')}else{WPN.cl+=dt;if(WPN.cl>=WPN.cT){WPN.cl=0;s.wear*=.2;if(s.jam){s.jam=0}snd(520,.1,.12,'sine');wpnMsg('Arme nettoyée')}}}
if(s.heat>.7&&P.gy!==undefined){_wsm-=dt;if(_wsm<=0){_wsm=.18;try{emit(MZ,_e.set(rnd(-.1,.1),rnd(.2,.5),rnd(-.1,.1)),{color:0xcfcfcf,size:.07,grow:.9,life:.9,a:Math.min(.35,(s.heat-.6)*.5),drag:1.5})}catch(e){}}}}
function wpHud(){const s=wpS(WSEL),m=wpModes(WSEL).length>1?WPMN[wpMode(WSEL)]+' · ':'',h=Math.round(Math.min(1,s.heat)*100),col=s.jam||s.hot||h>85?'#e04a3a':h>60?'#e6c04a':'#cfe3c0';
const st=s.jam?'ENRAYAGE [R]':s.hot?'SURCHAUFFE':WPN.cl>0?'nettoyage '+Math.round(WPN.cl/WPN.cT*100)+' %':'';
return'<small style="color:'+col+'">'+m+'usure '+Math.round(s.wear*100)+' % · chauffe '+h+' %'+(WPN.rest?' · appui':'')+(st?' · <b>'+st+'</b>':'')+'</small>'}
// mode de tir : clic molette ; nettoyage : maintenir H (inspection) 1,2 s à l'arrêt
function wpModeNext(){const m=wpModes(WSEL);if(m.length>1){const s=wpS(WSEL);s.mode=(s.mode+1)%m.length;s.bst=0;snd(420,.04,.1,'square');wpnMsg('Mode : '+WPMN[wpMode(WSEL)])}}
addEventListener('mousedown',e=>{if(e.button!==1||$('ov').style.display!=='none'||ac.on||bench)return;e.preventDefault();wpModeNext()});
addEventListener('keydown',e=>{if(e.code==='KeyH'&&!e.repeat)WPN.h=0;if(e.code==='Semicolon'&&!e.repeat&&$('ov').style.display==='none'&&!ac.on&&!bench)wpModeNext()});
// enveloppes des fonctions d'origine (renommées fire0 / reload0 à l'assemblage)
function fire() {if(wpPre())return;const a=ammo;fire0();if(ammo<a)wpPost()}
function reload() {if(wpClear())return;reload0()}
