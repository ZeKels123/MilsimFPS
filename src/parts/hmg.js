// ================= HMG (mitrailleuse lourde) — modèle importé de hmg.blend =================
const hmgM={};
{const g=wg[5]=new THREE.Group();g.visible=false;gun.add(g);
HMGD.forEach(d=>{const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(Float32Array.from(d.p,v=>v/1000),3));G.setIndex(d.i);
const flat=d.n==='Cube'||d.n==='Cube.001',GG=flat?G.toNonIndexed():G;GG.computeVertexNormals();
const col=new THREE.Color(d.m[0],d.m[1],d.m[2]).convertLinearToSRGB();const box=d.n==='Cube.001';
const mt=std(col.getHex(),{roughness:box?.6:.42,metalness:box?.15:.7,envMapIntensity:.8});
const m=new THREE.Mesh(GG,mt);m.frustumCulled=false;g.add(m);hmgM[d.n]=m})}
const hmgBox=hmgM['Cube.001'];
const HMGC={n:'Mitrailleuse HMG',rate:.075,rec:1.7,mag:100,res:300,dmg:30,pel:1,sp:.05,semi:0,rb:{scope:-.04,angled:-.2,holo:-.14,mg:-.02},hb:{ry:-.07,rz:.17,ly:-.07,lz:-.2,zM:0,zS:-.05},iy:-.043,wz:-.25,mz:-.5,my:0,gz:-.3,snd:[110,.1,.3],rt:4.4};
