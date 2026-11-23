// ================= NATURE (v4) : chemins, forêt en bosquets, arbres isolés =================
const PATHS=[[[0,19],[0,12],[0,5],[-6,4],[-13,3.5]],[[0,5],[6,4],[13,3.5]],[[0,5],[0,-4],[-7,-11],[-13,-12]],[[0,-4],[7,-11],[13,-12]],[[-13,-12],[-30,-20],[-42,-26],[-48.5,-28]],[[13,-12],[30,-12],[40,-10],[46.5,-10]],[[0,-4],[-2,-22],[8,-34],[25,-42],[32.5,-44]],[[-13,3.5],[-25,20],[-38,32],[-44.5,38]]];
{const nodes=[];PATHS.forEach(p=>p.forEach(q=>nodes.push(q)));NEWH.forEach((h,i)=>{let bd=1e9,bq=null;nodes.forEach(q=>{const d=Math.hypot(q[0]-h[0],q[1]-h[1]);if(d<bd){bd=d;bq=q}});const j1=(hsh(i*7+1,13)-.5)*bd*.28,j2=(hsh(i*7+2,13)-.5)*bd*.28,mx=(bq[0]+h[0])/2+j1,mz=(bq[1]+h[1])/2+j2;PATHS.push([[bq[0],bq[1]],[mx,mz],[h[0],h[1]]]);nodes.push([h[0],h[1]],[mx,mz])})}
{const nodes=[];PATHS.forEach(p=>p.forEach(q=>nodes.push(q)));BRG.forEach((b,i)=>{[-1,1].forEach(sg=>{const A=[b.x,b.z+sg*(b.hl+.4)];let bd=1e9,bq=null;nodes.forEach(q=>{const d=Math.hypot(q[0]-A[0],q[1]-A[1]);if(d<bd){bd=d;bq=q}});PATHS.push([[bq[0],bq[1]],[(bq[0]+A[0])/2+(hsh(i*5+sg+9,3)-.5)*bd*.2,(bq[1]+A[1])/2+(hsh(i*5+sg+9,4)-.5)*bd*.2],A])})})}
function nearPath(x,z,m){for(const p of PATHS)for(let i=0;i<p.length-1;i++){const a=p[i],b=p[i+1],dx=b[0]-a[0],dz=b[1]-a[1],l=dx*dx+dz*dz,t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/l)),qx=a[0]+dx*t-x,qz=a[1]+dz*t-z;if(qx*qx+qz*qz<m*m)return true}return false}
{const pt=(()=>{const c=document.createElement('canvas');c.width=64;c.height=128;const x=c.getContext('2d'),id=x.createImageData(64,128);
for(let j=0;j<128;j++)for(let i=0;i<64;i++){const u=i/63,e=Math.min(u,1-u)*2,a=Math.min(1,Math.max(0,(e-.05)/.5)),n=Math.random(),k=(i*7+j*13)%17/17;const o=(j*64+i)*4;lutc(PHL.path,Math.min(1,n*.85+k*.15));id.data[o]=LC[0];id.data[o+1]=LC[1];id.data[o+2]=LC[2];id.data[o+3]=a*(n>.86?150:235)}
x.putImageData(id,0,0);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=AN;return t})(),
pmat=std(0xffffff,{map:pt,transparent:true,roughness:1,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3,envMapIntensity:.4});
PATHS.forEach(p=>{const pts=[];for(let i=0;i<p.length-1;i++){const a=p[i],b=p[i+1],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/1.6));for(let k=0;k<n;k++)pts.push([a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n])}pts.push(p[p.length-1]);
const pos=[],uv=[],idx=[];let dist=0;pts.forEach((q,i)=>{const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)];let tx=b[0]-a[0],tz=b[1]-a[1];const l=Math.hypot(tx,tz)||1;tx/=l;tz/=l;if(i)dist+=Math.hypot(q[0]-pts[i-1][0],q[1]-pts[i-1][1]);
const w=1.45+.35*Math.sin(i*.7+p[0][0]);[-1,1].forEach(s=>{const X=q[0]-tz*s*w,Z=q[1]+tx*s*w;pos.push(X,GH(X,Z)+.04,Z);uv.push(s>0?1:0,dist/5)});if(i){const o=(i-1)*2;idx.push(o,o+1,o+2,o+1,o+3,o+2)}});
const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();const m=new THREE.Mesh(g,pmat);m.receiveShadow=true;m.renderOrder=1;S.add(m)})}
// v62 : sol tassé le long des chemins — la bande de terre se raccorde à l'herbe au lieu de la recouvrir d'un aplat
function pathWear(){const F=window.GFLD;if(!F)return 0;const c=F.c,gs=F.g;let n=0;for(const pa of PATHS)for(let i=0;i<pa.length-1;i++){const a=pa[i],b=pa[i+1],dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1,
i0=Math.max(0,Math.floor((Math.min(a[0],b[0])-4+AR)/GSP)),i1=Math.min(GN-1,Math.ceil((Math.max(a[0],b[0])+4+AR)/GSP)),j0=Math.max(0,Math.floor((Math.min(a[1],b[1])-4+AR)/GSP)),j1=Math.min(GN-1,Math.ceil((Math.max(a[1],b[1])+4+AR)/GSP));
for(let j=j0;j<=j1;j++)for(let ix=i0;ix<=i1;ix++){const x=-AR+ix*GSP,z=-AR+j*GSP,t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/l2)),w=1-sstep(1.2,3.6,Math.hypot(a[0]+dx*t-x,a[1]+dz*t-z));if(w<=.01)continue;const k=j*GN+ix;gs[k]*=1-.92*w;const m=.7*w;c[k*3]+=(.98-c[k*3])*m;c[k*3+1]+=(.88-c[k*3+1])*m;c[k*3+2]+=(.74-c[k*3+2])*m;n++}}
F.geo.attributes.color.needsUpdate=true;F.geo.attributes.gsp.needsUpdate=true;return n}
window.pathWear=pathWear;pathWear();
// arbres
// ================= v8 (v63) : arbres et buissons en modèles 3D, herbe autour du joueur =================
{const nzt=(x,z)=>{const i=Math.floor(x),j=Math.floor(z),a=x-i,b=z-j,u=a*a*(3-2*a),v=b*b*(3-2*b),h=(p,q)=>hsh(p+51,q+777);return(h(i,j)*(1-u)+h(i+1,j)*u)*(1-v)+(h(i,j+1)*(1-u)+h(i+1,j+1)*u)*v};window.NZT=nzt;
// v63 : arbres et buissons = modèles Sketchfab instanciés (arbres.js) ; TR/BU gardent le même format qu'avant (x,z,y,s,ty,r...) pour la navigation, les tests et le monde
const oo=new THREE.Object3D(),col=new THREE.Color();let last={x:1e9,z:1e9,t:0};
const TR=[],BU=[];window.TRE=TR;
//@ARBRES@
//@FARM@
{const t0=performance.now();ARB.build();ARB.place();ARB.init();ARB.tInit=performance.now()-t0}
//@DECOEXT@
// --- herbe : une réserve d'instances recentrée sur le joueur, cellules de 3 m calculées une fois puis mémorisées
const GR={cell:new Map(),pend:[],cx:1e9,cz:1e9,R:46,max:0,q:1};
function grassCell(i,j){const k=i*4099+j;let c=GR.cell.get(k);if(c)return c;const out=[],n=9+((hsh(i+5,j+9)*5)|0),F=window.GFLD,nzg=window.NZT;for(let q=0;q<n;q++){const x=(i+hsh(i*3+q,j*7+1))*3,z=(j+hsh(i*5+2,j*3+q))*3;if(Math.abs(x)>MH-.5||Math.abs(z)>MH-.5||!okPos(x,z,.3)||wDist(x,z)<.5||wDep(x,z)>.02||BRG.some(b=>Math.abs(x-b.x)<b.hw+1.6&&Math.abs(z-b.z)<b.hl+1.5)||nearPath(x,z,1.2))continue;
// v62 : l'herbe pousse là où le sol est herbeux (le poids d'herbe du terrain), par touffes plus ou moins denses ; sa couleur reprend celle du sol
const kk=F?F.k(x,z):-1,gx=kk<0?.8:F.g[kk];if(hsh(i*11+q*3,j*7+q)>sstep(.42,.8,gx)*(.4+1*nzg(x*.17+9,z*.17+4)))continue;
const s=.55+hsh(i+q*13,j)*.55,v=.82+hsh(q,i*3+j)*.36,tn=kk<0?[.9,1,.8]:[F.c[kk*3],F.c[kk*3+1],F.c[kk*3+2]];
out.push([x,GH(x,z),z,hsh(i,j+q*17)*6.3,s,s*(.7+hsh(i+q,j*2)*.6)*(.7+.5*gx),tn[0]*v,tn[1]*v*(.92+hsh(j,q)*.16),tn[2]*v])}GR.cell.set(k,out);return out}
function grassFill(){const im=GRASS;if(!im)return;const R=GR.R,ci=Math.floor(GR.cx/3),cj=Math.floor(GR.cz/3),rc=Math.ceil(R/3);let n=0;const mx=Math.floor(im.userData.max*GR.q);
const cl=[];for(let i=ci-rc;i<=ci+rc;i++)for(let j=cj-rc;j<=cj+rc;j++){const mxx=(i+.5)*3-GR.cx,mzz=(j+.5)*3-GR.cz,d2=mxx*mxx+mzz*mzz;if(d2>R*R)continue;cl.push([d2,i,j])}
cl.sort((a,b)=>a[0]-b[0]);
for(let k=0;k<cl.length&&n<mx;k++){const c=grassCell(cl[k][1],cl[k][2]);for(const g of c){if(n>=mx)break;oo.position.set(g[0],g[1],g[2]);oo.rotation.set(0,g[3],0);oo.scale.set(g[4],g[5],g[4]);oo.updateMatrix();im.setMatrixAt(n,oo.matrix);col.setRGB(g[6],g[7],g[8]);im.setColorAt(n,col);n++}}
im.count=n;im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;if(GR.cell.size>2600)GR.cell.clear()}
window.FOL={TR,BU,TRC:ARB.TRC,BUC:ARB.BUC};
window.foliageUpdate=function(dt){const px=P.x,pz=P.z;last.t+=dt;
if(GRASS){if(!GRASS.userData.max)GRASS.userData.max=GRASS.instanceMatrix.count;GR.q=window.GRQ||1;if(Math.hypot(px-GR.cx,pz-GR.cz)>4||GR.q!==GR.lq){GR.cx=px;GR.cz=pz;GR.lq=GR.q;grassFill()}}
ARB.frame(dt);if(window.DX&&DX.on)DX.frame(dt)};

}
