const RMS=[[-29,-8,-21,0],[21,-8,29,0],[-29,-17,-21,-11],[21,-17,29,-11],[-5,-27,5,-21]].concat(HS);
const okPos=(x,z,m)=>!boxes.some(o=>x>o.x0-m&&x<o.x1+m&&z>o.z0-m&&z<o.z1+m)&&!RMS.some(r=>x>r[0]-m&&x<r[2]+m&&z>r[1]-m&&z<r[3]+m)&&!(x>-8&&x<8&&z>20&&z<30);
// pad de la zone sûre
{const pg=new THREE.PlaneGeometry(14,8.4);scaleUV(pg,7,4.2);const pd=new THREE.Mesh(pg,matTile);pd.rotation.x=-Math.PI/2;pd.position.set(0,.014,25.2);pd.receiveShadow=true;S.add(pd)}
// ================= TONNEAUX =================
{const BARS=[[-7.5,6.4,0x4a5a3a],[7.5,5.3,0x8a3028],[-9.2,-2.4,0x30506a],[9.3,-1.6,0x4a5a3a],[-1.6,-10.3,0x8a3028],[5.3,-12.4,0x4a5a3a],[-22.5,11.4,0x30506a],[19.8,9.4,0x4a5a3a],[-16.8,-14.6,0x8a3028],[19.5,-11.3,0x30506a],[1.6,18.4,0x4a5a3a],[22,12,0x8a3028]],
bg=new THREE.CylinderGeometry(.3,.3,.95,18),rg=new THREE.TorusGeometry(.305,.018,6,20),rm_=std(0x2a2a2a,{roughness:.5,metalness:.6});
BARS.forEach(a=>{const x=a[0],z=a[1],cp=std(a[2],{roughness:.5,metalness:.5}),b=new THREE.Mesh(bg,[std(a[2],{map:T_barrel,roughness:.5,metalness:.45,envMapIntensity:1}),cp,cp]);b.rotation.y=rnd(0,6);b.position.set(x,.475,z);b.castShadow=b.receiveShadow=true;S.add(b);solids.push(b);boxes.push({x0:x-.32,x1:x+.32,z0:z-.32,z1:z+.32});
[.15,.475,.8].forEach(y=>{const r=new THREE.Mesh(rg,rm_);r.rotation.x=Math.PI/2;r.position.set(x,y,z);r.castShadow=true;S.add(r)})})}
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
// ================= HERBE =================
{const gt=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');for(let i=0;i<11;i++){const bx=rnd(6,58),tx=bx+rnd(-14,14),ty=rnd(3,34),w=rnd(2.5,5),g=x.createLinearGradient(0,64,0,ty);g.addColorStop(0,'rgb(40,62,24)');g.addColorStop(1,'rgb('+(110+rnd(0,50)|0)+','+(150+rnd(0,40)|0)+',60)');x.fillStyle=g;x.beginPath();x.moveTo(bx-w,64);x.quadraticCurveTo(bx,40,tx,ty);x.quadraticCurveTo(bx+w*.4,40,bx+w,64);x.fill()}return new THREE.CanvasTexture(c)})();
gt.anisotropy=AN;const gw=.45,gh=.7,pos=[],uvs=[],nor=[],idx=[];
[0,Math.PI/2].forEach(rot=>[1,-1].forEach(fl=>{const o=pos.length/3,c=Math.cos(rot),s=Math.sin(rot);[[-gw,0,0,0],[gw,0,1,0],[gw,gh,1,1],[-gw,gh,0,1]].forEach(q=>{pos.push(q[0]*c,q[1],-q[0]*s);uvs.push(q[2],q[3]);nor.push(0,1,0)});if(fl>0)idx.push(o,o+1,o+2,o,o+2,o+3);else idx.push(o,o+2,o+1,o,o+3,o+2)}));
const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setIndex(idx);
const N=1400,im=new THREE.InstancedMesh(g,std(0xffffff,{map:gt,alphaTest:.5,roughness:1,envMapIntensity:.5}),N),o=new THREE.Object3D(),col=new THREE.Color();let n=0;
while(n<N){const x=rnd(-29.5,29.5),z=rnd(-29.5,29.5);if(!okPos(x,z,.3))continue;const s=rnd(.5,1.1);o.position.set(x,0,z);o.rotation.y=rnd(0,6.3);o.scale.set(s,s*rnd(.7,1.3),s);o.updateMatrix();im.setMatrixAt(n,o.matrix);col.setRGB(rnd(.75,1.1),rnd(.85,1.1),rnd(.65,1));im.setColorAt(n,col);n++}
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
