"""Convert Yubaba's FBX into a GLB with a simple arm-swing walk.

Usage:
  /Applications/Blender.app/Contents/MacOS/Blender -b --python blender/export_yubaba.py -- \
      /path/to/yubaba.fbx public/models/yubaba.glb
"""
import bpy
import math
import os
import sys
from mathutils import Quaternion

args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
source = args[0] if args else '/Users/lilu/Downloads/20261020180732_a64f8e1b.fbx'
out = args[1] if len(args) > 1 else os.path.abspath('public/models/yubaba.glb')

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=source)
scene = bpy.context.scene
scene.frame_start = 1
scene.frame_end = 25
scene.render.fps = 24
arm = next(o for o in bpy.data.objects if o.type == 'ARMATURE')
arm.animation_data_create()
arm.animation_data.action = None
action = bpy.data.actions.new('Walk')
action.use_fake_user = True
arm.animation_data.action = action
for pb in arm.pose.bones:
    pb.rotation_mode = 'QUATERNION'

def world_rot(pb, quat):
    rest = pb.bone.matrix_local.to_quaternion()
    return rest.inverted() @ quat @ rest

# Lower the T-pose arms and swing them in opposite phase.
for frame in [1, 7, 13, 19, 25]:
    scene.frame_set(frame)
    phase = math.sin((frame - 1) / 24 * math.pi * 2)
    for side, down in [('Left', math.radians(58)), ('Right', math.radians(-58))]:
        pb = arm.pose.bones.get(side + 'Arm')
        if not pb:
            continue
        sign = 1 if side == 'Left' else -1
        q = Quaternion((1, 0, 0), phase * math.radians(32) * sign) @ Quaternion((0, 1, 0), down)
        pb.rotation_quaternion = world_rot(pb, q)
        pb.keyframe_insert(data_path='rotation_quaternion', frame=frame, group=side + 'Arm')
        forearm = arm.pose.bones.get(side + 'ForeArm')
        if forearm:
            fq = Quaternion((1, 0, 0), -phase * math.radians(12) * sign)
            forearm.rotation_quaternion = world_rot(forearm, fq)
            forearm.keyframe_insert(data_path='rotation_quaternion', frame=frame, group=side + 'ForeArm')
    hips = arm.pose.bones.get('Hips')
    if hips:
        hips.location = (0, 0, abs(phase) * 0.01)
        hips.keyframe_insert(data_path='location', frame=frame, group='Hips')

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
    export_image_quality=84,
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
)
print('exported', out, os.path.getsize(out))
