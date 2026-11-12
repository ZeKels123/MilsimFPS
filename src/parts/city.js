// ================= VILLE (v12) : 250 x 250 m (x 100..348, z -348..-100) + route nord-sud =================
const CT={x0:100,x1:348,z0:-348,z1:-100,y:0,ax:224,az:-224};
(()=>{const Y=CT.y,Hg=3.6,t=.35;let sd=4242;const rn=()=>(sd=(Math.imul(sd,1664525)+1013904223)>>>0)/4294967296;
const mkC=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return[c,c.getContext('2d')]};
const cvT=(c,rx,ry)=>{const t_=new THREE.CanvasTexture(c);t_.wrapS=t_.wrapT=THREE.RepeatWrapping;t_.anisotropy=AN;t_.repeat.set(rx,ry);return t_};
// --- textures de façade (4 m x 3,2 m par carreau)
const FAC={apt:['#d8cdb9','#26323f','#59534a'],off:['#8f9ca6','#14304c','#2b3943'],shop:['#a85a45','#252c33','#44271f'],resto:['#d6c7a0','#2a2f35','#6a3a22'],hotel:['#c7b595','#22303d','#4b4437']};
const facC={};const facTex=(ty,rx,ry)=>{if(!facC[ty]){const[b,w,f]=FAC[ty],[c,g]=mkC(128,128);g.fillStyle=b;g.fillRect(0,0,128,128);for(let i=0;i<700;i++){g.fillStyle='rgba(0,0,0,'+Math.random()*.06+')';g.fillRect(Math.random()*128,Math.random()*128,2,2)}
g.fillStyle=f;g.fillRect(24,20,80,88);g.fillStyle=w;g.fillRect(28,24,72,80);g.fillStyle='rgba(255,255,255,.2)';g.beginPath();g.moveTo(28,24);g.lineTo(72,24);g.lineTo(28,84);g.fill();g.fillStyle=f;g.fillRect(62,24,4,80);g.fillRect(28,62,72,3);g.fillStyle='#b9b4a8';g.fillRect(20,108,88,6);facC[ty]=c}
return cvT(facC[ty],rx,ry)};
// --- asphalte
const roadC=h=>{const[c,g]=mkC(256,256);g.fillStyle='#35373b';g.fillRect(0,0,256,256);for(let i=0;i<2500;i++){g.fillStyle='rgba('+(Math.random()<.5?'255,255,255':'0,0,0')+','+Math.random()*.07+')';g.fillRect(Math.random()*256,Math.random()*256,2,2)}
const L=(x,y,w,ht)=>h?g.fillRect(y,x,ht,w):g.fillRect(x,y,w,ht);g.fillStyle='#e7e2c6';L(5,0,3,256);L(248,0,3,256);g.fillStyle='#e9d95a';L(124,0,2,256);L(130,0,2,256);return c};
const rdN=roadC(0),rdE=roadC(1);
const asphN=len=>std(0xffffff,{map:cvT(rdN,1,len/16),roughness:.95}),asphE=len=>std(0xffffff,{map:cvT(rdE,len/16,1),roughness:.95,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
const pavM=std(0x8d8d88,{roughness:1}),roofM=std(0x3b3d40,{roughness:.9}),concM=std(0x9a9a94,{roughness:.95});
// --- rues : N-S (x fixe) et E-O (z fixe)
const SX=[[162,10],[224,14],[286,10]],SZ=[[-162,10],[-224,14],[-286,10]];
SX.forEach(([x,w],i)=>{const e=new THREE.Mesh(new THREE.BoxGeometry(w,.06,248),asphN(248));e.position.set(x,Y+.03,-224);e.receiveShadow=true;S.add(e)});
SZ.forEach(([z,w],i)=>{const e=new THREE.Mesh(new THREE.BoxGeometry(248,.06,w),asphE(248));e.position.set(224,Y+.035,z);e.receiveShadow=true;S.add(e)});
// --- îlots (trottoir) 
const BX=[[100,157],[167,217],[231,281],[291,348]],BZ=[[-348,-291],[-281,-229],[-219,-167],[-157,-100]];
const GRID=[['apt','resto','hotel','apt'],['shop','off','off','shop'],['resto','off','off','park'],['apt','shop','apt','hotel']];
BZ.forEach(([z0,z1])=>BX.forEach(([x0,x1])=>{const e=new THREE.Mesh(new THREE.BoxGeometry(x1-x0,.08,z1-z0),pavM);e.position.set((x0+x1)/2,Y+.04,(z0+z1)/2);e.receiveShadow=true;S.add(e)}));
// --- murs du rez-de-chaussée avec ouvertures
const seg=(x0,x1,z0,z1,y0,y1,m)=>blk(x1-x0,y1-y0,z1-z0,(x0+x1)/2,Y+(y0+y1)/2,(z0+z1)/2,m,{T:3,s:1,c:1});
function wall(ax,f,a0,a1,ops,m){ops.sort((p,q)=>p.c-q.c);let cur=a0;const P=(u0,u1,y0,y1)=>{if(u1-u0<.02||y1-y0<.02)return;ax==='x'?seg(u0,u1,f-t/2,f+t/2,y0,y1,m):seg(f-t/2,f+t/2,u0,u1,y0,y1,m)};
for(const o of ops){const u0=o.c-o.w/2,u1=o.c+o.w/2;P(cur,u0,0,Hg);if(o.y0>0)P(u0,u1,0,o.y0);if(o.y1<Hg)P(u0,u1,o.y1,Hg);
if(o.gl){const gm=new THREE.Mesh(new THREE.PlaneGeometry(o.w,o.y1-o.y0),glassM);gm.position.set(ax==='x'?o.c:f,Y+(o.y0+o.y1)/2,ax==='x'?f:o.c);if(ax==='z')gm.rotation.y=Math.PI/2;S.add(gm);
boxes.push(ax==='x'?{x0:u0,x1:u1,z0:f-.1,z1:f+.1,y0:Y+o.y0,y1:Y+o.y1}:{x0:f-.1,x1:f+.1,z0:u0,z1:u1,y0:Y+o.y0,y1:Y+o.y1})}cur=u1}P(cur,a1,0,Hg)}
const WC={apt:0xd8cdb9,off:0x8f9ca6,shop:0xa85a45,resto:0xd6c7a0,hotel:0xc7b595};
function furn(ty,x0,x1,z0,z1,face){const ax=face==='E'||face==='W'?'x':'z',cx=(x0+x1)/2,cz=(z0+z1)/2,wd=ty==='shop'?std(0x6f5a43,{roughness:.8}):std(0x8a6a44,{roughness:.7}),mt=std(0x4a5560,{roughness:.6}),cl=[0x8a3a30,0x3a5a7a,0x4c6b45][(rn()*3)|0];
for(let u=x0+2.4;u<x1-1.8;u+=3.3)for(let v=z0+2.4;v<z1-1.8;v+=3.3){const lat=ax==='x'?v-cz:u-cx;if(Math.abs(lat)<2.1||rn()<.3)continue;
if(ty==='shop'){blk(ax==='x'?.5:1.6,2,ax==='x'?1.6:.5,u,Y+1,v,wd,{s:1,c:1});}
else if(ty==='resto'){blk(1.2,.78,.9,u,Y+.39,v,wd,{s:1,c:1});blk(.45,.5,.45,u-.95,Y+.25,v,std(cl),{s:1,c:1});blk(.45,.5,.45,u+.95,Y+.25,v,std(cl),{s:1,c:1})}
else{blk(1.8,.75,.85,u,Y+.38,v,mt,{s:1,c:1});blk(1.5,.9,.7,u+.1,Y+.45,v+1.5,std(cl),{s:1,c:1})}}
}
function bld(cx,cz,w,d,fl,ty,face){const x0=cx-w/2,x1=cx+w/2,z0=cz-d/2,z1=cz+d/2,H=Hg+(fl-1)*3.2,m=pm(T_plas,WC[ty],{roughness:.95}),hi=ty==='shop'||ty==='resto';
const dm=(len)=>({c:len/2,w:2.4,y0:0,y1:2.5}),win=(len,k)=>hi?[{c:len*.27*k,w:3.2,y0:.9,y1:2.6,gl:1}]:[];
const sides={N:['x',z0+t/2,w],S:['x',z1-t/2,w],W:['z',x0+t/2,d],E:['z',x1-t/2,d]},opp={N:'S',S:'N',E:'W',W:'E'};
for(const k in sides){const[ax,f,len]=sides[k];const a0=ax==='x'?x0:z0,ctr=ax==='x'?cx:cz,ops=[];
if(k===face){ops.push({c:ctr,w:2.6,y0:0,y1:2.5});if(hi&&len>12){ops.push({c:ctr-len*.3,w:3.2,y0:.9,y1:2.6,gl:1},{c:ctr+len*.3,w:3.2,y0:.9,y1:2.6,gl:1})}}
else if(k===opp[face])ops.push({c:ctr,w:2.2,y0:0,y1:2.5});
wall(ax,f,a0,a0+len,ops,m)}
// plafond + étages (bloc plein habillé de façades)
const Hu=H-Hg;blk(w,Hu,d,cx,Y+Hg+Hu/2,cz,std(WC[ty],{roughness:.95}),{s:1,c:1});blk(w-t*2,.25,d-t*2,cx,Y+Hg-.12,cz,roofM,{ns:1});
const fm=(len)=>std(0xffffff,{map:facTex(ty,len/4,fl-1),roughness:.85}),fp=(len,x,z,ry)=>{const p=new THREE.Mesh(new THREE.PlaneGeometry(len,Hu),fm(len));p.position.set(x,Y+Hg+Hu/2,z);p.rotation.y=ry;p.receiveShadow=true;S.add(p)};
if(fl>1){fp(w,cx,z1+.02,0);fp(w,cx,z0-.02,Math.PI);fp(d,x1+.02,cz,Math.PI/2);fp(d,x0-.02,cz,-Math.PI/2)}
// toit
blk(w+.4,.3,d+.4,cx,Y+H+.15,cz,roofM,{s:1,c:1});[[0,d/2],[0,-d/2]].forEach(q=>blk(w+.4,.9,.3,cx,Y+H+.75,cz+q[1],concM,{s:1,c:1}));[[w/2,0],[-w/2,0]].forEach(q=>blk(.3,.9,d+.4,cx+q[0],Y+H+.75,cz,concM,{s:1,c:1}));
blk(2.6,1.4,2,cx+w*.15,Y+H+1,cz-d*.1,std(0x8a8d8f,{roughness:.6}),{s:1,c:1});if(fl>4){const an=new THREE.Mesh(new THREE.CylinderGeometry(.04,.06,6,6),std(0x444));an.position.set(cx-w*.3,Y+H+3.4,cz+d*.2);S.add(an)}
furn(ty,x0+t,x1-t,z0+t,z1-t,face);
const hx=w/2-t,hz=d/2-t;if(w>=d)ROOMS.push({x:cx-w/4,z:cz,hx:hx/2,hz,bun:0},{x:cx+w/4,z:cz,hx:hx/2,hz,bun:0});else ROOMS.push({x:cx,z:cz-d/4,hx,hz:hz/2,bun:0},{x:cx,z:cz+d/4,hx,hz:hz/2,bun:0})}
// --- placement des bâtiments par îlot
const toC=(cx,cz)=>{const dx=CT.ax-cx,dz=CT.az-cz;return Math.abs(dx)>Math.abs(dz)?(dx>0?'E':'W'):(dz>0?'S':'N')};
BZ.forEach(([z0,z1],j)=>BX.forEach(([x0,x1],i)=>{const ty=GRID[j][i],cx=(x0+x1)/2,cz=(z0+z1)/2,bw=x1-x0-12,bd=z1-z0-12,face=toC(cx,cz);
if(ty==='park'){const fo=new THREE.Mesh(new THREE.CylinderGeometry(4,4.4,.6,20),concM);fo.position.set(cx,Y+.38,cz);fo.castShadow=true;S.add(fo);boxes.push({x0:cx-4.2,x1:cx+4.2,z0:cz-4.2,z1:cz+4.2,y0:Y,y1:Y+.7});solids.push(fo);
const wt=new THREE.Mesh(new THREE.CylinderGeometry(3.5,3.5,.1,20),std(0x3f6a8a,{roughness:.1,metalness:.2}));wt.position.set(cx,Y+.62,cz);S.add(wt);
for(let k=0;k<4;k++){const a=k*1.5708+.78,bx=cx+Math.cos(a)*9,bz=cz+Math.sin(a)*9;blk(2,.5,.6,bx,Y+.3,bz,std(0x6a4a2c),{s:1,c:1})}
for(let k=0;k<9;k++){const a=rn()*6.28,r=10+rn()*12,x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r,tr=new THREE.Mesh(new THREE.CylinderGeometry(.18,.28,3.6,6),std(0x5a4330));tr.position.set(x,Y+1.8,z);tr.castShadow=true;S.add(tr);
const cr=new THREE.Mesh(new THREE.IcosahedronGeometry(2.2,1),std(0x3f7a3a,{roughness:1}));cr.position.set(x,Y+4.6,z);cr.castShadow=true;S.add(cr);boxes.push({x0:x-.3,x1:x+.3,z0:z-.3,z1:z+.3,y0:Y,y1:Y+3.6})}return}
if(ty==='off'||ty==='apt'||ty==='hotel'){const fl=ty==='off'?7+((rn()*3)|0):ty==='hotel'?5:5+((rn()*2)|0);bld(cx,cz,ty==='hotel'?bw:Math.min(bw,34),ty==='hotel'?Math.min(bd,30):Math.min(bd,34),fl,ty,face)}
else{const f2=face==='E'||face==='W';const n=2;for(let k=0;k<n;k++){const off=(k-.5)*((f2?bd:bw)/2+1);bld(f2?cx:cx+off,f2?cz+off:cz,f2?bw:(bw/2-1.5),f2?(bd/2-1.5):bd,2+((rn()*2)|0),ty,face)}}}));
// --- voitures garées + lampadaires sur les rues
const COL=[0x8a1f1f,0x1f3a6a,0xb8b8b8,0x222222,0x6a6a2a,0x2a5a3a];
const cars=(vert,f,half)=>{const a0=vert?-340:108,a1=vert?-108:340;for(let u=a0;u<=a1;u+=17+((rn()*14)|0)){const side=(rn()<.5?-1:1)*(half-1.5),px=vert?f+side:u,pz=vert?u:f+side;
if(rn()<.35)continue;if((vert?SZ:SX).some(([g,w])=>Math.abs(u-g)<w/2+5))continue;const cl=std(COL[(rn()*6)|0],{roughness:.4,metalness:.4});
const lw=vert?1.8:4.2,ld=vert?4.2:1.8;blk(lw,.9,ld,px,Y+.65,pz,cl,{s:1,c:1});blk(vert?1.6:2.2,.7,vert?2.2:1.6,px,Y+1.45,pz,std(0x141b22,{roughness:.1,metalness:.3}),{s:1,c:1});blk(lw-.1,.3,ld-.1,px,Y+.2,pz,std(0x111111),{ns:1})}};
SX.forEach(([x,w])=>cars(1,x,w/2));SZ.forEach(([z,w])=>cars(0,z,w/2));
const lampM2=new THREE.MeshBasicMaterial({color:0xfff0c8,toneMapped:false}),polM=std(0x3a3f44,{roughness:.6,metalness:.4});
const lamp=(x,z)=>{const p=new THREE.Mesh(new THREE.CylinderGeometry(.07,.1,7,6),polM);p.position.set(x,Y+3.5,z);p.castShadow=true;S.add(p);const h=new THREE.Mesh(new THREE.BoxGeometry(.9,.15,.35),lampM2);h.position.set(x+.4,Y+7,z);S.add(h);boxes.push({x0:x-.12,x1:x+.12,z0:z-.12,z1:z+.12,y0:Y,y1:Y+3})};
for(let z=-340;z<=-108;z+=32){lamp(224-8.5,z);lamp(224+8.5,z)}for(let x=108;x<=340;x+=32){lamp(x,-224-8.5);lamp(x,-224+8.5)}
})();
