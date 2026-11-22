# Export des arbres/buissons Sketchfab (CC-BY, voir docs/CREDITS_ASSETS.md) : GLB -> données compactes (maillages quantifiés LOD0/LOD1 + textures WebP réduites).
# Usage : python3 tools/arbres_export.py [dossier_glb] [dossier_sortie]    (nécessite le module bpy ; PIL ; numpy)
# Sortie : <sortie>/<espèce>.json (+ .bin par LOD) et <sortie>/tex/*.webp ; tools/arbres_pack.py assemble ensuite src/parts/arbres_data.js.
# Mise à l'échelle en mètres, origine recentrée au pied du tronc, parties inutiles (sol, icosphère) retirées, LOD1 par décimation Blender.
import bpy,bmesh,sys,os,json,struct,io,math,base64
import numpy as np
from PIL import Image
SRC=sys.argv[1] if len(sys.argv)>1 else '/home/claude/work/dl/arbres'
OUT=sys.argv[2] if len(sys.argv)>2 else '/home/claude/work/arb/export'
os.makedirs(OUT+'/tex',exist_ok=True)
# nom : fichier, hauteur cible (m), ratio de décimation LOD1 (bois, feuillage), taille max de texture (bois, feuillage), objets exclus (sous-chaînes), type
SP={
 'chene':  dict(f='chene_evolveduk_CCBY.glb',h=14.0,r1=(.10,.60),kind='feuillu'),
 'chene2': dict(f='chene2_massivegraphisme_CCBY.glb',h=15.0,r1=(.12,.55),kind='feuillu'),
 'hetre':  dict(f='hetre_evolveduk_CCBY.glb',h=17.0,r1=(.12,.55),kind='feuillu'),
 'epicea': dict(f='epicea_evolveduk_CCBY.glb',h=23.0,r1=(.06,.45),kind='conifere'),
 'pin':    dict(f='pin_evolveduk_CCBY.glb',h=18.0,r1=(.06,.6),kind='conifere'),
 'sapin':  dict(f='sapin_evolveduk_CCBY.glb',h=20.0,r1=(.10,.4),kind='conifere'),
 'mort':   dict(f='arbremort_evolveduk_CCBY.glb',h=9.5,r1=(.08,.5),kind='mort',skipmat=['Tree_1Mat']),
 'mort2':  dict(f='arbremort2_clintonabbott_CCBY.glb',h=8.0,r1=(.30,.5),kind='mort'),
 'souche': dict(f='souche_bitgem_CCBY.glb',h=.65,r1=(.5,.5),kind='souche',only=['Object_11'],rt=.33),
 'buisson':dict(f='buisson_danielpetrov_CCBY.glb',h=1.1,r1=(.35,.35),kind='buisson'),
 'buisson2':dict(f='buisson2_batuhan13_CCBY.glb',h=.9,r1=(.4,.4),kind='buisson'),
}
CELL=512;GUT=6;STRIP=64
def bleed(im):
    # remplit le RVB des pixels transparents avec la couleur voisine (évite les franges sombres aux mips)
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
    """image de couleur d'un matériau glTF (baseColor ou diffuse spec-gloss) + facteur de couleur"""
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
def mesh_arrays(me,mw):
    me.calc_loop_triangles()
    nt=len(me.loop_triangles);nl=len(me.loops)
    tl=np.empty(nt*3,np.int32);me.loop_triangles.foreach_get('loops',tl)
    lv=np.empty(nl,np.int32);me.loops.foreach_get('vertex_index',lv)
    co=np.empty(len(me.vertices)*3,np.float32);me.vertices.foreach_get('co',co);co=co.reshape(-1,3)
    uvl=me.uv_layers.active
    uv=np.zeros((nl,2),np.float32)
    if uvl is not None:
        try:
            tmp=np.empty(nl*2,np.float32);uvl.uv.foreach_get('vector',tmp);uv=tmp.reshape(-1,2)
        except Exception:
            tmp=np.empty(nl*2,np.float32);uvl.data.foreach_get('uv',tmp);uv=tmp.reshape(-1,2)
    nr=np.empty(nl*3,np.float32)
    try: me.corner_normals.foreach_get('vector',nr)
    except Exception:
        me.calc_normals_split();me.loops.foreach_get('normal',nr)
    nr=nr.reshape(-1,3)
    M=np.array(mw.to_3x3(),np.float32);T=np.array(mw.translation,np.float32)
    P=co@M.T+T
    NM=np.array(mw.to_3x3().inverted().transposed(),np.float32);N=nr@NM.T;N/=np.maximum(np.linalg.norm(N,axis=1,keepdims=True),1e-9)
    # sommets uniques (indice de sommet, uv, normale arrondie)
    key=np.concatenate([lv[:,None].astype(np.float64),np.round(uv,4),np.round(N,2)],axis=1)
    _,first,inv=np.unique(key,axis=0,return_index=True,return_inverse=True)
    inv=inv.reshape(-1)
    Pv=P[lv[first]];Nv=N[first];Uv=uv[first]
    I=inv[tl].reshape(-1,3)
    return Pv,Nv,Uv,I
def thin_cards(P,N,U,I,keep,seed=7):
    """LOD1 du feuillage : on garde une fraction `keep` des cartes (îlots connexes) et on les agrandit autour de leur centre pour conserver la couverture ; None si trop peu d'îlots"""
    from scipy.sparse import coo_matrix
    from scipy.sparse.csgraph import connected_components
    key=np.round(P*1000).astype(np.int64);_,vid=np.unique(key,axis=0,return_inverse=True);vid=vid.reshape(-1);n=vid.max()+1
    r=np.concatenate([vid[I[:,0]],vid[I[:,1]],vid[I[:,2]]]);c=np.concatenate([vid[I[:,1]],vid[I[:,2]],vid[I[:,0]]])
    nc,lab=connected_components(coo_matrix((np.ones(len(r)),(r,c)),shape=(n,n)),directed=False)
    if nc<24: return None
    rng=np.random.RandomState(seed);order=rng.permutation(nc);kept=np.zeros(nc,bool);kept[order[:max(1,int(round(nc*keep)))]]=True
    tl=lab[vid[I[:,0]]];I2=I[kept[tl]]
    used=np.unique(I2);remap=-np.ones(len(P),np.int64);remap[used]=np.arange(len(used))
    P2=P[used].copy();N2=N[used];U2=U[used];vl=lab[vid[used]]
    cen=np.zeros((nc,3));cnt=np.zeros(nc)
    np.add.at(cen,vl,P2);np.add.at(cnt,vl,1);cen/=np.maximum(cnt,1)[:,None]
    f=min(1.7,1/math.sqrt(keep));P2=cen[vl]+(P2-cen[vl])*f
    return dict(P=P2,N=N2,U=U2,I=remap[I2])
def to_engine(P):  # Blender Z haut -> moteur Y haut
    return np.stack([P[:,0],P[:,2],-P[:,1]],axis=1)
def run(name,c):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    path=os.path.join(SRC,c['f']);j,bin_=glb_json(path)
    bpy.ops.import_scene.gltf(filepath=path);bpy.context.view_layer.update()
    objs=[o for o in bpy.data.objects if o.type=='MESH' and o.data.materials and o.data.materials[0]]
    if 'only' in c: objs=[o for o in objs if any(k in o.name for k in c['only'])]
    objs=[o for o in objs if o.data.materials[0].name not in c.get('skipmat',[])]
    allp=np.concatenate([np.array([tuple(o.matrix_world@v.co) for v in o.data.vertices]) for o in objs])
    zmin=allp[:,2].min();H=allp[:,2].max()-zmin;k=c['h']/H
    low=allp[allp[:,2]<zmin+.06*H];cx,cy=low[:,0].mean(),low[:,1].mean()
    if c['kind'] in('buisson','souche'):
        cx,cy=(allp[:,0].min()+allp[:,0].max())/2,(allp[:,1].min()+allp[:,1].max())/2
    print(name,'hauteur source',round(H,3),'échelle',k)
    mT=__import__('mathutils')
    FX=mT.Matrix.Scale(k,4)@mT.Matrix.Translation((-cx,-cy,-zmin))
    groups={}
    for o in objs: groups.setdefault(o.data.materials[0].name,[]).append(o)
    # --- matériaux : texture, alpha, géométrie LOD0 / LOD1
    M=[]
    for mn,ol in groups.items():
        img,fac,gm=mat_tex(j,bin_,mn)
        alpha=False
        if img is not None:
            im=img.convert('RGBA');alpha=bool(np.array(im.getchannel('A')).min()<250)
        m=dict(n=mn,img=img,fac=fac,alpha=alpha,L=[])
        for L in (0,1):
            if L==1 and alpha:
                d0=m['L'][0];th=thin_cards(d0['P'],d0['N'],d0['U'],d0['I'],c['r1'][1])
                if th is not None:
                    m['L'].append(th);continue
            Ps=[];Ns=[];Us=[];Is=[];off=0
            for o in ol:
                if L==1:
                    for p in o.data.polygons: p.use_smooth=True
                    isleaf=alpha
                    md=o.modifiers.new('d','DECIMATE');md.ratio=c['r1'][1 if isleaf else 0];md.use_collapse_triangulate=True
                    bpy.context.view_layer.update();DG=bpy.context.evaluated_depsgraph_get()
                    me=o.evaluated_get(DG).to_mesh()
                else: me=o.data
                Pv,Nv,Uv,I=mesh_arrays(me,FX@o.matrix_world)
                if L==1: o.modifiers.remove(md)
                Ps.append(Pv);Ns.append(Nv);Us.append(Uv);Is.append(I+off);off+=len(Pv)
            m['L'].append(dict(P=to_engine(np.concatenate(Ps)),N=to_engine(np.concatenate(Ns)),U=np.concatenate(Us),I=np.concatenate(Is)))
        U0=m['L'][0]['U'];m['tiled']=bool(U0.min()<-.1 or U0.max()>1.15)
        if not m['tiled']:
            for d_ in m['L']: d_['U']=np.clip(d_['U'],0,1)
        print(' ',name,mn,'alpha',alpha,'tiled',m['tiled'],'tris',[len(x['I']) for x in m['L']])
        M.append(m)
    # --- atlas : matériaux non répétés (cellule 512x448 + bande de 64 px pour l'échantillon de couleur d'écorce)
    AT=[m for m in M if not m['tiled']];ST=[m for m in M if m['tiled']]
    needsw=any(m['tiled'] and not m['alpha'] for m in M)  # écorce répétée : LOD1 en aplat
    res={'n':name,'kind':c['kind'],'h':c['h']}
    out_tex={}
    if AT or needsw:
        nc=max(1,len(AT));W=CELL*(1 if nc==1 else 2 if nc==2 else 2);Hh=CELL if nc<=2 else 2*CELL
        atl=Image.new('RGBA',(W,Hh),(0,0,0,0));cw,ch=CELL,CELL-STRIP if nc<=2 else CELL
        for i,m in enumerate(AT):
            col,row=i%2,i//2;x0,y0=col*CELL,row*CELL;cwid,chei=CELL,(CELL-STRIP if row==0 and nc<=2 else CELL)
            if nc>2: chei=CELL
            im=m['img'].convert('RGBA') if m['img'] is not None else Image.new('RGBA',(8,8),tuple(int(255*x) for x in m['fac'][:3])+(255,))
            if m['alpha']: im=bleed(im.resize((cwid,chei),Image.LANCZOS) if im.size!=(cwid,chei) else im)
            else: im=im.resize((cwid,chei),Image.LANCZOS)
            f=np.array(m['fac'][:3]);
            if abs(f-1).max()>.02:
                a=np.array(im).astype(np.float32);a[...,:3]*=f;im=Image.fromarray(np.clip(a,0,255).astype(np.uint8))
            inner=im.resize((cwid-2*GUT,chei-2*GUT),Image.LANCZOS)
            tile=Image.new('RGBA',(cwid,chei));tile.paste(inner,(GUT,GUT))
            a=np.array(tile);a[:GUT,:,:]=a[GUT:GUT+1,:,:];a[-GUT:,:,:]=a[-GUT-1:-GUT,:,:];a[:,:GUT,:]=a[:,GUT:GUT+1,:];a[:,-GUT:,:]=a[:,-GUT-1:-GUT,:]
            atl.paste(Image.fromarray(a),(x0,y0));m['cell']=(x0,y0,cwid,chei)
        # échantillon d'écorce : couleur moyenne de l'écorce répétée
        sw=None
        for m in ST:
            if not m['alpha'] and m['img'] is not None:
                a=np.array(m['img'].convert('RGB').resize((64,64))).reshape(-1,3).mean(0)*np.array(m['fac'][:3]);sw=tuple(int(x) for x in a)
        if sw is None and needsw: sw=(90,70,50)
        swc=None
        if sw is not None:
            atl.paste(Image.new('RGBA',(W,STRIP),sw+(255,)),(0,Hh-STRIP) if nc<=2 else (0,Hh-STRIP));swc=((W/2)/W,1-((Hh-STRIP/2)/Hh))
        atl.save(OUT+'/tex/%s_atlas.webp'%name,'WEBP',quality=82,alpha_quality=92,method=6);res['atlas']=name+'_atlas.webp';res['atlasWH']=[W,Hh]
    for m in ST:
        img=m['img'];fn='%s_%s.webp'%(name,'bark' if not m['alpha'] else 'tile')
        if img is not None:
            im=img.convert('RGBA' if m['alpha'] else 'RGB');tmax=1024 if m['alpha'] else 512;s=min(tmax,max(im.size));w,h=im.size;sc=s/max(w,h);im=im.resize((max(8,round(w*sc)),max(8,round(h*sc))),Image.LANCZOS)
            if m['alpha']: im=bleed(im)
            f=np.array(m['fac'][:3])
            if abs(f-1).max()>.02:
                a=np.array(im).astype(np.float32);a[...,:3]*=f;im=Image.fromarray(np.clip(a,0,255).astype(np.uint8))
            im.save(OUT+'/tex/'+fn,'WEBP',quality=82,alpha_quality=92,method=6);m['file']=fn
    # --- assemblage des parties
    def remap(m,U):
        x0,y0,cw_,ch_=m['cell'];W_,H_=res['atlasWH']
        u=(x0+GUT+U[:,0]*(cw_-2*GUT))/W_;v=1-(y0+GUT+(1-U[:,1])*(ch_-2*GUT))/H_
        return np.stack([u,v],1)
    lod=[[],[]]
    for L in (0,1):
        P=[];N=[];U=[];I=[];off=0
        for m in M:
            d=m['L'][L]
            if m['tiled']:
                if L==1 and not m['alpha']:
                    uu=np.tile(np.array(swc,np.float32),(len(d['P']),1))
                    P.append(d['P']);N.append(d['N']);U.append(uu);I.append(d['I']+off);off+=len(d['P']);continue
                lod[L].append(dict(P=d['P'],N=d['N'],U=d['U'],I=d['I'],tex=m['file'],alpha=m['alpha']));continue
            P.append(d['P']);N.append(d['N']);U.append(remap(m,d['U']));I.append(d['I']+off);off+=len(d['P'])
        if P: lod[L].insert(0,dict(P=np.concatenate(P),N=np.concatenate(N),U=np.concatenate(U),I=np.concatenate(I),tex=None,alpha=True))
    allv=np.concatenate([p['P'] for p in lod[0]])
    mn=allv.min(0);mx=allv.max(0)
    # collision : rayon du tronc (tranche 0,5-1,2 m du bois, 25e centile des distances à l'axe) ; couronne
    wv=np.concatenate([d['L'][0]['P'] for d in M if not d['alpha']] or [allv])
    sl=wv[(wv[:,1]>.5)&(wv[:,1]<1.2)]
    if len(sl)<6: sl=wv[(wv[:,1]<max(.5,.25*c['h']))]
    ax=np.median(sl[:,[0,2]],axis=0) if len(sl) else np.zeros(2)
    d=np.hypot(sl[:,0]-ax[0],sl[:,2]-ax[1]) if len(sl) else np.array([.3])
    rt=float(np.percentile(d,25))
    if 'rt' in c: rt=c['rt']
    cr=float(np.percentile(np.hypot(allv[:,0],allv[:,2]),92))
    res.update(dict(bb=[round(float(x),3) for x in (*mn,*mx)],rt=round(rt,3),cr=round(cr,3)))
    print(name,'bbox',res['bb'],'rayon tronc',round(rt,3),'couronne',round(cr,2),'atlas',res.get('atlasWH'))
    ctr=(mn+mx)/2;half=np.maximum((mx-mn)/2,1e-3)*1.0001
    res['q']=[round(float(x),5) for x in (*ctr,*half)]
    for L in (0,1):
        parts=[]
        for p in lod[L]:
            Pq=np.clip(np.round((p['P']-ctr)/half*32767),-32767,32767).astype(np.int16)
            Nq=np.clip(np.round(p['N']*127),-127,127).astype(np.int8)
            ma=float(np.abs(p['U']).max());us=32767/max(1,math.ceil(ma))
            Uq=np.clip(np.round(p['U']*us),-32767,32767).astype(np.int16)
            I=p['I'].astype(np.uint16);keep=(I[:,0]!=I[:,1])&(I[:,1]!=I[:,2])&(I[:,0]!=I[:,2]);I=I[keep]
            blob=Pq.tobytes()+Nq.tobytes()+(b'\0' if (len(Pq)*9)%2 else b'')+Uq.tobytes()+I.tobytes()
            parts.append(dict(v=len(Pq),i=int(I.size),us=us,tex=p['tex'],alpha=bool(p['alpha']),b=base64.b64encode(blob).decode()))
            print('   LOD',L,'part tex',p['tex'],'verts',len(Pq),'tris',I.size//3)
        res['lod%d'%L]=parts
    json.dump(res,open('%s/%s.json'%(OUT,name),'w'))
names=sys.argv[3].split(',') if len(sys.argv)>3 else list(SP)
for n in names: run(n,SP[n])
