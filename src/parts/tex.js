// ================= MATÉRIAUX & TEXTURES PROCÉDURALES (v3) =================
const std=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.9,metalness:0,envMapIntensity:.6},o));
const L=(c,o)=>std(c,o);
const AN=Math.min(8,R.capabilities.getMaxAnisotropy());
function vnoise(sz,cx,cy,seed){const g=new Float32Array(cx*cy);let s=(seed*2654435761)>>>0||1;for(let i=0;i<g.length;i++){s=(Math.imul(s,1664525)+1013904223)>>>0;g[i]=s/4294967296}
const o=new Float32Array(sz*sz);
for(let y=0;y<sz;y++){const fy=y/sz*cy,iy=fy|0,ty=fy-iy,sy=ty*ty*(3-2*ty),y0=(iy%cy)*cx,y1=((iy+1)%cy)*cx;
for(let x=0;x<sz;x++){const fx=x/sz*cx,ix=fx|0,tx=fx-ix,sx=tx*tx*(3-2*tx),x0=ix%cx,x1=(ix+1)%cx;
const a=g[y0+x0],b=g[y0+x1],c=g[y1+x0],d=g[y1+x1];o[y*sz+x]=a+(b-a)*sx+(c-a)*sy+(a-b-c+d)*sx*sy}}
return o}
function fbm(sz,cx,cy,oct,seed){const o=new Float32Array(sz*sz);let a=1,t=0;for(let k=0;k<oct;k++){const n=vnoise(sz,cx<<k,cy<<k,seed+k*31);for(let i=0;i<o.length;i++)o[i]+=n[i]*a;t+=a;a*=.5}for(let i=0;i<o.length;i++)o[i]/=t;return o}
function ctex(sz,px,post){const c=document.createElement('canvas');c.width=c.height=sz;const x=c.getContext('2d'),im=x.createImageData(sz,sz);px(im.data,sz);x.putImageData(im,0,0);post&&post(x,sz);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=AN;return t}
const c01=v=>v<0?0:v>1?1:v;
function hsh(a,b){let h=(Math.imul(a|0,374761393)+Math.imul(b|0,668265263))|0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296}
function tx(c,norep){const t=new THREE.CanvasTexture(c);if(!norep)t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=AN;return t}
// carte de normales calculée depuis une carte de hauteur
function nmap(H,sz,str){const c=document.createElement('canvas');c.width=c.height=sz;const x=c.getContext('2d'),im=x.createImageData(sz,sz),d=im.data;
for(let y=0;y<sz;y++){const yu=((y+sz-1)%sz)*sz,yd=((y+1)%sz)*sz,yy=y*sz;for(let X=0;X<sz;X++){const xl=(X+sz-1)%sz,xr=(X+1)%sz,nx=(H[yy+xl]-H[yy+xr])*str,ny=(H[yd+X]-H[yu+X])*str,l=1/Math.sqrt(nx*nx+ny*ny+1),i=(yy+X)*4;d[i]=(nx*l*.5+.5)*255;d[i+1]=(ny*l*.5+.5)*255;d[i+2]=(l*.5+.5)*255;d[i+3]=255}}
x.putImageData(im,0,0);return tx(c)}
function ptex(sz,fn,post,str){const c=document.createElement('canvas');c.width=c.height=sz;const x=c.getContext('2d'),im=x.createImageData(sz,sz),H=new Float32Array(sz*sz);fn(im.data,H,sz);x.putImageData(im,0,0);post&&post(x,sz);return{map:tx(c),normalMap:nmap(H,sz,str)}}
const pm=(t,c,o)=>std(c,Object.assign({map:t.map,normalMap:t.normalMap},o));
const P4=(d,i,r,g,b)=>{i*=4;d[i]=r;d[i+1]=g;d[i+2]=b;d[i+3]=255};
function cracks(x,sz,n,col){x.strokeStyle=col;x.lineWidth=.9;for(let k=0;k<n;k++){let px=rnd(30,sz-30),py=rnd(30,sz-140),a=rnd(1,2.1);const st=rnd(8,22)|0;x.beginPath();x.moveTo(px,py);for(let s=0;s<st;s++){a+=rnd(-.6,.6);px+=Math.cos(a)*rnd(4,9);py+=Math.sin(a)*rnd(4,9);if(px<4||px>sz-4||py>sz-4||py<4)break;x.lineTo(px,py)}x.stroke()}}
// --- béton banché (panneaux de coffrage 2 m x 1 m)
const T_conc=ptex(512,(d,H,sz)=>{const a=fbm(sz,3,3,5,11),b=fbm(sz,64,64,3,5),c=fbm(sz,32,2,3,9),holes=[];
for(let j=0;j<2;j++)for(const hx of [128,384])for(const hy of [70,186])holes.push([(hx+j*256)%512,j*256+hy]);
for(let y=0;y<sz;y++)for(let X=0;X<sz;X++){const i=y*sz+X;let v=.86+(a[i]-.5)*.2+(b[i]-.5)*.1+(c[i]-.5)*.07,h=.5+(b[i]-.5)*.5+(a[i]-.5)*.2;
const ry=y%256,sx=(X+(y<256?0:256))%512;
if(ry<3||sx<3){v*=.6;h-=.5}else if(ry<5||sx<5)v*=1.05;
for(const q of holes){const dx=X-q[0],dy=y-q[1],r=dx*dx+dy*dy;if(r<64){const k=1-r/64;v*=1-.6*k;h-=.7*k}}
P4(d,i,v*255,v*252,v*243);H[i]=h}},
(x,sz)=>{for(let i=0;i<420;i++){x.fillStyle='rgba(40,40,38,'+rnd(.15,.4)+')';x.beginPath();x.arc(rnd(2,sz-2),rnd(2,sz-2),rnd(.5,1.5),0,6.3);x.fill()}
for(let i=0;i<9;i++){const px=rnd(10,sz-10),w=rnd(3,9),y0=rnd(5,sz*.5),h=rnd(60,200),g=x.createLinearGradient(0,y0,0,y0+h);g.addColorStop(0,'rgba(50,46,40,0)');g.addColorStop(.25,'rgba(50,46,40,.13)');g.addColorStop(1,'rgba(50,46,40,0)');x.fillStyle=g;x.fillRect(px,y0,w,h)}
cracks(x,sz,3,'rgba(40,38,35,.45)')},3);
// --- crépi (hauteur non répétée : saleté en bas, coulures sous le toit)
const T_plas=ptex(512,(d,H,sz)=>{const a=fbm(sz,4,4,4,31),b=fbm(sz,96,96,2,13),e=fbm(sz,10,3,3,57),st=fbm(sz,40,2,3,71);
for(let y=0;y<sz;y++)for(let X=0;X<sz;X++){const i=y*sz+X,vv=1-y/sz;let r=.93+(a[i]-.5)*.1+(b[i]-.5)*.05,g=r*.985,bl=r*.95;
const dk=c01((.17+(e[i]-.5)*.2-vv)/.15);r*=1-.18*dk;g*=1-.2*dk;bl*=1-.24*dk;
const tk=c01((vv-.7)/.2)*c01((st[i]-.45)*4);r*=1-.06*tk;g*=1-.06*tk;bl*=1-.05*tk;
P4(d,i,r*255,g*255,bl*255);H[i]=b[i]*.7+a[i]*.3}},(x,sz)=>cracks(x,sz,5,'rgba(70,62,52,.4)'),2.2);
// --- pierre (moellons)
const T_stone=ptex(256,(d,H,sz)=>{const G=5,cs=sz/G,n=fbm(sz,48,48,2,91),pts=[];for(let j=0;j<G;j++)for(let i=0;i<G;i++)pts.push([(i+.15+hsh(i,j)*.7)*cs,(j+.15+hsh(i+9,j+5)*.7)*cs,hsh(i*3+1,j*7+2)]);
for(let y=0;y<sz;y++)for(let X=0;X<sz;X++){const ci=X/cs|0,cj=y/cs|0;let f1=1e9,f2=1e9,id=0;
for(let dj=-1;dj<2;dj++)for(let di=-1;di<2;di++){const p=pts[((cj+dj+G)%G)*G+(ci+di+G)%G];let dx=Math.abs(X-p[0]),dy=Math.abs(y-p[1]);if(dx>sz/2)dx=sz-dx;if(dy>sz/2)dy=sz-dy;const q=Math.hypot(dx,dy*1.5);if(q<f1){f2=f1;f1=q;id=p[2]}else if(q<f2)f2=q}
const e=c01((f2-f1)/7),i=y*sz+X,k=(.66+.34*id)*(.85+n[i]*.3);let r=182*k*(id>.7?1.08:1),g=172*k,b=152*k;r=92+(r-92)*e;g=86+(g-86)*e;b=76+(b-76)*e;P4(d,i,r,g,b);H[i]=e*(.7+.3*n[i])}},null,3);
// --- bois (planches) ; joints=1 : parquet
function woodTex(joints,seed){return ptex(512,(d,H,sz)=>{const g=fbm(sz,64,2,4,seed),m=fbm(sz,5,5,3,seed+3),f=fbm(sz,128,8,2,seed+7);
for(let y=0;y<sz;y++)for(let X=0;X<sz;X++){const i=y*sz+X,pl=X>>7,e=X&127,ph=hsh(pl,seed),sh=.8+ph*.2,ring=.5+.5*Math.sin((X+(m[i]-.5)*90+pl*37)*.33+(g[i]-.5)*5);
let v=sh*(.76+(g[i]-.5)*.3+ring*.1+(f[i]-.5)*.1),h=.6+(g[i]-.5)*.5+ring*.12;
if(e<2||e>125){v*=.35;h=0}else if(e<4||e>123){v*=.8;h*=.6}
if(joints&&Math.abs(y-(ph*sz|0))<2){v*=.4;h=0}
P4(d,i,v*255,v*236,v*205);H[i]=h}},
(x,sz)=>{for(let k=0;k<5;k++){const px=rnd(20,sz-20),py=rnd(20,sz-20),rg=x.createRadialGradient(px,py,0,px,py,9);rg.addColorStop(0,'rgba(45,28,14,.7)');rg.addColorStop(.5,'rgba(60,38,18,.35)');rg.addColorStop(1,'rgba(60,38,18,0)');x.fillStyle=rg;x.save();x.translate(px,py);x.scale(.6,1);x.fillRect(-9,-9,18,18);x.restore()}
if(!joints){x.fillStyle='rgba(20,15,10,.7)';for(let p=0;p<4;p++)for(const yy of [26,sz-26]){x.beginPath();x.arc(p*128+64,yy,3,0,6.3);x.fill()}}},3)}
const T_wood=woodTex(0,9),T_floor=woodTex(1,23);
// --- caisse de munitions
const T_crate=(()=>{const sz=256,mk=()=>{const c=document.createElement('canvas');c.width=c.height=sz;return c},c1=mk(),c2=mk(),B=22;
const draw=(x,hm)=>{const col=(c,h)=>x.fillStyle=hm?'rgb('+h+','+h+','+h+')':c;
for(let k=0;k<5;k++){const y=k*sz/5;col('rgb('+(176+k*7%13)+','+(140+k*5%11)+','+(94+k*3%9)+')',130);x.fillRect(0,y,sz,sz/5);col('#3a2a18',20);x.fillRect(0,y,sz,2)}
if(!hm)for(let i=0;i<240;i++){x.strokeStyle='rgba(70,45,20,'+rnd(.05,.2)+')';x.lineWidth=rnd(.5,1.4);const y=rnd(0,sz),x0=rnd(-20,sz);x.beginPath();x.moveTo(x0,y);x.bezierCurveTo(x0+30,y+rnd(-2,2),x0+60,y+rnd(-2,2),x0+rnd(60,140),y+rnd(-1,1));x.stroke()}
x.save();x.translate(sz/2,sz/2);x.rotate(Math.PI/4);col('#c8a06a',200);x.fillRect(-sz*.6,-11,sz*1.2,22);if(!hm){x.strokeStyle='rgba(40,26,12,.8)';x.lineWidth=2;x.strokeRect(-sz*.6,-11,sz*1.2,22)}x.restore();
col('#d2ac74',255);x.fillRect(0,0,sz,B);x.fillRect(0,sz-B,sz,B);x.fillRect(0,B,B,sz-2*B);x.fillRect(sz-B,B,B,sz-2*B);
if(!hm){x.strokeStyle='rgba(40,26,12,.85)';x.lineWidth=2;x.strokeRect(1,1,sz-2,sz-2);x.strokeRect(B,B,sz-2*B,sz-2*B);
for(let i=0;i<90;i++){x.strokeStyle='rgba(90,60,30,'+rnd(.06,.2)+')';x.lineWidth=1;const h=Math.random()<.5,t=rnd(2,B-2),u=rnd(0,sz-50),o=Math.random()<.5?0:sz-B;x.beginPath();if(h){x.moveTo(u,o+t);x.lineTo(u+rnd(20,50),o+t)}else{x.moveTo(o+t,u);x.lineTo(o+t,u+rnd(20,50))}x.stroke()}}
col('#2a2622',70);[[11,11],[sz-11,11],[11,sz-11],[sz-11,sz-11],[sz/2,11],[sz/2,sz-11],[11,sz/2],[sz-11,sz/2]].forEach(q=>{x.beginPath();x.arc(q[0],q[1],2.6,0,6.3);x.fill()});
if(!hm){x.fillStyle='rgba(25,22,18,.72)';x.textAlign='right';x.font='bold 20px monospace';x.fillText('7.62 MM',sz-B-8,72);x.font='bold 11px monospace';x.fillText('LOT 0412',sz-B-8,88);
const g=x.createRadialGradient(sz/2,sz/2,sz*.3,sz/2,sz/2,sz*.75);g.addColorStop(0,'rgba(30,20,10,0)');g.addColorStop(1,'rgba(30,20,10,.3)');x.fillStyle=g;x.fillRect(0,0,sz,sz)}};
draw(c1.getContext('2d'),0);const x2=c2.getContext('2d');draw(x2,1);const id=x2.getImageData(0,0,sz,sz).data,H=new Float32Array(sz*sz);for(let i=0;i<sz*sz;i++)H[i]=id[i*4]/255;
return{map:tx(c1,1),normalMap:nmap(H,sz,2.2)}})();
// --- tuiles
const T_roof=ptex(256,(d,H,sz)=>{const n=fbm(sz,32,32,3,61),ms=fbm(sz,5,5,3,67);
for(let y=0;y<sz;y++)for(let X=0;X<sz;X++){const i=y*sz+X,row=y>>6,r=(y&63)/64,cxp=(X+(row&1)*32)&255,col=cxp>>6,c=(cxp&63)/64,hh=hsh(col+row*7,row*13+3);
let k=(.72+.36*hh)*(.62+.38*r)*(.9+n[i]*.2);if(Math.min(c,1-c)<.05)k*=.6;if(r<.07)k*=.55;
let r_=200*k,g_=100*k,b_=68*k;if(hh>.82){r_*=.8;g_*=.86;b_*=.82}
const mo=c01((ms[i]-.62)*5)*.45;r_+=(70-r_)*mo;g_+=(88-g_)*mo;b_+=(50-b_)*mo;
P4(d,i,r_,g_,b_);H[i]=(.25+.75*r)*(.7+.3*Math.sin(Math.PI*c))}},null,3);
// --- sol : terre battue + herbe
const T_grd=ptex(1024,(d,H,sz)=>{const a=fbm(sz,5,5,5,21),b=fbm(sz,24,24,3,7),c=fbm(sz,160,160,2,3),e=fbm(sz,3,3,3,45),gb=fbm(sz,256,96,2,77);
for(let i=0;i<sz*sz;i++){const m=c01((a[i]+(b[i]-.5)*.5-.5)/.1),dry=c01((e[i]-.45)*3),dk=.8+c[i]*.4,gk=.6+gb[i]*.8;
const dr=(126+(b[i]-.5)*40)*dk,dg=(108+(b[i]-.5)*34)*dk,db=(82+(b[i]-.5)*26)*dk,gr=(62+dry*50)*gk,gg=(94+dry*26)*gk,gl=(40+dry*10)*gk;
P4(d,i,dr+(gr-dr)*m,dg+(gg-dg)*m,db+(gl-db)*m);H[i]=(1-m)*(c[i]*.5+b[i]*.3)+m*(.5+gb[i]*.6)}},
(x,sz)=>{for(let i=0;i<650;i++){const px=rnd(6,sz-6),py=rnd(6,sz-6),s=rnd(1.2,3.6),v=120+rnd(0,70)|0;x.fillStyle='rgba(20,16,10,.4)';x.beginPath();x.ellipse(px+1,py+1.2,s,s*.8,0,0,6.3);x.fill();x.fillStyle='rgb('+v+','+(v-6)+','+(v-18)+')';x.beginPath();x.ellipse(px,py,s,s*rnd(.6,.9),rnd(0,3),0,6.3);x.fill()}},2.5);
// --- dalles béton
const T_slab=ptex(512,(d,H,sz)=>{const a=fbm(sz,4,4,4,15),b=fbm(sz,64,64,2,8);
for(let y=0;y<sz;y++)for(let X=0;X<sz;X++){const i=y*sz+X,gx=X&255,gy=y&255,hh=hsh((X>>8)+3,(y>>8)+11);let v=(.72+hh*.12)*(.9+(a[i]-.5)*.25+(b[i]-.5)*.12),h=.6+(b[i]-.5)*.3;
const eg=Math.min(gx,gy,255-gx,255-gy);if(eg<3){v*=.45;h=0}else if(eg<7){v*=.88;h*=.5+eg/14}P4(d,i,v*255,v*250,v*240);H[i]=h}},(x,sz)=>cracks(x,sz,4,'rgba(35,33,30,.5)'),3);
// --- fût métallique
const T_barrel=(()=>{const c=document.createElement('canvas');c.width=512;c.height=256;const x=c.getContext('2d');x.fillStyle='#e6e6e6';x.fillRect(0,0,512,256);
for(let i=0;i<1500;i++){x.fillStyle='rgba('+(Math.random()<.5?'255,255,255':'0,0,0')+','+rnd(.02,.08)+')';x.fillRect(rnd(0,512),rnd(0,256),rnd(1,5),rnd(1,3))}
for(let i=0;i<40;i++){x.strokeStyle='rgba(255,255,255,'+rnd(.1,.3)+')';x.lineWidth=rnd(.5,1.2);const px=rnd(0,512),py=rnd(0,256);x.beginPath();x.moveTo(px,py);x.lineTo(px+rnd(-25,25),py+rnd(-6,6));x.stroke()}
const g=x.createLinearGradient(0,256,0,165);g.addColorStop(0,'rgba(110,55,22,.8)');g.addColorStop(1,'rgba(110,55,22,0)');x.fillStyle=g;x.fillRect(0,165,512,91);
for(let i=0;i<70;i++){const px=rnd(12,500),py=rnd(120,256),r=rnd(3,12),rg=x.createRadialGradient(px,py,0,px,py,r);rg.addColorStop(0,'rgba(120,60,25,.6)');rg.addColorStop(1,'rgba(120,60,25,0)');x.fillStyle=rg;x.fillRect(px-r,py-r,2*r,2*r)}
x.fillStyle='rgba(245,245,235,.92)';x.fillRect(150,92,120,52);x.fillStyle='rgba(20,20,20,.85)';x.font='bold 22px monospace';x.textAlign='center';x.fillText('DIESEL',210,117);x.font='11px monospace';x.fillText('200 L · UN 1202',210,135);return tx(c)})();
// --- matériaux de surface
const bright=(c,f)=>{const r=Math.min(255,(c>>16&255)*f),g=Math.min(255,(c>>8&255)*f),b=Math.min(255,(c&255)*f);return (r<<16)|(g<<8)|b};
const SURF={};
function surf(c){if(SURF[c])return SURF[c];let m;
if(c===0x6a5a3c){m=std(0xffffff,{map:T_crate.map,normalMap:T_crate.normalMap,roughness:.8});m.userData.k='one'}
else if(c===0x7a5a36){m=pm(T_wood,0xe8b888,{roughness:.7});m.userData.k='wood'}
else{m=pm(T_conc,bright(c,1.25),{roughness:.93,vertexColors:true});m.userData.k='wall'}
return SURF[c]=m}
const woodMat=c=>pm(T_wood,bright(c,1.25),{roughness:.75});
const matTile=pm(T_slab,0xb4b2a8,{roughness:.7});
function scaleUV(g,su,sv){const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*su,uv.getY(i)*sv);uv.needsUpdate=true}
function fitUV(g,w,h,d,T){const uv=g.attributes.uv,ou=Math.random(),dims=[[d,h],[d,h],[w,d],[w,d],[w,h],[w,h]];
for(let f=0;f<6;f++)for(let i=0;i<4;i++){const j=f*4+i;uv.setXY(j,uv.getX(j)*dims[f][0]/T+ou,uv.getY(j)*dims[f][1]/T)}uv.needsUpdate=true}
// UV en coordonnées monde : la texture se raccorde d'un bloc à l'autre
function wuv(g,ox,oy,oz,tu,tv){const p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;for(let i=0;i<p.count;i++){const x=p.getX(i)+ox,y=p.getY(i)+oy,z=p.getZ(i)+oz;
if(Math.abs(n.getX(i))>.5)uv.setXY(i,z/tu,y/tv);else if(Math.abs(n.getY(i))>.5)uv.setXY(i,x/tu,z/tu);else uv.setXY(i,x/tu,y/tv)}uv.needsUpdate=true}
// salissure au pied des murs (couleurs de sommets)
function grime(g,oy){const p=g.attributes.position,c=new Float32Array(p.count*3);for(let i=0;i<p.count;i++){const v=p.getY(i)+oy<.05?.58:1;c[i*3]=c[i*3+1]=c[i*3+2]=v}g.setAttribute('color',new THREE.BufferAttribute(c,3))}
const zoneMat=(()=>{const c=document.createElement('canvas');c.width=700;c.height=420;const x=c.getContext('2d');x.fillStyle='rgba(74,168,74,.14)';x.fillRect(0,0,700,420);
x.strokeStyle='rgba(120,230,120,.85)';x.lineWidth=6;x.setLineDash([26,16]);x.strokeRect(12,12,676,396);x.setLineDash([]);x.lineWidth=10;
[[12,12,1,1],[688,12,-1,1],[12,408,1,-1],[688,408,-1,-1]].forEach(q=>{x.beginPath();x.moveTo(q[0],q[1]+q[3]*60);x.lineTo(q[0],q[1]);x.lineTo(q[0]+q[2]*60,q[1]);x.stroke()});
x.font='bold 34px monospace';x.fillStyle='rgba(150,240,150,.55)';x.textAlign='center';x.fillText('ZONE SÛRE',350,72);
const t=new THREE.CanvasTexture(c);t.anisotropy=AN;return new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,toneMapped:false})})();
// ================= SOL =================
const fg=new THREE.PlaneGeometry(60,60,40,40);scaleUV(fg,10,10);
{const p=fg.attributes.position,c=new Float32Array(p.count*3);for(let i=0;i<p.count;i++){const X=p.getX(i),Y=p.getY(i),n=.5+.25*Math.sin(X*.21+1)*Math.cos(Y*.17)+.25*Math.sin(X*.07-Y*.09+2);c[i*3]=.8+.22*n;c[i*3+1]=.84+.16*n;c[i*3+2]=.74+.2*n}fg.setAttribute('color',new THREE.BufferAttribute(c,3))}
const floor=new THREE.Mesh(fg,pm(T_grd,0xffffff,{roughness:1,vertexColors:true}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;S.add(floor);
let NOL=false;
const sstep=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t)};
function terrainH(x,z){const d=Math.max(Math.abs(x),Math.abs(z)),k=sstep(95,165,d);return k*Math.max(0,5+5*Math.sin(x*.045+1.3)*Math.cos(z*.04)+2.5*Math.sin(x*.11)*Math.sin(z*.09+.7)+1.2*Math.sin(x*.27+z*.21))}
{const og=new THREE.PlaneGeometry(3600,3600,600,600);og.rotateX(-Math.PI/2);const p=og.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,Math.max(Math.abs(p.getX(i)),Math.abs(p.getZ(i)))<=MH-3?-9:terrainH(p.getX(i),p.getZ(i))-.03);scaleUV(og,345,345);og.computeVertexNormals();
const o=new THREE.Mesh(og,pm(T_grd,0xd8dccc,{roughness:1,envMapIntensity:.5}));o.receiveShadow=true;S.add(o)}
