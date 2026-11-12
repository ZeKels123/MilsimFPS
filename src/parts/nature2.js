
// ================= EAU (v5) : étang + ruisseau, roseaux, nénuphars =================
const WAT={uT:{value:0},uRain:{value:0},uSunC:{value:new THREE.Color(1,1,1)},uPl:{value:new THREE.Vector3(0,0,-9)}};
{const st=.75,x0=8,x1=54,z0=30,z1=66,nx=Math.round((x1-x0)/st),nz=Math.round((z1-z0)/st),pos=[],dep=[],flw=[],idx=[],id=new Int32Array((nx+1)*(nz+1)).fill(-1);
const flow=(x,z)=>{let bd=9,fx=0,fz=0;for(let i=0;i<BROOK.length-1;i++){const p=BROOK[i],q=BROOK[i+1],ex=q[0]-p[0],ez=q[1]-p[1],l=Math.hypot(ex,ez),t=Math.max(0,Math.min(1,((x-p[0])*ex+(z-p[1])*ez)/(l*l))),d=Math.hypot(p[0]+ex*t-x,p[1]+ez*t-z);if(d<bd){bd=d;fx=ex/l;fz=ez/l}}const k=1-sstep(1.5,3.5,bd);return[fx*k,fz*k]};
const vid=(i,j)=>{const k=j*(nx+1)+i;if(id[k]<0){const x=x0+i*st,z=z0+j*st;id[k]=pos.length/3;pos.push(x,WL,z);dep.push(WL-GH(x,z));const f=flow(x,z);flw.push(f[0],f[1])}return id[k]};
for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=x0+i*st,z=z0+j*st;if(Math.min(wDist(x,z),wDist(x+st,z),wDist(x,z+st),wDist(x+st,z+st))>.9)continue;const a=vid(i,j),b=vid(i+1,j),c=vid(i+1,j+1),d=vid(i,j+1);idx.push(a,d,b,b,d,c)}
const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('aDep',new THREE.Float32BufferAttribute(dep,1));g.setAttribute('aFlow',new THREE.Float32BufferAttribute(flw,2));g.setIndex(idx);
const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:true,uniforms:Object.assign(THREE.UniformsUtils.clone(THREE.UniformsLib.fog),{uT:WAT.uT,uRain:WAT.uRain,uSunC:WAT.uSunC,uPl:WAT.uPl,uTop:skyU.uTop,uHor:skyU.uHor,uSunD:{value:LDIR}}),
vertexShader:`attribute float aDep;attribute vec2 aFlow;varying vec3 vW;varying float vDep;varying vec2 vFl;
#include <fog_pars_vertex>
void main(){vW=position;vDep=aDep;vFl=aFlow;vec4 mvPosition=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mvPosition;
#include <fog_vertex>
}`,
fragmentShader:`uniform float uT,uRain;uniform vec3 uTop,uHor,uSunD,uSunC,uPl;varying vec3 vW;varying float vDep;varying vec2 vFl;
#include <fog_pars_fragment>
float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1.,0.)),f.x),mix(h21(i+vec2(0.,1.)),h21(i+vec2(1.,1.)),f.x),f.y);}
float wh(vec2 p){vec2 q=p-vFl*uT*1.3;return vn(q*1.7+vec2(uT*.35,uT*.22))*.5+vn(q*4.1-vec2(uT*.5,-uT*.31))*.28+vn(q*9.3+vec2(-uT*.8,uT*.6))*.12;}
float ring(vec2 p,float sc){vec2 c=floor(p*sc),f=fract(p*sc)-.5;float r=h21(c),t=fract(uT*(.7+r*.6)+r*7.),d=length(f);return sin((d-t*.5)*40.)*smoothstep(.06,0.,abs(d-t*.5))*(1.-t);}
void main(){if(vDep<0.)discard;vec2 p=vW.xz;float e=.12,h0=wh(p),hx=wh(p+vec2(e,0.)),hz=wh(p+vec2(0.,e));
vec2 gr=vec2(h0-hx,h0-hz)/e*(.1+.25*length(vFl));
if(uRain>.05)gr+=vec2(ring(p,1.3),ring(p+3.7,1.9))*uRain*.5;
float pd=length(p-uPl.xy);gr+=normalize(p-uPl.xy+1e-4)*sin(pd*9.-uT*8.)*uPl.z*exp(-pd*1.1)*.35;
vec3 n=normalize(vec3(gr.x,1.,gr.y)),V=normalize(cameraPosition-vW),R=reflect(-V,n);
float fr=.03+.97*pow(1.-max(dot(n,V),0.),5.);
vec3 sky=mix(uHor,uTop,pow(clamp(R.y,0.,1.),.5)),lum=uSunC*.5+uTop*.4,deep=mix(vec3(.24,.3,.18),vec3(.07,.2,.19),smoothstep(0.,.8,vDep))*lum;
vec3 c=mix(deep,sky,fr)+uSunC*pow(max(dot(R,uSunD),0.),220.)*1.6;
float fo=smoothstep(.07,0.,vDep)*(.5+.5*vn(p*7.+uT*.6))+length(vFl)*smoothstep(.72,.8,vn(p*5.-vFl*uT*2.6))*.5;c=mix(c,lum*1.1,clamp(fo,0.,1.)*.6);
gl_FragColor=vec4(c,clamp(mix(.25,.93,smoothstep(0.,.55,vDep))+fr+fo,0.,1.));
#include <tonemapping_fragment>
#include <fog_fragment>
}`});
const w=new THREE.Mesh(g,m);w.renderOrder=2;w.frustumCulled=true;g.computeBoundingSphere();S.add(w);
// roseaux et nénuphars
const o=new THREE.Object3D(),col=new THREE.Color(),rp=[],ru=[],rn=[],ri=[];
[0,1.05,2.1].forEach(r=>{const b=rp.length/3,c=Math.cos(r),s=Math.sin(r);[[-.035,0],[.035,0],[.014,1],[-.014,1]].forEach(q=>{rp.push(q[0]*c,q[1],q[0]*s);ru.push(q[0]>0?1:0,q[1]);rn.push(0,1,0)});ri.push(b,b+1,b+2,b,b+2,b+3,b,b+2,b+1,b,b+3,b+2)});
const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(rp,3));rg.setAttribute('uv',new THREE.Float32BufferAttribute(ru,2));rg.setAttribute('normal',new THREE.Float32BufferAttribute(rn,3));rg.setIndex(ri);
const NR=420,rd_=new THREE.InstancedMesh(rg,windify(std(0xffffff,{roughness:1,envMapIntensity:.4}),5),NR);let n=0,t=0;
while(n<NR&&t++<60000){const x=rnd(x0,x1),z=rnd(z0,z1),d=wDist(x,z);if(d>.9||d<-1.1||vn2(x*.3,z*.3)<.42)continue;o.position.set(x,GH(x,z)-.05,z);o.rotation.set(rnd(-.08,.08),rnd(0,6),rnd(-.08,.08));const s=rnd(.9,1.9);o.scale.set(1.3,s,1.3);o.updateMatrix();rd_.setMatrixAt(n,o.matrix);col.setHSL(rnd(.2,.28),rnd(.35,.5),rnd(.2,.34));rd_.setColorAt(n,col);n++}
rd_.count=n;rd_.receiveShadow=true;S.add(rd_);
const NL=46,ll=new THREE.InstancedMesh(new THREE.CircleGeometry(.3,9,.35,5.6),std(0xffffff,{roughness:.6,side:THREE.DoubleSide}),NL);n=0;t=0;
while(n<NL&&t++<9000){const x=rnd(POND.x-11,POND.x+11),z=rnd(POND.z-9,POND.z+9),d=wDist(x,z);if(d>-.8||d<-4||Math.hypot(x-35,z-43.5)<3)continue;o.position.set(x,WL+.012,z);o.rotation.set(-Math.PI/2,0,rnd(0,6));o.scale.setScalar(rnd(.6,1.3));o.updateMatrix();ll.setMatrixAt(n,o.matrix);col.setHSL(rnd(.26,.33),.5,rnd(.2,.3));ll.setColorAt(n,col);n++}
ll.count=n;ll.receiveShadow=true;ll.renderOrder=3;S.add(ll);
// source : rochers
const sr=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1,0),std(0x7d7b72,{roughness:.95,flatShading:true}),14);for(let i=0;i<14;i++){const a=i/14*6.28+rnd(-.2,.2),r=i<9?rnd(2,2.9):rnd(.3,1.2),x=BROOK[0][0]+Math.cos(a)*r-(i<9?.8:0),z=BROOK[0][1]+Math.sin(a)*r+(i<9?.8:0),s=i<9?rnd(.5,1.1):rnd(.2,.4);o.position.set(x,GH(x,z)+s*.2,z);o.rotation.set(rnd(0,3),rnd(0,3),rnd(0,3));o.scale.set(s*rnd(.9,1.4),s*rnd(.6,.9),s*rnd(.9,1.3));o.updateMatrix();sr.setMatrixAt(i,o.matrix)}
sr.castShadow=sr.receiveShadow=true;S.add(sr)}
function vn2(x,z){const i=Math.floor(x),j=Math.floor(z),a=x-i,b=z-j,u=a*a*(3-2*a),v=b*b*(3-2*b),h=(p,q)=>hsh(p+17,q+431);return(h(i,j)*(1-u)+h(i+1,j)*u)*(1-v)+(h(i,j+1)*(1-u)+h(i+1,j+1)*u)*v}

// ================= FAUNE (v5) : oiseaux, lapins, chevreuils, canards, poissons, papillons, lucioles =================
function bgeo(parts){const P_=[],N_=[],C_=[],I_=[];let o=0;const c=new THREE.Color(),m=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),one=new THREE.Vector3(1,1,1);
parts.forEach(a=>{const g=new THREE.BoxGeometry(a[0],a[1],a[2]);m.compose(new THREE.Vector3(a[3],a[4],a[5]),q.setFromEuler(e.set(a[7]||0,0,a[8]||0)),one);g.applyMatrix4(m);c.setHex(a[6]);const p=g.attributes.position,nn=g.attributes.normal;
for(let i=0;i<p.count;i++){P_.push(p.getX(i),p.getY(i),p.getZ(i));N_.push(nn.getX(i),nn.getY(i),nn.getZ(i));C_.push(c.r,c.g,c.b)}for(let i=0;i<g.index.count;i++)I_.push(g.index.array[i]+o);o+=p.count});
const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P_,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N_,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C_,3));g.setIndex(I_);return g}
const FA={birds:[],rab:[],deer:[],ducks:[],fish:[],nz:0,scare:0,sx:0,sz:0,sr:0,chT:3,spT:0,amb:null};
const furM=std(0xffffff,{vertexColors:true,roughness:.95,envMapIntensity:.3});
{// oiseaux : un seul InstancedMesh, battement d'ailes dans le shader
const bp=[0,0,.16, .05,0,-.06, -.05,0,-.06, 0,0,-.2,  .04,0,.06, .04,0,-.07, .42,0,-.04,  -.04,0,.06, -.42,0,-.04, -.04,0,-.07],aw=[0,0,0,0,0,0,1,0,1,0],bi=[0,1,2,1,3,2,4,6,5,7,9,8];
const bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.Float32BufferAttribute(bp,3));bg.setAttribute('aw',new THREE.Float32BufferAttribute(aw,1));bg.setIndex(bi);
const bm=new THREE.MeshBasicMaterial({color:0x14161a,side:THREE.DoubleSide});bm.onBeforeCompile=sh=>{sh.uniforms.uBt=WND.t;sh.vertexShader='attribute float aw;uniform float uBt;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.y+=aw*sin(uBt*13.+instanceMatrix[3].x*.7+instanceMatrix[3].z*.9)*.3*length(instanceMatrix[0].xyz);')};
const NBD=19;FA.bm=new THREE.InstancedMesh(bg,bm,NBD);FA.bm.frustumCulled=false;S.add(FA.bm);
S.updateMatrixWorld(true);const rc=new THREE.Raycaster();
for(let i=0;i<NBD;i++){const b={p:new THREE.Vector3(rnd(-40,40),rnd(14,22),rnd(-40,40)),v:new THREE.Vector3(rnd(-1,1),0,rnd(-1,1)).normalize().multiplyScalar(7),f:i<14?(i<8?0:1):0,o:new THREE.Vector3(rnd(-5,5),rnd(-1.5,1.5),rnd(-5,5)),perch:null,st:0,t:0,flap:1};
if(i>=14){const h=HS[(i-14)*2%8],x=(h[0]+h[2])/2+rnd(-1.5,1.5),z=(h[1]+h[3])/2+rnd(-.3,.3);rc.set(new THREE.Vector3(x,14,z),new THREE.Vector3(0,-1,0));rc.far=20;const hit=rc.intersectObjects(solids.concat(S.children.filter(q=>q.isGroup)),true)[0];b.perch=new THREE.Vector3(x,(hit?hit.point.y:4.5)+.06,z);b.p.copy(b.perch);b.st=1;b.yaw=rnd(0,6)}
FA.birds.push(b)}
// lapins
const rg=bgeo([[.14,.14,.26,0,.13,0,0x8a7458],[.11,.11,.12,0,.2,.17,0x8a7458],[.03,.13,.03,-.03,.31,.15,0x7a6448],[.03,.13,.03,.03,.31,.15,0x7a6448],[.07,.07,.07,0,.14,-.15,0xe8e4da],[.05,.06,.14,-.06,.03,-.05,0x7a6448],[.05,.06,.14,.06,.03,-.05,0x7a6448]]);
for(let i=0;i<7;i++){const m=new THREE.Mesh(rg,furM);m.castShadow=true;m.rotation.order='YXZ';S.add(m);FA.rab.push({m,x:0,z:0,yaw:rnd(0,6),tx:0,tz:0,st:0,t:rnd(1,4),hop:0,home:i})}
// chevreuils : corps + tête + 4 pattes animées
const dbody=bgeo([[.32,.36,.95,0,0,0,0x9a6a40],[.2,.2,.3,0,-.02,-.42,0xe6dccb],[.05,.1,.05,0,.1,-.5,0xe6dccb]]),dneck=bgeo([[.15,.5,.17,0,.2,.04,0x9a6a40,.5],[.16,.17,.3,0,.46,.22,0x8f6038],[.09,.09,.12,0,.43,.4,0x2a2018],[.03,.16,.03,-.07,.6,.14,0x5a4630,0,-.3],[.03,.16,.03,.07,.6,.14,0x5a4630,0,.3]]),dleg=bgeo([[.08,.34,.09,0,-.17,0,0x9a6a40],[.06,.36,.06,0,-.5,0,0x7a5230],[.07,.05,.08,0,-.69,0,0x1e1812]]);
for(let i=0;i<3;i++){const g=new THREE.Group();g.rotation.order='YXZ';const bd=new THREE.Mesh(dbody,furM);bd.position.y=.92;bd.castShadow=true;g.add(bd);const nk=new THREE.Mesh(dneck,furM);nk.position.set(0,1.0,.4);nk.castShadow=true;g.add(nk);
const lg=[[-.11,.36],[.11,.36],[-.11,-.36],[.11,-.36]].map(a=>{const l=new THREE.Mesh(dleg,furM);l.position.set(a[0],.74,a[1]);l.castShadow=true;g.add(l);return l});S.add(g);FA.deer.push({g,nk,lg,x:0,z:0,yaw:rnd(0,6),tx:0,tz:0,st:0,t:rnd(2,6),ph:0,hd:0})}
// canards et poissons
const dg=bgeo([[.16,.12,.3,0,.05,0,0x6a5a48],[.07,.14,.07,0,.16,.12,0x2a5a3a],[.08,.08,.1,0,.24,.14,0x2a5a3a],[.05,.025,.07,0,.23,.22,0xd8a020],[.1,.05,.08,0,.1,-.17,0xe8e4da]]);
for(let i=0;i<3;i++){const m=new THREE.Mesh(dg,furM);m.castShadow=true;S.add(m);FA.ducks.push({m,a:i*2.1,r:.45+i*.12,sp:.12,yaw:0,x:POND.x,z:POND.z})}
const fg=new THREE.BufferGeometry();fg.setAttribute('position',new THREE.Float32BufferAttribute([0,0,.18, .05,0,0, -.05,0,0, 0,0,-.12, .06,0,-.22, -.06,0,-.22],3));fg.setIndex([0,1,2,1,3,2,3,4,5]);const fm=new THREE.MeshBasicMaterial({color:0x1a2218,transparent:true,opacity:.55,side:THREE.DoubleSide,depthWrite:false});
for(let i=0;i<7;i++){const m=new THREE.Mesh(fg,fm);m.renderOrder=1;m.scale.setScalar(rnd(.8,1.5));S.add(m);FA.fish.push({m,a:rnd(0,6),r:rnd(.15,.6),sp:rnd(.25,.5)*(i%2?1:-1),o:rnd(0,6)})}
// papillons (jour) et lucioles (nuit)
const mkPts=(n,size,add)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(n*3),3));g.setAttribute('color',new THREE.BufferAttribute(new Float32Array(n*3),3));const p=new THREE.Points(g,new THREE.PointsMaterial({size,vertexColors:true,transparent:true,depthWrite:false,sizeAttenuation:true,blending:add?THREE.AdditiveBlending:THREE.NormalBlending,toneMapped:!add}));p.frustumCulled=false;S.add(p);return p};
FA.bf=mkPts(34,.11,0);FA.bfd=[];for(let i=0;i<34;i++){let x,z,k=0;do{x=rnd(-68,68);z=rnd(-68,68)}while((!okPos(x,z,1)||Math.abs(x)<9&&z>16)&&k++<30);const c=new THREE.Color().setHSL([.12,.08,.0,.58,.15][i%5],.9,i%5===2?.92:.6);FA.bfd.push({x,z,ph:rnd(0,6),c})}
FA.ff=mkPts(70,.09,1);FA.ffd=[];for(let i=0;i<70;i++){let x,z,k=0;do{if(i<40){x=POND.x+rnd(-17,17);z=POND.z+rnd(-14,14)}else{x=rnd(-68,68);z=rnd(-68,68)}}while(!okPos(x,z,.5)&&wDist(x,z)>0&&k++<20);FA.ffd.push({x,z,ph:rnd(0,6),sp:rnd(.6,1.4)})}
}
function faSpot(o,r0,r1,cx,cz){for(let k=0;k<25;k++){const a=rnd(0,6.28),r=rnd(r0,r1),x=Math.max(-71,Math.min(71,cx+Math.cos(a)*r)),z=Math.max(-71,Math.min(71,cz+Math.sin(a)*r));if(free_(x,z)&&wDist(x,z)>1&&!(Math.abs(x)<10&&z>15)){o.tx=x;o.tz=z;return}}o.tx=cx;o.tz=cz}
function faThreat(x,z,r){let bx=0,bz=0,bd=r;const q=(px,pz)=>{const d=Math.hypot(px-x,pz-z);if(d<bd){bd=d;bx=px;bz=pz}};q(P.x,P.z);for(const b of bots)if(!b.dead)q(b.g.position.x,b.g.position.z);if(FA.scare>0){const d=Math.hypot(FA.sx-x,FA.sz-z);if(d<FA.sr&&bd>=r){bd=0;bx=FA.sx;bz=FA.sz}}return bd<r?[bx,bz]:null}
function faMove(o,sp,dt){const dx=o.tx-o.x,dz=o.tz-o.z,d=Math.hypot(dx,dz);if(d<.3)return true;const nx=o.x+dx/d*sp*dt,nz=o.z+dz/d*sp*dt;if(!free_(nx,nz)||wDist(nx,nz)<.3){return true}o.x=nx;o.z=nz;let dy=Math.atan2(dx,dz)-o.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));o.yaw+=dy*Math.min(1,dt*9);return false}
const _fm=new THREE.Matrix4(),_fq=new THREE.Quaternion(),_fe=new THREE.Euler(0,0,0,'YXZ'),_fs=new THREE.Vector3(),_fv=new THREE.Vector3();let faInit=false;
function natureUpdate(dt){const T=WND.t.value+=dt,rn=wcur[2],e=SUND.y,day=TOD.t>6.2&&TOD.t<19.5,night=TOD.t>20.3||TOD.t<5;
WND.s.value+=((.22+wcur[6]*.75)-WND.s.value)*Math.min(1,dt*.5);WND.p.value.set(P.x,P.z);
WAT.uT.value=T;WAT.uRain.value=rn;WAT.uSunC.value.copy(sun.color).multiplyScalar(Math.min(1.3,sun.intensity)+.06);
// joueur dans l'eau
const pdp=wDep(P.x,P.z),mvg=!!(K.KeyW||K.KeyA||K.KeyS||K.KeyD);WAT.uPl.value.set(P.x,P.z,Math.max(0,WAT.uPl.value.z+((pdp>.05&&mvg?1:0)-WAT.uPl.value.z)*Math.min(1,dt*3)));
PWADE=pdp>.2?Math.max(.5,1-pdp*.55):1;if(pdp>.08&&mvg){FA.spT-=dt;if(FA.spT<=0){FA.spT=.34;snd(rnd(240,420),.12,.05,'triangle');for(let i=0;i<3;i++)emit(_fv.set(P.x+rnd(-.2,.2),WL+.05,P.z+rnd(-.2,.2)),_e.set(rnd(-.6,.6),rnd(.8,1.7),rnd(-.6,.6)),{color:0xcfe0e0,size:.07,life:.5,a:.5,g:5,grow:.2})}}
if(!faInit){faInit=true;FA.rab.forEach((r,i)=>{faSpot(r,6,60,0,0);r.x=r.tx;r.z=r.tz});FA.deer.forEach((d,i)=>{faSpot(d,4,14,[-40,48,-20][i],[-45,20,55][i]);d.x=d.tx;d.z=d.tz})}
if(NZ.n!==FA.nz){FA.nz=NZ.n;FA.scare=1.2;FA.sx=NZ.x;FA.sz=NZ.z;FA.sr=NZ.r}else FA.scare=Math.max(0,FA.scare-dt);
// oiseaux
const birdsOn=rn<.5;FA.birds.forEach((b,i)=>{if(b.st===1){// posé
const th=Math.hypot(P.x-b.perch.x,P.z-b.perch.z)<9||(FA.scare>0&&Math.hypot(FA.sx-b.perch.x,FA.sz-b.perch.z)<Math.min(FA.sr,45));if(th){b.st=0;b.t=rnd(18,30);b.v.set(rnd(-2,2),4,rnd(-2,2))}else{b.yaw+=Math.sin(T*.7+i)*dt*.3;_fe.set(0,b.yaw,0);_fq.setFromEuler(_fe);_fm.compose(b.perch,_fq,_fs.set(.55,.55,.55));FA.bm.setMatrixAt(i,_fm);return}}
const k=b.f,ct=T*.045*(k?-1.3:1)+k*2.4,cx=Math.cos(ct)*(k?34:46)+(k?-12:8),cz=Math.sin(ct*1.31)*(k?40:30),cy=(k?19:15)+Math.sin(T*.11+k)*3+(FA.scare>0?6:0);
let tx=cx+b.o.x+Math.sin(T*.6+i)*2,ty=cy+b.o.y,tz=cz+b.o.z+Math.cos(T*.5+i*2)*2;
if(b.perch){b.t-=dt;if(b.t<=0){tx=b.perch.x;ty=b.perch.y+.3;tz=b.perch.z;if(b.p.distanceTo(b.perch)<1.2&&Math.hypot(P.x-b.perch.x,P.z-b.perch.z)>12){b.st=1;b.p.copy(b.perch);return}}}
_fv.set(tx-b.p.x,ty-b.p.y,tz-b.p.z);const d=_fv.length()||1,sp=(FA.scare>0?11:7.5)*(birdsOn?1:.6);b.v.addScaledVector(_fv,dt*2.2*sp/d);const vl=b.v.length();if(vl>sp)b.v.multiplyScalar(sp/vl);b.p.addScaledVector(b.v,dt);
_fe.set(-Math.atan2(b.v.y,Math.hypot(b.v.x,b.v.z))*.6,Math.atan2(b.v.x,b.v.z),0);_fq.setFromEuler(_fe);_fm.compose(b.p,_fq,_fs.set(1,1,1));FA.bm.setMatrixAt(i,_fm)});FA.bm.instanceMatrix.needsUpdate=true;
// lapins
FA.rab.forEach(r=>{const th=faThreat(r.x,r.z,8.5);if(th&&r.st!==2){r.st=2;r.t=rnd(1.6,2.8);const a=Math.atan2(r.x-th[0],r.z-th[1])+rnd(-.5,.5);r.tx=Math.max(-71,Math.min(71,r.x+Math.sin(a)*16));r.tz=Math.max(-71,Math.min(71,r.z+Math.cos(a)*16))}
r.t-=dt;let mv=false;if(r.st===0){if(r.t<=0){r.st=1;r.t=rnd(1.5,3.5);faSpot(r,2.5,7,r.x,r.z)}}else{const done=faMove(r,r.st===2?7.5:2.6,dt);mv=!done;if(done||r.t<=0){if(r.st===2&&done&&r.t>0)faSpot(r,6,14,r.x,r.z);else{r.st=0;r.t=rnd(2,6)}}}
r.hop=mv?r.hop+dt*(r.st===2?13:8):0;const hy=mv?Math.abs(Math.sin(r.hop)):0;r.m.position.set(r.x,GH(r.x,r.z)+hy*(r.st===2?.22:.14),r.z);r.m.rotation.set(mv?-Math.cos(r.hop*2)*.25:(r.st===0?Math.max(0,Math.sin(T*1.3+r.home))*.5-.1:0)*-1,r.yaw,0)});
// chevreuils
FA.deer.forEach((d,i)=>{const th=faThreat(d.x,d.z,17);if(th&&d.st!==2){d.st=2;d.t=rnd(3,4.5);const a=Math.atan2(d.x-th[0],d.z-th[1])+rnd(-.4,.4);d.tx=Math.max(-71,Math.min(71,d.x+Math.sin(a)*34));d.tz=Math.max(-71,Math.min(71,d.z+Math.cos(a)*34))}
d.t-=dt;let mv=false;if(d.st===0){if(d.t<=0){d.st=1;d.t=rnd(6,12);faSpot(d,8,18,d.x,d.z)}}else{const done=faMove(d,d.st===2?9.5:1.5,dt);mv=!done;if(done||d.t<=0){if(d.st===2&&done&&d.t>0)faSpot(d,10,22,d.x,d.z);else{d.st=0;d.t=rnd(4,10)}}}
d.ph+=dt*(d.st===2?15:5)*(mv?1:0);const s=Math.sin(d.ph),am=mv?(d.st===2?.9:.42):0;d.lg[0].rotation.x=s*am;d.lg[3].rotation.x=s*am;d.lg[1].rotation.x=-s*am;d.lg[2].rotation.x=-s*am;
d.hd+=((d.st===0&&Math.sin(T*.25+i*2)>-.2?1:0)-d.hd)*Math.min(1,dt*2);d.nk.rotation.x=d.hd*1.35+(mv?Math.sin(d.ph*2)*.04:0);
const gy=GH(d.x,d.z),sl=Math.atan2(GH(d.x-Math.sin(d.yaw)*.5,d.z-Math.cos(d.yaw)*.5)-GH(d.x+Math.sin(d.yaw)*.5,d.z+Math.cos(d.yaw)*.5),1);d.g.position.set(d.x,gy+(d.st===2&&mv?Math.abs(s)*.12:0),d.z);d.g.rotation.set(sl,d.yaw,0)});
// canards
FA.ducks.forEach((k,i)=>{const pd=Math.hypot(P.x-k.x,P.z-k.z),fl=pd<8;k.a+=dt*(fl?.55:k.sp)*(i%2?1:-1);if(fl){const away=Math.atan2(k.z-P.z,k.x-P.x),da=Math.atan2(Math.sin(away-k.a),Math.cos(away-k.a));k.a+=da*dt*.8}
const c=Math.cos(POND.rot),s=Math.sin(POND.rot),u=Math.cos(k.a)*POND.rx*k.r,v=Math.sin(k.a)*POND.rz*k.r,x=POND.x+u*c-v*s,z=POND.z+u*s+v*c;k.yaw=Math.atan2(x-k.x,z-k.z)||k.yaw;k.x=x;k.z=z;k.m.position.set(x,WL-.02+Math.sin(T*2+i)*.012,z);k.m.rotation.set(Math.sin(T*1.7+i)*.04,k.yaw,0)});
FA.fish.forEach((f,i)=>{f.a+=dt*f.sp;const c=Math.cos(POND.rot),s=Math.sin(POND.rot),rr=f.r+Math.sin(T*.3+f.o)*.1,u=Math.cos(f.a)*POND.rx*rr,v=Math.sin(f.a*1.0+f.o*.2)*POND.rz*rr,x=POND.x+u*c-v*s,z=POND.z+u*s+v*c,m=f.m;m.rotation.y=Math.atan2(x-m.position.x,z-m.position.z)+Math.sin(T*9+i)*.25;m.position.set(x,WL-.22,z)});
// papillons / lucioles
{const a=FA.bf.geometry.attributes,vis=day&&rn<.2?1:0;FA.bf.visible=!!vis;if(vis)FA.bfd.forEach((b,i)=>{const t=T*.5+b.ph,x=b.x+Math.sin(t*1.3)*2.2+Math.sin(t*3.1)*.6,z=b.z+Math.cos(t*1.1)*2.2+Math.cos(t*2.7)*.6,fl=.55+.45*Math.abs(Math.sin(T*14+b.ph));a.position.setXYZ(i,x,GH(x,z)+.55+Math.sin(t*2.3)*.3+Math.abs(Math.sin(T*9+b.ph))*.07,z);a.color.setXYZ(i,b.c.r*fl,b.c.g*fl,b.c.b*fl)});a.position.needsUpdate=a.color.needsUpdate=true}
{const a=FA.ff.geometry.attributes,vis=night&&rn<.4;FA.ff.visible=vis;if(vis)FA.ffd.forEach((b,i)=>{const t=T*.3*b.sp+b.ph,x=b.x+Math.sin(t)*1.6,z=b.z+Math.cos(t*.8)*1.6,g=Math.max(0,Math.sin(T*1.6*b.sp+b.ph*3)),y=Math.max(GH(x,z),WL)+.5+Math.sin(t*1.7)*.35;a.position.setXYZ(i,x,y,z);a.color.setXYZ(i,.75*g,1.0*g,.25*g)});a.position.needsUpdate=a.color.needsUpdate=true}
// ambiance sonore : oiseaux le jour, grillons la nuit, grenouilles près de l'étang, clapotis
FA.chT-=dt;if(FA.chT<=0&&!ac.on){const dpo=Math.hypot(P.x-POND.x,P.z-POND.z);if(day&&rn<.5){FA.chT=rnd(1.8,6);const f=rnd(2400,4200),n=1+(Math.random()*3|0);for(let i=0;i<n;i++)setTimeout(()=>snd(f*rnd(.9,1.15),.09,.022,'sine'),i*130)}
else if(night){FA.chT=rnd(.5,1.4);if(dpo<32&&Math.random()<.45)snd(rnd(150,210),.16,.05*(1-dpo/40),'sawtooth');else for(let i=0;i<3;i++)setTimeout(()=>snd(4300,.035,.009,'square'),i*70)}else FA.chT=3}
try{if(AC){if(!FA.amb){const n=AC.sampleRate*2,b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;const s=AC.createBufferSource(),f=AC.createBiquadFilter();s.buffer=b;s.loop=true;f.type='bandpass';f.frequency.value=900;f.Q.value=.8;FA.amb=AC.createGain();FA.amb.gain.value=0;s.connect(f).connect(FA.amb).connect(AOUT());s.start()}
const dw=Math.max(0,wDist(P.x,P.z));FA.amb.gain.value+=(Math.max(0,.05*(1-dw/14))-FA.amb.gain.value)*.05}}catch(e){}}
