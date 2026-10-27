import * as THREE from 'three';

/**
 * A standalone, procedurally built Chihiro model for Three.js.
 *
 * This is a stylised reconstruction of the Chapter One outfit used in the
 * project: brown bob + side ponytail, large brown eyes, white T-shirt with two
 * green stripes, coral shorts, white socks and mustard shoes. It is deliberately
 * built from a small articulated hierarchy so walk, run and jump can be
 * customised per project without an external rig importer.
 */

export type ChihiroAction = 'idle' | 'walk' | 'run' | 'jump';

export interface ChihiroWalkConfig {
  speed: number;
  stride: number;
  armSwing: number;
  kneeBend: number;
  bob: number;
  lean: number;
}

export interface ChihiroJumpConfig {
  height: number;
  duration: number;
}

export interface ChihiroModelOptions {
  height?: number;
  skinColor?: THREE.ColorRepresentation;
  hairColor?: THREE.ColorRepresentation;
  shirtColor?: THREE.ColorRepresentation;
  stripeColor?: THREE.ColorRepresentation;
  shortsColor?: THREE.ColorRepresentation;
  shoeColor?: THREE.ColorRepresentation;
  walk?: Partial<ChihiroWalkConfig>;
  jump?: Partial<ChihiroJumpConfig>;
}

export interface ChihiroJoints {
  body: THREE.Group;
  hips: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  armL: THREE.Group;
  armR: THREE.Group;
  elbowL: THREE.Group;
  elbowR: THREE.Group;
  legL: THREE.Group;
  legR: THREE.Group;
  kneeL: THREE.Group;
  kneeR: THREE.Group;
}

export interface ChihiroModel {
  root: THREE.Group;
  joints: ChihiroJoints;
  setAction(action: ChihiroAction): void;
  getAction(): ChihiroAction;
  jump(): void;
  update(dt: number): void;
  setWalkConfig(config: Partial<ChihiroWalkConfig>): void;
  setJumpConfig(config: Partial<ChihiroJumpConfig>): void;
  setHeight(height: number): void;
  dispose(): void;
}

const DEFAULT_HEIGHT = 1.42;
const BUILD_HEIGHT = 1.44;

const DEFAULT_WALK: ChihiroWalkConfig = {
  speed: 2.2,
  stride: 0.52,
  armSwing: 0.42,
  kneeBend: 0.75,
  bob: 0.025,
  lean: 0.035,
};

const DEFAULT_JUMP: ChihiroJumpConfig = {
  height: 0.46,
  duration: 0.72,
};

export function createChihiroModel(options: ChihiroModelOptions = {}): ChihiroModel {
  const skin = material(options.skinColor ?? 0xf1c9ae, 0.9);
  const skinShade = material(0xd8a68d, 0.92);
  const hair = material(options.hairColor ?? 0x5b4030, 0.84);
  const hairLight = material(0x76553d, 0.86);
  const shirt = material(options.shirtColor ?? 0xf3eedf, 0.95);
  const stripe = material(options.stripeColor ?? 0x91bd68, 0.92);
  const collar = material(0x7da45f, 0.9);
  const shorts = material(options.shortsColor ?? 0xd96f59, 0.92);
  const shortsDark = material(0xc25b48, 0.93);
  const sock = material(0xf2ede1, 0.96);
  const shoe = material(options.shoeColor ?? 0xe0b354, 0.74);
  const shoeSole = material(0xefe4cf, 0.88);
  const shoeOutsole = material(0x6c4b32, 0.9);
  const eyeWhite = material(0xfff8ed, 0.45);
  const iris = material(0x5c3924, 0.4);
  const pupil = material(0x1c1210, 0.3);
  const eyeLine = material(0x352017, 0.8);
  const mouth = material(0x9e5f56, 0.8);
  const blush = new THREE.MeshBasicMaterial({ color: 0xd98a82, transparent: true, opacity: 0.28 });
  const hairTie = material(0xb45f68, 0.72);

  const root = new THREE.Group();
  root.name = 'ChihiroProcedural';
  const body = group('body');
  root.add(body);

  const hips = group('hips', 0, 0.72, 0);
  body.add(hips);

  // Coral shorts / pelvis.
  hips.add(rounded(new THREE.CylinderGeometry(0.145, 0.17, 0.18, 18), shorts, 'shorts', 0, 0.01, 0));
  for (const side of [-1, 1]) {
    const shortLeg = rounded(new THREE.CylinderGeometry(0.08, 0.092, 0.17, 12), shortsDark, 'shorts-leg', side * 0.072, -0.105, 0);
    hips.add(shortLeg);
  }

  const torso = group('torso', 0, 0.08, 0);
  hips.add(torso);

  // Oversized white tee with two green stripes and a green collar.
  const shirtBody = rounded(new THREE.CylinderGeometry(0.15, 0.215, 0.46, 24), shirt, 'shirt', 0, 0.13, 0);
  torso.add(shirtBody);
  // The reference sheet uses one wide green chest band. It continues across
  // the upper sleeves, unlike the two-band version used by the in-game LOD.
  torso.add(rounded(new THREE.CylinderGeometry(0.171, 0.188, 0.105, 24), stripe, 'chest-stripe', 0, 0.19, 0));
  torso.add(rounded(new THREE.TorusGeometry(0.207, 0.008, 6, 28), shirt, 'shirt-hem', 0, -0.092, 0.01));
  const collarMesh = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.018, 7, 22), collar);
  collarMesh.name = 'collar';
  collarMesh.rotation.x = Math.PI / 2;
  collarMesh.position.y = 0.365;
  torso.add(collarMesh);

  const neck = rounded(new THREE.CylinderGeometry(0.052, 0.06, 0.1, 12), skin, 'neck', 0, 0.4, 0);
  torso.add(neck);

  const head = group('head', 0, 0.49, 0);
  head.scale.setScalar(1.055);
  torso.add(head);
  const skull = rounded(new THREE.SphereGeometry(0.153, 26, 20), skin, 'face', 0, 0, 0.008);
  skull.scale.set(1, 1.08, 0.96);
  head.add(skull);

  // Ears and the small anime nose/mouth.
  for (const side of [-1, 1]) {
    const ear = rounded(new THREE.SphereGeometry(0.032, 10, 8), skinShade, 'ear', side * 0.152, -0.005, 0.015);
    ear.scale.set(0.55, 1, 0.8);
    head.add(ear);
  }
  const nose = rounded(new THREE.SphereGeometry(0.016, 8, 6), skinShade, 'nose', 0, -0.035, 0.151);
  nose.scale.set(0.7, 0.55, 0.55);
  head.add(nose);
  head.add(rounded(new THREE.BoxGeometry(0.06, 0.008, 0.009), mouth, 'mouth', 0, -0.086, 0.148));
  const lowerLip = rounded(new THREE.SphereGeometry(0.014, 10, 6), mouth, 'lower-lip', 0, -0.094, 0.145);
  lowerLip.scale.set(1.05, 0.22, 0.3);
  head.add(lowerLip);
  for (const side of [-1, 1]) {
    const cheek = new THREE.Mesh(new THREE.CircleGeometry(0.028, 12), blush);
    cheek.name = 'blush';
    cheek.position.set(side * 0.095, -0.047, 0.137);
    cheek.rotation.y = side * 0.3;
    head.add(cheek);
  }

  // Large brown eyes with layered highlights.
  for (const side of [-1, 1]) {
    const eye = rounded(new THREE.SphereGeometry(0.04, 16, 12), eyeWhite, 'eye-white', side * 0.065, 0.022, 0.144);
    eye.scale.set(0.96, 1.32, 0.12);
    head.add(eye);
    const irisMesh = rounded(new THREE.SphereGeometry(0.033, 14, 10), iris, 'iris', side * 0.065, 0.018, 0.147);
    irisMesh.scale.set(0.93, 1.2, 0.07);
    head.add(irisMesh);
    const pupilMesh = rounded(new THREE.SphereGeometry(0.016, 10, 8), pupil, 'pupil', side * 0.065, 0.016, 0.150);
    pupilMesh.scale.z = 0.07;
    head.add(pupilMesh);
    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.0065, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    glint.name = 'eye-glint';
    glint.position.set(side * 0.058, 0.032, 0.152);
    head.add(glint);
    const lid = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.012, 0.012), eyeLine);
    lid.name = 'eyelid';
    lid.position.set(side * 0.065, 0.063, 0.151);
    lid.rotation.z = side * -0.08;
    head.add(lid);
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.009, 0.01), hair);
    brow.name = 'brow';
    brow.position.set(side * 0.066, 0.095, 0.152);
    brow.rotation.z = side * -0.12;
    head.add(brow);
  }

  // Hair cap, fringe, side locks and the tied side ponytail.
  const backHair = rounded(new THREE.SphereGeometry(0.155, 22, 16), hair, 'hair-back', 0, -0.010, -0.050);
  backHair.scale.set(1.02, 1.1, 0.95);
  head.add(backHair);
  const hairCap = rounded(new THREE.SphereGeometry(0.17, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.42), hair, 'hair-cap', 0, 0.023, 0.004);
  hairCap.scale.set(1.02, 1.02, 1.0);
  head.add(hairCap);

  // Soft, overlapping fringe locks instead of pointed cone teeth.
  const fringeSpec: Array<[number, number, number, number, number, number]> = [
    [-0.118, 0.086, 0.128, -0.28, 0.086, 0.046],
    [-0.067, 0.095, 0.137, -0.12, 0.098, 0.05],
    [-0.012, 0.088, 0.141, 0.04, 0.09, 0.051],
    [0.046, 0.095, 0.137, 0.16, 0.098, 0.049],
    [0.105, 0.086, 0.128, 0.30, 0.084, 0.046],
  ];
  for (const [x, y, z, zRot, length, radius] of fringeSpec) {
    const bang = rounded(new THREE.SphereGeometry(radius, 12, 9), hair, 'fringe', x, y, z);
    // Use the supplied length as the full hanging length, not a multiplier.
    bang.scale.set(0.72, length / (radius * 2), 0.4);
    bang.rotation.z = zRot;
    bang.rotation.x = -0.16;
    head.add(bang);
  }
  for (const side of [-1, 1]) {
    const lock = rounded(new THREE.CapsuleGeometry(0.023, 0.105, 5, 8), hair, 'side-lock', side * 0.147, -0.018, 0.095);
    lock.rotation.z = side * 0.1;
    lock.rotation.x = -0.07;
    head.add(lock);
    const tip = rounded(new THREE.SphereGeometry(0.024, 10, 8), hairLight, 'side-lock-tip', side * 0.147, -0.105, 0.075);
    tip.scale.set(0.72, 0.5, 0.7);
    head.add(tip);
  }

  const ponytail = group('ponytail', -0.108, 0.075, -0.13);
  head.add(ponytail);
  const tie = new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.010, 6, 12), hairTie);
  tie.name = 'hair-tie';
  tie.rotation.x = Math.PI / 2;
  ponytail.add(tie);
  const tailSpec: Array<[number, number, number, number, number, number]> = [
    [-0.015, -0.075, -0.015, -0.40, 0.21, 0.042],
    [0.025, -0.09, -0.025, -0.52, 0.23, 0.05],
    [-0.05, -0.085, -0.01, -0.62, 0.22, 0.038],
  ];
  for (const [x, y, z, zRot, length, radius] of tailSpec) {
    const strand = rounded(new THREE.CapsuleGeometry(radius, length, 6, 8), hair, 'ponytail-strand', x, y, z);
    strand.rotation.z = zRot;
    strand.rotation.x = -0.08;
    ponytail.add(strand);
  }

  // Arms: white sleeve + green cuff band, then skin forearm/hand.
  const armL = group('arm-l', -0.19, 0.355, 0);
  const armR = group('arm-r', 0.19, 0.355, 0);
  torso.add(armL, armR);
  const elbowL = group('elbow-l', 0, -0.25, 0);
  const elbowR = group('elbow-r', 0, -0.25, 0);
  armL.add(elbowL);
  armR.add(elbowR);
  for (const [side, arm, elbow] of [[-1, armL, elbowL], [1, armR, elbowR]] as const) {
    const sleeve = rounded(new THREE.CylinderGeometry(0.068, 0.058, 0.15, 12), shirt, 'sleeve', 0, -0.055, 0);
    arm.add(sleeve);
    const sleeveStripe = rounded(new THREE.CylinderGeometry(0.064, 0.063, 0.08, 12), stripe, 'sleeve-stripe', 0, -0.075, 0);
    arm.add(sleeveStripe);
    const cuff = rounded(new THREE.CylinderGeometry(0.059, 0.059, 0.035, 12), shirt, 'sleeve-cuff', 0, -0.132, 0);
    arm.add(cuff);
    const upper = rounded(new THREE.CapsuleGeometry(0.043, 0.16, 5, 8), skin, 'upper-arm', 0, -0.19, 0);
    arm.add(upper);
    const forearm = rounded(new THREE.CapsuleGeometry(0.036, 0.17, 5, 8), skin, 'forearm', 0, -0.11, 0);
    elbow.add(forearm);
    const hand = rounded(new THREE.SphereGeometry(0.046, 10, 8), skin, 'hand', 0, -0.23, 0.005);
    hand.scale.set(0.8, 1.0, 0.7);
    elbow.add(hand);
    for (let f = 0; f < 3; f++) {
      const finger = rounded(new THREE.CapsuleGeometry(0.010, 0.045, 4, 6), skinShade, 'finger', (f - 1) * 0.018, -0.266, 0.015);
      finger.rotation.x = 0.18;
      elbow.add(finger);
    }
    arm.rotation.z = side * 0.12;
  }

  // Legs, socks and shoes.
  const legL = group('leg-l', -0.075, -0.02, 0);
  const legR = group('leg-r', 0.075, -0.02, 0);
  hips.add(legL, legR);
  const kneeL = group('knee-l', 0, -0.32, 0);
  const kneeR = group('knee-r', 0, -0.32, 0);
  legL.add(kneeL);
  legR.add(kneeR);
  for (const [side, leg, knee] of [[-1, legL, kneeL], [1, legR, kneeR]] as const) {
    const thigh = rounded(new THREE.CapsuleGeometry(0.058, 0.25, 6, 10), skin, 'thigh', 0, -0.17, 0);
    leg.add(thigh);
    const shin = rounded(new THREE.CapsuleGeometry(0.043, 0.2, 6, 10), skin, 'shin', 0, -0.14, 0);
    knee.add(shin);
    const sockMesh = rounded(new THREE.CylinderGeometry(0.046, 0.043, 0.11, 10), sock, 'sock', 0, -0.255, 0);
    knee.add(sockMesh);
    const sockCuff = rounded(new THREE.TorusGeometry(0.045, 0.012, 6, 12), sock, 'sock-cuff', 0, -0.198, 0);
    sockCuff.rotation.x = Math.PI / 2;
    knee.add(sockCuff);
    const foot = rounded(new THREE.BoxGeometry(0.096, 0.069, 0.175), shoe, 'shoe', 0, -0.335, 0.045);
    knee.add(foot);
    const sole = rounded(new THREE.BoxGeometry(0.1, 0.016, 0.185), shoeSole, 'sole', 0, -0.378, 0.045);
    knee.add(sole);
    const outsole = rounded(new THREE.BoxGeometry(0.096, 0.008, 0.18), shoeOutsole, 'outsole', 0, -0.39, 0.045);
    knee.add(outsole);
    const toe = rounded(new THREE.SphereGeometry(0.047, 10, 8), shoe, 'toe', 0, -0.335, 0.128);
    toe.scale.set(1.0, 0.55, 0.72);
    knee.add(toe);
    for (let l = 0; l < 3; l++) {
      const lace = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.008, 0.012), shoeSole);
      lace.name = 'lace';
      lace.position.set(0, -0.30 + l * 0.012, 0.07 + l * 0.018);
      knee.add(lace);
    }
    leg.rotation.z = side * 0.025;
  }

  // Facial texture decal. The reference sheet's face is drawn in 2D, so it is
  // mapped onto a very shallow curved plane just proud of the skull. The old
  // primitive eyes/nose/mouth stay in the hierarchy (named) but are hidden.
  const faceTexture = new THREE.TextureLoader().load('/images/chihiro_face.png');
  faceTexture.colorSpace = THREE.SRGBColorSpace;
  faceTexture.anisotropy = 4;
  const faceGeometry = new THREE.PlaneGeometry(0.255, 0.204, 16, 16);
  const facePositions = faceGeometry.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < facePositions.count; i++) {
    const x = facePositions.getX(i);
    const y = facePositions.getY(i);
    facePositions.setZ(i, -0.055 * Math.pow(x / 0.1275, 2) - 0.035 * Math.pow(y / 0.102, 2));
  }
  faceGeometry.computeVertexNormals();
  const faceDecal = new THREE.Mesh(
    faceGeometry,
    new THREE.MeshBasicMaterial({
      map: faceTexture,
      transparent: true,
      alphaTest: 0.02,
      depthWrite: false,
      toneMapped: false,
      side: THREE.DoubleSide,
    }),
  );
  faceDecal.name = 'face-decal';
  faceDecal.position.set(0, -0.022, 0.158);
  faceDecal.renderOrder = 3;
  head.add(faceDecal);
  for (const object of head.children) {
    if (['eye-white', 'iris', 'pupil', 'eye-glint', 'eyelid', 'brow', 'nose', 'mouth', 'lower-lip', 'blush'].includes(object.name)) {
      object.visible = false;
    }
  }

  const joints: ChihiroJoints = {
    body, hips, torso, head,
    armL, armR, elbowL, elbowR,
    legL, legR, kneeL, kneeR,
  };

  const walkConfig: ChihiroWalkConfig = { ...DEFAULT_WALK, ...options.walk };
  const jumpConfig: ChihiroJumpConfig = { ...DEFAULT_JUMP, ...options.jump };
  let action: ChihiroAction = 'idle';
  let phase = 0;
  let time = 0;
  let jumpElapsed = -1;
  let targetHeight = options.height ?? DEFAULT_HEIGHT;
  root.scale.setScalar(targetHeight / BUILD_HEIGHT);

  const resetPose = () => {
    body.position.y = 0;
    body.rotation.set(0, 0, 0);
    hips.position.set(0, 0.72, 0);
    torso.rotation.set(0, 0, 0);
    head.rotation.set(0, 0, 0);
    for (const arm of [armL, armR]) {
      arm.rotation.set(0, 0, 0);
      arm.position.y = 0.355;
    }
    armL.rotation.z = -0.12;
    armR.rotation.z = 0.12;
    for (const elbow of [elbowL, elbowR]) elbow.rotation.set(0, 0, 0);
    for (const leg of [legL, legR]) {
      leg.rotation.set(0, 0, 0);
      leg.position.y = -0.02;
    }
    for (const knee of [kneeL, kneeR]) knee.rotation.set(0, 0, 0);
  };

  const update = (dt: number) => {
    const delta = Math.min(0.05, Math.max(0, dt));
    time += delta;
    resetPose();

    if (jumpElapsed >= 0) {
      jumpElapsed += delta;
      const t = Math.min(1, jumpElapsed / jumpConfig.duration);
      const arc = Math.sin(t * Math.PI);
      body.position.y = arc * jumpConfig.height;
      body.rotation.x = -arc * 0.1;
      legL.rotation.x = -0.48 * arc;
      legR.rotation.x = 0.32 * arc;
      kneeL.rotation.x = 1.08 * arc;
      kneeR.rotation.x = 0.72 * arc;
      armL.rotation.x = -1.05 * arc;
      armR.rotation.x = -1.05 * arc;
      armL.rotation.z = -0.42;
      armR.rotation.z = 0.42;
      head.rotation.x = -0.08 * arc;
      if (t >= 1) {
        jumpElapsed = -1;
        action = 'idle';
      }
      return;
    }

    if (action === 'walk' || action === 'run') {
      const scale = action === 'run' ? 1.55 : 1;
      phase += delta * walkConfig.speed * scale;
      const swing = Math.sin(phase);
      const stride = walkConfig.stride * scale;
      legL.rotation.x = swing * stride;
      legR.rotation.x = -swing * stride;
      kneeL.rotation.x = Math.max(0, -swing) * walkConfig.kneeBend * scale;
      kneeR.rotation.x = Math.max(0, swing) * walkConfig.kneeBend * scale;
      armL.rotation.x = -swing * walkConfig.armSwing * scale;
      armR.rotation.x = swing * walkConfig.armSwing * scale;
      body.position.y = Math.abs(Math.sin(phase * 2)) * walkConfig.bob * scale;
      body.rotation.z = Math.sin(phase) * 0.018 * scale;
      torso.rotation.x = walkConfig.lean * scale;
      head.rotation.x = -walkConfig.lean * 0.45 * scale;
      head.rotation.y = Math.sin(phase * 0.5) * 0.035;
      return;
    }

    // Idle breathing and a tiny weight shift.
    const breath = Math.sin(time * 1.8);
    body.position.y = breath * 0.005;
    torso.rotation.x = breath * 0.006;
    head.rotation.y = Math.sin(time * 0.45) * 0.025;
    head.rotation.z = Math.sin(time * 0.3) * 0.008;
    armL.rotation.z = -0.12 + Math.sin(time * 1.2) * 0.012;
    armR.rotation.z = 0.12 - Math.sin(time * 1.2) * 0.012;
  };

  root.userData.sculptRuntime = {
    kind: 'character',
    name: 'Chihiro',
    height: targetHeight,
    joints,
    action: () => action,
  };

  return {
    root,
    joints,
    setAction(next: ChihiroAction) {
      if (next === 'jump') {
        this.jump();
        return;
      }
      action = next;
      if (next === 'idle') phase = 0;
    },
    getAction: () => action,
    jump() {
      if (jumpElapsed >= 0) return;
      jumpElapsed = 0;
      action = 'jump';
    },
    update,
    setWalkConfig(next: Partial<ChihiroWalkConfig>) {
      Object.assign(walkConfig, next);
    },
    setJumpConfig(next: Partial<ChihiroJumpConfig>) {
      Object.assign(jumpConfig, next);
    },
    setHeight(height: number) {
      targetHeight = THREE.MathUtils.clamp(height, 0.8, 2.4);
      root.scale.setScalar(targetHeight / BUILD_HEIGHT);
    },
    dispose() {
      root.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        for (const mat of materials) mat.dispose();
      });
    },
  };
}

function material(color: THREE.ColorRepresentation, roughness: number): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness: 0,
  });
}

function group(name: string, x = 0, y = 0, z = 0): THREE.Group {
  const node = new THREE.Group();
  node.name = name;
  node.position.set(x, y, z);
  return node;
}

function rounded<T extends THREE.BufferGeometry>(geometry: T, mat: THREE.Material, name: string, x = 0, y = 0, z = 0): THREE.Mesh {
  const mesh = new THREE.Mesh(geometry, mat);
  mesh.name = name;
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}
