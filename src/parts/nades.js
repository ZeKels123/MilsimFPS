
// ================= GRENADES (v5) : frag, flash, assourdissante — effets sur le joueur et sur les bots =================
const NG_=13,NT=[{n:'Frag',fuse:2.8,col:0x3f4d2c},{n:'Flash',fuse:1.9,col:0xc8c8c8},{n:'Assourdissante',fuse:2.1,col:0x2c3c5c}],NADE={inv:[2,2,2],sel:0,list:[],cd:0,pool:[]};
const FXP={flash:0,flashMax:1,stun:0,stunK:0,shake:0,ring:null,blur:'',warn:0};let SENS=1;
{const mk=(css,html)=>{const d=document.createElement('div');d.style.cssText='position:fixed;pointer-events:none;'+css;if(html)d.innerHTML=html;document.body.appendChild(d);return d};
FXP.elF=mk('inset:0;background:#fff;opacity:0;z-index:6');FXP.elS=mk('inset:0;opacity:0;z-index:5;background:radial-gradient(ellipse at 50% 50%,rgba(0,0,0,0) 25%,rgba(10,14,20,.85) 100%)');
FXP.elN=mk('right:18px;bottom:74px;font:13px monospace;color:#dfe8d0;text-align:right;text-shadow:0 1px 3px #000;z-index:5;line-height:1.5');
FXP.elW=mk('left:50%;top:62%;transform:translateX(-50%);font:bold 15px monospace;color:#ff5a3a;text-shadow:0 0 8px #000;z-index:5;letter-spacing:.08em;display:none');
FXP.elD=mk('left:50%;top:50%;width:0;height:0;z-index:5;opacity:0;transition:opacity .5s','<div style="position:absolute;left:-46px;top:-150px;width:92px;height:26px;border-top:5px solid #ff3a20;border-radius:50%/100% 100% 0 0;filter:drop-shadow(0 0 6px #f20)"></div>');
const gg=new THREE.CylinderGeometry(.045,.045,.13,8);for(let i=0;i<10;i++){const m=new THREE.Mesh(gg,std(0x3f4d2c,{roughness:.5,metalness:.5}));m.castShadow=true;m.visible=false;S.add(m);NADE.pool.push(m)}}
const nfL=new THREE.PointLight(0xffffff,0,60);S.add(nfL);const nfS=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));nfS.visible=false;S.add(nfS);
function dmgDir(x,z){const a=Math.atan2(x-P.x,z-P.z)-P.yaw+Math.PI;FXP.elD.style.transform='rotate('+(-a)+'rad)';FXP.elD.style.opacity=1;clearTimeout(FXP.dT);FXP.dT=setTimeout(()=>FXP.elD.style.opacity=0,700)}
function nadeReset(){NADE.inv=[2,2,2];FXP.flash=0;FXP.stun=0;FXP.shake=0}
function throwNade(type,pos,vel,owner){const m=NADE.pool.find(q=>!q.visible);if(!m)return;m.material.color.setHex(NT[type].col);m.position.copy(pos);m.visible=true;NADE.list.push({type,p:m.position,v:vel,m,t:NT[type].fuse+(owner?.3:0),owner,rest:false,wet:false})}
function playerThrow(){const k=NADE.sel;if(NADE.inv[k]<=0||NADE.cd>0||bench||ac.on||plateT>0)return;NADE.inv[k]--;NADE.cd=.9;drawT=.45;cd=Math.max(cd,.5);inspT=0;C.updateMatrixWorld();const d=new THREE.Vector3(0,0,-1).applyQuaternion(C.quaternion),p=C.position.clone().addScaledVector(d,.45);p.y-=.12;
throwNade(k,p,d.multiplyScalar(17).add(new THREE.Vector3(0,3.6,0)),null);snd(420,.09,.12,'triangle')}
addEventListener('keydown',e=>{if(e.repeat||$('ov').style.display!=='none')return;if(e.code==='KeyC'&&!inZ(P.x,P.z))playerThrow();if(e.code==='KeyU')NADE.sel=(NADE.sel+1)%3});
addEventListener('wheel',e=>{if(!ads&&!bench&&!ac.on)NADE.sel=(NADE.sel+(e.deltaY>0?1:2))%3});
const _nn=new THREE.Vector3(),_nd=new THREE.Vector3(),_no=new THREE.Vector3();
function nadeStep(n,dt){const p=n.p,v=n.v;if(n.rest)return;v.y-=NG_*dt;const sp=v.length(),st=sp*dt;if(st>1e-5){_nd.copy(v).multiplyScalar(1/sp);RC.set(p,_nd);RC.far=st+.06;const h=RC.intersectObjects(solids)[0];
if(h){if(h.object.userData.glass){glassHit(h.object,h.point,_nd);glassHit(h.object,h.point,_nd);v.multiplyScalar(.55)}else{_nn.copy(h.face.normal).transformDirection(h.object.matrixWorld);if(_nn.dot(_nd)>0)_nn.negate();p.copy(h.point).addScaledVector(_nn,.07);v.reflect(_nn).multiplyScalar(.4);if(sp>3&&Math.hypot(p.x-P.x,p.z-P.z)<40)sndAt(p.x,p.y,p.z,520,.05,.14,'square',{ref:3});return}}}
p.addScaledVector(v,dt);const gy=groundAt(p.x,p.z,p.y+.25,.25)+.05;if(!n.wet&&p.y<WL&&wDep(p.x,p.z)>.1){n.wet=true;v.multiplyScalar(.3);sndAt(p.x,p.y,p.z,260,.2,.2,'triangle',{ref:4});for(let i=0;i<8;i++)emit(_no.set(p.x,WL+.05,p.z),_e.set(rnd(-1,1),rnd(1.5,3.2),rnd(-1,1)),{color:0xd8e8e8,size:.09,life:.6,a:.6,g:6,grow:.3})}
if(p.y<gy){p.y=gy;_nn.set(GH(p.x-.3,p.z)-GH(p.x+.3,p.z),.6,GH(p.x,p.z-.3)-GH(p.x,p.z+.3)).normalize();if(GSUP)_nn.set(0,1,0);const vn=v.dot(_nn);if(vn<0){v.addScaledVector(_nn,-vn*1.38);v.multiplyScalar(n.wet?.3:.62)}if(sp>3&&Math.hypot(p.x-P.x,p.z-P.z)<40)sndAt(p.x,p.y,p.z,380,.05,.13,'square',{ref:3});if(v.length()<.7){n.rest=true;v.set(0,0,0)}}
p.x=Math.max(-MH+.7,Math.min(MH-.7,p.x));p.z=Math.max(-MH+.7,Math.min(MH-.7,p.z));n.m.rotation.x+=sp*dt*3;n.m.rotation.z+=sp*dt*2}
function nadeLOS(n,x,y,z){return losClear(n.p.x,n.p.y+.35,n.p.z,x,y,z)}
function tinnitus(k,dur){try{AC=AC||new AudioContext();const o=AC.createOscillator(),g=AC.createGain();o.type='sine';o.frequency.value=3350;g.gain.setValueAtTime(.0001,AC.currentTime);g.gain.exponentialRampToValueAtTime(Math.max(.002,.09*k),AC.currentTime+.05);g.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+dur);o.connect(g);g.connect(AC['destination']);o.start();o.stop(AC.currentTime+dur+.1);
AOUT();ALP.frequency.cancelScheduledValues(AC.currentTime);ALP.frequency.setValueAtTime(Math.max(260,2400*(1-k)),AC.currentTime+.02);ALP.frequency.exponentialRampToValueAtTime(20000,AC.currentTime+dur)}catch(e){}}
function stunPlayer(k,dur){if(k<=.03||ac.on)return;FXP.stun=Math.max(FXP.stun,dur);FXP.stunMax=Math.max(dur,FXP.stun);FXP.stunK=Math.max(FXP.stunK,k);tinnitus(k,dur)}
function nadeBoom(n){const x=n.p.x,y=n.p.y,z=n.p.z,mine=!n.owner,pdx=P.x-x,pdz=P.z-z,pd=Math.hypot(pdx,pdz,P.gy+P.bh-y),pz_=inZ(P.x,P.z)||ac.on,wet=n.wet?.55:1;n.m.visible=false;noise(x,z,90);
if(n.type===0){const R_=7.5*wet;boom(x,z,4.2*wet);sfxBoom(x,y,z,1);FXP.shake=Math.max(FXP.shake,Math.max(0,1-pd/22)*1.2);
for(let i=0;i<14;i++)emit(_no.set(x,y+.2,z),_e.set(rnd(-1,1),rnd(.2,1),rnd(-1,1)).normalize().multiplyScalar(rnd(9,16)),{map:sparkT,color:0xffc870,size:.05,life:.35,add:1,g:6});
for(const b of bots){if(b.dead)continue;const g=b.g.position,d=Math.hypot(g.x-x,g.z-z,g.y+1-y);if(d>R_)continue;hlBlastBot(b,new THREE.Vector3(x,y,z),R_,n,mine);if(b.hp<=0){if(mine)onKill(b,false);else botDie(b)}else{b.bl=null;if(mine){aiHit(b);b.flinch=1}}if(!b.dead&&d<5)b.stun=Math.max(b.stun,1.2)}
if(!pz_&&pd<R_){hlBlastPlayer(new THREE.Vector3(x,y,z),R_,n);if(pd<5.5)stunPlayer(.35*(1-pd/5.5),2.2)}
doors.forEach(d=>{if(!d.dead&&Math.hypot(d.x-x,d.z-z)<3.6)hurtDoor(d,130)});GLASS.forEach(m=>{const q=m.userData.glass;if(q&&!q.dead){m.getWorldPosition(_no);if(_no.distanceTo(n.p)<6.5){_nd.subVectors(_no,n.p).normalize();glassHit(m,_no.clone(),_nd);glassHit(m,_no.clone(),_nd)}}})}
else if(n.type===1){sndAt(x,y,z,2400,.22,.5,'square',{ref:34,roll:.7,ad:90,noocc:0});sndAt(x,y,z,900,.35,.35,'sawtooth',{ref:34,roll:.7,ad:90,noocc:0});nfL.position.set(x,y+.4,z);nfL.intensity=70;nfS.position.set(x,y+.2,z);nfS.visible=true;nfS.material.opacity=1;nfS.scale.setScalar(.6);
for(let i=0;i<10;i++)emit(_no.set(x,y+.2,z),_e.set(rnd(-1,1),rnd(0,1),rnd(-1,1)).multiplyScalar(4),{color:0xffffff,size:.25,grow:1.5,life:.5,a:.5,drag:3});
if(!pz_&&pd<26*wet){const los=nadeLOS(n,C.position.x,C.position.y,C.position.z);C.getWorldDirection(_nd);_no.set(x-C.position.x,y+.3-C.position.y,z-C.position.z).normalize();const dt_=_nd.dot(_no),f=dt_>.25?1:dt_>-.3?.55:.22,k=Math.max(0,Math.min(1,1.3-pd/20))*f*(los?1:pd<4?.25:0);
if(k>.04){FXP.flash=Math.max(FXP.flash,1+4.2*k);FXP.flashMax=FXP.flash;stunPlayer(.25*k,2.5)}}
for(const b of bots){if(b.dead)continue;const g=b.g.position,d=Math.hypot(g.x-x,g.z-z);if(d>22*wet||!nadeLOS(n,g.x,g.y+1.55,g.z))continue;let da=Math.atan2(x-g.x,z-g.z)-b.yaw;da=Math.abs(Math.atan2(Math.sin(da),Math.cos(da)));b.blind=Math.max(b.blind,(2.2+3.8*Math.max(0,1-d/22))*(da<1.4?1:.4));b.see=false;b.path=null;b.cr=0}}
else{const R_=10.5*wet;sndAt(x,y,z,48,.5,.6,'sawtooth',{ref:34,roll:.7,ad:90,noocc:0});sndAt(x,y,z,1600,.12,.45,'square',{ref:34,roll:.7,ad:90,noocc:0});boom(x,z,1.6);FXP.shake=Math.max(FXP.shake,Math.max(0,1-pd/16)*1.6);
for(let i=0;i<12;i++){const a=i/12*6.28;emit(_no.set(x,y+.15,z),_e.set(Math.cos(a)*7,.6,Math.sin(a)*7),{color:0xcfc8b8,size:.3,grow:1.6,life:.7,a:.4,drag:3.2})}
if(!pz_&&pd<R_){const k=(1-pd/R_)*(nadeLOS(n,P.x,P.gy+P.bh-.1,P.z)?1:.5);stunPlayer(Math.min(1,.25+k),2+4.2*k);if(k>.3)hlApply('h',9*k,'o',null)}
for(const b of bots){if(b.dead)continue;const g=b.g.position,d=Math.hypot(g.x-x,g.z-z);if(d>R_)continue;const k=(1-d/R_)*(nadeLOS(n,g.x,g.y+1.2,g.z)?1:.5);b.stun=Math.max(b.stun,2.2+3.8*k);b.see=false;b.path=null;b.cr=0;b.flinch=1;if(mine)b.lk.x=x,b.lk.z=z}
GLASS.forEach(m=>{const q=m.userData.glass;if(q&&!q.dead){m.getWorldPosition(_no);if(_no.distanceTo(n.p)<4){_nd.subVectors(_no,n.p).normalize();glassHit(m,_no.clone(),_nd)}}})}}
function nadeUpdate(dt,inz){NADE.cd-=dt;if(inz&&(NADE.inv[0]<2||NADE.inv[1]<2||NADE.inv[2]<2)){NADE.inv=NADE.inv.map(v=>Math.max(2,v));feed('Grenades réapprovisionnées')}
let wd=99,wa=0;for(let i=NADE.list.length-1;i>=0;i--){const n=NADE.list[i];nadeStep(n,dt*.5);nadeStep(n,dt*.5);n.t-=dt;if(n.type===0){const d=Math.hypot(n.p.x-P.x,n.p.z-P.z);if(d<wd){wd=d;wa=Math.atan2(n.p.x-P.x,n.p.z-P.z)}}
if(n.type===0&&n.t<1&&(n.t*8|0)%2===0)emit(n.p,_e.set(0,.3,0),{color:0xff4020,size:.05,life:.08,add:1});if(n.t<=0){NADE.list.splice(i,1);nadeBoom(n)}}
if(wd<9&&!ac.on){let a=wa-P.yaw+Math.PI;a=Math.atan2(Math.sin(a),Math.cos(a));FXP.elW.style.display='block';FXP.elW.textContent='⚠ GRENADE '+(Math.abs(a)<.6?'DEVANT':Math.abs(a)>2.5?'DERRIÈRE':a>0?'À GAUCHE':'À DROITE')+' · '+wd.toFixed(0)+' m'}else if(FXP.elW.style.display!=='none')FXP.elW.style.display='none';
// lumière / sphère du flash
if(nfL.intensity>0){nfL.intensity=Math.max(0,nfL.intensity-dt*420);nfS.scale.multiplyScalar(1+dt*14);nfS.material.opacity=Math.max(0,nfS.material.opacity-dt*5);if(nfS.material.opacity<=0)nfS.visible=false}
// effets joueur
FXP.flash=Math.max(0,FXP.flash-dt);FXP.stun=Math.max(0,FXP.stun-dt);FXP.shake=Math.max(0,FXP.shake-dt*2.2);if(FXP.stun<=0)FXP.stunK=0;
const fo=Math.min(1,FXP.flash/1.7),so=FXP.stun>0?Math.min(1,FXP.stun/1.5)*FXP.stunK:0;FXP.elF.style.opacity=ac.on?0:fo*fo*(3-2*fo);FXP.elS.style.opacity=so*.9;
PSTUN=so>.05?1-.5*Math.min(1,so*1.4):1;SENS=so>.05?1-.55*Math.min(1,so*1.4):1;
if(!ac.on){const bl=so>.06?'blur('+(so*5).toFixed(1)+'px) saturate('+(1-so*.6).toFixed(2)+')':'';if(bl!==FXP.blur){FXP.blur=bl;R.domElement.style.filter=bl}}
const h='<span style="opacity:.6">[C] lancer · molette / [U] type</span><br>'+NT.map((t,k)=>(k===NADE.sel?'<b style="color:#c8f07a">▸ ':'<span style="opacity:.7">')+t.n+' ×'+NADE.inv[k]+(k===NADE.sel?'</b>':'</span>')).join(' · ');if(h!==FXP.hN){FXP.hN=h;FXP.elN.innerHTML=h}FXP.elN.style.display=ac.on||bench?'none':'block'}
function camFx(dt){const s=FXP.shake,k=FXP.stun>0?Math.min(1,FXP.stun/1.5)*FXP.stunK:0,t=performance.now()*.001;if(s>0){C.rotation.x+=(Math.random()-.5)*.05*s;C.rotation.y+=(Math.random()-.5)*.05*s;C.rotation.z+=(Math.random()-.5)*.04*s}
if(k>0){C.rotation.z+=Math.sin(t*2.1)*.09*k;C.rotation.x+=Math.sin(t*1.5+1)*.04*k;C.rotation.y+=Math.cos(t*1.2)*.05*k}}
