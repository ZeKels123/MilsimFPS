
// ================= POST-TRAITEMENT (v5) : EffectComposer → RenderPass, SSAO + flou de mouvement, bloom, FXAA =================
const PP={comp:null,gfx:null,bloom:null,fxaa:null,on:true,ssao:true,mb:true,bl:true,prevVP:new THREE.Matrix4(),vp:new THREE.Matrix4(),ivp:new THREE.Matrix4(),first:true};
const PPV='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
class GfxPass extends THREE.Pass{constructor(w,h){super();this.aoRT=new THREE.WebGLRenderTarget(Math.max(2,w>>1),Math.max(2,h>>1),{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat,depthBuffer:false,stencilBuffer:false});
this.aoM=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:{tDepth:{value:null},uPI:{value:new THREE.Matrix4()},uP:{value:new THREE.Matrix4()},uNF:{value:new THREE.Vector2(.05,100)},uRes:{value:new THREE.Vector2(w>>1,h>>1)}},vertexShader:PPV,fragmentShader:`
uniform sampler2D tDepth;uniform mat4 uPI,uP;uniform vec2 uNF,uRes;varying vec2 vUv;
vec3 vp(vec2 uv){float d=texture2D(tDepth,uv).x;vec4 c=uPI*vec4(uv*2.-1.,d*2.-1.,1.);return c.xyz/c.w;}
void main(){float d=texture2D(tDepth,vUv).x;if(d>=.99995){gl_FragColor=vec4(1.);return;}
vec2 px=1./uRes;vec3 p=vp(vUv),r=vp(vUv+vec2(px.x,0.))-p,l=p-vp(vUv-vec2(px.x,0.)),u=vp(vUv+vec2(0.,px.y))-p,b=p-vp(vUv-vec2(0.,px.y));
vec3 n=normalize(cross(abs(r.z)<abs(l.z)?r:l,abs(u.z)<abs(b.z)?u:b));
if(-p.z<.9||-p.z>55.){gl_FragColor=vec4(1.);return;}
float rn=fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(.06711056,.00583715))))*6.2832,rad=clamp(-p.z*.08,.18,.75),occ=0.;
vec3 t=normalize(vec3(cos(rn),sin(rn),0.)-n*dot(vec3(cos(rn),sin(rn),0.),n)),bt=cross(n,t);
for(int i=0;i<10;i++){float fi=float(i),a=fi*2.4,z=(fi+.5)/10.,rr=sqrt(1.-z*z*.8);vec3 s=(t*cos(a)*rr+bt*sin(a)*rr+n*(z*.9+.1))*rad*mix(.25,1.,z*z);vec3 sp=p+s;vec4 o=uP*vec4(sp,1.);vec2 suv=o.xy/o.w*.5+.5;
float sz=vp(suv).z;occ+=step(sp.z+.03,sz)*smoothstep(0.,1.,rad/abs(p.z-sz));}
float ao=1.-occ/10.*.6;ao=mix(ao,1.,smoothstep(35.,55.,-p.z));gl_FragColor=vec4(ao,ao,ao,1.);}`});
this.cM=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:{tDiffuse:{value:null},tDepth:{value:null},tAO:{value:this.aoRT.texture},uIVP:{value:new THREE.Matrix4()},uPVP:{value:new THREE.Matrix4()},uNF:{value:new THREE.Vector2(.05,100)},uMB:{value:0},uAO:{value:1},uPx:{value:new THREE.Vector2(2/w,2/h)}},vertexShader:PPV,fragmentShader:`
uniform sampler2D tDiffuse,tDepth,tAO;uniform mat4 uIVP,uPVP;uniform vec2 uNF,uPx;uniform float uMB,uAO;varying vec2 vUv;
float lz(float d){return uNF.x*uNF.y/(uNF.y-d*(uNF.y-uNF.x));}
void main(){float d=texture2D(tDepth,vUv).x,z=lz(d);vec3 c=texture2D(tDiffuse,vUv).rgb;
if(uMB>0.&&z>1.3){vec4 w=uIVP*vec4(vUv*2.-1.,d*2.-1.,1.);w/=w.w;vec4 q=uPVP*w;vec2 v=(vUv-(q.xy/q.w*.5+.5))*uMB;float l=length(v);
if(q.w>0.&&l>.0012){v*=min(1.,.035/l);float n=1.,j=fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(.06711056,.00583715))))-.5;
for(int i=0;i<7;i++){vec2 u=vUv+v*((float(i)+j)/6.-.5);if(u.x<0.||u.x>1.||u.y<0.||u.y>1.)continue;if(lz(texture2D(tDepth,u).x)<1.3)continue;c+=texture2D(tDiffuse,u).rgb;n+=1.;}c/=n;}}
if(uAO>0.){float a=(texture2D(tAO,vUv+uPx*vec2(-.5,-.5)).r+texture2D(tAO,vUv+uPx*vec2(.5,-.5)).r+texture2D(tAO,vUv+uPx*vec2(-.5,.5)).r+texture2D(tAO,vUv+uPx*vec2(.5,.5)).r)*.25;c*=mix(1.,a*a,uAO*.9);}
gl_FragColor=vec4(c,1.);}`});
this.q1=new THREE.FullScreenQuad(this.aoM);this.q2=new THREE.FullScreenQuad(this.cM)}
render(r,wb,rb){const a=this.aoM.uniforms,c=this.cM.uniforms;a.tDepth.value=c.tDepth.value=rb.depthTexture;c.tDiffuse.value=rb.texture;a.uNF.value.set(C.near,C.far);c.uNF.value.set(C.near,C.far);a.uPI.value.copy(C.projectionMatrixInverse);a.uP.value.copy(C.projectionMatrix);
if(c.uAO.value>0){r.setRenderTarget(this.aoRT);this.q1.render(r)}r.setRenderTarget(this.renderToScreen?null:wb);this.q2.render(r)}
dispose(){this.aoRT.dispose();this.aoM.dispose();this.cM.dispose()}}
const FXAA_={uniforms:{tDiffuse:{value:null},uPx:{value:new THREE.Vector2(1/1280,1/720)}},vertexShader:PPV,fragmentShader:`
uniform sampler2D tDiffuse;uniform vec2 uPx;varying vec2 vUv;float L(vec3 c){return dot(c,vec3(.299,.587,.114));}
void main(){vec3 m=texture2D(tDiffuse,vUv).rgb;float lm=L(m),nw=L(texture2D(tDiffuse,vUv+vec2(-1.,-1.)*uPx).rgb),ne=L(texture2D(tDiffuse,vUv+vec2(1.,-1.)*uPx).rgb),sw=L(texture2D(tDiffuse,vUv+vec2(-1.,1.)*uPx).rgb),se=L(texture2D(tDiffuse,vUv+vec2(1.,1.)*uPx).rgb);
float mn=min(lm,min(min(nw,ne),min(sw,se))),mx=max(lm,max(max(nw,ne),max(sw,se)));if(mx-mn<max(.03,mx*.1)){gl_FragColor=vec4(m,1.);return;}
vec2 dir=vec2(-((nw+ne)-(sw+se)),(nw+sw)-(ne+se));float rd=1./(min(abs(dir.x),abs(dir.y))+max((nw+ne+sw+se)*.03125,.0078125));dir=clamp(dir*rd,-8.,8.)*uPx;
vec3 a=.5*(texture2D(tDiffuse,vUv+dir*(1./3.-.5)).rgb+texture2D(tDiffuse,vUv+dir*(2./3.-.5)).rgb),b=a*.5+.25*(texture2D(tDiffuse,vUv-dir*.5).rgb+texture2D(tDiffuse,vUv+dir*.5).rgb);float lb=L(b);gl_FragColor=vec4(lb<mn||lb>mx?a:b,1.);}`};
function ppInit(){try{if(PP.comp){PP.comp.renderTarget1.dispose();PP.comp.renderTarget2.dispose();if(PP.comp.renderTarget1.depthTexture)PP.comp.renderTarget1.depthTexture.dispose();if(PP.comp.renderTarget2.depthTexture)PP.comp.renderTarget2.depthTexture.dispose();PP.gfx.dispose();PP.bloom.dispose&&PP.bloom.dispose()}
const pr=R.getPixelRatio(),w=Math.max(2,Math.floor(innerWidth*pr)),h=Math.max(2,Math.floor(innerHeight*pr)),mk=()=>{const t=new THREE.WebGLRenderTarget(w,h,{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat,stencilBuffer:false});t.depthTexture=new THREE.DepthTexture(w,h);t.depthTexture.type=THREE.UnsignedIntType;return t};
const c=new THREE.EffectComposer(R,mk());c.renderTarget2.dispose();c.renderTarget2=mk();c.writeBuffer=c.renderTarget1;c.readBuffer=c.renderTarget2;c.setPixelRatio(1);c.setSize(w,h);c.renderTarget1.depthTexture.image.width=c.renderTarget2.depthTexture.image.width=w;c.renderTarget1.depthTexture.image.height=c.renderTarget2.depthTexture.image.height=h;
c.addPass(new THREE.RenderPass(S,C));PP.gfx=new GfxPass(w,h);c.addPass(PP.gfx);PP.bloom=new THREE.UnrealBloomPass(new THREE.Vector2(w>>1,h>>1),.38,.55,.86);c.addPass(PP.bloom);PP.fxaa=new THREE.ShaderPass(FXAA_);PP.fxaa.uniforms.uPx.value.set(1/w,1/h);c.addPass(PP.fxaa);PP.comp=c;PP.first=true}catch(e){console.warn('post-traitement indisponible',e);PP.comp=null;PP.on=false}}
function ppRender(dt){if(!PP.on||!PP.comp||!(PP.ssao||PP.mb||PP.bl)){R.setRenderTarget(null);R.render(S,C);return}
C.updateMatrixWorld();PP.vp.multiplyMatrices(C.projectionMatrix,C.matrixWorldInverse.copy(C.matrixWorld).invert());PP.ivp.copy(PP.vp).invert();const u=PP.gfx.cM.uniforms;u.uIVP.value.copy(PP.ivp);u.uPVP.value.copy(PP.prevVP);
u.uMB.value=PP.mb&&!PP.first&&!ac.on&&!bench?.55*Math.min(1,.02/Math.max(dt,.004)):0;u.uAO.value=PP.ssao&&!ac.on?1:0;PP.bloom.enabled=PP.bl;PP.first=false;
try{PP.comp.render(dt)}catch(e){console.warn(e);PP.on=false;R.setRenderTarget(null);R.render(S,C)}PP.prevVP.copy(PP.vp)}
// ---- qualité graphique : Auto (descend si le jeu rame) / Bas / Moyen / Élevé / Ultra — touche O
const GQ={mode:0,lvl:2,names:['Bas','Moyen','Élevé','Ultra'],fT:0,fN:0,fps:60,fr:0,shN:2,warm:0,grassN:0};
function setQuality(l){GQ.lvl=l;const q=[{pr:.75,sh:1024,ss:0,mb:0,bl:0,g:.4,n:3,post:0},{pr:1,sh:1536,ss:0,mb:0,bl:1,g:.7,n:2,post:1},{pr:1.5,sh:2048,ss:1,mb:1,bl:1,g:1,n:2,post:1},{pr:2,sh:4096,ss:1,mb:1,bl:1,g:1,n:1,post:1}][l];
R.setPixelRatio(Math.min(devicePixelRatio||1,q.pr));R.setSize(innerWidth,innerHeight);if(sun2.shadow.mapSize.x!==Math.min(q.sh,2048)){sun2.shadow.mapSize.set(Math.min(q.sh,2048),Math.min(q.sh,2048));if(sun2.shadow.map){sun2.shadow.map.dispose();sun2.shadow.map=null}}if(sun.shadow.mapSize.x!==q.sh){sun.shadow.mapSize.set(q.sh,q.sh);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null}}
PP.ssao=!!q.ss;PP.mb=!!q.mb;PP.bl=!!q.bl;PP.on=!!q.post;GQ.shN=q.n;window.GRQ=q.g;if(q.post)ppInit();GQ.warm=0;GQ.fT=GQ.fN=0}
function gqFrame(dt){GQ.fr++;sun.shadow.autoUpdate=false;sun.shadow.needsUpdate=GQ.fr%GQ.shN===0;sun2.shadow.autoUpdate=false;sun2.shadow.needsUpdate=GQ.fr%(GQ.shN*4)===1;GQ.fT+=dt;GQ.fN++;if(GQ.fN>=45){const a=GQ.fT/GQ.fN;GQ.fps=Math.round(1/a);GQ.fT=GQ.fN=0;if(GQ.warm<4)GQ.warm++;else if(GQ.mode===0&&a>.026&&GQ.lvl>0&&document.visibilityState==='visible'){setQuality(GQ.lvl-1);feed('Qualité graphique : '+GQ.names[GQ.lvl]+' (auto)')}}}
addEventListener('keydown',e=>{if(e.code==='KeyO'&&!e.repeat){GQ.mode=(GQ.mode+1)%5;setQuality(GQ.mode?GQ.mode-1:2);feed('Qualité graphique : '+(GQ.mode?GQ.names[GQ.lvl]:'Auto'))}});
addEventListener('resize',()=>{if(PP.on)ppInit()});
// HUD : ne réécrit le DOM que si le texte change
{const d=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');['atts','score','ammo'].map(i=>$(i)).concat([wxEl]).forEach(el=>{if(el)Object.defineProperty(el,'innerHTML',{configurable:true,get(){return d.get.call(this)},set(v){if(v!==this._h){this._h=v;d.set.call(this,v)}}})});
const t=Object.getOwnPropertyDescriptor(Node.prototype,'textContent');['plc','prompt'].map(i=>$(i)).forEach(el=>{if(el)Object.defineProperty(el,'textContent',{configurable:true,get(){return t.get.call(this)},set(v){if(v!==this._t){this._t=v;t.set.call(this,v)}}})})}
setQuality(2);
