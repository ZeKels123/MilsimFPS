// ================= v8 : IA en escouade =================
// 4 escouades de bots (indices i%4). Rôles : appui (Mastodonte, sinon un Soldat) qui tire de suppression sur la dernière position connue,
// infirmier (Soldat) qui soigne les blessés, assaut qui converge de deux côtés. Repli groupé quand l'escouade est décimée ou très blessée.
const SQ=[];let sqInit_=false;
function bhHeal(b,f,splint){if(!b.zh)return;for(const z in b.zh)b.zh[z]=Math.min(b.zm[z],b.zh[z]+b.zm[z]*f);b.bdz=null;if(splint)b.fxl=0;let s=0;for(const q in BHW)s+=BHW[q]*b.zh[q]/b.zm[q];b.hp=Math.max(1,b.T.hp*s);b.blood=Math.min(100,b.blood+30)}
function sqHurt(b){if(!b.zh)return 0;let s=0,m=0;for(const z in b.zh){s+=b.zh[z];m+=b.zm[z]}return 1-s/m}
function sqBuild(){bots.forEach((b,i)=>{const k=i%4;(SQ[k]=SQ[k]||{m:[],lk:{x:0,z:0},t:0,ret:0,fb:null,lost:0,aT:0,sup:null,med:null,n0:0}).m.push(b);b.sq=SQ[k]});SQ.forEach(q=>q.n0=q.m.length);sqInit_=true}
function sqRoles(q){const al=q.m.filter(b=>!b.dead);q.sup=al.find(b=>b.ty===3)||al.filter(b=>b.ty<2).pop()||null;q.med=al.find(b=>b.ty===1&&b!==q.sup)||null;return al}
function sqFire(b,q,dt){const g=b.g.position,bt=b.T;b.cd=rnd(.1,.2)*(b.ty===3?1:2);b.mag--;b.shots++;if(b.shots%7===0)b.cd+=rnd(.5,1);
_la.set(g.x,g.y+1.6*bt.sc-b.crA*.1,g.z);_lb.set(q.lk.x+rnd(-2.6,2.6),GH(q.lk.x,q.lk.z)+rnd(.5,1.8),q.lk.z+rnd(-2.6,2.6));
b.fl=.07;b.rec=1;sfxShot(g.x,g.y+1.4,g.z,b.ty,1);AI.heat=Math.min(9,(AI.heat||0)+.5);
const dx=_lb.x-_la.x,dy=_lb.y-_la.y,dz=_lb.z-_la.z,L=Math.hypot(dx,dy,dz)||1;_fv3.set(dx/L,dy/L,dz/L);
const pd=Math.hypot(_lb.x-P.x,_lb.z-P.z);
if(pd<3.2)hlBullet(_la,_lb,.45,bt.dmg*(.8+Math.random()*.4),b);
else if(!losBlock(_la,_fv3,L))tracer(_la.clone().addScaledVector(_fv3,.5),_lb);
// balle qui passe près du joueur : claquement et secousse
{_fv4.set(P.x-_la.x,P.gy+P.eh*.6-_la.y,P.z-_la.z);const t=Math.max(0,Math.min(L,_fv4.dot(_fv3))),dd=_fv4.sub(_fv3.clone().multiplyScalar(t)).length();if(dd<1.6&&t>2){FXP.shake=Math.max(FXP.shake,.22);snd(rnd(1700,2500),.04,.07,'square');HM.pain=Math.min(1,HM.pain+.01)}}
if(b.mag<=0){b.relT=b.ty===3?3.6:2.1}}
const _fv3=new THREE.Vector3(),_fv4=new THREE.Vector3();
function sqTick(dt){if(!sqInit_)sqBuild();
for(const q of SQ){const al=sqRoles(q);if(!al.length){q.ret=0;continue}q.aT-=dt;
// contact : la position du joueur est partagée dans l'escouade
if(al.some(b=>b.see)){q.lk.x=P.x;q.lk.z=P.z;q.t=7}else q.t=Math.max(0,q.t-dt);
// pertes récentes
const dead=q.n0-al.length;if(q.dead0===undefined)q.dead0=0;if(dead>q.dead0){q.lost=22;q.dead0=dead}q.lost=Math.max(0,q.lost-dt);if(dead===0)q.dead0=0;
const hurt=al.reduce((s,b)=>s+sqHurt(b),0)/al.length;
if(!q.ret&&q.t>0&&((q.lost>0&&al.length<=Math.ceil(q.n0/2))||hurt>.5)&&al.length>0){q.ret=22;q.fb=null;feed('Une escouade se replie')}
if(q.ret>0){q.ret-=dt;if(!q.fb||q.aT<=0){q.aT=5;const g0=al[0].g.position;let best=null;for(let n=0;n<24;n++){const a=Math.atan2(g0.x-P.x,g0.z-P.z)+rnd(-.6,.6),r=rnd(30,48),x=g0.x+Math.sin(a)*r,z=g0.z+Math.cos(a)*r;if(!nFree(x,z)||Math.hypot(x-P.x,z-P.z)<35)continue;best=[x,z];break}q.fb=best||(q.fb||[g0.x,g0.z]);
al.forEach((b,i)=>{if(b.lvl||b.route)return;b.fleeT=6;b.heal=null;goTo(b,q.fb[0]+rnd(-3,3),q.fb[1]+rnd(-3,3),2.4,'cov')})}
if(q.ret<=0)q.fb=null;continue}
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
