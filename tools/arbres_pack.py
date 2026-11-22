# Assemble src/parts/arbres_data.js à partir de <export>/*.json (arbres_export.py), <export>/tex/*.webp et <export>/bb.json + bb/*.webp (arbres_bb.py).
# Usage : python3 tools/arbres_pack.py [dossier_export] [fichier_sortie]
import sys,os,json,base64
EX=sys.argv[1] if len(sys.argv)>1 else '/home/claude/work/arb/export'
OUT=sys.argv[2] if len(sys.argv)>2 else os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','src','parts','arbres_data.js')
ORDER=['chene','chene2','hetre','epicea','pin','sapin','mort','mort2','souche','buisson','buisson2']
bb=json.load(open(EX+'/bb.json'));T=[];TI={}
def tex(path):
    if path in TI:return TI[path]
    TI[path]=len(T);T.append('data:image/webp;base64,'+base64.b64encode(open(path,'rb').read()).decode());return TI[path]
S=[]
for n in ORDER:
    d=json.load(open(f'{EX}/{n}.json'))
    e=dict(n=n,k=d['kind'],h=d['h'],rt=d['rt'],cr=d['cr'],q=d['q'],bb=d['bb'],at=tex(f'{EX}/tex/'+d['atlas']) if d.get('atlas') else -1)
    for L in (0,1):
        e['l%d'%L]=[dict(v=p['v'],i=p['i'],us=p['us'],t=tex(f'{EX}/tex/'+p['tex']) if p['tex'] else -1,b=p['b']) for p in d['lod%d'%L]]
    if n in bb:
        b=bb[n];e['sp']=dict(t=tex(f'{EX}/bb/'+b['file']),fw=b['fw'],fh=b['fh'],W=b['W'],H=b['H'])
    S.append(e)
js='// Données générées par tools/arbres_export.py + arbres_bb.py + arbres_pack.py (modèles Sketchfab CC-BY, voir docs/CREDITS_ASSETS.md) : maillages quantifiés LOD0/LOD1 (base64), textures WebP, impostors.\nconst ARB_D='+json.dumps(dict(T=T,S=S),separators=(',',':'))+';\n'
open(OUT,'w').write(js);print('arbres_data.js',len(js)//1024,'KB',len(T),'textures')
