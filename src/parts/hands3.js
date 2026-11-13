// ================= MAINS À SQUELETTE (hand_with_gloves.glb) : gant + manche, 21 os, doigts animables =================
// repère du modèle : poignet à l'origine, doigts vers -z, paume vers -y, avant-bras vers +z. Le modèle est une main DROITE (dos vers +y, paume vers -y, pouce en -x) ; les doigts se ferment vers -y.
const HR={tex:null,geo:null,fin:[5,9,13,17],ids:null};
function hrInit(){if(HR.geo)return;HR.tex=HND.parts.map(p=>{const t=new THREE.TextureLoader().load(p.tex);t.anisotropy=4;return t});
HR.geo=HND.parts.map(p=>{const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(Float32Array.from(p.p,v=>v/1e4),3));
G.setAttribute('normal',new THREE.BufferAttribute(Float32Array.from(p.nr,v=>v/100),3));G.setAttribute('uv',new THREE.BufferAttribute(Float32Array.from(p.u,v=>v/1000),2));
G.setAttribute('skinIndex',new THREE.BufferAttribute(Uint16Array.from(p.s),4));G.setAttribute('skinWeight',new THREE.BufferAttribute(Float32Array.from(p.w,v=>v/100),4));G.setIndex(p.i);return G})}
// mirror : main droite (miroir x) ; renvoie un groupe {g, B (os), mats}
function mkRig(mirror){hrInit();const g=new THREE.Group(),B=HND.bones.map(b=>{const o=new THREE.Bone();o.position.set(b.t[0],b.t[1],b.t[2]);o.quaternion.set(b.q[0],b.q[1],b.q[2],b.q[3]);
const pq=new THREE.Quaternion(b.pq[0],b.pq[1],b.pq[2],b.pq[3]).invert();o.userData={qr:o.quaternion.clone(),ax:new THREE.Vector3(1,0,0).applyQuaternion(pq),ay:new THREE.Vector3(0,1,0).applyQuaternion(pq),az:new THREE.Vector3(0,0,1).applyQuaternion(pq)};return o});
HND.bones.forEach((b,i)=>{if(b.p<0)g.add(B[i]);else B[b.p].add(B[i])});g.updateMatrixWorld(true);const sk=new THREE.Skeleton(B);
HR.geo.forEach((G,j)=>{const mt=new THREE.MeshLambertMaterial({map:HR.tex[j],skinning:true,emissive:0xffffff,emissiveMap:HR.tex[j],emissiveIntensity:.3});const m=new THREE.SkinnedMesh(G,mt);m.frustumCulled=false;m.bind(sk,new THREE.Matrix4());g.add(m)});
const w=new THREE.Group();w.add(g);if(mirror)w.scale.x=-1;w.userData={B,rig:1};return w}
const _q=new THREE.Quaternion();
function bRot(b,axis,a){const u=b.userData;_q.setFromAxisAngle(axis==='x'?u.ax:axis==='y'?u.ay:u.az,a);b.quaternion.copy(_q).multiply(u.qr)}
// c : fermeture des doigts 0..1 (tableau de 4 possible), t : pouce 0..1
function hPose(w,c,t,sp){const B=w.userData.B,cs=Array.isArray(c)?c:[c,c,c,c];
HR.fin.forEach((b0,k)=>{let b=b0,i=0;const a=[.0,1.35,1.45,.9];const f=cs[k];while(b>=0&&i<4){const o=B[b];bRot(o,'x',-a[i]*f);b=HND.bones.findIndex((q,qi)=>q.p===b&&qi!==1);i++}});
if(sp!==undefined)HR.fin.forEach((b0,k)=>{bRot(B[b0],'y',(k-1.5)*sp*(1-.7*(Array.isArray(c)?c[k]:c)))});
const th=[2,3,4];bRot(B[2],'y',-t*.8);B[3].quaternion.copy(B[3].userData.qr);bRot(B[3],'x',-t*.7);bRot(B[4],'x',-t*.8)}

// mains en jeu : même interface que les anciennes mains en boîtes (groupe positionné par le code d'arme)
function mkHand(r,par){const g=new THREE.Group(),w=mkRig(!r);w.position.set(0,0,.05);g.add(w);g.userData={rig:w};
if(!par){g.rotation.order='XYZ';if(r){g.rotation.set(.3,-.15,-Math.PI/2);hPose(w,[.85,.85,.8,.75],.55)}else{g.rotation.set(.3,.2,Math.PI);hPose(w,[.6,.62,.6,.55],.35)}}
else hPose(w,r?[.95,.95,.95,.95]:[.35,.3,.3,.3],r?.8:.2);
(par||gun).add(g);return g}
