import bpy, os
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath='/Users/lilu/Downloads/20261020180106_948e3bfe.fbx')
scene=bpy.context.scene; scene.frame_start=1; scene.frame_end=74; scene.render.fps=24
arm=next(o for o in bpy.data.objects if o.type=='ARMATURE')
if arm.animation_data and arm.animation_data.action:
    arm.animation_data.action.name='Walk'
    arm.animation_data.action.use_fake_user=True
for image in bpy.data.images:
    if image.size[0]>1024 or image.size[1]>1024:
        print('resize',image.name,tuple(image.size)); image.scale(1024,1024)
try: bpy.ops.file.pack_all()
except Exception as e: print('pack',e)
for o in bpy.data.objects:
    o.hide_render=False; o.hide_set(False)
out='/Users/lilu/deepseek-haeness/qianxun/public/models/chihiro_work.glb'
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', use_selection=False, export_apply=False, export_yup=True,
 export_materials='EXPORT', export_image_format='JPEG', export_image_quality=84, export_cameras=False, export_lights=False,
 export_animations=True, export_animation_mode='ACTIONS', export_merge_animation='ACTION', export_nla_strips=False,
 export_anim_slide_to_zero=True, export_anim_single_armature=True, export_frame_range=False, export_current_frame=False,
 export_optimize_animation_size=True, export_optimize_animation_keep_anim_armature=True)
print('EXPORT',out,os.path.getsize(out))
