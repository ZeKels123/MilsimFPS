// ================= VILLE (v13) : 350 x 350 m (x 150..500, z -700..-350), étages accessibles, vitres cassables =================
const CT={x0:150,x1:500,z0:-700,z1:-350,y:0,ax:224,az:-525};
(()=>{const Y=CT.y,FH=3.4,t=.35;let sd=4242;const rn=()=>(sd=(Math.imul(sd,1664525)+1013904223)>>>0)/4294967296;
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
const SX=[[224,14],[330,12],[420,12]],SZ=[[-420,12],[-525,14],[-630,12]];
SX.forEach(([x,w])=>{const e=new THREE.Mesh(new THREE.BoxGeometry(w,.06,350),asphN(350));e.position.set(x,Y+.03,-525);e.receiveShadow=true;S.add(e)});
SZ.forEach(([z,w])=>{const e=new THREE.Mesh(new THREE.BoxGeometry(350,.06,w),asphE(350));e.position.set(325,Y+.035,z);e.receiveShadow=true;S.add(e)});
const BX=[[150,217],[231,324],[336,414],[426,500]],BZ=[[-700,-636],[-624,-532],[-518,-426],[-414,-350]];
const GRID=[['apt','off','hotel','apt'],['shop','off','resto','shop'],['resto','off','off','park'],['apt','shop','apt','resto']];
BZ.forEach(([z0,z1])=>BX.forEach(([x0,x1])=>{const e=new THREE.Mesh(new THREE.BoxGeometry(x1-x0,.08,z1-z0),pavM);e.position.set((x0+x1)/2,Y+.04,(z0+z1)/2);e.receiveShadow=true;S.add(e)}));
// --- modèles importés (cache de géométrie)
const MG={};const mdl=n=>{if(!MG[n]){const m=mkMdl(n);MG[n]=[m.geometry,m.material]}const e=new THREE.Mesh(MG[n][0],MG[n][1]);e.castShadow=e.receiveShadow=true;return e};
const mdlAt=(n,x,y,z,ry,hw,hd,hh,sol)=>{const e=mdl(n);e.position.set(x,Y+y,z);e.rotation.y=ry;S.add(e);if(hw)boxes.push({x0:x-hw,x1:x+hw,z0:z-hd,z1:z+hd,y0:Y+y,y1:Y+y+hh});if(sol)solids.push(e);return e};
// --- murs avec ouvertures ; fenêtres cassables
const seg=(x0,x1,z0,z1,y0,y1,m)=>blk(x1-x0,y1-y0,z1-z0,(x0+x1)/2,Y+(y0+y1)/2,(z0+z1)/2,m,{T:3,s:1,c:1});
function winG(ax,f,c,w,y0,y1,tt){const h=y1-y0,gm=new THREE.Mesh(new THREE.PlaneGeometry(w-.1,h-.1),glassM);gm.position.set(ax==='x'?c:f,Y+(y0+y1)/2,ax==='x'?f:c);if(ax==='z')gm.rotation.y=Math.PI/2;
gm.userData.glass={hp:2,w:w-.1,h:h-.1};gm.userData.home=S;S.add(gm);solids.push(gm);GLASS.push(gm);
const sy=Y+y0,hw=w/2-.05,dp=tt/2+.3,vs=ax==='x'?surfRect(c-hw,c+hw,f-dp,f+dp,sy,{gl:gm}):surfRect(f-dp,f+dp,c-hw,c+hw,sy,{gl:gm});gm.userData.glass.vs=vs;gm.userData.glass.nv={ax,c,f,w,y:sy};
ax==='x'?blk(w+.2,.06,tt+.16,c,Y+y0-.03,f,concM,{ns:1}):blk(tt+.16,.06,w+.2,f,Y+y0-.03,c,concM,{ns:1})}
function wall(ax,f,a0,a1,ops,m,yb,hh,tt){tt=tt||t;ops.sort((p,q)=>p.c-q.c);let cur=a0;
const P=(u0,u1,y0,y1)=>{if(u1-u0<.02||y1-y0<.02)return;const A=yb+y0,B=yb+y1;ax==='x'?seg(u0,u1,f-tt/2,f+tt/2,A,B,m):seg(f-tt/2,f+tt/2,u0,u1,A,B,m)};
for(const o of ops){const u0=o.c-o.w/2,u1=o.c+o.w/2;P(cur,u0,0,hh);if(o.y0>0)P(u0,u1,0,o.y0);if(o.y1<hh)P(u0,u1,o.y1,hh);if(o.gl)winG(ax,f,o.c,o.w,yb+o.y0,yb+o.y1,tt);cur=u1}P(cur,a1,0,hh)}
const WC={apt:0xd8cdb9,off:0x8f9ca6,shop:0xa85a45,resto:0xd6c7a0,hotel:0xc7b595};
const floorM=std(0x8a8478,{roughness:.9}),stM=std(0x77736b,{roughness:.8}),wdM=std(0x8a6a44,{roughness:.7}),wd2=std(0x6f5a43,{roughness:.8}),mtM=std(0x4a5560,{roughness:.6}),bedM=std(0xd8d4c8,{roughness:.9}),clM=[0x8a3a30,0x3a5a7a,0x4c6b45].map(c=>std(c,{roughness:.9}));
// dalle d'étage (avec trou d'escalier éventuel) : visuel + surface de marche
function slab(yT,X0,X1,Z0,Z1,hole){const P=(a,b,c,d)=>{if(b-a<.05||d-c<.05)return;blk(b-a,.3,d-c,(a+b)/2,yT-.15,(c+d)/2,floorM,{T:2,s:1});surfRect(a,b,c,d,Y+yT)};
if(!hole){P(X0,X1,Z0,Z1);return}const h=hole;P(X0,h.x0,Z0,Z1);P(h.x1,X1,Z0,Z1);P(h.x0,h.x1,Z0,h.z0);P(h.x0,h.x1,h.z1,Z1)}
// mobilier d'un niveau
function furnish(ty,k,x0,x1,z0,z1,face,cx,cz){const g=4.6,sk=(u,v)=>(u<x0+2.3&&v<z0+5.9)||(u>x1-2.3&&v>z1-5.9)||(k>0&&Math.abs(u-cx)<1.4)||(k===0&&(Math.abs(u-cx)<2.2&&(face==='N'||face==='S')||Math.abs(v-cz)<2.2&&(face==='E'||face==='W')));
const yb=k*FH;for(let u=x0+2.8;u<x1-1.8;u+=g)for(let v=z0+2.8;v<z1-1.8;v+=g){if(sk(u,v)||rn()<.42)continue;const r=rn(),ry=rn()<.5?0:Math.PI/2;
if(ty==='off'){blk(1.6,.75,.8,u,yb+.38,v,wdM,{s:1,c:1});if(r<.7)mdlAt('chair',u,yb,v+.9,Math.PI*(rn()*2),.3,.3,.9,0);else blk(.4,1.9,1.6,u+1.4,yb+.95,v,wd2,{s:1,c:1})}
else if(ty==='shop'){if(k===0){blk(.5,2,1.6,u,yb+1,v,wd2,{s:1,c:1});blk(.5,2,1.6,u+1.1,yb+1,v,wd2,{s:1,c:1})}else{blk(1.1,1.1,1.1,u,yb+.55,v,wd2,{s:1,c:1});if(r<.5)blk(1.1,1,1.1,u,yb+1.6,v,wdM,{s:1,c:1})}}
else if(ty==='resto'){mdlAt('table',u,yb,v,ry,ry?.9:.5,ry?.5:.9,.75,0);mdlAt('chair',u+(ry?0:1),yb,v+(ry?1:0),ry+1.57,.3,.3,.9,0);mdlAt('chair',u-(ry?0:1),yb,v-(ry?1:0),ry-1.57,.3,.3,.9,0)}
else{if(r<.45){blk(2,.5,1.5,u,yb+.25,v,wdM,{s:1,c:1});blk(1.9,.18,1.4,u,yb+.6,v,bedM,{ns:1});blk(.6,.08,.4,u-.7,yb+.73,v,clM[(rn()*3)|0],{ns:1})}else if(r<.75){mdlAt('table',u,yb,v,ry,ry?.9:.5,ry?.5:.9,.75,0);mdlAt('chair',u+(ry?0:.9),yb,v+(ry?.9:0),ry+1.57,.3,.3,.9,0)}else blk(.6,2,1.2,u,yb+1,v,wd2,{s:1,c:1})}}}
function bld(cx,cz,w,d,fl,ty,face){const x0=cx-w/2,x1=cx+w/2,z0=cz-d/2,z1=cz+d/2,H=fl*FH,A=Math.min(fl,{off:4,hotel:4,apt:3}[ty]||2),m=pm(T_plas,WC[ty],{roughness:.95}),hi=ty==='shop'||ty==='resto';
const sides={N:['x',z0+t/2,w],S:['x',z1-t/2,w],W:['z',x0+t/2,d],E:['z',x1-t/2,d]},opp={N:'S',S:'N',E:'W',W:'E'};
for(let k=0;k<A;k++){const yb=k*FH;for(const sk in sides){const[ax,f,len]=sides[sk],a0=ax==='x'?x0:z0,ctr=ax==='x'?cx:cz,ops=[];let dr=0;
if(k===0&&sk===face){ops.push({c:ctr,w:2.6,y0:0,y1:2.5});dr=2.6;if(hi&&len>12){ops.push({c:ctr-len*.3,w:3.2,y0:.9,y1:2.6,gl:1},{c:ctr+len*.3,w:3.2,y0:.9,y1:2.6,gl:1})}}
else if(k===0&&sk===opp[face]){ops.push({c:ctr,w:2.2,y0:0,y1:2.5});dr=2.2}
if(!(hi&&k===0&&sk===face&&len>12)){const ww=ty==='off'?2.6:1.7,sp=ty==='off'?4.6:5.2,n=Math.floor((len-3)/sp);for(let i=0;i<n;i++){const c=a0+len/2+(i-(n-1)/2)*sp;if(dr&&Math.abs(c-ctr)<dr/2+ww/2+.4)continue;ops.push({c,w:ww,y0:.9,y1:2.55,gl:1})}}
wall(ax,f,a0,a0+len,ops,m,yb,FH)}
// cloison centrale + portes (étages)
if(k>0&&A>1){wall('z',cx,z0+t,z1-t,[{c:cz-d*.22,w:1.4,y0:0,y1:2.3},{c:cz+d*.22,w:1.4,y0:0,y1:2.3}],m,yb,FH,.2)}
furnish(ty,k,x0+t,x1-t,z0+t,z1-t,face,cx,cz)}
// escaliers (volées alternées gauche / droite) + dalles
const L=Math.ceil(FH/.2)*.28,xa=x0+t+.95,xb=x1-t-.95;
for(let k=0;k<A;k++){const ya=k*FH,yb2=ya+FH;if(k===A-1&&fl===A)break;if(k>=A-1)break;
if(k%2===0)stairs(xa,z0+t+.2,xa,z0+t+.2+L,1.5,ya,yb2,stM,{});else stairs(xb,z1-t-.2,xb,z1-t-.2-L,1.5,ya,yb2,stM,{})}
for(let k=1;k<A;k++){const e=(k-1)%2===0,hole=e?{x0:xa-.8,x1:xa+.8,z0:z0+t,z1:z0+t+.2+L}:{x0:xb-.8,x1:xb+.8,z0:z1-t-.2-L,z1:z1-t};slab(k*FH,x0+t,x1-t,z0+t,z1-t,hole)}
// bloc plein au-dessus des étages accessibles (façade texturée)
const Hu=H-A*FH;if(Hu>0){blk(w,Hu,d,cx,Y+A*FH+Hu/2,cz,std(WC[ty],{roughness:.95}),{s:1,c:1});
const fm=len=>std(0xffffff,{map:facTex(ty,len/4,Hu/3.2),roughness:.85}),fp=(len,x,z,ry)=>{const p=new THREE.Mesh(new THREE.PlaneGeometry(len,Hu),fm(len));p.position.set(x,Y+A*FH+Hu/2,z);p.rotation.y=ry;p.receiveShadow=true;S.add(p)};
fp(w,cx,z1+.02,0);fp(w,cx,z0-.02,Math.PI);fp(d,x1+.02,cz,Math.PI/2);fp(d,x0-.02,cz,-Math.PI/2)}
// toit
blk(w+.4,.3,d+.4,cx,Y+H+.15,cz,roofM,{s:1,c:1});[[0,d/2],[0,-d/2]].forEach(q=>blk(w+.4,.9,.3,cx,Y+H+.75,cz+q[1],concM,{s:1,c:1}));[[w/2,0],[-w/2,0]].forEach(q=>blk(.3,.9,d+.4,cx+q[0],Y+H+.75,cz,concM,{s:1,c:1}));
blk(2.6,1.4,2,cx+w*.15,Y+H+1,cz-d*.1,std(0x8a8d8f,{roughness:.6}),{s:1,c:1});if(fl>4){const an=new THREE.Mesh(new THREE.CylinderGeometry(.04,.06,6,6),std(0x444));an.position.set(cx-w*.3,Y+H+3.4,cz+d*.2);S.add(an)}
const hx=w/2-t,hz=d/2-t;if(w>=d)ROOMS.push({x:cx-w/4,z:cz,hx:hx/2,hz,bun:0},{x:cx+w/4,z:cz,hx:hx/2,hz,bun:0});else ROOMS.push({x:cx,z:cz-d/4,hx,hz:hz/2,bun:0},{x:cx,z:cz+d/4,hx,hz:hz/2,bun:0})}
// --- placement par îlot
const toC=(cx,cz)=>{const dx=CT.ax-cx,dz=CT.az-cz;return Math.abs(dx)>Math.abs(dz)?(dx>0?'E':'W'):(dz>0?'S':'N')};
BZ.forEach(([z0,z1],j)=>BX.forEach(([x0,x1],i)=>{const ty=GRID[j][i],cx=(x0+x1)/2,cz=(z0+z1)/2,bw=x1-x0-12,bd=z1-z0-12,face=toC(cx,cz);
if(ty==='park'){const g=new THREE.Mesh(new THREE.BoxGeometry(x1-x0-2,.04,z1-z0-2),std(0x4c7a3a,{roughness:1}));g.position.set(cx,Y+.1,cz);g.receiveShadow=true;S.add(g);
const fo=new THREE.Mesh(new THREE.CylinderGeometry(4,4.4,.6,20),concM);fo.position.set(cx,Y+.38,cz);fo.castShadow=true;S.add(fo);boxes.push({x0:cx-4.2,x1:cx+4.2,z0:cz-4.2,z1:cz+4.2,y0:Y,y1:Y+.7});solids.push(fo);
const wt=new THREE.Mesh(new THREE.CylinderGeometry(3.5,3.5,.1,20),std(0x3f6a8a,{roughness:.1,metalness:.2}));wt.position.set(cx,Y+.62,cz);S.add(wt);
for(let k=0;k<4;k++){const a=k*1.5708+.78,bx=cx+Math.cos(a)*9,bz=cz+Math.sin(a)*9;blk(2,.5,.6,bx,Y+.3,bz,std(0x6a4a2c),{s:1,c:1});mdlAt('bike',bx+1.6,0,bz,a,.25,.9,1.1,1)}
for(let k=0;k<9;k++){const a=rn()*6.28,r=10+rn()*20,x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r;if(Math.abs(x-cx)>x1-x0-6||Math.abs(z-cz)>(z1-z0)/2-4)continue;const tr=new THREE.Mesh(new THREE.CylinderGeometry(.18,.28,3.6,6),std(0x5a4330));tr.position.set(x,Y+1.8,z);tr.castShadow=true;S.add(tr);
const cr=new THREE.Mesh(new THREE.IcosahedronGeometry(2.2,1),std(0x3f7a3a,{roughness:1}));cr.position.set(x,Y+4.6,z);cr.castShadow=true;S.add(cr);boxes.push({x0:x-.3,x1:x+.3,z0:z-.3,z1:z+.3,y0:Y,y1:Y+3.6})}return}
if(ty==='off'||ty==='apt'||ty==='hotel'){const fl=ty==='off'?7+((rn()*3)|0):ty==='hotel'?5:4+((rn()*2)|0);bld(cx,cz,Math.min(bw,ty==='hotel'?44:ty==='off'?40:36),Math.min(bd,ty==='hotel'?36:ty==='off'?40:34),fl,ty,face)}
else{const f2=face==='E'||face==='W';for(let k=0;k<2;k++){const off=(k-.5)*((f2?bd:bw)/2+1);bld(f2?cx:cx+off,f2?cz+off:cz,f2?Math.min(bw,30):Math.min(bw/2-1.5,30),f2?Math.min(bd/2-1.5,30):Math.min(bd,30),2+((rn()*2)|0),ty,face)}}
// vélos devant l'îlot
for(let k=0;k<2;k++)if(rn()<.8){const bx=x0+4+rn()*(x1-x0-8),bz=rn()<.5?z0+2.2:z1-2.2;mdlAt('bike',bx,0,bz,rn()*6.28,.3,.9,1.1,1)}}));
// --- voitures garées (Mustang importée ou caisse) + lampadaires
const COL=[0x8a1f1f,0x1f3a6a,0xb8b8b8,0x222222,0x6a6a2a,0x2a5a3a];
const cars=(vert,f,half)=>{const a0=vert?-692:158,a1=vert?-358:492;for(let u=a0;u<=a1;u+=17+((rn()*14)|0)){const side=(rn()<.5?-1:1)*(half-1.5),px=vert?f+side:u,pz=vert?u:f+side;
if(rn()<.35)continue;if((vert?SZ:SX).some(([g,w])=>Math.abs(u-g)<w/2+5))continue;
if(rn()<.5){const e=mdlAt(rn()<.5?'car':'mazda',px,0,pz,vert?(side>0?0:Math.PI):(side>0?Math.PI/2:-Math.PI/2),vert?1.15:2.3,vert?2.3:1.15,1.4,1);continue}
const cl=std(COL[(rn()*6)|0],{roughness:.4,metalness:.4}),lw=vert?1.8:4.2,ld=vert?4.2:1.8;blk(lw,.9,ld,px,Y+.65,pz,cl,{s:1,c:1});blk(vert?1.6:2.2,.7,vert?2.2:1.6,px,Y+1.45,pz,std(0x141b22,{roughness:.1,metalness:.3}),{s:1,c:1});blk(lw-.1,.3,ld-.1,px,Y+.2,pz,std(0x111111),{ns:1})}};
SX.forEach(([x,w])=>cars(1,x,w/2));SZ.forEach(([z,w])=>cars(0,z,w/2));
const lampM2=new THREE.MeshBasicMaterial({color:0xfff0c8,toneMapped:false}),polM=std(0x3a3f44,{roughness:.6,metalness:.4});
const lamp=(x,z)=>{const p=new THREE.Mesh(new THREE.CylinderGeometry(.07,.1,7,6),polM);p.position.set(x,Y+3.5,z);p.castShadow=true;S.add(p);const h=new THREE.Mesh(new THREE.BoxGeometry(.9,.15,.35),lampM2);h.position.set(x+.4,Y+7,z);S.add(h);boxes.push({x0:x-.12,x1:x+.12,z0:z-.12,z1:z+.12,y0:Y,y1:Y+3})};
SX.forEach(([x,w])=>{for(let z=-692;z<=-358;z+=34){if(SZ.some(([g,ww])=>Math.abs(z-g)<ww/2+3))continue;lamp(x-w/2-1.4,z);lamp(x+w/2+1.4,z)}});
SZ.forEach(([z,w])=>{for(let x=158;x<=492;x+=34){if(SX.some(([g,ww])=>Math.abs(x-g)<ww/2+3))continue;lamp(x,z-w/2-1.4);lamp(x,z+w/2+1.4)}});
})();
