"""Rig, flail-animate and optimize Kamaji's static GLB.

Usage:
  Blender -b --python blender/export_kamaji.py -- source.glb public/models/kamaji.glb
"""
import bpy
import bmesh
import math
import os
import sys
from mathutils import Quaternion, Vector

args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
source = args[0] if args else '/Users/lilu/Downloads/20261021152846_74e44d8d.glb'
out = args[1] if len(args) > 1 else os.path.abspath('public/models/kamaji.glb')

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=source)
mesh = next(o for o in bpy.data.objects if o.type == 'MESH')

# Six approximate hand directions. The asset has no armature; rigidly assigning
# connected shell pieces to six shoulder pivots keeps the many arms and props
# intact while allowing a looping flail.
tips = [
    ('ArmL1', -0.46, 0.10, 0.15), ('ArmL2', -0.46, -0.05, 0.10), ('ArmL3', -0.28, -0.18, 0.05),
    ('ArmR1', 0.46, 0.15, 0.15), ('ArmR2', 0.46, -0.05, 0.10), ('ArmR3', 0.28, -0.18, 0.05),
]
bm = bmesh.new()
bm.from_mesh(mesh.data)
bm.verts.ensure_lookup_table()
seen = set()
components = []
for v in bm.verts:
    if v.index in seen:
        continue
    stack = [v]
    seen.add(v.index)
    ids = []
    while stack:
        cur = stack.pop()
        ids.append(cur.index)
        for edge in cur.link_edges:
            other = edge.other_vert(cur)
            if other.index not in seen:
                seen.add(other.index)
                stack.append(other)
    components.append(ids)
bm.free()

arm_data = bpy.data.armatures.new('KamajiRig')
arm = bpy.data.objects.new('KamajiRig', arm_data)
bpy.context.collection.objects.link(arm)
bpy.context.view_layer.objects.active = arm
bpy.ops.object.mode_set(mode='EDIT')
root = arm_data.edit_bones.new('root')
root.head = (0, 0, 0)
root.tail = (0, 0, 0.15)
for name, x, y, z in tips:
    bone = arm_data.edit_bones.new(name)
    bone.head = (0.12 if x > 0 else -0.12, 0.02 if y > 0 else -0.02, 0.14 if z > 0.1 else 0.08)
    bone.tail = (x, y, z)
    bone.parent = root
bpy.ops.object.mode_set(mode='OBJECT')

for name, _, _, _ in tips:
    mesh.vertex_groups.new(name=name)
mesh.vertex_groups.new(name='root')
groups = {g.name: g for g in mesh.vertex_groups}
for ids in components:
    coords = [mesh.data.vertices[i].co for i in ids]
    cx = sum(c.x for c in coords) / len(coords)
    cy = sum(c.y for c in coords) / len(coords)
    cz = sum(c.z for c in coords) / len(coords)
    radial = math.hypot(cx, cy)
    assigned = None
    if radial > 0.22 and cz > -0.04:
        assigned = min(tips, key=lambda t: (cx - t[1]) ** 2 + (cy - t[2]) ** 2)[0]
    elif cx > 0.12 and cy < -0.10 and cz > -0.06 and radial > 0.13:
        assigned = 'ArmR3'
    if assigned:
        groups[assigned].add(ids, 1, 'REPLACE')
    else:
        groups['root'].add(ids, 1, 'REPLACE')

mesh.parent = arm
mesh.matrix_parent_inverse = arm.matrix_world.inverted()
modifier = mesh.modifiers.new('Armature', 'ARMATURE')
modifier.object = arm

scene = bpy.context.scene
scene.frame_start = 1
scene.frame_end = 49
scene.render.fps = 24
action = bpy.data.actions.new('ArmFlail')
arm.animation_data_create()
arm.animation_data.action = action
for bone in arm.pose.bones:
    bone.rotation_mode = 'QUATERNION'
for frame in [1, 7, 13, 19, 25, 31, 37, 43, 49]:
    phase = (frame - 1) / 48 * math.pi * 2
    for i, (name, _, _, _) in enumerate(tips):
        pb = arm.pose.bones[name]
        rest = pb.bone.matrix_local.to_quaternion()
        z = math.sin(phase * 2 + i * 1.05) * math.radians(14)
        x = math.cos(phase * 2 + i * 0.75) * math.radians(18)
        q = Quaternion((0, 0, 1), z) @ Quaternion((1, 0, 0), x)
        pb.rotation_quaternion = rest.inverted() @ q @ rest
        pb.keyframe_insert(data_path='rotation_quaternion', frame=frame, group=name)
    root_pose = arm.pose.bones['root']
    root_pose.location = (0, 0, math.sin(phase * 2) * 0.012)
    root_pose.keyframe_insert(data_path='location', frame=frame, group='root')

# Light decimation: the source is already low-poly but this trims redundant faces.
bpy.context.view_layer.objects.active = mesh
bpy.ops.object.modifier_add(type='DECIMATE')
dec = mesh.modifiers.get('Decimate')
dec.ratio = 0.84
bpy.ops.object.modifier_apply(modifier=dec.name)

for image in bpy.data.images:
    if image.size[0] > 1024 or image.size[1] > 1024:
        image.scale(1024, 1024)
try:
    bpy.ops.file.pack_all()
except Exception as exc:
    print('pack warning:', exc)
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
)
print('exported', out, os.path.getsize(out))
