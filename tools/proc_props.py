# Modèles décoratifs procéduraux originaux (aucune licence externe) : construits en bmesh, utilisés par tools/props_export.py (nom 'proc:<nom>').
# Repère Blender Z haut ; unités en mètres ; chaque modèle est fusionné par couleur au moment de l'export.
import bpy,bmesh,math
from mathutils import Matrix,Vector
C={'canvas':(.16,.19,.08),'dark':(.03,.03,.03),'olive':(.1,.14,.06),'steel':(.12,.13,.13),'rust':(.22,.09,.04),'burnt':(.045,.04,.035),'wood':(.3,.18,.08),'wood2':(.2,.12,.055),
   'rubber':(.02,.02,.02),'glass':(.04,.06,.07),'lamp':(.8,.78,.6),'red':(.4,.03,.03),'tan':(.45,.36,.2),'cont':(.1,.14,.2),'contr':(.2,.06,.04),'wheel':(.05,.05,.04)}
class M:
    def __init__(s):s.b={}
    def bm(s,c):
        if c not in s.b:s.b[c]=bmesh.new()
        return s.b[c]
    def box(s,c,ctr,sz,rz=0,rx=0,ry=0):
        b=s.bm(c);r=bmesh.ops.create_cube(b,size=1.0);v=r['verts']
        m=Matrix.Translation(ctr)@Matrix.Rotation(rz,4,'Z')@Matrix.Rotation(ry,4,'Y')@Matrix.Rotation(rx,4,'X')@Matrix.Diagonal((sz[0],sz[1],sz[2],1))
        bmesh.ops.transform(b,matrix=m,verts=v)
    def cyl(s,c,ctr,r,d,axis='Z',r2=None,seg=10,rot=None,smooth=True):
        b=s.bm(c);res=bmesh.ops.create_cone(b,cap_ends=True,segments=seg,radius1=r,radius2=r if r2 is None else r2,depth=d);v=res['verts']
        al={'Z':Matrix.Identity(4),'X':Matrix.Rotation(math.pi/2,4,'Y'),'Y':Matrix.Rotation(-math.pi/2,4,'X')}[axis]
        m=Matrix.Translation(ctr)@(rot if rot is not None else Matrix.Identity(4))@al
        bmesh.ops.transform(b,matrix=m,verts=v)
        if smooth:
            for f in b.faces:
                if all(x in v for x in f.verts) and len(f.verts)==4:f.smooth=True
    def beam(s,c,p0,p1,r,seg=4):
        p0=Vector(p0);p1=Vector(p1);d=p1-p0
        s.cyl(c,(p0+p1)/2,r,d.length,'Z',seg=seg,rot=d.to_track_quat('Z','Y').to_matrix().to_4x4(),smooth=False)
    def sph(s,c,ctr,sz,seg=10):
        b=s.bm(c);r=bmesh.ops.create_uvsphere(b,u_segments=seg,v_segments=max(4,seg//2),radius=.5);v=r['verts']
        bmesh.ops.transform(b,matrix=Matrix.Translation(ctr)@Matrix.Diagonal((sz[0],sz[1],sz[2],1)),verts=v)
        for f in b.faces:f.smooth=True
    def prism(s,c,prof,y0,y1):
        b=s.bm(c);a=[b.verts.new((x,y0,z)) for x,z in prof];d=[b.verts.new((x,y1,z)) for x,z in prof];n=len(prof)
        b.faces.new(a[::-1]);b.faces.new(d)
        for i in range(n):b.faces.new((a[i],a[(i+1)%n],d[(i+1)%n],d[i]))
    def build(s,name):
        for o in list(bpy.data.objects):bpy.data.objects.remove(o)
        for c,b in s.b.items():
            bmesh.ops.recalc_face_normals(b,faces=b.faces)
            me=bpy.data.meshes.new(name+c);b.to_mesh(me);b.free()
            mat=bpy.data.materials.new(c);mat.use_nodes=True;bs=next(n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED');bs.inputs['Base Color'].default_value=(*C[c],1)
            me.materials.append(mat);o=bpy.data.objects.new(name+c,me);bpy.context.scene.collection.objects.link(o)
def cmdtent(m):
    m.prism('canvas',[(-4,0),(4,0),(4,1.9),(0,3.2),(-4,1.9)],-2.5,2.5)
    m.box('dark',(0,2.52,.95),(1.5,.06,1.9));m.box('dark',(0,-2.52,.95),(1.5,.06,1.9))
    m.box('wood2',(0,0,0.03),(8.1,5.1,.06))
    for x in(-3.9,3.9):
        for y in(-2.55,2.55):m.cyl('wood',(x,y,.9),.04,1.8,seg=5)
def messtable(m):
    m.box('wood',(0,0,.74),(3,.85,.05))
    for x in(-1.35,1.35):
        for y in(-.35,.35):m.box('wood2',(x,y,.36),(.07,.07,.72))
    for sy in(-.75,.75):
        m.box('wood',(0,sy,.45),(3,.3,.05))
        for x in(-1.3,1.3):m.box('wood2',(x,sy,.22),(.07,.26,.44))
    for x in(-1,0,1):m.box('steel',(x,0,.79),(.28,.28,.04))
    m.cyl('steel',(1.0,.2,.9),.1,.26,seg=8)
def generator(m):
    m.box('steel',(0,0,.07),(1.5,.7,.1));m.box('olive',(0,0,.5),(1.2,.6,.7));m.box('olive',(-.5,0,.97),(.5,.5,.25))
    m.box('steel',(.35,0,.9),(.6,.52,.08));m.cyl('rust',(.55,.1,1.2),.045,.7,seg=6);m.box('dark',(.62,0,.55),(.02,.5,.4))
    for y in(-.28,.28):m.box('steel',(-.6,y,.4),(.04,.04,.9))
    m.beam('steel',(-.6,-.28,.85),(-.6,.28,.85),.025,4);m.cyl('olive',(0,0,1.08),.18,.2,seg=8)
def mast(m):
    H=12.0;w0=.9;w1=.2
    def pt(h,k):
        w=w0+(w1-w0)*h/H;sx,sy=[(1,1),(-1,1),(-1,-1),(1,-1)][k];return (sx*w,sy*w,h)
    n=8
    for k in range(4):m.beam('steel',pt(0,k),pt(H,k),.04,4)
    for i in range(n):
        h0=H*i/n;h1=H*(i+1)/n
        for k in range(4):
            a=pt(h0,k);b=pt(h1,(k+1)%4);m.beam('steel',a,b,.022,4)
            m.beam('steel',pt(h1,k),pt(h1,(k+1)%4),.025,4)
    m.box('steel',(0,0,.06),(2.2,2.2,.12))
    m.beam('steel',(0,0,H),(0,0,H+3.2),.03,6)
    m.cyl('steel',(0,.35,9.5),.5,.12,'Y',r2=.5,seg=14,smooth=False)
    m.box('steel',(.1,.1,6.5),(.25,.18,.35));m.beam('steel',(-.2,.1,8.2),(.5,.1,8.2),.02,4)
def floodlight(m):
    top=(0,0,3.0)
    for a in(0,2.094,4.189):m.beam('steel',top,(math.sin(a)*1.1,math.cos(a)*1.1,0),.03,5)
    m.cyl('steel',(0,0,3.4),.05,.9,seg=6)
    m.box('olive',(0,0,3.75),(.75,.28,.55));m.box('lamp',(0,-.15,3.75),(.62,.03,.44))
    m.box('dark',(0,0,3.45),(.2,.2,.2))
    m.box('steel',(0,.5,.6),(.5,.4,.45))
def carwreck(m):
    m.box('rust',(0,0,.55),(4.4,1.8,.55));m.box('rust',(1.7,0,.88),(1.0,1.7,.12),ry=-.12)
    m.prism('rust',[(-1.2,.8),(1.0,.8),(.65,1.38),(-.8,1.38)],-.8,.8)
    m.box('glass',(.15,0,1.1),(1.0,1.62,.3),);m.box('burnt',(-1.9,0,.3),(.5,1.7,.3))
    m.box('burnt',(2.1,0,.5),(.25,1.75,.4))
    for x,y in((1.4,.85),(-1.4,.85),(-1.4,-.85)):m.cyl('wheel',(x,y,.33),.33,.22,'Y',seg=10)
    m.box('burnt',(.1,.92,.8),(1.0,.06,.9),rz=.5)
    m.box('rust',(-.2,0,1.42),(1.55,1.5,.05),ry=.04)
def tankwreck(m):
    m.box('burnt',(0,0,.92),(6.0,2.5,.85));m.prism('burnt',[(2.9,.5),(3.7,.9),(3.1,1.35),(2.9,1.35)],-1.2,1.2)
    for y in(-1.4,1.4):
        m.box('burnt',(0,y,.5),(6.6,.7,.9))
        for i in range(6):m.cyl('wheel',(-2.5+i*1.0,y*1.14,.45),.4,.2,'Y',seg=10)
        m.cyl('wheel',(3.3,y*1.14,.6),.3,.2,'Y',seg=8)
    m.box('rust',(0,0,.5),(5.2,2.1,.4))
    m.cyl('olive',(-.7,.25,1.8),1.3,.7,seg=14,rot=Matrix.Rotation(.1,4,'X')@Matrix.Rotation(.12,4,'Y'))
    m.box('olive',(-2.0,.1,1.82),(.9,1.9,.7),ry=.1)
    m.beam('steel',(.5,.3,1.95),(4.4,.6,1.3),.1,8);m.cyl('steel',(.7,.3,1.95),.22,.5,'X',seg=8)
    m.cyl('olive',(-1.0,.8,2.2),.38,.14,seg=8);m.box('rust',(-1.3,-.7,2.2),(.5,.4,.3))
    m.box('dark',(1.0,0,1.43),(1.6,1.0,.05))
    m.beam('burnt',(-3.1,1.4,.9),(-4.4,1.6,.1),.06,4)
def fueltank(m):
    m.cyl('olive',(0,0,1.7),1.05,6.0,'X',seg=16)
    for x in(-2.0,2.0):m.box('steel',(x,0,.28),(.3,2.0,.56))
    for x in(-2.0,2.0):m.beam('steel',(x,-.9,.6),(x,.9,.6),.1,4)
    m.cyl('steel',(1,0,2.78),.35,.2,seg=8);m.cyl('rust',(-1,0,2.76),.2,.14,seg=8)
    m.beam('steel',(-3.0,0,1.2),(-3.4,0,.4),.07,5);m.cyl('red',(-3.4,0,.3),.12,.2,seg=8)
    m.box('steel',(-.5,1.05,1.0),(.04,.3,1.7),ry=.0)
    m.box('red',(0,1.05,1.7),(2.0,.03,.3))
def pallets(m):
    def pal(x,y,z,rz=0):
        c=Vector((x,y,z));R=Matrix.Rotation(rz,3,'Z')
        def P(dx,dy,dz,sx,sy,sz):
            v=c+R@Vector((dx,dy,dz));m.box('wood',v,(sx,sy,sz),rz=rz)
        for dy in(-.45,0,.45):P(0,dy,.06,1.2,.1,.1)
        for dx in(-.5,-.25,0,.25,.5):P(dx,0,.13,.14,1.0,.025)
        for dx in(-.55,0,.55):P(dx,0,.0125,.12,1.0,.025)
    for k in range(4):pal(0,0,k*.15+.0,0)
    for k in range(2):pal(1.5,.2,k*.15,.5+k*.2)
    pal(-1.5,.1,0,-.1)
    for i in range(5):m.box('wood2',(-.3+i*.05,1.35,.03+i*.025),(1.4,.14,.025),rz=.1)
def container(m):
    m.box('contr',(0,0,1.3),(6.06,2.44,2.45))
    for i in range(14):
        x=-2.8+i*.43
        for s in(-1,1):m.box('contr',(x,s*1.24,1.3),(.22,.06,2.35))
    for s in(-1,1):m.box('steel',(s*3.0,0,2.57),(.1,2.5,.14))
    for sy in(-.55,.55):m.cyl('steel',(3.03,sy,1.3),.035,2.3,seg=5)
    for sy in(-.55,.55):m.box('steel',(3.05,sy,.85),(.06,.12,.04));m.box('steel',(3.05,sy,1.75),(.06,.12,.04))
    m.box('steel',(3.04,0,1.3),(.04,.04,2.4))
    for x in(-2.9,2.9):
        for y in(-1.15,1.15):m.box('steel',(x,y,.08),(.3,.3,.14));m.box('steel',(x,y,2.55),(.3,.3,.14))
def flag(m):
    m.box('steel',(0,0,.05),(.5,.5,.1));m.cyl('steel',(0,0,3.1),.045,6.0,seg=8)
    m.beam('steel',(-.65,0,5.6),(.65,0,5.6),.025,4);m.sph('steel',(0,0,6.12),(.14,.14,.14),6)
    m.box('olive',(0,-.03,4.8),(1.2,.02,1.55));m.box('tan',(0,-.04,4.65),(1.2,.02,.3));m.box('red',(0,-.04,5.2),(.5,.02,.5),rz=.0)
def heli(m):
    m.sph('olive',(0,0,1.7),(4.8,1.9,2.0),12)
    m.sph('glass',(1.7,0,1.75),(1.7,1.6,1.4),10)
    m.beam('olive',(-1.6,0,1.9),(-8.0,0,2.4),.4,8);m.cyl('olive',(-8.0,0,2.4),.28,.5,'X',r2=.1,seg=8)
    m.box('olive',(-8.0,0,3.0),(.8,.12,1.4),rx=0);m.box('olive',(-7.2,0,2.7),(1.1,.1,.7),rz=0)
    m.box('burnt',(-8.0,.16,2.5),(.15,.04,1.8),ry=.2);m.box('steel',(-8.0,.16,3.6),(.25,.04,.8))
    m.cyl('steel',(0,0,2.9),.14,.8,seg=6);m.box('steel',(0,0,3.35),(.5,.5,.18))
    m.box('burnt',(2.2,0,3.3),(8.6,.34,.05),ry=.05)
    m.box('olive',(-0.5,0,2.8),(2.6,1.3,.6))
    for s in(-1,1):
        m.beam('steel',(1.6,s*1.2,.2),(-2.2,s*1.2,.2),.07,6)
        m.beam('steel',(.6,s*.7,.8),(.6,s*1.2,.2),.05,4);m.beam('steel',(-.9,s*.7,.8),(-.9,s*1.2,.2),.05,4)
    m.box('dark',(-.4,.97,1.6),(1.6,.04,1.1));m.box('dark',(-.4,-.97,1.6),(1.6,.04,1.1))
def supply(m):
    def crate(c,x,y,z,sx,sy,sz,rz=0):
        m.box(c,(x,y,z),(sx,sy,sz),rz=rz)
        for dx in(-.4,.4):m.box('wood2',(x+dx*sx*.9*math.cos(rz),y+dx*sx*.9*math.sin(rz),z),(.07,sy+.02,sz+.02),rz=rz)
        m.box('wood2',(x,y,z+sz/2+.005),(sx*.98,.08,.02),rz=rz)
    crate('wood',0,0,.3,1.2,.8,.6);crate('wood',.1,0,.85,1.0,.7,.5,.25);crate('olive',1.35,.1,.3,.9,.9,.6,.1)
    crate('olive',-1.3,-.1,.25,.8,.55,.5,-.15);m.cyl('steel',(1.4,-.9,.45),.3,.9,seg=10)
    m.box('canvas',(0,0,1.15),(.9,.6,.04),rz=.4)
GEN={'cmdtent':cmdtent,'messtable':messtable,'generator':generator,'mast':mast,'floodlight':floodlight,'carwreck':carwreck,'tankwreck':tankwreck,
     'fueltank':fueltank,'pallets':pallets,'container':container,'flag':flag,'heli':heli,'supply':supply}
def make(name):
    m=M();GEN[name](m);m.build(name)
