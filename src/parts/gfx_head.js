const MH=150;
const R=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});R.setSize(innerWidth,innerHeight);R.setPixelRatio(Math.min(devicePixelRatio,2));document.body.appendChild(R.domElement);
R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=.82;
R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;
const S=new THREE.Scene();
const HOR=0xc3d0cc,TOP=0x4f84c4;
S.fog=new THREE.Fog(HOR,24,120);
const C=new THREE.PerspectiveCamera(75,innerWidth/innerHeight,.05,100);C.rotation.order='YXZ';S.add(C);
// ================= CIEL + ENVIRONNEMENT =================
const SUND=new THREE.Vector3(-.5,.6,.62).normalize();
const LDIR=SUND.clone();
const skyU={uTop:{value:new THREE.Color(TOP)},uHor:{value:new THREE.Color(HOR)},uSunD:{value:SUND},uSunC:{value:new THREE.Color(1,.88,.65)},uT:{value:0},uMoonD:{value:new THREE.Vector3(.3,.6,-.6).normalize()},uCov:{value:.15},uGrey:{value:0},uStar:{value:0},uFlash:{value:0},uCl:{value:new THREE.Color(1,.99,.96)}};
const skyMat=()=>new THREE.ShaderMaterial({uniforms:skyU,side:THREE.BackSide,depthWrite:false,depthTest:false,fog:false,
vertexShader:'varying vec3 vD;void main(){vD=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
fragmentShader:`uniform vec3 uTop,uHor,uSunD,uSunC,uMoonD,uCl;uniform float uT,uCov,uGrey,uStar,uFlash;varying vec3 vD;
float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1.,0.)),f.x),mix(h21(i+vec2(0.,1.)),h21(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*vn(p);p*=2.03;a*=.5;}return s;}
void main(){vec3 d=normalize(vD);float y=d.y;
vec3 c=mix(uHor,uTop,pow(clamp(y,0.,1.),.5));
c=mix(c,uHor*.7,1.-smoothstep(-.25,0.,y));
float cl=0.;
if(y>0.){vec2 p=d.xz/(y+.18)*1.3+vec2(uT*.012,uT*.005);cl=smoothstep(.62-.42*uCov,.88-.38*uCov,fbm(p))*smoothstep(0.,.22,y);}
float up=smoothstep(-.04,.04,y);
float star=step(.9935,h21(floor(d.xz/(abs(y)+.35)*80.)))*smoothstep(.04,.3,y)*uStar*(.6+.4*sin(uT*3.+h21(floor(d.xz*60.))*40.))*(1.-cl);
c+=vec3(.85,.9,1.)*star;
float s=max(dot(d,uSunD),0.);
c+=uSunC*(.2*pow(s,6.)+.55*pow(s,90.)+3.*smoothstep(.9992,.9998,s)*up)*(1.-.85*uCov);
float m=max(dot(d,uMoonD),0.);
c+=vec3(.82,.88,1.)*(2.2*smoothstep(.99935,.99965,m)+.18*pow(m,220.)+.05*pow(m,20.))*uStar*up*(1.-.7*cl);
vec3 cc=uCl*(.9+.1*s)-vec3(.06,.05,.03)*cl*uCov*0.;
c=mix(c,cc,cl*(.82+.15*uCov));
float lu=dot(c,vec3(.3,.55,.15));c=mix(c,vec3(lu)*.92,uGrey*.7);
c+=vec3(.7,.75,.95)*uFlash*(.35+.65*cl);
gl_FragColor=vec4(clamp(c,0.,8.),1.);}`});
const sky=new THREE.Mesh(new THREE.SphereGeometry(90,32,16),skyMat());sky.renderOrder=-1000;sky.frustumCulled=false;S.add(sky);
function envGeo(){const g=new THREE.SphereGeometry(50,64,32),p=g.attributes.position,col=new Float32Array(p.count*3),top=skyU.uTop.value.clone(),hor=skyU.uHor.value.clone(),sc=skyU.uSunC.value.clone().multiplyScalar(skyU.uSunD.value.y>0?1:.0),c=new THREE.Color(),d=new THREE.Vector3();
for(let i=0;i<p.count;i++){d.fromBufferAttribute(p,i).normalize();const y=d.y;c.copy(hor).lerp(top,Math.sqrt(Math.max(0,y)));if(y<0)c.lerp(hor.clone().multiplyScalar(.6),Math.min(1,-y*4));
const s=Math.max(0,d.dot(SUND)),s2=s*s,s4=s2*s2,s16=s4*s4*s4*s4,s48=s16*s16*s16;c.r+=sc.r*(.25*s4+1.5*s48);c.g+=sc.g*(.25*s4+1.5*s48);c.b+=sc.b*(.25*s4+1.5*s48);col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b}
g.setAttribute('color',new THREE.BufferAttribute(col,3));return g}
function mkEnv(r){try{const sc=new THREE.Scene();sc.add(new THREE.Mesh(envGeo(),new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide})));const pm=new THREE.PMREMGenerator(r),t=pm.fromScene(sc,.02).texture;pm.dispose();return t}catch(e){return null}}
const hemi=new THREE.HemisphereLight(0xbcd2ff,0x5a5238,.3);S.add(hemi);
const sun=new THREE.DirectionalLight(0xfff0d8,1.25);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
{const q=sun.shadow.camera;q.left=q.bottom=-28;q.right=q.top=28;q.near=1;q.far=170;q.updateProjectionMatrix()}
sun.shadow.bias=-.0004;sun.shadow.normalBias=.04;
sun.position.copy(SUND).multiplyScalar(80);S.add(sun,sun.target);
S.environment=mkEnv(R);
