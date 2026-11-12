
// ================= MAISONS (v3) : crépi, soubassement pierre, fenêtres ouvertes, toit, mobilier =================
// ===== v6 : niveaux (sols multiples, escaliers, toits, fenêtres franchissables) =====
const LSURF=[],UPH=[];let YO=0;
function surfRect(x0,x1,z0,z1,y,o){const s=Object.assign({x0:Math.min(x0,x1),x1:Math.max(x0,x1),z0:Math.min(z0,z1),z1:Math.max(z0,z1),y:y},o||{});LSURF.push(s);return s}
function surfRamp(x0,z0,x1,z1,w,ya,yb,o){const dx=x1-x0,dz=z1-z0,L=Math.hypot(dx,dz),nx=dx/L,nz=dz/L,ex=Math.abs(nz)*w/2,ez=Math.abs(nx)*w/2;
const s={x0:Math.min(x0,x1)-ex,x1:Math.max(x0,x1)+ex,z0:Math.min(z0,z1)-ez,z1:Math.max(z0,z1)+ez,ramp:1,ax:x0,az:z0,nx,nz,L,ya,yb,y:Math.max(ya,yb)};Object.assign(s,o||{});LSURF.push(s);return s}
function surfH(s,x,z){if(!s.ramp)return s.y;const t=Math.max(0,Math.min(1,((x-s.ax)*s.nx+(z-s.az)*s.nz)/s.L));return s.ya+(s.yb-s.ya)*t}
let GSUP=null;
function groundAt(x,z,fy,step){let g=GH(x,z);GSUP=null;if(step===undefined)step=.55;for(let i=0;i<LSURF.length;i++){const s=LSURF[i];if(x<s.x0||x>s.x1||z<s.z0||z>s.z1)continue;if(s.gl&&!s.gl.userData.glass.dead)continue;const h=surfH(s,x,z);if(h<=fy+(s.gl?1.15:step)&&h>g){g=h;GSUP=s}}return g}
// escalier (marches creuses + contremarches) le long de (xa,za)->(xb,zb) de la hauteur ya à yb ; renvoie la rampe
function stairs(xa,za,xb,zb,w,ya,yb,mat,o){o=o||{};const n=Math.max(2,Math.round((yb-ya)/.2)),dx=(xb-xa)/n,dz=(zb-za)/n,rs=(yb-ya)/n,ax=Math.abs(dx)>Math.abs(dz);
for(let i=0;i<n;i++){const top=ya+rs*(i+1),cx_=xa+dx*(i+.5),cz_=za+dz*(i+.5),sx=ax?Math.abs(dx):w,sz=ax?w:Math.abs(dz);
const t=new THREE.Mesh(new THREE.BoxGeometry(sx,.07,sz),mat);t.position.set(cx_,top-.035,cz_);t.castShadow=t.receiveShadow=true;S.add(t);solids.push(t);
const r=new THREE.Mesh(new THREE.BoxGeometry(ax?.03:w,rs,ax?w:.03),mat);r.position.set(cx_-(ax?Math.sign(dx)*Math.abs(dx)/2:0),top-rs/2,cz_-(ax?0:Math.sign(dz)*Math.abs(dz)/2));r.castShadow=r.receiveShadow=true;S.add(r);
boxes.push({x0:cx_-sx/2,x1:cx_+sx/2,z0:cz_-sz/2,z1:cz_+sz/2,y0:top-rs,y1:top,stair:1});
if(o.rail){const q=o.rail,px=ax?cx_:cx_+q*(w/2-.03),pz=ax?cz_+q*(w/2-.03):cz_;if(i%3===0){const p=new THREE.Mesh(new THREE.BoxGeometry(.05,.95,.05),steelM);p.position.set(px,top+.45,pz);p.castShadow=true;S.add(p)}
boxes.push({x0:px-.04,x1:px+.04,z0:pz-.04,z1:pz+.04,y0:top,y1:top+.95})}}
if(o.rail){const q=o.rail,ex=ax?(xa+xb)/2:xa+q*(w/2-.03),ez=ax?za+q*(w/2-.03):(za+zb)/2,L=Math.hypot(xb-xa,zb-za),an=Math.atan2(yb-ya,L),
rl=new THREE.Mesh(new THREE.BoxGeometry(ax?L+.2:.06,.06,ax?.06:L+.2),steelM);rl.position.set(ex,(ya+yb)/2+.95,ez);if(ax)rl.rotation.z=(dx>0?1:-1)*an;else rl.rotation.x=(dz>0?-1:1)*an;rl.castShadow=true;S.add(rl)}
return surfRamp(xa,za,xb,zb,w,ya,yb,o.sf)}

const HS=[],ROOMS=[],GLASS=[],BROKEN=[],HSTY=[{w:0xf4ecda,s:0x3f6a4a},{w:0xecd9b4,s:0x8a3a2c},{w:0xe2e8ea,s:0x34506e},{w:0xf2e3c6,s:0x6a4a2c}];
const stoneM=pm(T_stone,0xffffff,{roughness:.95}),floorM=pm(T_floor,0xc9a070,{roughness:.55}),beamM=pm(T_wood,0x6a4a2c,{roughness:.8}),furnM=pm(T_wood,0xb98a58,{roughness:.65}),
tileM=pm(T_roof,0xffffff,{roughness:.85}),frameM=std(0xf4f1e8,{roughness:.6}),darkM=std(0x1e1c1a,{roughness:.6,metalness:.4}),clothM=std(0xece8de,{roughness:1}),
glassM=std(0xa8cad8,{roughness:.05,metalness:.2,transparent:true,opacity:.2,envMapIntensity:2.2,depthWrite:false,side:THREE.DoubleSide}),lampM=new THREE.MeshBasicMaterial({color:0xffe9b8,toneMapped:false});
const rugT=(()=>{const c=document.createElement('canvas');c.width=128;c.height=96;const x=c.getContext('2d');x.fillStyle='#7a2a24';x.fillRect(0,0,128,96);x.strokeStyle='#d8c08a';x.lineWidth=3;x.strokeRect(6,6,116,84);x.strokeStyle='#2c3a52';x.lineWidth=2;x.strokeRect(12,12,104,72);
x.fillStyle='#d8c08a';for(let i=0;i<5;i++){x.save();x.translate(24+i*20,48);x.rotate(Math.PI/4);x.fillRect(-6,-6,12,12);x.restore()}for(let i=0;i<900;i++){x.fillStyle='rgba(0,0,0,'+rnd(.03,.12)+')';x.fillRect(rnd(0,128),rnd(0,96),1,2)}return tx(c,1)})();
function blk(w,h,d,x,y,z,m,o){o=o||{};y+=YO;const g=new THREE.BoxGeometry(w,h,d);if(o.T)wuv(g,x,y,z,o.T,o.T);else if(o.fit)fitUV(g,w,h,d,o.fit);const e=new THREE.Mesh(g,m);e.position.set(x,y,z);e.castShadow=!o.ns;e.receiveShadow=true;S.add(e);if(o.s)solids.push(e);if(o.c)boxes.push({x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2,y0:y-h/2,y1:y+h/2});return e}
const gb=(g,w,h,d,x,y,z,m,fit)=>{const q=new THREE.BoxGeometry(w,h,d);if(fit)fitUV(q,w,h,d,fit);const e=new THREE.Mesh(q,m);e.position.set(x,y,z);e.castShadow=e.receiveShadow=true;g.add(e);return e};

const BSTY={w:0xcfccbd,s:0x4a5a3a};
const concM2=pm(T_conc,0xd2cfc2,{roughness:.92}),slabM=pm(T_slab,0xa8a69c,{roughness:.8}),steelM=std(0x5d646c,{roughness:.4,metalness:.85,envMapIntensity:1.2});
const mapT=(()=>{const c=document.createElement('canvas');c.width=256;c.height=160;const x=c.getContext('2d');x.fillStyle='#cdbf96';x.fillRect(0,0,256,160);
for(let i=0;i<40;i++){x.strokeStyle='rgba(90,70,40,'+(.1+Math.random()*.2)+')';x.beginPath();let X=Math.random()*256,Y=Math.random()*160;x.moveTo(X,Y);for(let k=0;k<6;k++){X+=rnd(-30,30);Y+=rnd(-20,20);x.lineTo(X,Y)}x.stroke()}
x.strokeStyle='rgba(60,60,60,.45)';x.lineWidth=1;for(let i=0;i<256;i+=16){x.beginPath();x.moveTo(i,0);x.lineTo(i,160);x.stroke()}for(let i=0;i<160;i+=16){x.beginPath();x.moveTo(0,i);x.lineTo(256,i);x.stroke()}
x.fillStyle='#b02820';[[60,50],[150,90],[200,40]].forEach(q=>{x.beginPath();x.arc(q[0],q[1],5,0,7);x.fill()});x.strokeStyle='#2848a0';x.lineWidth=3;x.beginPath();x.moveTo(30,130);x.lineTo(100,100);x.lineTo(190,110);x.stroke();return tx(c,1)})();
// ----- vitres : fissure puis éclat -----
const crackT=(()=>{const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.strokeStyle='rgba(240,250,255,.95)';x.lineCap='round';
for(let i=0;i<16;i++){const a=i/16*6.283+Math.random()*.3;let r=0,px=128,py=128;x.lineWidth=2.2;x.beginPath();x.moveTo(px,py);while(r<118){r+=rnd(10,26);const aa=a+rnd(-.12,.12);px=128+Math.cos(aa)*r;py=128+Math.sin(aa)*r;x.lineTo(px,py)}x.stroke()}
for(let k=1;k<5;k++){x.lineWidth=1.2;x.beginPath();for(let i=0;i<=24;i++){const a=i/24*6.283,r=k*22+rnd(-4,4);i?x.lineTo(128+Math.cos(a)*r,128+Math.sin(a)*r):x.moveTo(128+Math.cos(a)*r,128+Math.sin(a)*r)}x.stroke()}
x.fillStyle='rgba(255,255,255,.12)';for(let i=0;i<18;i++){x.beginPath();x.moveTo(128+rnd(-70,70),128+rnd(-70,70));x.lineTo(128+rnd(-90,90),128+rnd(-90,90));x.lineTo(128+rnd(-90,90),128+rnd(-90,90));x.fill()}
const t=new THREE.CanvasTexture(c);t.anisotropy=AN;return t})();
const crackM=std(0xe8f4f8,{map:crackT,transparent:true,roughness:.1,metalness:.2,envMapIntensity:2,depthWrite:false,side:THREE.DoubleSide});
const shardG=(()=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,.09,0,0,.03,.1,0],3));g.computeVertexNormals();return g})();
const shardM=std(0xcfe6ee,{roughness:.05,metalness:.3,transparent:true,opacity:.6,envMapIntensity:2,side:THREE.DoubleSide});
function sndGlass(n,p){for(let i=0;i<n*5;i++)setTimeout(()=>p?sndAt(p.x,p.y,p.z,rnd(2200,6500),.06,.14,'triangle',{ref:5}):snd(rnd(2200,6500),.05,.08,'triangle'),i*rnd(15,45))}
function shards(p,n,d){for(let i=0;i<n;i++){const m=new THREE.Mesh(shardG,shardM);m.scale.setScalar(rnd(.5,1.6));m.position.copy(p);m.position.x+=rnd(-.3,.3);m.position.y+=rnd(-.3,.3);m.position.z+=rnd(-.3,.3);m.rotation.set(rnd(0,6),rnd(0,6),rnd(0,6));S.add(m);
debris.push({m,v:new THREE.Vector3(rnd(-1.2,1.2)+d.x*2.2,rnd(0,2.5),rnd(-1.2,1.2)+d.z*2.2),t:rnd(4,7)})}}
function glassHit(m,p,d){const q=m.userData.glass;if(!q||q.dead)return;q.hp--;
if(q.hp>0){const g=m.geometry,a=g.attributes.position,uv=g.attributes.uv,l=m.worldToLocal(p.clone()),w=q.w*1.5,h=q.h*1.5;for(let i=0;i<a.count;i++)uv.setXY(i,(a.getX(i)-l.x)/w+.5,(a.getY(i)-l.y)/h+.5);uv.needsUpdate=true;m.material=crackM;shards(p,4,d);sndGlass(.6,p)}
else{q.dead=true;m.parent&&m.parent.remove(m);rm(solids,m);rm(ray,m);BROKEN.push(m);typeof navWin==='function'&&navWin(m);shards(p,26,d);sndGlass(1.4,p)}}
function repairGlass(){const hadB=BROKEN.length;while(BROKEN.length){const m=BROKEN.pop();m.userData.glass.dead=false;m.userData.glass.hp=2;m.material=glassM;m.userData.home.add(m);solids.push(m);ray.push(m)}if(hadB&&typeof navBuild==='function')navBuild();GLASS.forEach(m=>{if(m.material!==glassM&&!m.userData.glass.dead){m.material=glassM;m.userData.glass.hp=2}})}
function castShot(o,d,far){let org=o.clone();far=far||80;for(let k=0;k<5;k++){RC.set(org,d);RC.far=far;const h=RC.intersectObjects([...ray,...botParts.filter(q=>!q.userData.bot.dead)])[0];if(h&&h.object.userData.glass){glassHit(h.object,h.point,d);org=h.point.clone().addScaledVector(d,.03);far-=h.distance+.03;continue}return h}return null}
function losBlock(V,W,far){RC.set(V,W);RC.far=far;const hs=RC.intersectObjects(ray);if(hs.some(h=>!h.object.userData.glass))return true;hs.forEach(h=>glassHit(h.object,h.point,W));return false}
function steelify(d){d.hp=d.max=450;d.m.material=d.mat=std(0x6a7178,{roughness:.4,metalness:.85,envMapIntensity:1.2});d.k=[.45,.47,.5]}
