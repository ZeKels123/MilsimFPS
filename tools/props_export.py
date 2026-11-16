import bpy,json,io,base64,struct,array,mathutils,sys
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
    bpy.ops.import_scene.gltf(filepath=path)
    ms=[o for o in bpy.data.objects if o.type=='MESH']
    allv=[];parts=[]
    for o in ms:
        mw=o.matrix_world;me=o.data
        me.calc_loop_triangles()
        uvl=me.uv_layers.active
        P=array.array('f');N=array.array('f');Uv=array.array('f');I=array.array('H');vm={}
        for t in me.loop_triangles:
            for k,li in enumerate(t.loops):
                v=t.vertices[k];u=uvl.data[li].uv if uvl else (0,0);key=(v,round(u[0],4),round(u[1],4))
                if key not in vm:
                    vm[key]=len(P)//3;w=mw@me.vertices[v].co;P.extend([w.x,w.z,-w.y]);allv.append((w.x,w.z,-w.y))
                    n=(mw.to_3x3()@me.vertices[v].normal).normalized();N.extend([n.x,n.z,-n.y]);Uv.extend([u[0],u[1]])
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
open('/home/claude/milsimfps/src/parts/props3d_data.js','w').write(js)
print('total KB',len(js)//1024)
