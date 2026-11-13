// ================= RECLAMER 12 (fusil à pompe, 6 cartouches, rechargement 2 par 2) — modèle importé de reclamer_12.blend =================
const rcM={},SGR={N:0,d:0};
function creaseGeo(P,I,ang){const n=I.length/3,fn=[],adj=new Map();
for(let f=0;f<n;f++){const a=I[f*3]*3,b=I[f*3+1]*3,c=I[f*3+2]*3;const ux=P[b]-P[a],uy=P[b+1]-P[a+1],uz=P[b+2]-P[a+2],vx=P[c]-P[a],vy=P[c+1]-P[a+1],vz=P[c+2]-P[a+2];
let x=uy*vz-uz*vy,y=uz*vx-ux*vz,z=ux*vy-uy*vx;const l=Math.hypot(x,y,z)||1;fn.push([x/l,y/l,z/l]);
for(let k=0;k<3;k++){const v=I[f*3+k];(adj.get(v)||adj.set(v,[]).get(v)).push(f)}}
const pos=new Float32Array(n*9),nor=new Float32Array(n*9),ct=Math.cos(ang);
for(let f=0;f<n;f++)for(let k=0;k<3;k++){const v=I[f*3+k],o=f*9+k*3;pos[o]=P[v*3]/1000;pos[o+1]=P[v*3+1]/1000;pos[o+2]=P[v*3+2]/1000;
let sx=0,sy=0,sz=0;const q=fn[f];adj.get(v).forEach(g=>{const r=fn[g];if(r[0]*q[0]+r[1]*q[1]+r[2]*q[2]>ct){sx+=r[0];sy+=r[1];sz+=r[2]}});
const l=Math.hypot(sx,sy,sz)||1;nor[o]=sx/l;nor[o+1]=sy/l;nor[o+2]=sz/l}
const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(pos,3));G.setAttribute('normal',new THREE.BufferAttribute(nor,3));return G}
{const g=wg[3],pump=wm[3];
g.children.slice().forEach(c=>{if(c!==pump&&!extV.includes(c))g.remove(c)});
pump.children.slice().forEach(c=>pump.remove(c));
extV.filter(c=>c.parent===g).forEach(c=>{c.position.set(0,-.046,-.69);c.scale.set(.9,.9,1.1)});
RCD.forEach(d=>{const G=creaseGeo(d.p,d.i,.62);
const col=new THREE.Color(d.m[0],d.m[1],d.m[2]).convertLinearToSRGB();
const mt=std(col.getHex(),{roughness:Math.max(.3,d.m[4]*.85),metalness:Math.max(.25,d.m[3]),envMapIntensity:.8});
const m=new THREE.Mesh(G,mt);m.frustumCulled=false;(d.n==='Cube'?pump:g).add(m);(rcM[d.n]=rcM[d.n]||[]).push(m)})}
// cartouches latérales (porte-cartouches) : visibles selon la réserve
const rcSide=['cartouche.001','Cylindre','Cylindre.001','Cylindre.002','Cylindre.003'].map(n=>rcM[n]||[]);
function rcSideUpd(){const r=typeof reserve==='number'?reserve:9;rcSide.forEach((a,i)=>a.forEach(m=>{m.visible=i===0?r>0:r>=i*2}))}
