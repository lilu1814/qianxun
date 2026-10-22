import bpy, math, os, sys
from mathutils import Quaternion

args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
source = args[0] if args else '/Users/lilu/Downloads/20261021194405_f35c79f0.fbx'
out = args[1] if len(args) > 1 else os.path.abspath('public/models/dad.glb')

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=source)
scene = bpy.context.scene
scene.render.fps = 24
arm = next(o for o in bpy.data.objects if o.type == 'ARMATURE')
arm.animation_data_create()
# The source FBX has Hips connected to root, which locks its translation and
# silently discards the lower-body offset used by the sitting animation.
bpy.context.view_layer.objects.active = arm
bpy.ops.object.mode_set(mode='EDIT')
arm.data.edit_bones['Hips'].use_connect = False
bpy.ops.object.mode_set(mode='OBJECT')
for pb in arm.pose.bones:
    pb.rotation_mode = 'QUATERNION'
    pb.rotation_quaternion = (1, 0, 0, 0)
    pb.location = (0, 0, 0)

def world_rot(pb, quat):
    rest = pb.bone.matrix_local.to_quaternion()
    return rest.inverted() @ quat @ rest

def rotate(name, axis, degrees):
    pb = arm.pose.bones.get(name)
    if not pb:
        return
    pb.rotation_quaternion = world_rot(pb, Quaternion(axis, math.radians(degrees)))

def rotate_world(name, quat):
    pb = arm.pose.bones.get(name)
    if not pb:
        return
    pb.rotation_quaternion = world_rot(pb, quat)

def reset_pose():
    for pb in arm.pose.bones:
        pb.rotation_quaternion = (1, 0, 0, 0)
        pb.location = (0, 0, 0)

def arms_down(extra_swing=0):
    # Keep the upper arms outside the wide torso silhouette.
    rotate('LeftArm', (0, 1, 0), 40)
    rotate('RightArm', (0, 1, 0), -40)
    rotate('LeftForeArm', (0, 1, 0), 8)
    rotate('RightForeArm', (0, 1, 0), -8)
    if extra_swing:
        rotate('LeftArm', (1, 0, 0), extra_swing)
        rotate('RightArm', (1, 0, 0), -extra_swing)

def key_all(frame):
    for pb in arm.pose.bones:
        pb.keyframe_insert(data_path='rotation_quaternion', frame=frame, group=pb.name)
    hips = arm.pose.bones.get('Hips')
    if hips:
        hips.keyframe_insert(data_path='location', frame=frame, group='Hips')

def new_action(name):
    action = bpy.data.actions.new(name)
    action.use_fake_user = True
    arm.animation_data.action = action
    return action

# ---- Idle -------------------------------------------------------------
reset_pose()
new_action('Idle')
for frame, phase in [(1, 0.0), (13, 1.0), (25, 0.0), (37, -1.0), (49, 0.0)]:
    scene.frame_set(frame)
    reset_pose()
    arms_down()
    rotate('Spine', (0, 1, 0), phase * 0.8)
    rotate('Head', (0, 1, 0), phase * 0.7)
    hips = arm.pose.bones['Hips']
    hips.location = (0, -0.004 - abs(phase) * 0.006, 0)
    key_all(frame)

# ---- Walk -------------------------------------------------------------
def walk_pose(phase):
    reset_pose()
    arms_down()
    swing = 27 * phase
    rotate('LeftUpLeg', (1, 0, 0), -swing)
    rotate('RightUpLeg', (1, 0, 0), swing)
    if phase >= 0:
        rotate('LeftLeg', (1, 0, 0), 9 + 10 * phase)
        rotate('RightLeg', (1, 0, 0), 30 - 8 * phase)
    else:
        rotate('LeftLeg', (1, 0, 0), 30 + 8 * phase)
        rotate('RightLeg', (1, 0, 0), 9 - 10 * phase)
    rotate('Spine', (1, 0, 0), 3)
    rotate('Spine1', (0, 1, 0), phase * 2.5)
    hips = arm.pose.bones['Hips']
    hips.location = (0, -0.012 - abs(phase) * 0.012, 0)

reset_pose()
new_action('Walk')
for frame in [1, 7, 13, 19, 25]:
    scene.frame_set(frame)
    phase = math.sin((frame - 1) / 24 * math.pi * 2)
    walk_pose(phase)
    key_all(frame)

# ---- Sit --------------------------------------------------------------
def sit_pose(breath):
    reset_pose()
    arms_down()
    # Both thighs go forward around the same world axis, then turn slightly
    # inward so the knees and feet stay together.
    qx = Quaternion((1, 0, 0), math.radians(-86))
    rotate_world('LeftUpLeg', Quaternion((0, 0, 1), math.radians(8)) @ qx)
    rotate_world('RightUpLeg', Quaternion((0, 0, 1), math.radians(-8)) @ qx)
    rotate('LeftLeg', (1, 0, 0), 86)
    rotate('RightLeg', (1, 0, 0), 86)
    rotate('LeftFoot', (1, 0, 0), -4)
    rotate('RightFoot', (1, 0, 0), -4)
    rotate('Spine', (1, 0, 0), 2.5 + breath * 0.8)
    rotate('Head', (1, 0, 0), -1.5)
    hips = arm.pose.bones['Hips']
    hips.location = (0, -39.0, 0)

reset_pose()
new_action('Sit')
for frame, breath in [(1, 0.0), (13, 1.0), (25, 0.0), (37, -1.0), (49, 0.0)]:
    scene.frame_set(frame)
    sit_pose(breath)
    key_all(frame)

# Optimize the embedded PBR textures for web delivery.
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

arm.animation_data.action = bpy.data.actions.get('Idle')
scene.frame_start = 1
scene.frame_end = 49
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
    export_image_quality=86,
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
