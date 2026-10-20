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
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.38, z);
      wheel.castShadow = true;
      car.add(wheel);
      const hub = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 0.27, 12),
        new THREE.MeshStandardMaterial({ color: 0x8d8f7f, roughness: 0.3, metalness: 0.55 }),
      );
      hub.rotation.z = Math.PI / 2;
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

function createGate(): { group: THREE.Group; opening: THREE.Vector3 } {
  const group = new THREE.Group();
  const brick = new THREE.MeshStandardMaterial({ map: brickTexture(), color: 0xb06650, roughness: 0.92, side: THREE.DoubleSide });
  const shape = new THREE.Shape();
  shape.moveTo(-5.2, 0);
  shape.lineTo(5.2, 0);
  shape.lineTo(5.2, 6.4);
  shape.lineTo(-5.2, 6.4);
  shape.closePath();
  const hole = new THREE.Path();
  hole.moveTo(-2.38, 0);
  hole.lineTo(-2.38, 3.35);
  hole.absarc(0, 3.35, 2.38, Math.PI, 0, true);
  hole.lineTo(2.38, 0);
  hole.closePath();
  shape.holes.push(hole);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 1.5, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.07, bevelSegments: 2, curveSegments: 28 });
  const facade = new THREE.Mesh(geo, brick);
  facade.castShadow = true;
  facade.receiveShadow = true;
  facade.position.z = -0.75;
  group.add(facade);

  const trimMat = new THREE.MeshStandardMaterial({ color: 0x5c2b24, roughness: 0.74 });
  const topTrim = new THREE.Mesh(new THREE.BoxGeometry(11.3, 0.36, 2.1), trimMat);
  topTrim.position.set(0, 6.55, 0);
  topTrim.castShadow = true;
  group.add(topTrim);
  const topTile = new THREE.Mesh(new THREE.BoxGeometry(11.9, 0.15, 2.5), new THREE.MeshStandardMaterial({ color: 0x343833, roughness: 0.9 }));
  topTile.position.set(0, 6.78, 0);
  group.add(topTile);
  for (const x of [-5.0, 5.0]) {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.55, 6.4, 2.0), trimMat);
    pillar.position.set(x, 3.2, 0);
    pillar.castShadow = true;
    group.add(pillar);
  }

  // a shallow tunnel recess behind the arch, so the opening has depth
  const recessMat = new THREE.MeshStandardMaterial({
    color: 0x2e2923,
    roughness: 1,
    side: THREE.BackSide,
    map: brickTexture('#4b4136'),
  });
  const recess = new THREE.Mesh(new THREE.CylinderGeometry(3.05, 3.05, 9, 32, 1, true), recessMat);
  recess.rotation.x = Math.PI / 2;
  recess.position.set(0, 1.9, 4.9);
  group.add(recess);
  const recessFloor = new THREE.Mesh(
    new THREE.BoxGeometry(7.0, 0.16, 9.5),
    new THREE.MeshStandardMaterial({ color: 0x453d31, roughness: 1 }),
  );
  recessFloor.position.set(0, -0.03, 4.75);
  group.add(recessFloor);
  const threshold = new THREE.Mesh(
    new THREE.BoxGeometry(5.4, 0.2, 0.45),
    new THREE.MeshStandardMaterial({ color: 0x716452, roughness: 0.96 }),
  );
  threshold.position.set(0, 0.09, 0.25);
  group.add(threshold);
  for (let i = 0; i < 3; i++) {
    const arch = new THREE.Mesh(new THREE.TorusGeometry(2.95, 0.075, 5, 24, Math.PI), new THREE.MeshStandardMaterial({ color: 0x5e5141, roughness: 1 }));
    arch.position.set(0, 1.95, 2.2 + i * 2.4);
    group.add(arch);
  }
  const recessCap = new THREE.Mesh(
    new THREE.CircleGeometry(3.04, 40),
    new THREE.MeshBasicMaterial({ color: 0x17140f, side: THREE.DoubleSide, fog: false }),
  );
  recessCap.position.set(0, 1.9, 9.14);
  group.add(recessCap);
  const recessGlow = new THREE.Mesh(
    new THREE.CircleGeometry(1.15, 28),
    new THREE.MeshBasicMaterial({ color: 0x8e7b53, transparent: true, opacity: 0.16, side: THREE.DoubleSide, fog: false }),
  );
  recessGlow.position.set(0, 1.8, 9.08);
  group.add(recessGlow);
  const recessLight = new THREE.PointLight(0xc7a76d, 2.5, 9, 2);
  recessLight.position.set(0, 2.1, 6.4);
  group.add(recessLight);

  // stone shoulders
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x5a6250, roughness: 1, flatShading: true });
  for (const side of [-1, 1]) {
    const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(2.7, 0), stoneMat);
    stone.position.set(side * 5.8, 1.4, -0.7);
    stone.scale.set(1.3, 0.75, 1.1);
    stone.rotation.set(rand(side + 2) * 0.6, rand(side + 5) * 2, rand(side + 8) * 0.4);
    stone.castShadow = true;
    stone.receiveShadow = true;
    group.add(stone);
  }
  // old sign
  const signMat = new THREE.MeshStandardMaterial({ map: signTexture('旧遊園地'), roughness: 0.8 });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.55, 0.48), signMat);
  sign.position.set(0, 5.55, -0.79);
  sign.rotation.y = Math.PI;
  group.add(sign);

  // hint of rails and stones inside
  const railMat = new THREE.MeshStandardMaterial({ color: 0x2a2823, roughness: 0.9 });
  for (const x of [-1.3, 1.3]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 3), railMat);
    rail.position.set(x, 0.04, 1);
    group.add(rail);
  }
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
  const pigMat = new THREE.MeshStandardMaterial({ color: 0xc98f86, roughness: 0.9 });
  const shadeMat = new THREE.MeshStandardMaterial({ color: 0xac716b, roughness: 0.9 });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.42, 18, 14), pigMat);
  body.position.y = 0.48;
  body.scale.set(1.0, 0.78, 0.75);
  body.castShadow = true;
  group.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 12), pigMat);
  head.position.set(0.42, 0.57, 0);
  head.scale.set(0.9, 0.9, 0.9);
  head.castShadow = true;
  group.add(head);
  const snout = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.16, 14), shadeMat);
  snout.rotation.z = Math.PI / 2;
  snout.position.set(0.69, 0.53, 0);
  group.add(snout);
  for (const z of [-0.06, 0.06]) {
    const nostril = new THREE.Mesh(new THREE.CircleGeometry(0.018, 8), new THREE.MeshBasicMaterial({ color: 0x764d4a }));
    nostril.position.set(0.775, 0.53, z);
    nostril.rotation.y = Math.PI / 2;
    group.add(nostril);
  }
  for (const z of [-0.18, 0.18]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.105, 0.2, 4), pigMat);
    ear.position.set(0.35, 0.82, z);
    ear.rotation.z = 0.35;
    group.add(ear);
  }
  for (const x of [-0.22, 0.22]) {
    for (const z of [-0.2, 0.2]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.075, 0.3, 8), shadeMat);
      leg.position.set(x, 0.16, z);
      group.add(leg);
    }
  }
  // eye
  for (const z of [-0.16, 0.16]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), new THREE.MeshBasicMaterial({ color: 0x2b1d1b }));
    eye.position.set(0.58, 0.69, z);
    group.add(eye);
  }
  // tail
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.4, 0.56, 0),
    new THREE.Vector3(-0.54, 0.65, 0.08),
    new THREE.Vector3(-0.58, 0.74, 0.02),
    new THREE.Vector3(-0.48, 0.79, -0.03),
  ]);
  const tail = new THREE.Mesh(new THREE.TubeGeometry(curve, 12, 0.025, 5, false), shadeMat);
  group.add(tail);
  if (withClothes) {
    const clothMat = new THREE.MeshStandardMaterial({ color: clothedColor, roughness: 0.94, side: THREE.DoubleSide });
    // a short shirt wrapped around the pig's torso
    const shirt = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.39, 0.46, 16, 1, true), clothMat);
    shirt.rotation.z = Math.PI / 2;
    shirt.position.set(-0.03, 0.5, 0);
    group.add(shirt);
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.03, 6, 14), clothMat);
    collar.position.set(0.2, 0.52, 0);
    collar.rotation.y = Math.PI / 2;
    group.add(collar);
    for (const z of [-0.18, 0.18]) {
      const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.2, 8), clothMat);
      sleeve.position.set(0.18, 0.34, z);
      sleeve.rotation.z = 0.35;
      group.add(sleeve);
    }
  }
  group.rotation.y = -Math.PI / 2;
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
    playerStart: new THREE.Vector3(-1.25, 0, -0.9),
    gateTrigger: new THREE.Vector3(1.1, 0, 20.2),
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

function createVisitor(): THREE.Group {
  const group = new THREE.Group();
  const white = new THREE.MeshStandardMaterial({ color: 0xe8e4d8, roughness: 0.9 });
  const blue = new THREE.MeshStandardMaterial({ color: 0x607a8e, roughness: 0.92 });
  const skin = new THREE.MeshStandardMaterial({ color: 0xc99877, roughness: 0.92 });
  const hair = new THREE.MeshStandardMaterial({ color: 0x292521, roughness: 0.95 });
  const shoe = new THREE.MeshStandardMaterial({ color: 0x342d27, roughness: 0.95 });
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.58, 0.24), white);
  torso.position.y = 1.08;
  group.add(torso);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), skin);
  head.position.y = 1.52;
  group.add(head);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.145, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.54), hair);
  cap.position.y = 1.56;
  group.add(cap);
  for (const side of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.8, 0.18), blue);
    leg.position.set(side * 0.12, 0.4, 0);
    group.add(leg);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.09, 0.3), shoe);
    foot.position.set(side * 0.12, 0.045, 0.08);
    group.add(foot);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.1), white);
    arm.position.set(side * 0.25, 1.04, 0);
    arm.rotation.z = side * 0.08;
    group.add(arm);
  }
  group.scale.setScalar(0.95);
  return group;
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

  const pigA = createPig(true, 0x525b47);
  pigA.position.set(2.1, 0.5, 12.98);
  pigA.rotation.y = -Math.PI / 2;
  pigA.scale.setScalar(0.92);
  pigA.visible = false;
  group.add(pigA);
  const pigB = createPig(true, 0x7d5049);
  pigB.position.set(2.1, 0.5, 16.02);
  pigB.rotation.y = Math.PI / 2;
  pigB.scale.setScalar(0.86);
  pigB.visible = false;
  group.add(pigB);

  // the lone figure from the reference, far down the street
  const visitor = createVisitor();
  visitor.position.set(3.4, 0.02, 31.5);
  visitor.rotation.y = Math.PI;
  group.add(visitor);

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
  lin: THREE.Group;
  soot: THREE.Group[];
  ghosts: THREE.Group[];
  coal: THREE.Mesh;
  boilerPlayerStart: THREE.Vector3;
  furnaceTrigger: THREE.Vector3;
  stage: 'bridge' | 'office' | 'boiler';
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
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 7), new THREE.MeshStandardMaterial({ color: 0x151412, roughness: 1 }));
  body.position.y = 0.1;
  group.add(body);
  const eye = new THREE.MeshBasicMaterial({ color: 0xf2ead9 });
  for (const side of [-1, 1]) {
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.026, 7, 5), eye);
    dot.position.set(side * 0.04, 0.13, 0.09);
    group.add(dot);
  }
  return group;
}

function createGhost(): THREE.Group {
  const group = new THREE.Group();
  const materials: THREE.MeshStandardMaterial[] = [];
  const makeMat = (color: number, emissive: number) => {
    const material = new THREE.MeshStandardMaterial({
      color,
      emissive,
      emissiveIntensity: 0.55,
      roughness: 0.9,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    materials.push(material);
    return material;
  };
  const robeMat = makeMat(0x9aa39b, 0x32413d);
  const skinMat = makeMat(0xd4cdbb, 0x4d5148);
  const maskMat = makeMat(0xe2dccb, 0x3a3b32);
  const darkMat = makeMat(0x1b201e, 0x000000);
  const redMat = makeMat(0x8f2d25, 0x3a0906);
  const body = new THREE.Mesh(new THREE.ConeGeometry(0.34, 1.35, 9), robeMat);
  body.position.y = 0.83;
  group.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 10), skinMat);
  head.position.y = 1.55;
  group.add(head);
  const mask = new THREE.Mesh(new THREE.SphereGeometry(0.155, 12, 10), maskMat);
  mask.position.set(0, 1.55, 0.06);
  mask.scale.set(0.95, 1.05, 0.5);
  group.add(mask);
  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), darkMat);
    eye.position.set(side * 0.06, 1.59, 0.15);
    group.add(eye);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.06, 0.82, 6), robeMat);
    arm.position.set(side * 0.35, 1.0, 0.02);
    arm.rotation.z = side * 0.18;
    group.add(arm);
  }
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.018, 0.02), redMat);
  mouth.position.set(0, 1.48, 0.15);
  group.add(mouth);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.48), darkMat);
  hair.position.y = 1.62;
  group.add(hair);
  group.userData.materials = materials;
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

function createThreeHeads(): THREE.Group {
  const group = new THREE.Group();
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.18, 0.8), new THREE.MeshStandardMaterial({ color: 0x4a3124, roughness: 0.9 }));
  shelf.position.y = -0.15;
  group.add(shelf);
  const colors = [0x6b7b5f, 0x8b6b57, 0x77706a];
  for (let i = 0; i < 3; i++) {
    const head = new THREE.Group();
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 10), new THREE.MeshStandardMaterial({ color: colors[i], roughness: 0.88 }));
    skull.scale.set(1, 1.1, 0.95);
    head.add(skull);
    const face = new THREE.Mesh(new THREE.CircleGeometry(0.19, 14), new THREE.MeshStandardMaterial({ color: 0xc9c0a9, roughness: 0.9 }));
    face.position.set(0, 0.02, 0.255);
    head.add(face);
    for (const side of [-1, 1]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), new THREE.MeshBasicMaterial({ color: 0x1e1814 }));
      eye.position.set(side * 0.07, 0.05, 0.29);
      head.add(eye);
      const brow = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.025, 0.02), new THREE.MeshBasicMaterial({ color: 0x3b2c22 }));
      brow.position.set(side * 0.07, 0.12, 0.29);
      head.add(brow);
    }
    const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.03, 0.02), new THREE.MeshBasicMaterial({ color: 0x5c2d28 }));
    mouth.position.set(0, -0.09, 0.29);
    head.add(mouth);
    head.position.set((i - 1) * 1.05, 0.19, 0);
    head.userData.baseY = 0.19;
    head.userData.phase = i * 1.9;
    group.add(head);
  }
  return group;
}

export function buildBathhouseWorld(): BathhouseWorld {
  const group = new THREE.Group();
  const exterior = new THREE.Group();
  const office = new THREE.Group();
  group.add(exterior, office);
  office.visible = false;

  const nightSky = makeSky('#050b1b', '#1a2840', '#090d15', '#b8caff', new THREE.Vector3(0.35, 0.45, 0.82));
  exterior.add(nightSky);
  const moon = sunSprite(new THREE.Vector3(0.35, 0.48, 0.82), 26, 0.5);
  (moon.material as THREE.SpriteMaterial).color.set(0xdbe8ff);
  exterior.add(moon);

  const starPositions = new Float32Array(520 * 3);
  for (let i = 0; i < 520; i++) {
    const a = rand(i + 11) * TAU;
    const y = 0.1 + rand(i + 19) * 0.84;
    const r = Math.sqrt(Math.max(0, 1 - y * y)) * 148;
    starPositions[i * 3] = Math.cos(a) * r;
    starPositions[i * 3 + 1] = y * 148;
    starPositions[i * 3 + 2] = Math.sin(a) * r + 30;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const starMat = new THREE.PointsMaterial({
    color: 0xe6efff,
    size: 1.1,
    transparent: true,
    opacity: 0.75,
    depthWrite: false,
    fog: false,
    blending: THREE.AdditiveBlending,
  });
  exterior.add(new THREE.Points(starGeo, starMat));

  const hemi = new THREE.HemisphereLight(0x5b7295, 0x14151d, 0.9);
  exterior.add(hemi);
  const moonLight = new THREE.DirectionalLight(0x9fb9ff, 1.5);
  moonLight.position.set(18, 26, 20);
  moonLight.castShadow = true;
  moonLight.shadow.mapSize.set(1024, 1024);
  moonLight.shadow.camera.left = -18;
  moonLight.shadow.camera.right = 18;
  moonLight.shadow.camera.top = 24;
  moonLight.shadow.camera.bottom = -12;
  moonLight.shadow.camera.near = 1;
  moonLight.shadow.camera.far = 60;
  moonLight.shadow.bias = -0.0007;
  exterior.add(moonLight);
  exterior.add(moonLight.target);

  const water = new THREE.Mesh(
    new THREE.PlaneGeometry(180, 180),
    new THREE.MeshStandardMaterial({ color: 0x0b1a22, roughness: 0.23, metalness: 0.55 }),
  );
  water.rotation.x = -Math.PI / 2;
  water.position.y = -0.62;
  exterior.add(water);

  const bridgeMat = new THREE.MeshStandardMaterial({ color: 0x4a3325, roughness: 0.94 });
  const bridgeEdge = new THREE.MeshStandardMaterial({ color: 0x2b211a, roughness: 0.9 });
  const plankMat = new THREE.MeshStandardMaterial({ color: 0x75543a, roughness: 0.93 });
  const bridge = new THREE.Group();
  const deck = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.22, 26), bridgeMat);
  deck.position.set(0, -0.08, 11);
  deck.receiveShadow = true;
  bridge.add(deck);
  for (let z = -1.5; z <= 23.5; z += 0.62) {
    const plank = new THREE.Mesh(new THREE.BoxGeometry(4.25, 0.07, 0.5), plankMat);
    plank.position.set(0, 0.045, z);
    bridge.add(plank);
  }
  for (const side of [-1, 1]) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.2, 26), bridgeEdge);
    beam.position.set(side * 2.12, 0.9, 11);
    bridge.add(beam);
    const lower = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 26), bridgeEdge);
    lower.position.set(side * 2.12, 0.43, 11);
    bridge.add(lower);
    for (let z = -1; z <= 23; z += 2.1) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 1.05, 6), bridgeEdge);
      post.position.set(side * 2.12, 0.52, z);
      bridge.add(post);
    }
  }
  exterior.add(bridge);

  const lanternPositions: Array<[number, number]> = [[-2.12, 3.2], [2.12, 3.2], [-2.12, 10.5], [2.12, 10.5], [-2.12, 18], [2.12, 18]];
  for (const [x, z] of lanternPositions) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 2.3, 6), bridgeEdge);
    post.position.set(x, 1.15, z);
    bridge.add(post);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.05, 0.05), bridgeEdge);
    arm.position.set(x - Math.sign(x) * 0.3, 2.25, z);
    bridge.add(arm);
    const lantern = createBathLantern(0.9);
    lantern.position.set(x - Math.sign(x) * 0.65, 1.95, z);
    bridge.add(lantern);
  }

  // bathhouse facade
  const bathhouse = new THREE.Group();
  const redWood = new THREE.MeshStandardMaterial({ color: 0x5d2420, roughness: 0.86 });
  const cream = new THREE.MeshStandardMaterial({ color: 0xc8b68f, roughness: 0.88 });
  const roof = new THREE.MeshStandardMaterial({ color: 0x263d38, roughness: 0.9, flatShading: true });
  const gold = new THREE.MeshStandardMaterial({ color: 0xb18a48, roughness: 0.5, metalness: 0.25 });
  const windowMat = new THREE.MeshStandardMaterial({ color: 0xf1d49a, emissive: 0xffa957, emissiveIntensity: 1.5, roughness: 0.5 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(22, 7.2, 8), redWood);
  base.position.set(0, 3.6, 30);
  base.castShadow = true;
  bathhouse.add(base);
  const baseTrim = new THREE.Mesh(new THREE.BoxGeometry(23, 0.5, 8.5), cream);
  baseTrim.position.set(0, 7.1, 30);
  bathhouse.add(baseTrim);
  const upper = new THREE.Mesh(new THREE.BoxGeometry(17, 5.2, 7), cream);
  upper.position.set(0, 9.9, 30.4);
  upper.castShadow = true;
  bathhouse.add(upper);
  const top = new THREE.Mesh(new THREE.BoxGeometry(12, 3.7, 6), redWood);
  top.position.set(0, 14.3, 30.8);
  top.castShadow = true;
  bathhouse.add(top);
  for (const [w, h, y, z] of [[24, 1.2, 8.1, 30], [19, 1.1, 12.6, 30.5], [14, 0.9, 16.2, 31]] as Array<[number, number, number, number]>) {
    const roofMesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, 8.7), roof);
    roofMesh.position.set(0, y, z);
    roofMesh.rotation.x = 0.03;
    bathhouse.add(roofMesh);
  }
  const signFrame = new THREE.Mesh(new THREE.BoxGeometry(3.45, 2.35, 0.16), gold);
  signFrame.position.set(0, 5.55, 25.78);
  bathhouse.add(signFrame);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(3.1, 2.0), new THREE.MeshBasicMaterial({ map: signTexture('油屋'), toneMapped: false, side: THREE.DoubleSide }));
  sign.position.set(0, 5.55, 25.62);
  sign.rotation.y = Math.PI;
  bathhouse.add(sign);
  for (const side of [-1, 1]) {
    const banner = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 2.5), new THREE.MeshStandardMaterial({ color: 0x8d2b23, roughness: 0.9, side: THREE.DoubleSide }));
    banner.position.set(side * 6.2, 3.7, 25.72);
    bathhouse.add(banner);
    const lowerWindow = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.3), windowMat);
    lowerWindow.material = (windowMat as THREE.MeshStandardMaterial).clone();
    (lowerWindow.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
    lowerWindow.position.set(side * 7.8, 3.2, 25.71);
    bathhouse.add(lowerWindow);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.5, 0.08), redWood);
    frame.position.set(side * 7.8, 3.2, 25.66);
    bathhouse.add(frame);
  }
  const beam = new THREE.Mesh(new THREE.BoxGeometry(19, 0.35, 0.25), redWood);
  beam.position.set(0, 7.05, 25.75);
  bathhouse.add(beam);
  const entranceGlow = new THREE.PointLight(0xff9c5e, 3.5, 5, 2);
  entranceGlow.position.set(0, 2.4, 22.4);
  bathhouse.add(entranceGlow);
  for (const side of [-1, 1]) {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.34, 7.2, 10), redWood);
    pillar.position.set(side * 4.1, 3.6, 25.65);
    bathhouse.add(pillar);
    const bigLantern = createBathLantern(2.1);
    bigLantern.position.set(side * 4.1, 4.85, 25.55);
    bathhouse.add(bigLantern);
    const light = new THREE.PointLight(0xff9b55, 5, 14, 2);
    light.position.set(side * 4.1, 4.7, 25.35);
    bathhouse.add(light);
  }
  const gate = new THREE.Mesh(new THREE.BoxGeometry(8, 4.4, 0.4), new THREE.MeshStandardMaterial({ color: 0x1d1714, roughness: 0.9 }));
  gate.position.set(0, 2.2, 25.78);
  bathhouse.add(gate);
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 7 - row; col++) {
      const w = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.05), windowMat);
      const yy = 9.0 + row * 2.2;
      const xx = (col - (6 - row) / 2) * 1.75;
      w.position.set(xx, yy, 26.93 - row * 0.3);
      bathhouse.add(w);
    }
  }
  const balcony = new THREE.Mesh(new THREE.BoxGeometry(18, 0.18, 0.7), gold);
  balcony.position.set(0, 8.5, 25.6);
  bathhouse.add(balcony);
  for (let i = -4; i <= 4; i++) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.55, 0.05), gold);
    rail.position.set(i * 2, 8.8, 25.72);
    bathhouse.add(rail);
  }
  const smokeCount = 80;
  const smokePositions = new Float32Array(smokeCount * 3);
  for (let i = 0; i < smokeCount; i++) {
    smokePositions[i * 3] = (rand(i) - 0.5) * 2.8;
    smokePositions[i * 3 + 1] = 17.4 + rand(i + 2) * 4;
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
  bathhouse.position.set(0, 0, -5);
  exterior.add(bathhouse);

  const haku = createHaku();
  haku.position.set(0, 0.02, 6.4);
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
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(13, 12), new THREE.MeshStandardMaterial({ color: 0x39281f, roughness: 0.95 }));
  floor.rotation.x = -Math.PI / 2;
  officeRoom.add(floor);
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(13, 6, 0.35), wall);
  backWall.position.set(0, 3, -5.7);
  officeRoom.add(backWall);
  for (const side of [-1, 1]) {
    const sideWall = new THREE.Mesh(new THREE.BoxGeometry(0.35, 6, 12), wall);
    sideWall.position.set(side * 6.35, 3, 0);
    officeRoom.add(sideWall);
  }
  const ceiling = new THREE.Mesh(new THREE.BoxGeometry(13, 0.25, 12), wood);
  ceiling.position.set(0, 5.8, 0);
  officeRoom.add(ceiling);
  const desk = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.2, 1.8), wood);
  desk.position.set(0, 1.0, -3.2);
  officeRoom.add(desk);
  for (const x of [-1.8, 1.8]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.0, 0.22), wood);
    leg.position.set(x, 0.5, -3.2);
    officeRoom.add(leg);
  }
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
  const officeWindow = new THREE.Mesh(
    new THREE.PlaneGeometry(4.2, 2.6),
    new THREE.MeshStandardMaterial({ color: 0x0b1424, emissive: 0x182d4a, emissiveIntensity: 0.7, roughness: 0.8 }),
  );
  officeWindow.position.set(0, 3.8, -5.48);
  officeRoom.add(officeWindow);
  for (let i = -3; i <= 3; i++) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 6, 0.06), wood);
    bar.position.set(i * 1.1, 3, -5.36);
    officeRoom.add(bar);
  }
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
  boh.position.set(3.7, 0.2, -4.05);
  boh.rotation.y = 0;
  officeRoom.add(boh);
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
  const boilerFloor = new THREE.Mesh(new THREE.PlaneGeometry(13, 12), new THREE.MeshStandardMaterial({ color: 0x3c2c22, roughness: 0.98 }));
  boilerFloor.rotation.x = -Math.PI / 2;
  boiler.add(boilerFloor);
  for (const side of [-1, 1]) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 7, 12), brick);
    wall.position.set(side * 6.4, 3.5, 0);
    boiler.add(wall);
  }
  const back = new THREE.Mesh(new THREE.BoxGeometry(13, 7, 0.3), brick);
  back.position.set(0, 3.5, -5.8);
  boiler.add(back);
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
  for (const [x, z, r] of [[-4.3, -3.5, 1.1], [-4.3, -0.8, 0.9], [4.6, -1.8, 0.8]]) {
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
  const lin = createLin();
  lin.position.set(2.3, 0, -2.7);
  lin.rotation.y = -0.12;
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
    soot.push(sprite);
  }
  const coal = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22, 0), coalMat);
  coal.position.set(-2.4, 0.3, 1.2);
  coal.castShadow = true;
  boiler.add(coal);
  const boilerGlow = new THREE.PointLight(0xffa05e, 4, 10, 2);
  boilerGlow.position.set(-1.8, 3.2, 1.4);
  boiler.add(boilerGlow);
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
      const base = 0.62;
      ghost.position.y = base + Math.sin(time * 1.35 + ghost.userData.phase) * 0.09;
    });
    if (stage === 'office') {
      boh.position.y = 0.2 + Math.sin(time * 1.5) * 0.018;
      boh.rotation.z = Math.sin(time * 0.8) * 0.02;
      heads.children.forEach((head) => {
        if (typeof head.userData.baseY === 'number') {
          head.position.y = head.userData.baseY + Math.sin(time * 1.8 + (head.userData.phase || 0)) * 0.045;
          head.rotation.z = Math.sin(time * 1.3 + (head.userData.phase || 0)) * 0.04;
        }
      });
    }
    if (stage === 'boiler') {
      soot.forEach((sprite, i) => {
        sprite.position.y = 0.11 + Math.abs(Math.sin(time * 5 + i)) * 0.08;
      });
      fireLight.intensity = 10 + Math.sin(time * 7) * 2;
    }
    if (stage === 'bridge') {
      // The imported Haku clip is a five-second turn-and-step performance.
      // Move him at a matching pace so the feet and body turn stay in sync.
      if (walking) {
        haku.position.z = Math.min(18.8, haku.position.z + dt * 2.48);
      } else {
        haku.position.z += (6.4 - haku.position.z) * (1 - Math.exp(-dt * 1.2));
      }
      haku.position.y = 0.02;
      haku.rotation.y = walking ? 0 : Math.sin(time * 0.8) * 0.025;
    }
  };

  const setWalking = (value: boolean) => { walking = value; };
  return {
    group,
    exterior,
    office,
    playerStart: new THREE.Vector3(0, 0, 0.6),
    hakuTrigger: new THREE.Vector3(0, 0, 5.3),
    entranceTrigger: new THREE.Vector3(0, 0, 19.8),
    officePlayerStart: new THREE.Vector3(0, 0, 3.0),
    haku,
    yubaba,
    boh,
    heads,
    kamaji,
    lin,
    soot,
    ghosts,
    coal,
    boilerPlayerStart: new THREE.Vector3(0, 0, 3.2),
    furnaceTrigger: new THREE.Vector3(3.1, 0, -3.5),
    boiler,
    stage,
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

export function meadowHeightAt(x: number, z: number): number {
  const base = z * 0.055;
  const rolling =
    Math.sin(x * 0.13 + 0.4) * 0.55 +
    Math.sin(z * 0.085) * 0.7 +
    Math.sin((x + z) * 0.055) * 0.36;
  const center = meadowPathX(z);
  const flatten = Math.exp(-Math.pow((x - center) / 4.0, 2));
  return base + rolling * (1 - flatten * 0.86) - 0.22;
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
  const material = new THREE.MeshStandardMaterial({
    color: 0xfffdf2,
    emissive: 0xe9f0ea,
    emissiveIntensity: 0.92,
    roughness: 1,
    flatShading: true,
    transparent: opacity < 1,
    opacity,
    depthWrite: opacity >= 1,
    fog: false,
  });
  const puffs = 8;
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
      1.0 + rand(seed + i + 2) * 1.8,
      0.42 + rand(seed + i + 4) * 0.76,
      0.75 + rand(seed + i + 6) * 1.1,
    );
    group.add(mesh);
  }
  // a larger soft base
  const base = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), material);
  base.scale.set(3.4, 0.52, 1.5);
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
  clouds: THREE.Group[];
  pollen: THREE.Points;
}

export function buildMeadowWorld(): MeadowWorld {
  const group = new THREE.Group();
  const sunDir = new THREE.Vector3(0.3, 0.62, 0.72);
  group.add(makeSky('#1d73b6', '#79c4dc', '#8eb36a', '#fff2c8', sunDir));
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
    if (Math.abs(x - center) < 1.3) {
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
  const statueData: Array<[number, number, number, number]> = [
    [-5.2, 9.5, 1.15, 1],
    [5.0, 12.0, 1.38, 2],
    [-7.4, 18.5, 0.94, 3],
    [6.2, 24.0, 1.06, 4],
    [-5.8, 31.0, 0.8, 5],
  ];
  for (const [x, z, sc, seed] of statueData) {
    const head = createMossyHead(seed + 10, sc);
    head.position.set(x, meadowHeightAt(x, z) - 0.22, z);
    head.rotation.y += (x < 0 ? -0.25 : 0.25);
    group.add(head);
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
    [-15, 56, 0x54715c, 0x303c37],
    [-9, 59, 0xc1ae88, 0x39463f],
    [10, 57, 0x65836d, 0x2f3b38],
    [16, 61, 0xb29c77, 0x3b4740],
    [-21, 63, 0x8a7a64, 0x313b38],
    [4, 64, 0xc6b08a, 0x2e3a36],
    [22, 67, 0x5e7a64, 0x303b37],
    [-3, 68, 0xa58e6d, 0x36423c],
  ] as const;
  houses.forEach(([x, z, wall, roof], i) => {
    const house = createDistantHouse(x, z, wall, roof, i + 3);
    house.scale.setScalar(0.86);
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
    [-25, 12, 58, 4.4, 3],
    [16, 15, 78, 5.8, 7],
    [47, 10, 48, 3.4, 11],
    [-52, 14, 88, 4.8, 15],
    [5, 18, 102, 5.6, 19],
    [43, 10, 55, 3.0, 23],
  ];
  for (const [x, y, z, sc, seed] of cloudData) {
    const c = makeCumulus(x, y, z, sc, seed);
    clouds.push(c);
    group.add(c);
  }
  group.add(makeCumulus(8, 22, -50, 5.5, 31, 0.75));

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
    clouds,
    pollen,
  };
}
