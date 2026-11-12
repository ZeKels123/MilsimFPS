let PWADE=1,PSTUN=1,GRASS=null,AMST=null,ALP=null;function AOUT(){if(!ALP){ALP=AC.createBiquadFilter();ALP.type='lowpass';ALP.frequency.value=20000;AMST=AC.createGain();ALP.connect(AMST);AMST.connect(AC['destination'])}return ALP}
// ---- v5 : vent partagé, bruit entendu par la faune et les bots
const WND={t:{value:0},s:{value:.3},d:{value:new THREE.Vector2(.8,.6)},p:{value:new THREE.Vector2(0,23)}},NZ={x:0,z:0,r:0,n:0};
function noise(x,z,r){NZ.x=x;NZ.z=z;NZ.r=r;NZ.n++}
// k : 0 herbe, 1 buisson, 2 cône bas, 3 cône haut, 4 feuillu, 5 roseau
function windify(m,k){m.defines=Object.assign({},m.defines,{WK:k});m.onBeforeCompile=sh=>{sh.uniforms.uWt=WND.t;sh.uniforms.uWs=WND.s;sh.uniforms.uWd=WND.d;sh.uniforms.uWp=WND.p;
sh.vertexShader='uniform float uWt,uWs;uniform vec2 uWd,uWp;\n'+sh.vertexShader.replace('#include <project_vertex>',`vec4 mvPosition=vec4(transformed,1.);
#ifdef USE_INSTANCING
mvPosition=instanceMatrix*mvPosition;vec3 wo=instanceMatrix[3].xyz;
#else
vec3 wo=vec3(0.);
#endif
float wf=0.,fl=0.;
#if WK==0
wf=position.y*.3;fl=.5;
#elif WK==1
wf=(position.y+1.)*.035;fl=.6;
#elif WK==2
wf=.06+.16*(position.y/6.5+.5);fl=.12;
#elif WK==3
wf=.2+.2*(position.y/4.5+.5);fl=.12;
#elif WK==4
wf=.1+.08*(position.y+1.);fl=.5;
#elif WK==6
wf=.03+.3*pow(position.y/10.,2.);fl=.5;
#elif WK==7
wf=.05+.09*position.y/6.;fl=.7;
#elif WK==8
wf=.04+.08*position.y;fl=.9;
#else
wf=position.y*position.y*.11;fl=.3;
#endif
float ph=dot(wo.xz,vec2(.31,.27)),gu=.55+.45*sin(uWt*.5+dot(wo.xz,uWd)*.09),g=(sin(uWt*1.6+ph)*.6+sin(uWt*2.9+ph*1.7)*.3+.5)*gu;
mvPosition.xz+=uWd*(g*uWs*wf*2.2)+vec2(sin(uWt*5.3+mvPosition.x*2.1+mvPosition.y*3.),cos(uWt*4.7+mvPosition.z*2.3))*(wf*fl*.12*(.4+uWs));
#if WK>=6
float lp=dot(position,vec3(7.1,5.3,6.7));mvPosition.xyz+=vec3(sin(uWt*4.1+lp),sin(uWt*3.3+lp*1.3)*.5,cos(uWt*3.7+lp*.9))*(.02+.075*uWs)*(.55+.45*sin(uWt*.9+ph));
#endif
#if WK==0
vec2 dp=mvPosition.xz-uWp;float pd=length(dp);mvPosition.xz+=dp/max(pd,.05)*(1.-smoothstep(.15,1.,pd))*position.y*.6;mvPosition.y-=(1.-smoothstep(.1,.8,pd))*position.y*.45;
#endif
mvPosition=modelViewMatrix*mvPosition;gl_Position=projectionMatrix*mvPosition;`)};return m}
// ================= RELIEF JOUABLE (v4) : GH(x,z) est utilisée par le joueur, les bots, les tirs et les props =================
const AR=MH,GN=2*MH-19,GSP=2*AR/(GN-1),GHg=new Float32Array(GN*GN);
function GH(x,z){if(x<=-AR||x>=AR||z<=-AR||z>=AR)return 0;const fx=(x+AR)/GSP,fz=(z+AR)/GSP,i=Math.min(GN-2,fx|0),j=Math.min(GN-2,fz|0),a=fx-i,b=fz-j,k=j*GN+i;return(GHg[k]*(1-a)+GHg[k+1]*a)*(1-b)+(GHg[k+GN]*(1-a)+GHg[k+GN+1]*a)*b}
// eau (v5) : étang + ruisseau à niveau constant WL ; wDist = distance signée à l'eau (<0 dedans)
const POND={x:40,z:40,rx:10,rz:6.8,rot:.5},BROOK=[[12,61],[17,56.5],[23,56],[27.5,51],[32,46.5],[35,43.5]],
// v8 : rivière d'un bord à l'autre (amont rejoint le ruisseau, aval part de l'étang) et 3 ponts orientés nord-sud
RIVER=[[[-150,102],[-122,93],[-92,87],[-62,80],[-36,73],[-12,67],[12,61]],[[40,40],[58,33],[76,22],[96,10],[122,-2],[150,-10]]],
BRG=[{x:-36,z:73,hl:6.4},{x:25.2,z:53.5,hl:5.4},{x:96,z:10,hl:6.4}],RPTS=[];RIVER.forEach(rv=>{for(let i=0;i<rv.length-1;i++){const p=rv[i],q=rv[i+1],n=Math.ceil(Math.hypot(q[0]-p[0],q[1]-p[1])/4);for(let k=0;k<n;k++)RPTS.push([p[0]+(q[0]-p[0])*k/n,p[1]+(q[1]-p[1])*k/n])}});let WL=0;
function wDist(x,z){const c=Math.cos(POND.rot),s=Math.sin(POND.rot),dx=x-POND.x,dz=z-POND.z,u=(dx*c+dz*s)/POND.rx,v=(-dx*s+dz*c)/POND.rz,a=Math.atan2(v,u);
let d=(Math.hypot(u,v)-(1+.13*Math.sin(a*3+1)+.07*Math.sin(a*5+.4)))*POND.rz;
for(let i=0;i<BROOK.length-1;i++){const p=BROOK[i],q=BROOK[i+1],ex=q[0]-p[0],ez=q[1]-p[1],t=Math.max(0,Math.min(1,((x-p[0])*ex+(z-p[1])*ez)/(ex*ex+ez*ez))),l=Math.hypot(p[0]+ex*t-x,p[1]+ez*t-z)-(1.15+.3*Math.sin(i*2.1+t*3));if(l<d)d=l}
for(const rv of RIVER)for(let i=0;i<rv.length-1;i++){const p=rv[i],q=rv[i+1],ex=q[0]-p[0],ez=q[1]-p[1],t=Math.max(0,Math.min(1,((x-p[0])*ex+(z-p[1])*ez)/(ex*ex+ez*ez))),l=Math.hypot(p[0]+ex*t-x,p[1]+ez*t-z)-(3.1+.5*Math.sin(i*1.7+t*3));if(l<d)d=l}
const sp=Math.hypot(x-BROOK[0][0],z-BROOK[0][1])-2.1;return sp<d?sp:d}
const wDep=(x,z)=>Math.max(0,WL-GH(x,z));
{const obs=boxes.map(o=>[o.x0,o.z0,o.x1,o.z1]).concat(HS,[[-8,19.4,8,30.5]]),
nz=(x,z)=>{const i=Math.floor(x),j=Math.floor(z),a=x-i,b=z-j,u=a*a*(3-2*a),v=b*b*(3-2*b),h=(p,q)=>hsh(p+991,q+313);return(h(i,j)*(1-u)+h(i+1,j)*u)*(1-v)+(h(i,j+1)*(1-u)+h(i+1,j+1)*u)*v},
fb=(x,z)=>{let s=0,a=1,f=1/46,t=0;for(let o=0;o<5;o++){s+=a*(nz(x*f+o*17.3,z*f+o*9.1)-.5);t+=a;a*=.5;f*=2.05}return s/t*2},
mound=(x,z,cx,cz,r,h)=>h*Math.exp(-((x-cx)*(x-cx)+(z-cz)*(z-cz))/(r*r)),
rel=(x,z)=>{const w=fb(x*.6+40,z*.6-20)*7,e=fb(x+w,z+w*.6),r=1-Math.abs(fb(x*1.3+90,z*1.3+10)*1.6);return 5.4*e+.8*Math.max(0,r-.55)*2.2+mound(x,z,-8,14,5,1.1)+mound(x,z,50,-30,14,3.6)+mound(x,z,-52,10,12,3.2)+mound(x,z,20,-48,10,2.6)+mound(x,z,-30,50,11,2.8)+mound(x,z,40,40,9,-1.6)+mound(x,z,-110,-92,18,4.6)+mound(x,z,100,-112,20,5.2)+mound(x,z,-122,100,16,4)+mound(x,z,118,122,18,4.4)+mound(x,z,5,-122,22,5.2)+mound(x,z,-8,128,20,4.6)+mound(x,z,-136,0,16,4)+mound(x,z,138,12,18,4.4)+mound(x,z,-70,-130,12,3)+mound(x,z,75,60,10,2.4)+mound(x,z,-95,60,12,2.8)+mound(x,z,70,-75,12,3)};
for(let j=0;j<GN;j++)for(let i=0;i<GN;i++){const x=-AR+i*GSP,z=-AR+j*GSP;let d=99;
for(const r of obs){const dx=Math.max(r[0]-x,0,x-r[2]),dz=Math.max(r[1]-z,0,z-r[3]),q=dx*dx+dz*dz;if(q<d*d)d=Math.sqrt(q)}
const m=sstep(.3,2.2,d)*sstep(.5,6,AR-.5-Math.max(Math.abs(x),Math.abs(z)));GHg[j*GN+i]=rel(x,z)*m*(.2+.8*sstep(5,36,wDist(x,z)))}
{let mn=9;for(let j=0;j<GN;j++)for(let i=0;i<GN;i++){const x=-AR+i*GSP,z=-AR+j*GSP;if(Math.abs(wDist(x,z))<1.2)mn=Math.min(mn,GHg[j*GN+i])}WL=mn-.12;
for(let j=0;j<GN;j++)for(let i=0;i<GN;i++){const x=-AR+i*GSP,z=-AR+j*GSP,w=wDist(x,z);if(w>9)continue;const k=j*GN+i,h=GHg[k];GHg[k]=w<=0?WL-Math.min(1.05,.34*-w+.04):(b=>b+(Math.max(h,b)-b)*sstep(.5,8,w))(WL+.05+.2*Math.min(1.5,w)+.02*w)}
for(const b of BRG){b.y=WL+.55;for(let j=0;j<GN;j++)for(let i=0;i<GN;i++){const x=-AR+i*GSP,z=-AR+j*GSP;if(Math.abs(x-b.x)<=1.5&&Math.abs(z-b.z)<=b.hl+.6)GHg[j*GN+i]=b.y}}}
const g=new THREE.PlaneGeometry(2*AR,2*AR,GN-1,GN-1),p=g.attributes.position,c=new Float32Array(p.count*3);
for(let i=0;i<p.count;i++)p.setZ(i,GH(p.getX(i),-p.getY(i)));
scaleUV(g,25,25);g.computeVertexNormals();const nn=g.attributes.normal;
for(let i=0;i<p.count;i++){const X=p.getX(i),Y=p.getY(i),h=p.getZ(i),sl=1-nn.getZ(i),n=.5+.25*Math.sin(X*.21+1)*Math.cos(Y*.17)+.25*Math.sin(X*.07-Y*.09+2),k=1+.09*Math.max(-1,Math.min(1.5,h)),
d=sstep(.03,.16,sl)*.8+sstep(.5,1.6,h)*.25*(1-sstep(.1,.2,sl))+(nz(X*.15,Y*.15)-.5)*.35-.14,dr=Math.max(0,Math.min(1,d));
const wv=wDist(X,-Y),mu=1-sstep(-.6,2.2,wv),ku=wv<0?Math.max(.45,1+wv*.18):1;c[i*3]=(((.8+.22*n)*.8*(1-dr)+.9*dr)*k*(1-mu)+.62*mu)*ku;c[i*3+1]=(((.84+.16*n)*1.05*(1-dr)+.74*dr)*k*(1-mu)+.55*mu)*ku;c[i*3+2]=(((.74+.2*n)*.74*(1-dr)+.6*dr)*k*(1-mu)+.42*mu)*ku}
g.setAttribute('color',new THREE.BufferAttribute(c,3));g.computeBoundingSphere();g.computeBoundingBox();floor.geometry.dispose();floor.geometry=g}

// optimisation : le rayon contre le sol marche sur le champ de hauteur au lieu de tester ~40 000 triangles
{const _fp=new THREE.Vector3();floor.raycast=function(rc,out){const o=rc.ray.origin,d=rc.ray.direction,far=Math.min(rc.far,300);let t=0,py=o.y-GH(o.x,o.z);if(py<0)return;
while(t<far){const st=Math.max(.2,Math.min(3,py*.5)),t2=Math.min(far,t+st),y2=o.y+d.y*t2-GH(o.x+d.x*t2,o.z+d.z*t2);
if(y2<0){let a=t,b=t2;for(let i=0;i<7;i++){const m=(a+b)/2;if(o.y+d.y*m-GH(o.x+d.x*m,o.z+d.z*m)<0)b=m;else a=m}
const x=o.x+d.x*b,z=o.z+d.z*b,y=GH(x,z);if(Math.abs(x)>AR||Math.abs(z)>AR)return;const nx=GH(x-.4,z)-GH(x+.4,z),nz=GH(x,z-.4)-GH(x,z+.4),n=new THREE.Vector3(nx,-nz,.8).normalize();
if(b>=rc.near)out.push({distance:b,point:new THREE.Vector3(x,y,z),object:floor,face:{normal:n}});return}
if(t2>=far)return;t=t2;py=y2}}}
