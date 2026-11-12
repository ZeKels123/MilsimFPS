// ================= COUTEAU DE COMBAT (v12) : touche Z, clic gauche = taillade, clic droit = estoc =================
const KNF={on:0,s:0,t:0,dur:.4,type:0,hit:0,alt:0};
const KN=new THREE.Group();C.add(KN);KN.visible=false;
const knSteel=L(0xbfc7cf),knEdge=L(0xe8eef2),knDark=L(0x1c1d1f),knBlack=L(0x111214);
const knHandR=mkHand(true,KN),knHandL=mkHand(false,KN);
const knArm=(h,rx,ry)=>{const f=h.children[h.children.length-1];f.rotation.set(rx,ry,0);f.position.set(0,-.07,.2);f.scale.set(.85,.8,.9)};knArm(knHandR,.1,-1.0);knHandR.children[knHandR.children.length-1].position.set(-.13,-.03,.2);knArm(knHandL,.5,.25);
// couteau : tenu dans la main droite, axe de poignée = x local de la main (la main est tournée pour que la lame monte)
{const k=new THREE.Group();knHandR.add(k);k.position.set(0,.02,-.075);
bx(.115,.025,.025,0,0,0,knBlack,k);for(let i=-2;i<=2;i++)bx(.006,.027,.027,i*.02,0,0,knDark,k);
bx(.012,.03,.045,.062,0,0,knSteel,k);bx(.012,.05,.012,.062,0,0,knSteel,k);
bx(.13,.034,.0045,.13,.0,0,knSteel,k);bx(.13,.006,.006,.13,-.017,0,knEdge,k);bx(.1,.012,.003,.115,.012,0,knDark,k);
const tp=bx(.04,.03,.0045,.215,.0,0,knSteel,k);tp.scale.y=.7;bx(.02,.015,.0045,.24,-.005,0,knEdge,k);bx(.018,.03,.03,-.067,0,0,knSteel,k)}
knHandR.rotation.set(-.55,0,1.5708);knHandR.position.set(.11,-.17,-.36);
knHandL.position.set(-.16,-.22,-.32);knHandL.rotation.set(-.25,.35,-.2);
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
