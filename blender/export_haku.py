"""Convert the supplied Haku FBX into the runtime GLB.

The source has one 121-frame turn/step performance. This script:
- keeps it as `HakuTurn`
- creates `HakuWalk` by adding an armature counter-rotation so the body keeps
  facing forward while the legs step
- downsizes textures to 1024 and exports a compact GLB

Usage (from the project root):
  /Applications/Blender.app/Contents/MacOS/Blender -b --python blender/export_haku.py -- \
      /path/to/haku.fbx public/models/haku.glb
"""
import bpy
import math
import os
import sys
from mathutils import Vector

args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
source = args[0] if args else '/Users/lilu/Downloads/20261020164444_6a3bf251.fbx'
out = args[1] if len(args) > 1 else os.path.abspath('public/models/haku.glb')

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=source)
scene = bpy.context.scene
scene.frame_start = 1
scene.frame_end = 121
scene.render.fps = 24
arm = next(o for o in bpy.data.objects if o.type == 'ARMATURE')
arm.rotation_mode = 'XYZ'
turn = arm.animation_data.action
turn.name = 'HakuTurn'
turn.use_fake_user = True

# Sample the body heading without object rotation.
arm.rotation_euler = (0, 0, 0)
yaw = {}
for frame in range(1, 122):
    scene.frame_set(frame)
    bpy.context.view_layer.update()
    matrix = arm.matrix_world @ arm.pose.bones['Hips'].matrix
    forward = matrix.to_3x3() @ Vector((0, -1, 0))
    yaw[frame] = math.atan2(forward.x, -forward.y)

# Walk = same leg motion with an object-level yaw cancellation.
walk = turn.copy()
walk.name = 'HakuWalk'
walk.use_fake_user = True
arm.animation_data.action = walk
bag = walk.layers[0].strips[0].channelbag(walk.slots[0])
existing = bag.fcurves.find('rotation_euler', index=2)
if existing:
    bag.fcurves.remove(existing)
curve = bag.fcurves.new('rotation_euler', index=2)
for frame in range(1, 122):
    key = curve.keyframe_points.insert(frame, -(yaw[frame] - yaw[1]), options={'FAST'})
    key.interpolation = 'LINEAR'
curve.update()

for image in bpy.data.images:
    if image.size[0] > 1024 or image.size[1] > 1024:
        image.scale(1024, 1024)
try:
    bpy.ops.file.pack_all()
except Exception as exc:
    print('pack warning:', exc)
for obj in bpy.data.objects:
    obj.hide_render = False
    obj.hide_set(False)

arm.animation_data.action = turn
arm.rotation_euler = (0, 0, 0)
scene.frame_set(1)
os.makedirs(os.path.dirname(out), exist_ok=True)
bpy.ops.export_scene.gltf(
    filepath=out,
    export_format='GLB',
    use_selection=False,
    export_apply=False,
    export_yup=True,
    export_materials='EXPORT',
    export_image_format='JPEG',
    export_image_quality=82,
    export_cameras=False,
    export_lights=False,
    export_animations=True,
    export_animation_mode='ACTIONS',
    export_merge_animation='ACTION',
    export_nla_strips=False,
    export_anim_slide_to_zero=True,
    export_anim_single_armature=True,
    export_frame_range=False,
    export_current_frame=False,
    export_optimize_animation_size=True,
    export_optimize_animation_keep_anim_armature=True,
    export_morph_animation=True,
)
print('exported', out, os.path.getsize(out), 'actions', [a.name for a in bpy.data.actions])
