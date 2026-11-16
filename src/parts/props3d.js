// ================= v50 : PROPS 3D (sacs de sable, caisses de munitions, barrière béton + grillage) =================
// Modèles Sketchfab (crédits : docs/CREDITS_ASSETS.md), convertis par tools/props_export.py : géométrie fusionnée par texture, textures JPEG/PNG réduites.
// Petits camps placés près des ancres des escouades ennemies : couverts réels (tir bloqué selon le matériau), collision avec hauteur (on saute par-dessus un sac de sable),
// les soldats les contournent (grille de navigation) et le grillage laisse passer les balles et la vue.
const P3D={tex:[],list:[],done:0,tries:0,camps:0};
const P3S={sandbag:{sc:1,bm:'conc',h:1.03},crate:{sc:.45,bm:'wood',h:.375},jersey:{sc:1,bm:'conc',h:3.85,fence:1}};
function p3dB(s,T){const b=atob(s),n=b.length,u=new Uint8Array(n);for(let i=0;i<n;i++)u[i]=b.charCodeAt(i);return new T(u.buffer)}
function p3dTex(i){if(P3D.tex[i])return P3D.tex[i];const im=new Image(),t=new THREE.Texture(im);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;t.wrapS=t.wrapT=THREE.RepeatWrapping;im.onload=()=>{t.needsUpdate=true};im.src=P3D_TEX[i];return P3D.tex[i]=t}
const P3G={};
function p3dMake(name){const d=P3D_DATA[name],g=new THREE.Group();let G=P3G[name];
 if(!G){G=P3G[name]=d.parts.map(pt=>{const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(p3dB(pt.p,Float32Array),3));geo.setAttribute('normal',new THREE.BufferAttribute(p3dB(pt.nr,Float32Array),3));geo.setAttribute('uv',new THREE.BufferAttribute(p3dB(pt.u,Float32Array),2));geo.setIndex(new THREE.BufferAttribute(p3dB(pt.i,Uint16Array),1));geo.computeBoundingSphere();
  const mat=new THREE.MeshStandardMaterial({roughness:.92,metalness:.04});if(pt.ti!=null&&pt.ti!==undefined){mat.map=p3dTex(pt.ti);if(!pt.alpha){const k=name==='jersey'?2.5:name==='crate'?1.5:1;mat.color.setRGB(k,k,k)}}else mat.color.setRGB(pt.col[0],pt.col[1],pt.col[2]);if(pt.alpha){mat.alphaTest=.5;mat.side=THREE.DoubleSide}return{geo,mat,alpha:pt.alpha}})}
 G.forEach(q=>{const m=new THREE.Mesh(q.geo,q.mat);m.castShadow=!q.alpha;m.receiveShadow=true;m.userData.p3dAlpha=q.alpha;g.add(m)});return g}
function p3dNav(o){const m=.3;const i0=Math.max(0,Math.ceil((o.x0-m+MH)/NS-.5)),i1=Math.min(NGN-1,Math.floor((o.x1+m+MH)/NS-.5)),j0=Math.max(0,Math.ceil((o.z0-m+MH)/NS-.5)),j1=Math.min(NGN-1,Math.floor((o.z1+m+MH)/NS-.5));for(let j=j0;j<=j1;j++)for(let k=i0;k<=i1;k++)NAVB[j*NGN+k]=1}
function p3dPut(name,x,z,yaw,gy0){const c=P3S[name],g=p3dMake(name),gy=gy0!==undefined?gy0:GH(x,z);g.scale.setScalar(c.sc);g.rotation.y=yaw;g.position.set(x,gy,z);S.add(g);g.updateMatrixWorld(true);
 const bb=P3D_DATA[name].bb,w=bb[0]*c.sc,d=bb[2]*c.sc,co=Math.abs(Math.cos(yaw)),si=Math.abs(Math.sin(yaw)),hx=(w*co+d*si)/2,hz=(w*si+d*co)/2;
 const box={x0:x-hx,x1:x+hx,z0:z-hz,z1:z+hz,y0:gy-.2,y1:gy+c.h,p3d:name};boxes.push(box);p3dNav(box);
 g.children.forEach(m=>{if(m.userData.p3dAlpha)return;m.userData.bmat=c.bm;m.userData.p3d=name;solids.push(m)});
 g.traverse(o=>{o.matrixAutoUpdate=false});const r=Math.max(hx,hz);const it={name,x,z,r,g,box};P3D.list.push(it);return it}
function p3dOK(x,z,r,ign){try{if(!free_(x,z)||!nFree(x,z))return false;if(inRoom(x,z)>=0)return false;const y=GH(x,z);if(y<(typeof WL!=='undefined'?WL:0)+.4)return false;
 if(Math.abs(GH(x+r,z)-GH(x-r,z))>.6||Math.abs(GH(x,z+r)-GH(x,z-r))>.6)return false;if(Math.hypot(x-P.x,z-P.z)<14||Math.hypot(x,z-25)<35)return false;
 for(const o of P3D.list)if(Math.hypot(o.x-x,o.z-z)<o.r+r+.4)return false;return true}catch(e){return false}}
// un camp autour d'une ancre : couverts de sacs de sable en arc, caisses, barrière béton au fond
function p3dCamp(ax,az){let n=0;const a0=Math.random()*6.283;
 for(let k=0;k<3;k++){for(let t=0;t<8;t++){const a=a0+k*2.1+Math.random()*.6,d=5+Math.random()*3,x=ax+Math.sin(a)*d,z=az+Math.cos(a)*d;if(p3dOK(x,z,.9)){p3dPut('sandbag',x,z,a+Math.PI/2+(Math.random()-.5)*.3);n++;break}}}
 for(let k=0;k<2;k++){for(let t=0;t<8;t++){const a=Math.random()*6.283,d=3+Math.random()*3,x=ax+Math.sin(a)*d,z=az+Math.cos(a)*d;if(p3dOK(x,z,.6)){const it=p3dPut('crate',x,z,Math.random()*6.283);n++;break}}}
 for(let t=0;t<10;t++){const a=Math.random()*6.283,d=11+Math.random()*4,x=ax+Math.sin(a)*d,z=az+Math.cos(a)*d,h=Math.random()<.5?0:Math.PI/2,L=3.7;
  if(p3dOK(x,z,2)&&p3dOK(x+(h?0:L),z+(h?L:0),1.2)&&p3dOK(x-(h?0:L),z-(h?L:0),1.2)){p3dPut('jersey',x,z,h);n++;break}}
 if(n)P3D.camps++;return n}
function p3dTry(){P3D.tries++;const an=SQA.filter(Boolean);if(an.length<SQN&&P3D.tries<900)return;P3D.done=1;an.forEach(a=>{try{p3dCamp(a[0],a[1])}catch(e){console.warn('camp',e)}})}
{const _fx=fxFrame;fxFrame=function(dt){if(!P3D.done&&typeof SQA!=='undefined'&&!MM_menuOpen())p3dTry();return _fx.apply(this,arguments)}}
function MM_menuOpen(){try{return $('mm').style.display!=='none'}catch(e){return false}}
