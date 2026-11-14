// ================= VOIX DES BOTS (v25) : annonces et réponses entre soldats (synthèse vocale du navigateur, volume selon la distance) =================
const VX={on:true,t:0,last:0,q:[],sub:null,L:{
 contact:['Contact !','Ennemi en vue !','Je le vois !','Contact, devant !'],
 hit:['Je suis touché !','Aah, touché !','Ça tire !','Sous le feu !'],
 reload:['Je recharge !','Rechargement, couvrez-moi !','Plus de munitions !'],
 grenade:['Grenade !','Grenade, sortez de là !','Je balance une grenade !'],
 down:['Homme à terre !','Il est tombé !','Un de moins, restez groupés !'],
 flank:['Je contourne !','Je prends le flanc !','Avancez, je couvre !'],
 cover:['Je me replie !','Couvrez-moi !','Je prends un abri !'],
 lost:['Je l\'ai perdu.','Plus de contact.','Où est-il passé ?'],
 ack:['Reçu.','Compris.','Je vous couvre.','Ok, j\'arrive.']}};
function vxSub(t){if(!VX.sub){const e=document.createElement('div');e.style.cssText='position:fixed;left:50%;bottom:19%;transform:translateX(-50%);padding:3px 10px;background:rgba(10,14,12,.6);color:#d8e6c8;font:13px monospace;border-left:3px solid #8fae5a;pointer-events:none;z-index:9;opacity:0;transition:opacity .2s';document.body.appendChild(e);VX.sub=e}VX.sub.textContent=t;VX.sub.style.opacity=1;VX.subT=2.2}
function vxSay(b,key,noAck,force){if(!VX.on||b.dead||typeof speechSynthesis==='undefined')return;const g=b.g.position,d=Math.hypot(g.x-P.x,g.z-P.z);if(d>45)return;
if(!force&&((b.vxCd||0)>VX.t||VX.last>VX.t))return;const L=VX.L[key],txt=L[Math.random()*L.length|0];b.vxCd=VX.t+(key==='ack'?3:5);VX.last=VX.t+.9;
vxSub('['+(['Assaut','Appui','Tireur','Lourd'][b.ty]||'Bot')+'] '+txt);
try{const u=new SpeechSynthesisUtterance(txt);u.lang='fr-FR';const bi=bots.indexOf(b);u.pitch=.55+(bi%5)*.14+(b.ty===3?-.15:0);u.rate=1.18;u.volume=Math.max(.1,1-d/45);if(speechSynthesis.speaking&&speechSynthesis.pending&&!force)return;speechSynthesis.speak(u)}catch(e){}
if(!noAck&&key!=='ack'&&key!=='lost'){let best=null,bd=40;for(const o of bots){if(o===b||o.dead)continue;const dd=Math.hypot(o.g.position.x-g.x,o.g.position.z-g.z);if(dd<bd){bd=dd;best=o}}if(best)setTimeout(()=>vxSay(best,'ack',true),1100+Math.random()*600)}}
function vxTick(dt){VX.t+=dt;if(VX.subT>0){VX.subT-=dt;if(VX.subT<=0&&VX.sub)VX.sub.style.opacity=0}
for(const b of bots){if(b.dead){b.vxDead=1;continue}
const s=b.see?1:0;if(s&&!b.vxSee)tacCall(b,'contact');if(!s&&b.vxSee&&b.alert)tacCall(b,'lost');b.vxSee=s;
if(b.relT>0&&!b.vxRel)vxSay(b,'reload');b.vxRel=b.relT>0;
if(b.st==='cov'&&b.vxSt!=='cov')vxSay(b,'cover');if(b.st==='fla'&&b.vxSt!=='fla')vxSay(b,'flank');b.vxSt=b.st}}
