// ================= GRENADES : modèle (flash.blend), vue à la première personne et animation de lancer =================
const NVCOL=[[0x3f4d2c,0x1e2713,0x2e2f2c],[0x585858,0x3a5fe6,0x7a7a7a],[0x2c3c5c,0x121c34,0x2e2f2c]];
function mkNade(t){const g=new THREE.Group(),lev=new THREE.Group(),C3=NVCOL[t];lev.position.set(0,.0754,0);g.add(lev);const pin=new THREE.Group();g.add(pin);
NGD.forEach(d=>{const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(Float32Array.from(d.p,v=>v/1000),3));G.setIndex(d.i);
const GG=d.r?G:G.toNonIndexed();GG.computeVertexNormals();
const kind=d.m[2]>.5?1:d.m[0]>.15?2:0,mt=std(C3[kind],{roughness:kind===2?.35:.6,metalness:kind===2?.7:.25,envMapIntensity:.7});
const m=new THREE.Mesh(GG,mt);m.frustumCulled=false;m.castShadow=false;
if(d.n==='Cube'){GG.translate(0,-.0754,0);lev.add(m)}else if(d.n==='Cylindre'||d.n==='Plan')pin.add(m);else g.add(m)});
g.userData={lev,pin};return g}
// vue : mains articulées (doigts à 3 phalanges, pouce) et bras à deux segments reliés poignet-coude-épaule
const tvm=new THREE.Group();tvm.visible=false;C.add(tvm);
const THR={on:false,t:0,k:0,g:0,rel:false,pin:false,dur:1.25};
function mkHand2(sg){const g=new THREE.Group(),F=[];bx(.07,.026,.09,0,0,-.044,SK,g);bx(.062,.034,.045,0,0,.016,SKd,g);
[.036,.041,.038,.03].forEach((L,i)=>{const a=new THREE.Group();a.position.set(-sg*(1.5-i)*.0175,0,-.086);g.add(a);bx(.0158,.017,L+.006,0,0,-L/2,SK,a);
const L2=L*.72,b=new THREE.Group();b.position.set(0,0,-L);a.add(b);bx(.015,.016,L2+.005,0,0,-L2/2,SK,b);
const L3=L*.6,c=new THREE.Group();c.position.set(0,0,-L2);b.add(c);bx(.014,.015,L3,0,0,-L3/2,SK,c);bx(.011,.003,L3*.5,0,.008,-L3*.62,NLm,c);F.push([a,b,c])});
const t1=new THREE.Group();t1.position.set(-sg*.034,-.006,-.024);g.add(t1);bx(.02,.02,.044,0,0,-.019,SK,t1);
const t2=new THREE.Group();t2.position.set(0,0,-.04);t1.add(t2);bx(.018,.018,.032,0,0,-.016,SK,t2);bx(.012,.003,.014,0,.0095,-.024,NLm,t2);
g.traverse(m=>{m.frustumCulled=false});g.userData={F,t1,t2,sg};tvm.add(g);return g}
function handCurl(h,c,tc){const u=h.userData;u.F.forEach(f=>{f[0].rotation.x=-c*1.15;f[1].rotation.x=-c*1.25;f[2].rotation.x=-c*.75});u.t1.rotation.set(-tc*.55,u.sg*(.8-tc*.4),0);u.t2.rotation.x=-tc*.7}
const thH=mkHand2(1),thL=mkHand2(-1),thC=new THREE.Group();thH.add(thC);thC.position.set(0,-.038,-.06);thC.rotation.z=Math.PI/2;
const thArm=[0,1].map(()=>{const u=bx(.085,.085,1,0,0,0,SLV,tvm),f=bx(.066,.066,1,0,0,0,SLV,tvm);u.frustumCulled=f.frustumCulled=false;return[u,f]});
const thPin=new THREE.Group();thL.add(thPin);thPin.position.set(0,-.03,-.125);thPin.visible=false;
{const q=mkNade(1).userData.pin;q.children.slice().forEach(m=>{m.geometry.translate(0,-.07,0);thPin.add(m)})}
function thrSet(k){THR.k=k;while(thC.children.length)thC.remove(thC.children[0]);const ng=mkNade(k);ng.rotation.y=-Math.PI/2;thC.add(ng);THR.G=ng}
thrSet(0);
const _h1=new THREE.Vector3(),_h2=new THREE.Vector3(),_h3=new THREE.Vector3(),_h4=new THREE.Vector3(),_hz=new THREE.Vector3(0,0,1);
function thrSeg(m,A,B){_h4.subVectors(B,A);const l=_h4.length()||1e-4;m.position.copy(A).addScaledVector(_h4,.5);m.scale.z=l;m.quaternion.setFromUnitVectors(_hz,_h4.multiplyScalar(1/l))}
function thrArm(h,S,pole,ar){h.updateMatrix();const W=_h1.set(0,0,.03).applyMatrix4(h.matrix),L1=.34,L2=.3;_h2.subVectors(W,S);const d=_h2.length()||1e-4;_h2.multiplyScalar(1/d);
const dd=Math.min(d,L1+L2-.005),a=(L1*L1-L2*L2+dd*dd)/(2*dd),hh=Math.sqrt(Math.max(0,L1*L1-a*a));_h3.copy(pole).addScaledVector(_h2,-pole.dot(_h2)).normalize();
const E=new THREE.Vector3().copy(S).addScaledVector(_h2,a).addScaledVector(_h3,hh);thrSeg(ar[0],S,E);thrSeg(ar[1],E,W.clone())}
const THS=[new THREE.Vector3(.25,-.3,.02),new THREE.Vector3(-.25,-.3,.02)],THP=[new THREE.Vector3(.55,-.83,0),new THREE.Vector3(-.55,-.83,0)],_tl=new THREE.Vector3();
function thrTick(dt){
if(!THR.on){if(THR.g>0){THR.g=Math.max(0,THR.g-dt*5)}if(!ac.on)gun.visible=THR.g<.9;return}
const T=THR;T.t+=THR.frz?0:dt;const t=T.t,G=T.G,held=t<.99;
T.g=t<.2?t/.2:t<T.dur-.25?1:Math.max(0,(T.dur-t)/.25);if(!ac.on)gun.visible=T.g<.9;tvm.visible=T.g>.3&&t<T.dur-.08;
// main droite : paume vers la gauche, pouce en haut, grenade serrée dans la paume
const rp=kf([[0,[.2,-.5,-.3]],[.25,[.1,-.17,-.4]],[.62,[.1,-.17,-.4]],[.82,[.3,-.05,-.32]],[.92,[.24,-.03,-.36]],[1.0,[.14,-.02,-.5]],[1.12,[.12,-.2,-.5]],[1.25,[.2,-.5,-.3]]],t);
const rr=kf([[0,[.2,.3,0]],[.25,[.25,.35,0]],[.62,[.25,.35,0]],[.82,[1.0,.1,.15]],[.92,[.6,.1,.1]],[1.0,[-.4,.1,0]],[1.12,[-.9,.1,0]],[1.25,[-.9,.1,0]]],t);
thH.position.set(rp[0],rp[1],rp[2]);thH.rotation.set(rr[0],rr[1],-Math.PI/2+rr[2]);handCurl(thH,held?1:.2,held?1:.15);thC.visible=held;
// main gauche : paume vers le bas, doigts vers la goupille, pince puis arrache
thH.updateMatrix();_tl.set(-.08,-.038,-.06).applyMatrix4(thH.matrix);const Lw=[_tl.x-.125,_tl.y+.04,_tl.z+.01],RS=[-.3,-.6,-.3];
const lp=kf([[0,RS],[.2,[-.22,-.35,-.36]],[.4,Lw],[.46,Lw],[.6,[Lw[0]-.15,Lw[1]+.02,Lw[2]+.02]],[.8,RS],[1.25,RS]],t);
const lr=kf([[0,[.2,-.4,.5]],[.2,[.1,-.8,.3]],[.4,[-.2,-1.35,0]],[.6,[-.2,-1.35,0]],[.8,[.2,-.4,.5]],[1.25,[.2,-.4,.5]]],t);
thL.position.set(lp[0],lp[1],lp[2]);thL.rotation.set(lr[0],lr[1],lr[2]);const pc=t>.34&&t<.74;handCurl(thL,pc?.5:.25,pc?.9:.2);
G.userData.pin.visible=t<.46;thPin.visible=t>=.46&&t<.74;
if(t>.46&&!T.pin){T.pin=true;snd(1500,.04,.18,'square')}
G.userData.lev.rotation.z=0;
thrArm(thH,THS[0],THP[0],thArm[0]);thrArm(thL,THS[1],THP[1],thArm[1]);
if(t>=.99&&!T.rel){T.rel=true;thrRelease()}
if(t>=T.dur){T.on=false;tvm.visible=false}}
function thrRelease(){const k=THR.k;C.updateMatrixWorld();const d=new THREE.Vector3(0,0,-1).applyQuaternion(C.quaternion),p=C.position.clone().addScaledVector(d,.45);p.y-=.12;
throwNade(k,p,d.multiplyScalar(17).add(new THREE.Vector3(0,3.6,0)),null);snd(420,.09,.12,'triangle')}
