import bpy, math, os
from mathutils import Vector
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath='/Users/lilu/deepseek-haeness/qianxun/public/models/chihiro_compact.glb')
scene=bpy.context.scene
arm=next(o for o in scene.objects if o.type=='ARMATURE')
walk=bpy.data.actions.get('Walk')
if arm.animation_data and walk:
    arm.animation_data.action=walk
    try:
        if walk.slots: arm.animation_data.action_slot=walk.slots[0]
    except Exception: pass
scene.render.fps=24
scene.frame_start=0
scene.frame_end=25
scene.frame_set(12)

bpy.ops.mesh.primitive_plane_add(size=8, location=(0,0,-0.004))
ground=bpy.context.object; ground.name='Rear Studio Ground'
gm=bpy.data.materials.new('Rear Ground'); gm.use_nodes=True
b=gm.node_tree.nodes.get('Principled BSDF')
if b:
    b.inputs['Base Color'].default_value=(0.035,0.045,0.043,1)
    b.inputs['Roughness'].default_value=0.88
ground.data.materials.append(gm)

bpy.ops.object.camera_add(location=(0.016,2.75,0.70))
cam=bpy.context.object; cam.name='Rear Walk Camera'; cam.data.lens=66
target=Vector((0.016,0.0,0.62))
cam.rotation_euler=(target-Vector(cam.location)).to_track_quat('-Z','Y').to_euler()
scene.camera=cam

def area(name,loc,energy,size,color):
    d=bpy.data.lights.new(name,'AREA'); d.energy=energy; d.shape='DISK'; d.size=size; d.color=color
    ob=bpy.data.objects.new(name,d); scene.collection.objects.link(ob); ob.location=loc
    ob.rotation_euler=(Vector((0,0,0.62))-Vector(loc)).to_track_quat('-Z','Y').to_euler()
    return ob
area('Rear Key',(2.4,2.8,3.0),300,2.4,(1.0,0.88,0.74))
area('Rear Fill',(-2.6,1.8,1.9),110,3.0,(0.62,0.8,0.82))
area('Rear Rim',(-0.2,-1.8,2.5),180,2.0,(0.78,0.9,0.86))

world=bpy.data.worlds.new('Rear World'); scene.world=world; world.use_nodes=True
bg=world.node_tree.nodes.get('Background')
if bg:
    bg.inputs['Color'].default_value=(0.009,0.013,0.013,1)
    bg.inputs['Strength'].default_value=0.45

# Match the game: no self-shadow on the character (prevents black cloth edges).
for nm in ['Mesh_0','ShirtLining']:
    ob=bpy.data.objects.get(nm)
    if ob:
        try: ob.visible_shadow=False
        except Exception: pass
scene.render.engine='BLENDER_EEVEE'
scene.render.resolution_x=720
scene.render.resolution_y=900
scene.render.resolution_percentage=100
scene.render.film_transparent=False
scene.view_settings.look='AgX - Medium High Contrast'
scene.eevee.taa_render_samples=32

note=bpy.data.texts.new('Rear Walk Notes')
note.write('Chihiro — Walk seen from directly behind.\n\n')
note.write('Camera: Rear Walk Camera (Numpad 0).\n')
note.write('Action: Walk, frames 0–25 at 24 fps.\n')
note.write('The model faces -Y; this camera sits at +Y behind her.\n')
out='/Users/lilu/deepseek-haeness/qianxun/blender/chihiro_walk_rear.blend'
bpy.ops.wm.save_as_mainfile(filepath=out)

scene.frame_set(12)
scene.render.image_settings.file_format='PNG'
scene.render.filepath='/Users/lilu/deepseek-haeness/qianxun/blender/chihiro_walk_rear_poster.png'
bpy.ops.render.render(write_still=True)

os.makedirs('/tmp/rear_walk',exist_ok=True)
scene.render.filepath='/tmp/rear_walk/rear_'
bpy.ops.render.render(animation=True)
print('SAVED',out)
