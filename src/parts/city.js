// ================= VILLE (v13) : 350 x 350 m (x 150..500, z -700..-350), étages accessibles, vitres cassables =================
const CT={x0:150,x1:500,z0:-700,z1:-350,y:0,ax:224,az:-525};
const LZ={q:[],built:[],t:0,n:0,k:0};function lazy(r,fn){LZ.q.push({r,fn})}
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
const MG={},CV=[[.55,.02,.02],[.02,.08,.45],[.8,.8,.8],[.01,.01,.012],[.45,.46,.5],[.02,.25,.08],[.75,.55,.03],[.7,.2,.02]];const mdl=n=>{const[nm,ci]=n.split(':');if(!MG[n])MG[n]=mkMdl(nm,ci!==undefined?CV[ci|0]:undefined);return MG[n].clone()};
const mdlAt=(n,x,y,z,ry,hw,hd,hh,sol)=>{const e=mdl(n);e.position.set(x,Y+y,z);e.rotation.y=ry;S.add(e);if(hw)boxes.push({x0:x-hw,x1:x+hw,z0:z-hd,z1:z+hd,y0:Y+y,y1:Y+y+hh});if(sol&&hw){const px=new THREE.Mesh(new THREE.BoxGeometry(hw*2,hh,hd*2),new THREE.MeshBasicMaterial());px.position.set(x,Y+y+hh/2,z);px.visible=false;S.add(px);solids.push(px)}return e};
// --- bouche d'incendie
const hydM=std(0xb3201a,{roughness:.5,metalness:.3}),hydC=std(0xc9c9c4,{roughness:.4,metalness:.7});
const hydrant=(x,z)=>{const a=(g,m,py,px,rz)=>{const e=new THREE.Mesh(g,m);e.position.set(x+(px||0),Y+py,z);if(rz)e.rotation.z=rz;e.castShadow=true;S.add(e);solids.push(e)};
a(new THREE.CylinderGeometry(.2,.22,.08,10),hydM,.12);a(new THREE.CylinderGeometry(.13,.15,.62,10),hydM,.45);a(new THREE.CylinderGeometry(.17,.17,.06,10),hydM,.74);a(new THREE.SphereGeometry(.14,10,6,0,6.283,0,1.57),hydM,.77);a(new THREE.CylinderGeometry(.04,.04,.08,6),hydC,.94);
a(new THREE.CylinderGeometry(.06,.06,.14,8),hydC,.52,.19,1.5708);a(new THREE.CylinderGeometry(.06,.06,.14,8),hydC,.52,-.19,1.5708);boxes.push({x0:x-.2,x1:x+.2,z0:z-.2,z1:z+.2,y0:Y,y1:Y+.95})};
// --- murs avec ouvertures ; fenêtres cassables (linteau, appui, volets)
const trimM=std(0x5b5f63,{roughness:.8}),trimL=std(0xcfc9bb,{roughness:.9}),railM=std(0x2c3034,{roughness:.5,metalness:.6}),inM=std(0xe6e1d6,{roughness:.95});
const seg=(x0,x1,z0,z1,y0,y1,m)=>blk(x1-x0,y1-y0,z1-z0,(x0+x1)/2,Y+(y0+y1)/2,(z0+z1)/2,m,{T:3,s:1,c:1});
function winG(ax,f,c,w,y0,y1,tt,o){const h=y1-y0,gm=new THREE.Mesh(new THREE.PlaneGeometry(w-.1,h-.1),glassM);gm.position.set(ax==='x'?c:f,Y+(y0+y1)/2,ax==='x'?f:c);if(ax==='z')gm.rotation.y=Math.PI/2;
gm.userData.glass={hp:2,w:w-.1,h:h-.1};gm.userData.home=S;S.add(gm);solids.push(gm);GLASS.push(gm);
const sy=Y+y0,hw=w/2-.05,dp=tt/2+.3,vs=ax==='x'?surfRect(c-hw,c+hw,f-dp,f+dp,sy,{gl:gm}):surfRect(f-dp,f+dp,c-hw,c+hw,sy,{gl:gm});gm.userData.glass.vs=vs;gm.userData.glass.nv={ax,c,f,w,y:sy};
ax==='x'?blk(w+.2,.06,tt+.16,c,Y+y0-.03,f,concM,{ns:1}):blk(tt+.16,.06,w+.2,f,Y+y0-.03,c,concM,{ns:1});
ax==='x'?blk(w+.2,.1,tt+.1,c,Y+y1+.05,f,trimM,{ns:1}):blk(tt+.1,.1,w+.2,f,Y+y1+.05,c,trimM,{ns:1});
if(o&&o.sh){const q=o.out*(tt/2+.03);[-1,1].forEach(s=>{ax==='x'?blk(.5,h,.05,c+s*(w/2+.27),Y+(y0+y1)/2,f+q,o.sh,{ns:1}):blk(.05,h,.5,f+q,Y+(y0+y1)/2,c+s*(w/2+.27),o.sh,{ns:1})})}}
function wall(ax,f,a0,a1,ops,m,yb,hh,tt){tt=tt||t;ops.sort((p,q)=>p.c-q.c);let cur=a0;
const P=(u0,u1,y0,y1)=>{if(u1-u0<.02||y1-y0<.02)return;const A=yb+y0,B=yb+y1;ax==='x'?seg(u0,u1,f-tt/2,f+tt/2,A,B,m):seg(f-tt/2,f+tt/2,u0,u1,A,B,m)};
for(const o of ops){const u0=o.c-o.w/2,u1=o.c+o.w/2;P(cur,u0,0,hh);if(o.y0>0)P(u0,u1,0,o.y0);if(o.y1<hh)P(u0,u1,o.y1,hh);if(o.gl)winG(ax,f,o.c,o.w,yb+o.y0,yb+o.y1,tt,o);cur=u1}P(cur,a1,0,hh)}
const floorM=std(0x8a8478,{roughness:.9}),stM=std(0x77736b,{roughness:.8}),wdM=std(0x8a6a44,{roughness:.7}),wd2=std(0x6f5a43,{roughness:.8}),mtM=std(0x4a5560,{roughness:.6}),bedM=std(0xd8d4c8,{roughness:.9}),clM=[0x8a3a30,0x3a5a7a,0x4c6b45].map(c=>std(c,{roughness:.9})),acM=std(0x9a9da0,{roughness:.5,metalness:.4});
const PAL={apt:[0xd8cdb9,0xc9b79a,0xb9c2c9,0xd2a98a,0xe3dccb],off:[0x8f9ca6,0x7d8791,0xa7adb0,0x6f7f8c],shop:[0xa85a45,0x8c6b4f,0xb07a55,0x7d6a5c],resto:[0xd6c7a0,0xc9a37a,0xb5876a,0xdcd2bd],hotel:[0xc7b595,0xb9a98f,0xd9c9ae]};
const SGN={shop:['BOULANGERIE','PHARMACIE','TABAC PRESSE','SUPERETTE','LIBRAIRIE','QUINCAILLERIE','FLEURISTE','COIFFEUR'],resto:['RESTAURANT','PIZZERIA','CAFE DU CENTRE','BRASSERIE','KEBAB','BISTROT'],hotel:['HOTEL'],off:['BANQUE','ASSURANCES','CABINET MEDICAL','POSTE','NOTAIRE']};
const AWN=[0x8a2f2a,0x2f5a3a,0x2c4a7a,0xb8862a].map(c=>std(c,{roughness:.9})),SHC=[0x3f6a4a,0x6a3a2c,0x34506e,0x5a5a5a].map(c=>std(c,{roughness:.8}));
const sign=(txt,bg)=>{const[c,g]=mkC(512,96);g.fillStyle=bg;g.fillRect(0,0,512,96);g.fillStyle='#f2efe6';g.font='bold 54px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(txt,256,50,490);const t_=new THREE.CanvasTexture(c);t_.anisotropy=AN;return std(0xffffff,{map:t_,roughness:.7})};
// dalle (avec trémie éventuelle) : visuel + surface de marche
function slab(yT,X0,X1,Z0,Z1,hole,mat){const P=(a,b,c,d)=>{if(b-a<.05||d-c<.05)return;blk(b-a,.3,d-c,(a+b)/2,yT-.15,(c+d)/2,mat||floorM,{T:2,s:1});surfRect(a,b,c,d,Y+yT)};
if(!hole){P(X0,X1,Z0,Z1);return}const h=hole;P(X0,h.x0,Z0,Z1);P(h.x1,X1,Z0,Z1);P(h.x0,h.x1,Z0,h.z0);P(h.x0,h.x1,h.z1,Z1)}
// ---- bâtiment (v14) : couloir central, pièces cloisonnées, cage d'escalier fermée jusqu'au toit, tous les étages accessibles
function bld(cx,cz,w,d,fl,ty,face){const x0=cx-w/2,x1=cx+w/2,z0=cz-d/2,z1=cz+d/2,H=fl*FH,X=w>=d,Lu=X?w:d,Hv=(X?d:w)/2,cv=X?cz:cx,U0=X?x0:z0,U1=X?x1:z1;
const m=pm(ty==='off'?T_conc:T_plas,PAL[ty][(rn()*PAL[ty].length)|0],{roughness:.95}),shM=ty==='apt'?SHC[(rn()*4)|0]:null,com=ty==='shop'||ty==='resto',res=ty==='apt'||ty==='hotel';
const fu=X?(face==='W'?0:face==='E'?1:-1):(face==='N'?0:face==='S'?1:-1),fvs=X?(face==='N'?-1:face==='S'?1:0):(face==='W'?-1:face==='E'?1:0),se=fu===0?1:0,ou=se?-1:1;
const uw=u=>se?U1-u:U0+u;
const B=(u0,u1,v0,v1,y0,y1,mat,o)=>{const a=uw(u0),b=uw(u1),ua=Math.min(a,b),ub=Math.max(a,b),va=cv+Math.min(v0,v1),vb=cv+Math.max(v0,v1);return X?blk(ub-ua,y1-y0,vb-va,(ua+ub)/2,Y+(y0+y1)/2,(va+vb)/2,mat,o):blk(vb-va,y1-y0,ub-ua,(va+vb)/2,Y+(y0+y1)/2,(ua+ub)/2,mat,o)};
const SF=(u0,u1,v0,v1,y)=>{const a=uw(u0),b=uw(u1);X?surfRect(a,b,cv+v0,cv+v1,Y+y):surfRect(cv+v0,cv+v1,a,b,Y+y)};
const Wu=(f,a0,a1,ops,mat,yb,hh,tt,out)=>{const a=uw(a0),b=uw(a1);ops.forEach(o=>{o.c=uw(o.c);o.out=out});wall(X?'x':'z',cv+f,Math.min(a,b),Math.max(a,b),ops,mat,yb,hh,tt)};
const Wv=(f,a0,a1,ops,mat,yb,hh,tt,out)=>{ops.forEach(o=>{o.c=cv+o.c;o.out=out});wall(X?'z':'x',uw(f),cv+a0,cv+a1,ops,mat,yb,hh,tt)};
const ST=(ua,va,ub,vb,wd,ya,yb)=>{const a=uw(ua),b=uw(ub);X?stairs(a,cv+va,b,cv+vb,wd,Y+ya,Y+yb,stM,{}):stairs(cv+va,a,cv+vb,b,wd,Y+ya,Y+yb,stM,{})};
const MD=(n,u,v,y,ry,r,hh)=>{const a=uw(u);mdlAt(n,X?a:cv+v,y,X?cv+v:a,ry,r,r,hh,0)};
const SL=5.2,cw=1.5,n=Math.max(2,Math.floor((Lu-2*t)/7.5)),bw=(Lu-2*t)/n,la=n%2?t+(n-1)/2*bw:t+(n/2-1)*bw,lb=n%2?la+bw:la+2*bw,lob=fvs!==0;
const WW=ty==='off'?2.4:1.6,wop=(c)=>({c,w:WW,y0:.9,y1:2.5,gl:1,sh:shM});
for(let k=0;k<fl;k++){const yb=k*FH,g0=k===0,open=(com&&g0)||(ty==='off'&&k>0&&k%2===0);
// murs extérieurs longs
[-1,1].forEach(s=>{const ops=[];let dr=0;if(g0&&lob){if(s===fvs){ops.push({c:Lu/2,w:2.6,y0:0,y1:2.6});dr=2.6}else{ops.push({c:Lu/2,w:1.6,y0:0,y1:2.3});dr=1.6}}
for(let i=0;i<n;i++)[.27,.73].forEach((q,j)=>{const c=t+i*bw+bw*q;if(dr&&Math.abs(c-Lu/2)<dr/2+2.2)return;
if(com&&g0&&s===fvs){ops.push({c,w:Math.min(bw*.4,3.4),y0:.5,y1:2.8,gl:1});return}
if(res&&k>0&&j===0&&(i+k)%2===0){ops.push({c,w:1.5,y0:.05,y1:2.35,gl:1});B(c-1.3,c+1.3,s*Hv,s*(Hv+1.1),yb-.14,yb,concM,{s:1});SF(c-1.3,c+1.3,s>0?Hv:-(Hv+1.1),s>0?Hv+1.1:-Hv,yb);
B(c-1.3,c+1.3,s*(Hv+1.04),s*(Hv+1.1),yb,yb+1,railM,{s:1,c:1});B(c-1.3,c-1.24,s*Hv,s*(Hv+1.1),yb,yb+1,railM,{s:1,c:1});B(c+1.24,c+1.3,s*Hv,s*(Hv+1.1),yb,yb+1,railM,{s:1,c:1});return}
ops.push(wop(c))});Wu(s*(Hv-t/2),0,Lu,ops,m,yb,FH,t,s)});
// pignons : côté escalier puis côté opposé
{const vr=cw+(Hv-cw)/2,o1=[wop(-vr),wop(vr)],o2=[];Wv(t/2,-Hv,Hv,o1,m,yb,FH,t,-ou);
if(com&&g0&&!lob){const vw=Math.min((Hv-cw)*1.1,3.4);o2.push({c:-vr,w:vw,y0:.5,y1:2.8,gl:1},{c:vr,w:vw,y0:.5,y1:2.8,gl:1})}else o2.push(wop(-vr),wop(vr));
o2.push(g0&&!lob?{c:0,w:2.6,y0:0,y1:2.6}:{c:0,w:1.5,y0:.9,y1:2.5,gl:1});Wv(Lu-t/2,-Hv,Hv,o2,m,yb,FH,t,ou)}
// couloir + cage d'escalier + cloisons
{const segs=open?[[t,t+SL]]:(g0&&lob?[[t,Math.max(la,t+SL)],[lb,Lu-t]]:[[t,Lu-t]]),dcs=[];for(let i=0;i<n;i++)dcs.push(i===0?t+SL+.85:t+i*bw+bw/2);
segs.forEach(q=>{if(q[1]-q[0]<.3)return;[-1,1].forEach(s=>Wu(s*cw,q[0],q[1],open?[]:dcs.filter(c=>c>q[0]+.8&&c<q[1]-.8).map(c=>({c,w:1.1,y0:0,y1:2.2})),inM,yb,FH,.2,s))});
if(!open)for(let i=1;i<n;i++){const up=t+i*bw;if(g0&&lob&&up>la+.1&&up<lb-.1)continue;Wv(up,cw+.1,Hv-t,[],inM,yb,FH,.2,1);Wv(up,-(Hv-t),-(cw+.1),[],inM,yb,FH,.2,1)}}
// escalier à deux volées + palier intermédiaire + mur d'échiffre
ST(t+3.8,-.75,t+1.4,-.75,1.4,yb,yb+FH/2);B(t,t+1.4,-cw+.1,cw-.1,yb+FH/2-.15,yb+FH/2,stM,{s:1});SF(t,t+1.4,-cw,cw,yb+FH/2);ST(t+1.4,.75,t+3.8,.75,1.4,yb+FH/2,yb+FH);B(t+1.4,t+3.8,-.06,.06,yb,yb+FH,inM,{s:1,c:1});
// mobilier
const F=(s,u,v,du,dv,h,y0,mat)=>B(u-du/2,u+du/2,s*(v-dv/2),s*(v+dv/2),yb+y0,yb+y0+h,mat,{s:1,c:1}),vm=(cw+Hv-t)/2,vf=Hv-t;
if(open&&ty==='off'){for(let u=t+SL+2.5;u<Lu-t-1.5;u+=4)[-1,1].forEach(s=>{for(let v=2;v<vf-1.2;v+=3.4){if(rn()<.2)continue;F(s,u,v,1.6,.8,.75,0,wdM);if(rn()<.35)MD('chair',u,s*(v+.9),yb,rn()*6.28,.3,.9);else F(s,u,v+.9,.45,.45,.48,0,mtM)}})}
else if(open&&ty==='shop'){for(let u=t+SL+2.5;u<Lu-t-1.5;u+=3){if(lob&&Math.abs(u-Lu/2)<2.4)continue;[-1,1].forEach(s=>{if(vf-cw-2.6>1)F(s,u,(cw+1+vf-1.6)/2,.55,vf-cw-2.6,1.9,0,wd2)})}F(1,t+SL+.9,cw+1.6,.7,2.2,1,0,wdM)}
else if(open){for(let u=t+SL+2.5;u<Lu-t-1.8;u+=3.8){if(lob&&Math.abs(u-Lu/2)<2.2)continue;[-1,1].forEach(s=>{for(let v=cw+1.6;v<vf-1.3;v+=3.4){if(rn()<.15)continue;MD('table',u,s*v,yb,0,.7,.75);if(rn()<.5)MD('chair',u+1.1,s*v,yb,X?-1.57:0,.3,.9);else F(s,u+1.1,v,.42,.42,.46,0,clM[0]);F(s,u-1.1,v,.42,.42,.46,0,clM[0])}})}F(-1,t+SL+.9,cw+1.8,.7,2.6,1.1,0,wd2)}
else for(let i=0;i<n;i++){const ua=t+i*bw+.35,ub=t+(i+1)*bw-.35,uc=(ua+ub)/2;if(g0&&lob&&uc>la&&uc<lb){if(ty==='hotel')F(-fvs,la+1,cw+2.2,.7,2.4,1.05,0,wdM);continue}
[-1,1].forEach(s=>{const kind=ty==='off'?3:ty==='hotel'?4:(i+k+(s>0?1:0))%3;
if(kind===3){F(s,uc,vf-1.5,1.6,.8,.75,0,wdM);if(rn()<.5)MD('chair',uc,s*(vf-2.5),yb,rn()*6.28,.3,.9);else F(s,uc,vf-2.5,.45,.45,.48,0,mtM);F(s,ua+.25,vm,.45,1.8,1.9,0,wd2);if(vf-cw>7){F(s,uc+.4,cw+2.4,1.6,.8,.75,0,wdM)}}
else if(kind===4){F(s,uc,vf-1.3,1.6,2.1,.45,0,wdM);F(s,uc,vf-1.3,1.5,2,.16,.45,bedM);F(s,ub-.3,cw+1.8,.6,1.3,.75,0,wdM);F(s,ub-1.1,cw+1.8,.42,.42,.46,0,clM[1]);F(s,ua+.3,vm,.55,1.2,1.9,0,wd2)}
else if(kind===0){F(s,uc,vf-1.3,1.6,2.1,.45,0,wdM);F(s,uc,vf-1.3,1.5,2,.16,.45,bedM);F(s,ua+.3,vm,.6,1.6,2,0,wd2)}
else if(kind===1){const c=clM[(rn()*3)|0];F(s,ua+.75,vm,.9,2.2,.45,0,c);F(s,ua+.2,vm,.3,2.2,.9,0,c);MD('table',uc+.6,s*vm,yb,X?0:1.57,.6,.75);if(rn()<.4)MD('chair',uc+.6,s*(vm+1.4),yb,rn()*6.28,.3,.9)}
else{F(s,ub-.33,vm,.65,Math.min(3,vf-cw-1),.9,0,inM);F(s,uc-.5,vm,1.2,.8,.75,0,wdM);F(s,uc-.5,vm+.9,.4,.4,.46,0,clM[2]);F(s,uc-.5,vm-.9,.4,.4,.46,0,clM[2])}})}}
// dalles d'étage + toit (trémie de la cage d'escalier)
{const a=uw(t),b=uw(t+3.8),u0=Math.min(a,b),u1=Math.max(a,b),hole=X?{x0:u0,x1:u1,z0:cv-cw,z1:cv+cw}:{x0:cv-cw,x1:cv+cw,z0:u0,z1:u1};
for(let k=1;k<fl;k++)slab(k*FH,x0+t,x1-t,z0+t,z1-t,hole);slab(H,x0+.05,x1-.05,z0+.05,z1-.05,hole,roofM)}
// édicule de toit + garde-corps de trémie + acrotère
[-1,1].forEach(s=>Wu(s*cw,0,t+SL,[],m,H,2.4,.2,s));Wv(t/2,-cw,cw,[],m,H,2.4,t,-ou);B(0,t+SL+.3,-cw-.2,cw+.2,H+2.4,H+2.6,roofM,{s:1});B(t+3.74,t+3.8,-cw,0,H,H+1,railM,{s:1,c:1});
[d/2,-d/2].forEach(q=>blk(w+.3,.9,.3,cx,Y+H+.45,cz+q,concM,{s:1,c:1}));[w/2,-w/2].forEach(q=>blk(.3,.9,d+.3,cx+q,Y+H+.45,cz,concM,{s:1,c:1}));
// bandeaux d'étage + corniche
for(let k=1;k<=fl;k++){const top=k===fl,p=top?.14:.06,ya=k*FH-(top?.02:.26),yc=k*FH+(top?.3:-.02)-(top?.3:0)+(top?.28:0),mt=top?trimM:trimL;
[-1,1].forEach(s=>B(-p,Lu+p,s*Hv,s*(Hv+p),ya,yc,mt,{ns:1}));B(-p,0,-Hv,Hv,ya,yc,mt,{ns:1});B(Lu,Lu+p,-Hv,Hv,ya,yc,mt,{ns:1})}
// façade d'entrée : auvent, enseigne
{const Lf=lob?Lu:2*Hv,FB=(a0,a1,p0,p1,y0,y1,mat,o)=>lob?B(Lu/2+a0,Lu/2+a1,fvs*(Hv+p0),fvs*(Hv+p1),y0,y1,mat,o):B(Lu+p0,Lu+p1,a0,a1,y0,y1,mat,o);
if(com){FB(-Lf/2+.4,Lf/2-.4,0,1.3,2.92,3.02,AWN[(rn()*4)|0],{s:1});FB(-Math.min(3.6,Lf/2-1),Math.min(3.6,Lf/2-1),0,.1,3.5,4.2,sign(SGN[ty][(rn()*SGN[ty].length)|0],ty==='shop'?'#2a3a2c':'#5a2a1f'))}
else{FB(-2.3,2.3,0,1.6,2.75,2.9,trimM,{s:1});[-2.1,2.1].forEach(q=>FB(q-.07,q+.07,1.4,1.54,0,2.75,railM,{s:1,c:1}));if(ty!=='apt')FB(-3,3,0,.1,3.5,4.2,sign(SGN[ty][(rn()*SGN[ty].length)|0],ty==='hotel'?'#5a1f1f':'#1d2b3a'))}}
// équipements de toit
for(let q=0;q<2+((rn()*3)|0);q++){const u=t+SL+2+rn()*(Lu-SL-5),v=(rn()*2-1)*(Hv-2.2);B(u-.6,u+.6,v-.6,v+.6,H,H+.8,acM,{s:1,c:1})}
if(ty==='apt'){const a=uw(Lu-3),tk=new THREE.Mesh(new THREE.CylinderGeometry(1,1,1.8,12),wd2);tk.position.set(X?a:cv,Y+H+1.5,X?cv:a);tk.castShadow=true;S.add(tk);B(Lu-3.9,Lu-2.1,-.9,.9,H,H+.6,trimM,{s:1,c:1})}
if(fl>4){const a=uw(Lu-5),an=new THREE.Mesh(new THREE.CylinderGeometry(.04,.06,6,6),std(0x444));an.position.set(X?a:cv+2,Y+H+3,X?cv+2:a);S.add(an)}
(window.CITYB=window.CITYB||[]).push({cx,cz,w,d,fl,ty,face,H,Lu,Hv,W:(u,v)=>{const a=uw(u);return X?[a,cv+v]:[cv+v,a]}});
const hx=w/2-t,hz=d/2-t;if(w>=d)ROOMS.push({x:cx-w/4,z:cz,hx:hx/2,hz,bun:0},{x:cx+w/4,z:cz,hx:hx/2,hz,bun:0});else ROOMS.push({x:cx,z:cz-d/4,hx,hz:hz/2,bun:0},{x:cx,z:cz+d/4,hx,hz:hz/2,bun:0})}
// --- placement par îlot : volumes variés (tour + annexe, hôtel + aile, cours)
const mdlAtL=(...a)=>lazy([a[1],a[1],a[3],a[3]],()=>mdlAt(...a)),tree=(x,z)=>lazy([x,x,z,z],()=>tree0(x,z)),tree0=(x,z)=>{const tr=new THREE.Mesh(new THREE.CylinderGeometry(.18,.28,3.6,6),std(0x5a4330));tr.position.set(x,Y+1.8,z);tr.castShadow=true;S.add(tr);const cr=new THREE.Mesh(new THREE.IcosahedronGeometry(2.2,1),std(0x3f7a3a,{roughness:1}));cr.position.set(x,Y+4.6,z);cr.castShadow=true;S.add(cr);boxes.push({x0:x-.3,x1:x+.3,z0:z-.3,z1:z+.3,y0:Y,y1:Y+3.6})};
BZ.forEach(([z0,z1],j)=>BX.forEach(([x0,x1],i)=>{const ty=GRID[j][i],cx=(x0+x1)/2,cz=(z0+z1)/2,ix0=x0+5,ix1=x1-5,iz0=z0+5,iz1=z1-5,IW=ix1-ix0,ID=iz1-iz0;
if(ty==='park'){const g=new THREE.Mesh(new THREE.BoxGeometry(x1-x0-2,.04,z1-z0-2),std(0x4c7a3a,{roughness:1}));g.position.set(cx,Y+.1,cz);g.receiveShadow=true;S.add(g);
const fo=new THREE.Mesh(new THREE.CylinderGeometry(4,4.4,.6,20),concM);fo.position.set(cx,Y+.38,cz);fo.castShadow=true;S.add(fo);boxes.push({x0:cx-4.2,x1:cx+4.2,z0:cz-4.2,z1:cz+4.2,y0:Y,y1:Y+.7});solids.push(fo);
const wt=new THREE.Mesh(new THREE.CylinderGeometry(3.5,3.5,.1,20),std(0x3f6a8a,{roughness:.1,metalness:.2}));wt.position.set(cx,Y+.62,cz);S.add(wt);
for(let k=0;k<4;k++){const a=k*1.5708+.78,bx=cx+Math.cos(a)*9,bz=cz+Math.sin(a)*9;blk(2,.5,.6,bx,Y+.3,bz,std(0x6a4a2c),{s:1,c:1});mdlAtL('bike',bx+1.6,0,bz,a,.25,.9,1.1,1)}
for(let k=0;k<12;k++){const a=rn()*6.28,r=10+rn()*22,x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r;if(Math.abs(x-cx)>(x1-x0)/2-4||Math.abs(z-cz)>(z1-z0)/2-4)continue;tree(x,z)}return}
const place=(p,L,Sd,fl,bt,alt)=>{const[a0,a1,c0,c1]=p,pcx=(a0+a1)/2,pcz=(c0+c1)/2,dx=(pcx-cx)/IW,dz=(pcz-cz)/ID,ew=Math.abs(dx)>Math.abs(dz)+.01||(Math.abs(Math.abs(dx)-Math.abs(dz))<=.01&&alt),face=ew?(dx>0?'E':'W'):(dz>0?'S':'N');
const w=Math.min(a1-a0,ew?Sd:L),d=Math.min(c1-c0,ew?L:Sd),al=(q0,q1,i0,i1,sz)=>q0===i0&&q1!==i1?q0+sz/2:q1===i1&&q0!==i0?q1-sz/2:(q0+q1)/2;
const bx=face==='E'?a1-w/2:face==='W'?a0+w/2:al(a0,a1,ix0,ix1,w),bz=face==='S'?c1-d/2:face==='N'?c0+d/2:al(c0,c1,iz0,iz1,d),s0=(rn()*4e9)>>>0;lazy([bx-w/2-2,bx+w/2+2,bz-d/2-2,bz+d/2+2],()=>{const sv=sd;sd=s0;bld(bx,bz,w,d,fl,bt,face);sd=sv})};
const mx=cx,mz=cz,Q=[[ix0,mx-3,iz0,mz-3],[mx+3,ix1,iz0,mz-3],[ix0,mx-3,mz+3,iz1],[mx+3,ix1,mz+3,iz1]];
if(ty==='off'){const lr=IW>=ID,A=lr?[ix0,mx-3,iz0,iz1]:[ix0,ix1,iz0,mz-3],Bc=lr?[mx+3,ix1,iz0,iz1]:[ix0,ix1,mz+3,iz1],sw=rn()<.5;place(sw?A:Bc,40,22,6+((rn()*3)|0),'off',0);place(sw?Bc:A,28,20,3+((rn()*2)|0),'off',0)}
else if(ty==='hotel'){const lr=IW>=ID,A=lr?[ix0,ix1,iz0,mz-3]:[ix0,mx-3,iz0,iz1],Bc=lr?[ix0,ix1,mz+3,iz1]:[mx+3,ix1,iz0,iz1];place(A,46,22,5+((rn()*2)|0),'hotel',0);place(lr?[ix0,ix0+22,Bc[2],Bc[3]]:[Bc[0],Bc[1],iz0,iz0+22],22,16,2,'resto',0);const tx=lr?ix1-8:(Bc[0]+Bc[1])/2,tz=lr?(Bc[2]+Bc[3])/2:iz1-8;tree(tx,tz);tree(tx-(lr?9:0),tz-(lr?0:9))}
else if(ty==='apt'){const yd=(rn()*4)|0;Q.forEach((p,q)=>{if(q===yd){const px=(p[0]+p[1])/2,pz=(p[2]+p[3])/2;tree(px-4,pz-3);tree(px+4,pz+2);tree(px,pz+6);mdlAtL('bike',px+2,0,pz-5,rn()*6.28,.3,.9,1.1,1);return}place(p,30,16,3+((rn()*4)|0),'apt',q%2)})}
else{const ot=ty==='shop'?'resto':'shop',oi=(rn()*4)|0;Q.forEach((p,q)=>place(p,24,16,2+((rn()*2)|0),q===oi?ot:ty,q%2))}
for(let k=0;k<2;k++)if(rn()<.8){const bx=x0+4+rn()*(x1-x0-8),bz=rn()<.5?z0+2.2:z1-2.2;mdlAtL('bike',bx,0,bz,rn()*6.28,.3,.9,1.1,1)}
// bouches d'incendie (2 par îlot, sur le trottoir)
[[x0+1.3,z0+7],[x1-1.3,z1-7]].forEach(q=>lazy([q[0],q[0],q[1],q[1]],()=>hydrant(q[0],q[1])))}));
// --- voitures garées (Mustang importée ou caisse) + lampadaires
const COL=[0x8a1f1f,0x1f3a6a,0xb8b8b8,0x222222,0x6a6a2a,0x2a5a3a];
const cars=(vert,f,half)=>{const a0=vert?-692:158,a1=vert?-358:492;for(let u=a0;u<=a1;u+=17+((rn()*14)|0)){const side=(rn()<.5?-1:1)*(half-1.5),px=vert?f+side:u,pz=vert?u:f+side;
if(rn()<.35)continue;if((vert?SZ:SX).some(([g,w])=>Math.abs(u-g)<w/2+5))continue;
if(rn()<.5){const e=mdlAtL((rn()<.5?'car:':'mazda:')+((rn()*8)|0),px,0,pz,vert?(side>0?0:Math.PI):(side>0?Math.PI/2:-Math.PI/2),vert?1.15:2.3,vert?2.3:1.15,1.4,1);continue}
const cl=std(COL[(rn()*6)|0],{roughness:.4,metalness:.4}),lw=vert?1.8:4.2,ld=vert?4.2:1.8;blk(lw,.9,ld,px,Y+.65,pz,cl,{s:1,c:1});blk(vert?1.6:2.2,.7,vert?2.2:1.6,px,Y+1.45,pz,std(0x141b22,{roughness:.1,metalness:.3}),{s:1,c:1});blk(lw-.1,.3,ld-.1,px,Y+.2,pz,std(0x111111),{ns:1})}};
SX.forEach(([x,w])=>cars(1,x,w/2));SZ.forEach(([z,w])=>cars(0,z,w/2));
// --- lampadaires (mât conique, crosse, lanterne, halo au sol la nuit)
const lampM2=new THREE.MeshBasicMaterial({color:0xfff0c8,toneMapped:false}),polM=std(0x2f3438,{roughness:.5,metalness:.6});
const poolT=(()=>{const[c,g]=mkC(128,128),gr=g.createRadialGradient(64,64,2,64,64,64);gr.addColorStop(0,'rgba(255,225,170,1)');gr.addColorStop(.5,'rgba(255,215,150,.35)');gr.addColorStop(1,'rgba(255,210,140,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);return new THREE.CanvasTexture(c)})();
const poolM=new THREE.MeshBasicMaterial({map:poolT,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3});
setInterval(()=>{if(typeof TOD==='undefined')return;const n=TOD.t<6.3||TOD.t>18.7;poolM.opacity=n?.5:0;lampM2.color.setHex(n?0xfff0c8:0x8f8a7c)},1500);
const lamp=(x,z,dx,dz)=>lazy([x,x,z,z],()=>lamp0(x,z,dx,dz)),lamp0=(x,z,dx,dz)=>{const add=(g,m,px,py,pz,rz,rx)=>{const e=new THREE.Mesh(g,m);e.position.set(x+px,Y+py,z+pz);if(rz)e.rotation.z=rz;if(rx)e.rotation.x=rx;e.castShadow=true;S.add(e);return e};
add(new THREE.CylinderGeometry(.2,.24,.5,8),polM,0,.25,0);add(new THREE.CylinderGeometry(.06,.11,7.2,8),polM,0,3.9,0);
add(new THREE.BoxGeometry(dx?1.9:.09,.09,dz?1.9:.09),polM,dx*.85,7.75,dz*.85,dx?dx*.28:0,dz?-dz*.28:0);
add(new THREE.BoxGeometry(dx?.9:.36,.14,dz?.9:.36),polM,dx*1.9,8.05,dz*1.9);const h=add(new THREE.BoxGeometry(dx?.7:.26,.05,dz?.7:.26),lampM2,dx*1.9,7.96,dz*1.9);h.castShadow=false;
const p=new THREE.Mesh(new THREE.CircleGeometry(8,20),poolM);p.rotation.x=-Math.PI/2;p.position.set(x+dx*1.9,Y+.13,z+dz*1.9);p.renderOrder=2;S.add(p);
boxes.push({x0:x-.2,x1:x+.2,z0:z-.2,z1:z+.2,y0:Y,y1:Y+3})};
SX.forEach(([x,w])=>{for(let z=-692;z<=-358;z+=34){if(SZ.some(([g,ww])=>Math.abs(z-g)<ww/2+3))continue;lamp(x-w/2-1.4,z,1,0);lamp(x+w/2+1.4,z+17,-1,0)}});
SZ.forEach(([z,w])=>{for(let x=158;x<=492;x+=34){if(SX.some(([g,ww])=>Math.abs(x-g)<ww/2+3))continue;lamp(x,z-w/2-1.4,0,1);lamp(x+17,z+w/2+1.4,0,-1)}});
})();
