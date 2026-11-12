
// ================= IA DES BOTS (v5) : navigation A*, couvert, contournement, poursuite, grenades =================
const NS=.5,NGN=4*MH,NAVB=new Uint8Array(NGN*NGN),NAVC=new Float32Array(NGN*NGN),AI={flank:null,nadeCd:4,budget:0,poi:[],kills:0,nz:0,tick:0};
const nIdx=(x,z)=>{const i=Math.floor((x+MH)/NS),j=Math.floor((z+MH)/NS);return i<0||j<0||i>=NGN||j>=NGN?-1:j*NGN+i},nFree=(x,z)=>{const k=nIdx(x,z);return k>=0&&!NAVB[k]},nX=k=>-MH+(k%NGN+.5)*NS,nZ=k=>-MH+((k/NGN|0)+.5)*NS;
function navBuild(){NAVB.fill(0);NAVC.fill(0);const db=new Set(doors.map(d=>d.box)),m=.3;
for(const o of boxes){if(db.has(o)||o.y0>1.7)continue;const i0=Math.max(0,Math.ceil((o.x0-m+MH)/NS-.5)),i1=Math.min(NGN-1,Math.floor((o.x1+m+MH)/NS-.5)),j0=Math.max(0,Math.ceil((o.z0-m+MH)/NS-.5)),j1=Math.min(NGN-1,Math.floor((o.z1+m+MH)/NS-.5));for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++)NAVB[j*NGN+i]=1}
for(let k=0;k<NGN*NGN;k++){const x=nX(k),z=nZ(k);if(Math.abs(x)>MH-1.4||Math.abs(z)>MH-1.4||(x>ZN.x0-2.6&&x<ZN.x1+2.6&&z>ZN.z0-2.6))NAVB[k]=1;else if(!NAVB[k]){const d=wDep(x,z);if(d>.6)NAVB[k]=1;else if(d>.04)NAVC[k]=2.5}}
for(let j=1;j<NGN-1;j++)for(let i=1;i<NGN-1;i++){const k=j*NGN+i;if(!NAVB[k]&&(NAVB[k-1]||NAVB[k+1]||NAVB[k-NGN]||NAVB[k+NGN]))NAVC[k]+=.7}}
function navWin(m){const q=m.userData.glass.nv;if(!q)return;const ax=q.ax==='x',hw=q.w/2-.05;for(let a=-hw;a<=hw+.01;a+=.25)for(let b=-.8;b<=.8;b+=.25){const x=ax?q.c+a:q.f+b,z=ax?q.f+b:q.c+a,k=nIdx(x,z);if(k>=0){NAVB[k]=0;NAVC[k]=Math.abs(b)<.4?2.6:1.2}}}
function nSnap(x,z){const k=nIdx(Math.max(-MH+.3,Math.min(MH-.3,x)),Math.max(-MH+.3,Math.min(MH-.3,z)));if(!NAVB[k])return k;const ci=k%NGN,cj=k/NGN|0;for(let r=1;r<14;r++)for(let j=cj-r;j<=cj+r;j++)for(let i=ci-r;i<=ci+r;i++){if(Math.max(Math.abs(i-ci),Math.abs(j-cj))!==r||i<0||j<0||i>=NGN||j>=NGN)continue;if(!NAVB[j*NGN+i])return j*NGN+i}return -1}
function navLine(x0,z0,x1,z1){const d=Math.hypot(x1-x0,z1-z0),n=Math.ceil(d/.22);for(let i=1;i<n;i++){const t=i/n,k=nIdx(x0+(x1-x0)*t,z0+(z1-z0)*t);if(k<0||NAVB[k]||NAVC[k]>2)return false}return true}
const aG=new Float32Array(NGN*NGN),aP=new Int32Array(NGN*NGN),aS=new Uint16Array(NGN*NGN);let aGen=0;const hK=[],hF=[];
function hPush(k,f){let i=hK.length;hK.push(k);hF.push(f);while(i>0){const p=(i-1)>>1;if(hF[p]<=f)break;hK[i]=hK[p];hF[i]=hF[p];i=p}hK[i]=k;hF[i]=f}
function hPop(){const k=hK[0],lk=hK.pop(),lf=hF.pop(),n=hK.length;if(n){let i=0;for(;;){let c=2*i+1;if(c>=n)break;if(c+1<n&&hF[c+1]<hF[c])c++;if(hF[c]>=lf)break;hK[i]=hK[c];hF[i]=hF[c];i=c}hK[i]=lk;hF[i]=lf}return k}
const ND=[[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,1.414],[1,-1,1.414],[-1,1,1.414],[-1,-1,1.414]];
function navPath(sx,sz,tx,tz){const s=nSnap(sx,sz),t=nSnap(tx,tz);if(s<0||t<0)return null;if(s===t)return[[nX(t),nZ(t)]];
if(++aGen>65000){aGen=1;aS.fill(0)}hK.length=hF.length=0;const ti=t%NGN,tj=t/NGN|0,H=k=>{const a=Math.abs(k%NGN-ti),b=Math.abs((k/NGN|0)-tj);return(Math.max(a,b)+.414*Math.min(a,b))*1.15};
aG[s]=0;aP[s]=-1;aS[s]=aGen;hPush(s,H(s));let n=0,best=s,bh=H(s),end=-1;
while(hK.length&&n++<14000){const k=hPop();if(k===t){end=k;break}const g=aG[k],ci=k%NGN,cj=k/NGN|0,h=H(k);if(h<bh){bh=h;best=k}
for(let q=0;q<8;q++){const d=ND[q],i=ci+d[0],j=cj+d[1];if(i<0||j<0||i>=NGN||j>=NGN)continue;const c=j*NGN+i;if(NAVB[c])continue;if(q>3&&(NAVB[cj*NGN+i]||NAVB[j*NGN+ci]))continue;const ng=g+d[2]+NAVC[c];if(aS[c]!==aGen||ng<aG[c]-.001){aS[c]=aGen;aG[c]=ng;aP[c]=k;hPush(c,ng+H(c))}}}
if(end<0)end=best;const raw=[];for(let k=end;k>=0;k=aP[k])raw.push(k);raw.reverse();const out=[];let i=0;
while(i<raw.length-1){let j=Math.min(raw.length-1,i+40);while(j>i+1&&!navLine(nX(raw[i]),nZ(raw[i]),nX(raw[j]),nZ(raw[j])))j-=Math.max(1,(j-i)>>2);out.push([nX(raw[j]),nZ(raw[j])]);i=j}
if(!out.length)out.push([nX(end),nZ(end)]);return out}
const _la=new THREE.Vector3(),_lb=new THREE.Vector3();
function losClear(ax,ay,az,bx,by,bz){_la.set(ax,ay,az);_lb.set(bx-ax,by-ay,bz-az);const d=_lb.length();if(d<.05)return true;_lb.multiplyScalar(1/d);RC.set(_la,_lb);RC.far=d;const hs=RC.intersectObjects(ray);for(const h of hs)if(!h.object.userData.glass)return false;return true}
function aiInit(){navBuild();const P_=AI.poi;PATHS.forEach(p=>p.forEach(q=>P_.push([q[0],q[1]])));HS.filter((r,i)=>i!==8).forEach(r=>{const cx=(r[0]+r[2])/2,cz=(r[1]+r[3])/2;[[r[0]-3,cz],[r[2]+3,cz],[cx,r[1]-3],[cx,r[3]+3]].forEach(q=>P_.push(q))});
[[-110,-110],[110,-110],[110,110],[-110,110],[0,-130],[0,130],[-130,0],[130,0],[-70,-70],[70,70],[-70,70],[70,-70],[50,-30],[-52,10],[20,-48],[-30,50],[-8,14],[30,34],[48,48],[22,60],[-60,-55],[60,60],[-62,58],[62,-58],[0,-60],[-35,-5],[38,12]].forEach(q=>P_.push(q));AI.poi=P_.filter(q=>nSnap(q[0],q[1])>=0&&!(Math.abs(q[0])<11&&q[1]>14))}
function aiSpawnOk(x,z){try{return nFree(x,z)&&Math.hypot(x-P.x,z-P.z)>38}catch(e){return true}}
function aiReset(b,ty){b.ty=ty;b.st='pat';b.path=null;b.pi=0;b.spK=1;b.lk={x:0,z:0};b.seenT=99;b.alert=0;b.see=false;b.seeT=rnd(0,.3);b.decT=rnd(0,1);b.react=0;b.mag=[12,24,4,70][ty];b.relT=0;b.shots=0;b.burst=0;b.nadeCd=rnd(6,14);b.stun=0;b.blind=0;b.fleeT=0;b.cr=0;b.crA=0;b.stuck=0;b.srch=0;b.ran=0;b.thr=0;b.lvl=0;b.route=null;b.after=null;b.hold=0;b.down=0;b.onv=0;b.wp.visible=true;b.bl=null;b.dair=0;b.dv=null;b.g.rotation.z=0;b.fy=GH(b.g.position.x,b.g.position.z);b.yaw=rnd(0,6.28);b.wait=0;b.g.rotation.y=b.yaw;bhInit(b)}
function goTo(b,x,z,spK,st){if(AI.budget<=0){b.decT=.06;return false}AI.budget--;const g=b.g.position,p=navPath(g.x,g.z,x,z);if(!p){b.path=null;return false}b.path=p;b.pi=0;b.spK=spK;b.st=st;b.cr=0;b.stuck=0;return true}
function aiAlert(b,x,z,t){if(b.dead||b.blind>0)return;b.lk.x=x;b.lk.z=z;if(!b.alert||b.seenT>t){b.seenT=t;b.srch=0;if(!b.alert){b.alert=1;b.decT=Math.min(b.decT,rnd(.15,.5));b.react=rnd(.3,.7)}}}
function aiHit(b){if(b.dead)return;aiAlert(b,P.x,P.z,.4);b.seenT=Math.min(b.seenT,.4);b.decT=Math.min(b.decT,.2);const g=b.g.position;for(const o of bots)if(o!==b&&!o.dead&&Math.hypot(o.g.position.x-g.x,o.g.position.z-g.z)<20)aiAlert(o,P.x+rnd(-3,3),P.z+rnd(-3,3),1.5)}
function findCover(b,tx,tz,far){const g=b.g.position;let best=null,bs=1e9;for(let n=0;n<34;n++){const a=rnd(0,6.28),r=rnd(2.5,far||15),x=g.x+Math.cos(a)*r,z=g.z+Math.sin(a)*r;if(!nFree(x,z))continue;const dt_=Math.hypot(x-tx,z-tz);if(dt_<7)continue;
const k=nIdx(x,z),adj=NAVB[k-1]||NAVB[k+1]||NAVB[k-NGN]||NAVB[k+NGN]||NAVB[k-2]||NAVB[k+2]||NAVB[k-2*NGN]||NAVB[k+2*NGN];let sc=r+(adj?0:6)-Math.min(8,dt_*.12);if(sc>=bs)continue;
if(losClear(x,GH(x,z)+1.05,z,tx,GH(tx,tz)+1.6,tz))continue;bs=sc;best=[x,z]}return best}
function aiFlank(b,tx,tz){const g=b.g.position,a=Math.atan2(g.x-tx,g.z-tz)+(Math.random()<.5?1:-1)*rnd(1.1,1.8),r=rnd(11,17);for(let k=0;k<6;k++){const x=tx+Math.sin(a)*(r-k*1.5),z=tz+Math.cos(a)*(r-k*1.5);if(nSnap(x,z)>=0&&!(x>ZN.x0-4&&x<ZN.x1+4&&z>ZN.z0-4)){if(goTo(b,x,z,2.2,'flk')){AI.flank=b;return true}return false}}return false}
function aiVantage(b){const g=b.g.position;let best=null,bs=-1e9;for(let n=0;n<26;n++){const a=rnd(0,6.28),r=rnd(5,20),x=g.x+Math.cos(a)*r,z=g.z+Math.sin(a)*r;if(!nFree(x,z))continue;const d=Math.hypot(x-b.lk.x,z-b.lk.z);if(d<28||d>75)continue;const sc=GH(x,z)*2-r*.25+rnd(0,1);if(sc<bs)continue;if(!losClear(x,GH(x,z)+1.5,z,b.lk.x,GH(b.lk.x,b.lk.z)+1.5,b.lk.z))continue;bs=sc;best=[x,z]}return best}
function botThrow(b,type){const g=b.g.position,dx=b.lk.x-g.x,dz=b.lk.z-g.z,d=Math.hypot(dx,dz),th=.72,dy=GH(b.lk.x,b.lk.z)-(g.y+1.6),den=2*Math.cos(th)**2*(d*Math.tan(th)-dy);if(den<=0||d<6)return false;const v=Math.sqrt(NG_*d*d/den);if(v>22)return false;
b.thr=.55;b.nadeCd=rnd(14,24);AI.nadeCd=rnd(5,9);b.path=null;b.decT=.9;const c=Math.cos(th)*v;_la.set(g.x,g.y+1.65*b.T.sc,g.z);_lb.set(dx/d*c+rnd(-.5,.5),Math.sin(th)*v,dz/d*c+rnd(-.5,.5));setTimeout(()=>{if(!b.dead&&b.stun<=0)throwNade(type,new THREE.Vector3(b.g.position.x,b.g.position.y+1.65*b.T.sc,b.g.position.z),_lb.clone().set(dx/d*c+rnd(-.5,.5),Math.sin(th)*v,dz/d*c+rnd(-.5,.5)),b)},330);return true}
const PRG=[[9,20],[14,30],[38,70],[7,16]];
function aiThink(b){const g=b.g.position,ty=b.ty,pd=Math.hypot(P.x-g.x,P.z-g.z);b.decT=rnd(.55,1.05);if(b.route)return;if(b.lvl>0){aiHold(b,pd);return}if(b.st==='ups'){if(b.path&&b.after)return;if(b.after){b.after.h.occ=Math.max(0,(b.after.h.occ||1)-1);b.after.post.occ=0}b.after=null;b.st='pat'}
if(b.fleeT>0||b.stun>0||b.blind>0)return;
if(b.see){if(ty===3){if(pd>8){if(!b.path||b.st!=='adv'||Math.hypot(b.path[b.path.length-1][0]-P.x,b.path[b.path.length-1][1]-P.z)>5)goTo(b,P.x,P.z,1.35,'adv')}else b.path=null;return}
if(ty===2){if(pd<20){const c=findCover(b,P.x,P.z,22);if(c)goTo(b,c[0],c[1],2.4,'cov')}else if(b.shots>=3){b.shots=0;if(Math.random()<.55&&aiPost(b,2))return;const v=aiVantage(b);if(v)goTo(b,v[0],v[1],2,'pos')}else if(b.st!=='pos'||!b.path){b.path=null;b.cr=1}return}
if(b.relT>0||(b.hp<b.T.hp*.45&&!b.ran)){if(b.st!=='cov'){const c=findCover(b,P.x,P.z);if(c&&goTo(b,c[0],c[1],2.3,'cov')&&b.relT<=0)b.ran=1}return}
const lo=PRG[ty][0],hi=PRG[ty][1];if(b.st==='flk'&&b.path){if(pd<hi){b.st='atk';b.path=null}else return}
if(b.st==='cov'&&b.path)return;
if(pd>hi){if((!AI.flank||AI.flank.dead||AI.flank.st!=='flk')&&Math.random()<.4&&aiFlank(b,P.x,P.z))return;goTo(b,P.x,P.z,1.7,'adv')}
else{const a=Math.atan2(g.x-P.x,g.z-P.z)+(Math.random()<.5?1:-1)*(pd<lo?.5:1.45),r=rnd(2.5,4.5),x=g.x+Math.sin(a)*r,z=g.z+Math.cos(a)*r;if(Math.random()<(pd<lo?.9:.6)&&nFree(x,z)&&navLine(g.x,g.z,x,z)){b.path=[[x,z]];b.pi=0;b.spK=1.5;b.st='atk'}else{b.path=null;b.st='atk';b.cr=Math.random()<.45?1:0}}
return}
if(b.alert&&b.seenT<16){if(ty===2){b.cr=1;if(b.seenT>7&&b.st!=='pos'){if(Math.random()<.6&&aiPost(b,2))return;const v=aiVantage(b);if(v)goTo(b,v[0],v[1],2,'pos');else b.st='pos'}return}
if(b.relT>0)return;const dl=Math.hypot(b.lk.x-g.x,b.lk.z-g.z);
if(ty<2&&b.st==='hnt'&&dl>16&&Math.random()<.18&&aiPost(b,ty))return;if(ty<2&&b.seenT>2.2&&b.seenT<10&&b.nadeCd<=0&&AI.nadeCd<=0&&dl>8&&dl<26&&inRoom(g.x,g.z)<0&&!inZ(b.lk.x,b.lk.z)&&botThrow(b,Math.random()<.72?0:(Math.random()<.5?1:2)))return;
if(b.st==='hnt'||b.st==='flk'){if(!b.path){if(b.srch<3&&b.seenT<13){b.srch++;const a=rnd(0,6.28),r=rnd(4,11);goTo(b,b.lk.x+Math.cos(a)*r,b.lk.z+Math.sin(a)*r,1.5,'hnt')}else b.alert=0}}
else if(ty===1&&dl>16&&Math.random()<.35&&aiFlank(b,b.lk.x,b.lk.z)){}else goTo(b,b.lk.x,b.lk.z,ty===3?1.3:2.1,'hnt');return}
b.alert=0;b.cr=0;if(b.st!=='pat'||!b.path){if(b.wait>0&&b.st==='pat'){b.wait-=b.decT;return}let q=null,bd=1e9;for(let k=0;k<4;k++){const c=AI.poi[Math.random()*AI.poi.length|0],d=Math.abs(Math.hypot(c[0]-g.x,c[1]-g.z)-30);if(d<bd){bd=d;q=c}}if(q&&goTo(b,q[0]+rnd(-2,2),q[1]+rnd(-2,2),1,'pat'))b.wait=rnd(1,5)}}

// ---- v6 : étages et toits ----
function aiPost(b,ty){if(!UPH.length||b.lvl||b.route)return false;const g=b.g.position;let bh=null,bs=1e9;
for(const h of UPH){const d=Math.hypot(h.cx-g.x,h.cz-g.z);if(d>48||(h.occ||0)>=2)continue;const dl=Math.hypot(h.cx-b.lk.x,h.cz-b.lk.z);if(dl<9||dl>75)continue;const sc=d+rnd(0,14);if(sc<bs){bs=sc;bh=h}}
if(!bh)return false;const roof=ty===2?Math.random()<.65:Math.random()<.2,list=roof?bh.roofPosts:bh.posts;let bp=null,bq=-9;
for(const p of list){const dx=b.lk.x-p[0],dz=b.lk.z-p[1],d=Math.hypot(dx,dz)||1,q=(dx*Math.sin(p[2])+dz*Math.cos(p[2]))/d+rnd(0,.35);if(q>bq&&!(p.occ>0)){bq=q;bp=p}}
if(!bp||bq<.1)return false;const route=roof?[bh.iA,bh.iB,bh.rA,bh.rB,bh.rL].concat(bp[3]?[bh.rM]:[],[bp]):[bh.iA,bh.iB,bh.iL,bh.iM].concat(bp[3]?[bh.iN]:[],[bp]),F=bh.iF;
if(!goTo(b,F[0],F[1],2.2,'ups'))return false;b.after={route:route.map(q=>[q[0],q[1]]),post:bp,lvl:roof?2:1,h:bh,F:[F[0],F[1]]};bh.occ=(bh.occ||0)+1;bp.occ=1;return true}
function aiHold(b,pd){b.decT=rnd(.6,1.1);b.hold+=b.decT;b.cr=b.see?0:1;const idle=!b.alert||b.seenT>11;
if(b.hp<b.T.hp*.4||(idle&&b.hold>14)||b.hold>70){b.route=b.upr.slice(0,-1).reverse().concat([b.fdn]);b.ri=0;b.down=1;b.cr=0;b.st='clb'}}
function aiRoute(b,dt){const g=b.g.position,w=b.route[b.ri],dx=w[0]-g.x,dz=w[1]-g.z,d=Math.hypot(dx,dz),sp=b.T.sp*1.45*dt*(b.stun>0?.4:1)*(b.hm||1);
if(d<=sp+.04){g.x=w[0];g.z=w[1];if(++b.ri>=b.route.length){b.route=null;if(b.down){b.lvl=0;b.down=0;b.st='pat';b.alert=0;b.path=null;b.decT=.5;const h=b.hh;if(h)h.occ=Math.max(0,(h.occ||1)-1);if(b.rp)b.rp.occ=0;b.hh=null;b.rp=null}else{b.st='hold';b.hold=0;b.yaw=b.rp[2];b.cr=1;b.decT=.3}}}else{g.x+=dx/d*sp;g.z+=dz/d*sp}}
function aiMove(b,dt){const g=b.g.position;if(!b.path)return;let wp=b.path[b.pi],dx=wp[0]-g.x,dz=wp[1]-g.z,d=Math.hypot(dx,dz);
if(d<.35){if(++b.pi>=b.path.length){b.path=null;if(b.st==='ups'&&b.after){b.route=b.after.route;b.upr=b.after.route;b.ri=0;b.lvl=b.after.lvl;b.rp=b.after.post;b.hh=b.after.h;b.fdn=b.after.F;b.after=null;b.st='clb';return}if(b.st==='cov'||b.st==='pos')b.cr=1;if(b.st==='pat')b.decT=Math.max(b.decT,b.wait);return}wp=b.path[b.pi];dx=wp[0]-g.x;dz=wp[1]-g.z;d=Math.hypot(dx,dz)||1}
for(const o of doors){if(o.dead||o.open>.85)continue;const q=Math.hypot(o.x-g.x,o.z-g.z);if(q<1.5){if(!o.tgt){if(o.max>200)continue;o.tgt=1;if(Math.hypot(o.x-P.x,o.z-P.z)<25)sndAt(o.x,1.2,o.z,170,.22,.12,'sawtooth',{ref:3})}if(q<1.15&&o.open<.6)return}}
const sp=b.T.sp*b.spK*(b.hm||1)*(wDep(g.x,g.z)>.15?.6:1)*dt,nx=g.x+dx/d*sp,nz=g.z+dz/d*sp;
if(nFree(nx,nz)){g.x=nx;g.z=nz;b.stuck=0}else if(nFree(nx,g.z)){g.x=nx;b.stuck+=dt*.5}else if(nFree(g.x,nz)){g.z=nz;b.stuck+=dt*.5}else b.stuck+=dt;if(b.stuck>.5){b.path=null;b.stuck=0;b.decT=0}}
function botDie(b){if(b.dead)return;b.dead=b.T===BT[3]?6:3;botDeath(b,false)}
// ombre : à l'ombre (abri du soleil ou pièce non éclairée) les bots te voient moins loin
const SHD={t:0,k:1,v:1};
function shadeK(dt){SHD.t-=dt;if(SHD.t<=0){SHD.t=.35;let sh=false;if(P.gy!==undefined){const ri=inRoom(P.x,P.z);if(ri>=0&&P.gy+1<roofTop(P.x,P.z))sh=!(typeof ILON!=='undefined'&&ILON);else if(SUND.y>.12){_la.set(P.x,P.gy+P.bh,P.z);RC.set(_la,SUND);RC.far=60;for(const h of RC.intersectObjects(ray))if(!h.object.userData.glass){sh=true;break}}}SHD.k=sh?.62:1}SHD.v+=(SHD.k-SHD.v)*Math.min(1,dt*3);return SHD.v}
function aiUpdate(dt,inz){dwUpdate(dt);AI.budget=2;sqTick(dt);AI.heat=Math.max(0,(AI.heat||0)-dt*5);AI.nadeCd-=dt;const vis=(TOD.t>20.2||TOD.t<5.2?(flOn?.8:.45):1)*(.3+.7*Math.min(1,wcur[3]*1.4))*shadeK(dt),sprint=K.ShiftLeft&&(K.KeyW||K.KeyA||K.KeyS||K.KeyD),tgt=!inz&&!ac.on&&P.hp>0;
if(NZ.n!==AI.nz){AI.nz=NZ.n;for(const b of bots){if(b.dead)continue;const d=Math.hypot(b.g.position.x-NZ.x,b.g.position.z-NZ.z);if(d<NZ.r&&!b.see){const e=1+d*.07;aiAlert(b,NZ.x+rnd(-e,e),NZ.z+rnd(-e,e),1.2)}}}
if(P.kills!==AI.kills){AI.kills=P.kills;if(P.kills%3===0){const k=Math.random()*3|0;if(NADE.inv[k]<3){NADE.inv[k]++;feed('+1 grenade '+NT[k].n)}}}
for(let i=0;i<bots.length;i++){const b=bots[i];if(b.dead>0){b.dead-=dt;botDead(b,dt);if(b.dead<=0)spawn(b);continue}
const g=b.g.position,bx0=g.x,bz0=g.z,bt=b.T,px=P.x-g.x,pz=P.z-g.z,pd=Math.hypot(px,pz);
b.stun=Math.max(0,b.stun-dt);b.blind=Math.max(0,b.blind-dt);b.thr=Math.max(0,b.thr-dt);b.nadeCd-=dt;b.seenT+=dt;bhUpdate(b,dt);if(b.dead>0)continue;
// perception
b.seeT-=dt;if(b.seeT<=0){b.seeT=rnd(.18,.3);let s=false;if(tgt&&b.blind<=0&&b.stun<=0){const rg=Math.min(95,bt.rng*1.5)*vis;if(pd<rg){let da=Math.atan2(px,pz)-b.yaw;da=Math.abs(Math.atan2(Math.sin(da),Math.cos(da)));if(pd<7||da<1.75||b.alert)s=losClear(g.x,g.y+1.55*bt.sc-b.crA*.4,g.z,P.x,P.gy+P.bh,P.z)}}
if(s&&!b.see){if(!b.alert||b.seenT>3)b.react=rnd(.35,.8)*(b.ty===2?1.5:1);b.decT=Math.min(b.decT,.1);b.alert=1}b.see=s;
if(s){b.lk.x=P.x;b.lk.z=P.z;b.seenT=0;b.srch=0;for(const o of bots)if(o!==b&&!o.dead&&!o.see&&o.seenT>2&&Math.hypot(o.g.position.x-g.x,o.g.position.z-g.z)<32)aiAlert(o,P.x+rnd(-2,2),P.z+rnd(-2,2),1.5)}}
// grenades proches : fuite
if(b.fleeT>0)b.fleeT-=dt;else if(b.stun<=0&&!b.lvl&&!b.route)for(const n of NADE.list){if(n.type||n.t>2.4)continue;const d=Math.hypot(n.p.x-g.x,n.p.z-g.z);if(d<6.5&&(b.blind<=0)){const a=Math.atan2(g.x-n.p.x,g.z-n.p.z)+rnd(-.5,.5);AI.budget++;if(goTo(b,g.x+Math.sin(a)*11,g.z+Math.cos(a)*11,2.7,'fle')){b.fleeT=n.t+.3;b.decT=b.fleeT}break}}
b.decT-=dt;if(b.decT<=0)aiThink(b);
// déplacement
if((b.stun>0||b.blind>0)&&(b.lvl||b.route)){b.path=null}else if(b.stun>0||b.blind>0){b.path=null;const a=b.tm*1.3+i,sp=bt.sp*.35*dt,nx=g.x+Math.sin(a)*sp,nz=g.z+Math.cos(a*1.3)*sp;if(nFree(nx,nz)){g.x=nx;g.z=nz}}else if(b.route)aiRoute(b,dt);else if(b.thr<=0)aiMove(b,dt);
for(let k=i+1;k<bots.length;k++){const o=bots[k];if(o.dead)continue;const ox=o.g.position.x-g.x,oz=o.g.position.z-g.z,od=Math.hypot(ox,oz);if(od<.75&&od>.01){const p=(.75-od)*.5/od;if(nFree(g.x-ox*p,g.z-oz*p)){g.x-=ox*p;g.z-=oz*p}if(nFree(o.g.position.x+ox*p,o.g.position.z+oz*p)){o.g.position.x+=ox*p;o.g.position.z+=oz*p}}}
const mvx=g.x-bx0,mvz=g.z-bz0,mv=Math.hypot(mvx,mvz)>1e-4;if(mv)b.cr=0;b.crA+=(((b.cr&&!mv)||b.onv?1:0)-b.crA)*Math.min(1,dt*6);
{let tg=groundAt(g.x,g.z,b.fy,b.route?1.05:.6);if(b.lvl&&b.route&&tg<b.fy-.5&&!b.down)tg=b.fy;b.onv=GSUP&&GSUP.gl?1:0;b.fy+=(tg-b.fy)*Math.min(1,dt*14)}g.y=b.fy-b.crA*.34*bt.sc;
// orientation
let ty_=b.yaw;if(b.stun>0||b.blind>0)ty_=b.yaw+Math.sin(b.tm*2.3+i)*.9;else if(b.see||(b.alert&&b.seenT<4&&b.st!=='fle'&&b.st!=='cov'))ty_=Math.atan2(b.lk.x-g.x,b.lk.z-g.z);else if(mv)ty_=Math.atan2(mvx,mvz);else if(b.alert)ty_=Math.atan2(b.lk.x-g.x,b.lk.z-g.z);else ty_=b.yaw+Math.sin(b.tm*.5+i)*.5*dt;
let dy=ty_-b.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));b.yaw+=Math.sign(dy)*Math.min(Math.abs(dy),dt*(b.see?7:4.5));g_rot(b);
b.aimT=(b.see||(b.alert&&b.seenT<5&&b.st!=='fle'))&&b.stun<=0&&b.blind<=0&&b.thr<=0?1:0;b.pit=Math.atan2(P.gy+P.bh-(g.y+1.45*bt.sc),Math.max(2,pd));botAnim(b,dt,mv,mvx,mvz);
// poses : accroupi, lancer, aveuglé, sonné
if(b.crA>.02){const c=b.crA;b.L.hip.rotation.x=-1.35*c;b.Rg.hip.rotation.x=-.25*c;b.L.kn.rotation.x=1.55*c;b.Rg.kn.rotation.x=1.85*c;b.up.position.y-=.1*c;b.up.rotation.x+=.1*c}
if(b.thr>0){const k=Math.sin(Math.PI*(1-b.thr/.55));b.aR.p.rotation.set(-.6-2.3*k,0,-.3*k);b.aR.el.rotation.set(-1.5+1.1*k,0,0)}
if(b.blind>0){b.aL.p.rotation.set(-1.5,0,-.75);b.aL.el.rotation.set(-2.2,0,0);b.hd.rotation.x=.4;b.up.rotation.x+=.2}
else if(b.stun>0){b.up.rotation.x+=.45+Math.sin(b.tm*3)*.12;b.up.rotation.z+=Math.sin(b.tm*2.1)*.22;b.hd.rotation.x=.4}
// tir
b.cd-=dt;if(b.relT>0){b.relT-=dt;if(b.relT<=0)b.mag=[12,24,4,70][b.ty]}if(b.see)b.react-=dt;
if(b.see&&tgt&&!b.unarm&&b.react<=0&&b.cd<=0&&b.relT<=0&&b.thr<=0&&pd<bt.rng*1.15&&Math.abs(dy)<.45&&b.st!=='fle'){b.cd=rnd(bt.cd[0],bt.cd[1])*(b.burst>0?1:1);if(b.ty<2){if(--b.burst<=0){b.burst=3+(Math.random()*4|0);b.cd+=rnd(.35,.9)}}
V.set(g.x,g.y+1.6*bt.sc-b.crA*.1,g.z);W.set(px,P.gy+P.bh+.05-V.y,pz);const pdd=W.length();W.normalize();
if(!losBlock(V,W,pdd)){b.fl=.07;b.rec=1;b.mag--;b.shots++;sfxShot(g.x,g.y+1.4,g.z,b.ty,1);AI.heat=Math.min(9,(AI.heat||0)+1);const pr=.85*(AI.heat>4?.55:1)*bt.acc*(pd>25?.7:1)*(mv?.6:1)*(sprint?.75:1)*(b.crA>.5?1.15:1)/(b.aimM||1);
_lb.set(P.x,P.gy+P.eh*.68,P.z);hlBullet(V,_lb,pr,bt.dmg*(.8+Math.random()*.4),b);if(b.mag<=0){b.relT=b.ty===3?3.6:b.ty===2?2.8:2.1;b.decT=Math.min(b.decT,.1)}}else{b.see=false;b.seeT=.1}}}}
function g_rot(b){b.g.rotation.y=b.yaw}
aiInit();
