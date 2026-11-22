// ================= MATÉRIAUX & TEXTURES PROCÉDURALES (v3) =================
const TEX_T0=performance.now();
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
// bruit basse fréquence calculé à résolution réduite puis interpolé (3 à 4 fois moins cher pour les champs lisses)
function fbmS(sz,cx,cy,oct,seed,res){res=res||128;const s=fbm(res,cx,cy,oct,seed),o=new Float32Array(sz*sz),k=res/sz;for(let y=0;y<sz;y++){const fy=y*k,iy=fy|0,ty=fy-iy,y0=iy*res,y1=((iy+1)%res)*res;for(let x=0;x<sz;x++){const fx=x*k,ix=fx|0,tx=fx-ix,x1=(ix+1)%res;o[y*sz+x]=(s[y0+ix]*(1-tx)+s[y0+x1]*tx)*(1-ty)+(s[y1+ix]*(1-tx)+s[y1+x1]*tx)*ty}}return o}
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
// --- calage sur photos de référence (ambientCG, CC0 ; voir docs/CREDITS_ASSETS.md). Analyse hors jeu (tools/tex_photo_stats.py) : table de quantiles couleur PHL (19 noeuds RGB par matériau) et amplitudes spectrales SPA du grain.
// Aucune image n'est embarquée : le jeu synthétise un champ procédural, le classe par rang puis le colorie avec la rampe de couleur de la photo (histogramme identique).
const PHQ=[0, 0.01, 0.03, 0.06, 0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.85, 0.9, 0.94, 0.97, 0.99, 1],PHL={plas:[169,164,161,179,175,172,189,185,182,195,191,188,199,196,193,203,200,196,206,202,199,210,206,203,213,209,206,216,212,209,218,215,212,221,218,215,225,221,218,227,224,221,230,227,224,233,230,227,238,235,232,244,242,239,250,248,246],plas2:[205,200,197,207,202,199,208,204,201,209,205,202,210,206,203,211,207,204,212,207,204,213,209,205,214,210,206,215,211,207,216,212,209,217,214,210,218,215,211,219,216,212,220,217,213,222,218,215,223,219,216,225,222,218,227,224,220],brick:[64,46,37,74,50,38,84,55,41,90,58,43,95,61,45,100,65,47,105,68,50,113,76,56,121,86,66,130,103,82,144,116,93,154,129,105,163,144,117,168,153,124,173,161,131,179,168,137,185,174,142,193,183,151,202,193,162],conc:[117,115,115,128,127,128,135,135,137,138,139,141,140,141,144,143,144,146,144,146,148,147,149,152,150,152,155,153,155,157,156,157,160,159,160,163,162,164,167,165,167,170,168,169,172,171,173,176,174,176,179,179,182,185,183,186,190],slab:[160,160,160,168,168,168,174,174,174,176,176,176,178,178,178,179,179,179,180,180,180,182,182,182,183,183,183,185,185,185,186,186,186,187,187,187,188,188,188,189,189,189,191,191,191,192,192,192,194,194,194,196,196,196,199,199,199],tile:[117,100,97,142,128,124,169,157,150,186,175,166,194,184,175,199,189,181,202,193,184,206,198,189,210,201,193,213,205,197,216,208,200,219,211,204,223,215,208,225,218,210,228,221,213,231,224,217,234,228,220,238,232,225,243,237,230],floor:[80,41,2,87,47,4,93,53,6,96,55,8,99,57,10,101,59,12,102,61,13,105,63,16,107,65,18,109,67,19,110,69,22,112,71,23,114,73,26,116,75,27,117,76,29,119,78,30,121,80,32,124,83,35,127,85,37],wood:[32,27,23,42,35,29,53,43,34,60,47,36,65,50,38,69,52,39,71,54,40,75,57,42,78,59,44,80,61,46,83,64,47,86,67,50,90,70,52,92,72,53,95,74,55,98,76,57,101,79,59,105,84,64,109,91,71],door:[61,57,47,68,61,52,74,65,57,77,68,59,79,70,61,81,71,62,82,73,64,85,75,66,87,77,68,89,79,70,91,81,72,93,83,74,96,85,75,97,86,77,99,88,78,101,90,80,104,93,83,109,97,86,115,102,90],roof:[116,69,47,122,74,51,129,78,55,132,81,58,135,83,60,137,85,61,138,87,63,140,88,64,142,90,66,143,92,68,145,93,69,146,95,71,149,96,72,150,98,73,152,99,75,153,101,76,155,103,78,158,105,81,161,108,84],stone:[75,67,58,84,77,67,94,87,76,100,93,81,105,98,86,109,102,90,113,106,94,119,112,100,125,118,106,130,123,112,135,129,117,141,134,123,146,139,128,149,142,132,152,146,136,155,150,140,159,154,144,165,160,150,170,165,156]};
const SPA={plas:[5.5,0,0,3.9,4,0,0,37.5,32.8],plas2:[19.6,0,6.5,6.9,5.1,2.7,0,8.1,7.2],conc:[0,17.1,35.6,0,14.4,16.6,14.5,18.4,8.6],slab:[0,0,5.7,10.1,8,9.4,5.4,12.5,8.1],door:[11.7,0,15.9,12.6,11,11,0,18.6,10],tile:[31.8,0,0,38.4,30.3,25.1,19.9,47.2,20.2],roof:[0,6.1,8.4,11.7,8.2,13.9,12.1,14.2,4.3]};
// somme d'octaves de bruit de valeur (cellules 2,4,..,512 par bande) pondérée par A ; ax/ay étirent la grille (fibres du bois)
function spec(sz,A,seed,ax,ay){ax=ax||1;ay=ay||ax;const o=new Float32Array(sz*sz);for(let k=0;k<A.length;k++){if(!A[k])continue;const c=2<<k,n=vnoise(sz,Math.min(sz,(c*ax)|0)||1,Math.min(sz,(c*ay)|0)||1,seed+k*37),a=A[k];for(let i=0;i<o.length;i++)o[i]+=(n[i]-.5)*a}return o}
// rang quantile (0..1) de chaque valeur du champ
function qrank(v){const n=v.length,B=1024,h=new Uint32Array(B+1),cf=new Float32Array(B+1),q=new Float32Array(n);let lo=1e9,hi=-1e9;for(let i=0;i<n;i++){const a=v[i];if(a<lo)lo=a;if(a>hi)hi=a}const s=(B-1)/(hi-lo+1e-9);for(let i=0;i<n;i++)h[((v[i]-lo)*s)|0]++;let c=0;for(let b=0;b<=B;b++){cf[b]=c;c+=h[b]}for(let i=0;i<n;i++){const f=(v[i]-lo)*s,b=f|0;q[i]=(cf[b]+h[b]*(f-b))/n}return q}
const LC=[0,0,0];
function lutc(L,q){let j=1;while(j<18&&PHQ[j]<q)j++;const t=(q-PHQ[j-1])/(PHQ[j]-PHQ[j-1]),a=j*3-3,b=j*3;LC[0]=L[a]+(L[b]-L[a])*t;LC[1]=L[a+1]+(L[b+1]-L[a+1])*t;LC[2]=L[a+2]+(L[b+2]-L[a+2])*t}
function cracks(x,sz,n,col){x.strokeStyle=col;x.lineWidth=.9;for(let k=0;k<n;k++){let px=rnd(30,sz-30),py=rnd(30,sz-140),a=rnd(1,2.1);const st=rnd(8,22)|0;x.beginPath();x.moveTo(px,py);for(let s=0;s<st;s++){a+=rnd(-.6,.6);px+=Math.cos(a)*rnd(4,9);py+=Math.sin(a)*rnd(4,9);if(px<4||px>sz-4||py>sz-4||py<4)break;x.lineTo(px,py)}x.stroke()}}
// --- béton banché (panneaux de coffrage 2 m x 1 m, trous de serrage), calé sur la photo de béton brut ; gain 1,36 car la teinte du mur multiplie la texture
const T_conc=ptex(512,(d,H,sz)=>{const sp=spec(sz,SPA.conc,11),q=qrank(sp),a=fbm(sz,3,3,3,11),b=fbm(sz,64,64,2,5),c=fbm(sz,32,2,3,9),L=PHL.conc,holes=[];
for(let j=0;j<2;j++)for(const hx of [128,384])for(const hy of [70,186])holes.push([(hx+j*256)%512,j*256+hy]);
for(let y=0;y<sz;y++)for(let X=0;X<sz;X++){const i=y*sz+X;lutc(L,q[i]);let v=1.36*(.96+.06*hsh(((X+(y<256?0:256))%512)>>8,y>>8))*(.97+(a[i]-.5)*.1),h=.5+sp[i]*.01+(b[i]-.5)*.12,rr=1,gg=1,bb=1;
const ry=y%256,sx=(X+(y<256?0:256))%512;
if(ry<3||sx<3){v*=.6;h-=.5}else if(ry<5||sx<5)v*=1.05;
for(const q of holes){const dx=X-q[0],dy=y-q[1],r=dx*dx+dy*dy;if(r<64){const k=1-r/64;v*=1-.6*k;h-=.7*k}if(dy>0&&dy<90&&Math.abs(dx)<4+c[i]*4){const k=(1-dy/90)*(1-Math.abs(dx)/8);if(k>0){v*=1-.1*k;rr*=1+.05*k;bb*=1-.14*k;gg*=1-.05*k}}}
v*=1+c01((b[i]-.6)*6)*c01((a[i]-.5)*3)*.14;
P4(d,i,LC[0]*v*rr,LC[1]*v*gg,LC[2]*v*bb);H[i]=h}},
(x,sz)=>{for(let i=0;i<300;i++){x.fillStyle='rgba(40,40,38,'+rnd(.12,.3)+')';x.beginPath();x.arc(rnd(2,sz-2),rnd(2,sz-2),rnd(.5,1.4),0,6.3);x.fill()}
for(let i=0;i<9;i++){const px=rnd(10,sz-10),w=rnd(3,9),y0=rnd(5,sz*.5),h=rnd(60,200),g=x.createLinearGradient(0,y0,0,y0+h);g.addColorStop(0,'rgba(50,46,40,0)');g.addColorStop(.25,'rgba(50,46,40,.11)');g.addColorStop(1,'rgba(50,46,40,0)');x.fillStyle=g;x.fillRect(px,y0,w,h)}
cracks(x,sz,3,'rgba(40,38,35,.4)')},.9);
// --- briques (22,5 x 7 cm joint compris, appareil à demi-brique) : 10 x 32 rangées sur 2,25 m ; calé sur la photo Bricks097 (terre cuite 133/106/84, joints sableux)
const BRW=51.2;
function brickTex(seed){return ptex(512,(d,H,sz)=>{const sp=spec(sz,[0,0,3,6,10,12,12,10,7],seed),sm=spec(sz,[0,0,0,4,8,10,8,0,6],seed+9),wj=fbm(sz,40,40,2,seed+3),sk=fbmS(sz,36,2,3,seed+17,256),ef=fbmS(sz,8,8,3,seed+23),n=sz*sz,V=new Float32Array(n),M=new Uint8Array(n),T=new Float32Array(n),L=PHL.brick;
for(let y=0;y<sz;y++)for(let X=0;X<sz;X++){const i=y*sz+X,row=y>>4,ry=y&15,xo=(X+((row&1)?BRW/2:0))%512,bi=(xo/BRW)|0,bx=xo-bi*BRW,id=bi*7+row*13,hh=hsh(id,seed+row*5),h2=hsh(id*3+1,row*11+seed),w1=(wj[i]-.5)*2.4;
if(ry<2+w1*.7||bx<2.3+w1){V[i]=.86+sm[i]/200;M[i]=1;H[i]=.12+sm[i]/700}
else{const e=Math.min(bx-2.3-w1,BRW-bx,ry-2-w1*.7,16-ry);let v=.05+.55*hh+sp[i]/255*2.6-.08*c01(1.8-e);if(h2>.92)v-=.1;else if(h2<.05)v+=.12;V[i]=v;T[i]=hsh(id*5+2,seed)-.5;H[i]=.55+.22*c01(e/2.2)+sp[i]/255*.6}}
const q=qrank(V);
for(let y=0;y<sz;y++)for(let X=0;X<sz;X++){const i=y*sz+X,vv=1-y/sz;lutc(L,q[i]);const dirt=1-.3*c01((.16-vv)/.16)-.14*c01((vv-.72)/.2)*c01((sk[i]-.42)*4),t=T[i];let r=LC[0]*dirt*(1+t*.16),g=LC[1]*dirt*(1+t*.02),b=LC[2]*dirt*(1-t*.14);
if(!M[i]){const w=c01((ef[i]-.64)*5)*c01((.4-vv)/.3)*.3;r+=(225-r)*w;g+=(222-g)*w;b+=(210-b)*w}
P4(d,i,r,g,b)}},(x,sz)=>cracks(x,sz,2,'rgba(30,24,20,.4)'),.85)}
// --- crépi : o.sp spectre du grain, o.l clé de photo, o.gn gain ; o.sc coulures, o.k relief, o.pat seuil des plaques tombées (briques apparentes), o.cr fissures, o.mo moisissure
function plasTex(seed,o){return ptex(512,(d,H,sz)=>{const sp=spec(sz,o.sp,seed),q=qrank(sp),a=fbmS(sz,4,4,4,seed),e=fbmS(sz,10,3,3,seed+27),st=fbmS(sz,o.sc,2,3,seed+41,256),pk=fbmS(sz,5,5,4,seed+53),sw=fbmS(sz,12,12,2,seed+67),mo=fbmS(sz,6,6,3,seed+79),L=PHL[o.l],G=o.gn;
for(let y=0;y<sz;y++)for(let X=0;X<sz;X++){const i=y*sz+X,vv=1-y/sz;lutc(L,q[i]);const am=.97+(a[i]-.5)*.1;let r=LC[0]*G*am,g=LC[1]*G*am,bl=LC[2]*G*am;
const dk=c01((.17+(e[i]-.5)*.22-vv)/.15);r*=1-.16*dk;g*=1-.18*dk;bl*=1-.22*dk;
const tk=c01((vv-.66)/.22)*c01((st[i]-.46)*4.5),rk=c01((st[i]-.58)*5)*.05;r*=1-.07*tk-rk;g*=1-.07*tk-rk;bl*=1-.06*tk-rk;
if(o.mo){const m=c01((mo[i]-.58)*4)*c01((.3-vv)/.3);r*=1-.16*m;g*=1-.05*m;bl*=1-.2*m}
let h=sp[i]*o.k+sw[i]*.22+a[i]*.1;
if(o.pat){const pt=c01((pk[i]+(.22-vv)*.6-o.pat)/.035);if(pt>0){const row=y>>4,xo=(X+((row&1)?BRW/2:0))%512,bx=xo%BRW,ry=y&15,hh=hsh((xo/BRW|0)+row*10,seed+7);let br,bg,bb,bh;
if(ry<2||bx<2.3){br=150;bg=144;bb=132;bh=.1}else{lutc(PHL.brick,.08+.5*hh);br=LC[0];bg=LC[1];bb=LC[2];bh=.45}
const qq=c01(pt*1.4),rim=pt<.45?1-pt/.45:0;r=(r*(1-qq)+br*qq)*(1-.22*rim);g=(g*(1-qq)+bg*qq)*(1-.22*rim);bl=(bl*(1-qq)+bb*qq)*(1-.22*rim);h=h*(1-qq)+(bh-.3)*qq+rim*.12}}
P4(d,i,r,g,bl);H[i]=h}},(x,sz)=>{cracks(x,sz,o.cr,'rgba(70,62,52,.35)');for(let i=0;i<o.cr*6;i++){x.fillStyle='rgba(60,54,46,'+rnd(.08,.22)+')';x.beginPath();x.arc(rnd(4,sz-4),rnd(4,sz-4),rnd(.6,1.5),0,6.3);x.fill()}},o.ns)}
const T_plas=plasTex(31,{sp:SPA.plas,l:'plas',gn:1.1,sc:40,k:.012,pat:.63,cr:5,mo:1,ns:.4});
const T_plas2=plasTex(177,{sp:SPA.plas2,l:'plas2',gn:1.1,sc:24,k:.02,pat:0,cr:3,mo:0,ns:.85});
const T_brick=brickTex(211);
// --- plafond : enduit lisse (photo Plaster001), auréoles d'humidité, coins noircis
const T_ceil=ptex(256,(d,H,sz)=>{const sp=spec(sz,SPA.plas2,301),q=qrank(sp),a=fbm(sz,3,3,4,301),w=fbm(sz,4,4,3,307),L=PHL.plas2;
for(let y=0;y<sz;y++)for(let X=0;X<sz;X++){const i=y*sz+X;lutc(L,q[i]);const s=c01((w[i]-.7)*5)*.7,ring=s>0&&s<.5?.03:0,ed=Math.min(X,y,sz-1-X,sz-1-y),cn=c01((20-ed)/20)*c01((a[i]-.45)*3)*.1,v=1.12*(.99+(a[i]-.5)*.05);
P4(d,i,LC[0]*v*(1-.1*s-ring-cn),LC[1]*v*(1-.14*s-ring-cn),LC[2]*v*(1-.26*s-ring-cn));H[i]=sp[i]*.01}},null,1.1);
// --- carrelage 4 x 4 (50 cm sur 2 m), calé sur la photo Tiles141 (crème 211/202/194, taches brunes) : joints encrassés, carreaux d'accent, éclats ; rugosité variable
const T_tile=(()=>{const sz=512,sp=spec(sz,SPA.tile,81),dt=fbmS(sz,48,48,3,87,256),RG=new Float32Array(sz*sz),V=new Float32Array(sz*sz);
for(let y=0;y<sz;y++)for(let X=0;X<sz;X++){const i=y*sz+X,gx=X&127,gy=y&127,ti=X>>7,tj=y>>7,hh=hsh(ti+3,tj+7),ed=Math.min(gx,gy,127-gx,127-gy);
if(gx<3||gy<3)V[i]=-.4+dt[i]*.1;else{let v=.5+sp[i]/255*3.4+(hh-.5)*.22+(((ti+tj)&1)?-.04:0);if(hh>.88)v-=.16;V[i]=v-c01((9-ed)/9)*dt[i]*.18}}
const q=qrank(V),L=PHL.tile;
const t=ptex(sz,(d,H)=>{for(let y=0;y<sz;y++)for(let X=0;X<sz;X++){const i=y*sz+X,gx=X&127,gy=y&127,ti=X>>7,tj=y>>7,hh=hsh(ti+3,tj+7),ed=Math.min(gx,gy,127-gx,127-gy);lutc(L,q[i]);let k=1,h,rg;
if(gx<3||gy<3){k=.85;h=.05;rg=.95}else{h=.72-(ed<8?(8-ed)*.012:0);rg=.3+(sp[i]/255)*2+(dt[i]>.62?.25:0)+(1-q[i])*.25}
P4(d,i,LC[0]*k,LC[1]*k,LC[2]*k*(hh>.88?1.03:1));H[i]=h;RG[i]=c01(rg)}},(x,s)=>{for(let k=0;k<3;k++){const px=rnd(10,s-10),py=rnd(10,s-10);x.fillStyle='rgba(50,44,36,.4)';x.beginPath();x.moveTo(px,py);x.lineTo(px+rnd(3,9),py+rnd(-3,3));x.lineTo(px+rnd(-2,5),py+rnd(3,9));x.fill()}cracks(x,s,2,'rgba(40,36,30,.45)')},.3);
const c=document.createElement('canvas');c.width=c.height=sz;const x=c.getContext('2d'),im=x.createImageData(sz,sz);for(let i=0;i<sz*sz;i++){const v=RG[i]*255;im.data[i*4]=v;im.data[i*4+1]=v;im.data[i*4+2]=v;im.data[i*4+3]=255}x.putImageData(im,0,0);t.rough=tx(c);return t})();
// --- peinture écaillée sur bois (huisseries, volets)
const T_paint=ptex(128,(d,H,sz)=>{const g=fbm(sz,32,3,3,401),n=fbm(sz,40,40,2,403),w=fbm(sz,6,6,3,407);
for(let y=0;y<sz;y++)for(let X=0;X<sz;X++){const i=y*sz+X,ch=c01((w[i]-.74)*7);let v=.94+(g[i]-.5)*.07+(n[i]-.5)*.04;let r=v,gg=v,b=v*.97,h=.6+(g[i]-.5)*.2;if(ch>0){const q=ch,wr=.55+(g[i])*.3;r=r*(1-q)+wr*.9*q;gg=gg*(1-q)+wr*.74*q;b=b*(1-q)+wr*.55*q;h-=.25*q}
P4(d,i,r*255,gg*255,b*255);H[i]=h}},null,2);
// --- porte (1,2 x 2,3 m étirés sur 256 x 256) : bois de la photo Planks023A (gris-brun 89/79/70 ; gain 1,9 car la teinte d'usure multiplie), montants, traverses, 4 panneaux moulurés, usure autour de la poignée
const T_door=(()=>{const sz=256,sp=spec(sz,SPA.door,501,1,.25),g=fbm(sz,56,2,4,501),n=fbm(sz,5,5,3,503),w=fbm(sz,12,12,2,507),V=new Float32Array(sz*sz);for(let i=0;i<V.length;i++)V[i]=sp[i]/255*3+(g[i]-.5)*.5+(n[i]-.5)*.2;
const q=qrank(V),L=PHL.door;
return ptex(sz,(d,H)=>{for(let y=0;y<sz;y++)for(let X=0;X<sz;X++){const i=y*sz+X;lutc(L,q[i]);let v=1.9,h=.6+(g[i]-.5)*.2;
const st=X<28||X>227,rl=y<22||y>233||(y>112&&y<134)||y>218;
if(!st&&!rl){const px=X<128?X-28:X-128,pw=100,py=y<112?y-22:y-134,ph=y<112?90:84,ed=Math.min(px,pw-px,py,ph-py);const e=ed<0?0:ed;if(e<5){v*=.62+.07*e;h=.25+.07*e}else{h=.55+Math.min(.12,(e-5)*.01);v*=1.02}}
const hx=X-212,hy=y-130,wr=c01(1-Math.hypot(hx,hy*.6)/30)*.18;v*=1-wr*(.5+w[i]);if(y>226)v*=.85;P4(d,i,LC[0]*v,LC[1]*v,LC[2]*v);H[i]=h}},(x,s)=>{x.strokeStyle='rgba(35,22,10,.3)';x.lineWidth=1;for(let k=0;k<3;k++){const px=rnd(8,s-8),py=rnd(150,220);x.beginPath();x.moveTo(px,py);x.lineTo(px+rnd(-14,14),py+rnd(8,26));x.stroke()}},2)})();
// --- pierre (moellons en assises irrégulières 6 x 6 sur 1,2 m, photo Bricks108A : pierre claire 129/122/111, joints sombres)
const T_stone=ptex(256,(d,H,sz)=>{const G=6,cs=sz/G,n=fbm(sz,48,48,2,91),sp=spec(sz,[0,0,0,8,12,14,12,10,6],93),w1=fbm(sz,12,12,2,95),w2=fbm(sz,12,12,2,97),V=new Float32Array(sz*sz),E=new Float32Array(sz*sz);
for(let y=0;y<sz;y++)for(let X=0;X<sz;X++){const i=y*sz+X,u=X+(w1[i]-.5)*6,v=y+(w2[i]-.5)*6,cj=Math.floor(v/cs),ro=hsh(cj,5)*cs*.8,uu=u+ro,ci=Math.floor(uu/cs),lx=uu-ci*cs,ly=v-cj*cs,id=hsh((ci+G*4)%G+cj*9,cj+3),ed=Math.min(lx,cs-lx,ly,cs-ly),e=c01((ed-1)/3.5);E[i]=e;V[i]=e<.999?e*.18+n[i]*.05:.2+.45*id+sp[i]/255*2.6}
const q=qrank(V),L=PHL.stone;
for(let i=0;i<sz*sz;i++){lutc(L,q[i]);P4(d,i,LC[0],LC[1],LC[2]);H[i]=E[i]*(.7+.3*n[i])+sp[i]*.004}},null,.6);
// --- bois (planches) ; joints=1 : parquet à lames étroites ; pw = largeur d'une lame en pixels ; key : photo (wood = Planks037A, floor = WoodFloor064) ; gn gain
function woodTex(joints,seed,pw,key,gn,ns){pw=pw||128;const NP=512/pw;return ptex(512,(d,H,sz)=>{const g=fbm(sz,96,3,4,seed),fb=spec(sz,[0,0,0,6,10,14,16,14,10],seed+5,1,.1),m=fbm(sz,5,5,3,seed+3),sc=fbm(sz,160,6,2,seed+13),V=new Float32Array(sz*sz),M=new Float32Array(sz*sz),L=PHL[key];
for(let y=0;y<sz;y++)for(let X=0;X<sz;X++){const i=y*sz+X,pl=(X/pw)|0,e=X%pw,ph=hsh(pl,seed),ph2=hsh(pl+17,seed),ph3=hsh(pl+31,seed),sh=.8+ph*.2,ring=.5+.5*Math.sin((X+(m[i]-.5)*60+pl*37)*.5+(g[i]-.5)*3);
let v=sh*(.8+(g[i]-.5)*.22+ring*.04+fb[i]/255*1.8)*(sc[i]>.66?.94:1),h=.6+(g[i]-.5)*.3+fb[i]/255*.8,mm=1;
if(e<2||e>pw-3){v*=.35;h=0}else if(e<4||e>pw-5){v*=.8;h*=.6}
if(Math.abs(y-(ph*sz|0))<2||Math.abs(y-((ph2*sz)|0))<2||(!joints&&Math.abs(y-((ph3*sz)|0))<2)){v*=.4;h=0}
V[i]=v;H[i]=h;M[i]=1+(ph2-.5)*.1}
const q=qrank(V);
for(let i=0;i<sz*sz;i++){lutc(L,q[i]);const cm=M[i];P4(d,i,LC[0]*gn*cm,LC[1]*gn,LC[2]*gn*(2-cm))}},
(x,sz)=>{for(let k=0;k<4;k++){const px=rnd(20,sz-20),py=rnd(20,sz-20),rg=x.createRadialGradient(px,py,0,px,py,9);rg.addColorStop(0,'rgba(35,22,10,.5)');rg.addColorStop(.5,'rgba(45,28,14,.25)');rg.addColorStop(1,'rgba(45,28,14,0)');x.fillStyle=rg;x.save();x.translate(px,py);x.scale(.6,1);x.fillRect(-9,-9,18,18);x.restore()}
if(!joints){x.fillStyle='rgba(15,11,8,.6)';for(let p=0;p<NP;p++)for(const yy of [26,sz-26]){x.beginPath();x.arc(p*pw+pw/2,yy,2.4,0,6.3);x.fill()}}
else{x.fillStyle='rgba(20,14,8,.45)';for(let p=0;p<NP;p++){const yy=(hsh(p,seed)*sz)|0;for(const q of [-4,5]){x.beginPath();x.arc(p*pw+pw*.22,(yy+q+sz)%sz,1.2,0,6.3);x.arc(p*pw+pw*.78,(yy+q+sz)%sz,1.2,0,6.3);x.fill()}}}},ns)}
const T_wood=woodTex(0,9,64,'wood',1.9,1.2),T_floor=woodTex(1,23,64,'floor',1.3,.3);
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
// --- tuiles (4 x 4 par 256 px) : teintes cuites par tuile, recouvrement ombré, lichens, mousse, fumées
const T_roof=ptex(256,(d,H,sz)=>{const sp=spec(sz,SPA.roof,67),ms=fbm(sz,5,5,3,67),li=fbm(sz,20,20,3,69),sk=fbm(sz,24,2,2,73),V=new Float32Array(sz*sz),L=PHL.roof,CW=51.2,RH=32;
for(let y=0;y<sz;y++)for(let X=0;X<sz;X++){const i=y*sz+X,row=(y/RH)|0,r=(y-row*RH)/RH,cxp=(X+(row&1)*CW/2)%256,c=(cxp%CW)/CW;let k=(.25+.75*r)*(.7+.3*Math.sin(Math.PI*c));if(Math.min(c,1-c)<.05)k*=.7;if(r<.07)k*=.6;V[i]=k+sp[i]/255*2.2;H[i]=(.25+.75*r)*(.7+.3*Math.sin(Math.PI*c))}
const q=qrank(V);
for(let y=0;y<sz;y++)for(let X=0;X<sz;X++){const i=y*sz+X,row=(y/RH)|0,cxp=(X+(row&1)*CW/2)%256,col=(cxp/CW)|0,hh=hsh(col+row*7,row*13+3),h3=hsh(col*3+row,row*5+1);lutc(L,q[i]);
let k=(.92+.16*hh)*(1-.1*c01((sk[i]-.55)*5)),r_=LC[0]*k,g_=LC[1]*k,b_=LC[2]*k;if(hh>.82){r_*=.9;g_*=.94;b_*=.92}if(h3<.12){r_*=.92;g_*=.96;b_*=1.04}
const mo=c01((ms[i]-.64)*5)*.38;r_+=(70-r_)*mo;g_+=(88-g_)*mo;b_+=(50-b_)*mo;const l=c01((li[i]-.7)*6)*.26*(h3>.5?1:.4);r_+=(165*k-r_)*l;g_+=(170*k-g_)*l;b_+=(110*k-b_)*l;
P4(d,i,r_,g_,b_)}},null,12.5);
// --- sol (v62) : deux tuiles de 6 m (herbe fine, terre) mélangées par le shader du terrain selon un poids d'herbe par sommet
const gwrap=(sz,px,py,m,f)=>{const ox=px<m?[0,sz]:px>sz-m?[0,-sz]:[0],oy=py<m?[0,sz]:py>sz-m?[0,-sz]:[0];for(const u of ox)for(const v of oy)f(px+u,py+v)};
const gstroke=(x,sz,n,len,wd,cols,ang)=>{x.lineCap='round';for(let i=0;i<n;i++){const px=rnd(0,sz),py=rnd(0,sz),a=ang!==undefined?ang+rnd(-.6,.6):rnd(0,6.283),l=rnd(len[0],len[1]);x.strokeStyle=cols[(Math.random()*cols.length)|0];x.lineWidth=rnd(wd[0],wd[1]);
gwrap(sz,px,py,14,(X,Y)=>{x.beginPath();x.moveTo(X,Y);x.lineTo(X+Math.cos(a)*l,Y+Math.sin(a)*l);x.stroke()})}};
function gtile(kind){const sz=512,a=fbm(sz,4,4,3,kind?31:21),b=fbm(sz,16,16,3,kind?17:7),c=fbm(sz,64,64,2,kind?13:3),e=fbm(sz,2,2,2,kind?55:45),H=new Float32Array(sz*sz),cv=document.createElement('canvas');cv.width=cv.height=sz;const x=cv.getContext('2d'),im=x.createImageData(sz,sz),d=im.data;
for(let i=0;i<sz*sz;i++){const k=.8+c[i]*.42,gr=(Math.random()-.5)*(kind?20:10);let r,g,bl;
if(!kind){const lu=c01((a[i]-.3)*2.2),dr=c01((e[i]-.5)*3);r=(50+lu*22+dr*50+(b[i]-.5)*26)*k+gr;g=(80+lu*26+dr*20+(b[i]-.5)*30)*k+gr;bl=(30+lu*6+dr*6)*k+gr*.6}
else{r=(124+(b[i]-.5)*46+(a[i]-.5)*30)*k+gr;g=(106+(b[i]-.5)*40+(a[i]-.5)*24)*k+gr;bl=(80+(b[i]-.5)*30+(a[i]-.5)*16)*k+gr*.8}
P4(d,i,r,g,bl);H[i]=b[i]*.55+c[i]*.45}
x.putImageData(im,0,0);
if(!kind){gstroke(x,sz,5200,[5,12],[.8,1.5],['rgba(28,50,18,.5)','rgba(34,60,20,.45)','rgba(92,128,46,.4)','rgba(120,152,62,.35)']);gstroke(x,sz,900,[5,12],[.8,1.3],['rgba(165,150,76,.35)','rgba(140,128,62,.35)']);
for(let i=0;i<70;i++){const px=rnd(4,sz-4),py=rnd(4,sz-4);x.fillStyle=Math.random()<.5?'rgba(214,208,150,.55)':'rgba(236,236,226,.5)';x.beginPath();x.arc(px,py,rnd(.9,1.8),0,6.3);x.fill()}
for(let i=0;i<220;i++){const px=rnd(4,sz-4),py=rnd(4,sz-4);x.fillStyle='rgba(66,52,36,.35)';x.beginPath();x.ellipse(px,py,rnd(1,3),rnd(.8,2),rnd(0,3),0,6.3);x.fill()}}
else{for(let i=0;i<900;i++){const px=rnd(6,sz-6),py=rnd(6,sz-6),s=rnd(.9,3.4),v=118+rnd(0,72)|0;x.fillStyle='rgba(20,16,10,.4)';x.beginPath();x.ellipse(px+.8,py+1,s,s*.8,0,0,6.3);x.fill();x.fillStyle='rgb('+v+','+(v-8)+','+(v-22)+')';x.beginPath();x.ellipse(px,py,s,s*rnd(.6,.9),rnd(0,3),0,6.3);x.fill()}
gstroke(x,sz,420,[4,10],[.7,1.2],['rgba(170,150,98,.4)','rgba(110,96,70,.4)'])}
let m=0;const dd=x.getImageData(0,0,sz,sz).data;for(let i=0;i<sz*sz;i++)m+=dd[i*4]+dd[i*4+1]+dd[i*4+2];
return{map:tx(cv),normalMap:nmap(H,sz,2.2),mean:m/(sz*sz*765)}}
const T_gg=gtile(0),T_gd=gtile(1);
// shader du terrain : attribut gsp (poids d'herbe), tuiles herbe/terre, 2e échelle tournée + 3e très large contre le motif répété, transition irrégulière
function groundMat(m){m.map.repeat.set(2,2);m.onBeforeCompile=sh=>{sh.uniforms.tGr={value:T_gg.map};sh.uniforms.tDi={value:T_gd.map};sh.uniforms.uMg={value:T_gg.mean};sh.uniforms.uMd={value:T_gd.mean};
sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float gsp;varying float vGs;').replace('#include <begin_vertex>','#include <begin_vertex>\nvGs=gsp;');
sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D tGr,tDi;uniform float uMg,uMd;varying float vGs;').replace('#include <map_fragment>',`
vec2 w2=vec2(vUv.x*.8+vUv.y*.6,-vUv.x*.6+vUv.y*.8)*2.9+vec2(.31,.57);
vec3 g1=texture2D(tGr,vUv).rgb,g2=texture2D(tGr,w2).rgb,d1=texture2D(tDi,vUv*1.37+vec2(.2,.4)).rgb;
float l2=dot(g2,vec3(.3333))/uMg,l3=dot(texture2D(tGr,vUv*.137+vec2(.5,.2)).rgb,vec3(.3333))/uMg;
float mac=.8+.3*l3;
vec3 gc=g1*mix(1.,l2,.5)*mac,dc=d1*mix(1.,l2,.3)*(.9+.2*l3);
float tt=smoothstep(.0,1.,(vGs-.5)*3.+.5+(l2-1.)*1.6);
diffuseColor.rgb*=mix(dc,gc,tt);`)};return m}
// --- dalles béton
const T_slab=ptex(512,(d,H,sz)=>{const sp=spec(sz,SPA.slab,15),q=qrank(sp),b=fbm(sz,64,64,2,8),o_=fbm(sz,6,6,3,19),tr=fbm(sz,10,10,2,23),L=PHL.slab;
for(let y=0;y<sz;y++)for(let X=0;X<sz;X++){const i=y*sz+X,gx=X&255,gy=y&255,hh=hsh((X>>8)+3,(y>>8)+11);lutc(L,q[i]);const oil=c01((o_[i]-.66)*6)*.1,sw_=(tr[i]-.5)*.07;let v=(.96+hh*.08)*(1+sw_)*(1-oil),h=.6+sp[i]*.01+sw_;
const eg=Math.min(gx,gy,255-gx,255-gy);if(eg<3){v*=.62;h=0}else if(eg<7){v*=.92;h*=.5+eg/14}P4(d,i,LC[0]*v,LC[1]*v,LC[2]*v);H[i]=h}},(x,sz)=>cracks(x,sz,4,'rgba(35,33,30,.4)'),1.2);
// --- fût métallique
const T_barrel=(()=>{const c=document.createElement('canvas');c.width=512;c.height=256;const x=c.getContext('2d');x.fillStyle='#e6e6e6';x.fillRect(0,0,512,256);
for(let i=0;i<1500;i++){x.fillStyle='rgba('+(Math.random()<.5?'255,255,255':'0,0,0')+','+rnd(.02,.08)+')';x.fillRect(rnd(0,512),rnd(0,256),rnd(1,5),rnd(1,3))}
for(let i=0;i<40;i++){x.strokeStyle='rgba(255,255,255,'+rnd(.1,.3)+')';x.lineWidth=rnd(.5,1.2);const px=rnd(0,512),py=rnd(0,256);x.beginPath();x.moveTo(px,py);x.lineTo(px+rnd(-25,25),py+rnd(-6,6));x.stroke()}
const g=x.createLinearGradient(0,256,0,165);g.addColorStop(0,'rgba(110,55,22,.8)');g.addColorStop(1,'rgba(110,55,22,0)');x.fillStyle=g;x.fillRect(0,165,512,91);
for(let i=0;i<70;i++){const px=rnd(12,500),py=rnd(120,256),r=rnd(3,12),rg=x.createRadialGradient(px,py,0,px,py,r);rg.addColorStop(0,'rgba(120,60,25,.6)');rg.addColorStop(1,'rgba(120,60,25,0)');x.fillStyle=rg;x.fillRect(px-r,py-r,2*r,2*r)}
x.fillStyle='rgba(245,245,235,.92)';x.fillRect(150,92,120,52);x.fillStyle='rgba(20,20,20,.85)';x.font='bold 22px monospace';x.textAlign='center';x.fillText('DIESEL',210,117);x.font='11px monospace';x.fillText('200 L · UN 1202',210,135);return tx(c)})();
window.TEXMS=performance.now()-TEX_T0;
// --- matériaux de surface
const bright=(c,f)=>{const r=Math.min(255,(c>>16&255)*f),g=Math.min(255,(c>>8&255)*f),b=Math.min(255,(c&255)*f);return (r<<16)|(g<<8)|b};
const SURF={};
function surf(c){if(SURF[c])return SURF[c];let m;
if(c===0x6a5a3c){m=std(0xffffff,{map:T_crate.map,normalMap:T_crate.normalMap,roughness:.8});m.userData.k='one'}
else if(c===0x7a5a36){m=pm(T_wood,0xe8b888,{roughness:.7});m.userData.k='wood'}
else{m=pm(T_conc,bright(c,1.25),{roughness:.93,vertexColors:true});m.userData.k='wall'}
return SURF[c]=m}
const woodMat=c=>pm(T_wood,bright(c,1.25),{roughness:.75});
const matTile=pm(T_tile,0xe4e0d4,{roughness:1,roughnessMap:T_tile.rough});
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
fg.setAttribute('gsp',new THREE.BufferAttribute(new Float32Array(fg.attributes.position.count).fill(.8),1));const floor=new THREE.Mesh(fg,groundMat(std(0xffffff,{map:T_gg.map,normalMap:T_gg.normalMap,roughness:1,vertexColors:true})));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;S.add(floor);
let NOL=false;
const sstep=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t)};
function terrainH(x,z){const d=Math.max(Math.abs(x),Math.abs(z)),k=sstep(95,165,d);return k*Math.max(0,5+5*Math.sin(x*.045+1.3)*Math.cos(z*.04)+2.5*Math.sin(x*.11)*Math.sin(z*.09+.7)+1.2*Math.sin(x*.27+z*.21))}
{const og=new THREE.PlaneGeometry(3600,3600,600,600);og.rotateX(-Math.PI/2);const p=og.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,Math.max(Math.abs(p.getX(i)),Math.abs(p.getZ(i)))<=MH-3?-9:terrainH(p.getX(i),p.getZ(i))-.03);scaleUV(og,345,345);og.computeVertexNormals();
og.setAttribute('gsp',new THREE.BufferAttribute(new Float32Array(og.attributes.position.count).fill(.78),1));const o=new THREE.Mesh(og,groundMat(std(0xd8dccc,{map:T_gg.map,normalMap:T_gg.normalMap,roughness:1,envMapIntensity:.5})));o.receiveShadow=true;S.add(o)}
