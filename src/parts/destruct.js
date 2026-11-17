// ================= OBJETS DESTRUCTIBLES (v33) : véhicules =================
// Voitures garées et véhicules : points de vie (balles, explosions). Fumée dès 60 %, flammes dès 30 %, épave en feu à 0 :
// l'épave explose après quelques secondes (60 %), noircit et reste comme obstacle ; les balles traversent la tôle (matériau « veh »).
function dstS(){return window.DSTS||(window.DSTS={list:[],act:[],t:0})}
function dstVeh(e,px,bx,x,y,z){const r={e,px,bx,x,y,z,hp:700,max:700,st:0,t:0,fl:0,sm:0,id:dstS().list.length};px.userData.dst=r;px.userData.bmat='veh';dstS().list.push(r)}
// r.src : auteur du dernier dégât ('p' joueur, 'b' bot, absent = personne) ; sert à créditer l'explosion de l'épave
function dstHit(r,h,dmg,src){if(r.st>=2)return;if(src)r.src=src;r.hp-=dmg;if(r.hp<r.max*.6&&!r.on){r.on=1;dstS().act.push(r)}if(r.hp<=0&&r.st===0)dstBurn(r);snd(rnd(300,500),.05,.1,'triangle')}
function dstLos(x,y,z,r){const ty=r.y+1;_dl.set(r.x-x,ty-y,r.z-z);const d=_dl.length();if(d<2.5)return true;_dl.multiplyScalar(1/d);_dsv.set(x,y,z);RC.set(_dsv,_dl);RC.far=d-.4;return!RC.intersectObjects(ray).some(h=>{const o=h.object,u=o.userData;if(u.glass||u.barrel)return false;if(u.dst)return!(u.dst===r||Math.hypot(u.dst.x-x,u.dst.z-z)<3);return true})}
const _dl=new THREE.Vector3(),_dsv=new THREE.Vector3();
// souffle : distance en 3D (hauteur de la caisse r.y..r.y+2), ligne de vue au-delà de 2,5 m ; n = explosion {owner,src} (absent = personne)
function dstBlast(x,y,z,R,n){const src=n?(n.src||(n.owner?'b':'p')):'n';for(const r of dstS().list){if(r.st>=1)continue;const dy=y<r.y?r.y-y:y>r.y+2?y-r.y-2:0,d=Math.hypot(r.x-x,dy,r.z-z);if(d>R)continue;if(d>2.5&&!dstLos(x,y,z,r))continue;if(src!=='n')r.src=src;const k=1-d/R;r.hp-=900*k*k+80*k;if(!r.on&&r.hp<r.max*.6){r.on=1;dstS().act.push(r)}if(r.hp<=0)dstBurn(r)}}
function dstBurn(r){r.st=1;r.t=rnd(3,7);r.hp=Math.min(r.hp,0);if(!r.on){r.on=1;dstS().act.push(r)}}
function dstChar(r){r.e.traverse(m=>{if(m.isMesh&&m.material){const f=q=>{const c=q.clone();if(c.color)c.color.multiplyScalar(.12);if(c.map&&c.emissive)c.emissive.set(0);return c};m.material=Array.isArray(m.material)?m.material.map(f):f(m.material)}})}
function dstEmit(r,k){const p=new THREE.Vector3(r.x+rnd(-.8,.8),r.y+.9,r.z+rnd(-.8,.8));
if(k===0)emit(p,_e.set(rnd(-.3,.3),rnd(.8,1.6),rnd(-.3,.3)),{map:puffT,color:0x9a9a98,size:rnd(.5,.8),grow:1.4,life:rnd(1.8,2.8),a:.28,drag:.8,g:-.4});
else if(k===1){emit(p,_e.set(rnd(-.4,.4),rnd(1.2,2.4),rnd(-.4,.4)),{map:puffT,color:0x1a1918,size:rnd(.7,1.1),grow:1.8,life:rnd(2.5,4),a:.5,drag:.8,g:-.5});emit(p,_e.set(rnd(-.3,.3),rnd(1.5,3),rnd(-.3,.3)),{map:flareT,color:0xff8a28,size:rnd(.5,.9),grow:.5,life:rnd(.3,.6),add:1,a:.8,drag:1})}}
function dstTick(dt){const D=dstS();for(let i=D.act.length-1;i>=0;i--){const r=D.act[i];if(Math.hypot(r.x-P.x,r.z-P.z)>140)continue;r.sm-=dt;
if(r.st===0){if(r.sm<=0){r.sm=r.hp<r.max*.3?.12:.3;dstEmit(r,r.hp<r.max*.3?1:0)}}
else if(r.st===1){if(r.sm<=0){r.sm=.07;dstEmit(r,1)}r.t-=dt;if(r.t<=0){r.st=2;r.fl=rnd(35,60);dstChar(r);r.e.rotation.z=.04;if(Math.random()<.6){const p=new THREE.Vector3(r.x,r.y+.9,r.z);nadeBoom({type:0,p,owner:r.src==='b'?{}:null,src:r.src||'n',wet:false,m:{visible:false}});r.e.position.y-=.08}}}
else{r.fl-=dt;if(r.sm<=0){r.sm=r.fl>0?.15:.8;dstEmit(r,r.fl>0?1:0)}if(r.fl<-60){D.act.splice(i,1);r.on=0}}}}
