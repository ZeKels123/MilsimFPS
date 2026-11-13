// ================= INVENTAIRE (v10) : sac à dos à grille, poids du joueur, objets au sol =================
// Le poids dépend du JOUEUR (capacité fixe), pas du sac : le sac ne limite que la place (cases).
const INV={lay:{},bag:'M',sel:null,open:false,gnd:[],init:false,CAP:32,lv:0,t:0};
const BAGS={0:{n:'Poches',w:4,h:2,kg:0},S:{n:'Petit sac',w:5,h:4,kg:.8,col:0x5a6040},M:{n:'Sac moyen',w:7,h:5,kg:1.4,col:0x46563a},L:{n:'Grand sac',w:9,h:6,kg:2.2,col:0x34452a}};
const CALS=['5.56','9 mm','12/70','7.62'],CIDX=[0,1,1,2,3,3],CKG=[.012,.008,.04,.025],CST=[60,60,30,30];
const WKG=[3.6,2.5,1,3.4,5.4,9.5],WSPD=[.96,1,1.03,.92,.86,.78],WSPR=[.97,1,1.02,.93,.88,.8],ARMKG=4;
const IT={bd:{n:'Bandage',kg:.05,w:1,h:1,st:5,col:'#cfc8ae'},tq:{n:'Garrot',kg:.15,w:1,h:1,st:3,col:'#9a3f2c'},sp:{n:'Attelle',kg:.3,w:1,h:2,st:2,col:'#6f8190'},mo:{n:'Morphine',kg:.05,w:1,h:1,st:4,col:'#cdc545'},kit:{n:'Trousse',kg:.8,w:2,h:1,st:1,col:'#bb3d3d'},pl:{n:'Plaque',kg:1.1,w:2,h:2,st:1,col:'#7d848c'},xm:{n:'Mine antipersonnel',kg:1.2,w:1,h:1,st:3,col:'#4a5230'},xc:{n:'Mine directionnelle',kg:1.6,w:2,h:1,st:2,col:'#6a7a44'},xw:{n:'Piège à fil',kg:.7,w:1,h:1,st:3,col:'#8a8a7a'},xb:{n:'Piège à ours',kg:2,w:2,h:1,st:2,col:'#6a6a6a'}};
const INV_IDS=['pl','kit','sp','xc','xb','a0','a1','xm','xw','bd','tq','mo','g0','g1','g2'];
const invWpn=k=>k===slot?WSEL:SLOTS[k].w;
function invDef(id){const c0=id[0];
if(c0==='a'){const w=invWpn(+id[1]),c=CIDX[w];return{n:'Munitions '+CALS[c]+' · '+WC[w].n,kg:CKG[c],w:1,h:1,st:CST[c],col:'#b89a4a'}}
if(c0==='z'){const c=+id[1];return{n:'Munitions '+CALS[c],kg:CKG[c],w:1,h:1,st:CST[c],col:'#b89a4a'}}
if(c0==='g'){const k=+id[1];return{n:'Grenade '+NT[k].n,kg:.42,w:1,h:1,st:2,col:['#55653e','#c4c4c4','#3f5a8c'][k]}}
return IT[id]}
function invAm(k,set){if(k===slot){if(set===undefined)return reserve;reserve=set}else{const s=SLOTS[k];if(set===undefined)return s.res;s.res=set}}
function invGet(id){if(id[0]==='a')return invAm(+id[1]);if(id==='pl')return P.plates;if(id[0]==='x')return TRP.inv[id]||0;if(id[0]==='g')return NADE.inv[+id[1]];return(HM.inv&&HM.inv[id])||0}
function invSet(id,n){n=Math.max(0,n|0);if(id[0]==='a')invAm(+id[1],n);else if(id==='pl')P.plates=n;else if(id[0]==='x')TRP.inv[id]=n;else if(id[0]==='g')NADE.inv[+id[1]]=n;else if(HM.inv)HM.inv[id]=n}
function invStacks(){const o=[];for(const id of INV_IDS){const q=invGet(id);if(q>0)o.push({id,q})}return o}
const invCapC=()=>BAGS[INV.bag].w*BAGS[INV.bag].h;
function invUsed(){let c=0;for(const s of invStacks()){const d=invDef(s.id);c+=Math.ceil(s.q/d.st)*d.w*d.h}return c}
function invAddable(id,n){const d=invDef(id),cur=invGet(id);let used=invUsed(),add=0;const per=d.w*d.h;for(let i=0;i<n;i++){if(Math.ceil((cur+add+1)/d.st)>Math.ceil((cur+add)/d.st)){if(used+per>invCapC())break;used+=per}add++}return add}
function invKg(){let t=ARMKG+BAGS[INV.bag].kg;for(const s of invStacks())t+=s.q*invDef(s.id).kg;t+=WKG[invWpn(0)]+WKG[invWpn(1)];return t}
const invLoad=()=>invKg()/INV.CAP;
// effet du poids + de l'arme tenue sur le déplacement
function invSpdK(spr){const r=invLoad();let k=r<.5?1:r<.8?1-(r-.5)/.3*.06:r<1?.94-(r-.8)/.2*.1:Math.max(.45,.78-(r-1)*.8);return k*(spr?WSPR[WSEL]:WSPD[WSEL])}
const invSprintOK=()=>invLoad()<=1;


// ---------- icônes texturées des objets ----------
const IC={},IM={};
function invIcon(id){const d=invDef(id),am=id[0]==='a'?CIDX[invWpn(+id[1])]:id[0]==='z'?+id[1]:-1,key=am>=0?'am'+am:id;if(IC[key])return IC[key];
const W=96,c=document.createElement('canvas');c.width=W*d.w;c.height=W*d.h;const x=c.getContext('2d'),w=c.width,h=c.height;
const lg=(y0,y1,a,b)=>{const g=x.createLinearGradient(0,y0,0,y1);g.addColorStop(0,a);g.addColorStop(1,b);return g},hg=(x0,x1,a,b)=>{const g=x.createLinearGradient(x0,0,x1,0);g.addColorStop(0,a);g.addColorStop(.5,b);g.addColorStop(1,a);return g};
const rr=(a,b,cw,ch,r,f)=>{x.beginPath();if(x.roundRect)x.roundRect(a,b,cw,ch,r);else x.rect(a,b,cw,ch);x.fillStyle=f;x.fill()};
x.fillStyle=lg(0,h,'#2f3a29','#151b12');x.fillRect(0,0,w,h);
if(am>=0){const hull=['#c9a24a','#c9a24a','#b83a2e','#c9a24a'][am],tip=['#b86a3a','#c9a24a','#d8d0b0','#b86a3a'][am];for(let i=0;i<3;i++){const cx=24+i*24;
rr(cx-9,36,18,44,3,hg(cx-9,cx+9,'#7a5a1c',hull));if(am===2){rr(cx-9,62,18,18,2,hg(cx-9,cx+9,'#7a5a1c','#d8b45a'));rr(cx-9,36,18,26,3,hg(cx-9,cx+9,'#6a1c14',hull))}
else{x.beginPath();x.moveTo(cx-8,36);x.quadraticCurveTo(cx,10,cx+8,36);x.closePath();x.fillStyle=hg(cx-8,cx+8,'#5a3a1a',tip);x.fill();rr(cx-9,76,18,5,1,'#8a6a2a')}}}
else if(id==='bd'){x.beginPath();x.arc(48,50,28,0,7);x.fillStyle=hg(20,76,'#b8b098','#ece6d0');x.fill();x.beginPath();x.arc(48,50,12,0,7);x.fillStyle='#2a3224';x.fill();for(let r=14;r<28;r+=4){x.beginPath();x.arc(48,50,r,0,7);x.strokeStyle='rgba(120,110,86,.5)';x.lineWidth=1;x.stroke()}rr(46,72,40,12,2,'#e6dfc8');rr(66,72,6,12,0,'#b5382c')}
else if(id==='tq'){rr(12,40,72,18,6,lg(40,58,'#3a3f3a','#1c201c'));rr(40,24,16,50,5,hg(40,56,'#7a2a20','#d6523c'));rr(16,36,10,26,3,'#8a8f88');x.fillStyle='rgba(255,255,255,.08)';for(let i=0;i<9;i++)x.fillRect(30+i*6,44,2,10)}
else if(id==='sp'){for(const a of[28,54])rr(a,14,16,164,7,hg(a,a+16,'#6a7680','#c6ced4'));for(const y of[44,96,146])rr(18,y,60,12,3,'#34444f');x.fillStyle='rgba(255,255,255,.25)';x.fillRect(32,20,3,150);x.fillRect(58,20,3,150)}
else if(id==='mo'){rr(34,22,28,58,9,hg(34,62,'#a8a030','#e6dc58'));rr(38,6,20,20,5,'#cf3a30');rr(44,78,8,14,2,'#c8c8c8');rr(38,44,20,12,2,'#2a2a24')}
else if(id==='kit'){rr(12,14,168,70,12,lg(14,84,'#c24040','#8c2626'));rr(66,5,60,12,5,'#5a1a1a');rr(86,26,20,46,3,'#f2ece0');rr(73,40,46,18,3,'#f2ece0');rr(12,48,168,3,0,'rgba(0,0,0,.25)')}
else if(id==='pl'){rr(32,16,128,160,30,lg(16,176,'#9aa2aa','#555b62'));x.lineWidth=4;x.strokeStyle='rgba(0,0,0,.35)';x.beginPath();x.roundRect?x.roundRect(44,28,104,136,22):x.rect(44,28,104,136);x.stroke();x.fillStyle='rgba(255,255,255,.12)';x.fillRect(58,38,40,3);for(const [a,b] of[[56,48],[136,48],[56,144],[136,144]]){x.beginPath();x.arc(a,b,4,0,7);x.fillStyle='#3a3f44';x.fill()}x.fillStyle='#222';x.font='bold 18px sans-serif';x.textAlign='center';x.fillText('IV',96,104)}
else if(id==='g0'){x.beginPath();x.ellipse(48,56,26,32,0,0,7);x.fillStyle=hg(22,74,'#2f3b20','#66794a');x.fill();x.strokeStyle='rgba(20,28,12,.7)';x.lineWidth=2;for(let i=-3;i<=3;i++){x.beginPath();x.moveTo(24,56+i*9);x.lineTo(72,56+i*9);x.stroke()}for(let i=-2;i<=2;i++){x.beginPath();x.moveTo(48+i*10,26);x.lineTo(48+i*10,86);x.stroke()}rr(40,16,16,14,3,'#8a8f80');rr(60,18,8,54,3,'#aab09a');x.beginPath();x.arc(30,22,9,0,7);x.strokeStyle='#cfd2c4';x.lineWidth=3;x.stroke()}
else if(id==='g1'||id==='g2'){const b=id==='g1'?['#8a8a8a','#e0e0e0']:['#26406e','#5878b0'],st=id==='g1'?'#222':'#e6c93a';rr(28,22,40,62,6,hg(28,68,b[0],b[1]));rr(28,42,40,10,0,st);rr(34,10,28,16,4,'#707468');rr(62,12,8,46,3,'#aab09a');x.beginPath();x.arc(30,14,8,0,7);x.strokeStyle='#cfd2c4';x.lineWidth=3;x.stroke()}
else if(id==='xm'){x.beginPath();x.arc(48,52,30,0,7);x.fillStyle=hg(18,78,'#2e3520','#6a7a44');x.fill();x.beginPath();x.arc(48,52,13,0,7);x.fillStyle='#22271b';x.fill();x.strokeStyle='#8a9070';x.lineWidth=2;for(let i=0;i<3;i++){x.beginPath();x.moveTo(48,52);x.lineTo(48+Math.cos(i*2.09)*24,52+Math.sin(i*2.09)*24);x.stroke()}rr(44,22,8,10,2,'#c8c8b8')}
else if(id==='xc'){rr(22,16,148,58,14,lg(16,74,'#7a8a50','#44502c'));rr(34,26,124,38,8,'rgba(0,0,0,.18)');x.fillStyle='#e8e0b0';x.font='bold 9px sans-serif';x.textAlign='center';x.fillText('FRONT TOWARD ENEMY',96,50);rr(48,72,6,14,2,'#999');rr(138,72,6,14,2,'#999')}
else if(id==='xw'){for(const a of[22,74])rr(a,24,8,56,3,'#6a4a2a');x.strokeStyle='#cfcfc4';x.lineWidth=2;x.beginPath();x.moveTo(26,40);x.lineTo(78,40);x.stroke();x.beginPath();x.moveTo(26,40);x.quadraticCurveTo(50,62,78,40);x.stroke();x.beginPath();x.arc(48,62,10,0,7);x.fillStyle=hg(38,58,'#2f3b20','#66794a');x.fill()}
else if(id==='xb'){x.lineWidth=7;x.strokeStyle='#8a8f94';x.beginPath();x.arc(96,70,46,Math.PI,0);x.stroke();x.beginPath();x.arc(96,70,46,0,Math.PI);x.strokeStyle='#6a6f74';x.stroke();x.fillStyle='#b8bcc0';for(let i=0;i<9;i++){const a=Math.PI+i/8*Math.PI;x.beginPath();x.moveTo(96+Math.cos(a)*46-4,70+Math.sin(a)*46);x.lineTo(96+Math.cos(a)*34,70+Math.sin(a)*34);x.lineTo(96+Math.cos(a)*46+4,70+Math.sin(a)*46);x.fill()}rr(80,62,32,16,4,'#444')}
for(let i=0;i<w*h/90;i++){x.fillStyle=Math.random()<.5?'rgba(255,255,255,.05)':'rgba(0,0,0,.08)';x.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*2,1+Math.random()*2)}
x.strokeStyle='rgba(0,0,0,.6)';x.lineWidth=2;x.strokeRect(1,1,w-2,h-2);IC[key]=c;return c}
const invIconUrl=id=>{const c=invIcon(id);return c._u||(c._u=c.toDataURL())};
function invTexMat(id){const c=invIcon(id),k=c;if(IM[c.width+id[0]+(id[0]==='a'||id[0]==='z'?(id[0]==='a'?CIDX[invWpn(+id[1])]:id[1]):id)])return IM[c.width+id[0]+(id[0]==='a'||id[0]==='z'?(id[0]==='a'?CIDX[invWpn(+id[1])]:id[1]):id)];const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;const m=new THREE.MeshStandardMaterial({map:t,roughness:.75,metalness:.1});IM[c.width+id[0]+(id[0]==='a'||id[0]==='z'?(id[0]==='a'?CIDX[invWpn(+id[1])]:id[1]):id)]=m;return m}
// ---------- objets au sol ----------
const IGM={},IGB=new THREE.BoxGeometry(1,1,1);
const igMat=c=>IGM[c]||(IGM[c]=new THREE.MeshStandardMaterial({color:c,roughness:.8,metalness:.1}));
function invSpawn(gid,q,x,y,z,vx,vz,bag){let m;
if(gid==='B'){m=new THREE.Group();const b=BAGS[bag.kind],s=.22+.06*['S','M','L'].indexOf(bag.kind),body=new THREE.Mesh(IGB,igMat(b.col));body.scale.set(s*1.5,s*1.7,s);body.position.y=s*.85;const fl=new THREE.Mesh(IGB,igMat(0x2b3322));fl.scale.set(s*1.4,s*.7,s*.5);fl.position.set(0,s*.9,s*.7);m.add(body,fl);body.castShadow=true}
else{const d=invDef(gid);m=new THREE.Mesh(IGB,invTexMat(gid));m.scale.set(.1*d.w+.06,.07,.1*d.h+.06);m.castShadow=true}
m.position.set(x,y,z);S.add(m);const e={id:gid,q,m,bag,vx:vx||0,vz:vz||0,vy:0,fall:true,age:0};INV.gnd.push(e);
while(INV.gnd.length>90){const o=INV.gnd.shift();S.remove(o.m)}return e}
const invGY=e=>GH(e.m.position.x,e.m.position.z)+(e.id==='B'?0:.04);
function invDrop(id,n,fx){const q=Math.min(n,invGet(id));if(q<=0)return;invSet(id,invGet(id)-q);const gid=id[0]==='a'?'z'+CIDX[invWpn(+id[1])]:id;
const sn=Math.sin(P.yaw),cs=Math.cos(P.yaw);invSpawn(gid,q,P.x-sn*.5+rnd(-.1,.1),P.gy+1.2,P.z-cs*.5+rnd(-.1,.1),-sn*2.4+rnd(-.3,.3),-cs*2.4+rnd(-.3,.3));snd(260,.05,.1,'triangle');if(INV.open)invRender()}
// jeter le sac en vitesse : tout le contenu part avec, seules les poches gardent le strict nécessaire
function invDropBag(){if(INV.bag===0)return hlMsg('Pas de sac à jeter');
const cont={},stk=invStacks();for(const s of stk){cont[s.id]=s.q;invSet(s.id,0)}
const kind=INV.bag;let free=BAGS[0].w*BAGS[0].h;INV.bag=0;
for(const id of ['bd','tq','kit','a'+slot]){const d=invDef(id),q=cont[id]||0;if(!q)continue;let keep=0;const per=d.w*d.h;for(let i=0;i<q;i++){const nc=(keep%d.st===0)?per:0;if(free-nc<0)break;free-=nc;keep++}if(keep){invSet(id,keep);cont[id]=q-keep}}
const cc={};for(const k in cont)if(cont[k]>0)cc[k.replace(/^a(\d)$/,(m,s)=>'z'+CIDX[invWpn(+s)])]=(cc[k.replace(/^a(\d)$/,(m,s)=>'z'+CIDX[invWpn(+s)])]||0)+cont[k];
const sn=Math.sin(P.yaw),cs=Math.cos(P.yaw);invSpawn('B',1,P.x-sn*.7,P.gy+1.3,P.z-cs*.7,-sn*1.6,-cs*1.6,{kind,cont:cc});snd(180,.12,.2,'sawtooth');hlMsg('Sac jeté');INV._kind=null;if(INV.open)invRender()}
function invAddGround(e){// retourne true si l'objet est entièrement ramassé
if(e.id==='B'){const nk=e.bag.kind;if(INV.bag!==0){hlMsg('Vous portez déjà un sac (V pour le jeter)');return false}
INV.bag=nk;INV._kind=nk;let any=false;for(const k in e.bag.cont){const q=e.bag.cont[k];if(!q)continue;const r=invPut(k,q);e.bag.cont[k]=q-r;any=any||r>0}
if(Object.values(e.bag.cont).some(v=>v>0)){hlMsg('Sac équipé — reste du contenu au sol');INV.bag=nk;const rest=invSpawn('B',1,e.m.position.x,e.m.position.y,e.m.position.z,0,0,{kind:'S',cont:e.bag.cont});rest.fall=false;rest.m.scale.setScalar(.6)}else hlMsg(BAGS[nk].n+' équipé');return true}
const r=invPut(e.id,e.q);e.q-=r;if(r===0)hlMsg(e.id[0]==='z'&&!invSlotFor(+e.id[1])?'Pas d’arme de ce calibre':'Sac plein');else hlMsg('Ramassé : '+invDef(e.id).n+' ×'+r);return e.q<=0}
const invSlotFor=c=>[slot,1-slot].find(k=>CIDX[invWpn(k)]===c);
function invPut(id,n){if(id[0]==='z'){const k=invSlotFor(+id[1]);if(k===undefined)return 0;id='a'+k}const a=invAddable(id,n);if(a>0)invSet(id,invGet(id)+a);return a}
function invNear(){let b=null,bd=2.3;for(const e of INV.gnd){if(e.fall)continue;const d=Math.hypot(e.m.position.x-P.x,e.m.position.z-P.z);if(d<bd){bd=d;b=e}}return b}
function invPick(){const e=invNear();if(!e)return;if(invAddGround(e)){S.remove(e.m);INV.gnd.splice(INV.gnd.indexOf(e),1);snd(520,.05,.1,'triangle')}if(INV.open)invRender()}
function invLoot(b){const p=b.g.position,r=Math.random,sp=()=>[p.x+rnd(-.7,.7),p.y+.6,p.z+rnd(-.7,.7)];
const add=(id,q,bag)=>{const s=sp();invSpawn(id,q,s[0],s[1],s[2],rnd(-.8,.8),rnd(-.8,.8),bag)};
if(r()<.75)add('z'+[0,0,1,2,3][(r()*5)|0],r()<.5?30:15);
if(r()<.4)add('bd',1+((r()*2)|0));if(r()<.15)add('tq',1);if(r()<.1)add('mo',1);if(r()<.08)add('kit',1);
if(r()<.14)add('g'+((r()*3)|0),1);if(r()<.06)add('x'+'mmwb'[(r()*4)|0],1);if(r()<.07)add('pl',1);if(r()<.035)add('B',1,{kind:r()<.6?'S':'M',cont:{}})}
function invWorld(){const ok=(x,z)=>wDist(x,z)>6&&!(typeof inRoom==='function'&&inRoom(x,z)>=0);
const put=(gid,q,bag)=>{for(let t=0;t<30;t++){const x=rnd(-125,125),z=rnd(-125,125);if(!ok(x,z))continue;const e=invSpawn(gid,q,x,GH(x,z)+.1,z,0,0,bag);e.fall=false;e.m.position.y=invGY(e);return}};
for(let i=0;i<6;i++)put('x'+'mcwbmw'[i],1);['S','S','M','M','L'].forEach(k=>put('B',1,{kind:k,cont:k==='L'?{kit:1,bd:2,z0:60}:{}}));
for(let i=0;i<26;i++){const r=Math.random();put(r<.4?'z'+((Math.random()*4)|0):r<.65?'bd':r<.73?'tq':r<.8?'sp':r<.87?'kit':r<.94?'g'+((Math.random()*3)|0):'pl',r<.4?30:1)}}

// ---------- interface ----------
const ivs=document.createElement('style');ivs.textContent='#inv{display:none;position:fixed;inset:0;z-index:30;background:rgba(6,10,6,.84);color:#dfe8d4;font:13px "Segoe UI",sans-serif;align-items:center;justify-content:center;gap:22px;user-select:none}#inv .ip{background:rgba(18,26,16,.92);border:1px solid #3d5230;padding:14px 16px;min-width:300px}#inv h3{margin:0 0 8px;font-size:14px;letter-spacing:.08em;color:#c8f07a}#ig{position:relative;border:1px solid #3d5230}#inv .it{position:absolute;box-sizing:border-box;border:1px solid rgba(0,0,0,.6);display:flex;align-items:flex-end;justify-content:flex-end;padding:2px 3px;font-size:11px;font-weight:700;color:#fff;text-shadow:0 0 3px #000,0 0 2px #000;cursor:pointer}#inv .it.sel{outline:2px solid #c8f07a}#inv button{background:#2b3d22;border:1px solid #5a7a42;color:#dfe8d4;padding:5px 10px;margin:3px 4px 0 0;cursor:pointer;font:inherit}#inv button:hover{background:#3b5530}#inv .bar{height:10px;background:#1a2216;border:1px solid #3d5230;margin:4px 0 6px}#inv .bar i{display:block;height:100%}#inv small{opacity:.7}#invw,#invp{position:fixed;z-index:6;pointer-events:none;font:12px "Segoe UI",sans-serif;color:#dfe8d4;text-shadow:0 1px 3px #000}#invw{right:18px;bottom:88px;text-align:right}#invp{left:50%;bottom:22%;transform:translateX(-50%);font-size:15px;display:none}';document.head.appendChild(ivs);
const iv=document.createElement('div');iv.id='inv';iv.innerHTML='<div class="ip"><h3 id="ih"></h3><div id="ig"></div><div id="io"></div></div><div class="ip" style="width:300px" id="ir"></div>';document.body.appendChild(iv);
const ivw=document.createElement('div');ivw.id='invw';document.body.appendChild(ivw);const ivp=document.createElement('div');ivp.id='invp';document.body.appendChild(ivp);
const CELL=46;
function invRender(){const b=BAGS[INV.bag],st=invStacks().map(s=>({...s,d:invDef(s.id)})).sort((a,c)=>c.d.w*c.d.h-a.d.w*a.d.h);
const used=invUsed(),cap=invCapC();$('ih').textContent=b.n.toUpperCase()+' · '+b.w+'×'+b.h+' · '+used+'/'+cap+' cases';
const g=$('ig');g.style.width=b.w*CELL+'px';g.style.height=b.h*CELL+'px';const occ=[];for(let y=0;y<b.h+6;y++)occ.push(new Array(b.w).fill(0));
let h='';for(let y=0;y<b.h;y++)for(let x=0;x<b.w;x++)h+='<div style="position:absolute;box-sizing:border-box;left:'+x*CELL+'px;top:'+y*CELL+'px;width:'+CELL+'px;height:'+CELL+'px;border:1px solid #2a3a22;background:#0d130b"></div>';
const free=(x,y,d)=>{if(x<0||y<0||x+d.w>b.w||y+d.h>b.h+6)return 0;for(let j=0;j<d.h;j++)for(let i=0;i<d.w;i++)if(occ[y+j][x+i])return 0;return 1},take=(x,y,d)=>{for(let j=0;j<d.h;j++)for(let i=0;i<d.w;i++)occ[y+j][x+i]=1};
const un=[];for(const s of st){let left=s.q;const n=Math.ceil(s.q/s.d.st);for(let u=0;u<n;u++){const q=Math.min(left,s.d.st);left-=q;un.push({s,q,key:s.id+'#'+u})}}
const pos={};for(const o of un){const l=INV.lay[o.key];if(l&&free(l[0],l[1],o.s.d)&&l[1]<b.h){take(l[0],l[1],o.s.d);pos[o.key]=l}}
let over=0;for(const o of un){if(pos[o.key])continue;let f=null;for(let y=0;y<b.h+6&&!f;y++)for(let x=0;x<b.w&&!f;x++)if(free(x,y,o.s.d))f=[x,y];if(!f){over++;continue}take(f[0],f[1],o.s.d);pos[o.key]=f}
for(const o of un){const f=pos[o.key];if(!f)continue;const s=o.s;
h+='<div class="it'+(INV.sel===s.id?' sel':'')+'" data-id="'+s.id+'" data-key="'+o.key+'" title="'+s.d.n+'" style="left:'+f[0]*CELL+'px;top:'+f[1]*CELL+'px;width:'+s.d.w*CELL+'px;height:'+s.d.h*CELL+'px;background:#1b2418 url('+invIconUrl(s.id)+') center/100% 100% no-repeat">'+(s.d.st>1?o.q:'')+'</div>'}
g.innerHTML=h;$('io').innerHTML='<small>Glisser : ranger · clic : sélectionner · clic droit : jeter 1 · Tab / Échap : fermer · F : ramasser · V : jeter le sac</small>';
const kg=invKg(),r=invLoad(),k=invSpdK(false),col=r<.5?'#6fbf5a':r<.8?'#e6c04a':r<=1?'#e8843a':'#e04a3a';
const eff=r<.5?'Aucun malus':r<.8?'Sprint légèrement réduit':r<=1?'Chargé : plus lent, endurance qui baisse vite':'SURCHARGÉ : très lent, sprint impossible';
let rr='<h3>CHARGE</h3><div class="bar"><i style="width:'+Math.min(100,r*100)+'%;background:'+col+'"></i></div><b>'+kg.toFixed(1)+' / '+INV.CAP+' kg</b> <small>(capacité du joueur, indépendante du sac)</small><br><span style="color:'+col+'">'+eff+'</span><br>Vitesse de marche : ×'+k.toFixed(2)+'<h3 style="margin-top:12px">ARMES</h3>';
for(let i=0;i<2;i++){const w=invWpn(i);rr+=(i===slot?'<b>▸ ':'')+(i+1)+' '+WC[w].n+(i===slot?'</b>':'')+' · '+WKG[w]+' kg · déplacement ×'+WSPD[w]+' (sprint ×'+WSPR[w]+')<br>'}
rr+='<small>Équipement (gilet, casque) : '+ARMKG+' kg · '+b.n+' : '+b.kg+' kg</small>';
const s=INV.sel&&invGet(INV.sel)>0?INV.sel:null;if(!s)INV.sel=null;
if(s){const d=invDef(s),q=invGet(s),use=['bd','tq','sp','mo','kit','pl'].includes(s)||s[0]==='g'||s[0]==='x',nd=s[0]==='a'?Math.min(q,30):1;
rr+='<h3 style="margin-top:12px">'+d.n.toUpperCase()+' ×'+q+'</h3><small>'+(d.kg*1000|0)+' g l’unité · '+d.w+'×'+d.h+' case(s)</small><br>'+(use?'<button data-act="use">Utiliser</button>':'')+'<button data-act="d1">Jeter '+nd+'</button><button data-act="dall">Tout jeter</button>'}
if(INV.bag!==0)rr+='<br><button data-act="bag" style="margin-top:12px">Jeter le sac (V)</button>';
if(over)rr+='<br><span style="color:#e04a3a">'+over+' objet(s) ne tiennent pas dans la grille</span>';
$('ir').innerHTML=rr}
function invOpen(o){if(o===INV.open)return;INV.open=o;if(o){if(bench||ac.on||$('ov').style.display!=='none')return INV.open=false;bench=true;mdown=false;ads=false;iv.style.display='flex';document.exitPointerLock&&document.exitPointerLock();invRender()}
else{bench=false;iv.style.display='none';if(!free&&R.domElement.requestPointerLock)R.domElement.requestPointerLock()}}
iv.addEventListener('click',e=>{const b=e.target.closest('[data-act]'),t=e.target.closest('[data-id]');
if(t){INV.sel=t.dataset.id;invRender();return}
if(b&&INV.sel){const a=b.dataset.act,s=INV.sel,q=invGet(s);
if(a==='d1')invDrop(s,s[0]==='a'?Math.min(q,30):1);else if(a==='dall')invDrop(s,q);else if(a==='use'){invOpen(false);
if(s==='pl'){if(P.plates>0&&P.ar<150&&!plateT){plateT=1.6;snd(200,.2,.15,'sawtooth')}else hlMsg('Armure déjà pleine')}else if(s[0]==='g'){NADE.sel=+s[1]}else if(s[0]==='x'){trapSetMode(TSEQ.indexOf(s)+1)}else hlUse(s)}}
else if(b&&b.dataset.act==='bag'){invDropBag()}});

let DR=null;
iv.addEventListener('mousedown',e=>{const t=e.target.closest('[data-key]');if(!t||e.button!==0)return;DR={key:t.dataset.key,id:t.dataset.id,x:e.clientX,y:e.clientY,mv:0,el:t}});
addEventListener('mousemove',e=>{if(!DR)return;if(Math.abs(e.clientX-DR.x)+Math.abs(e.clientY-DR.y)>5)DR.mv=1;if(DR.mv){DR.el.style.transform='translate('+(e.clientX-DR.x)+'px,'+(e.clientY-DR.y)+'px)';DR.el.style.zIndex=9;DR.el.style.opacity=.8;DR.el.style.pointerEvents='none'}});
addEventListener('mouseup',e=>{if(!DR)return;const d=DR;DR=null;if(!d.mv)return;const g=$('ig').getBoundingClientRect(),L=d.el.getBoundingClientRect();
const cx=Math.round((L.left-g.left)/CELL),cy=Math.round((L.top-g.top)/CELL);INV.lay[d.key]=[cx,cy];invRender()});
iv.addEventListener('contextmenu',e=>{const t=e.target.closest('[data-id]');if(t){const s=t.dataset.id;invDrop(s,s[0]==='a'?Math.min(invGet(s),30):1)}});
addEventListener('keydown',e=>{if(e.repeat)return;
if(INV.open){if(e.code==='Tab'||e.code==='Escape'||e.code==='KeyB'){e.preventDefault();invOpen(false)}else if(e.code==='KeyV')invDropBag();e.stopImmediatePropagation();return}
if(e.code==='Tab'){e.preventDefault();invOpen(true);return}
if($('ov').style.display!=='none'||ac.on||bench)return;
if(e.code==='KeyV')invDropBag();
else if(e.code==='Backspace'){e.preventDefault();invDrop('a'+slot,Math.min(30,invGet('a'+slot)))}
else if(e.code==='KeyF'&&!nb&&!ndR&&!trapNear())invPick()});
function invUpdate(dt){if(P.gy===undefined||HM.z.t===undefined)return;
if(!INV.init){INV.init=true;invWorld()}
for(let i=INV.gnd.length-1;i>=0;i--){const e=INV.gnd[i],p=e.m.position;e.age+=dt;
if(e.fall){e.vy-=9.8*dt;p.y+=e.vy*dt;p.x+=e.vx*dt;p.z+=e.vz*dt;e.vx*=1-Math.min(1,dt*.6);e.vz*=1-Math.min(1,dt*.6);const gy=invGY(e);if(p.y<=gy){p.y=gy;e.fall=false;e.vx=e.vz=0}}
if(e.age>900&&e.id!=='B'&&Math.hypot(p.x-P.x,p.z-P.z)>40){S.remove(e.m);INV.gnd.splice(i,1)}}
const r=invLoad(),lv=r<.5?0:r<.8?1:r<=1?2:3;if(lv!==INV.lv){if(lv>INV.lv&&lv>=2)hlMsg(lv===3?'Surcharge : sprint impossible':'Vous êtes chargé');INV.lv=lv}
INV.t+=dt;if(INV.t>.25){INV.t=0;const c=r<.5?'#cfe3c0':r<.8?'#e6c04a':r<=1?'#e8843a':'#e04a3a';ivw.innerHTML='<span style="color:'+c+'">⚖ '+invKg().toFixed(1)+' / '+INV.CAP+' kg</span> <span style="opacity:.6">· Tab : sac</span>';
const n=!INV.open&&!bench&&!nb&&!ndR?invNear():null;if(n){ivp.style.display='block';ivp.textContent='F — Ramasser : '+(n.id==='B'?BAGS[n.bag.kind].n:invDef(n.id).n+(n.q>1?' ×'+n.q:''))}else ivp.style.display='none'}}

function invDeath(){const cont={};for(const x of invStacks())cont[x.id.replace(/^a(\d)$/,(m,q)=>'z'+CIDX[invWpn(+q)])]=(cont[x.id.replace(/^a(\d)$/,(m,q)=>'z'+CIDX[invWpn(+q)])]||0)+x.q;
const kind=INV.bag===0?'S':INV.bag;if(Object.values(cont).some(v=>v>0))invSpawn('B',1,P.x,P.gy+.6,P.z,0,0,{kind,cont});
INV.bag='M';INV.lay={};HM.inv={...HINV0};TRP.inv={xm:2,xc:1,xw:1,xb:1};NADE.inv=[2,2,2];for(let k=0;k<2;k++)if(k!==slot)SLOTS[k].res=WC[SLOTS[k].w].res;INV.lv=0}
