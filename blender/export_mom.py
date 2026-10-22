import bpy, math, os, sys
from mathutils import Vector, Quaternion

args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
source = args[0] if args else '/Users/lilu/Downloads/20261021195004_85a30a65.glb'
out = args[1] if len(args) > 1 else os.path.abspath('public/models/mom.glb')

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=source)
mesh = next(o for o in bpy.data.objects if o.type == 'MESH')

# The GLB is authored Y-up and arrives lying along Blender's Y axis. Stand it up,
# put the feet on the ground and centre the origin.
mesh.rotation_euler[0] = math.radians(90)
bpy.context.view_layer.update()
bpy.context.view_layer.objects.active = mesh
mesh.select_set(True)
bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
bb = [mesh.matrix_world @ Vector(c) for c in mesh.bound_box]
mn = Vector((min(v.x for v in bb), min(v.y for v in bb), min(v.z for v in bb)))
mx = Vector((max(v.x for v in bb), max(v.y for v in bb), max(v.z for v in bb)))
mesh.location.x -= (mn.x + mx.x) / 2
mesh.location.y -= (mn.y + mx.y) / 2
mesh.location.z -= mn.z
bpy.ops.object.transform_apply(location=True, rotation=False, scale=False)

# Humanoid armature proportioned to the 1.0-unit-tall stylised mother.
adata = bpy.data.armatures.new('MomArmature')
arm = bpy.data.objects.new('Armature', adata)
bpy.context.collection.objects.link(arm)
bpy.context.view_layer.objects.active = arm
arm.select_set(True)
bpy.ops.object.mode_set(mode='EDIT')
def add_bone(name, head, tail, parent=None, deform=True):
    b = adata.edit_bones.new(name)
    b.head = head
    b.tail = tail
    b.use_deform = deform
    if parent:
        b.parent = adata.edit_bones[parent]
    return b
add_bone('root', (0, 0, 0), (0, 0, 0.08), None, False)
add_bone('Hips', (0, 0, 0.50), (0, 0, 0.58), 'root')
add_bone('Spine', (0, 0, 0.58), (0, 0, 0.68), 'Hips')
add_bone('Spine1', (0, 0, 0.68), (0, 0, 0.76), 'Spine')
add_bone('Neck', (0, 0, 0.77), (0, 0, 0.84), 'Spine1')
add_bone('Head', (0, 0, 0.84), (0, 0, 0.98), 'Neck')
for side, sign in [('Left', 1), ('Right', -1)]:
    add_bone(side + 'Shoulder', (0, 0, 0.76), (sign * 0.105, 0, 0.75), 'Spine1', False)
    add_bone(side + 'Arm', (sign * 0.105, 0, 0.75), (sign * 0.205, 0, 0.65), side + 'Shoulder')
    add_bone(side + 'ForeArm', (sign * 0.205, 0, 0.65), (sign * 0.30, 0, 0.55), side + 'Arm')
    add_bone(side + 'Hand', (sign * 0.30, 0, 0.55), (sign * 0.36, 0, 0.49), side + 'ForeArm')
    add_bone(side + 'UpLeg', (sign * 0.07, 0, 0.50), (sign * 0.07, 0, 0.28), 'Hips')
    add_bone(side + 'Leg', (sign * 0.07, 0, 0.28), (sign * 0.07, 0, 0.06), side + 'UpLeg')
    add_bone(side + 'Foot', (sign * 0.07, 0, 0.06), (sign * 0.07, -0.12, 0.03), side + 'Leg')
bpy.ops.object.mode_set(mode='OBJECT')

# Distance-to-bone-segment weights. Auto weights failed on the layered mesh.
for vg in list(mesh.vertex_groups):
    mesh.vertex_groups.remove(vg)
groups = {}
segments = []
for bone in adata.bones:
    if not bone.use_deform:
        continue
    groups[bone.name] = mesh.vertex_groups.new(name=bone.name)
    segments.append((bone.name, bone.head_local.copy(), bone.tail_local.copy()))

def segment_distance(point, a, b):
    ab = b - a
    denom = ab.length_squared
    t = 0.0 if denom < 1e-9 else max(0.0, min(1.0, (point - a).dot(ab) / denom))
    return (point - (a + ab * t)).length

for vertex in mesh.data.vertices:
    p = vertex.co
    distances = sorted((segment_distance(p, a, b), n) for n, a, b in segments)[:3]
    near = [(d, n) for d, n in distances if d <= distances[0][0] * 1.65 + 0.012]
    weights = [(n, 1.0 / ((d + 0.012) ** 2.2)) for d, n in near]
    total = sum(w for _, w in weights)
    for name, weight in weights:
        groups[name].add([vertex.index], weight / total, 'REPLACE')
modifier = mesh.modifiers.new('Armature', 'ARMATURE')
modifier.object = arm
mesh.parent = arm

for pb in arm.pose.bones:
    pb.rotation_mode = 'QUATERNION'

def world_rot(pb, quat):
    rest = pb.bone.matrix_local.to_quaternion()
    return rest.inverted() @ quat @ rest

def rotate(name, axis, degrees):
    pb = arm.pose.bones.get(name)
    if pb:
        pb.rotation_quaternion = world_rot(pb, Quaternion(axis, math.radians(degrees)))

def rotate_world(name, quat):
    pb = arm.pose.bones.get(name)
    if pb:
        pb.rotation_quaternion = world_rot(pb, quat)

def arms_relaxed(swing=0):
    # The source is an A-pose. Bring the upper arms closer to the body and let
    # them swing forward/back with the walk cycle.
    left = Quaternion((1, 0, 0), math.radians(swing)) @ Quaternion((0, 1, 0), math.radians(50))
    right = Quaternion((1, 0, 0), math.radians(-swing)) @ Quaternion((0, 1, 0), math.radians(-50))
    rotate_world('LeftArm', left)
    rotate_world('RightArm', right)
    rotate('LeftForeArm', (0, 1, 0), 8)
    rotate('RightForeArm', (0, 1, 0), -8)

def reset_pose():
    for pb in arm.pose.bones:
        pb.rotation_quaternion = (1, 0, 0, 0)
        pb.location = (0, 0, 0)

def key_all(frame):
    for pb in arm.pose.bones:
        pb.keyframe_insert(data_path='rotation_quaternion', frame=frame, group=pb.name)
    arm.pose.bones['Hips'].keyframe_insert(data_path='location', frame=frame, group='Hips')

def new_action(name):
    action = bpy.data.actions.new(name)
    action.use_fake_user = True
    arm.animation_data.action = action
    return action

arm.animation_data_create()
arm.animation_data.action = None
scene = bpy.context.scene
scene.render.fps = 24

# Idle: the mesh already rests in a natural A-pose.
reset_pose()
new_action('Idle')
for frame, phase in [(1, 0.0), (13, 1.0), (25, 0.0), (37, -1.0), (49, 0.0)]:
    scene.frame_set(frame)
    reset_pose()
    arms_relaxed()
    rotate('Spine', (0, 1, 0), phase * 0.7)
    rotate('Head', (0, 1, 0), phase * 0.6)
    arm.pose.bones['Hips'].location = (0, -0.004 - abs(phase) * 0.004, 0)
    key_all(frame)

# Walk: arms swing forward/back, legs alternate, on a one-second loop.
reset_pose()
new_action('Walk')
for frame in [1, 7, 13, 19, 25]:
    scene.frame_set(frame)
    reset_pose()
    phase = math.sin((frame - 1) / 24 * math.pi * 2)
    swing = 25 * phase
    rotate('LeftUpLeg', (1, 0, 0), -swing)
    rotate('RightUpLeg', (1, 0, 0), swing)
    if phase >= 0:
        rotate('LeftLeg', (1, 0, 0), 8 + 10 * phase)
        rotate('RightLeg', (1, 0, 0), 28 - 8 * phase)
    else:
        rotate('LeftLeg', (1, 0, 0), 28 + 8 * phase)
        rotate('RightLeg', (1, 0, 0), 8 - 10 * phase)
    arms_relaxed(26 * phase)
    rotate('Spine', (1, 0, 0), 2.5)
    rotate('Spine1', (0, 1, 0), phase * 2.0)
    arm.pose.bones['Hips'].location = (0, -0.008 - abs(phase) * 0.008, 0)
    key_all(frame)

# Sit: both thighs forward, knees bent down, legs together.
reset_pose()
new_action('Sit')
for frame, breath in [(1, 0.0), (13, 1.0), (25, 0.0), (37, -1.0), (49, 0.0)]:
    scene.frame_set(frame)
    reset_pose()
    arms_relaxed()
    qx = Quaternion((1, 0, 0), math.radians(-82))
    rotate_world('LeftUpLeg', Quaternion((0, 0, 1), math.radians(6)) @ qx)
    rotate_world('RightUpLeg', Quaternion((0, 0, 1), math.radians(-6)) @ qx)
    rotate('LeftLeg', (1, 0, 0), 82)
    rotate('RightLeg', (1, 0, 0), 82)
    rotate('LeftFoot', (1, 0, 0), -4)
    rotate('RightFoot', (1, 0, 0), -4)
    rotate('Spine', (1, 0, 0), 2 + breath * 0.6)
    rotate('Head', (1, 0, 0), -1.0)
    arm.pose.bones['Hips'].location = (0, -0.1875, 0)
    key_all(frame)

# Web texture budget.
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
