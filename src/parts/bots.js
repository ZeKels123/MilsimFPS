const T_camo=ctex(256,d=>{const a=fbm(256,4,4,4,41),b=fbm(256,9,9,3,77);for(let i=0;i<65536;i++){const v=a[i]<.4?.6:a[i]<.58?.78:1,w=b[i]>.62?.82:1,c=Math.min(1,v*w)*255;d[i*4]=c;d[i*4+1]=c;d[i*4+2]=c;d[i*4+3]=255}});
function mkBot(){
const g=new THREE.Group(),m=L(0x7a3b2e,{roughness:.85,map:T_camo,envMapIntensity:.5}),b={g,hp:100,dead:0,tx:0,tz:0,t:0,cd:rnd(1,2),ph:rnd(0,6.28),fl:0,fall:0,mvA:0,rec:0,flinch:0,tm:rnd(0,50),parts:[]};
g.rotation.order='YXZ';
const skin=L(0xb98660,{roughness:.7}),blk=L(0x15171a,{roughness:.5,metalness:.5,envMapIntensity:1}),bootM=L(0x17140f,{roughness:.8}),BG=(w,h,d)=>new THREE.BoxGeometry(w,h,d);
const add=(par,geo,mat,x,y,z,hit)=>{const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);o.castShadow=true;par.add(o);if(hit){o.userData.bot=b;botParts.push(o);b.parts.push(o)}return o};
const up=new THREE.Group();up.position.y=.9;g.add(up);b.up=up;
const U=(geo,mat,x,y,z,hit,par)=>add(par||up,geo,mat,x,y-.9,z,hit);
add(g,BG(.46,.24,.28),m,0,.83,0,1);
const leg=x=>{const hip=new THREE.Group();hip.position.set(x,.8,0);g.add(hip);add(hip,BG(.2,.38,.24),m,0,-.19,0,1);const kn=new THREE.Group();kn.position.y=-.38;hip.add(kn);add(kn,BG(.18,.36,.22),m,0,-.18,0,1);add(kn,BG(.2,.1,.32),bootM,0,-.36,.05);return{hip,kn}};
b.L=leg(-.12);b.Rg=leg(.12);
U(BG(.5,.58,.3),m,0,1.2,0,1);
b.vest=U(BG(.58,.46,.4),L(0x3b4a5a,{roughness:.9}),0,1.25,0);
[-.17,0,.17].forEach(x=>add(b.vest,BG(.13,.15,.07),blk,x,-.08,.22));
U(BG(.1,.1,.1),skin,0,1.55,0);
const arm=(x,rx,ry)=>{const p=new THREE.Group();p.position.set(x,.52,0);up.add(p);add(p,BG(.11,.3,.12),m,0,-.15,0,1);const el=new THREE.Group();el.position.y=-.3;p.add(el);add(el,BG(.1,.28,.11),m,0,-.14,0,1);add(el,BG(.09,.09,.09),blk,0,-.31,0);return{p,el,rx,ry}};
b.aR=arm(.31,-1.2,-.22);b.aL=arm(-.31,-1.3,.7);
const hd=new THREE.Group();hd.position.set(0,.8,0);up.add(hd);b.hd=hd;
const head=add(hd,new THREE.SphereGeometry(.16,14,12),skin,0,.02,0);head.userData={bot:b,head:true};botParts.push(head);b.parts.push(head);
[-.055,.055].forEach(x=>add(hd,BG(.035,.025,.02),blk,x,.04,.15));
b.helm=add(hd,new THREE.SphereGeometry(.19,14,10,0,Math.PI*2,0,Math.PI*.55),L(0x3a4a3a,{roughness:.7,side:THREE.DoubleSide}),0,.05,0);
b.brim=add(hd,new THREE.CylinderGeometry(.3,.3,.015,16),L(0x5a4f2a),0,.1,0);
b.visM=L(0x0a0a0a,{roughness:.2,metalness:.8});b.visor=add(hd,BG(.24,.07,.06),b.visM,0,.02,.13);
b.pads=new THREE.Group();[-.34,.34].forEach(x=>add(b.pads,BG(.16,.1,.22),blk,x,1.5-.9,0));up.add(b.pads);
const gn=add(up,BG(1,1,1),blk,.12,1.17-.9,.3);b.gun=gn;
b.flash=new THREE.Mesh(new THREE.SphereGeometry(.09,8,6),new THREE.MeshBasicMaterial({color:0xffd070,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,toneMapped:false}));b.flash.visible=false;up.add(b.flash);
b.mat=m;S.add(g);spawn(b);bots.push(b)}
function botLook(b,i){const t=BT[i];
b.brim.visible=i===2;b.visor.visible=i===1||i===3;b.pads.visible=i===3;
b.helm.scale.set(1,i===0?.55:i===2?.7:1,1);b.helm.material.color.setHex(i===0?0x2b3138:i===3?0x1c1e22:new THREE.Color(t.col).multiplyScalar(.75).getHex());b.brim.material.color.setHex(t.col);
b.visM.emissive.setHex(i===3?0xaa1111:0x000000);b.flash.position.set(.12,.27,.15+t.gun[2]+.04)}
function botAnim(b,dt,mv,mx_,mz_){b.tm+=dt;b.mvA+=((mv?1:0)-b.mvA)*Math.min(1,dt*7);b.ph+=dt*b.T.sp*4.6*(mv?1:0);
const A_=b.mvA,s=Math.sin(b.ph),c=Math.cos(b.ph);
b.L.hip.rotation.x=s*.75*A_;b.Rg.hip.rotation.x=-s*.75*A_;b.L.kn.rotation.x=Math.max(0,c)*.95*A_;b.Rg.kn.rotation.x=Math.max(0,-c)*.95*A_;
const yw=b.g.rotation.y,lean=Math.max(-1,Math.min(1,(mx_*Math.cos(yw)-mz_*Math.sin(yw))/(dt*b.T.sp+1e-6)));
b.rec=Math.max(0,b.rec-dt*7);b.flinch=Math.max(0,b.flinch-dt*3);b.fl-=dt;b.flash.visible=b.fl>0;
const u=b.up;u.rotation.x=-b.rec*.08-b.flinch*.3+Math.abs(s)*.03*A_;u.rotation.z=-lean*.12*A_;u.rotation.y=s*.1*A_;u.position.y=.9+Math.abs(s)*.035*A_+Math.sin(b.tm*1.7)*.006;
const k=b.rec*.18;
b.aR.p.rotation.set(b.aR.rx-k+c*.04*A_,b.aR.ry,0);b.aL.p.rotation.set(b.aL.rx-k-c*.04*A_,b.aL.ry,0);b.aR.el.rotation.x=-.25-b.rec*.1;b.aL.el.rotation.x=-.25;
b.hd.rotation.y=Math.sin(b.tm*.8+b.ph)*.12*(1-A_);b.hd.rotation.x=b.flinch*.25}
function botDead(b,dt){b.fall+=dt;const f=Math.min(1,b.fall/.45),e=f*f*(3-2*f);b.g.rotation.x=-e*1.5;
b.aR.p.rotation.set(b.aR.rx+e*1.0,b.aR.ry-e*.6,0);b.aL.p.rotation.set(b.aL.rx+e*1.2,b.aL.ry-e*1.2,0);b.aR.el.rotation.x=-.25+e*.2;
b.L.hip.rotation.x=-e*.3;b.Rg.hip.rotation.x=e*.2;b.L.kn.rotation.x=b.Rg.kn.rotation.x=0;b.up.rotation.set(0,0,0);b.flash.visible=false;b.g.visible=b.fall<2.4}
