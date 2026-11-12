const T_camo=ctex(256,d=>{const a=fbm(256,4,4,4,41),b=fbm(256,9,9,3,77);for(let i=0;i<65536;i++){const v=a[i]<.4?.6:a[i]<.58?.78:1,w=b[i]>.62?.82:1,c=Math.min(1,v*w)*255;d[i*4]=c;d[i*4+1]=c;d[i*4+2]=c;d[i*4+3]=255}});
// ================= BOTS (v5.1) : corps détaillé, arme par type, bras en cinématique inverse posés sur l'arme =================
const BWG=[ // armes : origine = poignée pistolet, +z vers l'avant ; [géométrie, z garde-main, z bouche, crosse]
[bgeo([[.05,.07,.3,0,.02,.06,0x1b1c1e],[.04,.1,.05,0,-.07,-.02,0x151515,-.25],[.035,.17,.05,0,-.1,.09,0x101010,.08],[.03,.03,.16,0,.025,.28,0x0c0c0c],[.045,.05,.1,0,.02,.2,0x242628],[.03,.035,.2,0,.02,-.17,0x1b1c1e],[.05,.1,.03,0,0,-.27,0x151515],[.02,.035,.03,0,.075,.15,0x0c0c0c],[.02,.03,.03,0,.07,-.04,0x0c0c0c]]),.2,.37],
[bgeo([[.055,.08,.34,0,.02,.07,0x1d1f1c],[.04,.1,.05,0,-.07,-.02,0x121212,-.3],[.04,.2,.065,0,-.12,.12,0x151515,.28],[.05,.055,.24,0,.02,.36,0x2a2d25],[.022,.022,.22,0,.025,.58,0x0b0b0b],[.03,.03,.05,0,.025,.71,0x0b0b0b],[.045,.06,.24,0,.01,-.21,0x1d1f1c],[.05,.13,.035,0,-.01,-.34,0x141414],[.035,.045,.11,0,.095,.06,0x0d0d0d],[.02,.045,.02,0,.075,.44,0x0d0d0d]]),.36,.74],
[bgeo([[.05,.07,.36,0,.02,.06,0x3a3324],[.04,.1,.05,0,-.07,-.03,0x2a2418,-.3],[.035,.1,.06,0,-.08,.1,0x141414],[.045,.05,.3,0,.01,.38,0x3a3324],[.02,.02,.5,0,.025,.76,0x0b0b0b],[.032,.032,.1,0,.025,1.03,0x0b0b0b],[.045,.075,.3,0,0,-.25,0x3a3324],[.05,.13,.035,0,-.02,-.41,0x1a1612],[.045,.045,.28,0,.105,.1,0x0c0c0c],[.06,.06,.05,0,.105,.25,0x0c0c0c],[.055,.055,.04,0,.105,-.05,0x0c0c0c],[.02,.04,.03,0,.065,.02,0x0c0c0c],[.02,.04,.03,0,.065,.18,0x0c0c0c],[.02,.14,.02,-.03,-.06,.5,0x111111,.5],[.02,.14,.02,.03,-.06,.5,0x111111,.5]]),.36,1.08],
[bgeo([[.075,.11,.42,0,.01,.1,0x1a1b1d],[.045,.1,.05,0,-.09,-.02,0x121212,-.3],[.15,.13,.16,-.03,-.11,.16,0x2c3326],[.06,.06,.26,0,.02,.42,0x202224],[.032,.032,.34,0,.025,.7,0x0a0a0a],[.045,.045,.06,0,.025,.88,0x0a0a0a],[.05,.075,.22,0,.01,-.22,0x1a1b1d],[.06,.13,.035,0,-.01,-.34,0x121212],[.02,.05,.14,0,.1,.12,0x0d0d0d],[.02,.16,.02,-.04,-.08,.5,0x111111,.4],[.02,.16,.02,.04,-.08,.5,0x111111,.4]]),.38,.92]];
const BWM=std(0xffffff,{vertexColors:true,roughness:.5,metalness:.45,envMapIntensity:.8});
const _ik={d:new THREE.Vector3(),p:new THREE.Vector3(),e:new THREE.Vector3(),f:new THREE.Vector3(),t:new THREE.Vector3(),dn:new THREE.Vector3(0,-1,0),q:new THREE.Quaternion(),q2:new THREE.Quaternion(),eu:new THREE.Euler(0,0,0,'YXZ'),R:new THREE.Vector3(),L:new THREE.Vector3(),wp:new THREE.Vector3()};
function armIK(arm,T,side){const I=_ik,a=arm.a,c=arm.b;I.d.subVectors(T,arm.p.position);const d=Math.min(a+c-.004,Math.max(.1,I.d.length()));I.d.normalize();const ca=(a*a+d*d-c*c)/(2*a*d),sa=Math.sqrt(Math.max(0,1-ca*ca));
I.p.set(side*.75,-1,-.4);I.p.addScaledVector(I.d,-I.p.dot(I.d)).normalize();I.e.copy(I.d).multiplyScalar(a*ca).addScaledVector(I.p,a*sa);arm.p.quaternion.setFromUnitVectors(I.dn,I.t.copy(I.e).normalize());
I.f.copy(I.d).multiplyScalar(d).sub(I.e).normalize().applyQuaternion(I.q.copy(arm.p.quaternion).invert());arm.el.quaternion.setFromUnitVectors(I.dn,I.f)}
function mkBot(){
const g=new THREE.Group(),m=L(0x7a3b2e,{roughness:.85,map:T_camo,envMapIntensity:.5}),b={g,hp:100,dead:0,tx:0,tz:0,t:0,cd:rnd(1,2),ph:rnd(0,6.28),fl:0,fall:0,mvA:0,rec:0,flinch:0,tm:rnd(0,50),parts:[],aimA:0,aimT:0,pit:0,relA:0,wi:0};
g.rotation.order='YXZ';
const skin=L([0xb98660,0xc99a74,0x8a5a3c,0xd8a986][Math.random()*4|0],{roughness:.7}),blk=L(0x15171a,{roughness:.5,metalness:.4,envMapIntensity:1}),bootM=L(0x17140f,{roughness:.8}),glv=L(0x1c1d1a,{roughness:.9}),BG=(w,h,d)=>new THREE.BoxGeometry(w,h,d);
const add=(par,geo,mat,x,y,z,hit)=>{const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);o.castShadow=true;par.add(o);if(hit){o.userData.bot=b;botParts.push(o);b.parts.push(o)}return o};
// bassin, ceinture, jambes
add(g,BG(.4,.2,.25),m,0,.86,0,1);add(g,BG(.42,.05,.27),blk,0,.95,0);add(g,BG(.1,.14,.08),blk,.2,.84,.06);
const leg=x=>{const hip=new THREE.Group();hip.position.set(x,.82,0);g.add(hip);add(hip,BG(.18,.4,.21),m,0,-.2,0,1);const kn=new THREE.Group();kn.position.y=-.4;hip.add(kn);add(kn,BG(.15,.36,.17),m,0,-.18,0,1);const kp=add(kn,BG(.13,.11,.05),blk,0,-.03,.1);add(kn,BG(.16,.13,.2),bootM,0,-.33,.0);add(kn,BG(.16,.08,.3),bootM,0,-.38,.05);return{hip,kn,kp}};
b.L=leg(-.11);b.Rg=leg(.11);
// torse (pivot à la taille)
const up=new THREE.Group();up.position.y=.9;up.rotation.order='YXZ';g.add(up);b.up=up;
add(up,BG(.36,.2,.22),m,0,.14,0,1);add(up,BG(.44,.34,.26),m,0,.4,0,1);add(up,BG(.5,.1,.24),m,0,.56,0);
b.vest=add(up,BG(.47,.36,.31),L(0x3b4a5a,{roughness:.9}),0,.38,.005);
b.vestX=new THREE.Mesh(bgeo([[.1,.13,.06,-.13,-.09,.18,0x9a9a9a],[.1,.13,.06,0,-.09,.18,0x9a9a9a],[.1,.13,.06,.13,-.09,.18,0x9a9a9a],[.07,.12,.05,-.17,.1,.17,0x555555],[.03,.16,.03,-.17,.2,.16,0x111111],[.34,.3,.1,0,0,-.19,0xaaaaaa],[.3,.08,.07,0,-.2,-.17,0x777777]]),std(0xffffff,{vertexColors:true,roughness:.9}));b.vestX.castShadow=true;b.vest.add(b.vestX);
b.pack=add(up,BG(.3,.34,.15),L(0x4a4a38,{roughness:1}),0,.36,-.26);
add(up,new THREE.CylinderGeometry(.06,.07,.08,8),skin,0,.63,0);
// tête
const hd=new THREE.Group();hd.position.set(0,.66,0);hd.rotation.order='YXZ';up.add(hd);b.hd=hd;
const head=add(hd,new THREE.SphereGeometry(.132,14,12),skin,0,.12,.005);head.scale.set(.9,1.1,1);head.userData={bot:b,head:true};botParts.push(head);b.parts.push(head);
add(hd,BG(.03,.04,.03),skin,0,.1,.13);[-.05,.05].forEach(x=>add(hd,BG(.04,.02,.02),blk,x,.145,.115));
b.mask=add(hd,BG(.15,.072,.1),blk,0,.036,.052);
b.helm=add(hd,new THREE.SphereGeometry(.158,14,10,0,Math.PI*2,0,Math.PI*.47),L(0x3a4a3a,{roughness:.7,side:THREE.DoubleSide}),0,.15,0);
b.brim=add(hd,new THREE.CylinderGeometry(.25,.25,.014,16),L(0x5a4f2a),0,.185,0);
b.visM=L(0x0a0a0a,{roughness:.2,metalness:.8});b.visor=add(hd,BG(.23,.065,.05),b.visM,0,.15,.115);
// visage : yeux (clignement), sourcils, bouche, oreilles, peinture de camouflage
{const eyeW=L(0xf2efe8,{roughness:.4}),pup=L(0x14100d,{roughness:.3}),brow=L(0x2a2018,{roughness:.9}),lip=L(0x6a3030,{roughness:.6});b.face=new THREE.Group();hd.add(b.face);b.eyes=[];
[-1,1].forEach(sx=>{const eg=new THREE.Group();eg.position.set(sx*.052,.118,.122);b.face.add(eg);add(eg,BG(.043,.024,.014),eyeW,0,0,0);const pp=add(eg,BG(.022,.022,.014),pup,sx*-.004,0,.006);b.eyes.push(eg);
const br=add(b.face,BG(.058,.013,.014),brow,sx*.052,.148,.122);br.rotation.z=sx*.08;b.face.userData['br'+sx]=br;add(hd,BG(.022,.052,.04),skin,sx*.124,.115,0)});
b.mouth=add(b.face,BG(.05,.011,.014),lip,0,.03,.125);
b.paint=new THREE.Group();hd.add(b.paint);const fp=L(0x1a2a14,{roughness:1});[-1,1].forEach(sx=>{const a=add(b.paint,BG(.052,.012,.012),fp,sx*.05,.106,.126);a.rotation.z=sx*.3;const c=add(b.paint,BG(.012,.05,.012),fp,sx*.095,.09,.1);c.rotation.z=sx*.2});add(b.paint,BG(.09,.014,.012),fp,0,.2,.12)}
b.ears=new THREE.Group();[-.135,.135].forEach(x=>add(b.ears,BG(.04,.1,.09),blk,x,.12,0));hd.add(b.ears);
b.pads=new THREE.Group();[-.3,.3].forEach(x=>add(b.pads,BG(.15,.09,.2),blk,x,.6,0));up.add(b.pads);
// bras : épaule → coude → main (longueurs a, b)
const arm=(x,rx,ry)=>{const p=new THREE.Group();p.position.set(x,.54,0);up.add(p);add(p,BG(.12,.12,.14),m,0,-.02,0);add(p,BG(.1,.28,.11),m,0,-.15,0,1);const el=new THREE.Group();el.position.y=-.29;p.add(el);add(el,BG(.085,.24,.095),m,0,-.12,0,1);const hand=new THREE.Group();hand.position.set(0,-.275,0);el.add(hand);add(hand,BG(.082,.074,.04),glv,0,0,0);add(hand,BG(.086,.02,.046),glv,0,.04,0);const fing=[];
for(let k=0;k<4;k++){const f1=new THREE.Group();f1.position.set(-.03+k*.02,-.037,0);hand.add(f1);add(f1,BG(.017,.034,.017),glv,0,-.017,0);const f2=new THREE.Group();f2.position.y=-.034;f1.add(f2);add(f2,BG(.016,.028,.016),glv,0,-.014,0);const f3=new THREE.Group();f3.position.y=-.028;f2.add(f3);add(f3,BG(.014,.02,.014),glv,0,-.01,0);fing.push([f1,f2,f3])}
const t1=new THREE.Group();t1.position.set(x>0?-.043:.043,-.01,.004);t1.rotation.z=x>0?.5:-.5;hand.add(t1);add(t1,BG(.02,.036,.02),glv,0,-.018,0);const t2=new THREE.Group();t2.position.y=-.036;t1.add(t2);add(t2,BG(.017,.028,.017),glv,0,-.014,0);
return{p,el,rx,ry,a:.29,b:.275,fing,th:[t1,t2],sg:x>0?1:-1}};
b.aR=arm(.25,-1.2,-.22);b.aL=arm(-.25,-1.3,.7);
// armes (une visible selon le type)
const wp=new THREE.Group();wp.rotation.order='YXZ';up.add(wp);b.wp=wp;b.wps=BWG.map(w=>{const o=new THREE.Mesh(w[0],BWM);o.castShadow=true;o.visible=false;wp.add(o);return o});
b.gun=new THREE.Object3D();
b.flash=new THREE.Mesh(new THREE.SphereGeometry(.09,8,6),new THREE.MeshBasicMaterial({color:0xffd070,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,toneMapped:false}));b.flash.visible=false;wp.add(b.flash);
b.mat=m;S.add(g);spawn(b);bots.push(b)}
function botLook(b,i){const t=BT[i];b.wi=i;b.wps.forEach((o,k)=>o.visible=k===i);b.flash.position.set(0,.025,BWG[i][2]+.05);b.flash.scale.setScalar(i===3?1.5:i===2?1.3:1);
b.brim.visible=i===2;b.visor.visible=i===1||i===3;b.pads.visible=i===3;b.mask.visible=i===0||i===3;b.ears.visible=i===1;b.pack.visible=i===1||i===2;b.L.kp.visible=b.Rg.kp.visible=i===1||i===3;b.vestX.visible=i!==2;
b.face.visible=i!==3;b.mouth.visible=i!==0;b.paint.visible=i===2;b.visor.position.set(0,i===1?.222:.15,i===1?.1:.115);b.visor.scale.set(1,i===1?.8:1,1);b.helm.scale.set(1,i===0?.62:i===2?.8:1,1);b.helm.material.color.setHex(i===0?0x2b3138:i===3?0x1c1e22:i===2?t.col:new THREE.Color(t.col).multiplyScalar(.75).getHex());b.brim.material.color.setHex(t.col);b.pack.material.color.setHex(new THREE.Color(t.col).multiplyScalar(.8).getHex());
b.visM.emissive.setHex(i===3?0xaa1111:0x000000);b.vestX.material.color.setHex(t.vc).multiplyScalar(1.5)}
function botAnim(b,dt,mv,mx_,mz_){b.tm+=dt;b.mvA+=((mv?1:0)-b.mvA)*Math.min(1,dt*7);b.ph+=dt*b.T.sp*(b.spK||1)*3.4*(mv?1:0);
const A_=b.mvA,s=Math.sin(b.ph),c=Math.cos(b.ph),I=_ik,i=b.wi,W=BWG[i];
b.L.hip.rotation.x=s*.7*A_;b.Rg.hip.rotation.x=-s*.7*A_;b.L.kn.rotation.x=Math.max(0,c)*1.0*A_+.04;b.Rg.kn.rotation.x=Math.max(0,-c)*1.0*A_+.04;
const yw=b.g.rotation.y,lean=Math.max(-1,Math.min(1,(mx_*Math.cos(yw)-mz_*Math.sin(yw))/(dt*b.T.sp+1e-6)));
b.rec=Math.max(0,b.rec-dt*7);b.flinch=Math.max(0,b.flinch-dt*3);b.fl-=dt;b.flash.visible=b.fl>0;
b.aimA+=((b.aimT?1:0)-b.aimA)*Math.min(1,dt*6);b.relA+=((b.relT>0?1:0)-b.relA)*Math.min(1,dt*5);
const am=b.aimA*(1-b.relA*.7),e=am*am*(3-2*am),pit=Math.max(-.6,Math.min(.6,b.pit||0))*e,tw=.28+.3*e,hip_=i===3;
const u=b.up;u.rotation.set(-b.rec*.05-b.flinch*.3+Math.abs(s)*.03*A_-pit*.35+.06*e,tw+s*.06*A_,-lean*.1*A_);u.position.y=.9+Math.abs(s)*.03*A_+Math.sin(b.tm*1.7)*.005;
// arme : épaulée (ou à la hanche pour le Mastodonte) ↔ arme basse
const k=b.rec*.035,rl=b.relA,br=Math.sin(b.tm*1.7)*.004;
if(hip_){b.wp.position.set(.2-.04*(1-e),.2+br+.04*rl,.2-k);I.eu.set(-pit*.65+.3*(1-e)-b.rec*.03+.3*rl,-tw-.12*(1-e),.25*rl)}
else{b.wp.position.set(.13-.05*(1-e),.5-.17*(1-e)+br-.05*rl,.24+.02*(1-e)-k);I.eu.set(-pit*.65+.62*(1-e)-b.rec*.04-.35*rl,-tw-.45*(1-e),.45*rl)}
b.wp.quaternion.setFromEuler(I.eu);
I.R.set(0,-.06,-.01).applyQuaternion(b.wp.quaternion).add(b.wp.position);I.L.set(0,-.035,W[1]).applyQuaternion(b.wp.quaternion).add(b.wp.position);
if(rl>.02){const q=Math.sin(Math.min(1,Math.max(0,(b.relT%2.2)/2.2))*Math.PI*2)*.5+.5;I.t.set(-.02,.12,.2);I.wp.set(0,-.2,.1).applyQuaternion(b.wp.quaternion).add(b.wp.position);I.t.lerp(I.wp,q);I.L.lerp(I.t,rl)}
armIK(b.aR,I.R,1);armIK(b.aL,I.L,-1);
b.hd.rotation.set(b.flinch*.25+.1*e-pit*.3,-tw+Math.sin(b.tm*.8+b.ph)*.25*(1-A_)*(1-e),hip_?0:-.13*e);botFace(b,dt,e)}
// doigts : courbure par articulation (0 ouvert … 1.5 poing)
function fingers(a,cv,idx,th){const s=a.sg*0+1;for(let k=0;k<4;k++){const c=k===0&&idx!==undefined?idx:cv,F=a.fing[k];F[0].rotation.x=c*.9*s;F[1].rotation.x=c*1.05*s;F[2].rotation.x=c*.7*s;F[0].rotation.z=(k-1.5)*.05*(1.4-Math.min(1.2,c))}a.th[0].rotation.x=(th===undefined?cv*.5:th)*.6*s;a.th[1].rotation.x=(th===undefined?cv*.5:th)*.8*s}
function botFace(b,dt,e){b.bk=(b.bk||0)-dt;if(b.bk<-rnd(2.5,5))b.bk=.13;const cl=b.bk>0?.12:1,wd=b.fl>0?.7:1;b.eyes.forEach(g=>g.scale.y=Math.max(.1,cl*wd));b.mouth.scale.set(1,b.fl>0||b.flinch>.3?2.8:(b.aimT?1.3:1),1);b.mouth.scale.x=b.fl>0?.8:1;
const bs=b.face.userData;if(bs.br1){bs.br1.position.y=bs['br-1'].position.y=.148-(b.aimT?.01:0)+(b.flinch>.3?.012:0);bs.br1.rotation.z=.08+(b.aimT?.24:0);bs['br-1'].rotation.z=-.08-(b.aimT?.24:0)}
const R=b.aR,Lh=b.aL,i=b.wi,fire=b.fl>0;fingers(R,1.25,fire||!b.aimT?1.25:.15,.5);fingers(Lh,1.15);if(b.thr>0&&b.aR)fingers(R,.25);if(b.blind>0){fingers(Lh,.35);}}
// ---- mort : 7 variantes selon le tir (face / dos / tête / explosion) + arme qui tombe
const DK=['arrière','avant','genoux','pirouette','tête','assis','souffle'],DW=[];
function botDeath(b,head){b.fall=0;const g=b.g.position,dx=P.x-g.x,dz=P.z-g.z,yw=b.g.rotation.y,fx=Math.sin(yw),fz=Math.cos(yw),front=(dx*fx+dz*fz)/(Math.hypot(dx,dz)||1),dist=Math.hypot(dx,dz);let k;
if(b.bl){k=6;const bx=g.x-b.bl.x,bz=g.z-b.bl.z,bd=Math.hypot(bx,bz)||1;b.dv=[bx/bd*(4+Math.random()*3),2.6+Math.random()*1.6,bz/bd*(4+Math.random()*3)];b.bl=null}
else if(head)k=Math.random()<.75?4:3;else if(front<-.2)k=1;else{const r=Math.random();k=r<.32?0:r<.55?2:r<.75?5:r<.88?3:0}
b.dk=k;b.ds=Math.random()<.5?1:-1;b.dyaw=b.g.rotation.y;b.dy=0;b.dfx=Math.sin(b.g.rotation.y);b.dfz=Math.cos(b.g.rotation.y);if(k===1||k===2||k===5){b.dsl=k===1?1.6:.5}else b.dsl=k===0?.9:0;
if(b.thr>0)b.thr=0;dropWeapon(b,k)}
function dropWeapon(b,k){const o=b.wps[b.wi];if(!o||!b.wp.visible)return;b.g.updateMatrixWorld(true);const m=new THREE.Mesh(o.geometry,BWM);m.castShadow=true;o.getWorldPosition(m.position);o.getWorldQuaternion(m.quaternion);S.add(m);
const sc=b.g.scale.x;m.scale.setScalar(sc);const d={m,v:new THREE.Vector3(rnd(-1.2,1.2)+(b.dv?b.dv[0]*.6:0),rnd(.4,1.6),rnd(-1.2,1.2)+(b.dv?b.dv[2]*.6:0)),av:new THREE.Vector3(rnd(-6,6),rnd(-4,4),rnd(-6,6)),rest:0,t:0,n:0};
while(DW.length>=14){const q=DW.shift();S.remove(q.m)}DW.push(d);b.wp.visible=false;b.flash.visible=false}
const _dq=new THREE.Quaternion(),_de=new THREE.Euler();
function dwUpdate(dt){for(let i=DW.length-1;i>=0;i--){const d=DW[i],m=d.m,p=m.position;d.t+=dt;if(d.t>22){S.remove(m);DW.splice(i,1);continue}if(d.rest){if(d.t>18)m.position.y-=dt*.12;continue}
d.v.y-=9.8*dt;p.addScaledVector(d.v,dt);_de.set(d.av.x*dt,d.av.y*dt,d.av.z*dt);_dq.setFromEuler(_de);m.quaternion.premultiply(_dq);const gy=groundAt(p.x,p.z,p.y+.3,.35)+.045;
if(p.y<gy){p.y=gy;if(d.v.y<-1.2&&d.n<3){sndAt(p.x,p.y,p.z,rnd(520,820),.07,.2,'square',{ref:3.5});sndAt(p.x,p.y,p.z,rnd(1800,3000),.04,.1,'triangle',{ref:3.5})}d.n++;d.v.y*=-.32;d.v.x*=.55;d.v.z*=.55;d.av.multiplyScalar(.5);
if(Math.abs(d.v.y)<.6&&Math.hypot(d.v.x,d.v.z)<.8){d.rest=1;_de.set(0,Math.atan2(d.v.x,d.v.z)||rnd(0,6),Math.PI/2*(Math.random()<.5?1:-1));m.quaternion.setFromEuler(_de);p.y=gy+.03}}}}
function botDead(b,dt){b.fall+=dt;const t=b.fall,k=b.dk||0,f=Math.min(1,t/(k===4?.3:k===2?.8:.5)),e=f*f*(3-2*f),sd=b.ds||1,g=b.g,I=_ik;
b.flash.visible=false;b.L.hip.rotation.set(0,0,0);b.Rg.hip.rotation.set(0,0,0);b.L.kn.rotation.set(.1,0,0);b.Rg.kn.rotation.set(.1,0,0);b.up.rotation.set(0,0,0);b.up.position.y=.9;b.hd.rotation.set(0,e*.6,0);g.rotation.z=0;g.rotation.x=0;
const ar=(r,l,x1,x2,z1,z2)=>{b.aR.p.rotation.set(r,0,z1);b.aL.p.rotation.set(l,0,z2);b.aR.el.rotation.set(x1,0,0);b.aL.el.rotation.set(x2,0,0)};
b.aR.p.quaternion.identity();b.aL.p.quaternion.identity();b.aR.el.quaternion.identity();b.aL.el.quaternion.identity();let yoff=0;
if(k===0){g.rotation.x=-e*1.5;ar(-.5+e*1.3,-.6+e*1.6,-.6+e*.4,-.5+e*.3,-.5*e,.9*e);b.L.hip.rotation.x=-e*.3;b.Rg.hip.rotation.x=e*.2;g.position.x+=b.dfx*-.5*dt*(1-f);g.position.z+=b.dfz*-.5*dt*(1-f);b.hd.rotation.x=-e*.3}
else if(k===1){g.rotation.x=e*1.5;yoff=0;ar(-1.2*e,-1.1*e,-.3,-.3,-.4*e,.4*e);b.L.hip.rotation.x=e*.35;b.Rg.hip.rotation.x=-e*.15;b.hd.rotation.set(-e*.5,sd*.8*e,0);const s=(1-f)*b.dsl*dt;g.position.x+=b.dfx*s;g.position.z+=b.dfz*s}
else if(k===2){const s1=Math.min(1,t/.38),s2=Math.max(0,Math.min(1,(t-.32)/.55)),q=s2*s2*(3-2*s2);b.L.hip.rotation.x=-1.25*s1;b.Rg.hip.rotation.x=-1.25*s1;b.L.kn.rotation.x=b.Rg.kn.rotation.x=2.3*s1;yoff=-.44*s1*(1-q*.35);b.up.rotation.x=.35*s1+.6*q*0;g.rotation.z=sd*q*1.4;g.rotation.x=-q*.25;ar(-.3-.5*s1,-.3-.5*s1,-.9,-.9,-.1,.1);b.hd.rotation.set(.5*s1,0,sd*.3*q)}
else if(k===3){const sp=Math.max(0,1-t/.8)*7;g.rotation.y+=sd*sp*dt;const q=Math.max(0,Math.min(1,(t-.35)/.5)),qq=q*q*(3-2*q);g.rotation.x=-qq*1.5;ar(-1.4*(1-qq)+qq*.4,-1.2*(1-qq)+qq*.4,-.2,-.2,-1.4*(1-qq),1.4*(1-qq));b.up.rotation.z=sd*.35*(1-qq);b.L.hip.rotation.x=-.5*(1-qq);b.Rg.hip.rotation.x=.4*(1-qq)}
else if(k===4){g.rotation.x=-e*1.55;yoff=Math.sin(Math.min(1,t/.35)*Math.PI)*.22;ar(-.9+e*.4,-.9+e*.5,-.2,-.2,-.9*e,.9*e);b.hd.rotation.set(-e*.9,0,sd*.2*e);b.up.rotation.x=-e*.2;b.L.hip.rotation.x=-e*.1;g.position.x+=b.dfx*-.3*dt*(1-f);g.position.z+=b.dfz*-.3*dt*(1-f)}
else if(k===5){const s1=Math.min(1,t/.55),q=s1*s1*(3-2*s1);b.L.hip.rotation.x=-1.5*q;b.Rg.hip.rotation.x=-1.4*q;b.L.hip.rotation.z=-.15*q;b.Rg.hip.rotation.z=.15*q;b.L.kn.rotation.x=b.Rg.kn.rotation.x=.25*q+.1;yoff=-.37*q;b.up.rotation.x=-.45*q;b.hd.rotation.set(.7*q,sd*.2*q,sd*.25*q);ar(.2*q,.2*q,-.2,-.2,-.5*q,.5*q);const s=(1-q)*.8*dt;g.position.x+=b.dfx*-s;g.position.z+=b.dfz*-s}
else{const v=b.dv||[0,0,0];if(!b.dair&&t<.01)b.dair=1;if(b.dair){b.dv[1]-=12*dt;g.position.x+=v[0]*dt;g.position.z+=v[2]*dt;b.dy+=v[1]*dt;if(b.dy<=0){b.dy=0;if(v[1]<-2){b.dv[1]*=-.25;b.dv[0]*=.5;b.dv[2]*=.5;sfxFoot(g.x,g.y,g.z,'land',1.2)}else{b.dv[0]*=.85;b.dv[2]*=.85}if(Math.abs(v[1])<1&&Math.hypot(v[0],v[2])<.4)b.dair=0}}
yoff=b.dy;const sp=Math.min(1,t/.9);g.rotation.x=-Math.min(1.5,e*.3+sp*1.2);g.rotation.z=sd*sp*.6;ar(-1.6*(1-sp)-.4,-1.4*(1-sp)-.4,-.3,-.3,-1.2*(1-sp),1.2*(1-sp));b.L.hip.rotation.x=-.6*(1-sp);b.Rg.hip.rotation.x=.5*(1-sp);b.hd.rotation.x=-.4*sp}
g.position.y=groundAt(g.position.x,g.position.z,b.fy===undefined?g.position.y:b.fy,.6)+yoff*(k===6?1:1);b.fy=g.position.y-yoff;
const fl=t>.5;fingers(b.aR,fl?.55:.2);fingers(b.aL,fl?.55:.2);b.eyes.forEach(q=>q.scale.y=.12);b.mouth.scale.set(1,k===4?3:1.6,1);b.g.visible=true}
