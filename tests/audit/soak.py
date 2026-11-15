import pathlib,json,time,collections
from playwright.sync_api import sync_playwright
f=pathlib.Path('/home/claude/work/out/test.html').resolve()
errs=collections.Counter()
INIT="""()=>{window.__rep=[];window.__chk=()=>{const o={};const bad=[];
 for(const k of['x','z','hp','yaw','pitch','gy'])if(!isFinite(P[k]))bad.push('P.'+k+'='+P[k]);
 let nb=0,al=0,out=0,sink=0;for(const b of bots){nb++;if(!b.dead)al++;const g=b.g.position;if(!(b.dead>50)&&(!isFinite(g.x)||!isFinite(g.y)||!isFinite(g.z)))bad.push('bot NaN');if(Math.abs(g.x)>2000||Math.abs(g.z)>2000)out++;if(g.y<-5)sink++}
 o.bad=bad;o.alive=al;o.out=out;o.sink=sink;o.kills=P.kills;o.hp=Math.round(P.hp);o.scene=S.children.length;o.bal=(typeof BAL!=='undefined'&&BAL.bl)?BAL.bl.length:-1;o.trp=TRP.list.length;o.gnd=INV.gnd.length;
 o.mis=(typeof SQ!=='undefined')?SQ.map(q=>(q.mis?q.mis.k[0]:'-')+(q.chef?'C':'x')+q.m.filter(b=>!b.dead).length).join(' '):'';
 o.mem=performance.memory?Math.round(performance.memory.usedJSHeapSize/1e6):0;return o}}"""
FUZZ="""async(secs)=>{const sleep=ms=>new Promise(r=>setTimeout(r,ms));const keys=['KeyW','KeyA','KeyS','KeyD','Space','ShiftLeft','ControlLeft','KeyC','KeyR','KeyF','KeyG','KeyH','KeyI','KeyJ','KeyK','KeyL','KeyM','KeyN','KeyO','KeyP','KeyQ','KeyE','KeyT','KeyU','KeyV','KeyX','KeyY','KeyZ','KeyB','Tab','Digit1','Digit2','Digit3','Digit4','Digit5','Digit6','Digit7','Digit8','Digit9','Digit0','Numpad1','Numpad2','Numpad3','Numpad4','Numpad5','Numpad6','Numpad7','Numpad8','F1','F2','F3','F4','F6','F7','F8','Backquote','KeyB'];
 const t0=performance.now();let n=0;const log=[];
 while((performance.now()-t0)/1000<secs){const k=keys[(Math.random()*keys.length)|0];
  if(Math.random()<.08){P.x=(Math.random()*2-1)*140;P.z=(Math.random()*2-1)*140;P.hp=Math.max(P.hp,60)}
  if(Math.random()<.15){P.yaw+=(Math.random()-.5)*3}
  try{dispatchEvent(new KeyboardEvent('keydown',{code:k,key:k,bubbles:true}));if(k==='KeyW'&&Math.random()<.6){await sleep(400)}else await sleep(60+Math.random()*180);
   if(Math.random()<.4){document.dispatchEvent(new MouseEvent('mousedown',{button:Math.random()<.8?0:2,bubbles:true}));await sleep(150+Math.random()*300);document.dispatchEvent(new MouseEvent('mouseup',{button:0,bubbles:true}));document.dispatchEvent(new MouseEvent('mouseup',{button:2,bubbles:true}))}
   dispatchEvent(new KeyboardEvent('keyup',{code:k,key:k,bubbles:true}))}catch(e){log.push(k+':'+String(e).slice(0,120))}
  n++;if(n%25===0)window.__rep.push(__chk())}
 return{n,log}}"""
with sync_playwright() as p:
    b=p.chromium.launch(args=["--no-sandbox","--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist","--disable-dev-shm-usage"])
    pg=b.new_page(viewport={"width":640,"height":360})
    def pe(e): errs['PAGE '+str(e)[:200]]+=1
    def ce(m):
        if m.type=="error": errs['CON '+m.text[:200]]+=1
    pg.on("pageerror",pe)
    pg.on("console",ce)
    pg.goto(f.as_uri(),timeout=400000,wait_until="commit")
    pg.wait_for_function("()=>typeof bots!=='undefined'&&bots.length>0&&typeof MERGED!=='undefined'&&MERGED.out>0&&window.VEHS",timeout=400000)
    pg.evaluate(INIT);pg.evaluate("()=>{window.ppRender=function(){};R.render=function(){};try{PR.render=function(){}}catch(e){}}")
    pg.evaluate("()=>{try{$('ov').click()}catch(e){}try{ENM.off=0;mmHide()}catch(e){}}")
    pg.wait_for_timeout(3000)
    print("START",json.dumps(pg.evaluate("__chk()")))
    for ch in range(7):
        try:
            r=pg.evaluate(FUZZ,60)
        except Exception as e:
            print("CRASH chunk",ch,str(e)[:100]);break
        print("chunk",ch,r['n'],r['log'][:6],json.dumps(pg.evaluate("__chk()")))
    rep=pg.evaluate("__rep")
    for i in range(0,len(rep),max(1,len(rep)//10)):print(json.dumps(rep[i]))
    print("END",json.dumps(pg.evaluate("__chk()")))
    b.close()
print("ERRORS")
for k,v in errs.most_common(30):print(v,k)
