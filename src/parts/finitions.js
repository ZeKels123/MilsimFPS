// ================= FINITIONS (v39) : audio réaliste, munitions spéciales et hausse, bots (signes, abri pluie, relève de garde) =================
const AUD={delayed:0,cracks:0,urb:1,ut:0,tin:0};
// ---- retard du son : 343 m/s, les tirs et explosions lointains arrivent après l'impact visuel
function audDelay(x,y,z){return Math.hypot(x-C.position.x,y-C.position.y,z-C.position.z)/343}
const sfxShot1=sfxShot;
sfxShot=function(x,y,z,ty,vol){const t=audDelay(x,y,z);if(t>.12){AUD.delayed++;setTimeout(()=>sfxShot1(x,y,z,ty,vol),Math.min(1800,t*1000))}else sfxShot1(x,y,z,ty,vol)};
const sfxBoom1=sfxBoom;
sfxBoom=function(x,y,z,k){const t=audDelay(x,y,z);if(t>.2){AUD.delayed++;setTimeout(()=>sfxBoom1(x,y,z,k),Math.min(2500,t*1000))}else sfxBoom1(x,y,z,k)};
// ---- claquement supersonique : une balle de bot passe à moins de 3,5 m de la tête
function audCrack(x,y,z,d){try{AC=AC||new AudioContext();auInit();if(!AU.ready)return;const o=sp3(x,y,z,{noocc:1,ref:3,roll:1.5,air:19000});nz(.012,'highpass',3600,.7,1.4,o,1,.0005);nz(.05,'bandpass',2600,1.2,.9*Math.max(.35,1-d/4),o,rnd(.9,1.1),.0008);AUD.cracks++}catch(e){}}
function audCrackSeg(q,x0,y0,z0){if(q.ck||q.src!=='b')return false;const sp=balSpd(q);if(sp<343)return false;const o=C.position,dx=q.px-x0,dy=q.py-y0,dz=q.pz-z0,L=dx*dx+dy*dy+dz*dz||1e-6;let u=((o.x-x0)*dx+(o.y-y0)*dy+(o.z-z0)*dz)/L;u=Math.max(0,Math.min(1,u));
 const cx=x0+dx*u,cy=y0+dy*u,cz=z0+dz*u,d=Math.hypot(cx-o.x,cy-o.y,cz-o.z);if(d>3.5)return false;q.ck=1;audCrack(cx,cy,cz,d);if(d<1.8&&P.gy!==undefined&&!HM.dead){FXP.shake=Math.max(FXP.shake,.22);HM.pain=Math.min(1,HM.pain+.01)}return true}
const balTick1=balTick;
balTick=function(dt){const pre=[];for(const q of BAL.bl)if(q.src==='b'&&!q.ck)pre.push(q,q.px,q.py,q.pz);balTick1(dt);for(let i=0;i<pre.length;i+=4)audCrackSeg(pre[i],pre[i+1],pre[i+2],pre[i+3])};
// ---- écho urbain : plus de bâtiments autour = plus de réverbération extérieure
function audUrb(){return AUD.urb}
function audUrbTick(dt){AUD.ut-=dt;if(AUD.ut>0)return;AUD.ut=.6;let n=0;for(const r of ROOMS)if(Math.abs(r.x-P.x)<36&&Math.abs(r.z-P.z)<36)n++;AUD.urb=1+Math.min(2.2,n*.12)}
// ---- tir en intérieur sans silencieux : oreilles qui sifflent
const sfxGun1=sfxGun;
sfxGun=function(i,sup){sfxGun1(i,sup);try{if(!sup&&AU.room>=0&&AUD.tin<=0){AUD.tin=2.5;tinnitus(.22,1.4)}}catch(e){}};
// ---- munitions spéciales (touche ]) et hausse (touche /)
const AMTY=[{n:'Standard',pen:1,dmg:1,tr:0},{n:'Traçante',pen:.9,dmg:.95,tr:1},{n:'Perforante',pen:1.9,dmg:.9,tr:0}];
const WAM={},ZSET=[25,50,100,200,300,400];
const balSpawn1=balSpawn;
balSpawn=function(o,d,am,x){let t=null;if(x&&x.src==='p'&&am!=='bk'){t=AMTY[WAM[WSEL]||0];if(t.tr)x.tr=1}const q=balSpawn1(o,d,am,x);if(t){q.apk=t.pen;q.dk=t.dmg}return q};
function amtNext(){if(ac.on||bench||reloading)return;const am=balAm(WC[WSEL]);if(am==='bk')return wpnMsg('Cartouches à plombs : pas de munition spéciale');WAM[WSEL]=((WAM[WSEL]||0)+1)%AMTY.length;cd=Math.max(cd,1.1);snd(300,.08,.15,'square');wpnMsg('Munitions : '+AMTY[WAM[WSEL]].n)}
// hausse : réglage propre à l'arme (BZM), jamais partagé avec une autre arme de même calibre
function zeroStep(w){const c=WC[w],am=balAm(c);if(!BAM[am]||am==='bk')return 0;const i=ZSET.indexOf(balZm(c));BZM[w]=ZSET[(i+1)%ZSET.length];return BZM[w]}
function zeroNext(){if(ac.on)return;const z=zeroStep(WSEL);if(!z)return;snd(420,.04,.1,'square');wpnMsg('Hausse : '+z+' m')}
addEventListener('keydown',e=>{if(e.repeat||$('ov').style.display!=='none')return;if(e.code==='BracketRight')amtNext();else if(e.code==='Slash')zeroNext()});
const wpHud1=wpHud;
wpHud=function(){const am=balAm(WC[WSEL]);return wpHud1()+(am==='bk'?'':'<small style="color:#cfe3c0"> · '+AMTY[WAM[WSEL]||0].n+' · réglée '+balZm(WC[WSEL])+' m</small>')};
// ---- bots : signes de la main, abri contre la pluie, relève de garde la nuit
const GRD={posts:[],n:{relief:0,shel:0,sign:0},sT:0,gT:0,sg:8};
function grdBot(b){return !b.dead&&!b.dorm&&!b.alert&&!b.see&&b.stun<=0&&b.blind<=0&&b.fleeT<=0&&!b.lvl&&!b.route&&!b.sur&&!b.heal&&b.seenT>20}
function grdSign(b,txt){anmSign(b);if(!VX.on||Math.hypot(b.g.position.x-P.x,b.g.position.z-P.z)>45)return;vxSub('['+(['Assaut','Appui','Tireur','Lourd'][b.ty]||'Bot')+'] ✋ '+txt);GRD.n.sign++}
function grdGo(b,x,z,k){AI.budget=Math.max(AI.budget,1);return goTo(b,x,z,k,'pat')}
function grdTick(dt){const night=TOD.t>21||TOD.t<5,rain=(typeof rainU!=='undefined'?rainU.uAmt.value:0);
 // signes : un chef silencieux (hors alerte) signale à ses hommes
 GRD.sg-=dt;if(GRD.sg<=0){GRD.sg=rnd(25,40);if(typeof SQ!=='undefined')for(const q of SQ){const al=q.m.filter(b=>!b.dead);if(al.length<2||q.t>0)continue;const ld=sqLeader(al);if(ld&&grdBot(ld)){grdSign(ld,['Halte','Avancez en silence','Danger devant','Dispersez-vous','Couvrez la gauche','Repos'][Math.random()*6|0]);break}}}
 // relève de garde (nuit)
 if(!night){for(const p of GRD.posts)if(p.b)p.b.sent=0;GRD.posts.length=0}
 else{GRD.gT-=dt;if(GRD.gT<=0){GRD.gT=3;if(GRD.posts.length<3){const c=bots.find(b=>b.ty<2&&grdBot(b)&&!b.sent&&!b.relf&&!b.shel&&Math.hypot(b.g.position.x-P.x,b.g.position.z-P.z)<80);if(c){c.sent=1;GRD.posts.push({x:c.g.position.x,z:c.g.position.z,b:c,t:rnd(40,60),rel:null})}}}
  for(let i=GRD.posts.length-1;i>=0;i--){const p=GRD.posts[i],b=p.b;if(!b||b.dead||b.alert||b.see||b.stun>0||b.fleeT>0){if(b)b.sent=0;if(p.rel)p.rel.relf=0;GRD.posts.splice(i,1);continue}
   if(b.st==='pat'||!b.st){b.path=null;b.decT=Math.max(b.decT,1)}
   if(p.rel){const r=p.rel;if(r.dead||r.alert||r.see){r.relf=0;p.rel=null;p.t=10;continue}
    if(Math.hypot(r.g.position.x-p.x,r.g.position.z-p.z)<2.8){b.sent=0;r.sent=1;r.relf=0;p.b=r;p.rel=null;p.t=rnd(40,60);GRD.n.relief++;grdSign(b,'Relève')}
    else if(!r.path)grdGo(r,p.x+1.4,p.z,1.2)}
   else{p.t-=dt;if(p.t<=0){let best=null,bd=70;for(const o of bots){if(o===b||o.sent||o.relf||o.shel||o.ty>1||!grdBot(o))continue;const d=Math.hypot(o.g.position.x-p.x,o.g.position.z-p.z);if(d<bd){bd=d;best=o}}
    if(best&&grdGo(best,p.x+1.4,p.z,1.2)){best.relf=1;p.rel=best}else p.t=8}}}}
 // abri contre la pluie
 GRD.sT-=dt;if(GRD.sT<=0){GRD.sT=2.5;for(const b of bots){if(b.dead||b.dorm)continue;const g=b.g.position;
  if(rain>.4){if(!b.shel){if(grdBot(b)&&b.st==='pat'&&!b.sent&&!b.relf&&inRoom(g.x,g.z)<0&&Math.random()<.25){const cs=[];for(const r of ROOMS){const d=Math.hypot(r.x-g.x,r.z-g.z);if(d<70)cs.push([d,r])}cs.sort((u,v)=>u[0]-v[0]);for(let k=0;k<cs.length&&k<3;k++)if(grdGo(b,cs[k][1].x,cs[k][1].z,1.3)){b.shel=cs[k][1];GRD.n.shel++;break}}}
   else if(b.alert||b.see)b.shel=0;else if(inRoom(g.x,g.z)>=0){b.path=null;b.decT=Math.max(b.decT,2.5)}else if(!b.path)grdGo(b,b.shel.x,b.shel.z,1.3)}
  else if(rain<.15&&b.shel)b.shel=0}}}
function finTick(dt){anmTick(dt);perfTick(dt);AUD.tin-=dt;audUrbTick(dt);grdTick(dt);reaTick(dt)}
