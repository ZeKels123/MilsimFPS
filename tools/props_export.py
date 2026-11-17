import math,bpy,json,io,base64,struct,array,mathutils,sys,os
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import proc_props
from PIL import Image
U='/mnt/user-data/uploads/assets jeux/Sketchfab/'
SRC=[('sandbag',U+'decor/military_sandbag_barrier_lowpoly.glb',512,0),
     ('crate',U+'props/old_ammo_crate.glb',512,0),
     ('jersey','/tmp/jb/source/jersey_barrier_concrete_fence.glb',512,0),
     ('tent',U+'decor/tent_venikamen_CCBY.glb',512,0),
     ('barrel',U+'props/barrel_farsmok_CCBY.glb',256,0),
     ('tower',U+'decor/watchtower_zachariblinn_CCBY.glb',512,0),
     ('wire',U+'decor/barbedwire_JohnDoe2311_CCBY.glb',256,0),
     ('jeep',U+'props/uaz469_grox777_CCBY.glb',512,0)]
# v59 (Sketchfab) : remplacements des décors procéduraux ; OPT[nom]=(fichier, texture max, hauteur ou longueur cible en m, 'h'|'L', yaw auto, mots à exclure)
OPT={'tankwreck':('tankt72_mrtherich_CCBY.glb',512,8.0,'L',1,['Icosphere'],0.9),
 'heli':('huey_duanesmind_CCBY.glb',512,12.0,'L',1,[],0.8),
 'carwreck':('carwreck_bytescrafter_CCBY.glb',128,4.6,'L',1,['Icosphere'],0.7),
 'cmdtent':('militarytent_reinaw13_CCBY.glb',256,10.0,'L',1,[],0.7),
 'container':('container_rmaull2002_CCBY.glb',512,8.5,'L',1,[],0.6),
 'fueltank':('rustedtank_mkc_CCBY.glb',256,3.6,'h',1,[],0.4),
 'generator':('generator_tboiston_CCBY.glb',256,2.6,'L',1,[],0.6),
 'mast':('radiotower_gunnarcorrea_CCBY.glb',256,16.0,'h',0,['Floor'],0.6),
 'floodlight':('searchlight_jerd_CCBY.glb',0,1.8,'h',0,[],0.4),
 'supply':('militarycrate_luddepudde_CCBY.glb',256,1.4,'L',0,[]),
 'pallets':('pallets_annadenisova_CCBY.glb',256,1.0,'s',0,[],0.7),
 'messtable':('woodentable_mrsweetly_CCBY.glb',256,1.8,'L',1,[],0.6),
 'flag':('flagred_marishka1611_CCBY.glb',128,4.5,'h',0,[]),
 'jerry':('jerrycan_sasharx_CCBY.glb',128,.5,'h',0,[]),
 'cot':('cot_mseecs298_CCBY.glb',128,1.5,'L',1,[])}
SRC=[x for x in SRC if x[0] not in OPT]+[(n,U+'props/'+o[0],o[1],0) for n,o in OPT.items()]
def b64(a):return base64.b64encode(a.tobytes()).decode()
def img_of(mat):
    if not mat or not mat.use_nodes:return None,None
    bsdf=next((n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED'),None)
    if not bsdf:return None,None
    inp=bsdf.inputs['Base Color'];col=list(inp.default_value)[:3]
    if inp.links:
        n=inp.links[0].from_node
        if n.type=='TEX_IMAGE':return n.image,col
        for l in n.inputs:
            if l.links and l.links[0].from_node.type=='TEX_IMAGE':return l.links[0].from_node.image,col
    return None,col
def anyimg(mat):
    if mat and mat.use_nodes:
        for n in mat.node_tree.nodes:
            if n.type=='TEX_IMAGE' and n.image:return n.image
    return None
TX=[];TXI={}
out={}
for name,path,tex,dec in SRC:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    if path.startswith('proc:'):proc_props.make(path[5:])
    else:bpy.ops.import_scene.gltf(filepath=path)
    bpy.context.view_layer.update()
    ms=[o for o in bpy.data.objects if o.type=='MESH']
    O=OPT.get(name);EV={};RM=mathutils.Matrix.Identity(4)
    if O:
        ms=[o for o in ms if not any(k in o.name for k in O[5])]
        if len(O)>6:
            for o in ms:mo=o.modifiers.new('dec','DECIMATE');mo.ratio=O[6]
        DG=bpy.context.evaluated_depsgraph_get();EV={o.name:o.evaluated_get(DG).to_mesh() for o in ms}
        pts=[o.matrix_world@v.co for o in ms for v in EV[o.name].vertices]
        yaw=0
        if O[4]:
            best=None
            for a in range(0,180):
                c,sn=math.cos(math.radians(a)),math.sin(math.radians(a))
                xs=[p[0]*c+p[1]*sn for p in pts];ys=[-p[0]*sn+p[1]*c for p in pts]
                ar=(max(xs)-min(xs))*(max(ys)-min(ys))
                if best is None or ar<best[0]:best=(ar,a)
            yaw=-math.radians(best[1])
        RM=mathutils.Matrix.Rotation(yaw,4,'Z')
        q=[RM@p for p in pts];ext=[max(p[i] for p in q)-min(p[i] for p in q) for i in range(3)]
        ref={'h':ext[2],'L':max(ext[0],ext[1]),'s':1}[O[3]];k=O[2]/ref if O[3]!='s' else O[2]
        RM=mathutils.Matrix.Scale(k,4)@RM;print(name,'yaw',round(math.degrees(yaw)),'ext',[round(e,2) for e in ext],'k',round(k,5))
    allv=[];parts=[]
    for o in ms:
        mw=RM@o.matrix_world;me=EV[o.name] if O else o.data
        me.calc_loop_triangles()
        uvl=me.uv_layers.active
        P=array.array('f');N=array.array('f');Uv=array.array('f');I=array.array('H');vm={}
        for t in me.loop_triangles:
            for k,li in enumerate(t.loops):
                v=t.vertices[k];u=uvl.data[li].uv if uvl else (0,0);fl=path.startswith('proc:') and not me.polygons[t.polygon_index].use_smooth;key=(v,round(u[0],4),round(u[1],4),t.polygon_index if fl else -1)
                if key not in vm:
                    vm[key]=len(P)//3;w=mw@me.vertices[v].co;P.extend([w.x,w.z,-w.y]);allv.append((w.x,w.z,-w.y))
                    n=(mw.to_3x3()@(t.normal if fl else me.vertices[v].normal)).normalized();N.extend([n.x,n.z,-n.y]);Uv.extend([u[0],u[1]])
                I.append(vm[key])
        if len(P)//3>65000:print('trop de sommets',name);sys.exit(1)
        mat=o.active_material;im,col=img_of(mat);im=im or anyimg(mat);texurl=None;alpha=False
        if im is not None:
            tmp='/tmp/_t.png';im.save_render(tmp);pi=Image.open(tmp)
            alpha=pi.mode=='RGBA' and pi.getchannel('A').getextrema()[0]<250
            s=min(256 if alpha else tex,max(pi.size));pi=pi.resize((s,max(1,int(pi.size[1]*s/pi.size[0]))) if pi.size[0]>=pi.size[1] else (max(1,int(pi.size[0]*s/pi.size[1])),s))
            bf=io.BytesIO()
            if alpha:pi.convert('RGBA').save(bf,'PNG',optimize=True);mime='png'
            else:pi.convert('RGB').save(bf,'JPEG',quality=82);mime='jpeg'
            texurl='data:image/%s;base64,'%mime+base64.b64encode(bf.getvalue()).decode()
            import hashlib
            hk=hashlib.md5(texurl.encode()).hexdigest()
            if hk not in TXI:TXI[hk]=len(TX);TX.append(texurl)
            texurl=TXI[hk]
        parts.append({'v':len(P)//3,'p':P,'nr':N,'u':Uv,'i':I,'tex':texurl,'col':[round(c,3) for c in (col or [.5,.5,.5])],'alpha':alpha,'n':o.name})
    mn=[min(v[i] for v in allv) for i in range(3)];mx=[max(v[i] for v in allv) for i in range(3)]
    ctr=[(mn[0]+mx[0])/2,mn[1],(mn[2]+mx[2])/2]
    res={'n':name,'bb':[round(mx[i]-mn[i],3) for i in range(3)],'parts':[]}
    mg={}
    for p in parts:
        k=(p['tex'],p['alpha'],tuple(p['col']) if p['tex'] is None else ())
        if k not in mg:mg[k]={'v':0,'p':array.array('f'),'nr':array.array('f'),'u':array.array('f'),'i':array.array('H'),'tex':p['tex'],'col':p['col'],'alpha':p['alpha'],'n':'merged'}
        q=mg[k];off=q['v'];q['p'].extend(p['p']);q['nr'].extend(p['nr']);q['u'].extend(p['u']);q['i'].extend([j+off for j in p['i']]);q['v']+=p['v']
    parts=list(mg.values())
    for p in parts:
        P=p['p']
        for k in range(0,len(P),3):P[k]-=ctr[0];P[k+1]-=ctr[1];P[k+2]-=ctr[2]
        res['parts'].append({'p':b64(P),'nr':b64(p['nr']),'u':b64(p['u']),'i':b64(p['i']),'ni':len(p['i']),'ti':p['tex'],'col':p['col'],'alpha':p['alpha']})
        print(name,p['n'],'verts',p['v'],'tris',len(p['i'])//3,'tex',p['tex'],'alpha',p['alpha'])
    print(name,'bbox',res['bb'])
    out[name]=res
js='const P3D_TEX='+json.dumps(TX)+';const P3D_DATA='+json.dumps(out,separators=(',',':'))+';\n'
open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','src','parts','props3d_data.js'),'w').write(js)
print('total KB',len(js)//1024)
