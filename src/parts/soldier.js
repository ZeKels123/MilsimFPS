// ================= SOLDATS (v24) : modèle Mixamo skinné, animations échantillonnées, hitbox = anciennes boîtes invisibles =================
const SLS={geo:null,mat:null,tex:null,nb:SLD.bones.length,rest:[],ix:{},n:0,fr:0};
SLD.bones.forEach((b,i)=>{SLS.ix[b.n]=i;const q=new THREE.Quaternion(b.q[0]/1e4,b.q[1]/1e4,b.q[2]/1e4,b.q[3]/1e4).normalize();SLS.rest.push(new THREE.Matrix4().compose(new THREE.Vector3(b.p[0]/1e4,b.p[1]/1e4,b.p[2]/1e4),q,new THREE.Vector3(1,1,1)))});
SLS.inv=SLS.rest.map(m=>m.clone().invert());
function sldGeo(){if(SLS.geo)return SLS.geo;const g=new THREE.BufferGeometry(),n=SLD.p.length/3,P_=new Float32Array(n*3),N_=new Float32Array(n*3),U_=new Float32Array(n*2),W_=new Float32Array(n*4);
for(let i=0;i<n*3;i++){P_[i]=SLD.p[i]/1e4;N_[i]=SLD.nr[i]/100}for(let i=0;i<n*2;i++)U_[i]=SLD.u[i]/1e3;for(let i=0;i<n*4;i++)W_[i]=SLD.w[i]/100;
g.setAttribute('position',new THREE.BufferAttribute(P_,3));g.setAttribute('normal',new THREE.BufferAttribute(N_,3));g.setAttribute('uv',new THREE.BufferAttribute(U_,2));g.setAttribute('skinIndex',new THREE.BufferAttribute(new Uint16Array(SLD.s),4));g.setAttribute('skinWeight',new THREE.BufferAttribute(W_,4));
g.setIndex(new THREE.BufferAttribute(n>65535?new Uint32Array(SLD.i):new Uint16Array(SLD.i),1));g.computeBoundingSphere();g.boundingSphere.radius=2;SLS.geo=g;{const a=SLD.i.slice(0,17518*3).concat(SLD.i.slice(17916*3));const g2=new THREE.BufferGeometry();for(const k in g.attributes)g2.setAttribute(k,g.attributes[k]);g2.setIndex(new THREE.BufferAttribute(new Uint16Array(a),1));g2.boundingSphere=g.boundingSphere;SLS.geoNH=g2}
const t=new THREE.TextureLoader().load(SLD.tex);t.flipY=false;t.encoding=THREE.sRGBEncoding;t.anisotropy=4;SLS.tex=t;
SLS.mat=new THREE.MeshLambertMaterial({map:t,skinning:true,emissive:0x1a1a1a});return g}
// clips : pose monde de chaque os (x,y,z mm ; quaternion xyz mm, w reconstruit)
const _slq=new THREE.Quaternion(),_sl2=new THREE.Quaternion(),_slv=new THREE.Vector3();
function sldSamp(c,t,loop,out){const n=c.n;let f=t*c.fps;if(loop){f=((f%n)+n)%n}else f=Math.min(n-1,Math.max(0,f));const i0=Math.floor(f),i1=loop?(i0+1)%n:Math.min(n-1,i0+1),k=f-i0,A=c.d[i0],B=c.d[i1];
for(let j=0;j<SLS.nb;j++){const o=j*6;out.p[j*3]=(A[o]+(B[o]-A[o])*k)/1e3;out.p[j*3+1]=(A[o+1]+(B[o+1]-A[o+1])*k)/1e3;out.p[j*3+2]=(A[o+2]+(B[o+2]-A[o+2])*k)/1e3;
let ax=A[o+3]/1e3,ay=A[o+4]/1e3,az=A[o+5]/1e3,bx=B[o+3]/1e3,by=B[o+4]/1e3,bz=B[o+5]/1e3;const aw=Math.sqrt(Math.max(0,1-ax*ax-ay*ay-az*az));let bw=Math.sqrt(Math.max(0,1-bx*bx-by*by-bz*bz));
if(ax*bx+ay*by+az*bz+aw*bw<0){bx=-bx;by=-by;bz=-bz;bw=-bw}
let qx=ax+(bx-ax)*k,qy=ay+(by-ay)*k,qz=az+(bz-az)*k,qw=aw+(bw-aw)*k;const l=1/Math.hypot(qx,qy,qz,qw);out.q[j*4]=qx*l;out.q[j*4+1]=qy*l;out.q[j*4+2]=qz*l;out.q[j*4+3]=qw*l}}
function sldAttach(b){const sg=new THREE.Group(),bones=[];for(let i=0;i<SLS.nb;i++){const bn=new THREE.Bone();bones.push(bn);sg.add(bn)}
const sm=new THREE.SkinnedMesh(sldGeo(),SLS.mat);sm.frustumCulled=false;sm.castShadow=true;sm.receiveShadow=false;sg.add(sm);
sm.bind(new THREE.Skeleton(bones,SLS.inv),new THREE.Matrix4());
const sd={sg,sm,bones,cur:'fire',t:0,pv:null,pt:0,bl:1,A:{p:new Float32Array(SLS.nb*3),q:new Float32Array(SLS.nb*4)},B:{p:new Float32Array(SLS.nb*3),q:new Float32Array(SLS.nb*4)},acc:0,k:Math.random()*4|0,dd:0,hand:SLS.ix.RightHand,hl:SLS.ix.LeftHand};
// arme : suit la main droite
sg.add(b.wp);b.sld=sd;b.g.add(sg);
// anciens volumes → hitbox invisibles (toujours testés au tir, jamais dessinés)
b.g.traverse(o=>{if(o.isMesh&&o!==sm&&!(b.wps.includes(o))&&o!==b.flash){Object.defineProperty(o,'visible',{get:()=>false,set:()=>{}});o.castShadow=false}});
sd.pose=(dt)=>{};return sd}
const SLC={walk:1,run:1,fire:1,reload:1,death:0,strafe:1,idle:1};
function sldPick(b,mv){if(b.dead)return'death';if(b.relT>0)return'reload';if(b.crA>.4)return'idle';if(mv&&b.mvA>.25){return b.T.sp*(b.spK||1)>3.4?'run':'walk'}return'fire'}
const _slg=new THREE.Quaternion(),_sly=new THREE.Quaternion(),_sle=new THREE.Euler(0,0,0,'YXZ'),_slw=new THREE.Matrix4(),_slo=new THREE.Matrix4().compose(new THREE.Vector3(0,0,0),new THREE.Quaternion(),new THREE.Vector3(1,1,1));
const _slf=new THREE.Vector3(),_slu=new THREE.Vector3(),_slx=new THREE.Vector3();const _slv1=new THREE.Vector3(1,1,1),_slv2=new THREE.Vector3();var SLW={p:[.0,.0,.0],r:[0,0,0]};
function sldUpdate(b,dt,mv){const sd=b.sld;if(!sd)return;const g=b.g,d=Math.hypot(g.position.x-P.x,g.position.z-P.z);
sd.sg.visible=d<230;if(d>=230){sd.acc=0;return}sd.acc+=dt;const every=d<45||b.dead?1:d<110?2:4;if((++SLS.fr+(b.tm*0|0))%every&&!b.dead){/* pose gardée */}else{dt=sd.acc;sd.acc=0;
const want=sldPick(b,mv);if(want!==sd.cur){sd.pv=sd.cur;sd.pt=sd.t;sd.bl=0;sd.cur=want;sd.t=want==='death'?0:sd.t*(want==='fire'||want==='idle'?0:.5);if(want==='reload'||want==='death')sd.t=0}
const rate=sd.cur==='fire'?(b.fl>0?1:0):sd.cur==='walk'?Math.max(.5,b.T.sp*(b.spK||1)/1.5):sd.cur==='run'?Math.max(.7,b.T.sp*(b.spK||1)/4.2):1;
sd.t+=dt*rate;sd.bl=Math.min(1,sd.bl+dt*7);
const cl=SLA[sd.cur];sldSamp(cl,sd.cur==='fire'&&b.fl<=0?0:sd.t,SLC[sd.cur],sd.A);
let o=sd.A;if(sd.bl<1&&sd.pv){sldSamp(SLA[sd.pv],sd.pt+= dt,SLC[sd.pv],sd.B);const w=sd.bl;for(let i=0;i<SLS.nb*3;i++)sd.B.p[i]+= (sd.A.p[i]-sd.B.p[i])*w;for(let i=0;i<SLS.nb;i++){const j=i*4,dot=sd.A.q[j]*sd.B.q[j]+sd.A.q[j+1]*sd.B.q[j+1]+sd.A.q[j+2]*sd.B.q[j+2]+sd.A.q[j+3]*sd.B.q[j+3],s=dot<0?-1:1;for(let c=0;c<4;c++)sd.B.q[j+c]+=(sd.A.q[j+c]*s-sd.B.q[j+c])*w}o=sd.B}
// la racine suit le yaw du groupe ; à la mort, on annule l'ancienne chute pour jouer l'animation squelettique
if(b.dead){_slg.copy(g.quaternion).invert();_sle.set(0,g.rotation.y,0);_sly.setFromEuler(_sle);sd.sg.quaternion.copy(_slg).multiply(_sly);sd.sg.position.set(0,0,0);if(o.p){}}
else{sd.sg.quaternion.identity();sd.sg.position.set(0,0,0)}
// on ne garde que le déplacement relatif du bassin pour rester sur place (hors mort)
const hx=b.dead?0:o.p[0],hz=b.dead?0:o.p[2];
for(let i=0;i<SLS.nb;i++){const bn=sd.bones[i];bn.position.set(o.p[i*3]-hx,o.p[i*3+1],o.p[i*3+2]-hz);_slq.set(o.q[i*4],o.q[i*4+1],o.q[i*4+2],o.q[i*4+3]);bn.quaternion.copy(_slq)}
// arme dans la main droite
const hb=sd.bones[sd.hand],hr=hb.position,hl=sd.bones[sd.hl].position,wi=b.wi;if(!SLS.rel)SLS.rel=[];
if(sd.cur==='fire'||!SLS.rel[wi]){_slf.subVectors(hl,hr);const fl=_slf.length();if(fl>.05){_slf.divideScalar(fl);_slu.set(0,1,0).addScaledVector(_slf,-_slf.y).normalize();_slx.crossVectors(_slu,_slf);_slw.makeBasis(_slx,_slu,_slf);b.wp.quaternion.setFromRotationMatrix(_slw);b.wp.position.copy(hr).addScaledVector(_slu,.02).addScaledVector(_slf,(fl-BWG[wi][1])*.5-.02);
if(sd.cur==='fire'&&sd.bl>=1){b.wp.updateMatrix();_slo.compose(hb.position,hb.quaternion,_slv1);SLS.rel[wi]=_slo.clone().invert().multiply(b.wp.matrix)}}}
else{_slo.compose(hb.position,hb.quaternion,_slv1).multiply(SLS.rel[wi]);_slo.decompose(b.wp.position,b.wp.quaternion,_slv2)}
}}
// ---- déclinaisons par type : teinte, casque, gilet, sac, épaulières attachés aux os (offsets exprimés dans le repère monde de la pose de repos)
const SLT=[0x9fa68c,0xc2c6ce,0xadb58c,0x6a6f76];
function sldAcc(sd,bone,mesh,d,list){const i=SLS.ix[bone],q=new THREE.Quaternion().setFromRotationMatrix(SLS.rest[i]).invert();mesh.position.set(d[0],d[1],d[2]).applyQuaternion(q);mesh.quaternion.copy(q);mesh.castShadow=true;sd.bones[i].add(mesh);Object.defineProperty(mesh,'visible',{get(){return this._v!==false},set(v){this._v=v}});list.push(mesh);return mesh}
function sldBuild(b){sldVestGeo();sldPackGeo();const sd=b.sld;sd.var=[[],[],[],[]];const BX=(w,h,d)=>new THREE.BoxGeometry(w,h,d),SP=(r,a)=>new THREE.SphereGeometry(r,14,10,0,6.2832,0,a||1.9),M=(c,o)=>L(c,Object.assign({roughness:.85},o||{}));
sd.mats=SLT.map(c=>{const m=SLS.mat.clone();m.color.setHex(c);return m});
for(let t=0;t<4;t++){const v=sd.var[t],T=BT[t],H='Head',C='Spine2';
 if(t===1){sldAcc(sd,H,new THREE.Mesh(SP(.135,1.5),M(0x4b5a44)),[0,.105,.005],v);sldAcc(sd,H,new THREE.Mesh(BX(.2,.055,.05),M(0x0a0a0a,{metalness:.8,roughness:.2})),[0,.11,.115],v);sldAcc(sd,H,new THREE.Mesh(BX(.035,.1,.06),M(0x111111)),[.13,.06,0],v);sldAcc(sd,H,new THREE.Mesh(BX(.035,.1,.06),M(0x111111)),[-.13,.06,0],v)}
 if(t===2){sldAcc(sd,H,new THREE.Mesh(SP(.125,1.45),M(T.col)),[0,.11,0],v);sldAcc(sd,H,new THREE.Mesh(new THREE.CylinderGeometry(.23,.23,.012,18),M(T.col)),[0,.125,0],v)}
 if(t===3){sldAcc(sd,H,new THREE.Mesh(SP(.155,1.6),M(0x1c1e22)),[0,.1,0],v);sldAcc(sd,H,new THREE.Mesh(BX(.22,.06,.05),new THREE.MeshBasicMaterial({color:0xaa1111})),[0,.1,.14],v);sldAcc(sd,H,new THREE.Mesh(BX(.2,.1,.08),M(0x111111)),[0,.0,.1],v)}
 {const vm=new THREE.Mesh(sldVestGeo(),SLS.vm[t]);vm.castShadow=true;sd.bones[SLS.ix.Spine2].add(vm);Object.defineProperty(vm,'visible',{get(){return this._v!==false},set(v_){this._v=v_}});v.push(vm)}
 if(t===1||t===2){const pm=new THREE.Mesh(sldPackGeo(),SLS.pm[t]);pm.castShadow=true;sd.bones[SLS.ix.Spine2].add(pm);Object.defineProperty(pm,'visible',{get(){return this._v!==false},set(v_){this._v=v_}});v.push(pm)}
 if(t===3){[-.24,.24].forEach(x=>sldAcc(sd,C,new THREE.Mesh(BX(.16,.09,.24),M(0x25282c)),[x,.15,0],v));sldAcc(sd,C,new THREE.Mesh(BX(.34,.34,.1),M(0x2b2f34)),[0,.0,-.15],v)}
}}
function sldLook(b,i){const sd=b.sld;if(!sd)return;if(!sd.var)sldBuild(b);sd.sm.material=sd.mats[i];sd.sm.geometry=SLS.geo;sd.var.forEach((l,k)=>l.forEach(m=>m.visible=k===i))}

function sldVestGeo(){if(SLS.vg)return SLS.vg;const g=new THREE.BufferGeometry(),n=VSD.p.length/3,P_=new Float32Array(n*3),N_=new Float32Array(n*3),U_=new Float32Array(n*2);for(let i=0;i<n*3;i++){P_[i]=VSD.p[i]/1e4;N_[i]=VSD.nr[i]/100}for(let i=0;i<n*2;i++)U_[i]=VSD.u[i]/1e3;
g.setAttribute('position',new THREE.BufferAttribute(P_,3));g.setAttribute('normal',new THREE.BufferAttribute(N_,3));g.setAttribute('uv',new THREE.BufferAttribute(U_,2));g.setIndex(new THREE.BufferAttribute(new Uint16Array(VSD.i),1));
g.applyMatrix4(SLS.inv[SLS.ix.Spine2]);g.computeBoundingSphere();SLS.vg=g;
const t=new THREE.TextureLoader().load(VSD.tex);t.encoding=THREE.sRGBEncoding;SLS.vm=[0xffffff,0xdde3ee,0xcfd6b0,0x8a8f96].map(c=>new THREE.MeshLambertMaterial({map:t,color:c,side:THREE.DoubleSide}));return g}

function sldPackGeo(){if(SLS.pg)return SLS.pg;const g=new THREE.BufferGeometry(),n=PKD.p.length/3,P_=new Float32Array(n*3),N_=new Float32Array(n*3),C_=new Float32Array(n*3);for(let i=0;i<n*3;i++){P_[i]=PKD.p[i]/1e4;N_[i]=PKD.nr[i]/100;C_[i]=PKD.c[i]/255}
g.setAttribute('position',new THREE.BufferAttribute(P_,3));g.setAttribute('normal',new THREE.BufferAttribute(N_,3));g.setAttribute('color',new THREE.BufferAttribute(C_,3));g.setIndex(new THREE.BufferAttribute(new Uint16Array(PKD.i),1));
g.applyMatrix4(SLS.inv[SLS.ix.Spine2]);g.computeBoundingSphere();SLS.pg=g;SLS.pm=[0,0xffffff,0xd9d2a8,0].map(c=>new THREE.MeshLambertMaterial({vertexColors:true,color:c,side:THREE.DoubleSide}));return g}
