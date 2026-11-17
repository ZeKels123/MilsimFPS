// ================= v50 : PROPS 3D (sacs de sable, caisses de munitions, barrière béton + grillage) =================
// Modèles Sketchfab (crédits : docs/CREDITS_ASSETS.md), convertis par tools/props_export.py : géométrie fusionnée par texture, textures JPEG/PNG réduites.
// Petits camps placés près des ancres des escouades ennemies : couverts réels (tir bloqué selon le matériau), collision avec hauteur (on saute par-dessus un sac de sable),
// les soldats les contournent (grille de navigation) et le grillage laisse passer les balles et la vue.
const P3D={tex:[],list:[],done:0,tries:0,camps:0};
const P3S={sandbag:{sc:1,bm:'conc',h:.62},crate:{sc:.45,bm:'wood',h:.375},jersey:{sc:1,bm:'conc',h:3.85,fence:1},tent:{sc:.0075,bm:'plas',h:2.1},barrel:{sc:1,bm:'steel',h:.9},tower:{sc:.0095,bm:'wood',h:8.8},wire:{sc:1,bm:'wood',h:1.2},jeep:{sc:.0097,bm:'veh',h:2.1},
 // v59 : décor procédural original (tools/proc_props.py), échelle 1 = mètres
 cmdtent:{sc:1,bm:'plas',h:3.2},messtable:{sc:1,bm:'wood',h:.8},generator:{sc:1,bm:'steel',h:1.6},mast:{sc:1,bm:'steel',h:15.2},floodlight:{sc:1,bm:'steel',h:4},carwreck:{sc:1,bm:'veh',h:1.45},tankwreck:{sc:1,bm:'steel',h:2.3},
 fueltank:{sc:1,bm:'steel',h:2.9},pallets:{sc:1,bm:'wood',h:.6},container:{sc:1,bm:'steel',h:2.6},flag:{sc:1,bm:'steel',h:6.2},heli:{sc:1,bm:'veh',h:3.9},supply:{sc:1,bm:'wood',h:1.2}};
function p3dB(s,T){const b=atob(s),n=b.length,u=new Uint8Array(n);for(let i=0;i<n;i++)u[i]=b.charCodeAt(i);return new T(u.buffer)}
function p3dTex(i){if(P3D.tex[i])return P3D.tex[i];const im=new Image(),t=new THREE.Texture(im);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;t.wrapS=t.wrapT=THREE.RepeatWrapping;im.onload=()=>{t.needsUpdate=true};im.src=P3D_TEX[i];return P3D.tex[i]=t}
const P3G={};
function p3dMake(name){const d=P3D_DATA[name],g=new THREE.Group();let G=P3G[name];
 if(!G){G=P3G[name]=d.parts.map(pt=>{const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(p3dB(pt.p,Float32Array),3));geo.setAttribute('normal',new THREE.BufferAttribute(p3dB(pt.nr,Float32Array),3));geo.setAttribute('uv',new THREE.BufferAttribute(p3dB(pt.u,Float32Array),2));geo.setIndex(new THREE.BufferAttribute(p3dB(pt.i,Uint16Array),1));geo.computeBoundingSphere();
  const mat=new THREE.MeshStandardMaterial({roughness:.92,metalness:.04});if(pt.ti!=null&&pt.ti!==undefined){mat.map=p3dTex(pt.ti);if(!pt.alpha){const k=name==='jersey'?4.5:name==='crate'?1.8:name==='tent'?6:1;mat.color.setRGB(k,k,k)}}else mat.color.setRGB(pt.col[0],pt.col[1],pt.col[2]);if(pt.alpha){mat.alphaTest=.5;mat.side=THREE.DoubleSide}return{geo,mat,alpha:pt.alpha}})}
 G.forEach(q=>{const m=new THREE.Mesh(q.geo,q.mat);m.castShadow=!q.alpha;m.receiveShadow=true;m.userData.p3dAlpha=q.alpha;g.add(m)});return g}
function p3dNav(o){const m=.3;const i0=Math.max(0,Math.ceil((o.x0-m+MH)/NS-.5)),i1=Math.min(NGN-1,Math.floor((o.x1+m+MH)/NS-.5)),j0=Math.max(0,Math.ceil((o.z0-m+MH)/NS-.5)),j1=Math.min(NGN-1,Math.floor((o.z1+m+MH)/NS-.5));for(let j=j0;j<=j1;j++)for(let k=i0;k<=i1;k++)NAVB[j*NGN+k]=1}
function p3dPut(name,x,z,yaw,gy0){const c=P3S[name],g=p3dMake(name),gy=gy0!==undefined?gy0:GH(x,z);g.scale.setScalar(c.sc);g.rotation.y=yaw;g.position.set(x,gy,z);S.add(g);g.updateMatrixWorld(true);
 const bb=P3D_DATA[name].bb,w=bb[0]*c.sc,d=bb[2]*c.sc,co=Math.abs(Math.cos(yaw)),si=Math.abs(Math.sin(yaw)),hx=(w*co+d*si)/2,hz=(w*si+d*co)/2;
 const box={x0:x-hx,x1:x+hx,z0:z-hz,z1:z+hz,y0:gy-.2,y1:gy+c.h,p3d:name};boxes.push(box);p3dNav(box);
 g.children.forEach(m=>{if(m.userData.p3dAlpha)return;m.userData.bmat=c.bm;m.userData.p3d=name;solids.push(m);ray.push(m)});
 g.traverse(o=>{o.matrixAutoUpdate=false});const r=Math.max(hx,hz);const it={name,x,z,r,g,box};P3D.list.push(it);return it}
// mirador : plateforme à 7,4 m (surface marchable) + escalier droit axé sur le monde ; la colonne pleine est réduite au noyau pour qu'on puisse monter
const P3W=new THREE.MeshStandardMaterial({color:0x6b5a44,roughness:.9});
function p3dRamp(x,z){const L=9.5;for(const d of [[1,0],[-1,0],[0,1],[0,-1]]){let ok=true;for(let t=1.8;t<=1.8+L+2&&ok;t+=1.2)for(const w of [-.9,0,.9]){const px=x+d[0]*t+d[1]*w,pz=z+d[1]*t+d[0]*w;if(!free_(px,pz)||!nFree(px,pz)||inRoom(px,pz)>=0||GH(px,pz)<(typeof WL!=='undefined'?WL:0)+.4||Math.abs(GH(px,pz)-GH(x,z))>3){ok=false;break}}if(ok)return d}return null}
// plancher réel du modèle : y=6,5 m, centre décalé de (-0,78 ; +0,72) dans le repère du modèle (mesuré sur la géométrie) ; la rotation du modèle déplace ce centre
function p3dTowerUp(it,d){const H=6.5,L=9.5,gy=GH(it.x,it.z),yw=it.g.rotation.y,ox=-.78,oz=.72,x=it.x+ox*Math.cos(yw)+oz*Math.sin(yw),z=it.z-ox*Math.sin(yw)+oz*Math.cos(yw),b=it.box;
 b.x0=x-1.5;b.x1=x+1.5;b.z0=z-1.5;b.z1=z+1.5;b.y1=gy+H;surfRect(x-2,x+2,z-2,z+2,gy+H);
 const xa=x+d[0]*(2+L),za=z+d[1]*(2+L),xb=x+d[0]*2,zb=z+d[1]*2;
 const s0=solids.length,r=stairs(xa,za,xb,zb,1.5,GH(xa,za),gy+H,P3W,{rail:1});for(let i=s0;i<solids.length;i++)ray.push(solids[i]);it.ramp=r;
 {const ps=[[-1.5,-1.5],[1.5,-1.5],[-1.5,1.5],[1.5,1.5]].map(q=>[x+q[0],z+q[1],Math.atan2(q[0],q[1]),0]),F=[xa,za],mid=[(xa+xb)/2,(za+zb)/2],top=[xb,zb],ctr=[x,z];
  UPH.push({cx:x,cz:z,FT:gy,RT:gy+H+1.5,iF:F,iA:F,iB:mid,iL:ctr,iM:ctr,iN:ctr,posts:[],rF:F,rA:top,rB:ctr,rL:ctr,rM:ctr,roofPosts:ps,rect:[x-2,x+2,z-2,z+2],hole:null,floor:null,tower:1})}
 p3dNav({x0:Math.min(xa,xb)-.8,x1:Math.max(xa,xb)+.8,z0:Math.min(za,zb)-.8,z1:Math.max(za,zb)+.8});it.top=gy+H;it.cx=x;it.cz=z;return r}
function p3dOK(x,z,r,ign){try{if(!free_(x,z)||!nFree(x,z)||cityBad(x,z))return false;if(typeof CT!=='undefined'&&Math.abs(x-CT.ax)<7+r&&z>CT.z1+3)return false;if(typeof BRG!=='undefined'&&BRG.some(b=>Math.abs(x-b.x)<5+r&&Math.abs(z-b.z)<b.hl+4+r))return false;
 if(boxes.some(o=>o.p3d?false:(x+r>o.x0-.3&&x-r<o.x1+.3&&z+r>o.z0-.3&&z-r<o.z1+.3)))return false;if(bots.some(b=>!b.dead&&Math.hypot(b.g.position.x-x,b.g.position.z-z)<r+1.5))return false;for(const a of [[r,0],[-r,0],[0,r],[0,-r]])if(GH(x+a[0],z+a[1])<(typeof WL!=='undefined'?WL:0)+.4)return false;if(inRoom(x,z)>=0)return false;const y=GH(x,z);if(y<(typeof WL!=='undefined'?WL:0)+.4)return false;
 if(Math.abs(GH(x+r,z)-GH(x-r,z))>.6||Math.abs(GH(x,z+r)-GH(x,z-r))>.6)return false;if(Math.hypot(x-P.x,z-P.z)<14||Math.hypot(x,z-25)<35)return false;
 for(const o of P3D.list)if(Math.hypot(o.x-x,o.z-z)<o.r+r+.4)return false;return true}catch(e){return false}}
// un camp autour d'une ancre : couverts de sacs de sable en arc, caisses, barrière béton au fond
function p3dCamp(ax,az){let n=0;const a0=Math.random()*6.283;
 for(let k=0;k<3;k++){for(let t=0;t<8;t++){const a=a0+k*2.1+Math.random()*.6,d=5+Math.random()*3,x=ax+Math.sin(a)*d,z=az+Math.cos(a)*d;if(p3dOK(x,z,.9)){p3dPut('sandbag',x,z,a+Math.PI/2+(Math.random()-.5)*.3);n++;break}}}
 for(let k=0;k<2;k++){for(let t=0;t<8;t++){const a=Math.random()*6.283,d=3+Math.random()*3,x=ax+Math.sin(a)*d,z=az+Math.cos(a)*d;if(p3dOK(x,z,.6)){const it=p3dPut('crate',x,z,Math.random()*6.283);n++;break}}}
 for(let t=0;t<10;t++){const a=Math.random()*6.283,d=11+Math.random()*4,x=ax+Math.sin(a)*d,z=az+Math.cos(a)*d,h=Math.random()<.5?0:Math.PI/2,L=3.7;
  if(p3dOK(x,z,2)&&p3dOK(x+(h?0:L),z+(h?L:0),1.2)&&p3dOK(x-(h?0:L),z-(h?L:0),1.2)){p3dPut('jersey',x,z,h);n++;break}}
 if(Math.random()<.6)for(let t=0;t<12;t++){const a=Math.random()*6.283,d=15+Math.random()*5,x=ax+Math.sin(a)*d,z=az+Math.cos(a)*d;if(p3dOK(x,z,4)){p3dPut('tent',x,z,Math.random()*6.283);n++;break}}
 for(let k=0;k<3;k++){for(let t=0;t<8;t++){const a=Math.random()*6.283,d=3+Math.random()*4,x=ax+Math.sin(a)*d,z=az+Math.cos(a)*d;if(p3dOK(x,z,.7)){p3dPut('barrel',x,z,Math.random()*6.283);n++;break}}}
 if(Math.random()<.7)for(let t=0;t<10;t++){const a=Math.random()*6.283,d=9+Math.random()*3,h=Math.random()*3.1416,x=ax+Math.sin(a)*d,z=az+Math.cos(a)*d,L=1.5,dx=Math.sin(h)*L,dz=Math.cos(h)*L;
  if(p3dOK(x,z,.9)&&p3dOK(x+dx,z+dz,.9)&&p3dOK(x-dx,z-dz,.9)){[-1,0,1].forEach(i=>p3dPut('wire',x+dx*i,z+dz*i,h-Math.PI/2));n+=3;break}}
 if(Math.random()<.3)for(let t=0;t<12;t++){const a=Math.random()*6.283,d=12+Math.random()*4,x=ax+Math.sin(a)*d,z=az+Math.cos(a)*d;if(p3dOK(x,z,2.6)){const jp=p3dPut('jeep',x,z,Math.random()*6.283);if(typeof jeepDrv==='function')jeepDrv(jp);n++;break}}
 if(Math.random()<.35)for(let t=0;t<12;t++){const a=Math.random()*6.283,d=21+Math.random()*5,x=ax+Math.sin(a)*d,z=az+Math.cos(a)*d;const dr=p3dOK(x,z,4.5)&&p3dRamp(x,z);if(dr){const it=p3dPut('tower',x,z,Math.floor(Math.random()*4)*Math.PI/2);p3dTowerUp(it,dr);n++;break}}
 if(n)P3D.camps++;return n}
// v59 : sélection de décor supplémentaire autour d'une ancre (camp) puis épaves/containers dispersés sur la carte
function p3dRing(name,ax,az,d0,d1,r,tries,rot){for(let t=0;t<(tries||10);t++){const a=Math.random()*6.283,d=d0+Math.random()*(d1-d0),x=ax+Math.sin(a)*d,z=az+Math.cos(a)*d;if(p3dOK(x,z,r)){const y=rot===undefined?Math.random()*6.283:rot;const it=p3dPut(name,x,z,y,p3dLow(x,z,r));return it}}return null}
function p3dLow(x,z,r){let m=GH(x,z);for(const a of [[r,0],[-r,0],[0,r],[0,-r]])m=Math.min(m,GH(x+a[0]*.7,z+a[1]*.7));return m-.03}
function p3dCamp2(ax,az){let n=0;const A=(nm,pr,d0,d1,r,t)=>{if(Math.random()<pr&&p3dRing(nm,ax,az,d0,d1,r,t))n++};
 A('cmdtent',.3,17,23,5.5,14);A('messtable',.45,6,10,2,10);A('generator',.45,5,9,1.1,10);A('supply',.55,4,9,2.2,10);A('pallets',.45,5,10,2.4,10);A('floodlight',.45,6,11,1.2,10);A('flag',.3,4,8,.8,10);
 A('mast',.2,24,30,1.6,12);A('container',.28,13,20,3.6,14);A('fueltank',.2,12,19,3.6,14);return n}
function p3dField(){let n=0;const L=[['carwreck',6,2.6],['tankwreck',3,4.8],['heli',2,5.5],['container',3,3.6],['fueltank',1,3.6],['pallets',3,2.4],['supply',3,2.2]];
 for(const e of L)for(let k=0;k<e[1];k++)for(let t=0;t<60;t++){const a=Math.random()*6.283,d=45+Math.random()*(MH*.5),x=Math.sin(a)*d,z=25+Math.cos(a)*d;if(Math.abs(x)>MH-30||Math.abs(z)>MH-30)continue;if(p3dOK(x,z,e[2])){p3dPut(e[0],x,z,Math.random()*6.283,p3dLow(x,z,e[2]*.8));n++;break}}return n}
function p3dTry(){P3D.tries++;const an=SQA.filter(Boolean);if(an.length<SQN&&P3D.tries<900)return;P3D.done=1;an.forEach(a=>{try{p3dCamp(a[0],a[1]);p3dCamp2(a[0],a[1])}catch(e){console.warn('camp',e)}});try{p3dField()}catch(e){console.warn('field',e)}if(typeof navEject==='function')navEject()}
{const _fx=fxFrame;fxFrame=function(dt){if(!P3D.done&&typeof SQA!=='undefined'&&!MM_menuOpen())p3dTry();return _fx.apply(this,arguments)}}
function MM_menuOpen(){try{return $('mm').style.display!=='none'}catch(e){return false}}
