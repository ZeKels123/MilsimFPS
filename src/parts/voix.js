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
// voix enregistrées (voix_data.js) : décodées au premier clic comme les autres échantillons, jouées en 3D sur le bot ; repli sur la synthèse vocale
const VXB={};let vxDec=0;
function vxDecode(){if(vxDec||typeof VXD==='undefined')return;vxDec=1;try{AC=AC||new AudioContext();for(const p in VXD)VXD[p].forEach((u,i)=>{const bs=atob(u.split(',')[1]),a=new Uint8Array(bs.length);for(let k=0;k<bs.length;k++)a[k]=bs.charCodeAt(k);AC.decodeAudioData(a.buffer,x=>{(VXB[p]=VXB[p]||[])[i]=x},()=>{})})}catch(e){}}
['pointerdown','keydown'].forEach(e=>addEventListener(e,vxDecode,{once:true}));
// phrase à dire : on préfère celles qui existent en enregistrement (4 fois sur 5)
function vxPick(key){const L=VX.L[key],rec=L.filter(p=>typeof VXD!=='undefined'&&VXD[p]);return rec.length&&Math.random()<.8?rec[Math.random()*rec.length|0]:L[Math.random()*L.length|0]}
function vxPlayRec(b,txt,d){const bufs=VXB[txt];if(!bufs)return false;const ok=bufs.filter(Boolean);if(!ok.length)return false;const g=b.g.position,bi=bots.indexOf(b);
 try{AC=AC||new AudioContext();auInit();if(!AU.ready)return false;const s=AC.createBufferSource(),gn=AC.createGain();s.buffer=ok[Math.random()*ok.length|0];s.playbackRate.value=(.93+(bi%5)*.035)*(b.ty===3?.9:1);gn.gain.value=1;s.connect(gn);gn.connect(sp3(g.x,g.y+1.6*b.T.sc,g.z,{ref:7,roll:1,ad:60,air:9000}));s.start();return true}catch(e){return false}}
function vxSay(b,key,noAck,force){if(!VX.on||b.dead)return;const g=b.g.position,d=Math.hypot(g.x-P.x,g.z-P.z);if(d>45)return;
if(!force&&((b.vxCd||0)>VX.t||VX.last>VX.t))return;const txt=key==='tmp'?VX.L.tmp[0]:vxPick(key),rec=vxPlayRec(b,txt,d);if(!rec&&typeof speechSynthesis==='undefined')return;b.vxCd=VX.t+(key==='ack'?3:5);VX.last=VX.t+.9;
vxSub('['+(['Assaut','Appui','Tireur','Lourd'][b.ty]||'Bot')+'] '+txt);
if(!rec)try{const u=new SpeechSynthesisUtterance(txt);u.lang='fr-FR';const bi=bots.indexOf(b);u.pitch=.55+(bi%5)*.14+(b.ty===3?-.15:0);u.rate=1.18;u.volume=Math.max(.1,1-d/45);if(speechSynthesis.speaking&&speechSynthesis.pending&&!force)return;speechSynthesis.speak(u)}catch(e){}
if(!noAck&&key!=='ack'&&key!=='lost'){let best=null,bd=40;for(const o of bots){if(o===b||o.dead)continue;const dd=Math.hypot(o.g.position.x-g.x,o.g.position.z-g.z);if(dd<bd){bd=dd;best=o}}if(best)setTimeout(()=>vxSay(best,'ack',true),1100+Math.random()*600)}}
function vxTick(dt){VX.t+=dt;if(VX.subT>0){VX.subT-=dt;if(VX.subT<=0&&VX.sub)VX.sub.style.opacity=0}
for(const b of bots){if(b.dead){if(!b.vxDead&&b.dead>50===false){b.vxDead=1;let nb=null,nd=32;for(const o of bots){if(o===b||o.dead)continue;const dd=Math.hypot(o.g.position.x-b.g.position.x,o.g.position.z-b.g.position.z);if(dd<nd){nd=dd;nb=o}}if(nb&&Math.random()<.7)vxSay(nb,'down',true)}b.vxDead=1;continue}b.vxDead=0;
const s=b.see?1:0;if(s&&!b.vxSee)tacCall(b,'contact');if(!s&&b.vxSee&&b.alert)tacCall(b,'lost');b.vxSee=s;
if(b.relT>0&&!b.vxRel)vxSay(b,'reload');b.vxRel=b.relT>0;
if(b.st==='cov'&&b.vxSt!=='cov')vxSay(b,'cover');if(b.st==='flk'&&b.vxSt!=='flk')vxSay(b,'flank');b.vxSt=b.st}}
