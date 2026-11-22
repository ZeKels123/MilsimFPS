# Export de la végétation basse et du décor extérieur (Sketchfab CC-BY / Poly Haven CC0, voir docs/CREDITS_ASSETS.md) : GLB -> données compactes
# (maillages quantifiés LOD0/LOD1 + textures WebP réduites + boîtes de collision locales).
# Usage : python3 tools/deco_ext_export.py [dossier_dl] [dossier_sortie] [nom1,nom2,...]     (nécessite le module bpy ; PIL ; numpy ; scipy)
# Sortie : <sortie>/<nom>.json et <sortie>/tex/*.webp ; tools/deco_ext_pack.py assemble ensuite src/parts/deco_ext_data.js.
# Chaque modèle : mis à l'échelle en mètres, recentré (pied à y=0), sol/caméra/lumières retirés, décimé (LOD0 / LOD1), textures de couleur réduites.
import bpy,sys,os,json,struct,io,math,base64,hashlib
import numpy as np
from PIL import Image
SRC=sys.argv[1] if len(sys.argv)>1 else '/home/claude/work/dl'
OUT=sys.argv[2] if len(sys.argv)>2 else '/home/claude/work/deco_ext/export'
os.makedirs(OUT+'/tex',exist_ok=True)
# f : fichier ; h/w/d : cible en mètres (hauteur / plus grande étendue horizontale / plus grande dimension) ; tri : triangles (LOD0, LOD1) ;
# tx : taille max de texture ; q : qualité WebP ; dec : 'collapse' (décimation Blender) ou 'cards' (îlots de cartes pour le feuillage alpha) ;
# only / skip : sous-chaînes de noms d'objets conservés / exclus ; skipmat : matériaux exclus ; col : collision ('box' | ('slabs',n) | None) ; sh : réduction de la boîte ; br : luminosité ; sink : enfoncement (fraction de la hauteur)
V='buissons/';D='decor/'
SP={
 # --- buissons / végétation basse
 'rb_petit':dict(f=V+'buisson_realbush_marblesstudio_CCBY.glb',only=['Small_bush_1'],h=.95,tri=(29,29),tx=1024,q=78,dec='collapse',br=1.35,kind='veg'),
 'rb_moyen1':dict(f=V+'buisson_realbush_marblesstudio_CCBY.glb',only=['Medium_bush_1'],h=1.3,tri=(97,60),tx=1024,q=78,dec='collapse',br=1.35,kind='veg'),
 'rb_moyen2':dict(f=V+'buisson_realbush_marblesstudio_CCBY.glb',only=['Medium_bush_2'],h=1.15,tri=(29,29),tx=1024,q=78,dec='collapse',br=1.35,kind='veg'),
 'rb_haut1':dict(f=V+'buisson_realbush_marblesstudio_CCBY.glb',only=['tall_bush_1'],h=2.0,tri=(107,60),tx=1024,q=78,dec='collapse',br=1.35,kind='veg'),
 'rb_haut3':dict(f=V+'buisson_realbush_marblesstudio_CCBY.glb',only=['tall_bush_3'],h=1.7,tri=(77,50),tx=1024,q=78,dec='collapse',br=1.35,kind='veg'),
 'fleuri':dict(f=V+'buissonfleuri_krauchankavarvara_CCBY.glb',h=1.1,tri=(1745,700),tx=1024,q=78,dec='collapse',d1='cards',br=1.35,kind='veg'),
 'haie':dict(f=V+'haie_rbgillustrations_CCBY.glb',h=1.25,tri=(420,200),tx=512,q=78,dec='collapse',br=1.4,kind='veg',col='box'),
 'fougere_a':dict(f=V+'fougere2_3dartistshop_CCBY.glb',w=1.15,tri=(1400,500),tx=512,q=78,dec='collapse',d1='cards',br=1.5,kind='veg'),
 'fougere_b':dict(f=V+'fougere_evolveduk_CCBY.glb',w=1.2,tri=(560,250),tx=512,q=78,dec='collapse',br=1.5,kind='veg'),
 'fougere_c':dict(f=V+'fougeres_star3dart_CCBY.glb',w=1.9,tri=(1200,400),tx=512,q=78,dec='collapse',d1='cards',br=1.5,kind='veg'),
 'herbes':dict(f=V+'hautesherbes_ironicalghosty_CCBY.glb',h=.8,tri=(600,250),tx=512,q=78,dec='collapse',d1='cards',br=1.5,kind='veg'),
 'jsapin':dict(f=V+'jeunesapin_masakeyart_CCBY.glb',h=3.2,tri=(750,200),tx=256,q=78,dec='collapse',br=1.4,kind='veg',col='box',sh=.12,colov={'Material_0':[.07,.24,.09],'Material_1':[.26,.16,.08]}),
 'roseau_a':dict(f=V+'roseaux2_sunsetscorpion_CCBY.glb',h=2.0,tri=(236,120),tx=256,q=78,dec='collapse',br=1.4,kind='veg'),
 'roseau_b':dict(f=V+'roseaux_daniel2u_CCBY.glb',h=2.2,tri=(492,220),tx=256,q=78,dec='collapse',br=1.4,kind='veg'),
 # --- rochers, falaise
 'rocher1':dict(f=D+'rocher1_lukica_CCBY.glb',d=2.4,tri=(450,120),tx=512,q=72,dec='collapse',br=1.3,kind='rock',col='box',sh=.82,sink=.12),
 'rocher2':dict(f=D+'rocher2_chrisre_CCBY.glb',d=2.0,tri=(400,110),tx=512,q=72,dec='collapse',br=1.3,kind='rock',col='box',sh=.82,sink=.12),
 'rocher3':dict(f=D+'rocher3_mreslan_CCBY.glb',d=1.6,tri=(450,120),tx=512,q=72,dec='collapse',br=1.3,kind='rock',col='box',sh=.82,sink=.1),
 'falaise':dict(f=D+'falaise_keamwf_CCBY.glb',h=7.5,tri=(4200,1100),tx=1024,q=72,dec='collapse',br=1.3,kind='rock',col=('slabs',9),sh=.9,sink=.05),
 # --- clôture, foin, bois, mobilier
 'cloture':dict(f=D+'cloturemousse_mrunity_CCBY.glb',skip=['Light','Camera'],h=1.15,tri=(650,260),tx=512,q=74,dec='collapse',br=1.5,kind='prop',col='box',sh=.9),
 'foin':dict(f=D+'balledefoin_thomaswhalley_CCBY.glb',d=1.5,tri=(700,300),tx=512,q=74,dec='collapse',br=1.5,kind='prop',col='box',sh=.9),
 'bois':dict(f=D+'boisdechauffage_apariciosilva3d_CCBY.glb',d=2.0,tri=(500,160),tx=512,q=74,dec='collapse',br=1.5,kind='prop',col='box',sh=.95),
 'tablejardin':dict(f=D+'tablechaisesjardin_polyhaven_CC0.glb',d=1.9,tri=(1500,500),tx=512,q=74,dec='collapse',br=1.4,kind='prop',col='box',sh=.9),
 'banc':dict(f=D+'banc_polyhaven_CC0.glb',d=1.4,tri=(630,260),tx=512,q=74,dec='collapse',br=1.4,kind='prop',col='box',sh=.9),
 'piquenique':dict(f=D+'tablepiquenique_polyhaven_CC0.glb',d=2.4,tri=(1500,500),tx=512,q=74,dec='collapse',br=1.4,kind='prop',col='box',sh=.9),
 'foyer':dict(f=D+'foyerpierre_polyhaven_CC0.glb',d=1.4,tri=(600,200),tx=512,q=74,dec='collapse',br=1.4,kind='prop',col='box',sh=.9),
 'boitier':dict(f=D+'boitierelectrique_polyhaven_CC0.glb',h=1.1,tri=(550,200),tx=512,q=74,dec='collapse',br=1.5,kind='prop',col='box',sh=.9),
 'egout':dict(f=D+'plaqueegout_polyhaven_CC0.glb',w=.69,tri=(160,60),tx=512,q=74,dec='collapse',br=1.6,kind='flat'),
 'seau':dict(f=D+'seau_polyhaven_CC0.glb',h=.45,tri=(450,160),tx=512,q=74,dec='collapse',br=1.5,kind='prop',col='box',sh=.9),
 'projecteur':dict(f=D+'projecteur_polyhaven_CC0.glb',skipmat=['security_light_glass'],w=.5,tri=(500,200),tx=512,q=74,dec='collapse',br=1.5,kind='prop',pole=(2.6,.06)),
}
GUT=0
def bleed(im):
    from scipy.ndimage import gaussian_filter as gf
    a=np.array(im.getchannel('A'));al=a.astype(np.float32)/255;rgb=np.array(im.convert('RGB'),np.float32)
    out=rgb.copy();hole=a<8;done=np.zeros(a.shape,bool)
    for r in (2,6,18,48):
        den=gf(al,r);num=np.stack([gf(rgb[...,k]*al,r) for k in range(3)],-1);fill=num/np.maximum(den[...,None],1e-4)
        m=hole&~done&(den>.01);out[m]=fill[m];done|=m
    res=Image.fromarray(np.clip(out,0,255).astype(np.uint8)).convert('RGBA');res.putalpha(Image.fromarray(a));return res
def glb_json(path):
    d=open(path,'rb').read();l=struct.unpack('<I',d[12:16])[0];j=json.loads(d[20:20+l]);o=20+l;bo=o+8;return j,d[bo:bo+struct.unpack('<I',d[o:o+4])[0]]
def mat_tex(j,bin_,name):
    for m in j['materials']:
        if m.get('name')!=name: continue
        ti=None;fac=[1,1,1,1]
        pb=m.get('pbrMetallicRoughness',{})
        if 'baseColorTexture' in pb: ti=pb['baseColorTexture']['index']
        fac=pb.get('baseColorFactor',fac)
        sg=m.get('extensions',{}).get('KHR_materials_pbrSpecularGlossiness')
        if sg:
            if 'diffuseTexture' in sg: ti=sg['diffuseTexture']['index']
            fac=sg.get('diffuseFactor',fac)
        if ti is None: return None,fac,m
        img=j['images'][j['textures'][ti]['source']];bv=j['bufferViews'][img['bufferView']]
        return Image.open(io.BytesIO(bin_[bv.get('byteOffset',0):bv.get('byteOffset',0)+bv['byteLength']])),fac,m
    return None,[1,1,1,1],{}
def tri_arrays(me,mw):
    """sommets uniques (position, normale, uv) et triangles + indice de matériau de chaque triangle"""
    me.calc_loop_triangles()
    nt=len(me.loop_triangles);nl=len(me.loops)
    tl=np.empty(nt*3,np.int32);me.loop_triangles.foreach_get('loops',tl)
    tm=np.empty(nt,np.int32);me.loop_triangles.foreach_get('material_index',tm)
    lv=np.empty(nl,np.int32);me.loops.foreach_get('vertex_index',lv)
    co=np.empty(len(me.vertices)*3,np.float32);me.vertices.foreach_get('co',co);co=co.reshape(-1,3)
    uvl=me.uv_layers.active
    uv=np.zeros((nl,2),np.float32)
    if uvl is not None:
        tmp=np.empty(nl*2,np.float32);uvl.uv.foreach_get('vector',tmp);uv=tmp.reshape(-1,2)
    nr=np.empty(nl*3,np.float32)
    try: me.corner_normals.foreach_get('vector',nr)
    except Exception:
        me.calc_normals_split();me.loops.foreach_get('normal',nr)
    nr=nr.reshape(-1,3)
    M=np.array(mw.to_3x3(),np.float32);T=np.array(mw.translation,np.float32)
    P=co@M.T+T
    NM=np.array(mw.to_3x3().inverted().transposed(),np.float32);N=nr@NM.T;N/=np.maximum(np.linalg.norm(N,axis=1,keepdims=True),1e-9)
    key=np.concatenate([lv[:,None].astype(np.float64),np.round(uv,4),np.round(N,2)],axis=1)
    _,first,inv=np.unique(key,axis=0,return_index=True,return_inverse=True)
    inv=inv.reshape(-1)
    return P[lv[first]],N[first],uv[first],inv[tl].reshape(-1,3),tm
def thin_cards(P,N,U,I,keep,seed=7):
    from scipy.sparse import coo_matrix
    from scipy.sparse.csgraph import connected_components
    key=np.round(P*1000).astype(np.int64);_,vid=np.unique(key,axis=0,return_inverse=True);vid=vid.reshape(-1);n=vid.max()+1
    r=np.concatenate([vid[I[:,0]],vid[I[:,1]],vid[I[:,2]]]);c=np.concatenate([vid[I[:,1]],vid[I[:,2]],vid[I[:,0]]])
    nc,lab=connected_components(coo_matrix((np.ones(len(r)),(r,c)),shape=(n,n)),directed=False)
    if nc<12: return None
    rng=np.random.RandomState(seed);order=rng.permutation(nc);kept=np.zeros(nc,bool);kept[order[:max(1,int(round(nc*keep)))]]=True
    tl=lab[vid[I[:,0]]];I2=I[kept[tl]]
    used=np.unique(I2);remap=-np.ones(len(P),np.int64);remap[used]=np.arange(len(used))
    P2=P[used].copy();N2=N[used];U2=U[used];vl=lab[vid[used]]
    cen=np.zeros((nc,3));cnt=np.zeros(nc)
    np.add.at(cen,vl,P2);np.add.at(cnt,vl,1);cen/=np.maximum(cnt,1)[:,None]
    f=min(1.6,1/math.sqrt(keep));P2=cen[vl]+(P2-cen[vl])*f
    return dict(P=P2,N=N2,U=U2,I=remap[I2])
def to_engine(P):  # Blender Z haut -> moteur Y haut
    return np.stack([P[:,0],P[:,2],-P[:,1]],axis=1)
def save_tex(img,fac,alpha,mx,q,key):
    im=img.convert('RGBA' if alpha else 'RGB');s=min(mx,max(im.size));w,h=im.size;sc=min(1,s/max(w,h))
    im=im.resize((max(8,round(w*sc)),max(8,round(h*sc))),Image.LANCZOS)
    if alpha: im=bleed(im)
    f=np.array(fac[:3])
    if abs(f-1).max()>.02:
        a=np.array(im).astype(np.float32);a[...,:3]*=f;im=Image.fromarray(np.clip(a,0,255).astype(np.uint8))
    fn='%s.webp'%key
    im.save(OUT+'/tex/'+fn,'WEBP',quality=q,alpha_quality=90,method=6);return fn
def run(name,c):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    path=os.path.join(SRC,c['f']);j,bin_=glb_json(path)
    bpy.ops.import_scene.gltf(filepath=path);bpy.context.view_layer.update()
    objs=[o for o in bpy.data.objects if o.type=='MESH' and o.data.materials and len(o.data.polygons)]
    if 'only' in c: objs=[o for o in objs if any(k in o.name for k in c['only'])]
    if 'skip' in c: objs=[o for o in objs if not any(k in o.name for k in c['skip'])]
    skipmat=c.get('skipmat',[])
    allp=np.concatenate([np.array([tuple(o.matrix_world@v.co) for v in o.data.vertices]) for o in objs])
    mn=allp.min(0);mx=allp.max(0);H=mx[2]-mn[2];ext=mx-mn;hz=max(ext[0],ext[1])
    k=c['h']/H if 'h' in c else c['w']/hz if 'w' in c else c['L']/hz if 'L' in c else c['d']/max(H,ext[0],ext[1])
    cx,cy=(mn[0]+mx[0])/2,(mn[1]+mx[1])/2;zb=mn[2]+c.get('sink',0)*H
    mT=__import__('mathutils');FX=mT.Matrix.Scale(k,4)@mT.Matrix.Translation((-cx,-cy,-zb))
    print(name,'hauteur source',round(H,3),'étendue',[round(float(x),3) for x in ext],'échelle',k,'->',[round(float(x*k),2) for x in (ext[0],ext[1],H)])
    # --- matériaux (un maillage par matériau), triangles de LOD0 / LOD1
    ntot=sum(len(o.data.polygons) for o in objs)
    mats={}
    tri0=min(1,c['tri'][0]/max(ntot,1));tri1=min(1,c['tri'][1]/max(ntot,1))
    def collect(L):
        res={}
        for o in objs:
            ratio=tri0 if L==0 else tri1
            me=o.data;md=None
            if ratio<.98 and (c.get('d0',c['dec']) if L==0 else c.get('d1',c['dec']))=='collapse':
                for p in o.data.polygons: p.use_smooth=True
                wl=o.modifiers.new('w','WELD');wl.merge_threshold=1e-5*max(ext[0],ext[1],H)/k*0+1e-4
                md=o.modifiers.new('d','DECIMATE');md.ratio=max(.01,ratio);md.use_collapse_triangulate=True
                bpy.context.view_layer.update();me=o.evaluated_get(bpy.context.evaluated_depsgraph_get()).to_mesh()
            Pv,Nv,Uv,I,tm=tri_arrays(me,FX@o.matrix_world)
            if md:
                o.modifiers.remove(md);o.modifiers.remove(wl)
            for si,mt in enumerate(o.data.materials):
                if mt is None or mt.name in skipmat: continue
                sel=I[tm==si]
                if not len(sel): continue
                r=res.setdefault(mt.name,[]);r.append((Pv,Nv,Uv,sel))
        out={}
        for mn_,lst in res.items():
            Ps=[];Ns=[];Us=[];Is=[];off=0
            for Pv,Nv,Uv,sel in lst:
                used=np.unique(sel);rm=-np.ones(len(Pv),np.int64);rm[used]=np.arange(len(used))
                Ps.append(Pv[used]);Ns.append(Nv[used]);Us.append(Uv[used]);Is.append(rm[sel]+off);off+=len(used)
            out[mn_]=dict(P=np.concatenate(Ps),N=np.concatenate(Ns),U=np.concatenate(Us),I=np.concatenate(Is))
        return out
    L0=collect(0);L1=collect(1) if c['tri'][1]<c['tri'][0] else L0
    parts=[[],[]];texcache={}
    for mn_,d0 in L0.items():
        img,fac,gm=mat_tex(j,bin_,mn_)
        alpha=False
        if img is not None:
            im=img.convert('RGBA');alpha=bool(np.array(im.getchannel('A')).min()<250) and (gm.get('alphaMode') in ('BLEND','MASK') or 'alphaMode' in gm)
        fn=None
        if img is not None:
            h=hashlib.md5(img.tobytes()).hexdigest()[:8]+('a' if alpha else '')+str(c['tx'])+'_%d'%c['q']+'_'+('%.2f%.2f%.2f'%tuple(fac[:3]) if max(abs(np.array(fac[:3])-1))>.02 else '')
            if h not in texcache: texcache[h]=save_tex(img,fac,alpha,c['tx'],c['q'],name.split('_')[0]+'_'+h.replace('.',''))
            fn=texcache[h]
        col=None if fn else [float(x) for x in c.get('colov',{}).get(mn_,fac[:3])]
        for L,Ld in ((0,L0),(1,L1)):
            d=Ld.get(mn_)
            if d is None: continue
            if L==1 and Ld is not L0 and alpha and c.get('d1',c['dec'])=='cards':
                th=thin_cards(L0[mn_]['P'],L0[mn_]['N'],L0[mn_]['U'],L0[mn_]['I'],c['tri'][1]/max(ntot,1))
                if th is not None: d=th
            parts[L].append(dict(P=to_engine(d['P']),N=to_engine(d['N']),U=d['U'],I=d['I'],tex=fn,col=col,alpha=alpha))
    # cartes alpha : LOD0 = géométrie d'origine (décimation par îlots si > budget)
    if c.get('d0',c['dec'])=='cards':
        for L,keep in ((0,c['tri'][0]/max(ntot,1)),):
            if keep<.98:
                for i,p in enumerate(parts[0]):
                    if p['alpha']:
                        th=thin_cards(p['P'],p['N'],p['U'],p['I'],keep)
                        if th is not None: p.update(P=th['P'],N=th['N'],U=th['U'],I=th['I'])
    for L in (0,1):
        for p in parts[L]:
            if p['alpha']: p['P'][:,1]=np.maximum(p['P'][:,1],0)
    # poteau optionnel (projecteur) : le modèle est monté sur un poteau de bois ; le pied du poteau est à y=0
    if 'pole' in c:
        hh,rr=c['pole'];n=10;P=[];N=[];I=[]
        for i in range(n):
            a=2*math.pi*i/n;x,z=math.cos(a)*rr,math.sin(a)*rr
            P+=[[x,0,z],[x,hh,z]];N+=[[math.cos(a),0,math.sin(a)]]*2
        for i in range(n):
            a_,b_=i*2,((i+1)%n)*2;I+=[[a_,a_+1,b_],[a_+1,b_+1,b_]]
        for L in (0,1):
            for p in parts[L]: p['P']=p['P']+np.array([0,hh-.2,0],np.float32)
            parts[L].append(dict(P=np.array(P,np.float32),N=np.array(N,np.float32),U=np.zeros((len(P),2),np.float32),I=np.array(I),tex=None,col=[.28,.2,.12],alpha=False))
    for L in (0,1):  # fusion des parties de même matériau (moins d'appels de rendu)
        g={}
        for p in parts[L]: g.setdefault((p['tex'],tuple(p['col']) if p['col'] else None,p['alpha']),[]).append(p)
        mp=[]
        for k,lst in g.items():
            off=0;Ps=[];Ns=[];Us=[];Is=[]
            for p in lst: Ps.append(p['P']);Ns.append(p['N']);Us.append(p['U']);Is.append(p['I']+off);off+=len(p['P'])
            mp.append(dict(P=np.concatenate(Ps),N=np.concatenate(Ns),U=np.concatenate(Us),I=np.concatenate(Is),tex=k[0],col=lst[0]['col'],alpha=k[2]))
        parts[L]=mp
    allv=np.concatenate([p['P'] for p in parts[0]]);mnv=allv.min(0);mxv=allv.max(0)
    # collision locale (repère du modèle, x,z décalés) : boîtes [cx,cz,hx,hz,y1]
    cb=[];cm=c.get('col')
    if cm:
        sh=c.get('sh',.9);y1=float(mxv[1])*sh if c['kind']!='rock' else float(mxv[1])*.8
        if cm=='box':
            cb.append([round(float((mnv[0]+mxv[0])/2),3),round(float((mnv[2]+mxv[2])/2),3),round(float((mxv[0]-mnv[0])/2*sh),3),round(float((mxv[2]-mnv[2])/2*sh),3),round(y1,3)])
        else:
            ns=cm[1];ax=0 if (mxv[0]-mnv[0])>=(mxv[2]-mnv[2]) else 2;lo,hi=mnv[ax],mxv[ax];ot=2-ax
            for s in range(ns):
                a0=lo+(hi-lo)*s/ns;a1=lo+(hi-lo)*(s+1)/ns;m=(allv[:,ax]>=a0-1e-6)&(allv[:,ax]<=a1+1e-6)
                if m.sum()<3: continue
                v=allv[m];c0,c1=np.percentile(v[:,ot],[3,97]);ymx=float(v[:,1].max())
                bx=[(a0+a1)/2,(c0+c1)/2,(a1-a0)/2,(c1-c0)/2*sh]
                if ax==2: bx=[bx[1],bx[0],bx[3],bx[2]]
                cb.append([round(float(bx[0]),3),round(float(bx[1]),3),round(float(bx[2]),3),round(float(bx[3]),3),round(ymx*sh,3)])
    ctr=(mnv+mxv)/2;half=np.maximum((mxv-mnv)/2,1e-3)*1.0001
    res=dict(n=name,kind=c['kind'],bb=[round(float(x),3) for x in (*mnv,*mxv)],q=[round(float(x),5) for x in (*ctr,*half)],br=c.get('br',1.4),cb=cb)
    for L in (0,1):
        out=[]
        for p in parts[L]:
            Pq=np.clip(np.round((p['P']-ctr)/half*32767),-32767,32767).astype(np.int16)
            Nq=np.clip(np.round(p['N']*127),-127,127).astype(np.int8)
            ma=float(np.abs(p['U']).max()) if len(p['U']) else 1;us=32767/max(1,math.ceil(ma))
            Uq=np.clip(np.round(p['U']*us),-32767,32767).astype(np.int16)
            I=p['I'].astype(np.uint16);keep=(I[:,0]!=I[:,1])&(I[:,1]!=I[:,2])&(I[:,0]!=I[:,2]);I=I[keep]
            blob=Pq.tobytes()+Nq.tobytes()+(b'\0' if (len(Pq)*9)%2 else b'')+Uq.tobytes()+I.tobytes()
            out.append(dict(v=len(Pq),i=int(I.size),us=us,tex=p['tex'],col=p['col'],alpha=bool(p['alpha']),b=base64.b64encode(blob).decode()))
            print('   LOD',L,'tex',p['tex'],'alpha',p['alpha'],'verts',len(Pq),'tris',I.size//3)
        res['lod%d'%L]=out
    print(name,'bbox',res['bb'],'cb',cb)
    json.dump(res,open('%s/%s.json'%(OUT,name),'w'))
names=sys.argv[3].split(',') if len(sys.argv)>3 else list(SP)
for n in names: run(n,SP[n])
