import pathlib,json,collections,sys
from playwright.sync_api import sync_playwright
f=pathlib.Path('/home/claude/work/out/test.html').resolve()
errs=collections.Counter()
SECS=int(sys.argv[1]) if len(sys.argv)>1 else 240
CMB="""async(secs)=>{const sleep=ms=>new Promise(r=>setTimeout(r,ms));const t0=performance.now();const st={shots:0,tele:0,nades:0,traps:0,reloads:0,wsw:0,minAlive:99,maxStash:0,loot:0,ex:[]};
 window.__rep=[];let tt=0,lastT=0;
 const alive=()=>bots.filter(b=>!b.dead&&!b.sur);
 while((performance.now()-t0)/1000<secs){await sleep(120);
  try{ if($('mm').style.display!=='none'){mmHide()} 
   if(P.hp<40)P.hp=100;
   const al=alive();st.minAlive=Math.min(st.minAlive,al.length);
   if((performance.now()-lastT)>14000||!al.some(b=>Math.hypot(b.g.position.x-P.x,b.g.position.z-P.z)<70)){lastT=performance.now();const b=al[(Math.random()*al.length)|0];if(b){const a=Math.random()*6.28,d=30+Math.random()*25;let x=b.g.position.x+Math.sin(a)*d,z=b.g.position.z+Math.cos(a)*d;P.x=x;P.z=z;P.gy=GH(x,z);st.tele++}}
   let nb=null,nd=1e9;for(const b of al){const d=Math.hypot(b.g.position.x-P.x,b.g.position.z-P.z);if(d<nd){nd=d;nb=b}}
   if(nb&&nd<80){const g=nb.g.position;P.yaw=Math.atan2(-(g.x-P.x),-(g.z-P.z));P.pitch=Math.atan2(g.y+1.3-(P.gy+1.7),nd);
    if(typeof ammo!=='undefined'&&ammo<=0)reload();else if(cd<=0&&!reloading){fire();st.shots++}
    if(Math.random()<.02){WSEL=(WSEL+1)%WC.length;try{setWeapon(WSEL)}catch(e){}st.wsw++}
    if(Math.random()<.01&&typeof playerThrow==='function'){try{playerThrow();st.nades++}catch(e){st.ex.push('nade '+e)}}
    if(Math.random()<.01){reserve=Math.max(reserve,60)}
   }
   // fouille des cadavres proches
   for(const b of bots){if(b.dead>0&&b.stash&&Math.hypot(b.g.position.x-P.x,b.g.position.z-P.z)<3){st.maxStash=Math.max(st.maxStash,b.stash.length)}}
   if(Math.random()<.02){try{for(const id of['xm','xw','xb'])if(TRP.inv[id]===0)TRP.inv[id]=2}catch(e){}}
   if(Math.random()<.03){window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyI',bubbles:true}));await sleep(40);window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyI',bubbles:true}))}
  }catch(e){st.ex.push(String(e).slice(0,140))}
  if(++tt%40===0)window.__rep.push(__chk())}
 st.ex=[...new Set(st.ex)].slice(0,10);return st}"""
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
    pg.evaluate("("+INIT.split("=>",1)[0]+"=>"+INIT.split("=>",1)[1]+")()")
    pg.evaluate("()=>{window.ppRender=function(){};R.render=function(){};try{PR.render=function(){}}catch(e){};ENM.off=0;bots.forEach(b=>{if(b.dead>50)b.dead=.3});try{mmHide()}catch(e){};$('ov').style.display='none';MM.started=true}")
    pg.wait_for_timeout(4000)
    print("START",json.dumps(pg.evaluate("__chk()")),flush=True)
    r=pg.evaluate(CMB,SECS)
    print("STATS",json.dumps(r))
    rep=pg.evaluate("__rep")
    for i in range(0,len(rep),max(1,len(rep)//12)):print(json.dumps(rep[i]))
    print("END",json.dumps(pg.evaluate("__chk()")))
    b.close()
print("ERRORS")
for k,v in errs.most_common(30):print(v,k)
