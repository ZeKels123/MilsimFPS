// ================= VÉHICULES IMPORTÉS + PASSAGES D'AVIONS =================
// Tracteurs Lamborghini dans les cours de ferme, camions Ural et blindés Centauro le long de la route nord-sud,
// avions de chasse (F-14, F-15EX) qui traversent la carte de temps en temps (ambiance, aucun dégât).
{const vr=(s=>()=>(s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296)(7741);
const tre=window.TRE||[];
const free=(x,z,hw,hd)=>!boxes.some(o=>x+hw>o.x0-1&&x-hw<o.x1+1&&z+hd>o.z0-1&&z-hd<o.z1+1)&&!tre.some(t=>Math.hypot(t.x-x,t.z-z)<Math.max(hw,hd)+2.5);
const flat=(x,z,hw,hd)=>{const h=[GH(x-hw,z-hd),GH(x+hw,z-hd),GH(x-hw,z+hd),GH(x+hw,z+hd),GH(x,z)];return Math.max(...h)-Math.min(...h)<.7};
const put=(n,x,z,ry,hw,hd,hh)=>{const e=mdl(n),y=Math.max(GH(x-hw*.8,z-hd*.8),GH(x+hw*.8,z-hd*.8),GH(x-hw*.8,z+hd*.8),GH(x+hw*.8,z+hd*.8),GH(x,z));
e.position.set(x,y-.03,z);e.rotation.y=ry;e.traverse(m=>{if(m.isMesh&&!m.material.transparent){m.castShadow=true;m.receiveShadow=true}});e.userData.dyn=1;S.add(e);(window.VEHS=window.VEHS||[]).push([n,x,z,ry]);
const bx={x0:x-hw,x1:x+hw,z0:z-hd,z1:z+hd,y0:y,y1:y+hh};boxes.push(bx);const px=new THREE.Mesh(new THREE.BoxGeometry(hw*2,hh,hd*2),new THREE.MeshBasicMaterial());px.position.set(x,y+hh/2,z);px.visible=false;S.add(px);solids.push(px);ray.push(px);dstVeh(e,px,bx,x,y,z);return e};
// --- tracteurs dans les cours de ferme
(window.FYARD||[]).forEach(([cx,cz])=>{const x=cx+9.5,z=cz-6;if(free(x,z,2.4,1.3))put('lambo',x,z,Math.PI/2*(vr()<.5?1:-1),2.3,1.2,2.9)});
// --- convoi militaire le long de la route nord-sud (x = CT.ax), épaulements est et ouest
const xr=CT.ax,spots=[];for(let z=-330;z<700;z+=29)spots.push(z);for(let i=spots.length-1;i>0;i--){const j=(vr()*(i+1))|0;[spots[i],spots[j]]=[spots[j],spots[i]]}
const used=[];let nU=0,nC=0;
const onBrg=(x,z,hd)=>BRG.some(b=>Math.abs(x-b.x)<14&&Math.abs(z-b.z)<b.hl+hd+6);
for(const z0 of spots){if(nU>=4&&nC>=2)break;if(used.some(u=>Math.abs(u-z0)<110))continue;if(z0>-760&&z0<-340)continue;
const isC=(nC<2&&nU>=2&&vr()<.5)||(nU>=4&&nC<2),hw=isC?1.8:1.4,hd=isC?4.3:4;let done=0;
// essais : côté alterné puis l'autre côté, avec petits décalages le long de la route
for(const sd of [(nU+nC)%2?1:-1,(nU+nC)%2?-1:1])for(const dz of [0,7,-7,14,-14]){const z=z0+dz,x=xr+sd*(4+hw+1.8);
if(z>-760&&z<-340||onBrg(x,z,hd)||wDist(x,z)<12||!free(x,z,hw,hd)||!flat(x,z,hw,hd))continue;
put(isC?'centauro':'ural',x,z,sd>0?0:Math.PI,hw,hd,3);used.push(z);if(isC)nC++;else nU++;done=1;break}}
// --- passages d'avions
const AIR={t:50+vr()*50,on:null,list:['f14','f15','f15','f14']},T0=performance.now();
function jetGlow(g,y,zz,xs){xs.forEach(x=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:flareT,color:0xff9a50,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,toneMapped:false,fog:false}));s.scale.set(3.2,3.2,1);s.position.set(x,y,zz);g.add(s)})}
function airSpawn(force){const nm=typeof force==="string"?force:AIR.list[(vr()*AIR.list.length)|0],g=mdl(nm),th=vr()*Math.PI*2,sp=170+vr()*70,alt=(P.gy||0)+110+vr()*110,off=(vr()-.5)*420,R=1500;
const dx=Math.sin(th),dz=Math.cos(th),px=P.x+off*dz-dx*R,pz=P.z-off*dx-dz*R;g.position.set(px,alt,pz);g.rotation.y=th;g.rotation.z=(vr()-.5)*.25;
g.traverse(m=>{if(m.isMesh){m.castShadow=false;m.receiveShadow=false;m.frustumCulled=false}});
if(nm==='f14')jetGlow(g,1.9,-9.4,[-1.1,1.1]);else jetGlow(g,2.0,-9.6,[-1,1]);
S.add(g);const a={g,dx,dz,sp,alt,t:0,life:2*R/sp,pd:1e9,snd:null,p:g.position.clone(),s0:g.scale.x};AIR.on=a;airSnd(a);return a}
function airSnd(a){try{if(typeof AC==='undefined'||!AC)return;auInit();if(!AU.ready)return;const src=AC.createBufferSource();src.buffer=AU.nb;src.loop=true;const bp=AC.createBiquadFilter();bp.type='bandpass';bp.frequency.value=900;bp.Q.value=.6;
const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=3000;const o=AC.createOscillator();o.type='sawtooth';o.frequency.value=85;const og=AC.createGain();og.gain.value=.3;const g=AC.createGain();g.gain.value=0;const pan=AC.createStereoPanner();
src.connect(bp);bp.connect(lp);o.connect(og);og.connect(lp);lp.connect(g);g.connect(pan);pan.connect(AOUT());src.start();o.start();a.snd={src,o,g,lp,bp,pan}}catch(e){}}
function airStop(a){if(a.snd){try{a.snd.src.stop();a.snd.o.stop();a.snd.g.disconnect()}catch(e){}a.snd=null}S.remove(a.g);AIR.on=null}
let last=performance.now();
function airLoop(){requestAnimationFrame(airLoop);const now=performance.now(),dt=Math.min(.1,(now-last)/1000);last=now;airTick(dt)}
// en pause (overlay affiché) : le grondement est coupé et le passage est gelé
function airTick(dt){const ov=document.getElementById('ov');if(ov&&ov.style.display!=='none'){const q=AIR.on&&AIR.on.snd;if(q)try{q.g.gain.setTargetAtTime(0,typeof AC!=='undefined'&&AC?AC.currentTime:0,.03)}catch(e){}return}
if(!AIR.on){AIR.t-=dt;if(AIR.t<=0){airSpawn();AIR.t=90+vr()*110}return}
const a=AIR.on;a.t+=dt;const g=a.g;a.p.x+=a.dx*a.sp*dt;a.p.z+=a.dz*a.sp*dt;
const ex=a.p.x-P.x,ey=a.p.y-(P.gy+1.6),ez=a.p.z-P.z,d=Math.hypot(ex,ey,ez);{const fr=Math.min(1,C.far*.8/Math.max(d,1));g.scale.setScalar(a.s0*fr);g.position.set(P.x+ex*fr,P.gy+1.6+ey*fr,P.z+ez*fr)}
if(a.snd){const rec=(d-a.pd)/Math.max(dt,1e-3);a.pd=d;const k=340/(340+Math.max(-250,Math.min(250,rec))),s=a.snd,t=AC.currentTime;
s.src.playbackRate.setTargetAtTime(k,t,.08);s.o.frequency.setTargetAtTime(85*k,t,.08);s.bp.frequency.setTargetAtTime(500+700*k,t,.1);
s.lp.frequency.setTargetAtTime(500+6500*Math.exp(-d/450),t,.1);s.g.gain.setTargetAtTime(Math.min(1,Math.pow(170/(d+70),1.5))*.55,t,.08);
const r=(ex*Math.cos(P.yaw)-ez*Math.sin(P.yaw))/Math.max(d,1);s.pan.pan.setTargetAtTime(Math.max(-1,Math.min(1,r*1.2)),t,.05)}
if(a.t>a.life)airStop(a)}
requestAnimationFrame(airLoop);window.AIRTICK=airTick;window.AIRSHOW=airSpawn;window.AIRSTOP=airStop}

// ================= jeep UAZ-469 des camps : conduisible et destructible (même mécanisme que les autres véhicules) =================
// Le modèle regarde vers +z : on l'enveloppe dans un groupe dont l'avant (-z) est l'avant de conduite. Les maillages du décor quittent solids/ray ;
// une boîte invisible (px) porte les points de vie et la collision des balles, comme pour put().
function jeepDrv(it){if(!it||it.veh||typeof dstVeh!=='function')return null;const g=it.g,yaw=g.rotation.y,gy=GH(it.x,it.z),hh=2.1,w=1.9,d=4.3,e=new THREE.Group();
g.traverse(o=>{o.matrixAutoUpdate=true});for(let i=solids.length-1;i>=0;i--)if(solids[i].parent===g)solids.splice(i,1);for(let i=ray.length-1;i>=0;i--)if(ray[i].parent===g)ray.splice(i,1);
e.position.set(it.x,gy,it.z);e.rotation.y=yaw+Math.PI;e.userData.dyn=1;g.position.set(0,0,0);g.rotation.set(0,Math.PI,0);S.add(e);e.add(g);
const bx=it.box,px=new THREE.Mesh(new THREE.BoxGeometry(w,hh,d),new THREE.MeshBasicMaterial());px.position.set(it.x,gy+hh/2,it.z);px.rotation.y=yaw+Math.PI;px.visible=false;S.add(px);px.updateMatrixWorld(true);solids.push(px);ray.push(px);
dstVeh(e,px,bx,it.x,gy,it.z);const r=px.userData.dst;r.hp=r.max=450;r.h=yaw+Math.PI;it.veh=r;return r}
