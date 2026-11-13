// ================= GRENADES : modèle (flash.blend), vue à la première personne et animation de lancer =================
const NVCOL=[[0x3f4d2c,0x1e2713,0x2e2f2c],[0x585858,0x3a5fe6,0x7a7a7a],[0x2c3c5c,0x121c34,0x2e2f2c]];
function mkNade(t){const g=new THREE.Group(),lev=new THREE.Group(),C3=NVCOL[t];lev.position.set(0,.0754,0);g.add(lev);let pin=null;
NGD.forEach(d=>{const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(Float32Array.from(d.p,v=>v/1000),3));G.setIndex(d.i);
const GG=d.r?G:G.toNonIndexed();GG.computeVertexNormals();
const kind=d.m[2]>.5?1:d.m[0]>.15?2:0,mt=std(C3[kind],{roughness:kind===2?.35:.6,metalness:kind===2?.7:.25,envMapIntensity:.7});
const m=new THREE.Mesh(GG,mt);m.frustumCulled=false;m.castShadow=false;
if(d.n==='Cube'){GG.translate(0,-.0754,0);lev.add(m)}else{g.add(m);if(d.n==='Cylindre')pin=m}});
g.userData={lev,pin};return g}
// vue
const tvm=new THREE.Group();tvm.visible=false;C.add(tvm);
const THR={on:false,t:0,k:0,g:0,rel:false,pin:false,dur:1.25};
const thG=mkNade(0),thH=mkHand(true),thL=mkHand(false),thC=new THREE.Group();tvm.add(thC);thC.add(thG);thG.scale.setScalar(1);tvm.add(thH);tvm.add(thL);
function thrSet(k){THR.k=k;thC.remove(thG);const ng=mkNade(k);ng.scale.setScalar(1);thC.add(ng);Object.assign(THR,{G:ng})}
THR.G=thG;
const _tp=new THREE.Vector3(),_tv=new THREE.Vector3();
function thrTick(dt){
if(!THR.on){if(THR.g>0){THR.g=Math.max(0,THR.g-dt*5)}if(!ac.on)gun.visible=THR.g<.9;return}
const T=THR;T.t+=THR.frz?0:dt;const t=T.t,G=T.G;
// arme baissée puis relevée
T.g=t<.2?t/.2:t<T.dur-.25?1:Math.max(0,(T.dur-t)/.25);if(!ac.on)gun.visible=T.g<.9;tvm.visible=T.g>.3&&t<T.dur-.08;
// main droite + grenade (repère caméra)
const rp=kf([[0,[.24,-.55,-.38]],[.25,[.08,-.2,-.38]],[.55,[.08,-.19,-.38]],[.8,[.27,-.1,-.26]],[.9,[.2,-.08,-.34]],[1.0,[.1,-.02,-.78]],[1.15,[.1,-.15,-.8]],[1.25,[.22,-.5,-.5]]],t);
const rr=kf([[0,[-.1,0,0]],[.25,[-.35,0,0]],[.55,[-.35,0,0]],[.8,[.45,0,.2]],[.9,[.3,0,.1]],[1.0,[-.5,0,0]],[1.25,[-.5,0,0]]],t);
thH.position.set(rp[0],rp[1],rp[2]);thH.rotation.set(rr[0],0,rr[2]);
const held=t<.99;thC.visible=held;thC.position.set(rp[0]-.01,rp[1]+.04,rp[2]-.005);thC.rotation.set(rr[0]-.1,0,rr[2]);
// main gauche : va chercher la goupille puis disparaît
const lp=kf([[0,[-.4,-.6,-.2]],[.2,[-.3,-.4,-.3]],[.38,[-.045,-.12,-.4]],[.46,[-.045,-.12,-.4]],[.62,[-.2,-.18,-.36]],[.75,[-.4,-.5,-.25]],[1.25,[-.4,-.6,-.2]]],t);
thL.position.set(lp[0],lp[1],lp[2]);thL.rotation.set(.6,.7,.35);
const pn=G.userData.pin;if(pn){if(t<.44){pn.visible=true;pn.position.set(0,0,0)}else if(t<.72){pn.visible=true;const u=(t-.44)/.18;pn.position.set(Math.min(1,u)*-.1,Math.min(1,u)*.02,0)}else pn.visible=false}
if(t>.42&&!T.pin){T.pin=true;snd(1500,.04,.18,'square')}
// cuillère : s'écarte au lancer
const lev=G.userData.lev;lev.rotation.z=t>.99?-1.2:0;
if(t>=.99&&!T.rel){T.rel=true;thrRelease()}
if(t>=T.dur){T.on=false;tvm.visible=false}}
function thrRelease(){const k=THR.k;C.updateMatrixWorld();const d=new THREE.Vector3(0,0,-1).applyQuaternion(C.quaternion),p=C.position.clone().addScaledVector(d,.45);p.y-=.12;
throwNade(k,p,d.multiplyScalar(17).add(new THREE.Vector3(0,3.6,0)),null);snd(420,.09,.12,'triangle')}
