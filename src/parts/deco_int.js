// ================= MOBILIER D'INTERIEUR (v64) : modèles Sketchfab / Poly Haven (docs/CREDITS_ASSETS.md) =================
// Données : deco_int_data.js (tools/deco_export.py + deco_pack.py) : une entrée par meuble, maillage quantifié par matériau + textures WebP, origine posée au sol (ou au mur / au plafond), face avant = +Z, échelle en mètres.
// Principe :
//  1. PLACEMENT (au chargement, déterministe : aucune valeur aléatoire, tout vient du hachage de la position du bâtiment) : un « local » (maison, bunker, appartement, commerce...) est décrit par un repère (u latéral, v profondeur),
//     des zones interdites (portes, fenêtres, escaliers) et une liste de meubles à poser contre les murs ou au centre ; chaque meuble est refusé s'il touche une zone interdite ou un autre meuble.
//     Un parcours en largeur sur la grille de navigation (même grille que l'IA) retire les derniers meubles tant que la porte d'entrée, la porte intérieure et l'escalier ne sont pas reliés.
//  2. COLLISIONS : une boîte par gros meuble, dans boxes (joueur, bots, navigation) et dans un objet de lancer de rayon analytique (balles, vue, sons) comme les troncs d'arbres : aucun maillage par meuble.
//  3. AFFICHAGE À LA DEMANDE : modèles décodés et InstancedMesh créés seulement quand un meuble est à moins de DCO.R mètres du joueur ; un InstancedMesh par pièce de matériau de chaque type de meuble.
const DCO_ON=1;
const DCO=window.DCO={D:DECO_D,keys:Object.keys(DECO_D.M),R:40,mods:[],ix:{},items:[],cells:new Map(),on:0,last:{x:1e9,z:1e9,yaw:9,t:0},dirty:1,stat:{shown:0,types:0,tris:0,draws:0,ms:0,built:0,boxes:0,sites:0,rooms:0,dropped:0,navFix:0},rp:{},sites:[],hs:[],chk:[],protect:[{x0:-1.6,x1:1.6,z0:21.4,z1:24.6,y1:3.5},{x0:-2.6,x1:2.6,z0:24.2,z1:27.4,y1:3.5}],tex:[],bright:1.3};
DCO.keys.forEach((k,i)=>{DCO.ix[k]=i});
// matériau des balles (par défaut bois), collision (1 = une boîte, 0 = décor sans collision), mou = chaise (se glisse sous une table)
const DCM={fridge:{bm:'steel'},locker:{bm:'steel'},mshelf:{bm:'steel'},whshelf:{bm:'steel'},rack:{bm:'steel'},desk_m:{bm:'steel'},bunk:{bm:'steel'},stove:{bm:'steel'},bath:{bm:'conc'},wc:{bm:'conc'},basin:{bm:'conc'},fireplace:{bm:'conc'},
 sofa:{bm:'plas'},sofa2:{bm:'plas'},armchair:{bm:'plas'},bed_single:{bm:'plas'},daybed:{bm:'plas'},mcrate:{bm:'steel'},bin:{bm:'steel'},bin_g:{bm:'steel'},ladder:{bm:'steel'},
 frame:{c:0},clock:{c:0},mirror:{c:0},radiator:{c:0},desklamp:{c:0},oillamp:{c:0},laptop:{c:0},radio:{c:0},tv:{c:0},ceiling:{c:0},fan:{c:0},extinguisher:{c:0},medkit:{c:0},register:{c:0},crate:{c:0},
 chair:{c:0,soft:1},ochair:{c:0,soft:1},stool:{c:0,soft:1},table:{tab:1},dtable:{tab:1},desk:{tab:1},desk_m:{tab:1,bm:'steel'},roundtable:{tab:1},workbench:{tab:1},coffee:{tab:1}};
const dcoI=k=>{const i=DCO.ix[k];if(i===undefined)throw new Error('deco : modèle inconnu '+k);return i};
DCO.dm=k=>{const d=DECO_D.M[k];if(!d)throw new Error('deco : modèle inconnu '+k);return{w:d.d[0],h:d.d[1],d:d.d[2],o:d.o,tr:d.tr}};
// ---------- décodage / matériaux (à la demande) ----------
const dcoB64=s=>{const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u.buffer};
function dcoGeo(p,q){const buf=dcoB64(p.b),n=p.v;let o=0;const P_=new Int16Array(buf,o,n*3);o+=n*6;const N_=new Int8Array(buf,o,n*3);o+=n*3;if(o%2)o++;const U_=new Int16Array(buf,o,n*2);o+=n*4;const I_=new Uint16Array(buf,o,p.i);
 const pos=new Float32Array(n*3),nr=new Float32Array(n*3),uv=new Float32Array(n*2);
 for(let i=0;i<n;i++){for(let k=0;k<3;k++){pos[i*3+k]=q[k]+P_[i*3+k]/32767*q[3+k];nr[i*3+k]=N_[i*3+k]/127}uv[i*2]=U_[i*2]/p.us;uv[i*2+1]=U_[i*2+1]/p.us}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nr,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setIndex(new THREE.BufferAttribute(I_.slice(),1));g.computeBoundingSphere();return g}
function dcoTex(i){if(DCO.tex[i])return DCO.tex[i];const im=new Image(),t=new THREE.Texture(im);t.encoding=THREE.sRGBEncoding;t.anisotropy=Math.min(AN,4);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.generateMipmaps=true;t.minFilter=THREE.LinearMipmapLinearFilter;
 im.onload=()=>{t.needsUpdate=true;try{R.initTexture(t)}catch(e){}};im.src=DECO_D.T[i];return DCO.tex[i]=t}
function dcoBuild(i){const k=DCO.keys[i],d=DECO_D.M[k],cf=DCM[k]||{},m={k,i,n:0,cap:0,ims:[],parts:[],tris:d.tr};
 d.p.forEach(p=>{const g=dcoGeo(p,d.q),map=p.t>=0?dcoTex(p.t):null,mat=std(0xffffff,{map,roughness:.82,metalness:0,envMapIntensity:.4,side:p.ds?THREE.DoubleSide:THREE.FrontSide,alphaTest:p.a?.5:0});
  if(!map)mat.color.setRGB(p.c[0],p.c[1],p.c[2]);mat.color.multiplyScalar(DCO.bright);mat.name='deco_'+k;
  // intérieurs peu éclairés : une part d'émission (couleur propre, 14 %) évite les faces noires du côté opposé aux lampes
  if(map){mat.emissiveMap=map;mat.emissive.setScalar(.14)}else mat.emissive.copy(mat.color).multiplyScalar(.12/DCO.bright);
  const im=new THREE.InstancedMesh(g,mat,1);im.castShadow=false;im.receiveShadow=true;im.frustumCulled=false;im.visible=false;im.count=0;im.userData.deco=k;im.name='deco_'+k;S.add(im);m.ims.push(im);m.parts.push({g,mat})});
 DCO.stat.built++;return DCO.mods[i]=m}
function dcoAlloc(m,cap){const ma=new THREE.InstancedBufferAttribute(new Float32Array(cap*16),16),ca=new THREE.InstancedBufferAttribute(new Float32Array(cap*3),3);ma.setUsage(THREE.DynamicDrawUsage);ca.setUsage(THREE.DynamicDrawUsage);m.ims.forEach(im=>{im.instanceMatrix=ma;im.instanceColor=ca;im.count=0});m.cap=cap}
// ---------- objets enregistrés ----------
// item : {m:index modèle, x,y,z (pied), yaw, t:[r,g,b]}
const dcoCK=(x,z)=>Math.floor(x/16)*4099+Math.floor(z/16);
function dcoAddItem(it){DCO.items.push(it);const k=dcoCK(it.x,it.z);let a=DCO.cells.get(k);if(!a)DCO.cells.set(k,a=[]);a.push(it);DCO.dirty=1;return it}
function dcoUpdate(px,pz){const t0=performance.now(),R=DCO.R,r2=R*R,ls=[];let n=0;
 const i0=Math.floor((px-R)/16),i1=Math.floor((px+R)/16),j0=Math.floor((pz-R)/16),j1=Math.floor((pz+R)/16);
 for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const a=DCO.cells.get(i*4099+j);if(!a)continue;for(const it of a){const dx=it.x-px,dz=it.z-pz;if(dx*dx+dz*dz>r2)continue;(ls[it.m]||(ls[it.m]=[])).push(it);n++}}
 let tri=0,dr=0,ty=0;
 for(let i=0;i<DCO.keys.length;i++){const l=ls[i];let m=DCO.mods[i];if(!l){if(m&&m.n){m.n=0;m.ims.forEach(im=>{im.count=0;im.visible=false})}continue}
  if(!m)m=dcoBuild(i);if(l.length>m.cap)dcoAlloc(m,Math.max(8,Math.ceil(l.length*1.5)));
  const M=m.ims[0].instanceMatrix.array,C=m.ims[0].instanceColor.array;
  for(let q=0;q<l.length;q++){const it=l[q],c=Math.cos(it.yaw),s=Math.sin(it.yaw),o=q*16,e=q*3,sc=it.s||1;M[o]=c*sc;M[o+1]=0;M[o+2]=-s*sc;M[o+3]=0;M[o+4]=0;M[o+5]=sc;M[o+6]=0;M[o+7]=0;M[o+8]=s*sc;M[o+9]=0;M[o+10]=c*sc;M[o+11]=0;M[o+12]=it.x;M[o+13]=it.y;M[o+14]=it.z;M[o+15]=1;
   const t=it.t;C[e]=t[0];C[e+1]=t[1];C[e+2]=t[2]}
  m.n=l.length;m.ims.forEach(im=>{im.count=m.n;im.visible=true});m.ims[0].instanceMatrix.needsUpdate=true;m.ims[0].instanceColor.needsUpdate=true;tri+=m.tris*m.n;dr+=m.ims.length;ty++}
 const st=DCO.stat;st.shown=n;st.types=ty;st.tris=tri;st.draws=dr;st.ms=performance.now()-t0}
function dcoFrame(dt){if(!DCO.on)return;const L=DCO.last;L.t+=dt;if(DCO.dirty||Math.hypot(P.x-L.x,P.z-L.z)>2||L.t>3){L.x=P.x;L.z=P.z;L.t=0;DCO.dirty=0;dcoUpdate(P.x,P.z)}}
window.dcoFrame=dcoFrame;
// ---------- collisions : boîtes (déplacement, navigation) + lancer de rayon analytique (balles, vue) ----------
const dcoRK=(x,z)=>Math.floor(x/8)*4099+Math.floor(z/8);
function dcoRayObj(bm){let o=DCO.rp[bm];if(o)return o;o=DCO.rp[bm]=new THREE.Object3D();o.userData.bmat=bm;o.name='deco_'+bm;o.userData.deco=1;o.cells=new Map();o.n=0;o.stamp=0;
 const nrm=new THREE.Vector3();
 o.raycast=function(rc,out){if(!o.n)return;const og=rc.ray.origin,d=rc.ray.direction,near=rc.near||0,far=Math.min(rc.far,300);if(!(far>0))return;const st=++o.stamp;
  let i=Math.floor(og.x/8),j=Math.floor(og.z/8);const ie=Math.floor((og.x+d.x*far)/8),je=Math.floor((og.z+d.z*far)/8),sx=d.x>0?1:-1,sz=d.z>0?1:-1;
  let tx=Math.abs(d.x)<1e-9?1e18:((d.x>0?(i+1)*8:i*8)-og.x)/d.x,tz=Math.abs(d.z)<1e-9?1e18:((d.z>0?(j+1)*8:j*8)-og.z)/d.z;const dtx=Math.abs(d.x)<1e-9?1e18:8/Math.abs(d.x),dtz=Math.abs(d.z)<1e-9?1e18:8/Math.abs(d.z);
  for(let n=0;n<80;n++){const a=o.cells.get(i*4099+j);if(a)for(let k=0;k<a.length;k++){const b=a[k];if(b.st===st)continue;b.st=st;
    let t0=-1e18,t1=1e18,ax=-1,sg=0;
    for(let q=0;q<3;q++){const oo=q===0?og.x:q===1?og.y:og.z,dd=q===0?d.x:q===1?d.y:d.z,lo=q===0?b.x0:q===1?b.y0:b.z0,hi=q===0?b.x1:q===1?b.y1:b.z1;
     if(Math.abs(dd)<1e-9){if(oo<lo||oo>hi){t0=1e18;break}continue}
     let a0=(lo-oo)/dd,a1=(hi-oo)/dd,s1=-1;if(a0>a1){const tt=a0;a0=a1;a1=tt;s1=1}
     if(a0>t0){t0=a0;ax=q;sg=s1}if(a1<t1)t1=a1;if(t0>t1){t0=1e18;break}}
    if(t0<near||t0>far||t0>=1e17||ax<0)continue;
    nrm.set(ax===0?sg:0,ax===1?sg:0,ax===2?sg:0);out.push({distance:t0,point:new THREE.Vector3(og.x+d.x*t0,og.y+d.y*t0,og.z+d.z*t0),object:o,face:{a:0,b:0,c:0,normal:nrm.clone(),materialIndex:0},faceIndex:0,deco:b})}
   if(i===ie&&j===je)break;if(tx<tz){i+=sx;tx+=dtx}else{j+=sz;tz+=dtz}}};
 solids.push(o);return o}
function dcoCol(b,bm){const o=dcoRayObj(bm||'wood');b.st=0;const i0=Math.floor(b.x0/8),i1=Math.floor(b.x1/8),j0=Math.floor(b.z0/8),j1=Math.floor(b.z1/8);for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const k=i*4099+j;let a=o.cells.get(k);if(!a)o.cells.set(k,a=[]);a.push(b)}o.n++;boxes.push(b);DCO.stat.boxes++}
// ---------- local (pièce) : repère (u,v), zones interdites, placement ----------
// o : {x,z (centre monde), ux,uz (axe u), fx,fz (axe v), hu,hv (demi-dimensions), y (sol), H (plafond), ko:[{u0,u1,v0,v1,y0,y1}], seed, ox (liste de pré-boîtes)}
const dcoHs=(a,b)=>hsh(Math.round(a*13)+7,Math.round(b*17)+3);
function dcoRoom(o){const r=Object.assign({it:[],ko:[],H:2.8,y:0,gap:.03},o);r.kk=0;
 r.hash=k=>hsh(Math.round(r.x*9)+k*131+(r.seed|0),Math.round(r.z*7)+k*57+3);
 r.pick=(k,n)=>Math.floor(r.hash(k)*n)%n;
 r.W=(u,v)=>[r.x+u*r.ux+v*r.fx,r.z+u*r.uz+v*r.fz];
 const FD={f:[0,1],b:[0,-1],r:[1,0],l:[-1,0]};
 // rectangle de l'emprise dans (u,v) ; ancre (u,v) = centre (meuble posé) ou dos du meuble (modèle d'origine « mur »)
 r.fp=(key,u,v,face,sc)=>{const m=DCO.dm(key),s=sc||1,w=m.w*s,d=m.d*s,h=m.h*s,fd=FD[face],fw=face==='f'||face==='b',du=fw?w:d,dv=fw?d:w;let cu=u,cv=v;if(m.o==='wall'){cu+=fd[0]*d/2;cv+=fd[1]*d/2}
  return{key,cu,cv,u0:cu-du/2,u1:cu+du/2,v0:cv-dv/2,v1:cv+dv/2,h,w,d,face,du,dv,m}};
 r.free=(key,u,v,face,op)=>{op=op||{};const f=r.fp(key,u,v,face,op.s),cf=DCM[key]||{},y=op.y||0,top=!!op.top,dc=!!op.deco,e=.005;
  if(f.u0<-r.hu-e||f.u1>r.hu+e||f.v0<-r.hv-e||f.v1>r.hv+e)return null;
  const yy0=op.org==='top'?y-f.h:y,yy1=yy0+f.h;
  if(!dc&&DCO.protect.length){const a=r.W(f.u0,f.v0),b=r.W(f.u1,f.v1),x0=Math.min(a[0],b[0]),x1=Math.max(a[0],b[0]),z0=Math.min(a[1],b[1]),z1=Math.max(a[1],b[1]);for(const p of DCO.protect)if(x1>p.x0&&x0<p.x1&&z1>p.z0&&z0<p.z1&&yy0<(p.y1||3.5))return null}
  for(const k of r.ko)if(f.u1>k.u0&&f.u0<k.u1&&f.v1>k.v0&&f.v0<k.v1&&yy1>k.y0+.001&&yy0<k.y1-.001)return null;
  if(!top&&!dc){const sf=cf.soft,g=op.gap===undefined?0:op.gap;for(const q of r.it){if(q.deco||q.top)continue;if(sf&&q.tab||cf.tab&&q.soft)continue;if(f.u1>q.u0-g&&f.u0<q.u1+g&&f.v1>q.v0-g&&f.v0<q.v1+g&&yy1>q.y0+.001&&yy0<q.y1-.001)return null}}
  else if(top&&op.host){const hs=op.host;if(f.u0<hs.u0-.03||f.u1>hs.u1+.03||f.v0<hs.v0-.03||f.v1>hs.v1+.03)return null}
  if(dc){for(const q of r.it){if(q.deco||q.top||q.y1<yy0+.05)continue;if(f.u1>q.u0&&f.u0<q.u1&&f.v1>q.v0&&f.v0<q.v1&&yy0<q.y1-.001&&yy1>q.y0+.001)return null}}
  const rec=Object.assign(f,{y0:yy0,y1:yy1,soft:cf.soft,tab:cf.tab,deco:dc,top,col:op.col===undefined?(cf.c===0?0:1):op.col,bm:op.bm||cf.bm||'wood',tint:op.tint,y:yy0,s:op.s||1,hn:op.hn,host:op.host});r.it.push(rec);return rec};
 // contre un mur : side = b (v=-hv), f (v=+hv), l (u=-hu), r (u=+hu) ; pos = coordonnée du centre le long du mur, ou 'lo' / 'hi' / 'c' ; le meuble regarde l'intérieur
 r.wall=(side,key,pos,op)=>{op=op||{};const m=DCO.dm(key),s=op.s||1,face={b:'f',f:'b',l:'r',r:'l'}[side],fw=face==='f'||face==='b',w=m.w*s,d=m.d*s,half=(fw?r.hu:r.hv),gp=op.gap===undefined?r.gap:op.gap;
  let p=pos==='lo'?-half+w/2+.04:pos==='hi'?half-w/2-.04:pos==='c'||pos===undefined?0:pos;if(op.off)p+=op.off;
  const dd=m.o==='wall'?gp:d/2+gp,wl=side==='b'?-r.hv:side==='f'?r.hv:side==='l'?-r.hu:r.hu,sg=(side==='b'||side==='l')?1:-1;
  const u=fw?p:wl+sg*dd,v=fw?wl+sg*dd:p;return r.free(key,u,v,face,op)};
 // essaie plusieurs murs / positions (ordre tourné par le hachage pour varier d'un bâtiment à l'autre)
 r.auto=(key,sides,poss,op)=>{op=op||{};poss=poss||['lo','hi','c'];const rot=(op.rot===undefined?r.kk++:op.rot),S=sides.length,P=poss.length;
  for(let a=0;a<S;a++){const sd=sides[(a+(op.rs?r.pick(rot,S):0))%S];for(let b=0;b<P;b++){const ps=poss[(b+(op.rp?r.pick(rot+7,P):0))%P],q=r.wall(sd,key,ps,op);if(q)return Object.assign(q,{side:sd,ps})}}return null};
 // à côté d'un meuble déjà posé (même mur, dir = ±1 le long du mur)
 r.beside=(rec,key,dir,op)=>{op=op||{};const side=rec.side;if(!side)return null;const m=DCO.dm(key),s=op.s||1,fw=side==='b'||side==='f',w=m.w*s,pos=(fw?rec.cu:rec.cv)+dir*((fw?rec.du:rec.dv)/2+w/2+(op.gap===undefined?.03:op.gap));const q=r.wall(side,key,pos,op);if(q)q.side=side;return q};
 // sur un meuble (tv sur un buffet, lampe sur une table...) ; ox,oz : décalage dans le repère du meuble hôte
 r.on=(rec,key,op)=>{op=Object.assign({},op||{});const m=DCO.dm(key),yy=rec.h*(rec.s||1)+(op.dy||0)+rec.y0;op.y=yy;op.top=true;op.host=rec;op.col=0;const f=rec.face,fw=f==='f'||f==='b',ou=op.u||0,ov=op.v||0;return r.free(key,rec.cu+ou,rec.cv+ov,op.face||f,op)};
 // devant un meuble (chaise devant un bureau, table basse devant un canapé) : gap = espace, off = décalage latéral
 r.front=(rec,key,op)=>{op=op||{};const m=DCO.dm(key),fd=FD[rec.face],fw=rec.face==='f'||rec.face==='b',dist=(fw?rec.dv:rec.du)/2+m.d/2+(op.gap===undefined?.02:op.gap),lat=op.off||0,face=op.face||{f:'b',b:'f',l:'r',r:'l'}[rec.face];
  return r.free(key,rec.cu+fd[0]*dist+(fw?lat:0),rec.cv+fd[1]*dist+(fw?0:lat),face,op)};
 // décor mural : y = hauteur du bas ; pos le long du mur
 r.deco=(side,key,pos,y,op)=>{op=Object.assign({deco:1,col:0},op||{});op.y=y;return r.wall(side,key,pos,op)};
 return r}
// chaises autour d'une table (nombre n, face à la table)
function dcoChairs(r,tb,key,n,op){const out=[];if(!tb)return out;op=op||{};const g=op.gap===undefined?.14:op.gap,m=DCO.dm(key),sd=[['f',1],['b',-1],['r',1],['l',-1]];const sl=[];
 // le long de la grande dimension : de part et d'autre ; aux bouts en dernier
 const long_=tb.du>=tb.dv;const sides=long_?[['b',0],['f',0],['l',1],['r',1]]:[['l',0],['r',0],['b',1],['f',1]];
 for(const [s,end] of sides){if(out.length>=n)break;const alongU=(s==='b'||s==='f'),len=alongU?tb.du:tb.dv,k=end?1:(len>1.9?2:1);for(let q=0;q<k&&out.length<n;q++){const off=k===1?0:(q?.5:-.5)*len*.5,cu=tb.cu+(alongU?off:(s==='r'?(tb.du/2+m.d/2-.04+g*0):-(tb.du/2+m.d/2-.04))),cv=tb.cv+(alongU?(s==='f'?(tb.dv/2+m.d/2-.04):-(tb.dv/2+m.d/2-.04)):off);
   const face={b:'f',f:'b',l:'r',r:'l'}[s];const c=r.free(key,cu,cv,face,{gap:0});if(c)out.push(c)}}
 return out}
// ---------- inscription finale : instances, boîtes, rayons ----------
// ctx.floor : hauteur du sol ; les enregistrements du local sont transformés en objets monde
function dcoCommit(r){let n=0;const hr=r.hash;
 for(const q of r.it){const wc=r.W(q.cu,q.cv),fd={f:[0,1],b:[0,-1],r:[1,0],l:[-1,0]}[q.face],wx=fd[0]*r.ux+fd[1]*r.fx,wz=fd[0]*r.uz+fd[1]*r.fz,yaw=Math.atan2(wx,wz);
  let ax=wc[0],az=wc[1];if(q.m.o==='wall'){ax=wc[0]-wx*q.d/2;az=wc[1]-wz*q.d/2}
  const k=q.hn!==undefined?q.hn:Math.abs((Math.round(ax*37)^Math.round(az*53))|0),v=.9+.2*((k*2654435761>>>0)%1000)/1000,tn=q.tint||[1,1,1];
  const it=dcoAddItem({m:dcoI(q.key),x:ax,y:r.y+q.y,z:az,yaw,s:q.s!==1?q.s:0,t:[v*tn[0],v*tn[1],v*tn[2]],q:q.key});n++;
  if(q.col){const a=r.W(q.u0,q.v0),b=r.W(q.u1,q.v1),e=.015;dcoCol({x0:Math.min(a[0],b[0])+e,x1:Math.max(a[0],b[0])-e,z0:Math.min(a[1],b[1])+e,z1:Math.max(a[1],b[1])-e,y0:r.y+q.y0,y1:r.y+q.y1,deco:q.key},q.bm);it.col=1}}
 DCO.stat.rooms++;return n}
DCO.room=dcoRoom;DCO.commit=dcoCommit;DCO.chairs=dcoChairs;DCO.upd=dcoUpdate;DCO.add=dcoAddItem;

// ---------- connexité : même grille de navigation que l'IA (NS = .75 m, marge .3 m), parcours en largeur local ----------
// pend : boîtes en attente ; pts : [[x,z],...] points à relier au premier ; ylo,yhi : tranche d'étage
const DNS=.75,DNG=Math.ceil(2*MH/DNS);
function dcoConn(bb,pend,pts,ylo,yhi){const m=.3;let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;pts.forEach(p=>{x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[1]);z1=Math.max(z1,p[1])});x0-=4;x1+=4;z0-=4;z1+=4;
 const i0=Math.max(0,Math.floor((x0+MH)/DNS)),i1=Math.min(DNG-1,Math.floor((x1+MH)/DNS)),j0=Math.max(0,Math.floor((z0+MH)/DNS)),j1=Math.min(DNG-1,Math.floor((z1+MH)/DNS)),W=i1-i0+1,Hh=j1-j0+1,bl=new Uint8Array(W*Hh);
 const db=new Set(doors.map(d=>d.box));
 const mark=o=>{if(db.has(o)||o.y0>yhi||o.y1<=ylo)return;if(o.x1+m<x0||o.x0-m>x1||o.z1+m<z0||o.z0-m>z1)return;const a0=Math.max(i0,Math.ceil((o.x0-m+MH)/DNS-.5)),a1=Math.min(i1,Math.floor((o.x1+m+MH)/DNS-.5)),c0=Math.max(j0,Math.ceil((o.z0-m+MH)/DNS-.5)),c1=Math.min(j1,Math.floor((o.z1+m+MH)/DNS-.5));for(let j=c0;j<=c1;j++)for(let i=a0;i<=a1;i++)bl[(j-j0)*W+(i-i0)]=1};
 bb.forEach(mark);pend.forEach(mark);
 const cell=p=>{let ci=Math.round((p[0]+MH)/DNS-.5)-i0,cj=Math.round((p[1]+MH)/DNS-.5)-j0;if(ci<0||cj<0||ci>=W||cj>=Hh)return -1;if(!bl[cj*W+ci])return cj*W+ci;for(let r=1;r<=3;r++)for(let dj=-r;dj<=r;dj++)for(let di=-r;di<=r;di++){const a=ci+di,b=cj+dj;if(a>=0&&b>=0&&a<W&&b<Hh&&!bl[b*W+a]&&Math.max(Math.abs(di),Math.abs(dj))===r)return b*W+a}return -1};
 const st=cell(pts[0]);if(st<0)return[];const vis=new Uint8Array(W*Hh),qu=[st];vis[st]=1;
 while(qu.length){const k=qu.pop(),ci=k%W,cj=(k/W)|0;for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){if(!di&&!dj)continue;const a=ci+di,b=cj+dj;if(a<0||b<0||a>=W||b>=Hh)continue;const q=b*W+a;if(vis[q]||bl[q])continue;if(di&&dj&&(bl[cj*W+a]||bl[b*W+ci]))continue;vis[q]=1;qu.push(q)}}
 const bad=[];for(let i=1;i<pts.length;i++){const c=cell(pts[i]);if(c>=0&&!vis[c])bad.push(i)}return bad}
DCO.conn=dcoConn;
const dcoWB=(r,q)=>{const a=r.W(q.u0,q.v0),b=r.W(q.u1,q.v1);return{x0:Math.min(a[0],b[0]),x1:Math.max(a[0],b[0]),z0:Math.min(a[1],b[1]),z1:Math.max(a[1],b[1]),y0:r.y+q.y0,y1:r.y+q.y1}};
// retire des meubles tant que les points ne sont pas reliés (essaie de retirer chacun, du dernier au premier) ; rooms : locaux concernés
function dcoFix(rooms,pts,ylo,yhi){let qx0=1e9,qx1=-1e9,qz0=1e9,qz1=-1e9;pts.forEach(p=>{qx0=Math.min(qx0,p[0]);qx1=Math.max(qx1,p[0]);qz0=Math.min(qz0,p[1]);qz1=Math.max(qz1,p[1])});qx0-=6;qx1+=6;qz0-=6;qz1+=6;const bb=boxes.filter(o=>o.x1>=qx0&&o.x0<=qx1&&o.z1>=qz0&&o.z0<=qz1);{const b0=dcoConn(bb,[],pts,ylo,yhi);if(b0.length){const keep=pts.filter((p,i)=>i===0||!b0.includes(i));pts=keep}}const all=()=>{const a=[];rooms.forEach(r=>r.it.forEach(q=>{if(q.col&&!q.dead)a.push({r,q})}));return a};let guard=0;
 const pend=()=>all().map(e=>dcoWB(e.r,e.q));
 while(guard++<40){const bad=dcoConn(bb,pend(),pts,ylo,yhi);if(!bad.length)return;
  const L=all();let done=0;for(let i=L.length-1;i>=0&&!done;i--){const e=L[i];e.q.dead=1;const b2=dcoConn(bb,pend(),pts,ylo,yhi);if(b2.length<bad.length){done=1;DCO.stat.navFix++}else e.q.dead=0}
  if(!done){if(!L.length)return;L[L.length-1].q.dead=1;DCO.stat.navFix++}}}
const dcoFin=rooms=>{rooms.forEach(r=>{r.it=r.it.filter(q=>{if(q.dead||(q.host&&q.host.dead)){DCO.stat.dropped++;return false}return true});dcoCommit(r)})};

// ================= MAISONS ET BUNKERS =================
// types de pièces : avant 0 chambre, 1 cuisine, 2 salon, 3 atelier, 4 poste de garde, 5 radio, 6 armurerie, 7 cantine, 8 salle d'opérations, 9 armurerie du bunker ; arrière 0 salle de bain, 1 cellier, 2 bureau, 3 repos, 4 dortoir, 5 réserve, 6 infirmerie, 7 réserve 2
const dcoTint={fab:[[1,1,1],[.82,.95,1.08],[1.1,.92,.85],[.9,1.05,.88],[1.05,1.0,.8]]};
const dcoFab=r=>dcoTint.fab[r.pick(5,dcoTint.fab.length)];
const LAYF=[
// 0 chambre
r=>{const k=r.hash(1),bed=r.auto(k<.3?'bed_double':'bed_single',['l','r','b'],['lo','hi'],{rs:1,tint:dcoFab(r)});
 if(bed){const n=r.beside(bed,'nightstand',1)||r.beside(bed,'nightstand',-1);if(n)r.on(n,'desklamp')||r.on(n,'oillamp')}
 const wd=r.auto('wardrobe',['b','f','r','l'],['lo','hi','c'],{rs:1}),dr=r.auto('dresser',['f','r','l','b'],['c','lo','hi'],{rs:1});
 if(dr){r.deco(dr.side,'mirror',dr.side==='b'||dr.side==='f'?dr.cu:dr.cv,1.25);r.on(dr,'oillamp',{u:.2})}
 const ds=r.auto('desk',['f','r','l','b'],['c','lo','hi'],{rs:1});if(ds){r.front(ds,'ochair',{gap:-.15});r.on(ds,'laptop',{u:-.25});r.on(ds,'desklamp',{u:.45})}
 r.auto('frame',['b','f','l','r'],['c','lo','hi'],{deco:1,y:1.45,rs:1});r.auto('clock',['l','r','b'],['c','hi','lo'],{deco:1,y:1.7,rs:1});r.auto('bookcase',['l','r','f'],['lo','hi'],{rs:1})},
// 1 cuisine
r=>{const c1=r.auto('counter',['b','l','r','f'],['lo','hi'],{rs:1});
 if(c1){const f=r.beside(c1,'fridge',1)||r.beside(c1,'fridge',-1),sd=f?(f.cu>c1.cu||f.cv>c1.cv?-1:1):1,st=r.beside(c1,'stove',sd)||r.beside(c1,'stove',-sd);if(st)r.beside(st,'counter',sd)||r.beside(st,'sideboard',sd);r.deco(c1.side,'frame',c1.side==='b'||c1.side==='f'?c1.cu:c1.cv,1.5)}
 const sb=r.auto('sideboard',['r','l','f','b'],['hi','lo','c'],{rs:1});if(sb)r.on(sb,'oillamp')
 const tk=r.hash(6)<.5?'table':'dtable',tb=r.free(tk,r.hash(3)<.5?.3:-.3,.2,'f',{})||r.free('roundtable',0,.2,'f',{});if(tb){dcoChairs(r,tb,'chair',tb.key==='dtable'?6:tb.key==='table'?4:3)}
 r.auto('bin',['f','r','l'],['hi','lo'],{rs:1});r.auto('extinguisher',['l','r','b'],['c','lo','hi'],{deco:1,y:1.1});r.auto('clock',['l','r','b'],['c','hi','lo'],{deco:1,y:1.8,rs:1})},
// 2 salon
r=>{const sv=r.hash(2)<.5,sf=r.auto(sv?'sofa':'sofa2',['b','l','r'],['lo','hi','c'],{rs:1,tint:dcoFab(r)});
 if(sf){r.front(sf,'coffee',{gap:.45});r.beside(sf,'lamp_floor',1)||r.beside(sf,'lamp_floor',-1)}
 const opp=sf?{b:'f',l:'r',r:'l'}[sf.side]:'f',sb=r.auto('sideboard',[opp,'f','r','l'],['c','lo','hi',1.6,-1.6],{});if(sb)r.on(sb,'tv')||r.on(sb,'oillamp');
 r.auto('armchair',['l','r','b','f'],['c','lo','hi'],{rs:1,tint:dcoFab(r)});r.auto('armchair',['r','l','f','b'],['hi','lo','c'],{rs:1,tint:dcoFab(r)});
 r.auto('fireplace',['l','r','b'],['c','lo','hi'],{});r.auto('bookcase',['r','l','f'],['hi','lo','c'],{rs:1});r.auto('bookcase2',['l','r','b','f'],['lo','hi','c'],{rs:1});
 r.auto('frame',['b','f','l','r'],['c','lo','hi'],{deco:1,y:1.5,rs:1});r.auto('clock',['b','f','r','l'],['hi','lo','c'],{deco:1,y:1.75,rs:1});r.auto('radiator',['f','l','r'],['lo','hi','c'],{deco:1,y:.2,rs:1})},
// 3 atelier
r=>{const wb=r.auto('workbench',['b','l','r','f'],['c','lo','hi'],{rs:1});if(wb){r.on(wb,'radio',{u:-.5})||r.on(wb,'desklamp');r.deco(wb.side,'extinguisher',wb.side==='b'||wb.side==='f'?wb.cu+1.4:wb.cv+1.4,1.0)}
 r.auto('mshelf',['l','r','f','b'],['lo','hi','c'],{rs:1});r.auto('mshelf',['r','l','b','f'],['hi','lo','c'],{rs:1});r.auto('whshelf',['f','r','l','b'],['lo','hi','c'],{rs:1});r.auto('rack',['l','r','b','f'],['c','hi','lo'],{rs:1});
 r.auto('locker',['r','l','f','b'],['lo','hi','c'],{rs:1});r.auto('bin',['r','l','f'],['lo','hi'],{rs:1});r.auto('ladder',['b','l','r'],['hi','lo'],{rs:1});
 const mc=r.free('mcrate',r.hash(4)<.5?-.8:.8,.6,'f',{});if(mc)r.free('mcrate',mc.cu,mc.cv,'f',{y:mc.h});r.auto('mcrate',['f','l','r'],['c','lo','hi'],{rs:1});r.auto('workbench',['f','r','l','b'],['hi','lo','c'],{rs:1})},
// 4 poste de garde
r=>{for(let i=0;i<3;i++)r.auto('locker',['l','r','b','f'],['lo','hi'],{rs:i==0,gap:.02});
 const d=r.free('desk_m',r.hash(6)<.5?-.8:.8,.5,'b',{})||r.auto('desk_m',['f','r','l','b'],['c','lo','hi']);if(d){r.on(d,'radio',{u:-.35,v:0});r.on(d,'desklamp',{u:.7});r.front(d,'ochair',{gap:-.18,off:-.3})}
 r.auto('mshelf',['f','r','l','b'],['hi','lo','c'],{rs:1});r.auto('mcrate',['f','l','r','b'],['lo','hi','c'],{rs:1});r.auto('mcrate',['r','l','f','b'],['lo','hi','c'],{rs:1});r.auto('bin',['f','r','l'],['hi','lo'],{rs:1});
 r.auto('chalkboard',['r','l','f'],['c','hi','lo'],{rs:1});r.auto('extinguisher',['l','r','b','f'],['c','hi','lo'],{deco:1,y:1.1,rs:1});r.auto('medkit',['l','r','f','b'],['c','lo','hi'],{deco:1,y:1.4,rs:1})},
// 5 radio / commandement
r=>{const d1=r.auto('desk_m',['b','f','l','r'],['c','lo','hi'],{rs:1});if(d1){r.on(d1,'radio',{u:-.5});r.on(d1,'laptop',{u:.45});r.front(d1,'ochair',{gap:-.18,off:-.3});const d2=r.beside(d1,'desk_m',1)||r.beside(d1,'desk_m',-1);if(d2){r.on(d2,'radio',{u:.5});r.front(d2,'ochair',{gap:-.18,off:.3})}}
 r.auto('mshelf',['l','r','f','b'],['lo','hi','c'],{rs:1});r.auto('whshelf',['r','l','f','b'],['lo','hi','c'],{rs:1});r.auto('locker',['f','r','l','b'],['hi','lo','c'],{rs:1});r.auto('chalkboard',['f','l','r','b'],['c','lo','hi'],{rs:1});
 r.auto('mcrate',['l','r','f','b'],['hi','lo','c'],{rs:1});r.auto('bin',['r','l','f'],['lo','hi'],{rs:1});r.auto('extinguisher',['l','r','b','f'],['c','hi','lo'],{deco:1,y:1.1,rs:1})},
// 6 armurerie
r=>{for(let i=0;i<3;i++)r.auto('rack',['l','r','b','f'],['lo','hi','c'],{rs:i==0});r.auto('mshelf',['r','l','f','b'],['hi','lo','c'],{rs:1});r.auto('locker',['f','b','l','r'],['lo','hi','c'],{rs:1});r.auto('locker',['f','b','r','l'],['hi','lo','c'],{rs:1});
 const wb=r.auto('workbench',['f','b','r','l'],['c','lo','hi'],{rs:1});if(wb)r.on(wb,'medkit');
 for(let i=0;i<3;i++){const m=r.free('mcrate',(i-1)*1.3,-.2+r.hash(8+i)*.8,'f',{});if(m&&i==1)r.free('mcrate',m.cu,m.cv,'f',{y:m.h})}r.auto('extinguisher',['l','r','b','f'],['c','hi','lo'],{deco:1,y:1.1,rs:1})},
// 7 cantine
r=>{const t1=r.free('dtable',-.4,-.6,'f',{}),t2=r.free('dtable',-.4,1.2,'f',{});[t1,t2].forEach(t=>t&&dcoChairs(r,t,'chair',6));if(!t1&&!t2){const t=r.auto('dtable',['b','f','l','r'],['c','lo','hi'],{rs:0})||r.auto('table',['b','f','l','r'],['c','lo','hi'],{rs:0});t&&dcoChairs(r,t,'chair',4)}
 const c1=r.auto('counter',['f','l','r','b'],['lo','hi'],{rs:1});if(c1){const f=r.beside(c1,'fridge',1)||r.beside(c1,'fridge',-1),st=r.beside(c1,'stove',f&&(f.cu>c1.cu||f.cv>c1.cv)?-1:1)||r.beside(c1,'stove',-1);if(st)r.beside(st,'counter',f&&(f.cu>c1.cu||f.cv>c1.cv)?-1:1)}
 r.auto('sideboard',['r','l','b'],['c','hi','lo'],{rs:1});r.auto('bin',['r','l','b','f'],['hi','lo'],{rs:1});r.auto('bin_g',['l','r','b','f'],['hi','lo'],{rs:1});r.auto('extinguisher',['l','r','b','f'],['c','hi','lo'],{deco:1,y:1.1,rs:1});r.auto('clock',['b','l','r'],['c','lo','hi'],{deco:1,y:1.9,rs:1})},
// 8 salle d'opérations
r=>{const tb=r.free('desk_m',0,.1,'f',{}),tb2=tb&&r.free('desk_m',0,-.1-(tb.dv/2+.5),'f',{});[tb,tb2].forEach((t,i)=>{if(!t)return;r.on(t,'laptop',{u:-.5});r.on(t,'laptop',{u:.5})});
 if(tb){r.front(tb,'ochair',{gap:-.2,off:-.5});r.front(tb,'ochair',{gap:-.2,off:.5})}if(tb2){r.front(tb2,'ochair',{face:'f',gap:-.2,off:-.5});}
 r.auto('chalkboard',['b','f','l','r'],['c','lo','hi'],{rs:1});r.auto('mshelf',['l','r','b','f'],['lo','hi','c'],{rs:1});r.auto('locker',['r','l','f','b'],['lo','hi','c'],{rs:1});r.auto('locker',['r','l','f','b'],['hi','lo','c'],{rs:1});r.auto('rack',['b','f','l','r'],['hi','lo','c'],{rs:1});
 r.auto('mcrate',['f','l','r','b'],['lo','hi','c'],{rs:1});r.auto('extinguisher',['l','r','b','f'],['c','hi','lo'],{deco:1,y:1.1,rs:1})},
// 9 armurerie du bunker d'apparition
r=>{for(let i=0;i<4;i++)r.auto('locker',['b','l','r','f'],['lo','hi'],{rs:i==0,gap:.02});r.auto('rack',['r','l','f','b'],['lo','hi','c'],{rs:1});r.auto('rack',['l','r','f','b'],['hi','lo','c'],{rs:1});r.auto('mshelf',['f','r','l','b'],['lo','hi','c'],{rs:1});
 const wb=r.free('workbench',-.6,-.2,'f',{})||r.auto('workbench',['f','r','l','b'],['c','lo','hi'],{rs:1});if(wb){r.on(wb,'radio',{u:-.6});r.front(wb,'chair',{gap:-.1,off:.3})}
 for(let i=0;i<3;i++){const m=r.free('mcrate',1.4+i*.05,-.9+i*1.1,'l',{});if(m&&i==1)r.free('mcrate',m.cu,m.cv,'l',{y:m.h})}r.auto('bin',['f','r','l'],['hi','lo'],{rs:1});r.auto('extinguisher',['l','r','b','f'],['c','hi','lo'],{deco:1,y:1.1,rs:1})}
];
const LAYB=[
// 0 salle de bain
r=>{const b=r.auto('bath',['b','l','r'],['lo','hi'],{rs:1});r.auto('wc',['b','r','l'],['hi','lo','c'],{rs:1});const ba=r.auto('basin',['l','r','f','b'],['c','lo','hi'],{rs:1});r.auto('basin',['r','l','f'],['c','hi','lo'],{rs:1});r.auto('radiator',['f','l','r','b'],['c','lo','hi'],{deco:1,y:.25,rs:1});r.auto('bin',['f','r','l'],['hi','lo'],{rs:1});r.auto('mirror',['f','l','r'],['c','lo','hi'],{deco:1,y:1.2,rs:1})},
// 1 cellier
r=>{r.auto('whshelf',['b','l','r','f'],['lo','hi','c'],{rs:1});r.auto('whshelf',['b','r','l','f'],['hi','lo','c'],{rs:1});r.auto('shopshelf',['l','r','f'],['lo','hi','c'],{rs:1});r.auto('mshelf',['r','l','f','b'],['lo','hi','c'],{rs:1});
 const c=r.free('crate',r.hash(2)<.5?-.9:.9,.2,'f',{});r.auto('crate',['f','r','l'],['c','lo','hi'],{rs:1});r.auto('bin',['f','r','l','b'],['hi','lo'],{rs:1});r.auto('mcrate',['f','l','r'],['c','lo','hi'],{rs:1})},
// 2 bureau
r=>{const d=r.auto('desk',['b','f','l','r'],['c','lo','hi'],{rs:1});if(d){r.front(d,'ochair',{gap:-.2});r.on(d,'laptop',{u:-.3});r.on(d,'desklamp',{u:.5})}
 r.auto('bookcase',['l','r','f','b'],['lo','hi','c'],{rs:1});r.auto('bookcase2',['r','l','f','b'],['hi','lo','c'],{rs:1});r.auto('bookcase',['f','r','l','b'],['lo','hi','c'],{rs:1});r.auto('locker',['r','l','f'],['lo','hi'],{rs:1});r.auto('frame',['b','f','l','r'],['c','lo','hi'],{deco:1,y:1.5,rs:1});r.auto('clock',['l','r','f','b'],['c','lo','hi'],{deco:1,y:1.8,rs:1})},
// 3 repos
r=>{const b=r.auto(r.hash(5)<.4?'daybed':'bed_single',['l','r','b'],['lo','hi'],{rs:1,tint:dcoFab(r)});if(b)r.beside(b,'nightstand',1)||r.beside(b,'nightstand',-1);const bk=r.auto('bunk',['r','l','b','f'],['hi','lo'],{rs:1});r.auto('locker',['b','f','l','r'],['lo','hi','c'],{rs:1});r.auto('locker',['f','b','r','l'],['hi','lo','c'],{rs:1});r.auto('mcrate',['f','l','r'],['c','lo','hi'],{rs:1});r.auto('extinguisher',['f','b','l','r'],['lo','hi','c'],{deco:1,y:1.1,rs:1})},
// 4 dortoir
r=>{for(let i=0;i<4;i++)r.auto('bunk',i%2?['r','l','b']:['l','r','b'],['lo','hi','c'],{rs:i==0,gap:.02});r.auto('locker',['b','f','l','r'],['lo','hi','c'],{rs:1});r.auto('mcrate',['f','l','r'],['c','lo','hi'],{rs:1});r.auto('extinguisher',['f','b','l','r'],['lo','hi','c'],{deco:1,y:1.1,rs:1})},
// 5 réserve
r=>{r.auto('whshelf',['l','r','b','f'],['lo','hi','c'],{rs:1});r.auto('whshelf',['r','l','b','f'],['hi','lo','c'],{rs:1});r.auto('mshelf',['b','f','l','r'],['c','lo','hi'],{rs:1});for(let i=0;i<3;i++){const m=r.free('mcrate',-1+i*1.1,-.1+r.hash(3+i)*.5,'f',{});if(m&&i==0)r.free('mcrate',m.cu,m.cv,'f',{y:m.h})}r.auto('bin',['f','r','l'],['hi','lo'],{rs:1});r.auto('crate',['f','r','l'],['lo','hi'],{rs:1})},
// 6 infirmerie
r=>{const a=r.auto('bed_single',['l','b','r'],['lo','hi'],{rs:1,tint:[1.1,1.1,1.1]}),b=r.auto('bed_single',['r','b','l'],['lo','hi'],{rs:1,tint:[1.1,1.1,1.1]});if(a)r.beside(a,'nightstand',1)||r.beside(a,'nightstand',-1);const d=r.auto('desk',['f','b','l','r'],['c','lo','hi'],{rs:1});if(d){r.on(d,'medkit',{u:-.3});r.front(d,'chair',{gap:-.1})}
 r.auto('locker',['f','r','l','b'],['lo','hi','c'],{rs:1});r.auto('radiator',['f','l','r','b'],['c','lo','hi'],{deco:1,y:.25,rs:1});r.auto('medkit',['b','f','l','r'],['c','lo','hi'],{deco:1,y:1.5,rs:1});r.auto('extinguisher',['f','b','l','r'],['lo','hi','c'],{deco:1,y:1.1,rs:1})},
// 7 réserve 2
r=>{r.auto('mshelf',['r','l','b','f'],['lo','hi','c'],{rs:1});r.auto('mshelf',['l','r','b','f'],['hi','lo','c'],{rs:1});r.auto('rack',['b','f','l','r'],['c','lo','hi'],{rs:1});for(let i=0;i<3;i++){const m=r.free('crate',-.8+i*.8,.1,'f',{});}r.auto('mcrate',['f','l','r'],['c','lo','hi'],{rs:1});r.auto('bin_g',['f','r','l'],['hi','lo'],{rs:1})}
];
// chambre à l'étage (maisons à étage)
const LAYU=[
r=>{const bed=r.auto(r.hash(1)<.4?'bed_double':'bed_single',['l','r','b','f'],['lo','hi','c'],{rs:1,tint:dcoFab(r)})||r.auto('bed_single',['f','b','l','r'],['c','lo','hi'],{rs:0,tint:dcoFab(r)})||r.auto('daybed',['f','b','l','r'],['c','lo','hi'],{rs:0});if(bed){const n=r.beside(bed,'nightstand',1)||r.beside(bed,'nightstand',-1);if(n)r.on(n,'oillamp')}
 const bed2=bed&&r.auto('bed_single',['r','l','b'],['hi','lo'],{rs:1,tint:dcoFab(r)});r.auto('wardrobe',['b','l','r','f'],['lo','hi','c'],{rs:1});r.auto('dresser',['b','f','r','l'],['c','hi','lo'],{rs:1});r.auto('bookcase',['f','l','r'],['lo','hi'],{rs:1});r.auto('frame',['b','f','l','r'],['c','lo','hi'],{deco:1,y:1.5,rs:1});r.auto('mirror',['b','l','r'],['hi','lo','c'],{deco:1,y:1.25,rs:1})}
];
DCO.lay={F:LAYF,B:LAYB,U:LAYU};
// ctx : voir house() dans bld_house.js
function decoHouse(c){const H=c.H,bun=c.bun,wy0=bun?1.5:.9,wy1=bun?2.0:2.1,hw=(bun?.75:.55)+.12,hu=c.hu,hf=c.hf,hb=c.hb,du=c.du,sd=Math.round(c.cx*10)+Math.round(c.cz*10)*7;
 const WIN=(r,wall,cs,hv)=>cs.forEach(q=>{if(wall==='f')r.ko.push({u0:q-hw,u1:q+hw,v0:hv-.5,v1:hv+.2,y0:wy0,y1:wy1});else if(wall==='b')r.ko.push({u0:q-hw,u1:q+hw,v0:-hv-.2,v1:-hv+.5,y0:wy0,y1:wy1});else if(wall==='l')r.ko.push({u0:-hu-.2,u1:-hu+.5,v0:q-hw,v1:q+hw,y0:wy0,y1:wy1});else r.ko.push({u0:hu-.5,u1:hu+.2,v0:q-hw,v1:q+hw,y0:wy0,y1:wy1})});
 const DOOR=(r,u,v0,v1)=>r.ko.push({u0:u-1.1,u1:u+1.1,v0:v0,v1:v1,y0:0,y1:2.5});
 const fr=dcoRoom({x:c.fcx,z:c.fcz,ux:c.ux,uz:c.uz,fx:c.fx,fz:c.fz,hu,hv:hf,y:0,H,seed:sd}),br=dcoRoom({x:c.bcx,z:c.bcz,ux:c.ux,uz:c.uz,fx:c.fx,fz:c.fz,hu,hv:hb,y:0,H,seed:sd+5});
 DOOR(fr,0,hf-1.45,hf+.2);DOOR(fr,du,-hf-.2,-hf+1.45);WIN(fr,'f',[-.62*hu,.62*hu],hf);WIN(fr,'l',[0],0);WIN(fr,'r',[0],0);
 DOOR(br,du,hb-1.45,hb+.2);WIN(br,'b',[0],hb);WIN(br,'l',[0],0);WIN(br,'r',[0],0);
 const uc=c.si*(hu-.55);c.uc=uc;if(c.up)fr.ko.push({u0:c.uc-.7,u1:c.uc+.7,v0:-hf-.2,v1:1.25,y0:0,y1:3.5});
 const rooms=[fr,br],lay=c.up?[4,5,8,4][fr.pick(4,4)]:c.lay;LAYF[lay](fr);LAYB[c.bk](br);
 const W=(r,u,v)=>r.W(u,v),pts=[W(fr,0,hf+1.1),W(fr,du,-hf+1.0),W(br,du,hb-1.0)];if(c.up)pts.push(W(fr,c.uc,.9));
 dcoFix(rooms,pts,-1,1.7);const chk=[{pts,ylo:-1,yhi:1.7}];
 let ur=null;
 if(c.up){const v0=-.1,hv=(hf-v0)/2,mv=(hf+v0)/2;ur=dcoRoom({x:c.fcx+c.fx*mv,z:c.fcz+c.fz*mv,ux:c.ux,uz:c.uz,fx:c.fx,fz:c.fz,hu,hv,y:c.FT,H,seed:sd+9});
  // fenêtres : face avant (±.62 hu), côtés (v = 0 du local avant), trémie de l'escalier côté mur
  const vv=q=>q-mv;WIN(ur,'f',[-.62*hu,.62*hu],hv);WIN(ur,'l',[vv(0)],0);WIN(ur,'r',[vv(0)],0);
  ur.ko.push({u0:c.uc-.8,u1:c.uc+.8,v0:-hv-.1,v1:vv(.55),y0:0,y1:3.5});
  // postes de tir de l'IA aux fenêtres (±.62hu ; hf-.5) et le long des côtés
  [[-.62*hu,hf-.5],[.62*hu,hf-.5],[hu-.5,0],[-hu+.5,0]].forEach(q=>ur.ko.push({u0:q[0]-.6,u1:q[0]+.6,v0:vv(q[1])-.6,v1:vv(q[1])+.6,y0:0,y1:1.9}));
  LAYU[0](ur);rooms.push(ur);
  const upts=[W(fr,uc,c.vT-.5),W(ur,0,hv-.9),W(ur,-.62*hu,hv-.5),W(ur,.62*hu,hv-.5),W(fr,c.si*(hu-1.3),c.vB+2.2)];
  // parcours étage : murs de l'étage (y0 >= FT)
  dcoFix([ur],upts,c.FT-.1,c.FT+1.7);chk.push({pts:upts,ylo:c.FT-.1,yhi:c.FT+1.7})}
 dcoFin(rooms);DCO.stat.sites++;DCO.hs.push({chk,x:c.cx,z:c.cz,lay:c.lay,bk:c.bk,up:!!c.up,bun:!!bun,n:rooms.reduce((a,r)=>a+r.it.length,0),rooms:rooms.map(r=>({x:r.x,z:r.z,ux:r.ux,uz:r.uz,fx:r.fx,fz:r.fz,hu:r.hu,hv:r.hv,y:r.y,ko:r.ko.length,n:r.it.length,keys:r.it.map(q=>q.key)}))});DCO.on=1;DCO.dirty=1}
DCO.house=decoHouse;

// ================= VILLE : appartements, bureaux, hôtels, commerces, restaurants =================
// Un étage de bâtiment (city.js, générateur bld) : chaque logement (une pièce par côté du couloir) ou chaque plateau ouvert est un local avec ses zones interdites.
// u = axe du bâtiment, v = vers le couloir (porte) ; le mur du fond (b) porte les fenêtres.
const LAYC={
 0:LAYF[0],1:LAYF[2],2:LAYF[1],
 // 3 bureau
 3:r=>{const d1=r.auto('desk',['b','l','r'],['c','lo','hi'],{rs:1}),d2=r.auto('desk_m',['f','r','l','b'],['c','lo','hi'],{rs:1});[d1,d2].forEach((d,i)=>{if(!d)return;r.front(d,'ochair',{gap:-.2});r.on(d,'laptop',{u:-.3});if(i==0)r.on(d,'desklamp',{u:.5})});
  r.auto('bookcase2',['l','r','b','f'],['lo','hi','c'],{rs:1});r.auto('bookcase',['r','l','b','f'],['hi','lo','c'],{rs:1});r.auto('locker',['l','r','f','b'],['hi','lo','c'],{rs:1});r.auto('chalkboard',['f','l','r','b'],['c','lo','hi'],{rs:1});r.auto('frame',['l','r','b','f'],['c','lo','hi'],{deco:1,y:1.5,rs:1});r.auto('bin',['f','r','l'],['hi','lo'],{rs:1})},
 // 4 chambre d'hôtel
 4:r=>{const bed=r.auto('bed_double',['b','l','r'],['c','lo','hi'],{rs:1,tint:dcoFab(r)});if(bed){const n=r.beside(bed,'nightstand',1);const n2=r.beside(bed,'nightstand',-1);if(n)r.on(n,'desklamp');if(n2)r.on(n2,'oillamp')}
  const sb=r.auto('sideboard',['f','l','r'],['c','lo','hi'],{rs:1});if(sb)r.on(sb,'tv');r.auto('wardrobe',['l','r','f','b'],['hi','lo','c'],{rs:1});r.auto('armchair',['l','r','f','b'],['lo','hi','c'],{rs:1,tint:dcoFab(r)});const ds=r.auto('desk',['r','l','f'],['c','hi','lo'],{rs:1});if(ds)r.front(ds,'chair',{gap:-.1});r.auto('frame',['b','f','l','r'],['c','lo','hi'],{deco:1,y:1.5,rs:1});r.auto('radiator',['b','l','r'],['lo','hi','c'],{deco:1,y:.25,rs:1})}
};
// plateau ouvert : r = demi-étage ; sides autorisés pour les murs réels : b, l, r (f = bord du couloir central, pas de mur)
const LAYO={
 off:r=>{const cols=Math.max(1,Math.floor((2*r.hu-1.2)/3.6)),x0=-r.hu+.9+((2*r.hu-1.2)-(cols-1)*3.6)/2;
  for(let c=0;c<cols;c++)for(let q=0;q<2;q++){const u=-r.hu+1.2+(c+.5)*(2*r.hu-2.4)/cols,v=-r.hv+1.6+q*2.6;if(r.hash(c*3+q)<.12)continue;const d=r.free(q?'desk':'desk_m',u,v,q?'b':'f',{});if(d){r.front(d,'ochair',{gap:-.22});if(r.hash(c+q*9)<.8)r.on(d,'laptop',{u:-.3});if(r.hash(c+q*5)<.4)r.on(d,'desklamp',{u:.5})}}
  for(let i=0;i<4;i++)r.auto(i%2?'bookcase2':'bookcase',['b','l','r'],['lo','hi','c',-2.5,2.5],{rs:1});r.auto('mshelf',['l','r','b'],['hi','lo'],{rs:1});r.auto('bin',['b','l','r'],['hi','lo'],{rs:1});r.auto('extinguisher',['l','r','b'],['c','hi','lo'],{deco:1,y:1.1,rs:1});r.auto('frame',['b','l','r'],['c','lo','hi'],{deco:1,y:1.6,rs:1})},
 shop:r=>{const L=2*r.hu,cols=Math.max(1,Math.floor((L-1.2)/2.6));
  for(let c=0;c<cols;c++)for(let q=0;q<2;q++){const u=-r.hu+.6+(c+.5)*(L-1.2)/cols,v=-r.hv+2.3+q*2.2;r.free('shopshelf',u,v,q?'f':'b',{})}
  r.auto('whshelf',['b','l','r'],['lo','hi','c',-2,2],{rs:1});r.auto('whshelf',['b','r','l'],['hi','lo'],{rs:1});r.auto('mshelf',['b','l','r'],['c',-3.5,3.5],{rs:1});
  const cn=r.auto('sideboard',['r','l'],['lo','hi'],{rs:1});if(cn){r.on(cn,'register');const c2=r.beside(cn,'sideboard',1)||r.beside(cn,'sideboard',-1)}
  for(let i=0;i<3;i++)r.free('crate',-r.hu+1+i*1.1,r.hv-1.2,'f',{});r.auto('bin',['l','r'],['hi','lo'],{rs:1});r.auto('extinguisher',['l','r','b'],['c','hi','lo'],{deco:1,y:1.1,rs:1})},
 resto:r=>{const cols=Math.max(1,Math.floor((2*r.hu-6)/3.4)),L=2*r.hu-6;
  for(let c=0;c<cols;c++)for(let q=0;q<2;q++){const u=-r.hu+4.6+(c+.5)*L/cols,v=-r.hv+2.2+q*2.4;if(r.hash(c*2+q)<.1)continue;const rt=r.hash(c*5+q*3)<.5?r.free('roundtable',u,v,'f',{}):r.free('dtable',u,v,'f',{});if(rt)dcoChairs(r,rt,'chair',rt.key==='dtable'?6:3)}
  const cn=r.auto('counter',['l','r','b'],['lo','hi'],{rs:1});if(cn){const f=r.beside(cn,'fridge',1)||r.beside(cn,'fridge',-1),st=r.beside(cn,'stove',f&&(f.cu>cn.cu||f.cv>cn.cv)?-1:1)||r.beside(cn,'stove',-1);if(st)r.beside(st,'counter',f&&(f.cu>cn.cu||f.cv>cn.cv)?-1:1)}
  for(let i=0;i<4;i++)r.free('stool',-r.hu+1.4+i*.8,r.hv-.9,'f',{});r.auto('sideboard',['b','r','l'],['c','hi','lo'],{rs:1});r.auto('bin_g',['l','r'],['hi','lo'],{rs:1});r.auto('clock',['b','l','r'],['c','lo','hi'],{deco:1,y:2.1,rs:1});r.auto('frame',['b','l','r'],['hi','lo','c'],{deco:1,y:1.6,rs:1})},
 hotel:r=>LAYO.resto(r)
};
function dcoCity(c){const{X,uw,cv,Hv,Lu,t,n,bw,cw,SL,k,yb,ty,open,com,g0,lob,fvs,la,lb,H}=c,vf=Hv-t,Wc=(u,v)=>{const a=uw(u);return X?[a,cv+v]:[cv+v,a]},o0=Wc(0,0),sd=Math.round(o0[0]*3)+Math.round(o0[1]*5)*7+k*101,rooms=[];
 const mk=(u0,u1,v0,v1,seed)=>{const uc=(u0+u1)/2,vm=(v0+v1)/2,a=Wc(uc,vm),b=Wc(uc+1,vm),vs=v1>v0?1:-1,cc=Wc(uc,vm-vs),W_=n=>n,ct=a;
  // l'axe v local pointe vers le couloir (v construit décroissant pour s>0)
  const sg=Math.sign(vm)||1,toC=Wc(uc,vm-sg);
  return dcoRoom({x:a[0],z:a[1],ux:b[0]-a[0],uz:b[1]-a[1],fx:toC[0]-a[0],fz:toC[1]-a[1],hu:(u1-u0)/2,hv:Math.abs(v1-v0)/2,y:yb,H,seed:seed,uc,vm,sg})};
 const WIN=(r,wall,cs,hw)=>cs.forEach(q=>{if(wall==='b')r.ko.push({u0:q-hw,u1:q+hw,v0:-r.hv-.2,v1:-r.hv+.55,y0:.8,y1:2.7});else if(wall==='l')r.ko.push({u0:-r.hu-.2,u1:-r.hu+.55,v0:q-hw,v1:q+hw,y0:.8,y1:2.7});else if(wall==='r')r.ko.push({u0:r.hu-.55,u1:r.hu+.2,v0:q-hw,v1:q+hw,y0:.8,y1:2.7})});
 if(!open){
  for(let i=0;i<n;i++){const ua=t+i*bw+(i?.12:.1),ub=t+(i+1)*bw-(i<n-1?.12:.1),uc=(ua+ub)/2;if(g0&&lob&&uc>la&&uc<lb)continue;
   for(const s of[-1,1]){const kind=ty==='off'?3:ty==='hotel'?4:(i+k+(s>0?1:0))%3,v0=s*(cw+.12),v1=s*vf,r=mk(ua,ub,v0,v1,sd+i*17+(s>0?5:0)),ucc=r.uc,dc=(i===0?t+SL+.85:t+i*bw+bw/2)-ucc;
    // porte sur le couloir, fenêtres du mur extérieur (.27 et .73 de la travée), pignons aux extrémités
    r.ko.push({u0:dc-.95,u1:dc+.95,v0:r.hv-1.5,v1:r.hv+.2,y0:0,y1:2.5});WIN(r,'b',[t+i*bw+bw*.27-ucc,t+i*bw+bw*.73-ucc],(ty==='off'?1.2:.8)+.15);if(i===0)WIN(r,'l',[0],1.0);if(i===n-1)WIN(r,'r',[0],1.0);
    LAYC[kind](r);const pt=(u,v)=>r.W(u,v),pp=[pt(dc,r.hv+1.2),pt(dc,r.hv-1.6),pt(-r.hu+1,0),pt(r.hu-1,0),pt(0,-r.hv+1)];dcoFix([r],pp,yb-.1,yb+1.7);r.cpts=pp;r.cy0=yb-.1;r.cy1=yb+1.7;rooms.push(r)}}}
 else{
  // plateau ouvert : un demi-étage par côté, couloir central de 2,4 m libre
  const u0=t+SL+.5,u1=Lu-t-.15;
  for(const s of[-1,1]){const v0=s*1.2,v1=s*vf,r=mk(u0,u1,v0,v1,sd+(s>0?5:0)),ucc=r.uc;
   // fenêtres le long du mur extérieur (une par travée à .27 et .73 ; vitrines plus larges au rez-de-chaussée des commerces)
   const ws=[];for(let i=0;i<n;i++)[.27,.73].forEach(q=>ws.push(t+i*bw+bw*q-ucc));WIN(r,'b',ws,(com&&g0?Math.min(bw*.4,3.4)/2:ty==='off'?1.2:.8)+.15);
   WIN(r,'r',[0],1.5);
   // entrée du rez-de-chaussée : face longue (lob) au milieu, sinon pignon (v=0 du côté u=Lu)
   if(g0){if(lob){if(s===fvs)r.ko.push({u0:Lu/2-ucc-1.9,u1:Lu/2-ucc+1.9,v0:-r.hv-.2,v1:-r.hv+3,y0:0,y1:3});else r.ko.push({u0:Lu/2-ucc-1.2,u1:Lu/2-ucc+1.2,v0:-r.hv-.2,v1:-r.hv+2,y0:0,y1:3})}else r.ko.push({u0:r.hu-3,u1:r.hu+.2,v0:-1.9+(r.sg>0?-0:0),v1:1.9,y0:0,y1:3})}
   // côté couloir : pas de mur (f) : une bande interdite pour ne pas boucher le couloir
   r.ko.push({u0:-r.hu-.2,u1:r.hu+.2,v0:r.hv-.05,v1:r.hv+.2,y0:0,y1:3});
   (LAYO[ty]||LAYO.off)(r);const pt=(u,v)=>r.W(u,v),pp=[pt(-r.hu+.7,r.hv-.3),pt(r.hu-.7,r.hv-.3),pt(0,-r.hv+1.3),pt(-r.hu+1.2,0),pt(r.hu-1.2,0)];dcoFix([r],pp,yb-.1,yb+1.7);r.cpts=pp;r.cy0=yb-.1;r.cy1=yb+1.7;rooms.push(r)}}
 rooms.forEach(r=>{if(DCO.chk)DCO.chk.push({pts:r.cpts,ylo:r.cy0,yhi:r.cy1})});dcoFin(rooms);DCO.stat.sites++;DCO.city.n=(DCO.city.n||0)+rooms.reduce((a,r)=>a+r.it.length,0);DCO.on=1;DCO.dirty=1}
DCO.city=dcoCity;

// retour arrière (tests) : retire les meubles, boîtes et rayons ajoutés après snap
DCO.snap=()=>({n:DCO.items.length,b:boxes.length,st:Object.assign({},DCO.stat),hs:DCO.hs.length,ck:DCO.chk.length,cn:DCO.city.n||0,rp:Object.keys(DCO.rp).map(k=>[k,DCO.rp[k].n])});
DCO.rollback=sn=>{const rm=new Set(DCO.items.splice(sn.n));DCO.cells.forEach((a,k)=>{const b=a.filter(q=>!rm.has(q));if(b.length!==a.length){if(b.length)DCO.cells.set(k,b);else DCO.cells.delete(k)}});
 const del=new Set(boxes.splice(sn.b).filter(b=>b.deco));boxes.length=Math.min(boxes.length,sn.b);for(const k in DCO.rp){const o=DCO.rp[k];o.cells.forEach((a,c)=>{const b=a.filter(q=>!del.has(q));if(b.length)o.cells.set(c,b);else o.cells.delete(c)});o.n=Object.values(Object.fromEntries([...o.cells].map(([c,a])=>[c,a]))).reduce((m,a)=>m,0);const e=sn.rp.find(q=>q[0]===k);o.n=e?e[1]:0}
 Object.assign(DCO.stat,sn.st);DCO.hs.length=sn.hs;DCO.chk.length=sn.ck;DCO.city.n=sn.cn;DCO.dirty=1};

// ================= TESTS (appelés par selftest.js) =================
const DCO_REAL={ // [min,max] en mètres : h = hauteur, w = largeur, d = profondeur, L = plus grande dimension horizontale
 desk:{h:[.7,.82]},desk_m:{h:[.74,.96]},dtable:{h:[.72,.92]},table:{h:[.72,.85]},roundtable:{h:[.7,.8]},workbench:{h:[.8,1.15]},coffee:{h:[.3,.5]},
 bed_single:{L:[1.9,2.1],w:[.85,1.1]},bed_double:{L:[1.9,2.2]},bunk:{L:[1.9,2.1],h:[1.6,1.9]},daybed:{w:[1.8,2.1]},nightstand:{h:[.4,.6]},
 fridge:{h:[1.5,2.0]},stove:{h:[.85,.95]},counter:{h:[.85,.95],w:[1.2,1.7]},sideboard:{h:[.7,.9]},
 chair:{h:[.8,1.0]},ochair:{h:[.85,1.05]},stool:{h:[.55,.7]},wardrobe:{h:[1.85,2.1]},dresser:{h:[.95,1.2]},bookcase:{h:[1.7,2.1]},bookcase2:{h:[1.85,2.1]},
 sofa:{w:[1.8,2.2]},sofa2:{w:[1.7,2.0]},armchair:{h:[.9,1.1],w:[.9,1.2]},bath:{w:[1.4,1.8]},wc:{h:[.7,.9]},basin:{h:[.75,.95]},locker:{h:[1.7,2.0]},mshelf:{h:[1.6,2.0]},whshelf:{h:[1.8,2.1]},rack:{h:[1.7,2.0]},
 extinguisher:{h:[.45,.7]},laptop:{w:[.28,.38]},tv:{w:[.45,.7]},mcrate:{L:[.8,1.2]},fireplace:{w:[1.0,1.6]},lamp_floor:{h:[1.4,1.8]},bin:{h:[.9,1.15]}};
const dcoAABB=it=>{const m=DCO.dm(DCO.keys[it.m]),c=Math.cos(it.yaw),s=Math.sin(it.yaw),hw=m.w/2,hd=m.d/2,dx=Math.abs(c)*hw+Math.abs(s)*hd,dz=Math.abs(s)*hw+Math.abs(c)*hd;
 // origine : au sol (centrée) ; « mur » : dos à l'origine (le modèle s'étend vers l'avant)
 let cx=it.x,cz=it.z;if(m.o==='wall'){cx+=s*hd;cz+=c*hd}return{x0:cx-dx,x1:cx+dx,z0:cz-dz,z1:cz+dz,y0:m.o==='top'?it.y-m.h:it.y,y1:m.o==='top'?it.y:it.y+m.h}};
DCO.aabb=dcoAABB;
DCO.tests=function(T){
 T('Mobilier v64 : chaque pièce de maison / bunker contient les meubles de son type (chambre, cuisine, salon, atelier, poste, radio, armurerie, cantine, opérations, sdb, cellier, bureau, repos, dortoir, réserve, infirmerie)',()=>{
  const FR={0:['bed_single','bed_double'],1:['fridge','counter','stove'],2:['sofa','sofa2'],3:['workbench','mshelf'],4:['locker'],5:['desk_m'],6:['rack'],7:['dtable','table','roundtable'],8:['desk_m','chalkboard'],9:['locker']},
   BK={0:['wc','bath','basin'],1:['whshelf','mshelf','shopshelf'],2:['desk','bookcase','bookcase2'],3:['bed_single','bunk','locker'],4:['bunk'],5:['whshelf','mshelf'],6:['bed_single','medkit'],7:['mshelf','rack']};
  const bad=[],seen={},nobed=[];
  for(const h of DCO.hs){if(!h.rooms[0])continue;const kf=h.rooms[0].keys,kb=h.rooms[1].keys,lay=h.up?null:h.lay;
   if(lay!==null){const want=FR[lay];if(want&&!want.some(k=>kf.includes(k)))bad.push('maison '+h.x.toFixed(0)+','+h.z.toFixed(0)+' avant '+lay+' sans '+want[0]);seen['F'+lay]=1}
   else{if(!(kf.includes('desk_m')||kf.includes('locker')||kf.includes('chalkboard')))bad.push('maison à étage '+h.x.toFixed(0)+','+h.z.toFixed(0)+' : poste sans bureau/casier');seen['U']=1}
   const wb=h.bun?null:BK[h.bk];if(wb&&!wb.some(k=>kb.includes(k)))bad.push('maison '+h.x.toFixed(0)+','+h.z.toFixed(0)+' arrière '+h.bk+' sans '+wb[0]);seen['B'+h.bk]=1;
   if(!h.bun&&(kf.length<4||kb.length<3))bad.push('pièce presque vide '+h.x.toFixed(0)+','+h.z.toFixed(0)+' ('+kf.length+'/'+kb.length+')');
   if(h.up&&h.rooms[2]&&!h.rooms[2].keys.some(k=>/^bed|bunk|daybed/.test(k)))nobed.push(h.x.toFixed(0)+','+h.z.toFixed(0))}
  if(nobed.length>Math.max(3,DCO.hs.filter(h=>h.up).length*.1))bad.push('étage sans lit '+nobed.join(' ; '));
  if(!DCO.hs.length)return'aucune maison meublée';if(!seen.F0||!seen.F1||!seen.F2||!seen.F3||!seen.U)return'types de pièces avant manquants : '+Object.keys(seen).join(',');
  return bad.length?bad.length+' : '+bad.slice(0,4).join(' ; '):''});
 T('Mobilier v64 : échelle réelle en mètres (table 0,75 m, lit 2 m, frigo 1,8 m, chaise 0,9 m...) pour chaque modèle posé',()=>{const bad=[];const used=new Set(DCO.items.map(q=>q.q));
  for(const k of used){const r=DCO_REAL[k];if(!r)continue;const m=DCO.dm(k);const v={h:m.h,w:m.w,d:m.d,L:Math.max(m.w,m.d)};for(const a in r){if(v[a]<r[a][0]-1e-3||v[a]>r[a][1]+1e-3)bad.push(k+' '+a+'='+v[a].toFixed(2)+' hors '+r[a].join('–'))}}
  return bad.length?bad.join(' ; '):''});
 T('Mobilier v64 : aucun meuble sur une porte (zone de battement), un escalier ni devant une fenêtre (sauf sous l’appui)',()=>{const bad=[];const dbx=doors.map(d=>d.box).filter(Boolean),stairs=boxes.filter(b=>b.stair),gl=GLASS.map(g=>g.userData.glass&&g.userData.glass.nv?Object.assign({h:g.userData.glass.h},g.userData.glass.nv):null).filter(Boolean);
  const bb=it=>dcoAABB(it);let n=0;
  for(const it of DCO.items){const a=bb(it),nm=it.q;n++;
   for(const b of dbx){if(a.y0>2.5)continue;if(a.x1>b.x0-.5&&a.x0<b.x1+.5&&a.z1>b.z0-.5&&a.z0<b.z1+.5&&!(nm==='extinguisher'||nm==='clock'||nm==='frame'||nm==='mirror'||nm==='medkit'||nm==='radiator')&&(a.y1>.05)){bad.push(nm+' sur une porte '+it.x.toFixed(1)+','+it.z.toFixed(1));break}}
   for(const b of stairs){if(a.x1>b.x0&&a.x0<b.x1&&a.z1>b.z0&&a.z0<b.z1&&a.y1>b.y0&&a.y0<b.y1+1.7){bad.push(nm+' dans un escalier '+it.x.toFixed(1)+','+it.z.toFixed(1));break}}
   for(const g of gl){const ax=g.ax==='x',pl=g.f,al=g.c,hw=g.w/2;const u0=ax?a.x0:a.z0,u1=ax?a.x1:a.z1,v0=ax?a.z0:a.x0,v1=ax?a.z1:a.x1;if(u1>al-hw&&u0<al+hw&&v1>pl-.35&&v0<pl+.35&&a.y1>g.y+.03&&a.y0<g.y+g.h){bad.push(nm+' devant une fenêtre '+it.x.toFixed(1)+','+it.z.toFixed(1));break}}
   if(bad.length>5)break}
  return bad.length?bad.length+' : '+bad.slice(0,4).join(' ; '):''});
 T('Mobilier v64 : passages libres (porte d’entrée, porte intérieure, escalier, étage) reliés dans la grille de navigation de l’IA',()=>{const bad=[];const nd=boxes.filter(b=>!b.deco);let n=0;
  for(const h of DCO.hs.concat(DCO.chk.map(c=>({chk:[c],x:0,z:0})))){for(const c of(h.chk||[])){if(!c.pts)continue;n++;
   const dd=boxes.filter(b=>{for(const p of c.pts)if(Math.abs(b.x0-p[0])<12&&Math.abs(b.z0-p[1])<12)return true;return false});
   const bw=DCO.conn(dd,[],c.pts,c.ylo,c.yhi),bn=DCO.conn(dd.filter(b=>!b.deco),[],c.pts,c.ylo,c.yhi);const nw=bw.filter(i=>!bn.includes(i));if(nw.length)bad.push((h.x||0).toFixed(0)+','+(h.z||0).toFixed(0)+' points '+nw.join('/'))}}
  return bad.length?bad.length+' locaux bloqués : '+bad.slice(0,4).join(' ; '):(n?'':'aucune vérification')});
 T('Mobilier v64 : collisions (boîte joueur/bots/navigation, balle arrêtée avec matériau, couvert)',()=>{const L=DCO.items.filter(q=>q.col&&q.q==='fridge'||q.col&&q.q==='wardrobe'||q.col&&q.q==='locker'||q.col&&q.q==='sofa2');if(!L.length)return'aucun gros meuble';let ok=0,msg='';
  for(const it of L.slice(0,12)){const a=dcoAABB(it),bx=boxes.find(b=>b.deco===it.q&&Math.abs((b.x0+b.x1)/2-(a.x0+a.x1)/2)<.1&&Math.abs((b.z0+b.z1)/2-(a.z0+a.z1)/2)<.1);if(!bx){msg='pas de boîte pour '+it.q;break}
   if(bx.y0>1.7)continue;if(bx.y0<-.01||bx.y1<a.y1-.1||bx.y1>a.y1+.05){msg='hauteur de boîte '+it.q;break}
   const cx=(bx.x0+bx.x1)/2,cz=(bx.z0+bx.z1)/2,k=nIdx(cx,cz);if(k>=0&&!NAVB[k]){msg='cellule de navigation libre sous '+it.q;break}
   // tir : depuis 0,7 m du bord vers le centre
   let hit=null;for(const dd of[[1,0],[-1,0],[0,1],[0,-1]]){const hw=(bx.x1-bx.x0)/2,hd=(bx.z1-bx.z0)/2,ox=cx-dd[0]*(hw+.7),oz=cz-dd[1]*(hd+.7);RC.set(new THREE.Vector3(ox,bx.y0+(bx.y1-bx.y0)*.5,oz),new THREE.Vector3(dd[0],0,dd[1]));RC.far=hw*Math.abs(dd[0])+hd*Math.abs(dd[1])+.7;const hs=RC.intersectObjects(solids);if(hs[0]&&hs[0].object.userData.deco){hit=hs[0];break}}
   if(!hit)continue;if(!hit.object.userData.bmat||!hit.face||!hit.face.normal)return'impact sans matériau';const mt=balMatOf(hit.object);if(!mt||!mt.t)return'matériau de balle inconnu';ok++}
  return msg||(ok<3?'tir : '+ok+' meubles seulement touchés par un rayon':'')});
 T('Mobilier v64 : affichage à la demande (rien de construit loin des bâtiments, InstancedMesh par type, appels de rendu << meubles)',()=>{const px=P.x,pz=P.z;try{
  // point éloigné de tout meuble
  let far=null;for(let k=0;k<300&&!far;k++){const x=-MH+20+(k*137%1000)/1000*(2*MH-40),z=-MH+20+(k*61%977)/977*(2*MH-40);let ok=true;for(const it of DCO.items){if(Math.abs(it.x-x)<DCO.R+20&&Math.abs(it.z-z)<DCO.R+20){ok=false;break}}if(ok)far=[x,z]}
  if(far){DCO.upd(far[0],far[1]);if(DCO.stat.shown!==0)return'meubles affichés loin de tout bâtiment : '+DCO.stat.shown;const vis=DCO.mods.filter(m=>m&&m.ims.some(i=>i.visible));if(vis.length)return vis.length+' types encore visibles loin des bâtiments'}
  // près d'un bâtiment : meubles du bâtiment affichés, mais pas ceux d'un bâtiment à plus de DCO.R
  const h=DCO.hs[0];DCO.upd(h.x,h.z);const st=DCO.stat;if(st.shown<8)return'trop peu de meubles affichés près d’une maison : '+st.shown;
  const farOnes=DCO.items.filter(q=>Math.hypot(q.x-h.x,q.z-h.z)>DCO.R+2).length,near=DCO.items.filter(q=>Math.hypot(q.x-h.x,q.z-h.z)<=DCO.R).length;if(st.shown!==near)return'affichés '+st.shown+' ≠ proches '+near;
  if(st.draws>=st.shown)return'un appel de rendu par meuble ('+st.draws+' / '+st.shown+')';
  const m=DCO.mods.find(q=>q&&q.n>1);if(!m)return'aucun type instancié plusieurs fois';if(m.ims[0].count!==m.n||!m.ims[0].isInstancedMesh)return'InstancedMesh incohérent';
  if(!DCO.mods.every(q=>!q||q.ims.every(i=>!i.castShadow)))return'ombres projetées par le mobilier instancié';return''}finally{DCO.upd(px,pz)}});
 T('Mobilier v64 : placement déterministe (hachage de position, aucun Math.random) : même local, mêmes meubles',()=>{const mk=()=>{const r=DCO.room({x:5000,z:5000,ux:1,uz:0,fx:0,fz:1,hu:3.35,hv:2.85,y:0,H:2.8,seed:77});r.ko.push({u0:-.95,u1:.95,v0:1.4,v1:3,y0:0,y1:2.5});DCO.lay.F[2](r);DCO.lay.F[1](r);return r.it.map(q=>q.key+':'+q.cu.toFixed(3)+','+q.cv.toFixed(3)+q.face).join('|')};
  const rnd=Math.random;let a,b;try{Math.random=()=>{throw new Error('Math.random utilisé')};a=mk();b=mk()}finally{Math.random=rnd}return a&&a===b&&a.split('|').length>6?'':'placements différents ou trop peu de meubles ('+(a?a.split('|').length:0)+')'});
 T('Mobilier v64 : ville (appartements, bureaux, hôtel, commerces, restaurants) : meubles posés, boîtes, aucun meuble dans une zone interdite, passage jusqu’au couloir',()=>{const sn=DCO.snap();try{
  const mkc=(ty,open,k)=>({X:true,uw:u=>650+u,cv:700,Hv:9,Lu:44,t:.35,n:5,bw:(44-.7)/5,cw:1.5,SL:5.2,k,yb:k*3.4,ty,open,com:ty==='shop'||ty==='resto',g0:k===0,lob:true,fvs:1,la:15,lb:24,H:3.4});
  const res={};for(const [ty,open] of[['apt',false],['hotel',false],['off',false],['off',true],['shop',true],['resto',true]]){const n0=DCO.items.length,b0=boxes.length;DCO.city(mkc(ty,open,1+(open?0:0)));res[ty+(open?'*':'')]=[DCO.items.length-n0,boxes.length-b0]}
  const bad=Object.entries(res).filter(([k,v])=>v[0]<6||v[1]<3).map(([k,v])=>k+' '+v.join('/'));return bad.length?'trop peu de meubles : '+bad.join(' ; '):''}finally{DCO.rollback(sn)}});
};
