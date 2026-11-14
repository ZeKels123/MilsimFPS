import re,os
P=os.path.dirname(os.path.abspath(__file__))+'/'
s=open(P+'orig.html',encoding='utf-8').read()
rd=lambda n:open(P+'parts/'+n,encoding='utf-8').read()
def rep(old,new,cnt=1):
    global s
    assert s.count(old)==cnt,(s.count(old),old[:80])
    s=s.replace(old,new)
# 0. script externe inconnu (Discord CDN) supprimé
a=s.index("<script type='text/javascript' src='https://cdn.discordapp.com");b=s.index("</script>",a)+9
s=s[:a]+s[b:]
# 1. CSS + overlays
css='''#vig{position:fixed;inset:0;pointer-events:none;background:radial-gradient(ellipse at 50% 50%,transparent 55%,rgba(0,0,0,.42) 100%)}
#grain{position:fixed;inset:-100px;pointer-events:none;opacity:.05;mix-blend-mode:overlay;animation:grn .5s steps(5) infinite}
@keyframes grn{0%{transform:translate(0,0)}20%{transform:translate(-30px,20px)}40%{transform:translate(25px,-35px)}60%{transform:translate(-45px,-10px)}80%{transform:translate(20px,40px)}100%{transform:translate(0,0)}}
#atts,#score{backdrop-filter:blur(4px);border-left:2px solid var(--ac)}
#hpb{box-shadow:0 0 8px rgba(156,204,78,.18)}
#ammo{font-weight:700;letter-spacing:.04em;text-shadow:0 0 14px rgba(156,204,78,.35),0 2px 4px #000}
#cross i{box-shadow:0 0 2px #000}
'''
rep('</style>',css+'</style>')
rep('const q=Math.hypot(P.x-d.x,P.z-d.z);if(q<nds){nds=q;nd=d}','const q=Math.hypot(P.x-d.x,P.z-d.z)+(Math.abs(P.gy-GH(d.x,d.z))>1.6?99:0);if(q<nds){nds=q;nd=d}')
rep('<div id="atts" class="h"></div>','<div id="vig"></div><div id="grain"></div><div id="atts" class="h"></div>')
# 2. rendu / ciel / textures / sol
a=s.index('const R=new THREE.WebGLRenderer({antialias:true});');e='floor.rotation.x=-Math.PI/2;S.add(floor);'
b=s.index(e)+len(e)
s=s[:a]+rd('gfx_head.js')+rd('tex.js')+s[b:]
# 3. box / murs / portes / salles
rep("function box(x,z,w,h,d,c){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),L(c));m.position.set(x,h/2,z);",
    "function box(x,z,w,h,d,c){const mt=surf(c),k=mt.userData.k,bg=new THREE.BoxGeometry(w,h,d,1,k==='wall'?Math.max(1,Math.round(h)):1,1);if(k==='wall'){wuv(bg,x,h/2,z,2,2);grime(bg,h/2)}else if(k==='wood')fitUV(bg,w,h,d,1.2);const m=new THREE.Mesh(bg,mt);m.castShadow=m.receiveShadow=true;m.position.set(x,h/2,z);")
rep("new THREE.MeshBasicMaterial({color:0x4aa84a,transparent:true,opacity:.28})","zoneMat")
rep("function lintel(g,f,ax){const m=new THREE.Mesh(new THREE.BoxGeometry(ax==='x'?1.2:.4,.7,ax==='x'?.4:1.2),L(0x8a8878));m.position.set(ax==='x'?g:f,2.65,ax==='x'?f:g);S.add(m);solids.push(m)}",
    "function lintel(g,f,ax){const w=ax==='x'?1.2:.4,d=ax==='x'?.4:1.2,x=ax==='x'?g:f,z=ax==='x'?f:g,bg=new THREE.BoxGeometry(w,.7,d);wuv(bg,x,2.65,z,2,2);grime(bg,2.65);const m=new THREE.Mesh(bg,surf(0x8a8878));m.castShadow=m.receiveShadow=true;m.position.set(x,2.65,z);S.add(m);solids.push(m)}")
rep("const g=.6,mat=L(0x7a5230),pv=new THREE.Group(),m=new THREE.Mesh(new THREE.BoxGeometry(2*g,2.3,.07),mat);",
    "const g=.6,mat=woodMat(0x7a5230),pv=new THREE.Group(),gd=new THREE.BoxGeometry(2*g,2.3,.07),m=(fitUV(gd,2*g,2.3,.07,1.2),new THREE.Mesh(gd,mat));m.castShadow=m.receiveShadow=true;")
rep("d.mat.color.setRGB(.48*r,.32*r,.19*r)","d.mat.color.setRGB(.6*r,.4*r,.24*r)")
rep("const fl=new THREE.Mesh(new THREE.PlaneGeometry(W,D),L(0x6d6a60));","const fgm=new THREE.PlaneGeometry(W,D);scaleUV(fgm,W/2,D/2);const fl=new THREE.Mesh(fgm,matTile);fl.receiveShadow=true;")
rep("L(0x6f6d62));ce.position.set(cx,3.08,cz);","L(0x6f6d62));ce.castShadow=ce.receiveShadow=true;ce.position.set(cx,3.08,cz);")
rep("const lt=new THREE.PointLight(0xffe2b0,.7,9);lt.position.set(cx,2.6,cz);S.add(lt);","if(!NOL){const lt=new THREE.PointLight(0xffe2b0,.7,9);lt.position.set(cx,2.6,cz);S.add(lt)}")
pr=rd('props_rest.js')
a_=pr.index('// pad de la zone sûre');b_=pr.index('// ================= TONNEAUX');pr=pr[:a_]+pr[b_:]
pr=pr.replace('[-16.8,-14.6,0x8a3028]','[-26,-6,0x8a3028]').replace('[19.5,-11.3,0x30506a]','[27,-6,0x30506a]')
pr=pr.replace("const okPos=(x,z,m)=>","const okPos=(x,z,m)=>wDist(x,z)>m+.5&&")
pr=pr.replace("const RMS=[[-29,-8,-21,0],[21,-8,29,0],[-29,-17,-21,-11],[21,-17,29,-11],[-5,-27,5,-21]].concat(HS);","const RMS=HS;")
mk="// ================= RELIEF, ROCHERS"
assert pr.count(mk)==1
pr=pr.replace(mk,rd('relief.js')+rd('nature.js')[:rd('nature.js').index('// arbres')]+mk)
pr=pr+rd('nature.js')[rd('nature.js').index('// arbres'):]+rd('nature2.js')+rd('snake_data.js')+rd('snake.js')+rd('samples_data.js')+rd('samples.js')
for a_,b_ in [("const N=110,rk=","const N=1000,rk="),("std(0xffffff,{map:gt,alphaTest:.5,roughness:1,envMapIntensity:.5})","windify(std(0xffffff,{map:gt,alphaTest:.5,roughness:1,envMapIntensity:.5}),0)"),("std(0xffffff,{roughness:1,flatShading:true,envMapIntensity:.4}),NB)","windify(std(0xffffff,{roughness:1,flatShading:true,envMapIntensity:.4}),1),NB)"),("new THREE.ConeGeometry(2.1,6.5,8),mt,N)","new THREE.ConeGeometry(2.1,6.5,8),windify(mt.clone(),2),N)"),("new THREE.ConeGeometry(1.5,4.5,8),mt,N)","new THREE.ConeGeometry(1.5,4.5,8),windify(mt.clone(),3),N)"),("rnd(-29,29),z=rnd(-29,29);if(!okPos(x,z,.4))","rnd(-MH+2,MH-2),z=rnd(-MH+2,MH-2);if(!okPos(x,z,.4)||nearPath(x,z,2))"),("const NB=46,","const NB=0,"),("let x=rnd(-28.2,28.2),z=rnd(-28.2,28.2);if(n%2){if(Math.random()<.5)x=Math.sign(x)*rnd(27.2,28.5);else z=Math.sign(z)*rnd(27.2,28.5)}","let x=rnd(-MH+2,MH-2),z=rnd(-MH+2,MH-2);if(n%2){if(Math.random()<.5)x=Math.sign(x)*rnd(MH-3,MH-1.5);else z=Math.sign(z)*rnd(MH-3,MH-1.5)}"),("while(n<7){const x=rnd(-26,26),z=rnd(-26,16)","while(n<56){const x=rnd(-MH+5,MH-5),z=rnd(-MH+5,16)"),("const N=1400,im=","const N=9000,im="),("const x=rnd(-29.5,29.5),z=rnd(-29.5,29.5);if(!okPos(x,z,.3))","break;const x=0,z=0;if(0)"),("r=rnd(48,105)","r=rnd(MH+23,MH+95)"),("[[-33,-33],[33,-33],[-33,33],[33,33]]","[[-MH-3,-MH-3],[MH+3,-MH-3],[-MH-3,MH+3],[MH+3,MH+3]]"),("o.position.set(x,s*.35,z);","o.position.set(x,s*.35+GH(x,z),z);"),("o.position.set(x,s*.38,z);","o.position.set(x,s*.38+GH(x,z),z);"),("p.position.set(x,.016,z);","p.position.set(x,.016+GH(x,z),z);"),("o.position.set(x,0,z);o.rotation.y=rnd(0,6.3)","o.position.set(x,GH(x,z),z);o.rotation.y=rnd(0,6.3)")]:
    assert pr.count(a_)==1,a_; pr=pr.replace(a_,b_)
rep("room(-25,-4,8,8,'E',-4);room(25,-4,8,8,'W',-4);room(-25,-14,8,6,'E',-14);room(25,-14,8,6,'W',-14);room(0,-24,10,6,'S',0);",
    rd('bld_head.js')+rd('bld_house.js')+rd('bld_calls.js')+rd('models.js')+rd('models2.js')+rd('hyd_data.js')+rd('city.js')+rd('extra.js')+pr)
# 4. explosions
a=s.index("function boom(x,z,r){");b=s.index("function startAC()")
s=s[:a]+s[b:]
rep("function acUpdate(dt){for(let i=expl.length-1;i>=0;i--){const e=expl[i];e.t+=dt;e.m.scale.setScalar(.3+e.r*Math.min(1,e.t/.25));e.m.material.opacity=Math.max(0,.9*(1-e.t/.6));if(e.t>.6){S.remove(e.m);expl.splice(i,1)}}",
    "function acUpdate(dt){explUpdate(dt);")
# 5. armes
rep("const dk=L(0x1c1c1c),gr=L(0x3a3d36),gun=new THREE.Group();C.add(gun);","const dk=std(0x1c1c1c,{roughness:.4,metalness:.7,envMapIntensity:1}),gr=std(0x3a3d36,{roughness:.5,metalness:.55,envMapIntensity:1}),gun=new THREE.Group();C.add(gun);")
rep("new THREE.MeshPhongMaterial({color:p.c,flatShading:true,shininess:25,specular:0x222222})","std(p.c,{flatShading:true,roughness:.42,metalness:.5,envMapIntensity:1})")
rep("PC.position.set(0,.14,1.55);PC.lookAt(0,0,-.06);","PC.position.set(0,.14,1.55);PC.lookAt(0,0,-.06);PR.toneMapping=R.toneMapping;PR.toneMappingExposure=R.toneMappingExposure;PS.environment=mkEnv(PR);")
# 6. bots
a=s.index("function mkBot(){");b=s.index("function free_(")
s=s[:a]+rd('soldier_data.js')+rd('soldier_anim.js')+rd('vest_data.js')+rd('pack_data.js')+rd('soldier.js')+rd('voix.js')+rd('bots.js')+s[b:]
rep("b.dead=0;b.g.visible=true;pick(b)}","b.dead=0;b.fall=0;b.g.rotation.x=0;b.g.visible=true;botLook(b,i);pick(b)}")
rep("b.g.visible=false;P.kills++","botDeath(b,head);P.kills++")
rep("const px=P.x-g.position.x,pz=P.z-g.position.z,pd=Math.hypot(px,pz);g.rotation.y=Math.atan2(px,pz);",
    "g.position.y=GH(g.position.x,g.position.z);botAnim(b,dt,Math.hypot(g.position.x-bx0,g.position.z-bz0)>1e-4,g.position.x-bx0,g.position.z-bz0);const px=P.x-g.position.x,pz=P.z-g.position.z,pd=Math.hypot(px,pz);g.rotation.y=Math.atan2(px,pz);")
rep("if(b.dead>0){b.dead-=dt;if(b.dead<=0)spawn(b);return}","if(b.dead>0){b.dead-=dt;botDead(b,dt);if(b.dead<=0)spawn(b);return}")
rep("V.set(g.position.x,1.6*bt.sc,g.position.z);W.set(px,0,pz).normalize();RC.set(V,W);RC.far=pd;","V.set(g.position.x,g.position.y+1.6*bt.sc,g.position.z);W.set(px,P.gy+1.55-V.y,pz);const pdd=W.length();W.normalize();")
rep("if(!RC.intersectObjects(solids)[0]){snd(bt.snd[0],bt.snd[1],bt.snd[2]);","if(!losBlock(V,W,pdd)){b.fl=.07;b.rec=1;snd(bt.snd[0],bt.snd[1],bt.snd[2]);")
# 7. tir
rep("C.updateMatrixWorld();const o=new THREE.Vector3();C.getWorldPosition(o);let hit=0,hitA=0,brk=0;","C.updateMatrixWorld();const o=new THREE.Vector3();C.getWorldPosition(o);let hit=0,hitA=0,brk=0;shotFx(c);")
rep("RC.set(o,d);RC.far=80;const h=RC.intersectObjects([...ray,...botParts])[0];","const h=castShot(o,d);if(n<3)tracer(MZ,h?h.point:_p2.copy(o).addScaledVector(d,60));")
rep("hit=1;hitT=.2;","hit=1;hitT=.2;hitFx(h,hitA,brk,u.head,b);")
rep("if(n<4){const s=new THREE.Mesh(new THREE.SphereGeometry(.04,5,5),new THREE.MeshBasicMaterial({color:0xffdd88}));s.position.copy(h.point);S.add(s);sparks.push({s,t:.25})}","if(n<4)impact(h,!!u.door);")
rep("if(u.door)hurtDoor(u.door,c.dmg*(A.supp?.9:1));","if(u.barrel)barrelHit(u.barrel,h,c.dmg);if(u.door)hurtDoor(u.door,c.dmg*(A.supp?.9:1));")
rep("RC.set(V,W);RC.far=60;const h=RC.intersectObjects([...ray,...botParts])[0];","RC.set(V,W);RC.far=60;const h=RC.intersectObjects([...ray,...botParts.filter(q=>!q.userData.bot.dead)])[0];")
# 8. fx
rep("const handR=mkHand(true),handL=mkHand(false);",rd('hand_data.js')+rd('hands3.js')+"const handR=mkHand(true),handL=mkHand(false);")
rep("// ---- Bots\n",rd('cityroad.js')+rd('merge.js')+rd('fx.js')+rd('weather.js')+rd('levels.js')+rd('audio3d.js')+rd('health.js')+rd('inventory.js')+rd('traps.js')+rd('barrels.js')+rd('vehicles.js')+rd('melee.js')+rd('ai.js')+rd('stream.js')+rd('squad.js')+rd('flash_data.js')+rd('nadeview.js')+rd('nades.js')+rd('three_post.js')+rd('post.js')+rd('menu.js')+rd('persist.js')+rd('selftest.js')+"// ---- Bots\n")
rep("PR.render(PS,PC)}R.render(S,C)}","PR.render(PS,PC)}fxFrame(dt);R.render(S,C)}")
# 10. v4 : relief, vitres, portes, armes
rep("acReady:false};","acReady:false,gy:0};")
rep("P.deaths++;P.x=0;P.z=25;","P.deaths++;P.x=0;P.z=25;repairGlass();")
rep("d.box=ax==='x'?{x0:cx-g,x1:cx+g,z0:cz-.12,z1:cz+.12}:{x0:cx-.12,x1:cx+.12,z0:cz-g,z1:cz+g};","d.box=ax==='x'?{x0:cx-g,x1:cx+g,z0:cz-.12,z1:cz+.12,y0:0,y1:2.5}:{x0:cx-.12,x1:cx+.12,z0:cz-g,z1:cz+g,y0:0,y1:2.5};")
rep("boxes.forEach(o=>{const cx=Math.max(o.x0,Math.min(P.x,o.x1))","boxes.forEach(o=>{if(P.mant||(o.y1!==undefined&&(P.gy>=o.y1-(o.stair?.62:.3)||P.gy+(P.st?1.1:1.7)<=o.y0)))return;const cx=Math.max(o.x0,Math.min(P.x,o.x1))")
rep("// penchage","lvStep(dt);\n// penchage")
rep("V.set(P.x,1.6,P.z);W.set(rx*Math.sign(off)","V.set(P.x,P.eh-.1+P.gy,P.z);W.set(rx*Math.sign(off)")
rep("C.position.set(P.x+rx*off,1.7-Math.abs(P.lean)*.14+","C.position.set(P.x+rx*off,P.eh+P.gy-Math.abs(P.lean)*.14+")
rep("dead:false,x:cx,z:cz,","dead:false,k:[.6,.4,.24],x:cx,z:cz,")
rep("d.mat.color.setRGB(.6*r,.4*r,.24*r)","d.mat.color.setRGB(d.k[0]*r,d.k[1]*r,d.k[2]*r)")
rep("const WC=[\n",rd('menu0.js')+rd('hmg_data.js')+rd('hmg.js')+rd('weapons.js')+rd('signal_data.js')+rd('signal.js')+rd('reclamer_data.js')+rd('knife_data.js')+rd('reclamer.js')+"const WC=[\n")
rep("const AMM=[30,30,15,6,5],RSV=[120,120,75,36,30]","Object.assign(WC[3],{n:'Reclamer 12',hb:{ry:-.11,rz:.01,ly:-.07,lz:-.456,zM:0,zS:-.05},mz:-.73,my:0,iy:-.06,rate:.8,rec:2.6,dmg:18,pel:9,sp:.065,snd:[85,.3,.5]});Object.assign(WC[4],{hb:{ry:-.1,rz:.04,ly:-.06,lz:-.27,zM:0,zS:-.05},n:'Signal 50',rate:.5,rec:2.7,dmg:125,cyc:0,amp:.045,mz:-.72,snd:[62,.4,.55],rt:2.2});WC.push(HMGC);const AMM=[30,30,15,6,5,100],RSV=[120,120,75,36,30,300]")
rep("reloading=RT;reloadEmpty=ammo===0;","if(WSEL===3){SGR.N=Math.ceil(Math.min(magMax()-ammo,reserve)/2);SGR.d=0;RT=.3+.62*SGR.N}reloading=RT;reloadEmpty=ammo===0;")
rep("if(reloading||plateT>0||ac.on)return;if(ammo<=0){reload();return}","if(reloading&&WSEL===3&&ammo>0){reloading=0;SGR.N=0}if(reloading||plateT>0||ac.on)return;if(ammo<=0){reload();if(!reloading&&cd<=0){smpPlay('empty',.8,1,null,0);cd=.3}return}")
rep("reloadEmpty=ammo===0;snd(300,.15,.2,'square')}","reloadEmpty=ammo===0;if(WSEL===3||!smpPlay('reload',.8,rnd(.97,1.03),null,0))snd(300,.15,.2,'square')}")
rep("ammo+=n;reserve-=n;reloading=0}}","ammo+=n;reserve-=n;reloading=0;if(reloadEmpty&&WSEL!==3)smpPlay('cock',.8,rnd(.97,1.03),null,0)}}")
rep("if(reloading>0){reloading-=dt;if(reloading<=0){","if(WSEL===3){rcSideUpd();if(reloading>0){const k=Math.min(SGR.N,Math.floor(Math.max(0,(1-reloading/RT)*RT-.15)/.62));while(SGR.d<k){SGR.d++;const n=Math.min(2,magMax()-ammo,reserve);ammo+=n;reserve-=n}}}if(reloading>0){reloading-=dt;if(reloading<=0){")
rep("Fusil à pompe <em","Reclamer 12 <em")
rep("['w_0','w_1','w_2','w_3','w_4']","['w_0','w_1','w_2','w_3','w_4','w_5']")
rep("if(WSEL===4)wm[4].rotation.z=-1.1*f;","")
rep("an=ads&&adsT>.8&&sk==='angled';","an=ads&&adsT>.8&&sk==='angled';if(WSEL===4)wg[4].visible=!sc;")
rep("scBI.visible=!(A.scope||A.angled||A.holo","(sigM.compensater||[]).forEach(m=>{m.visible=!A.supp});scBI.visible=!(A.scope||A.angled||A.holo")
rep('Fusil de précision <em></em></button>','Signal 50 <em></em></button><button id="w_5" onclick="setWeapon(5)">Mitrailleuse HMG <em></em></button>')
rep("let md=0,mv=true,mgx=0,hp=[HB.lx,HB.ly,HB.lz];","let md=0,mv=true,mgx=0,hp=[HB.lx,HB.ly,HB.lz];const WA=wAnim(WSEL,ru,ip,rl,is);")
rep("-rl*.04-is*.12-sprA*.06","+WA.x-sprA*.06")
rep("-rl*.2-dr*.3-sprA*.07+is*.04+","+WA.y-dr*.3-sprA*.07+")
rep("+WA.y-dr*.3-sprA*.07+","+WA.y-dr*.3-THR.g*.6-sprA*.07+")
rep("+kick*.04+rl*.05);","+kick*.04+WA.z);")
rep("gun.rotation.set(kick*.04+rl*.45+dr*.7+sprA*.25-is*.2,rl*.15+is*1.1+sprA*.55,t.roll*adsT+P.lean*.12+rl*.35+is*Math.sin(ip*12.6)*.5);","gun.rotation.set(kick*.04+WA.rx+dr*.7+sprA*.25,WA.ry+sprA*.55,t.roll*adsT+P.lean*.12+WA.rz);")
rep("rifleParts[4].visible=!WSEL&&mv;","if(reloading>0&&WSEL>1){const q=wHand(WSEL,ru,[HB.lx,HB.ly,HB.lz]);hp=q.h;mv=q.mv}rifleParts[4].visible=!WSEL&&mv;")
rep("const f=wc.cyc?Math.sin(Math.PI*(1-s)):s;","const f=Math.max(wc.cyc?Math.sin(Math.PI*(1-s)):s,WA.cyc);")
rep("if(ru>.17&&rlS<1)","if(WSEL<2&&ru>.17&&rlS<1)")
rep("if(ru>.6&&rlS<2)","if(WSEL<2&&ru>.6&&rlS<2)")
rep("if(reloadEmpty&&ru>.8&&rlS<3)","if(WSEL<2&&reloadEmpty&&ru>.8&&rlS<3)")
# 11. carte 150 x 150
rep("box(0,-30,60,4,1,0x6b6b60);box(0,30,60,4,1,0x6b6b60);box(-30,0,1,4,60,0x6b6b60);box(30,0,1,4,60,0x6b6b60);","box(0,-MH,2*MH,5,1,0x6b6b60);box(0,MH,2*MH,5,1,0x6b6b60);box(-MH,0,1,5,2*MH,0x6b6b60);box(MH,0,1,5,2*MH,0x6b6b60);")
rep("P.x=Math.max(-29.4,Math.min(29.4,P.x));P.z=Math.max(-29.4,Math.min(29.4,P.z));","P.x=Math.max(-MH+.6,Math.min(MH-.6,P.x));P.z=Math.max(-MH+.6,Math.min(MH-.6,P.z));")
rep("x=rnd(-27,27);z=rnd(-27,10)","x=rnd(-MH+5,MH-5);z=rnd(-MH+5,MH-5)")
rep("b.tx=Math.max(-27,Math.min(27,x));b.tz=Math.max(-27,Math.min(27,z))","b.tx=Math.max(-MH+5,Math.min(MH-5,x));b.tz=Math.max(-MH+5,Math.min(MH-5,z))")
rep("b.visM.emissive.setHex(i===3?0xaa1111:0x000000);","sldLook(b,i);b.visM.emissive.setHex(i===3?0xaa1111:0x000000);")
rep("function aiHit(b){if(b.dead)return;","function aiHit(b){if(b.dead)return;vxSay(b,'hit');")
rep("function botDie(b){if(b.dead)return;","function botDie(b){if(b.dead)return;{let n=null,nd=30;for(const o of bots){if(o===b||o.dead)continue;const dd=Math.hypot(o.g.position.x-b.g.position.x,o.g.position.z-b.g.position.z);if(dd<nd){nd=dd;n=o}}if(n)vxSay(n,'down',true)}")
rep("b.thr=.55;","b.thr=.55;vxSay(b,'grenade');")
rep("function aiUpdate(dt,inz){","function aiUpdate(dt,inz){vxTick(dt);")
rep('<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>',rd("loading.html")+'<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>')
rep("function loop(){requestAnimationFrame(loop);","function loop(){requestAnimationFrame(loop);window.ldDone();")
rep('<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>'+"\n<script>",'<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>'+"\n<script type=\"text/plain\" id=\"gamesrc\">")
rep("</script></body></html>","</script><script>requestAnimationFrame(function(){setTimeout(function(){var s=document.createElement('script');s.text=document.getElementById('gamesrc').textContent;document.head.appendChild(s)},80)})</script></body></html>")
rep("function botAnim(b,dt,mv,mx_,mz_){b.tm+=dt;","function botAnim(b,dt,mv,mx_,mz_){b.tm+=dt;sldUpdate(b,dt,mv);")
rep("function botDead(b,dt){b.fall+=dt;","function botDead(b,dt){b.fall+=dt;sldUpdate(b,dt,0);")
rep("b.mat=m;S.add(g);spawn(b);bots.push(b)}","b.mat=m;sldAttach(b);S.add(g);spawn(b);bots.push(b)}")
rep("for(let i=0;i<7;i++)mkBot();","for(let i=0;i<36;i++)mkBot();")
rep("C.position.set(Math.cos(ac.a)*48,62,Math.sin(ac.a)*48-6)","C.position.set(Math.cos(ac.a)*90,115,Math.sin(ac.a)*90-6)")
rep("ac.tx=Math.max(-29,Math.min(29,ac.tx+(dx*-fz-dy*fx)*k));ac.tz=Math.max(-29,Math.min(29,ac.tz+(dx*fx-dy*fz)*k))","ac.tx=Math.max(-MH+1,Math.min(MH-1,ac.tx+(dx*-fz-dy*fx)*k));ac.tz=Math.max(-MH+1,Math.min(MH-1,ac.tz+(dx*fx-dy*fz)*k))")
# 12. un seul bunker : celui d'apparition ; plus de maisons
rep("S.add(zf);","")
rep("box(-4.5,21,5,1,.6,0x5d6650);box(4.5,21,5,1,.6,0x5d6650);box(-7,25.2,.6,1,8.4,0x5d6650);box(7,25.2,.6,1,8.4,0x5d6650);box(0,28.4,3,1,1,0x7a5a36);","box(0,25.5,3,1,1,0x7a5a36);")
rep("m.position.set(a[0],1.06,28.4)","m.position.set(a[0],1.06,25.5)")
rep("BENCH={x:0,z:28.4}","BENCH={x:0,z:25.5}")
rep("bl.position.set(0,2.5,27)","bl.position.set(0,2.2,24)")
rep("const P={x:0,z:25,","const P={x:0,z:23,")
rep("P.deaths++;P.x=0;P.z=25;","P.deaths++;P.x=0;P.z=23;")
rep("[[-12,10,10,3,.6],[10,12,8,3,.6],[0,0,.6,3,12],[-14,-8,.6,3,10],[14,-6,.6,3,10],[0,-16,14,3,.6],[-20,-20,6,3,.6],[20,-20,6,3,.6]]","[[-12,12,10,3,.6],[10,13,8,3,.6],[0,0,.6,3,12],[0,-20,14,3,.6]]")
rep("[[-6,6],[6,5],[-8,-2],[8,-2],[-3,-10],[4,-12],[-22,10],[22,8],[-18,-14],[18,-12],[0,18]]","[[-6,7],[6,8],[-8,-2],[8,-2],[-3,-26],[4,-30],[0,16]]")
# 9. visée : en mode sans verrouillage du pointeur, la souris oriente la caméra (comme v1)
rep("else if(free)mx=e.clientX/innerWidth-.5});","else if(free&&!bench){if(ac.on)acMove(e.movementX,e.movementY);else{const s=C.fov/75*.0022;P.yaw-=e.movementX*s;P.pitch-=e.movementY*s}}});")
rep("if(free)P.yaw-=Math.abs(mx)>.1?mx*dt*3:0;","")
# 13. v5
rep("<tr><td>R</td><td>Recharger</td></tr>","<tr><td>R</td><td>Recharger</td></tr><tr><td>C</td><td>Lancer une grenade · molette (sans viser) ou U : frag / flash / assourdissante</td></tr><tr><td>N · M · L · O</td><td>Heure · météo · lampe · qualité graphique</td></tr>")
rep("RC=new THREE.Raycaster();","RC=new THREE.Raycaster();RC.layers.enable(1);")
rep("const spd=ads?2.2:(K.ShiftLeft?6.5:4)*(Math.abs(P.lean)>.5?.7:1);","const spd=(ads?2.2:(K.ShiftLeft&&P.st===0?6.5:4)*(Math.abs(P.lean)>.5?.7:1))*PWADE*PSTUN*STS[P.st]*(P.air?.8:1);")
rep("im.receiveShadow=true;S.add(im)}","im.receiveShadow=true;S.add(im);GRASS=im}")
s=s.replace(".connect(AC.destination)",".connect(AOUT())")
rep("PR.render(PS,PC)}fxFrame(dt);R.render(S,C)}","PR.render(PS,PC)}fxFrame(dt);gqFrame(dt);ppRender(dt)}")
rep("if(++aqF>240){","if(0){")
rep("+'<br><span style=\"opacity:.55\">[N] heure · [M] météo · [L] lampe</span>'","+'<br><span style=\"opacity:.55\">[Ctrl] posture · [P] couché · [Espace] saut / enjamber · [N] heure · [M] météo · [L] lampe · [O] qualité : '+(GQ.mode?'':'Auto · ')+GQ.names[GQ.lvl]+' · '+GQ.fps+' i/s</span>'")
a=s.index("bots.forEach(b=>{if(b.dead>0){b.dead-=dt;botDead(b,dt)");b=s.index("if(P.hp<=0){P.hp=100;")
s=s[:a]+"aiUpdate(dt,inz);nadeUpdate(dt,inz);\n"+s[b:]
rep("do{x=rnd(-MH+5,MH-5);z=rnd(-MH+5,MH-5)}while(!free_(x,z));","do{x=rnd(-MH+5,MH-5);z=rnd(-MH+5,MH-5)}while(!free_(x,z)||!aiSpawnOk(x,z));")
rep("botLook(b,i);pick(b)}","botLook(b,i);aiReset(b,i)}")
rep("hitFx(h,hitA,brk,u.head,b);","hitFx(h,hitA,brk,u.head,b);aiHit(b);")
rep("o.connect(g).connect(AOUT());o.start();o.stop(AC.currentTime+d)","o.connect(g).connect(AOUT());auSend(g);o.start();o.stop(AC.currentTime+d)")
rep("P.deaths++;P.x=0;P.z=23;","P.deaths++;P.x=0;P.z=23;lvReset();nadeReset();")
rep("C.rotation.set(P.pitch,P.yaw,-P.lean*.3)}","C.rotation.set(P.pitch,P.yaw,-P.lean*.3);camFx(dt)}")
assert s.count("const s=C.fov/75*.0022;")==2;s=s.replace("const s=C.fov/75*.0022;","const s=C.fov/75*.0022*SENS;")
# 12. v8 : animaux touchables
rep("const h=castShot(o,d);if(n<3)tracer(MZ,h?h.point:_p2.copy(o).addScaledVector(d,60));","const h=castShot(o,d);if(n<3)tracer(MZ,h?h.point:_p2.copy(o).addScaledVector(d,60));if(h&&h.object.userData.an){if(faHit(h.object.userData.an,h.point,c.dmg)){hit=1;hitT=.2;$('hit').style.opacity=1;$('hit').style.color='#fc0'}}else if(faShotBirds(o,d,h?h.distance:80,c.dmg)){hit=1;hitT=.2;$('hit').style.opacity=1;$('hit').style.color='#fc0'}")
# 13. v9 : bruitages
rep("let AC;function snd(f,d,v,type){try{","let AC;function snd(f,d,v,type){if(typeof sfx==='function'){sfx(f,d,v,type);return}try{")
rep("{const s=c.snd;snd(s[0]*(A.supp?.6:1),s[1],s[2]*(A.supp?.35:1))}","sfxGun(WSEL,A.supp);")
# 11. v7 : sante par zone
rep("function hurtP(d){if(ac.on)return;","function hurtP(d){if(ac.on)return;hlHurt(d);return;")
rep("P.hp=Math.min(100,P.hp+(head?15:10));snd(620,.18,.14,'sine');$('hpb').style.boxShadow='0 0 12px #9ccc4e';setTimeout(()=>$('hpb').style.boxShadow='none',350);","hlKill(head);")
rep("if(reloading||plateT>0||ac.on)return;if(ammo<=0)","if(reloading||plateT>0||ac.on||HM.act)return;if(ammo<=0)")
rep("cd=c.rate;kick=1;","cd=c.rate;kick=HKCK();")
rep("const sp=(ads?c.sp*.07:c.sp*((A.laser||A.grip)?.44:1))+(moving?.012:0);","const sp=((ads?c.sp*.07:c.sp*((A.laser||A.grip)?.44:1))+(moving?.012:0))*HAIM();")
rep("if(reloading>0){reloading-=dt;","if(reloading>0){reloading-=dt/HRLD();")
rep("ads=ads&&!reloading&&!bench;adsT+=((ads?1:0)-adsT)*Math.min(1,dt*10);","ads=ads&&!reloading&&!bench&&!HNOADS()&&!HM.act;adsT+=((ads?1:0)-adsT)*Math.min(1,dt*10*HADS());")
rep("(K.ShiftLeft&&P.st===0?6.5:4)","(K.ShiftLeft&&P.st===0&&HSPR()&&invSprintOK()?6.5:4)")
rep("*STS[P.st]*(P.air?.8:1);","*STS[P.st]*(P.air?.8:1)*HMV();")
rep("spr=K.ShiftLeft&&l>0&&adsT<.1;","spr=K.ShiftLeft&&l>0&&adsT<.1&&!mdown&&!(kick>.08);")
rep("HSPR()&&invSprintOK()?6.5:4)","HSPR()&&invSprintOK()&&!mdown?6.5:4)")
rep("-P.lean*.3);camFx(dt)}","-P.lean*.3);camFx(dt);hlCam(dt)}")
rep("if(u.head)b.hp-=dm*3;else if(b.ar>0){hitA=1;b.ar-=dm;if(b.ar<=0){b.hp+=b.ar;b.ar=0;b.vest.visible=false;brk=1}}else b.hp-=dm;hit=1;","{b.pk=1;const hr=bhHit(b,u.head?'h':(u.zone||'t'),dm,'b');hitA=hr.a;brk=hr.brk}hit=1;")
rep("function onKill(b,head){","function onKill(b,head){invLoot(b);")
rep('<tr><td>ZQSD / WASD</td>','<tr><td>Tab</td><td>Sac \u00e0 dos \u00b7 V : jeter le sac \u00b7 Retour : jeter des munitions \u00b7 F : ramasser</td></tr><tr><td>ZQSD / WASD</td>')
rep("P.deaths++;","P.deaths++;invDeath();")
rep("if(reloading||plateT>0||ac.on||HM.act)return;if(ammo<=0)","if(reloading||plateT>0||ac.on||HM.act||TRP.mode||KNF.on)return;if(ammo<=0)")
rep("<tr><td>Tab</td>","<tr><td>B</td><td>Poser un piège (clic maintenu) · 9 : télécommande · F maintenu : désamorcer</td></tr><tr><td>Tab</td>")
rep("<tr><td>B</td><td>Poser","<tr><td>F8</td><td>Activer / d\u00e9sactiver les ennemis (test)</td></tr><tr><td>B</td><td>Poser")
HELPER=r'''function chunkPlane(m,NC,add0){const g=m.geometry,gx=g.parameters.widthSegments,gy=g.parameters.heightSegments,g1=gx+1,p=g.attributes.position,out=[],sx=Math.ceil(gx/NC),sy=Math.ceil(gy/NC),v=new THREE.Vector3();
for(let cy=0;cy<gy;cy+=sy)for(let cx=0;cx<gx;cx+=sx){const x1=Math.min(gx,cx+sx),y1=Math.min(gy,cy+sy),I=new Uint32Array((x1-cx)*(y1-cy)*6),bb=new THREE.Box3();let n=0;
for(let iy=cy;iy<y1;iy++)for(let ix=cx;ix<x1;ix++){const a=ix+g1*iy,b=ix+g1*(iy+1),c=ix+1+g1*(iy+1),d=ix+1+g1*iy;I[n++]=a;I[n++]=b;I[n++]=d;I[n++]=b;I[n++]=c;I[n++]=d}
for(let iy=cy;iy<=y1;iy++)for(let ix=cx;ix<=x1;ix++){v.fromBufferAttribute(p,ix+g1*iy);bb.expandByPoint(v)}
const cg=new THREE.BufferGeometry();for(const k in g.attributes)cg.setAttribute(k,g.attributes[k]);cg.setIndex(new THREE.BufferAttribute(I,1));cg.boundingBox=bb;cg.boundingSphere=bb.getBoundingSphere(new THREE.Sphere());
const e=new THREE.Mesh(cg,m.material);e.position.copy(m.position);e.rotation.copy(m.rotation);e.receiveShadow=m.receiveShadow;e.castShadow=m.castShadow;e.userData.keep=1;e.userData.chunk=1;e.updateMatrix();e.matrixAutoUpdate=false;S.add(e);out.push(e)}
g.setDrawRange(0,0);return out}
'''
# ---- v16 : terrain découpé en morceaux (culling), anneau extérieur allégé
rep("{const og=new THREE.PlaneGeometry(3600,3600,600,600);",HELPER+"{const og=new THREE.PlaneGeometry(3600,3600,360,360);")
rep("o.receiveShadow=true;S.add(o)}","o.receiveShadow=true;window.RINGM=o}")
rep("floor.geometry.dispose();floor.geometry=g}","floor.geometry.dispose();floor.geometry=g;window.FLOORC=chunkPlane(floor,16);{const rg=RINGM.geometry,rp=rg.attributes.position,cl=v=>Math.max(-749.9,Math.min(749.9,v));for(let i=0;i<rp.count;i++){const X=rp.getX(i),Z=rp.getZ(i),d=Math.max(Math.abs(X),Math.abs(Z))-750;if(d<-5){rp.setY(i,GH(cl(X),cl(Z))-1.5);continue}const e=GH(cl(X),cl(Z)),t=sstep(0,80,d);rp.setY(i,e*(1-t)+terrainH(X,Z)*t-(d<=.01?.12:0))}rg.computeVertexNormals();window.RINGC=chunkPlane(RINGM,10)}}")
# ---- v15 : champs, forêt
rep("const TR=[],NP=5400,NO=1860,NBU=5100;let np=0,no=0,t=0;",rd('farm.js')+"const TR=[],NP=9700,NO=7070,NBU=9400;window.TRE=TR;let np=0,no=0,t=0;"+rd('forest.js'))
rep("if(Math.random()>p||!okPos(x,z,2.2)","if(Math.random()>p||nzSkip(x,z)||!okPos(x,z,2.2)")
rep("const BU=[];t=0;while(BU.length<NBU&&t++<150000){const x=rnd(-MH+2,MH-2),z=rnd(-MH+2,MH-2);if(!okPos(x,z,.9)","const BU=[];t=0;"+"{let c=0,tt=0;while(c<4200&&tt++<90000){const x=rnd(FOR.x0,FOR.x1),z=rnd(FOR.z0,FOR.z1);if(!okPos(x,z,.9)||wDist(x,z)<.8||nearPath(x,z,2.2))continue;BU.push({x,z,y:GH(x,z),s:rnd(1.2,2.3),r:rnd(0,6.28),h:rnd(.22,.3),sh:rnd(.7,1.2)});c++}}\nwhile(BU.length<NBU&&t++<150000){const x=rnd(-MH+2,MH-2),z=rnd(-MH+2,MH-2);if(nzSkip(x,z)||!okPos(x,z,.9)")
# ---- menu : hooks de jeu
rep("c.dmg*(A.supp?.9:1)","c.dmg*SKM.dmg*(A.supp?.9:1)",2)
rep("...FA.hit.filter(q=>!q.userData.an.dead)])[0];if(h&&h.object.userData.glass)","...FA.hit.filter(q=>!q.userData.an.dead),...MQP])[0];if(h&&h.object.userData.glass)")
rep("RT=c.rt;","RT=c.rt*SKM.rl;")
rep("const s=C.fov/75*.0022*SENS;","const s=C.fov/75*.0022*SENS*SET.sens;",2)
rep("*.014*c.rec","*.014*c.rec*SKM.rec")
rep("const c=WC[WSEL];ammo--;slideK=1;","const c=WC[WSEL];ammo--;if(GM.mode==='train')MQS.shots+=c.pel;slideK=1;")
rep("P.hp=100;P.ar=50;P.plates=2","P.hp=100;P.ar=SKM.ar*.5;P.plates=2")
rep("const vis=(TOD","const vis=skStealth()*(TOD")
rep("function hlApply(z,d,k,src){if(HM.dead||ac.on||d<=0)return;","function hlApply(z,d,k,src){if(HM.dead||ac.on||d<=0)return;d*=SKM.taken;")
rep("return k*(spr?WSPR[WSEL]:WSPD[WSEL])","return k*SKM.spd*(spr?WSPR[WSEL]:WSPD[WSEL])")
rep("if(b.hp<=0)onKill(b,u.head)}\nelse{","if(b.hp<=0)onKill(b,u.head)}\nelse if(u.mq){mqHit(u.mq,u,c.dmg*SKM.dmg*(A.supp?.9:1),h.point);hit=1;hitT=.2;$('hit').style.opacity=1;$('hit').style.color=u.head?'#f55':'#fff'}\nelse{")
rep("knUpdate(dt);lzUpdate(dt);","knUpdate(dt);lzUpdate(dt);mqUpdate(dt);")
rep('<div style="opacity:.7;font-size:12px">Touches 1 à 4 : rangée du haut ou pavé numérique</div>','<div style="opacity:.7;font-size:12px">Touches 1 à 4 : rangée du haut ou pavé numérique</div><button style="margin-top:14px;font:inherit;padding:10px 18px;background:#141c10;color:#d6e2c0;border:1px solid #3d4a30;cursor:pointer" onclick="event.stopPropagation();mmOpen()">☰ MENU PRINCIPAL</button>')
# serpent : branchements (tirs, couteau, grenades, tick)
rep("function faHit(a,pt,dm){if(a.dead)return false;","function faHit(a,pt,dm){if(a.dead)return false;if(a.snk)return snkHit(a,pt,dm,'P');")
rep("faTick(dt);FA.rab.forEach","faTick(dt);snkTick(dt);FA.rab.forEach")
rep("if(!best){snd(120,.05,.08,'square');return}","if(!best){if(snkKnife(o,d,9)){snd(90,.08,.2,'square');FXP&&(FXP.shake=Math.max(FXP.shake||0,.2));return}snd(120,.05,.08,'square');return}")
rep("if(!pz_&&pd<R_){hlBlastPlayer(","snkBlast(x,y,z,R_,mine);if(!pz_&&pd<R_){hlBlastPlayer(")
open(P+'../MILSIM_FPS.html','w',encoding='utf-8').write(s)
open(P+'../index.html','w',encoding='utf-8').write(s)
# vérification de syntaxe du script principal (échoue le build si une erreur casserait tout le jeu)
import re,subprocess,shutil,tempfile,os
if shutil.which('node'):
    big=max(re.findall(r"<script[^>]*>(.*?)</script>",s,re.S),key=len)
    f=tempfile.NamedTemporaryFile('w',suffix='.js',delete=False,encoding='utf-8');f.write(big);f.close()
    r=subprocess.run(['node','--check',f.name],capture_output=True,text=True);os.unlink(f.name)
    if r.returncode:
        print('ERREUR DE SYNTAXE\n'+r.stderr[:600]);raise SystemExit(1)
print('ok',len(s))
