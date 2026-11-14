// ================= v7 : SANTÉ PAR ZONE (joueur et bots) =================
// 7 zones : tête, thorax, ventre, bras gauche/droit, jambe gauche/droite.
// Les impacts sont calculés par la géométrie : rayon de la balle contre les volumes du corps, couvert compris.
const HZ=['h','t','a','la','ra','ll','rl'],HZN={h:'Tête',t:'Thorax',a:'Ventre',la:'Bras gauche',ra:'Bras droit',ll:'Jambe gauche',rl:'Jambe droite'},HMAX={h:35,t:85,a:70,la:60,ra:60,ll:65,rl:65},
HINV0={bd:3,tq:1,sp:2,mo:2,kit:1},HINV={bd:'bandage',tq:'garrot',sp:'attelle',mo:'morphine',kit:'trousse'};
const HM={z:{},bl:100,bd:{},fx:{},tq:{},pain:0,mor:0,hl:30,sta:1,exh:0,act:null,inv:{},dead:0,why:'',conc:0,fl:{},hurtK:0,hurtS:1,clin:0,msgT:0,fs:'',hudT:0,last:''};
const hlLimb=z=>z==='la'||z==='ra'||z==='ll'||z==='rl';
function hlReset(){HM.z={};HZ.forEach(z=>HM.z[z]=HMAX[z]);HM.bl=100;HM.bd={};HM.fx={};HM.tq={};HM.pain=0;HM.mor=0;HM.hl=30;HM.sta=1;HM.exh=0;HM.act=null;HM.inv=Object.assign({},HINV0);HM.dead=0;HM.conc=0;HM.fl={};HM.hurtK=0;HM.clin=0;P.hp=100}
// niveau d'une zone : 0 saine, 1 blessée (moins de la moitié des PV), 2 brisée (0 PV, fracture ou garrot)
function hlLvl(z){const hp=HM.z[z];if(!hlLimb(z))return hp<=0?2:hp<HMAX[z]*.5?1:0;if(hp<=0||HM.fx[z]||HM.tq[z])return 2;return hp<HMAX[z]*.5?1:0}
// ---- volumes du corps du joueur : capsules [zone, r,y,f (extrémité A), r,y,f (extrémité B), rayon], axes : r droite, y haut, f avant
const HB_=[
[['h',0,1.58,0,0,1.66,0,.12],['t',0,1.12,0,0,1.4,0,.21],['a',0,.86,0,0,1.0,0,.19],['la',-.31,1.36,.03,-.32,.92,.08,.07],['ra',.31,1.36,.03,.32,.92,.08,.07],['ll',-.1,.12,0,-.11,.8,0,.1],['rl',.1,.12,0,.11,.8,0,.1]],
[['h',0,.98,.1,0,1.06,.1,.12],['t',0,.68,.05,0,.92,.08,.21],['a',0,.46,0,0,.58,.02,.19],['la',-.31,.88,.1,-.31,.6,.18,.07],['ra',.31,.88,.1,.31,.6,.18,.07],['ll',-.12,.1,.05,-.12,.5,0,.1],['rl',.12,.1,.05,.12,.5,0,.1]],
[['h',0,.2,.5,0,.2,.56,.11],['t',0,.2,.12,0,.2,.4,.2],['a',0,.18,-.08,0,.18,.04,.18],['la',-.27,.15,.2,-.27,.15,.55,.07],['ra',.27,.15,.2,.27,.15,.55,.07],['ll',-.1,.12,-.82,-.1,.12,-.15,.1],['rl',.1,.12,-.82,.1,.12,-.15,.1]]];
const _ha=new THREE.Vector3(),_hb=new THREE.Vector3(),_hv=new THREE.Vector3(),_hw=new THREE.Vector3();
function hlCap(o,d,a,b,r){_hv.subVectors(b,a);_hw.subVectors(o,a);const bb=d.dot(_hv),cc=_hv.dot(_hv),D=d.dot(_hw),E=_hv.dot(_hw),den=cc-bb*bb;let s=den<1e-6?0:(E-D*bb)/den;s=Math.max(0,Math.min(1,s));const t=s*bb-D;if(t<0)return -1;
const px=_hw.x+d.x*t-_hv.x*s,py=_hw.y+d.y*t-_hv.y*s,pz=_hw.z+d.z*t-_hv.z*s,q=px*px+py*py+pz*pz;if(q>r*r)return -1;return Math.max(0,t-Math.sqrt(r*r-q))}
// rayon contre le joueur : renvoie {z,t} de la zone touchée en premier (ou null)
function hlRay(o,d,far){if(P.gy===undefined)return null;const st=Math.min(2,P.st||0),sn=Math.sin(P.yaw),cs=Math.cos(P.yaw),fx=-sn,fz=-cs,rx=cs,rz=-sn,ln=st===0?(P.lean||0)*.25:0;let best=null,bt=far;
for(const c of HB_[st]){const up=c[2]>.9&&st===0?ln:0;_ha.set(P.x+c[1]*rx+c[3]*fx+up*rx,P.gy+c[2],P.z+c[1]*rz+c[3]*fz+up*rz);_hb.set(P.x+c[4]*rx+c[6]*fx+up*rx,P.gy+c[5],P.z+c[4]*rz+c[6]*fz+up*rz);const t=hlCap(o,d,_ha,_hb,c[7]);if(t>=0&&t<bt){bt=t;best={z:c[0],t}}}
return best}
function hlMsg(t){const e=$('hmsg');if(!e)return;e.textContent=t;e.style.opacity=1;HM.msgT=2}
// ---- application d'un dégât à une zone du joueur
function hlApply(z,d,k,src){if(HM.dead||ac.on||d<=0)return;
if(z==='h'){d*=k==='b'?1.8:1.3;if(HM.hl>0){const ab=Math.min(HM.hl,d*.7);HM.hl-=ab;d-=ab;snd(1900,.04,.1,'square')}}
if((z==='t'||z==='a')&&k!=='o'&&P.ar>0){const ab=Math.min(P.ar,d);P.ar-=ab;d-=ab;if(P.ar<=0)crack();d+=ab*.06}
HM.fl[z]=.6;HM.hurtK=1;HM.hurtS=z==='la'||z==='ll'?-1:1;
if(d>0){let hp=HM.z[z];if(hp<=0&&hlLimb(z)){HM.z.t-=d*.35;HM.fl.t=.6;d=0}else HM.z[z]=Math.max(0,hp-d);
if(d>=4)HM.bd[z]=Math.max(HM.bd[z]||0,d>=18?2:1);
if(hlLimb(z)&&k!=='o'&&(d>=20||HM.z[z]<=0)&&!HM.fx[z]){HM.fx[z]=1;hlMsg('Fracture : '+HZN[z])}
HM.pain=Math.min(1,HM.pain+d*.02);if(z==='h'){HM.conc=Math.max(HM.conc,Math.min(4,d*.12));stunPlayer(Math.min(.5,d*.015),Math.min(2.5,d*.08))}}
if(src)dmgDir(src.x,src.z);const f=Math.min(.05,d*.003);P.pitch+=(Math.random()-.5)*f*2;P.yaw+=(Math.random()-.5)*f*2;
$('dmg').style.opacity=1;setTimeout(()=>$('dmg').style.opacity=0,200);snd(rnd(90,140),.1,.18,'sawtooth');
hlCheck()}
function hlCheck(){if(HM.dead)return;if(HM.z.h<=0)hlDie('Tête');else if(HM.z.t<=0)hlDie('Thorax');else if(HM.bl<=0)hlDie('Hémorragie')}
function hlDie(w){HM.dead=1;HM.why=w;HM.last=w;P.hp=0}
function hlHurt(d,k,o){if(k==='f')hlFall(o||9);else hlApply('t',d,'x',null)}
function hlFall(v){const d=Math.max(0,(v-6)*6);if(d<=0)return;hlApply('ll',d,'f');hlApply('rl',d,'f')}
// ---- balle d'un bot : le point visé est le centre du torse, l'écart suit la précision du bot (loi normale), puis le rayon décide
function gauss(){let u=0;for(let i=0;i<4;i++)u+=Math.random();return(u-2)*1.73}
function hlBullet(V,A,p,dmg,b){balBot(V,A,p,dmg,b);return false}
// ---- éclats de grenade sur le joueur : rayons répartis sur la surface du corps, bloqués par les murs
function hlBlastPlayer(E,R,n){if(HM.dead||ac.on)return;const tx=P.x,tz=P.z,d=Math.hypot(tx-E.x,P.gy+P.eh*.5-E.y,tz-E.z);if(d>R)return;const k=1-d/R,nf=Math.min(16,Math.round(80/Math.max(1,d*d)));let hit=0;
for(let i=0;i<nf;i++){const hh=.1+((i*.618034)%1)*(P.eh-.1),ll=(((i*.754877)%1)-.5)*.5,sn=Math.sin(P.yaw),cs=Math.cos(P.yaw);_hv.set(tx+cs*ll-E.x,P.gy+hh-E.y,tz-sn*ll-E.z);const L=_hv.length()||1;_hv.multiplyScalar(1/L);const dir=_hv.clone(),hr=hlRay(E,dir,L+.6);if(!hr)continue;
RC.set(E,dir);RC.far=hr.t;const w=RC.intersectObjects(ray).find(q=>!q.object.userData.glass);if(w)continue;hit++;hlApply(hr.z,22*Math.pow(k,.9),'g',null)}
const blocked=!nadeLOS(n,tx,P.gy+P.eh*.5,tz),ov=blocked?0:60*Math.pow(k,1.5);if(ov>3){const w={h:.15,t:.35,a:.3,ll:.1,rl:.1};for(const z in w)hlApply(z,ov*w[z],'o',null);if(ov>25){['ll','rl'].forEach(z=>{if(!HM.fx[z]){HM.fx[z]=1;hlMsg('Fracture : '+HZN[z])}})}}
dmgDir(E.x,E.z);return hit}
// ---- multiplicateurs d'effets
function hlLegs(){return(hlLvl('ll')===2?1:0)+(hlLvl('rl')===2?1:0)}
function HMV(){let p=0;['ll','rl'].forEach(z=>{const l=hlLvl(z);p+=l===1?.12:l===2?(HM.mor>0?.3:.45):0});if(HM.z.a<HMAX.a*.5)p+=.1;let m=Math.max(.22,1-p);if(HM.pain>.6&&HM.mor<=0)m*=.9;if(HM.bl<40)m*=.8;if(HM.act)m*=.6;return m*invSpdK(K.ShiftLeft&&!ads&&P.st===0)*trapSpdK()}
function HSPR(){return !HM.exh&&hlLegs()===0&&!HM.act&&HM.bl>35}
function HJMP(){return hlLegs()===0&&HM.z.a>0}
function hlRa(){return hlLvl('ra')}function hlLa(){return hlLvl('la')}
function HAIM(){const pn=HM.mor>0?HM.pain*.15:HM.pain;return[1,1.35,3][hlRa()]*[1,1.2,1.8][hlLa()]*(1+pn*.5)*(HM.bl<50?1.25:1)*(HM.sta<.2?1.3:1)}
function HKCK(){return 1+[0,.25,.6][hlRa()]}
function HRLD(){return[1,1.25,2.2][hlRa()]*[1,1.15,1.5][hlLa()]}
function HADS(){return[1,.7,.4][hlLa()]}
function HNOADS(){return KNF.on||(hlRa()===2&&WSEL!==2)||(hlLa()===2&&(WSEL===3||WSEL===4))}
function hlTremor(){const pn=HM.mor>0?HM.pain*.15:HM.pain;return Math.min(1.4,pn*.6+(HM.bl<60?(60-HM.bl)/60*.8:0)+[0,.12,.35][hlRa()]+(HM.sta<.25?(.25-HM.sta)*2:0))}
function hlCam(dt){if(ac.on||HM.dead||P.hp<=0)return;const t=performance.now()*.001,tr=hlTremor();if(tr>.02){C.rotation.x+=(Math.sin(t*9.1)*.004+Math.sin(t*23.3)*.002)*tr;C.rotation.y+=(Math.sin(t*7.7+1)*.004+Math.sin(t*19.1)*.002)*tr}
if(HM.hurtK>0){C.rotation.z+=HM.hurtS*HM.hurtK*.07;HM.hurtK=Math.max(0,HM.hurtK-dt*4)}if(HM.bl<35)C.rotation.z+=Math.sin(t*1.3)*.03*(1-HM.bl/35)}
function hlKill(head){const k=P.kills;if(k%3===0)HM.inv.bd=Math.min(5,HM.inv.bd+1);if(k%5===0)HM.inv.mo=Math.min(3,HM.inv.mo+1);HM.pain*=.6;HM.sta=Math.min(1,HM.sta+.25);snd(620,.18,.14,'sine');$('hpb').style.boxShadow='0 0 12px #9ccc4e';setTimeout(()=>$('hpb').style.boxShadow='none',350)}
// ---- soins
function hlUse(k){if(HM.dead||HM.act||ac.on||bench||P.mant)return;const inv=HM.inv;
if(k==='bd'){const zs=HZ.filter(z=>HM.bd[z]>0);if(!zs.length)return hlMsg('Aucun saignement');if(inv.bd<1)return hlMsg('Plus de bandages');zs.sort((a,b)=>HM.bd[b]-HM.bd[a]);HM.act={k,z:zs[0],t:0,T:3.2}}
else if(k==='tq'){const rm=HZ.find(z=>HM.tq[z]);const zs=['la','ra','ll','rl'].filter(z=>HM.bd[z]===2&&!HM.tq[z]);if(zs.length){if(inv.tq<1)return hlMsg('Plus de garrots');HM.act={k,z:zs[0],t:0,T:2.5}}else if(rm)HM.act={k:'tqo',z:rm,t:0,T:1.5};else return hlMsg('Pas de saignement fort sur un membre')}
else if(k==='sp'){const z=['ll','rl','la','ra'].find(q=>HM.fx[q]);if(!z)return hlMsg('Aucune fracture');if(inv.sp<1)return hlMsg('Plus d’attelles');HM.act={k,z,t:0,T:5}}
else if(k==='mo'){if(inv.mo<1)return hlMsg('Plus de morphine');if(HM.mor>5)return hlMsg('Morphine déjà active');HM.act={k,t:0,T:1.2}}
else if(k==='kit'){if(inv.kit<1)return hlMsg('Plus de trousse');if(!HZ.some(z=>HM.z[z]<HMAX[z])&&!Object.keys(HM.bd).some(z=>HM.bd[z]))return hlMsg('En bonne santé');HM.act={k,t:0,T:7}}
snd(240,.12,.12,'triangle')}
function hlDone(a){const k=a.k,inv=HM.inv;
if(k==='bd'){inv.bd--;HM.bd[a.z]=HM.bd[a.z]===2?1:0;if(!HM.bd[a.z])delete HM.bd[a.z]}
else if(k==='tq'){inv.tq--;HM.tq[a.z]=1;delete HM.bd[a.z]}else if(k==='tqo'){delete HM.tq[a.z];inv.tq++}
else if(k==='sp'){inv.sp--;delete HM.fx[a.z];if(HM.z[a.z]<=0)HM.z[a.z]=HMAX[a.z]*.25}
else if(k==='mo'){inv.mo--;HM.mor=40}
else if(k==='kit'){inv.kit--;for(const z of HZ)if(!HM.tq[z])delete HM.bd[z];let b=45;for(const z of HZ.slice().sort((p,q)=>HM.z[p]/HMAX[p]-HM.z[q]/HMAX[q])){const m=Math.min(b,HMAX[z]-HM.z[z]);if(m>0){HM.z[z]+=m;b-=m}}}
snd(520,.1,.12,'sine')}
addEventListener('keydown',e=>{if(e.repeat||$('ov').style.display!=='none'||ac.on||bench)return;const m={KeyJ:'bd',KeyY:'tq',KeyI:'sp',Comma:'mo',Period:'kit'}[e.code];if(m)hlUse(m)});
// ---- mise à jour de chaque image
function hlUpdate(dt){if(P.gy===undefined)return;if(HM.z.t===undefined)hlReset();
if(HM.msgT>0){HM.msgT-=dt;if(HM.msgT<=0&&$('hmsg'))$('hmsg').style.opacity=0}
if(HM.dead||P.hp<=0){HM.act=null;return}
const inz=inZ(P.x,P.z);
// saignements
let bl=0;for(const z of HZ){if(HM.tq[z])continue;const l=HM.bd[z];if(l)bl+=l===2?1.5:.35}if(HM.z.a<=0)bl+=3.2;
if(bl>0)HM.bl-=bl*dt;
// douleur et morphine
let base=0;for(const z of HZ){const l=hlLvl(z);base+=l===1?.06:l===2?.2:0}HM.pain=Math.max(Math.min(1,base),HM.pain-dt*.05);if(HM.mor>0)HM.mor-=dt;
if(HM.conc>0)HM.conc=Math.max(0,HM.conc-dt);
// endurance
const mv=K.KeyW||K.KeyA||K.KeyS||K.KeyD,spr=K.ShiftLeft&&mv&&P.st===0&&HSPR()&&invSprintOK();const dis=(HM.z.t<HMAX.t*.5||HM.z.a<HMAX.a*.5)?1.8:1;
if(spr)HM.sta=Math.max(0,HM.sta-dt*.1*dis*(1+Math.max(0,invLoad()-.5)*1.4));else HM.sta=Math.min(1,HM.sta+dt*.22/dis*(HM.pain>.6&&HM.mor<=0?.7:1));if(HM.sta<=0)HM.exh=1;else if(HM.exh&&HM.sta>.3)HM.exh=0;
// jambes brisées : on ne peut plus que ramper
if(hlLegs()===2&&P.st<2&&!P.mant)P.st=2;if(hlLegs()>=1&&P.vy>0&&P.air&&!HJMP())P.vy=0;
// soins en cours
if(HM.act){const a=HM.act;if(mdown&&a.t>.2||K.ShiftLeft&&mv){HM.act=null}else{a.t+=dt;if(a.t>=a.T){HM.act=null;hlDone(a)}}}
// infirmerie : la zone sûre soigne et réapprovisionne
if(inz){HM.clin+=dt;for(const z of HZ)HM.z[z]=Math.min(HMAX[z],HM.z[z]+8*dt);HM.bl=Math.min(100,HM.bl+10*dt);if(HM.clin>1.5){HM.bd={};HM.tq={}}if(HM.clin>3)HM.fx={};HM.pain=Math.max(0,HM.pain-dt*.4);HM.hl=Math.min(30,HM.hl+dt*3);
HM.rest=(HM.rest||0)+dt;if(HM.rest>5){HM.rest=0;for(const k in HINV0)if(HM.inv[k]<HINV0[k]){HM.inv[k]++;break}}}else HM.clin=0;
hlCheck();if(HM.dead)return;
// PV affichés = moyenne des zones
let s=0,m=0;for(const z of HZ){s+=HM.z[z];m+=HMAX[z]}P.hp=Math.max(1,100*s/m);
// effets d'écran
const fx=$('hfx');if(fx){const pn=HM.mor>0?HM.pain*.15:HM.pain,o=Math.min(.95,Math.max(0,(55-HM.bl)/55)*.9+pn*.35+HM.conc*.12);fx.style.opacity=o.toFixed(2)}
if(!ac.on){const f=HM.conc>0.2?'blur('+Math.min(3,HM.conc*.8).toFixed(1)+'px) saturate('+(1-Math.min(.5,HM.conc*.12)).toFixed(2)+')':(HM.bl<45?'saturate('+(.45+HM.bl/80).toFixed(2)+')':'');if(f!==HM.fs){HM.fs=f;R.domElement.style.filter=f||'none'}}
HM.hudT-=dt;for(const z in HM.fl)if(HM.fl[z]>0)HM.fl[z]-=dt;if(HM.hudT<=0){HM.hudT=.1;hlHud()}}
// ---- affichage : silhouette colorée, sang, objets
let HC=null;
function hlHudInit(){const st=document.createElement('style');st.textContent='#hhud{position:fixed;left:14px;bottom:84px;z-index:6;pointer-events:none;font:11px/1.35 monospace;color:#dfe8d0;text-shadow:0 0 3px #000;display:flex;gap:8px;align-items:flex-end}#hhud canvas{background:rgba(10,14,8,.55);border:1px solid #3a4430}#hfx{position:fixed;inset:0;pointer-events:none;z-index:4;opacity:0;background:radial-gradient(ellipse at center,rgba(0,0,0,0) 38%,rgba(95,0,0,.88) 100%)}#hmsg{position:fixed;left:50%;bottom:150px;transform:translateX(-50%);z-index:6;pointer-events:none;font:15px monospace;color:#fff;background:rgba(0,0,0,.55);padding:4px 12px;opacity:0;transition:opacity .3s}#hact{position:fixed;left:50%;bottom:110px;transform:translateX(-50%);z-index:6;pointer-events:none;font:14px monospace;color:#cfe8a8;text-shadow:0 0 3px #000}';document.head.appendChild(st);
const w=document.createElement('div');w.id='hhud';w.innerHTML='<canvas id="hcv" width="84" height="164"></canvas><div id="htx"></div>';document.body.appendChild(w);
const f=document.createElement('div');f.id='hfx';document.body.appendChild(f);const m=document.createElement('div');m.id='hmsg';document.body.appendChild(m);const a=document.createElement('div');a.id='hact';document.body.appendChild(a);HC=$('hcv').getContext('2d')}
function hlHud(){if(!HC){hlHudInit()}const vis=$('ov').style.display==='none'?'flex':'none';if($('hhud').style.display!==vis)$('hhud').style.display=vis;const c=HC,t=performance.now()*.001;c.clearRect(0,0,84,164);
const col=z=>{const l=hlLvl(z),r=HM.z[z]/HMAX[z];if(HM.tq[z])return'#7a3030';if(HM.z[z]<=0)return'#2a2a2a';return r>.66?'#6fbf5a':r>.33?'#e6c04a':'#e8843a'};
const R_={h:[42,14,10,10,1],t:[28,28,28,34],a:[30,62,24,20],la:[8,30,14,44],ra:[62,30,14,44],ll:[28,84,12,60],rl:[44,84,12,60]};
for(const z of HZ){const q=R_[z];c.fillStyle=col(z);if(z==='h'){c.beginPath();c.arc(q[0],q[1],q[2],0,7);c.fill()}else c.fillRect(q[0],q[1],q[2],q[3]);
if(HM.fl[z]>0){c.strokeStyle='rgba(255,255,255,'+Math.min(1,HM.fl[z]*2)+')';c.lineWidth=2;if(z==='h'){c.beginPath();c.arc(q[0],q[1],q[2]+1,0,7);c.stroke()}else c.strokeRect(q[0]-1,q[1]-1,q[2]+2,q[3]+2)}
const cx=z==='h'?q[0]:q[0]+q[2]/2,cy=z==='h'?q[1]:q[1]+q[3]/2;
if(HM.bd[z]&&!HM.tq[z]){c.fillStyle=HM.bd[z]===2&&Math.sin(t*10)>0?'#ff2a2a':'#b01818';c.beginPath();c.arc(cx,cy,HM.bd[z]===2?5:3,0,7);c.fill()}
if(HM.fx[z]){c.strokeStyle='#fff';c.lineWidth=2;c.beginPath();c.moveTo(cx-5,cy-5);c.lineTo(cx+5,cy+5);c.moveTo(cx+5,cy-5);c.lineTo(cx-5,cy+5);c.stroke()}
if(HM.tq[z]){c.strokeStyle='#ff6a6a';c.lineWidth=3;c.beginPath();c.moveTo(q[0]-1,q[1]+8);c.lineTo(q[0]+q[2]+1,q[1]+8);c.stroke()}}
c.fillStyle='#8ab';c.fillRect(2,150,Math.max(0,P.ar/150*80),3);c.fillStyle='#c55';c.fillRect(2,156,Math.max(0,HM.bl)/100*80,4);
const i=HM.inv;let h='SANG '+Math.max(0,Math.round(HM.bl))+'%'+(HM.mor>0?'<br>morphine '+Math.ceil(HM.mor)+' s':'')+(HM.hl>0?'<br>casque '+Math.round(HM.hl/30*100)+'%':'<br>sans casque')+'<br>endurance '+Math.round(HM.sta*100)+'%<br><br>[J] bandage '+i.bd+'<br>[Y] garrot '+i.tq+'<br>[I] attelle '+i.sp+'<br>[,] morphine '+i.mo+'<br>[.] trousse '+i.kit;$('htx').innerHTML=h;
const a=$('hact');if(a)a.textContent=HM.act?(({bd:'Bandage',tq:'Pose du garrot',tqo:'Retrait du garrot',sp:'Attelle',mo:'Morphine',kit:'Trousse'})[HM.act.k]+(HM.act.z?' : '+HZN[HM.act.z]:'')+' '+Math.round(HM.act.t/HM.act.T*100)+'%'):''}
// ================= bots : même système, zones touchées d'après les pièces du modèle =================
const BHW={h:.2,t:.3,a:.2,la:.075,ra:.075,ll:.075,rl:.075};
function bhInit(b){const h=b.T.hp;b.zh={h:h*.33,t:h,a:h*.8,la:h*.5,ra:h*.5,ll:h*.55,rl:h*.55};b.zm=Object.assign({},b.zh);b.bld=0;b.blood=100;b.fxl=0;b.hm=1;b.aimM=1;b.unarm=0;b.lz=null;b.bout=0;b.armDone=0;b.rld=1;b.pk=0;b.bdz=null}
function bhHit(b,z,dm,k){let a=0,brk=0;if(!b.zh)bhInit(b);
if(z==='h')dm*=k==='g'?1.3:3;else if((z==='t'||z==='a')&&b.ar>0){a=1;b.ar-=dm;if(b.ar<=0){dm=-b.ar;b.ar=0;b.vest.visible=false;brk=1}else dm=0}
if(dm>0){b.lz=z;const limb=hlLimb(z);if(limb&&b.zh[z]<=0){b.zh.t-=dm*.35}else b.zh[z]=Math.max(0,b.zh[z]-dm);
if(dm>=4&&!b.bdz)b.bdz={};if(dm>=4)b.bdz[z]=Math.max(b.bdz[z]||0,dm>=18?2:1);
if(limb&&(dm>=20||b.zh[z]<=0))b.fxl|=({la:1,ra:2,ll:4,rl:8})[z]}
let s=0;for(const q in BHW)s+=BHW[q]*b.zh[q]/b.zm[q];b.hp=Math.max(1,b.T.hp*s);if(b.zh.h<=0||b.zh.t<=0)b.hp=0;return{a,brk}}
function bhOut(b){b.bout=1;b.hp=0;if(b.pk)onKill(b,false);else botDie(b)}
function bhUpdate(b,dt){if(!b.zh)bhInit(b);if(b.bdz){let r=0;for(const z in b.bdz)r+=b.bdz[z]===2?1.6:.3;if(b.zh.a<=0)r+=3.2;b.blood-=r*dt;if(b.blood<=0&&!b.dead){bhOut(b);return}}else if(b.zh.a<=0&&!b.dead){b.blood-=3.2*dt;if(b.blood<=0){bhOut(b);return}}
let p=0;const f=b.fxl;[['ll',4],['rl',8]].forEach(q=>{const lv=(f&q[1])||b.zh[q[0]]<=0?2:b.zh[q[0]]<b.zm[q[0]]*.5?1:0;p+=lv===2?.42:lv===1?.1:0});b.hm=Math.max(.22,1-p);if(p>=.8)b.cr=1;
let am=1;const rb=(f&2)||b.zh.ra<=0,lb=(f&1)||b.zh.la<=0;if(rb){if(!b.armDone){b.armDone=1;if(Math.random()<.55){b.unarm=1;dropWeapon(b,0);b.wp.visible=false}}am*=b.unarm?1:2.6}else if(b.zh.ra<b.zm.ra*.5)am*=1.3;if(lb)am*=1.5;b.aimM=am;b.rld=lb?1.5:1}
// éclats de grenade sur un bot : rayons répartis sur le corps, bloqués par les murs
function hlBlastBot(b,E,R,n,own){const g=b.g.position,d=Math.hypot(g.x-E.x,g.y+1-E.y,g.z-E.z);if(d>R)return;const k=1-d/R,nf=Math.min(16,Math.round(80/Math.max(1,d*d))),sc=b.T.sc;let hit=0;if(!b.zh)bhInit(b);
if(own){b.bl={x:E.x,z:E.z};b.pk=1}
for(let i=0;i<nf&&b.hp>0;i++){const hh=(.1+((i*.618034)%1)*1.65)*sc,ll=(((i*.754877)%1)-.5)*.45;_hv.set(g.x+ll*Math.cos(b.g.rotation.y)-E.x,g.y+hh-E.y,g.z-ll*Math.sin(b.g.rotation.y)-E.z);const L=_hv.length()||1;_hv.multiplyScalar(1/L);const dir=_hv.clone();
RC.set(E,dir);RC.far=L+.8;const ph=RC.intersectObjects(b.parts)[0];if(!ph)continue;RC.far=ph.distance;const w=RC.intersectObjects(ray).find(q=>!q.object.userData.glass);if(w)continue;hit++;const z=ph.object.userData.head?'h':(ph.object.userData.zone||'t');bhHit(b,z,22*Math.pow(k,.9),'g');}
const ov=nadeLOS(n,g.x,g.y+1.1,g.z)?60*Math.pow(k,1.5):0;if(ov>3&&b.hp>0){const w={h:.15,t:.35,a:.3,ll:.1,rl:.1};for(const z in w)bhHit(b,z,ov*w[z],'o');if(ov>25){b.fxl|=12}}
return hit}
