"""Convert Lin's FBX to GLB, preserving her Walk clip.

Usage:
  /Applications/Blender.app/Contents/MacOS/Blender -b --python blender/export_lin.py -- \
      /path/lin.fbx public/models/lin.glb
"""
import bpy
import os
import sys

args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
source = args[0] if args else '/Users/lilu/Downloads/20261021143342_af2c4137.fbx'
out = args[1] if len(args) > 1 else os.path.abspath('public/models/lin.glb')

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=source)
scene = bpy.context.scene
scene.frame_start = 1
scene.frame_end = 74
scene.render.fps = 24
armature = next(o for o in bpy.data.objects if o.type == 'ARMATURE')
if armature.animation_data and armature.animation_data.action:
    armature.animation_data.action.name = 'Walk'
    armature.animation_data.action.use_fake_user = True
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
