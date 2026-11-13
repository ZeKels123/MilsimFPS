// ================= MENU : réglages, bonus d'équipement, remappage des touches (chargé tôt) =================
const SET={vol:.8,sens:1,gfx:0,keys:{},wsk:'std',out:'std'};
try{Object.assign(SET,JSON.parse(localStorage.getItem('mfps_set')||'{}'))}catch(e){}
function setSave(){try{localStorage.setItem('mfps_set',JSON.stringify(SET))}catch(e){}}
const SKM={dmg:1,rec:1,rl:1,spd:1,ar:100,stealth:1,taken:1},GM={mode:'full'},MQP=[];
// volume général : tous les sons passent par un gain commun
(function(){const A0=window.AudioContext;if(!A0)return;window.AudioContext=function(...a){const c=new A0(...a),mg=c.createGain();mg.gain.value=SET.vol;mg.connect(c.destination);Object.defineProperty(c,'destination',{value:mg});c.__mg=mg;return c};window.AudioContext.prototype=A0.prototype})();
// remappage : on convertit la touche physique en touche d'origine avant que le jeu ne la lise
const KBD=[['fwd','Avancer','KeyW'],['back','Reculer','KeyS'],['left','Aller à gauche','KeyA'],['right','Aller à droite','KeyD'],['sprint','Sprint','ShiftLeft'],['jump','Sauter / enjamber','Space'],['crouch','Accroupi','ControlLeft'],['prone','Couché','KeyP'],['reload','Recharger','KeyR'],['use','Utiliser (établi, porte)','KeyF'],['leanL','Pencher à gauche','KeyQ'],['leanR','Pencher à droite','KeyE'],['inspect','Inspecter l’arme','KeyH'],['plate','Plaque d’armure','KeyG'],['swap','Changer d’arme','KeyT'],['nade','Lancer une grenade','KeyC'],['knife','Couteau','KeyZ'],['light','Lampe','KeyL'],['bag','Inventaire','Tab']];
const KRES=['Escape','F8','F9','KeyX','KeyK','KeyB','KeyN','KeyM','KeyU','KeyO','KeyV','Digit0','Digit1','Digit2','Digit3','Digit4','Digit5','Digit6','Digit7','Digit8','Digit9'];
let KMAP={},KBLK={},kbRe=0,kbWait=null;
function kbBuild(){KMAP={};KBLK={};const ph=new Set();KBD.forEach(([id,,d])=>ph.add(SET.keys[id]||d));KBD.forEach(([id,,d])=>{const p=SET.keys[id]||d;if(p!==d){KMAP[p]=d;if(!ph.has(d))KBLK[d]=1}})}
kbBuild();
function kbH(e){if(kbRe||!e.isTrusted)return;if(kbWait){if(e.type==='keydown'){e.stopImmediatePropagation();e.preventDefault();kbWait(e.code)}return}
const t=KMAP[e.code];if(t){e.stopImmediatePropagation();e.preventDefault();kbRe=1;dispatchEvent(new KeyboardEvent(e.type,{code:t,key:t.replace('Key','').replace('Digit','').toLowerCase(),repeat:e.repeat,bubbles:true,cancelable:true,shiftKey:e.shiftKey,ctrlKey:e.ctrlKey,altKey:e.altKey}));kbRe=0}else if(KBLK[e.code]){e.stopImmediatePropagation();e.preventDefault()}}
addEventListener('keydown',kbH,true);addEventListener('keyup',kbH,true);
