// ================= COUTEAU DE COMBAT (v12) : touche Z, clic gauche = taillade, clic droit = estoc =================
const KNF={on:0,s:0,t:0,dur:.4,type:0,hit:0,alt:0};
const KN=new THREE.Group();C.add(KN);KN.visible=false;
const knSteel=L(0xbfc7cf),knEdge=L(0xe8eef2),knDark=L(0x1c1d1f),knBlack=L(0x111214);
const knHandR=mkHand(true,KN),knHandL=mkHand(false,KN);
const knArm=(h,rx,ry)=>{if(h.userData.rig)return;const f=h.children[h.children.length-1];f.rotation.set(rx,ry,0);f.position.set(0,-.07,.2);f.scale.set(.85,.8,.9)};knArm(knHandR,.1,-1.0);knArm(knHandL,.5,.25);
// couteau : tenu dans la main droite, axe de poignée = x local de la main (la main est tournée pour que la lame monte)
{const k=new THREE.Group();knHandR.add(k);k.position.set(0,-.035,-.02);k.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(-1,0,0),new THREE.Vector3(0,0,1),new THREE.Vector3(0,1,0)));
KND.forEach((d,j)=>{const G=creaseGeo(d.p,d.i,.7,d.c,1e4);const mt=new THREE.MeshStandardMaterial({vertexColors:true,roughness:j===1?.38:.62,metalness:j===1?.55:.15,envMapIntensity:.9});
const m=new THREE.Mesh(G,mt);m.frustumCulled=false;k.add(m)})}
// prise « marteau » : lame vers l'avant (légèrement relevée et rentrée), poing à droite, avant-bras qui revient vers l'épaule ; main gauche ouverte en garde
function knPose(bl,d,pos,lpos,lrot){bl=new THREE.Vector3(...bl).normalize();const ex=bl.clone().negate();d=new THREE.Vector3(...d).normalize();const ez=d.sub(ex.clone().multiplyScalar(d.dot(ex))).normalize(),ey=new THREE.Vector3().crossVectors(ez,ex);knHandR.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(ex,ey,ez));knHandR.position.set(...pos);knHandL.position.set(...lpos);knHandL.rotation.set(...lrot)}
knPose([-.25,.3,-.92],[.5,-.62,.6],[.21,-.21,-.45],[-.21,-.22,-.46],[1,-.4,.1]);hPose(knHandL.userData.rig,[.3,.32,.35,.4],.25);
let knClk=0;
function knAtk(type){if(KNF.t>0||P.hp<=0||ac.on||bench)return;KNF.type=type;KNF.dur=type?.34:.42;KNF.t=KNF.dur;KNF.hit=0;snd(type?240:180,.07,.13,'sawtooth');noise(P.x,P.z,6)}
function knStrike(){const o=C.getWorldPosition(new THREE.Vector3()),d=C.getWorldDirection(new THREE.Vector3());let best=null,bz='t',bd=9;
for(const b of bots){if(b.dead>0||b.dead===true)continue;const g=b.g.position;if(Math.hypot(g.x-o.x,g.z-o.z)>3.2)continue;RC.set(o,d);RC.far=2.15;RC.far=2.6;let ph=RC.intersectObjects(b.parts)[0];if(!ph){const dx=g.x-o.x,dz=g.z-o.z,dl=Math.hypot(dx,dz)||1;if(dl>2.4||(dx*d.x+dz*d.z)/dl/(Math.hypot(d.x,d.z)||1)<.8||Math.abs(g.y+1-o.y)>1.4)continue;ph={distance:dl,object:{userData:{zone:'t'}}}}if(ph.distance>=bd)continue;RC.far=ph.distance;if(RC.intersectObjects(ray).find(q=>!q.object.userData.glass))continue;bd=ph.distance;best=b;bz=ph.object.userData.head?'h':(ph.object.userData.zone||'t')}
if(!best){snd(120,.05,.08,'square');return}
const b=best,fx=Math.sin(b.yaw),fz=Math.cos(b.yaw),behind=((P.x-b.g.position.x)*fx+(P.z-b.g.position.z)*fz)<0&&!b.see;
let dm=KNF.type?(bz==='h'?110:85):(bz==='h'?90:60);if(behind)dm=300;b.pk=1;bhHit(b,bz,dm,'b');snd(90,.08,.2,'square');
if(b.hp>0||!behind)aiHit(b);FXP&&(FXP.shake=Math.max(FXP.shake||0,.25))}
addEventListener('mousedown',e=>{if(!KNF.on||bench||ac.on||$('ov').style.display!=='none'||(typeof INV!=='undefined'&&INV.open))return;if(e.button===0)knAtk(0);else if(e.button===2)knAtk(1)});
addEventListener('keydown',e=>{if(e.code!=='KeyZ'||e.repeat||bench||ac.on||$('ov').style.display!=='none'||(typeof INV!=='undefined'&&INV.open)||reloading>0)return;KNF.on=KNF.on?0:1;ads=false;hlMsg(KNF.on?'Couteau de combat · clic gauche : taillade · clic droit : estoc · Z : ranger':'Arme rangée le couteau')});
function knUpdate(dt){const on=KNF.on&&!bench&&!ac.on&&P.hp>0;if(!on&&KNF.on&&P.hp<=0)KNF.on=0;KNF.s+=((on?1:0)-KNF.s)*Math.min(1,dt*9);KN.visible=KNF.s>.03;gun.scale.setScalar(on||KNF.s>.5?.0001:1);if(!KN.visible)return;
let px=0,py=0,pz=0,rx=0,ry=0,rz=0;const ph=KNF.t>0?1-KNF.t/KNF.dur:0,sw=Math.sin(Math.PI*ph);
if(KNF.t>0){KNF.t-=dt;if(!KNF.hit&&ph>.38){KNF.hit=1;knStrike()}
if(KNF.type){pz=-.26*sw;py=.03*sw;rx=-.35*sw}else{const a=(ph-.5)*2;px=-.3*a;ry=-.9*a;rz=.5*a;py=.04*sw;pz=-.1*sw}}
const bob=Math.sin(Date.now()*.0026)*.004;
KN.position.set(px,py-.5*(1-KNF.s)+bob,pz);KN.rotation.set(rx-.05,ry,rz);}
