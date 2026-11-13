// ───── Serpent (python, 1,84 m) : modèle à squelette, ondulation, IA, dégâts dans les deux sens ─────
// Les 91 os sont posés chaque image le long de la piste de la tête (ondulation de type reptation).
// États : rôde → alerte (tête dressée, siffle) → frappe (bond + morsure) → fuite brève → alerte … ; fuite si blessé ; mort.
// Touché par : balles du joueur (FA.hit/castShot), couteau, grenades, tirs des bots. Mord : joueur (jambes) et bots.
const SNK={list:[],ok:0,N:4,Y0:-.0184,lift:.04,t:0,cd:0,SP:.02};
const _sq=new THREE.Quaternion(),_sq2=new THREE.Quaternion(),_sm=new THREE.Matrix4(),_sx=new THREE.Vector3(),_sy=new THREE.Vector3(),_sz=new THREE.Vector3(),_su=new THREE.Vector3(0,1,0),_sa={x:0,z:0},_sb={x:0,z:0},_sc={x:0,z:0},_sv=new THREE.Vector3(),_sw=new THREE.Vector3(),_sqa=new THREE.Vector3(0,0,1);
function snkInit(){
if(SNK.ok)return;SNK.ok=1;
SNK.B=SND.bones.map(b=>b.map(v=>v/1e4));SNK.d=SNK.B.map(b=>b[2]-SNK.B[90][2]);
SNK.tex={};for(const k in SND.tex){const t=new THREE.TextureLoader().load(SND.tex[k]);t.anisotropy=4;SNK.tex[k]=t}
let mn=9;
SNK.geo=SND.parts.map(p=>{const G=new THREE.BufferGeometry();const P_=Float32Array.from(p.p,v=>v/1e4);if(p.n==='mesh_0')for(let i=1;i<P_.length;i+=3)mn=Math.min(mn,P_[i]);
G.setAttribute('position',new THREE.BufferAttribute(P_,3));G.setAttribute('normal',new THREE.BufferAttribute(Float32Array.from(p.nr,v=>v/100),3));G.setAttribute('uv',new THREE.BufferAttribute(Float32Array.from(p.u,v=>v/1000),2));
G.setAttribute('skinIndex',new THREE.BufferAttribute(Uint16Array.from(p.s),4));G.setAttribute('skinWeight',new THREE.BufferAttribute(Float32Array.from(p.w,v=>v/100),4));G.setIndex(p.i);return G});
SNK.lift=SNK.Y0-mn;
SNK.mat=SND.parts.map(p=>new THREE.MeshLambertMaterial({map:SNK.tex[p.tex],skinning:true,emissive:0xffffff,emissiveMap:SNK.tex[p.tex],emissiveIntensity:.2}));
SNK.pg=new THREE.SphereGeometry(1,6,4);SNK.pm=new THREE.MeshBasicMaterial({visible:false});
// proxys de collision : tête + 6 points du corps (os les plus proches de ces distances)
SNK.pd=[.25,.5,.78,1.05,1.32,1.6].map(t=>{let bi=1,bd=9;for(let k=1;k<88;k++){const q=Math.abs(SNK.d[k]-t);if(q<bd){bd=q;bi=k}}return bi});
SNK.sp=[]}
function snkMake(i){
const g=new THREE.Group(),bones=[];for(let k=0;k<91;k++){const b=new THREE.Bone();g.add(b);bones.push(b)}
const inv=SNK.B.map(b=>new THREE.Matrix4().makeTranslation(-b[0],-b[1],-b[2])),sk=new THREE.Skeleton(bones,inv);
SNK.geo.forEach((G,j)=>{const m=new THREE.SkinnedMesh(G,SNK.mat[j]);m.frustumCulled=false;m.castShadow=true;g.add(m);m.bind(sk,new THREE.Matrix4())});
S.add(g);
const s={snk:1,g,bones,px:[],tr:[],x:0,z:0,y:0,bx:0,bz:0,th:rnd(0,6.28),ph:rnd(0,6),am:0,v:0,hp:20,hm:20,dead:0,st:'wander',t:rnd(1,4),mv:1,sc:rnd(0,.3),cd:0,raise:0,roll:0,id:i,tgt:null,by:null,bit:0,bsc:rnd(0,.3),hpos:new THREE.Vector3(),idx:i};
for(let k=0;k<7;k++){const m=new THREE.Mesh(SNK.pg,SNK.pm);m.userData.an=s;m.userData.head=k===0;m.scale.setScalar(k===0?.075:.06);g.add(m);s.px.push(m);FA.hit.push(m)}
snkPlace(s);return s}
function snkSpot(){for(let n=0;n<80;n++){const a=rnd(0,6.283),r=rnd(14,95),x=Math.sin(a)*r,z=Math.cos(a)*r-10;if(Math.abs(x)>MH-12||Math.abs(z)>MH-12)continue;if(!free_(x,z))continue;if(Math.hypot((x-POND.x)/(POND.rx+6),(z-POND.z)/(POND.rz+6))<1.2)continue;if(SNK.list.some(o=>Math.hypot(o.x-x,o.z-z)<12))continue;return[x,z]}return[30,-40]}
function snkPlace(s){const p=snkSpot();s.bx=s.x=p[0];s.bz=s.z=p[1];s.th=rnd(0,6.283);s.tr=[];const fx=Math.sin(s.th),fz=Math.cos(s.th);for(let i=0;i<140;i++)s.tr.push([s.x-fx*SNK.SP*(i+1),s.z-fz*SNK.SP*(i+1)]);
s.hp=s.hm=20;s.dead=0;s.roll=0;s.raise=0;s.st='wander';s.t=rnd(1,4);s.tgt=null;s.by=null;s.am=0;s.v=0;s.g.visible=true;s.y=GH(s.x,s.z);snkPose(s,1)}
// point à la distance d de la tête le long de la piste
function snkArc(s,d,o){const t=s.tr,d0=Math.hypot(s.x-t[0][0],s.z-t[0][1]);if(d<=d0){const f=d0>1e-6?d/d0:0;o.x=s.x+(t[0][0]-s.x)*f;o.z=s.z+(t[0][1]-s.z)*f;return}
d-=d0;const i=Math.floor(d/SNK.SP);if(i>=t.length-1){o.x=t[t.length-1][0];o.z=t[t.length-1][1];return}const f=d/SNK.SP-i;o.x=t[i][0]+(t[i+1][0]-t[i][0])*f;o.z=t[i][1]+(t[i+1][1]-t[i][1])*f}
const snkRz=(s,d)=>s.raise*.26*Math.pow(Math.max(0,1-d/.5),2);
function snkPose(s,force){
const B=SNK.B,Y0=SNK.Y0,bn=s.bones;
for(let k=0;k<91;k++){const dk=SNK.d[k];snkArc(s,Math.max(0,dk-.06),_sb);snkArc(s,dk+.06,_sc);snkArc(s,dk,_sa);
const ya=GH(_sa.x,_sa.z)+SNK.lift+snkRz(s,dk),yb=GH(_sb.x,_sb.z)+SNK.lift+snkRz(s,Math.max(0,dk-.06)),yc=GH(_sc.x,_sc.z)+SNK.lift+snkRz(s,dk+.06);
_sz.set(_sc.x-_sb.x,yc-yb,_sc.z-_sb.z);if(_sz.lengthSq()<1e-9)_sz.set(Math.sin(s.th)*-1,0,Math.cos(s.th)*-1);_sz.normalize();
_sx.crossVectors(_su,_sz);if(_sx.lengthSq()<1e-6)_sx.set(1,0,0);_sx.normalize();_sy.crossVectors(_sz,_sx);_sm.makeBasis(_sx,_sy,_sz);_sq.setFromRotationMatrix(_sm);
if(s.roll)_sq.multiply(_sq2.setFromAxisAngle(_sqa,s.roll));
// décalage de l'os par rapport à l'axe du corps (os de la tête)
const oy=B[k][1]-Y0,ox=B[k][0];_sv.set(_sa.x,ya,_sa.z);if(oy||ox){_sw.set(ox,oy,0).applyQuaternion(_sq);_sv.add(_sw)}
bn[k].position.copy(_sv);bn[k].quaternion.copy(_sq)}
// proxys
const p0=bn[88].position,p2=bn[90].position;s.px[0].position.set((p0.x+p2.x)/2,(p0.y+p2.y)/2,(p0.z+p2.z)/2);s.hpos.copy(s.px[0].position);
for(let k=0;k<6;k++)s.px[k+1].position.copy(bn[SNK.pd[k]].position);
for(const m of s.px)m.updateMatrixWorld(true)}
// ─── dégâts reçus ───
function snkBlood(s,pt,n){for(let i=0;i<n;i++)emit(pt,_sv.set(rnd(-1,1),rnd(.2,1.2),rnd(-1,1)).multiplyScalar(1.8),{color:0x7a1010,size:.04,life:.45,g:9})}
function snkHit(s,pt,dm,by){if(s.dead)return false;const p=pt||s.hpos;if(pt&&pt.distanceTo(s.hpos)<.11)dm*=3;s.hp-=dm;snkBlood(s,p,6);snd(rnd(520,760),.1,.08,'triangle');
if(by==='P'){FA.scare=1.5;FA.sx=P.x;FA.sz=P.z;FA.sr=40}
if(s.hp<=0){snkDie(s);return true}
s.by=by;const o=snkWho(by),od=o?Math.hypot(o.x-s.x,o.z-s.z):99;
if(!o||s.hp<s.hm*.45||od>8){s.st='flee';s.t=rnd(3,4.5);s.tgt=o}else{s.tgt=o;if(s.st==='wander'||s.st==='flee'){s.st='alert';s.t=3;s.cd=Math.min(s.cd,.3);snkHiss(s)}}
return true}
function snkWho(by){if(by==='P')return{x:P.x,z:P.z,p:1};if(by&&by.g)return{x:by.g.position.x,z:by.g.position.z,b:by};return null}
function snkDie(s){s.dead=1;s.dt=45;s.hp=0;s.raise=0;s.st='dead';snkBlood(s,s.hpos,10)}
function snkHiss(s){sndAt(s.x,s.y+.1,s.z,4300,.45,.11,'sawtooth',{ref:4});sndAt(s.x,s.y+.1,s.z,6900,.4,.07,'sawtooth',{ref:4})}
function snkBlast(x,y,z,R,mine){for(const s of SNK.list){if(s.dead)continue;const d=Math.hypot(s.x-x,s.z-z,s.y-y);if(d>R)continue;snkHit(s,null,(1-d/R)*60+12,mine?'P':null)}}
function snkKnife(o,d,maxd){let hit=0;for(const s of SNK.list){if(s.dead)continue;for(const m of s.px){_sv.copy(m.position).sub(o);const dist=_sv.length();if(dist>2.3||dist>=maxd)continue;if(_sv.normalize().dot(d)<.72)continue;snkHit(s,m.userData.head?m.position:null,70,'P');hit=1;break}if(hit)break}return hit}
// ─── attaques du serpent ───
function snkBite(s,t){
if(t.p){if(HM.dead||ac.on)return;hlApply(Math.random()<.5?'ll':'rl',11,'o',{x:s.x,z:s.z});hlMsg('Morsure de serpent !');FXP.shake=Math.max(FXP.shake||0,.35);snd(260,.1,.25,'square')}
else if(t.b&&!t.b.dead){const b=t.b;bhHit(b,Math.random()<.5?'ll':'rl',12,'s');b.flinch=1;if(b.hp<=0&&!b.dead)botDie(b);else aiAlert(b,s.x,s.z,1.2)}}
function snkTargets(s){const r=[],sp=K.ShiftLeft&&(K.KeyW||K.KeyA||K.KeyS||K.KeyD),sf=[1,.65,.4][Math.min(2,P.st||0)];
if(!ac.on&&P.hp>0&&!HM.dead&&Math.abs((P.gy||0)-s.y)<1.4){const d=Math.hypot(P.x-s.x,P.z-s.z);if(d<(2.4+(sp?2.2:0))*sf+.5)r.push({x:P.x,z:P.z,p:1,d})}
for(const b of bots){if(b.dead)continue;const d=Math.hypot(b.g.position.x-s.x,b.g.position.z-s.z);if(d<3.2&&Math.abs(b.g.position.y-s.y)<1.6)r.push({x:b.g.position.x,z:b.g.position.z,b,d})}
return r}
const snkNear=a=>a.reduce((m,q)=>!m||q.d<m.d?q:m,null);
function snkMove(s,dt,v){
s.v+=(v-s.v)*Math.min(1,dt*6);const sp=s.v;s.ph+=sp*dt*10.2;s.am+=(Math.min(.085,sp>.06?.02+sp*.09:0)-s.am)*Math.min(1,dt*4);
if(sp>.01){const nx=s.bx+Math.sin(s.th)*sp*dt,nz=s.bz+Math.cos(s.th)*sp*dt;
if(Math.abs(nx)>MH-12||Math.abs(nz)>MH-12||!free_(nx,nz)||Math.hypot((nx-POND.x)/(POND.rx+3),(nz-POND.z)/(POND.rz+3))<1){s.th+=(s.id%2?1:-1)*(1.4+Math.random());s.t=Math.min(s.t,.5);s.v=0}
else{s.bx=nx;s.bz=nz}}
const o=s.am*Math.sin(s.ph);s.nx=s.x;s.nz=s.z;const hx=s.bx+Math.cos(s.th)*o,hz=s.bz-Math.sin(s.th)*o;
s.x=hx;s.z=hz;s.y=GH(hx,hz);
const t=s.tr;let n=0;while(Math.hypot(s.x-t[0][0],s.z-t[0][1])>=SNK.SP&&n++<12){const dx=s.x-t[0][0],dz=s.z-t[0][1],l=Math.hypot(dx,dz);t.unshift([t[0][0]+dx/l*SNK.SP,t[0][1]+dz/l*SNK.SP])}if(t.length>140)t.length=140}
function snkTurn(s,want,rate,dt){let a=want-s.th;a=Math.atan2(Math.sin(a),Math.cos(a));s.th+=Math.max(-rate*dt,Math.min(rate*dt,a))}
function snkUpd(s,dt){
if(s.dead){s.dt-=dt;if(s.roll<3.1){s.roll=Math.min(3.1416,s.roll+dt*5);snkPose(s)}if(s.dt<=0)snkPlace(s);return}
const pd=Math.hypot(P.x-s.x,P.z-s.z);if(pd>170){s.g.visible=false;return}s.g.visible=true;
s.t-=dt;s.cd-=dt;s.sc-=dt;
const tw=s.tgt,tx=tw?(tw.b?tw.b.g.position.x:tw.p?P.x:tw.x):0,tz=tw?(tw.b?tw.b.g.position.z:tw.p?P.z:tw.z):0,td=tw?Math.hypot(tx-s.x,tz-s.z):99;
let v=0;const rs=s.st==='alert'||s.st==='strike'?1:0;s.raise+=((s.st==='alert'?1:s.st==='strike'?.55:0)-s.raise)*Math.min(1,dt*5);
if(s.st==='wander'){if(s.t<=0){s.mv=Math.random()<.65?1:0;s.t=s.mv?rnd(3,7):rnd(2,6);if(s.mv)s.th+=rnd(-1.1,1.1)}v=s.mv?.38:0;
if(s.sc<=0){s.sc=.2;const c=snkNear(snkTargets(s));if(c){s.tgt=c;s.st='alert';s.t=3.5;s.cd=Math.max(s.cd,.5);snkHiss(s)}}}
else if(s.st==='alert'){const c=tw&&tw.b&&tw.b.dead?null:tw;if(!c){s.st='wander';s.t=2}else{snkTurn(s,Math.atan2(tx-s.x,tz-s.z),4.5,dt);v=0;
if(s.sc<=0){s.sc=.2;const cs=snkTargets(s),m=snkNear(cs);if(m&&(!tw||m.d<td||!(tw.b||tw.p))){s.tgt=m}if(cs.length)s.t=Math.max(s.t,1.2)}
if(td<1.35&&s.cd<=0&&s.t>0){s.st='strike';s.t=.5;s.bit=0;snd(300,.08,.15,'square')}
else if(s.t<=0||td>7){s.st='wander';s.t=rnd(1,3);s.tgt=null}}}
else if(s.st==='strike'){snkTurn(s,Math.atan2(tx-s.x,tz-s.z),9,dt);v=3.4;if(!s.bit&&td<.5&&tw){s.bit=1;snkBite(s,tw)}
if(s.t<=0||s.bit&&td<.2){s.st='flee';s.t=rnd(.9,1.4);s.cd=rnd(1.6,2.4);s.by=null}}
else if(s.st==='flee'){const a=tw?Math.atan2(s.x-tx,s.z-tz):s.th;snkTurn(s,a,3.2,dt);v=1.5;
if(s.t<=0){if(tw&&td<2.8&&!s.by&&!(tw.b&&tw.b.dead)){s.st='alert';s.t=3}else{s.st='wander';s.t=rnd(1,3);s.tgt=null}s.by=null}}
snkMove(s,dt,v);if(pd<140||s.v>.05||s.raise>.02)snkPose(s);
// bots qui tirent sur le serpent
if(s.st!=='wander'||s.hp<s.hm){s.bsc-=dt;if(s.bsc<=0){s.bsc=.3;snkBotsFire(s)}}}
function snkBotsFire(s){for(const b of bots){if(b.dead||b.see||(b.snkCd||0)>SNK.t)continue;const g=b.g.position,d=Math.hypot(g.x-s.x,g.z-s.z);if(d>11||Math.abs(g.y-s.y)>3)continue;
_sv.set(g.x,g.y+1.45,g.z);_sw.copy(s.hpos).sub(_sv);const L=_sw.length();_sw.normalize();RC.set(_sv,_sw);RC.far=L;if(RC.intersectObjects(solids).length)continue;
b.snkCd=SNK.t+rnd(.45,.85);const o=g;b.g.rotation.y=Math.atan2(s.x-g.x,s.z-g.z);
sfxShot(g.x,1.4,g.z,1,.6);noise(g.x,g.z,45);tracer(_sv.clone(),s.hpos.clone());
if(Math.random()<.62){snkHit(s,Math.random()<.2?s.hpos:null,rnd(9,16),b);if(s.dead)return}}}
function snkTick(dt){if(!SNK.ok)snkInit();if(!SNK.list.length){for(let i=0;i<SNK.N;i++)SNK.list.push(snkMake(i))}SNK.t+=dt;for(const s of SNK.list)snkUpd(s,dt)}
