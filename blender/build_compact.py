import bpy, math, time, os, bmesh
import numpy as np
from mathutils import Vector
start=time.time()
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath='/Users/lilu/deepseek-haeness/qianxun/blender/source/chihiro_original.glb')
mesh=next(o for o in bpy.context.scene.objects if o.type=='MESH')
bpy.context.view_layer.objects.active=mesh; mesh.select_set(True)
bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
print('original faces',len(mesh.data.polygons),'verts',len(mesh.data.vertices),flush=True)
# Reduce the million-triangle scan to a game-ready mesh. 20% still preserves
# the face and hair fully at the camera distances used by the game.
mod=mesh.modifiers.new('GameDecimate','DECIMATE')
mod.decimate_type='COLLAPSE'
mod.ratio=0.20
mod.use_collapse_triangulate=True
bpy.ops.object.modifier_apply(modifier=mod.name)
print('decimated faces',len(mesh.data.polygons),'verts',len(mesh.data.vertices),flush=True)
mesh.select_set(False)

# ---------------- armature ----------------
arm_data=bpy.data.armatures.new('ChihiroArmature')
arm=bpy.data.objects.new('ChihiroArmature',arm_data)
bpy.context.scene.collection.objects.link(arm)
bpy.context.view_layer.objects.active=arm; arm.select_set(True)
bpy.ops.object.mode_set(mode='EDIT')
B={}
def add(name,h,t,parent=None,connect=False,roll=True):
    b=arm_data.edit_bones.new(name); b.head=Vector(h); b.tail=Vector(t)
    if parent:
        b.parent=arm_data.edit_bones.get(parent); b.use_connect=connect
        if roll: b.align_roll(Vector((0,1,0)))
    B[name]=b
add('root',(0.016,0,0.0),(0.016,0,0.18))
add('hips',(0.016,0,0.53),(0.016,0,0.63),'root')
add('spine',(0.016,0,0.63),(0.016,0,0.76),'hips',True)
add('chest',(0.016,0,0.76),(0.016,0,0.88),'spine',True)
add('neck',(0.016,0,0.88),(0.016,0,0.945),'chest',True)
add('head',(0.016,0,0.945),(0.016,0.0,1.145),'neck',True)
add('upper_arm.L',(0.105,0,0.855),(0.185,0,0.655),'chest',False,True)
add('forearm.L',(0.185,0,0.655),(0.228,-0.005,0.49),'upper_arm.L',True,True)
add('hand.L',(0.228,-0.005,0.49),(0.238,-0.012,0.41),'forearm.L',True,True)
add('upper_arm.R',(-0.07,0,0.855),(-0.155,0,0.655),'chest',False,True)
add('forearm.R',(-0.155,0,0.655),(-0.20,-0.005,0.49),'upper_arm.R',True,True)
add('hand.R',(-0.20,-0.005,0.49),(-0.212,-0.012,0.41),'forearm.R',True,True)
add('thigh.L',(0.071,-0.005,0.55),(0.066,-0.030,0.31),'hips',False,True)
add('shin.L',(0.066,-0.030,0.31),(0.071,-0.012,0.09),'thigh.L',True,True)
add('foot.L',(0.071,-0.012,0.09),(0.071,-0.135,0.035),'shin.L',True,False)
add('thigh.R',(-0.031,-0.005,0.55),(-0.031,-0.030,0.31),'hips',False,True)
add('shin.R',(-0.031,-0.030,0.31),(-0.030,-0.012,0.09),'thigh.R',True,True)
add('foot.R',(-0.030,-0.012,0.09),(-0.030,-0.135,0.035),'shin.R',True,False)
bpy.ops.object.mode_set(mode='OBJECT')
print('armature',time.time()-start,flush=True)

def sstep(a,b,x):
    t=np.clip((x-a)/(b-a),0,1); return t*t*(3-2*t)
def seg_dist(x,y,z,a,b):
    ax,ay,az=a; bx,by,bz=b
    dx,dy,dz=bx-ax,by-ay,bz-az
    l2=dx*dx+dy*dy+dz*dz
    t=np.clip(((x-ax)*dx+(y-ay)*dy+(z-az)*dz)/l2,0,1)
    return np.sqrt((x-(ax+t*dx))**2+(y-(ay+t*dy))**2+(z-(az+t*dz))**2)

n=len(mesh.data.vertices)
co=np.empty(n*3,dtype=np.float64); mesh.data.vertices.foreach_get('co',co); co=co.reshape(-1,3)
x,y,z=co[:,0],co[:,1],co[:,2]
cx=0.016; absx=np.abs(x-cx); sideL=x>=cx
names=[b.name for b in arm_data.bones if b.name!='root']
wx={name:np.zeros(n,dtype=np.float64) for name in names}

# torso vertical chain
w_hips_t=1-sstep(0.60,0.68,z)
w_spine=sstep(0.60,0.68,z)*(1-sstep(0.75,0.82,z))
w_chest=sstep(0.75,0.82,z)*(1-sstep(0.87,0.93,z))
w_neck=sstep(0.87,0.93,z)*(1-sstep(0.94,0.99,z))
w_head=sstep(0.94,0.99,z)
hair=(z>0.78)&(y>0.075)&(absx<0.20)
hair_w=sstep(0.78,0.88,z)*0.95
w_head=np.maximum(w_head,hair_w)
w_chest*=1-hair_w; w_neck*=1-hair_w
torso=np.maximum(w_hips_t+w_spine+w_chest+w_neck+w_head,1e-8)

# legs
side_center=np.where(sideL,0.071,-0.031)
distleg=np.abs(x-side_center)
legness=sstep(0.60,0.52,z)
legness*=1-sstep(0.12,0.20,distleg)
legness*=1-sstep(0.16,0.21,absx)
shin_factor=sstep(0.37,0.27,z)
foot_factor=sstep(0.17,0.09,z)
legw_thigh=1-shin_factor
legw_shin=shin_factor*(1-foot_factor)
legw_foot=foot_factor
for side,cond in [('L',sideL),('R',~sideL)]:
    wx[f'thigh.{side}']+=np.where(cond,legness*legw_thigh,0)
    wx[f'shin.{side}']+=np.where(cond,legness*legw_shin,0)
    wx[f'foot.{side}']+=np.where(cond,legness*legw_foot,0)
remaining=1-legness
wx['hips']+=w_hips_t*remaining
wx['spine']+=w_spine*remaining
wx['chest']+=w_chest*remaining
wx['neck']+=w_neck*remaining
wx['head']+=w_head*remaining

# arms
a0=np.where(z<0.56,0.13,0.10)
a1=a0+0.065
arm_x=sstep(a0,a1,absx)
arm_z=sstep(0.38,0.455,z)*(1-sstep(0.89,0.95,z))
armness=arm_x*arm_z
for side,cond in [('L',sideL),('R',~sideL)]:
    if side=='L':
        sh=(0.105,0,0.855); el=(0.185,0,0.655); wr=(0.228,-0.005,0.49); hd=(0.238,-0.012,0.41)
    else:
        sh=(-0.07,0,0.855); el=(-0.155,0,0.655); wr=(-0.20,-0.005,0.49); hd=(-0.212,-0.012,0.41)
    d1=seg_dist(x,y,z,sh,el); d2=seg_dist(x,y,z,el,wr); d3=seg_dist(x,y,z,wr,hd)
    dm=np.minimum(np.minimum(d1,d2),d3)
    w1=np.exp(-((d1-dm)/0.045)**2); w2=np.exp(-((d2-dm)/0.045)**2); w3=np.exp(-((d3-dm)/0.045)**2)
    ws=w1+w2+w3; w1,w2,w3=w1/ws,w2/ws,w3/ws
    wx[f'upper_arm.{side}']+=np.where(cond,armness*w1,0)
    wx[f'forearm.{side}']+=np.where(cond,armness*w2,0)
    wx[f'hand.{side}']+=np.where(cond,armness*w3,0)
for name in ['hips','spine','chest','neck','head']:
    wx[name]*=1-armness
for name in list(wx.keys()):
    if name.startswith(('thigh.','shin.','foot.')):
        wx[name]*=1-armness*0.7

# classify t-shirt components from the base-colour texture so the hem never follows a thigh
loops=len(mesh.data.loops)
lv=np.empty(loops,dtype=np.int32); mesh.data.loops.foreach_get('vertex_index',lv)
uv=np.empty(loops*2,dtype=np.float32); mesh.data.uv_layers.active.data.foreach_get('uv',uv); uv=uv.reshape(-1,2)
uvv=np.zeros((n,2),dtype=np.float32); uvv[lv]=uv
base_img=bpy.data.images['texture_pbr_20250901']
sample_img=base_img.copy(); sample_img.scale(512,512)
pix=np.empty(512*512*4,dtype=np.float32); sample_img.pixels.foreach_get(pix); pix=pix.reshape(512,512,4)
uu=np.mod(uvv[:,0],1.0); vv=np.mod(uvv[:,1],1.0)
ix=np.clip((uu*511).astype(np.int32),0,511); iy=np.clip((vv*511).astype(np.int32),0,511)
rgb=pix[iy,ix,:3]
mx=rgb.max(1); mn=rgb.min(1); sat=(mx-mn)/np.maximum(mx,1e-6)
white=(sat<0.21)&(mx>0.46)
green=(rgb[:,1]>rgb[:,0]*1.08)&(rgb[:,1]>rgb[:,2]*1.22)&(sat>0.18)
shirt_vertex=white|green
bpy.data.images.remove(sample_img)

edges=np.empty(len(mesh.data.edges)*2,dtype=np.int32); mesh.data.edges.foreach_get('vertices',edges); edges=edges.reshape(-1,2)
parent=np.arange(n,dtype=np.int32)
def find(a):
    while parent[a]!=a:
        parent[a]=parent[parent[a]]; a=parent[a]
    return a
for a,b in edges:
    ra=find(int(a)); rb=find(int(b))
    if ra!=rb: parent[rb]=ra
roots=np.array([find(i) for i in range(n)],dtype=np.int32)
_,inv=np.unique(roots,return_inverse=True); k=int(inv.max())+1
counts=np.bincount(inv,minlength=k).astype(np.float64)
shirt_count=np.bincount(inv,weights=shirt_vertex.astype(np.float64),minlength=k)
shirt_comp=(shirt_count/np.maximum(counts,1))>0.28
shirtness=(shirt_comp[inv]|(green&(z>0.42)))&(z>0.42)
# Loose white cloth at the side hem can be a stray patch; include it so it
# cannot stay on the arm/thigh while the rest of the shirt is rigid.
side_hem=(z>0.42)&(z<0.62)&(absx<0.19)&((sat<0.28)&(mx>0.32))
shirtness=shirtness|side_hem
legness*=1-shirtness*0.98
# re-apply the leg part weights with the shirt mask applied
for name in list(wx.keys()):
    if name.startswith(('thigh.','shin.','foot.')):
        wx[name]*=0
# recompute leg weights (legness has been adjusted)
for side,cond in [('L',sideL),('R',~sideL)]:
    wx[f'thigh.{side}']+=np.where(cond,legness*legw_thigh,0)
    wx[f'shin.{side}']+=np.where(cond,legness*legw_shin,0)
    wx[f'foot.{side}']+=np.where(cond,legness*legw_foot,0)
# torso absorbers
wx['hips']+=w_hips_t*(1-legness)-w_hips_t*remaining*0
# NOTE: torso weights were already added with 'remaining' = 1-legness before mask.
# Normalisation makes the result valid: reduce torso by the extra leg weight.
# (the total may exceed 1; normalised below)
print('masked shirt',int(shirtness.sum()),flush=True)

# normalise and smooth along edges
W=np.stack([wx[k] for k in names],axis=1); W=np.maximum(W,0)
W=np.divide(W,np.maximum(W.sum(1,keepdims=True),1e-9))
e0,e1=edges[:,0],edges[:,1]
deg=np.bincount(e0,minlength=n)+np.bincount(e1,minlength=n)
for _ in range(3):
    Wn=W.copy()
    for j in range(W.shape[1]):
        acc=np.zeros(n,dtype=np.float64)
        np.add.at(acc,e0,W[e1,j])
        np.add.at(acc,e1,W[e0,j])
        Wn[:,j]=W[:,j]*0.55+(acc/np.maximum(deg,1))*0.45
    W=Wn
W=np.maximum(W,0); W=np.divide(W,np.maximum(W.sum(1,keepdims=True),1e-9))
# Lock the loose t-shirt hem to the torso. The hem is close to the hands in
# rest pose, and without this it can be grabbed by the arm/leg weights and flip
# upward while walking.
# Lock only the cloth hem itself to the hips. Keep the hands fully on their
# arm chain, otherwise the wrists look pinned while the arms swing.
hem_lock=shirtness&(z<0.64)
arm_names=[n for n in names if n.startswith(('upper_arm.','forearm.','hand.'))]
leg_names=[n for n in names if n.startswith(('thigh.','shin.','foot.'))]
for j,name in enumerate(names):
    if name in arm_names or name in leg_names:
        W[hem_lock,j]=0
missing=1-W[hem_lock].sum(1)
W[hem_lock,names.index('hips')]+=np.maximum(missing,0)
W[hem_lock]=np.divide(W[hem_lock],np.maximum(W[hem_lock].sum(1,keepdims=True),1e-9))
# One garment, one transform. The scan shirt is made from many separate surface
# patches; if neighbouring patches follow different bones, walking opens a gap
# at the lower back. Give every shirt vertex the same torso blend so the shirt
# stays rigid and cannot split.
if shirtness.any():
    W[shirtness]=0
    W[shirtness,names.index('hips')]=1.0
# Tuck the upper thighs and shorts a few millimetres inward under the shirt.
# The taper keeps the visible lower thigh and waist unchanged.
tighten=(z>0.40)&(z<0.60)&(absx<0.18)&(~shirtness)
if tighten.any():
    tt=np.clip((z[tighten]-0.40)/0.06,0,1)*np.clip((0.60-z[tighten])/0.04,0,1)
    tt=tt*tt*(3-2*tt)
    for vi,tv in zip(np.where(tighten)[0],tt):
        vv=mesh.data.vertices[int(vi)]
        fac=1.0-0.065*float(tv)
        vv.co.x=0.016+(vv.co.x-0.016)*fac
        vv.co.y=-0.010+(vv.co.y+0.010)*fac
print('hip tucked verts',int(tighten.sum()),flush=True)
# Tuck the small loose white flap at the left side hem inward so it doesn't
# stick out past the silhouette.
flap=(x>0.11)&(x<0.205)&(z>0.42)&(z<0.56)&(sat<0.30)
if flap.any():
    for vi in np.where(flap)[0]:
        vv=mesh.data.vertices[int(vi)]
        taper=min(1.0,max(0.0,(vv.co.z-0.42)/0.03))*min(1.0,max(0.0,(0.56-vv.co.z)/0.03))
        vv.co.x-=0.013*taper
print('side flap tucked',int(flap.sum()),flush=True)
# The shorts are a hip garment, not trousers. If they inherit thigh rotation
# they swing back through the shirt during the walk. Keep them on the pelvis.
shorts=(z>0.38)&(z<0.58)&(sat>0.42)&(rgb[:,0]>rgb[:,1]*1.35)&(rgb[:,0]>rgb[:,2]*1.25)
# shorts stay untouched; the lower-back shirt mask below is the fix
print('uniform shirt verts',int(shirtness.sum()),'shorts',int(shorts.sum()),flush=True)
if W.shape[1]>4:
    part=np.partition(W,-4,axis=1); thresh=part[:,-4][:,None]; W=np.where(W>=thresh,W,0)
W=np.divide(W,np.maximum(W.sum(1,keepdims=True),1e-9))
Q=np.rint(W*100).astype(np.int16)
for name in names: mesh.vertex_groups.new(name=name)
for j,name in enumerate(names):
    vg=mesh.vertex_groups[name]; col=Q[:,j]
    for q in range(1,101):
        idx=np.where(col==q)[0]
        if idx.size: vg.add(idx.tolist(),q/100.0,'REPLACE')
mesh.parent=arm; mesh.matrix_parent_inverse=arm.matrix_world.inverted()
mod=mesh.modifiers.new('Armature','ARMATURE'); mod.object=arm
print('weights assigned',time.time()-start,flush=True)

# Inner lining for the lower shirt. The scan is a single-sided shell; from a
# low back/side camera you can see its unlit inside as a black edge. This copy
# of the lower cloth sits a few millimetres inside the outer shirt and gives
# the open hem a lit cream fabric surface.
lining=mesh.copy(); lining.data=mesh.data.copy(); lining.name='ShirtLining'
bpy.context.scene.collection.objects.link(lining)
bm=bmesh.new(); bm.from_mesh(lining.data); bm.faces.ensure_lookup_table()
keep=set()
for f in bm.faces:
    ids=[v.index for v in f.verts]
    if all(bool(shirtness[i]) for i in ids):
        c=f.calc_center_median()
        if 0.42<c.z<0.64:
            keep.add(f)
drop=[f for f in bm.faces if f not in keep]
bmesh.ops.delete(bm,geom=drop,context='FACES')
loose=[v for v in bm.verts if not v.link_faces]
if loose:
    bmesh.ops.delete(bm,geom=loose,context='VERTS')
bm.normal_update()
for v in bm.verts:
    v.co-=v.normal*0.0035
bm.to_mesh(lining.data); bm.free(); lining.data.update()
for vg in list(lining.vertex_groups):
    lining.vertex_groups.remove(vg)
hvg=lining.vertex_groups.new(name='hips')
hvg.add(list(range(len(lining.data.vertices))),1.0,'REPLACE')
lmat=bpy.data.materials.new('Shirt Lining'); lmat.use_nodes=True; lmat.use_backface_culling=False
lb=lmat.node_tree.nodes.get('Principled BSDF')
if lb:
    lb.inputs['Base Color'].default_value=(0.58,0.56,0.50,1)
    lb.inputs['Roughness'].default_value=0.94
    try:
        lb.inputs['Emission Color'].default_value=(0.20,0.19,0.16,1)
        lb.inputs['Emission Strength'].default_value=0.35
    except Exception:
        pass
lining.data.materials.clear(); lining.data.materials.append(lmat)
print('lining faces',len(lining.data.polygons),flush=True)

# ---------------- animations ----------------
arm.animation_data_create()
for pb in arm.pose.bones:
    pb.rotation_mode='XYZ'
BONES=[b.name for b in arm.pose.bones if b.name!='root']

def reset_pose():
    for pb in arm.pose.bones:
        pb.location=(0,0,0); pb.rotation_euler=(0,0,0); pb.scale=(1,1,1)

def make_action(name, frames, key_data):
    # key_data: dict frame -> dict bone -> (rot_x_deg, rot_y_deg, rot_z_deg, loc_x, loc_y, loc_z)
    act=bpy.data.actions.new(name)
    act.use_fake_user=True
    arm.animation_data.action=act
    for f in frames:
        reset_pose()
        for bone,vals in key_data.get(f,{}).items():
            pb=arm.pose.bones[bone]
            rx,ry,rz,lx,ly,lz=vals
            pb.rotation_euler=(math.radians(rx),math.radians(ry),math.radians(rz))
            pb.location=(lx,ly,lz)
        for bone in BONES:
            pb=arm.pose.bones[bone]
            pb.keyframe_insert(data_path='rotation_euler',frame=f)
            pb.keyframe_insert(data_path='location',frame=f)
    return act

idle_frames=[1,31,61]
idle_keys={
 1:{'hips':(0,0,0,0,0,0),'chest':(0,0,0,0,0,0),'head':(0,0,0,0,0,0)},
 31:{'hips':(0,0,0,0,0.0032,0),'chest':(1.0,0,0,0,0,0),'head':(-0.7,0,0,0,0,0),
     'upper_arm.L':(0.8,0,0,0,0,0),'upper_arm.R':(-0.8,0,0,0,0,0)},
 61:{'hips':(0,0,0,0,0,0),'chest':(0,0,0,0,0,0),'head':(0,0,0,0,0,0)},
}

def leg_key(thL,shL,ftL,thR,shR,ftR):
    return {
      'thigh.L':(thL,0,0,0,0,0),'shin.L':(shL,0,0,0,0,0),'foot.L':(ftL,0,0,0,0,0),
      'thigh.R':(thR,0,0,0,0,0),'shin.R':(shR,0,0,0,0,0),'foot.R':(ftR,0,0,0,0,0),
    }
walk_frames=[1,9,17,25,33]
walk_keys={}
lk=leg_key(-14,5,3, 11,11,-3)
walk_keys[1]={**lk,'hips':(0,0,0,0,0.0015,0),'spine':(0.4,0,0,0,0,0),'chest':(0.5,0,0,0,0,0),
 'upper_arm.L':(8,0,0,0,0,0),'upper_arm.R':(-8,0,0,0,0,0),
 'forearm.L':(4,0,0,0,0,0),'forearm.R':(4,0,0,0,0,0)}
lk=leg_key(-3,2,1, 1,30,-1)
walk_keys[9]={**lk,'hips':(0,0,0,0,0.005,0),'spine':(0.3,0,0,0,0,0),'chest':(0.4,0,0,0,0,0),
 'upper_arm.L':(0,0,0,0,0,0),'upper_arm.R':(0,0,0,0,0,0),
 'forearm.L':(4,0,0,0,0,0),'forearm.R':(4,0,0,0,0,0)}
lk=leg_key(11,11,-3, -14,5,3)
walk_keys[17]={**lk,'hips':(0,0,0,0,0.0015,0),'spine':(0.4,0,0,0,0,0),'chest':(0.5,0,0,0,0,0),
 'upper_arm.L':(-8,0,0,0,0,0),'upper_arm.R':(8,0,0,0,0,0),
 'forearm.L':(4,0,0,0,0,0),'forearm.R':(4,0,0,0,0,0)}
lk=leg_key(1,30,-1, -3,2,1)
walk_keys[25]={**lk,'hips':(0,0,0,0,0.005,0),'spine':(0.3,0,0,0,0,0),'chest':(0.4,0,0,0,0,0),
 'upper_arm.L':(0,0,0,0,0,0),'upper_arm.R':(0,0,0,0,0,0),
 'forearm.L':(4,0,0,0,0,0),'forearm.R':(4,0,0,0,0,0)}
lk=leg_key(-14,5,3, 11,11,-3)
walk_keys[33]={**lk,'hips':(0,0,0,0,0.0015,0),'spine':(0.4,0,0,0,0,0),'chest':(0.5,0,0,0,0,0),
 'upper_arm.L':(8,0,0,0,0,0),'upper_arm.R':(-8,0,0,0,0,0),
 'forearm.L':(4,0,0,0,0,0),'forearm.R':(4,0,0,0,0,0)}

idle=make_action('Idle',idle_frames,idle_keys)
walk=make_action('Walk',walk_frames,walk_keys)
# leave Walk as active for preview/export
arm.animation_data.action=walk
if walk.slots:
    arm.animation_data.action_slot=walk.slots[0]
bpy.context.scene.render.fps=30
bpy.context.scene.frame_start=1
bpy.context.scene.frame_end=61
bpy.context.scene.frame_set(1)
bpy.context.view_layer.update()
print('actions', [a.name for a in bpy.data.actions], 'slots', [(a.name,len(a.slots)) for a in bpy.data.actions], flush=True)

# quick preview of the walk mid-pose
scene=bpy.context.scene
scene.render.engine='BLENDER_WORKBENCH'; scene.display.shading.light='STUDIO'; scene.display.shading.color_type='TEXTURE'; scene.display.shading.show_shadows=True
scene.render.resolution_x=500; scene.render.resolution_y=700
scene.world=bpy.data.worlds.new('World'); scene.world.color=(0.08,0.1,0.1)
cam_data=bpy.data.cameras.new('Cam'); cam=bpy.data.objects.new('Cam',cam_data); scene.collection.objects.link(cam); scene.camera=cam
cam_data.type='ORTHO'; cam_data.ortho_scale=1.55
scene.frame_set(9)
for name,loc,rot,scale,lookz in [
    ('front',(0,-3,0.62),(math.pi/2,0,0),1.55,0.62),
    ('side',(3,0,0.62),(math.pi/2,0,math.pi/2),1.55,0.62),
    ('hem_back',(0,3,0.55),(math.pi/2,0,math.pi),0.85,0.55),
    ('hem_side',(3,0,0.55),(math.pi/2,0,math.pi/2),0.85,0.55),
]:
    cam_data.ortho_scale=scale
    cam.location=loc; cam.rotation_euler=rot
    scene.render.filepath=f'/tmp/{name}.png'; bpy.ops.render.render(write_still=True)
# remove render objects before export
bpy.data.objects.remove(cam,do_unlink=True)

# downscale the PBR textures for a much smaller GLB
tex_sizes={
 'texture_pbr_20250901':1024,
 'texture_pbr_20250901_normal':512,
 'texture_pbr_20250901_metallic-texture_pbr_20250901_roughness':256,
}
for img_name,size in tex_sizes.items():
    img=bpy.data.images.get(img_name)
    if img:
        before=tuple(img.size)
        img.scale(size,size)
        print('texture',img_name,before,'->',tuple(img.size),flush=True)

# selection only armature + mesh
bpy.ops.object.select_all(action='DESELECT')
arm.select_set(True); mesh.select_set(True); lining.select_set(True)
bpy.context.view_layer.objects.active=arm
out='/Users/lilu/deepseek-haeness/qianxun/public/models/chihiro_compact.glb'
bpy.ops.export_scene.gltf(
    filepath=out,
    export_format='GLB',
    use_selection=True,
    export_apply=False,
    export_animations=True,
    export_animation_mode='ACTIONS',
    export_anim_single_armature=True,
    export_yup=True,
    export_texcoords=True,
    export_normals=True,
    export_materials='EXPORT',
    export_image_format='AUTO',
    export_optimize_animation_size=True,
    export_anim_slide_to_zero=True,
    export_cameras=False,
    export_lights=False,
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=6,
    export_draco_position_quantization=14,
    export_draco_normal_quantization=10,
    export_draco_texcoord_quantization=12,
    export_draco_generic_quantization=12,
)
print('exported',out,os.path.getsize(out),time.time()-start,flush=True)
