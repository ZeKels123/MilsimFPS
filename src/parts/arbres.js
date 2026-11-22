// ================= ARBRES ET BUISSONS (v63) : modèles Sketchfab CC-BY (docs/CREDITS_ASSETS.md) =================
// Remplace les arbres/buissons procéduraux (cartes alpha) : 9 arbres + souche + 2 buissons, données dans arbres_data.js (tools/arbres_export.py).
// Instanciation (InstancedMesh) par espèce et par niveau de détail : LOD0 = modèle d'origine (< R0), LOD1 = décimé (< R1), LOD2 = impostor 8 vues (< R2).
// Feuillage en alpha-test (pas de transparence triée), ombres seulement pour LOD0 et LOD1, listes d'instances reconstruites quand le joueur se déplace ou tourne
// (culling par distance, par cellule de 32 m et par cône de vue). Collisions : une boîte par tronc (déplacement, navigation, couvert) + objet de lancer de rayon analytique
// (cylindres de tronc) inséré dans solids/ray : les balles, grenades, lignes de vue et sons sont arrêtés par les troncs sans un seul maillage par arbre.
// Hors du bloc de nature.js : TR (arbres) et BU (buissons) sont déclarés avant farm.js, qui y ajoute les haies.
const ARB=window.ARB={sp:[],on:0,R0:21,R1:70,R2:190,RB0:26,RB1:105,tr:null,dirty:1,last:{x:1e9,z:1e9,yaw:9,fov:0,t:0},stat:{l0:0,l1:0,l2:0,b0:0,b1:0},ms:0,ready:0,cv:0,cvT:0,D:ARB_D};
const SPN=ARB.names=['chene','chene2','hetre','epicea','pin','sapin','mort','mort2','souche','buisson','buisson2'];
ARB.FEU=[0,1,2];ARB.CON=[3,4,5];ARB.DEAD=[6,7];ARB.STU=8;ARB.BUS=[9,10];
// générateur pseudo-aléatoire graine fixe : la forêt est la même à chaque partie (tests et captures reproductibles)
const arbRR=(()=>{let s=630631;return()=>((s=(Math.imul(s^(s>>>15),1664525)+1013904223)>>>0)/4294967296)})(),arbRg=(a,b)=>a+arbRR()*(b-a);
// ---------- décodage ----------
const arbB=s=>{const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u.buffer};
function arbGeo(p,q){const buf=arbB(p.b),n=p.v;let o=0;const P_=new Int16Array(buf,o,n*3);o+=n*6;const N_=new Int8Array(buf,o,n*3);o+=n*3;if(o%2)o++;const U_=new Int16Array(buf,o,n*2);o+=n*4;const I_=new Uint16Array(buf,o,p.i);
 const pos=new Float32Array(n*3),nr=new Float32Array(n*3),uv=new Float32Array(n*2);
 for(let i=0;i<n;i++){for(let k=0;k<3;k++){pos[i*3+k]=q[k]+P_[i*3+k]/32767*q[3+k];nr[i*3+k]=N_[i*3+k]/127}uv[i*2]=U_[i*2]/p.us;uv[i*2+1]=U_[i*2+1]/p.us}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nr,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setIndex(new THREE.BufferAttribute(I_.slice(),1));return g}
const arbTX=[];function arbTex(i,rep){if(arbTX[i])return arbTX[i];const im=new Image(),t=new THREE.Texture(im);t.encoding=THREE.sRGBEncoding;t.anisotropy=Math.min(AN,4);t.wrapS=t.wrapT=rep?THREE.RepeatWrapping:THREE.ClampToEdgeWrapping;t.generateMipmaps=true;t.minFilter=THREE.LinearMipmapLinearFilter;
 im.onload=()=>{t.needsUpdate=true;try{R.initTexture(t)}catch(e){}};im.src=ARB_D.T[i];return arbTX[i]=t}
// ---------- matériaux ----------
// balancement : l'amplitude croît avec le carré de la hauteur dans le modèle ; le feuillage frémit en plus (TLEAF). Mêmes uniformes de vent que windify.
function arbWind(m,k,leaf){m.defines=Object.assign({},m.defines,{TWK:k.toFixed(4)});if(leaf)m.defines.TLEAF='';
 m.onBeforeCompile=sh=>{sh.uniforms.uWt=WND.t;sh.uniforms.uWs=WND.s;sh.uniforms.uWd=WND.d;
  sh.vertexShader='uniform float uWt,uWs;uniform vec2 uWd;\n'+sh.vertexShader.replace('#include <project_vertex>',`vec4 mvPosition=vec4(transformed,1.);
#ifdef USE_INSTANCING
mvPosition=instanceMatrix*mvPosition;vec3 wo=instanceMatrix[3].xyz;
#else
vec3 wo=vec3(0.);
#endif
float hy=max(position.y,0.),wf=TWK*hy*hy;
float ph=dot(wo.xz,vec2(.31,.27)),gu=.55+.45*sin(uWt*.5-dot(wo.xz,uWd)*.09),g=(sin(uWt*1.6+ph)*.6+sin(uWt*2.9+ph*1.7)*.3+.5)*gu+.4;
mvPosition.xz+=uWd*(g*uWs*wf*2.2);
#ifdef TLEAF
float lp=dot(position,vec3(7.1,5.3,6.7));mvPosition.xyz+=vec3(sin(uWt*4.1+lp),sin(uWt*3.3+lp*1.3)*.5,cos(uWt*3.7+lp*.9))*(.012+.04*uWs)*min(1.,hy*.25+.2);
#endif
mvPosition=modelViewMatrix*mvPosition;gl_Position=projectionMatrix*mvPosition;`)};return m}
// impostor : quad orienté vers la caméra autour de l'axe vertical ; la vue (8 sur l'atlas 4x2) dépend de l'azimut caméra relatif à l'arbre
function arbBBMat(map,W,H,bright){const m=std(0xffffff,{map,alphaTest:.5,roughness:1,envMapIntensity:.3,side:THREE.DoubleSide});m.color.setScalar(bright);
 m.onBeforeCompile=sh=>{sh.uniforms.uSz={value:new THREE.Vector2(W,H)};
  sh.vertexShader='uniform vec2 uSz;\n'+sh.vertexShader.replace('#include <uv_vertex>',`#ifdef USE_UV
vec3 wo0=(instanceMatrix*vec4(0.,0.,0.,1.)).xyz;vec3 tc0=cameraPosition-wo0;
float az0=atan(tc0.x,tc0.z)-atan(instanceMatrix[2].x,instanceMatrix[2].z);float fr0=mod(floor(mod(az0,6.2831853)/6.2831853*8.+.5),8.);
vUv=vec2((mod(fr0,4.)+uv.x)/4.,1.-(floor(fr0/4.)+1.-uv.y)/2.);
#endif`).replace('#include <project_vertex>',`vec3 wo=(instanceMatrix*vec4(0.,0.,0.,1.)).xyz;vec3 tc=cameraPosition-wo;vec2 dd=normalize(tc.xz+vec2(1e-4));
vec3 rt=vec3(dd.y,0.,-dd.x);vec3 wp=wo+rt*(position.x*uSz.x*length(instanceMatrix[0].xyz))+vec3(0.,position.y*uSz.y*length(instanceMatrix[1].xyz),0.);
vec4 mvPosition=viewMatrix*vec4(wp,1.);gl_Position=projectionMatrix*mvPosition;`)};return m}
function arbDepth(map,k,leaf){const m=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:map||null,alphaTest:map?.45:0,side:THREE.DoubleSide});return arbWind(m,k,leaf)}
// ---------- construction des espèces ----------
// tint : variation de teinte par instance ; bright : multiplicateur de luminosité (textures sombres ; lumière du jeu)
const ARB_BR={chene:1.5,chene2:1.5,hetre:1.5,epicea:1.7,pin:1.6,sapin:1.7,mort:1.6,mort2:1.8,souche:1.5,buisson:1.5,buisson2:1.5};
function arbBuild(){const D=ARB_D;let ntri=0;
 D.S.forEach((sd,si)=>{const sp={i:si,n:sd.n,sd,L:[[],[]],B:null,m:[null,null,null],c:[0,0,0],cap:[0,0,0],cnt:0};
  const br=ARB_BR[sd.n]||1.5,bush=si>=9,wk=bush?.08:(sd.k==='conifere'?.0009:sd.k==='feuillu'?.0014:.0004);
  const q=sd.q;let pos=0;
  [0,1].forEach(L=>{sd['l'+L].forEach(p=>{const g=arbGeo(p,q);ntri+=p.i/3;const wood=p.t>=0&&!bush&&sd.n!=='souche';const map=arbTex(p.t>=0?p.t:sd.at,p.t>=0);
   const leaf=!wood,mat=arbWind(std(0xffffff,{map,roughness:.95,envMapIntensity:.35,side:THREE.DoubleSide,alphaTest:.45}),wk,leaf),mesh=new THREE.InstancedMesh(g,mat,1);mat.color.setScalar(br);
   mesh.customDepthMaterial=arbDepth(leaf?map:null,wk,leaf);mesh.castShadow=true;mesh.receiveShadow=true;mesh.frustumCulled=false;mesh.visible=false;mesh.userData.arb=si;S.add(mesh);sp.L[L].push(mesh)})});
  if(sd.sp){const s=sd.sp,g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([-.5,0,0,.5,0,0,.5,1,0,-.5,1,0],3));g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,1,1,0,1],2));g.setAttribute('normal',new THREE.Float32BufferAttribute([0,1,0,0,1,0,0,1,0,0,1,0],3));g.setIndex([0,1,2,0,2,3]);
   const mesh=new THREE.InstancedMesh(g,arbBBMat(arbTex(s.t,0),s.W,s.H,br*.78),1);mesh.castShadow=false;mesh.receiveShadow=false;mesh.frustumCulled=false;mesh.visible=false;mesh.userData.arb=si;S.add(mesh);sp.B=mesh}
  ARB.sp.push(sp)});
 ARB.tri=ntri;ARB.ready=1}
// instances : un tableau de matrices + couleurs partagé par tous les maillages d'un niveau de détail d'une espèce
function arbAlloc(sp,lv,cap){const ms=lv===2?[sp.B]:sp.L[lv];if(!ms.length||!ms[0])return;const m0=ms[0],ma=new THREE.InstancedBufferAttribute(new Float32Array(cap*16),16),ca=new THREE.InstancedBufferAttribute(new Float32Array(cap*3),3);ma.setUsage(THREE.DynamicDrawUsage);ca.setUsage(THREE.DynamicDrawUsage);
 ms.forEach(m=>{m.instanceMatrix=ma;m.instanceColor=ca;m.count=0;m.visible=false});sp.m[lv]=ms;sp.cap[lv]=cap}
// ---------- placement ----------
const arbSlope=(x,z)=>(Math.abs(GH(x+5,z)-GH(x-5,z))+Math.abs(GH(x,z+5)-GH(x,z-5)))/10;
const ARBP={conSplit:[[3,.42],[5,.8],[4,1]],plainCon:[[4,.5],[3,.78],[5,1]],feu:[[0,.4],[1,.65],[2,1]]};
function arbPick(x,z,forest){const u=NZT(x*.011+40,z*.011+7),sl=arbSlope(x,z);let cw=(forest?.74:.16)+Math.min(.38,sl*1.6)+(u-.5)*.5;const r=arbRR();
 if(r<(forest?.022:.02))return arbRR()<.5?6:7;if(r<(forest?.04:.038))return 8;
 const q=arbRR(),T=arbRR()<cw?(forest?ARBP.conSplit:ARBP.plainCon):ARBP.feu;for(const e of T)if(q<=e[1])return e[0];return T[T.length-1][0]}
// un arbre : enregistrement partagé par le rendu, les collisions, la navigation et les tests
function arbMake(x,z,y,sp,s,o){if(sp===3)s*=.88;const sd=ARB_D.S[sp];const q={x,z,y:y-(sp===8?.04:.12)*s,s,sp,ty:sp,r:arbRR()*6.283,h:.3+arbRR()*.15,sh:.7+arbRR()*.45,tn:arbRR(),tn2:arbRR()};
 const hw=Math.max(.27,Math.min(1.0,sd.rt*s*(sd.k==='mort'?.85:1.05)));q.k=hw;q.hc=sp===8?.6*s:Math.min(8,Math.max(2.5,sd.h*s*(sd.k==='mort'?.7:.5)));if(o)Object.assign(q,o);return q}
function arbAdd(q,noBox){TR.push(q);if(noBox)q.nc=1;if(!noBox){const b={x0:q.x-q.k,x1:q.x+q.k,z0:q.z-q.k,z1:q.z+q.k};if(q.sp===8){b.y0=q.y-.2;b.y1=q.y+q.hc}q.box=b;boxes.push(b)}
 const k=Math.floor(q.x/32)*4099+Math.floor(q.z/32);let a=TRC.get(k);if(!a)TRC.set(k,a=[]);a.push(q);ARB.dirty=1;return q}
const TRC=new Map(),BUC=new Map();
const arbCell=(M,q)=>{const k=Math.floor(q.x/32)*4099+Math.floor(q.z/32);let a=M.get(k);if(!a)M.set(k,a=[]);a.push(q)};
function cellEach(M,px,pz,R,f){const i0=Math.floor((px-R)/32),i1=Math.floor((px+R)/32),j0=Math.floor((pz-R)/32),j1=Math.floor((pz+R)/32);for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const a=M.get(i*4099+j);if(a)for(const q of a)f(q)}}
window.cellEach=cellEach;
const arbOkSpot=(x,z,m)=>okPos(x,z,m)&&!BRG.some(b=>Math.abs(x-b.x)<b.hw+2.6+m*.3&&Math.abs(z-b.z)<b.hl+3)&&!(typeof CT!=='undefined'&&x>CT.x0-6&&x<CT.x1+6&&z>CT.z0-6&&z<CT.z1+6);
// forêt dense du sud-ouest (9500 arbres, clairières), puis semis général par bosquets (même densités qu'avant), puis buissons
const arbRoad=(x,z)=>typeof CT!=='undefined'&&Math.abs(x-CT.ax)<5&&!(z<CT.z1+6&&z>CT.z0-6);
function arbPlace(){let c=0,t=0;const FN=9500;
 while(c<FN&&t++<120000){const x=arbRg(FOR.x0,FOR.x1),z=arbRg(FOR.z0,FOR.z1),d=NZT(x*.05+11,z*.05+3);if(d<.17&&arbRR()<.85)continue;if(Math.max(Math.abs(x),Math.abs(z))>MH-9)continue;
  if(!okPos(x,z,2.2)||wDist(x,z)<2.5|||nearPath(x,z,3.4)||arbRoad(x,z))continue;const sp=arbPick(x,z,true);if(sp>=9)continue;c++;arbAdd(arbMake(x,z,GH(x,z),sp,arbRg(.95,1.15)*(sp===8?.9:1)))}
 let g=0;t=0;const GN_=7270;
 while(g<GN_&&t++<120000){const x=arbRg(-MH+3,MH-3),z=arbRg(-MH+3,MH-3),d=NZT(x*.032+3,z*.032-5),p=d>.55?.5:.012;if(arbRR()>p||nzSkip(x,z)||!arbOkSpot(x,z,2.2)||wDist(x,z)<2.5||wDep(x,z)>.02||nearPath(x,z,3.4)||arbRoad(x,z)||(Math.abs(x)<9&&z>16))continue;
  const sp=arbPick(x,z,false);g++;arbAdd(arbMake(x,z,GH(x,z),sp,arbRg(.85,1.15)))}
 // buissons : forêt (4200, plus gros) puis général (5200)
 let b=0;t=0;const bp=(x,z,s,f)=>{const sp=9+(arbRR()<.5?1:0),q={x,z,y:GH(x,z)-.03,s,sp,ty:sp,r:arbRR()*6.283,h:.22+arbRR()*.08,sh:.7+arbRR()*.5,tn:arbRR(),tn2:arbRR(),k:0,hc:0};BU.push(q);arbCell(BUC,q);return q};
 while(b<4200&&t++<90000){const x=arbRg(FOR.x0,FOR.x1),z=arbRg(FOR.z0,FOR.z1);if(!okPos(x,z,.9)||wDist(x,z)<.8||nearPath(x,z,2.2)||wDep(x,z)>.02)continue;bp(x,z,arbRg(1.0,1.6));b++}
 t=0;let b2=0;while(b2<5200&&t++<150000){const x=arbRg(-MH+2,MH-2),z=arbRg(-MH+2,MH-2);if(nzSkip(x,z)||!arbOkSpot(x,z,.9)||wDist(x,z)<.8||wDep(x,z)>.02||nearPath(x,z,2.2)||(Math.abs(x)<9&&z>16))continue;bp(x,z,arbRg(.8,1.5));b2++}
 // décor lointain hors de la carte (ancienne couronne de 150 arbres) : mêmes arbres, sans collision
 for(let i=0;i<150;i++){const a=arbRg(0,6.283),r=arbRg(MH+23,MH+95),x=Math.cos(a)*r,z=Math.sin(a)*r;arbAdd(arbMake(x,z,terrainH(x,z),3+((arbRR()*3)|0),arbRg(.9,1.2)),1)}}
// ---------- collisions : lancer de rayon analytique sur les troncs (cylindres) ----------
const TRP=new THREE.Object3D();TRP.userData.bmat='wood';TRP.userData.tree=1;TRP.name='troncs';
const _tn=new THREE.Vector3();
function arbHitCyl(q,o,d,near,far,out,obj){const r=q.k*.92,y0=q.y,y1=q.y+q.hc,dx=d.x,dz=d.z,a=dx*dx+dz*dz,rx=q.x-o.x,rz=q.z-o.z;let best=1e9,nx=0,ny=0,nz=0;
 if(a>1e-9){const b=rx*dx+rz*dz,c=rx*rx+rz*rz-r*r,disc=b*b-a*c;if(disc>=0){const sq=Math.sqrt(disc),t1=(b-sq)/a;if(t1>=near&&t1<=far){const y=o.y+d.y*t1;if(y>=y0&&y<=y1){best=t1;nx=o.x+dx*t1-q.x;nz=o.z+dz*t1-q.z;const l=Math.hypot(nx,nz)||1;nx/=l;nz/=l}}}}
 if(Math.abs(d.y)>1e-6){const tc=((d.y<0?y1:y0)-o.y)/d.y;if(tc>=near&&tc<=far&&tc<best){const px=o.x+dx*tc-q.x,pz=o.z+dz*tc-q.z;if(px*px+pz*pz<=r*r){best=tc;nx=0;nz=0;ny=d.y<0?1:-1}}}
 if(best<1e8){out.push({distance:best,point:new THREE.Vector3(o.x+dx*best,o.y+d.y*best,o.z+d.z*best),object:obj,face:{a:0,b:0,c:0,normal:new THREE.Vector3(nx,ny,nz),materialIndex:0},faceIndex:0,tree:q})}}
TRP.raycast=function(rc,out){const o=rc.ray.origin,d=rc.ray.direction,near=rc.near||0,far=Math.min(rc.far,450);if(!(far>0))return;
 // parcours de la grille de cellules de 32 m le long du rayon (Amanatides-Woo)
 let i=Math.floor(o.x/32),j=Math.floor(o.z/32);const ex=o.x+d.x*far,ez=o.z+d.z*far,ie=Math.floor(ex/32),je=Math.floor(ez/32),sx=d.x>0?1:-1,sz=d.z>0?1:-1;
 let tx=Math.abs(d.x)<1e-9?1e18:((d.x>0?(i+1)*32:i*32)-o.x)/d.x,tz=Math.abs(d.z)<1e-9?1e18:((d.z>0?(j+1)*32:j*32)-o.z)/d.z;const dtx=Math.abs(d.x)<1e-9?1e18:32/Math.abs(d.x),dtz=Math.abs(d.z)<1e-9?1e18:32/Math.abs(d.z);
 for(let n=0;n<90;n++){const a=TRC.get(i*4099+j);if(a)for(let k=0;k<a.length;k++){const q=a[k];if(q.nc)continue;arbHitCyl(q,o,d,near,far,out,TRP)}
  if(i===ie&&j===je)break;if(tx<tz){i+=sx;tx+=dtx}else{j+=sz;tz+=dtz}if(tx>far&&tz>far&&n>0){/* ne sort pas du segment */}}};
// ---------- mise à jour des instances ----------
function arbPut(M,C,i,q,sx,sy){const c=Math.cos(q.r),s=Math.sin(q.r),o=i*16,v=.78+.34*q.tn,e=i*3;M[o]=c*sx;M[o+1]=0;M[o+2]=-s*sx;M[o+3]=0;M[o+4]=0;M[o+5]=sy;M[o+6]=0;M[o+7]=0;M[o+8]=s*sx;M[o+9]=0;M[o+10]=c*sx;M[o+11]=0;M[o+12]=q.x;M[o+13]=q.y;M[o+14]=q.z;M[o+15]=1;
 const h=(q.tn2-.5)*.14;C[e]=v*(1+h);C[e+1]=v;C[e+2]=v*(1-h)}
function arbUpdate(px,pz){if(!ARB.ready)return;const t0=performance.now(),zk=Math.max(1,Math.min(3,75/C.fov)),R0=ARB.R0*zk,R1=ARB.R1*zk,R2=ARB.R2,r02=R0*R0,r12=R1*R1,fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw),asp=innerWidth/Math.max(1,innerHeight),
  half=Math.atan(Math.tan(C.fov*Math.PI/360)*asp)+.38,cosT=half>=Math.PI?-2:Math.cos(half),NEAR2=30*30;
 const sps=ARB.sp;for(const sp of sps){sp.c[0]=sp.c[1]=sp.c[2]=0}
 const A=sps.map(sp=>[sp.m[0]&&sp.m[0][0].instanceMatrix.array,sp.m[0]&&sp.m[0][0].instanceColor.array,sp.m[1]&&sp.m[1][0].instanceMatrix.array,sp.m[1]&&sp.m[1][0].instanceColor.array,sp.m[2]&&sp.m[2][0].instanceMatrix.array,sp.m[2]&&sp.m[2][0].instanceColor.array]);
 cellEach(TRC,px,pz,R2,q=>{const dx=q.x-px,dz=q.z-pz,d2=dx*dx+dz*dz;if(d2>R2*R2)return;if(d2>NEAR2&&cosT>-1){if(dx*fx+dz*fz<cosT*Math.sqrt(d2))return}
  const sp=sps[q.sp],a=A[q.sp],lv=d2<r02?0:d2<r12?1:2;if(lv===2&&!a[4])return;const n=sp.c[lv];if(n>=sp.cap[lv])return;sp.c[lv]=n+1;arbPut(a[lv*2],a[lv*2+1],n,q,q.s*(.94+.12*q.tn2),q.s)});
 const rb0=ARB.RB0*zk,rb1=ARB.RB1*zk,b02=rb0*rb0,b12=rb1*rb1;
 cellEach(BUC,px,pz,rb1,q=>{const dx=q.x-px,dz=q.z-pz,d2=dx*dx+dz*dz;if(d2>b12)return;if(d2>400&&cosT>-1){if(dx*fx+dz*fz<cosT*Math.sqrt(d2))return}
  const sp=sps[q.sp],a=A[q.sp],lv=d2<b02?0:1,n=sp.c[lv];if(n>=sp.cap[lv])return;sp.c[lv]=n+1;arbPut(a[lv*2],a[lv*2+1],n,q,q.s,q.s)});
 const st=ARB.stat;st.l0=st.l1=st.l2=st.b0=st.b1=0;
 for(const sp of sps){for(let lv=0;lv<3;lv++){const ms=sp.m[lv];if(!ms)continue;const n=sp.c[lv];ms.forEach(m=>{m.count=n;m.visible=n>0});if(n){ms[0].instanceMatrix.needsUpdate=true;ms[0].instanceColor.needsUpdate=true}
   const bush=sp.i>=9;if(bush)st[lv?'b1':'b0']+=n;else st['l'+lv]+=n}}
 ARB.ms=performance.now()-t0}
function arbFrame(dt){const L=ARB.last,px=P.x,pz=P.z;L.t+=dt;if(Math.hypot(px-L.x,pz-L.z)>2.5||Math.abs(P.yaw-L.yaw)>.17||Math.abs(C.fov-L.fov)>5||ARB.dirty||L.t>2){L.x=px;L.z=pz;L.yaw=P.yaw;L.fov=C.fov;L.t=0;ARB.dirty=0;arbUpdate(px,pz)}
 ARB.cvT-=dt;if(ARB.cvT<=0){ARB.cvT=.25;ARB.cv=arbCover(P.x,P.z)}}
// couvert végétal autour d'un point (buissons proches, troncs proches) : 0 à ~0,9 ; utilisé par la perception des bots
function arbCover(x,z){let n=0;cellEach(BUC,x,z,2,q=>{const d=Math.hypot(q.x-x,q.z-z);if(d<1.5*q.s)n+=.3});cellEach(TRC,x,z,2,q=>{if(!q.nc&&Math.hypot(q.x-x,q.z-z)<1.6)n+=.12});return Math.min(.9,n)}
// ---------- API ----------
// arbre ajouté après coup (parcs et cours de la ville construits à la demande)
ARB.cityTree=function(x,z,y,sp){const q=arbAdd(arbMake(x,z,y,sp===undefined?(arbRR()<.5?2:0):sp,arbRg(.85,1.1),{cty:1}));return q};
ARB.slope=arbSlope;ARB.cover=arbCover;ARB.hitCyl=arbHitCyl;ARB.place=arbPlace;ARB.build=arbBuild;ARB.update=arbUpdate;ARB.frame=arbFrame;ARB.TRP=TRP;ARB.TRC=TRC;ARB.BUC=BUC;
function arbHedge(x,z,y){const sp=9+(arbRR()<.5?1:0),q={x,z,y:y-.03,s:arbRg(1.25,1.6),sp,ty:sp,r:arbRR()*6.283,h:.25,sh:.9,tn:arbRR(),tn2:arbRR(),k:0,hc:0,hd:1};BU.push(q);arbCell(BUC,q)}
// allocation des instances une fois les arbres placés (capacité = nombre d'arbres de l'espèce, plafonnée) et branchement des collisions
ARB.init=function(){ARB.FOR=FOR;const cnt=ARB.sp.map(()=>0);TR.forEach(q=>cnt[q.sp]++);BU.forEach(q=>cnt[q.sp]++);
 ARB.sp.forEach(sp=>{const n=cnt[sp.i],bush=sp.i>=9;arbAlloc(sp,0,Math.max(16,Math.min(n+16,bush?700:130)));arbAlloc(sp,1,Math.max(16,Math.min(n+16,bush?3200:1000)));if(sp.B)arbAlloc(sp,2,Math.max(16,Math.min(n+16,2800)))});
 ARB.cnt=cnt;solids.push(TRP);ARB.on=1;ARB.dirty=1}
