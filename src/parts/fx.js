
// ================= EFFETS VISUELS =================
gun.traverse(o=>{if(o.isMesh)o.receiveShadow=true});
const fxT=(w,fn)=>{const c=document.createElement('canvas');c.width=c.height=w;fn(c.getContext('2d'),w);return new THREE.CanvasTexture(c)};
const puffT=fxT(64,(x,w)=>{const g=x.createRadialGradient(w/2,w/2,0,w/2,w/2,w/2);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(.35,'rgba(255,255,255,.5)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,w,w)});
const sparkT=fxT(32,(x,w)=>{const g=x.createRadialGradient(16,16,0,16,16,16);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.3,'rgba(255,255,255,.9)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,w,w)});
const flareT=fxT(128,(x,w)=>{const g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,250,220,1)');g.addColorStop(.18,'rgba(255,200,110,.85)');g.addColorStop(.5,'rgba(255,140,40,.25)');g.addColorStop(1,'rgba(255,100,0,0)');x.fillStyle=g;x.fillRect(0,0,w,w);
x.globalCompositeOperation='lighter';x.fillStyle='rgba(255,215,150,.75)';[0,Math.PI/2,Math.PI/4,3*Math.PI/4].forEach((a,k)=>{x.save();x.translate(64,64);x.rotate(a);const l=k<2?62:36;x.beginPath();x.moveTo(-l,0);x.lineTo(0,-3);x.lineTo(l,0);x.lineTo(0,3);x.fill();x.restore()})});
const holeT=fxT(64,(x,w)=>{const g=x.createRadialGradient(32,32,0,32,32,30);g.addColorStop(0,'rgba(8,8,8,.95)');g.addColorStop(.3,'rgba(20,18,14,.85)');g.addColorStop(.7,'rgba(40,36,30,.35)');g.addColorStop(1,'rgba(40,36,30,0)');x.fillStyle=g;x.fillRect(0,0,w,w)});
const scorchT=fxT(128,(x,w)=>{const g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(10,8,6,.9)');g.addColorStop(.55,'rgba(14,11,8,.65)');g.addColorStop(1,'rgba(14,11,8,0)');x.fillStyle=g;x.fillRect(0,0,w,w)});
const _n=new THREE.Vector3(),_p=new THREE.Vector3(),_p2=new THREE.Vector3(),_e=new THREE.Vector3(),MZ=new THREE.Vector3();
// --- particules (pool de sprites)
const PN=240,pPool=[];let pI=0;
for(let i=0;i<PN;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:puffT,transparent:true,depthWrite:false}));s.visible=false;S.add(s);pPool.push({s,v:new THREE.Vector3(),life:0,max:1,a:1,gr:0,grow:0,drag:0,size:.1})}
function emit(pos,vel,o){const p=pPool[pI=(pI+1)%PN],m=p.s.material;p.s.position.copy(pos);p.v.copy(vel);p.life=p.max=o.life;p.a=o.a==null?1:o.a;p.gr=o.g||0;p.grow=o.grow||0;p.drag=o.drag||0;p.size=o.size;m.map=o.map||puffT;m.color.setHex(o.color==null?0xffffff:o.color);m.blending=o.add?THREE.AdditiveBlending:THREE.NormalBlending;m.rotation=Math.random()*6.28;m.opacity=p.a;p.s.scale.setScalar(p.size);p.s.visible=true}
function pUpdate(dt){for(const p of pPool){if(!p.s.visible)continue;p.life-=dt;if(p.life<=0){p.s.visible=false;continue}const k=p.life/p.max;p.v.y-=p.gr*dt;p.v.multiplyScalar(Math.max(0,1-p.drag*dt));p.s.position.addScaledVector(p.v,dt);p.size+=p.grow*dt;p.s.scale.setScalar(p.size);p.s.material.opacity=p.a*(k<.5?k*2:1)}}
// --- impacts / décals
const dcG=new THREE.PlaneGeometry(.16,.16),dcM=new THREE.MeshBasicMaterial({map:holeT,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}),dcP=[];let dcI=0;
for(let i=0;i<48;i++){const m=new THREE.Mesh(dcG,dcM);m.visible=false;S.add(m);dcP.push(m)}
function decal(p,n){const m=dcP[dcI=(dcI+1)%dcP.length];m.position.copy(p).addScaledVector(n,.012);m.lookAt(_e.copy(p).add(n));m.rotateZ(rnd(0,6.28));m.scale.setScalar(rnd(.7,1.4));m.visible=true}
function impact(h,door){_n.copy(h.face.normal).transformDirection(h.object.matrixWorld);_p.copy(h.point).addScaledVector(_n,.03);
for(let i=0;i<3;i++)emit(_p,_e.set(rnd(-.3,.3),rnd(.1,.5),rnd(-.3,.3)).addScaledVector(_n,.7),{color:door?0x9a7a50:0xb9b2a0,size:.1,grow:.45,life:.55,a:.45,drag:2.5,g:-.15});
for(let i=0;i<4;i++)emit(_p,_e.set(rnd(-1,1),rnd(-.5,1.2),rnd(-1,1)).addScaledVector(_n,2.2),{map:sparkT,color:door?0xd8b070:0xffc870,size:.045,life:.3,a:1,add:1,g:9,drag:.6});
if(!door)decal(h.point,_n)}
function hitFx(h,armor,brk,head,b){_p.copy(h.point);if(b)b.flinch=1;
if(armor||brk){for(let i=0;i<(brk?9:5);i++)emit(_p,_e.set(rnd(-1,1),rnd(0,1.2),rnd(-1,1)).multiplyScalar(2.4),{map:sparkT,color:brk?0xffe090:0xaad4ff,size:.05,life:.28,a:1,add:1,g:8,drag:.5})}
else for(let i=0;i<4;i++)emit(_p,_e.set(rnd(-.5,.5),rnd(0,.8),rnd(-.5,.5)),{color:head?0x8a2220:0x6a3a30,size:.09,grow:.35,life:.45,a:.55,drag:3,g:2})}
// --- traceurs
const trP=[];let trI=0;
for(let i=0;i<14;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color:0xffe2a0,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false,fog:false}));m.visible=false;S.add(m);trP.push({m,a:new THREE.Vector3(),b:new THREE.Vector3(),t:0,max:.07,L:3})}
function tracer(a,b){const len=a.distanceTo(b);if(len<4)return;const t=trP[trI=(trI+1)%trP.length];t.a.copy(a);t.b.copy(b);t.t=t.max=.07;t.L=Math.min(len*.5,7);t.m.visible=true}
function trUpdate(dt){for(const t of trP){if(!t.m.visible)continue;t.t-=dt;if(t.t<=0){t.m.visible=false;continue}const f=1-t.t/t.max,len=t.a.distanceTo(t.b),c=t.L/2+f*(len-t.L);_e.copy(t.b).sub(t.a).normalize();t.m.position.copy(t.a).addScaledVector(_e,c);_p.copy(t.m.position).add(_e);t.m.lookAt(_p);t.m.scale.set(.012,.012,t.L)}}
// --- flash de bouche + lumière + douilles
flash.material.blending=THREE.AdditiveBlending;flash.material.transparent=true;flash.material.toneMapped=false;flash.material.opacity=.9;flash.material.depthWrite=false;
{const f1=new THREE.Sprite(new THREE.SpriteMaterial({map:flareT,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,toneMapped:false,fog:false}));f1.scale.set(.42,.42,1);f1.position.z=-.05;flash.add(f1)}
const mzL=new THREE.PointLight(0xffb060,0,14);gun.add(mzL);
const shG=new THREE.CylinderGeometry(.0075,.0075,.036,6),shG2=new THREE.CylinderGeometry(.012,.012,.07,8),shM=std(0xc9a24a,{roughness:.35,metalness:.9,envMapIntensity:1}),shM2=std(0xa02a20,{roughness:.6}),shells=[];
function eject(c){if(ac.on||bench)return;const m=new THREE.Mesh(c.pel>1?shG2:shG,c.pel>1?shM2:shM);m.position.set(.03,.03,.02);gun.localToWorld(m.position);
const v=new THREE.Vector3(rnd(1.4,2.4),rnd(1.2,2.2),rnd(-.3,.5)).applyQuaternion(C.quaternion);m.rotation.set(rnd(0,6),rnd(0,6),rnd(0,6));S.add(m);shells.push({m,v,t:2.4,s:rnd(8,18)});if(shells.length>50){S.remove(shells.shift().m)}}
function shUpdate(dt){for(let i=shells.length-1;i>=0;i--){const s=shells[i],p=s.m.position;s.t-=dt;if(s.t<=0){S.remove(s.m);shells.splice(i,1);continue}
if(s.s>0){s.v.y-=9.8*dt;p.addScaledVector(s.v,dt);s.m.rotation.x+=s.s*dt;s.m.rotation.z+=s.s*.6*dt;if(p.y<.012){p.y=.012;if(s.v.y<-1){s.v.y*=-.32;s.v.x*=.55;s.v.z*=.55;s.s*=.6}else{s.s=0;s.m.rotation.set(0,rnd(0,6),Math.PI/2)}}}}}
function shotFx(c){noise(P.x,P.z,A.supp?12:48);flash.rotation.z=rnd(0,6.28);flash.scale.setScalar((c.pel>1?1.5:1)*(adsT>.5?.55:1)*rnd(.8,1.2));flash.getWorldPosition(MZ);
if(!A.supp)emit(MZ,_e.set(0,.25,0),{color:0xcfcfcf,size:.07,grow:.4,life:.45,a:.2,drag:3});eject(c)}
// --- explosions (AC-130)
const exL=new THREE.PointLight(0xff9a40,0,34);S.add(exL);
const scP=[];let scI=0;for(let i=0;i<10;i++){const m=new THREE.Mesh(new THREE.CircleGeometry(1,28),new THREE.MeshBasicMaterial({map:scorchT,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}));m.rotation.x=-Math.PI/2;m.visible=false;S.add(m);scP.push(m)}
function boom(x,z,r){const m=new THREE.Mesh(new THREE.SphereGeometry(1,16,12),new THREE.MeshBasicMaterial({color:0xffa030,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));m.position.set(x,GH(x,z)+.5+r*.15,z);m.scale.setScalar(.3);S.add(m);
const rg=new THREE.Mesh(new THREE.RingGeometry(.85,1,40),new THREE.MeshBasicMaterial({color:0xffe0b0,transparent:true,opacity:.7,side:THREE.DoubleSide,depthWrite:false}));rg.rotation.x=-Math.PI/2;rg.position.set(x,.06,z);rg.scale.setScalar(.5);S.add(rg);
expl.push({m,rg,t:0,r,x,z});noise(x,z,90);
for(let i=0;i<8+r*3;i++){_p.set(x+rnd(-r,r)*.3,.4,z+rnd(-r,r)*.3);emit(_p,_e.set(rnd(-1.2,1.2),rnd(1,3.2),rnd(-1.2,1.2)),{color:Math.random()<.35?0x5a4a3a:0x2a2622,size:r*.35+.4,grow:r*.5+.4,life:rnd(1.2,2.4),a:.65,g:-.3,drag:.7})}
for(let i=0;i<14+r*4;i++){_p.set(x,.3,z);emit(_p,_e.set(rnd(-1,1),rnd(.5,1.6),rnd(-1,1)).multiplyScalar(rnd(3,7)),{map:sparkT,color:0xffa840,size:.14,life:rnd(.5,1),a:1,add:1,g:9,drag:.3})}
const sc=scP[scI=(scI+1)%scP.length];sc.position.set(x,.025,z);sc.scale.setScalar(r*1.2+.4);sc.visible=true}
function explUpdate(dt){let li=0,lx=0,lz=0;for(let i=expl.length-1;i>=0;i--){const e=expl[i];e.t+=dt;e.m.scale.setScalar(.3+e.r*Math.min(1,e.t/.25)*.9);e.m.material.opacity=Math.max(0,.95*(1-e.t/.5));e.m.material.color.setHex(e.t<.12?0xffe090:0xff8a20);
e.rg.scale.setScalar(.5+e.r*2.2*Math.min(1,e.t/.45));e.rg.material.opacity=Math.max(0,.7*(1-e.t/.45));const k=Math.max(0,1-e.t/.5)*(2+e.r);if(k>li){li=k;lx=e.x;lz=e.z}
if(e.t>.6){S.remove(e.m);S.remove(e.rg);expl.splice(i,1)}}exL.intensity=Math.min(14,li);if(li>0)exL.position.set(lx,2.5,lz)}
// --- poussière en suspension
const DN=120,dpA=new Float32Array(DN*3),dph=[];for(let i=0;i<DN;i++){dpA[i*3]=rnd(-14,14);dpA[i*3+1]=rnd(.3,4.5);dpA[i*3+2]=25+rnd(-14,14);dph.push(rnd(0,6.28))}
const dgm=new THREE.BufferGeometry();dgm.setAttribute('position',new THREE.BufferAttribute(dpA,3));
const dustM=new THREE.Points(dgm,new THREE.PointsMaterial({map:puffT,size:.045,color:0xfff2d6,transparent:true,opacity:.32,depthWrite:false}));dustM.frustumCulled=false;S.add(dustM);let dtT=0;
function dustUpdate(dt){dtT+=dt;dustM.visible=!ac.on;if(ac.on)return;for(let i=0;i<DN;i++){let x=dpA[i*3]+Math.sin(dtT*.35+dph[i])*.12*dt,y=dpA[i*3+1]+Math.cos(dtT*.27+dph[i])*.05*dt,z=dpA[i*3+2]+Math.cos(dtT*.31+dph[i]*1.3)*.12*dt;
if(x-P.x>14)x-=28;else if(x-P.x<-14)x+=28;if(z-P.z>14)z-=28;else if(z-P.z<-14)z+=28;dpA[i*3]=x;dpA[i*3+1]=y;dpA[i*3+2]=z}dgm.attributes.position.needsUpdate=true}
// --- grain d'image
{const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),id=x.createImageData(128,128);for(let i=0;i<id.data.length;i+=4){const v=Math.random()*255;id.data[i]=id.data[i+1]=id.data[i+2]=v;id.data[i+3]=255}x.putImageData(id,0,0);$('grain').style.backgroundImage='url('+c.toDataURL()+')'}
// --- boucle graphique : ombres, ciel, effets, qualité adaptative
const SR=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),LDIR).normalize(),SU=new THREE.Vector3().crossVectors(LDIR,SR);
let aqN=0,aqT=0,aqF=0,aqPR=R.getPixelRatio();
function fxFrame(dt){sky.position.copy(C.position);skyU.uT.value+=dt;todUpdate(dt);natureUpdate(dt);auUpdate(dt);hlUpdate(dt);invUpdate(dt);foliageUpdate(dt);
const fx=ac.on?ac.tx:P.x,fz=ac.on?ac.tz:P.z,sn=56/2048,a=fx*SR.x+fz*SR.z,b=fx*SU.x+fz*SU.z,da=Math.round(a/sn)*sn-a,db=Math.round(b/sn)*sn-b,tx=fx+SR.x*da+SU.x*db,tz=fz+SR.z*da+SU.z*db,ty=SU.y*db;
sun.target.position.set(tx,ty,tz);sun.position.set(tx+LDIR.x*80,ty+LDIR.y*80,tz+LDIR.z*80);{const s2=220/2048,a2=fx*SR.x+fz*SR.z,b2=fx*SU.x+fz*SU.z,da2=Math.round(a2/s2)*s2-a2,db2=Math.round(b2/s2)*s2-b2,x2=fx+SR.x*da2+SU.x*db2,z2=fz+SR.z*da2+SU.z*db2,y2=SU.y*db2;sun2.target.position.set(x2,y2,z2);sun2.position.set(x2+LDIR.x*150,y2+LDIR.y*150,z2+LDIR.z*150)}
pUpdate(dt);shUpdate(dt);trUpdate(dt);dustUpdate(dt);
mzL.intensity=flashT>0?2.6:0;mzL.position.copy(flash.position);
if(++aqF>240){aqT+=dt;aqN++;if(aqN>=90){if(aqT/aqN>.027&&aqPR>.7){aqPR=Math.max(.7,aqPR-.25);R.setPixelRatio(aqPR);R.setSize(innerWidth,innerHeight)}aqN=0;aqT=0}}}
