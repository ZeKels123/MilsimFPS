# Export du mobilier d'intérieur (Sketchfab, CC-BY : docs/CREDITS_ASSETS.md) : GLB -> données compactes (maillages quantifiés par matériau + textures WebP réduites).
# Usage : python3 tools/deco_export.py [dossier_glb] [dossier_sortie] [clés,...]     (nécessite bpy, PIL, numpy, scipy)
# Pour chaque modèle : objets retenus (sol/caméra/verre exclus), rotation de façade (la face avant regarde +Z), mise à l'échelle en mètres, origine posée
# (sol : pied centré ; mur : dos centré ; plafond : sommet centré), décimation légère au-delà d'un plafond de triangles, recadrage UV des textures d'atlas.
import bpy,sys,os,json,struct,io,math,base64
import numpy as np
from PIL import Image
SRC=sys.argv[1] if len(sys.argv)>1 else '/home/claude/work/dl/interieur'
OUT=sys.argv[2] if len(sys.argv)>2 else '/home/claude/work/deco/export'
os.makedirs(OUT+'/tex',exist_ok=True)
# clé : fichier, objets retenus (sous-chaînes, None = tous), exclus, yaw (degrés autour de Y, après import), échelle ('h' hauteur | 'x'|'z' | 'L' plus grande dimension horizontale : valeur en mètres | 'k' facteur),
# origine ('floor'|'wall'|'top'), cap de triangles, taille max de texture
CFG=json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'deco_cfg.json')))
def glb_json(path):
    d=open(path,'rb').read();l=struct.unpack('<I',d[12:16])[0];j=json.loads(d[20:20+l]);o=20+l;bo=o+8;return j,d[bo:bo+struct.unpack('<I',d[o:o+4])[0]]
def mat_info(j,bin_,name):
    base=name.split('.0')[0] if name not in [m.get('name') for m in j['materials']] else name
    for m in j['materials']:
        if m.get('name')!=base: continue
        pb=m.get('pbrMetallicRoughness',{});sg=m.get('extensions',{}).get('KHR_materials_pbrSpecularGlossiness');ti=None;fac=list(pb.get('baseColorFactor',[1,1,1,1]));tr=1.0
        if 'baseColorTexture' in pb:
            ti=pb['baseColorTexture']['index'];tr=pb['baseColorTexture'].get('extensions',{}).get('KHR_texture_transform',{}).get('scale',[1,1])[0]
        if sg:
            if 'diffuseTexture' in sg: ti=sg['diffuseTexture']['index']
            fac=sg.get('diffuseFactor',fac)
        img=None
        if ti is not None:
            im=j['images'][j['textures'][ti]['source']];bv=j['bufferViews'][im['bufferView']]
            img=Image.open(io.BytesIO(bin_[bv.get('byteOffset',0):bv.get('byteOffset',0)+bv['byteLength']])).convert('RGBA')
        return dict(img=img,fac=fac,mode=m.get('alphaMode','OPAQUE'),ds=m.get('doubleSided',False),tr=tr,key=base+':'+str(ti))
    return dict(img=None,fac=[.8,.8,.8,1],mode='OPAQUE',ds=False,tr=1.0,key=name)
def bleed(im):
    from scipy.ndimage import gaussian_filter as gf
    a=np.array(im.getchannel('A'));al=a.astype(np.float32)/255;rgb=np.array(im.convert('RGB'),np.float32);out=rgb.copy();hole=a<8;done=np.zeros(a.shape,bool)
    for r in (2,6,18,48):
        den=gf(al,r);num=np.stack([gf(rgb[...,k]*al,r) for k in range(3)],-1);fill=num/np.maximum(den[...,None],1e-4);m=hole&~done&(den>.01);out[m]=fill[m];done|=m
    res=Image.fromarray(np.clip(out,0,255).astype(np.uint8)).convert('RGBA');res.putalpha(Image.fromarray(a));return res
def mesh_arrays(me,mw):
    me.calc_loop_triangles();nt=len(me.loop_triangles);nl=len(me.loops)
    tl=np.empty(nt*3,np.int32);me.loop_triangles.foreach_get('loops',tl);tm=np.empty(nt,np.int32);me.loop_triangles.foreach_get('material_index',tm)
    lv=np.empty(nl,np.int32);me.loops.foreach_get('vertex_index',lv)
    co=np.empty(len(me.vertices)*3,np.float32);me.vertices.foreach_get('co',co);co=co.reshape(-1,3)
    uv=np.zeros((nl,2),np.float32);uvl=me.uv_layers.active
    if uvl is not None:
        tmp=np.empty(nl*2,np.float32);uvl.uv.foreach_get('vector',tmp);uv=tmp.reshape(-1,2)
    nr=np.empty(nl*3,np.float32)
    try: me.corner_normals.foreach_get('vector',nr)
    except Exception:
        me.calc_normals_split();me.loops.foreach_get('normal',nr)
    nr=nr.reshape(-1,3);M=np.array(mw.to_3x3(),np.float32);T=np.array(mw.translation,np.float32);P=co@M.T+T
    NM=np.array(mw.to_3x3().inverted().transposed(),np.float32);N=nr@NM.T;N/=np.maximum(np.linalg.norm(N,axis=1,keepdims=True),1e-9)
    key=np.concatenate([lv[:,None].astype(np.float64),np.round(uv,4),np.round(N,2)],axis=1)
    _,first,inv=np.unique(key,axis=0,return_index=True,return_inverse=True);inv=inv.reshape(-1)
    return P[lv[first]],N[first],uv[first],inv[tl].reshape(-1,3),tm
def to_engine(P): return np.stack([P[...,0],P[...,2],-P[...,1]],axis=-1)
def rotX(A,deg):
    t=math.radians(deg);c,s=math.cos(t),math.sin(t);y=A[:,1]*c-A[:,2]*s;z=A[:,1]*s+A[:,2]*c;return np.stack([A[:,0],y,z],1)
def rotY(A,deg):
    t=math.radians(deg);c,s=math.cos(t),math.sin(t);x=A[:,0]*c+A[:,2]*s;z=-A[:,0]*s+A[:,2]*c;return np.stack([x,A[:,1],z],1)
def run(name,c):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    path=os.path.join(SRC,c['f']);j,bin_=glb_json(path)
    bpy.ops.import_scene.gltf(filepath=path);bpy.context.view_layer.update()
    objs=[o for o in bpy.data.objects if o.type=='MESH' and len(o.data.polygons)]
    if c.get('sel'): objs=[o for o in objs if any(k in o.name for k in c['sel'])]
    objs=[o for o in objs if not any(k in o.name for k in c.get('ex',[]))]
    tot=sum(len(o.data.polygons) for o in objs)  # approx triangles (quads comptés une fois)
    cap=c.get('cap',6000);ratio=min(1.0,cap/max(1,tot*1.6))
    # dimensions pour l'échelle (sommets monde, repère moteur)
    allp=np.concatenate([to_engine(np.array([tuple(o.matrix_world@v.co) for v in o.data.vertices])) for o in objs]);allp=rotY(rotX(allp,c.get('rx',0)),c.get('yaw',0))
    mn,mx=allp.min(0),allp.max(0);d=mx-mn;m,v=c['sc']
    k={'h':v/d[1],'x':v/d[0],'z':v/d[2],'L':v/max(d[0],d[2]),'k':v}[m]
    items=[];allv=[]
    for o in objs:
        r=ratio if ratio<.98 and len(o.data.polygons)>40 else 1.0
        if r<1:
            md=o.modifiers.new('d','DECIMATE');md.ratio=max(.05,r);md.use_collapse_triangulate=True;bpy.context.view_layer.update();me=o.evaluated_get(bpy.context.evaluated_depsgraph_get()).to_mesh()
        else: me=o.data
        Pv,Nv,Uv,I,tm=mesh_arrays(me,o.matrix_world)
        Pe=rotY(rotX(to_engine(Pv),c.get('rx',0)),c.get('yaw',0))*k;Ne=rotY(rotX(to_engine(Nv),c.get('rx',0)),c.get('yaw',0))
        if r<1: o.modifiers.remove(md)
        items.append((o,Pe,Ne,Uv,I,tm,[mm for mm in o.data.materials]));allv.append(Pe)
    A=np.concatenate(allv);mn,mx=A.min(0),A.max(0);org=c.get('org','floor')
    cx,cz=(mn[0]+mx[0])/2,(mn[2]+mx[2])/2
    if 'ctr' in c: cx,cz=c['ctr']
    off=np.array([cx,mn[1],cz]) if org=='floor' else np.array([cx,mn[1],mn[2]]) if org=='wall' else np.array([cx,mx[1],cz])
    # parties par matériau
    parts={}
    for o,Pe,Ne,Uv,I,tm,mats in items:
        for mi in np.unique(tm):
            mat=mats[mi] if mi<len(mats) else None;mname=mat.name if mat else 'none'
            if any(x in mname for x in c.get('drop',[])): continue
            info=mat_info(j,bin_,mname)
            if info['img'] is None and info['mode']=='BLEND' and info['fac'][3]<.95: continue   # verre
            tri=I[tm==mi]
            if c.get('cut'):
                hy=(Pe[tri][:,:,1]-Pe[:,1].min()).max(1);tri=tri[hy>c['cut']]
            P=parts.setdefault(info['key'],dict(info=info,P=[],N=[],U=[],I=[],off=0))
            used=np.unique(tri);rm=-np.ones(len(Pe),np.int64);rm[used]=np.arange(len(used))
            P['P'].append(Pe[used]-off);P['N'].append(Ne[used]);P['U'].append(Uv[used]*info['tr']);P['I'].append(rm[tri]+P['off']);P['off']+=len(used)
    mn2=np.min(np.concatenate([np.concatenate(p['P']) for p in parts.values()]),0);mx2=np.max(np.concatenate([np.concatenate(p['P']) for p in parts.values()]),0)
    ctr=(mn2+mx2)/2;half=np.maximum((mx2-mn2)/2,1e-3)*1.0001;res=dict(n=name,dims=[round(float(x),3) for x in (mx2-mn2)],bb=[round(float(x),3) for x in (*mn2,*mx2)],org=org,q=[round(float(x),5) for x in (*ctr,*half)],parts=[],tris=0)
    tmax=c.get('tmax',512);cache={}
    for ki,(key,p) in enumerate(parts.items()):
        info=p['info'];Pp=np.concatenate(p['P']);Np=np.concatenate(p['N']);Up=np.concatenate(p['U']);Ip=np.concatenate(p['I']);tex=None;alpha=False
        col=[round(float(x),4) for x in info['fac'][:3]]
        if info['img'] is not None:
            im=info['img'];W,H=im.size
            tiled=bool(Up.min()<-.05 or Up.max()>1.05)
            if not tiled:
                u0,u1=Up[:,0].min(),Up[:,0].max();v0,v1=Up[:,1].min(),Up[:,1].max();pad=.012
                u0,u1,v0,v1=max(0,u0-pad),min(1,u1+pad),max(0,v0-pad),min(1,v1+pad)
                if (u1-u0)*(v1-v0)<.7:
                    x0,x1=int(math.floor(u0*W)),int(math.ceil(u1*W));y0,y1=int(math.floor((1-v1)*H)),int(math.ceil((1-v0)*H));x1=max(x1,x0+4);y1=max(y1,y0+4)
                    im=im.crop((x0,y0,x1,y1));Up=np.stack([(Up[:,0]*W-x0)/(x1-x0),(Up[:,1]*H-(H-y1))/(y1-y0)],1)
                Up=np.clip(Up,0,1)
            has_a=np.array(im.getchannel('A')).min()<250 and info['mode']!='OPAQUE'
            alpha=bool(has_a)
            if alpha: im=bleed(im)
            f=np.array(info['fac'][:3])
            if abs(f-1).max()>.02:
                a=np.array(im).astype(np.float32);a[...,:3]*=f;im=Image.fromarray(np.clip(a,0,255).astype(np.uint8));col=[1,1,1]
            else: col=[1,1,1]
            s=min(tmax,max(im.size));sc_=s/max(im.size)
            if sc_<1: im=im.resize((max(8,round(im.size[0]*sc_)),max(8,round(im.size[1]*sc_))),Image.LANCZOS)
            fn='%s_%d.webp'%(name,ki)
            (im if alpha else im.convert('RGB')).save(OUT+'/tex/'+fn,'WEBP',quality=c.get('q',78),alpha_quality=92,method=5);tex=fn
        Pq=np.clip(np.round((Pp-ctr)/half*32767),-32767,32767).astype(np.int16);Nq=np.clip(np.round(Np*127),-127,127).astype(np.int8)
        ma=float(np.abs(Up).max());us=32767/max(1,math.ceil(ma));Uq=np.clip(np.round(Up*us),-32767,32767).astype(np.int16)
        Iq=Ip.astype(np.uint16);keep=(Iq[:,0]!=Iq[:,1])&(Iq[:,1]!=Iq[:,2])&(Iq[:,0]!=Iq[:,2]);Iq=Iq[keep]
        blob=Pq.tobytes()+Nq.tobytes()+(b'\0' if (len(Pq)*9)%2 else b'')+Uq.tobytes()+Iq.tobytes()
        res['parts'].append(dict(v=len(Pq),i=int(Iq.size),us=us,t=tex,col=col,alpha=alpha,ds=bool(info['ds'] or alpha),b=base64.b64encode(blob).decode()));res['tris']+=int(Iq.size//3)
    print(name,'tris',res['tris'],'dims',res['dims'],'parts',len(res['parts']),'scale %.4f'%k)
    json.dump(res,open('%s/%s.json'%(OUT,name),'w'))
names=sys.argv[3].split(',') if len(sys.argv)>3 else list(CFG)
for n in names: run(n,CFG[n])
