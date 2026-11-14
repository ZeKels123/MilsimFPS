// ================= TACTIQUE DES BOTS (v37) : annonces horaires, bonds, fumigène, moral, reddition, évacuation =================
const TAC={t:0,smk:[],log:[],n:{call:0,bound:0,smoke:0,pan:0,sur:0,evac:0}};
const TACL={ammo:['À court de munitions !','Presque à sec, couvrez-moi !','Plus qu\'un chargeur !'],med:['Médic !','Infirmier, je suis touché !','J\'ai besoin d\'un médic !'],
 smoke:['Fumée !','Je pose un fumigène !','Couvrez-vous, fumée !'],bound:['On avance par bonds, couvrez-nous !','Bond suivant, je vous couvre !','Groupe un, avancez !'],
 pan:['Je me tire !','C\'est foutu, repli !','Ils sont trop forts !'],sur:['Je me rends ! Ne tirez pas !','Stop, je me rends !','Je dépose les armes !'],
 evac:['Je t\'ai, on dégage !','Tiens bon, je te sors de là !','Accroche-toi, on décroche !'],tmp:['']};
let tacI=0;function tacInit(){if(!tacI){tacI=1;Object.assign(VX.L,TACL)}}
// heure (1-12) et distance arrondie d'une cible vue depuis l'orientation du bot
function tacClock(b,x,z){const g=b.g.position,a=Math.atan2(x-g.x,z-g.z);let r=a-b.yaw;r=Math.atan2(Math.sin(r),Math.cos(r));let h=Math.round(-r/(Math.PI/6));h=((h%12)+12)%12;return h||12}
function tacDist(b,x,z){const d=Math.hypot(x-b.g.position.x,z-b.g.position.z);return Math.max(10,Math.round(d/10)*10)}
function tacCall(b,kind){tacInit();const x=kind==='lost'?b.lk.x:P.x,z=kind==='lost'?b.lk.z:P.z,h=tacClock(b,x,z),d=tacDist(b,x,z);
 const txt=kind==='lost'?'Perdu de vue, dernier contact '+h+' heures, '+d+' mètres.':'Contact '+h+' heures, '+d+' mètres !';TAC.n.call++;TAC.log.push(txt);if(TAC.log.length>20)TAC.log.shift();TAC.last=txt;
 if(kind==='lost'&&Math.random()<.5)return;VX.L.tmp[0]=txt;vxSay(b,'tmp',kind==='lost')}
function tacSay(b,key,force){tacInit();vxSay(b,key,true,!!force)}
// ---- fumigène ----
function tacSmoke(b,q){if((q.smkCd||0)>TAC.t||b.dead)return false;const g=b.g.position,dx=P.x-g.x,dz=P.z-g.z,l=Math.hypot(dx,dz)||1;if(l<10||l>70)return false;q.smkCd=TAC.t+45;
 const k=Math.min(7,l*.35);TAC.smk.push({x:g.x+dx/l*k,z:g.z+dz/l*k,r:1,rm:6.5,t:0,pop:1.2,life:20});TAC.n.smoke++;tacSay(b,'smoke',true);return true}
const losClear0=losClear;
losClear=function(ax,ay,az,bx,by,bz){for(const s of TAC.smk){if(s.pop>0||s.t>s.life)continue;const vx=bx-ax,vz=bz-az,L=vx*vx+vz*vz||1e-6;let u=((s.x-ax)*vx+(s.z-az)*vz)/L;u=Math.max(0,Math.min(1,u));if(Math.hypot(ax+vx*u-s.x,az+vz*u-s.z)<s.r*.85)return false}return losClear0(ax,ay,az,bx,by,bz)};
function tacSmokeTick(dt){for(let i=TAC.smk.length-1;i>=0;i--){const s=TAC.smk[i];if(s.pop>0){s.pop-=dt;if(s.pop<=0){try{sfxBoom(s.x,GH(s.x,s.z)+.5,s.z,.3)}catch(e){}}continue}s.t+=dt;s.r=Math.min(s.rm,s.r+dt*2.2);
 if(s.t>s.life+6){TAC.smk.splice(i,1);continue}if(s.t<s.life&&(s.e=(s.e||0)-dt)<=0){s.e=.14;const y=GH(s.x,s.z);for(let n=0;n<3;n++){const a=Math.random()*6.28,r=Math.random()*s.r;_tv.set(s.x+Math.cos(a)*r,y+.4+Math.random()*1.2,s.z+Math.sin(a)*r);_tw.set(rnd(-.2,.2),rnd(.2,.6),rnd(-.2,.2));emit(_tv,_tw,{life:9,size:3.2,grow:1.1,color:0xd2d4d2,a:.55,drag:.4})}}}}
const _tv=new THREE.Vector3(),_tw=new THREE.Vector3();
// ---- bonds : un groupe avance pendant que l'autre couvre ----
function tacBound(q,al,dt){if(q.ret>0||q.t<=1.5){q.bd=null;return}
 const act=al.filter(b=>!b.heal&&!b.lvl&&!b.route&&b.stun<=0&&b.blind<=0&&!b.unarm&&!b.sur&&b.fleeT<=0&&b.mag>3&&!(b.ordCover>0)&&!b.see);
 const d=Math.hypot(q.lk.x-al[0].g.position.x,q.lk.z-al[0].g.position.z);if(act.length<4||d<25||d>85){q.bd=null;return}
 if(!q.bd)q.bd={g:0,t:0};q.bd.t-=dt;if(q.bd.t>0)return;q.bd.t=4.2;q.bd.g^=1;
 const adv=act.filter((b,i)=>(i&1)===q.bd.g),cov=act.filter((b,i)=>(i&1)!==q.bd.g);let n=0;
 for(const b of adv){const g=b.g.position,dx=q.lk.x-g.x,dz=q.lk.z-g.z,l=Math.hypot(dx,dz)||1,s=Math.min(15,l-18);if(s<5)continue;if(goTo(b,g.x+dx/l*s+rnd(-2,2),g.z+dz/l*s+rnd(-2,2),1.7,'atk')){b.decT=Math.max(b.decT,2.5);n++}}
 if(!n)return;cov.forEach(b=>{b.ordCover=4.4});TAC.n.bound++;const ld=sqLeader(al);if(ld&&Math.random()<.6)tacSay(ld,'bound',true)}
// ---- moral ----
function tacMorale(q,al,dt){const ld=sqLeader(al);
 if(q.mDead===undefined)q.mDead=0;const dead=q.n0-al.length;if(dead>q.mDead){for(const b of al)b.mor=Math.max(0,(b.mor===undefined?1:b.mor)-.17*(dead-q.mDead));q.mDead=dead}if(dead===0)q.mDead=0;
 for(const b of al){if(b.mor===undefined)b.mor=1;const g=b.g.position,hp=b.hp;
  if(b.hpM!==undefined&&hp<b.hpM)b.mor-=Math.min(.3,(b.hpM-hp)/b.T.hp*.7);b.hpM=hp;
  if(b.see){const pd=Math.hypot(P.x-g.x,P.z-g.z);if(pd<12)b.mor-=dt*.012*(b.ty===3?.2:1);if(AI.heat>5)b.mor-=dt*.004}
  else b.mor+=dt*.008;if(ld&&ld!==b&&Math.hypot(ld.g.position.x-g.x,ld.g.position.z-g.z)<16)b.mor+=dt*.01;
  b.mor=Math.max(0,Math.min(1,b.mor));
  if(b.sur){b.see=false;b.path=null;b.decT=.5;continue}
  if(b.pnc>0){b.pnc-=dt;if(b.pnc<=0)b.mor=Math.min(1,b.mor+.2)}
  else if(b.mor<.3&&b.ty<3&&q.t>0&&!b.lvl&&!b.route&&b.stun<=0){
   const alone=al.length<=2||sqHurt(b)>.45;
   if(b.mor<.12&&alone&&Math.hypot(P.x-g.x,P.z-g.z)<30){tacSurrender(b)}
   else{b.pnc=7;b.fleeT=6;b.heal=null;b.ordCover=0;TAC.n.pan++;tacSay(b,'pan');
    const a=Math.atan2(g.x-P.x,g.z-P.z);for(let n=0;n<8;n++){const r=rnd(26,40),x=g.x+Math.sin(a+rnd(-.7,.7))*r,z=g.z+Math.cos(a+rnd(-.7,.7))*r;if(nFree(x,z)&&goTo(b,x,z,2.5,'cov'))break}}}}}
function tacSurrender(b){if(b.sur||b.dead)return;b.sur=1;b.unarm=1;b.see=false;b.alert=0;b.st='sur';b.path=null;b.cr=1;b.fleeT=0;b.heal=null;try{if(b.wp&&b.wp.visible){dropWeapon(b,0);b.wp.visible=false}}catch(e){}
 TAC.n.sur++;tacSay(b,'sur',true);try{feed('Un ennemi se rend')}catch(e){}}
function tacLoot(){for(const b of bots){if(!b.sur||b.dead||b.looted)continue;if(Math.hypot(b.g.position.x-P.x,b.g.position.z-P.z)<2.3){b.looted=1;try{invLoot(b)}catch(e){}try{feed('Prisonnier fouillé')}catch(e){}}}}
// ---- évacuation d'un blessé ----
function tacEvac(q,al,dt){if(q.ret>0||q.t<=0)return;q.evT=(q.evT||0)-dt;if(q.evT>0)return;q.evT=2;
 for(const b of al){if(b.evac){const e=b.evac;e.t-=dt*2;const w=e.w;if(!w||w.dead||e.t<=0||b.see){b.evac=null;if(w)w.evacBy=null;continue}if(b.path||w.path)continue;b.evac=null;w.evacBy=null;w.heal={t:4,tgt:null,passive:1};b.heal={t:4,tgt:null,passive:1};}}
 const w=al.find(b=>!b.evacBy&&!b.sur&&sqHurt(b)>.45&&!b.heal&&!b.lvl&&!b.route);if(!w)return;
 if(!w.mcall||w.mcall<TAC.t){w.mcall=TAC.t+14;tacSay(w,'med')}
 const h=al.filter(b=>b!==w&&!b.evac&&!b.heal&&!b.see&&!b.lvl&&!b.route&&b.stun<=0&&!b.sur&&sqHurt(b)<.2).sort((a,c)=>Math.hypot(a.g.position.x-w.g.position.x,a.g.position.z-w.g.position.z)-Math.hypot(c.g.position.x-w.g.position.x,c.g.position.z-w.g.position.z))[0];
 if(!h)return;const gw=w.g.position,gh=h.g.position;if(Math.hypot(gw.x-gh.x,gw.z-gh.z)>30)return;
 const a=Math.atan2(gw.x-P.x,gw.z-P.z);let ok=false;for(let n=0;n<10&&!ok;n++){const r=rnd(16,26),x=gw.x+Math.sin(a+rnd(-.8,.8))*r,z=gw.z+Math.cos(a+rnd(-.8,.8))*r;if(!nFree(x,z)||Math.hypot(x-P.x,z-P.z)<25)continue;
  if(goTo(h,gw.x,gw.z,2,'hnt')){h.evac={w,t:16,cx:x,cz:z,ph:0};w.evacBy=h;w.fleeT=0;ok=true;h.evacTo=[x,z]}}
 if(ok){TAC.n.evac++;tacSay(h,'evac',true)}}
function tacEvacMove(){for(const b of bots){const e=b.evac;if(!e||b.dead)continue;const w=e.w;if(!w||w.dead){b.evac=null;continue}const d=Math.hypot(b.g.position.x-w.g.position.x,b.g.position.z-w.g.position.z);
 if(e.ph===0&&d<2.6){e.ph=1;b.fleeT=5;w.fleeT=5;goTo(b,e.cx,e.cz,.95,'cov');goTo(w,e.cx+rnd(-1.5,1.5),e.cz+rnd(-1.5,1.5),.95,'cov')}
 else if(e.ph===1&&(b.fleeT<=1||w.fleeT<=1)){b.fleeT=Math.max(b.fleeT,3);w.fleeT=Math.max(w.fleeT,3)}}}
// ---- appels : munitions / médic ----
function tacCalls(al){for(const b of al){if(b.mag>3)b.ammoC=0;else if(!b.ammoC&&b.mag>0&&b.ty!==3){b.ammoC=1;tacSay(b,'ammo')}
 if(sqHurt(b)>.3&&(b.mcall||0)<TAC.t&&!b.sur){b.mcall=TAC.t+14;tacSay(b,'med')}}}
function tacSmokeUse(q,al){if(q.ret>0&&!q.smkDone){q.smkDone=1;const b=al.find(b=>b.ty<2&&!b.sur);if(b)tacSmoke(b,q)}if(!(q.ret>0))q.smkDone=0;
 const w=al.find(b=>b.evac);if(w&&w.see)tacSmoke(w,q)}
function tacTick(dt){tacInit();TAC.t+=dt;tacSmokeTick(dt);if(!sqInit_)return;
 for(const q of SQ){const al=q.m.filter(b=>!b.dead);if(!al.length)continue;tacMorale(q,al,dt);tacBound(q,al,dt);tacEvac(q,al,dt);tacCalls(al);tacSmokeUse(q,al)}
 tacEvacMove();tacLoot()}
