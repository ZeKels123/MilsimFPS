// ================= v8 : IA en escouade =================
// 8 escouades de bots (indices i%SQN). Rôles : appui (Mastodonte, sinon un Soldat) qui tire de suppression sur la dernière position connue,
// infirmier (Soldat) qui soigne les blessés, assaut qui converge de deux côtés. Repli groupé quand l'escouade est décimée ou très blessée.
const SQN=8,SQ=[];let sqInit_=false;
function bhHeal(b,f,splint){if(!b.zh)return;for(const z in b.zh)b.zh[z]=Math.min(b.zm[z],b.zh[z]+b.zm[z]*f);b.bdz=null;if(splint)b.fxl=0;let s=0;for(const q in BHW)s+=BHW[q]*b.zh[q]/b.zm[q];b.hp=Math.max(1,b.T.hp*s);b.blood=Math.min(100,b.blood+30)}
function sqHurt(b){if(!b.zh)return 0;let s=0,m=0;for(const z in b.zh){s+=b.zh[z];m+=b.zm[z]}return 1-s/m}
function sqBuild(){bots.forEach((b,i)=>{const k=i%SQN;(SQ[k]=SQ[k]||{m:[],lk:{x:0,z:0},t:0,ret:0,fb:null,lost:0,aT:0,sup:null,med:null,n0:0}).m.push(b);b.sq=SQ[k]});bots.forEach(b=>{try{sqPlace(b,true)}catch(e){}});SQ.forEach(q=>q.n0=q.m.length);sqInit_=true}
function sqRoles(q){const al=q.m.filter(b=>!b.dead);q.sup=al.find(b=>b.ty===3)||al.filter(b=>b.ty<2).pop()||null;q.med=al.find(b=>b.ty===1&&b!==q.sup)||null;return al}
function sqFire(b,q,dt){const g=b.g.position,bt=b.T;b.cd=rnd(.1,.2)*(b.ty===3?1:2);b.mag--;b.shots++;if(b.shots%7===0)b.cd+=rnd(.5,1);
_la.set(g.x,g.y+1.6*bt.sc-b.crA*.1,g.z);_lb.set(q.lk.x+rnd(-2.6,2.6),GH(q.lk.x,q.lk.z)+rnd(.5,1.8),q.lk.z+rnd(-2.6,2.6));
b.fl=.07;b.rec=1;sfxShot(g.x,g.y+1.4,g.z,b.ty,1);AI.heat=Math.min(9,(AI.heat||0)+.5);
const dx=_lb.x-_la.x,dy=_lb.y-_la.y,dz=_lb.z-_la.z,L=Math.hypot(dx,dy,dz)||1;_fv3.set(dx/L,dy/L,dz/L);
const pd=Math.hypot(_lb.x-P.x,_lb.z-P.z);
if(pd<3.2)hlBullet(_la,_lb,.45,bt.dmg*(.8+Math.random()*.4),b);
else balBot(_la,_lb,.12,bt.dmg*(.8+Math.random()*.4),b,1);
if(b.mag<=0){b.relT=b.ty===3?3.6:2.1}}

// ---- v46 : escouades géographiques. Chaque escouade a un point d'ancrage ; ses membres apparaissent et réapparaissent près de leurs camarades vivants (jamais à l'autre bout de la carte)
const SQA=[];
function sqK(b){const i=bots.indexOf(b);return(i<0?bots.length:i)%4}
function sqAnchor(k){if(SQA[k])return SQA[k];let a=null;for(let t=0;t<120&&!a;t++){const x=rnd(-MH+30,MH-30),z=rnd(-MH+30,MH-30);if(!free_(x,z)||!nFree(x,z)||Math.hypot(x-P.x,z-P.z)<55)continue;if(SQA.some(o=>o&&Math.hypot(o[0]-x,o[1]-z)<48))continue;a=[x,z]}
return SQA[k]=a||[rnd(-MH+30,MH-30),rnd(-MH+30,MH-30)]}
function sqPlace(b,init){const k=sqK(b),mates=bots.filter((o,i)=>o!==b&&!o.dead&&i%SQN===k);let c;
if(init||!mates.length)c=sqAnchor(k);else{const m=mates[(Math.random()*mates.length)|0];c=[m.g.position.x,m.g.position.z]}
const r=init?13:9;for(let t=0;t<60;t++){const x=c[0]+rnd(-r,r),z=c[1]+rnd(-r,r);if(Math.abs(x)>MH-5||Math.abs(z)>MH-5||!free_(x,z)||!aiSpawnOk(x,z)||Math.hypot(x-P.x,z-P.z)<45)continue;b.g.position.set(x,0,z);b.fy=GH(x,z);return true}return false}
{const sq_sp0=spawn;spawn=function(b){sq_sp0(b);try{sqPlace(b,false)}catch(e){}}}
const _fv3=new THREE.Vector3(),_fv4=new THREE.Vector3();
function sqTick(dt){if(!sqInit_)sqBuild();
for(const q of SQ){const al=sqRoles(q);if(!al.length){q.ret=0;continue}q.aT-=dt;sqChef(q,al);
// contact : la position du joueur est partagée dans l'escouade
if(al.some(b=>b.see)){q.lk.x=P.x;q.lk.z=P.z;q.t=7}else q.t=Math.max(0,q.t-dt);
// pertes récentes
const dead=q.n0-al.length;if(q.dead0===undefined)q.dead0=0;if(dead>q.dead0){q.lost=22;q.dead0=dead}q.lost=Math.max(0,q.lost-dt);if(dead===0)q.dead0=0;
const hurt=al.reduce((s,b)=>s+sqHurt(b),0)/al.length;
if(!q.ret&&q.t>0&&((q.lost>0&&al.length<=Math.ceil(q.n0/2))||hurt>.5)&&al.length>0){q.ret=22;q.fb=null;feed('Une escouade se replie');{const l_=sqLeader(al);if(l_)sqIssue(q,'ret',l_,al.filter(b=>b!==l_))}}
if(q.ret>0){q.ret-=dt;if(!q.fb||q.aT<=0){q.aT=5;const g0=al[0].g.position;let best=null;for(let n=0;n<24;n++){const a=Math.atan2(g0.x-P.x,g0.z-P.z)+rnd(-.6,.6),r=rnd(30,48),x=g0.x+Math.sin(a)*r,z=g0.z+Math.cos(a)*r;if(!nFree(x,z)||Math.hypot(x-P.x,z-P.z)<35)continue;best=[x,z];break}q.fb=best||(q.fb||[g0.x,g0.z]);
al.forEach((b,i)=>{if(b.lvl||b.route)return;b.fleeT=6;b.heal=null;goTo(b,q.fb[0]+rnd(-3,3),q.fb[1]+rnd(-3,3),2.4,'cov')})}
if(q.ret<=0)q.fb=null;continue}
sqCmd(q,al,dt);sqOrders(q,al,dt);
// appui : tir de suppression sur la dernière position connue quand personne ne voit le joueur
const s=q.sup;if(s&&q.t>0&&!s.see&&s.mag>0&&s.relT<=0&&s.stun<=0&&s.blind<=0&&!s.heal&&!s.lvl&&!s.route&&!s.unarm){const d=Math.hypot(q.lk.x-s.g.position.x,q.lk.z-s.g.position.z);
if(d<s.T.rng*1.2&&d>8){s.path=null;s.cr=1;s.decT=Math.max(s.decT,.4);s.st='atk';s.yaw=Math.atan2(q.lk.x-s.g.position.x,q.lk.z-s.g.position.z);s.cd-=0;if(s.cd<=0)sqFire(s,q,dt)}}
// assaut : convergence des autres membres par deux côtés, après alerte partagée
if(q.t>5.5&&q.aT<=0){q.aT=1.6;let k=0;const dx=P.x-al[0].g.position.x,dz=P.z-al[0].g.position.z,l=Math.hypot(dx,dz)||1,px=-dz/l,pz=dx/l;for(const b of al){if(b===s||b.see||b.heal||b.lvl||b.route||b.stun>0)continue;if(b.alert&&b.seenT<3)continue;const sg=(k++%2?1:-1)*13;aiAlert(b,q.lk.x+px*sg,q.lk.z+pz*sg,1.2)}}
// soins : infirmier vers le blessé, sinon auto-soin à l'abri
for(const b of al){if(b.heal){const h=b.heal;if(b.see||b.stun>0||b.fleeT>0){b.heal=null;continue}b.path=null;b.cr=1;b.cd=Math.max(b.cd,.5);b.decT=Math.max(b.decT,.4);h.t-=dt;if(h.tgt&&(h.tgt.dead||Math.hypot(h.tgt.g.position.x-b.g.position.x,h.tgt.g.position.z-b.g.position.z)>3.2)){b.heal=null;continue}
if(h.t<=0){if(!h.passive)bhHeal(h.tgt||b,h.tgt?.5:.35,!!h.tgt);b.heal=null}continue}
if(b.see||b.stun>0||b.blind>0||b.lvl||b.route||b.fleeT>0||b.seenT<3||b.st==='cov'&&b.path)continue;
const w=b===q.med?null:(sqHurt(b)>.25||b.bdz?b:null);
if(b===q.med&&(sqHurt(b)>.3||b.bdz)){b.heal={t:5,tgt:null};continue}
if(w&&q.med&&!q.med.heal&&!q.med.see&&q.med.stun<=0&&!q.med.lvl&&!q.med.route){const d=Math.hypot(w.g.position.x-q.med.g.position.x,w.g.position.z-q.med.g.position.z);if(d<28){if(d<2.6){q.med.heal={t:4,tgt:w};w.heal={t:4,tgt:null,passive:1};w.path=null}else if(q.med.decT<.2||!q.med.path)goTo(q.med,w.g.position.x,w.g.position.z,2,'hnt')}}
else if(w&&(!q.med||q.med.dead)&&b.seenT>5)b.heal={t:6,tgt:null}}}
}

// ================= v47 : commandement d'escouade =================
// Chef explicite (succession + moral), missions (patrouille de secteur, garde de position, fouille de bâtiments) et formations
// (colonne, ligne, coin) : l'escouade se déplace d'un point de passage à l'autre, chaque homme à son emplacement.
function sqChef(q,al){if(q.chef&&(q.chef.dead>0||q.chef.sur||!al.includes(q.chef))){const was=q.chef;q.chef=null;was.chef=0;q.chefLost=VX.t;q.mis=null;q.oT=Math.max(q.oT||0,5);
for(const b of al){b.mor=Math.max(0,(b.mor===undefined?1:b.mor)-.15);b.ordCover=0}
try{if(Math.hypot(was.g.position.x-P.x,was.g.position.z-P.z)<90)feed('Chef d’escouade éliminé')}catch(e){}}
if(!q.chef&&al.length){const nl=sqLeaderPick(al);if(nl){q.chef=nl;nl.chef=1;if(q.chefLost&&al.length>1){try{sqSay(nl,'oSucc')}catch(e){}}}}}
function sqSlot(fm,i,n){if(i===0)return[0,0];if(fm==='line')return[((i+1)>>1)*4.2*(i&1?1:-1),0];
if(fm==='wedge'){const s=((i+1)>>1)*3.4*(i&1?1:-1);return[s,-Math.abs(s)*.9]}
return[(i&1?1:-1)*1.8,-3.6*i]}
function sqSlotPos(fm,wp,hd,i,n){const sl=sqSlot(fm,i,n),fx=Math.sin(hd),fz=Math.cos(hd);return[wp[0]+fz*sl[0]+fx*sl[1],wp[1]-fx*sl[0]+fz*sl[1]]}
function sqNewMis(q,lead){const A=sqAnchor(SQ.indexOf(q)),lg=lead.g.position,r=Math.random();let k=r<.45?'patrol':r<.75?'guard':'search',pts=[];
if(k==='search'){const rs=ROOMS.filter(o=>Math.hypot(o.x-A[0],o.z-A[1])<95&&nFree(o.x,o.z)).sort((a,b)=>Math.hypot(a.x-lg.x,a.z-lg.z)-Math.hypot(b.x-lg.x,b.z-lg.z)).slice(0,3);pts=rs.map(o=>[o.x,o.z]);if(!pts.length)k='patrol'}
if(k==='patrol'){const n=4+((Math.random()*2)|0),a0=rnd(0,6.28),R=rnd(24,42);for(let i=0;i<n;i++){const x=A[0]+Math.sin(a0+i*6.283/n)*R,z=A[1]+Math.cos(a0+i*6.283/n)*R;if(Math.abs(x)<MH-8&&Math.abs(z)<MH-8&&nFree(x,z))pts.push([x,z])}if(pts.length<2){k='guard';pts=[]}}
if(k==='guard')pts=[[A[0],A[1]]];
if(Math.hypot(pts[0][0]-lg.x,pts[0][1]-lg.z)>95&&k!=='guard')pts.unshift([A[0],A[1]]);
return{k,pts,i:0,halt:0,wt:0,T:rnd(70,130),a0:rnd(0,6.28)}}
function sqCmd(q,al,dt){const lead=q.chef;if(!lead||al.length<2)return;
if(q.t>0||al.some(b=>b.alert||b.see||b.fleeT>0)){q.mis=null;return}
if(lead.heal||lead.lvl||lead.route||lead.stun>0||lead.sur||lead.dorm)return;
let m=q.mis;if(!m||m.T<=0){m=q.mis=sqNewMis(q,lead);q.mT=0;if(m.k!=='guard'&&Math.random()<.6)try{sqSay(lead,'oMove')}catch(e){}}
m.T-=dt;const wp=m.pts[m.i%m.pts.length],lg=lead.g.position,d=Math.hypot(wp[0]-lg.x,wp[1]-lg.z);
const mem=[lead].concat(al.filter(b=>b!==lead&&!b.heal&&!b.lvl&&!b.route&&b.stun<=0&&!b.unarm&&!b.sur));const n=mem.length;
if(m.halt>0){m.halt-=dt;mem.forEach((b,i)=>{if(b.path||b.st!=='pat')return;const a=m.a0+i*6.283/n;b.yaw=a;if(m.k==='guard')b.cr=1});if(m.halt<=0){m.i++;m.wt=0;q.mT=0;if(m.k==='guard')m.halt=rnd(12,20)}return}
m.wt+=dt;
if(m.k==='guard'){if(!m.set){m.set=1;m.halt=rnd(12,20);const ap=Math.atan2(P.x-wp[0],P.z-wp[1]);mem.forEach((b,i)=>{const a=b.trp?ap:m.a0+i*6.283/n,r=b.trp?9:5,x=wp[0]+Math.sin(a)*r,z=wp[1]+Math.cos(a)*r;if(nFree(x,z))goTo(b,x,z,1.1,'pat');b.wait=0;if(b.trp)b.tcd=Math.min(b.tcd||9,4)})}return}
if(d<7||m.wt>50){m.halt=m.k==='search'?rnd(8,14):rnd(5,9);if(Math.random()<.5)try{sqSay(lead,'oHalt')}catch(e){}return}
q.mT=(q.mT||0)-dt;if(q.mT>0)return;q.mT=3.2;const hd=Math.atan2(wp[0]-lg.x,wp[1]-lg.z);q.fm=m.k==='search'?'wedge':(d>45?'col':'line');
mem.forEach((b,i)=>{if(b.st!=='pat'&&b.st)return;const t=i===0?wp:sqSlotPos(q.fm,wp,hd,i,n),x=nFree(t[0],t[1])?t[0]:wp[0],z=nFree(t[0],t[1])?t[1]:wp[1];
if(i===0||Math.hypot(b.g.position.x-x,b.g.position.z-z)>2.8){const far=Math.hypot(b.g.position.x-lg.x,b.g.position.z-lg.z);if(goTo(b,x,z,i===0?1:(far>14?1.2:1),'pat')){b.wait=0}else if(i===0){m.i++;m.wt=0}}})}
{const aT_=aiThink;aiThink=function(b){const q=b.sq;if(q&&q.mis&&b.st==='pat'&&!b.path&&!b.alert&&!b.see&&!b.heal&&!b.lvl&&!b.route&&!b.sur&&!(b.fleeT>0)&&b.seenT>3){b.decT=rnd(.55,1.05);return}return aT_(b)}}
