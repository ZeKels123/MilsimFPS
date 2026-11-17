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
const SLC={walk:1,run:1,fire:1,reload:1,death:0,strafe:1,idle:1,strafeR:1,walkB:1,deathR:0};
// miroir d'un clip (plan x=0) : positions x inversées, quaternions (x,-y,-z,w), os gauche/droite échangés (le squelette de repos est symétrique)
function sldMirror(c){const nb=SLS.nb,pm=[];for(let j=0;j<nb;j++){const nm=SLD.bones[j].n,o=nm.indexOf('Left')===0?'Right'+nm.slice(4):nm.indexOf('Right')===0?'Left'+nm.slice(5):nm;pm.push(SLS.ix[o]===undefined?j:SLS.ix[o])}
return{fps:c.fps,n:c.n,d:c.d.map(A=>{const B=new Array(nb*6);for(let j=0;j<nb;j++){const k=pm[j]*6,o=j*6;B[k]=-A[o];B[k+1]=A[o+1];B[k+2]=A[o+2];B[k+3]=A[o+3];B[k+4]=-A[o+4];B[k+5]=-A[o+5]}return B})}}
// clips dérivés : pas en arrière = marche rejouée à l'envers ; pas de côté à droite = pas à gauche rejoué à l'envers ; chute côté droit = chute miroir
function sldClips(){if(SLA.walkB)return;SLA.walkB=SLA.walk;SLA.strafeR=SLA.strafe;SLA.deathR=sldMirror(SLA.death)}
// direction du déplacement dans le repère du soldat (avant 0, côté 1, arrière 2), lissée et avec hystérésis : le bot qui avance de côté ou recule en visant n'a plus de pas de marche glissants
function sldDir(b,sd,dt,mv){const gp=b.g.position;if(sd.lx===undefined){sd.lx=gp.x;sd.lz=gp.z;sd.vf=0;sd.vl=0;sd.md=0;sd.ms=1}
const vx=(gp.x-sd.lx)/Math.max(dt,.001),vz=(gp.z-sd.lz)/Math.max(dt,.001);sd.lx=gp.x;sd.lz=gp.z;if(b.dead){sd.md=0;sd.vf=sd.vl=0;return}
const k=Math.min(1,dt*7);if(!mv||Math.hypot(vx,vz)>14){sd.vf*=1-k;sd.vl*=1-k}else{const yw=b.g.rotation.y,c=Math.cos(yw),s=Math.sin(yw);sd.vf+=(vx*s+vz*c-sd.vf)*k;sd.vl+=(vx*c-vz*s-sd.vl)*k}
let m=sd.md|0;if(Math.hypot(sd.vf,sd.vl)<.3)m=0;else{const a=Math.abs(Math.atan2(sd.vl,sd.vf));if(m===0){if(a>.95)m=a>2.3?2:1}else if(m===1){if(a<.7)m=0;else if(a>2.3)m=2}else if(a<2){m=a<.7?0:1}if(m===1)sd.ms=sd.vl>0?1:-1}sd.md=m}
// visée en hauteur/en contrebas : le haut du corps (tout ce qui descend de Spine) bascule autour de la taille, l'arme suit les mains (sniper de mirador, tireur sur un toit, bot en contrebas)
const _pq=new THREE.Quaternion(),_pp=new THREE.Vector3(),_pa=new THREE.Vector3(1,0,0);
function sldPitch(b,sd){if(b.dead||b.sur||!(b.aimA>.02))return;const am=b.aimA*(1-(b.relA||0)*.8),a=-Math.max(-.6,Math.min(.6,b.pit||0))*am*.85;if(Math.abs(a)<.03)return;
if(!SLS.upB){const B=SLD.bones,r=SLS.ix.Spine,l=[];for(let i=0;i<B.length;i++){let p=i;while(p>=0){if(p===r){l.push(i);break}p=B[p].par}}SLS.upB=l}
_pq.setFromAxisAngle(_pa,a);_pp.copy(sd.bones[SLS.ix.Spine].position);for(const i of SLS.upB){const o=sd.bones[i];o.position.sub(_pp).applyQuaternion(_pq).add(_pp);o.quaternion.premultiply(_pq)}}
// sous-arbre d'un os (squelette à plat : positions et rotations absolues) pivoté autour de l'os : accroupi, respiration, regard
function sldSub(i){const c=SLS.sub||(SLS.sub={});if(c[i])return c[i];const B=SLD.bones,l=[];for(let k=0;k<B.length;k++){let p=k;while(p>=0){if(p===i){l.push(k);break}p=B[p].par}}return c[i]=l}
const _rq=new THREE.Quaternion(),_rp=new THREE.Vector3(),_rx=new THREE.Vector3(1,0,0),_ry=new THREE.Vector3(0,1,0);
function sldRot(sd,ix,axis,ang){if(ix===undefined||Math.abs(ang)<.002)return;_rq.setFromAxisAngle(axis,ang);_rp.copy(sd.bones[ix].position);for(const i of sldSub(ix)){const o=sd.bones[i];o.position.sub(_rp).applyQuaternion(_rq).add(_rp);o.quaternion.premultiply(_rq)}}
// pose accroupie procédurale pour les clips debout (marche, tir, rechargement) : cuisses en avant, genoux repliés, buste penché ; le bassin descend de ~.34 m
function sldCrouch(sd,k){const I=SLS.ix,D=.34*k;for(const s of['Left','Right']){const u=I[s+'UpLeg'],l=I[s+'Leg'],f=I[s+'Foot'];if(u===undefined||l===undefined||f===undefined)continue;const B=sd.bones,L1=B[u].position.distanceTo(B[l].position),L2=B[l].position.distanceTo(B[f].position);
let lo=0,hi=1.5;for(let i=0;i<14;i++){const a=(lo+hi)/2,be=Math.asin(Math.min(1,L1*Math.sin(a)/L2));if(L1*(1-Math.cos(a))+L2*(1-Math.cos(be))<D)lo=a;else hi=a}
const a=(lo+hi)/2,be=Math.asin(Math.min(1,L1*Math.sin(a)/L2));sldRot(sd,u,_rx,-a);sldRot(sd,l,_rx,a+be)}sldRot(sd,I.Spine,_rx,.28*k)}
function sldPick(b,mv){if(b.dead)return b.dmr?'deathR':'death';if(b.relT>0)return b.crA>.4?'idle':b.wi===3?'fire':'reload';if(b.crA>.4&&!(mv&&b.mvA>.5))return'idle';if(mv&&b.mvA>.25){const sd=b.sld,m=sd&&sd.md;if(m===1)return sd.ms>0?'strafe':'strafeR';if(m===2)return'walkB';return b.T.sp*(b.spK||1)*(b.hm||1)>3.4?'run':'walk'}return'fire'}
const _slg=new THREE.Quaternion(),_sly=new THREE.Quaternion(),_sle=new THREE.Euler(0,0,0,'YXZ'),_slw=new THREE.Matrix4(),_slo=new THREE.Matrix4().compose(new THREE.Vector3(0,0,0),new THREE.Quaternion(),new THREE.Vector3(1,1,1));
const _slf=new THREE.Vector3(),_slu=new THREE.Vector3(),_slx=new THREE.Vector3();const _slv1=new THREE.Vector3(1,1,1),_slv2=new THREE.Vector3();var SLW={p:[.0,.0,.0],r:[0,0,0]};
function sldUpdate(b,dt,mv){const sd=b.sld;if(!sd)return;const g=b.g,d=Math.hypot(g.position.x-P.x,g.position.z-P.z);sldLodTick(b,d);
sd.sg.visible=d<230;if(d>=230){sd.acc=0;return}sd.acc+=dt;const every=d<45||b.dead?1:d<110?2:4;if((++SLS.fr+(b.tm*0|0))%every&&!b.dead){/* pose gardée */}else{dt=sd.acc;sd.acc=0;
sldClips();sldDir(b,sd,dt,mv);const want=sldPick(b,mv),dth=want==='death'||want==='deathR';if(want!==sd.cur){sd.pv=sd.cur;sd.pt=sd.t;sd.bl=0;sd.cur=want;sd.t=dth?0:sd.t*(want==='fire'||want==='idle'?0:.5);if(want==='reload'||dth)sd.t=0}
const rate=sd.cur==='fire'?(b.fl>0?1:0):sd.cur==='walk'?Math.max(.5,b.T.sp*(b.spK||1)*(b.hm||1)/1.5):sd.cur==='run'?Math.max(.7,b.T.sp*(b.spK||1)*(b.hm||1)/4.2):sd.cur==='walkB'?-Math.max(.5,b.T.sp*(b.spK||1)*(b.hm||1)/1.7):sd.cur==='strafe'?Math.max(.6,Math.min(2.4,b.T.sp*(b.spK||1)*(b.hm||1)/1.7)):sd.cur==='strafeR'?-Math.max(.6,Math.min(2.4,b.T.sp*(b.spK||1)*(b.hm||1)/1.7)):sd.cur==='reload'?2.6:sd.cur==='death'||sd.cur==='deathR'?(b.drt||1):1;
sd.t+=dt*rate;sd.bl=Math.min(1,sd.bl+dt*7);
const cl=SLA[sd.cur];sldSamp(cl,sd.cur==='fire'&&b.fl<=0?0:sd.t,SLC[sd.cur],sd.A);
let o=sd.A;if(sd.bl<1&&sd.pv){sldSamp(SLA[sd.pv],sd.pt+= dt,SLC[sd.pv],sd.B);const w=sd.bl;for(let i=0;i<SLS.nb*3;i++)sd.B.p[i]+= (sd.A.p[i]-sd.B.p[i])*w;for(let i=0;i<SLS.nb;i++){const j=i*4,dot=sd.A.q[j]*sd.B.q[j]+sd.A.q[j+1]*sd.B.q[j+1]+sd.A.q[j+2]*sd.B.q[j+2]+sd.A.q[j+3]*sd.B.q[j+3],s=dot<0?-1:1;for(let c=0;c<4;c++)sd.B.q[j+c]+=(sd.A.q[j+c]*s-sd.B.q[j+c])*w}o=sd.B}
// la racine suit le yaw du groupe ; à la mort, on annule l'ancienne chute pour jouer l'animation squelettique
if(b.dead){const ez=b.drgP?1:Math.min(1,sd.t/.3),ee=ez*ez*(3-2*ez);_slg.copy(g.quaternion).invert();_sle.set(0,g.rotation.y+(b.dty||0)*ee,0);_sly.setFromEuler(_sle);sd.sg.quaternion.copy(_slg).multiply(_sly);sd.sg.position.set(0,0,0);sd.blY=0}
// accroupi : g.y descend de .34 pour l'ancien corps, mais le clip accroupi baisse déjà le soldat : on remonte le modèle pour que les bottes restent au sol
else{sd.sg.quaternion.identity();sd.sg.position.set(0,b.crA>.02&&sd.cur==='idle'?b.crA*.34:0,0);sd.blY=0;const pr=b.prA||0;if(pr>.01){sd.sg.rotation.x=pr*1.48;sd.sg.position.y+=pr*.24;sd.sg.position.z=-1.1*pr}}
// on ne garde que le déplacement relatif du bassin pour rester sur place (hors mort)
const hx=b.dead?0:o.p[0],hz=b.dead?0:o.p[2];
for(let i=0;i<SLS.nb;i++){const bn=sd.bones[i];bn.position.set(o.p[i*3]-hx,o.p[i*3+1],o.p[i*3+2]-hz);_slq.set(o.q[i*4],o.q[i*4+1],o.q[i*4+2],o.q[i*4+3]);bn.quaternion.copy(_slq)}
if(!b.dead){const kc=sd.cur==='idle'?0:Math.min(1,(b.crA||0)*1.05);if(kc>.03)sldCrouch(sd,kc);
 if(!mv&&(sd.cur==='fire'||sd.cur==='idle')&&!(b.stun>0)&&!(b.blind>0)){const I=SLS.ix,ph=b.tm*1.55+sd.k*1.7,sc=b.aimA>.3?.35:1;sldRot(sd,I.Spine1,_rx,.016*Math.sin(ph));if(b.aimA<.3&&!b.lvl)sldRot(sd,I.Head,_ry,.55*Math.sin(b.tm*.37+sd.k*2.1)*Math.sin(b.tm*.11+sd.k)+.08*Math.sin(ph*.7));else sldRot(sd,I.Head,_rx,.02*Math.sin(ph*.8)*sc)}}
sldPitch(b,sd);
// arme dans la main droite
const hb=sd.bones[sd.hand],hr=hb.position,hl=sd.bones[sd.hl].position,wi=b.wi;if(!SLS.rel)SLS.rel=[];
if(sd.cur==='fire'||!SLS.rel[wi]){_slf.subVectors(hl,hr);const fl=_slf.length();if(fl>.05){_slf.divideScalar(fl);_slu.set(0,1,0).addScaledVector(_slf,-_slf.y).normalize();_slx.crossVectors(_slu,_slf);_slw.makeBasis(_slx,_slu,_slf);b.wp.quaternion.setFromRotationMatrix(_slw);b.wp.position.copy(hr).addScaledVector(_slu,.02).addScaledVector(_slf,(fl-BWG[wi][1])*.5-.02);
if(sd.cur==='fire'&&sd.bl>=1){b.wp.updateMatrix();_slo.compose(hb.position,hb.quaternion,_slv1);SLS.rel[wi]=_slo.clone().invert().multiply(b.wp.matrix)}}}
else{_slo.compose(hb.position,hb.quaternion,_slv1).multiply(SLS.rel[wi]);_slo.decompose(b.wp.position,b.wp.quaternion,_slv2)}
if(b.relT>0&&!b.dead&&sd.cur!=='reload'){const rk=Math.sin(Math.min(1,b.relT/1.2)*Math.PI);b.wp.rotateX(-.5*rk);b.wp.position.y-=.05*rk}
if(!b.dead&&b.zh&&b.zm&&b.zm.ra){const w=1-Math.max(0,b.zh.ra)/b.zm.ra,f=(b.fxl&2)?Math.max(w,.6):w;if(f>.25){b.wp.rotateX(Math.sin(b.tm*7+sd.k)*.06*f);b.wp.rotateZ(Math.sin(b.tm*5.3+sd.k)*.05*f);b.wp.position.y-=.06*f}}
if(b.armK>.01&&!b.dead)sldArms(b,sd);
}}
// ---- déclinaisons par type : teinte, casque, gilet, sac, épaulières attachés aux os (offsets exprimés dans le repère monde de la pose de repos)
const SLT=[0x9fa68c,0xc2c6ce,0xadb58c,0x6a6f76];
function sldAcc(sd,bone,mesh,d,list){const i=SLS.ix[bone],q=new THREE.Quaternion().setFromRotationMatrix(SLS.rest[i]).invert();mesh.position.set(d[0],d[1],d[2]).applyQuaternion(q);mesh.quaternion.copy(q);mesh.castShadow=true;sd.bones[i].add(mesh);Object.defineProperty(mesh,'visible',{get(){return this._v!==false},set(v){this._v=v}});list.push(mesh);return mesh}
function sldBuild(b){sldVestGeo();sldPackGeo();const sd=b.sld;sd.var=[[],[],[],[]];const BX=(w,h,d)=>new THREE.BoxGeometry(w,h,d),SP=(r,a)=>new THREE.SphereGeometry(r,14,10,0,6.2832,0,a||1.9),M=(c,o)=>L(c,Object.assign({roughness:.85},o||{}));
sd.mats=SLT.map(c=>{const m=SLS.mat.clone();m.color.setHex(c);return m});
for(let t=0;t<4;t++){const v=sd.var[t],T=BT[t],H='Head',C='Spine2';
 if(t===1||t===0||t===3){const hm=new THREE.Mesh(sldHelmGeo(t),SLS.hm[t]);hm.castShadow=true;sd.bones[SLS.ix.Head].add(hm);Object.defineProperty(hm,'visible',{get(){return this._v!==false},set(v_){this._v=v_}});v.push(hm)}
 if(t===2){sldAcc(sd,H,new THREE.Mesh(SP(.125,1.45),M(T.col)),[0,.11,0],v);sldAcc(sd,H,new THREE.Mesh(new THREE.CylinderGeometry(.23,.23,.012,18),M(T.col)),[0,.125,0],v)}
 {const vm=new THREE.Mesh(sldVestGeo(),SLS.vm[t]);vm.castShadow=true;sd.bones[SLS.ix.Spine2].add(vm);Object.defineProperty(vm,'visible',{get(){return this._v!==false},set(v_){this._v=v_}});v.push(vm)}
 if(t===1||t===2){const pm=new THREE.Mesh(sldPackGeo(),SLS.pm[t]);pm.castShadow=true;sd.bones[SLS.ix.Spine2].add(pm);Object.defineProperty(pm,'visible',{get(){return this._v!==false},set(v_){this._v=v_}});v.push(pm)}
 if(t===3){[-.24,.24].forEach(x=>sldAcc(sd,C,new THREE.Mesh(BX(.16,.09,.24),M(0x25282c)),[x,.15,0],v));sldAcc(sd,C,new THREE.Mesh(BX(.34,.34,.1),M(0x2b2f34)),[0,.0,-.15],v)}
}}
// ---- niveaux de détail : corps ~7 300 triangles (au lieu de 22 000), gilet ~2 300 (au lieu de 8 400), sac ~730 (au lieu de 6 000)
function sldGeoL(){if(SLS.geoL)return SLS.geoL;const g=new THREE.BufferGeometry(),n=SLL.p.length/3,P_=new Float32Array(n*3),N_=new Float32Array(n*3),U_=new Float32Array(n*2),W_=new Float32Array(n*4);
for(let i=0;i<n*3;i++){P_[i]=SLL.p[i]/1e4;N_[i]=SLL.nr[i]/100}for(let i=0;i<n*2;i++)U_[i]=SLL.u[i]/1e3;for(let i=0;i<n*4;i++)W_[i]=SLL.w[i]/100;
g.setAttribute('position',new THREE.BufferAttribute(P_,3));g.setAttribute('normal',new THREE.BufferAttribute(N_,3));g.setAttribute('uv',new THREE.BufferAttribute(U_,2));g.setAttribute('skinIndex',new THREE.BufferAttribute(new Uint16Array(SLL.s),4));g.setAttribute('skinWeight',new THREE.BufferAttribute(W_,4));
g.setIndex(new THREE.BufferAttribute(new Uint16Array(SLL.i),1));g.boundingSphere=sldGeo().boundingSphere;SLS.geoL=g;
const g2=new THREE.BufferGeometry();for(const k in g.attributes)g2.setAttribute(k,g.attributes[k]);g2.setIndex(new THREE.BufferAttribute(new Uint16Array(SLL.i.slice(0,SLL.hs)),1));g2.boundingSphere=g.boundingSphere;SLS.geoLNH=g2;return g}
function sldVestGeoL(){if(SLS.vgL)return SLS.vgL;sldVestGeo();const g=new THREE.BufferGeometry(),n=VSL.p.length/3,P_=new Float32Array(n*3),N_=new Float32Array(n*3),U_=new Float32Array(n*2);for(let i=0;i<n*3;i++){P_[i]=VSL.p[i]/1e4;N_[i]=VSL.nr[i]/100}for(let i=0;i<n*2;i++)U_[i]=VSL.u[i]/1e3;
g.setAttribute('position',new THREE.BufferAttribute(P_,3));g.setAttribute('normal',new THREE.BufferAttribute(N_,3));g.setAttribute('uv',new THREE.BufferAttribute(U_,2));g.setIndex(new THREE.BufferAttribute(new Uint16Array(VSL.i),1));g.applyMatrix4(SLS.inv[SLS.ix.Spine2]);g.computeBoundingSphere();return SLS.vgL=g}
function sldPackGeoL(){if(SLS.pgL)return SLS.pgL;sldPackGeo();const g=new THREE.BufferGeometry(),n=PKL.p.length/3,P_=new Float32Array(n*3),N_=new Float32Array(n*3),C_=new Float32Array(n*3);for(let i=0;i<n*3;i++){P_[i]=PKL.p[i]/1e4;N_[i]=PKL.nr[i]/100;C_[i]=PKL.c[i]/255}
g.setAttribute('position',new THREE.BufferAttribute(P_,3));g.setAttribute('normal',new THREE.BufferAttribute(N_,3));g.setAttribute('color',new THREE.BufferAttribute(C_,3));g.setIndex(new THREE.BufferAttribute(new Uint16Array(PKL.i),1));g.applyMatrix4(SLS.inv[SLS.ix.Spine2]);g.computeBoundingSphere();return SLS.pgL=g}
// lod 0 : proche, 1 : > 50 m, 2 : > 145 m (gilet et sac masqués) ; hystérésis pour éviter les va-et-vient
function sldLod(b){const sd=b.sld,i=sd.ti;if(i===undefined||!sd.var)return;const L=sd.lod>0,nh=i===0||i===1||i===3;sldGeoL();sd.sm.geometry=nh?(L?SLS.geoLNH:SLS.geoNH):(L?SLS.geoL:SLS.geo);
const hide=sd.lod>1;sd.var[i].forEach(m=>{const g=m.geometry;if(g===SLS.vg||g===SLS.vgL){m.geometry=L?sldVestGeoL():SLS.vg;m.visible=!hide}else if(g===SLS.pg||g===SLS.pgL){m.geometry=L?sldPackGeoL():SLS.pg;m.visible=!hide}})}
function sldLodTick(b,d){const sd=b.sld;if(!sd||!sd.var)return;const l=d>(sd.lod?42:50)?(d>(sd.lod>1?130:145)?2:1):0;if(l!==(sd.lod|0)){sd.lod=l;sldLod(b)}}
function sldLook(b,i){const sd=b.sld;if(!sd)return;if(!sd.var)sldBuild(b);sd.ti=i;sd.sm.material=sd.mats[i];sd.sm.geometry=(i===0||i===1||i===3)?SLS.geoNH:SLS.geo;sd.var.forEach((l,k)=>l.forEach(m=>{m.visible=k===i;if(k===i&&(m.geometry===SLS.vgL||m.geometry===SLS.pgL)){m.geometry=m.geometry===SLS.vgL?SLS.vg:SLS.pg}}));sd.lod=0;sldLodTick(b,Math.hypot(b.g.position.x-P.x,b.g.position.z-P.z))}

function sldVestGeo(){if(SLS.vg)return SLS.vg;const g=new THREE.BufferGeometry(),n=VSD.p.length/3,P_=new Float32Array(n*3),N_=new Float32Array(n*3),U_=new Float32Array(n*2);for(let i=0;i<n*3;i++){P_[i]=VSD.p[i]/1e4;N_[i]=VSD.nr[i]/100}for(let i=0;i<n*2;i++)U_[i]=VSD.u[i]/1e3;
g.setAttribute('position',new THREE.BufferAttribute(P_,3));g.setAttribute('normal',new THREE.BufferAttribute(N_,3));g.setAttribute('uv',new THREE.BufferAttribute(U_,2));g.setIndex(new THREE.BufferAttribute(new Uint16Array(VSD.i),1));
g.applyMatrix4(SLS.inv[SLS.ix.Spine2]);g.computeBoundingSphere();SLS.vg=g;
const t=new THREE.TextureLoader().load(VSD.tex);t.encoding=THREE.sRGBEncoding;SLS.vm=[0xffffff,0xdde3ee,0xcfd6b0,0x8a8f96].map(c=>new THREE.MeshLambertMaterial({map:t,color:c,side:THREE.DoubleSide}));return g}

function sldPackGeo(){if(SLS.pg)return SLS.pg;const g=new THREE.BufferGeometry(),n=PKD.p.length/3,P_=new Float32Array(n*3),N_=new Float32Array(n*3),C_=new Float32Array(n*3);for(let i=0;i<n*3;i++){P_[i]=PKD.p[i]/1e4;N_[i]=PKD.nr[i]/100;C_[i]=PKD.c[i]/255}
g.setAttribute('position',new THREE.BufferAttribute(P_,3));g.setAttribute('normal',new THREE.BufferAttribute(N_,3));g.setAttribute('color',new THREE.BufferAttribute(C_,3));g.setIndex(new THREE.BufferAttribute(new Uint16Array(PKD.i),1));
g.applyMatrix4(SLS.inv[SLS.ix.Spine2]);g.computeBoundingSphere();SLS.pg=g;SLS.pm=[0,0xffffff,0xd9d2a8,0].map(c=>new THREE.MeshLambertMaterial({vertexColors:true,color:c,side:THREE.DoubleSide}));return g}

function sldHelmGeo(t){SLS.hg=SLS.hg||{};if(SLS.hg[t])return SLS.hg[t];const D=HLD[t],g=new THREE.BufferGeometry(),n=D.p.length/3,P_=new Float32Array(n*3),N_=new Float32Array(n*3),C_=new Float32Array(n*3);for(let i=0;i<n*3;i++){P_[i]=D.p[i]/1e4;N_[i]=D.nr[i]/100;C_[i]=D.c[i]/255}
g.setAttribute('position',new THREE.BufferAttribute(P_,3));g.setAttribute('normal',new THREE.BufferAttribute(N_,3));g.setAttribute('color',new THREE.BufferAttribute(C_,3));g.setIndex(new THREE.BufferAttribute(new Uint16Array(D.i),1));
g.applyMatrix4(SLS.inv[SLS.ix.Head]);g.computeBoundingSphere();SLS.hg[t]=g;if(!SLS.hm)SLS.hm={};SLS.hm[0]=SLS.hm[0]||new THREE.MeshLambertMaterial({vertexColors:true,color:0xffffff,side:THREE.DoubleSide});SLS.hm[1]=SLS.hm[1]||new THREE.MeshLambertMaterial({vertexColors:true,color:0xf0f4e0,side:THREE.DoubleSide});SLS.hm[3]=SLS.hm[3]||new THREE.MeshLambertMaterial({vertexColors:true,color:0x7a7f88,side:THREE.DoubleSide});return g}
