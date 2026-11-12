// ===== route nord-sud (v12) : construite après le relief =====
{const AN_=typeof AN!=='undefined'?AN:4;
// --- route nord-sud : part de l'avenue de la ville et traverse toute la carte (x = 224)
{const W=8,xr=CT.ax,N=Math.round(2*MH/3),rc=document.createElement('canvas');rc.width=64;rc.height=256;const g=rc.getContext('2d');g.fillStyle='#37393d';g.fillRect(0,0,64,256);for(let i=0;i<600;i++){g.fillStyle='rgba(255,255,255,'+Math.random()*.06+')';g.fillRect(Math.random()*64,Math.random()*256,2,2)}g.fillStyle='#e8e2c8';g.fillRect(2,0,2,256);g.fillRect(60,0,2,256);g.fillStyle='#e9d95a';g.fillRect(31,0,2,128);
const tx_=new THREE.CanvasTexture(rc);tx_.wrapS=tx_.wrapT=THREE.RepeatWrapping;tx_.anisotropy=AN_;
const pos=[],uv=[],ix=[];for(let i=0;i<=N;i++){const z=-MH+3+i*(2*MH-6)/N;if((z<CT.z1+6&&z>CT.z0-6)||Math.abs(z+20)<8.5)continue;const h=GH(xr,z)+.07;pos.push(xr-W/2,GH(xr-W/2,z)+.07,z,xr+W/2,GH(xr+W/2,z)+.07,z);uv.push(0,z/16,1,z/16)}
for(let k=0;k<pos.length/6-1;k++){const a=k*2;const zA=pos[a*3+2],zB=pos[(a+2)*3+2];if(Math.abs(zB-zA)>5)continue;ix.push(a,a+2,a+1,a+1,a+2,a+3)}
const gm=new THREE.BufferGeometry();gm.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));gm.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));gm.setIndex(ix);gm.computeVertexNormals();
const rm=new THREE.Mesh(gm,new THREE.MeshStandardMaterial({map:tx_,roughness:.95,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));rm.receiveShadow=true;S.add(rm)}
}
