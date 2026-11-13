// ================= CHAMPS AGRICOLES (nord-ouest) + FORÊT (sud-ouest) (v15) =================
const FARM={x0:-750,x1:-227,z0:-750,z1:-290},FOR={x0:-750,x1:40,z0:408,z1:750};
const inFarm=(x,z)=>x>FARM.x0&&x<FARM.x1&&z>FARM.z0&&z<FARM.z1,inFor=(x,z)=>x>FOR.x0&&x<FOR.x1&&z>FOR.z0&&z<FOR.z1;
const TYP=()=>{const r=Math.random();return r<.4?1:r<.65?2:r<.83?3:4};const FCELL=[];const nzSkip=(x,z)=>Math.max(Math.abs(x),Math.abs(z))>MH-9||inFor(x,z)||(inFarm(x,z)&&(Math.random()<.9||FCELL.some(c=>x>c[0]-4&&x<c[2]+4&&z>c[1]-4&&z<c[3]+4)));
{let sd=777;const rn=()=>(sd=(Math.imul(sd,1664525)+1013904223)>>>0)/4294967296;
const KIND=[{n:'ble',g:'#7a6238',c:['#d8b85c','#c9a646','#e6cc78'],h:.95,sp:1.3},{n:'mais',g:'#5e4a2c',c:['#4f8a2e','#5f9c38','#3f7426'],h:2.1,sp:1.6},{n:'pousses',g:'#5a4429',c:['#7fc04a','#6cae3e','#95d05c'],h:.34,sp:1.2},{n:'labour',g:'#4f3a26',c:0,h:0,sp:1.4},{n:'colza',g:'#5d5a2c',c:['#e6cf1c','#f2de3a','#d4bb12'],h:1.15,sp:1.3},{n:'prairie',g:'#6f9a3c',c:0,h:0,sp:0}];
const gT={},gM={};const gTex=(k,o)=>{const id=k+'_'+o;if(gT[id])return gT[id];const N=256,c=document.createElement('canvas');c.width=c.height=N;const g=c.getContext('2d'),K=KIND[k];g.fillStyle=K.g;g.fillRect(0,0,N,N);
const sp=(n,a,w,h)=>{for(let i=0;i<n;i++){g.fillStyle='rgba('+(rn()<.5?'255,240,210':'20,12,4')+','+rn()*a+')';g.fillRect(rn()*N,rn()*N,1+rn()*w,1+rn()*h)}};
if(k===5){for(let i=0;i<5000;i++){g.fillStyle=['#7fae44','#5f8a34','#8fbe52','#6a9a3a','#a3b85a'][(rn()*5)|0];g.globalAlpha=.25+rn()*.4;const x=rn()*N,y=rn()*N;g.fillRect(x,y,1+rn()*2,2+rn()*5)}g.globalAlpha=1;sp(900,.1,3,3)}
else{sp(5200,.16,3,3);for(let i=0;i<70;i++){g.fillStyle='rgba(150,140,125,'+(.25+rn()*.3)+')';g.beginPath();g.arc(rn()*N,rn()*N,.6+rn()*1.4,0,7);g.fill()}
const st=N/8;for(let r=0;r<8;r++){const p=r*st;g.save();if(o){g.translate(N,0);g.rotate(Math.PI/2)}
const gr=g.createLinearGradient(0,p,0,p+st);gr.addColorStop(0,'rgba(0,0,0,.34)');gr.addColorStop(.3,'rgba(0,0,0,0)');gr.addColorStop(.62,'rgba(255,235,200,.13)');gr.addColorStop(1,'rgba(0,0,0,.3)');g.fillStyle=gr;g.fillRect(0,p,N,st);
if(K.c)for(let i=0;i<(k===2?130:300);i++){g.fillStyle=K.c[(rn()*3)|0];g.globalAlpha=.3+rn()*.4;const w=1.5+rn()*3,hh=k===2?2+rn()*3:st*(.2+rn()*.3);g.fillRect(rn()*N,p+st*.5-hh/2+(rn()-.5)*3,w,hh)}g.globalAlpha=1;g.restore()}}
const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;return gT[id]=t};
// textures de cultures (tiges dessinées, fond transparent)
const cT={};const cTex=k=>{if(cT[k])return cT[k];const W=256,H=128,c=document.createElement('canvas');c.width=W*2;c.height=H*2;const g=c.getContext('2d');g.scale(2,2);const K=KIND[k],C=K.c,pk=()=>C[(rn()*3)|0];g.lineCap='round';
if(k===0){for(let i=0;i<230;i++){const x=rn()*W,h=H*(.62+rn()*.3),le=(rn()-.5)*10;g.strokeStyle=pk();g.lineWidth=1.2+rn()*1.2;g.beginPath();g.moveTo(x,H);g.quadraticCurveTo(x+le*.3,H-h*.6,x+le,H-h);g.stroke();g.fillStyle=rn()<.5?'#e9d488':'#d2b052';g.beginPath();g.ellipse(x+le,H-h-5,2.2,7,le*.03,0,7);g.fill()}}
else if(k===1){for(let i=0;i<34;i++){const x=4+rn()*(W-8),h=H*(.78+rn()*.2);g.strokeStyle='#5a8a34';g.lineWidth=3.2;g.beginPath();g.moveTo(x,H);g.lineTo(x+(rn()-.5)*4,H-h);g.stroke();
for(let l=0;l<7;l++){const y=H-h*(.12+l*.12+rn()*.04),d=(l%2?1:-1)*(12+rn()*16);g.strokeStyle=pk();g.lineWidth=3+rn()*2.5;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+d*.6,y-12-rn()*6,x+d,y+4+rn()*8);g.stroke()}
g.strokeStyle='#d9c676';g.lineWidth=1.3;for(let l=0;l<4;l++){g.beginPath();g.moveTo(x,H-h);g.lineTo(x+(rn()-.5)*9,H-h-7-rn()*5);g.stroke()}}}
else if(k===2){for(let i=0;i<150;i++){const x=rn()*W,h=H*(.35+rn()*.6),d=(rn()-.5)*26;g.strokeStyle=pk();g.lineWidth=3+rn()*3;g.beginPath();g.moveTo(x,H);g.quadraticCurveTo(x+d*.2,H-h*.7,x+d,H-h);g.stroke()}}
else{for(let i=0;i<95;i++){const x=rn()*W,h=H*(.55+rn()*.35),le=(rn()-.5)*14;g.strokeStyle=rn()<.5?'#4f8430':'#5f9638';g.lineWidth=.9+rn()*.9;g.beginPath();g.moveTo(x,H);g.lineTo(x+le,H-h);g.stroke()}
for(let i=0;i<1100;i++){const y=rn()*rn()*H*.5;g.fillStyle=pk();g.beginPath();g.arc(rn()*W,y+2,.6+rn()*1.1,0,7);g.fill()}}
const t=new THREE.CanvasTexture(c);t.anisotropy=4;t.wrapS=THREE.RepeatWrapping;return cT[k]=t};
const fbox=(w,h,d,x,y,z,mat)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y+h/2,z);m.castShadow=m.receiveShadow=true;S.add(m);solids.push(m);boxes.push({x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2,y0:y,y1:y+h});return m};
const CW=66,CH=48,GP=6,cells=[];
for(let x=FARM.x0+8;x+CW<FARM.x1-4;x+=CW+GP)for(let z=FARM.z0+8;z+CH<FARM.z1-4;z+=CH+GP){let ok=true;
for(let u=0;u<=CW&&ok;u+=11)for(let v=0;v<=CH;v+=11){const px=x+u,pz=z+v;if(!okPos(px,pz,5)||wDist(px,pz)<5||nearPath(px,pz,5)||HS.some(r=>px>r[0]-9&&px<r[2]+9&&pz>r[1]-9&&pz<r[3]+9)){ok=false;break}}
if(ok)cells.push([x,z,x+CW,z+CH])}
const pool=[0,0,1,1,2,3,4,4,5,0,3,1],RC_={},bales=[],hed=[],col=new THREE.Color();
const redM=std(0x8a3a2c,{roughness:.9}),roofM=std(0x4a4d50,{roughness:.8}),silM=std(0xb9bcbd,{roughness:.5,metalness:.4});
const gnd=(x0,z0,x1,z1,mat)=>{const i0=Math.ceil((x0+AR)/GSP),i1=Math.floor((x1+AR)/GSP),j0=Math.ceil((z0+AR)/GSP),j1=Math.floor((z1+AR)/GSP),w=i1-i0+1,h=j1-j0+1,Pp=new Float32Array(w*h*3),Uu=new Float32Array(w*h*2),Ii=[];
for(let j=0;j<h;j++)for(let i=0;i<w;i++){const n=j*w+i,X=-AR+(i0+i)*GSP,Z=-AR+(j0+j)*GSP;Pp[n*3]=X;Pp[n*3+1]=GHg[(j0+j)*GN+i0+i]+.035;Pp[n*3+2]=Z;Uu[n*2]=(X-x0)/10.4;Uu[n*2+1]=(Z-z0)/10.4;if(i<w-1&&j<h-1){const a=n,b=n+w,c=n+w+1,d=n+1;Ii.push(a,b,d,b,c,d)}}
const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(Pp,3));G.setAttribute('uv',new THREE.BufferAttribute(Uu,2));G.setIndex(Ii);G.computeVertexNormals();
const gm=new THREE.Mesh(G,mat);gm.receiveShadow=true;gm.userData.keep=1;S.add(gm)};
const yardM=std(0x7b6a48,{roughness:1,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});cells.forEach(c=>FCELL.push(c));cells.forEach((c,ci)=>{const[x0,z0,x1,z1]=c,cx=(x0+x1)/2,cz=(z0+z1)/2;RMS.push([x0-1,z0-1,x1+1,z1+1]);
if(rn()<.08){const gy=Math.min(GH(cx-16,cz-5),GH(cx,cz-5),GH(cx-16,cz+5),GH(cx,cz+5),GH(cx+8,cz+4))-.4;gnd(x0,z0,x1,z1,yardM);(window.FYARD=window.FYARD||[]).push([cx,cz]);fbox(17,1.2,11,cx-8,gy-.6,cz,roofM);fbox(6.4,1.2,6.4,cx+8,gy-.6,cz+4,roofM);fbox(16,6,10,cx-8,gy,cz,redM);for(const sg of[-1,1]){const rf=new THREE.Mesh(new THREE.BoxGeometry(17,.3,6.4),roofM);rf.position.set(cx-8,gy+7.1,cz+sg*2.5);rf.rotation.x=sg*.5;rf.castShadow=true;S.add(rf)}
fbox(5.4,11,5.4,cx+8,gy,cz+4,silM);const dm=new THREE.Mesh(new THREE.SphereGeometry(2.7,10,6,0,6.283,0,1.57),silM);dm.position.set(cx+8,gy+11,cz+4);S.add(dm);
for(let k=0;k<6;k++)bales.push([cx+rn()*30-15,cz+14+rn()*6,rn()*3]);return}
const k=pool[(ci*7+((rn()*12)|0))%pool.length],K=KIND[k],o=rn()<.5?1:0;
{const mk_=k+'_'+o;gnd(x0,z0,x1,z1,gM[mk_]||(gM[mk_]=std(0xffffff,{map:gTex(k,o),roughness:1,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1})))}
if(K.c){const len=o?CH-4:CW-4,n=Math.floor((o?CW-4:CH-4)/K.sp);for(let r=0;r<n;r++){const rh0=K.h*(.88+rn()*.24),rc=.86+rn()*.26;for(let s=0;s<len;s+=4){if(rn()<.04)continue;const rh=rh0*(.85+rn()*.3),sl=Math.min(4,len-s),mx=o?x0+2+r*K.sp+K.sp/2:x0+2+s+sl/2,mz=o?z0+2+s+sl/2:z0+2+r*K.sp+K.sp/2;(RC_[ci]=RC_[ci]||{k,c:[cx,GH(cx,cz),cz],a:[]}).a.push([mx,GH(mx,mz)+rh/2-.04,mz,sl*1.03,rh,K.sp,rc*(.9+rn()*.2),o])}}}
else if(k===3){}
else for(let b=0;b<6;b++)bales.push([x0+6+rn()*(CW-12),z0+6+rn()*(CH-12),rn()*3]);
if(rn()<.6){for(let s=0;s<CW;s+=8){const hx=x0+s+4,hz=z1+GP/2;if(!okPos(hx,hz,2)||nearPath(hx,hz,3))continue;hed.push([hx,hz])}}});
const dm_=new THREE.Object3D(),bg=new THREE.BoxGeometry(1,1,1);
const cg=(()=>{const P=[],U=[],Nn=[],I=[];const quad=(a,b,u0,u1)=>{for(const fl of[0,1]){const n=P.length/3;P.push(a[0],-.5,a[1],b[0],-.5,b[1],b[0],.5,b[1],a[0],.5,a[1]);U.push(u0,0,u1,0,u1,1,u0,1);for(let i=0;i<4;i++)Nn.push(0,1,0);fl?I.push(n,n+2,n+1,n,n+3,n+2):I.push(n,n+1,n+2,n,n+2,n+3)}};
quad([-.5,-.22],[.5,-.22],0,1);quad([-.5,.22],[.5,.22],.37,1.37);quad([-.25,-.5],[-.25,.5],.1,.42);quad([.25,-.5],[.25,.5],.5,.82);
const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.Float32BufferAttribute(P,3));G.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));G.setAttribute('normal',new THREE.Float32BufferAttribute(Nn,3));G.setIndex(I);return G})();
const FARMI=window.FARMI=[],cM={};Object.values(RC_).forEach(R_=>{const a=R_.a,k=R_.k;if(!a.length)return;const G=new THREE.BufferGeometry();for(const n in cg.attributes)G.setAttribute(n,cg.attributes[n]);G.setIndex(cg.index);G.boundingSphere=new THREE.Sphere(new THREE.Vector3(R_.c[0],R_.c[1],R_.c[2]),46);
const im=new THREE.InstancedMesh(G,cM[k]||(cM[k]=std(0xffffff,{map:cTex(k),alphaTest:.4,roughness:1,envMapIntensity:.25})),a.length);a.forEach((q,i)=>{dm_.position.set(q[0],q[1],q[2]);dm_.rotation.set(0,q[7]?Math.PI/2:0,0);dm_.scale.set(q[3],q[4],q[5]);dm_.updateMatrix();im.setMatrixAt(i,dm_.matrix);col.setScalar(Math.min(1,q[6]));im.setColorAt(i,col)});im.receiveShadow=true;im.userData.c=R_.c;S.add(im);FARMI.push(im)});
setInterval(()=>{if(typeof P==='undefined')return;for(const im of FARMI){const c=im.userData.c,d=Math.hypot(c[0]-P.x,c[2]-P.z);im.visible=im.visible?d<300:d<280}},700);
if(hed.length){const im=new THREE.InstancedMesh(bg,std(0x35602c,{roughness:1}),hed.length);hed.forEach((q,i)=>{const y=GH(q[0],q[1]);dm_.position.set(q[0],y+.75,q[1]);dm_.scale.set(8.2,1.6,1.5);dm_.updateMatrix();im.setMatrixAt(i,dm_.matrix);boxes.push({x0:q[0]-4.1,x1:q[0]+4.1,z0:q[1]-.75,z1:q[1]+.75,y0:y,y1:y+1.6})});im.frustumCulled=false;S.add(im)}
if(bales.length){const im=new THREE.InstancedMesh(new THREE.CylinderGeometry(.95,.95,1.3,12),std(0xcdb25a,{roughness:1}),bales.length);bales.forEach((q,i)=>{const y=GH(q[0],q[1]);dm_.position.set(q[0],y+.95,q[1]);dm_.rotation.set(0,q[2],1.5708);dm_.scale.set(1,1,1);dm_.updateMatrix();im.setMatrixAt(i,dm_.matrix);boxes.push({x0:q[0]-1,x1:q[0]+1,z0:q[1]-1,z1:q[1]+1,y0:y,y1:y+1.9})});im.castShadow=true;im.frustumCulled=false;S.add(im)}
window.FARMN=cells.length;window.FARMC=cells}
