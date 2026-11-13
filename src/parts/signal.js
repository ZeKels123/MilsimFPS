// ================= SIGNAL 50 (fusil de précision bullpup semi-auto .50) — modèle importé de signal_50.blend =================
const sigM={};
{const g=wg[4],b=wm[4];
g.children.slice().forEach(c=>{if(c!==b&&c!==sMag&&c!==scBI&&!extV.includes(c))g.remove(c)});
b.children.slice().forEach(c=>b.remove(c));
extV.filter(c=>c.parent===g).forEach(c=>{c.position.set(0,-.2,.2);c.scale.set(1.6,1.4,3)});scBI.scale.setScalar(.0001);sMag.scale.setScalar(.0001);
SGD.forEach(d=>{const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(Float32Array.from(d.p,v=>v/1000),3));G.setIndex(d.i);
const GG=d.r?G:G.toNonIndexed();GG.computeVertexNormals();
const col=new THREE.Color(d.m[0],d.m[1],d.m[2]).convertLinearToSRGB();
const mt=std(col.getHex(),{roughness:Math.max(.3,d.m[4]*.8),metalness:Math.max(.35,d.m[3]),envMapIntensity:.8});
if(d.m[1]>.5&&d.m[2]>.7){mt.roughness=.08;mt.metalness=.9}
const m=new THREE.Mesh(GG,mt);m.frustumCulled=false;(d.n==='culasse'?b:g).add(m);(sigM[d.n]=sigM[d.n]||[]).push(m)})}
