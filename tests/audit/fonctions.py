import pathlib,json,collections
from playwright.sync_api import sync_playwright
f=pathlib.Path('/home/claude/work/out/test.html').resolve()
errs=collections.Counter()
JS="""async()=>{const sleep=ms=>new Promise(r=>setTimeout(r,ms));const R_=[];const T=async(n,fn)=>{try{const r=await fn();R_.push([n,r?String(r):'OK'])}catch(e){R_.push([n,'EXC '+String(e).slice(0,160)])}};
const wait=async(c,ms=15000)=>{const t=performance.now();while(performance.now()-t<ms){if(c())return true;await sleep(80)}return false};
const key=async(c,ms=300)=>{dispatchEvent(new KeyboardEvent('keydown',{code:c,key:c,bubbles:true}));await sleep(ms);dispatchEvent(new KeyboardEvent('keyup',{code:c,key:c,bubbles:true}));await sleep(80)};
const fps=()=>new Promise(r=>{let n=0;const t=performance.now();const f=()=>{n++;if(performance.now()-t>1000)r(n);else requestAnimationFrame(f)};requestAnimationFrame(f)});
P.hp=100;mmHide();
R_.push(['fps pendant le test',String(await fps())+' img/s']);
await T('Marche (W)',async()=>{const x0=P.x,z0=P.z;dispatchEvent(new KeyboardEvent('keydown',{code:'KeyW',bubbles:true}));await sleep(1500);dispatchEvent(new KeyboardEvent('keyup',{code:'KeyW',bubbles:true}));return Math.hypot(P.x-x0,P.z-z0)>.5?'':'le joueur n’avance pas'});
await T('Saut (Espace)',async()=>{let up=false;dispatchEvent(new KeyboardEvent('keydown',{code:'Space',bubbles:true}));for(let i=0;i<12;i++){await sleep(50);if(P.vy>.1||P.air)up=true}dispatchEvent(new KeyboardEvent('keyup',{code:'Space',bubbles:true}));return up?'':'pas de saut'});
await T('Accroupi (Ctrl)',async()=>{const s0=P.st;await key('ControlLeft',500);const s1=P.st;if(s1===s0)return'posture inchangée ('+s0+')';await key('ControlLeft',500);return''});
await T('Couché (P)',async()=>{P.st=0;await key('KeyP',500);const s1=P.st;await key('KeyP',500);return s1===2?'':'posture '+s1});
await T('Penché (Q)',async()=>{dispatchEvent(new KeyboardEvent('keydown',{code:'KeyQ',bubbles:true}));await sleep(600);const l=P.lean;dispatchEvent(new KeyboardEvent('keyup',{code:'KeyQ',bubbles:true}));return Math.abs(l)>.05?'':'lean='+l});
await T('Accessoire 2 (touche 2)',async()=>{const b0=JSON.stringify(A);await key('Digit2');const b1=JSON.stringify(A);await key('Digit2');return b0!==b1?'':'aucun changement'});
await T('Mode de tir (;)',async()=>{const m0=wpMode(WSEL);await key('Semicolon');return''});
await T('Changer d’arme (T)',async()=>{const w0=WSEL;await key('KeyT',200);await sleep(800);return WSEL!==w0?'':'arme inchangée'});
await T('Inventaire : poser puis ramasser',async()=>{invSet('bd',3);const n0=INV.gnd.length;invDrop('bd',1);if(invGet('bd')!==2)return'drop: '+invGet('bd');if(INV.gnd.length!==n0+1)return'objet absent du sol';const e=INV.gnd[INV.gnd.length-1];if(!await wait(()=>!e.fall,8000))return'l’objet tombe indéfiniment';P.x=e.m.position.x;P.z=e.m.position.z;await sleep(150);if(invNear()!==e)return'invNear ne trouve pas l’objet';invPick();return invGet('bd')===3?'':'ramassage: '+invGet('bd')});
await T('Inventaire : Tab ouvre et ferme',async()=>{await key('Tab',300);await sleep(300);const o=INV.open;await key('Tab',300);await sleep(300);return o&&!INV.open?'':'ouvert='+o+' puis '+INV.open});
await T('Soins : bandage (J)',async()=>{HM.inv.bd=2;HM.bd={};HM.bd.la=1;await key('KeyJ',150);if(!HM.act)return'action non démarrée';if(!await wait(()=>!HM.act,20000))return'soin bloqué';return HM.bd.la?'saignement persistant':''});
await T('Soins : garrot (Y)',async()=>{HM.inv.tq=1;HM.bd={};HM.bd.ll=2;await key('KeyY',150);if(!HM.act)return'action non démarrée';if(!await wait(()=>!HM.act,20000))return'soin bloqué';return HM.tq.ll?'':'garrot absent'});
await T('Soins : morphine (,)',async()=>{HM.inv.mo=1;HM.mor=0;await key('Comma',150);if(!HM.act)return'action non démarrée';if(!await wait(()=>!HM.act,10000))return'bloqué';return HM.mor>0?'':'morphine sans effet'});
await T('Soins : attelle (I)',async()=>{HM.inv.sp=1;HM.fx.ll=1;await key('KeyI',150);if(!HM.act)return'action non démarrée';if(!await wait(()=>!HM.act,15000))return'bloqué';return HM.fx.ll?'fracture persistante':''});
await T('Soins : trousse (.)',async()=>{HM.inv.kit=1;HM.z.t=Math.max(1,HM.z.t-25);const h0=HM.z.t;await key('Period',150);if(!HM.act)return'action non démarrée';if(!await wait(()=>!HM.act,20000))return'bloqué';return HM.z.t>h0?'':'santé inchangée'});
await T('Plaque d’armure (G)',async()=>{P.plates=2;P.ar=0;await key('KeyG',150);await sleep(4500);return P.ar>0||P.plates<2?'':'plaque non posée (ar='+P.ar+', plates='+P.plates+')'});
await T('Couteau (Z)',async()=>{const b=bots.find(x=>!x.dead);if(!b)return'aucun bot vivant';const g=b.g.position;b.dorm=0;P.x=g.x+1.1;P.z=g.z;P.yaw=Math.PI/2;P.pitch=0;P.gy=GH(P.x,P.z);const hp0=b.hp+b.ar;await key('KeyZ',250);for(let i=0;i<4;i++){dispatchEvent(new MouseEvent('mousedown',{button:0,bubbles:true}));await sleep(120);dispatchEvent(new MouseEvent('mouseup',{button:0,bubbles:true}));await sleep(500)}const r=(b.hp+b.ar<hp0||b.dead)?'':'aucun dégât ('+KNF.on+')';await key('KeyZ',250);return r+(KNF.on?' | couteau non rangé':'')});
await T('Lampe (L), vision (`), lumières (0)',async()=>{await key('KeyL');await key('Backquote');await key('Digit0');await key('Backquote');await key('Backquote');await key('KeyL');return''});
await T('Manger (-) et boire (=)',async()=>{await key('Minus',200);await key('Equal',200);await sleep(2500);return''});
await T('AC-130 (K)',async()=>{P.acReady=true;await key('KeyK',200);await sleep(1200);const on=ac.on;if(ac.on)endAC();return on?'':'AC-130 non déclenché'});
R_.push(['état avant tirs','KNF.on='+KNF.on+' plateT='+plateT+' act='+JSON.stringify(HM.act)+' trap='+TRP.mode+' reloading='+reloading+' ac='+ac.on+' bench='+bench+' ammo='+ammo+' cd='+cd+' dead='+HM.dead]);
await T('HMG tire',async()=>{const i=WC.findIndex(c=>/HMG/.test(c.n));setWeapon(i);await sleep(500);ammo=50;cd=0;reloading=0;const a0=ammo;fire();return ammo<a0?'':'pas de tir'});
await T('Mine : posée sous un bot, déclenchée',async()=>{const b=bots.find(x=>!x.dead&&!x.sur);const g=b.g.position;b.dorm=0;const t=trapAdd('xm',g.x,g.z,0,'p',0);b.wait=99;b.path=null;const hp0=b.hp+b.ar;P.x=g.x+25;P.z=g.z;await sleep(3000);return(!TRP.list.includes(t)||b.dead||b.hp+b.ar<hp0)?'':'mine intacte, bot intact'});
await T('Pose de piège (B) et annulation',async()=>{TRP.inv.xm=2;await key('KeyB',150);const m=TRP.mode;trapSetMode(0);return m>0?'':'mode inchangé'});
await T('Véhicules : entrer / sortir',async()=>{const v=dstS().list.find(r=>r.st<=0&&r.hp>0&&!r.drv);if(!v)return'aucun véhicule utilisable';P.x=v.x+1.5;P.z=v.z;await sleep(200);const r=drvNear();if(!r)return'aucun véhicule proche';drvEnter(r);await sleep(800);const on=DRV.on;drvExit();await sleep(300);return on&&!DRV.on?'':'DRV '+on});
await T('Grenades : 4 types',async()=>{for(let i=0;i<4;i++){NADE.inv[i]=2;NADE.sel=i;playerThrow();await sleep(900)}return''});
await T('6 armes : tir + rechargement',async()=>{const out=[];for(let i=0;i<WC.length;i++){setWeapon(i);await sleep(500);ammo=Math.max(ammo,5);reserve=60;cd=0;reloading=0;const a=ammo;fire();if(ammo>=a)out.push(WC[i].n+' ne tire pas');reload();await sleep(200);if(!reloading)out.push(WC[i].n+' ne recharge pas')}return out.join('; ')});
await T('Mort puis réapparition',async()=>{hlDie('test');const d=HM.dead;await sleep(1500);return d?'':'joueur non mort'});
return R_}"""
INIT=open('/tmp/shot/soak.py').read().split('INIT="""')[1].split('"""')[0]
with sync_playwright() as p:
    b=p.chromium.launch(args=["--no-sandbox","--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist","--disable-dev-shm-usage"])
    pg=b.new_page(viewport={"width":640,"height":360})
    def pe(e): errs['PAGE '+str(e)[:220]]+=1
    def ce(m):
        if m.type=="error": errs['CON '+m.text[:220]]+=1
    pg.on("pageerror",pe);pg.on("console",ce)
    pg.goto(f.as_uri(),timeout=400000,wait_until="commit")
    pg.wait_for_function("()=>typeof bots!=='undefined'&&bots.length>0&&typeof MERGED!=='undefined'&&MERGED.out>0&&window.VEHS",timeout=400000)
    pg.evaluate("()=>{window.ppRender=function(){};R.render=function(){};try{PR.render=function(){}}catch(e){};ENM.off=0;bots.forEach(b=>{if(b.dead>50)b.dead=.3});try{mmHide()}catch(e){};$('ov').style.display='none';MM.started=true}")
    pg.wait_for_timeout(3000)
    for n,r in pg.evaluate(JS):print(('✔ ' if r=='OK' else '✘ ')+n+('' if r=='OK' else ' — '+r),flush=True)
    b.close()
print("ERRORS")
for k,v in errs.most_common(30):print(v,k)
