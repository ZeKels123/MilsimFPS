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
b.mask=add(hd,BG(.215,.11,.17),blk,0,.055,.05);
b.helm=add(hd,new THREE.SphereGeometry(.158,14,10,0,Math.PI*2,0,Math.PI*.55),L(0x3a4a3a,{roughness:.7,side:THREE.DoubleSide}),0,.15,0);
b.brim=add(hd,new THREE.CylinderGeometry(.25,.25,.014,16),L(0x5a4f2a),0,.185,0);
b.visM=L(0x0a0a0a,{roughness:.2,metalness:.8});b.visor=add(hd,BG(.23,.065,.05),b.visM,0,.15,.115);
b.ears=new THREE.Group();[-.135,.135].forEach(x=>add(b.ears,BG(.04,.1,.09),blk,x,.12,0));hd.add(b.ears);
b.pads=new THREE.Group();[-.3,.3].forEach(x=>add(b.pads,BG(.15,.09,.2),blk,x,.6,0));up.add(b.pads);
// bras : épaule → coude → main (longueurs a, b)
const arm=(x,rx,ry)=>{const p=new THREE.Group();p.position.set(x,.54,0);up.add(p);add(p,BG(.12,.12,.14),m,0,-.02,0);add(p,BG(.1,.28,.11),m,0,-.15,0,1);const el=new THREE.Group();el.position.y=-.29;p.add(el);add(el,BG(.085,.24,.095),m,0,-.12,0,1);add(el,BG(.075,.085,.09),glv,0,-.275,0);return{p,el,rx,ry,a:.29,b:.275}};
b.aR=arm(.25,-1.2,-.22);b.aL=arm(-.25,-1.3,.7);
// armes (une visible selon le type)
const wp=new THREE.Group();wp.rotation.order='YXZ';up.add(wp);b.wp=wp;b.wps=BWG.map(w=>{const o=new THREE.Mesh(w[0],BWM);o.castShadow=true;o.visible=false;wp.add(o);return o});
b.gun=new THREE.Object3D();
b.flash=new THREE.Mesh(new THREE.SphereGeometry(.09,8,6),new THREE.MeshBasicMaterial({color:0xffd070,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,toneMapped:false}));b.flash.visible=false;wp.add(b.flash);
b.mat=m;S.add(g);spawn(b);bots.push(b)}
function botLook(b,i){const t=BT[i];b.wi=i;b.wps.forEach((o,k)=>o.visible=k===i);b.flash.position.set(0,.025,BWG[i][2]+.05);b.flash.scale.setScalar(i===3?1.5:i===2?1.3:1);
b.brim.visible=i===2;b.visor.visible=i===1||i===3;b.pads.visible=i===3;b.mask.visible=i===0||i===3;b.ears.visible=i===1;b.pack.visible=i===1||i===2;b.L.kp.visible=b.Rg.kp.visible=i===1||i===3;b.vestX.visible=i!==2;
b.helm.scale.set(1,i===0?.62:i===2?.8:1,1);b.helm.material.color.setHex(i===0?0x2b3138:i===3?0x1c1e22:i===2?t.col:new THREE.Color(t.col).multiplyScalar(.75).getHex());b.brim.material.color.setHex(t.col);b.pack.material.color.setHex(new THREE.Color(t.col).multiplyScalar(.8).getHex());
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
b.hd.rotation.set(b.flinch*.25+.1*e-pit*.3,-tw+Math.sin(b.tm*.8+b.ph)*.25*(1-A_)*(1-e),hip_?0:-.13*e)}
function botDead(b,dt){b.fall+=dt;const f=Math.min(1,b.fall/.45),e=f*f*(3-2*f);b.g.rotation.x=-e*1.5;
b.aR.p.rotation.set(-.5+e*1.3,0,-.5*e);b.aL.p.rotation.set(-.6+e*1.6,0,.9*e);b.aR.el.rotation.set(-.6+e*.4,0,0);b.aL.el.rotation.set(-.5+e*.3,0,0);
b.wp.position.set(.2+e*.25,.3-e*.25,.25);b.wp.rotation.set(.4+e*.9,-.5-e,e*1.2);
b.L.hip.rotation.x=-e*.3;b.Rg.hip.rotation.x=e*.2;b.L.kn.rotation.x=b.Rg.kn.rotation.x=.1;b.up.rotation.set(0,0,0);b.hd.rotation.set(0,e*.6,0);b.flash.visible=false;b.g.visible=b.fall<2.4}
