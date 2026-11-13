// ================= CHAMPS AGRICOLES (nord-ouest) + FORÊT (sud-ouest) (v15) =================
const FARM={x0:-750,x1:-227,z0:-750,z1:-290},FOR={x0:-750,x1:40,z0:408,z1:750};
const inFarm=(x,z)=>x>FARM.x0&&x<FARM.x1&&z>FARM.z0&&z<FARM.z1,inFor=(x,z)=>x>FOR.x0&&x<FOR.x1&&z>FOR.z0&&z<FOR.z1;
const nzSkip=(x,z)=>inFor(x,z)||(inFarm(x,z)&&Math.random()<.93);
{let sd=777;const rn=()=>(sd=(Math.imul(sd,1664525)+1013904223)>>>0)/4294967296;
const KIND=[{g:'#b69a48',r:0xd4b45a,h:.95,w:.55,sp:1.3},{g:'#6a5a30',r:0x5f8c32,h:2.1,w:.75,sp:1.6},{g:'#5a4429',r:0x86c04c,h:.32,w:.5,sp:1.2},{g:'#58402a',r:0x4a3323,h:.28,w:.6,sp:1.4},{g:'#a89a38',r:0xe2c81e,h:1.15,w:.6,sp:1.3},{g:'#6f9a3c',r:0,h:0,w:0,sp:0}];
const gT={};const gTex=(k,o)=>{const id=k+'_'+o;if(gT[id])return gT[id];const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),K=KIND[k];g.fillStyle=K.g;g.fillRect(0,0,128,128);
for(let i=0;i<2600;i++){g.fillStyle='rgba('+(rn()<.5?'255,255,255':'0,0,0')+','+rn()*.12+')';g.fillRect(rn()*128,rn()*128,1+rn()*2,1+rn()*3)}
if(K.sp){for(let i=0;i<8;i++){g.fillStyle='rgba(0,0,0,.22)';o?g.fillRect(0,i*16+5,128,5):g.fillRect(i*16+5,0,5,128);g.fillStyle='rgba(255,255,255,.07)';o?g.fillRect(0,i*16+11,128,3):g.fillRect(i*16+11,0,3,128)}}
const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return gT[id]=t};
const fbox=(w,h,d,x,y,z,mat)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y+h/2,z);m.castShadow=m.receiveShadow=true;S.add(m);solids.push(m);boxes.push({x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2,y0:y,y1:y+h});return m};
const CW=66,CH=48,GP=6,cells=[];
for(let x=FARM.x0+8;x+CW<FARM.x1-4;x+=CW+GP)for(let z=FARM.z0+8;z+CH<FARM.z1-4;z+=CH+GP){let ok=true;
for(let u=0;u<=CW&&ok;u+=11)for(let v=0;v<=CH;v+=11){const px=x+u,pz=z+v;if(!okPos(px,pz,5)||wDist(px,pz)<5||nearPath(px,pz,5)||HS.some(r=>px>r[0]-9&&px<r[2]+9&&pz>r[1]-9&&pz<r[3]+9)){ok=false;break}}
if(ok)cells.push([x,z,x+CW,z+CH])}
const pool=[0,0,1,1,2,3,4,4,5,0,3,1],RW=[[],[],[],[],[]],bales=[],hed=[],col=new THREE.Color();
const redM=std(0x8a3a2c,{roughness:.9}),roofM=std(0x4a4d50,{roughness:.8}),silM=std(0xb9bcbd,{roughness:.5,metalness:.4});
cells.forEach((c,ci)=>{const[x0,z0,x1,z1]=c,cx=(x0+x1)/2,cz=(z0+z1)/2;RMS.push([x0-1,z0-1,x1+1,z1+1]);
if(rn()<.08){const gy=Math.max(GH(cx,cz),GH(cx-9,cz),GH(cx+9,cz));const gm=new THREE.Mesh(new THREE.PlaneGeometry(CW,CH,1,1),std(0x7b6a48,{roughness:1}));gm.rotation.x=-Math.PI/2;gm.position.set(cx,gy+.05,cz);gm.receiveShadow=true;S.add(gm);
fbox(16,6,10,cx-8,gy,cz,redM);for(const sg of[-1,1]){const rf=new THREE.Mesh(new THREE.BoxGeometry(17,.3,6.4),roofM);rf.position.set(cx-8,gy+7.1,cz+sg*2.5);rf.rotation.x=sg*.5;rf.castShadow=true;S.add(rf)}
fbox(5.4,11,5.4,cx+8,gy,cz+4,silM);const dm=new THREE.Mesh(new THREE.SphereGeometry(2.7,10,6,0,6.283,0,1.57),silM);dm.position.set(cx+8,gy+11,cz+4);S.add(dm);
for(let k=0;k<6;k++)bales.push([cx+rn()*30-15,cz+14+rn()*6,rn()*3]);return}
const k=pool[(ci*7+((rn()*12)|0))%pool.length],K=KIND[k],o=rn()<.5?1:0;
const gm=new THREE.Mesh(new THREE.PlaneGeometry(CW,CH,Math.ceil(CW/3),Math.ceil(CH/3)),std(0xffffff,{map:gTex(k,o),roughness:1,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));gm.material.map=gm.material.map.clone();gm.material.map.needsUpdate=true;gm.material.map.repeat.set(CW/10.4,CH/10.4);
gm.rotation.x=-Math.PI/2;gm.position.set(cx,0,cz);const pa=gm.geometry.attributes.position;for(let i=0;i<pa.count;i++){const wx=cx+pa.getX(i),wz=cz-pa.getY(i);pa.setZ(i,GH(wx,wz)+.04)}gm.geometry.computeVertexNormals();gm.receiveShadow=true;S.add(gm);
if(K.sp){const len=o?CH-4:CW-4,n=Math.floor((o?CW-4:CH-4)/K.sp);for(let r=0;r<n;r++){const rh0=K.h*(.85+rn()*.3),rc=.85+rn()*.3;for(let s=0;s<len;s+=3){if(rn()<.1)continue;const rh=rh0*(.7+rn()*.6),sl=Math.min(3,len-s),mx=o?x0+2+r*K.sp+K.sp/2:x0+2+s+sl/2,mz=o?z0+2+s+sl/2:z0+2+r*K.sp+K.sp/2;RW[k].push([mx,GH(mx,mz)+rh/2-.03,mz,o?K.w*.6:sl*1.02,rh,o?sl*1.02:K.w*.6,rc*(.85+rn()*.3)])}}}
else for(let b=0;b<6;b++)bales.push([x0+6+rn()*(CW-12),z0+6+rn()*(CH-12),rn()*3]);
if(rn()<.6){for(let s=0;s<CW;s+=8){const hx=x0+s+4,hz=z1+GP/2;if(!okPos(hx,hz,2)||nearPath(hx,hz,3))continue;hed.push([hx,hz])}}});
const stc=document.createElement('canvas');stc.width=stc.height=64;{const g=stc.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,64,64);for(let i=0;i<260;i++){g.fillStyle='rgba(0,0,0,'+(.04+rn()*.12)+')';g.fillRect(rn()*64,0,1+rn()*1.5,64)}for(let i=0;i<90;i++){g.fillStyle='rgba(255,255,255,.3)';g.fillRect(rn()*64,rn()*64,1,10)}}const stT=new THREE.CanvasTexture(stc);stT.wrapS=stT.wrapT=THREE.RepeatWrapping;
const bg=new THREE.BoxGeometry(1,1,1),dm_=new THREE.Object3D();
RW.forEach((a,k)=>{if(!a.length)return;const im=new THREE.InstancedMesh(bg,std(0xffffff,{map:stT,roughness:1}),a.length);a.forEach((q,i)=>{dm_.position.set(q[0],q[1],q[2]);dm_.scale.set(q[3],q[4],q[5]);dm_.rotation.set(0,0,0);dm_.updateMatrix();im.setMatrixAt(i,dm_.matrix);col.setHex(KIND[k].r).multiplyScalar(q[6]);im.setColorAt(i,col)});im.frustumCulled=false;S.add(im)});
if(hed.length){const im=new THREE.InstancedMesh(bg,std(0x35602c,{roughness:1}),hed.length);hed.forEach((q,i)=>{const y=GH(q[0],q[1]);dm_.position.set(q[0],y+.75,q[1]);dm_.scale.set(8.2,1.6,1.5);dm_.updateMatrix();im.setMatrixAt(i,dm_.matrix);boxes.push({x0:q[0]-4.1,x1:q[0]+4.1,z0:q[1]-.75,z1:q[1]+.75,y0:y,y1:y+1.6})});im.frustumCulled=false;S.add(im)}
if(bales.length){const im=new THREE.InstancedMesh(new THREE.CylinderGeometry(.95,.95,1.3,12),std(0xcdb25a,{roughness:1}),bales.length);bales.forEach((q,i)=>{const y=GH(q[0],q[1]);dm_.position.set(q[0],y+.95,q[1]);dm_.rotation.set(0,q[2],1.5708);dm_.scale.set(1,1,1);dm_.updateMatrix();im.setMatrixAt(i,dm_.matrix);boxes.push({x0:q[0]-1,x1:q[0]+1,z0:q[1]-1,z1:q[1]+1,y0:y,y1:y+1.9})});im.castShadow=true;im.frustumCulled=false;S.add(im)}
window.FARMN=cells.length;window.FARMC=cells}
