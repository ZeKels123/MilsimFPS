// ================= v61 : PHARES DE VÉHICULES (nuit) + ÉBLOUISSEMENT =================
// Aucune lumière réelle (pas de recompilation des matériaux, coût négligeable) : deux faisceaux volumétriques additifs, une flaque lumineuse qui épouse le relief
// devant le véhicule, des halos. Le véhicule conduit allume ses phares la nuit ; une partie des camions et blindés garés de la route, moteur au ralenti, aussi.
// Regarder droit dans des phares tournés vers soi éblouit : voile blanc qui se dissipe lentement (et surexposition des jumelles de vision nocturne).
const HL={recs:[],t:0,gz:0,tg:0,el:null,beam:null,poolT:null,mat:null,flat:null,occT:0,occ:1,sx:50,sy:50,lit:0};
const _phv=new THREE.Vector3(),_phd=new THREE.Vector3(),_phw=new THREE.Vector3(),_phb=new THREE.Box3();
const hlNight=()=>typeof TOD!=='undefined'&&(TOD.t>19.3||TOD.t<5.7);
function hlAssets(){if(HL.mat)return;const L=26,g=new THREE.CylinderGeometry(2.7,.12,L,14,6,true);g.translate(0,L/2,0);g.rotateX(-Math.PI/2);
const pos=g.attributes.position,col=new Float32Array(pos.count*3);for(let i=0;i<pos.count;i++){const t=Math.min(1,-pos.getZ(i)/L),k=Math.pow(1-t,1.6)*.9;col[i*3]=col[i*3+1]=col[i*3+2]=k}g.setAttribute('color',new THREE.BufferAttribute(col,3));HL.beam=g;
HL.mat=new THREE.MeshBasicMaterial({color:0xfff0c8,vertexColors:true,transparent:true,opacity:.22,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false,toneMapped:false});
HL.poolT=fxT(64,(x,w)=>{const g=x.createRadialGradient(w/2,w*.42,0,w/2,w*.42,w*.5);g.addColorStop(0,'rgba(255,240,200,.85)');g.addColorStop(.5,'rgba(255,232,180,.35)');g.addColorStop(1,'rgba(255,225,160,0)');x.fillStyle=g;x.fillRect(0,0,w,w)});
HL.flat=new THREE.MeshBasicMaterial({map:HL.poolT,color:0xffffff,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3});
const e=document.createElement('div');e.id='hlglare';e.style.cssText='position:fixed;inset:0;z-index:6;pointer-events:none;opacity:0;display:none';document.body.appendChild(e);HL.el=e}
function hlVehs(){const o=[];try{for(const r of dstS().list)if(r.e&&r.px&&r.px.userData.bmat==='veh')o.push(r)}catch(e){}return o}
// installe les phares d'un véhicule (une seule fois) ; ne dépend que de la boîte englobante du modèle (avant = -z local)
function hlInit(r){if(r.hl)return r.hl;hlAssets();const e=r.e,ry=e.rotation.y,rx=e.rotation.x,rz=e.rotation.z;e.rotation.set(0,0,0);e.updateMatrixWorld(true);if(r.hlG)r.hlG.visible=false;_phb.setFromObject(e);e.rotation.set(rx,ry,rz);e.updateMatrixWorld(true);
const p=e.position,mn=_phb.min.clone().sub(p),mx=_phb.max.clone().sub(p),hw=Math.max(.6,(mx.x-mn.x)/2),len=mx.z-mn.z,cx=(mx.x+mn.x)/2,hy=mn.y+(mx.y-mn.y)*.34;
const g=new THREE.Group();g.userData.noLayer=1;g.visible=false;
[-1,1].forEach(s=>{const b=new THREE.Mesh(HL.beam,HL.mat);b.position.set(cx+s*hw*.6,hy,mn.z-.05);b.rotation.x=-.07;b.rotation.y=s*.03;b.frustumCulled=false;b.renderOrder=3;g.add(b);
if(typeof flareT!=='undefined'){const f=new THREE.Sprite(new THREE.SpriteMaterial({map:flareT,color:0xfff2c8,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,toneMapped:false,fog:false}));f.scale.set(1.5,1.5,1);f.position.set(cx+s*hw*.6,hy,mn.z-.12);g.add(f)}});
e.add(g);const pg=new THREE.PlaneGeometry(9,17,6,10);pg.rotateX(-Math.PI/2);const pool=new THREE.Mesh(pg,HL.flat);pool.frustumCulled=false;pool.visible=false;pool.renderOrder=2;pool.userData.noLayer=1;S.add(pool);
const h={g,pool,front:-mn.z,fz:mn.z,hy,len,cx,x:1e9,z:1e9,y:1e9};r.hl=h;
if(r.hlOn===undefined)r.hlOn=len>6&&(((Math.round(r.x*7)+Math.round(r.z*13))&1)===0)?1:0;return h}
function hlFwd(r,o){const y=r.e.rotation.y;return o.set(-Math.sin(y),0,-Math.cos(y))}
// flaque : sommets suivant le terrain (77 appels GH ; recalculée seulement si le véhicule a bougé)
function hlPool(r){const h=r.hl,e=r.e,f=hlFwd(r,_phd),px=e.position.x,pz=e.position.z,y=e.rotation.y;if(Math.abs(px-h.x)<.04&&Math.abs(pz-h.z)<.04&&Math.abs(y-h.y)<.01)return;h.x=px;h.z=pz;h.y=y;
const pos=h.pool.geometry.attributes.position,rx=-f.z,rz=f.x,base=h.front-.5;
// le plan est centré : x in [-4.5,4.5] (latéral), z in [-8.5,8.5] (-z = devant dans le repère du plan) -> on place la flaque 1 m devant puis jusqu'à 18 m
for(let i=0;i<pos.count;i++){const u=pos.getX(i),v=-pos.getZ(i)+8.5+1,wx=px+rx*u*-1+f.x*(base+v),wz=pz+rz*u*-1+f.z*(base+v);pos.setXYZ(i,wx,GH(wx,wz)+.07,wz)}
pos.needsUpdate=true}
function hlLit(r){return(r.hlOn||(DRV.on&&DRV.r===r))&&r.st===0&&r.hp>0}
// éblouissement : angle de regard vers le phare, véhicule tourné vers le joueur, distance, ligne de vue
function hlGlare(dt){let best=0,bx=50,by=50;C.getWorldPosition(_phv);C.getWorldDirection(_phw);
for(const r of HL.recs){const h=r.hl;if(!h||!h.g.visible||(DRV.on&&DRV.r===r))continue;const e=r.e;hlFwd(r,_phd);const lx=e.position.x+_phd.x*(h.front+.2),lz=e.position.z+_phd.z*(h.front+.2),ly=e.position.y+h.hy;
let dx=lx-_phv.x,dy=ly-_phv.y,dz=lz-_phv.z;const d=Math.hypot(dx,dy,dz);if(d>110||d<1.5)continue;dx/=d;dy/=d;dz/=d;
const look=_phw.x*dx+_phw.y*dy+_phw.z*dz,face=-(_phd.x*dx+_phd.z*dz);if(look<.9||face<.72)continue;
const g=Math.min(1,(look-.9)/.08)*Math.min(1,(face-.72)/.2)*Math.min(1,Math.max(0,1.15-d/110)*1.4);if(g>best){best=g;HL.occ0=[lx,ly,lz,d,r];
const v=_phb.min.set(lx,ly,lz).project(C);bx=(v.x*.5+.5)*100;by=(1-(v.y*.5+.5))*100}}
// ligne de vue (un seul rayon, au plus 8 fois par seconde)
if(best>.05&&HL.occ0){HL.occT-=dt;if(HL.occT<=0){HL.occT=.12;const[lx,ly,lz,d,r]=HL.occ0;_phd.set(lx-_phv.x,ly-_phv.y,lz-_phv.z).multiplyScalar(1/d);RC.set(_phv,_phd);RC.far=Math.max(.1,d-.6);let n=0;for(const q of RC.intersectObjects(solids))if(q.object!==r.px&&!q.object.userData.glass){n=1;break}HL.occ=n?0:1}best*=HL.occ}
if(NVG&&NVG.on&&NVG.a>.5)best=Math.min(1,best*1.4);
HL.tg=best;if(best>HL.gz)HL.gz+=(best-HL.gz)*Math.min(1,dt*9);else HL.gz=Math.max(best,HL.gz-dt*.45);if(best>0){HL.sx=bx;HL.sy=by}
if(NVG&&NVG.on&&HL.gz>.15)NVG.sat=Math.max(NVG.sat,HL.gz*.85)}
function hlTick(dt){if(typeof dstS!=='function'||typeof C==='undefined')return;
const night=hlNight();HL.t-=dt;
if(HL.t<=0){HL.t=.4;HL.recs=[];if(night){const px=P.x,pz=P.z;for(const r of hlVehs()){if(Math.hypot(r.e.position.x-px,r.e.position.z-pz)>230)continue;hlInit(r);HL.recs.push(r)}}else if(HL.mat)for(const r of hlVehs())if(r.hl){r.hl.g.visible=false;r.hl.pool.visible=false}}
let lit=0;for(const r of HL.recs){const h=r.hl;if(!h)continue;const on=hlLit(r);h.g.visible=on;h.pool.visible=on;if(on){lit++;hlPool(r)}}
// véhicule hors zone ou éteint la nuit
if(night)for(const r of hlVehs()){const h=r.hl;if(h&&h.g.visible&&(!HL.recs.includes(r)||!hlLit(r))){h.g.visible=false;h.pool.visible=false}}
HL.lit=lit;
if(!HL.el&&!lit&&HL.gz<=0)return;hlAssets();
if(night&&lit&&!HM.dead)hlGlare(dt);else{HL.tg=0;HL.gz=Math.max(0,HL.gz-dt*.6)}
if(HL.gz>.01){const a=Math.min(.95,HL.gz*1.0);HL.el.style.display='block';HL.el.style.opacity=a.toFixed(2);if(HL.skx!==(HL.sx|0)||HL.sky!==(HL.sy|0)){HL.skx=HL.sx|0;HL.sky=HL.sy|0;HL.el.style.background='radial-gradient(circle at '+HL.skx+'% '+HL.sky+'%,rgba(255,252,235,1) 0,rgba(255,246,215,.9) 14%,rgba(255,240,205,.5) 38%,rgba(255,236,200,.28) 100%)'}}
else if(HL.el.style.display!=='none'){HL.el.style.display='none'}}
