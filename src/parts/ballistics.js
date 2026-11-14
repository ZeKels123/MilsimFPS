// ================= BALISTIQUE (v29) =================
// Projectiles à vitesse finie : gravité, traînée aérodynamique (Cd selon le Mach), vent de la météo,
// mise à zéro de l'arme, énergie restante -> dégâts, pénétration des portes/vitres, balles traversantes (7.62, .50).
// m kg, d m, ff coefficient de forme, v m/s à la bouche, z distance de réglage (m), pen pouvoir de pénétration, thru traverse un corps
const BAM={
 r556:{m:.004,d:.0057,ff:1,v:900,z:100,pen:1,thru:0,tr:1,fe:.75},
 r762:{m:.0095,d:.0078,ff:.95,v:840,z:200,pen:1.5,thru:1,tr:1,fe:.7},
 b50:{m:.042,d:.0129,ff:.85,v:890,z:200,pen:3,thru:1,tr:1,fe:.65},
 p9:{m:.008,d:.009,ff:1.2,v:400,z:50,pen:.5,thru:0,tr:0,fe:.9},
 pis:{m:.008,d:.009,ff:1.2,v:350,z:25,pen:.45,thru:0,tr:0,fe:.9},
 bk:{m:.0035,d:.0084,ff:1,v:400,z:35,pen:.3,thru:0,tr:0,fe:1,sph:1}};
for(const k in BAM){const a=BAM[k];a.A=Math.PI*a.d*a.d/4}
const BCD=[[0,.26],[.7,.27],[.9,.33],[1,.46],[1.1,.56],[1.3,.6],[1.6,.54],[2,.47],[2.6,.41],[3.5,.37],[9,.33]];
function balCd(M){for(let i=1;i<BCD.length;i++)if(M<=BCD[i][0]){const a=BCD[i-1],b=BCD[i];return a[1]+(b[1]-a[1])*(M-a[0])/(b[0]-a[0])}return .33}
const BAL={rho:1.225,max:64,bl:[],pv:new THREE.Vector3(),pp:new THREE.Vector3(),pOk:0,tab:{},zr:{},tn:0,tg:null,t:0,tm:[],ti:0,wx:0,wz:0,hits:0};
function balAm(c){const n=c.n;return n==='Mitrailleuse HMG'?'b50':n==='Fusil'?'r556':n==='MP9'?'p9':n==='Pistolet'?'pis':n==='Fusil à pompe'?'bk':'r762'}
// intégrateur : q={px,py,pz,vx,vy,vz,a}
function balStep(q,h,wx,wz){const rx=q.vx-wx,ry=q.vy,rz=q.vz-wz,sp=Math.sqrt(rx*rx+ry*ry+rz*rz)||1e-6,M=sp/343,cd=q.a.sph?(M<.8?.45:.55):balCd(M)*q.a.ff,k=.5*BAL.rho*cd*q.a.A/q.a.m*sp;
q.vx-=k*rx*h;q.vy-=(9.81+k*ry)*h;q.vz-=k*rz*h;q.px+=q.vx*h;q.py+=q.vy*h;q.pz+=q.vz*h}
// trajectoire à vide : renvoie la hauteur, le temps et la vitesse à la distance horizontale R
function balSim(am,th,R,wz){const a=BAM[am],q={px:0,py:0,pz:0,vx:a.v*Math.cos(th),vy:a.v*Math.sin(th),vz:0,a},h=1/480;let t=0;
while(q.px<R&&t<6&&Math.hypot(q.vx,q.vy)>40){balStep(q,h,0,wz||0);t+=h}return{y:q.py,t,v:Math.hypot(q.vx,q.vy),z:q.pz}}
function balAngle(am,R){let lo=0,hi=.2;for(let i=0;i<22;i++){const m=(lo+hi)/2;if(balSim(am,m,R).y<0)lo=m;else hi=m}return(lo+hi)/2}
function balZero(am){return BAL.zr[am]!==undefined?BAL.zr[am]:(BAL.zr[am]=balAngle(am,BAM[am].z))}
// table pour les bots : angle de tir et durée de vol par tranche de 25 m jusqu'à 600 m
function balComp(am,D){let t=BAL.tab[am];if(!t){t=BAL.tab[am]={ang:[],tof:[]};for(let r=0;r<=24;r++){const R=Math.max(5,r*25),an=balAngle(am,R);t.ang.push(an);t.tof.push(balSim(am,an,R).t)}}
const f=Math.max(0,Math.min(24,D/25)),i=Math.min(23,f|0),k=f-i;return{ang:t.ang[i]+(t.ang[i+1]-t.ang[i])*k,tof:t.tof[i]+(t.tof[i+1]-t.tof[i])*k}}
// vent (m/s) : force de la météo + rafales, direction WND.d
function balWind(){const k=(1+wcur[6]*6)*(1+.3*Math.sin(BAL.t*.7)+.15*Math.sin(BAL.t*1.9)),d=WND.d.value,l=Math.hypot(d.x,d.y)||1;BAL.wx=d.x/l*k;BAL.wz=d.y/l*k}
// chevrotine : en plus de l'énergie perdue, les plombs s'éparpillent et s'écrasent -> dégâts nuls au-delà de ~50 m
function balFac(q){const a=q.a,v2=q.vx*q.vx+q.vy*q.vy+q.vz*q.vz;let f=Math.max(.08,Math.pow(v2/(a.v*a.v),a.fe));if(a.sph){const d=q.dist||0;f*=d<8?1:Math.max(.1,1-(d-8)/42*.9)}return f}
function balMesh(){if(!BAL.tm.length)for(let i=0;i<40;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color:0xffd890,transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false,fog:false}));m.visible=false;m.frustumCulled=false;S.add(m);BAL.tm.push(m)}return BAL.tm[BAL.ti=(BAL.ti+1)%BAL.tm.length]}
// création d'un projectile
function balSpawn(o,d,am,x){const a=BAM[am];if(BAL.bl.length>=BAL.max){const q0=BAL.bl.shift();if(q0.m)q0.m.visible=false}
const v=a.v*(x.vk||1),q={px:o.x,py:o.y,pz:o.z,vx:d.x*v,vy:d.y*v,vz:d.z*v,a,am,src:x.src,c:x.c,n:x.n||0,dmg:x.dmg||0,bot:x.bot||null,cb:x.cb||null,t:0,dist:0,sk:new Set(),wz:0,m:null,off:x.off||null,ox:o.x,oy:o.y,oz:o.z};
if(x.tr){q.m=balMesh();q.m.visible=false;q.tr=1}BAL.bl.push(q);return q}
// tir du joueur : réglage à zéro de l'arme (visée = point d'impact à la distance de réglage)
const _bu=new THREE.Vector3(),_bo=new THREE.Vector3(),_bd=new THREE.Vector3(),_bp=new THREE.Vector3(),_bq=new THREE.Vector3();
function balPlayer(o,d,c,n){const am=balAm(c);d.addScaledVector(_bu.set(0,1,0).applyQuaternion(C.quaternion),Math.tan(balZero(am))).normalize();
balSpawn(o,d,am,{src:'p',c,n,tr:am!=='bk'&&(BAL.tn++%3===0),off:MZ.clone().sub(o)})}
// tir d'un bot : erreur de visée (loi normale), compensation de chute et anticipation du déplacement du joueur
function balBotAm(b){return b.ty===0?'p9':b.ty===1?'r556':b.ty===2?'r762':'r762'}
function balBot(V,A,p,dmg,b,sup){p=Math.max(.03,Math.min(.97,p));const am=balBotAm(b),sg=.3/Math.sqrt(-2*Math.log(1-p)),dx=A.x-V.x,dz=A.z-V.z,Dh=Math.hypot(dx,dz)||1,cp=balComp(am,Math.min(600,Dh));
const L=sup?0:(b.ty===2?1:.6);_bq.set(A.x+BAL.pv.x*cp.tof*L,A.y+Dh*Math.tan(cp.ang),A.z+BAL.pv.z*cp.tof*L);
const ex=-dz/Dh,ez=dx/Dh,g1=gauss()*sg,g2=gauss()*sg;_bq.x+=ex*g1;_bq.z+=ez*g1;_bq.y+=g2;
_bd.set(_bq.x-V.x,_bq.y-V.y,_bq.z-V.z).normalize();balSpawn(V,_bd,am,{src:'b',bot:b,dmg,vk:.98+Math.random()*.04,tr:BAL.tn++%4===0,off:_bp.set(0,0,0)})}
// impact d'une balle du joueur (reprend les règles de fire() avec les dégâts réduits par l'énergie restante)
function balPHit(h,q,fac){const c=q.c,u=h.object.userData,dm0=c.dmg*fac;let hit=0,hitA=0,brk=0;
if(u.an){if(faHit(u.an,h.point,dm0)){hit=1;hitT=.2;$('hit').style.opacity=1;$('hit').style.color='#fc0'}}
if(u.bot&&!u.bot.dead){const b=u.bot,dm=dm0*SKM.dmg*(A.supp?.9:1);{b.pk=1;const hr=bhHit(b,u.head?'h':(u.zone||'t'),dm,'b');hitA=hr.a;brk=hr.brk}hit=1;hitT=.2;hitFx.call(null,h,hitA,brk,u.head,b);aiHit(b);$('hit').style.opacity=1;$('hit').style.color=u.head?'#f55':(brk?'#fc0':(hitA?'#6cf':'#fff'));if(b.hp<=0)onKill(b,u.head)}
else if(u.mq){mqHit(u.mq,u,dm0*SKM.dmg*(A.supp?.9:1),h.point);hit=1;hitT=.2;$('hit').style.opacity=1;$('hit').style.color=u.head?'#f55':'#fff'}
else{if(u.barrel)barrelHit(u.barrel,h,dm0);if(u.door)hurtDoor(u.door,dm0*SKM.dmg*(A.supp?.9:1));if(q.n<4)impact(h,!!u.door)}
if(brk)crack();else if(hitA)snd(1800,.08,.2,'triangle');else if(hit)snd(900,.06,.15,'square');BAL.hits++;return hit}

// ---- matériaux des murs : pénétration (profondeur max en m pour pen=1 à pleine vitesse), ricochet (sinus de l'angle d'incidence rasant limite), vitesse conservée au ricochet
const BMT={wood:{t:'wood',k:.22,r:.1,v:.35},brick:{t:'brick',k:.08,r:.18,v:.5},conc:{t:'conc',k:.035,r:.24,v:.5},steel:{t:'steel',k:.003,r:.26,v:.6},plas:{t:'plas',k:.35,r:.05,v:.3}};
const BMC=new WeakMap(),_br=new THREE.Raycaster(),_bn=new THREE.Vector3(),_bx=new THREE.Vector3();
function balMatOf(o){let c=BMC.get(o);if(c)return c;const m=Array.isArray(o.material)?o.material[0]:o.material;let t='brick';
if(m){const n=(m.name||'').toLowerCase(),col=m.color,r=col?col.r:1,g=col?col.g:1,b=col?col.b:1;
if(m.metalness>.55||/steel|metal|iron|acier|tole/.test(n))t='steel';else if(/wood|bois|plank|timber/.test(n))t='wood';else if(/conc|beton/.test(n))t='conc';
else if(!m.map){if(r>b*1.3&&r>g*1.05&&r+g+b<2)t='wood';else if(r+g+b>2.4)t='plas';else t='conc'}}
c=BMT[t];BMC.set(o,c);return c}
// renvoie 1 si la balle est arrêtée, 0 si elle ricoche ou traverse (position et vitesse du projectile mises à jour)
function balWall(h,q,org,dir){if(!h.face)return 1;const mt=balMatOf(h.object),sp=balSpd(q);if(sp<120)return 1;
_bn.copy(h.face.normal).transformDirection(h.object.matrixWorld);const cs=Math.abs(dir.dot(_bn)),rr=BAL.fixed!==undefined?BAL.fixed:Math.random();
if((q.rc|0)<2&&cs<mt.r&&rr<(1-cs/mt.r)*.9+.1){const dn=dir.dot(_bn);_bx.copy(dir).addScaledVector(_bn,-2*dn);_bx.x+=(rr-.5)*.05;_bx.y+=Math.abs(rr-.5)*.03;_bx.z+=(.5-rr)*.05;_bx.normalize();const v=sp*mt.v;
q.vx=_bx.x*v;q.vy=_bx.y*v;q.vz=_bx.z*v;q.px=h.point.x+_bn.x*(dn<0?.04:-.04);q.py=h.point.y+_bn.y*(dn<0?.04:-.04);q.pz=h.point.z+_bn.z*(dn<0?.04:-.04);q.rc=(q.rc|0)+1;BAL.ric=(BAL.ric|0)+1;
if(Math.hypot(h.point.x-P.x,h.point.z-P.z)<90){for(let i=0;i<4;i++){_bp.copy(h.point);emit(_bp,_e.set(_bx.x*3+rnd(-1,1),_bx.y*3+rnd(0,1.5),_bx.z*3+rnd(-1,1)),{color:0xffe0a0,size:.07,grow:0,life:.22,a:.9,drag:1})}snd(rnd(2400,3400),.14,.06,'sawtooth');setTimeout(()=>snd(rnd(1500,2100),.1,.04,'triangle'),60)}
return 0}
const D=q.a.pen*mt.k*Math.pow(sp/q.a.v,2);_bx.copy(h.point).addScaledVector(dir,1.5);_br.set(_bx,_bn.copy(dir).negate());_br.far=1.5;
const x=_br.intersectObject(h.object,false)[0];if(!x)return 1;const th=Math.max(.005,1.5-x.distance);if(th>=D)return 1;
const kv=Math.max(.3,1-.75*th/D),j=.012*th/D;q.vx=(q.vx+(Math.random()-.5)*sp*j)*kv;q.vy=(q.vy+(Math.random()-.5)*sp*j)*kv;q.vz=(q.vz+(Math.random()-.5)*sp*j)*kv;
q.px=x.point.x+dir.x*.03;q.py=x.point.y+dir.y*.03;q.pz=x.point.z+dir.z*.03;BAL.pen=(BAL.pen|0)+1;
if(Math.hypot(x.point.x-P.x,x.point.z-P.z)<60){_bp.copy(x.point);emit(_bp,_e.set(dir.x,dir.y+.3,dir.z),{color:0xb8a890,size:.1,grow:.6,life:.4,a:.4,drag:2})}return 0}
function balTarget(){if(!BAL.tg)BAL.tg=[...ray,...botParts.filter(q=>!q.userData.bot.dead),...FA.hit.filter(q=>!q.userData.an.dead),...MQP];return BAL.tg}
function balSpd(q){return Math.sqrt(q.vx*q.vx+q.vy*q.vy+q.vz*q.vz)}
// segment d'un projectile : renvoie 1 si le projectile est arrêté
function balSeg(q,org,dir,far){
for(let k=0;k<6&&far>.001;k++){
if(q.src==='p'){RC.set(org,dir);RC.far=far;let h=null;for(const x of RC.intersectObjects(balTarget())){const u=x.object.userData;if(u.bot&&q.sk.has(u.bot))continue;h=x;break}
if(faShotBirds(org,dir,h?h.distance:far,q.c.dmg*balFac(q))){hitT=.2;$('hit').style.opacity=1;$('hit').style.color='#fc0';return 1}
if(!h)return 0;const u=h.object.userData,fac=balFac(q),sp=balSpd(q);
if(u.glass){glassHit(h.object,h.point,dir);q.vx*=.9;q.vy*=.9;q.vz*=.9;org.copy(h.point).addScaledVector(dir,.03);far-=h.distance+.03;continue}
if(q.cb){q.cb(h,q);return 1}
balPHit(h,q,fac);
if(u.bot&&q.a.thru&&sp>350){q.sk.add(u.bot);q.vx*=.55;q.vy*=.55;q.vz*=.55;org.copy(h.point).addScaledVector(dir,.05);far-=h.distance+.05;continue}
if(!u.bot&&!u.mq&&!u.an&&!u.barrel&&!u.door&&!u.glass&&!u.cb){if(balWall(h,q,org,dir)===0)return 0}
if(u.door&&q.a.pen*sp/900>.15){q.vx*=.6;q.vy*=.6;q.vz*=.6;q.px=h.point.x+dir.x*.08;q.py=h.point.y+dir.y*.08;q.pz=h.point.z+dir.z*.08;return 0}
return 1}
// balle d'un bot : murs, puis le joueur
RC.set(org,dir);RC.far=far;let wt=1e9,wh=null;for(const x of RC.intersectObjects(ray)){if(x.object.userData.glass){if(x.distance<wt)glassHit(x.object,x.point,dir);continue}wt=x.distance;wh=x;break}
const hr=hlRay(org,dir,Math.min(far,wt));
if(hr&&hr.t<wt){_bp.copy(org).addScaledVector(dir,hr.t);hlApply(hr.z,q.dmg*balFac(q),'b',q.bot?q.bot.g.position:null);BAL.hits++;return 1}
// claquement d'une balle qui passe près du joueur
if(!q.wz&&P.gy!==undefined){_bq.set(P.x-org.x,P.gy+P.eh*.6-org.y,P.z-org.z);const t=Math.max(0,Math.min(far,_bq.dot(dir))),dd=_bq.sub(_bu.copy(dir).multiplyScalar(t)).length();if(dd<1.8&&t>1){q.wz=1;FXP.shake=Math.max(FXP.shake,.22);snd(rnd(1700,2500),.04,.07,'square');HM.pain=Math.min(1,HM.pain+.01)}}
if(wh){if(Math.hypot(wh.point.x-P.x,wh.point.z-P.z)<70)impact(wh,!!wh.object.userData.door);if(!wh.object.userData.door&&balWall(wh,q,org,dir)===0)return 0;return 1}
return 0}
return 0}
function balTick(dt){BAL.t+=dt;if(P.gy!==undefined){if(BAL.pOk){BAL.pv.set((P.x-BAL.pp.x)/Math.max(dt,.001),0,(P.z-BAL.pp.z)/Math.max(dt,.001)).clampLength(0,7)}BAL.pp.set(P.x,0,P.z);BAL.pOk=1}
if(!BAL.bl.length)return;dt=Math.min(dt,.05);BAL.tg=null;balWind();const n=Math.max(1,Math.ceil(dt/(1/240))),h=dt/n,lim=MH+60;
for(let i=BAL.bl.length-1;i>=0;i--){const q=BAL.bl[i];_bo.set(q.px,q.py,q.pz);for(let s=0;s<n;s++)balStep(q,h,BAL.wx,BAL.wz);q.t+=dt;
_bd.set(q.px-_bo.x,q.py-_bo.y,q.pz-_bo.z);const L=_bd.length();if(L<1e-6){continue}_bd.multiplyScalar(1/L);q.dist+=L;
let end=balSeg(q,_bo,_bd,L);
if(!end){const gy=GH(q.px,q.pz);if(q.py<gy-.2&&q.t>.02){end=1;if(q.src==='p'&&Math.hypot(q.px-P.x,q.pz-P.z)<150){_bp.set(q.px,gy+.05,q.pz);emit(_bp,_e.set(rnd(-.3,.3),rnd(.3,1),rnd(-.3,.3)),{color:0xa89a80,size:.14,grow:.5,life:.55,a:.45,drag:2})}}}
if(!end&&(balSpd(q)<70||q.t>8||q.dist>1400||Math.abs(q.px)>lim||Math.abs(q.pz)>lim||q.py<-20))end=1;
if(q.m){if(end)q.m.visible=false;else{const sp=balSpd(q),Ls=Math.min(14,Math.max(2.5,sp*.018)),w=.04+Math.hypot(q.px-C.position.x,q.pz-C.position.z)*.006;_bp.set(q.px,q.py,q.pz);if(q.off){const f=Math.max(0,1-q.dist/25);_bp.addScaledVector(q.off,f)}
q.m.position.copy(_bp).addScaledVector(_bd,-Ls/2);q.m.scale.set(w,w,Ls);q.m.lookAt(_bq.copy(_bp));q.m.visible=q.dist>2}}
if(end)BAL.bl.splice(i,1)}}
function balClear(){for(const q of BAL.bl)if(q.m)q.m.visible=false;BAL.bl.length=0}

// ---- réticule de lunette : points mil (1 mil = 1 mrad), repères de chute (distance où la balle tombe de n mil sous la visée de réglage), vent
const BRT={c:null,x:null,k:'',t:0,dr:{}};
function balDrift1(am,R){const k=am+R;return BRT.dr[k]!==undefined?BRT.dr[k]:(BRT.dr[k]=balSim(am,balAngle(am,R),R,1).z)}
function balRet(on,dt){if(!on){if(BRT.c&&BRT.c.style.display!=='none')BRT.c.style.display='none';return}
if(!BRT.c){const c=document.createElement('canvas');c.style.cssText='position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none';$('scope').appendChild(c);BRT.c=c;BRT.x=c.getContext('2d')}
const c=BRT.c;c.style.display='block';BRT.t-=dt;balWind();const W=innerWidth,H=innerHeight,am=balAm(WC[WSEL]),fv=C.fov,fw=C.getWorldDirection(_bu),fx=fw.x,fz=fw.z,hl=Math.hypot(fx,fz)||1,wx=BAL.wx,wz=BAL.wz,cross=(wx*(-fz)+wz*fx)/hl,head=(wx*fx+wz*fz)/hl,key=[W,H,fv.toFixed(2),am,cross.toFixed(1),head.toFixed(1)].join();
if(key===BRT.k&&BRT.t>0)return;BRT.k=key;BRT.t=.12;if(c.width!==W||c.height!==H){c.width=W;c.height=H}
const g=BRT.x,cx=W/2,cy=H/2,ppm=(H/2)/Math.tan(fv*Math.PI/360)*.001,rad=Math.min(W,H)*.33;g.clearRect(0,0,W,H);g.strokeStyle='rgba(0,0,0,.92)';g.fillStyle='rgba(0,0,0,.92)';g.lineWidth=Math.max(1,ppm*.12);g.font=Math.max(10,rad*.035)+'px sans-serif';g.textBaseline='middle';
// épaisseur du réticule : filets fins dans le tiers central
const lim=rad*.92;g.lineWidth=Math.max(1,rad*.0025);g.beginPath();g.moveTo(cx-lim,cy);g.lineTo(cx-ppm*.6,cy);g.moveTo(cx+ppm*.6,cy);g.lineTo(cx+lim,cy);g.moveTo(cx,cy-lim);g.lineTo(cx,cy-ppm*.6);g.moveTo(cx,cy+ppm*.6);g.lineTo(cx,cy+lim);g.stroke();
const dr=Math.max(1.2,ppm*.16);for(let m=-10;m<=10;m++){if(!m)continue;const px=cx+m*ppm,py=cy+m*ppm;if(Math.abs(m*ppm)<lim){g.beginPath();g.arc(px,cy,dr,0,7);g.fill();g.beginPath();g.arc(cx,py,dr,0,7);g.fill()}}
// repères de chute : distances (m) pour lesquelles la balle passe n mil sous le point de réglage
const z0=balZero(am);g.textAlign='left';g.lineWidth=Math.max(1,rad*.003);for(let R=Math.ceil(BAM[am].z/50)*50+50;R<=900;R+=50){const mil=(balAngle(am,R)-z0)*1000,py=cy+mil*ppm;if(py>cy+lim)break;
g.beginPath();g.moveTo(cx+dr*2.5,py);g.lineTo(cx+dr*2.5+rad*.05,py);g.stroke();g.fillText(R,cx+dr*2.5+rad*.06,py)}
// vent : flèche (direction du vent par rapport au regard), force, dérive à 300 m en mil
const sp=Math.hypot(wx,wz),ang=Math.atan2(cross,head),ax=cx-rad*.62,ay=cy+rad*.72;g.save();g.translate(ax,ay);g.rotate(Math.atan2(cross,-head)+Math.PI);
g.lineWidth=Math.max(1.5,rad*.006);g.beginPath();const L=Math.min(rad*.14,6+sp*rad*.012);g.moveTo(-L,0);g.lineTo(L,0);g.moveTo(L,0);g.lineTo(L-rad*.03,-rad*.02);g.moveTo(L,0);g.lineTo(L-rad*.03,rad*.02);g.stroke();g.restore();
const mil300=cross*balDrift1(am,300)/300*1000;g.textAlign='left';g.fillText('VENT '+sp.toFixed(1)+' m/s',ax+rad*.17,ay-rad*.025);g.fillText('travers '+(cross>=0?'→ ':'← ')+Math.abs(cross).toFixed(1)+' · dérive 300 m '+Math.abs(mil300).toFixed(1)+' mil',ax+rad*.17,ay+rad*.025);
// point de visée corrigé du vent à 300 m
if(Math.abs(mil300)>.05){const px=cx-mil300*ppm;g.beginPath();g.moveTo(px,cy-dr*3);g.lineTo(px,cy+dr*3);g.stroke()}}
// le son d'un tir lointain arrive avec le retard dû à la vitesse du son
function sfxShot(x,y,z,ty,vol) {const d=Math.hypot(x-P.x,z-P.z);if(d>60)setTimeout(()=>sfxShot0(x,y,z,ty,vol),Math.min(d,900)/343*1000);else sfxShot0(x,y,z,ty,vol)}
