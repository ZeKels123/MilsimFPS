# Assemble src/parts/deco_int_data.js à partir de <export>/*.json et <export>/tex/*.webp (tools/deco_export.py).
# Usage : python3 tools/deco_pack.py [dossier_export] [fichier_sortie]
import sys,os,json,base64,glob
EX=sys.argv[1] if len(sys.argv)>1 else '/home/claude/work/deco/export'
OUT=sys.argv[2] if len(sys.argv)>2 else os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','src','parts','deco_int_data.js')
CFG=json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'deco_cfg.json')))
T=[];TI={};M={}
def tex(fn):
    if fn in TI:return TI[fn]
    TI[fn]=len(T);T.append('data:image/webp;base64,'+base64.b64encode(open(EX+'/tex/'+fn,'rb').read()).decode());return TI[fn]
for n in CFG:
    f=f'{EX}/{n}.json'
    if not os.path.exists(f):continue
    d=json.load(open(f))
    M[n]=dict(d=d['dims'],q=d['q'],bb=d['bb'],o=d['org'],tr=d['tris'],p=[dict(v=p['v'],i=p['i'],us=p['us'],t=tex(p['t']) if p['t'] else -1,c=p['col'],a=int(p['alpha']),ds=int(p['ds']),b=p['b']) for p in d['parts']])
js='// Données générées par tools/deco_export.py + deco_pack.py (modèles Sketchfab CC-BY, voir docs/CREDITS_ASSETS.md) : mobilier d\'intérieur, maillages quantifiés par matériau (base64) + textures WebP.\nconst DECO_D='+json.dumps(dict(T=T,M=M),separators=(',',':'))+';\n'
open(OUT,'w').write(js);print('deco_int_data.js',len(js)//1024,'KB',len(T),'textures',len(M),'modèles')
