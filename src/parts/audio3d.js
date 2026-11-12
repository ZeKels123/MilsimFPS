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
function sndAt(x,y,z,f,d,v,type,o){try{AC=AC||new AudioContext();auInit();const t=AC.currentTime,os=AC.createOscillator(),g=AC.createGain();os.type=type||'sawtooth';os.frequency.setValueAtTime(f,t);os.frequency.exponentialRampToValueAtTime(40,t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);os.connect(g);g.connect(sp3(x,y,z,o));os.start(t);os.stop(t+d+.05)}catch(e){}}
function nz(dur,type,hz,q,vol,out,rate,att){const t=AC.currentTime,s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=AU.nb;s.playbackRate.value=rate||1;f.type=type;f.frequency.value=hz;f.Q.value=q;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+(att||.004));g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(f);f.connect(g);g.connect(out);s.start(t,Math.random()*.5);s.stop(t+dur+.05);return g}
function th(freq,dur,vol,out,type){const t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type=type||'sine';o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(Math.max(30,freq*.45),t+dur);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(out);o.start(t);o.stop(t+dur+.03)}
// ---- coups de feu des bots : craquement + bruit de culasse + coup sourd, avec écho/réverbération de l'environnement
const SHOT=[[2900,.07,.7,150,.1],[2000,.1,.8,105,.14],[1300,.22,1,70,.28],[1700,.13,.9,88,.18]];
function sfxShot(x,y,z,ty,vol){try{AC=AC||new AudioContext();auInit();const q=SHOT[ty]||SHOT[1],out=sp3(x,y,z,{ref:9,roll:.8,ad:60,air:16000});nz(q[1],'bandpass',q[0],.7,q[2]*vol,out,rnd(.9,1.1));nz(q[1]*1.8,'lowpass',q[0]*.35,.5,q[2]*.8*vol,out,.6);th(q[3],q[4],.8*vol,out,'triangle')}catch(e){}}
// ---- bruits de pas selon la surface
const FST={grass:['bandpass',1250,.6,.09,.55,null],mud:['lowpass',520,.9,.17,.7,[90,.12,.35]],wood:['bandpass',420,1.3,.1,.55,[125,.1,.5]],conc:['bandpass',2300,1.1,.05,.5,[170,.05,.28]],stair:['bandpass',560,1.4,.12,.7,[150,.12,.55]],water:['lowpass',1900,.5,.3,.7,null],land:['lowpass',320,.8,.22,1.1,[80,.2,.7]],vault:['bandpass',900,.8,.2,.5,[110,.15,.5]]};
function surfKind(x,y,z,sup){if(wDep(x,z)>.05)return'water';if(sup&&sup.ramp)return'stair';const ri=inRoom(x,z);if(y>5.2)return'conc';if(ri>=0&&y<roofTop(x,z)+.5&&(y<2.95||y>2.8))return ROOMS[ri].bun?'conc':'wood';if(sup&&!sup.gl&&y>.2)return'conc';if(wDist(x,z)<1.6&&wDist(x,z)>-.3)return'mud';return'grass'}
function sfxFoot(x,y,z,kind,vol,bot){try{AC=AC||new AudioContext();auInit();let k=kind;if(k==='step')k=surfKind(x,y,z,bot?null:P.sup);const q=FST[k]||FST.grass,out=bot||k==='land'&&false?sp3(x,y+.1,z,{ref:2.4,roll:1.5,ad:18,air:9000}):(Math.hypot(x-C.position.x,z-C.position.z)<.5?AOUT():sp3(x,y+.1,z,{ref:2.4,roll:1.5,ad:18,air:9000,noocc:1}));
const g=nz(q[3],q[0],q[1]*rnd(.85,1.15),q[2],q[4]*vol*.5,out,rnd(.85,1.2));if(!bot||true)auSend(g);if(q[5])th(q[5][0]*rnd(.9,1.1),q[5][1],q[5][2]*vol*.5,out,'sine');if(k==='land'&&P.gy<2){}}catch(e){}}
// ---- pluie : nappe extérieure + crépitement sur les toits (sourd sous toit plat de béton)
function rainMix(rn,ind,y){try{AC=AC||new AudioContext();auInit();if(!AU.ready)return;if(!AU.rainOut){const mk=(hz,q,type)=>{const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=AU.nb;s.loop=true;f.type=type;f.frequency.value=hz;f.Q.value=q;g.gain.value=0;s.connect(f);f.connect(g);g.connect(AOUT());s.start();return g};
AU.rainOut=mk(3200,.35,'bandpass');AU.rainRoof=mk(1250,.9,'bandpass');AU.rainDeep=mk(240,.7,'lowpass');
// crépitement : modulation d'amplitude irrégulière
const lf=AC.createOscillator(),lg=AC.createGain();lf.type='square';lf.frequency.value=14;lg.gain.value=.5;lf.connect(lg);lg.connect(AU.rainRoof.gain);lf.start();AU.rl=lf}
const up=ind&&y>2.9,tr=[rn*(ind?.012:.17),ind?rn*(up?.2:.13):0,ind?rn*(up?.14:.07):0];for(let i=0;i<3;i++)AU.rg[i]+=(tr[i]-AU.rg[i])*.06;AU.rainOut.gain.value=AU.rg[0];AU.rainRoof.gain.value=AU.rg[1];AU.rainDeep.gain.value=AU.rg[2];if(AU.rl)AU.rl.frequency.value=10+rn*14+Math.sin(performance.now()*.003)*3}catch(e){}}
function auUpdate(dt){if(!AC)return;auInit();if(!AU.ready)return;AU.occB=7;
const l=AC.listener,p=C.position;_la.set(0,0,-1).applyQuaternion(C.quaternion);_lb.set(0,1,0).applyQuaternion(C.quaternion);
if(l.positionX){l.positionX.value=p.x;l.positionY.value=p.y;l.positionZ.value=p.z;l.forwardX.value=_la.x;l.forwardY.value=_la.y;l.forwardZ.value=_la.z;l.upX.value=_lb.x;l.upY.value=_lb.y;l.upZ.value=_lb.z}else{l.setPosition(p.x,p.y,p.z);l.setOrientation(_la.x,_la.y,_la.z,_lb.x,_lb.y,_lb.z)}
const k=inRoom(p.x,p.z),ins=k>=0&&p.y<roofTop(p.x,p.z),bun=ins&&ROOMS[k].bun;AU.room=ins?k:-1;
const th_=[ins&&!bun?.5:0,bun?.62:0,ins?0:.075],ks=Math.min(1,dt*3);AU.wH.gain.value+=(th_[0]-AU.wH.gain.value)*ks;AU.wB.gain.value+=(th_[1]-AU.wB.gain.value)*ks;AU.wE.gain.value+=(th_[2]-AU.wE.gain.value)*ks;
// pas du joueur
if(P.gy!==undefined&&!ac.on&&P.hp>0){const mv=Math.hypot(P.x-AU.sx,P.z-AU.sz);AU.sx=P.x;AU.sz=P.z;if(!P.air&&!P.mant&&mv<1.2&&mv>0){AU.ft=(AU.ft||0)+mv;const sp=K.ShiftLeft&&P.st===0,str=[sp?2.7:2.05,1.5,1.05][P.st];if(AU.ft>=str){AU.ft=0;const vol=[sp?1:.62,.22,.1][P.st]*(P.sup&&P.sup.ramp?1.2:1);sfxFoot(P.x,P.gy,P.z,'step',vol);noise(P.x,P.z,[sp?13:7,2.8,1.1][P.st])}}}
// pas des bots proches
for(const b of bots){const g=b.g.position;if(b.dead>0){b.px=undefined;continue}if(b.px===undefined){b.px=g.x;b.pz=g.z;b.sa=0;continue}const mv=Math.hypot(g.x-b.px,g.z-b.pz);b.px=g.x;b.pz=g.z;if(mv>.6||mv<1e-4)continue;const d=Math.hypot(g.x-p.x,g.z-p.z);if(d>38)continue;b.sa+=mv;const str=b.spK>1.6?2.5:1.9;if(b.sa>=str){b.sa=0;sfxFoot(g.x,b.fy!==undefined?b.fy:g.y,g.z,surfKind(g.x,b.fy||0,g.z,null),(b.cr?.25:b.spK>1.6?.9:.55)*(b.ty===3?1.3:1),1)}}}
