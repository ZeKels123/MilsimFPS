// ================= NATURE (v4) : chemins, forêt en bosquets, arbres isolés =================
const PATHS=[[[0,19],[0,12],[0,5],[-6,4],[-13,3.5]],[[0,5],[6,4],[13,3.5]],[[0,5],[0,-4],[-7,-11],[-13,-12]],[[0,-4],[7,-11],[13,-12]],[[-13,-12],[-30,-20],[-42,-26],[-48.5,-28]],[[13,-12],[30,-12],[40,-10],[46.5,-10]],[[0,-4],[-2,-22],[8,-34],[25,-42],[32.5,-44]],[[-13,3.5],[-25,20],[-38,32],[-44.5,38]]];
{const nodes=[];PATHS.forEach(p=>p.forEach(q=>nodes.push(q)));NEWH.forEach((h,i)=>{let bd=1e9,bq=null;nodes.forEach(q=>{const d=Math.hypot(q[0]-h[0],q[1]-h[1]);if(d<bd){bd=d;bq=q}});const j1=(hsh(i*7+1,13)-.5)*bd*.28,j2=(hsh(i*7+2,13)-.5)*bd*.28,mx=(bq[0]+h[0])/2+j1,mz=(bq[1]+h[1])/2+j2;PATHS.push([[bq[0],bq[1]],[mx,mz],[h[0],h[1]]]);nodes.push([h[0],h[1]],[mx,mz])})}
{const nodes=[];PATHS.forEach(p=>p.forEach(q=>nodes.push(q)));BRG.forEach((b,i)=>{[-1,1].forEach(sg=>{const A=[b.x,b.z+sg*(b.hl+.4)];let bd=1e9,bq=null;nodes.forEach(q=>{const d=Math.hypot(q[0]-A[0],q[1]-A[1]);if(d<bd){bd=d;bq=q}});PATHS.push([[bq[0],bq[1]],[(bq[0]+A[0])/2+(hsh(i*5+sg+9,3)-.5)*bd*.2,(bq[1]+A[1])/2+(hsh(i*5+sg+9,4)-.5)*bd*.2],A])})})}
function nearPath(x,z,m){for(const p of PATHS)for(let i=0;i<p.length-1;i++){const a=p[i],b=p[i+1],dx=b[0]-a[0],dz=b[1]-a[1],l=dx*dx+dz*dz,t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/l)),qx=a[0]+dx*t-x,qz=a[1]+dz*t-z;if(qx*qx+qz*qz<m*m)return true}return false}
{const pt=(()=>{const c=document.createElement('canvas');c.width=64;c.height=128;const x=c.getContext('2d'),id=x.createImageData(64,128);
for(let j=0;j<128;j++)for(let i=0;i<64;i++){const u=i/63,e=Math.min(u,1-u)*2,a=Math.min(1,Math.max(0,(e-.05)/.5)),n=Math.random(),k=(i*7+j*13)%17/17;const o=(j*64+i)*4;id.data[o]=150+n*30-k*10;id.data[o+1]=124+n*26-k*10;id.data[o+2]=90+n*20;id.data[o+3]=a*(n>.86?150:235)}
x.putImageData(id,0,0);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=AN;return t})(),
pmat=std(0xffffff,{map:pt,transparent:true,roughness:1,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3,envMapIntensity:.4});
PATHS.forEach(p=>{const pts=[];for(let i=0;i<p.length-1;i++){const a=p[i],b=p[i+1],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/1.6));for(let k=0;k<n;k++)pts.push([a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n])}pts.push(p[p.length-1]);
const pos=[],uv=[],idx=[];let dist=0;pts.forEach((q,i)=>{const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)];let tx=b[0]-a[0],tz=b[1]-a[1];const l=Math.hypot(tx,tz)||1;tx/=l;tz/=l;if(i)dist+=Math.hypot(q[0]-pts[i-1][0],q[1]-pts[i-1][1]);
const w=1.45+.35*Math.sin(i*.7+p[0][0]);[-1,1].forEach(s=>{const X=q[0]-tz*s*w,Z=q[1]+tx*s*w;pos.push(X,GH(X,Z)+.04,Z);uv.push(s>0?1:0,dist/5)});if(i){const o=(i-1)*2;idx.push(o,o+1,o+2,o+1,o+3,o+2)}});
const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();const m=new THREE.Mesh(g,pmat);m.receiveShadow=true;m.renderOrder=1;S.add(m)})}
// arbres
// ================= v8 : arbres et buissons à feuillage en cartes alpha, LOD, herbe autour du joueur =================
{const nzt=(x,z)=>{const i=Math.floor(x),j=Math.floor(z),a=x-i,b=z-j,u=a*a*(3-2*a),v=b*b*(3-2*b),h=(p,q)=>hsh(p+51,q+777);return(h(i,j)*(1-u)+h(i+1,j)*u)*(1-v)+(h(i,j+1)*(1-u)+h(i+1,j+1)*u)*v};
// --- textures de feuillage (canvas) : rameau de pin et amas de feuilles, fond transparent
const cvs=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
const tex=c=>{const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=AN;t.generateMipmaps=true;t.minFilter=THREE.LinearMipmapLinearFilter;return t};
const pineT=(()=>{const c=cvs(128,64),x=c.getContext('2d');x.lineCap='round';x.strokeStyle='#4a3a26';x.lineWidth=2;x.beginPath();x.moveTo(0,32);x.lineTo(122,32);x.stroke();
for(let i=0;i<96;i++){const t=i/96,px=4+t*112,sd=i%2?1:-1,len=(26*(1-t*.62)+5)*(.7+hsh(i,3)*.5),an=.75+hsh(i,5)*.5,L=hsh(i,9);x.strokeStyle='hsl('+(100+L*28|0)+','+(38+L*16|0)+'%,'+(30+L*22|0)+'%)';x.lineWidth=1.6+hsh(i,11);x.beginPath();x.moveTo(px,32);x.lineTo(px+Math.cos(an)*len*.55,32+sd*Math.sin(an)*len);x.stroke();
x.strokeStyle='hsl('+(92+L*30|0)+',45%,'+(36+L*18|0)+'%)';x.lineWidth=1.2;x.beginPath();x.moveTo(px+2,32);x.lineTo(px+2+Math.cos(an*.7)*len*.4,32+sd*Math.sin(an*.9)*len*.8);x.stroke()}
return tex(c)})();
const leafT=(()=>{const c=cvs(128,128),x=c.getContext('2d');for(let i=0;i<40;i++){const a=hsh(i,21)*6.28,r=Math.sqrt(hsh(i,23))*50,px=64+Math.cos(a)*r,py=64+Math.sin(a)*r,rot=hsh(i,25)*6.28,L=hsh(i,27);x.save();x.translate(px,py);x.rotate(rot);x.fillStyle='hsl('+(78+L*34|0)+','+(42+L*20|0)+'%,'+(36+L*22|0)+'%)';x.beginPath();x.ellipse(0,0,12+hsh(i,29)*6,5+hsh(i,31)*3,0,0,6.283);x.fill();x.strokeStyle='rgba(20,40,10,.5)';x.lineWidth=.8;x.beginPath();x.moveTo(-10,0);x.lineTo(10,0);x.stroke();x.restore()}
return tex(c)})();
const bushT=(()=>{const c=cvs(256,256),x=c.getContext('2d');x.lineCap='round';const tw=[];
for(let i=0;i<9;i++){const a=-1.5708+(i-4)*.2+(hsh(i,71)-.5)*.14,len=150+hsh(i,73)*85;let px=128,py=256,an=a;const pts=[[px,py]];for(let k=0;k<7;k++){an+=(hsh(i*9+k,75)-.5)*.3;px+=Math.cos(an)*len/7;py+=Math.sin(an)*len/7;pts.push([px,py])}tw.push(pts);
x.strokeStyle='hsl(28,32%,'+(15+hsh(i,77)*9|0)+'%)';for(let k=0;k<7;k++){x.lineWidth=3.4-k*.4;x.beginPath();x.moveTo(pts[k][0],pts[k][1]);x.lineTo(pts[k+1][0],pts[k+1][1]);x.stroke()}}
const leaf=(px,py,rot,sz,L,dk)=>{x.save();x.translate(px,py);x.rotate(rot);const g=x.createLinearGradient(0,-sz*.5,0,sz*.5);const hu=84+L*38,sa=40+L*22,li=(34+L*22)*dk;g.addColorStop(0,'hsl('+hu+','+sa+'%,'+(li+7)+'%)');g.addColorStop(1,'hsl('+(hu+6)+','+sa+'%,'+(li-5)+'%)');x.fillStyle=g;x.beginPath();x.moveTo(-sz,0);x.quadraticCurveTo(-sz*.2,-sz*.62,sz,0);x.quadraticCurveTo(-sz*.2,sz*.62,-sz,0);x.fill();
x.strokeStyle='hsla('+(hu-8)+',45%,'+(li+16)+'%,.75)';x.lineWidth=.8;x.beginPath();x.moveTo(-sz*.9,0);x.lineTo(sz*.9,0);x.stroke();x.restore()};
// feuilles du fond (sombres) puis feuilles de devant, par paires le long des tiges
for(let pass=0;pass<2;pass++)tw.forEach((pts,i)=>{for(let k=1;k<pts.length;k++){const p=pts[k],q=pts[k-1],an=Math.atan2(p[1]-q[1],p[0]-q[0]);for(let j=0;j<(pass?3:4);j++){const t=hsh(i*31+k*7+j,79+pass),bx=q[0]+(p[0]-q[0])*t,by=q[1]+(p[1]-q[1])*t,sd=j%2?1:-1,rot=an+sd*(.7+hsh(i+k*5+j,81)*.7),sz=(7.5+hsh(i*3+k+j*11,83)*5)*(pass?1:1.2),dk=(pass?1:.72)*(.7+.3*(1-by/256));leaf(bx+Math.cos(rot)*sz*.9+(pass?0:sd*4),by+Math.sin(rot)*sz*.9,rot,sz,hsh(i*13+k*3+j,85+pass),dk)}}});
// quelques baies
for(let i=0;i<9;i++){const t=tw[i%9][3+(i%4)];x.fillStyle=i%3?'#8a1f2a':'#b03a2a';x.beginPath();x.arc(t[0]+(hsh(i,87)-.5)*14,t[1]+(hsh(i,89)-.5)*14,2.3,0,6.283);x.fill()}
return tex(c)})();
// --- géométrie : quads à double sens (les normales sont gardées telles quelles, pas de retournement)
const QG=()=>({p:[],u:[],n:[],i:[]});
const qd=(G,a,b,c,d,n)=>{const o=G.p.length/3;[a,b,c,d].forEach((q,k)=>{G.p.push(q[0],q[1],q[2]);G.u.push(k===1||k===2?1:0,k>1?1:0);const nn=Array.isArray(n[0])?n[k]:n;G.n.push(nn[0],nn[1],nn[2])});G.i.push(o,o+1,o+2,o,o+2,o+3,o,o+2,o+1,o,o+3,o+2)};
const bg=G=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(G.p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(G.u,2));g.setAttribute('normal',new THREE.Float32BufferAttribute(G.n,3));g.setIndex(G.i);return g};
const nrm=(x,y,z)=>{const l=Math.hypot(x,y,z)||1;return[x/l,y/l,z/l]};
// pin : étages de rameaux retombants (st : un étage sur st, nbK : part des rameaux gardée, wK : largeur)
const mkPine=(st,nbK,wK)=>{const gp=QG();for(let k=0;k<9;k+=st){const h=1.9+k*.92,r=2.35*Math.pow(1-k/9.6,.85)+.35,nb=Math.max(4,Math.round((k<2?9:k<6?8:6)*nbK)),off=k*.7;for(let j=0;j<nb;j++){const a=off+j/nb*6.2832+hsh(k,j)*.35,c=Math.cos(a),s=Math.sin(a),w=r*.55*wK,tx=-s,tz=c,x0=.12,y0=h+.18+(st>1?.5:0),x1=r,y1=h-.5-r*.1-(st>1?.3:0);
qd(gp,[c*x0-tx*w*.35,y0,s*x0-tz*w*.35],[c*x1-tx*w,y1,s*x1-tz*w],[c*x1+tx*w,y1,s*x1+tz*w],[c*x0+tx*w*.35,y0,s*x0+tz*w*.35],[nrm(c*.5,.8,s*.5),nrm(c*.9,.45,s*.9),nrm(c*.9,.45,s*.9),nrm(c*.5,.8,s*.5)])}}
for(let j=0;j<4;j++){const a=j*1.5708,c=Math.cos(a),s=Math.sin(a);qd(gp,[0,9.3,0],[c*.5,9.5,s*.5],[c*.18,10.7,s*.18],[-c*.5,9.5,-s*.5],nrm(0,1,0))}return bg(gp)};
const GPN=mkPine(1,1,1),GPF=mkPine(2,.62,1.5);
// feuillu : amas de feuilles dans une couronne ellipsoïdale
const mkLeafy=(n,sK)=>{const gb=QG();for(let k=0;k<n;k++){const u=hsh(k,41)*2-1,a=hsh(k,43)*6.2832,rr=Math.sqrt(1-u*u),dd=.55+.45*Math.cbrt(hsh(k,45)),px=Math.cos(a)*rr*dd*2.5,py=4.9+u*dd*2.1,pz=Math.sin(a)*rr*dd*2.5,sz=(.85+hsh(k,47)*.5)*sK,rz=hsh(k,49)*6.28,c=Math.cos(rz)*sz,s=Math.sin(rz)*sz,ty=hsh(k,51)-.5,nn=nrm(px,(py-4.9)*1.3+.4,pz);
const ex=[c,ty*.6,s],ez=[-s*.8,.7*sz,c*.8];qd(gb,[px-ex[0]-ez[0],py-ex[1]-ez[1],pz-ex[2]-ez[2]],[px+ex[0]-ez[0],py+ex[1]-ez[1],pz+ex[2]-ez[2]],[px+ex[0]+ez[0],py+ex[1]+ez[1],pz+ex[2]+ez[2]],[px-ex[0]+ez[0],py-ex[1]+ez[1],pz-ex[2]+ez[2]],nn)}return bg(gb)};
const GBN=mkLeafy(64,1),GBF=mkLeafy(22,1.7);
// buisson : gerbe de cartes qui partent du pied (la texture porte les tiges) + quelques cartes couchées pour le volume
const mkBush=(n,sK)=>{const gs=QG();for(let k=0;k<n;k++){const a=k/n*6.2832+hsh(k,61)*.6,lean=.25+hsh(k,63)*.55,hh=(.85+hsh(k,65)*.45),w=(.55+hsh(k,67)*.25)*sK,ca=Math.cos(a),sa=Math.sin(a),ox=ca*.12,oz=sa*.12,tx=ca*Math.sin(lean)*hh,ty=Math.cos(lean)*hh,tz=sa*Math.sin(lean)*hh,px=-sa*w,pz=ca*w,nn=nrm(ca*.6,.7,sa*.6);
qd(gs,[ox-px,0,oz-pz],[ox+px,0,oz+pz],[ox+tx+px,ty,oz+tz+pz],[ox+tx-px,ty,oz+tz-pz],nn)}return bg(gs)};
const GSN=mkBush(11,1),GSF=mkBush(5,1.5);
// matériaux : cartes alpha avec vent, ombres découpées dans la silhouette des feuilles
const fm=(t,k,o)=>{const m=std(0xffffff,Object.assign({map:t,alphaTest:.42,roughness:.92,envMapIntensity:.45},o));m.defines={WK:k};windify(m,k);return m};
const fd=(t,k)=>{const m=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:t,alphaTest:.42});windify(m,k);return m};
const mf=std(0xffffff,{roughness:1,envMapIntensity:.4}),FAR_=(k)=>windify(mf.clone(),k);
const tk=new THREE.CylinderGeometry(.16,.3,3,6),tkm=std(0x4a3a2a,{roughness:1});
const TR=[],NP=760,NO=260,NBU=710;let np=0,no=0,t=0;
while((np<NP||no<NO)&&t++<26000){const x=rnd(-MH+3,MH-3),z=rnd(-MH+3,MH-3),d=nzt(x*.032+3,z*.032-5),p=d>.55?.5:.012;if(Math.random()>p||!okPos(x,z,2.2)||wDist(x,z)<2.5||nearPath(x,z,3.4)||(Math.abs(x)<9&&z>16))continue;const s=rnd(.8,1.5),pine=Math.random()<.68&&np<NP;if(pine)np++;else if(no<NO)no++;else continue;TR.push({x,z,y:GH(x,z),s,ty:pine?0:1,r:rnd(0,6.28),h:rnd(.3,.45),sh:rnd(.7,1.15)})}
// collisions : une boîte et un maillage invisible par tronc (les tirs les touchent), le tronc visible est instancié
TR.forEach(q=>{const sc=q.ty?q.s*1.15:q.s,hh=q.ty?1.1:1,m=new THREE.Mesh(tk,tkm);m.scale.set(sc,sc*hh,sc);m.position.set(q.x,q.y+1.5*sc*hh,q.z);m.visible=false;S.add(m);solids.push(m);boxes.push({x0:q.x-.3*sc,x1:q.x+.3*sc,z0:q.z-.3*sc,z1:q.z+.3*sc})});
const tki=new THREE.InstancedMesh(new THREE.CylinderGeometry(.14,.3,1,6),std(0x4a3a2a,{roughness:1,envMapIntensity:.3}),TR.length),oo=new THREE.Object3D();
TR.forEach((q,i)=>{const hh=q.ty?4.6:6.4,sc=q.ty?q.s*1.1:q.s*.9;oo.position.set(q.x,q.y+hh*q.s*.5,q.z);oo.rotation.set(0,q.r,0);oo.scale.set(sc*(q.ty?1.3:1),hh*q.s,sc*(q.ty?1.3:1));oo.updateMatrix();tki.setMatrixAt(i,oo.matrix)});tki.castShadow=tki.receiveShadow=true;S.add(tki);
// --- LOD : listes d'instances reconstruites quand le joueur bouge
function lodSet(geoN,matN,geoF,matF,dN,cap,wkd,wkf){const a=new THREE.InstancedMesh(geoN,matN,cap),b=new THREE.InstancedMesh(geoF,matF,cap);[a,b].forEach(m=>m.setColorAt(0,new THREE.Color(1,1,1)));a.count=b.count=0;[a,b].forEach(m=>{m.castShadow=m.receiveShadow=true;m.frustumCulled=false;S.add(m)});if(wkd)a.customDepthMaterial=wkd;if(wkf)b.customDepthMaterial=wkf;return{a,b,dN,cap}}
const LP=lodSet(GPN,fm(pineT,6),GPF,fm(pineT,6),64,NP,fd(pineT,6),fd(pineT,6)),LB=lodSet(GBN,fm(leafT,7),GBF,fm(leafT,7),64,NO,fd(leafT,7),fd(leafT,7));
const BU=[];t=0;while(BU.length<NBU&&t++<40000){const x=rnd(-MH+2,MH-2),z=rnd(-MH+2,MH-2);if(!okPos(x,z,.9)||wDist(x,z)<.8||nearPath(x,z,2.2)||(Math.abs(x)<9&&z>16))continue;BU.push({x,z,y:GH(x,z),s:rnd(.8,1.7),r:rnd(0,6.28),h:rnd(.22,.3),sh:rnd(.7,1.2)})}
const LS=lodSet(GSN,fm(bushT,8),GSF,fm(bushT,8),38,NBU,fd(bushT,8),fd(bushT,8));
const col=new THREE.Color(),M4=new THREE.Matrix4(),SM=new THREE.Matrix4();let last={x:1e9,z:1e9,t:0};
function put(L,q,hue,near,idx){const m=near?L.a:L.b;oo.position.set(q.x,q.y,q.z);oo.rotation.set(0,q.r,0);oo.scale.set(q.s,q.s*(q.sc||1),q.s);oo.updateMatrix();m.setMatrixAt(idx,oo.matrix);
col.setHSL(hue+(q.h-.37)*.12,.22,Math.min(.97,.6+.3*q.sh));m.setColorAt(idx,col)}
function lodUpdate(px,pz){let na=0,nb=0,ba=0,bb=0,sa=0,sb=0;const zk=Math.max(1,Math.min(4,75/C.fov)),R=LP.dN*LP.dN*zk*zk,RS=LS.dN*LS.dN*zk*zk;
for(const q of TR){const dx=q.x-px,dz=q.z-pz,d=dx*dx+dz*dz;if(d>190*190)continue;const near=d<R;if(q.ty===0){if(near)put(LP,q,.31,1,na++);else put(LP,q,.3,0,nb++)}else{if(near)put(LB,q,.25,1,ba++);else put(LB,q,.25,0,bb++)}}
for(const q of BU){const dx=q.x-px,dz=q.z-pz,d=dx*dx+dz*dz;if(d>130*130)continue;if(d<RS)put(LS,q,.27,1,sa++);else put(LS,q,.27,0,sb++)}
LP.a.count=na;LP.b.count=nb;LB.a.count=ba;LB.b.count=bb;LS.a.count=sa;LS.b.count=sb;[LP,LB,LS].forEach(L=>{[L.a,L.b].forEach(m=>{m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true})})}
// --- herbe : une réserve d'instances recentrée sur le joueur, cellules de 3 m calculées une fois puis mémorisées
const GR={cell:new Map(),pend:[],cx:1e9,cz:1e9,R:46,max:0,q:1};
function grassCell(i,j){const k=i*4099+j;let c=GR.cell.get(k);if(c)return c;const out=[],n=6+((hsh(i+5,j+9)*4)|0);for(let q=0;q<n;q++){const x=(i+hsh(i*3+q,j*7+1))*3,z=(j+hsh(i*5+2,j*3+q))*3;if(Math.abs(x)>MH-.5||Math.abs(z)>MH-.5||!okPos(x,z,.3)||wDist(x,z)<.5||BRG.some(b=>Math.abs(x-b.x)<3.2&&Math.abs(z-b.z)<b.hl+1.5)||nearPath(x,z,1.2))continue;const s=.5+hsh(i+q*13,j)*.6;out.push([x,GH(x,z),z,hsh(i,j+q*17)*6.3,s,s*(.7+hsh(i+q,j*2)*.6),.75+hsh(q,i)*.35,.85+hsh(j,q)*.25,.65+hsh(q+j,i)*.35])}GR.cell.set(k,out);return out}
function grassFill(){const im=GRASS;if(!im)return;const R=GR.R,ci=Math.floor(GR.cx/3),cj=Math.floor(GR.cz/3),rc=Math.ceil(R/3);let n=0;const mx=Math.floor(im.userData.max*GR.q);
for(let i=ci-rc;i<=ci+rc&&n<mx;i++)for(let j=cj-rc;j<=cj+rc&&n<mx;j++){const mxx=(i+.5)*3-GR.cx,mzz=(j+.5)*3-GR.cz;if(mxx*mxx+mzz*mzz>R*R)continue;const c=grassCell(i,j);for(const g of c){if(n>=mx)break;oo.position.set(g[0],g[1],g[2]);oo.rotation.set(0,g[3],0);oo.scale.set(g[4],g[5],g[4]);oo.updateMatrix();im.setMatrixAt(n,oo.matrix);col.setRGB(g[6],g[7],g[8]);im.setColorAt(n,col);n++}}
im.count=n;im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;if(GR.cell.size>2600)GR.cell.clear()}
window.FOL={LP,LB,LS,GPN,GBN,GSN,pineT,leafT,TR,BU};
window.foliageUpdate=function(dt){const px=P.x,pz=P.z;last.t+=dt;
if(GRASS){if(!GRASS.userData.max)GRASS.userData.max=GRASS.instanceMatrix.count;GR.q=window.GRQ||1;if(Math.hypot(px-GR.cx,pz-GR.cz)>4||GR.q!==GR.lq){GR.cx=px;GR.cz=pz;GR.lq=GR.q;grassFill()}}
if(Math.hypot(px-last.x,pz-last.z)>3||last.t>1.5||Math.abs(C.fov-(last.f||75))>6){last.f=C.fov;{last.x=px;last.z=pz;last.t=0;lodUpdate(px,pz)}}};

}
