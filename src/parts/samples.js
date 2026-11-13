// ───── Échantillons sonores (tirs, rechargement, culasse, percuteur à vide) : MP3 embarqués, décodés au premier clic ─────
// Repli automatique sur les sons de synthèse tant que le décodage n'est pas terminé.
const SMP={buf:{},rdy:0};
function smpInit(){if(SMP.rdy)return;SMP.rdy=1;try{AC=AC||new AudioContext();for(const k in SMD){const b=atob(SMD[k].split(',')[1]),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);AC.decodeAudioData(u.buffer,x=>{SMP.buf[k]=x},()=>{})}}catch(e){}}
function smpPlay(k,v,rate,out,wet){const b=SMP.buf[k];if(!b)return false;try{AC=AC||new AudioContext();auInit();if(!AU.ready)return false;const s=AC.createBufferSource(),g=AC.createGain();s.buffer=b;s.playbackRate.value=rate||1;g.gain.value=v;s.connect(g);g.connect(out||AOUT());if(wet)auSend(g);s.start();return true}catch(e){return false}}
const SMW=[['rifle',1],['smg',1],['smg',1.14],['shotgun',1],['echo',1],['shotgun',.84]];
['pointerdown','keydown'].forEach(e=>addEventListener(e,smpInit,{once:true}));
