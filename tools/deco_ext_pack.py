# Assemble src/parts/deco_ext_data.js à partir de <export>/*.json et <export>/tex/*.webp (tools/deco_ext_export.py).
# Usage : python3 tools/deco_ext_pack.py [dossier_export] [fichier_sortie]
import sys,os,json,base64,glob
EX=sys.argv[1] if len(sys.argv)>1 else '/home/claude/work/deco_ext/export'
OUT=sys.argv[2] if len(sys.argv)>2 else os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','src','parts','deco_ext_data.js')
ORDER=['rb_petit','rb_moyen1','rb_moyen2','rb_haut1','rb_haut3','fleuri','haie','fougere_a','fougere_b','fougere_c','herbes','jsapin','roseau_a','roseau_b',
 'rocher1','rocher2','rocher3','falaise','cloture','foin','bois','tablejardin','banc','piquenique','foyer','boitier','egout','seau','projecteur']
T=[];TI={}
def tex(fn):
    if fn in TI:return TI[fn]
    TI[fn]=len(T);T.append('data:image/webp;base64,'+base64.b64encode(open(EX+'/tex/'+fn,'rb').read()).decode());return TI[fn]
M={}
for n in ORDER:
    d=json.load(open(f'{EX}/{n}.json'))
    e=dict(k=d['kind'],br=d['br'],bb=d['bb'],q=d['q'],cb=d['cb'])
    for L in (0,1):
        e['l%d'%L]=[dict(v=p['v'],i=p['i'],us=p['us'],t=tex(p['tex']) if p['tex'] else -1,col=p['col'],a=1 if p['alpha'] else 0,b=p['b']) for p in d['lod%d'%L]]
    if e['l1']==e['l0']: e['l1']=None
    M[n]=e
js='// Données générées par tools/deco_ext_export.py + deco_ext_pack.py (modèles Sketchfab CC-BY et Poly Haven CC0, voir docs/CREDITS_ASSETS.md) : maillages quantifiés LOD0/LOD1 (base64), textures WebP, boîtes de collision locales.\nconst DXD='+json.dumps(dict(T=T,M=M),separators=(',',':'))+';\n'
open(OUT,'w').write(js);print('deco_ext_data.js',len(js)//1024,'KB',len(T),'textures',len(M),'modèles')
