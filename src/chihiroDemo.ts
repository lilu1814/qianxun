import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createChihiroModel, type ChihiroAction } from './chihiro/chihiroModel';

const app = document.getElementById('app')!;
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(32, window.innerWidth / window.innerHeight, 0.01, 50);
camera.position.set(2.35, 1.48, 3.35);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.82, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.075;
controls.enablePan = false;
controls.minDistance = 1.45;
controls.maxDistance = 6;

const hemi = new THREE.HemisphereLight(0xc6dfc7, 0x172019, 1.35);
scene.add(hemi);
const key = new THREE.DirectionalLight(0xffe3b8, 3.6);
key.position.set(3.2, 4.8, 3.6);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.near = 0.1;
key.shadow.camera.far = 12;
key.shadow.camera.left = -2.6;
key.shadow.camera.right = 2.6;
key.shadow.camera.top = 3.2;
key.shadow.camera.bottom = -1.2;
key.shadow.bias = -0.0004;
scene.add(key);
const rim = new THREE.DirectionalLight(0x82b79b, 1.45);
rim.position.set(-3.6, 2.6, -3.0);
scene.add(rim);
const fill = new THREE.PointLight(0xe4b37a, 5.2, 5.5, 2);
fill.position.set(-1.6, 1.4, 2.2);
scene.add(fill);

const platform = new THREE.Group();
const base = new THREE.Mesh(
  new THREE.CylinderGeometry(1.48, 1.62, 0.09, 64),
  new THREE.MeshStandardMaterial({ color: 0x1b2b24, roughness: 0.96 }),
);
base.position.y = -0.055;
base.receiveShadow = true;
platform.add(base);
const inlay = new THREE.Mesh(
  new THREE.RingGeometry(0.86, 0.88, 64),
  new THREE.MeshBasicMaterial({ color: 0x9f9d72, transparent: true, opacity: 0.25, side: THREE.DoubleSide }),
);
inlay.rotation.x = -Math.PI / 2;
inlay.position.y = 0.002;
platform.add(inlay);
scene.add(platform);

const model = createChihiroModel();
scene.add(model.root);
window.__CHIHIRO_MODEL__ = model;

const actions = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-action]'));
const state = document.getElementById('state')!;
const jumpButton = document.getElementById('jump') as HTMLButtonElement;

const setAction = (action: ChihiroAction) => {
  if (action === 'jump') {
    model.jump();
  } else {
    model.setAction(action);
  }
  for (const button of actions) button.classList.toggle('active', button.dataset.action === action);
};

for (const button of actions) {
  button.addEventListener('click', () => setAction(button.dataset.action as ChihiroAction));
}
jumpButton.addEventListener('click', () => model.jump());

const bindRange = (id: string, format: (value: number) => void) => {
  const input = document.getElementById(id) as HTMLInputElement;
  const output = document.getElementById(`${id}-v`) as HTMLOutputElement;
  const update = () => {
    const value = Number(input.value);
    output.textContent = value.toFixed(id.startsWith('jump-d') ? 2 : 2);
    format(value);
  };
  input.addEventListener('input', update);
  update();
};
bindRange('speed', (value) => model.setWalkConfig({ speed: value }));
bindRange('stride', (value) => model.setWalkConfig({ stride: value }));
bindRange('swing', (value) => model.setWalkConfig({ armSwing: value }));
bindRange('jump-h', (value) => model.setJumpConfig({ height: value }));
bindRange('jump-d', (value) => model.setJumpConfig({ duration: value }));
bindRange('height', (value) => model.setHeight(value));

window.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    event.preventDefault();
    model.jump();
  } else if (event.key === '1') setAction('idle');
  else if (event.key === '2') setAction('walk');
  else if (event.key === '3') setAction('run');
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

let previousAction = model.getAction();
let last = performance.now();
function frame(now: number) {
  const dt = (now - last) / 1000;
  last = now;
  model.update(dt);
  const current = model.getAction();
  if (current !== previousAction) {
    previousAction = current;
    state.textContent = current;
    for (const button of actions) button.classList.toggle('active', button.dataset.action === current);
  }
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

declare global {
  interface Window {
    __CHIHIRO_MODEL__?: ReturnType<typeof createChihiroModel>;
  }
}
