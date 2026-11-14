// ================= PIÈGES ET MINES (v11) : pose, détection, désamorçage, télécommande, IA des bots =================
const TRP={inv:{xm:2,xc:1,xw:1,xb:1},list:[],mode:0,prog:0,dis:null,snare:0,gh:null,ghT:'',valid:false,ok:0,bt:0};
const TT={xm:{n:'Mine antipersonnel',T:2.4},xc:{n:'Mine directionnelle',T:3.2},xw:{n:'Piège à fil',T:3.6},xb:{n:'Piège à ours',T:2.8}};
const TSEQ=['xm','xc','xw','xb'];
function trapMesh(ty){const g=new THREE.Group(),M=(geo,c,x,y,z)=>{const m=new THREE.Mesh(geo,igMat(c));m.position.set(x,y,z);g.add(m);return m};
if(ty==='xm'){M(new THREE.CylinderGeometry(.13,.14,.05,14),0x4a5230,0,.02,0);M(new THREE.CylinderGeometry(.045,.045,.03,10),0x2a2e22,0,.055,0);for(let i=0;i<3;i++)M(new THREE.CylinderGeometry(.006,.006,.05,5),0x8a8a7a,Math.cos(i*2.09)*.07,.075,Math.sin(i*2.09)*.07)}
else if(ty==='xc'){M(new THREE.BoxGeometry(.28,.14,.045),0x4d5a34,0,.14,0);M(new THREE.BoxGeometry(.26,.12,.02),0x6a7a44,0,.14,-.03);for(const s of[-1,1])M(new THREE.BoxGeometry(.012,.1,.012),0x2a2a2a,s*.1,.05,.02)}
else if(ty==='xw'){for(const s of[-1,1])M(new THREE.CylinderGeometry(.012,.012,.32,6),0x3a2c1c,s*1.6,.16,0);M(new THREE.CylinderGeometry(.004,.004,3.2,4),0x9a9a90,0,.25,0).rotation.z=Math.PI/2;M(new THREE.CylinderGeometry(.03,.03,.1,8),0x4a5a34,-1.6,.18,0)}
else{M(new THREE.TorusGeometry(.2,.025,6,14),0x6a6a6a,0,.03,0).rotation.x=Math.PI/2;for(let i=0;i<10;i++){const a=i/10*6.28;M(new THREE.ConeGeometry(.012,.07,4),0x8a8a8a,Math.cos(a)*.2,.07,Math.sin(a)*.2)}M(new THREE.CylinderGeometry(.05,.05,.01,8),0x555555,0,.02,0)}
return g}
function trapAdd(ty,x,z,yaw,owner,arm){const m=trapMesh(ty),y=GH(x,z);m.position.set(x,y-(ty==='xm'||ty==='xb'?.012:0),z);m.rotation.y=yaw;S.add(m);const t={ty,x,z,y,yaw,m,owner,arm:arm===undefined?1.5:arm,kn:{}};TRP.list.push(t);return t}
function trapRemove(t){S.remove(t.m);const i=TRP.list.indexOf(t);if(i>=0)TRP.list.splice(i,1)}
const trapDetR=()=>(typeof TOD!=='undefined'&&(TOD.t<6||TOD.t>19.6))?3.2:5.5;
function trapNear(){let b=null,bd=1.8;for(const t of TRP.list){if(!t.m.visible)continue;const d=Math.hypot(t.x-P.x,t.z-P.z);if(d<bd){bd=d;b=t}}return b}
const trapOk=(x,z)=>wDist(x,z)>.8&&Math.abs(x)<MH-2&&Math.abs(z)<MH-2;
// ---------- effets ----------
function trapBoom(t,v){const own=t.owner==='p';trapRemove(t);nadeBoom({type:0,p:new THREE.Vector3(t.x,t.y+.25,t.z),owner:own?null:{},wet:true,m:{visible:true}});
if(t.ty==='xm'&&v){if(v==='p'){['ll','rl'].forEach(z=>{hlApply(z,40,'g',null);if(!HM.fx[z]){HM.fx[z]=1;hlMsg('Fracture : '+HZN[z])}})}else if(!v.dead){if(own)v.pk=1;bhHit(v,'ll',70,'g');bhHit(v,'rl',45,'g');aiHit(v)}}}
function trapClaymore(t){trapRemove(t);const x=t.x,y=t.y+.25,z=t.z,fx=-Math.sin(t.yaw),fz=-Math.cos(t.yaw),E=new THREE.Vector3(x,y,z),R=16,inCone=(vx,vz)=>{const dx=vx-x,dz=vz-z,d=Math.hypot(dx,dz);return d<R&&d>.3&&(dx*fx+dz*fz)/d>.82};
boom(x+fx*1.2,z+fz*1.2,2.2);sfxBoom(x,y,z,1);noise(x,z,90);FXP.shake=Math.max(FXP.shake,Math.max(0,1-Math.hypot(P.x-x,P.z-z)/25));
for(let i=0;i<22;i++)emit(_no.set(x,y,z),_e.set(fx+rnd(-.35,.35),rnd(-.1,.3),fz+rnd(-.35,.35)).normalize().multiplyScalar(rnd(14,26)),{map:sparkT,color:0xffc870,size:.05,life:.3,add:1,g:3});
const own=t.owner==='p';for(const b of bots){if(b.dead)continue;const g=b.g.position;if(!inCone(g.x,g.z))continue;hlBlastBot(b,E,R,{owner:null,p:E},own);if(b.hp<=0){if(own)onKill(b,false);else botDie(b)}else if(own){b.pk=1;aiHit(b);b.flinch=1}}
if(inCone(P.x,P.z)&&!ac.on)hlBlastPlayer(E,R,{owner:null,p:E})}
function trapBear(t,b){trapRemove(t);sndAt(t.x,t.y,t.z,140,.25,.4,'sawtooth',{ref:8});sndAt(t.x,t.y,t.z,900,.08,.3,'square',{ref:8});
if(!b){TRP.snare=4.5;const z=Math.random()<.5?'ll':'rl';hlApply(z,38,'g',null);if(!HM.fx[z]){HM.fx[z]=1;hlMsg('Piège à ours : fracture '+HZN[z])}}
else{b.stun=Math.max(b.stun||0,4.5);if(t.owner==='p')b.pk=1;bhHit(b,Math.random()<.5?'ll':'rl',46,'g');aiHit(b)}}
const trapSpdK=()=>TRP.snare>0?.2:TRP.prog>0?.55:TRP.dis?0:1;
// ---------- interface de pose ----------
const tps=document.createElement('div');tps.style.cssText='position:fixed;left:50%;bottom:30%;transform:translateX(-50%);z-index:6;pointer-events:none;font:14px "Segoe UI",sans-serif;color:#dfe8d4;text-shadow:0 1px 3px #000;text-align:center;display:none';document.body.appendChild(tps);
function trapSetMode(m){TRP.mode=m;TRP.prog=0;if(TRP.gh){S.remove(TRP.gh);TRP.gh=null}if(!m)tps.style.display='none'}
function trapCycle(){let m=TRP.mode;for(let i=0;i<5;i++){m=(m+1)%5;if(m===0)break;if((TRP.inv[TSEQ[m-1]]||0)>0)break}trapSetMode(m);if(!m)hlMsg('Pose annulée')}
function trapGhost(){const ty=TSEQ[TRP.mode-1];if(TRP.ghT!==ty||!TRP.gh){if(TRP.gh)S.remove(TRP.gh);TRP.gh=trapMesh(ty);TRP.gh.traverse(o=>{if(o.isMesh)o.material=new THREE.MeshBasicMaterial({color:0x66ff66,transparent:true,opacity:.5,depthWrite:false})});S.add(TRP.gh);TRP.ghT=ty}
const sn=Math.sin(P.yaw),cs=Math.cos(P.yaw),d=ty==='xw'?2.4:1.7,x=P.x-sn*d,z=P.z-cs*d;TRP.gx=x;TRP.gz=z;TRP.valid=trapOk(x,z);TRP.gh.position.set(x,GH(x,z),z);TRP.gh.rotation.y=P.yaw;const c=TRP.valid?0x66ff66:0xff5544;TRP.gh.traverse(o=>{if(o.isMesh)o.material.color.setHex(c)})}
addEventListener('keydown',e=>{if(e.repeat||bench||ac.on||$('ov').style.display!=='none')return;
if(e.code==='KeyB'){e.preventDefault();trapCycle()}
else if(e.code==='Digit9'||e.code==='Numpad9'){const mine=TRP.list.filter(t=>t.ty==='xc'&&t.owner==='p'&&t.arm<=0);if(!mine.length)hlMsg('Aucune mine directionnelle posée');else{hlMsg('Détonation à distance');mine.forEach(trapClaymore)}}
else if(e.code==='KeyF'&&!TRP.dis){const t=trapNear();if(t)TRP.dis={t,p:0}}},true);
function trapUpdate(dt){enmTick();if(P.gy===undefined||HM.z.t===undefined||HM.dead)return;
if(TRP.snare>0)TRP.snare-=dt;
const det=trapDetR();for(const t of TRP.list){const d=Math.hypot(t.x-P.x,t.z-P.z);t.m.visible=t.owner==='p'||d<det||t.arm>0&&t.owner==='p'}
// pose
if(TRP.mode){const ty=TSEQ[TRP.mode-1];if((TRP.inv[ty]||0)<=0)trapSetMode(0);else{trapGhost();
if(mdown&&!bench&&TRP.valid&&!K.ShiftLeft&&!ac.on)TRP.prog+=dt/(TT[ty].T*(P.st>=1?.7:1));else TRP.prog=0;
tps.style.display='block';tps.innerHTML='<b>POSE : '+TT[ty].n+'</b> ×'+TRP.inv[ty]+'<br><span style="opacity:.75">clic maintenu : poser · B : changer / annuler'+(ty==='xc'?' · 9 : détonation':'')+'</span><br><div style="width:180px;height:8px;border:1px solid #6a8a50;margin:6px auto;background:#1a2216"><i style="display:block;height:100%;width:'+Math.min(100,TRP.prog*100)+'%;background:#c8f07a"></i></div>'+(TRP.valid?'':'<span style="color:#e86a5a">Emplacement impossible</span>');
if(TRP.prog>=1){TRP.prog=0;TRP.inv[ty]--;trapAdd(ty,TRP.gx,TRP.gz,ty==='xc'||ty==='xw'?P.yaw:rnd(0,6.28),'p');hlMsg(TT[ty].n+' posée');snd(300,.05,.12,'square');if(TRP.inv[ty]<=0)trapCycle();if(INV.open)invRender()}}}
// désamorçage
if(TRP.dis){const d=TRP.dis;if(!K.KeyF||K.ShiftLeft||mdown||!TRP.list.includes(d.t)||Math.hypot(d.t.x-P.x,d.t.z-P.z)>2.2){TRP.dis=null;tps.style.display=TRP.mode?'block':'none'}
else{d.p+=dt/2.8;tps.style.display='block';tps.innerHTML='<b>Désamorçage : '+TT[d.t.ty].n+'</b><div style="width:180px;height:8px;border:1px solid #6a8a50;margin:6px auto;background:#1a2216"><i style="display:block;height:100%;width:'+Math.min(100,d.p*100)+'%;background:#f0c878"></i></div>';
if(d.p>=1){TRP.dis=null;const t=d.t;tps.style.display=TRP.mode?'block':'none';if(t.owner!=='p'&&Math.random()<.06){hlMsg('Piège déclenché !');if(t.ty==='xb')trapBear(t,null);else if(t.ty==='xc')trapClaymore(t);else trapBoom(t)}
else{trapRemove(t);const r=invPut(t.ty,1);if(!r)invSpawn(t.ty,1,P.x,P.gy+.8,P.z,0,0);hlMsg('Désamorcé : '+TT[t.ty].n);snd(700,.05,.1,'triangle')}if(INV.open)invRender()}}}
else if(!TRP.mode){const n=trapNear();if(n){tps.style.display='block';tps.innerHTML='F (maintenu) — Désamorcer : '+TT[n.ty].n}else tps.style.display='none'}
// déclenchement
const hit=(t,vx,vz,vy)=>{if(t.ty==='xw'){const ax=Math.cos(t.yaw)*1.6,az=-Math.sin(t.yaw)*1.6,x1=t.x+ax,z1=t.z+az,dx=-2*ax,dz=-2*az,l2=dx*dx+dz*dz;let u=((vx-x1)*dx+(vz-z1)*dz)/l2;u=Math.max(0,Math.min(1,u));return Math.hypot(vx-(x1+u*dx),vz-(z1+u*dz))<.28&&Math.abs(vy-t.y)<.7}
return Math.hypot(vx-t.x,vz-t.z)<(t.ty==='xb'?.42:.5)&&Math.abs(vy-t.y)<.9};
for(let i=TRP.list.length-1;i>=0;i--){const t=TRP.list[i];if(!t)continue;if(t.arm>0){t.arm-=dt;continue}if(t.ty==='xc')continue;
if(!ac.on&&!(t.ty==='xw'&&P.st===2)&&hit(t,P.x,P.z,P.gy)){if(t.ty==='xb')trapBear(t,null);else trapBoom(t,'p');continue}
if(t.owner==='p')for(const b of bots){if(b.dead||t.kn[b.sq?SQ.indexOf(b.sq):-1])continue;const g=b.g.position;if(hit(t,g.x,g.z,g.y)){b.pk=1;if(t.ty==='xb')trapBear(t,b);else trapBoom(t,b);break}}}
trapBots(dt);natCues(dt)}
// ---------- IA des bots : détection, évitement, désamorçage, pose par les « génies » ----------
function trapBots(dt){TRP.bt+=dt;if(TRP.bt<.4)return;const st=TRP.bt;TRP.bt=0;if(typeof SQ==='undefined'||!SQ.length)return;const det=trapDetR()*.9;
bots.forEach((b,i)=>{if(b.dead||b.stun>0)return;const g=b.g.position,sq=SQ.indexOf(b.sq);
if(b.trp===undefined){b.trp=i%5===2?{xm:3,xw:2,xb:1}:null;b.tcd=rnd(6,16);b.tdis=null}
// déjà en train de désamorcer
if(b.tdis){b.tdis.t-=st;b.wait=Math.max(b.wait||0,.6);if(b.tdis.t<=0){const t=b.tdis.tr;b.tdis=null;if(TRP.list.includes(t)){trapRemove(t);if(b.trp)b.trp[t.ty]=(b.trp[t.ty]||0)+1}}return}
// détection des pièges du joueur (partagée dans l'escouade)
const fx=-Math.sin(b.yaw),fz=-Math.cos(b.yaw);
for(const t of TRP.list){if(t.owner!=='p'||t.kn[sq])continue;const dx=t.x-g.x,dz=t.z-g.z,d=Math.hypot(dx,dz);if(d>det*1.2)continue;if((dx*fx+dz*fz)/Math.max(.1,d)<.15&&d>1.5)continue;if(Math.random()<.55)t.kn[sq]=1}
// évitement et désamorçage des pièges connus
for(const t of TRP.list){if(!t.kn[sq])continue;const dx=g.x-t.x,dz=g.z-t.z,d=Math.hypot(dx,dz);
if(d<2.8&&b.st!=='att'&&!b.see&&Math.random()<.35){b.tdis={t:2.6,tr:t};break}
if(d<1.6&&d>.05){g.x+=dx/d*(1.7-d)*.6;g.z+=dz/d*(1.7-d)*.6}}
// pose par les génies
if(b.trp&&!b.see&&b.st==='pat'){b.tcd-=st;if(b.tcd<=0){const ks=Object.keys(b.trp).filter(k=>b.trp[k]>0);const pd=Math.hypot(g.x-P.x,g.z-P.z);
if(ks.length&&pd>22&&pd<110&&trapOk(g.x,g.z)&&!(typeof inRoom==='function'&&inRoom(g.x,g.z)>=0)){const k=ks[(Math.random()*ks.length)|0];b.trp[k]--;const t=trapAdd(k,g.x+fx*1.6,g.z+fz*1.6,b.yaw,'b',2);t.kn[sq]=1;b.wait=Math.max(b.wait||0,2.5);b.cr=1}b.tcd=rnd(14,32)}}})}

// ---------- indices naturels : branches qui craquent, oiseaux qui s'envolent (donnent la direction de qui marche) ----------
const BRN={list:[],init:false,cue:null,t:0,prev:[]};
const bce=document.createElement('div');bce.style.cssText='position:fixed;left:50%;top:15%;transform:translateX(-50%);z-index:6;pointer-events:none;font:700 15px "Segoe UI",sans-serif;color:#f0e0a0;text-shadow:0 1px 3px #000;text-align:center;display:none';document.body.appendChild(bce);
function brnInit(){BRN.init=true;const bg=new THREE.BoxGeometry(.7,.025,.035),bg2=new THREE.BoxGeometry(1,.045,.055),mk=(x,z)=>{const big=Math.random()<.25,m=new THREE.Mesh(big?bg2:bg,igMat(big?0x4a361f:0x5a4326));m.position.set(x,GH(x,z)+.02,z);m.rotation.y=rnd(0,6.28);m.rotation.z=rnd(-.08,.08);m.visible=false;S.add(m);BRN.list.push({x,z,m,br:0,t:0,big})};
for(let i=0,n=0;i<16000&&n<1900;i++){const x=rnd(-MH+5,MH-5),z=rnd(-MH+5,MH-5);if(!trapOk(x,z)||(typeof inRoom==='function'&&inRoom(x,z)>=0))continue;mk(x,z);n++}
for(let i=0,n=0;i<4000&&n<700;i++){const x=rnd(-240,240),z=rnd(-240,240);if(!trapOk(x,z)||(typeof inRoom==='function'&&inRoom(x,z)>=0))continue;mk(x,z);n++}}
function natCue(){}
let brnLast=0,wingLast=0;
function brnSnd(x,y,z){const T=performance.now();if(T-brnLast<350||Math.hypot(x-P.x,z-P.z)>70)return;brnLast=T;auInit();if(!AU.ready)return;const o=sp3(x,y,z,{ref:10,roll:.9,ad:70});nz(.05,'bandpass',2800,1.2,.8,o,1.3,.001);nz(.14,'lowpass',800,.8,.55,o,.8,.003)}
function wingSnd(x,y,z){const T=performance.now();if(T-wingLast<1800||Math.hypot(x-P.x,z-P.z)>60)return;wingLast=T;auInit();if(!AU.ready)return;const o=sp3(x,y,z,{ref:12,roll:.9,ad:60});for(let k=0;k<4;k++)setTimeout(()=>{try{nz(.09,'bandpass',1200,.6,.28,o,1.4,.02)}catch(e){}},k*85)}
function brnCrack(b,big,bot){b.br=1;b.t=90;b.m.scale.x=.5;b.m.rotation.z=.5;b.m.position.y+=.03;const y=GH(b.x,b.z)+.3;brnSnd(b.x,y,b.z);
for(let i=0;i<4;i++)emit(_no.set(b.x,y-.2,b.z),_e.set(rnd(-1,1),rnd(.5,1.4),rnd(-1,1)),{color:0x8a6a40,size:.03,life:.4,g:6});if(!bot)noise(b.x,b.z,big?34:22)}
function natCues(dt){if(!BRN.init)brnInit();trbTick(dt);effTick(dt);dstTick(dt);BRN.t+=dt;
if(BRN.t>=.12){const st=BRN.t;BRN.t=0;const wk=[];if(!ac.on&&(K.KeyW||K.KeyA||K.KeyS||K.KeyD))wk.push({x:P.x,z:P.z,p:P.st===0?(K.ShiftLeft?1:.9):P.st===1?.3:.08,big:K.ShiftLeft,bot:0});for(const b of bots){if(b.dead)continue;const g=b.g.position;if(Math.abs(g.x-P.x)<80&&Math.abs(g.z-P.z)<80)wk.push({x:g.x,z:g.z,p:b.cr?.25:.5,big:0,bot:1})}
for(const b of BRN.list){if(b.br){b.t-=st;if(b.t<=0){b.br=0;b.m.scale.x=1;b.m.rotation.z=0;b.m.position.y=GH(b.x,b.z)+.02}continue}
if(Math.abs(b.x-P.x)>90||Math.abs(b.z-P.z)>90){b.m.visible=false;continue}b.m.visible=Math.abs(b.x-P.x)<75&&Math.abs(b.z-P.z)<75;for(const w of wk){if(Math.abs(w.x-b.x)<.55&&Math.abs(w.z-b.z)<.55&&Math.hypot(w.x-b.x,w.z-b.z)<.55){if(Math.random()<w.p*(b.big?1.15:1))brnCrack(b,w.big||b.big,w.bot);else b.t=0;break}}}
// oiseaux effrayés par un bot
FA.birds.forEach((q,i)=>{const was=BRN.prev[i];BRN.prev[i]=q.st;if(was===1&&q.st===0&&!q.dead&&q.perch){const d=Math.hypot(q.perch.x-P.x,q.perch.z-P.z);if(d>8&&d<80){wingSnd(q.perch.x,q.perch.y||8,q.perch.z)}}})}
if(BRN.cue){const c=BRN.cue;c.t-=dt;if(c.t<=0){BRN.cue=null;bce.style.display='none'}else{const dx=c.x-P.x,dz=c.z-P.z,fa=dx*-Math.sin(P.yaw)+dz*-Math.cos(P.yaw),ra=dx*Math.cos(P.yaw)+dz*-Math.sin(P.yaw),ang=Math.atan2(ra,fa)*57.3;bce.style.display='block';bce.style.opacity=Math.min(1,c.t);bce.innerHTML='<span style="display:inline-block;transform:rotate('+ang.toFixed(0)+'deg);font-size:20px">▲</span><br>'+c.txt+' · '+Math.round(Math.hypot(dx,dz))+' m'}}}

// ---------- F8 : désactiver / réactiver les ennemis (test, exploration) ----------
const ENM={off:0};
addEventListener('keydown',e=>{if(e.code==='F8'&&!e.repeat){e.preventDefault();ENM.off=!ENM.off;if(!ENM.off)bots.forEach(b=>{if(b.dead>50)b.dead=.3});hlMsg(ENM.off?'Ennemis désactivés (F8 pour les réactiver)':'Ennemis réactivés')}});
function enmTick(){if(!ENM.off)return;for(const b of bots){b.dead=99;b.g.visible=false}}
