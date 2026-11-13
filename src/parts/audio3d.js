// ================= v6 : AUDIO SPATIALISÉ (stéréo HRTF, réverbération des maisons, bruits de pas selon le sol, pluie sur les toits) =================
const AU={ready:0,nb:null,wet:null,revH:null,revB:null,echo:null,wH:null,wB:null,wE:null,occ:0,room:-1,bun:0,sx:0,sz:0,rainOut:null,rainRoof:null,rainDeep:null,rg:[0,0,0],lastE:0};
function roofTop(x,z){for(let i=0;i<UPH.length;i++){const h=UPH[i].rect;if(x>h[0]&&x<h[1]&&z>h[2]&&z<h[3])return UPH[i].RT-.5}return 2.9}
function auIR(sec,dec,hp){const n=Math.floor(AC.sampleRate*sec),b=AC.createBuffer(2,n,AC.sampleRate);for(let c=0;c<2;c++){const d=b.getChannelData(c);let l=0;for(let i=0;i<n;i++){const t=i/n,w=Math.random()*2-1;l+=(w-l)*(hp?.6:.25);d[i]=l*Math.pow(1-t,dec)*(i<AC.sampleRate*.004?i/(AC.sampleRate*.004):1)}}return b}
function auInit(){if(AU.ready||!AC)return;try{AU.nb=AC.createBuffer(1,AC.sampleRate,AC.sampleRate);const d=AU.nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
AU.wet=AC.createGain();AU.wet.gain.value=1;AU.revH=AC.createConvolver();AU.revH.buffer=auIR(.75,3.2,0);AU.revB=AC.createConvolver();AU.revB.buffer=auIR(2.1,2.6,0);
AU.wH=AC.createGain();AU.wB=AC.createGain();AU.wE=AC.createGain();AU.wH.gain.value=AU.wB.gain.value=AU.wE.gain.value=0;
AU.wet.connect(AU.revH);AU.revH.connect(AU.wH);AU.wH.connect(AOUT());AU.wet.connect(AU.revB);AU.revB.connect(AU.wB);AU.wB.connect(AOUT());
// écho extérieur (vallée) : retard + rétroaction filtrée
const dl=AC.createDelay(1.2),fb=AC.createGain(),lp=AC.createBiquadFilter();dl.delayTime.value=.46;fb.gain.value=.34;lp.type='lowpass';lp.frequency.value=1700;AU.wet.connect(dl);dl.connect(lp);lp.connect(fb);fb.connect(dl);lp.connect(AU.wE);AU.wE.connect(AOUT());
AU.ready=1}catch(e){}}
function auSend(g){if(AU.ready)try{g.connect(AU.wet)}catch(e){}}
// occlusion : nombre de parois entre l'écouteur et la source
function auOcc(x,y,z){if(AU.occB<=0)return AU.occ;AU.occB--;const o=C.position;_la.copy(o);_lb.set(x-o.x,y-o.y,z-o.z);const d=_lb.length();if(d<.5)return 0;_lb.multiplyScalar(1/d);RC.set(_la,_lb);RC.far=d;const hs=RC.intersectObjects(solids);let n=0;for(const h of hs)if(!h.object.userData.glass)n++;return Math.min(4,n)}
// chaîne spatiale : entrée mono -> filtre (occlusion + absorption air) -> envoi réverbération -> panoramique HRTF
function sp3(x,y,z,o){o=o||{};auInit();const pn=AC.createPanner();pn.panningModel='HRTF';pn.distanceModel='inverse';pn.refDistance=o.ref||5;pn.rolloffFactor=o.roll||1.1;pn.maxDistance=500;
if(pn.positionX){pn.positionX.value=x;pn.positionY.value=y;pn.positionZ.value=z}else pn.setPosition(x,y,z);
const d=Math.hypot(x-C.position.x,y-C.position.y,z-C.position.z),oc=o.noocc?0:auOcc(x,y,z),lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=Math.max(380,Math.min(19000,(o.air||14000)/(1+d/(o.ad||35)))/(1+oc*1.5));lp.Q.value=.3;
const g=AC.createGain();g.gain.value=oc?Math.max(.18,1-oc*.24):1;lp.connect(g);g.connect(pn);pn.connect(AOUT());auSend(g);return lp}
function nz(dur,type,hz,q,vol,out,rate,att){const t=AC.currentTime,s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=AU.nb;s.playbackRate.value=rate||1;f.type=type;f.frequency.value=hz;f.Q.value=q;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+(att||.004));g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(f);f.connect(g);g.connect(out);s.start(t,Math.random()*.5);s.stop(t+dur+.05);return g}
function th(freq,dur,vol,out,type){const t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type=type||'sine';o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(Math.max(30,freq*.45),t+dur);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(out);o.start(t);o.stop(t+dur+.03)}
// ---- v9 : bruitages refaits. snd()/sndAt() gardent leur signature mais synthétisent selon le type :
// 'square' = mécanique (clic, culasse, chargeur ; aigu = tintement métallique), 'sawtooth' = choc/explosion, 'triangle' = souffle/frottement/eau, 'sine' = signal
function sfxCore(f,d,v,type,out,wet){const t=AC.currentTime;type=type||'sawtooth';
if(type==='sine'){const o=AC.createOscillator(),g=AC.createGain();o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*.82,t+d);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v*.8,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(out);o.start(t);o.stop(t+d+.03);return}
if(type==='square'){if(f>1400){// tintement métallique : partiels inharmoniques + grain
[1,1.48,2.31].forEach((k,i)=>{const o=AC.createOscillator(),g=AC.createGain();o.frequency.value=f*k*rnd(.98,1.02);g.gain.setValueAtTime(v*.5/(i+1),t);g.gain.exponentialRampToValueAtTime(.0001,t+d*(2.2-i*.5));o.connect(g);g.connect(out);o.start(t);o.stop(t+d*2.4)});nz(.02,'highpass',3000,.7,v*.8,out,1,.001);return}
// clic mécanique : claquement sec + corps métallique court + petit rebond
const g1=nz(Math.min(.05,d*.6),'bandpass',Math.min(5200,900+f*9),1.6,v*1.9,out,rnd(.9,1.15),.001);nz(.012,'highpass',4200,.7,v*1.1,out,1,.001);th(f*2.4,Math.min(.07,d),v*.55,out,'triangle');
[1,1.7].forEach(k=>{const o=AC.createOscillator(),g=AC.createGain();o.type='sine';o.frequency.value=(1700+f*3)*k*rnd(.96,1.04);g.gain.setValueAtTime(v*.22,t);g.gain.exponentialRampToValueAtTime(.0001,t+.05+d*.4);o.connect(g);g.connect(out);o.start(t);o.stop(t+.12+d*.5)});
if(d>.09){const s=AC.createBufferSource(),ff=AC.createBiquadFilter(),g=AC.createGain();s.buffer=AU.nb;ff.type='bandpass';ff.frequency.value=2600;ff.Q.value=2;g.gain.setValueAtTime(.0001,t+d*.55);g.gain.linearRampToValueAtTime(v*.9,t+d*.55+.002);g.gain.exponentialRampToValueAtTime(.0001,t+d*.55+.03);s.connect(ff);ff.connect(g);g.connect(out);s.start(t+d*.5,Math.random()*.5);s.stop(t+d+.1)}
if(wet)auSend(g1);return}
if(type==='triangle'){// souffle : bruit filtré qui glisse
const s=AC.createBufferSource(),ff=AC.createBiquadFilter(),g=AC.createGain();s.buffer=AU.nb;s.playbackRate.value=rnd(.8,1.1);ff.type='bandpass';ff.Q.value=.9;ff.frequency.setValueAtTime(Math.min(7000,f*5),t);ff.frequency.exponentialRampToValueAtTime(Math.max(200,f*1.6),t+d);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v*2.2,t+d*.25);g.gain.exponentialRampToValueAtTime(.0001,t+d*1.2);s.connect(ff);ff.connect(g);g.connect(out);s.start(t,Math.random()*.5);s.stop(t+d*1.3+.05);return}
// choc / explosion
if(f<125){const g1=nz(d*1.6,'lowpass',Math.max(300,f*9),.6,v*2.2,out,.55,.003);nz(.06,'bandpass',1800,.6,v*1.2,out,1,.001);th(f*1.5,d*1.3,v*1.6,out,'sine');th(f*.8,d*2,v*.9,out,'sine');if(wet)auSend(g1)}
else{nz(Math.max(.04,d*.7),'bandpass',Math.min(4000,f*5),.8,v*1.5,out,rnd(.85,1.1),.002);th(f*.9,d,v*.8,out,'triangle')}}
function sfx(f,d,v,type){try{AC=AC||new AudioContext();auInit();if(!AU.ready)return;sfxCore(f,d,v,type,AOUT(),1)}catch(e){}}
function sndAt(x,y,z,f,d,v,type,o){try{AC=AC||new AudioContext();auInit();if(!AU.ready)return;sfxCore(f,d,v,type,sp3(x,y,z,o),0)}catch(e){}}
// tir du joueur : claquement, corps, coup sourd, mécanique, queue (réverbération de l'environnement)
const GUNS=[{c:3400,b:900,th:120,d:.16,v:.5,m:.03},{c:3900,b:1300,th:150,d:.11,v:.42,m:.02},{c:3000,b:1000,th:135,d:.14,v:.5,m:.05},{c:1500,b:420,th:70,d:.34,v:.8,m:0},{c:2300,b:620,th:58,d:.5,v:.9,m:0}];
function sfxGun(i,sup){try{AC=AC||new AudioContext();auInit();if(!AU.ready)return;if(!sup){const m=SMW[i];if(m&&smpPlay(m[0],.85,m[1]*rnd(.97,1.03),null,1)){if(i===3)setTimeout(()=>smpPlay('cock',.6,.95,null,0),420);return}}const q=GUNS[i]||GUNS[0],o=AOUT(),t=AC.currentTime,pr=rnd(.94,1.06);
if(sup){nz(.05,'bandpass',1500*pr,.8,q.v*.5,o,1,.002);nz(.16,'lowpass',650,.6,q.v*.6,o,.7,.004);th(q.th*.8,.07,q.v*.3,o,'sine');nz(.02,'highpass',5200,.7,.16,o,1,.001);return}
nz(.022,'highpass',q.c*pr,.7,q.v*1.5,o,1,.0006);const g=nz(q.d,'bandpass',q.b*pr,.55,q.v*1.5,o,rnd(.9,1.1),.001);nz(q.d*2.2,'lowpass',q.b*.45,.5,q.v*.9,o,.6,.003);th(q.th*pr,q.d*.9,q.v*1.2,o,'sine');
auSend(g);const tl=nz(q.d*5.5,'lowpass',1500,.4,q.v*.35,o,.5,.03);auSend(tl);
if(q.m){const s=AC.createBufferSource(),ff=AC.createBiquadFilter(),gg=AC.createGain();s.buffer=AU.nb;ff.type='bandpass';ff.frequency.value=3200;ff.Q.value=2.5;gg.gain.setValueAtTime(.0001,t+q.m);gg.gain.linearRampToValueAtTime(.12,t+q.m+.002);gg.gain.exponentialRampToValueAtTime(.0001,t+q.m+.03);s.connect(ff);ff.connect(gg);gg.connect(o);s.start(t+q.m-.005,Math.random()*.5);s.stop(t+q.m+.06)}}catch(e){}}
// explosion spatialisée : détonation, souffle, grondement, débris
function sfxBoom(x,y,z,k){try{AC=AC||new AudioContext();auInit();if(!AU.ready)return;const o=sp3(x,y,z,{ref:34,roll:.7,ad:90,noocc:0});k=k||1;nz(.05,'highpass',2400,.6,1.3*k,o,1,.0008);const g=nz(.5*k,'lowpass',900,.5,1.6*k,o,.6,.002);nz(1.5*k,'lowpass',260,.6,1.2*k,o,.4,.01);th(75,.55*k,1.5*k,o,'sine');th(42,.9*k,1*k,o,'sine');auSend(g);
const t=AC.currentTime;for(let i=0;i<7;i++){const s=AC.createBufferSource(),ff=AC.createBiquadFilter(),gg=AC.createGain(),tt=t+.25+Math.random()*.9;s.buffer=AU.nb;ff.type='bandpass';ff.frequency.value=rnd(900,3800);ff.Q.value=3;gg.gain.setValueAtTime(.0001,tt);gg.gain.linearRampToValueAtTime(.12*k,tt+.003);gg.gain.exponentialRampToValueAtTime(.0001,tt+.05);s.connect(ff);ff.connect(gg);gg.connect(o);s.start(tt-.01,Math.random()*.5);s.stop(tt+.08)}}catch(e){}}
// ---- coups de feu des bots : craquement + bruit de culasse + coup sourd, avec écho/réverbération de l'environnement
const SHOT=[[2900,.07,.7,150,.1],[2000,.1,.8,105,.14],[1300,.22,1,70,.28],[1700,.13,.9,88,.18]];
function sfxShot(x,y,z,ty,vol){try{AC=AC||new AudioContext();auInit();const q=SHOT[ty]||SHOT[1],out=sp3(x,y,z,{ref:9,roll:.8,ad:60,air:16000});if(smpPlay(['smg','rifle','echo','rifle'][ty]||'rifle',.9*vol,rnd(.95,1.05),out,1))return;nz(.02,'highpass',q[0]*1.3,.7,q[2]*1.1*vol,out,1,.0008);const g_=nz(q[1],'bandpass',q[0]*.5,.6,q[2]*1.2*vol,out,rnd(.9,1.1),.001);nz(q[1]*2.6,'lowpass',q[0]*.3,.5,q[2]*.8*vol,out,.6,.003);th(q[3],q[4],.9*vol,out,'sine');nz(q[1]*5,'lowpass',1200,.4,q[2]*.25*vol,out,.5,.04)}catch(e){}}
// ---- bruits de pas selon la surface
const FST={grass:['bandpass',1250,.6,.09,.55,null],mud:['lowpass',520,.9,.17,.7,[90,.12,.35]],wood:['bandpass',420,1.3,.1,.55,[125,.1,.5]],conc:['bandpass',2300,1.1,.05,.5,[170,.05,.28]],stair:['bandpass',560,1.4,.12,.7,[150,.12,.55]],water:['lowpass',1900,.5,.3,.7,null],land:['lowpass',320,.8,.22,1.1,[80,.2,.7]],vault:['bandpass',900,.8,.2,.5,[110,.15,.5]]};
function surfKind(x,y,z,sup){if(wDep(x,z)>.05)return'water';if(sup&&sup.ramp)return'stair';const ri=inRoom(x,z);if(y>5.2)return'conc';if(ri>=0&&y<roofTop(x,z)+.5&&(y<2.95||y>2.8))return ROOMS[ri].bun?'conc':'wood';if(sup&&!sup.gl&&y>.2)return'conc';if(wDist(x,z)<1.6&&wDist(x,z)>-.3)return'mud';return'grass'}
function sfxFoot(x,y,z,kind,vol,bot){try{AC=AC||new AudioContext();auInit();let k=kind;if(k==='step')k=surfKind(x,y,z,bot?null:P.sup);const q=FST[k]||FST.grass,out=bot||k==='land'&&false?sp3(x,y+.1,z,{ref:2.4,roll:1.5,ad:18,air:9000}):(Math.hypot(x-C.position.x,z-C.position.z)<.5?AOUT():sp3(x,y+.1,z,{ref:2.4,roll:1.5,ad:18,air:9000,noocc:1}));
const g=nz(q[3],q[0],q[1]*rnd(.85,1.15),q[2],q[4]*vol*.5,out,rnd(.85,1.2));if(!bot||true)auSend(g);if(q[5])th(q[5][0]*rnd(.9,1.1),q[5][1],q[5][2]*vol*.5,out,'sine');if(k==='land'&&P.gy<2){}}catch(e){}}
// ---- pluie : nappe extérieure + crépitement sur les toits (sourd sous toit plat de béton)
function rainMix(rn,ind,y){try{AC=AC||new AudioContext();auInit();if(!AU.ready)return;if(!AU.rainOut){const mk=(hz,q,type)=>{const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=AU.nb;s.loop=true;f.type=type;f.frequency.value=hz;f.Q.value=q;g.gain.value=0;s.connect(f);f.connect(g);g.connect(AOUT());s.start();return g};
AU.rainOut=mk(3200,.35,'bandpass');AU.rainRoof=mk(1250,.9,'bandpass');AU.rainDeep=mk(240,.7,'lowpass');
// crépitement : modulation d'amplitude irrégulière
const lf=AC.createOscillator(),lg=AC.createGain();lf.type='square';lf.frequency.value=14;lg.gain.value=0;AU.lg=lg;lf.connect(lg);lg.connect(AU.rainRoof.gain);lf.start();AU.rl=lf}
const up=ind&&y>2.9,tr=[rn*(ind?.012:.17),ind?rn*(up?.2:.13):0,ind?rn*(up?.14:.07):0];for(let i=0;i<3;i++)AU.rg[i]+=(tr[i]-AU.rg[i])*.06;AU.rainOut.gain.value=AU.rg[0];AU.rainRoof.gain.value=AU.rg[1];AU.rainDeep.gain.value=AU.rg[2];if(AU.rl)AU.rl.frequency.value=10+rn*14+Math.sin(performance.now()*.003)*3;if(AU.lg)AU.lg.gain.value=AU.rg[1]*.8}catch(e){}}
function auUpdate(dt){if(!AC)return;auInit();if(!AU.ready)return;AU.occB=7;
const l=AC.listener,p=C.position;_la.set(0,0,-1).applyQuaternion(C.quaternion);_lb.set(0,1,0).applyQuaternion(C.quaternion);
if(l.positionX){l.positionX.value=p.x;l.positionY.value=p.y;l.positionZ.value=p.z;l.forwardX.value=_la.x;l.forwardY.value=_la.y;l.forwardZ.value=_la.z;l.upX.value=_lb.x;l.upY.value=_lb.y;l.upZ.value=_lb.z}else{l.setPosition(p.x,p.y,p.z);l.setOrientation(_la.x,_la.y,_la.z,_lb.x,_lb.y,_lb.z)}
const k=inRoom(p.x,p.z),ins=k>=0&&p.y<roofTop(p.x,p.z),bun=ins&&ROOMS[k].bun;AU.room=ins?k:-1;
const th_=[ins&&!bun?.5:0,bun?.62:0,ins?0:.075],ks=Math.min(1,dt*3);AU.wH.gain.value+=(th_[0]-AU.wH.gain.value)*ks;AU.wB.gain.value+=(th_[1]-AU.wB.gain.value)*ks;AU.wE.gain.value+=(th_[2]-AU.wE.gain.value)*ks;
// pas du joueur
if(P.gy!==undefined&&!ac.on&&P.hp>0){const mv=Math.hypot(P.x-AU.sx,P.z-AU.sz);AU.sx=P.x;AU.sz=P.z;if(!P.air&&!P.mant&&mv<1.2&&mv>0){AU.ft=(AU.ft||0)+mv;const sp=K.ShiftLeft&&P.st===0,str=[sp?2.7:2.05,1.5,1.05][P.st];if(AU.ft>=str){AU.ft=0;const vol=[sp?1:.62,.22,.1][P.st]*(P.sup&&P.sup.ramp?1.2:1);sfxFoot(P.x,P.gy,P.z,'step',vol);noise(P.x,P.z,[sp?13:7,2.8,1.1][P.st])}}}
// pas des bots proches
for(const b of bots){const g=b.g.position;if(b.dead>0){b.px=undefined;continue}if(b.px===undefined){b.px=g.x;b.pz=g.z;b.sa=0;continue}const mv=Math.hypot(g.x-b.px,g.z-b.pz);b.px=g.x;b.pz=g.z;if(mv>.6||mv<1e-4)continue;const d=Math.hypot(g.x-p.x,g.z-p.z);if(d>38)continue;b.sa+=mv;const str=b.spK>1.6?2.5:1.9;if(b.sa>=str){b.sa=0;sfxFoot(g.x,b.fy!==undefined?b.fy:g.y,g.z,surfKind(g.x,b.fy||0,g.z,null),(b.cr?.25:b.spK>1.6?.9:.55)*(b.ty===3?1.3:1),1)}}}
// ---- diagnostic audio (F9) : niveaux des couches d'ambiance, énergie du signal, coupure couche par couche
const AD={on:0,m:{},t:0,an:null,el:null};
addEventListener('keydown',e=>{if(e.code==='F9'&&!e.repeat){e.preventDefault();AD.on=!AD.on;if(!AD.el){AD.el=document.createElement('div');AD.el.style.cssText='position:fixed;left:10px;top:60px;z-index:40;background:rgba(0,0,0,.82);color:#dfe8d4;font:12px monospace;padding:8px 10px;border:1px solid #3d5230;line-height:1.5';document.body.appendChild(AD.el)}AD.el.style.display=AD.on?'block':'none'}});
function adUpdate(dt){if(!AD.on||!AC||!AU.ready||typeof AMST==='undefined'||!AMST)return;
const M=AD.m,z=(n,g)=>{if(g)g.gain.value=0};
if(M.rain){z(0,AU.rainOut);z(0,AU.rainRoof);z(0,AU.rainDeep);if(typeof rainG!=='undefined')z(0,rainG);if(AU.lg)AU.lg.gain.value=0}if(M.eau&&FA.amb)FA.amb.gain.value=0;if(M.vent)z(0,AU.wE);if(M.reverb){z(0,AU.wH);z(0,AU.wB)}
AD.t+=dt;if(AD.t<.25)return;AD.t=0;if(!AD.an){AD.an=AC.createAnalyser();AD.an.fftSize=2048;AMST.connect(AD.an)}
const d=new Uint8Array(2048);AD.an.getByteTimeDomainData(d);let s=0;for(const v of d){const x=(v-128)/128;s+=x*x}const f=x=>x===undefined||x===null?'-':(+x).toFixed(3),g=n=>n?n.gain.value:undefined;
const b=(k,l)=>'<span data-k="'+k+'" style="cursor:pointer;color:'+(M[k]?'#e86a5a':'#c8f07a')+'">['+(M[k]?'coupé':'actif')+'] '+l+'</span>';
AD.el.innerHTML='<b>AUDIO (F9)</b> · énergie '+f(Math.sqrt(s/2048))+' · état '+AC.state+'<br>'+b('rain','pluie')+' '+f(g(AU.rainOut))+' / '+f(g(AU.rainRoof))+' / '+f(g(AU.rainDeep))+'<br>'+b('eau','eau')+' '+f(FA.amb&&FA.amb.gain.value)+'<br>'+b('vent','vent/écho ext.')+' '+f(g(AU.wE))+'<br>'+b('reverb','réverbération')+' '+f(g(AU.wH))+' / '+f(g(AU.wB))+'<br>maître '+f(g(AMST))+'<br><small>clic sur une ligne pour couper la couche</small>';
AD.el.querySelectorAll('[data-k]').forEach(n=>n.onclick=()=>{AD.m[n.dataset.k]=!AD.m[n.dataset.k]})}
