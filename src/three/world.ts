import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export type Vec3 = THREE.Vector3;

const TAU = Math.PI * 2;

const rand = (seed: number): number => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export function makeGlowTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,246,214,1)');
  g.addColorStop(0.18, 'rgba(255,221,150,.72)');
  g.addColorStop(0.46, 'rgba(255,183,92,.2)');
  g.addColorStop(1, 'rgba(255,160,50,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function makeShadowTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(64, 64, 2, 64, 64, 62);
  g.addColorStop(0, 'rgba(0,0,0,.62)');
  g.addColorStop(0.5, 'rgba(0,0,0,.28)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

function noiseTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#7f8666';
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2800; i++) {
    const g = 80 + rand(i + 3) * 70;
    ctx.fillStyle = `rgba(${g},${g + 14},${g - 20},${0.05 + rand(i) * 0.13})`;
    const r = 1 + rand(i + 4) * 8;
    ctx.beginPath();
    ctx.arc(rand(i + 7) * 256, rand(i + 9) * 256, r, 0, TAU);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(11, 11);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function brickTexture(base = '#8d4939'): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#5c3b30';
  ctx.fillRect(0, 0, 512, 512);
  const bw = 96;
  const bh = 40;
  for (let row = 0; row < 14; row++) {
    for (let col = -1; col < 7; col++) {
      const x = col * bw + (row % 2) * (bw / 2);
      const y = row * bh;
      const shade = 0.78 + rand(row * 9 + col + 4) * 0.36;
      const colBase = new THREE.Color(base).multiplyScalar(shade);
      ctx.fillStyle = `#${colBase.getHexString()}`;
      ctx.fillRect(x + 3, y + 3, bw - 6, bh - 6);
      ctx.fillStyle = 'rgba(255,220,178,.035)';
      ctx.fillRect(x + 5, y + 5, bw - 11, 3);
      if (rand(row + col * 3) > 0.72) {
        ctx.fillStyle = 'rgba(56,46,33,.22)';
        ctx.beginPath();
        ctx.ellipse(x + 15 + rand(col) * 50, y + 12 + rand(row) * 15, 8 + rand(col + 2) * 18, 2, 0.2, 0, TAU);
        ctx.fill();
      }
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function cobbleTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#5e584d';
  ctx.fillRect(0, 0, 512, 512);
  for (let row = 0; row < 12; row++) {
    for (let col = 0; col < 9; col++) {
      const x = col * 58 + (row % 2) * 27;
      const y = row * 45;
      const co = new THREE.Color('#7b7363').multiplyScalar(0.72 + rand(row * 13 + col) * 0.5);
      ctx.fillStyle = `#${co.getHexString()}`;
      ctx.beginPath();
      ctx.roundRect(x + 2, y + 2, 52, 38, 8);
      ctx.fill();
      ctx.strokeStyle = 'rgba(37,35,30,.28)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = 'rgba(236,217,176,.05)';
      ctx.fillRect(x + 6, y + 5, 38, 3);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2.5, 8);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function woodTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 128;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#5a3b28';
  ctx.fillRect(0, 0, 512, 128);
  for (let i = 0; i < 28; i++) {
    ctx.strokeStyle = `rgba(${28 + rand(i) * 30},${20 + rand(i + 3) * 22},${13 + rand(i + 5) * 18},${0.18 + rand(i + 8) * 0.25})`;
    ctx.lineWidth = 1 + rand(i + 2) * 2.5;
    ctx.beginPath();
    const y = rand(i + 6) * 128;
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(160, y + 9, 340, y - 8, 512, y + 3);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 1);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function signTexture(textValue: string, vertical = false): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = vertical ? 192 : 512;
  c.height = vertical ? 512 : 160;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#2b211a';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.strokeStyle = 'rgba(197,151,87,.56)';
  ctx.lineWidth = 5;
  ctx.strokeRect(9, 9, c.width - 18, c.height - 18);
  ctx.fillStyle = 'rgba(233,207,158,.9)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (vertical) {
    ctx.font = '64px "STKaiti","KaiTi","Songti SC",serif';
    const chars = [...textValue];
    chars.forEach((ch, i) => ctx.fillText(ch, c.width / 2, 90 + i * 88));
  } else {
    ctx.font = '58px "STKaiti","KaiTi","Songti SC",serif';
    ctx.fillText(textValue, c.width / 2, c.height / 2 + 4);
  }
  ctx.fillStyle = 'rgba(160,45,37,.9)';
  ctx.fillRect(c.width - 46, c.height - 46, 24, 24);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeSky(top: string, horizon: string, bottom: string, sunColor: string, sunDir: THREE.Vector3): THREE.Mesh {
  const uniforms = {
    topColor: { value: new THREE.Color(top) },
    horizonColor: { value: new THREE.Color(horizon) },
    bottomColor: { value: new THREE.Color(bottom) },
    sunColor: { value: new THREE.Color(sunColor) },
    sunDir: { value: sunDir.clone().normalize() },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    side: THREE.BackSide,
    depthWrite: false,
    vertexShader: `
      varying vec3 vWorld;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorld = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 horizonColor;
      uniform vec3 bottomColor;
      uniform vec3 sunColor;
      uniform vec3 sunDir;
      varying vec3 vWorld;
      void main() {
        vec3 dir = normalize(vWorld);
        float h = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);
        vec3 col = mix(bottomColor, horizonColor, smoothstep(0.34, 0.51, h));
        col = mix(col, topColor, smoothstep(0.51, 0.94, h));
        float sun = pow(max(dot(dir, normalize(sunDir)), 0.0), 240.0);
        float halo = pow(max(dot(dir, normalize(sunDir)), 0.0), 9.0);
        col += sunColor * sun * 1.6 + sunColor * halo * 0.14;
        // very subtle bands, like brushed paper
        col += (fract(h * 24.0) - 0.5) * 0.008;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(170, 40, 24), material);
  mesh.frustumCulled = false;
  mesh.userData.skyUniforms = uniforms;
  return mesh;
}

function sunSprite(dir: THREE.Vector3, size = 24, opacity = 0.72): THREE.Sprite {
  const material = new THREE.SpriteMaterial({
    map: makeGlowTexture(),
    color: 0xffe8b3,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: true,
  });
  const sprite = new THREE.Sprite(material);
  sprite.position.copy(dir.clone().normalize().multiplyScalar(115));
  sprite.scale.set(size, size, 1);
  return sprite;
}

function cloudCluster(x: number, y: number, z: number, scale: number, color: number, opacity = 0.62): THREE.Group {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color,
    transparent: true,
    opacity,
    roughness: 1,
    flatShading: true,
    depthWrite: false,
  });
  const count = 5;
  for (let i = 0; i < count; i++) {
    const geo = new THREE.IcosahedronGeometry(1, 1);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set((i - count / 2) * 0.9, Math.sin(i * 2.2) * 0.16, rand(i + x) * 0.55);
    mesh.scale.set(1.2 + rand(i + 2) * 0.7, 0.34 + rand(i + 4) * 0.22, 0.7);
    group.add(mesh);
  }
  group.position.set(x, y, z);
  group.scale.setScalar(scale);
  return group;
}

function createCar(): THREE.Group {
  const car = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x737868, roughness: 0.46, metalness: 0.32 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x262c28, roughness: 0.65, metalness: 0.2 });
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x56706f,
    roughness: 0.14,
    metalness: 0.15,
    transparent: true,
    opacity: 0.72,
    transmission: 0.25,
  });
  const body = new THREE.Mesh(new RoundedBoxGeometry(3.9, 1.05, 1.72, 5, 0.2), bodyMat);
  body.position.y = 0.82;
  body.castShadow = true;
  body.receiveShadow = true;
  car.add(body);

  const cabin = new THREE.Mesh(new RoundedBoxGeometry(2.0, 0.82, 1.5, 4, 0.18), bodyMat);
  cabin.position.set(-0.05, 1.55, 0);
  cabin.castShadow = true;
  car.add(cabin);

  const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.55, 1.2), glassMat);
  windshield.position.set(0.98, 1.55, 0);
  windshield.rotation.z = -0.15;
  car.add(windshield);
  const rearGlass = windshield.clone();
  rearGlass.position.x = -1.04;
  rearGlass.rotation.z = 0.16;
  car.add(rearGlass);
  for (const side of [-1, 1]) {
    const sideGlass = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.51, 0.05), glassMat);
    sideGlass.position.set(-0.05, 1.57, side * 0.755);
    car.add(sideGlass);
    const divider = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.56, 0.055), darkMat);
    divider.position.set(-0.14, 1.56, side * 0.78);
    car.add(divider);
  }

  const rackMat = new THREE.MeshStandardMaterial({ color: 0x3a3428, roughness: 0.7 });
  for (const z of [-0.62, 0.62]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.06, 0.055), rackMat);
    rail.position.set(-0.05, 2.0, z);
    car.add(rail);
  }
  const luggageMat = new THREE.MeshStandardMaterial({ color: 0x765b45, roughness: 0.86 });
  const luggage1 = new THREE.Mesh(new RoundedBoxGeometry(0.82, 0.42, 0.58, 2, 0.06), luggageMat);
  luggage1.position.set(-0.42, 2.24, 0);
  luggage1.castShadow = true;
  car.add(luggage1);
  const luggage2 = new THREE.Mesh(new RoundedBoxGeometry(0.58, 0.32, 0.56, 2, 0.05), luggageMat);
  luggage2.position.set(0.55, 2.2, 0.05);
  car.add(luggage2);
  const strap = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.04, 0.6), darkMat);
  strap.position.set(-0.42, 2.46, 0);
  car.add(strap);

  for (const x of [-1.32, 1.32]) {
    for (const z of [-0.83, 0.83]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.25, 20), darkMat);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(x, 0.38, z);
      wheel.castShadow = true;
      car.add(wheel);
      const hub = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 0.27, 12),
        new THREE.MeshStandardMaterial({ color: 0x8d8f7f, roughness: 0.3, metalness: 0.55 }),
      );
      hub.rotation.x = Math.PI / 2;
      hub.position.copy(wheel.position);
      car.add(hub);
    }
  }
  for (const z of [-0.57, 0.57]) {
    const light = new THREE.Mesh(
      new THREE.CircleGeometry(0.085, 16),
      new THREE.MeshStandardMaterial({ color: 0xdac9a3, emissive: 0xffc777, emissiveIntensity: 0.45 }),
    );
    light.position.set(1.965, 0.83, z);
    light.rotation.y = Math.PI / 2;
    car.add(light);
  }
  const grille = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.2, 0.72), darkMat);
  grille.position.set(1.97, 0.77, 0);
  car.add(grille);
  for (let i = 0; i < 5; i++) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.018, 0.62), new THREE.MeshStandardMaterial({ color: 0x7b7d6d, metalness: 0.5, roughness: 0.4 }));
    bar.position.set(1.99, 0.69 + i * 0.04, 0);
    car.add(bar);
  }
  const bumper = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 1.65), darkMat);
  bumper.position.set(1.98, 0.5, 0);
  car.add(bumper);
  return car;
}

function createTree(seed: number, color = 0x3e5a43): THREE.Group {
  const group = new THREE.Group();
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4b3a2b, roughness: 0.95 });
  const leafMat = new THREE.MeshStandardMaterial({ color, roughness: 0.92, flatShading: true });
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.26, 2.4, 7), trunkMat);
  trunk.position.y = 1.2;
  trunk.castShadow = true;
  group.add(trunk);
  const count = 4 + Math.floor(rand(seed) * 3);
  for (let i = 0; i < count; i++) {
    const geo = new THREE.IcosahedronGeometry(1, 1);
    const leaf = new THREE.Mesh(geo, leafMat);
    const a = rand(seed + i * 3) * TAU;
    const r = 0.5 + rand(seed + i * 7) * 1.1;
    leaf.position.set(Math.cos(a) * r, 2.4 + rand(seed + i * 5) * 1.35, Math.sin(a) * r);
    leaf.scale.set(0.75 + rand(seed + i) * 0.9, 0.52 + rand(seed + i + 2) * 0.6, 0.75 + rand(seed + i + 8) * 0.8);
    leaf.rotation.set(rand(seed + i * 2) * 2, rand(seed + i * 4) * 2, 0);
    leaf.castShadow = i < 2;
    group.add(leaf);
  }
  const scale = 0.8 + rand(seed + 20) * 1.1;
  group.scale.setScalar(scale);
  return group;
}


function makeRedPlasterTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 512;
  const ctx = c.getContext('2d')!;
  const base = ctx.createLinearGradient(0, 0, 0, 512);
  base.addColorStop(0, '#a85a4b'); base.addColorStop(.55, '#944639'); base.addColorStop(1, '#74362e');
  ctx.fillStyle = base; ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 150; i++) {
    const x = rand(i + 3) * 512, y = rand(i + 7) * 512;
    const r = 4 + rand(i + 11) * 38;
    ctx.fillStyle = `rgba(${60 + rand(i) * 30 | 0},${35 + rand(i + 2) * 20 | 0},${28 + rand(i + 4) * 15 | 0},${0.03 + rand(i + 6) * 0.08})`;
    ctx.beginPath(); ctx.ellipse(x, y, r, r * (0.4 + rand(i + 8) * 0.8), rand(i) * 3, 0, Math.PI * 2); ctx.fill();
  }
  for (let i = 0; i < 16; i++) {
    const x = 20 + rand(i + 20) * 470;
    ctx.strokeStyle = `rgba(48,29,24,${0.06 + rand(i) * 0.08})`;
    ctx.lineWidth = 1 + rand(i + 2) * 2;
    ctx.beginPath(); ctx.moveTo(x, 0);
    ctx.bezierCurveTo(x + (rand(i + 5) - .5) * 20, 170, x + (rand(i + 8) - .5) * 26, 340, x, 512);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 1);
  return tex;
}

function createGate(): { group: THREE.Group; opening: THREE.Vector3 } {
  const group = new THREE.Group();
  const plaster = new THREE.MeshStandardMaterial({ color: 0x984a3e, roughness: 0.97, side: THREE.DoubleSide });
  const darkPlaster = new THREE.MeshStandardMaterial({ color: 0x6e3b33, roughness: 1, side: THREE.DoubleSide });
  const trim = new THREE.MeshStandardMaterial({ color: 0x4b2620, roughness: 0.82 });
  const wood = new THREE.MeshStandardMaterial({ color: 0x2b1c16, roughness: 0.94 });
  const stone = new THREE.MeshStandardMaterial({ color: 0x77705d, roughness: 1, flatShading: true });

  // Broad weathered wall with a tall central arch.
  const shape = new THREE.Shape();
  shape.moveTo(-8.4, 0);
  shape.lineTo(8.4, 0);
  shape.lineTo(8.4, 8.2);
  shape.lineTo(-8.4, 8.2);
  shape.closePath();
  const hole = new THREE.Path();
  hole.moveTo(-2.2, 0);
  hole.lineTo(-2.2, 3.9);
  hole.absarc(0, 3.9, 2.2, Math.PI, 0, true);
  hole.lineTo(2.2, 0);
  hole.closePath();
  shape.holes.push(hole);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 1.35, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.07, bevelSegments: 2, curveSegments: 28 });
  const facade = new THREE.Mesh(geo, plaster);
  facade.castShadow = true;
  facade.receiveShadow = true;
  facade.position.z = -0.675;
  group.add(facade);

  // Two shallow blind arches flank the entrance.
  for (const side of [-1, 1]) {
    const nicheShape = new THREE.Shape();
    nicheShape.moveTo(-0.58, 0);
    nicheShape.lineTo(-0.58, 1.25);
    nicheShape.absarc(0, 1.25, 0.58, Math.PI, 0, true);
    nicheShape.lineTo(0.58, 0);
    nicheShape.closePath();
    const niche = new THREE.Mesh(new THREE.ShapeGeometry(nicheShape, 18), darkPlaster);
    niche.position.set(side * 5.25, 1.35, -0.8);
    group.add(niche);
    const archRim = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.055, 5, 18, Math.PI), new THREE.MeshStandardMaterial({ color: 0x8a4a3e, roughness: 0.95 }));
    archRim.position.set(side * 5.25, 2.6, -0.82);
    group.add(archRim);
    for (const sx of [-1, 1]) {
      const rimSide = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.3, 0.08), new THREE.MeshStandardMaterial({ color: 0x8a4a3e, roughness: 0.95 }));
      rimSide.position.set(side * 5.25 + sx * 0.65, 1.95, -0.82);
      group.add(rimSide);
    }
    // subtle weathered pilasters
    const pilaster = new THREE.Mesh(new THREE.BoxGeometry(0.32, 8.2, 0.22), darkPlaster);
    pilaster.position.set(side * 8.0, 4.1, -0.76);
    group.add(pilaster);
  }

  // Top beam, tile cap and the dark timber rail visible above the wall.
  const topTrim = new THREE.Mesh(new THREE.BoxGeometry(17.6, 0.42, 2.0), trim);
  topTrim.position.set(0, 8.3, 0);
  topTrim.castShadow = true;
  group.add(topTrim);
  const topTile = new THREE.Mesh(new THREE.BoxGeometry(18.2, 0.18, 2.35), new THREE.MeshStandardMaterial({ color: 0x343833, roughness: 0.9 }));
  topTile.position.set(0, 8.58, 0);
  group.add(topTile);
  const upperFence = new THREE.Group();
  for (let x = -7.4; x <= 7.4; x += 1.85) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.05, 0.18), wood);
    post.position.set(x, 9.12, 0.1);
    upperFence.add(post);
  }
  for (const y of [9.52, 8.82]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(16.0, 0.12, 0.16), wood);
    rail.position.set(0, y, 0.1);
    upperFence.add(rail);
  }
  const upperRoof = new THREE.Mesh(new THREE.BoxGeometry(17.2, 0.25, 1.4), new THREE.MeshStandardMaterial({ color: 0x1f2923, roughness: 0.9 }));
  upperRoof.position.set(0, 9.9, 0.4);
  upperFence.add(upperRoof);
  group.add(upperFence);

  // a shallow dark tunnel recess behind the arch, so the opening has depth
  const recessMat = new THREE.MeshStandardMaterial({
    color: 0x2e2923,
    roughness: 1,
    side: THREE.BackSide,
    map: brickTexture('#4b4136'),
  });
  const recess = new THREE.Mesh(new THREE.CylinderGeometry(2.86, 2.86, 9, 32, 1, true), recessMat);
  recess.rotation.x = Math.PI / 2;
  recess.position.set(0, 2.0, 4.8);
  group.add(recess);
  const recessFloor = new THREE.Mesh(
    new THREE.BoxGeometry(6.6, 0.16, 9.5),
    new THREE.MeshStandardMaterial({ color: 0x453d31, roughness: 1 }),
  );
  recessFloor.position.set(0, -0.03, 4.75);
  group.add(recessFloor);
  const threshold = new THREE.Mesh(
    new THREE.BoxGeometry(5.0, 0.2, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x716452, roughness: 0.96 }),
  );
  threshold.position.set(0, 0.09, 0.25);
  group.add(threshold);
  for (let i = 0; i < 3; i++) {
    const arch = new THREE.Mesh(new THREE.TorusGeometry(2.75, 0.075, 5, 24, Math.PI), new THREE.MeshStandardMaterial({ color: 0x2c261f, roughness: 1 }));
    arch.position.set(0, 2.0, 2.2 + i * 2.4);
    group.add(arch);
  }
  const recessCap = new THREE.Mesh(
    new THREE.CircleGeometry(2.86, 40),
    new THREE.MeshBasicMaterial({ color: 0x0a0907, side: THREE.DoubleSide, fog: false }),
  );
  recessCap.position.set(0, 2.0, 9.15);
  group.add(recessCap);
  const recessGlow = new THREE.Mesh(
    new THREE.CircleGeometry(1.15, 28),
    new THREE.MeshBasicMaterial({ color: 0x8e7b53, transparent: true, opacity: 0.12, side: THREE.DoubleSide, fog: false }),
  );
  recessGlow.position.set(0, 1.8, 9.08);
  group.add(recessGlow);
  const recessLight = new THREE.PointLight(0xc7a76d, 1.8, 8, 2);
  recessLight.position.set(0, 2.1, 6.4);
  group.add(recessLight);

  // irregular stones at the wall shoulders
  for (const side of [-1, 1]) {
    const boulder = new THREE.Mesh(new THREE.DodecahedronGeometry(2.2, 0), stone);
    boulder.position.set(side * 9.1, 1.0, -0.9);
    boulder.scale.set(1.35, 0.7, 1.0);
    boulder.rotation.set(rand(side + 2) * 0.6, rand(side + 5) * 2, rand(side + 8) * 0.4);
    boulder.castShadow = true;
    boulder.receiveShadow = true;
    group.add(boulder);
  }
  // round stone marker in front of the entry
  const marker = new THREE.Mesh(new THREE.DodecahedronGeometry(0.34, 1), stone);
  marker.position.set(0, 0.32, -4.2);
  marker.scale.set(0.9, 1.05, 0.9);
  marker.castShadow = true;
  group.add(marker);

  return { group, opening: new THREE.Vector3(0, 0, 1.5) };
}
function createHuman(kind: 'dad' | 'mom'): THREE.Group {
  const group = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({ color: kind === 'dad' ? 0xd8b99a : 0xe4c6ab, roughness: 0.82 });
  const topColor = kind === 'dad' ? 0x3f4b43 : 0xa26059;
  const bottomColor = kind === 'dad' ? 0x323c36 : 0x5d4a48;
  const hairColor = kind === 'dad' ? 0x2b241f : 0x3b2b25;
  const top = new THREE.MeshStandardMaterial({ color: topColor, roughness: 0.88 });
  const bottom = new THREE.MeshStandardMaterial({ color: bottomColor, roughness: 0.9 });
  const hair = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.95 });
  const shoe = new THREE.MeshStandardMaterial({ color: 0x252521, roughness: 0.8 });

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.27, 0.53, 6, 12), top);
  torso.position.y = 1.08;
  torso.scale.z = 0.8;
  torso.castShadow = true;
  group.add(torso);

  for (const x of [-0.17, 0.17]) {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.5, 5, 8), bottom);
    leg.position.set(x, 0.44, 0);
    leg.castShadow = true;
    group.add(leg);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.32), shoe);
    foot.position.set(x, 0.09, 0.06);
    group.add(foot);
  }
  const hips = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.22, 0.3), bottom);
  hips.position.y = 0.78;
  group.add(hips);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.13, 10), skin);
  neck.position.y = 1.51;
  group.add(neck);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.205, 18, 16), skin);
  head.position.y = 1.69;
  head.scale.set(0.9, 1.02, 0.9);
  head.castShadow = true;
  group.add(head);
  const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.212, 18, 16, 0, TAU, 0, Math.PI * 0.58), hair);
  hairCap.position.y = 1.7;
  hairCap.scale.set(0.93, 1.02, 0.95);
  group.add(hairCap);
  if (kind === 'mom') {
    const bun = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), hair);
    bun.position.set(0, 1.74, -0.18);
    group.add(bun);
  }
  for (const x of [-0.17, 0.17]) {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.5, 4, 8), skin);
    arm.position.set(x * 1.72, 1.09, 0);
    arm.rotation.z = x > 0 ? -0.14 : 0.14;
    arm.castShadow = true;
    group.add(arm);
  }
  for (const x of [-0.07, 0.07]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 6), new THREE.MeshBasicMaterial({ color: 0x2c211b }));
    eye.position.set(x, 1.7, 0.185);
    group.add(eye);
  }
  // mouth
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.008, 0.01), new THREE.MeshBasicMaterial({ color: 0x8a5d51 }));
  mouth.position.set(0, 1.62, 0.195);
  group.add(mouth);
  group.rotation.y = -Math.PI / 2;
  return group;
}

function createPig(withClothes: boolean, clothedColor = 0x6d5543): THREE.Group {
  const group = new THREE.Group();
  const pigMat = new THREE.MeshStandardMaterial({ color: 0xd39a8d, roughness: 0.88 });
  const shadeMat = new THREE.MeshStandardMaterial({ color: 0xb97a75, roughness: 0.9 });
  const hoofMat = new THREE.MeshStandardMaterial({ color: 0x3b2b27, roughness: 0.82 });
  const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf0e6d8, roughness: 0.55 });
  const pupilMat = new THREE.MeshBasicMaterial({ color: 0x211816 });
  const clothMat = new THREE.MeshStandardMaterial({ color: clothedColor, roughness: 0.94, side: THREE.DoubleSide });
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x4a2e20, roughness: 0.9 });

  const shadowed = (mesh: THREE.Mesh): THREE.Mesh => {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  };

  // The stool belongs to the pig so the seated pose remains readable after
  // the human parents (and their own stools) disappear.
  const stoolSeat = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.07, 0.62), woodMat));
  stoolSeat.position.set(0, -0.035, -0.02);
  group.add(stoolSeat);
  for (const x of [-0.31, 0.31]) {
    for (const z of [-0.24, 0.2]) {
      const leg = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.38, 0.065), woodMat));
      leg.position.set(x, -0.26, z);
      group.add(leg);
    }
  }

  // Folded hind legs hanging over the front edge of the stool.
  for (const side of [-1, 1]) {
    const thigh = shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 10), pigMat));
    thigh.scale.set(0.9, 0.8, 1.3);
    thigh.position.set(side * 0.19, 0.1, 0.12);
    thigh.rotation.x = -0.32;
    group.add(thigh);
    const shin = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.085, 0.28, 10), shadeMat));
    shin.position.set(side * 0.19, -0.08, 0.27);
    shin.rotation.x = 0.16;
    group.add(shin);
    const hoof = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.085, 0.16), hoofMat));
    hoof.position.set(side * 0.19, -0.23, 0.3);
    group.add(hoof);
    for (const toeX of [-0.032, 0.032]) {
      const toe = shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.036, 8, 6), shadeMat));
      toe.scale.set(1, 0.72, 1.05);
      toe.position.set(side * 0.19 + toeX, -0.225, 0.39);
      group.add(toe);
    }
  }

  const hips = shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.31, 18, 12), pigMat));
  hips.scale.set(1.0, 0.72, 0.9);
  hips.position.set(0, 0.11, -0.02);
  group.add(hips);

  const belly = shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.35, 20, 14), pigMat));
  belly.scale.set(0.96, 1.0, 0.82);
  belly.position.set(0, 0.34, 0.02);
  group.add(belly);

  // Neck and head.
  const neck = shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 10), pigMat));
  neck.scale.set(1, 0.85, 0.85);
  neck.position.set(0, 0.64, 0.05);
  group.add(neck);
  const head = shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.25, 22, 16), pigMat));
  head.scale.set(0.98, 0.9, 0.92);
  head.position.set(0, 0.86, 0.09);
  group.add(head);
  const cheekL = shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 8), shadeMat));
  cheekL.position.set(-0.15, 0.8, 0.22);
  cheekL.scale.set(0.8, 0.75, 0.7);
  group.add(cheekL);
  const cheekR = cheekL.clone();
  cheekR.position.x = 0.15;
  group.add(cheekR);

  // Snout, nostrils and a small mouth.
  const snout = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.125, 0.15, 0.16, 16), shadeMat));
  snout.rotation.x = Math.PI / 2;
  snout.position.set(0, 0.8, 0.32);
  group.add(snout);
  const snoutDisc = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.105, 0.035, 16), pigMat));
  snoutDisc.rotation.x = Math.PI / 2;
  snoutDisc.position.set(0, 0.8, 0.405);
  group.add(snoutDisc);
  for (const x of [-0.043, 0.043]) {
    const nostril = new THREE.Mesh(new THREE.CircleGeometry(0.018, 10), new THREE.MeshBasicMaterial({ color: 0x68433e }));
    nostril.position.set(x, 0.8, 0.425);
    group.add(nostril);
  }
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.014, 0.018), new THREE.MeshBasicMaterial({ color: 0x70443d }));
  mouth.position.set(0, 0.71, 0.405);
  group.add(mouth);

  // Eyes with highlights.
  for (const side of [-1, 1]) {
    const eye = shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 10), eyeWhiteMat));
    eye.scale.set(1, 1.15, 0.62);
    eye.position.set(side * 0.105, 0.91, 0.245);
    group.add(eye);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 8), pupilMat);
    pupil.scale.z = 0.5;
    pupil.position.set(side * 0.1, 0.91, 0.278);
    group.add(pupil);
    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.007, 6, 5), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    glint.position.set(side * 0.093, 0.923, 0.296);
    group.add(glint);
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.015, 0.025), shadeMat);
    brow.position.set(side * 0.105, 0.966, 0.24);
    brow.rotation.z = side * -0.12;
    group.add(brow);
    const ear = shadowed(new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.18, 5), pigMat));
    ear.position.set(side * 0.17, 1.06, 0.05);
    ear.rotation.z = side * 0.28;
    ear.rotation.x = -0.16;
    group.add(ear);
    const innerEar = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.12, 5), shadeMat);
    innerEar.position.set(side * 0.17, 1.055, 0.065);
    innerEar.rotation.z = side * 0.28;
    group.add(innerEar);
  }

  // Front legs / arms resting forward.
  for (const side of [-1, 1]) {
    const upper = shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 10), pigMat));
    upper.scale.set(1, 1.65, 1);
    upper.position.set(side * 0.27, 0.53, 0.08);
    upper.rotation.z = side * -0.16;
    group.add(upper);
    const forearm = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.078, 0.26, 10), shadeMat));
    forearm.rotation.x = Math.PI / 2 - 0.18;
    forearm.position.set(side * 0.26, 0.42, 0.24);
    group.add(forearm);
    const hoof = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.15), hoofMat));
    hoof.position.set(side * 0.25, 0.37, 0.37);
    group.add(hoof);
    for (const toeX of [-0.026, 0.026]) {
      const toe = shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 6), shadeMat));
      toe.position.set(side * 0.25 + toeX, 0.365, 0.45);
      group.add(toe);
    }
  }

  if (withClothes) {
    // Shirt / cardigan over the upper belly.
    const shirt = shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.34, 22, 16), clothMat));
    shirt.scale.set(0.94, 0.72, 0.79);
    shirt.position.set(0, 0.47, 0.01);
    group.add(shirt);
    const hem = shadowed(new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.035, 8, 22), clothMat));
    hem.rotation.x = Math.PI / 2;
    hem.position.set(0, 0.25, 0.01);
    group.add(hem);
    // V collar.
    for (const side of [-1, 1]) {
      const collar = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.19, 0.04), clothMat);
      collar.position.set(side * 0.095, 0.62, 0.235);
      collar.rotation.z = side * -0.5;
      group.add(collar);
    }
    for (let i = 0; i < 3; i++) {
      const button = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), new THREE.MeshStandardMaterial({ color: 0x2f2922, roughness: 0.5 }));
      button.position.set(0, 0.48 - i * 0.085, 0.285);
      group.add(button);
    }
    for (const side of [-1, 1]) {
      const sleeve = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.085, 0.15, 12), clothMat));
      sleeve.position.set(side * 0.275, 0.6, 0.08);
      sleeve.rotation.z = side * -0.12;
      group.add(sleeve);
      const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.018, 6, 12), clothMat);
      cuff.position.set(side * 0.26, 0.5, 0.08);
      cuff.rotation.x = Math.PI / 2;
      group.add(cuff);
    }
  }

  // Curly tail at the back of the stool.
  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.35, -0.28),
    new THREE.Vector3(-0.12, 0.41, -0.37),
    new THREE.Vector3(-0.16, 0.51, -0.32),
    new THREE.Vector3(-0.08, 0.56, -0.25),
    new THREE.Vector3(-0.02, 0.49, -0.28),
  ]);
  const tail = new THREE.Mesh(new THREE.TubeGeometry(tailCurve, 18, 0.024, 6, false), shadeMat);
  tail.castShadow = true;
  group.add(tail);

  return group;
}

function createRibbon(points: THREE.Vector3[], width: number, material: THREE.Material): THREE.Mesh {
  const curve = new THREE.CatmullRomCurve3(points);
  const segments = 140;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i <= segments; i++) {
    const u = i / segments;
    const p = curve.getPoint(u);
    const tangent = curve.getTangent(u).normalize();
    const side = new THREE.Vector3().crossVectors(up, tangent).normalize();
    const wobble = Math.sin(u * 43) * 0.08 + Math.sin(u * 91) * 0.04;
    const half = width * (0.9 + Math.sin(u * 17) * 0.08) * 0.5;
    for (const s of [-1, 1]) {
      positions.push(p.x + side.x * half * s, p.y + 0.032 + wobble * s, p.z + side.z * half * s);
      uvs.push(0.5 + 0.5 * s, u * 28);
    }
    if (i < segments) {
      const n = i * 2;
      indices.push(n, n + 2, n + 1, n + 1, n + 2, n + 3);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, material);
  mesh.receiveShadow = true;
  return mesh;
}

function createField(): {
  group: THREE.Group;
  path: THREE.CatmullRomCurve3;
  gate: THREE.Group;
  parents: THREE.Group[];
  car: THREE.Group;
  playerStart: THREE.Vector3;
  gateTrigger: THREE.Vector3;
  heightAt: (x: number, z: number) => number;
} {
  const group = new THREE.Group();
  const sunDir = new THREE.Vector3(0.58, 0.42, -0.7);
  group.add(makeSky('#79a8b4', '#e8d8b6', '#d9c396', '#ffe6b0', sunDir));
  group.add(sunSprite(sunDir, 32, 0.88));

  const hemi = new THREE.HemisphereLight(0xd8e9e6, 0x687b53, 2.15);
  group.add(hemi);
  const sun = new THREE.DirectionalLight(0xffe8c4, 3.9);
  sun.position.set(18, 26, -14);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -28;
  sun.shadow.camera.right = 28;
  sun.shadow.camera.top = 30;
  sun.shadow.camera.bottom = -18;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 80;
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.03;
  group.add(sun);
  group.add(sun.target);

  // ground
  const groundGeo = new THREE.PlaneGeometry(150, 150, 90, 90);
  groundGeo.rotateX(-Math.PI / 2);
  const pos = groundGeo.attributes.position as THREE.BufferAttribute;
  const colors: number[] = [];
  const cA = new THREE.Color('#839a6a');
  const cB = new THREE.Color('#9aac7b');
  const cC = new THREE.Color('#6d825c');
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const dist = Math.hypot(x, z - 12);
    const roll = Math.max(0, dist - 28) * 0.025;
    const h = (Math.sin(x * 0.29) * Math.cos(z * 0.21) + 0.5 * Math.sin(x * 0.11 + z * 0.17)) * 0.16;
    pos.setY(i, h * Math.min(1, dist / 30) + roll * (0.4 + rand(i) * 0.3));
    const n = Math.sin(x * 0.21 + z * 0.16) * 0.5 + 0.5;
    const c = cA.clone().lerp(cB, n * 0.65).lerp(cC, rand(i + 3) * 0.28);
    colors.push(c.r, c.g, c.b);
  }
  groundGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  groundGeo.computeVertexNormals();
  const ground = new THREE.Mesh(
    groundGeo,
    new THREE.MeshStandardMaterial({ vertexColors: true, map: noiseTexture(), roughness: 0.96, metalness: 0 }),
  );
  ground.receiveShadow = true;
  group.add(ground);

  // path
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.4, 0, -4),
    new THREE.Vector3(-1.2, 0, 0),
    new THREE.Vector3(-0.4, 0, 4),
    new THREE.Vector3(0.4, 0, 9),
    new THREE.Vector3(1.1, 0, 14),
    new THREE.Vector3(1.7, 0, 19),
    new THREE.Vector3(2, 0, 24),
    new THREE.Vector3(2, 0, 27),
  ]);
  const pathMat = new THREE.MeshStandardMaterial({
    color: 0xa9946c,
    map: (() => {
      const c = document.createElement('canvas');
      c.width = 256;
      c.height = 256;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#a89470';
      ctx.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 480; i++) {
        const g = 100 + rand(i + 2) * 64;
        ctx.fillStyle = `rgba(${g + 20},${g + 10},${g - 16},${0.08 + rand(i + 3) * 0.2})`;
        ctx.beginPath();
        ctx.ellipse(rand(i + 5) * 256, rand(i + 7) * 256, 1 + rand(i) * 7, 1 + rand(i + 1) * 3, rand(i) * 3, 0, TAU);
        ctx.fill();
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(1, 9);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    })(),
    roughness: 1,
  });
  const pathMesh = createRibbon(
    Array.from({ length: 18 }, (_, i) => path.getPoint(i / 17)),
    3.2,
    pathMat,
  );
  group.add(pathMesh);

  // path stones
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x8d8874, roughness: 1, flatShading: true });
  for (let i = 0; i < 80; i++) {
    const u = rand(i + 11);
    const p = path.getPoint(u);
    const tangent = path.getTangent(u);
    const side = new THREE.Vector3(-tangent.z, 0, tangent.x);
    const offset = (rand(i + 3) - 0.5) * 4.8;
    const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.08 + rand(i + 5) * 0.12, 0), stoneMat);
    stone.position.set(p.x + side.x * offset, 0.035, p.z + side.z * offset);
    stone.rotation.set(rand(i) * 3, rand(i + 2) * 3, rand(i + 4) * 3);
    stone.scale.y = 0.45;
    group.add(stone);
  }

  // grass instancing
  const bladeGeo = new THREE.ConeGeometry(0.055, 0.34, 3);
  bladeGeo.translate(0, 0.17, 0);
  const bladeMat = new THREE.MeshBasicMaterial({ color: 0x91a872 });
  const grass = new THREE.InstancedMesh(bladeGeo, bladeMat, 1500);
  const dummy = new THREE.Object3D();
  const grassColors = [new THREE.Color('#88a068'), new THREE.Color('#9bb579'), new THREE.Color('#78915e'), new THREE.Color('#a9ba81')];
  for (let i = 0; i < 1500; i++) {
    let x = (rand(i + 4) - 0.5) * 80;
    let z = (rand(i + 9) - 0.5) * 90 + 12;
    const p = path.getPoint(Math.max(0.01, Math.min(0.99, (z + 4) / 31)));
    if (Math.abs(x - p.x) < 2.0 && z > -6 && z < 28) {
      x += x > p.x ? 2.8 : -2.8;
    }
    dummy.position.set(x, 0.01, z);
    dummy.rotation.set(0, rand(i + 4) * TAU, (rand(i + 3) - 0.5) * 0.3);
    dummy.scale.set(0.75 + rand(i + 8) * 0.6, 0.65 + rand(i + 6) * 0.85, 0.75 + rand(i + 8) * 0.6);
    dummy.updateMatrix();
    grass.setMatrixAt(i, dummy.matrix);
    grass.setColorAt(i, grassColors[Math.floor(rand(i + 2) * grassColors.length)]);
  }
  grass.instanceMatrix.needsUpdate = true;
  if (grass.instanceColor) grass.instanceColor.needsUpdate = true;
  grass.receiveShadow = true;
  group.add(grass);

  // flowers
  const flowerGeo = new THREE.SphereGeometry(0.035, 5, 4);
  const flowerMat = new THREE.MeshStandardMaterial({ color: 0xe6d38a, emissive: 0x6f5b2f, emissiveIntensity: 0.2, roughness: 0.8 });
  const flowers = new THREE.InstancedMesh(flowerGeo, flowerMat, 90);
  for (let i = 0; i < 90; i++) {
    const x = (rand(i + 31) - 0.5) * 55;
    const z = (rand(i + 37) - 0.5) * 60 + 12;
    dummy.position.set(x, 0.27, z);
    dummy.scale.setScalar(0.6 + rand(i + 2) * 0.8);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    flowers.setMatrixAt(i, dummy.matrix);
  }
  group.add(flowers);

  // trees and shrubs
  for (let i = 0; i < 18; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const treeGroup = createTree(i + 2, i % 4 === 0 ? 0x38513f : 0x456047);
    treeGroup.position.set(side * (8 + rand(i + 5) * 12), 0, 3 + rand(i + 7) * 26);
    group.add(treeGroup);
  }
  const bushMat = new THREE.MeshStandardMaterial({ color: 0x4d6348, roughness: 1, flatShading: true });
  for (let i = 0; i < 24; i++) {
    const bush = new THREE.Mesh(new THREE.IcosahedronGeometry(0.6 + rand(i) * 0.8, 0), bushMat);
    bush.position.set((rand(i + 13) - 0.5) * 34, 0.35, 1 + rand(i + 17) * 30);
    bush.scale.y = 0.55;
    bush.castShadow = true;
    group.add(bush);
  }

  // distant hills
  const hillMat1 = new THREE.MeshBasicMaterial({ color: 0x718778, fog: true });
  const hillMat2 = new THREE.MeshBasicMaterial({ color: 0x5f776b, fog: true });
  for (let i = 0; i < 18; i++) {
    const geo = new THREE.SphereGeometry(1, 7, 4);
    const hill = new THREE.Mesh(geo, i % 2 === 0 ? hillMat1 : hillMat2);
    const a = (i / 18) * Math.PI * 2;
    hill.position.set(Math.sin(a) * 102, -9 - rand(i + 5) * 5, 12 + Math.cos(a) * 96);
    hill.scale.set(30 + rand(i + 2) * 22, 13 + rand(i + 5) * 9, 22 + rand(i + 7) * 16);
    hill.rotation.y = rand(i) * 2;
    group.add(hill);
  }

  // clouds
  group.add(cloudCluster(-30, 23, -45, 8, 0xf1e6c9, 0.55));
  group.add(cloudCluster(25, 28, -58, 10, 0xf4e6c5, 0.45));
  group.add(cloudCluster(6, 32, -85, 13, 0xece0c9, 0.33));

  // car, gate, parents
  const car = createCar();
  car.position.set(-4.3, 0, -0.4);
  car.rotation.y = -0.34;
  group.add(car);

  const gate = createGate();
  gate.group.position.set(2, 0, 24);
  group.add(gate.group);

  // one guardian statue beside the tunnel mouth, before entering the tunnel
  const tunnelStatueTexture = new THREE.TextureLoader().load('images/meadow_statue.png');
  tunnelStatueTexture.colorSpace = THREE.SRGBColorSpace;
  const tunnelStatue = new THREE.Sprite(new THREE.SpriteMaterial({
    map: tunnelStatueTexture,
    transparent: true,
    alphaTest: 0.03,
    depthWrite: false,
    toneMapped: false,
  }));
  const tunnelStatueHeight = 1.85;
  tunnelStatue.scale.set(tunnelStatueHeight * (218 / 312), tunnelStatueHeight, 1);
  tunnelStatue.position.set(-1.7, 0.0, 20.4);

  const fieldHeightAt = (x: number, z: number): number => {
    const t = THREE.MathUtils.clamp((z + 4) / 31, 0, 1);
    const onPath = path.getPoint(t);
    const pathDistance = Math.hypot(x - onPath.x, z - onPath.z);
    const pathY = onPath.y + 0.048;
    const fromCenter = Math.hypot(x, z - 12);
    const roll = Math.max(0, fromCenter - 28) * 0.025;
    const h = (Math.sin(x * 0.29) * Math.cos(z * 0.21) + 0.5 * Math.sin(x * 0.11 + z * 0.17)) * 0.16;
    const groundY = h * Math.min(1, fromCenter / 30) + roll * 0.5;
    return pathDistance < 1.7 ? Math.max(pathY, groundY + 0.006) : groundY + 0.025;
  };
  tunnelStatue.position.y = fieldHeightAt(-1.7, 20.4) + tunnelStatueHeight / 2 - 0.04;
  group.add(tunnelStatue);

  // winding mountain road continuing behind the opening position
  const mountainRoadPoints: THREE.Vector3[] = [
    [-1.25, -2.5], [1.4, -7.5], [4.4, -13.5], [3.3, -20.0],
    [-0.8, -26.5], [-4.6, -33.5], [-2.4, -41.0], [2.2, -48.0],
    [1.0, -56.0], [-3.5, -63.0],
  ].map(([x, z]) => new THREE.Vector3(x, fieldHeightAt(x, z) + 0.045, z));
  const mountainCurve = new THREE.CatmullRomCurve3(mountainRoadPoints);
  const roadShoulderMat = new THREE.MeshStandardMaterial({ color: 0x6f644e, roughness: 1 });
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x9b8766, roughness: 0.98 });
  const roadShoulder = createRibbon(
    mountainRoadPoints.map((p) => new THREE.Vector3(p.x, p.y - 0.025, p.z)),
    4.2,
    roadShoulderMat,
  );
  group.add(roadShoulder);
  const mountainRoad = createRibbon(mountainRoadPoints, 3.15, roadMat);
  mountainRoad.renderOrder = 1;
  group.add(mountainRoad);
  // wooden guard posts and rails along both edges
  const railWood = new THREE.MeshStandardMaterial({ color: 0x4a3324, roughness: 0.96 });
  const railSamples = 26;
  for (const sideSign of [-1, 1]) {
    for (let i = 0; i <= railSamples; i++) {
      const t = i / railSamples;
      const p = mountainCurve.getPoint(t);
      const tan = mountainCurve.getTangent(t);
      const side = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.065, 0.72, 6), railWood);
      post.position.set(p.x + side.x * 1.62 * sideSign, p.y + 0.36, p.z + side.z * 1.62 * sideSign);
      group.add(post);
    }
    for (let i = 0; i < railSamples; i++) {
      const t0 = i / railSamples;
      const t1 = (i + 1) / railSamples;
      const p0 = mountainCurve.getPoint(t0);
      const p1 = mountainCurve.getPoint(t1);
      const tan = mountainCurve.getTangent((t0 + t1) / 2);
      const side = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
      const a = p0.clone().addScaledVector(side, 1.62 * sideSign);
      const b = p1.clone().addScaledVector(side, 1.62 * sideSign);
      const len = Math.hypot(b.x - a.x, b.z - a.z);
      if (len < 0.01) continue;
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.08, len), railWood);
      rail.position.set((a.x + b.x) / 2, (a.y + b.y) / 2 + 0.57, (a.z + b.z) / 2);
      rail.rotation.y = Math.atan2(b.x - a.x, b.z - a.z);
      group.add(rail);
    }
  }
  // pines following the bends
  for (let i = 0; i < 14; i++) {
    const t = 0.06 + (i / 14) * 0.88;
    const p = mountainCurve.getPoint(t);
    const tan = mountainCurve.getTangent(t);
    const side = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
    const sign = i % 2 === 0 ? -1 : 1;
    const off = 4.4 + rand(i + 90) * 2.4;
    const x = p.x + side.x * off * sign;
    const z = p.z + side.z * off * sign;
    const tree = createTree(i + 120, sign < 0 ? 0x2f5038 : 0x3a5b3e);
    tree.position.set(x, fieldHeightAt(x, z), z);
    tree.scale.setScalar(0.9 + rand(i + 94) * 0.55);
    group.add(tree);
  }
  // low mountain shoulders framing the road
  const hillGreen = new THREE.MeshStandardMaterial({ color: 0x3f5d3d, roughness: 1, flatShading: true });
  for (const [x, z, sx, sy, sz] of [[-10.5, -18, 7, 4.2, 11], [11.8, -24, 8, 5, 12], [-12.0, -39, 9, 5.5, 13], [12.5, -48, 10, 6, 15]]) {
    const hill = new THREE.Mesh(new THREE.SphereGeometry(1, 9, 6), hillGreen);
    hill.position.set(x, -1.2, z);
    hill.scale.set(sx, sy, sz);
    hill.castShadow = true;
    hill.receiveShadow = true;
    group.add(hill);
  }

  // pale stone-slab approach in front of the tunnel mouth
  const pathStone = new THREE.MeshStandardMaterial({ color: 0x9a8e75, roughness: 0.98, flatShading: true });
  for (let i = 0; i < 27; i++) {
    const z = 4.2 + i * 0.75;
    const stoneSlab = new THREE.Mesh(new THREE.DodecahedronGeometry(0.62 + rand(i + 20) * 0.16, 0), pathStone);
    const pathX = -1.25 + ((z + 0.9) / 24.9) * 3.25;
    stoneSlab.position.set(pathX + (rand(i + 4) - .5) * 1.05, -0.02, z);
    stoneSlab.scale.set(1.45, 0.075, 0.92);
    stoneSlab.rotation.set(0, rand(i + 12) * 1.2, 0);
    stoneSlab.receiveShadow = true;
    group.add(stoneSlab);
  }
  // dense trees and shrubs framing the red wall
  const gateTrees: Array<[number, number, number, number]> = [
    [-6.0, 18.0, 1.25, 3], [-8.2, 23.0, 1.05, 7], [-5.4, 26.0, 0.9, 11],
    [10.0, 18.5, 1.2, 13], [12.0, 23.0, 1.0, 17], [9.4, 26.0, 0.92, 21],
  ];
  for (const [x, z, scale, seed] of gateTrees) {
    const tree = createTree(seed, seed % 2 ? 0x2f5038 : 0x385b3f);
    tree.position.set(x, 0, z);
    tree.scale.setScalar(scale);
    group.add(tree);
  }
  const shrubMat = new THREE.MeshStandardMaterial({ color: 0x31543a, roughness: 1, flatShading: true });
  for (let i = 0; i < 14; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const shrub = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5 + rand(i + 30) * 0.45, 0), shrubMat);
    shrub.position.set(2 + side * (4.5 + rand(i + 32) * 3.5), 0.25, 18 + rand(i + 34) * 8);
    shrub.scale.set(1.35, 0.7, 1.0);
    shrub.castShadow = true;
    group.add(shrub);
  }

  const dad = createHuman('dad');
  dad.position.set(0.1, 0, 1.6);
  dad.rotation.y = Math.PI * 0.1;
  group.add(dad);
  const mom = createHuman('mom');
  mom.position.set(0.75, 0, 2.15);
  mom.rotation.y = Math.PI * 0.1;
  group.add(mom);

  // a few paper scraps in the grass
  const paperMat = new THREE.MeshStandardMaterial({ color: 0xd4c7a9, roughness: 1, side: THREE.DoubleSide });
  for (let i = 0; i < 6; i++) {
    const paper = new THREE.Mesh(new THREE.PlaneGeometry(0.16 + rand(i) * 0.12, 0.1), paperMat);
    paper.rotation.set(-Math.PI / 2 + rand(i) * 0.1, rand(i + 2) * 3, 0);
    paper.position.set((rand(i + 4) - 0.5) * 10, 0.04, -1 + rand(i + 6) * 18);
    group.add(paper);
  }

  // dust motes
  const particleCount = 190;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (rand(i + 3) - 0.5) * 32;
    positions[i * 3 + 1] = 0.4 + rand(i + 6) * 6;
    positions[i * 3 + 2] = -5 + rand(i + 9) * 34;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const dustMat = new THREE.PointsMaterial({
    color: 0xffe5b6,
    size: 0.055,
    map: makeGlowTexture(),
    transparent: true,
    opacity: 0.44,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  group.add(dust);

  return {
    group,
    path,
    gate: gate.group,
    parents: [dad, mom],
    car,
    playerStart: new THREE.Vector3(-1.25, fieldHeightAt(-1.25, -0.9) + 0.01, -0.9),
    gateTrigger: new THREE.Vector3(1.1, 0, 20.2),
    heightAt: fieldHeightAt,
  };
}

export interface FieldWorld {
  group: THREE.Group;
  path: THREE.CatmullRomCurve3;
  gate: THREE.Group;
  parents: THREE.Group[];
  car: THREE.Group;
  playerStart: THREE.Vector3;
  gateTrigger: THREE.Vector3;
  heightAt: (x: number, z: number) => number;
}

export function buildFieldWorld(): FieldWorld {
  return createField();
}

export interface TunnelWorld {
  group: THREE.Group;
  playerStart: THREE.Vector3;
  exitTrigger: THREE.Vector3;
  midpointTrigger: THREE.Vector3;
  dust: THREE.Points;
}

export function buildTunnelWorld(): TunnelWorld {
  const group = new THREE.Group();
  const ambient = new THREE.HemisphereLight(0x6e7a68, 0x25231c, 0.72);
  group.add(ambient);

  const brickMat = new THREE.MeshStandardMaterial({
    map: brickTexture('#5d4c3c'),
    color: 0x9c8468,
    roughness: 0.98,
    side: THREE.BackSide,
  });
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(3.55, 3.55, 32, 36, 1, true), brickMat);
  tube.rotation.x = Math.PI / 2;
  tube.position.set(0, 2.85, 16);
  tube.receiveShadow = true;
  group.add(tube);

  const floorMat = new THREE.MeshStandardMaterial({
    map: (() => {
      const tex = cobbleTexture();
      tex.repeat.set(2, 10);
      return tex;
    })(),
    color: 0x6e6555,
    roughness: 1,
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(7.1, 32), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, 16);
  floor.receiveShadow = true;
  group.add(floor);

  // stone ribs
  const ribMat = new THREE.MeshStandardMaterial({ color: 0x6b5f4c, roughness: 1, flatShading: true });
  for (let i = 0; i < 9; i++) {
    const z = 1 + i * 4;
    const rib = new THREE.Mesh(new THREE.TorusGeometry(3.42, 0.1, 6, 30, Math.PI), ribMat);
    rib.position.set(0, 2.78, z);
    group.add(rib);
    for (const side of [-1, 1]) {
      const pier = new THREE.Mesh(new THREE.BoxGeometry(0.28, 2.8, 0.34), ribMat);
      pier.position.set(side * 3.35, 1.4, z);
      pier.castShadow = true;
      group.add(pier);
    }
  }

  // lamps
  for (let i = 0; i < 5; i++) {
    const z = 4 + i * 6;
    const side = i % 2 === 0 ? -1 : 1;
    const bracket = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.08, 0.55),
      new THREE.MeshStandardMaterial({ color: 0x28231d, roughness: 0.9 }),
    );
    bracket.position.set(side * 2.9, 2.4, z);
    group.add(bracket);
    const lampMat = new THREE.MeshStandardMaterial({
      color: 0xf3c67c,
      emissive: 0xffae53,
      emissiveIntensity: 2.2,
      roughness: 0.4,
    });
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), lampMat);
    lamp.position.set(side * 3.0, 2.3, z);
    group.add(lamp);
    const glowMat = new THREE.SpriteMaterial({
      map: makeGlowTexture(),
      color: 0xffc373,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const glow = new THREE.Sprite(glowMat);
    glow.position.copy(lamp.position);
    glow.scale.setScalar(1.6);
    group.add(glow);
    if (i > 0 && i < 4) {
      const point = new THREE.PointLight(0xffb566, 8, 11, 2);
      point.position.copy(lamp.position);
      group.add(point);
    }
  }

  // light at the end
  const endGlow = new THREE.Mesh(
    new THREE.CircleGeometry(3.38, 48),
    new THREE.MeshBasicMaterial({ color: 0xf8e8c3, transparent: true, opacity: 1, side: THREE.DoubleSide, fog: false }),
  );
  endGlow.position.set(0, 2.85, 31.72);
  group.add(endGlow);
  const endLight = new THREE.PointLight(0xffefc7, 25, 32, 2);
  endLight.position.set(0, 2.7, 28);
  group.add(endLight);
  const halo = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: makeGlowTexture(),
      color: 0xffeac2,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  halo.position.set(0, 2.4, 31.2);
  halo.scale.set(15, 15, 1);
  group.add(halo);

  // rubble, cracks, roots
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x554b3c, roughness: 1, flatShading: true });
  for (let i = 0; i < 22; i++) {
    const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.12 + rand(i) * 0.22, 0), stoneMat);
    stone.position.set((rand(i + 4) - 0.5) * 5.8, 0.07, 2 + rand(i + 7) * 27);
    stone.rotation.set(rand(i + 2) * 3, rand(i + 5) * 3, rand(i + 8) * 3);
    group.add(stone);
  }
  const rootMat = new THREE.MeshStandardMaterial({ color: 0x3d3e2d, roughness: 1 });
  for (let i = 0; i < 10; i++) {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3((rand(i) - 0.5) * 5, 6.1, 2 + rand(i + 2) * 10),
      new THREE.Vector3((rand(i + 4) - 0.5) * 5, 4.6, 2 + rand(i + 5) * 12),
      new THREE.Vector3((rand(i + 7) - 0.5) * 5, 3.1, 2 + rand(i + 8) * 14),
    ]);
    const root = new THREE.Mesh(new THREE.TubeGeometry(curve, 8, 0.025, 4, false), rootMat);
    group.add(root);
  }

  // dust
  const count = 260;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (rand(i + 3) - 0.5) * 6;
    positions[i * 3 + 1] = 0.3 + rand(i + 6) * 4.5;
    positions[i * 3 + 2] = rand(i + 9) * 30;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const dust = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({
      color: 0xe7d8b6,
      size: 0.035,
      map: makeGlowTexture(),
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  group.add(dust);

  return {
    group,
    playerStart: new THREE.Vector3(0, 0, 4.0),
    exitTrigger: new THREE.Vector3(0, 0, 27.5),
    midpointTrigger: new THREE.Vector3(0, 0, 12.5),
    dust,
  };
}

function createShop(
  side: number,
  z: number,
  width: number,
  height: number,
  palette: number,
  name: string,
  windowMat: THREE.MeshStandardMaterial,
): THREE.Group {
  const group = new THREE.Group();
  const wall = new THREE.MeshStandardMaterial({ color: palette, roughness: 0.94 });
  const wood = new THREE.MeshStandardMaterial({ map: woodTexture(), color: 0x9b7557, roughness: 0.92 });
  const darkWood = new THREE.MeshStandardMaterial({ color: 0x38281f, roughness: 0.92 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x2f3b37, roughness: 0.94, flatShading: true });
  const redCloth = new THREE.MeshStandardMaterial({ color: 0xa84236, roughness: 0.86 });
  const tealCloth = new THREE.MeshStandardMaterial({ color: 0x3d6b63, roughness: 0.86 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(5.4, height, width), wall);
  body.position.y = height / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // tiled roof and deep eave
  const roof = new THREE.Mesh(new THREE.ConeGeometry(width * 0.82, 2.2, 4), roofMat);
  roof.rotation.y = Math.PI / 4;
  roof.scale.z = 0.72;
  roof.position.y = height + 0.9;
  roof.castShadow = true;
  group.add(roof);
  const eave = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.16, width + 0.7), roofMat);
  eave.position.y = height + 0.04;
  group.add(eave);

  const frontX = side * -2.71;
  const face = new THREE.Group();
  face.position.x = frontX;
  face.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
  group.add(face);

  // ground floor
  const door = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 2.15), new THREE.MeshStandardMaterial({ color: 0x33251c, roughness: 0.9 }));
  door.position.set(0, 1.14, 0.012);
  face.add(door);
  for (const x of [-1.9, 1.9]) {
    const window = new THREE.Mesh(new THREE.PlaneGeometry(1.18, 1.05), windowMat);
    window.position.set(x, 2.18, 0.022);
    face.add(window);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.36, 1.24, 0.07), darkWood);
    frame.position.set(x, 2.18, -0.018);
    face.add(frame);
    for (let i = -1; i <= 1; i++) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.045, 1.05, 0.05), darkWood);
      bar.position.set(x + i * 0.35, 2.18, 0.052);
      face.add(bar);
    }
  }

  // awning / canopy over the shopfront
  const awning = new THREE.Mesh(
    new THREE.BoxGeometry(5.0, 0.09, 1.2),
    side > 0 ? tealCloth : redCloth,
  );
  awning.position.set(0, 3.18, 0.66);
  awning.rotation.x = -0.12;
  face.add(awning);
  const valance = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.46, 0.06), side > 0 ? tealCloth : redCloth);
  valance.position.set(0, 2.93, 1.24);
  face.add(valance);
  for (const x of [-2.35, -0.8, 0.8, 2.35]) {
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(0.075, 0.1, 1.18),
      side > 0 ? new THREE.MeshStandardMaterial({ color: 0xd9b277, roughness: 0.9 }) : new THREE.MeshStandardMaterial({ color: 0x1f4d49, roughness: 0.9 }),
    );
    stripe.position.set(x, 3.19, 0.66);
    stripe.rotation.x = -0.12;
    face.add(stripe);
  }

  // support columns and a narrow covered walkway
  for (const x of [-2.62, 2.62]) {
    const column = new THREE.Mesh(new THREE.BoxGeometry(0.16, 3.25, 0.16), darkWood);
    column.position.set(x, 1.62, 1.05);
    face.add(column);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.12, 0.32), new THREE.MeshStandardMaterial({ color: 0x5e5a4e, roughness: 1 }));
    foot.position.set(x, 0.06, 1.05);
    face.add(foot);
  }
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(5.45, 0.17, 0.2), darkWood);
  lintel.position.set(0, 3.36, 1.02);
  face.add(lintel);
  const walkway = new THREE.Mesh(new THREE.BoxGeometry(5.45, 0.08, 1.25), darkWood);
  walkway.position.set(0, 3.42, 0.82);
  face.add(walkway);

  // balcony and upper windows
  const balconyY = Math.max(3.5, height * 0.5);
  const balcony = new THREE.Mesh(new THREE.BoxGeometry(4.9, 0.13, 0.95), wood);
  balcony.position.set(0, balconyY, 0.48);
  balcony.castShadow = true;
  face.add(balcony);
  for (let i = -2; i <= 2; i++) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.62, 0.055), darkWood);
    rail.position.set(i * 1.05, balconyY + 0.35, 0.92);
    face.add(rail);
  }
  const handrail = new THREE.Mesh(new THREE.BoxGeometry(4.9, 0.055, 0.07), darkWood);
  handrail.position.set(0, balconyY + 0.67, 0.92);
  face.add(handrail);
  for (const x of [-1.75, 0, 1.75]) {
    const upper = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.92), windowMat);
    upper.position.set(x, balconyY + 1.15, 0.025);
    face.add(upper);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.07, 0.06), darkWood);
    frame.position.set(x, balconyY + 1.15, -0.015);
    face.add(frame);
  }

  // hanging sign
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(2.0, 0.58),
    new THREE.MeshStandardMaterial({ map: signTexture(name), roughness: 0.8 }),
  );
  sign.position.set(0, 3.95, 0.05);
  face.add(sign);

  group.position.set(side * 10.8, 0, z);
  return group;
}

function createFoodStall(): { group: THREE.Group; center: THREE.Vector3; table: THREE.Vector3 } {
  const group = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({ map: woodTexture(), color: 0x9b6d4b, roughness: 0.88 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x3a281f, roughness: 0.92 });
  const cream = new THREE.MeshStandardMaterial({ color: 0xd9c59c, roughness: 0.9 });
  const red = new THREE.MeshStandardMaterial({ color: 0x8e3d30, roughness: 0.92 });

  // back wall + frame
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.1, 4.6), dark);
  back.position.set(1.35, 1.55, 0);
  group.add(back);
  for (const z of [-2.1, 2.1]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(2.7, 3.2, 0.18), wood);
    post.position.set(0, 1.6, z);
    group.add(post);
  }
  const counter = new THREE.Mesh(new THREE.BoxGeometry(2.9, 1.05, 4.8), wood);
  counter.position.set(-0.15, 0.55, 0);
  counter.castShadow = true;
  counter.receiveShadow = true;
  group.add(counter);
  const counterTop = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.1, 5.0), new THREE.MeshStandardMaterial({ color: 0x8e6649, roughness: 0.72 }));
  counterTop.position.set(-0.2, 1.1, 0);
  group.add(counterTop);
  // broad striped awning that slopes toward the street
  const awning = new THREE.Group();
  awning.position.set(-1.2, 3.25, 0);
  awning.rotation.z = -0.2;
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.07, 5.2), dark);
  awning.add(canopy);
  for (let i = 0; i < 8; i++) {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.085, 5.06), i % 2 === 0 ? cream : red);
    stripe.position.set(-1.4 + i * 0.4, 0.02, 0);
    awning.add(stripe);
  }
  for (const z of [-2.42, 2.42]) {
    const support = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 2.55, 7), dark);
    support.position.set(-2.45, 1.25, z);
    group.add(support);
  }
  group.add(awning);
  const stallLight = new THREE.PointLight(0xffb267, 15, 8, 2);
  stallLight.position.set(-1.8, 2.65, 0);
  group.add(stallLight);
  const stallGlow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: makeGlowTexture(),
      color: 0xffb66b,
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  stallGlow.position.set(-1.8, 2.5, 0);
  stallGlow.scale.setScalar(3.2);
  group.add(stallGlow);

  // table and benches in front of stall
  const table = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.1, 2.15), wood);
  table.position.set(-2.4, 0.82, 0);
  table.castShadow = true;
  table.receiveShadow = true;
  group.add(table);
  for (const x of [-2.95, -1.85]) {
    for (const z of [-0.8, 0.8]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.8, 0.1), dark);
      leg.position.set(x, 0.4, z);
      group.add(leg);
    }
  }
  for (const z of [-1.45, 1.45]) {
    const bench = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.09, 0.4), wood);
    bench.position.set(-2.4, 0.48, z);
    group.add(bench);
  }

  // dishes
  for (let i = 0; i < 8; i++) {
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.09, 0.06, 12), cream);
    bowl.position.set(-2.65 + (i % 2) * 0.44, 0.9, -0.75 + Math.floor(i / 2) * 0.5);
    group.add(bowl);
    const food = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 10, 8),
      new THREE.MeshStandardMaterial({ color: i % 3 === 0 ? 0xb46b42 : 0xc2954f, roughness: 0.8 }),
    );
    food.position.copy(bowl.position);
    food.position.y += 0.05;
    food.scale.y = 0.45;
    group.add(food);
  }
  // steam
  const count = 50;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = -2.6 + (rand(i + 2) - 0.5) * 0.8;
    positions[i * 3 + 1] = 1.0 + rand(i + 5) * 1.8;
    positions[i * 3 + 2] = (rand(i + 7) - 0.5) * 1.7;
  }
  const steamGeo = new THREE.BufferGeometry();
  steamGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const steam = new THREE.Points(
    steamGeo,
    new THREE.PointsMaterial({
      color: 0xf6e4c6,
      size: 0.5,
      map: makeGlowTexture(),
      transparent: true,
      opacity: 0.15,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  group.add(steam);

  // lanterns
  for (const z of [-2.0, 2.0]) {
    const lantern = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 14, 10),
      new THREE.MeshStandardMaterial({ color: 0xe7a25e, emissive: 0xff8d3d, emissiveIntensity: 2.1, roughness: 0.5 }),
    );
    lantern.scale.y = 1.35;
    lantern.position.set(-1.7, 3.0, z);
    group.add(lantern);
    const light = new THREE.PointLight(0xff9e52, 6, 7, 2);
    light.position.copy(lantern.position);
    group.add(light);
  }

  group.position.set(4.5, 0, 14.5);
  return { group, center: new THREE.Vector3(2.05, 0.8, 14.5), table: new THREE.Vector3(2.1, 0.82, 14.5) };
}

function createLanternPost(x: number, z: number): THREE.Group {
  const group = new THREE.Group();
  const dark = new THREE.MeshStandardMaterial({ color: 0x34251d, roughness: 0.9 });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 2.8, 8), dark);
  pole.position.y = 1.4;
  group.add(pole);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.05, 0.05), dark);
  arm.position.set(-0.25, 2.7, 0);
  group.add(arm);
  const lantern = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 14, 10),
    new THREE.MeshStandardMaterial({ color: 0xd99b58, emissive: 0xff9b4b, emissiveIntensity: 1.8, roughness: 0.5 }),
  );
  lantern.scale.y = 1.4;
  lantern.position.set(-0.5, 2.45, 0);
  group.add(lantern);
  const glow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: makeGlowTexture(),
      color: 0xffb267,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  glow.position.copy(lantern.position);
  glow.scale.setScalar(2.2);
  group.add(glow);
  group.position.set(x, 0, z);
  return group;
}

function sandStreetTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#c9a97a';
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 2600; i++) {
    const x = rand(i * 3) * 512;
    const y = rand(i * 3 + 1) * 512;
    const a = 0.025 + rand(i * 3 + 2) * 0.075;
    ctx.fillStyle = `rgba(${90 + Math.floor(rand(i + 9) * 60)},${72 + Math.floor(rand(i + 7) * 50)},${48 + Math.floor(rand(i + 5) * 40)},${a})`;
    ctx.fillRect(x, y, 1 + rand(i + 4) * 2.4, 1 + rand(i + 6) * 2.4);
  }
  for (let i = 0; i < 34; i++) {
    let x = rand(i + 20) * 512;
    let y = rand(i + 31) * 512;
    ctx.strokeStyle = `rgba(82,62,43,${0.08 + rand(i + 41) * 0.13})`;
    ctx.lineWidth = 0.7 + rand(i + 51) * 1.3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let k = 0; k < 5; k++) {
      x += (rand(i * 7 + k + 2) - 0.5) * 48;
      y += (rand(i * 7 + k + 5) - 0.5) * 34;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 18);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}


export interface TownWorld {
  group: THREE.Group;
  playerStart: THREE.Vector3;
  stallTrigger: THREE.Vector3;
  humanParents: THREE.Group[];
  pigs: THREE.Group[];
  magicRing: THREE.Mesh;
  magicParticles: THREE.Points;
  stallCenter: THREE.Vector3;
  table: THREE.Vector3;
  steam: THREE.Points;
  setTime: (t: number) => void;
  fogColor: THREE.Color;
  fogNear: number;
  fogFar: number;
  ghosts: THREE.Group[];
  updateGhosts: (time: number, night: number) => void;
}

export function buildTownWorld(): TownWorld {
  const group = new THREE.Group();

  const dayTop = new THREE.Color('#2f86d2');
  const dayHorizon = new THREE.Color('#b9dceb');
  const dayBottom = new THREE.Color('#c5dde3');
  const daySun = new THREE.Color('#fff2c8');
  const duskTop = new THREE.Color('#5a5d96');
  const duskHorizon = new THREE.Color('#efa15f');
  const duskBottom = new THREE.Color('#8d6654');
  const duskSun = new THREE.Color('#ffb36b');
  const nightTop = new THREE.Color('#050a18');
  const nightHorizon = new THREE.Color('#141c35');
  const nightBottom = new THREE.Color('#090d18');
  const nightSun = new THREE.Color('#aec6ff');
  const sceneSun = new THREE.Color();
  const cTop = new THREE.Color();
  const cHorizon = new THREE.Color();
  const cBottom = new THREE.Color();
  const cSun = new THREE.Color();
  const mixColor = (out: THREE.Color, a: THREE.Color, b: THREE.Color, c: THREE.Color, t: number) => {
    if (t < 0.55) out.copy(a).lerp(b, t / 0.55);
    else out.copy(b).lerp(c, (t - 0.55) / 0.45);
  };

  const sunDir = new THREE.Vector3(0.35, 0.56, 0.72);
  const sky = makeSky(dayTop.getStyle(), dayHorizon.getStyle(), dayBottom.getStyle(), daySun.getStyle(), sunDir);
  group.add(sky);
  const skyU = (sky.material as THREE.ShaderMaterial).uniforms;
  const sunGlow = sunSprite(sunDir, 34, 0.86);
  group.add(sunGlow);
  const moon = sunSprite(new THREE.Vector3(-0.38, 0.46, 0.9), 18, 0);
  (moon.material as THREE.SpriteMaterial).color.set(0xd9e6ff);
  group.add(moon);

  const cloudMats: THREE.MeshStandardMaterial[] = [];
  const cloudSpots: Array<[number, number, number, number]> = [
    [-24, 24, 32, 2.6],
    [22, 27, 48, 3.4],
    [-34, 20, 60, 2.1],
    [34, 23, 18, 1.9],
  ];
  for (const [x, y, z, sc] of cloudSpots) {
    const cloud = cloudCluster(x, y, z, sc, 0xf4f3e6, 0.7);
    group.add(cloud);
    cloud.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        const m = o.material as THREE.MeshStandardMaterial;
        if (!cloudMats.includes(m)) cloudMats.push(m);
      }
    });
  }

  const hemi = new THREE.HemisphereLight(0xd9eef5, 0x7f7358, 1.9);
  group.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff1cf, 3.2);
  sun.position.set(30, 38, 18);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -28;
  sun.shadow.camera.right = 28;
  sun.shadow.camera.top = 32;
  sun.shadow.camera.bottom = -12;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 90;
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.035;
  group.add(sun);
  group.add(sun.target);
  sun.target.position.set(0, 0, 22);

  // star dome
  const starCount = 620;
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const a = rand(i + 13) * TAU;
    const y = 0.08 + rand(i + 17) * 0.86;
    const r = Math.sqrt(Math.max(0, 1 - y * y)) * 152;
    starPositions[i * 3] = Math.cos(a) * r;
    starPositions[i * 3 + 1] = y * 152;
    starPositions[i * 3 + 2] = Math.sin(a) * r + 12;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const starMat = new THREE.PointsMaterial({
    color: 0xe8f0ff,
    size: 1.1,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    fog: false,
    blending: THREE.AdditiveBlending,
  });
  const stars = new THREE.Points(starGeo, starMat);
  group.add(stars);

  // sandy street
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(90, 110),
    new THREE.MeshStandardMaterial({ color: 0x8d8067, roughness: 1 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.z = 26;
  ground.receiveShadow = true;
  group.add(ground);
  const street = new THREE.Mesh(
    new THREE.PlaneGeometry(15.5, 58),
    new THREE.MeshStandardMaterial({ map: sandStreetTexture(), color: 0xffffff, roughness: 0.98 }),
  );
  street.rotation.x = -Math.PI / 2;
  street.position.set(0, 0.012, 23);
  street.receiveShadow = true;
  group.add(street);
  for (const side of [-1, 1]) {
    const kerb = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.13, 58),
      new THREE.MeshStandardMaterial({ color: 0x9d8c74, roughness: 1 }),
    );
    kerb.position.set(side * 7.75, 0.065, 23);
    kerb.receiveShadow = true;
    group.add(kerb);
    const walk = new THREE.Mesh(
      new THREE.PlaneGeometry(2.0, 58),
      new THREE.MeshStandardMaterial({ color: 0xb7a083, roughness: 1 }),
    );
    walk.rotation.x = -Math.PI / 2;
    walk.position.set(side * 8.75, 0.02, 23);
    walk.receiveShadow = true;
    group.add(walk);
  }

  const windowMat = new THREE.MeshStandardMaterial({
    color: 0xf1d59c,
    emissive: 0xffb05c,
    emissiveIntensity: 0.07,
    roughness: 0.52,
  });
  const warmLights: THREE.PointLight[] = [];

  // saturated facades, as in the reference
  const shopData: Array<[number, number, number, number, number, string]> = [
    [-1, 1.5, 6.2, 5.9, 0x2e7d70, '茶'],
    [1, 3.0, 5.7, 5.5, 0x3b8760, '宿'],
    [-1, 8.5, 6.0, 6.3, 0xc6a03d, '酒'],
    [1, 10.0, 5.8, 5.8, 0x8d3f47, '食'],
    [-1, 15.5, 6.2, 6.0, 0x78598a, '湯'],
    [1, 17.0, 5.7, 6.5, 0x3a7d89, '菓'],
    [-1, 22.5, 6.0, 5.9, 0x326b56, '宿'],
    [1, 24.0, 5.8, 6.2, 0xbe8741, '茶'],
    [-1, 29.5, 6.3, 6.5, 0x82475b, '酒'],
    [1, 31.0, 5.9, 6.0, 0x4c7788, '食'],
    [-1, -2.6, 6.2, 6.0, 0x4d665d, '門'],
    [1, -4.2, 5.8, 5.5, 0x865846, '宿'],
    [-1, -9.2, 6.3, 6.2, 0x596c55, '茶'],
    [1, -10.8, 5.9, 5.8, 0x704752, '食'],
  ];
  shopData.forEach(([side, z, width, height, palette, name], i) => {
    const shop = createShop(side, z, width, height, palette, name, windowMat);
    group.add(shop);
    if (i % 2 === 0) {
      const light = new THREE.PointLight(0xffb467, 0.2, 9, 2);
      light.position.set(side * 7.5, 2.3, z);
      group.add(light);
      warmLights.push(light);
    }
  });

  // overhead wires + red paper lanterns
  const wireMat = new THREE.LineBasicMaterial({ color: 0x302821, transparent: true, opacity: 0.8 });
  const lanternMat = new THREE.MeshStandardMaterial({
    color: 0xa8211a,
    emissive: 0xd92f22,
    emissiveIntensity: 0.28,
    roughness: 0.56,
  });
  const lanternGlowMat = new THREE.SpriteMaterial({
    map: makeGlowTexture(),
    color: 0xff3b24,
    transparent: true,
    opacity: 0.05,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xc99a4b, roughness: 0.55, metalness: 0.25 });
  const lanternGeo = new THREE.SphereGeometry(0.15, 12, 9);
  const capGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.045, 8);
  const tasselGeo = new THREE.CylinderGeometry(0.011, 0.011, 0.16, 5);
  const addLantern = (p: THREE.Vector3) => {
    const holder = new THREE.Group();
    const body = new THREE.Mesh(lanternGeo, lanternMat);
    body.scale.y = 1.28;
    holder.add(body);
    const top = new THREE.Mesh(capGeo, goldMat);
    top.position.y = 0.27;
    holder.add(top);
    const bottom = new THREE.Mesh(capGeo, goldMat);
    bottom.position.y = -0.27;
    holder.add(bottom);
    const tassel = new THREE.Mesh(tasselGeo, goldMat);
    tassel.position.y = -0.38;
    holder.add(tassel);
    const glow = new THREE.Sprite(lanternGlowMat);
    glow.scale.setScalar(1.05);
    holder.add(glow);
    holder.position.copy(p);
    group.add(holder);
  };
  for (let z = 5; z <= 39; z += 4.5) {
    const points = [
      new THREE.Vector3(-8.2, 4.0, z),
      new THREE.Vector3(0, 3.48, z + 0.22),
      new THREE.Vector3(8.2, 4.0, z),
    ];
    const curve = new THREE.CatmullRomCurve3(points);
    const wire = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(24)), wireMat);
    group.add(wire);
    for (const offset of [-2.4, -1.2, 0, 1.2, 2.4]) {
      addLantern(curve.getPoint(0.5 + offset / 13).add(new THREE.Vector3(0, -0.3, 0)));
    }
  }

  // a few warm pools of lantern light on the street
  for (let i = 0; i < 5; i++) {
    const light = new THREE.PointLight(0xffa25c, 0.1, 18, 2);
    light.position.set(0, 4.8, 4 + i * 8.5);
    group.add(light);
    warmLights.push(light);
  }

  // the market entrance behind the spawn point
  const entryGate = new THREE.Group();
  const entryWood = new THREE.MeshStandardMaterial({ color: 0x3d2820, roughness: 0.9 });
  const entryRed = new THREE.MeshStandardMaterial({ color: 0x8e3430, roughness: 0.84 });
  const entryRoof = new THREE.MeshStandardMaterial({ color: 0x293e37, roughness: 0.9, flatShading: true });
  const entryStone = new THREE.MeshStandardMaterial({ color: 0x847866, roughness: 0.98 });
  for (const side of [-1, 1]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.52, 4.35, 0.62), entryWood);
    post.position.set(side * 4.25, 2.18, 0);
    post.castShadow = true;
    entryGate.add(post);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.45, 0.9), entryStone);
    foot.position.set(side * 4.25, 0.22, 0);
    entryGate.add(foot);
    const lantern = createBathLantern(0.55);
    lantern.position.set(side * 3.65, 3.35, 0.38);
    entryGate.add(lantern);
    const lamp = new THREE.PointLight(0xffa567, 1.2, 5, 2);
    lamp.position.set(side * 3.65, 3.25, 0.2);
    entryGate.add(lamp);
  }
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(9.4, 0.48, 0.7), entryRed);
  lintel.position.set(0, 4.22, 0);
  entryGate.add(lintel);
  const gateName = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.75, 0.18), entryWood);
  gateName.position.set(0, 4.95, -0.02);
  entryGate.add(gateName);
  for (const side of [-1, 1]) {
    const slope = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.18, 2.5), entryRoof);
    slope.position.set(side * 2.55, 5.45, 0);
    slope.rotation.z = side * 0.2;
    slope.castShadow = true;
    entryGate.add(slope);
  }
  const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.24, 2.7), entryRed);
  ridge.position.set(0, 5.98, 0);
  entryGate.add(ridge);
  const eave = new THREE.Mesh(new THREE.BoxGeometry(11.0, 0.16, 0.55), entryRoof);
  eave.position.set(0, 5.2, 1.25);
  entryGate.add(eave);
  entryGate.position.set(0, 0, -5.4);
  group.add(entryGate);

  // a small row of entrance buildings closes the view beyond the gate
  const entryStreet = new THREE.Mesh(
    new THREE.PlaneGeometry(15.5, 14),
    new THREE.MeshStandardMaterial({ map: sandStreetTexture(), color: 0xffffff, roughness: 0.98 }),
  );
  entryStreet.rotation.x = -Math.PI / 2;
  entryStreet.position.set(0, 0.014, -10.5);
  entryStreet.receiveShadow = true;
  group.add(entryStreet);
  const entryPlaster = new THREE.MeshStandardMaterial({ color: 0xb8a17d, roughness: 0.97 });
  const entryPlasterDark = new THREE.MeshStandardMaterial({ color: 0x6f725d, roughness: 0.98 });
  const entryRoofDark = new THREE.MeshStandardMaterial({ color: 0x263b34, roughness: 0.9, flatShading: true });
  const entryDoor = new THREE.MeshStandardMaterial({ color: 0x2f211b, roughness: 0.92 });
  const backdropData: Array<[number, number, number, number, number]> = [
    [-8.2, -14.2, 6.4, 4.3, 0x7f8b76],
    [0, -14.7, 7.4, 5.0, 0xb8a17d],
    [8.2, -14.2, 6.4, 4.3, 0x8a735c],
  ];
  backdropData.forEach(([x, z, w, h, color], i) => {
    const mat = i === 1 ? entryPlaster : i === 0 ? entryPlasterDark : entryPlaster;
    const facade = new THREE.Mesh(new THREE.BoxGeometry(w, h, 1.0), mat);
    facade.position.set(x, h / 2, z);
    facade.castShadow = true;
    facade.receiveShadow = true;
    group.add(facade);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(w * 0.86, 1.7, 4), i === 1 ? entryRoof : entryRoofDark);
    roof.position.set(x, h + 0.72, z);
    roof.rotation.y = Math.PI / 4;
    roof.scale.z = 0.72;
    roof.castShadow = true;
    group.add(roof);
    const eave = new THREE.Mesh(new THREE.BoxGeometry(w + 0.7, 0.16, 1.8), entryRoof);
    eave.position.set(x, h + 0.08, z + 0.25);
    group.add(eave);
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.9, 0.08), entryDoor);
    door.position.set(x, 0.95, z + 0.54);
    group.add(door);
    for (const wx of [-w * 0.32, w * 0.32]) {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), windowMat);
      win.position.set(x + wx, h * 0.62, z + 0.56);
      group.add(win);
    }
  });
  for (const [x, z, sc, seed] of [[-11.0, -17.0, 1.25, 71], [10.8, -17.4, 1.1, 73], [-2.0, -19.0, 1.45, 79], [13.0, -19.5, 0.95, 83]]) {
    const tree = createTree(seed, 0x2e5039);
    tree.position.set(x, 0, z);
    tree.scale.setScalar(sc);
    group.add(tree);
  }

  // food stall and parents
  const stall = createFoodStall();
  group.add(stall.group);
  const dad = createHuman('dad');
  dad.position.set(2.25, 0.35, 12.98);
  dad.rotation.y = 0;
  dad.scale.setScalar(0.96);
  dad.userData.home = dad.position.clone();
  group.add(dad);
  const mom = createHuman('mom');
  mom.position.set(2.25, 0.35, 16.02);
  mom.rotation.y = Math.PI;
  mom.scale.setScalar(0.94);
  mom.userData.home = mom.position.clone();
  group.add(mom);

  const pigA = createPig(true, 0x5c6250);
  pigA.position.set(2.1, 0.44, 12.98);
  pigA.rotation.y = 0;
  pigA.scale.setScalar(0.94);
  pigA.visible = false;
  group.add(pigA);
  const pigB = createPig(true, 0x82534c);
  pigB.position.set(2.1, 0.44, 16.02);
  pigB.rotation.y = Math.PI;
  pigB.scale.setScalar(0.9);
  pigB.visible = false;
  group.add(pigB);

  // magic ring + red particles
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.9, 0.035, 8, 80),
    new THREE.MeshBasicMaterial({
      color: 0xc44230,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(2.1, 0.04, 14.5);
  group.add(ring);

  const pCount = 180;
  const pPositions = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    const a = rand(i) * TAU;
    const r = 0.2 + rand(i + 4) * 1.4;
    pPositions[i * 3] = 2.1 + Math.cos(a) * r;
    pPositions[i * 3 + 1] = 0.2 + rand(i + 8) * 1.4;
    pPositions[i * 3 + 2] = 14.5 + Math.sin(a) * r;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
  const particles = new THREE.Points(
    pGeo,
    new THREE.PointsMaterial({
      color: 0xf1a45f,
      size: 0.11,
      map: makeGlowTexture(),
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  group.add(particles);

  // grand stone steps at the end of the market
  const stone = new THREE.MeshStandardMaterial({ color: 0x998c78, roughness: 0.97 });
  const stoneDark = new THREE.MeshStandardMaterial({ color: 0x776e5e, roughness: 1 });
  for (let i = 0; i < 11; i++) {
    const h = 0.24 * (i + 1);
    const step = new THREE.Mesh(new THREE.BoxGeometry(16.0, h, 1.05), stone);
    step.position.set(0, h / 2, 38 + i * 1.0);
    step.castShadow = true;
    step.receiveShadow = true;
    group.add(step);
  }
  for (const side of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 1.0, 8), stoneDark);
      post.position.set(side * 8.2, 0.9 + i * 0.48, 39 + i * 2.2);
      post.castShadow = true;
      group.add(post);
    }
  }
  const platform = new THREE.Mesh(new THREE.BoxGeometry(18, 0.55, 8), stone);
  platform.position.set(0, 2.4, 52.5);
  platform.receiveShadow = true;
  group.add(platform);

  // red torii at the top
  const toriiRed = new THREE.MeshStandardMaterial({ color: 0xa9322d, roughness: 0.78 });
  const torii = new THREE.Group();
  for (const side of [-1, 1]) {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.28, 4.8, 10), toriiRed);
    pillar.position.set(side * 3.1, 5.0, 0);
    torii.add(pillar);
  }
  const topBeam = new THREE.Mesh(new THREE.BoxGeometry(7.3, 0.3, 0.42), toriiRed);
  topBeam.position.set(0, 7.35, 0);
  torii.add(topBeam);
  const secondBeam = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.22, 0.3), toriiRed);
  secondBeam.position.set(0, 6.55, 0);
  torii.add(secondBeam);
  const plaque = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.0), new THREE.MeshStandardMaterial({ color: 0x2d241d, roughness: 0.8 }));
  plaque.position.set(0, 6.98, 0.23);
  torii.add(plaque);
  torii.position.set(0, 2.65, 50.2);
  group.add(torii);

  // giant tree behind the gate
  const tree = new THREE.Group();
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4d3a29, roughness: 1 });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x2f5538, roughness: 1, flatShading: true });
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 1.3, 5.8, 12), trunkMat);
  trunk.position.y = 2.9;
  trunk.castShadow = true;
  tree.add(trunk);
  const branchSpots: Array<[number, number, number, number]> = [
    [-2.8, 5.4, 0.2, 4.2], [2.6, 5.7, -0.3, 3.9], [-0.4, 6.5, 1.1, 5.2],
    [0.2, 7.1, -1.2, 4.8], [3.4, 6.6, 0.8, 3.2], [-3.3, 6.7, -0.9, 3.4],
  ];
  for (const [x, y, z, r] of branchSpots) {
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), leafMat);
    crown.position.set(x, y, z);
    crown.scale.y = 0.78;
    crown.rotation.set(rand(x + 1) * 2, rand(y + 2) * 2, rand(z + 3) * 2);
    crown.castShadow = true;
    tree.add(crown);
  }
  tree.position.set(0, 2.65, 56.5);
  tree.scale.setScalar(0.60);
  group.add(tree);

  // distant rooftops are deliberately kept out of the central sightline

  // foreground clutter
  const crateMat = new THREE.MeshStandardMaterial({ color: 0x6a4b32, roughness: 0.9 });
  for (let i = 0; i < 8; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const crate = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.55, 0.6), crateMat);
    crate.position.set(side * (7.2 + rand(i) * 0.7), 0.28, 4 + rand(i + 3) * 28);
    crate.rotation.y = rand(i + 8) * 0.8;
    crate.castShadow = true;
    group.add(crate);
  }
  const paper = new THREE.MeshStandardMaterial({ color: 0xc4b393, roughness: 1, side: THREE.DoubleSide });
  for (let i = 0; i < 18; i++) {
    const scrap = new THREE.Mesh(new THREE.PlaneGeometry(0.12 + rand(i) * 0.18, 0.08 + rand(i + 2) * 0.1), paper);
    scrap.rotation.x = -Math.PI / 2 + rand(i + 3) * 0.1;
    scrap.rotation.z = rand(i + 5) * 3;
    scrap.position.set((rand(i + 7) - 0.5) * 9.4, 0.03, 2 + rand(i + 9) * 32);
    group.add(scrap);
  }
  const weedMat = new THREE.MeshStandardMaterial({ color: 0x4f6144, roughness: 1, side: THREE.DoubleSide });
  for (let i = 0; i < 26; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const blade = new THREE.Mesh(new THREE.PlaneGeometry(0.055, 0.3), weedMat);
    blade.position.set(side * (7.8 + rand(i + 3) * 1.2), 0.15, 1 + rand(i + 6) * 36);
    blade.rotation.y = rand(i + 9) * 3;
    group.add(blade);
  }

  const fogColor = new THREE.Color();
  const dayFog = new THREE.Color('#d6e6dd');
  const duskFog = new THREE.Color('#b27a68');
  const nightFog = new THREE.Color('#09101d');
  const warmSun = new THREE.Color('#ffd7a0');
  let fogNear = 52;
  let fogFar = 140;
  const setTime = (value: number) => {
    const t = THREE.MathUtils.clamp(value, 0, 1);
    mixColor(cTop, dayTop, duskTop, nightTop, t);
    mixColor(cHorizon, dayHorizon, duskHorizon, nightHorizon, t);
    mixColor(cBottom, dayBottom, duskBottom, nightBottom, t);
    mixColor(cSun, daySun, duskSun, nightSun, t);
    skyU.topColor.value.copy(cTop);
    skyU.horizonColor.value.copy(cHorizon);
    skyU.bottomColor.value.copy(cBottom);
    skyU.sunColor.value.copy(cSun);
    sunGlow.material.opacity = 0.86 * (1 - THREE.MathUtils.smoothstep(t, 0.52, 0.86));
    (sunGlow.material as THREE.SpriteMaterial).color.copy(cSun);
    moon.material.opacity = 0.82 * THREE.MathUtils.smoothstep(t, 0.64, 0.92);
    starMat.opacity = 0.86 * THREE.MathUtils.smoothstep(t, 0.6, 0.95);
    for (const mat of cloudMats) mat.opacity = 0.7 * (1 - 0.72 * t);
    lanternMat.emissiveIntensity = 0.20 + 0.78 * t * t;
    windowMat.emissiveIntensity = 0.07 + 1.25 * Math.pow(t, 1.5);
    lanternGlowMat.opacity = 0.025 + 0.12 * t;
    for (const light of warmLights) light.intensity = 0.12 + 7.2 * t;
    hemi.intensity = 1.9 - 1.55 * t;
    sun.intensity = 3.2 - 3.02 * t;
    sun.color.copy(sceneSun.copy(cSun).lerp(warmSun, 0.25));
    sun.position.set(30 - 20 * t, 38 - 31 * t, 18 - 9 * t);
    mixColor(fogColor, dayFog, duskFog, nightFog, t);
    fogNear = 52 - 38 * t;
    fogFar = 140 - 78 * t;
  };
  // Night wanderers: pale spirits drift through the empty market and stairs.
  const townGhosts: THREE.Group[] = [];
  const ghostSpecs: Array<[number, number, number, number]> = [
    [-3.2, 7.5, 2.0, 0.0],
    [3.4, 10.8, 1.6, 1.3],
    [-4.2, 15.0, 2.4, 2.5],
    [4.0, 19.2, 2.0, 3.6],
    [-3.0, 24.5, 2.8, 4.4],
    [3.1, 30.5, 1.8, 5.2],
    [-2.4, 39.5, 2.1, 6.0],
  ];
  ghostSpecs.forEach(([x, z, range, phase], index) => {
    const ghost = createGhost();
    ghost.position.set(x, 0.9, z);
    ghost.userData.homeX = x;
    ghost.userData.homeZ = z;
    ghost.userData.range = range;
    ghost.userData.phase = phase;
    ghost.userData.index = index;
    for (const material of ghost.userData.materials as THREE.MeshStandardMaterial[]) {
      material.opacity = 0;
    }
    ghost.visible = false;
    group.add(ghost);
    townGhosts.push(ghost);
  });
  const updateGhosts = (time: number, night: number): void => {
    const visible = THREE.MathUtils.smoothstep(night, 0.46, 0.82);
    townGhosts.forEach((ghost) => {
      const phase = ghost.userData.phase as number;
      const range = ghost.userData.range as number;
      const homeX = ghost.userData.homeX as number;
      const homeZ = ghost.userData.homeZ as number;
      const driftX = Math.sin(time * 0.24 + phase) * range + Math.sin(time * 0.09 + phase * 1.7) * 0.6;
      const driftZ = Math.cos(time * 0.19 + phase * 1.3) * range * 0.7;
      ghost.position.x = homeX + driftX;
      ghost.position.z = homeZ + driftZ;
      const stairY = homeZ >= 48.4 ? 2.675 : homeZ >= 37.4 ? (Math.floor(homeZ - 37.4) + 1) * 0.24 : 0;
      ghost.position.y = 0.78 + stairY + Math.sin(time * 1.15 + phase) * 0.28;
      ghost.rotation.y = Math.sin(time * 0.27 + phase) * 0.55;
      const breathe = 1 + Math.sin(time * 0.8 + phase) * 0.035;
      ghost.scale.set(breathe, breathe, breathe);
      ghost.visible = visible > 0.01;
      for (const material of ghost.userData.materials as THREE.MeshStandardMaterial[]) {
        material.opacity = visible * 0.82;
      }
    });
  };
  setTime(0);

  return {
    group,
    playerStart: new THREE.Vector3(0, 0, 1.0),
    stallTrigger: new THREE.Vector3(0.8, 0, 11.8),
    humanParents: [dad, mom],
    pigs: [pigA, pigB],
    magicRing: ring,
    magicParticles: particles,
    stallCenter: stall.center,
    table: stall.table,
    steam: stall.group.children.find((c) => c instanceof THREE.Points) as THREE.Points,
    setTime,
    fogColor,
    fogNear,
    fogFar,
    ghosts: townGhosts,
    updateGhosts,
  };
}

export interface BathhouseWorld {
  group: THREE.Group;
  exterior: THREE.Group;
  office: THREE.Group;
  boiler: THREE.Group;
  playerStart: THREE.Vector3;
  hakuTrigger: THREE.Vector3;
  entranceTrigger: THREE.Vector3;
  officePlayerStart: THREE.Vector3;
  haku: THREE.Group;
  yubaba: THREE.Group;
  boh: THREE.Group;
  heads: THREE.Group;
  kamaji: THREE.Group;
  kamajiCutout: THREE.Sprite;
  lin: THREE.Group;
  boilerDoor: THREE.Group;
  boilerDoorTrigger: THREE.Vector3;
  officeDeskTrigger: THREE.Vector3;
  soot: THREE.Group[];
  ghosts: THREE.Group[];
  coal: THREE.Mesh;
  boilerPlayerStart: THREE.Vector3;
  furnaceTrigger: THREE.Vector3;
  stage: 'bridge' | 'office' | 'boiler';
  bridgeHeightAt: (z: number) => number;
  setStage: (stage: 'bridge' | 'office' | 'boiler') => void;
  setHakuWalking: (walking: boolean) => void;
  update: (time: number, dt: number) => void;
}

function createHaku(): THREE.Group {
  const group = new THREE.Group();
  const robe = new THREE.MeshStandardMaterial({ color: 0xd9e0d5, roughness: 0.9 });
  const sash = new THREE.MeshStandardMaterial({ color: 0x3b7b75, roughness: 0.86 });
  const skin = new THREE.MeshStandardMaterial({ color: 0xd0aa8c, roughness: 0.9 });
  const hair = new THREE.MeshStandardMaterial({ color: 0x202b2b, roughness: 0.92 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x24211c, roughness: 0.95 });

  const body = new THREE.Mesh(new THREE.ConeGeometry(0.34, 1.28, 8), robe);
  body.position.y = 0.74;
  group.add(body);
  const sashMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.33, 0.15, 10), sash);
  sashMesh.position.y = 0.86;
  group.add(sashMesh);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.19, 14, 12), skin);
  head.position.y = 1.53;
  group.add(head);
  const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.205, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.62), hair);
  hairCap.position.y = 1.57;
  group.add(hairCap);
  const eyeWhite = new THREE.MeshStandardMaterial({ color: 0xe6e4d8, roughness: 0.8 });
  const eyeDark = new THREE.MeshBasicMaterial({ color: 0x26312f });
  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), eyeWhite);
    eye.position.set(side * 0.067, 1.56, 0.17);
    group.add(eye);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.014, 6, 5), eyeDark);
    pupil.position.set(side * 0.067, 1.56, 0.198);
    group.add(pupil);
  }
  const hakuMouth = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.012, 0.02), new THREE.MeshBasicMaterial({ color: 0x7f4c3f }));
  hakuMouth.position.set(0, 1.45, 0.178);
  group.add(hakuMouth);
  const ponytail = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.11, 0.55, 7), hair);
  ponytail.position.set(0, 1.36, 0.19);
  ponytail.rotation.x = -0.25;
  group.add(ponytail);
  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.09, 0.82, 7), robe);
    arm.position.set(side * 0.35, 0.98, 0);
    arm.rotation.z = side * 0.16;
    group.add(arm);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), skin);
    hand.position.set(side * 0.44, 0.6, 0.02);
    group.add(hand);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.28), dark);
    foot.position.set(side * 0.13, 0.05, 0.07);
    group.add(foot);
  }
  const belt = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.6, 0.02), sash);
  belt.position.set(0.19, 1.05, 0.26);
  belt.rotation.z = -0.2;
  group.add(belt);
  return group;
}

function createYubaba(): THREE.Group {
  const group = new THREE.Group();
  const dress = new THREE.MeshStandardMaterial({ color: 0x2d2234, roughness: 0.9 });
  const trim = new THREE.MeshStandardMaterial({ color: 0x7f3140, roughness: 0.86 });
  const skin = new THREE.MeshStandardMaterial({ color: 0xd6aa88, roughness: 0.9 });
  const hair = new THREE.MeshStandardMaterial({ color: 0x8d8b82, roughness: 0.95 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xc79a48, roughness: 0.5, metalness: 0.3 });

  const body = new THREE.Mesh(new THREE.ConeGeometry(0.68, 1.5, 10), dress);
  body.position.y = 0.8;
  group.add(body);
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.05, 6, 18), trim);
  collar.position.y = 1.38;
  collar.rotation.x = Math.PI / 2;
  group.add(collar);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 14, 12), skin);
  head.position.y = 1.78;
  head.scale.set(1.0, 1.08, 1.0);
  group.add(head);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.46, 8), skin);
  nose.position.set(0, 1.73, -0.42);
  nose.rotation.x = -Math.PI / 2;
  group.add(nose);
  const brow = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.035, 0.035), hair);
  brow.position.set(0, 1.93, -0.33);
  group.add(brow);
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.025, 0.03), new THREE.MeshBasicMaterial({ color: 0x52251f }));
  mouth.position.set(0, 1.62, -0.31);
  group.add(mouth);
  const bun = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10), hair);
  bun.position.set(0, 2.03, 0.13);
  group.add(bun);
  const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.33, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.58), hair);
  hairCap.position.y = 1.84;
  group.add(hairCap);
  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.75, 7), dress);
    arm.position.set(side * 0.58, 1.0, 0);
    arm.rotation.z = side * 0.28;
    group.add(arm);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.018, 5, 10), gold);
    ring.position.set(side * 0.7, 0.65, 0.06);
    ring.rotation.x = Math.PI / 2;
    group.add(ring);
  }
  return group;
}

function createBathLantern(scale = 1): THREE.Group {
  const group = new THREE.Group();
  const red = new THREE.MeshStandardMaterial({ color: 0xa82e25, emissive: 0xff4a2b, emissiveIntensity: 1.4, roughness: 0.55 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xb78b45, roughness: 0.55, metalness: 0.25 });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 9), red);
  body.scale.y = 1.3;
  group.add(body);
  for (const y of [-0.29, 0.29]) {
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 8), gold);
    cap.position.y = y;
    group.add(cap);
  }
  const glow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: makeGlowTexture(),
      color: 0xff7b4a,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  glow.scale.setScalar(1.4);
  group.add(glow);
  group.scale.setScalar(scale);
  return group;
}

function createKamaji(): THREE.Group {
  const group = new THREE.Group();
  const robe = new THREE.MeshStandardMaterial({ color: 0x3a2a1e, roughness: 0.94 });
  const skin = new THREE.MeshStandardMaterial({ color: 0xc39a79, roughness: 0.92 });
  const hair = new THREE.MeshStandardMaterial({ color: 0xd8d1bf, roughness: 0.95 });
  const lens = new THREE.MeshStandardMaterial({ color: 0x2f3a34, roughness: 0.35, metalness: 0.2 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xb18a48, roughness: 0.5, metalness: 0.3 });
  const body = new THREE.Mesh(new THREE.ConeGeometry(0.62, 1.8, 9), robe);
  body.position.y = 0.9;
  group.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 12), skin);
  head.position.y = 2.02;
  group.add(head);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.34, 7), skin);
  nose.position.set(0, 1.98, 0.31);
  nose.rotation.x = Math.PI / 2;
  group.add(nose);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.27, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.6), hair);
  cap.position.y = 2.1;
  group.add(cap);
  const bun = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), hair);
  bun.position.set(0, 2.31, 0.06);
  group.add(bun);
  const mustache = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.055, 0.05), hair);
  mustache.position.set(0, 1.87, 0.31);
  group.add(mustache);
  for (const side of [-1, 1]) {
    const lensRing = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.022, 6, 14), gold);
    lensRing.position.set(side * 0.13, 2.06, 0.3);
    group.add(lensRing);
    const glass = new THREE.Mesh(new THREE.CircleGeometry(0.085, 12), lens);
    glass.position.set(side * 0.13, 2.06, 0.315);
    group.add(glass);
  }
  // six long arms reaching into the machinery
  for (let i = 0; i < 3; i++) {
    for (const side of [-1, 1]) {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.06, 1.3, 6), robe);
      arm.position.set(side * (0.55 + i * 0.14), 1.55 - i * 0.28, 0.08);
      arm.rotation.z = side * (0.7 + i * 0.16);
      arm.rotation.x = -0.2;
      group.add(arm);
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 6), skin);
      hand.position.set(side * (1.12 + i * 0.14), 1.95 - i * 0.27, 0.2);
      group.add(hand);
    }
  }
  return group;
}

function createLin(): THREE.Group {
  const group = new THREE.Group();
  const robe = new THREE.MeshStandardMaterial({ color: 0x42685f, roughness: 0.9 });
  const apron = new THREE.MeshStandardMaterial({ color: 0xd4c39d, roughness: 0.9 });
  const skin = new THREE.MeshStandardMaterial({ color: 0xd2a486, roughness: 0.9 });
  const hair = new THREE.MeshStandardMaterial({ color: 0x2a211d, roughness: 0.95 });
  const body = new THREE.Mesh(new THREE.ConeGeometry(0.3, 1.25, 8), robe);
  body.position.y = 0.72;
  group.add(body);
  const apronMesh = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.62, 0.05), apron);
  apronMesh.position.set(0, 0.65, 0.27);
  group.add(apronMesh);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 10), skin);
  head.position.y = 1.45;
  group.add(head);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.185, 12, 9, 0, Math.PI * 2, 0, Math.PI * 0.58), hair);
  cap.position.y = 1.49;
  group.add(cap);
  const bun = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), hair);
  bun.position.set(0, 1.62, 0.13);
  group.add(bun);
  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, 0.7, 6), robe);
    arm.position.set(side * 0.3, 0.95, 0.02);
    arm.rotation.z = side * 0.3;
    group.add(arm);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), skin);
    hand.position.set(side * 0.4, 0.6, 0.05);
    group.add(hand);
  }
  return group;
}

function createSoot(): THREE.Group {
  const group = new THREE.Group();
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x151412, roughness: 1 });
  const spikeMaterial = new THREE.MeshStandardMaterial({ color: 0x24211d, roughness: 0.94, flatShading: true });
  const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xf2ead9 });
  const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0x11100e });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), bodyMaterial);
  body.position.y = 0.1;
  group.add(body);

  // Spiky outer shell.
  for (let i = 0; i < 14; i++) {
    const angle = (i / 14) * Math.PI * 2 + rand(i + 2) * 0.35;
    const y = -0.05 + rand(i + 8) * 0.24;
    const radius = Math.sqrt(Math.max(0.02, 0.01 - (y - 0.1) ** 2));
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.023, 0.09 + rand(i + 3) * 0.045, 4), spikeMaterial);
    spike.position.set(Math.cos(angle) * (0.09 + radius * 0.3), 0.1 + y, Math.sin(angle) * (0.09 + radius * 0.3));
    spike.rotation.z = Math.cos(angle) * Math.PI / 2;
    spike.rotation.x = -Math.sin(angle) * Math.PI / 2;
    group.add(spike);
  }

  const eyeRoot = new THREE.Group();
  eyeRoot.position.set(0, 0.13, 0.085);
  const pupils: THREE.Mesh[] = [];
  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.027, 8, 6), eyeMaterial);
    eye.position.set(side * 0.04, 0, 0);
    eye.scale.z = 0.42;
    eyeRoot.add(eye);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.010, 6, 5), pupilMaterial);
    pupil.position.set(0, 0, 0.018);
    eye.add(pupil);
    pupils.push(pupil);
  }
  group.add(eyeRoot);

  const carried = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.12, 0),
    new THREE.MeshStandardMaterial({ color: 0x11100f, emissive: 0x050504, emissiveIntensity: 0.35, roughness: 0.58 }),
  );
  carried.position.set(0, 0.32, 0.14);
  group.add(carried);

  group.userData.eyeRoot = eyeRoot;
  group.userData.pupils = pupils;
  group.userData.carried = carried;
  return group;
}

function createGhost(): THREE.Group {
  const group = new THREE.Group();
  const clothMaterial = new THREE.MeshStandardMaterial({
    color: 0x050505,
    roughness: 1,
    metalness: 0,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });

  // A single sheet of black cloth with a soft, irregular hem.
  const shape = new THREE.Shape();
  shape.moveTo(0, 1.62);
  shape.quadraticCurveTo(0.2, 1.62, 0.33, 1.42);
  shape.quadraticCurveTo(0.5, 1.14, 0.44, 0.74);
  shape.lineTo(0.4, 0.34);
  shape.quadraticCurveTo(0.29, 0.12, 0.18, 0.15);
  shape.quadraticCurveTo(0.08, 0.02, 0, 0.16);
  shape.quadraticCurveTo(-0.08, 0.02, -0.18, 0.15);
  shape.quadraticCurveTo(-0.29, 0.12, -0.4, 0.34);
  shape.lineTo(-0.44, 0.74);
  shape.quadraticCurveTo(-0.5, 1.14, -0.33, 1.42);
  shape.quadraticCurveTo(-0.2, 1.62, 0, 1.62);
  const geometry = new THREE.ShapeGeometry(shape, 18);
  // Give the cloth a little depth so it does not read as a cardboard cutout.
  const positions = geometry.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    positions.setZ(i, Math.sin(x * 12 + y * 4) * 0.05 + Math.cos(y * 7) * 0.025);
  }
  geometry.computeVertexNormals();
  const cloth = new THREE.Mesh(geometry, clothMaterial);
  group.add(cloth);

  // Exactly two camera-facing eye sprites, so oblique angles cannot reveal
  // a second pair on the back of the cloth.
  const eyeTexture = makeGlowTexture();
  const eyeMaterials: THREE.SpriteMaterial[] = [];
  for (const x of [-0.14, 0.14]) {
    const eyeMaterial = new THREE.SpriteMaterial({
      map: eyeTexture,
      color: 0xf3efd9,
      transparent: true,
      opacity: 0,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
    });
    const eye = new THREE.Sprite(eyeMaterial);
    eye.position.set(x, 1.12, 0.08);
    eye.scale.set(0.17, 0.21, 1);
    eye.renderOrder = 5;
    group.add(eye);
    eyeMaterials.push(eyeMaterial);
  }

  group.userData.materials = [clothMaterial, ...eyeMaterials];
  group.userData.baseX = 0;
  group.userData.baseZ = 0;
  group.userData.phase = 0;
  return group;
}

function createBoh(): THREE.Group {
  const group = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({ color: 0xe0b295, roughness: 0.9 });
  const pink = new THREE.MeshStandardMaterial({ color: 0xc77b82, roughness: 0.92 });
  const cream = new THREE.MeshStandardMaterial({ color: 0xe4d6bd, roughness: 0.9 });
  const hair = new THREE.MeshStandardMaterial({ color: 0x5a4038, roughness: 0.95 });
  const dark = new THREE.MeshBasicMaterial({ color: 0x241b18 });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.55, 14, 12), pink);
  body.scale.set(1, 1.15, 0.85);
  body.position.y = 0.72;
  group.add(body);
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.38, 12, 10), cream);
  belly.position.set(0, 0.58, 0.28);
  belly.scale.set(1, 0.9, 0.45);
  group.add(belly);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.46, 16, 12), skin);
  head.position.y = 1.55;
  head.scale.set(1, 0.95, 0.95);
  group.add(head);
  const curl = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), hair);
  curl.position.set(0, 2.0, 0.04);
  group.add(curl);
  const bonnet = new THREE.Mesh(new THREE.SphereGeometry(0.49, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.48), cream);
  bonnet.position.y = 1.68;
  group.add(bonnet);
  const bonnetRim = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.045, 6, 20), pink);
  bonnetRim.position.set(0, 1.72, 0.02);
  bonnetRim.rotation.x = 0.2;
  group.add(bonnetRim);
  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), dark);
    eye.position.set(side * 0.15, 1.62, 0.42);
    group.add(eye);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.55, 8), pink);
    arm.position.set(side * 0.58, 0.85, 0.05);
    arm.rotation.z = side * 0.35;
    group.add(arm);
    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), skin);
    foot.position.set(side * 0.24, 0.12, 0.25);
    foot.scale.set(1, 0.7, 1.2);
    group.add(foot);
  }
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.015, 5, 10, Math.PI), new THREE.MeshBasicMaterial({ color: 0x6b2f2b }));
  mouth.position.set(0, 1.42, 0.46);
  mouth.rotation.z = Math.PI;
  group.add(mouth);
  const pacifier = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.016, 5, 10), cream);
  pacifier.position.set(0, 1.38, 0.48);
  group.add(pacifier);
  return group;
}

function createOniHead(): THREE.Group {
  const head = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({ color: 0x71813f, roughness: 0.94 });
  const skinShadow = new THREE.MeshStandardMaterial({ color: 0x56652f, roughness: 0.95 });
  const beard = new THREE.MeshStandardMaterial({ color: 0x171812, roughness: 0.9 });
  const browMat = new THREE.MeshStandardMaterial({ color: 0x25281a, roughness: 0.9 });
  const eyeWhite = new THREE.MeshStandardMaterial({ color: 0xe9e5d5, roughness: 0.65 });
  const pupil = new THREE.MeshBasicMaterial({ color: 0x090a08 });
  const highlight = new THREE.MeshBasicMaterial({ color: 0xf8f5e8 });

  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 16), skin);
  skull.scale.set(1.05, 1.1, 0.92);
  head.add(skull);
  // slight crown shading
  const crown = new THREE.Mesh(new THREE.SphereGeometry(0.34, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), skinShadow);
  crown.position.set(0, 0.31, -0.02);
  crown.scale.set(1.02, 0.42, 0.9);
  head.add(crown);

  for (const side of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), skin);
    ear.position.set(side * 0.43, 0.0, 0.0);
    ear.scale.set(0.55, 1.15, 0.8);
    head.add(ear);
    const earInner = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), skinShadow);
    earInner.position.set(side * 0.46, 0.0, 0.04);
    earInner.scale.set(0.5, 1, 0.5);
    head.add(earInner);

    // big protruding eyes
    const white = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 12), eyeWhite);
    white.position.set(side * 0.17, 0.08, 0.33);
    white.scale.set(1, 1, 0.58);
    head.add(white);
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 10), pupil);
    dot.position.set(side * 0.17, 0.075, 0.41);
    dot.scale.set(1, 1, 0.55);
    head.add(dot);
    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), highlight);
    glint.position.set(side * 0.15, 0.095, 0.445);
    head.add(glint);

    // heavy angry brow
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.075, 0.09), browMat);
    brow.position.set(side * 0.16, 0.255, 0.32);
    brow.rotation.z = side * 0.30;
    head.add(brow);
    const browHair = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.18, 5), browMat);
    browHair.position.set(side * 0.27, 0.3, 0.28);
    browHair.rotation.z = side * 0.9;
    head.add(browHair);
    const sideburn = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.42, 0.12), beard);
    sideburn.position.set(side * 0.36, -0.1, 0.18);
    sideburn.rotation.z = side * 0.08;
    head.add(sideburn);
  }

  // broad nose
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.2, 0.12), skin);
  bridge.position.set(0, 0.02, 0.36);
  head.add(bridge);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 10), skin);
  nose.position.set(0, -0.1, 0.4);
  nose.scale.set(1.18, 0.7, 0.85);
  head.add(nose);
  for (const side of [-1, 1]) {
    const nostril = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), skinShadow);
    nostril.position.set(side * 0.075, -0.16, 0.46);
    nostril.scale.set(1.1, 0.55, 0.45);
    head.add(nostril);
  }

  // thick black moustache
  for (const side of [-1, 1]) {
    const m = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.28, 6), beard);
    m.position.set(side * 0.13, -0.2, 0.4);
    m.rotation.z = side * 1.12;
    m.rotation.x = 0.15;
    head.add(m);
  }
  const mCenter = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.07, 0.06), beard);
  mCenter.position.set(0, -0.18, 0.41);
  head.add(mCenter);
  for (const side of [-1, 1]) {
    const wing = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.085, 0.055), beard);
    wing.position.set(side * 0.15, -0.19, 0.405);
    wing.rotation.z = side * 0.18;
    head.add(wing);
  }

  // jaw beard: a black U-shaped band around the lower face
  const beardBand = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.075, 7, 22, Math.PI), beard);
  beardBand.position.set(0, -0.12, 0.22);
  beardBand.rotation.z = Math.PI;
  beardBand.scale.set(1.0, 0.85, 0.6);
  head.add(beardBand);
  const chin = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 8), beard);
  chin.position.set(0, -0.38, 0.26);
  chin.scale.set(1.3, 0.7, 0.55);
  head.add(chin);
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.028, 0.035), beard);
  mouth.position.set(0, -0.255, 0.35);
  head.add(mouth);
  const lowerLip = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.05, 0.05), skinShadow);
  lowerLip.position.set(0, -0.29, 0.34);
  head.add(lowerLip);

  // forehead creases
  for (let i = 0; i < 2; i++) {
    const crease = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.018, 0.02), skinShadow);
    crease.position.set(0, 0.34 + i * 0.045, 0.31 - i * 0.02);
    head.add(crease);
  }

  return head;
}

function createThreeHeads(): THREE.Group {
  const group = new THREE.Group();
  const shelfMat = new THREE.MeshStandardMaterial({ color: 0x3f2a1d, roughness: 0.9 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xb08a4c, roughness: 0.5, metalness: 0.3 });
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.2, 0.9), shelfMat);
  shelf.position.y = -0.2;
  group.add(shelf);
  const trim = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.045, 0.95), gold);
  trim.position.y = -0.11;
  group.add(trim);
  const texture = new THREE.TextureLoader().load('images/oni_head_final.png', (tex) => {
    const image = tex.image as HTMLImageElement;
    const w = image.width, h = image.height;
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(image, 0, 0);
    const data = ctx.getImageData(0, 0, w, h).data;
    const cx = w / 2, cy = h / 2;
    const points: Array<[number, number, number, number]> = [];
    const segments = 100;
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const dx = Math.cos(angle), dy = Math.sin(angle);
      let hit: [number, number] | null = null;
      const maxR = Math.max(w, h) * 0.78;
      for (let r = maxR; r > 2; r -= 1) {
        const px = Math.round(cx + dx * r);
        const py = Math.round(cy + dy * r);
        if (px < 0 || px >= w || py < 0 || py >= h) continue;
        if (data[(py * w + px) * 4 + 3] > 64) { hit = [px, py]; break; }
      }
      if (hit) points.push([hit[0], hit[1], angle, 0]);
    }
    if (points.length < 8) return;
    const H = 1.02;
    const W = H * (w / h);
    const positions: number[] = [0, 0, 0];
    const uvs: number[] = [0.5, 0.5];
    const indices: number[] = [];
    for (const [px, py] of points) {
      // pull the UV slightly inside the silhouette so the pale source matte is never sampled
      const ux = px + (cx - px) * 0.035;
      const uy = py + (cy - py) * 0.035;
      positions.push(((px - cx) / h) * H, ((cy - py) / h) * H, 0);
      uvs.push(ux / w, 1 - uy / h);
    }
    for (let i = 0; i < points.length; i++) {
      indices.push(0, i + 1, ((i + 1) % points.length) + 1);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.generateMipmaps = false;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    const material = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide, toneMapped: false, fog: false });
    for (let i = 0; i < 3; i++) {
      const head = new THREE.Mesh(geometry, material);
      head.position.set((i - 1) * 1.28, 0.41, 0.03);
      head.userData.baseY = 0.41;
      head.userData.phase = i * 1.9;
      group.add(head);
    }
  });
  texture.colorSpace = THREE.SRGBColorSpace;
  return group;
}

function makeOfficeWallpaper(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 512;
  const ctx = c.getContext('2d')!;
  const bg = ctx.createLinearGradient(0, 0, 512, 512);
  bg.addColorStop(0, '#3c1119');
  bg.addColorStop(0.5, '#55151d');
  bg.addColorStop(1, '#2b0b12');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = 'rgba(190,145,83,.28)';
  ctx.fillStyle = 'rgba(205,160,94,.18)';
  for (let x = 28; x < 512; x += 96) {
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke();
    for (let y = 32; y < 512; y += 96) {
      ctx.beginPath();
      ctx.ellipse(x, y, 24, 44, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(x, y, 44, 24, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath(); ctx.arc(x, y, 15, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y - 48); ctx.bezierCurveTo(x + 22, y - 32, x + 22, y + 32, x, y + 48);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y - 48); ctx.bezierCurveTo(x - 22, y - 32, x - 22, y + 32, x, y + 48);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 2.4);
  tex.anisotropy = 4;
  return tex;
}

function makeCurtainTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 512;
  const ctx = c.getContext('2d')!;
  const bg = ctx.createLinearGradient(0, 0, 256, 0);
  bg.addColorStop(0, '#4a1016'); bg.addColorStop(.28, '#8b332c'); bg.addColorStop(.5, '#b1784e'); bg.addColorStop(.72, '#802b27'); bg.addColorStop(1, '#3a0b12');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 256, 512);
  ctx.strokeStyle = 'rgba(224,182,113,.34)';
  for (let x = 14; x < 256; x += 30) {
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.bezierCurveTo(x + 8, 170, x - 8, 330, x, 512); ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function makePaintingTexture(variant: number): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 320;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#17100e'; ctx.fillRect(0, 0, 256, 320);
  const g = ctx.createLinearGradient(0, 0, 256, 320);
  g.addColorStop(0, variant % 2 ? '#1c2730' : '#32201c');
  g.addColorStop(1, '#0c0b0b');
  ctx.fillStyle = g; ctx.fillRect(12, 12, 232, 296);
  ctx.strokeStyle = 'rgba(208,164,91,.5)'; ctx.lineWidth = 3; ctx.strokeRect(20, 20, 216, 280);
  ctx.fillStyle = variant % 2 ? 'rgba(99,142,152,.5)' : 'rgba(166,108,70,.56)';
  ctx.beginPath(); ctx.ellipse(128, 145, variant % 2 ? 56 : 44, variant % 2 ? 100 : 70, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(20,15,14,.72)';
  ctx.beginPath(); ctx.ellipse(128, 105, variant % 2 ? 30 : 26, 36, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(219,179,110,.35)';
  ctx.beginPath(); ctx.arc(88, 78, 10, 0, Math.PI * 2); ctx.fill();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}


function bathFlagTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 320;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#e9e2d1'; ctx.fillRect(0, 0, 512, 320);
  ctx.fillStyle = '#17150f';
  ctx.beginPath(); ctx.arc(190, 160, 96, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e9e2d1'; ctx.font = 'bold 150px "STKaiti","KaiTi","Songti SC",serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('油', 190, 170);
  ctx.strokeStyle = '#17150f'; ctx.lineWidth = 12; ctx.strokeRect(6, 6, 500, 308);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createPineTree(): THREE.Group {
  const tree = new THREE.Group();
  const bark = new THREE.MeshStandardMaterial({ color: 0x3d2a20, roughness: 0.95 });
  const needleDark = new THREE.MeshStandardMaterial({ color: 0x25452e, roughness: 0.95, flatShading: true });
  const needle = new THREE.MeshStandardMaterial({ color: 0x35623b, roughness: 0.94, flatShading: true });
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.55, 6.5, 8), bark);
  trunk.position.y = 3.2; tree.add(trunk);
  const limbs: Array<[number, number, number, number, number]> = [
    [-1.8, 4.6, 0.2, 2.9, 0.22], [1.7, 5.1, 0.1, 3.0, -0.3], [-1.3, 6.1, -0.2, 2.4, 0.3],
    [1.2, 6.6, 0.2, 2.2, -0.2], [0.2, 7.3, -0.1, 2.0, 0.1],
  ];
  for (const [x, y, z, length, angle] of limbs) {
    const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.17, length, 6), bark);
    branch.position.set(x * 0.45, y, z);
    branch.rotation.z = Math.PI / 2 + angle;
    tree.add(branch);
    for (let i = 0; i < 3; i++) {
      const foliage = new THREE.Mesh(new THREE.IcosahedronGeometry(1.45 - i * 0.18, 0), i % 2 ? needle : needleDark);
      foliage.position.set(x + (i - 1) * 0.8, y + 0.35 + (i % 2) * 0.28, z + (i - 1) * 0.35);
      foliage.scale.set(1.45, 0.36, 0.82);
      tree.add(foliage);
    }
  }
  for (let i = 0; i < 4; i++) {
    const top = new THREE.Mesh(new THREE.IcosahedronGeometry(1.0 - i * 0.15, 0), i % 2 ? needleDark : needle);
    top.position.set(0.3 - i * 0.25, 7.8 - i * 0.42, 0.1);
    top.scale.set(1.6, 0.32, 1.0);
    tree.add(top);
  }
  return tree;
}


function makeBoilerDrawerTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 512;
  const ctx = c.getContext('2d')!;
  const bg = ctx.createLinearGradient(0, 0, 512, 512);
  bg.addColorStop(0, '#7b4f2d'); bg.addColorStop(.5, '#8f6038'); bg.addColorStop(1, '#5a351f');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 512, 512);
  const cols = 4, rows = 6, cw = 512 / cols, ch = 512 / rows;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * cw + 3, y = row * ch + 3, w = cw - 6, h = ch - 6;
      const g = ctx.createLinearGradient(x, y, x, y + h);
      g.addColorStop(0, '#9b6b40'); g.addColorStop(.7, '#744a2b'); g.addColorStop(1, '#5a351f');
      ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = 'rgba(38,22,12,.75)'; ctx.lineWidth = 3; ctx.strokeRect(x, y, w, h);
      ctx.strokeStyle = 'rgba(220,173,110,.18)'; ctx.lineWidth = 1; ctx.strokeRect(x + 5, y + 5, w - 10, h - 10);
      ctx.fillStyle = '#2d2620';
      ctx.beginPath(); ctx.ellipse(x + w / 2, y + h * 0.55, 13, 6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#9b825f';
      ctx.beginPath(); ctx.ellipse(x + w / 2 - 2, y + h * 0.52, 5, 2.5, 0, 0, Math.PI * 2); ctx.fill();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

function makeBoilerStoneTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 512;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#574a3d'; ctx.fillRect(0, 0, 512, 512);
  for (let row = 0; row < 7; row++) {
    const offset = (row % 2) * 36;
    for (let col = -1; col < 5; col++) {
      const x = col * 120 + offset + (rand(row * 9 + col) - .5) * 9;
      const y = row * 74 + (rand(row * 13 + col) - .5) * 8;
      const w = 108 + rand(row + col * 4) * 15;
      const h = 63 + rand(row * 3 + col) * 10;
      const g = ctx.createLinearGradient(x, y, x, y + h);
      g.addColorStop(0, '#7a6955'); g.addColorStop(1, '#42372d');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(x + 7, y); ctx.lineTo(x + w - 9, y + 3); ctx.lineTo(x + w, y + h - 8); ctx.lineTo(x + 4, y + h); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(30,23,18,.6)'; ctx.lineWidth = 3; ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

function makeBoilerFloorTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 512;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#4c3423'; ctx.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y += 64) {
    const g = ctx.createLinearGradient(0, y, 0, y + 64);
    g.addColorStop(0, '#755038'); g.addColorStop(1, '#3f2a1c');
    ctx.fillStyle = g; ctx.fillRect(0, y + 2, 512, 60);
    ctx.strokeStyle = 'rgba(20,12,8,.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke();
    for (let x = 0; x < 512; x += 128) {
      const off = (y / 64) % 2 ? 64 : 0;
      ctx.strokeStyle = 'rgba(24,15,9,.45)'; ctx.beginPath(); ctx.moveTo(x + off, y); ctx.lineTo(x + off, y + 64); ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  return tex;
}

export function buildBathhouseWorld(): BathhouseWorld {
  const group = new THREE.Group();
  const exterior = new THREE.Group();
  const office = new THREE.Group();
  group.add(exterior, office);
  office.visible = false;

  const duskSky = makeSky('#0a2b4a', '#e7a15f', '#192833', '#ffd49a', new THREE.Vector3(-0.42, 0.2, 0.88));
  exterior.add(duskSky);
  const duskSun = sunSprite(new THREE.Vector3(-0.42, 0.2, 0.88), 22, 0.9);
  (duskSun.material as THREE.SpriteMaterial).color.set(0xffd39a);
  exterior.add(duskSun);

  const hemi = new THREE.HemisphereLight(0xa9c1c9, 0x39251d, 1.05);
  exterior.add(hemi);
  const sunsetLight = new THREE.DirectionalLight(0xffc98f, 2.1);
  sunsetLight.position.set(-18, 22, 16);
  sunsetLight.castShadow = true;
  sunsetLight.shadow.mapSize.set(1024, 1024);
  sunsetLight.shadow.camera.left = -18;
  sunsetLight.shadow.camera.right = 18;
  sunsetLight.shadow.camera.top = 24;
  sunsetLight.shadow.camera.bottom = -12;
  sunsetLight.shadow.camera.near = 1;
  sunsetLight.shadow.camera.far = 60;
  sunsetLight.shadow.bias = -0.0007;
  exterior.add(sunsetLight);
  exterior.add(sunsetLight.target);

  const water = new THREE.Mesh(
    new THREE.PlaneGeometry(180, 180),
    new THREE.MeshStandardMaterial({ color: 0x2b6b78, roughness: 0.2, metalness: 0.45 }),
  );
  water.rotation.x = -Math.PI / 2;
  water.position.y = -0.62;
  exterior.add(water);

  const bridgeMat = new THREE.MeshStandardMaterial({ color: 0x6f3a28, roughness: 0.92 });
  const bridgeEdge = new THREE.MeshStandardMaterial({ color: 0xb52a2c, roughness: 0.72 });
  const bridgeDark = new THREE.MeshStandardMaterial({ color: 0x261a16, roughness: 0.9 });
  const bridgeWhite = new THREE.MeshStandardMaterial({ color: 0xe1d6bc, roughness: 0.86 });
  const plankMat = new THREE.MeshStandardMaterial({ color: 0xa96d42, roughness: 0.92 });
  const bridge = new THREE.Group();
  const BRIDGE_START = -2;
  const BRIDGE_LENGTH = 26;
  const BRIDGE_RISE = 1.15;
  const bridgeHeightAt = (z: number): number => {
    const u = THREE.MathUtils.clamp((z - BRIDGE_START) / BRIDGE_LENGTH, 0, 1);
    return BRIDGE_RISE * Math.sin(Math.PI * u);
  };
  const bridgeSlopeAt = (z: number): number => {
    const u = THREE.MathUtils.clamp((z - BRIDGE_START) / BRIDGE_LENGTH, 0, 1);
    return (BRIDGE_RISE * Math.PI / BRIDGE_LENGTH) * Math.cos(Math.PI * u);
  };
  // segmented deck: planks and stringers follow the arch
  for (let z = BRIDGE_START; z <= BRIDGE_START + BRIDGE_LENGTH; z += 0.62) {
    const slope = bridgeSlopeAt(z);
    const segment = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.2, 0.7), bridgeMat);
    segment.position.set(0, bridgeHeightAt(z) - 0.1, z);
    segment.rotation.x = -Math.atan(slope);
    segment.receiveShadow = true;
    bridge.add(segment);
    const plank = new THREE.Mesh(new THREE.BoxGeometry(4.25, 0.07, 0.55), plankMat);
    plank.position.set(0, bridgeHeightAt(z) + 0.025, z);
    plank.rotation.x = -Math.atan(slope);
    bridge.add(plank);
  }
  for (const side of [-1, 1]) {
    for (let z = -0.8; z <= 22.8; z += 1.2) {
      const base = bridgeHeightAt(z);
      const beam = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.12, 1.3), bridgeEdge);
      beam.position.set(side * 2.12, base + 0.95, z);
      beam.rotation.x = -Math.atan(bridgeSlopeAt(z));
      bridge.add(beam);
    }
    for (let z = -1.8; z <= 23.8; z += 0.8) {
      const base = bridgeHeightAt(z);
      const lower = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.86), bridgeEdge);
      lower.position.set(side * 2.12, base + 0.38, z);
      lower.rotation.x = -Math.atan(bridgeSlopeAt(z));
      bridge.add(lower);
      const toe = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.86), bridgeDark);
      toe.position.set(side * 2.16, base + 0.07, z);
      toe.rotation.x = -Math.atan(bridgeSlopeAt(z));
      bridge.add(toe);
    }
    for (let z = -0.8; z <= 23; z += 2.2) {
      const base = bridgeHeightAt(z);
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.1, 0.95, 8), bridgeEdge);
      post.position.set(side * 2.12, base + 0.45, z);
      bridge.add(post);
      if (z > 0.3 && z < 22.4) {
        const panel = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.3, 1.35), bridgeWhite);
        panel.position.set(side * 2.06, base + 0.68, z + 0.55);
        panel.rotation.x = -Math.atan(bridgeSlopeAt(z));
        bridge.add(panel);
        for (let k = 0; k < 3; k++) {
          const lattice = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.32, 0.035), bridgeEdge);
          lattice.position.set(side * 2.03, base + 0.68, z + 0.18 + k * 0.4);
          bridge.add(lattice);
        }
      }
    }
    for (const z of [-1.0, 23.2]) {
      const capPost = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, 1.55, 8), bridgeDark);
      capPost.position.set(side * 2.12, 0.75, z);
      bridge.add(capPost);
      const finial = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), bridgeDark);
      finial.position.set(side * 2.12, 1.58, z);
      bridge.add(finial);
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.26, 8), bridgeDark);
      spike.position.set(side * 2.12, 1.76, z);
      bridge.add(spike);
    }
  }
  exterior.add(bridge);

  // The bridge start is enclosed by a dark gatehouse/corridor so that looking
  // back no longer reveals open sea and sky behind Chihiro.
  const gateWood = new THREE.MeshStandardMaterial({ color: 0x241713, roughness: 0.96 });
  const gatePlaster = new THREE.MeshStandardMaterial({ color: 0x493027, roughness: 0.98 });
  const gateRoof = new THREE.MeshStandardMaterial({ color: 0x1e3a31, roughness: 0.9, flatShading: true });
  const gateDark = new THREE.MeshBasicMaterial({ color: 0x030405, fog: false, side: THREE.DoubleSide });
  const corridor = new THREE.Group();
  // side walls and a low roof make the bridge feel like it leaves a covered gate
  for (const side of [-1, 1]) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(1.15, 5.2, 7.4), gateWood);
    wall.position.set(side * 4.75, 2.6, -4.45);
    corridor.add(wall);
    const wainscot = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.1, 7.5), gatePlaster);
    wainscot.position.set(side * 4.75, 0.55, -4.45);
    corridor.add(wainscot);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.28, 7.8), gateRoof);
    roof.position.set(side * 4.75, 5.3, -4.45);
    roof.rotation.z = side * 0.08;
    corridor.add(roof);
    for (let z = -7.3; z <= -1.5; z += 1.45) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(1.2, 5.2, 0.16), gatePlaster);
      post.position.set(side * 4.75, 2.6, z);
      corridor.add(post);
    }
  }
  const corridorCeiling = new THREE.Mesh(new THREE.BoxGeometry(10.6, 0.25, 7.4), gateWood);
  corridorCeiling.position.set(0, 5.45, -4.45);
  corridor.add(corridorCeiling);
  // end gate with a wide arch opening
  for (const side of [-1, 1]) {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(3.0, 5.1, 1.2), gateWood);
    pillar.position.set(side * 3.9, 2.55, -8.35);
    corridor.add(pillar);
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.45, 5.2, 1.0), gatePlaster);
    post.position.set(side * 2.45, 2.6, -8.35);
    corridor.add(post);
    const lamp = createBathLantern(0.75);
    lamp.position.set(side * 2.75, 3.4, -7.65);
    corridor.add(lamp);
    const lampLight = new THREE.PointLight(0xff9a52, 1.6, 5, 2);
    lampLight.position.set(side * 2.75, 3.3, -7.4);
    corridor.add(lampLight);
  }
  const gateLintel = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.75, 1.3), gateWood);
  gateLintel.position.set(0, 5.05, -8.35);
  corridor.add(gateLintel);
  const gateTrim = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.15, 1.45), new THREE.MeshStandardMaterial({ color: 0x96754a, roughness: 0.6, metalness: 0.2 }));
  gateTrim.position.set(0, 5.42, -8.35);
  corridor.add(gateTrim);
  const gateEave = new THREE.Mesh(new THREE.BoxGeometry(11.4, 0.32, 2.5), gateRoof);
  gateEave.position.set(0, 5.8, -8.35);
  corridor.add(gateEave);
  for (const side of [-1, 1]) {
    const upturn = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.8, 4), gateRoof);
    upturn.position.set(side * 5.4, 5.95, -8.35);
    upturn.rotation.z = side * 0.3;
    corridor.add(upturn);
  }
  // a void-black backdrop and a second arch plane behind the gate opening
  const voidWall = new THREE.Mesh(new THREE.PlaneGeometry(56, 30), gateDark);
  voidWall.position.set(0, 12, -16.5);
  corridor.add(voidWall);
  const archVoid = new THREE.Mesh(new THREE.PlaneGeometry(4.9, 5.9), gateDark);
  archVoid.position.set(0, 2.1, -9.05);
  corridor.add(archVoid);
  // dark stone floor under the approach, hidden behind the camera in normal play
  const rearFloor = new THREE.Mesh(new THREE.BoxGeometry(9.4, 0.16, 6.8), new THREE.MeshStandardMaterial({ color: 0x2c211b, roughness: 0.97 }));
  rearFloor.position.set(0, -0.16, -5.0);
  corridor.add(rearFloor);
  const rearStone = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.1, 2.2), new THREE.MeshStandardMaterial({ color: 0x171311, roughness: 0.98 }));
  rearStone.position.set(0, 0.01, -8.35);
  corridor.add(rearStone);
  exterior.add(corridor);

  const lanternPositions: Array<[number, number]> = [[-2.12, 3.2], [2.12, 3.2], [-2.12, 10.5], [2.12, 10.5], [-2.12, 18], [2.12, 18]];
  for (const [x, z] of lanternPositions) {
    const base = bridgeHeightAt(z);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 2.5, 8), bridgeDark);
    post.position.set(x, base + 1.25, z);
    bridge.add(post);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.05, 0.05), bridgeEdge);
    arm.position.set(x - Math.sign(x) * 0.3, base + 2.25, z);
    bridge.add(arm);
    const lantern = createBathLantern(0.9);
    lantern.position.set(x - Math.sign(x) * 0.65, base + 1.95, z);
    bridge.add(lantern);
  }

  // low-poly evening cloud banks
  const cloudMats = [
    new THREE.MeshBasicMaterial({ color: 0x8b8d8b, transparent: true, opacity: 0.58, depthWrite: false }),
    new THREE.MeshBasicMaterial({ color: 0x6d7278, transparent: true, opacity: 0.5, depthWrite: false }),
    new THREE.MeshBasicMaterial({ color: 0xd3c0a1, transparent: true, opacity: 0.62, depthWrite: false }),
  ];
  for (const [cx, cy, cz, scale, matIdx] of [
    [-34, 30, 58, 2.6, 0], [-24, 27, 54, 1.9, 2], [30, 31, 56, 2.3, 1], [40, 26, 52, 1.7, 2], [8, 34, 62, 2.0, 0],
  ] as Array<[number, number, number, number, number]>) {
    const cloud = new THREE.Group();
    for (let i = 0; i < 5; i++) {
      const puff = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5 + rand(i + cx) * 0.8, 0), cloudMats[matIdx]);
      puff.position.set((i - 2) * 1.5, (i % 2) * 0.55, Math.sin(i * 2.1) * 0.7);
      puff.scale.set(1.7, 0.55, 0.8);
      cloud.add(puff);
    }
    cloud.position.set(cx, cy, cz);
    cloud.scale.setScalar(scale);
    exterior.add(cloud);
  }

  // bathhouse facade
  const bathhouse = new THREE.Group();
  const redWood = new THREE.MeshStandardMaterial({ color: 0xa52b31, roughness: 0.82 });
  const redDeep = new THREE.MeshStandardMaterial({ color: 0x5b171c, roughness: 0.88 });
  const plaster = new THREE.MeshStandardMaterial({ color: 0xc7b394, roughness: 0.9 });
  const roof = new THREE.MeshStandardMaterial({ color: 0x3d805d, roughness: 0.82, flatShading: true, side: THREE.DoubleSide });
  const roofDark = new THREE.MeshStandardMaterial({ color: 0x24503b, roughness: 0.86, flatShading: true, side: THREE.DoubleSide });
  const gold = new THREE.MeshStandardMaterial({ color: 0xc39a50, roughness: 0.42, metalness: 0.32 });
  const goldBright = new THREE.MeshStandardMaterial({ color: 0xe0bc72, roughness: 0.36, metalness: 0.45 });
  const windowMat = new THREE.MeshBasicMaterial({ color: 0xffb45c, toneMapped: false, side: THREE.DoubleSide });
  const windowFrame = new THREE.MeshStandardMaterial({ color: 0x241a14, roughness: 0.82 });
  const purple = new THREE.MeshStandardMaterial({ color: 0x3d214d, roughness: 0.8, side: THREE.DoubleSide });

  const addBox = (w: number, h: number, d: number, mat: THREE.Material, x: number, y: number, z: number) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    bathhouse.add(mesh);
    return mesh;
  };
  const addWindowGrid = (x: number, y: number, z: number, w: number, h: number, cols: number, rows: number) => {
    addBox(w + 0.28, h + 0.28, 0.16, windowFrame, x, y, z);
    const pw = (w / cols) * 0.82;
    const ph = (h / rows) * 0.8;
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const pane = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), windowMat);
        pane.position.set(x - w / 2 + (c + 0.5) * (w / cols), y - h / 2 + (r + 0.5) * (h / rows), z - 0.1);
        bathhouse.add(pane);
      }
    }
    for (let c = 0; c <= cols; c++) {
      const bar = addBox(0.045, h + 0.22, 0.04, windowFrame, x - w / 2 + c * (w / cols), y, z - 0.13);
      bar.castShadow = false;
    }
    for (let r = 0; r <= rows; r++) {
      const bar = addBox(w + 0.22, 0.045, 0.04, windowFrame, x, y - h / 2 + r * (h / rows), z - 0.13);
      bar.castShadow = false;
    }
    const sill = addBox(w + 0.4, 0.12, 0.22, gold, x, y - h / 2 - 0.16, z - 0.08);
    sill.castShadow = false;
  };
  const addRoof = (w: number, d: number, y: number, z: number, rise = 0.85) => {
    const angle = Math.atan(rise / (d * 0.52));
    // Explicit front roof plane. The sloped box panels are mostly hidden by
    // the storey below when viewed from the bridge, which is why the roofs
    // previously read as thin green eaves instead of actual roofs.
    const zFront = z - d * 0.52;
    const zRidge = z + d * 0.08;
    const faceGeo = new THREE.BufferGeometry();
    faceGeo.setAttribute('position', new THREE.Float32BufferAttribute([
      -w * 0.5, 0, zFront, w * 0.5, 0, zFront, w * 0.34, rise, zRidge,
      -w * 0.5, 0, zFront, w * 0.34, rise, zRidge, -w * 0.34, rise, zRidge,
    ], 3));
    faceGeo.computeVertexNormals();
    const face = new THREE.Mesh(faceGeo, roof);
    face.position.y = y;
    bathhouse.add(face);
    for (let i = 1; i < 4; i++) {
      const t = i / 4;
      const yy = y + rise * t;
      const zz = zFront + (zRidge - zFront) * t;
      const half = w * (0.5 - 0.16 * t);
      const tile = new THREE.Mesh(new THREE.BoxGeometry(half * 2, 0.035, 0.06), roofDark);
      tile.position.set(0, yy + 0.03, zz);
      bathhouse.add(tile);
    }
    for (const side of [-1, 1]) {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(w + 0.7, 0.2, d * 0.58), roof);
      panel.position.set(0, y + rise * 0.42, z + side * d * 0.23);
      panel.rotation.x = side * angle;
      panel.castShadow = true;
      bathhouse.add(panel);
      const tileLine = new THREE.Mesh(new THREE.BoxGeometry(w + 0.8, 0.04, 0.035), roofDark);
      tileLine.position.set(0, y + rise * 0.44 + 0.12, z + side * d * 0.38);
      bathhouse.add(tileLine);
    }
    const ridge = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, w + 0.9, 8), gold);
    ridge.rotation.z = Math.PI / 2;
    ridge.position.set(0, y + rise + 0.08, z);
    bathhouse.add(ridge);
    for (const side of [-1, 1]) {
      const eave = new THREE.Mesh(new THREE.BoxGeometry(w + 1.6, 0.78, 0.5), roofDark);
      eave.position.set(0, y + 0.02, z + side * (d * 0.52));
      bathhouse.add(eave);
      const eaveGold = new THREE.Mesh(new THREE.BoxGeometry(w + 1.7, 0.09, 0.56), gold);
      eaveGold.position.set(0, y - 0.36, z + side * (d * 0.52));
      bathhouse.add(eaveGold);
      for (let t = 0; t < 3; t++) {
        const tileRow = new THREE.Mesh(new THREE.BoxGeometry(w + 1.62, 0.025, 0.06), roof);
        tileRow.position.set(0, y - 0.22 + t * 0.24, z + side * (d * 0.52) + side * 0.26);
        bathhouse.add(tileRow);
      }
      for (const sx of [-1, 1]) {
        const tip = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.9, 4), roof);
        tip.position.set(sx * (w / 2 + 0.78), y + 0.28, z + side * (d * 0.52));
        tip.rotation.z = sx * 0.28;
        bathhouse.add(tip);
        const cap = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), goldBright);
        cap.position.set(sx * (w / 2 + 0.78), y + 0.45, z + side * (d * 0.52));
        bathhouse.add(cap);
      }
    }
    for (const sx of [-1, 1]) {
      const finial = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.7, 5), gold);
      finial.position.set(sx * (w / 2 + 0.45), y + rise + 0.3, z);
      bathhouse.add(finial);
    }
  };

  // main red body and lower stone plinth
  addBox(23.4, 1.1, 9.2, new THREE.MeshStandardMaterial({ color: 0x3b352e, roughness: 0.95 }), 0, 0.55, 30);
  addBox(22, 7.2, 8, redWood, 0, 3.6, 30);
  addBox(22.7, 0.42, 8.3, gold, 0, 7.05, 30);
  addBox(22.4, 0.3, 8.2, redDeep, 0, 6.75, 30);
  for (const side of [-1, 1]) {
    addBox(3.2, 6.2, 8.8, redDeep, side * 11.2, 3.4, 30);
    addBox(3.5, 0.35, 9.1, gold, side * 11.2, 6.55, 30);
    addBox(2.4, 2.6, 0.5, windowFrame, side * 9.4, 3.7, 25.9);
    addWindowGrid(side * 9.4, 3.7, 25.9, 2.0, 2.2, 3, 3);
  }
  // second and third storeys, stepped back slightly
  addBox(17.5, 4.3, 7.2, redWood, 0, 9.55, 30.25);
  addBox(18.2, 0.35, 7.5, gold, 0, 11.65, 30.25);
  addBox(13.8, 3.7, 6.2, redWood, 0, 13.75, 30.65);
  addBox(14.4, 0.32, 6.5, gold, 0, 15.55, 30.65);
  addBox(9.3, 3.2, 5.0, redWood, 0, 17.7, 31.0);
  addBox(9.8, 0.3, 5.3, goldBright, 0, 19.25, 31.0);

  // large green roofs between the storeys
  addRoof(25.5, 13.5, 7.3, 30, 1.8);
  addRoof(20.5, 12.0, 11.68, 30.25, 1.65);
  addRoof(16.6, 10.0, 15.58, 30.65, 1.4);
  addRoof(11.8, 8.2, 19.28, 31.0, 1.25);
  const topHip = new THREE.Mesh(new THREE.ConeGeometry(6.4, 2.4, 4), roof);
  topHip.position.set(0, 20.25, 31.0);
  topHip.rotation.y = Math.PI / 4;
  topHip.scale.set(1.05, 1, 1);
  bathhouse.add(topHip);
  const topHipGold = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, 0.06, 4), goldBright);
  topHipGold.position.set(0, 19.35, 31.0);
  topHipGold.rotation.y = Math.PI / 4;
  bathhouse.add(topHipGold);

  // central gate, sign, canopy and balcony
  addBox(8.4, 5.0, 0.55, new THREE.MeshStandardMaterial({ color: 0x171310, roughness: 0.9 }), 0, 2.55, 26.02);
  for (const side of [-1, 1]) {
    addBox(0.42, 5.0, 0.7, redDeep, side * 4.2, 2.55, 25.95);
    addBox(0.5, 0.2, 0.8, gold, side * 4.2, 5.02, 25.95);
  }
  for (const side of [-1, 1]) {
    const gateCurtain = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 3.4), purple);
    gateCurtain.position.set(side * 1.35, 2.45, 25.56);
    bathhouse.add(gateCurtain);
    const gateTie = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.08, 0.06), gold);
    gateTie.position.set(side * 1.35, 1.2, 25.52);
    bathhouse.add(gateTie);
  }
  addBox(8.8, 0.25, 0.38, gold, 0, 4.95, 26.05);
  const signFrame = new THREE.Mesh(new THREE.BoxGeometry(4.5, 2.0, 0.18), gold);
  signFrame.position.set(0, 5.7, 25.84);
  bathhouse.add(signFrame);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(4.05, 1.68), new THREE.MeshBasicMaterial({ map: signTexture('油屋'), toneMapped: false, side: THREE.DoubleSide }));
  sign.position.set(0, 5.7, 25.58);
  sign.rotation.y = Math.PI;
  bathhouse.add(sign);
  addRoof(9.8, 3.2, 7.0, 25.8, 0.6);
  const entranceGableGeo = new THREE.BufferGeometry();
  entranceGableGeo.setAttribute('position', new THREE.Float32BufferAttribute([
    -4.6, 6.35, 25.1, 4.6, 6.35, 25.1, 0, 7.55, 25.7,
  ], 3));
  entranceGableGeo.computeVertexNormals();
  const entranceGable = new THREE.Mesh(entranceGableGeo, roof);
  bathhouse.add(entranceGable);
  const emblem = new THREE.Mesh(new THREE.CircleGeometry(0.62, 16), goldBright);
  emblem.position.set(0, 6.55, 25.0);
  bathhouse.add(emblem);
  const emblemInset = new THREE.Mesh(new THREE.CircleGeometry(0.4, 16), redDeep);
  emblemInset.position.set(0, 6.55, 26.5);
  bathhouse.add(emblemInset);

  // projecting central gable above the balcony, plus its gold trim
  const centralGableGeo = new THREE.BufferGeometry();
  centralGableGeo.setAttribute('position', new THREE.Float32BufferAttribute([
    -4.8, 10.95, 25.82, 4.8, 10.95, 25.82, 0, 13.15, 26.75,
  ], 3));
  centralGableGeo.computeVertexNormals();
  bathhouse.add(new THREE.Mesh(centralGableGeo, roof));
  const gableBaseTrim = new THREE.Mesh(new THREE.BoxGeometry(9.8, 0.12, 0.18), goldBright);
  gableBaseTrim.position.set(0, 10.95, 25.8);
  bathhouse.add(gableBaseTrim);
  const gableCrest = new THREE.Mesh(new THREE.CircleGeometry(0.5, 16), goldBright);
  gableCrest.position.set(0, 12.05, 26.55);
  bathhouse.add(gableCrest);
  const entranceGlow = new THREE.PointLight(0xffa35c, 5.5, 9, 2);
  entranceGlow.position.set(0, 2.5, 23.5);
  bathhouse.add(entranceGlow);
  const facadeFill = new THREE.DirectionalLight(0xffd4a4, 1.25);
  facadeFill.position.set(-6, 10, -8);
  bathhouse.add(facadeFill);
  bathhouse.add(facadeFill.target);

  // purple-curtained balcony above the gate
  addBox(6.2, 2.8, 0.3, new THREE.MeshStandardMaterial({ color: 0x130e0c, roughness: 0.9 }), 0, 9.35, 26.55);
  for (const side of [-1, 1]) {
    const curtain = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.55), purple);
    curtain.position.set(side * 1.65, 9.35, 26.38);
    bathhouse.add(curtain);
    const tie = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.09, 0.08), gold);
    tie.position.set(side * 1.65, 8.4, 26.34);
    bathhouse.add(tie);
  }
  const balcony = addBox(7.6, 0.18, 0.8, gold, 0, 8.05, 26.42);
  balcony.castShadow = false;
  for (let i = -4; i <= 4; i++) {
    addBox(0.05, 0.7, 0.05, gold, i * 0.88, 8.4, 26.3);
  }
  addBox(8.6, 0.16, 0.3, gold, 0, 10.9, 26.42);
  addRoof(8.6, 2.4, 11.1, 26.42, 0.42);
  const crestFrame = new THREE.Mesh(new THREE.CircleGeometry(0.78, 18), goldBright);
  crestFrame.position.set(0, 11.04, 26.6);
  bathhouse.add(crestFrame);
  const crest = new THREE.Mesh(new THREE.CircleGeometry(0.56, 16), redDeep);
  crest.position.set(0, 11.04, 26.62);
  bathhouse.add(crest);
  const crestBar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.8, 0.04), gold);
  crestBar.position.set(0, 11.04, 26.65);
  bathhouse.add(crestBar);

  // warm window bays
  addWindowGrid(-7.3, 3.45, 25.9, 3.4, 1.9, 5, 3);
  addWindowGrid(7.3, 3.45, 25.9, 3.4, 1.9, 5, 3);
  addWindowGrid(-6.1, 9.6, 26.55, 4.0, 2.0, 5, 3);
  addWindowGrid(6.1, 9.6, 26.55, 4.0, 2.0, 5, 3);
  addWindowGrid(-4.3, 13.7, 27.45, 3.2, 1.6, 4, 2);
  addWindowGrid(4.3, 13.7, 27.45, 3.2, 1.6, 4, 2);
  addWindowGrid(-2.2, 17.5, 28.4, 2.1, 1.3, 3, 2);
  addWindowGrid(2.2, 17.5, 28.4, 2.1, 1.3, 3, 2);

  // side banners and entrance lanterns
  for (const side of [-1, 1]) {
    const banner = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 3.0), new THREE.MeshStandardMaterial({ color: 0x8f1f24, roughness: 0.88, side: THREE.DoubleSide }));
    banner.position.set(side * 7.0, 3.4, 25.85);
    bathhouse.add(banner);
    const bannerSeal = new THREE.Mesh(new THREE.CircleGeometry(0.35, 16), new THREE.MeshBasicMaterial({ color: 0xe4d6b0, side: THREE.DoubleSide }));
    bannerSeal.position.set(side * 7.0, 3.4, 25.84);
    bathhouse.add(bannerSeal);
    const lantern = createBathLantern(1.8);
    lantern.position.set(side * 4.9, 4.5, 25.95);
    bathhouse.add(lantern);
    const light = new THREE.PointLight(0xff9b55, 4.5, 12, 2);
    light.position.set(side * 4.9, 4.4, 25.7);
    bathhouse.add(light);
  }

  // roof-top ornament
  addBox(2.8, 0.22, 0.25, goldBright, 0, 19.62, 31.0);
  const topOrb = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 10), goldBright);
  topOrb.position.set(0, 20.05, 31.0);
  bathhouse.add(topOrb);
  const topSpire = new THREE.Mesh(new THREE.ConeGeometry(0.16, 1.0, 5), gold);
  topSpire.position.set(0, 20.7, 31.0);
  bathhouse.add(topSpire);

  // smoke above the bathhouse
  const smokeCount = 80;
  const smokePositions = new Float32Array(smokeCount * 3);
  for (let i = 0; i < smokeCount; i++) {
    smokePositions[i * 3] = (rand(i) - 0.5) * 2.8;
    smokePositions[i * 3 + 1] = 20.5 + rand(i + 2) * 4;
    smokePositions[i * 3 + 2] = 31 + (rand(i + 4) - 0.5) * 2;
  }
  const smokeGeo = new THREE.BufferGeometry();
  smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3));
  const smoke = new THREE.Points(
    smokeGeo,
    new THREE.PointsMaterial({
      color: 0xa9aaa0,
      size: 0.7,
      map: makeGlowTexture(),
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  bathhouse.add(smoke);
  bathhouse.scale.set(0.96, 0.74, 0.96);
  bathhouse.position.set(0, 0, -5);
  exterior.add(bathhouse);

  // ancient pines framing the bathhouse
  const pineRight = createPineTree();
  pineRight.position.set(-10.5, 0, 18.5);
  pineRight.scale.setScalar(1.25);
  exterior.add(pineRight);
  const pineLeft = createPineTree();
  pineLeft.position.set(12.2, 0, 13.0);
  pineLeft.scale.setScalar(0.52);
  exterior.add(pineLeft);

  // white 油 banner on the left
  const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 13, 8), new THREE.MeshStandardMaterial({ color: 0x25201a, roughness: 0.9 }));
  flagPole.position.set(11.4, 6.5, 7.0);
  exterior.add(flagPole);
  const flag = new THREE.Mesh(
    new THREE.PlaneGeometry(2.8, 1.75),
    new THREE.MeshStandardMaterial({ map: bathFlagTexture(), side: THREE.DoubleSide, roughness: 0.9 }),
  );
  flag.position.set(9.95, 11.5, 7.0);
  flag.rotation.y = Math.PI - 0.18;
  exterior.add(flag);

  // heavy stone path at the near end of the bridge
  for (let i = 0; i < 9; i++) {
    const stone = new THREE.Mesh(
      new THREE.BoxGeometry(0.7 + rand(i + 80) * 0.5, 0.05, 0.45 + rand(i + 90) * 0.3),
      new THREE.MeshStandardMaterial({ color: 0x746b5c, roughness: 0.95 }),
    );
    stone.position.set((rand(i + 100) - 0.5) * 4.0, 0.02, -2.4 - i * 0.55);
    stone.rotation.y = rand(i + 110) * 0.8;
    exterior.add(stone);
  }

  const haku = createHaku();
  haku.position.set(0, bridgeHeightAt(6.4) + 0.02, 6.4);
  haku.rotation.y = 0;
  const hakuFill = new THREE.PointLight(0xffe0bd, 2.4, 5.5, 2);
  hakuFill.position.set(0, 2.2, 0.2);
  haku.add(hakuFill);
  exterior.add(haku);

  const ghosts: THREE.Group[] = [];
  const ghostSpots: Array<[number, number]> = [
    [-2.75, 8.2], [2.75, 10.9], [-2.75, 13.9], [2.75, 16.8], [-2.75, 19.6],
  ];
  ghostSpots.forEach(([x, z], i) => {
    const ghost = createGhost();
    ghost.position.set(x, 0.62, z);
    ghost.userData.baseX = x;
    ghost.userData.baseZ = z;
    ghost.userData.phase = i * 1.7;
    ghost.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2;
    exterior.add(ghost);
    ghosts.push(ghost);
  });

  const officeRoom = new THREE.Group();
  officeRoom.visible = false;
  const wood = new THREE.MeshStandardMaterial({ color: 0x3d2a1e, roughness: 0.94 });
  const wall = new THREE.MeshStandardMaterial({ color: 0x6f563f, roughness: 0.96 });
  const officeFloorMat = new THREE.MeshStandardMaterial({ color: 0x39281f, roughness: 0.95 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(13, 12), officeFloorMat);
  floor.rotation.x = -Math.PI / 2;
  officeRoom.add(floor);
  const officeFrontFloor = new THREE.Mesh(new THREE.PlaneGeometry(13, 5.4), officeFloorMat);
  officeFrontFloor.rotation.x = -Math.PI / 2;
  officeFrontFloor.position.z = 8.7;
  officeRoom.add(officeFrontFloor);
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(13, 6, 0.35), wall);
  backWall.position.set(0, 3, -5.7);
  officeRoom.add(backWall);
  for (const side of [-1, 1]) {
    const sideWall = new THREE.Mesh(new THREE.BoxGeometry(0.35, 6, 12), wall);
    sideWall.position.set(side * 6.35, 3, 0);
    officeRoom.add(sideWall);
    const sideExtension = new THREE.Mesh(new THREE.BoxGeometry(0.35, 6, 5.4), wall);
    sideExtension.position.set(side * 6.35, 3, 8.7);
    officeRoom.add(sideExtension);
  }
  const ceiling = new THREE.Mesh(new THREE.BoxGeometry(13, 0.25, 12), wood);
  ceiling.position.set(0, 5.8, 0);
  officeRoom.add(ceiling);
  const ceilingExtension = new THREE.Mesh(new THREE.BoxGeometry(13, 0.25, 5.4), wood);
  ceilingExtension.position.set(0, 5.8, 8.7);
  officeRoom.add(ceilingExtension);
  const wallpaperMat = new THREE.MeshStandardMaterial({
    map: makeOfficeWallpaper(), roughness: 0.93, side: THREE.DoubleSide,
  });
  const curtainMat = new THREE.MeshStandardMaterial({
    map: makeCurtainTexture(), roughness: 0.9, side: THREE.DoubleSide,
  });
  const backPaper = new THREE.Mesh(new THREE.PlaneGeometry(12.6, 5.9), wallpaperMat);
  backPaper.position.set(0, 2.95, -5.505);
  officeRoom.add(backPaper);
  // Close the entrance side of the office too; otherwise turning around shows
  // the empty outside of the room.
  const officeFrontWall = new THREE.Mesh(new THREE.BoxGeometry(13, 6, 0.35), wall);
  officeFrontWall.position.set(0, 3, 11.2);
  officeRoom.add(officeFrontWall);
  const frontPaper = new THREE.Mesh(new THREE.PlaneGeometry(12.6, 5.9), wallpaperMat);
  frontPaper.position.set(0, 2.95, 11.0);
  frontPaper.rotation.y = Math.PI;
  officeRoom.add(frontPaper);
  const frontWainscot = new THREE.Mesh(new THREE.BoxGeometry(12.7, 1.12, 0.12), wood);
  frontWainscot.position.set(0, 0.55, 10.98);
  officeRoom.add(frontWainscot);
  const frontRail = new THREE.Mesh(new THREE.BoxGeometry(12.75, 0.07, 0.16), gold);
  frontRail.position.set(0, 1.14, 10.9);
  officeRoom.add(frontRail);
  // entrance double door with an open frame (not a solid slab)
  const doorPanelMat = new THREE.MeshStandardMaterial({ color: 0x3d2118, roughness: 0.86 });
  for (const side of [-1, 1]) {
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(1.7, 4.2, 0.14), doorPanelMat);
    leaf.position.set(side * 0.88, 2.2, 10.9);
    officeRoom.add(leaf);
    const leafInset = new THREE.Mesh(new THREE.BoxGeometry(1.35, 1.55, 0.04), wood);
    leafInset.position.set(side * 0.88, 2.85, 10.81);
    officeRoom.add(leafInset);
    const leafLower = new THREE.Mesh(new THREE.BoxGeometry(1.35, 1.55, 0.04), wood);
    leafLower.position.set(side * 0.88, 1.35, 10.81);
    officeRoom.add(leafLower);
    const handle = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 6), gold);
    handle.position.set(side * 0.32, 2.15, 10.71);
    officeRoom.add(handle);
  }
  for (const side of [-1, 1]) {
    const jamb = new THREE.Mesh(new THREE.BoxGeometry(0.24, 4.9, 0.18), gold);
    jamb.position.set(side * 2.05, 2.4, 10.82);
    officeRoom.add(jamb);
  }
  for (const y of [0.08, 4.8]) {
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(4.35, 0.24, 0.18), gold);
    lintel.position.set(0, y, 10.82);
    officeRoom.add(lintel);
  }
  const entranceSplit = new THREE.Mesh(new THREE.BoxGeometry(0.06, 4.2, 0.08), gold);
  entranceSplit.position.set(0, 2.2, 10.76);
  officeRoom.add(entranceSplit);
  const entranceLight = new THREE.PointLight(0xffbd78, 5.5, 9, 2);
  entranceLight.position.set(0, 3.2, 9.2);
  officeRoom.add(entranceLight);
  for (const side of [-1, 1]) {
    const sconce = new THREE.PointLight(0xffc87f, 2.0, 5, 2);
    sconce.position.set(side * 4.6, 3.1, 10.2);
    officeRoom.add(sconce);
    const sconceBase = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.23, 0.08, 10), gold);
    sconceBase.position.set(side * 4.6, 3.55, 10.85);
    officeRoom.add(sconceBase);
    const sconceShade = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.38, 12, 1, true), new THREE.MeshStandardMaterial({ color: 0xd3a45e, emissive: 0xffa750, emissiveIntensity: 1.1, side: THREE.DoubleSide }));
    sconceShade.position.set(side * 4.6, 3.3, 10.85);
    officeRoom.add(sconceShade);
  }
  // red runner leading from the entrance
  const runner = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 4.2), new THREE.MeshStandardMaterial({ color: 0x4b1619, roughness: 0.95 }));
  runner.rotation.x = -Math.PI / 2;
  runner.position.set(0, 0.018, 8.5);
  officeRoom.add(runner);
  const runnerTrim = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.025, 4.3), gold);
  runnerTrim.position.set(0, 0.006, 8.5);
  officeRoom.add(runnerTrim);
  for (const side of [-1, 1]) {
    const sidePaper = new THREE.Mesh(new THREE.PlaneGeometry(11.7, 5.9), wallpaperMat);
    sidePaper.position.set(side * 6.16, 2.95, 0);
    sidePaper.rotation.y = side * Math.PI / 2;
    officeRoom.add(sidePaper);
  }
  const wainscot = new THREE.Mesh(new THREE.BoxGeometry(12.7, 1.12, 0.12), wood);
  wainscot.position.set(0, 0.55, -5.48);
  officeRoom.add(wainscot);
  const wainscotRail = new THREE.Mesh(new THREE.BoxGeometry(12.75, 0.07, 0.16), gold);
  wainscotRail.position.set(0, 1.14, -5.4);
  officeRoom.add(wainscotRail);
  for (const x of [-5.9, -3.0, 3.0, 5.9]) {
    const trim = new THREE.Mesh(new THREE.BoxGeometry(0.07, 5.7, 0.05), gold);
    trim.position.set(x, 2.95, -5.46);
    officeRoom.add(trim);
  }
  // Persian-style rug
  const rugMat = new THREE.MeshStandardMaterial({ map: makeOfficeWallpaper(), color: 0x6b2d2b, roughness: 0.96, side: THREE.DoubleSide });
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(8.2, 5.1), rugMat);
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(0, 0.012, -2.0);
  officeRoom.add(rug);
  for (const z of [-4.5, 0.5]) {
    const border = new THREE.Mesh(new THREE.BoxGeometry(8.35, 0.025, 0.08), gold);
    border.position.set(0, 0.025, z);
    officeRoom.add(border);
  }
  for (const x of [-4.08, 4.08]) {
    const border = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.025, 5.1), gold);
    border.position.set(x, 0.025, -2.0);
    officeRoom.add(border);
  }
  // gilt-framed paintings
  const addPainting = (x: number, y: number, variant: number) => {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.55, 1.95, 0.08), gold);
    frame.position.set(x, y, -5.43);
    officeRoom.add(frame);
    const art = new THREE.Mesh(
      new THREE.PlaneGeometry(1.32, 1.72),
      new THREE.MeshBasicMaterial({ map: makePaintingTexture(variant) }),
    );
    art.position.set(x, y, -5.38);
    officeRoom.add(art);
  };
  addPainting(-4.45, 3.55, 0);
  addPainting(4.45, 3.55, 1);
  const desk = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.2, 1.9), wood);
  desk.position.set(0, 1.0, -3.2);
  officeRoom.add(desk);
  for (const x of [-2.1, 2.1]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.0, 0.24), wood);
    leg.position.set(x, 0.5, -3.2);
    officeRoom.add(leg);
  }
  const deskApron = new THREE.Mesh(new THREE.BoxGeometry(4.7, 0.58, 0.16), wood);
  deskApron.position.set(0, 0.72, -2.28);
  officeRoom.add(deskApron);
  for (const x of [-1.55, 0, 1.55]) {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.38, 0.04), new THREE.MeshStandardMaterial({ color: 0x241611, roughness: 0.9 }));
    panel.position.set(x, 0.72, -2.18);
    officeRoom.add(panel);
    const edge = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.42, 0.025), gold);
    edge.position.set(x, 0.72, -2.16);
    officeRoom.add(edge);
  }
  const deskInlay = new THREE.Mesh(
    new THREE.PlaneGeometry(3.9, 1.48),
    new THREE.MeshStandardMaterial({ color: 0x4d1618, roughness: 0.88 }),
  );
  deskInlay.rotation.x = -Math.PI / 2;
  deskInlay.position.set(0, 1.112, -3.2);
  officeRoom.add(deskInlay);
  const chair = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.16, 1.1), wood);
  chair.position.set(0, 1.15, -4.7);
  officeRoom.add(chair);
  const paper = new THREE.Mesh(
    new THREE.PlaneGeometry(0.9, 1.25),
    new THREE.MeshStandardMaterial({ color: 0xd8c7a2, roughness: 0.9, side: THREE.DoubleSide }),
  );
  paper.rotation.x = -Math.PI / 2;
  paper.position.set(0, 1.12, -3.1);
  officeRoom.add(paper);
  const seal = new THREE.Mesh(new THREE.CircleGeometry(0.15, 16), new THREE.MeshBasicMaterial({ color: 0xb5322b }));
  seal.rotation.x = -Math.PI / 2;
  seal.position.set(0.22, 1.14, -2.9);
  officeRoom.add(seal);
  const brass = new THREE.MeshStandardMaterial({ color: 0xb18a48, roughness: 0.42, metalness: 0.45 });
  const darkBrass = new THREE.MeshStandardMaterial({ color: 0x6b4d2b, roughness: 0.55, metalness: 0.35 });
  const greenGlass = new THREE.MeshStandardMaterial({ color: 0x1d5146, roughness: 0.25, metalness: 0.15, transparent: true, opacity: 0.9 });
  const tealGlass = new THREE.MeshStandardMaterial({ color: 0x285f61, roughness: 0.3, transparent: true, opacity: 0.9 });
  const paperCream = new THREE.MeshStandardMaterial({ color: 0xd8c7a2, roughness: 0.9 });
  const redLeather = new THREE.MeshStandardMaterial({ color: 0x5b171b, roughness: 0.75 });
  const inkBlack = new THREE.MeshStandardMaterial({ color: 0x121211, roughness: 0.35 });

  // brass desk lamp with a warm shade
  const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.22, 0.05, 14), brass);
  lampBase.position.set(-1.75, 1.13, -3.78); officeRoom.add(lampBase);
  const lampStem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.52, 8), brass);
  lampStem.position.set(-1.75, 1.4, -3.78); officeRoom.add(lampStem);
  const lampArm = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.34, 8), brass);
  lampArm.position.set(-1.6, 1.66, -3.73); lampArm.rotation.z = Math.PI / 2; officeRoom.add(lampArm);
  const lampShade = new THREE.Mesh(
    new THREE.ConeGeometry(0.3, 0.32, 16, 1, true),
    new THREE.MeshStandardMaterial({ color: 0xe0b96a, emissive: 0xffb65c, emissiveIntensity: 1.4, roughness: 0.55, side: THREE.DoubleSide }),
  );
  lampShade.position.set(-1.42, 1.63, -3.73); officeRoom.add(lampShade);
  const deskLampLight = new THREE.PointLight(0xffc477, 3.4, 5.2, 2);
  deskLampLight.position.set(-1.4, 1.52, -3.5); officeRoom.add(deskLampLight);

  // green medicine bottles
  for (const [x, z, h, mat] of [[-1.22, -3.92, 0.3, greenGlass], [-0.98, -3.9, 0.22, tealGlass], [-0.76, -3.93, 0.26, greenGlass]] as Array<[number, number, number, THREE.MeshStandardMaterial]>) {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, h, 10), mat);
    body.position.set(x, 1.12 + h / 2, z); officeRoom.add(body);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.035, 0.07, 8), mat);
    neck.position.set(x, 1.12 + h + 0.035, z); officeRoom.add(neck);
    const cork = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.025, 8), brass);
    cork.position.set(x, 1.12 + h + 0.08, z); officeRoom.add(cork);
  }

  // paper and ledger stacks
  for (let i = 0; i < 7; i++) {
    const sheet = new THREE.Mesh(new THREE.BoxGeometry(0.62 - i * 0.012, 0.018, 0.42 - i * 0.008), paperCream);
    sheet.position.set(1.45 + (i % 2) * 0.02, 1.12 + i * 0.021, -3.62 + (i % 3) * 0.012);
    sheet.rotation.y = (i % 2 ? -1 : 1) * 0.035;
    officeRoom.add(sheet);
  }
  for (let i = 0; i < 3; i++) {
    const book = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.1, 0.46), i === 1 ? redLeather : new THREE.MeshStandardMaterial({ color: 0x243b34, roughness: 0.9 }));
    book.position.set(1.86, 1.16 + i * 0.105, -3.9);
    book.rotation.y = 0.05 * (i - 1);
    officeRoom.add(book);
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.012, 0.48), gold);
    band.position.set(1.86, 1.16 + i * 0.105 + 0.035, -3.9); officeRoom.add(band);
  }

  // inkwell and quills
  const ink = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.12, 12), inkBlack);
  ink.position.set(0.18, 1.18, -3.84); officeRoom.add(ink);
  const inkRim = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.012, 5, 16), brass);
  inkRim.position.set(0.18, 1.245, -3.84); inkRim.rotation.x = Math.PI / 2; officeRoom.add(inkRim);
  const quillHolder = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.3, 12), darkBrass);
  quillHolder.position.set(0.78, 1.27, -3.9); officeRoom.add(quillHolder);
  for (let i = 0; i < 3; i++) {
    const feather = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.58, 4), new THREE.MeshStandardMaterial({ color: 0xd8cfba, roughness: 0.8 }));
    feather.position.set(0.72 + i * 0.055, 1.54, -3.9);
    feather.rotation.z = -0.22 + i * 0.12;
    officeRoom.add(feather);
  }

  // red jewelry box
  const jewel = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.22, 0.4), redLeather);
  jewel.position.set(1.95, 1.24, -3.52); officeRoom.add(jewel);
  const jewelLid = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.04, 0.42), gold);
  jewelLid.position.set(1.95, 1.37, -3.52); officeRoom.add(jewelLid);
  const jewelTop = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), new THREE.MeshStandardMaterial({ color: 0x8d1f2a, roughness: 0.45 }));
  jewelTop.position.set(1.95, 1.43, -3.52); officeRoom.add(jewelTop);

  // small teapot
  const teapot = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), new THREE.MeshStandardMaterial({ color: 0x253c39, roughness: 0.5 }));
  teapot.scale.set(1, 0.8, 1); teapot.position.set(-0.48, 1.24, -3.64); officeRoom.add(teapot);
  const spout = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.22, 8), brass);
  spout.position.set(-0.24, 1.28, -3.64); spout.rotation.z = -Math.PI / 2; officeRoom.add(spout);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.018, 5, 12, Math.PI * 1.5), brass);
  handle.position.set(-0.62, 1.29, -3.64); handle.rotation.z = Math.PI / 2; officeRoom.add(handle);

  // red wall lamp on the left
  const redLampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.08, 12), brass);
  redLampBase.position.set(-5.86, 0.9, -4.25); officeRoom.add(redLampBase);
  const redLampStem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.04, 0.95, 8), brass);
  redLampStem.position.set(-5.86, 1.4, -4.25); officeRoom.add(redLampStem);
  const redLampShade = new THREE.Mesh(
    new THREE.ConeGeometry(0.3, 0.4, 14, 1, true),
    new THREE.MeshStandardMaterial({ color: 0x9c2630, emissive: 0xff5b53, emissiveIntensity: 1.3, roughness: 0.5, transparent: true, opacity: 0.82, side: THREE.DoubleSide }),
  );
  redLampShade.position.set(-5.86, 1.94, -4.25); officeRoom.add(redLampShade);
  const redLampLight = new THREE.PointLight(0xff654c, 2.4, 5, 2);
  redLampLight.position.set(-5.72, 1.82, -4.15); officeRoom.add(redLampLight);

  const officeWindow = new THREE.Mesh(
    new THREE.PlaneGeometry(4.2, 2.6),
    new THREE.MeshStandardMaterial({ color: 0x070c14, emissive: 0x0d1824, emissiveIntensity: 0.45, roughness: 0.55 }),
  );
  officeWindow.position.set(0, 3.85, -5.48);
  officeRoom.add(officeWindow);
  for (let i = -2; i <= 2; i++) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.055, 2.6, 0.05), gold);
    bar.position.set(i * 1.05, 3.85, -5.36);
    officeRoom.add(bar);
  }
  for (const y of [2.55, 5.15]) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(4.3, 0.06, 0.05), gold);
    bar.position.set(0, y, -5.36);
    officeRoom.add(bar);
  }
  for (const x of [-2.28, 2.28]) {
    const jamb = new THREE.Mesh(new THREE.BoxGeometry(0.14, 3.0, 0.14), gold);
    jamb.position.set(x, 3.85, -5.32);
    officeRoom.add(jamb);
  }
  for (const y of [2.38, 5.32]) {
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(4.7, 0.15, 0.16), gold);
    lintel.position.set(0, y, -5.32);
    officeRoom.add(lintel);
  }
  for (const side of [-1, 1]) {
    const curtain = new THREE.Mesh(new THREE.PlaneGeometry(0.92, 3.55), curtainMat);
    curtain.position.set(side * 2.62, 3.72, -5.26);
    curtain.rotation.y = side * 0.06;
    officeRoom.add(curtain);
    const tie = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.09, 0.08), gold);
    tie.position.set(side * 2.62, 2.9, -5.2);
    officeRoom.add(tie);
  }
  const valance = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.42, 0.22), curtainMat);
  valance.position.set(0, 5.52, -5.24);
  officeRoom.add(valance);
  const valanceFringe = new THREE.Mesh(new THREE.BoxGeometry(5.55, 0.07, 0.24), gold);
  valanceFringe.position.set(0, 5.28, -5.22);
  officeRoom.add(valanceFringe);
  for (let i = 0; i < 4; i++) {
    const candle = new THREE.PointLight(0xffa15c, 5.5, 11, 2);
    candle.position.set(i % 2 === 0 ? -3.4 : 3.4, 3.0, i < 2 ? -2.0 : 2.4);
    officeRoom.add(candle);
    const glow = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: makeGlowTexture(), color: 0xffb066, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false }),
    );
    glow.position.copy(candle.position);
    glow.scale.setScalar(1.4);
    officeRoom.add(glow);
  }
  const officeHemi = new THREE.HemisphereLight(0xc7a47a, 0x1a120e, 1.35);
  officeRoom.add(officeHemi);
  const officeKey = new THREE.PointLight(0xffd2a0, 10, 15, 2);
  officeKey.position.set(0, 4.5, 1.8);
  officeRoom.add(officeKey);
  const deskLight = new THREE.PointLight(0xffb46c, 8, 9, 2);
  deskLight.position.set(0, 2.5, -2.8);
  officeRoom.add(deskLight);
  const yubabaKey = new THREE.PointLight(0xffc17d, 7, 8, 2);
  yubabaKey.position.set(0, 3.2, -2.3);
  officeRoom.add(yubabaKey);
  const boh = createBoh();
  boh.position.set(4.75, 0.2, -2.55);
  boh.rotation.y = -Math.PI / 4;
  officeRoom.add(boh);
  // Boh stays in his normal state; the crying texture is no longer used.
  boh.children.forEach((child) => { child.visible = false; });
  const bohNormalTex = new THREE.TextureLoader().load('images/boh_normal.png');
  bohNormalTex.colorSpace = THREE.SRGBColorSpace;
  const bohNormalMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({
      map: bohNormalTex,
      transparent: true,
      alphaTest: 0.14,
      depthWrite: false,
      toneMapped: false,
      fog: false,
      side: THREE.DoubleSide,
    }),
  );
  const bohHeight = 1.96;
  bohNormalMesh.scale.set(bohHeight * (815 / 850), bohHeight, 1);
  bohNormalMesh.position.set(0, bohHeight / 2 - 0.02, 0.22);
  boh.add(bohNormalMesh);
  boh.userData.cutout = bohNormalMesh;

  // Open-front play tent around Boh.
  const tent = new THREE.Group();
  tent.position.set(4.75, 0, -2.55);
  tent.rotation.y = -Math.PI / 4;
  const tentRose = new THREE.MeshStandardMaterial({ color: 0x9f5558, roughness: 0.94, side: THREE.DoubleSide });
  const tentCream = new THREE.MeshStandardMaterial({ color: 0xe2d1b2, roughness: 0.96, side: THREE.DoubleSide });
  const tentDeep = new THREE.MeshStandardMaterial({ color: 0x6f3037, roughness: 0.94, side: THREE.DoubleSide });
  const tentGold = new THREE.MeshStandardMaterial({ color: 0xb08a4c, roughness: 0.55, metalness: 0.25 });
  // floor rug
  const tentRug = new THREE.Mesh(new THREE.CylinderGeometry(1.75, 1.75, 0.035, 28), tentCream);
  tentRug.position.y = 0.025;
  tent.add(tentRug);
  const rugRing = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.035, 4, 32), tentGold);
  rugRing.rotation.x = Math.PI / 2;
  rugRing.position.y = 0.05;
  tent.add(rugRing);
  // four posts
  for (const x of [-1.55, 1.55]) {
    for (const z of [-1.15, 1.15]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 2.5, 8), tentGold);
      post.position.set(x, 1.25, z);
      tent.add(post);
      const foot = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), tentGold);
      foot.position.set(x, 0.08, z);
      tent.add(foot);
    }
  }
  // fabric back and side walls
  const tentBack = new THREE.Mesh(new THREE.PlaneGeometry(2.95, 2.15), tentRose);
  tentBack.position.set(0, 1.35, -1.28);
  tent.add(tentBack);
  for (const side of [-1, 1]) {
    const sideWall = new THREE.Mesh(new THREE.PlaneGeometry(2.35, 2.15), tentDeep);
    sideWall.position.set(side * 1.48, 1.35, 0);
    sideWall.rotation.y = side * Math.PI / 2;
    tent.add(sideWall);
  }
  // peaked fabric roof
  const tentRoof = new THREE.Mesh(new THREE.ConeGeometry(2.25, 1.18, 4), tentRose);
  tentRoof.position.set(0, 2.62, 0);
  tentRoof.rotation.y = Math.PI / 4;
  tentRoof.scale.z = 0.84;
  tent.add(tentRoof);
  const roofBand = new THREE.Mesh(new THREE.BoxGeometry(3.35, 0.12, 2.75), tentGold);
  roofBand.position.set(0, 2.38, 0);
  tent.add(roofBand);
  const finial = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), tentGold);
  finial.position.set(0, 3.28, 0);
  tent.add(finial);
  // open front curtains tied to the posts
  for (const side of [-1, 1]) {
    const curtain = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 2.0, 3, 1), tentCream);
    curtain.position.set(side * 1.15, 1.25, 1.19);
    curtain.rotation.y = side * -0.18;
    tent.add(curtain);
    const tie = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.025, 4, 12), tentGold);
    tie.position.set(side * 1.15, 0.72, 1.22);
    tie.rotation.x = Math.PI / 2;
    tent.add(tie);
  }
  // triangular bunting across the front
  const buntingColors = [tentRose, tentCream, tentGold, tentDeep];
  for (let i = 0; i < 9; i++) {
    const flag = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.32, 3), buntingColors[i % buntingColors.length]);
    flag.position.set(-1.25 + i * 0.31, 2.2 - Math.sin(i / 8 * Math.PI) * 0.12, 1.24);
    flag.rotation.z = Math.PI;
    tent.add(flag);
  }
  // cushions and a small blanket for Boh
  const cushionColors = [tentCream, tentRose, tentDeep, tentCream];
  for (let i = 0; i < 4; i++) {
    const cushion = new THREE.Mesh(new THREE.SphereGeometry(0.38, 12, 8), cushionColors[i]);
    cushion.scale.set(1.2, 0.36, 0.9);
    cushion.position.set(-1.2 + i * 0.8, 0.16, 0.38 + (i % 2) * 0.35);
    tent.add(cushion);
  }
  const tentLight = new THREE.PointLight(0xffc07a, 2.4, 5, 2);
  tentLight.position.set(0, 1.65, 0.4);
  tent.add(tentLight);
  officeRoom.add(tent);
  const crib = new THREE.Group();
  for (const x of [-0.9, 0.9]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.35, 6), wood);
    post.position.set(x, 0.68, 0);
    crib.add(post);
  }
  for (const z of [-0.9, 0.9]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.09, 0.07), gold);
    rail.position.set(0, 1.02, z);
    crib.add(rail);
  }
  crib.position.set(3.7, 0, -4.05);
  crib.visible = false;
  officeRoom.add(crib);
  const heads = createThreeHeads();
  heads.position.set(-3.7, 1.05, -5.0);
  officeRoom.add(heads);
  const yubaba = createYubaba();
  yubaba.position.set(0, 0.12, -4.35);
  yubaba.rotation.y = Math.PI;
  yubaba.scale.setScalar(1.08);
  officeRoom.add(yubaba);
  office.add(officeRoom);

  const boiler = new THREE.Group();
  boiler.visible = false;
  const brick = new THREE.MeshStandardMaterial({ color: 0x4a3328, roughness: 0.98 });
  const iron = new THREE.MeshStandardMaterial({ color: 0x282a28, roughness: 0.7, metalness: 0.25 });
  const ember = new THREE.MeshStandardMaterial({ color: 0x7a2b16, emissive: 0xff6a24, emissiveIntensity: 1.8, roughness: 0.7 });
  const boilerFloorMat = new THREE.MeshStandardMaterial({ map: makeBoilerFloorTexture(), color: 0x8a6a4a, roughness: 0.98 });
  const boilerFloor = new THREE.Mesh(new THREE.PlaneGeometry(13, 12), boilerFloorMat);
  boilerFloor.rotation.x = -Math.PI / 2;
  boiler.add(boilerFloor);
  const frontFloor = new THREE.Mesh(new THREE.PlaneGeometry(13, 9), boilerFloorMat);
  frontFloor.rotation.x = -Math.PI / 2;
  frontFloor.position.z = 10.5;
  boiler.add(frontFloor);
  for (const side of [-1, 1]) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 7, 12), brick);
    wall.position.set(side * 6.4, 3.5, 0);
    boiler.add(wall);
    const wallExtension = new THREE.Mesh(new THREE.BoxGeometry(0.3, 7, 9), brick);
    wallExtension.position.set(side * 6.4, 3.5, 10.5);
    boiler.add(wallExtension);
  }
  const back = new THREE.Mesh(new THREE.BoxGeometry(13, 7, 0.3), brick);
  back.position.set(0, 3.5, -5.8);
  boiler.add(back);
  // Close the entrance side of the boiler room so turning the camera around
  // never exposes a blank void behind Chihiro.
  const frontWall = new THREE.Mesh(new THREE.BoxGeometry(13, 7, 0.3), brick);
  frontWall.position.set(0, 3.5, 14.6);
  boiler.add(frontWall);
  const frontStone = new THREE.Mesh(new THREE.PlaneGeometry(12.6, 6.5), new THREE.MeshStandardMaterial({ map: makeBoilerStoneTexture(), roughness: 0.98 }));
  frontStone.position.set(0, 3.35, 14.43);
  frontStone.rotation.y = Math.PI;
  boiler.add(frontStone);
  // heavy boiler tanks and pipes against the entrance wall
  for (const [x, z, r, h] of [[-4.3, 13.5, 0.95, 4.2], [4.1, 13.5, 0.9, 4.0]] as Array<[number, number, number, number]>) {
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 14), iron);
    tank.position.set(x, h / 2, z);
    tank.castShadow = true;
    boiler.add(tank);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), iron);
    cap.position.set(x, h, z);
    boiler.add(cap);
  }
  const frontDoor = new THREE.Mesh(new THREE.BoxGeometry(2.7, 3.5, 0.18), gateWood);
  frontDoor.position.set(0, 1.75, 14.4);
  boiler.add(frontDoor);
  const frontDoorFrame = new THREE.Mesh(new THREE.BoxGeometry(3.15, 3.85, 0.25), gatePlaster);
  frontDoorFrame.position.set(0, 1.92, 14.46);
  boiler.add(frontDoorFrame);
  const frontDoorPanel = new THREE.Mesh(new THREE.BoxGeometry(2.65, 3.4, 0.06), wood);
  frontDoorPanel.position.set(0, 1.78, 14.32);
  boiler.add(frontDoorPanel);
  for (let i = 0; i < 5; i++) {
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 12.2, 8), iron);
    pipe.rotation.z = Math.PI / 2;
    pipe.position.set(0, 4.6 + i * 0.45, 14.1);
    boiler.add(pipe);
  }
  const entryLamp = new THREE.PointLight(0xffa86a, 5, 12, 2);
  entryLamp.position.set(0, 4.2, 11.5);
  boiler.add(entryLamp);

  // Reference background: honey-wood drawer wall, rough stone wall and beams.
  const drawerMat = new THREE.MeshStandardMaterial({ map: makeBoilerDrawerTexture(), roughness: 0.93, side: THREE.DoubleSide });
  const stoneMat = new THREE.MeshStandardMaterial({ map: makeBoilerStoneTexture(), roughness: 0.98, side: THREE.DoubleSide });
  const drawerBack = new THREE.Mesh(new THREE.PlaneGeometry(8.2, 6.6), drawerMat);
  drawerBack.position.set(2.1, 3.3, -5.62);
  boiler.add(drawerBack);
  const drawerRight = new THREE.Mesh(new THREE.PlaneGeometry(11.4, 6.6), drawerMat);
  drawerRight.position.set(6.23, 3.3, 0);
  drawerRight.rotation.y = -Math.PI / 2;
  boiler.add(drawerRight);
  const stoneBack = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 6.6), stoneMat);
  stoneBack.position.set(-4.05, 3.3, -5.61);
  boiler.add(stoneBack);
  const stoneLeft = new THREE.Mesh(new THREE.PlaneGeometry(11.4, 6.6), stoneMat);
  stoneLeft.position.set(-6.23, 3.3, 0);
  stoneLeft.rotation.y = Math.PI / 2;
  boiler.add(stoneLeft);
  // heavy wooden frame around the drawer wall
  for (const x of [-1.85, 0.4, 2.65, 4.9, 6.15]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, 6.6, 0.16), new THREE.MeshStandardMaterial({ color: 0x4a2c19, roughness: 0.9 }));
    post.position.set(x, 3.3, -5.52);
    boiler.add(post);
  }
  for (const y of [0.08, 1.5, 3.3, 5.1, 6.55]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.1, 0.16), new THREE.MeshStandardMaterial({ color: 0x4a2c19, roughness: 0.9 }));
    rail.position.set(2.1, y, -5.51);
    boiler.add(rail);
  }
  for (let i = 0; i < 5; i++) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(12.8, 0.22, 0.3), new THREE.MeshStandardMaterial({ color: 0x3c2415, roughness: 0.9 }));
    beam.position.set(0, 6.45 - i * 0.19, -2.2 + i * 1.4);
    boiler.add(beam);
  }
  // dark arched tunnel in the stone wall
  const archShape = new THREE.Shape();
  archShape.moveTo(-1.15, 0); archShape.lineTo(1.15, 0); archShape.lineTo(1.15, 1.55);
  archShape.absarc(0, 1.55, 1.15, 0, Math.PI, false); archShape.lineTo(-1.15, 0);
  const arch = new THREE.Mesh(new THREE.ShapeGeometry(archShape), new THREE.MeshBasicMaterial({ color: 0x110d0b, side: THREE.DoubleSide }));
  arch.position.set(-6.2, 0.3, -1.6);
  arch.rotation.y = Math.PI / 2;
  boiler.add(arch);
  const archRing = new THREE.Mesh(new THREE.TorusGeometry(1.28, 0.16, 6, 18, Math.PI), new THREE.MeshStandardMaterial({ color: 0x6e5a46, roughness: 0.96 }));
  archRing.position.set(-6.17, 1.85, -1.6);
  archRing.rotation.y = Math.PI / 2;
  boiler.add(archRing);
  // shaft of dusty light from the upper left
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 2.6, 8.5, 12, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xffd6a0, transparent: true, opacity: 0.045, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }),
  );
  shaft.name = 'boilerLightShaft';
  shaft.position.set(-4.0, 4.0, -0.2);
  shaft.rotation.z = 0.2;
  boiler.add(shaft);
  // furnace mouth
  const furnace = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.3, 0.5), iron);
  furnace.position.set(3.1, 1.2, -5.35);
  boiler.add(furnace);
  const fire = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.4), ember);
  fire.position.set(3.1, 1.15, -5.07);
  boiler.add(fire);
  const fireLight = new THREE.PointLight(0xff722c, 12, 14, 2);
  fireLight.position.set(3.1, 1.5, -4.4);
  boiler.add(fireLight);
  // boilers and pipes
  for (const [x, z, r] of [[5.15, -4.7, 0.55], [5.1, -2.8, 0.48]]) {
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 3.4, 14), iron);
    tank.position.set(x, 1.7, z);
    tank.castShadow = true;
    boiler.add(tank);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), iron);
    cap.position.set(x, 3.4, z);
    boiler.add(cap);
  }
  for (let i = 0; i < 9; i++) {
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 5.5, 8), i % 2 === 0 ? iron : new THREE.MeshStandardMaterial({ color: 0x5b4632, roughness: 0.9 }));
    pipe.rotation.z = Math.PI / 2;
    pipe.position.set(-1.8 + i * 0.8, 4.2 + (i % 3) * 0.6, -5.35);
    boiler.add(pipe);
  }
  // Kamaji's platform
  const platform = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.6, 2.2), new THREE.MeshStandardMaterial({ color: 0x5c402b, roughness: 0.92 }));
  platform.position.set(-1.9, 0.3, -3.9);
  boiler.add(platform);

  // bedroll, red blanket and pillow on Kamaji's platform
  const blanketMat = new THREE.MeshStandardMaterial({ color: 0x9d2d2d, roughness: 0.9 });
  const blanket = new THREE.Mesh(new THREE.BoxGeometry(3.55, 0.08, 1.65), blanketMat);
  blanket.position.set(-2.0, 0.66, -3.88);
  boiler.add(blanket);
  const blanketDrape = new THREE.Mesh(new THREE.BoxGeometry(3.55, 0.62, 0.08), blanketMat);
  blanketDrape.position.set(-2.0, 0.35, -3.02);
  boiler.add(blanketDrape);
  for (let i = 0; i < 4; i++) {
    const fold = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.58, 0.1), new THREE.MeshStandardMaterial({ color: 0x7f2026, roughness: 0.9 }));
    fold.position.set(-3.2 + i * 0.8, 0.34, -3.0);
    boiler.add(fold);
  }
  const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.18, 0.55), new THREE.MeshStandardMaterial({ color: 0xcbbd9e, roughness: 0.95 }));
  pillow.position.set(-3.55, 0.78, -4.2);
  pillow.rotation.z = -0.08;
  boiler.add(pillow);

  // big brass kettle on the platform
  const kettle = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 12), new THREE.MeshStandardMaterial({ color: 0xb78b3e, roughness: 0.4, metalness: 0.45 }));
  kettle.scale.set(1.15, 0.9, 1);
  kettle.position.set(-3.0, 1.02, -4.05);
  boiler.add(kettle);
  const kettleLid = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.06, 12), iron);
  kettleLid.position.set(-3.0, 1.35, -4.05);
  boiler.add(kettleLid);
  const kettleHandle = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.035, 6, 14, Math.PI), iron);
  kettleHandle.position.set(-3.0, 1.44, -4.05);
  boiler.add(kettleHandle);
  const kettleSpout = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.38, 8), iron);
  kettleSpout.position.set(-2.67, 1.13, -4.05);
  kettleSpout.rotation.z = -Math.PI / 2;
  boiler.add(kettleSpout);

  // large valve wheel on the front of the platform
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x383733, roughness: 0.65, metalness: 0.35 });
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.055, 7, 22), wheelMat);
  wheel.position.set(-3.55, 1.48, -1.78);
  boiler.add(wheel);
  for (let i = 0; i < 6; i++) {
    const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.02, 6), wheelMat);
    spoke.position.set(-3.55, 1.48, -1.76);
    spoke.rotation.z = (i / 6) * Math.PI * 2;
    boiler.add(spoke);
  }
  const hub = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), wheelMat);
  hub.position.set(-3.55, 1.48, -1.72);
  boiler.add(hub);
  const wheelMount = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.5, 0.25), iron);
  wheelMount.position.set(-3.55, 1.05, -2.1);
  boiler.add(wheelMount);

  // rough stone ledge with a bottle on the left
  const ledge = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.35, 1.25), stoneMat);
  ledge.position.set(-5.55, 0.68, -2.0);
  boiler.add(ledge);
  const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 0.62, 10), new THREE.MeshStandardMaterial({ color: 0x4e6b57, roughness: 0.35, transparent: true, opacity: 0.8 }));
  bottle.position.set(-5.55, 1.7, -2.0);
  boiler.add(bottle);
  const bottleNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.22, 8), iron);
  bottleNeck.position.set(-5.55, 2.1, -2.0);
  boiler.add(bottleNeck);

  // cabinet/counter with amber glass jars in front of the platform
  const counter = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.95, 0.9), new THREE.MeshStandardMaterial({ color: 0x66432b, roughness: 0.94 }));
  counter.position.set(-2.55, 0.48, -2.39);
  boiler.add(counter);
  const jarMat = new THREE.MeshStandardMaterial({ color: 0x7b5e3f, roughness: 0.3, transparent: true, opacity: 0.72, metalness: 0.05 });
  for (const [x, z, r, h] of [[-3.55, -2.36, 0.34, 0.75], [-2.8, -2.36, 0.31, 0.68], [-2.05, -2.36, 0.3, 0.7]] as Array<[number, number, number, number]>) {
    const jar = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.9, h, 14), jarMat);
    jar.position.set(x, 1.1 + h / 2, z);
    boiler.add(jar);
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(r + 0.04, r + 0.04, 0.1, 14), new THREE.MeshStandardMaterial({ color: 0x5a4d3a, roughness: 0.8 }));
    lid.position.set(x, 1.1 + h + 0.05, z);
    boiler.add(lid);
  }
  const boilerHemi = new THREE.HemisphereLight(0xc08a5c, 0x21120c, 1.45);
  boiler.add(boilerHemi);
  const boilerKey = new THREE.PointLight(0xffb774, 16, 18, 2);
  boilerKey.position.set(0.4, 4.2, 2.2);
  boiler.add(boilerKey);
  const kamajiLight = new THREE.PointLight(0xffc38c, 12, 10, 2);
  kamajiLight.position.set(-1.7, 3.4, -2.2);
  boiler.add(kamajiLight);
  const kamaji = createKamaji();
  kamaji.position.set(-1.9, 0.6, -3.8);
  kamaji.rotation.y = 0.1;
  boiler.add(kamaji);
  // The reference-art cutout replaces the procedural six-armed boiler man.
  kamaji.visible = false;
  const kamajiTexture = new THREE.TextureLoader().load('images/kamaji_cutout.png');
  kamajiTexture.colorSpace = THREE.SRGBColorSpace;
  const kamajiCutout = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: kamajiTexture,
      transparent: true,
      alphaTest: 0.02,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  const cutoutAspect = 648 / 350;
  const cutoutWidth = 4.9;
  kamajiCutout.scale.set(cutoutWidth, cutoutWidth / cutoutAspect, 1);
  kamajiCutout.position.set(-1.9, 1.9, -3.32);
  boiler.add(kamajiCutout);
  const lin = createLin();
  lin.position.set(1.85, 0, -3.0);
  lin.rotation.y = -0.35;
  boiler.add(lin);
  // coal pile and soot sprites
  const coalMat = new THREE.MeshStandardMaterial({ color: 0x171616, roughness: 0.86 });
  for (let i = 0; i < 14; i++) {
    const lump = new THREE.Mesh(new THREE.DodecahedronGeometry(0.16 + rand(i) * 0.12, 0), coalMat);
    lump.position.set(-3.1 + (rand(i + 2) - 0.5) * 1.6, 0.12, 1.0 + (rand(i + 4) - 0.5) * 1.2);
    lump.rotation.set(rand(i + 6) * 3, rand(i + 8) * 3, rand(i + 9) * 3);
    boiler.add(lump);
  }
  const soot: THREE.Group[] = [];
  for (let i = 0; i < 12; i++) {
    const sprite = createSoot();
    sprite.position.set(-2.5 + (rand(i + 3) - 0.5) * 4, 0.12, 0.1 + (rand(i + 5) - 0.5) * 3);
    boiler.add(sprite);
    const thrown = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.12, 0),
      new THREE.MeshStandardMaterial({ color: 0x11100f, emissive: 0x060504, emissiveIntensity: 0.35, roughness: 0.58 }),
    );
    thrown.visible = false;
    boiler.add(thrown);
    sprite.userData.thrown = thrown;
    soot.push(sprite);
  }
  const coal = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22, 0), coalMat);
  coal.position.set(-2.4, 0.3, 1.2);
  coal.castShadow = true;
  boiler.add(coal);
  const boilerGlow = new THREE.PointLight(0xffa05e, 4, 10, 2);
  boilerGlow.position.set(-1.8, 3.2, 1.4);
  boiler.add(boilerGlow);

  // Exit door from the boiler room to the upper floor.
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x3a2117, roughness: 0.88 });
  const doorTrim = new THREE.MeshStandardMaterial({ color: 0x20150f, roughness: 0.92 });
  const doorHandleMat = new THREE.MeshStandardMaterial({ color: 0xb08a4c, roughness: 0.45, metalness: 0.35 });
  const boilerDoor = new THREE.Group();
  boilerDoor.position.set(-4.2, 0, -5.34);
  const frame = new THREE.Mesh(new THREE.BoxGeometry(2.35, 3.45, 0.18), doorTrim);
  frame.position.set(0, 1.72, -0.06);
  boilerDoor.add(frame);
  const leaves: THREE.Group[] = [];
  for (const side of [-1, 1]) {
    const leaf = new THREE.Group();
    leaf.position.set(side * 0.92, 0, 0.02);
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.86, 2.88, 0.12), doorMat);
    panel.position.set(-side * 0.43, 1.47, 0);
    leaf.add(panel);
    for (const y of [0.62, 1.47, 2.32]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.07, 0.04), doorTrim);
      rail.position.set(-side * 0.43, y, 0.09);
      leaf.add(rail);
    }
    const handle = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), doorHandleMat);
    handle.position.set(-side * 0.72, 1.28, 0.1);
    leaf.add(handle);
    boilerDoor.add(leaf);
    leaves.push(leaf);
  }
  boilerDoor.userData.leaves = leaves;
  const doorGlow = new THREE.PointLight(0xffb06a, 1.6, 4.5, 2);
  doorGlow.position.set(0, 3.4, 0.5);
  boilerDoor.add(doorGlow);
  const exitSign = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.28), new THREE.MeshBasicMaterial({ map: signTexture('上へ'), toneMapped: false, side: THREE.DoubleSide }));
  exitSign.position.set(0, 3.3, 0.16);
  boilerDoor.add(exitSign);
  boiler.add(boilerDoor);
  group.add(boiler);

  let stage: 'bridge' | 'office' | 'boiler' = 'bridge';
  let walking = false;
  const setStage = (next: 'bridge' | 'office' | 'boiler') => {
    stage = next;
    exterior.visible = next === 'bridge';
    officeRoom.visible = next === 'office';
    office.visible = next === 'office';
    boiler.visible = next === 'boiler';
  };

  const update = (time: number, dt: number) => {
    smoke.rotation.y += dt * 0.05;
    const glowMat = smoke.material as THREE.PointsMaterial;
    glowMat.opacity = 0.14 + Math.sin(time * 0.7) * 0.035;
    ghosts.forEach((ghost) => {
      const base = bridgeHeightAt(Number(ghost.userData.baseZ) || 0) + 0.62;
      ghost.position.y = base + Math.sin(time * 1.35 + ghost.userData.phase) * 0.09;
    });
    if (stage === 'office') {
      boh.position.y = 0.2 + Math.sin(time * 1.5) * 0.018;
      boh.rotation.z = Math.sin(time * 0.8) * 0.02;

      heads.children.forEach((head) => {
        if (typeof head.userData.baseY === 'number') {
          const phase = head.userData.phase || 0;
          // staggered hops: each head jumps and lands at a different moment
          const hop = Math.max(0, Math.sin(time * 3.1 + phase));
          head.position.y = head.userData.baseY + hop * 0.16;
          head.rotation.z = Math.sin(time * 1.3 + phase) * 0.04 + hop * Math.sin(phase) * 0.025;
          head.scale.set(1 + (1 - hop) * 0.035, 1 + hop * 0.055, 1);
        }
      });
    }
    if (stage === 'boiler') {
      // Each soot picks up one coal, runs to the furnace, pauses, winds up,
      // throws the coal, then scurries back for the next one.
      soot.forEach((sprite, i) => {
        const phase = (time * 0.075 + i / soot.length) % 1;
        const startX = -2.35;
        const startZ = 0.95;
        const endX = 2.35;
        const endZ = -4.68;
        let go = 1;
        if (phase < 0.40) go = phase / 0.40;
        else if (phase < 0.58) go = 1;
        else go = 1 - (phase - 0.58) / 0.42;
        go = THREE.MathUtils.clamp(go, 0, 1);
        const ease = go * go * (3 - 2 * go);
        const wobble = Math.sin(time * 8 + i * 1.7) * 0.045;
        sprite.position.x = THREE.MathUtils.lerp(startX, endX, ease) + wobble;
        sprite.position.z = THREE.MathUtils.lerp(startZ, endZ, ease) + Math.cos(time * 7 + i) * 0.04;
        sprite.position.y = 0.11 + Math.sin(go * Math.PI) * 0.13 + Math.abs(Math.sin(time * 9 + i)) * 0.022;
        sprite.rotation.y = phase < 0.5
          ? Math.atan2(endX - startX, endZ - startZ)
          : Math.atan2(startX - endX, startZ - endZ);
        const throwT = phase >= 0.40 && phase < 0.51 ? (phase - 0.40) / 0.11 : -1;
        sprite.rotation.x = throwT >= 0 ? -Math.sin(throwT * Math.PI) * 0.55 : 0;
        const squat = throwT >= 0 ? 1 + Math.sin(throwT * Math.PI) * 0.08 : 1;
        sprite.scale.set(squat, 1 - (squat - 1) * 0.7, squat);
        const eyeRoot = sprite.userData.eyeRoot as THREE.Group | undefined;
        if (eyeRoot) {
          eyeRoot.rotation.y = Math.sin(time * 1.8 + i * 1.3) * 0.34;
          eyeRoot.rotation.x = Math.sin(time * 1.5 + i * 0.7) * 0.11;
        }
        const pupils = sprite.userData.pupils as THREE.Mesh[] | undefined;
        pupils?.forEach((pupil, k) => {
          pupil.position.x = Math.sin(time * 2.0 + i + k) * 0.006;
          pupil.position.y = Math.cos(time * 1.7 + i * 0.8) * 0.005;
        });
        const carried = sprite.userData.carried as THREE.Mesh | undefined;
        if (carried) carried.visible = phase < 0.40 || phase > 0.95;
        const thrown = sprite.userData.thrown as THREE.Mesh | undefined;
        if (thrown) {
          thrown.visible = throwT >= 0;
          if (throwT >= 0) {
            const t = Math.min(1, throwT);
            thrown.position.set(
              THREE.MathUtils.lerp(endX + 0.05, 3.1, t),
              0.42 + Math.sin(t * Math.PI) * 0.72 + t * 0.55,
              THREE.MathUtils.lerp(endZ + 0.15, -5.05, t),
            );
          }
        }
      });
      fireLight.intensity = 10 + Math.sin(time * 7) * 2;
      kamajiCutout.position.y = 1.9 + Math.sin(time * 0.7) * 0.018;
    }
    if (stage === 'bridge') {
      // The imported Haku clip is a five-second turn-and-step performance.
      // Move him at a matching pace so the feet and body turn stay in sync.
      haku.userData.walking = walking;
      if (walking) {
        haku.position.z = Math.min(18.8, haku.position.z + dt * 2.48);
      } else {
        haku.position.z += (6.4 - haku.position.z) * (1 - Math.exp(-dt * 1.2));
      }
      haku.position.y = bridgeHeightAt(haku.position.z) + 0.02;
      const facingPlayer = haku.userData.facingPlayer === true;
      const targetYaw = walking ? 0 : (facingPlayer ? Math.PI : Math.sin(time * 0.8) * 0.025);
      const yawDelta = Math.atan2(Math.sin(targetYaw - haku.rotation.y), Math.cos(targetYaw - haku.rotation.y));
      haku.rotation.y += yawDelta * (1 - Math.exp(-dt * 7));
    }
  };

  const setWalking = (value: boolean) => { walking = value; };
  return {
    group,
    exterior,
    office,
    playerStart: new THREE.Vector3(0, bridgeHeightAt(-1.0), -1.0),
    hakuTrigger: new THREE.Vector3(0, 0, 5.3),
    entranceTrigger: new THREE.Vector3(0, 0, 19.8),
    officePlayerStart: new THREE.Vector3(0, 0, 3.0),
    haku,
    yubaba,
    boh,
    heads,
    kamaji,
    kamajiCutout,
    lin,
    boilerDoor,
    boilerDoorTrigger: new THREE.Vector3(-4.2, 0, -4.0),
    officeDeskTrigger: new THREE.Vector3(0, 0, -0.85),
    soot,
    ghosts,
    coal,
    boilerPlayerStart: new THREE.Vector3(0, 0, 3.2),
    furnaceTrigger: new THREE.Vector3(3.1, 0, -3.5),
    boiler,
    stage,
    bridgeHeightAt,
    setStage,
    setHakuWalking: setWalking,
    update,
  };
}

// ============================================================
// Chapter 1 — the sunlit meadow between the tunnel and the market
// ============================================================

export function meadowPathX(z: number): number {
  return Math.sin(z * 0.11) * 2.55 + Math.sin(z * 0.045) * 1.15;
}

const MEADOW_CREEK_Z = 24;
const MEADOW_CREEK_HALF_WIDTH = 1.75;

export function meadowHeightAt(x: number, z: number): number {
  const base = z * 0.27;
  const rolling =
    Math.sin(x * 0.13 + 0.4) * 0.55 +
    Math.sin(z * 0.085) * 0.7 +
    Math.sin((x + z) * 0.055) * 0.36;
  const center = meadowPathX(z);
  const flatten = Math.exp(-Math.pow((x - center) / 4.0, 2));
  // Carve a shallow channel across the middle of the meadow. The power-of-four
  // falloff keeps the banks soft while making a real bed below the water.
  const creek = Math.exp(-Math.pow((z - MEADOW_CREEK_Z) / 2.15, 4)) * 1.6;
  return base + rolling * (1 - flatten * 0.86) - 0.22 - creek;
}

function makeGrassTuftGeometry(): THREE.BufferGeometry {
  const positions: number[] = [];
  const blades = 5;
  for (let i = 0; i < blades; i++) {
    const a = (i / blades) * TAU + rand(i + 4) * 0.8;
    const bx = Math.cos(a) * 0.03;
    const bz = Math.sin(a) * 0.03;
    const px = Math.cos(a + Math.PI / 2) * 0.018;
    const pz = Math.sin(a + Math.PI / 2) * 0.018;
    const height = 0.2 + rand(i + 9) * 0.2;
    const reach = 0.055 + rand(i + 12) * 0.08;
    const tx = Math.cos(a) * reach;
    const tz = Math.sin(a) * reach;
    positions.push(
      bx + px, 0, bz + pz,
      bx - px, 0, bz - pz,
      tx, height, tz,
    );
    // a second, shorter blade for density
    positions.push(
      bx - px * 0.7, 0, bz - pz * 0.7,
      bx + px * 0.7, 0, bz + pz * 0.7,
      tx * 0.62 - px * 0.6, height * 0.64, tz * 0.62 - pz * 0.6,
    );
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  return geo;
}

function makeCumulus(x: number, y: number, z: number, scale: number, seed: number, opacity = 0.96): THREE.Group {
  const group = new THREE.Group();
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity,
    depthWrite: false,
    fog: false,
    toneMapped: false,
  });
  const puffs = 11;
  for (let i = 0; i < puffs; i++) {
    const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), material);
    const a = rand(seed + i * 3) * TAU;
    const r = rand(seed + i * 5) * 1.7;
    mesh.position.set(
      Math.cos(a) * r * 1.9,
      rand(seed + i * 7) * 1.25,
      Math.sin(a) * r * 0.85,
    );
    mesh.scale.set(
      1.0 + rand(seed + i + 2) * 1.55,
      0.58 + rand(seed + i + 4) * 0.72,
      0.75 + rand(seed + i + 6) * 1.0,
    );
    group.add(mesh);
  }
  // a larger soft base
  const base = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), material);
  base.scale.set(2.9, 0.4, 1.25);
  base.position.y = -0.32;
  group.add(base);
  group.position.set(x, y, z);
  group.scale.setScalar(scale);
  group.userData.cloud = true;
  return group;
}

function createMossyHead(seed: number, scale: number): THREE.Group {
  const group = new THREE.Group();
  const stone = new THREE.MeshStandardMaterial({
    color: 0x7d806d,
    roughness: 1,
    flatShading: true,
  });
  const dark = new THREE.MeshStandardMaterial({ color: 0x3d4238, roughness: 1, flatShading: true });
  const moss = new THREE.MeshStandardMaterial({ color: 0x557340, roughness: 1, flatShading: true });
  const mossLight = new THREE.MeshStandardMaterial({ color: 0x6f8c50, roughness: 1, flatShading: true });

  const base = new THREE.Mesh(new THREE.DodecahedronGeometry(1.22, 0), stone);
  base.scale.set(1.12, 0.66, 0.92);
  base.position.y = 0.15;
  base.rotation.set(rand(seed) * 0.3, rand(seed + 2) * 1.2, rand(seed + 4) * 0.2);
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.95, 9, 7), stone);
  head.scale.set(0.96, 1.22, 0.84);
  head.position.y = 1.05;
  head.rotation.set(rand(seed + 3) * 0.14, 0, rand(seed + 5) * 0.12);
  head.castShadow = true;
  head.receiveShadow = true;
  group.add(head);

  // closed, weathered eyes
  for (const x of [-0.34, 0.34]) {
    const socket = new THREE.Mesh(new THREE.SphereGeometry(0.145, 8, 6), dark);
    socket.scale.set(1.12, 0.55, 0.32);
    socket.position.set(x, 1.16, 0.77);
    group.add(socket);
    const lid = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.06, 0.07), stone);
    lid.position.set(x, 1.24, 0.82);
    lid.rotation.z = x < 0 ? -0.12 : 0.12;
    group.add(lid);
  }
  // broad nose
  const nose = new THREE.Mesh(new THREE.DodecahedronGeometry(0.2, 0), stone);
  nose.scale.set(0.8, 1.35, 0.95);
  nose.position.set(0, 0.99, 0.88);
  nose.rotation.x = 0.1;
  group.add(nose);
  // lips
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.075, 5, 12, Math.PI), dark);
  mouth.scale.set(1.0, 0.5, 1);
  mouth.rotation.z = Math.PI;
  mouth.rotation.x = -0.05;
  mouth.position.set(0, 0.72, 0.8);
  group.add(mouth);
  // ears / temple stones
  for (const x of [-0.88, 0.88]) {
    const ear = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22, 0), stone);
    ear.position.set(x, 1.02, 0.1);
    ear.scale.y = 1.25;
    ear.rotation.z = x < 0 ? 0.3 : -0.3;
    group.add(ear);
  }
  // moss cap and patches
  const mossCount = 7;
  for (let i = 0; i < mossCount; i++) {
    const patch = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22 + rand(seed + i) * 0.25, 0), i % 3 === 0 ? mossLight : moss);
    const a = rand(seed + i * 2) * TAU;
    const rr = rand(seed + i * 3) * 0.7;
    patch.position.set(Math.cos(a) * rr, 1.65 + rand(seed + i * 5) * 0.38, Math.sin(a) * rr * 0.65 - 0.08);
    patch.scale.set(1.1 + rand(seed + i) * 1.1, 0.3 + rand(seed + i + 4) * 0.35, 0.85 + rand(seed + i + 7) * 0.9);
    patch.rotation.set(rand(seed + i) * 2, rand(seed + i + 3) * 2, rand(seed + i + 6) * 2);
    group.add(patch);
  }
  for (let i = 0; i < 5; i++) {
    const patch = new THREE.Mesh(new THREE.IcosahedronGeometry(0.17 + rand(seed + i + 30) * 0.17, 0), moss);
    patch.position.set(-0.8 + rand(seed + i + 33) * 1.6, 0.4 + rand(seed + i + 35) * 0.8, 0.62);
    patch.scale.set(1.2, 0.36, 0.6);
    patch.rotation.z = rand(seed + i + 37) * 2;
    group.add(patch);
  }
  // cracks
  const crackMat = new THREE.MeshBasicMaterial({ color: 0x4d5144 });
  for (let i = 0; i < 4; i++) {
    const crack = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.35 + rand(seed + i) * 0.35, 0.02), crackMat);
    crack.position.set(-0.55 + rand(seed + i + 8) * 1.1, 0.45 + rand(seed + i + 9) * 0.9, 0.72);
    crack.rotation.z = (rand(seed + i + 11) - 0.5) * 1.1;
    group.add(crack);
  }
  group.rotation.y = Math.PI + (rand(seed + 20) - 0.5) * 0.35;
  group.scale.setScalar(scale);
  return group;
}

function createDistantHouse(x: number, z: number, wallColor: number, roofColor: number, seed: number): THREE.Group {
  const group = new THREE.Group();
  const w = 4.5 + rand(seed) * 2.5;
  const d = 3.4 + rand(seed + 2) * 1.8;
  const h = 2.4 + rand(seed + 4) * 2.0;
  const wall = new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.92 });
  const roofMat = new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.96, flatShading: true });
  const dark = new THREE.MeshStandardMaterial({ color: 0x3a3027, roughness: 0.9 });
  const windowMat = new THREE.MeshStandardMaterial({
    color: 0xe9c985,
    emissive: 0xffb85f,
    emissiveIntensity: 0.8,
    roughness: 0.6,
  });
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wall);
  body.position.y = h / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(w * 0.8, 1.8 + rand(seed + 5) * 1.0, 4), roofMat);
  roof.rotation.y = Math.PI / 4;
  roof.scale.z = d / w + 0.2;
  roof.position.y = h + 0.72;
  roof.castShadow = true;
  group.add(roof);
  const eave = new THREE.Mesh(new THREE.BoxGeometry(w + 0.8, 0.15, d + 0.8), roofMat);
  eave.position.y = h + 0.06;
  group.add(eave);
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.8, 0.06), dark);
  door.position.set(0, 0.9, d / 2 + 0.02);
  group.add(door);
  for (const wx of [-w * 0.27, w * 0.27]) {
    const win = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.72), windowMat);
    win.position.set(wx, h * 0.62, d / 2 + 0.035);
    group.add(win);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.84, 0.06), dark);
    frame.position.set(wx, h * 0.62, d / 2 + 0.005);
    group.add(frame);
  }
  // a couple of upright posts and a little side lean-to
  for (const sx of [-w / 2, w / 2]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.14, h + 0.2, 0.14), dark);
    post.position.set(sx, (h + 0.2) / 2, d / 2 + 0.08);
    group.add(post);
  }
  group.position.set(x, meadowHeightAt(x, z), z);
  group.rotation.y = Math.PI + (rand(seed + 11) - 0.5) * 0.18;
  return group;
}

function meadowGrassTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#a9bf83';
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 4200; i++) {
    const green = 72 + rand(i + 4) * 74;
    ctx.strokeStyle = `rgba(${green - 12},${green + 30},${green - 22},${0.1 + rand(i + 6) * 0.3})`;
    ctx.lineWidth = 0.6 + rand(i + 8) * 1.4;
    const x = rand(i + 3) * 512;
    const y = rand(i + 7) * 512;
    const len = 2 + rand(i + 9) * 8;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + (rand(i + 11) - 0.5) * 4, y - len * 0.55, x + (rand(i + 13) - 0.5) * 6, y - len);
    ctx.stroke();
  }
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = `rgba(235,244,205,${0.08 + rand(i + 2) * 0.16})`;
    ctx.beginPath();
    ctx.arc(rand(i + 5) * 512, rand(i + 9) * 512, 0.5 + rand(i + 7) * 1.8, 0, TAU);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(22, 22);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export interface MeadowWorld {
  group: THREE.Group;
  playerStart: THREE.Vector3;
  statueTrigger: THREE.Vector3;
  marketTrigger: THREE.Vector3;
  heightAt: (x: number, z: number) => number;
  creekZ: number;
  creekHalfWidth: number;
  creekWater: THREE.Mesh;
  clouds: THREE.Group[];
  pollen: THREE.Points;
}

export function buildMeadowWorld(): MeadowWorld {
  const group = new THREE.Group();
  const creekZ = MEADOW_CREEK_Z;
  const creekHalfWidth = MEADOW_CREEK_HALF_WIDTH;
  const sunDir = new THREE.Vector3(0.3, 0.62, 0.72);
  group.add(makeSky('#288fd2', '#8fd8e8', '#b9dcc0', '#fff4cf', sunDir));
  group.add(sunSprite(sunDir, 36, 0.84));

  const hemi = new THREE.HemisphereLight(0xd8f0f4, 0x5e7c40, 1.7);
  group.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff0c9, 3.3);
  sun.position.set(28, 42, 20);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -35;
  sun.shadow.camera.right = 35;
  sun.shadow.camera.top = 40;
  sun.shadow.camera.bottom = -20;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 110;
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.035;
  group.add(sun);
  group.add(sun.target);
  sun.target.position.set(0, 0, 18);

  // rolling meadow ground
  const groundGeo = new THREE.PlaneGeometry(160, 170, 110, 110);
  groundGeo.rotateX(-Math.PI / 2);
  const pos = groundGeo.attributes.position as THREE.BufferAttribute;
  const colors: number[] = [];
  const lightGreen = new THREE.Color('#6ea344');
  const midGreen = new THREE.Color('#5f9139');
  const deepGreen = new THREE.Color('#4c7a2e');
  const warmGreen = new THREE.Color('#81b54f');
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i) + 16;
    const y = meadowHeightAt(x, z);
    pos.setY(i, y);
    const n = Math.sin(x * 0.38 + z * 0.22) * 0.5 + 0.5;
    const c = midGreen.clone().lerp(lightGreen, n * 0.7).lerp(warmGreen, rand(i + 3) * 0.24).lerp(deepGreen, rand(i + 9) * 0.15);
    colors.push(c.r, c.g, c.b);
  }
  groundGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  groundGeo.computeVertexNormals();
  const groundMap = meadowGrassTexture();
  const ground = new THREE.Mesh(
    groundGeo,
    new THREE.MeshStandardMaterial({ vertexColors: true, map: groundMap, roughness: 0.98, metalness: 0 }),
  );
  ground.position.z = 16;
  ground.receiveShadow = true;
  group.add(ground);

  // narrow winding trail
  const pathPoints: THREE.Vector3[] = [];
  for (let i = 0; i <= 36; i++) {
    const z = -5 + (i / 36) * 51;
    const x = meadowPathX(z);
    pathPoints.push(new THREE.Vector3(x, meadowHeightAt(x, z) + 0.025, z));
  }
  const pathCurve = new THREE.CatmullRomCurve3(pathPoints);
  const trailMat = new THREE.MeshStandardMaterial({
    color: 0x9d8a63,
    map: (() => {
      const c = document.createElement('canvas');
      c.width = 256;
      c.height = 256;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#9b8964';
      ctx.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 520; i++) {
        const g = 105 + rand(i + 3) * 65;
        ctx.fillStyle = `rgba(${g + 20},${g + 10},${g - 14},${0.08 + rand(i) * 0.2})`;
        ctx.beginPath();
        ctx.ellipse(rand(i + 5) * 256, rand(i + 7) * 256, 1 + rand(i) * 5, 1 + rand(i + 2) * 3, rand(i) * 3, 0, TAU);
        ctx.fill();
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(1, 14);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    })(),
    roughness: 1,
  });
  const trail = createRibbon(pathPoints, 1.25, trailMat);
  group.add(trail);

  // stepping stones and tiny flowers along the trail
  const pathStone = new THREE.MeshStandardMaterial({ color: 0x8b876e, roughness: 1, flatShading: true });
  for (let i = 0; i < 85; i++) {
    const t = rand(i + 7);
    const p = pathCurve.getPoint(t);
    const tangent = pathCurve.getTangent(t);
    const side = new THREE.Vector3(-tangent.z, 0, tangent.x);
    const off = (rand(i + 2) - 0.5) * 3.2;
    const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.06 + rand(i + 4) * 0.1, 0), pathStone);
    stone.position.set(p.x + side.x * off, meadowHeightAt(p.x + side.x * off, p.z) + 0.04, p.z + side.z * off);
    stone.rotation.set(rand(i) * 3, rand(i + 3) * 3, rand(i + 5) * 3);
    stone.scale.y = 0.4;
    group.add(stone);
  }

  // A shallow creek cuts across the middle of the meadow. The water follows
  // the rolling terrain and makes the player wade through the ford.
  const creekPoints: THREE.Vector3[] = [];
  for (let i = 0; i <= 24; i++) {
    const x = -28 + (i / 24) * 56;
    creekPoints.push(new THREE.Vector3(x, meadowHeightAt(x, creekZ) + 0.18, creekZ));
  }
  const creekBedMat = new THREE.MeshStandardMaterial({ color: 0x3b5140, roughness: 1 });
  const creekBed = createRibbon(
    creekPoints.map((point) => point.clone().add(new THREE.Vector3(0, -0.04, 0))),
    creekHalfWidth * 2.55,
    creekBedMat,
  );
  creekBed.receiveShadow = true;
  group.add(creekBed);

  const creekWaterMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uShallow: { value: new THREE.Color(0x83c8c5) },
      uDeep: { value: new THREE.Color(0x2c6f78) },
      uFoam: { value: new THREE.Color(0xe6f5e8) },
    },
    vertexShader: `
      uniform float uTime;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec3 p = position;
        p.y += sin(p.x * 1.55 + uTime * 2.1) * 0.018;
        p.y += sin(p.z * 2.6 - uTime * 2.8) * 0.012;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uShallow;
      uniform vec3 uDeep;
      uniform vec3 uFoam;
      varying vec2 vUv;
      void main() {
        float flow = sin(vUv.y * 30.0 - uTime * 3.4 + sin(vUv.x * 9.0 + uTime * 0.8) * 1.1);
        float ripple = smoothstep(0.55, 1.0, sin(vUv.y * 12.0 - uTime * 2.0 + vUv.x * 4.0)) * 0.35;
        float foam = smoothstep(0.88, 1.0, flow) * 0.5;
        float edge = smoothstep(0.78, 0.98, vUv.x) + smoothstep(0.22, 0.02, vUv.x);
        vec3 color = mix(uDeep, uShallow, 0.48 + ripple * 0.4);
        color = mix(color, uFoam, clamp(foam + edge * 0.28, 0.0, 0.65));
        gl_FragColor = vec4(color, 0.8);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: true,
  });
  const creekWater = createRibbon(creekPoints, creekHalfWidth * 2, creekWaterMat);
  creekWater.receiveShadow = true;
  group.add(creekWater);

  // The stream bed and banks stay bare: no grass tufts or reeds grow through
  // the water surface.
  const creekStoneMat = new THREE.MeshStandardMaterial({ color: 0x7c877b, roughness: 1, flatShading: true });
  for (let i = 0; i < 30; i++) {
    const x = (rand(i + 13) - 0.5) * 28;
    const z = creekZ + (rand(i + 15) - 0.5) * creekHalfWidth * 2.2;
    const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.12 + rand(i + 17) * 0.18, 0), creekStoneMat);
    stone.position.set(x, meadowHeightAt(x, z) + 0.12, z);
    stone.scale.y = 0.38;
    stone.rotation.set(rand(i) * 2, rand(i + 3) * 2, rand(i + 5) * 2);
    group.add(stone);
  }
  const crossingX = meadowPathX(creekZ);
  for (let i = -2; i <= 2; i++) {
    const x = crossingX + i * 0.62;
    const stone = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 0.11, 10), creekStoneMat);
    stone.position.set(x, meadowHeightAt(x, creekZ) + 0.26, creekZ + (i % 2 === 0 ? -0.18 : 0.18));
    group.add(stone);
  }

  // very dense, bright grass
  const tuftGeo = makeGrassTuftGeometry();
  const tuftMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  const grass = new THREE.InstancedMesh(tuftGeo, tuftMat, 8500);
  const grassColors = [
    new THREE.Color('#5b8e34'),
    new THREE.Color('#6da23f'),
    new THREE.Color('#4b7b2d'),
    new THREE.Color('#7fb04a'),
    new THREE.Color('#446f29'),
    new THREE.Color('#709e3f'),
  ];
  const dummy = new THREE.Object3D();
  let placed = 0;
  for (let i = 0; i < 14000 && placed < 8500; i++) {
    const x = (rand(i + 4) - 0.5) * 56;
    const z = -1 + rand(i + 8) * 47;
    const center = meadowPathX(z);
    if (Math.abs(x - center) < 1.25) continue;
    if (Math.abs(z - creekZ) < creekHalfWidth + 1.55) continue;
    const y = meadowHeightAt(x, z);
    dummy.position.set(x, y, z);
    dummy.rotation.set(0, rand(i + 11) * TAU, 0);
    const s = (0.6 + rand(i + 3) * 0.65) * (i % 41 === 0 ? 1.45 : 1);
    dummy.scale.set(s, s * (0.8 + rand(i + 5) * 0.5), s);
    dummy.updateMatrix();
    grass.setMatrixAt(placed, dummy.matrix);
    grass.setColorAt(placed, grassColors[Math.floor(rand(i + 13) * grassColors.length)]);
    placed++;
  }
  grass.instanceMatrix.needsUpdate = true;
  if (grass.instanceColor) grass.instanceColor.needsUpdate = true;
  group.add(grass);

  // wildflowers
  const flowerGeo = new THREE.SphereGeometry(0.055, 5, 4);
  const flowerMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const flowers = new THREE.InstancedMesh(flowerGeo, flowerMat, 320);
  const flowerColors = [new THREE.Color('#fff6d5'), new THREE.Color('#f5e28a'), new THREE.Color('#ffffff'), new THREE.Color('#e9c1a2')];
  for (let i = 0; i < 320; i++) {
    const x = (rand(i + 41) - 0.5) * 52;
    const z = rand(i + 47) * 46;
    const center = meadowPathX(z);
    if (Math.abs(x - center) < 1.3 || Math.abs(z - creekZ) < creekHalfWidth + 1.55) {
      flowers.setMatrixAt(i, new THREE.Matrix4().makeScale(0, 0, 0));
      continue;
    }
    dummy.position.set(x, meadowHeightAt(x, z) + 0.32, z);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.setScalar(0.7 + rand(i + 5) * 0.75);
    dummy.updateMatrix();
    flowers.setMatrixAt(i, dummy.matrix);
    flowers.setColorAt(i, flowerColors[Math.floor(rand(i + 17) * flowerColors.length)]);
  }
  flowers.instanceMatrix.needsUpdate = true;
  if (flowers.instanceColor) flowers.instanceColor.needsUpdate = true;
  group.add(flowers);

  // mossy stone heads, looking toward the path
  // The reference-art stone statue, used as a cutout on both sides of the path.
  const statueTexture = new THREE.TextureLoader().load('images/meadow_statue.png');
  statueTexture.colorSpace = THREE.SRGBColorSpace;
  const statueMat = new THREE.SpriteMaterial({
    map: statueTexture,
    transparent: true,
    alphaTest: 0.03,
    depthWrite: false,
    toneMapped: false,
  });
  const statueData: Array<[number, number, number, number]> = [
    [-5.2, 9.5, 1.15, 1],
    [5.0, 12.0, 1.38, 2],
  ];
  for (const [x, z, sc, seed] of statueData) {
    const statue = new THREE.Sprite(statueMat);
    const statueHeight = 2.15 * sc;
    const statueWidth = statueHeight * (218 / 312);
    statue.scale.set(statueWidth, statueHeight, 1);
    statue.position.set(x, meadowHeightAt(x, z) + statueHeight / 2 - 0.04, z);
    statue.userData.phase = seed * 0.9;
    group.add(statue);
  }
  // loose weathered stones
  const boulderMat = new THREE.MeshStandardMaterial({ color: 0x777b67, roughness: 1, flatShading: true });
  for (let i = 0; i < 22; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const z = 4 + rand(i + 5) * 38;
    const x = side * (6 + rand(i + 9) * 14);
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.3 + rand(i) * 0.8, 0), boulderMat);
    rock.position.set(x, meadowHeightAt(x, z), z);
    rock.scale.set(1.2, 0.55 + rand(i + 2) * 0.35, 0.9);
    rock.rotation.set(rand(i + 4) * 2, rand(i + 6) * 2, rand(i + 8) * 2);
    rock.castShadow = true;
    rock.receiveShadow = true;
    group.add(rock);
  }

  // tiny distant market on the hill crest
  const houses = [
    [-22, 86, 0x54715c, 0x303c37],
    [-14, 89, 0xc1ae88, 0x39463f],
    [12, 88, 0x65836d, 0x2f3b38],
    [20, 92, 0xb29c77, 0x3b4740],
    [-28, 96, 0x8a7a64, 0x313b38],
    [2, 94, 0xc6b08a, 0x2e3a36],
    [26, 98, 0x5e7a64, 0x303b37],
    [-5, 100, 0xa58e6d, 0x36423c],
  ] as const;
  houses.forEach(([x, z, wall, roof], i) => {
    const house = createDistantHouse(x, z, wall, roof, i + 3);
    house.scale.setScalar(0.62);
    group.add(house);
  });
  // A crest row on the far edge of the meadow. Keeping this behind the gate
  // and the path's end makes the village appear only at the horizon.
  const crestHouses = [
    [-18, 82, 0x6d856f, 0x303c37],
    [17, 84, 0xc3ad87, 0x39463f],
    [-10, 86, 0xb9a27e, 0x37423d],
    [21, 88, 0x6f8a73, 0x303c38],
    [6, 90, 0xcab68f, 0x333f3a],
  ] as const;
  crestHouses.forEach(([x, z, wall, roof], i) => {
    const house = createDistantHouse(x, z, wall, roof, i + 41);
    house.scale.setScalar(0.54 + (i % 2) * 0.04);
    group.add(house);
  });
  // a simple gate at the market approach
  const gateMat = new THREE.MeshStandardMaterial({ color: 0x6f3a2e, roughness: 0.9 });
  const marketGate = new THREE.Group();
  for (const x of [-2.1, 2.1]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.28, 3.4, 0.28), gateMat);
    post.position.set(x, 1.7, 0);
    marketGate.add(post);
  }
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.3, 0.34), gateMat);
  lintel.position.y = 3.4;
  marketGate.add(lintel);
  const top = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.2, 0.5), gateMat);
  top.position.y = 3.75;
  marketGate.add(top);
  marketGate.position.set(meadowPathX(38), meadowHeightAt(meadowPathX(38), 38), 38);
  marketGate.rotation.y = 0.05;
  group.add(marketGate);

  // layered hills behind the market
  const ridgeMat = new THREE.MeshBasicMaterial({ color: 0x7ca37d, fog: true });
  const ridgeMatFar = new THREE.MeshBasicMaterial({ color: 0x91b4a5, fog: true });
  for (let i = 0; i < 7; i++) {
    const ridge = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 5), i % 2 === 0 ? ridgeMat : ridgeMatFar);
    ridge.position.set((i - 3) * 31, -7 - rand(i + 3) * 4, 104 + rand(i + 5) * 24);
    ridge.scale.set(28 + rand(i + 2) * 20, 11 + rand(i + 6) * 8, 18 + rand(i + 8) * 12);
    group.add(ridge);
  }

  // clouds
  const clouds: THREE.Group[] = [];
  const cloudData: Array<[number, number, number, number, number]> = [
    [-44, 31, 124, 4.4, 3],
    [12, 37, 150, 5.8, 7],
    [54, 28, 120, 3.0, 11],
    [-72, 34, 166, 4.2, 15],
  ];
  for (const [x, y, z, sc, seed] of cloudData) {
    const c = makeCumulus(x, y, z, sc, seed);
    clouds.push(c);
    group.add(c);
  }
  group.add(makeCumulus(8, 24, -58, 5.0, 31, 0.55));

  // tunnel mouth behind the player
  const tunnelStone = new THREE.MeshStandardMaterial({ color: 0x626858, roughness: 1, flatShading: true });
  const portalGroup = new THREE.Group();
  for (const x of [-2.2, 2.2]) {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.7, 4.2, 1.1), tunnelStone);
    pillar.position.set(x, 2.1, 0);
    pillar.castShadow = true;
    portalGroup.add(pillar);
  }
  const portalTop = new THREE.Mesh(new THREE.TorusGeometry(2.35, 0.42, 6, 24, Math.PI), tunnelStone);
  portalTop.position.set(0, 2.7, 0);
  portalGroup.add(portalTop);
  const portalDark = new THREE.Mesh(
    new THREE.CircleGeometry(2.1, 30),
    new THREE.MeshBasicMaterial({ color: 0x0a0c09, side: THREE.DoubleSide }),
  );
  portalDark.position.set(0, 1.55, -0.12);
  portalGroup.add(portalDark);
  portalGroup.position.set(0, meadowHeightAt(0, -5.5), -5.5);
  group.add(portalGroup);

  // drifting pollen
  const count = 220;
  const pollPositions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pollPositions[i * 3] = (rand(i + 3) - 0.5) * 38;
    pollPositions[i * 3 + 1] = 0.5 + rand(i + 6) * 5;
    pollPositions[i * 3 + 2] = rand(i + 9) * 42;
  }
  const pollenGeo = new THREE.BufferGeometry();
  pollenGeo.setAttribute('position', new THREE.BufferAttribute(pollPositions, 3));
  const pollen = new THREE.Points(
    pollenGeo,
    new THREE.PointsMaterial({
      color: 0xfff4c8,
      size: 0.055,
      map: makeGlowTexture(),
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  group.add(pollen);

  const startX = meadowPathX(0);
  const startZ = 0;
  const statueZ = 14;
  const statueX = meadowPathX(statueZ);
  const marketZ = 37;
  const marketX = meadowPathX(marketZ);

  return {
    group,
    playerStart: new THREE.Vector3(startX, meadowHeightAt(startX, startZ), startZ),
    statueTrigger: new THREE.Vector3(statueX, meadowHeightAt(statueX, statueZ), statueZ),
    marketTrigger: new THREE.Vector3(marketX, meadowHeightAt(marketX, marketZ), marketZ),
    heightAt: meadowHeightAt,
    creekZ,
    creekHalfWidth,
    creekWater,
    clouds,
    pollen,
  };
}
