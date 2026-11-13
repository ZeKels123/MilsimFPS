// ================= BARILS DE CARBURANT : fuite, incendie, explosion retardée =================
// Seuls les barils rouges contiennent du carburant. Une balle les perce (fuite, flaque) et peut enflammer les vapeurs (20 %).
// Un baril en feu explose après 2,5 à 6 s s'il lui reste assez de carburant, sinon il brûle sans exploser.
// Les flammes (baril en feu, feu au sol) brûlent le joueur (20 PV/s, il continue de brûler 2,5 s après en être sorti) et les bots (28 PV/s).
// Une explosion proche (grenade, piège, autre baril) l'enflamme avec un délai court.
const BRL=window.BARRELS||(window.BARRELS=[]),BRS={lt:new THREE.PointLight(0xff8a30,0,10),last:performance.now(),n:0},brE=new THREE.Vector3(),brV=new THREE.Vector3();
BRS.lt.position.set(0,-50,0);S.add(BRS.lt);
const brPG=new THREE.CircleGeometry(1,22),brPM=new THREE.MeshBasicMaterial({color:0x120e08,transparent:true,opacity:.6,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}),brSM=new THREE.MeshBasicMaterial({color:0x040404,transparent:true,opacity:.55,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3});
function brGround(q,r,mat){const m=new THREE.Mesh(brPG,mat);m.rotation.x=-Math.PI/2;m.position.set(q.x,q.y0+.018,q.z);m.scale.setScalar(r);m.renderOrder=2;S.add(m);return m}
function barrelHit(q,h,dmg){const b=q.m;snd(1300+rnd(0,500),.05,.12,'triangle');
if(!q.fuel||q.st===2)return;
q.y0=b.position.y-.475;const nn=h.face.normal.clone().transformDirection(b.matrixWorld);
q.holes.push({x:h.point.x,y:h.point.y,z:h.point.z,nx:nn.x,nz:nn.z});
if(q.st===0&&q.f>.08&&Math.random()<.2)brIgnite(q,2.5+Math.random()*3.5)}
function brIgnite(q,fuse){if(q.st!==0||q.f<=.05)return;q.st=1;q.t=fuse}
function barrelBlast(x,y,z,R){for(const b of BRL){const q=b.userData.barrel;if(!q.fuel||q.st===2)continue;if(Math.hypot(q.x-x,q.z-z)>R+.3)continue;
if(q.st===0){q.f=Math.max(q.f,.7);brIgnite(q,.35+Math.random()*.9)}else if(q.t>.6)q.t=.3+Math.random()*.4}}
function brChar(q){const b=q.m;b.material.forEach(mm=>{mm.color.setHex(0x2a2622);mm.map=null;mm.roughness=.85;mm.metalness=.3;mm.needsUpdate=true});q.rings.forEach(r=>r.visible=false);
b.scale.set(1.04,.86,1.04);b.position.y=q.y0+.4085;b.rotation.x=rnd(-.1,.1);b.rotation.z=rnd(-.1,.1);if(q.pool)q.pool.visible=false;q.holes=[]}
function brExplode(q){q.st=2;q.y0=q.m.position.y>.9?q.y0:q.m.position.y-.475;const y=q.y0+.5;brChar(q);q.sc=brGround(q,1.9,brSM);q.fire=12+Math.random()*6;
nadeBoom({type:0,p:new THREE.Vector3(q.x,y,q.z),owner:null,wet:true,m:{visible:false}});
for(let i=0;i<22;i++)emit(brV.set(q.x+rnd(-.3,.3),y,q.z+rnd(-.3,.3)),brE.set(rnd(-2.5,2.5),rnd(4,9),rnd(-2.5,2.5)),{map:flareT,color:0xff8a28,size:rnd(.7,1.4),grow:.8,life:rnd(.5,1),add:1,a:.9,drag:1.2});
for(let i=0;i<14;i++)emit(brV.set(q.x+rnd(-.4,.4),y+.4,q.z+rnd(-.4,.4)),brE.set(rnd(-1.5,1.5),rnd(2,5),rnd(-1.5,1.5)),{map:puffT,color:0x151413,size:rnd(.8,1.3),grow:1.8,life:rnd(3.5,5.5),a:.65,drag:.8,g:-.6})}
function brBurnOut(q){q.st=2;brChar(q);q.sc=brGround(q,1.1,brSM);q.fire=7}
function brFireR(q){return q.st===1?Math.max(1,q.pool?q.pool.scale.x:0):(q.st===2&&q.fire>0?Math.max(.7,q.sc?q.sc.scale.x*.5:.7):0)}
function brTick(){const now=performance.now(),dt=Math.min(.2,(now-BRS.last)/1000);BRS.last=now;if(dt<=0)return;const ov=document.getElementById('ov');if(ov&&ov.style.display!=='none')return;
let best=null,bd=28,onP=false;
for(const b of BRL){const q=b.userData.barrel;if(!q.fuel)continue;const d=Math.hypot(P.x-q.x,P.z-q.z),vis=d<75,y0=q.y0,fr=brFireR(q);
if(fr>0){if(d<fr)onP=true;for(const bt of bots){if(bt.dead)continue;const g=bt.g.position;if(Math.hypot(g.x-q.x,g.z-q.z)<fr){bt.hp-=28*dt;bt.flinch=1;if(bt.hp<=0)onKill(bt,false)}}}

if(q.st<2&&q.holes.length){let leaking=false;for(const h of q.holes){if(q.f*.95>h.y-y0&&q.f>0){leaking=true;q.f=Math.max(0,q.f-.045*dt);if(vis&&Math.random()<dt*22)emit(brV.set(h.x,h.y,h.z),brE.set(h.nx*1.1,.2,h.nz*1.1),{map:puffT,color:0xb89a3c,size:.03,life:.55,a:.7,g:9})}}
if(!q.pool)q.pool=brGround(q,.2,brPM);q.pool.scale.setScalar(.25+(1-q.f)*1.25)}
if(q.st===1){q.t-=dt;const k=1-Math.min(1,q.t/4);
if(vis){const n=1+(Math.random()<.5+k*.5?1:0);for(let i=0;i<n;i++){emit(brV.set(q.x+rnd(-.14,.14),y0+.95,q.z+rnd(-.14,.14)),brE.set(rnd(-.3,.3),rnd(1.6,2.8),rnd(-.3,.3)),{map:flareT,color:0xff8a28,size:rnd(.35,.6)*(1+k*.6),grow:.3,life:.5,a:.9,add:1,drag:.5})}
if(Math.random()<.5)emit(brV.set(q.x,y0+1.1,q.z),brE.set(rnd(-.3,.3),rnd(.8,1.4),rnd(-.3,.3)),{map:puffT,color:0x1c1b1a,size:.3,grow:.9,life:2.4,a:.5,drag:1,g:-.8});
if(q.pool&&Math.random()<.6){const r=q.pool.scale.x;emit(brV.set(q.x+rnd(-r,r),y0+.08,q.z+rnd(-r,r)),brE.set(0,rnd(.7,1.4),0),{map:flareT,color:0xff7a20,size:rnd(.3,.5),life:.45,a:.8,add:1,drag:.5})}
if(Math.random()<.2)sndAt(q.x,y0+1,q.z,170+rnd(0,140),.08,.1,'sawtooth',{ref:8,roll:1,ad:60})}
if(d<bd){bd=d;best=q}
if(q.t<=0){if(q.f>.3)brExplode(q);else brBurnOut(q)}}
else if(q.st===2&&q.fire>0){q.fire-=dt;if(vis&&Math.random()<.6){const r=Math.max(.4,q.sc?q.sc.scale.x*.45:.5);emit(brV.set(q.x+rnd(-r,r),y0+.08,q.z+rnd(-r,r)),brE.set(0,rnd(.7,1.4),0),{map:flareT,color:0xff7a20,size:rnd(.3,.5),life:.45,a:.8,add:1,drag:.5});if(Math.random()<.3)emit(brV.set(q.x,y0+.5,q.z),brE.set(rnd(-.2,.2),rnd(.8,1.3),rnd(-.2,.2)),{map:puffT,color:0x1c1b1a,size:.4,grow:1,life:2.6,a:.45,drag:1,g:-.7})}
if(d<bd){bd=d;best=q}}}
if(onP&&typeof HM!=='undefined'&&!HM.dead&&!ac.on){if(!(BRS.ig>0)&&typeof hlMsg==='function')hlMsg('Vous brûlez !');BRS.ig=2.5}
if(BRS.ig>0){BRS.ig-=dt;BRS.ac=(BRS.ac||0)+dt;if(BRS.ac>=.5){BRS.ac-=.5;if(typeof hlApply==='function'){hlApply('ll',3,'o');hlApply('rl',3,'o');hlApply('a',4,'o')}}}
if(best){BRS.lt.position.set(best.x,best.y0+1.2,best.z);BRS.lt.intensity=3+Math.random()*1.6}else BRS.lt.intensity=0}
setInterval(brTick,50);
