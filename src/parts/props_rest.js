const RMS=[[-29,-8,-21,0],[21,-8,29,0],[-29,-17,-21,-11],[21,-17,29,-11],[-5,-27,5,-21]].concat(HS,[[146,-744,744,-346]]);
// v62 perf : index spatial des boîtes (cellules de 8 m, marge 6 m) : okPos était un balayage linéaire de toutes les boîtes (≈ 9 s au chargement, plus les cellules d'herbe en jeu)
const OKG={n:0,last:null,c:new Map(),odd:[],M:6,S:8,q:0};
function okgDirty(){OKG.n=-1}
function okgSync(){const n=boxes.length;if(OKG.n<0||n<OKG.n||(OKG.n&&boxes[OKG.n-1]!==OKG.last)){OKG.c.clear();OKG.odd.length=0;OKG.n=0}
for(let k=OKG.n;k<n;k++){const o=boxes[k];if(!(isFinite(o.x0)&&isFinite(o.x1)&&isFinite(o.z0)&&isFinite(o.z1))){OKG.odd.push(o);continue}
const i0=Math.floor((o.x0-OKG.M)/OKG.S),i1=Math.floor((o.x1+OKG.M)/OKG.S),j0=Math.floor((o.z0-OKG.M)/OKG.S),j1=Math.floor((o.z1+OKG.M)/OKG.S);
for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const key=i*8192+j;let a=OKG.c.get(key);if(!a)OKG.c.set(key,a=[]);a.push(o)}}
OKG.n=n;OKG.last=n?boxes[n-1]:null}
function okBox(x,z,m){if(m>OKG.M)return boxes.some(o=>x>o.x0-m&&x<o.x1+m&&z>o.z0-m&&z<o.z1+m);okgSync();
const a=OKG.c.get(Math.floor(x/OKG.S)*8192+Math.floor(z/OKG.S));if(a)for(let k=0;k<a.length;k++){const o=a[k];if(x>o.x0-m&&x<o.x1+m&&z>o.z0-m&&z<o.z1+m)return true}
for(let k=0;k<OKG.odd.length;k++){const o=OKG.odd[k];if(x>o.x0-m&&x<o.x1+m&&z>o.z0-m&&z<o.z1+m)return true}return false}
const okPos=(x,z,m)=>!okBox(x,z,m)&&!RMS.some(r=>x>r[0]-m&&x<r[2]+m&&z>r[1]-m&&z<r[3]+m)&&!(x>-8&&x<8&&z>20&&z<30);
// pad de la zone sûre
{const pg=new THREE.PlaneGeometry(14,8.4);scaleUV(pg,7,4.2);const pd=new THREE.Mesh(pg,matTile);pd.rotation.x=-Math.PI/2;pd.position.set(0,.014,25.2);pd.receiveShadow=true;S.add(pd)}
// ================= TONNEAUX =================
{const BARS=[[-7.5,6.4,0x4a5a3a],[7.5,5.3,0x8a3028],[-9.2,-2.4,0x30506a],[9.3,-1.6,0x4a5a3a],[-1.6,-10.3,0x8a3028],[5.3,-12.4,0x4a5a3a],[-22.5,11.4,0x30506a],[19.8,9.4,0x4a5a3a],[-16.8,-14.6,0x8a3028],[19.5,-11.3,0x30506a],[1.6,18.4,0x4a5a3a],[22,12,0x8a3028]],
bg=new THREE.CylinderGeometry(.3,.3,.95,18),rg=new THREE.TorusGeometry(.305,.018,6,20),rm_=std(0x2a2a2a,{roughness:.5,metalness:.6});
BARS.forEach(a=>{const x=a[0],z=a[1],cp=std(a[2],{roughness:.5,metalness:.5}),b=new THREE.Mesh(bg,[std(a[2],{map:T_barrel,roughness:.5,metalness:.45,envMapIntensity:1}),cp,cp]);b.rotation.y=rnd(0,6);b.position.set(x,.475,z);b.castShadow=b.receiveShadow=true;S.add(b);solids.push(b);const bx_={x0:x-.32,x1:x+.32,z0:z-.32,z1:z+.32},bq_={x,z,y0:0,fuel:a[2]===0x8a3028,f:a[2]===0x8a3028?1:0,st:0,t:0,fire:0,holes:[],pool:null,box:bx_,rings:[],m:b};boxes.push(bx_);b.userData.barrel=bq_;(window.BARRELS=window.BARRELS||[]).push(b);
[.15,.475,.8].forEach(y=>{const r=new THREE.Mesh(rg,rm_);r.rotation.x=Math.PI/2;r.position.set(x,y,z);r.castShadow=true;S.add(r);bq_.rings.push(r)})})}
// ================= RELIEF, ROCHERS, BUISSONS, FLAQUES =================
{const o=new THREE.Object3D(),col=new THREE.Color();
const N=110,rk=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1,0),std(0x8a877c,{roughness:.95,flatShading:true}),N);let n=0;
while(n<N){const x=rnd(-29,29),z=rnd(-29,29);if(!okPos(x,z,.4))continue;const s=rnd(.07,.28);o.position.set(x,s*.35,z);o.rotation.set(rnd(0,3),rnd(0,3),rnd(0,3));o.scale.set(s*rnd(.9,1.5),s*rnd(.5,.8),s*rnd(.9,1.4));o.updateMatrix();rk.setMatrixAt(n,o.matrix);col.setScalar(rnd(.55,1.05));rk.setColorAt(n,col);n++}
rk.castShadow=rk.receiveShadow=true;S.add(rk);
const NB=46,bs=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,1),std(0xffffff,{roughness:1,flatShading:true,envMapIntensity:.4}),NB);n=0;
while(n<NB){let x=rnd(-28.2,28.2),z=rnd(-28.2,28.2);if(n%2){if(Math.random()<.5)x=Math.sign(x)*rnd(27.2,28.5);else z=Math.sign(z)*rnd(27.2,28.5)}if(!okPos(x,z,.8))continue;const s=rnd(.45,.95);o.position.set(x,s*.38,z);o.rotation.set(0,rnd(0,6),0);o.scale.set(s,s*rnd(.55,.8),s*rnd(.9,1.2));o.updateMatrix();bs.setMatrixAt(n,o.matrix);col.setHSL(rnd(.22,.3),rnd(.3,.45),rnd(.14,.24));bs.setColorAt(n,col);n++}
bs.castShadow=bs.receiveShadow=true;S.add(bs);
const pm=std(0x2a3238,{roughness:.04,metalness:.15,envMapIntensity:1.8,transparent:true,opacity:.88,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});n=0;
while(n<7){const x=rnd(-26,26),z=rnd(-26,16),r=rnd(.8,1.8);if(!okPos(x,z,r+.3))continue;const p=new THREE.Mesh(new THREE.CircleGeometry(r,24),pm);p.rotation.x=-Math.PI/2;p.scale.y=rnd(.6,1);p.position.set(x,.016,z);p.rotation.z=rnd(0,3);S.add(p);n++}}
// ================= HERBE (v62) : vraies lames fines (triangles à pointe penchée, sans carte alpha donc sans bord dentelé), couleur pied/pointe =================
{const NBL=12,pos=[],nor=[],cl=[],idx=[];
for(let b=0;b<NBL;b++){const a=b/NBL*6.2832+hsh(b,3)*.5,rr=.03+hsh(b,5)*.22,bx=Math.cos(a)*rr,bz=Math.sin(a)*rr,hh=.5+hsh(b,7)*.5,dir=a+(hsh(b,11)-.5)*1.6,ln=.1+hsh(b,9)*.24,w=.017+hsh(b,13)*.009,
dx=Math.cos(dir),dz=Math.sin(dir),sx=-dz*w,sz=dx*w,o=pos.length/3,nl=Math.hypot(dx*.4,1,dz*.4),v=.82+hsh(b,15)*.36,y_=hsh(b,17);
pos.push(bx-sx,0,bz-sz,bx+sx,0,bz+sz,bx+dx*ln*hh,hh,bz+dz*ln*hh);for(let k=0;k<3;k++)nor.push(dx*.4/nl,1/nl,dz*.4/nl);
cl.push(.17*v,.25*v,.085*v,.17*v,.25*v,.085*v,(.4+.2*y_)*v,(.52+.1*y_)*v,(.17+.05*y_)*v);idx.push(o,o+1,o+2)}
const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setAttribute('color',new THREE.Float32BufferAttribute(cl,3));g.setIndex(idx);
const N=9000,gm=windify(std(0xffffff,{vertexColors:true,side:THREE.DoubleSide,roughness:1,envMapIntensity:.5}),0),ob=gm.onBeforeCompile;
// la face arrière d'une lame garde la même normale (sinon elle serait éclairée par en dessous, donc sombre)
gm.onBeforeCompile=sh=>{ob(sh);sh.fragmentShader=sh.fragmentShader.replace('#include <normal_fragment_begin>',THREE.ShaderChunk.normal_fragment_begin.replace('normal = normal * faceDirection;',''))};
const im=new THREE.InstancedMesh(g,gm,N);im.setColorAt(0,new THREE.Color(1,1,1));im.count=0;im.frustumCulled=false;
im.receiveShadow=true;S.add(im)}
// ================= FORÊT, POTEAUX D'ÉCLAIRAGE =================
{const N=150,mt=std(0xffffff,{roughness:1,envMapIntensity:.5}),tr=new THREE.InstancedMesh(new THREE.CylinderGeometry(.22,.4,3.2,6),std(0x4a3a2a,{roughness:1}),N),c1=new THREE.InstancedMesh(new THREE.ConeGeometry(2.1,6.5,8),mt,N),c2=new THREE.InstancedMesh(new THREE.ConeGeometry(1.5,4.5,8),mt,N),o=new THREE.Object3D(),col=new THREE.Color();
for(let i=0;i<N;i++){const a=rnd(0,6.283),r=rnd(48,105),x=Math.cos(a)*r,z=Math.sin(a)*r,h=terrainH(x,z),s=rnd(.8,1.7);
o.rotation.y=rnd(0,6);o.scale.setScalar(s);o.position.set(x,h+1.6*s,z);o.updateMatrix();tr.setMatrixAt(i,o.matrix);
o.position.set(x,h+5.65*s,z);o.updateMatrix();c1.setMatrixAt(i,o.matrix);o.position.set(x,h+8.05*s,z);o.updateMatrix();c2.setMatrixAt(i,o.matrix);
col.setHSL(.3+rnd(-.03,.03),.35,rnd(.14,.24));c1.setColorAt(i,col);c2.setColorAt(i,col)}
S.add(tr,c1,c2);
const pm=std(0x55595a,{roughness:.6,metalness:.5}),hm=new THREE.MeshBasicMaterial({color:0xfff0c8,toneMapped:false});
[[-33,-33],[33,-33],[-33,33],[33,33]].forEach(a=>{const p=new THREE.Mesh(new THREE.CylinderGeometry(.1,.16,11,8),pm);p.position.set(a[0],5.5,a[1]);p.castShadow=true;S.add(p);const h=new THREE.Mesh(new THREE.BoxGeometry(1.2,.2,.5),hm);h.position.set(a[0],11,a[1]);S.add(h)})}
