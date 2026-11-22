// ================= DÉCOR EXTÉRIEUR (v64) : végétation basse, rochers, falaises, clôtures, mobilier de jardin =================
// 29 modèles (Sketchfab CC-BY / Poly Haven CC0, docs/CREDITS_ASSETS.md), données dans deco_ext_data.js (tools/deco_ext_export.py).
// Même principe que arbres.js : un InstancedMesh par modèle et par niveau de détail (LOD0 près, LOD1 moyen, rien au-delà), listes d'instances reconstruites quand le joueur
// bouge (culling par distance, par cellule de 32 m et par cône de vue), ombres seulement pour LOD0, vent par shader pour la végétation (arbWind).
// Placement déterministe : hash de position (hsh), jamais Math.random. Collisions : boîtes orientées (rochers, falaise par tranches, clôtures par tronçons) ->
// boxes (déplacement, navigation IA) + objets de lancer de rayon analytiques insérés dans solids/ray (balles, grenades, lignes de vue).
// Se place après arbres.js (ARB.place) : les troncs sont déjà dans boxes, donc okPos les voit. Rien dans les maisons, routes, chemins, ponts, ville (hors mobilier de rue), eau profonde.
const DX=window.DX={T:{},list:[],cell:{v:new Map(),p:new Map(),r:new Map()},ray:new Map(),rayN:0,obs:[],on:0,tInit:0,ms:0,dirty:1,last:{x:1e9,z:1e9,yaw:9,fov:0,t:0},stat:{l0:0,l1:0,n:0},D:DXD,fences:[],zone:{}};
// g : groupe d'index spatial (v végétation, p mobilier, r roches) ; r0 : rayon LOD0 ; r1 : rayon de visibilité ; sh : ombres (LOD0) ; wk : vent ; lf : feuillage ; ds : double face ; bm : matériau balistique ; ray : arrête les balles ; rd : rayon englobant
const DXK={
 rb_petit:{g:'v',r0:22,r1:85,sh:1,wk:.07,lf:1,ds:1,rd:.9},rb_moyen1:{g:'v',r0:22,r1:85,sh:1,wk:.07,lf:1,ds:1,rd:1.3},rb_moyen2:{g:'v',r0:22,r1:85,sh:1,wk:.07,lf:1,ds:1,rd:1.2},rb_haut1:{g:'v',r0:24,r1:90,sh:1,wk:.05,lf:1,ds:1,rd:1.5},rb_haut3:{g:'v',r0:24,r1:90,sh:1,wk:.05,lf:1,ds:1,rd:1.3},
 fleuri:{g:'v',r0:22,r1:85,sh:1,wk:.06,lf:1,ds:1,rd:2},haie:{g:'v',r0:28,r1:95,sh:1,ds:1,rd:1.4,bm:'wood'},
 fougere_a:{g:'v',r0:14,r1:55,wk:.1,lf:1,ds:1,rd:1.2},fougere_b:{g:'v',r0:14,r1:55,wk:.1,lf:1,ds:1,rd:1.2},fougere_c:{g:'v',r0:14,r1:55,wk:.1,lf:1,ds:1,rd:1.3},herbes:{g:'v',r0:16,r1:60,wk:.12,lf:1,ds:1,rd:1.5},
 jsapin:{g:'v',r0:30,r1:120,sh:1,wk:.004,ds:1,rd:2.2},roseau_a:{g:'v',r0:20,r1:80,wk:.02,lf:1,ds:1,rd:.8},roseau_b:{g:'v',r0:20,r1:80,wk:.02,lf:1,ds:1,rd:.8},
 rocher1:{g:'r',r0:45,r1:200,sh:1,rd:2,ray:1,bm:'conc'},rocher2:{g:'r',r0:45,r1:200,sh:1,rd:1.7,ray:1,bm:'conc'},rocher3:{g:'r',r0:45,r1:200,sh:1,rd:1.4,ray:1,bm:'conc'},falaise:{g:'r',r0:95,r1:270,sh:1,rd:10,ray:1,bm:'conc'},
 cloture:{g:'p',r0:35,r1:100,sh:1,ds:1,rd:1.5,ray:1,bm:'wood'},foin:{g:'p',r0:40,r1:120,sh:1,ds:1,rd:1,ray:1,bm:'wood'},bois:{g:'p',r0:35,r1:100,sh:1,ds:1,rd:1.1,ray:1,bm:'wood'},
 tablejardin:{g:'p',r0:35,r1:90,sh:1,ds:1,rd:1.1,ray:1,bm:'wood'},banc:{g:'p',r0:35,r1:90,sh:1,ds:1,rd:.9,ray:1,bm:'wood'},piquenique:{g:'p',r0:35,r1:90,sh:1,ds:1,rd:1.4,ray:1,bm:'wood'},
 foyer:{g:'p',r0:35,r1:90,ds:1,rd:.9,ray:1,bm:'conc'},boitier:{g:'p',r0:35,r1:90,sh:1,ds:1,rd:.5,ray:1,bm:'steel'},egout:{g:'p',r0:30,r1:60,ds:1,rd:.4},seau:{g:'p',r0:25,r1:70,ds:1,rd:.3},projecteur:{g:'p',r0:35,r1:110,sh:1,ds:1,rd:.4}};
const DXG={v:{R:95,cap:[420,1400]},p:{R:125,cap:[260,700]},r:{R:275,cap:[400,1500]}};
// ---------- textures et construction ----------
const DXTX=[];function dxTex(i){if(DXTX[i])return DXTX[i];const im=new Image(),t=new THREE.Texture(im);t.encoding=THREE.sRGBEncoding;t.anisotropy=Math.min(AN,4);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.generateMipmaps=true;t.minFilter=THREE.LinearMipmapLinearFilter;
 im.onload=()=>{t.needsUpdate=true;try{R.initTexture(t)}catch(e){}};im.src=DXD.T[i];return DXTX[i]=t}
// v64b : calibrage luminosité (végétation trop claire/saturée, roches trop sombres)
const DXADJ=(n,k)=>k==='rock'?1.5:n==='haie'?.62:n==='jsapin'?.74:k==='veg'?.8:1;
function dxBuild(){let ntri=0;for(const n in DXD.M){const d=DXD.M[n],c=DXK[n];if(!c)continue;const T={n,d,c,g:c.g,L:[[],[]],m:[null,null],cnt:[0,0],cap:[0,0],total:0,r0s:c.r0*c.r0,r1s:c.r1*c.r1,two:!!d.l1};
 [0,1].forEach(L=>{const parts=L===0?d.l0:d.l1;if(!parts)return;parts.forEach(p=>{const g=arbGeo(p,d.q);ntri+=p.i/3*(L?0:1);const map=p.t>=0?dxTex(p.t):null,
   mat=std(p.col?new THREE.Color(p.col[0],p.col[1],p.col[2]):0xffffff,{map,roughness:.95,envMapIntensity:.35,side:c.ds?THREE.DoubleSide:THREE.FrontSide});if(p.a)mat.alphaTest=.45;mat.color.multiplyScalar(d.br*DXADJ(n,d.k));
   if(c.wk)arbWind(mat,c.wk,!!c.lf);const mesh=new THREE.InstancedMesh(g,mat,1);mesh.castShadow=!!c.sh&&L===0;mesh.receiveShadow=true;mesh.frustumCulled=false;mesh.visible=false;mesh.userData.dx=n;
   if(mesh.castShadow&&(c.wk||p.a))mesh.customDepthMaterial=arbDepth(p.a?map:null,c.wk||0,!!c.lf);S.add(mesh);T.L[L].push(mesh)})});
  DX.T[n]=T}DX.tri=ntri}
function dxAlloc(T,lv,cap){const ms=T.L[lv];if(!ms.length)return;const ma=new THREE.InstancedBufferAttribute(new Float32Array(cap*16),16),ca=new THREE.InstancedBufferAttribute(new Float32Array(cap*3),3);ma.setUsage(THREE.DynamicDrawUsage);ca.setUsage(THREE.DynamicDrawUsage);
 ms.forEach(m=>{m.instanceMatrix=ma;m.instanceColor=ca;m.count=0;m.visible=false});T.m[lv]=ms;T.cap[lv]=cap;(T.A||(T.A=[]))[lv*2]=ma.array;T.A[lv*2+1]=ca.array}
// ---------- aides de placement (hash de position : déterministe) ----------
const dxH=(i,j,k)=>hsh(i*7919+k*104729,j*6007+k*3571+k*k*13);
const dxCellK=(x,z)=>Math.floor(x/32)*4099+Math.floor(z/32);
function dxCell(M,q){const k=dxCellK(q.x,q.z);let a=M.get(k);if(!a)M.set(k,a=[]);a.push(q)}
function dxEach(G,seed,f,x0,x1,z0,z1){x0=x0===undefined?-MH+6:x0;x1=x1===undefined?MH-6:x1;z0=z0===undefined?-MH+6:z0;z1=z1===undefined?MH-6:z1;
 for(let i=Math.floor(x0/G);i<Math.ceil(x1/G);i++)for(let j=Math.floor(z0/G);j<Math.ceil(z1/G);j++){const x=(i+dxH(i,j,seed))*G,z=(j+dxH(i,j,seed+1))*G;if(x<x0||x>x1||z<z0||z>z1)continue;f(x,z,i,j)}}
const dxInFor=(x,z)=>x>FOR.x0&&x<FOR.x1&&z>FOR.z0&&z<FOR.z1,dxInFarm=(x,z)=>x>FARM.x0&&x<FARM.x1&&z>FARM.z0&&z<FARM.z1,dxInCity=(x,z)=>x>CT.x0-6&&x<CT.x1+6&&z>CT.z0-6&&z<CT.z1+6;
const dxOk=(x,z,m)=>Math.abs(x)<MH-7&&Math.abs(z)<MH-7&&arbOkSpot(x,z,m)&&!(Math.abs(x)<10&&z>14&&z<36);
const dxSl=(x,z)=>arbSlope(x,z);
// instance : x,z ; o : y, r (lacet), s (échelle horizontale), sy (verticale), tn, tint [r,g,b] ; la teinte par instance module la luminosité du matériau
function dxAdd(n,x,z,o){o=o||{};const T=DX.T[n];if(!T)return null;const s=o.s||1,tn=o.tn!==undefined?o.tn:dxH(Math.round(x*7),Math.round(z*7),31),tn2=dxH(Math.round(x*5),Math.round(z*5),33);
 const q={T,n,x,z,y:o.y!==undefined?o.y:GH(x,z),r:o.r||0,sx:s,sy:o.sy||s,cr:1,cg:1,cb:1};
 if(o.tint){q.cr=o.tint[0];q.cg=o.tint[1];q.cb=o.tint[2]}else{const v=.82+.3*tn,h=(tn2-.5)*.12;q.cr=v*(1+h);q.cg=v;q.cb=v*(1-h)}
 q.k=o.k||0;q.rad=T.c.rd*Math.max(s,q.sy);DX.list.push(q);dxCell(DX.cell[T.g],q);T.total++;if(T.d.cb.length&&o.col!==false&&(o.col||T.d.k!=='veg'||n==='haie'||n==='jsapin'))dxCol(q);return q}
// ---------- collisions ----------
function dxRayAdd(ob){const b=ob.bx;for(let i=Math.floor(b.x0/32);i<=Math.floor(b.x1/32);i++)for(let j=Math.floor(b.z0/32);j<=Math.floor(b.z1/32);j++){const k=i*4099+j;let a=DX.ray.get(k);if(!a)DX.ray.set(k,a=[]);a.push(ob)}}
function dxBox(x,z,hx,hz,yaw,y0,y1,bm,q,sq,nr){const c=Math.cos(yaw),s=Math.sin(yaw);let ex=Math.abs(c)*hx+Math.abs(s)*hz,ez=Math.abs(s)*hx+Math.abs(c)*hz;if(sq){ex=ez=(hx+hz)/2*.96}
 const ob={x,z,hx,hz,c,s,y0,y1,bm,q,bx:{x0:x-ex,x1:x+ex,z0:z-ez,z1:z+ez,y0:y0-.6,y1,dx:1}};boxes.push(ob.bx);DX.obs.push(ob);if(!nr&&(q?q.T.c.ray:1))dxRayAdd(ob);return ob}
function dxCol(q){const T=q.T,cs=Math.cos(q.r),sn=Math.sin(q.r),sq=T.d.k==='rock'&&T.n!=='falaise',obs=[];for(const b of T.d.cb){const lx=b[0]*q.sx,lz=b[1]*q.sx,h=b[4]*q.sy;if(T.d.k==='rock'&&h<.45)continue;
  obs.push(dxBox(q.x+lx*cs+lz*sn,q.z-lx*sn+lz*cs,b[2]*q.sx,b[3]*q.sx,q.r,q.y,q.y+h,T.c.bm||'conc',q,sq))}q.ob=obs}
// intersection rayon / boîte orientée (repère local : x' = x c - z s ; z' = x s + z c)
function dxHit(b,o,d,near,far,out,obj){const ox=o.x-b.x,oz=o.z-b.z,lx=ox*b.c-oz*b.s,lz=ox*b.s+oz*b.c,ddx=d.x*b.c-d.z*b.s,ddz=d.x*b.s+d.z*b.c;let t0=near,t1=far,ax=-1,sg=0;
 const slab=(p,dd,lo,hi,k)=>{if(Math.abs(dd)<1e-9)return p>lo&&p<hi;let a=(lo-p)/dd,c=(hi-p)/dd,n=-1;if(a>c){const t=a;a=c;c=t;n=1}if(a>t0){t0=a;ax=k;sg=n}if(c<t1)t1=c;return t0<=t1};
 if(!slab(lx,ddx,-b.hx,b.hx,0)||!slab(lz,ddz,-b.hz,b.hz,2)||!slab(o.y,d.y,b.y0,b.y1,1))return;
 if(ax<0||t0<near||t0>far)return;let nx=0,ny=0,nz=0;if(ax===0){nx=sg*b.c;nz=-sg*b.s}else if(ax===2){nx=sg*b.s;nz=sg*b.c}else ny=sg;
 out.push({distance:t0,point:new THREE.Vector3(o.x+d.x*t0,o.y+d.y*t0,o.z+d.z*t0),object:obj,face:{a:0,b:0,c:0,normal:new THREE.Vector3(nx,ny,nz),materialIndex:0},faceIndex:0,dx:b})}
function dxMkRay(bm){const ob=new THREE.Object3D();ob.userData.bmat=bm;ob.userData.dxray=1;ob.name='dx_'+bm;const key='st'+bm;
 ob.raycast=function(rc,out){const o=rc.ray.origin,d=rc.ray.direction,near=rc.near||0,far=Math.min(rc.far,450);if(!(far>0))return;const stamp=++DX.rayN;
  let i=Math.floor(o.x/32),j=Math.floor(o.z/32);const ex=o.x+d.x*far,ez=o.z+d.z*far,ie=Math.floor(ex/32),je=Math.floor(ez/32),sx=d.x>0?1:-1,sz=d.z>0?1:-1;
  let tx=Math.abs(d.x)<1e-9?1e18:((d.x>0?(i+1)*32:i*32)-o.x)/d.x,tz=Math.abs(d.z)<1e-9?1e18:((d.z>0?(j+1)*32:j*32)-o.z)/d.z;const dtx=Math.abs(d.x)<1e-9?1e18:32/Math.abs(d.x),dtz=Math.abs(d.z)<1e-9?1e18:32/Math.abs(d.z);
  for(let n=0;n<90;n++){const a=DX.ray.get(i*4099+j);if(a)for(let k=0;k<a.length;k++){const b=a[k];if(b.bm!==bm||b[key]===stamp)continue;b[key]=stamp;dxHit(b,o,d,near,far,out,ob)}
   if(i===ie&&j===je)break;if(tx<tz){i+=sx;tx+=dtx}else{j+=sz;tz+=dtz}}};return ob}
// ---------- mise à jour des instances ----------
function dxPut(M,C,i,q,sx,sy){const c=Math.cos(q.r),s=Math.sin(q.r),o=i*16,e=i*3;M[o]=c*sx;M[o+1]=0;M[o+2]=-s*sx;M[o+3]=0;M[o+4]=0;M[o+5]=sy;M[o+6]=0;M[o+7]=0;M[o+8]=s*sx;M[o+9]=0;M[o+10]=c*sx;M[o+11]=0;M[o+12]=q.x;M[o+13]=q.y;M[o+14]=q.z;M[o+15]=1;C[e]=q.cr;C[e+1]=q.cg;C[e+2]=q.cb}
function dxUpdate(px,pz){if(!DX.on)return;const t0=performance.now(),zk=Math.max(1,Math.min(2.5,75/C.fov)),zk2=zk*zk,fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw),asp=innerWidth/Math.max(1,innerHeight),
  half=Math.atan(Math.tan(C.fov*Math.PI/360)*asp)+.3,cosT=half>=Math.PI?-2:Math.cos(half);const Ts=Object.values(DX.T);for(const T of Ts){T.cnt[0]=T.cnt[1]=0}
 const st=DX.stat;st.l0=st.l1=0;
 for(const g in DXG){const R=DXG[g].R*zk;cellEach(DX.cell[g],px,pz,R,q=>{const T=q.T,dx=q.x-px,dz=q.z-pz,d2=dx*dx+dz*dz;if(d2>T.r1s*zk2)return;
   if(cosT>-1){const d=Math.sqrt(d2);if(d>q.rad+6&&dx*fx+dz*fz<cosT*d-q.rad)return}
   let lv=d2<T.r0s*zk2?0:1;if(lv===1&&!T.two)lv=0;const n=T.cnt[lv],a=T.A;if(n>=T.cap[lv]||!a[lv*2])return;T.cnt[lv]=n+1;dxPut(a[lv*2],a[lv*2+1],n,q,q.sx,q.sy)})}
 for(const T of Ts){for(let lv=0;lv<2;lv++){const ms=T.m[lv];if(!ms)continue;const n=T.cnt[lv];ms.forEach(m=>{m.count=n;m.visible=n>0});if(n){const m0=ms[0];m0.instanceMatrix.updateRange.offset=0;m0.instanceMatrix.updateRange.count=n*16;m0.instanceColor.updateRange.offset=0;m0.instanceColor.updateRange.count=n*3;m0.instanceMatrix.needsUpdate=true;m0.instanceColor.needsUpdate=true}st[lv?'l1':'l0']+=n}}
 DX.ms=performance.now()-t0}
function dxFrame(dt){if(!DX.on)return;const L=DX.last,px=P.x,pz=P.z;L.t+=dt;if(Math.hypot(px-L.x,pz-L.z)>2.5||Math.abs(P.yaw-L.yaw)>.17||Math.abs(C.fov-L.fov)>5||DX.dirty||L.t>2){L.x=px;L.z=pz;L.yaw=P.yaw;L.fov=C.fov;L.t=0;DX.dirty=0;dxUpdate(px,pz)}
 if(!DX.camps&&typeof P3D!=='undefined'&&P3D.done)try{dxCamps()}catch(e){DX.camps=-1;console.warn('dxCamps',e)}}
// ---------- placement : végétation ----------
const DXS={rb_petit:[1,1.5],rb_moyen1:[.9,1.3],rb_moyen2:[.95,1.35],rb_haut1:[.7,1],rb_haut3:[.8,1.15],fleuri:[.7,1.1],haie:[1,1],fougere_a:[.8,1.3],fougere_b:[.8,1.3],fougere_c:[.85,1.3],herbes:[.8,1.3],jsapin:[.6,1.25],roseau_a:[.85,1.2],roseau_b:[.8,1.15]};
const dxSc=(n,u)=>{const a=DXS[n];return a[0]+(a[1]-a[0])*u},RB=['rb_petit','rb_moyen1','rb_moyen2','rb_haut1','rb_haut3'];
const dxBank=(x,z)=>wDist(x,z);
function dxVeg(){const cl=(x,z,f)=>NZT(x*f+7,z*f-3);let n0=0;
 // 1. plaine et lisières : touffes/buissons denses (Real Bush), buissons fleuris, plus denses près du centre de la carte (zone de jeu) et en lisière de forêt
 dxEach(8,10,(x,z,i,j)=>{if(dxInFor(x,z)||dxInCity(x,z))return;const c=cl(x,z,.02),edge=(x>FOR.x0-24&&x<FOR.x1+24&&z>FOR.z0-24&&z<FOR.z1+24)?1.8:1,
   p=.1*(.22+1.6*c*c)*(1+2.4*Math.exp(-(x*x+z*z)/(260*260)))*edge*(dxInFarm(x,z)?.12:1);if(dxH(i,j,11)>p)return;
   const h=dxH(i,j,12);if(!dxOk(x,z,1.1)||wDist(x,z)<1.4||wDep(x,z)>.02||nearPath(x,z,2.4)||dxSl(x,z)>.55)return;const n=h<.3?'fleuri':RB[Math.floor(dxH(i,j,13)*5)%5];
   dxAdd(n,x,z,{r:dxH(i,j,14)*6.283,s:dxSc(n,dxH(i,j,15))});n0++});
 // 2. forêt : fougères (3 modèles) en sous-bois, jeunes sapins dans les clairières et en lisière, quelques buissons
 dxEach(5.6,20,(x,z,i,j)=>{if(!dxInFor(x,z))return;const c=cl(x,z,.035),p=.62*(.45+c);if(dxH(i,j,21)>p)return;if(!dxOk(x,z,.45)||wDist(x,z)<1.2||wDep(x,z)>.02||nearPath(x,z,1.8))return;
   const k=Math.floor(dxH(i,j,22)*3),n=['fougere_a','fougere_b','fougere_c'][k],r=dxH(i,j,23)*6.283;dxAdd(n,x,z,{r,s:dxSc(n,dxH(i,j,24))});
   if(dxH(i,j,25)<.3){const x2=x+Math.cos(r)*.8,z2=z+Math.sin(r)*.8;if(dxOk(x2,z2,.4)){const n2=['fougere_a','fougere_b','fougere_c'][(k+1)%3];dxAdd(n2,x2,z2,{r:r+1.5,s:dxSc(n2,dxH(i,j,26))})}}});
 dxEach(12,30,(x,z,i,j)=>{const inF=dxInFor(x,z),ed=(x>FOR.x0-30&&x<FOR.x1+30&&z>FOR.z0-30&&z<FOR.z1+30)&&!inF,sl=dxSl(x,z);let p=inF?.5:ed?.42:sl>.2?.18:0;if(dxH(i,j,31)>p||dxInCity(x,z))return;
   if(!dxOk(x,z,1.3)||wDist(x,z)<2||wDep(x,z)>.02||nearPath(x,z,2.6))return;dxAdd('jsapin',x,z,{r:dxH(i,j,32)*6.283,s:dxSc('jsapin',dxH(i,j,33)),tint:[.85+.3*dxH(i,j,34),.9+.2*dxH(i,j,34),.85]})});
 dxEach(14,40,(x,z,i,j)=>{if(!dxInFor(x,z)||dxH(i,j,41)>.35)return;if(!dxOk(x,z,1.1)||wDist(x,z)<1.4||wDep(x,z)>.02||nearPath(x,z,2.2))return;const n=RB[Math.floor(dxH(i,j,42)*5)%5];dxAdd(n,x,z,{r:dxH(i,j,43)*6.283,s:dxSc(n,dxH(i,j,44))})});
 // 3. haies : rangées droites (alignées sur les axes : collision exacte), 3 à 8 éléments, en plaine et lisière
 dxEach(105,50,(x,z,i,j)=>{if(dxH(i,j,51)>.62||dxInFor(x,z)||dxInCity(x,z))return;const alongX=dxH(i,j,52)<.5,len=3+Math.floor(dxH(i,j,53)*6),yaw=alongX?Math.PI/2:0,SP=1.72,seg=[];
   for(let k=0;k<len;k++){const sx=alongX?x+k*SP:x,sz=alongX?z:z+k*SP;if(!dxOk(sx,sz,1)||!dxOk(sx+(alongX?.8:0),sz+(alongX?0:.8),.6)||wDist(sx,sz)<1.6||wDep(sx,sz)>.02||nearPath(sx,sz,2.6)||dxSl(sx,sz)>.3||dxInFarm(sx,sz))break;seg.push([sx,sz])}
   if(seg.length<3)return;for(const s of seg)dxAdd('haie',s[0],s[1],{r:yaw,s:.95+.1*dxH(Math.round(s[0]),Math.round(s[1]),54),col:false});
   const a=seg[0],b=seg[seg.length-1],cx=(a[0]+b[0])/2,cz=(a[1]+b[1])/2,hx=alongX?(seg.length-1)*SP/2+.86:.6,hz=alongX?.6:(seg.length-1)*SP/2+.86,y=GH(cx,cz);
   const ob=dxBox(cx,cz,hx,hz,0,y,y+1.1,'wood',null,0,1);ob.hedge=1;DX.hedges=(DX.hedges||0)+1;n0++});
 return n0}
// ---------- végétation d'eau : roseaux (berge, eau peu profonde), hautes herbes (berge sèche) ----------
function dxWater(){const pts=RPTS.slice();for(let i=0;i<BROOK.length-1;i++){const p=BROOK[i],q=BROOK[i+1],n=Math.ceil(Math.hypot(q[0]-p[0],q[1]-p[1])/4);for(let k=0;k<n;k++)pts.push([p[0]+(q[0]-p[0])*k/n,p[1]+(q[1]-p[1])*k/n])}
 for(let k=0;k<20;k++){const a=k/20*6.283;pts.push([POND.x+Math.cos(a)*POND.rx*.85,POND.z+Math.sin(a)*POND.rz*.85])}let nr=0,ng=0;
 pts.forEach((p,pi)=>{for(let k=0;k<16;k++){const a=dxH(pi,k,60)*6.283,rr=.8+dxH(pi,k,61)*11,x=p[0]+Math.cos(a)*rr,z=p[1]+Math.sin(a)*rr;if(Math.abs(x)>MH-8||Math.abs(z)>MH-8)continue;const w=wDist(x,z),gn=NZT(x*.08+3,z*.08+9);
   if(w>-.45&&w<1.3&&wDep(x,z)<.4&&gn>.32){if(!arbOkSpot(x,z,.3)||nearPath(x,z,1.5))continue;const n=dxH(pi,k,62)<.5?'roseau_a':'roseau_b',r=dxH(pi,k,63)*6.283;dxAdd(n,x,z,{r,s:dxSc(n,dxH(pi,k,64))});nr++;
    if(dxH(pi,k,65)<.55){const x2=x+Math.cos(r)*.45,z2=z+Math.sin(r)*.45;if(wDist(x2,z2)>-.5&&wDep(x2,z2)<.4){const n2=n==='roseau_a'?'roseau_b':'roseau_a';dxAdd(n2,x2,z2,{r:r+2,s:dxSc(n2,dxH(pi,k,66))});nr++}}}
   else if(w>1.1&&w<6&&gn>.4&&dxH(pi,k,67)<.6){if(!arbOkSpot(x,z,.5)||nearPath(x,z,1.8)||wDep(x,z)>.02)continue;dxAdd('herbes',x,z,{r:dxH(pi,k,68)*6.283,s:dxSc('herbes',dxH(pi,k,69))});ng++}}});
 return [nr,ng]}
// ---------- rochers : éparpillés, champs, éboulis de berge, pentes ; falaises sur les pentes les plus fortes ----------
const DXR=['rocher1','rocher2','rocher3'],DXRB={rocher1:2.4,rocher2:2,rocher3:1.6};
function dxRock(x,z,u,h,seed,big){const n=DXR[h<.4?0:h<.75?1:2],sc=(big?.45:.2)+(big?.9:.7)*u*u+.1*dxH(Math.round(x),Math.round(z),seed),d=DXRB[n]*sc;if(d>3.1||d<.5)return 0;const r=dxH(Math.round(x*3),Math.round(z*3),seed+1)*6.283,rr=d*.4;
 if(!dxOk(x,z,rr+.2)||wDist(x,z)<-.5||wDep(x,z)>.3||nearPath(x,z,rr+1.5)||dxSl(x,z)>.7)return 0;
 const y=Math.min(GH(x,z),GH(x+rr,z),GH(x-rr,z),GH(x,z+rr),GH(x,z-rr))+.04,gy=.85+.3*dxH(Math.round(x*5),Math.round(z*5),seed+2),tint=n==='rocher3'?[.8,.8,.85]:n==='rocher1'?[.95,.95,.95]:[1.05,1.05,1.08];
 dxAdd(n,x,z,{r,s:sc,sy:sc*gy,y,tint:tint.map(v=>v*(.85+.25*dxH(Math.round(x*9),Math.round(z),seed+3)))});return 1}
function dxRocks(){let nr=0;
 dxEach(36,70,(x,z,i,j)=>{if(dxInCity(x,z))return;const sl=dxSl(x,z),inF=dxInFor(x,z),p=.72*(.42+Math.min(.45,sl*2.2))*(.5+NZT(x*.012,z*.012+4))*(inF?.5:1)*(dxInFarm(x,z)?.6:1);if(dxH(i,j,71)>p)return;
   const n=1+Math.floor(dxH(i,j,72)*4);for(let k=0;k<n;k++){const a=dxH(i,j,73+k)*6.283,rr=k?1.2+dxH(i,j,80+k)*6:0;nr+=dxRock(x+Math.cos(a)*rr,z+Math.sin(a)*rr,dxH(i,j,90+k),dxH(i,j,100+k),110+k,0)}});
 // champs de rochers (grappes denses d'une dizaine de blocs)
 dxEach(230,120,(x,z,i,j)=>{if(dxH(i,j,121)>.55||dxInCity(x,z)||wDist(x,z)<10)return;const n=9+Math.floor(dxH(i,j,122)*12);for(let k=0;k<n;k++){const a=dxH(i,j,130+k)*6.283,rr=2+dxH(i,j,160+k)*16;nr+=dxRock(x+Math.cos(a)*rr,z+Math.sin(a)*rr,dxH(i,j,190+k),dxH(i,j,220+k),250+k,k%9===0)}});
 // éboulis le long de la rivière, du ruisseau et de l'étang
 const pts=RPTS.slice();pts.forEach((p,pi)=>{if(dxH(pi,0,300)>.45)return;const n=2+Math.floor(dxH(pi,1,301)*4),a0=dxH(pi,2,302)*6.283;for(let k=0;k<n;k++){const a=a0+k*2.1,rr=3.5+dxH(pi,k,303)*5,x=p[0]+Math.cos(a)*rr,z=p[1]+Math.sin(a)*rr,w=wDist(x,z);if(w<.3||w>3.8)continue;nr+=dxRock(x,z,dxH(pi,k,304)*.8,dxH(pi,k,305),310+k,0)}});
 return nr}
function dxCliffs(){const cand=[];dxEach(20,400,(x,z,i,j)=>{if(dxInCity(x,z)||dxInFarm(x,z)&&false)return;const sl=dxSl(x,z);if(sl>.17)cand.push([sl,x,z])});cand.sort((a,b)=>b[0]-a[0]);const done=[];
 for(const [sl,x,z] of cand){if(done.length>=46)break;if(done.some(d=>Math.hypot(d[0]-x,d[1]-z)<75))continue;if(!dxOk(x,z,9.5)||wDist(x,z)<10||nearPath(x,z,10)||dxInFor(x,z)&&dxH(Math.round(x),Math.round(z),401)<.5)continue;
  const gx=(GH(x+3,z)-GH(x-3,z))/6,gz=(GH(x,z+3)-GH(x,z-3))/6,gl=Math.hypot(gx,gz)||1;let yaw=Math.round(Math.atan2(-gx,-gz)/(Math.PI/2))*Math.PI/2+(dxH(Math.round(x),Math.round(z),402)-.5)*.16;if(dxH(Math.round(x),Math.round(z),406)<.5)yaw+=Math.PI;
  const s=.85+.4*dxH(Math.round(x),Math.round(z),403),c=Math.cos(yaw),sn=Math.sin(yaw);let mn=1e9;for(const [lx,lz] of [[0,0],[-6,0],[6,0],[-6,-3],[6,-3],[-6,3],[6,3],[0,-3.5],[0,3.5]]){const wx=x+(lx*c+lz*sn)*s,wz=z+(-lx*sn+lz*c)*s;mn=Math.min(mn,GH(wx,wz))}
  if(!dxOk(x,z,9.5))continue;const q=dxAdd('falaise',x,z,{r:yaw,s,y:mn-.55,tint:[.92+.12*dxH(Math.round(x),Math.round(z),404),.92,.92],col:true});if(!q)continue;done.push([x,z]);
  // éboulis au pied
  for(let k=0;k<5;k++){const a=dxH(Math.round(x),Math.round(z),410+k)*6.283,rr=7+dxH(Math.round(x),Math.round(z),420+k)*6;dxRock(x+Math.cos(a)*rr,z+Math.sin(a)*rr,dxH(Math.round(x),Math.round(z),430+k),dxH(Math.round(x),Math.round(z),440+k),450+k,0)}}
 return done.length}
// ---------- zone agricole : clôtures autour des champs, bottes de foin ----------
function dxFarm(){const DXFL=DX.T.cloture.d.bb[5]-DX.T.cloture.d.bb[2];const cells=window.FARMC||[];let ns=0,nb=0;
 cells.forEach((c,ci)=>{const [x0,z0,x1,z1]=c,h=dxH(ci,7,500);if(h>.62)return;const M=1.25,sides=[[x0-M,z0-M,x1+M,z0-M,0],[x0-M,z1+M,x1+M,z1+M,0],[x0-M,z0-M,x0-M,z1+M,1],[x1+M,z0-M,x1+M,z1+M,1]],gate=[Math.floor(dxH(ci,8,501)*4),Math.floor(dxH(ci,9,502)*4)];
  sides.forEach((sd,si)=>{const [ax,az,bx,bz,alongZ]=sd,L=Math.hypot(bx-ax,bz-az),n=Math.floor(L/DXFL),off=(L-n*DXFL)/2,gk=(si===gate[0]||si===gate[1]&&dxH(ci,10,503)<.5)?Math.floor(n*(.25+.5*dxH(ci,si,504))):-9;let run=null;const flush=()=>{if(run&&run.k>0){const hx=alongZ?.1:run.k*DXFL/2,hz=alongZ?run.k*DXFL/2:.1,cx=alongZ?ax:(run.a+run.b)/2,cz=alongZ?(run.a+run.b)/2:az,y=GH(cx,cz);dxBox(cx,cz,hx,hz,0,y,y+1.15,'wood',null);DX.fences.push({cx,cz,hx,hz})}run=null};
   for(let k=0;k<n;k++){const t=off+(k+.5)*DXFL,x=alongZ?ax:ax+t,z=alongZ?az+t:az,gp=k===gk||k===gk+1;
    if(gp||!okPos(x,z,.15)||Math.abs(x)>MH-9||Math.abs(z)>MH-9||nearPath(x,z,2.6)||wDist(x,z)<3||HS.some(r=>x>r[0]-2&&x<r[2]+2&&z>r[1]-2&&z<r[3]+2)){flush();continue}
    const e0=GH(alongZ?x:x-1.3,alongZ?z-1.3:z),e1=GH(alongZ?x:x+1.3,alongZ?z+1.3:z),y=Math.min(e0,e1,GH(x,z))-.04;
    dxAdd('cloture',x,z,{r:alongZ?0:Math.PI/2,s:1,y,col:false,tn:dxH(ci,k+si*40,505)});ns++;const t0=off+k*DXFL,t1=t0+DXFL,a=(alongZ?az:ax)+t0,b=(alongZ?az:ax)+t1;if(run)run.b=b,run.k++;else run={a,b,k:1}}flush()});
  // bottes de foin le long des champs (1 à 4 par champ, hors cultures)
  if(dxH(ci,11,510)<.8){const nb_=2+Math.floor(dxH(ci,12,511)*5);for(let k=0;k<nb_;k++){const west=dxH(ci,13+k,512)<.5,x=west?x0-3.8:x1+3.8,z=z0+4+dxH(ci,20+k,513)*(z1-z0-8);if(!okPos(x,z,.9)||nearPath(x,z,2.5)||wDist(x,z)<4||HS.some(r=>x>r[0]-3&&x<r[2]+3&&z>r[1]-3&&z<r[3]+3))continue;
    dxAdd('foin',x,z,{r:dxH(ci,30+k,514)*6.283,s:.95+.2*dxH(ci,40+k,515),tint:[.92,.9,.82]});nb++}}});
 return [ns,nb]}
// ---------- maisons : tas de bois, mobilier de jardin ; postes bunker : seaux, projecteur ----------
function dxHouses(){let nw=0,nf=0;const dr=doors,hs=HS;
 hs.forEach((r,hi)=>{const w=r[2]-r[0],d=r[3]-r[1];if(w<4||d<4||w>30||d>30)return;const bun=w>12&&d<9,cx=(r[0]+r[2])/2,cz=(r[1]+r[3])/2;
  const spot=(side,t,out)=>{const hx=w/2,hz=d/2;return side===0?[cx+t*(hx-1.8),r[1]-out,0]:side===1?[cx+t*(hx-1.8),r[3]+out,0]:side===2?[r[0]-out,cz+t*(hz-1.8),1]:[r[2]+out,cz+t*(hz-1.8),1]};
  const near=(x,z,m)=>dr.some(q=>q.x!==undefined&&Math.hypot(q.x-x,q.z-z)<m);const tryPut=(n,side,t,out,s,yawOff,rd)=>{const p=spot(side,t,out),x=p[0],z=p[1];if(!dxOk(x,z,rd)||nearPath(x,z,rd+1.2)||near(x,z,4.2)||wDist(x,z)<2||dxSl(x,z)>.25)return null;
   // parallèle au mur : l'axe long du modèle (z local) suit le mur
   const yaw=(p[2]?0:Math.PI/2)+yawOff;return dxAdd(n,x,z,{r:yaw,s,y:GH(x,z)-.02,tint:[.9,.88,.85]})};
  if(bun){const sd=Math.floor(dxH(hi,1,600)*4);for(const k of [0,1])tryPut('seau',sd,-.9+k*1.8,1.2+.5*k,1,dxH(hi,k,601)*6.283,.4);
   const q=tryPut('projecteur',Math.floor(dxH(hi,2,602)*4),dxH(hi,3,603)<.5?-1:1,1.4,1,dxH(hi,4,604)*6.283,.5);if(q)nf++;return}
  if(dxH(hi,5,610)<.55){const sd=Math.floor(dxH(hi,6,611)*4),q=tryPut('bois',sd,dxH(hi,7,612)<.5?-1:1,1.1,1,0,.9);if(q)nw++}
  if(dxH(hi,8,620)<.4){const sd=Math.floor(dxH(hi,9,621)*4),k=dxH(hi,10,622),q=k<.45?tryPut('tablejardin',sd,0,3.6,1,dxH(hi,11,623)*6.283,1.3):k<.8?tryPut('banc',sd,dxH(hi,12,624)<.5?-1:1,1,1,Math.PI/2+(dxH(hi,18,626)<.5?0:Math.PI),.7):tryPut('piquenique',sd,0,4.2,1,0,1.6);if(q)nf++}
  if(dxH(hi,14,630)<.18){const sd=Math.floor(dxH(hi,15,631)*4),q=tryPut('foyer',sd,dxH(hi,16,632)<.5?-.8:.8,6,1,dxH(hi,17,633)*6.283,1.1);if(q)nf++}});
 return [nw,nf]}
// ---------- ville : plaques d'égout sur la chaussée, boîtiers électriques sur les trottoirs ----------
function dxCity(){const SX=[[224,14],[330,12],[420,12],[508,14],[615,14]],SZ=[[-420,12],[-525,14],[-630,12],[-706,12]],BX=[[150,217],[231,324],[336,414],[426,500],[516,606],[624,738]],BZ=[[-738,-712],[-700,-636],[-624,-532],[-518,-426],[-414,-350]];let ne=0,nb=0;
 const lamps=[];SX.forEach(([x,w])=>{for(let z=-730;z<=-358;z+=34){if(SZ.some(([g,ww])=>Math.abs(z-g)<ww/2+3))continue;lamps.push([x-w/2-1.4,z],[x+w/2+1.4,z+17])}});SZ.forEach(([z,w])=>{for(let x=158;x<=730;x+=34){if(SX.some(([g,ww])=>Math.abs(x-g)<ww/2+3))continue;lamps.push([x,z-w/2-1.4],[x+17,z+w/2+1.4])}});
 SX.forEach(([x,w],si)=>{for(let k=0;k<11;k++){const z=-722+k*33.5+dxH(si,k,700)*12,lane=dxH(si,k,701)<.5?-1:1;if(SZ.some(([g,ww])=>Math.abs(z-g)<ww/2+2))continue;dxAdd('egout',x+lane*(w/4),z,{r:dxH(si,k,702)*6.283,y:.05,sy:.4,col:false,tint:[.9,.9,.9]});ne++}});
 SZ.forEach(([z,w],si)=>{for(let k=0;k<17;k++){const x=164+k*34+dxH(si,k,710)*14,lane=dxH(si,k,711)<.5?-1:1;if(SX.some(([g,ww])=>Math.abs(x-g)<ww/2+2))continue;dxAdd('egout',x,z+lane*(w/4),{r:dxH(si,k,712)*6.283,y:.05,sy:.4,col:false,tint:[.9,.9,.9]});ne++}});
 BZ.forEach(([z0,z1],bj)=>BX.forEach(([x0,x1],bi)=>{for(let c=0;c<4;c++){if(dxH(bi*10+bj,c,720)>.3)continue;const west=c%2===0,north=c<2,x=west?x0+.6:x1-.6,z=north?z0+.6:z1-.6;if(lamps.some(l=>Math.hypot(l[0]-x,l[1]-z)<1.8)||Math.hypot(x-(x0+1.3),z-(z0+7))<2||Math.hypot(x-(x1-1.3),z-(z1-7))<2)continue;
   dxAdd('boitier',x,z,{r:(west?Math.PI/2:-Math.PI/2)*(north?1:-1)+(dxH(bi,bj,721)<.5?0:Math.PI),y:.08,col:true,tint:[.9,.92,.95]});nb++}}));
 return [ne,nb]}
// ---------- chantiers : seaux et projecteurs près du matériel des camps (après leur construction, props3d.js) ----------
function dxCamps(){DX.camps=1;let n=0;const L=window.P3D?P3D.list:[];L.forEach((it,i)=>{if(!/generator|supply|messtable|container|cmdtent|pallets|fueltank|cot|flag/.test(it.name))return;const h=dxH(Math.round(it.x),Math.round(it.z),800);if(h>.55)return;
  for(let t=0;t<6;t++){const a=h*20+t*1.05,rr=it.r+.7,x=it.x+Math.cos(a)*rr,z=it.z+Math.sin(a)*rr;if(!okPos(x,z,.35)||!nFree(x,z)||wDist(x,z)<2||Math.hypot(x-P.x,z-P.z)<4)continue;
   const pole=h<.14&&/generator|cmdtent|container/.test(it.name);const q=dxAdd(pole?'projecteur':'seau',x,z,{r:h*50,s:1,col:false,tint:[.9,.9,.9]});if(q){n++;if(pole){const b=dxBox(x,z,.2,.2,0,q.y,q.y+3.1,'wood',null);if(window.p3dNav)p3dNav(b.bx)}DX.dirty=1;break}}});DX.nCamps=n}
// ---------- initialisation ----------
DX.build=dxBuild;DX.place=function(){const r={},tm={};const run=(k,f)=>{const t=performance.now();r[k]=f();tm[k]=Math.round(performance.now()-t);if(window.DXLOG)console.warn('DX',k,tm[k],'ms',JSON.stringify(r[k]))};run('veg',dxVeg);run('water',dxWater);run('rocks',dxRocks);run('cliffs',dxCliffs);run('farm',dxFarm);run('houses',dxHouses);run('city',dxCity);DX.res=r;DX.tm=tm};
DX.init=function(){const cnt={};DX.list.forEach(q=>cnt[q.n]=(cnt[q.n]||0)+1);DX.cnt=cnt;for(const n in DX.T){const T=DX.T[n],cp=DXG[T.g].cap,m=cnt[n]||0;dxAlloc(T,0,Math.max(8,Math.min(m+8,cp[0])));if(T.two)dxAlloc(T,1,Math.max(8,Math.min(m+8,cp[1])))}
 DX.rayO={conc:dxMkRay('conc'),wood:dxMkRay('wood'),steel:dxMkRay('steel')};for(const k in DX.rayO){const o=DX.rayO[k];solids.push(o)}DX.on=1;DX.dirty=1;okgDirty&&okgDirty()};
DX.inFor=dxInFor;DX.inFarm=dxInFarm;DX.update=dxUpdate;DX.frame=dxFrame;DX.hit=dxHit;DX.slope=dxSl;DX.fns=[dxVeg,dxWater,dxRocks,dxCliffs,dxFarm,dxHouses,dxCity,dxCamps,dxAdd,dxCol,dxBox];
