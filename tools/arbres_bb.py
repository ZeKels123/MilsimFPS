# Rendu des impostors (billboards) des arbres : 8 vues par espèce depuis le modèle LOD0 (navigateur sans écran, three.js), atlas WebP avec alpha.
# Usage : python3 tools/arbres_bb.py [dossier_export]  (après arbres_export.py)   Sortie : <export>/bb/<espèce>.webp + <export>/bb.json
import sys,os,json,base64,pathlib,glob
from playwright.sync_api import sync_playwright
EX=sys.argv[1] if len(sys.argv)>1 else '/home/claude/work/arb/export'
THREE=sys.argv[2] if len(sys.argv)>2 else '/home/claude/work/three.min.js'
os.makedirs(EX+'/bb',exist_ok=True)
names=[os.path.basename(f)[:-5] for f in sorted(glob.glob(EX+'/*.json')) if os.path.basename(f)!='bb.json']
names=[n for n in names if not n.startswith('buisson') and n!='souche']
D={};T={}
for n in names:
    D[n]=json.load(open(f'{EX}/{n}.json'))
    for p in D[n]['lod0']:
        k=p['tex'] or D[n]['atlas']
        T[k]='data:image/webp;base64,'+base64.b64encode(open(f'{EX}/tex/{k}','rb').read()).decode()
JS=r'''
const dec=b=>{const s=atob(b),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u.buffer};
function geo(p,q){const buf=dec(p.b),n=p.v;let o=0;const P=new Int16Array(buf,o,n*3);o+=n*6;const N=new Int8Array(buf,o,n*3);o+=n*3;if(o%2)o++;const U=new Int16Array(buf,o,n*2);o+=n*4;const I=new Uint16Array(buf,o,p.i);
const pos=new Float32Array(n*3),nr=new Float32Array(n*3),uv=new Float32Array(n*2);for(let i=0;i<n;i++){for(let k=0;k<3;k++){pos[i*3+k]=q[k]+P[i*3+k]/32767*q[3+k];nr[i*3+k]=N[i*3+k]/127}uv[i*2]=U[i*2]/p.us;uv[i*2+1]=U[i*2+1]/p.us}
const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nr,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setIndex(new THREE.BufferAttribute(I.slice(),1));return g}
const texc={};function tex(k){if(texc[k])return texc[k];const im=new Image(),t=new THREE.Texture(im);t.encoding=THREE.sRGBEncoding;t.anisotropy=8;t.wrapS=t.wrapT=THREE.RepeatWrapping;texc[k]=t;t.ready=new Promise(r=>{im.onload=()=>{t.needsUpdate=true;r()}});im.src=T[k];return t}
window.render=async function(n){const d=D[n];const mats=[];const g=new THREE.Group();
 for(const p of d.lod0){const t=tex(p.tex||d.atlas);await t.ready;const m=new THREE.MeshLambertMaterial({map:t,side:THREE.DoubleSide,alphaTest:.45});g.add(new THREE.Mesh(geo(p,d.q),m))}
 const S=new THREE.Scene();S.add(g);S.add(new THREE.HemisphereLight(0xffffff,0x707060,1.15));const dl=new THREE.DirectionalLight(0xffffff,.55);S.add(dl);S.add(dl.target);
 const bb=d.bb;const rx=Math.max(Math.abs(bb[0]),Math.abs(bb[3]),Math.abs(bb[2]),Math.abs(bb[5]))*1.02,H=bb[4]*1.01+ -bb[1],Wq=2*rx;
 const asp=Wq/H;let fh=256,fw=asp>.5?256:128;
 const SS=2,R=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});R.setPixelRatio(1);R.setSize(fw*SS,fh*SS);R.setClearColor(0,0);R.outputEncoding=THREE.sRGBEncoding;
 const cam=new THREE.OrthographicCamera(-Wq/2,Wq/2,H+bb[1],bb[1],.1,200);
 const NF=8,cv=document.createElement('canvas');cv.width=fw*4;cv.height=fh*2;const cx=cv.getContext('2d');cx.imageSmoothingQuality='high';
 for(let k=0;k<NF;k++){const a=k*Math.PI*2/NF;cam.position.set(Math.sin(a)*60,0,Math.cos(a)*60);cam.up.set(0,1,0);cam.lookAt(0,0,0);cam.updateMatrixWorld();dl.position.set(Math.sin(a)*40+8,70,Math.cos(a)*40);dl.target.position.set(0,5,0);
  R.render(S,cam);const c=document.createElement('canvas');c.width=fw;c.height=fh;const x2=c.getContext('2d');x2.imageSmoothingQuality='high';x2.drawImage(R.domElement,0,0,fw,fh);cx.drawImage(c,(k%4)*fw,Math.floor(k/4)*fh)}
 R.dispose();return{url:cv.toDataURL('image/png'),fw,fh,W:Wq,H:H,y0:bb[1]}};
'''
html='<!DOCTYPE html><html><body><script src="%s"></script><script>const D=%s,T=%s;</script><script>%s</script></body></html>'%(pathlib.Path(THREE).as_uri(),json.dumps(D),json.dumps(T),JS)
open(EX+'/bb_page.html','w').write(html)
info={}
with sync_playwright() as p:
    b=p.chromium.launch(args=["--no-sandbox","--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={"width":400,"height":300})
    pg.on("pageerror",lambda e:print('ERR',e));pg.on("console",lambda m:print('C',m.text) if m.type=='error' else None)
    pg.goto(pathlib.Path(EX+'/bb_page.html').as_uri())
    for n in names:
        r=pg.evaluate("n=>render(n)",n)
        png=base64.b64decode(r['url'].split(',')[1]);open(f'{EX}/bb/{n}.png','wb').write(png)
        from PIL import Image
        im=Image.open(f'{EX}/bb/{n}.png').convert('RGBA');im.save(f'{EX}/bb/{n}.webp','WEBP',quality=80,alpha_quality=90,method=6)
        info[n]=dict(fw=r['fw'],fh=r['fh'],W=round(r['W'],3),H=round(r['H'],3),y0=round(r['y0'],3),file=n+'.webp')
        print(n,info[n],os.path.getsize(f'{EX}/bb/{n}.webp')//1024,'KB')
    b.close()
json.dump(info,open(EX+'/bb.json','w'))
