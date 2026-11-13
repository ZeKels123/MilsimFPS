// ================= SAUVEGARDE DES RÉGLAGES : tout ce que le joueur règle est mémorisé d'une partie à l'autre =================
// Déjà sauvegardé par menu0.js : volume, sensibilité, qualité (menu), touches, skins d'arme, tenue.
// Ajouté ici : qualité choisie avec [O], accessoires et viseur, loupe holo, grenade sélectionnée, heure et météo, dernier mode.
const PERS={key:'mfps_ext',v:1,sig:'',last:null};
PERS.snap=()=>({v:PERS.v,A:Object.assign({},A),sel,mgIn,nsel:NADE.sel,gfx:GQ.mode,tod:+TOD.t.toFixed(2),wx:TOD.tgt,mode:GM.mode,fl:typeof flOn!=='undefined'?!!flOn:false});
PERS.read=()=>{try{const o=JSON.parse(localStorage.getItem(PERS.key)||'null');return o&&o.v===PERS.v?o:null}catch(e){return null}};
PERS.write=()=>{try{const o=PERS.snap(),s=JSON.stringify(o);if(s===PERS.sig)return false;PERS.sig=s;localStorage.setItem(PERS.key,s);if(SET.gfx!==o.gfx){SET.gfx=o.gfx;setSave()}return true}catch(e){return false}};
PERS.apply=o=>{o=o||PERS.read();if(!o)return false;
if(o.A&&typeof o.A==='object'){for(const k in A)if(typeof o.A[k]==='boolean')A[k]=o.A[k];if(A.supp&&A.brake)A.brake=false}
if(['scope','angled','holo'].includes(o.sel)&&A[o.sel])sel=o.sel;else{const l=['scope','angled','holo'].filter(k=>A[k]);if(l.length)sel=l[0]}
if(typeof o.mgIn==='boolean')mgIn=o.mgIn;
if(Number.isInteger(o.nsel)&&o.nsel>=0&&o.nsel<3)NADE.sel=o.nsel;
if(Number.isInteger(o.gfx)&&o.gfx>=0&&o.gfx<5){GQ.mode=o.gfx;SET.gfx=o.gfx}
if(isFinite(o.tod))TOD.t=((o.tod%24)+24)%24;
if(Number.isInteger(o.wx)&&o.wx>=0&&o.wx<5)TOD.tgt=o.wx;
if(o.fl&&typeof flOn!=='undefined')flOn=true;
PERS.sig=JSON.stringify(PERS.snap());return true};
PERS.reset=()=>{try{localStorage.removeItem(PERS.key);localStorage.removeItem('mfps_set')}catch(e){}};
PERS.apply();
setInterval(PERS.write,1500);addEventListener('pagehide',PERS.write);addEventListener('beforeunload',PERS.write);
