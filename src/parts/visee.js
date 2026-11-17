// ---- Visée (ADS) : table par arme, maintien/bascule, annulation propre, balancement, vignette
// f = FOV des organes de visée métalliques ; e = vitesse d'entrée en visée ; m = vitesse de marche en visée ; s = amplitude du balancement
const VST=[{f:60,e:1,m:1,s:1},{f:63,e:1.3,m:1.12,s:.7},{f:66,e:1.6,m:1.18,s:.5},{f:62,e:.85,m:.95,s:1.1},{f:58,e:.6,m:.8,s:1.5},{f:60,e:.5,m:.6,s:2.1}];
const VSB={b:0};if(typeof SET.adsTog!=='boolean')SET.adsTog=false;
function vsT(){return VST[WSEL]||VST[0]}
function vsIronFov(){return vsT().f}
function vsRate(){const k=sight();return vsT().e*((k==='scope'||(WSEL===4&&k==='iron'))?.8:1)}
function vsMove(){return vsT().m}
function vsAmp(){if(!(adsT>.02))return 0;const st=Math.min(2,P.st||0);return .0016*vsT().s*adsT*[1,.7,.45][st]*(WPN.rest?.5:1)*(1-.9*(EFF.hb||0))*(1+.8*Math.min(1,effK()))*(HM.sta<.25?1.4:1)}
function vsOk(){return!reloading&&!bench&&!HNOADS()&&!HM.act&&!DRV.on&&!ac.on&&!INV.open&&!P.mant&&!(P.hp<=0)&&$('ov').style.display==='none'}
function vsAds(){if(!vsOk()){ads=false;return}
 if(!SET.adsTog){if(VSB.b)ads=true}
 else if(ads&&K.ShiftLeft&&(K.KeyW||K.KeyA||K.KeyS||K.KeyD)&&!P.st&&!(EFF.hb>.1))ads=false}
function vsSway(){const a=vsAmp();if(a<=0||ac.on||HM.dead||P.hp<=0)return;const t=performance.now()*.001;C.rotation.x+=a*(Math.sin(t*1.3)+.5*Math.sin(t*2.9+1));C.rotation.y+=a*(Math.sin(t*1.1+2)+.5*Math.sin(t*2.3))}
let _vsH=0,_vsV=null;
function vsFrame(sc){
 if(sc&&!bench)handL.visible=handR.visible=false;
 if(sc&&!_vsH&&gun.visible&&!DRV.on&&!bench){gun.visible=false;_vsH=1}
 else if(!sc&&_vsH){_vsH=0;if(!DRV.on&&!(P.hp<=0)&&!bench)gun.visible=true}
 if(!_vsV){_vsV=document.createElement('div');_vsV.style.cssText='position:fixed;inset:0;pointer-events:none;opacity:0;background:radial-gradient(ellipse at 50% 50%,transparent 36%,rgba(0,0,0,.5) 100%)';document.body.appendChild(_vsV)}
 _vsV.style.opacity=(sc?0:adsT*.9).toFixed(2)}
addEventListener('blur',()=>{VSB.b=0});
addEventListener('keydown',e=>{if(e.code==='Quote'&&!e.repeat){SET.adsTog=!SET.adsTog;if(SET.adsTog&&!VSB.b)ads=false;setSave();try{hlMsg('Visée : '+(SET.adsTog?'bascule':'maintien'))}catch(x){}try{snd(SET.adsTog?420:320,.04,.08,'square')}catch(x){}}});
