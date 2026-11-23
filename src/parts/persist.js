// ================= SAUVEGARDE DES RÉGLAGES : tout ce que le joueur règle est mémorisé d'une partie à l'autre =================
// Déjà sauvegardé par menu0.js : volume, sensibilité, qualité (menu), touches, skins d'arme, tenue.
// Ajouté ici : qualité choisie avec [O], accessoires et viseur, loupe holo, grenade sélectionnée, heure et météo, dernier mode.
const PERS={key:'mfps_ext',v:1,sig:'',last:null};
PERS.snap=()=>({v:PERS.v,A:Object.assign({},A),sel,mgIn,nsel:NADE.sel,gfx:GQ.mode,tod:+TOD.t.toFixed(2),wx:TOD.tgt,mode:GM.mode,md:typeof MOO!=='undefined'?MOO.day:3,wm:typeof WMOD!=='undefined'?JSON.parse(JSON.stringify(WMOD)):{},fl:typeof flOn!=='undefined'?!!flOn:false,nv:typeof NVG!=='undefined'?{m:NVG.want,ir:!!NVG.ir}:{m:1,ir:false}});
PERS.read=()=>{try{const o=JSON.parse(localStorage.getItem(PERS.key)||'null');return o&&o.v===PERS.v?o:null}catch(e){return null}};
PERS.write=()=>{if(PERS.off)return false;try{const o=PERS.snap(),s=JSON.stringify(Object.assign({},PERS.snap(),{tod:Math.round(TOD.t*4)/4}));if(s===PERS.sig)return false;localStorage.setItem(PERS.key,s);PERS.sig=s;if(SET.gfx!==o.gfx){SET.gfx=o.gfx;setSave()}return true}catch(e){return false}};
PERS.apply=o=>{o=o||PERS.read();if(!o)return false;
if(o.A&&typeof o.A==='object'){for(const k in A)if(typeof o.A[k]==='boolean')A[k]=o.A[k];if(A.supp&&A.brake)A.brake=false}
if(['scope','angled','holo'].includes(o.sel)&&A[o.sel])sel=o.sel;else{const l=['scope','angled','holo'].filter(k=>A[k]);if(l.length)sel=l[0]}
if(typeof o.mgIn==='boolean')mgIn=o.mgIn;
if(Number.isInteger(o.nsel)&&o.nsel>=0&&o.nsel<NT.length)NADE.sel=o.nsel;
if(Number.isInteger(o.gfx)&&o.gfx>=0&&o.gfx<5){GQ.mode=o.gfx;SET.gfx=o.gfx}
if(typeof o.tod==='number'&&isFinite(o.tod))TOD.t=((o.tod%24)+24)%24;
if(Number.isInteger(o.wx)&&o.wx>=0&&o.wx<5)TOD.tgt=o.wx;
if(Number.isInteger(o.md)&&o.md>=0&&o.md<100000&&typeof MOO!=='undefined')MOO.day=o.md;
if(o.wm&&typeof o.wm==='object'&&typeof WMOD!=='undefined'){for(const i in o.wm){if(i==='__proto__'||i==='constructor'||i==='prototype'||!/^[0-9]{1,2}$/.test(i)||+i>=WC.length)continue;const m=o.wm[i];if(m&&[0,1,2].includes(m.b)&&[0,1,2].includes(m.s)&&[0,1,2].includes(m.m))WMOD[i]={b:m.b,s:m.s,m:m.m,l:[0,1,2].includes(m.l)?m.l:0}}}
if(o.fl&&typeof flOn!=='undefined')flOn=true;
if(o.nv&&typeof o.nv==='object'&&typeof NVG!=='undefined'){if(o.nv.m===1||o.nv.m===2)NVG.want=o.nv.m;if(typeof o.nv.ir==='boolean')NVG.ir=o.nv.ir}
PERS.sig=JSON.stringify(PERS.snap());return true};
PERS.reset=()=>{PERS.off=1;try{localStorage.removeItem(PERS.key);localStorage.removeItem('mfps_set')}catch(e){}};
GQ.mode=Number.isInteger(SET.gfx)&&SET.gfx>=0&&SET.gfx<5?SET.gfx:0;
PERS.apply();
setInterval(PERS.write,1500);addEventListener('pagehide',PERS.write);addEventListener('beforeunload',PERS.write);
