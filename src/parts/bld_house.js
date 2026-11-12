// ---------- moteur de bâtiment : 2 pièces, cloison + porte intérieure, vitres cassables ----------
const FDU=[.2,-1.2,1.9,-2,0,-1.5,0,-1.2,3.2,4.5];
function house(cxF,czF,W0,D0,side,st,lay,bk,o){o=o||{};const bun=!!o.bun,Dr=o.Dr||3.2,H=bun?3:2.8,t=bun?.42:.3,
fz=side==='S'?1:side==='N'?-1:0,fx=side==='E'?1:side==='W'?-1:0,ux=fz,uz=-fx,dfx=fx!==0,
W=W0+(fx?Dr:0),D=D0+(fz?Dr:0),cx=cxF-fx*Dr/2,cz=czF-fz*Dr/2,x0=cx-W/2,x1=cx+W/2,z0=cz-D/2,z1=cz+D/2,
wm=pm(bun?T_conc:T_plas,st.w,{roughness:.95}),sm=pm(T_wood,st.s,{roughness:.7}),
Df=dfx?W0:D0,Lt=dfx?D:W,hf=Df/2-t/2,hu=Lt/2-t/2,hb=Dr/2-t/2,OV=Dr/2,fd=dfx?fx:fz;
const grp=(ax,f,c,out)=>{const g=new THREE.Group();g.position.set(ax==='x'?c:f,YO,ax==='x'?f:c);g.rotation.y=ax==='x'?(out>0?0:Math.PI):(out>0?Math.PI/2:-Math.PI/2);S.add(g);return g};
const winD=(ax,f,o,out)=>{const g=grp(ax,f,o.c,out),w=o.w,h=o.y1-o.y0,yc=(o.y0+o.y1)/2,fm=bun?darkM:frameM;
gb(g,w,.06,t+.04,0,o.y1-.03,0,fm);gb(g,w,.06,t+.04,0,o.y0+.03,0,fm);gb(g,.06,h,t+.04,-w/2+.03,yc,0,fm);gb(g,.06,h,t+.04,w/2-.03,yc,0,fm);
if(o.slit){for(let k=-3;k<=3;k++)gb(g,.03,h,.05,k*w/7,yc,0,darkM);gb(g,w+.3,.12,.3,0,o.y0-.06,t/2+.1,concM2)}
else{gb(g,.04,h,.05,0,yc,0,fm);gb(g,w,.04,.05,0,yc+.15,0,fm);
const gp=new THREE.PlaneGeometry(w-.1,h-.1),gl=new THREE.Mesh(gp,glassM);gl.position.set(0,yc,0);gl.userData.glass={hp:2,w:w-.1,h:h-.1};gl.userData.home=g;g.add(gl);solids.push(gl);GLASS.push(gl);{const sy=YO+o.y0,hw=w/2-.05,dp=t/2+.3,vs=ax==='x'?surfRect(o.c-hw,o.c+hw,f-dp,f+dp,sy,{gl}):surfRect(f-dp,f+dp,o.c-hw,o.c+hw,sy,{gl});gl.userData.glass.vs=vs;gl.userData.glass.nv={ax,c:o.c,f,w,y:sy}}
gb(g,w+.24,.05,.2,0,o.y0-.025,t/2+.07,stoneM,1.2);
[-1,1].forEach(s=>{gb(g,.55,h+.08,.04,s*(w/2+.3),yc,t/2+.03,sm,1.1);gb(g,.5,.03,.05,s*(w/2+.3),yc+.35,t/2+.035,darkM);gb(g,.5,.03,.05,s*(w/2+.3),yc-.35,t/2+.035,darkM)})}};
const doorD=(ax,f,c,out)=>{const g=grp(ax,f,c,out);gb(g,.1,2.36,t+.06,-.65,1.18,0,beamM,1.2);gb(g,.1,2.36,t+.06,.65,1.18,0,beamM,1.2);gb(g,1.4,.1,t+.06,0,2.37,0,beamM,1.2);
gb(g,1.7,.12,.75,0,.06,t/2+.36,stoneM,1.2);
const cn=gb(g,1.9,.06,.9,0,2.72,t/2+.38,tileM,1);cn.rotation.x=.32;[-.8,.8].forEach(s=>{const b=gb(g,.06,.06,.75,s,2.5,t/2+.3,beamM);b.rotation.x=-.5});
gb(g,.1,.16,.1,.95,2.0,t/2+.06,darkM);gb(g,.07,.1,.07,.95,1.98,t/2+.06,lampM)};
const doorB=(ax,f,c,out)=>{const g=grp(ax,f,c,out);gb(g,.24,2.55,t+.14,-.74,1.27,0,concM2);gb(g,.24,2.55,t+.14,.74,1.27,0,concM2);gb(g,1.72,.34,t+.14,0,2.52,0,concM2);
gb(g,2.5,.18,1.0,0,2.86,t/2+.5,concM2);gb(g,.1,.16,.1,1.05,2.0,t/2+.06,darkM);gb(g,.07,.1,.07,1.05,1.98,t/2+.06,lampM);
for(let k=0;k<5;k++){const b=gb(g,.14,.4,.01,-.6+k*.3,.2,t/2+.02,k%2?darkM:std(0xd8b020,{roughness:.6}));b.rotation.z=.6}};
const doorI=(ax,f,c,out)=>{const g=grp(ax,f,c,out),m=bun?darkM:beamM;gb(g,.14,2.34,t+.05,-.66,1.17,0,m,1.2);gb(g,.14,2.34,t+.05,.66,1.17,0,m,1.2);gb(g,1.5,.1,t+.05,0,2.33,0,m,1.2)};
const run=(ax,f,a,b,out,ops,ib)=>{ops.sort((p,q)=>p.c-q.c);let cur=a;
const piece=(u0,u1,y0,y1,col)=>{if(u1-u0<.01||y1-y0<.01)return;const w=u1-u0,h=y1-y0,m=(u0+u1)/2,y=(y0+y1)/2;
ax==='x'?blk(w,h,t,m,y,f,wm,{T:3,s:1,c:col}):blk(t,h,w,f,y,m,wm,{T:3,s:1,c:col});
if(y0===0&&!ib&&!bun&&!YO)ax==='x'?blk(w,.42,t+.1,m,.21,f,stoneM,{T:1.2}):blk(t+.1,.42,w,f,.21,m,stoneM,{T:1.2})};
ops.forEach(q=>{const l=q.c-q.w/2,r=q.c+q.w/2;piece(cur,l,0,H,1);if(q.door){piece(l,r,2.3,H,0);q.int?doorI(ax,f,q.c,out):(bun?doorB:doorD)(ax,f,q.c,out)}else{piece(l,r,0,q.y0,1);piece(l,r,q.y1,H,0);winD(ax,f,q,out)}cur=r});piece(cur,b,0,H,1)};
const lat=dfx?cz:cx,dcF=(dfx?cx:cz)+fd*Dr/2,dcB=(dfx?cx:cz)-fd*Df/2,opp={N:'S',S:'N',E:'W',W:'E'}[side];
const wn=q=>bun?{c:q,w:1.5,y0:1.55,y1:1.95,slit:1}:{c:q,w:1.1,y0:.95,y1:2.05};
const ops=s=>s===side?[{c:lat,w:1.2,door:1},wn(lat-hu*.62),wn(lat+hu*.62)]:s===opp?[wn(lat)]:[wn(dcF),wn(dcB)];
run('x',z0,x0-t/2,x1+t/2,-1,ops('N'));run('x',z1,x0-t/2,x1+t/2,1,ops('S'));run('z',x0,z0+t/2,z1-t/2,-1,ops('W'));run('z',x1,z0+t/2,z1-t/2,1,ops('E'));
// porte d'entrée
mkDoor(dfx?(side==='W'?x0:x1):cx,dfx?cz:(side==='N'?z0:z1),dfx?'z':'x',{N:-1,S:1,E:-1,W:1}[side]);if(bun)steelify(doors[doors.length-1]);
// cloison + porte intérieure
{const pc=(dfx?cx:cz)+fd*(Dr-Df)/2,du=o.du!==undefined?o.du:FDU[o.fl!==undefined?o.fl:lay],pu=lat+du*(dfx?uz:ux);
run(dfx?'z':'x',pc,lat-Lt/2+t/2,lat+Lt/2-t/2,1,[{c:pu,w:1.2,door:1,int:1}],1);
dfx?mkDoor(pc,pu,'z',o.sw||1):mkDoor(pu,pc,'x',o.sw||1);if(bun)steelify(doors[doors.length-1])}
// sols
const FL=bun?slabM:(lay===1||lay===3)?matTile:floorM,BFL=bun?slabM:[matTile,floorM,floorM,floorM][bk];
{const T_=FL===floorM?1.2:2,g=new THREE.PlaneGeometry(W-t,D-t);scaleUV(g,(W-t)/T_,(D-t)/T_);const m=new THREE.Mesh(g,FL);m.rotation.x=-Math.PI/2;m.position.set(cx,.015,cz);m.receiveShadow=true;S.add(m)}
const fcx=cx+(dfx?fx:0)*Dr/2,fcz=cz+(dfx?0:fz)*Dr/2,bcx=cx-(dfx?fx:0)*Df/2,bcz=cz-(dfx?0:fz)*Df/2;
{const bw=dfx?Dr-t:Lt-t,bd=dfx?Lt-t:Dr-t,T_=BFL===floorM?1.2:2,g=new THREE.PlaneGeometry(bw,bd);scaleUV(g,bw/T_,bd/T_);const m=new THREE.Mesh(g,BFL);m.rotation.x=-Math.PI/2;m.position.set(bcx,.022,bcz);m.receiveShadow=true;S.add(m)}
ROOMS.push({x:fcx,z:fcz,hx:(dfx?Df:Lt)/2,hz:(dfx?Lt:Df)/2,bun},{x:bcx,z:bcz,hx:(dfx?Dr:Lt)/2,hz:(dfx?Lt:Dr)/2,bun});
if(!bun&&!o.up){blk(W-t,.1,D-t,cx,H+.05,cz,furnM,{fit:1.2,s:1});for(let k=-1;k<2;k++)blk(.12,.14,D-t,cx+k*W*.27,H-.07,cz,beamM,{fit:1.2})}
// ---- v6 : étage, escalier intérieur, toit plat accessible (o.up) ----
const FT=H+.1,UDU=o.du!==undefined?o.du:FDU[o.fl!==undefined?o.fl:lay],si=UDU>0?-1:1,ci=-si,vB=-Df/2-Dr,vF=Df/2,vT=-Df/2+.2,RT=FT+H+.28;
const L_=(u,v)=>[cx+u*ux+(v+OV)*fx,cz+u*uz+(v+OV)*fz],rW=(u0,u1,v0,v1)=>{const a=L_(u0,v0),b=L_(u1,v1);return[Math.min(a[0],b[0]),Math.max(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[1],b[1])]};
const yawL=(du_,dv_)=>Math.atan2(du_*ux+dv_*fx,du_*uz+dv_*fz);
const blkR=(r,y0,y1,m,q)=>{q=q||{};const w=Math.max(.04,r[1]-r[0]),d=Math.max(.04,r[3]-r[2]),e=new THREE.Mesh(new THREE.BoxGeometry(w,y1-y0,d),m);e.position.set((r[0]+r[1])/2,(y0+y1)/2,(r[2]+r[3])/2);if(q.T)wuv(e.geometry,e.position.x,e.position.y,e.position.z,q.T,q.T);e.castShadow=!q.ns;e.receiveShadow=true;S.add(e);if(q.s)solids.push(e);if(q.c)boxes.push({x0:r[0],x1:r[1],z0:r[2],z1:r[3],y0,y1});return e};
// toit
if(bun){const cm=concM2,py=H+.32+.25;blk(W+.5,.32,D+.5,cx,H+.16,cz,cm,{T:3,s:1});
blk(W+.5,.5,.3,cx,py,z0-.1,cm,{T:3,s:1});blk(W+.5,.5,.3,cx,py,z1+.1,cm,{T:3,s:1});blk(.3,.5,D-.1,x0-.1,py,cz,cm,{T:3,s:1});blk(.3,.5,D-.1,x1+.1,py,cz,cm,{T:3,s:1});
blk(.8,.5,.8,cx+W*.2,H+.57,cz-D*.15,darkM,{s:1});blk(.8,.06,.8,cx+W*.2,H+.85,cz-D*.15,steelM);
const an=new THREE.Mesh(new THREE.CylinderGeometry(.025,.035,3.6,6),darkM);an.position.set(cx-W*.3,H+2.1,cz+D*.2);an.castShadow=true;S.add(an);
const dsh=new THREE.Mesh(new THREE.SphereGeometry(.28,10,6,0,6.283,0,1.4),steelM);dsh.position.set(cx-W*.3,H+.5,cz+D*.2);dsh.castShadow=true;S.add(dsh);
}
else if(o.up){const ha=si>0?hu-1.1:-hu,hb=si>0?hu:-hu+1.1,U0=-Lt/2-t/2,U1=Lt/2+t/2,slab=(u0,u1,v0,v1)=>{if(u1-u0<.01||v1-v0<.01)return;const r=rW(u0,u1,v0,v1);blkR([r[0]+.04,r[1]-.04,r[2]+.04,r[3]-.04],FT-.3,FT,floorM,{T:1.2,s:1});surfRect(r[0],r[1],r[2],r[3],FT)};
slab(U0,U1,-.2,vF+t/2);slab(U0,U1,vB-t/2,vT);if(si>0){slab(U0,ha,vT,-.2);slab(hu,U1,vT,-.2)}else{slab(hb,U1,vT,-.2);slab(U0,-hu,vT,-.2)}
const uc=si*(hu-.55),sa=L_(uc,-.2),sb=L_(uc,vT);const sr=stairs(sa[0],sa[1],sb[0],sb[1],1,0,FT,furnM,{});
// garde-corps du puits d'escalier
{const ui=si>0?ha:hb,rail=(r)=>{blkR(r,FT+.92,FT+.98,steelM,{ns:1});boxes.push({x0:r[0]-.03,x1:r[1]+.03,z0:r[2]-.03,z1:r[3]+.03,y0:FT,y1:FT+1});};
rail(rW(ui-.02,ui+.02,vT+.8,-.2));rail(rW(ha,hb,-.22,-.18));
[[ui,vT+.8],[ui,-.2],[si>0?hb:ha,-.2],[ui,(vT+.8-.2)/2]].forEach(q=>{const r=rW(q[0]-.025,q[0]+.025,q[1]-.025,q[1]+.025);blkR(r,FT,FT+.95,steelM,{ns:1})})}
// étage : murs, fenêtres
YO=FT;const opsU=q=>q===side?[wn(lat-hu*.62),wn(lat+hu*.62)]:ops(q);
run('x',z0,x0-t/2,x1+t/2,-1,opsU('N'));run('x',z1,x0-t/2,x1+t/2,1,opsU('S'));run('z',x0,z0+t/2,z1-t/2,-1,opsU('W'));run('z',x1,z0+t/2,z1-t/2,1,opsU('E'));YO=0;
// toit plat + acrotère
{const se=-si,vcs=vB+2.2,ua=si*(hu-1.3),ub=ua-si*3.6,uhs=ua-si*1.23,um0=Math.min(uhs,ub),um1=Math.max(uhs,ub),hw=.7,PU0=U0-.2,PU1=U1+.2,PV0_=vB-t/2-.2,PV1_=vF+t/2+.2;
const rs_=(u0,u1,v0,v1)=>{const r=rW(u0,u1,v0,v1);blkR(r,RT-.28,RT,concM2,{T:3,s:1});surfRect(r[0],r[1],r[2],r[3],RT)};
rs_(PU0,um0,PV0_,PV1_);rs_(um1,PU1,PV0_,PV1_);rs_(um0,um1,PV0_,vcs-hw);rs_(um0,um1,vcs+hw,PV1_);
// volée vers le toit (à l'intérieur) + garde-corps de la trappe
const A_=L_(ua,vcs),B_=L_(ub,vcs);stairs(A_[0],A_[1],B_[0],B_[1],1,FT,RT,furnM,{});
[vcs-hw,vcs+hw].forEach(v=>{const q=rW(um0,um1,v-.03,v+.03);blkR(q,RT,RT+.95,steelM,{c:1,ns:1})});{const q=rW(uhs-.03,uhs+.03,vcs-hw,vcs+hw);blkR(q,RT,RT+.95,steelM,{c:1,ns:1})}
const vt2=vcs;
const pr=(u0,u1,v0,v1,y=RT,h=.78)=>{const q=rW(u0,u1,v0,v1);blkR(q,y,y+h,concM2,{T:3,s:1,c:1})},pt=.22,PU=U1+.2,PV0=vB-t/2-.2,PV1=vF+t/2+.2;
pr(-PU,PU,PV0,PV0+pt);pr(-PU,PU,PV1-pt,PV1);
pr(-PU,-PU+pt,PV0,PV1);pr(PU-pt,PU,PV0,PV1);
// mobilier de toit (couvert)
const rc=(u,v,du_,dv_,hh,m)=>{const q=rW(u-du_/2,u+du_/2,v-dv_/2,v+dv_/2);blkR(q,RT,RT+hh,m,{T:1.2,s:1,c:1})};
rc(-se*1.3,-2.3,1.3,.8,.9,steelM);rc(-se*1.5,.6,.9,.9,.6,slabM);rc(si*.9,-5.9,.7,.7,.5,surf(0x6a5a3c));
{const tk=L_(si*2.2,-4.0);const cy=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,1.1,14),steelM);cy.position.set(tk[0],RT+.55,tk[1]);cy.castShadow=true;S.add(cy);boxes.push({x0:tk[0]-.55,x1:tk[0]+.55,z0:tk[1]-.55,z1:tk[1]+.55,y0:RT,y1:RT+1.1});solids.push(cy)}
// données pour l'IA
const wp=(u,v)=>L_(u,v),pv=[],pr_=[];[[-.62*hu,vF-.5,0,1],[.62*hu,vF-.5,0,1],[0,vB+.5,0,-1],[hu-.5,0,1,0],[-hu+.5,0,-1,0],[hu-.5,-Df/2-Dr/2,1,0],[-hu+.5,-Df/2-Dr/2,-1,0]].forEach(q=>{if(si>0&&q[2]>0&&q[1]<0&&q[1]>vT-.5)return;if(si<0&&q[2]<0&&q[1]<0&&q[1]>vT-.5)return;const w_=wp(q[0],q[1]);pv.push([w_[0],w_[1],yawL(q[2],q[3]),q[1]>vT?1:0])});
[[-hu+.6,vF-.3,0,1],[hu-.6,vF-.3,0,1],[-hu+.6,vB+.5,0,-1],[hu-.6,vB+.5,0,-1],[hu-.2,-1.5,1,0],[-hu+.2,-1.5,-1,0],[hu-.2,1,1,0],[-hu+.2,1,-1,0]].forEach(q=>{const w_=wp(q[0],q[1]);pr_.push([w_[0],w_[1],yawL(q[2],q[3]),q[0]*si>0?1:0])});
const iF=L_(uc,.7),iA=sa,iB=sb,iL=L_(uc-si*1.0,vT+.3),rF=L_(ua,vcs),rA=L_(ua,vcs),rB=L_(ub,vcs),rL=L_(-si*2.6,vcs),rM=L_(-si*2.5,vF-1.2);
UPH.push({cx,cz,FT,RT,iF,iA,iB,iL:[iL[0],iL[1]],iM:L_(-si*.8,vT+.3),iN:L_(-si*.8,.3),posts:pv,rF,rA,rB,rL,rM,roofPosts:pr_,rect:[x0,x1,z0,z1],hole:rW(ha,hb,vT,-.2),floor:rW(U0,U1,vB-t/2,vF+t/2)})}
}
else{const RW=dfx?W:D,RD=dfx?D:W,rot=!dfx;
const oh=.5,og=.4,tn=.62,an=Math.atan(tn),b=RD/2+oh,yr=H+RD/2*tn,ye=H-oh*tn,sl=Math.hypot(b,yr-ye),rg=new THREE.Group();rg.position.set(cx,0,cz);rg.rotation.y=rot?Math.PI/2:0;S.add(rg);
[0,Math.PI].forEach(ry=>{const p=new THREE.Group();p.rotation.y=ry;rg.add(p);const g=new THREE.BoxGeometry(RW+2*og,.1,sl);fitUV(g,RW+2*og,.1,sl,1);const m=new THREE.Mesh(g,[beamM,beamM,tileM,beamM,beamM,beamM]);m.rotation.x=an;m.position.set(0,(yr+ye)/2+.05*Math.cos(an),b/2+.05*Math.sin(an));m.castShadow=m.receiveShadow=true;p.add(m)});
{const r=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,RW+2*og,8),std(0xa8553a,{roughness:.85}));r.rotation.z=Math.PI/2;r.position.y=yr+.09;r.castShadow=true;rg.add(r)}
[-1,1].forEach(s=>{const X=s*(RW/2),g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([X,H,-RD/2-t/2,X,H,RD/2+t/2,X,yr+t/2*tn,0],3));const u=(RD/2+t/2)/3;g.setAttribute('uv',new THREE.Float32BufferAttribute([-u,.4,u,.4,0,.4+(yr-H)/3],2));g.computeVertexNormals();const m=new THREE.Mesh(g,Object.assign(wm.clone(),{side:THREE.DoubleSide}));m.castShadow=m.receiveShadow=true;rg.add(m);
const v=new THREE.Mesh(new THREE.BoxGeometry(.06,.4,.4),darkM);v.position.set(X+s*.01,H+.75,0);rg.add(v)});
{const lx=RW*.27,lz=-RD*.18,hx=rot?cx+lz:cx+lx,hz=rot?cz-lx:cz+lz,hh=yr+.55-H;blk(.6,hh,.6,hx,H+hh/2,hz,stoneM,{T:1.2});blk(.76,.08,.76,hx,yr+.59,hz,darkM)}}
// mobilier (v>0 vers la porte d'entrée). F : pièce avant ; F2 : pièce arrière
const F=(u,v,y,du,h,dv,m,q)=>{v+=OV;return blk(dfx?dv:du,h,dfx?du:dv,cx+u*ux+v*fx,y,cz+u*uz+v*fz,m,q)};
const BO=(Df+Dr)/2,F2=(u,v,y,du,h,dv,m,q)=>F(u,v-BO,y,du,h,dv,m,q);
const C_=(c,q)=>std(c,Object.assign({roughness:.8},q));
const colF=(u,v,du,dv)=>{v+=OV;const X=cx+u*ux+v*fx,Z=cz+u*uz+v*fz,w=dfx?dv:du,d=dfx?du:dv;boxes.push({x0:X-w/2,x1:X+w/2,z0:Z-d/2,z1:Z+d/2,y0:YO,y1:YO+2.4})};
const col2=(u,v,du,dv)=>colF(u,v-BO,du,dv);
const cylF=(u,v,y,r,h,m,c)=>{v+=OV;const X=cx+u*ux+v*fx,Z=cz+u*uz+v*fz,e=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,16),m);e.position.set(X,y,Z);e.castShadow=e.receiveShadow=true;S.add(e);if(c){solids.push(e);boxes.push({x0:X-r,x1:X+r,z0:Z-r,z1:Z+r,y0:YO,y1:YO+2.4})}return e};
const table=(tu,tv,du,dv)=>{F(tu,tv,.74,du,.05,dv,furnM,{c:1,s:1,fit:1.2});[-1,1].forEach(a=>[-1,1].forEach(c=>F(tu+a*(du/2-.07),tv+c*(dv/2-.07),.36,.06,.72,.06,furnM)))};
const chair=(u,v,s,au)=>{F(u,v,.45,.42,.04,.42,furnM,{fit:1.2});au?F(u+s*.19,v,.72,.04,.5,.42,furnM,{fit:1.2}):F(u,v+s*.19,.72,.42,.5,.04,furnM,{fit:1.2});[-.18,.18].forEach(a=>[-.18,.18].forEach(c=>F(u+a,v+c,.22,.04,.44,.04,furnM)))};
const rug=(u,v,du,dv)=>{v+=OV;const m=new THREE.Mesh(new THREE.PlaneGeometry(dfx?dv:du,dfx?du:dv),new THREE.MeshStandardMaterial({map:rugT,color:st.w,roughness:1,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));m.rotation.x=-Math.PI/2;m.position.set(cx+u*ux+v*fx,.03,cz+u*uz+v*fz);m.receiveShadow=true;S.add(m)};
const plate=(u,v)=>F(u,v,.78,.24,.02,.24,C_(0xf0ece0,{roughness:.3}));
const olM=C_(0x4a5a3a,{roughness:.55,metalness:.55}),stM=C_(0x6a7078,{roughness:.4,metalness:.8,envMapIntensity:1}),sackM=C_(0xb8a27a,{roughness:1}),redM=C_(0x8a3028,{roughness:.5,metalness:.4}),
scrM=new THREE.MeshBasicMaterial({color:0x58e0a0,toneMapped:false}),mapM=std(0xffffff,{map:mapT,roughness:.9}),whM=C_(0xeceae4,{roughness:.3}),blM=C_(0x2c4a7a),gnM=C_(0x4a5a3a,{roughness:1}),bedM=C_(0xe8e4d8,{roughness:1});
const locker=(u,v,s,F_)=>{F_=F_||F;F_(u,v,.95,.5,1.9,.5,olM,{c:1,s:1});F_(u,v+(s||1)*.255,1.4,.3,.02,.01,darkM,{ns:1});F_(u,v+(s||1)*.255,.6,.3,.02,.01,darkM,{ns:1})};
const bunkBed=(u,v,al,F_)=>{F_=F_||F;const du=al?2:.95,dv=al?.95:2;[-1,1].forEach(a=>[-1,1].forEach(b=>F_(u+a*(du/2-.04),v+b*(dv/2-.04),.9,.07,1.8,.07,stM)));
[.38,1.2].forEach((y,k)=>{F_(u,v,y,du,.07,dv,stM);F_(u,v,y+.1,du-.06,.14,dv-.06,k?gnM:blM)});F_(u+(al?-du/2+.25:0),v+(al?0:-dv/2+.25),1.43,al?.4:.5,.1,al?.5:.4,bedM);F_(u+(al?-du/2+.25:0),v+(al?0:-dv/2+.25),.61,al?.4:.5,.1,al?.5:.4,bedM)};
const colF2=(F_,u,v,du,dv)=>{F_===F2?col2(u,v,du,dv):colF(u,v,du,dv)};
const crate=(u,v,s,F_)=>{(F_||F)(u,v,s/2,s,s,s,surf(0x6a5a3c),{c:1,s:1})};
const screen=(u,v,y,du,dv,F_)=>{F_=F_||F;F_(u,v,y,du,.34,dv,darkM,{s:1});F_(u,v+dv/2+.006,y,du-.06,.28,.01,scrM,{ns:1})};
const shelf=(u,v,len,F_)=>{F_=F_||F;[.35,.85,1.35,1.85].forEach(y=>F_(u,v,y,len,.04,.4,stM));[-1,1].forEach(s=>F_(u+s*len/2,v,1.1,.04,2.2,.4,stM));colF2(F_,u,v,len,.4)};
[
// 0 — chambre
()=>{const bu=-hu+.55,bv=-hf+1.05;F(bu,bv,.18,1,.36,2,beamM,{c:1,s:1,fit:1.2});F(bu,bv,.44,.92,.16,1.9,clothM);F(bu,bv+.3,.535,.96,.04,1.3,C_(st.s,{roughness:1}));F(bu,-hf+.38,.56,.6,.1,.35,C_(0xffffff,{roughness:1}));F(bu,-hf+.06,.55,1,1.1,.06,beamM,{fit:1.2});
F(bu+.8,-hf+.3,.25,.45,.5,.4,furnM,{c:1,fit:1.2});F(bu+.8,-hf+.3,.6,.1,.2,.1,C_(st.s));F(bu+.8,-hf+.3,.74,.2,.12,.2,lampM,{ns:1});
F(hu-.75,-hf+.33,.95,1.3,1.9,.6,furnM,{c:1,s:1,fit:1.2});F(hu-.75,-hf+.635,.95,.02,1.8,.012,darkM,{ns:1});[-.08,.08].forEach(k=>F(hu-.75+k,-hf+.65,1,.025,.1,.03,darkM,{ns:1}));
table(.9,.35,1.3,.8);chair(.9,1.07,1);chair(.9,-.37,-1);F(.6,.45,.82,.07,.11,.07,C_(0xd8d4c8,{roughness:.3}));plate(1.15,.25);rug(.9,.35,2.6,2);
const su=-hu+.2,sv=hf-1.3;F(su,sv,.8,.35,1.6,1.1,furnM,{c:1,s:1,fit:1.2});[[0x8a2c2c,-.35],[0x2c4a7a,-.15],[0x3a6a3a,.05],[0xc8a040,.3]].forEach((q,k)=>F(su,sv+q[1],1.72,.22,.24-k*.03,.14,C_(q[0])))},
// 1 — cuisine
()=>{const wh=C_(0xe9e9e6,{roughness:.3,metalness:.2}),ct=C_(0x3c3c40,{roughness:.25}),inox=C_(0x9a9ea2,{roughness:.2,metalness:.9,envMapIntensity:1.2});
F(-hu+.42,-hf+.42,.95,.72,1.9,.72,wh,{c:1,s:1});F(-hu+.72,-hf+.79,1.25,.03,.5,.03,darkM,{ns:1});F(-hu+.42,-hf+.785,.7,.7,.012,.01,darkM,{ns:1});
const cl=hu+.3,cu=(hu-.3)/2;F(cu,-hf+.33,.45,cl,.9,.6,pm(T_wood,st.s,{roughness:.6}),{c:1,s:1,fit:1.2});F(cu,-hf+.35,.925,cl+.04,.05,.68,ct);
F(.4,-hf+.36,.945,.6,.03,.42,inox);F(.4,-hf+.14,1.05,.04,.2,.04,inox);F(.4,-hf+.2,1.14,.04,.03,.14,inox);
F(hu-.5,-hf+.34,.475,.66,.95,.64,darkM);[-.15,.15].forEach(a=>[-.14,.14].forEach(c=>F(hu-.5+a,-hf+.34+c,.956,.2,.012,.2,C_(0x55585c,{metalness:.6}))));F(hu-.65,-hf+.2,1.03,.26,.14,.26,inox);F(hu-.5,-hf+.67,.6,.5,.3,.01,C_(0x0a0a0a,{roughness:.1}),{ns:1});
[.9,1.2].forEach((a,k)=>F(a,-hf+.2,1.03+k*.02,.12,.16+k*.05,.12,C_([0xb8442c,0xd8c070][k])));
table(0,.35,1.7,.9);chair(-.42,1.12,1);chair(.42,1.12,1);chair(-.42,-.42,-1);chair(.42,-.42,-1);plate(-.42,.6);plate(.42,.6);plate(-.42,.1);plate(.42,.1);F(0,.35,.88,.07,.24,.07,C_(0x2c5a34,{roughness:.15,metalness:.3}));F(.15,.4,.8,.2,.07,.2,C_(0xc87830));
[1.15,1.6].forEach(y=>{F(-hu+.15,1.3,y,.26,.04,1.3,furnM,{fit:1.2});[-.5,-.2,.1,.4].forEach((c,k)=>F(-hu+.15,1.3+c,y+.11,.12,.18,.12,C_([0xd8d0c0,0x8a4a2c,0x4a6a8a,0xc8b040][(k+(y>1.3?1:0))%4],{roughness:.4})))})},
// 2 — salon
()=>{const fb=C_(st.s,{roughness:1}),cu=C_(0xe6dcc8,{roughness:1});
F(0,-hf+.5,.22,2.1,.44,.85,fb,{c:1,s:1});F(0,-hf+.17,.62,2.1,.5,.2,fb);[-1,1].forEach(s=>F(s*1.05,-hf+.5,.36,.2,.72,.85,fb));[-.5,.5].forEach(a=>{F(a,-hf+.58,.5,.92,.12,.62,cu);F(a,-hf+.3,.72,.5,.34,.12,cu)});
F(0,-hf+1.7,.4,1.1,.05,.6,furnM,{c:1,fit:1.2});[-.48,.48].forEach(a=>[-.23,.23].forEach(c=>F(a,-hf+1.7+c,.19,.05,.38,.05,furnM)));F(-.2,-hf+1.7,.46,.28,.04,.2,C_(0x8a2c2c));F(.25,-hf+1.75,.48,.08,.1,.08,C_(0xf0ece0,{roughness:.3}));rug(0,-hf+1.6,2.8,2.1);
const bu=hu-.2;F(bu,-1.6,1,.36,2,1.2,furnM,{c:1,s:1,fit:1.2});const pal=[0x8a2c2c,0x2c4a7a,0x3a6a3a,0xc8a040,0x5a3a6a,0xd8d0c0,0x30302c];
[.3,.85,1.4].forEach((y,r)=>{F(bu-.185,-1.6,y-.03,.02,.04,1.14,beamM,{ns:1});for(let k=0;k<9;k++){const h=.26+hsh(k,r+cx)*.16;F(bu-.2,-2.1+k*.125,y+h/2,.06,h,.1,C_(pal[(hsh(k+3,r*7+cz)*pal.length)|0]),{ns:1})}});
F(-hu+.45,-hf+.45,.42,.6,.84,.6,darkM,{c:1,s:1});F(-hu+.45,-hf+.45,1.82,.14,1.96,.14,darkM);F(-hu+.45,-hf+.756,.4,.3,.2,.01,new THREE.MeshBasicMaterial({color:0xff8a30,toneMapped:false}),{ns:1});F(-hu+1.0,-hf+.3,.15,.35,.3,.4,beamM,{fit:1.2});
F(-hu+.4,1.5,.74,.7,.05,1.2,furnM,{c:1,s:1,fit:1.2});[-.28,.28].forEach(a=>[-.53,.53].forEach(c=>F(-hu+.4+a,1.5+c,.36,.06,.72,.06,furnM)));chair(-hu+1.05,1.5,1,1);
F(-hu+.3,1.15,.86,.2,.18,.36,darkM);F(-hu+.3,1.15,.99,.01,.1,.01,darkM,{ns:1});F(-hu+.45,1.7,.775,.3,.01,.22,C_(0xf4f2ea));F(-hu+.25,1.95,.9,.1,.26,.1,C_(st.s));F(-hu+.25,1.95,1.07,.2,.12,.2,lampM,{ns:1})},
// 3 — atelier
()=>{const mt=C_(0x5a6066,{roughness:.45,metalness:.8,envMapIntensity:1}),gn=C_(0x4a5a3a,{roughness:.7}),cm=surf(0x6a5a3c),Fw=(u,...a)=>F(u+.5,...a);
Fw(0,-hf+.42,.9,2.4,.08,.8,furnM,{c:1,s:1,fit:1.2});[-1.05,1.05].forEach(a=>[-.3,.3].forEach(c=>Fw(a,-hf+.42+c,.43,.08,.86,.08,beamM)));Fw(0,-hf+.42,.25,2.2,.04,.7,furnM,{fit:1.2});
Fw(-.8,-hf+.6,1.01,.16,.14,.22,mt);Fw(-.8,-hf+.76,1.05,.05,.05,.14,darkM);Fw(.3,-hf+.45,.97,.95,.05,.07,darkM);Fw(.66,-hf+.45,.965,.3,.08,.05,beamM);Fw(.2,-hf+.56,.955,.05,.03,.12,darkM);
Fw(.85,-hf+.4,1.03,.32,.18,.2,gn);Fw(.85,-hf+.4,1.19,.3,.14,.18,gn);Fw(-.6,-hf+.42,.37,.4,.2,.3,gn);Fw(.5,-hf+.42,.36,.5,.18,.3,cm);[-.3,-.1].forEach(a=>Fw(a,-hf+.65,.96,.03,.03,.16,C_(0xc9a24a,{metalness:.9,roughness:.3})));
const ru=-hu+.27,rv=1.5;[-.68,.68].forEach(c=>[-.2,.2].forEach(a=>F(ru+a,rv+c,1,.04,2,.04,mt)));[.3,.9,1.5,1.98].forEach((y,k)=>F(ru,rv,y,.46,.03,1.4,mt,k?{}:{c:1,s:1}));
F(ru,rv-.4,.45,.34,.26,.4,gn);F(ru,rv+.3,.44,.36,.24,.36,cm);F(ru,rv-.3,1.05,.3,.26,.5,cm);F(ru,rv+.4,1.02,.3,.2,.24,gn);F(ru,rv,1.6,.3,.16,.6,darkM);
F(hu-.5,-hf+.5,.35,.7,.7,.7,cm,{c:1,s:1});F(hu-.5,-hf+1.25,.3,.6,.6,.6,cm,{c:1,s:1});F(hu-.5,-hf+.5,.95,.5,.5,.5,cm,{s:1});
F(0,-hf+1.25,.25,.34,.5,.34,beamM,{c:1,fit:1.2});F(hu-.45,1.4,.4,.5,.8,.5,C_(0x8a3028,{roughness:.5,metalness:.5}),{c:1,s:1});F(hu-.45,1.4,.82,.4,.04,.4,darkM)},
// 4 — poste de garde (bunker)
()=>{for(let k=0;k<3;k++)locker(-hu+.35+k*.55,-hf+.3,1);table(1.0,.1,2,1.1);F(1.0,.1,.78,1.9,.012,1,mapM,{ns:1});colF(1.0,.1,2,1.1);chair(1.0,.95,1);chair(.1,.1,1,1);chair(1.9,.1,-1,1);
F(hu-.3,-hf+1.2,.8,.5,.06,1.4,stM,{c:1,s:1});F(hu-.3,-hf+1.2,.92,.3,.18,.4,olM);F(hu-.3,-hf+1.7,1.0,.04,.3,.04,darkM);F(-hu+.5,hf-.9,.22,.9,.3,1.8,gnM,{c:1,s:1})},
// 5 — radio / commandement
()=>{F(1.9,-hf+.4,.74,3.4,.06,.8,stM,{c:1,s:1});[.4,1.9,3.3].forEach(a=>F(a,-hf+.4,.36,.06,.72,.7,stM));screen(.8,-hf+.4,1.05,.5,.1);screen(1.9,-hf+.4,1.05,.5,.1);screen(3.0,-hf+.4,1.05,.5,.1);
chair(1.9,-hf+1.25,1);chair(.8,-hf+1.25,1);F(hu-.3,.8,.95,.5,1.9,1.4,stM,{c:1,s:1});for(let k=0;k<4;k++)F(hu-.55,.8,.4+k*.42,.04,.14,1.2,k%2?scrM:darkM,{ns:1});
F(-hu+.1,.4,1.6,.04,1.1,1.8,mapM,{ns:1});table(-1.4,1.2,1.3,.8);F(-1.4,1.2,.8,.3,.06,.22,olM)},
// 6 — armurerie
()=>{[-1,1].forEach(s=>{F(s*(hu-.2),0,1,.3,2,3,stM,{c:1,s:1});for(let k=0;k<5;k++){const gz=-1.2+k*.6;F(s*(hu-.4),gz,1.15,.1,.1,.55,darkM);F(s*(hu-.4),gz,1.15,.06,.06,.2,C_(0x6a4a2c,{roughness:.7}))}});
F(1.9,-hf+.4,.9,1.7,.08,.7,furnM,{c:1,s:1,fit:1.2});[1.15,2.65].forEach(a=>F(a,-hf+.4,.45,.08,.9,.6,furnM));F(1.6,-hf+.4,.98,.4,.06,.2,darkM);F(2.2,-hf+.4,.99,.2,.08,.3,sackM);
crate(-hu+.5,-hf+.5,.6);crate(-hu+1.15,-hf+.4,.5);crate(-hu+.5,-hf+1.15,.5);F(0,.7,.4,.6,.8,.6,redM,{c:1,s:1})},
// 7 — cantine
()=>{[-.5,1.2].forEach((v,k)=>{table(.3,v,3,.8);F(.3,v+(k?.6:-.6),.23,2.8,.46,.3,furnM,{c:1,fit:1.2});plate(-.7,v);plate(1.3,v)});
const wh=C_(0xe9e9e6,{roughness:.3,metalness:.2}),inox=C_(0x9a9ea2,{roughness:.2,metalness:.9,envMapIntensity:1.2});F(1.9,-hf+.35,.45,hu*1.1,.9,.6,stM,{c:1,s:1});F(1.9,-hf+.35,.93,hu*1.1+.04,.05,.66,inox);cylF(2.3,-hf+.4,1.2,.18,.5,inox);cylF(1.5,-hf+.4,1.1,.14,.3,inox);F(-hu+.4,-hf+.4,.95,.7,1.9,.7,wh,{c:1,s:1})},
// 8 — salle d'opérations
()=>{table(0,.2,3,1.5);F(0,.2,.78,2.9,.012,1.4,mapM,{ns:1});colF(0,.2,3,1.5);[-1,0,1].forEach(a=>{chair(a,1.2,1);chair(a,-.8,-1)});
for(let k=-4;k<=0;k++)screen(k*.9-.2,-hf+.1,1.7,.7,.12);F(-hu+.3,.3,.95,.4,1.9,1.6,stM,{c:1,s:1});for(let k=0;k<4;k++)F(-hu+.52,.3,.4+k*.42,.04,.14,1.4,k%2?scrM:darkM,{ns:1});locker(hu-.3,-hf+.3,1);locker(hu-.3,.3,-1);locker(hu-.3,1.1,-1)},
// 9 — bunker d'apparition : armurerie + établi central
()=>{for(let k=0;k<5;k++)locker(-hu+.35+k*.55,-hf+.3,1);[-1,1].forEach(s=>{F(s*(hu-.2),.3,1,.3,2,3.2,stM,{c:1,s:1});for(let k=0;k<5;k++){const gz=-1.1+k*.6+.3;F(s*(hu-.4),gz,1.15,.1,.1,.55,darkM);F(s*(hu-.4),gz,1.15,.06,.06,.2,C_(0x6a4a2c,{roughness:.7}))}});
table(-2.6,.9,2.4,1.1);F(-2.6,.9,.78,2.3,.012,1,mapM,{ns:1});colF(-2.6,.9,2.4,1.1);chair(-2.6,1.8,1);chair(-3.5,.9,1,1);chair(-1.7,.9,-1,1);crate(hu-1.2,hf-.8,.6);crate(-hu+1.2,hf-.8,.6);crate(hu-1.2,hf-1.45,.5);F(2.6,.5,.4,.6,.8,.6,redM,{c:1,s:1});rug(0,-.2,3.4,2.2)}

,()=>{table(ci*.9,.7,1.4,.8);chair(ci*.9,1.45,1);chair(ci*.9,-.05,-1);rug(ci*.9,.7,2.4,1.8);F(ci*(hu-.3),1.9,.9,.4,1.8,1.2,furnM,{c:1,s:1,fit:1.2});
YO=FT;F(ci*(hu-.55),-hf+1.1,.18,1,.36,2,beamM,{c:1,s:1,fit:1.2});F(ci*(hu-.55),-hf+1.1,.44,.92,.16,1.9,clothM);F(ci*(hu-.55),-hf+.4,.56,.6,.1,.35,C_(0xffffff,{roughness:1}));
table(ci*.5,1.5,1.3,.75);chair(ci*.5,2.2,1);crate(ci*1.7,2.2,.7);crate(0,vB+1.0-OV,.9);crate(.9,vB+1.0-OV,.6);crate(-.8,vB+.9-OV,.7);crate(ci*.2,-1.8,.6);YO=0}
][o.up?4:(o.fl!==undefined?o.fl:lay)]();
// pièce arrière (u latéral, v<0 vers le fond ; hb = demi-profondeur)
[
// 0 — salle de bain
()=>{const w=C_(0xf2f2ee,{roughness:.2,metalness:.1}),inox=C_(0xaeb2b6,{roughness:.2,metalness:.9});
F2(-hu+.5,-hb+.5,.07,.95,.14,.95,w,{c:1,s:1});[0,1].forEach(k=>F2(-hu+.5+(k?.47:0),-hb+.5+(k?0:.47),1.1,k?.02:.95,2.1,k?.95:.02,glassM,{ns:1}));F2(-hu+.5,-hb+.5,2.1,.1,.1,.1,inox);col2(-hu+.5,-hb+.5,1,1);
F2(.6,-hb+.3,.2,.4,.4,.55,w,{c:1,s:1});F2(.6,-hb+.12,.62,.45,.4,.2,w);F2(hu-.7,-hb+.3,.8,.75,.12,.5,w,{c:1,s:1});F2(hu-.7,-hb+.3,.4,.5,.8,.4,furnM,{fit:1.2});F2(hu-.7,-hb+.03,1.5,.6,.8,.02,inox,{ns:1});F2(hu-.7,-hb+.3,.9,.03,.18,.03,inox);
F2(hu-.1,-hb+1.2,1.3,.02,.5,.4,C_(0xc84040,{roughness:1}),{ns:1})},
// 1 — cellier
()=>{shelf(0,-hb+.25,Math.min(3.6,2*hu-1.4),F2);for(let k=0;k<9;k++)[.35,.85,1.35].forEach((y,r)=>{if(hsh(k,r+cx)>.3)F2(-1.6+k*.4,-hb+.2,y+.12,.12,.2,.12,C_([0xb8442c,0xd8c070,0x4a6a3a,0x8a4a2c][(k+r)%4],{roughness:.35}),{ns:1})});
crate(-hu+.5,-hb+1.1,.55,F2);F2(hu-.4,-hb+.9,.3,.6,.6,.6,sackM,{c:1,s:1});F2(hu-.4,-hb+1.2,.8,.5,.4,.5,sackM);cylF(hu-1.2,-hb+1.1-BO,.5,.28,.95,C_(0x8a3028,{roughness:.5,metalness:.5}),1)},
// 2 — bureau
()=>{table(-.4,-hb+.5,1.9,.8);col2(-.4,-hb+.5,1.9,.8);F2(-.4,-hb+.5,.9,.4,.02,.3,C_(0xf4f2ea));F2(-.4,-hb+.35,.95,.34,.2,.02,darkM);F2(-.4,-hb+.5,.78,.4,.015,.3,darkM);chair(-.4,-hb+1.2,1);F2(1.1,-hb+.28,.95,.2,.12,.2,C_(st.s));F2(1.1,-hb+.28,1.07,.2,.12,.2,lampM,{ns:1});
F2(-hu+.25,-hb+.5,1,.4,2,1.6,furnM,{c:1,s:1,fit:1.2});for(let k=0;k<7;k++)F2(-hu+.3,-hb-.1+k*.17,1.3,.28,.3,.12,C_([0x8a2c2c,0x2c4a7a,0x3a6a3a,0xc8a040][k%4]),{ns:1});
F2(hu-.3,-hb+.4,.5,.5,1,.5,stM,{c:1,s:1});F2(hu-.3,-hb+1.1,.5,.5,1,.5,stM,{c:1,s:1});F2(0,-hb+.03,1.6,1.2,.8,.02,mapM,{ns:1})},
// 3 — repos
()=>{const bu=-hu+.6;F2(bu,-hb+1.0,.2,1,.4,2,beamM,{c:1,s:1,fit:1.2});F2(bu,-hb+1.0,.46,.92,.16,1.9,clothM);F2(bu,-hb+1.45,.55,.96,.04,1,gnM);F2(bu,-hb+.25,.58,.6,.12,.35,bedM);
F2(.4,-hb+.3,.35,1.1,.7,.5,furnM,{c:1,s:1,fit:1.2});F2(.4,-hb+.3,.75,.5,.14,.3,C_(st.s));locker(hu-.4,-hb+.3,1,F2);locker(hu-1.0,-hb+.3,1,F2);
F2(hu-.5,-hb+1.4,.35,.6,.5,.7,surf(0x6a5a3c),{c:1,s:1})},
// 4 — dortoir
()=>{bunkBed(-hu+.7,-hb+1.05,0,F2);bunkBed(-hu+1.8,-hb+1.05,0,F2);bunkBed(hu-.7,-hb+1.05,0,F2);bunkBed(hu-1.8,-hb+1.05,0,F2);[-hu+.7,-hu+1.8,hu-.7,hu-1.8].forEach(a=>col2(a,-hb+1.05,.95,2));locker(0,-hb+.3,1,F2)},
// 5 — réserve / stock
()=>{shelf(-hu+1.3,-hb+.25,2,F2);shelf(hu-1.3,-hb+.25,2,F2);crate(0,-hb+.5,.7,F2);crate(.7,-hb+.4,.55,F2);crate(-.1,-hb+1.2,.5,F2);
cylF(-hu+.45,-hb+1.2-BO,.5,.3,1,C_(0x30506a,{roughness:.5,metalness:.5}),1);cylF(hu-.45,-hb+1.2-BO,.5,.3,1,C_(0x8a3028,{roughness:.5,metalness:.5}),1)},
// 6 — infirmerie
()=>{[-hu+.6,-hu+1.7].forEach(a=>{F2(a,-hb+1.0,.38,.85,.1,1.9,stM,{c:1,s:1});F2(a,-hb+1.0,.5,.8,.14,1.8,bedM)});F2(hu-.4,-hb+.8,1,.5,2,1.4,whM,{c:1,s:1});F2(hu-.14,-hb+.8,1.55,.02,.4,.1,C_(0xc82020),{ns:1});F2(hu-.14,-hb+.8,1.55,.02,.1,.4,C_(0xc82020),{ns:1});
F2(hu-1.4,-hb+.35,.5,.5,1,.5,stM,{c:1,s:1});F2(hu-1.4,-hb+.35,1.05,.3,.1,.3,whM);F2(.4,-hb+.5,.55,.03,1.1,.03,stM);F2(.4,-hb+.5,1.12,.4,.02,.02,stM)},
// 7 — réserve 2
()=>{shelf(hu-1.3,-hb+.25,2.4,F2);shelf(-hu+1.3,-hb+.25,2.4,F2);[0,1,2].forEach(k=>F2(-.5+k*.6,-hb+.4,.25,.55,.5,.55,sackM,{c:1,s:1}));cylF(-hu+.45,-hb+1.2-BO,.5,.3,1,C_(0x4a5a3a,{roughness:.5,metalness:.5}),1);crate(hu-.5,-hb+1.2,.6,F2)}
][o.bk!==undefined?o.bk:bk]();
// plafonniers
const lampAt=(X,Z)=>{const l=new THREE.Mesh(new THREE.SphereGeometry(.07,10,8),lampM);l.position.set(X,H-.6,Z);S.add(l);
if(bun){const sh=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,.2,8,1,true),darkM);sh.position.set(X,H-.6,Z);S.add(sh)}else{const sh=new THREE.Mesh(new THREE.ConeGeometry(.24,.2,14,1,true),std(st.s,{roughness:.8,side:THREE.DoubleSide}));sh.position.set(X,H-.52,Z);S.add(sh)}
const c=new THREE.Mesh(new THREE.BoxGeometry(.015,.5,.015),darkM);c.position.set(X,H-.3,Z);S.add(c)};
lampAt(fcx,fcz);lampAt(bcx,bcz);
HS.push(o.up?[x0-2.6,z0-2.6,x1+2.6,z1+2.6]:[x0-.6,z0-.6,x1+.6,z1+.6])}
