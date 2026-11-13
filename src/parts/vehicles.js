// ================= VÉHICULES IMPORTÉS + PASSAGES D'AVIONS =================
// Tracteurs Lamborghini dans les cours de ferme, camions Ural et blindés Centauro le long de la route nord-sud,
// avions de chasse (F-14, F-15EX) qui traversent la carte de temps en temps (ambiance, aucun dégât).
{const vr=(s=>()=>(s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296)(7741);
const tre=window.TRE||[];
const free=(x,z,hw,hd)=>!boxes.some(o=>x+hw>o.x0-1&&x-hw<o.x1+1&&z+hd>o.z0-1&&z-hd<o.z1+1)&&!tre.some(t=>Math.hypot(t.x-x,t.z-z)<Math.max(hw,hd)+2.5);
const flat=(x,z,hw,hd)=>{const h=[GH(x-hw,z-hd),GH(x+hw,z-hd),GH(x-hw,z+hd),GH(x+hw,z+hd),GH(x,z)];return Math.max(...h)-Math.min(...h)<.7};
const put=(n,x,z,ry,hw,hd,hh)=>{const e=mdl(n),y=Math.max(GH(x-hw*.8,z-hd*.8),GH(x+hw*.8,z-hd*.8),GH(x-hw*.8,z+hd*.8),GH(x+hw*.8,z+hd*.8),GH(x,z));
e.position.set(x,y-.03,z);e.rotation.y=ry;e.traverse(m=>{if(m.isMesh&&!m.material.transparent){m.castShadow=true;m.receiveShadow=true}});S.add(e);(window.VEHS=window.VEHS||[]).push([n,x,z,ry]);
boxes.push({x0:x-hw,x1:x+hw,z0:z-hd,z1:z+hd,y0:y,y1:y+hh});const px=new THREE.Mesh(new THREE.BoxGeometry(hw*2,hh,hd*2),new THREE.MeshBasicMaterial());px.position.set(x,y+hh/2,z);px.visible=false;S.add(px);solids.push(px);ray.push(px);return e};
// --- tracteurs dans les cours de ferme
(window.FYARD||[]).forEach(([cx,cz])=>{const x=cx+9.5,z=cz-6;if(free(x,z,2.4,1.3))put('lambo',x,z,Math.PI/2*(vr()<.5?1:-1),2.3,1.2,2.9)});
// --- convoi militaire le long de la route nord-sud (x = CT.ax), épaulements est et ouest
const xr=CT.ax,spots=[];for(let z=-330;z<700;z+=29)spots.push(z);for(let i=spots.length-1;i>0;i--){const j=(vr()*(i+1))|0;[spots[i],spots[j]]=[spots[j],spots[i]]}
const used=[];let nU=0,nC=0;
for(const z of spots){if(nU>=4&&nC>=2)break;if(used.some(u=>Math.abs(u-z)<110))continue;if(z>-760&&z<-340)continue;
const side=(nU+nC)%2?1:-1,isC=(nC<2&&nU>=2&&vr()<.5)||(nU>=4&&nC<2),hw=isC?1.8:1.4,hd=isC?4.3:4,x=xr+side*(4+hw+1.8);
if(wDist(x,z)<12||!free(x,z,hw,hd)||!flat(x,z,hw,hd))continue;
put(isC?'centauro':'ural',x,z,side>0?0:Math.PI,hw,hd,3);used.push(z);if(isC)nC++;else nU++}
// --- passages d'avions
const AIR={t:50+vr()*50,on:null,list:['f14','f15','f15','f14']},T0=performance.now();
function jetGlow(g,y,zz,xs){xs.forEach(x=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:flareT,color:0xff9a50,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,toneMapped:false,fog:false}));s.scale.set(3.2,3.2,1);s.position.set(x,y,zz);g.add(s)})}
function airSpawn(force){const nm=AIR.list[(vr()*AIR.list.length)|0],g=mdl(nm),th=vr()*Math.PI*2,sp=170+vr()*70,alt=(P.gy||0)+110+vr()*110,off=(vr()-.5)*420,R=1500;
const dx=Math.sin(th),dz=Math.cos(th),px=P.x+off*dz-dx*R,pz=P.z-off*dx-dz*R;g.position.set(px,alt,pz);g.rotation.y=th;g.rotation.z=(vr()-.5)*.25;
g.traverse(m=>{if(m.isMesh){m.castShadow=false;m.receiveShadow=false;m.frustumCulled=false}});
if(nm==='f14')jetGlow(g,1.9,-9.4,[-1.1,1.1]);else jetGlow(g,2.0,-9.6,[-1,1]);
S.add(g);const a={g,dx,dz,sp,alt,t:0,life:2*R/sp,pd:1e9,snd:null};AIR.on=a;airSnd(a);return a}
function airSnd(a){try{if(typeof AC==='undefined'||!AC)return;auInit();if(!AU.ready)return;const src=AC.createBufferSource();src.buffer=AU.nb;src.loop=true;const bp=AC.createBiquadFilter();bp.type='bandpass';bp.frequency.value=900;bp.Q.value=.6;
const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=3000;const o=AC.createOscillator();o.type='sawtooth';o.frequency.value=85;const og=AC.createGain();og.gain.value=.3;const g=AC.createGain();g.gain.value=0;const pan=AC.createStereoPanner();
src.connect(bp);bp.connect(lp);o.connect(og);og.connect(lp);lp.connect(g);g.connect(pan);pan.connect(AOUT());src.start();o.start();a.snd={src,o,g,lp,bp,pan}}catch(e){}}
function airStop(a){if(a.snd){try{a.snd.src.stop();a.snd.o.stop();a.snd.g.disconnect()}catch(e){}a.snd=null}S.remove(a.g);AIR.on=null}
let last=performance.now();
function airLoop(){requestAnimationFrame(airLoop);const now=performance.now(),dt=Math.min(.1,(now-last)/1000);last=now;const ov=document.getElementById('ov');if(ov&&ov.style.display!=='none')return;
if(!AIR.on){AIR.t-=dt;if(AIR.t<=0){airSpawn();AIR.t=150+vr()*150}return}
const a=AIR.on;a.t+=dt;const g=a.g;g.position.x+=a.dx*a.sp*dt;g.position.z+=a.dz*a.sp*dt;
const ex=g.position.x-P.x,ey=g.position.y-(P.gy+1.6),ez=g.position.z-P.z,d=Math.hypot(ex,ey,ez);
if(a.snd){const rec=(d-a.pd)/Math.max(dt,1e-3);a.pd=d;const k=340/(340+Math.max(-250,Math.min(250,rec))),s=a.snd,t=AC.currentTime;
s.src.playbackRate.setTargetAtTime(k,t,.08);s.o.frequency.setTargetAtTime(85*k,t,.08);s.bp.frequency.setTargetAtTime(500+700*k,t,.1);
s.lp.frequency.setTargetAtTime(500+6500*Math.exp(-d/450),t,.1);s.g.gain.setTargetAtTime(Math.min(1,Math.pow(170/(d+70),1.5))*.55,t,.08);
const r=(ex*Math.cos(P.yaw)-ez*Math.sin(P.yaw))/Math.max(d,1);s.pan.pan.setTargetAtTime(Math.max(-1,Math.min(1,r*1.2)),t,.05)}
if(a.t>a.life)airStop(a)}
requestAnimationFrame(airLoop);window.AIRSHOW=airSpawn}
