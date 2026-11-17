// ===== route nord-sud (v12, v58) : construite après le relief, sur un terrain déjà aplani (RDPR) =====
{const AN_=typeof AN!=='undefined'?AN:4;
// --- route nord-sud : part de l'avenue de la ville et traverse toute la carte (x = 224) ; chaussée 7 m bombée + accotements gravillonnés de 0,9 m
{const HA=3.5,HW=4.4,xr=CT.ax,N=Math.round(2*MH/3),PXM=20,rc=document.createElement('canvas');rc.width=Math.round(2*HW*PXM);rc.height=256;const g=rc.getContext('2d'),ex=m=>Math.round((m+HW)*PXM);
g.fillStyle='#8a7d66';g.fillRect(0,0,rc.width,256);for(let i=0;i<500;i++){g.fillStyle='rgba('+(Math.random()<.5?'60,52,40':'200,190,165')+','+Math.random()*.25+')';g.fillRect(Math.random()*ex(-HA),Math.random()*256,2,2);g.fillRect(ex(HA)+Math.random()*(rc.width-ex(HA)),Math.random()*256,2,2)}
g.fillStyle='#37393d';g.fillRect(ex(-HA),0,ex(HA)-ex(-HA),256);for(const c of[-1.75,1.75]){g.fillStyle='rgba(20,20,22,.22)';g.fillRect(ex(c-.55),0,Math.round(1.1*PXM),256)}
for(let i=0;i<1500;i++){g.fillStyle='rgba(255,255,255,'+Math.random()*.06+')';g.fillRect(ex(-HA)+Math.random()*(ex(HA)-ex(-HA)),Math.random()*256,2,2)}
for(let i=0;i<14;i++){g.strokeStyle='rgba(15,15,16,.45)';g.lineWidth=1;g.beginPath();let x=ex(-HA+.3)+Math.random()*(ex(HA)-ex(-HA)-12),y=Math.random()*256;g.moveTo(x,y);for(let k=0;k<4;k++){x+=Math.random()*8-4;y+=Math.random()*10;g.lineTo(x,y)}g.stroke()}
g.fillStyle='#e8e2c8';g.fillRect(ex(-HA+.25),0,4,256);g.fillRect(ex(HA-.25)-4,0,4,256);g.fillStyle='#e9d95a';g.fillRect(ex(0)-2,0,4,128);
const tx_=new THREE.CanvasTexture(rc);tx_.wrapS=tx_.wrapT=THREE.RepeatWrapping;tx_.anisotropy=AN_;
// sections : tous les ~3 m, sans la chaussée de la ville ni le tablier des ponts (extrémités exactes sur le pont)
const zs=[];for(let i=0;i<=N;i++){const z=-MH+3+i*(2*MH-6)/N;if((z<CT.z1+6&&z>CT.z0-6)||BRG.some(b=>b.x===xr&&Math.abs(z-b.z)<b.hl+1.5))continue;zs.push(z)}
BRG.forEach(b=>{if(b.x===xr){zs.push(b.z-b.hl,b.z+b.hl)}});zs.sort((a,b)=>a-b);
const XO=[-HW,-HA,0,HA,HW],YO=[.02,.06,.1,.06,.02],pos=[],uv=[],ix=[],NC=XO.length;
for(const z of zs){for(let c=0;c<NC;c++){const x=xr+XO[c];pos.push(x,GH(x,z)+YO[c],z);uv.push((XO[c]+HW)/(2*HW),z/16)}}
for(let k=0;k<zs.length-1;k++){if(zs[k+1]-zs[k]>5)continue;for(let c=0;c<NC-1;c++){const a=k*NC+c,b=a+NC;ix.push(a,b,a+1,a+1,b,b+1)}}
const gm=new THREE.BufferGeometry();gm.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));gm.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));gm.setIndex(ix);gm.computeVertexNormals();
const rm=new THREE.Mesh(gm,new THREE.MeshStandardMaterial({map:tx_,roughness:.95,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));rm.receiveShadow=true;S.add(rm);window.ROAD={hw:HW,ha:HA,mesh:rm}}
}
