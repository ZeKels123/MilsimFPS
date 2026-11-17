// ================= v44 : blessés qui réagissent, traînage d'un blessé, cadavres physiques =================
const BLS={n:{cov:0,sur:0,drag:0,pull:0},pull:null,hint:null,hT:0};
const blsFwd=(y,k)=>[Math.sin(y)*k,Math.cos(y)*k];
// ---- 1. Réactions : jambe brisée = abri et tir depuis l'abri (pas de flanc), jambes brisées = se traîne, sans arme = abri ou reddition
function blsThink(b){
 if(b.drg){b.path=null;b.decT=.5;return true}
 const g=b.g.position,pd=Math.hypot(P.x-g.x,P.z-g.z),eng=b.see||(b.alert&&b.seenT<6);
 if(b.unarm&&!b.sur){
  if(b.see&&pd<9&&!b.fleeT){tacSurrender(b);BLS.n.sur++;return true}
  if(eng&&(b.wFle||0)<TAC.t){b.wFle=TAC.t+7;const c=findCover(b,P.x,P.z,26);if(c&&goTo(b,c[0],c[1],2.4,'cov')){BLS.n.cov++;tacSay(b,'pan');b.decT=1;return true}}
  if(!b.path){b.cr=1;b.decT=.7;return true}
  return false}
 if(b.hm>=.8)return false;
 if(eng){
  if((b.wCov||0)<TAC.t&&!(b.st==='cov'&&b.path)){b.wCov=TAC.t+9;const c=findCover(b,P.x,P.z,b.hm<.35?7:12);if(c&&goTo(b,c[0],c[1],b.hm<.35?1:1.3,'cov')){BLS.n.cov++;b.decT=1;return true}}
  if(b.st==='cov'&&b.path)return true;
  b.path=null;b.cr=1;b.st='atk';b.decT=.6;return true}
 if(b.hm<.5){b.path=null;b.cr=1;b.decT=.8;return true}
 return false}
{const aT0=aiThink;aiThink=function(b){if(b.zh&&!b.dead&&!b.sur&&!b.route&&!b.lvl){try{if(blsThink(b))return}catch(e){console.error('bls',e)}}aT0(b)}}
// ---- 2. Pose : boiterie, corps qui se traîne, blessé traîné par un camarade (tête vers lui, penché en arrière)
function blsPose(b,dt,mv){
 const sd=b.sld,g=b.g;if(!sd||!sd.sg)return;
 // le décalage vertical de la boiterie est retiré avant d'être réappliqué : aux images où sldUpdate saute le soldat (loin), il s'accumulait
 if(sd.blY){sd.sg.position.y+=sd.blY;sd.blY=0}
 const h=b.drg;
 if(h&&!h.dead&&h.evac&&h.evac.w===b){
  const hy=h.g.rotation.y,[fx,fz]=blsFwd(hy,1.55),tx=h.g.position.x-fx,tz=h.g.position.z-fz;
  const k=Math.min(1,dt*9),nx=g.position.x+(tx-g.position.x)*k,nz=g.position.z+(tz-g.position.z)*k;
  if(nFree(nx,nz)){g.position.x=nx;g.position.z=nz}
  g.rotation.y=hy+Math.PI;g.rotation.x+=(-1.2-g.rotation.x)*Math.min(1,dt*6);b.cr=0;b.crA=0;b.blsLean=1;b.path=null;BLS.n.pull+=dt;return}
 if(b.drg){b.drg=null}
 if(b.blsLean){g.rotation.x+=(0-g.rotation.x)*Math.min(1,dt*6);if(Math.abs(g.rotation.x)<.02){g.rotation.x=0;b.blsLean=0}}
 const w=1-(b.hm===undefined?1:b.hm);
 if(w>.15&&mv&&b.hm>.35){sd.sg.rotation.z=Math.sin(b.ph*1.0)*.12*w*2;sd.blY=.06*w*(.5+.5*Math.sin(b.ph*2));sd.sg.position.y-=sd.blY}
 else if(b.hm<=.35&&mv){sd.sg.rotation.x=.55;sd.blY=.1;sd.sg.position.y-=.1;sd.sg.rotation.z=Math.sin(b.ph*.8)*.1}}
{const sU5=sldUpdate;sldUpdate=function(b,dt,mv){sU5(b,dt,mv);if(!(b.dead>0)&&b.zh){try{blsPose(b,dt,mv)}catch(e){console.error('blsPose',e)}}}}
// le blessé évacué est traîné : on l'accroche au camarade pendant la phase de repli
function blsDrag(){for(const h of bots){const e=h.evac;if(!e||h.dead)continue;const w=e.w;if(!w||w.dead)continue;
 if(e.ph===1){if(!w.drg){BLS.n.drag++}w.drg=h}else if(w.drg===h&&e.ph!==1){w.drg=null}}}
// ---- 3. Cadavres : empilés les uns sur les autres, traînés par le joueur (maintenir F + avancer)
function blsStack(b){let n=0;const g=b.g.position,i=bots.indexOf(b);
 for(let j=0;j<i;j++){const o=bots[j];if(!(o.dead>0)||o.dead>50||(o.fall||0)<1)continue;if(Math.abs(o.g.position.x-g.x)<.75&&Math.abs(o.g.position.z-g.z)<.75)n++}
 b.stk=Math.min(2,n);if(n)g.y+=.16*b.stk}
{const sU6=sldUpdate;sldUpdate=function(b,dt,mv){sU6(b,dt,mv);if(b.dead>0&&b.dead<50&&(b.fall||0)>1){try{blsStack(b)}catch(e){}}}}
function blsCorpseNear(r){let bb=null,bd=r;for(const o of bots){if(!(o.dead>0)||o.dead>50||(o.fall||0)<1)continue;const d=Math.hypot(o.g.position.x-P.x,o.g.position.z-P.z);if(d<bd){bd=d;bb=o}}return bb}
function blsHint(t){if(!BLS.hint){const d=document.createElement('div');d.style.cssText='position:fixed;left:50%;bottom:22%;transform:translateX(-50%);font:13px monospace;color:#dfe8d0;text-shadow:0 1px 3px #000;pointer-events:none;z-index:6;text-align:center;display:none';document.body.appendChild(d);BLS.hint=d}
 BLS.hint.style.display=t?'block':'none';if(t)BLS.hint.textContent=t}
function blsPullTick(dt){
 const mv=K.KeyW||K.KeyA||K.KeyS||K.KeyD,held=!!K.KeyF,off=ac.on||HM.dead||DRV.on||INV.open||(typeof bench!=='undefined'&&bench);
 let c=BLS.pull;
 if(c){if(!held||off||c.dead<=0||c.dead>50||Math.hypot(c.g.position.x-P.x,c.g.position.z-P.z)>3){BLS.pull=null;c.drgP=0;blsHint('');return}}
 else{if(off){blsHint('');return}const o=blsCorpseNear(1.7);if(!o){blsHint('');return}
  if(held&&mv){BLS.pull=c=o;o.drgP=1;BLS.n.pull++}else{blsHint(fouTarget()?'':'Maintiens [F] + avance : traîner le corps');return}}
 blsHint('');
 // le corps suit derrière le joueur, tête vers lui
 const sy=Math.sin(P.yaw),cy=Math.cos(P.yaw),tx=P.x+sy*1.25,tz=P.z+cy*1.25,g=c.g.position,k=Math.min(1,dt*7),nx=g.x+(tx-g.x)*k,nz=g.z+(tz-g.z)*k;
 if(nFree(nx,nz)){g.x=nx;g.z=nz}
 const dir=Math.atan2(P.x-g.x,P.z-g.z),hx_=P.x-g.x,hz_=P.z-g.z,want=c.dty!==undefined?(c.dmr?Math.atan2(hz_,-hx_):Math.atan2(-hz_,hx_))-c.dty:(c.dk===1?dir:dir+Math.PI);let dy=want-c.g.rotation.y;dy=Math.atan2(Math.sin(dy),Math.cos(dy));c.g.rotation.y+=dy*Math.min(1,dt*6);
 c.dead=Math.max(c.dead,20);c.fall=Math.max(c.fall,4.2);if(!c.dcDone)c.dcDone=1;
 if(!(BLS.nz>0))BLS.nz=.7;BLS.nz-=dt;if(BLS.nz<=0){BLS.nz=.8;noise(P.x,P.z,5)}}
{const HM0=HMV;HMV=function(){return HM0()*(BLS.pull?.5:1)}}
function blsTick(dt){try{blsDrag();blsPullTick(dt)}catch(e){console.error('blsTick',e)}}
// ---- armes lâchées : rebond sur les murs au début de leur course
{const dw0=dwUpdate;dwUpdate=function(dt){dw0(dt);for(const d of DW){if(d.rest||d.t>2.5)continue;const p=d.m.position;
 for(const o of boxes){if(o.y1<p.y-.1||o.y0>p.y+.2)continue;if(p.x<o.x0||p.x>o.x1||p.z<o.z0||p.z>o.z1)continue;const pl=p.x-o.x0,pr=o.x1-p.x,pb=p.z-o.z0,pf=o.z1-p.z,m=Math.min(pl,pr,pb,pf);
  if(m===pl){p.x=o.x0-.02;d.v.x=-Math.abs(d.v.x)*.4}else if(m===pr){p.x=o.x1+.02;d.v.x=Math.abs(d.v.x)*.4}else if(m===pb){p.z=o.z0-.02;d.v.z=-Math.abs(d.v.z)*.4}else{p.z=o.z1+.02;d.v.z=Math.abs(d.v.z)*.4}break}}}}
