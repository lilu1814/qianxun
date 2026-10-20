import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { Soundtrack } from '../audio';
import { StoryUI, wait } from './ui';
import {
  buildBathhouseWorld,
  buildFieldWorld,
  buildMeadowWorld,
  buildTownWorld,
  buildTunnelWorld,
  makeGlowTexture,
  makeShadowTexture,
  type BathhouseWorld,
  type FieldWorld,
  type MeadowWorld,
  type TownWorld,
  type TunnelWorld,
} from './world';

type WorldName = 'field' | 'tunnel' | 'meadow' | 'town' | 'bathhouse';
type Phase = 'loading' | 'title' | 'playing' | 'ended';

interface ReachTarget {
  point: THREE.Vector3;
  radius: number;
  resolve: () => void;
}

interface CinematicShot {
  pos: THREE.Vector3;
  look: THREE.Vector3;
  speed?: number;
}

function smoothAngle(current: number, target: number, factor: number): number {
  let delta = ((target - current + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (delta < -Math.PI) delta += Math.PI * 2;
  return current + delta * factor;
}

const damp = (current: number, target: number, lambda: number, dt: number): number =>
  THREE.MathUtils.damp(current, target, lambda, dt);

export class ChapterOne3D {
  readonly ui = new StoryUI();
  readonly audio = new Soundtrack();
  readonly memories: string[] = [];

  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private clock = new THREE.Clock();
  private canvas: HTMLCanvasElement;
  private stage: HTMLElement;

  private field: FieldWorld;
  private tunnel: TunnelWorld;
  private meadow: MeadowWorld;
  private town: TownWorld;
  private bathhouse: BathhouseWorld;
  private world: WorldName = 'field';
  private chapterNumber: 1 | 2 = 1;
  private bathStage: 'bridge' | 'boiler' | 'office' = 'bridge';
  private carryingCoal: THREE.Mesh | null = null;
  private townTime = 0;
  private townNight = false;
  private townMood: 'day' | 'dusk' | 'night' = 'day';

  private player = new THREE.Group();
  private modelRoot = new THREE.Group();
  private model: THREE.Object3D | null = null;
  private mixer: THREE.AnimationMixer | null = null;
  private idleAction: THREE.AnimationAction | null = null;
  private walkAction: THREE.AnimationAction | null = null;
  private walkWeight = 0;
  private animMoving = false;
  private animSpeed = 0;
  private animBackward = false;
  private shadowBlob: THREE.Mesh;
  private playerVisible = true;

  private camYaw = Math.PI;
  private camPitch = 0.27;
  private camDistance = 4.4;
  private camTargetDistance = 4.4;
  private camLookHeight = 1.02;
  private followLook = new THREE.Vector3();
  private followLookTarget = new THREE.Vector3();
  private followPos = new THREE.Vector3();
  private camMode: 'follow' | 'cinematic' | 'title' = 'title';
  private cine: CinematicShot | null = null;
  private titleTime = 0;

  private keys = new Set<string>();
  private joystick = { x: 0, y: 0, active: false, pointer: -1 };
  private joystickEl: HTMLElement;
  private joystickKnob: HTMLElement;
  private dragging = false;
  private dragMoved = false;
  private dragLast = { x: 0, y: 0 };
  private pointerId = -1;
  private pointerLocked = false;
  private pointerLockFailed = false;
  private freeLook = false;
  private freeLookLast = { x: 0, y: 0 };

  private moveTarget: THREE.Vector3 | null = null;
  private clickRing: THREE.Mesh;
  private reachRing: THREE.Mesh;
  private reachGlow: THREE.Sprite;
  private reachBeam: THREE.Mesh;
  private reachTarget: ReachTarget | null = null;
  private interactTarget: { point: THREE.Vector3; radius: number; text: string; resolve: () => void } | null = null;
  private breathActive = false;
  private breath = 1;
  private ghostHitCooldown = 0;

  private phase: Phase = 'loading';
  private paused = false;
  private movementEnabled = false;
  private cutscene = false;
  private walkPhase = 0;
  private lastStep = 0;
  private stepPuffs: Array<{ sprite: THREE.Sprite; life: number }> = [];
  private stepGlowTexture = makeGlowTexture();
  private parentProgress = 0;
  private parentsAuto = false;
  private parentWalkPhase = 0;

  private transforming = false;
  private transformTime = 0;
  private transformed = false;
  private shakeTime = 0;
  private shakeAmount = 0;
  private autoWalk: { from: THREE.Vector3; to: THREE.Vector3; t: number; duration: number; heading: number; resolve: () => void } | null = null;

  private resizeObserver: ResizeObserver;
  private fillLight: THREE.DirectionalLight;
  private disposed = false;

  onReady?: () => void;
  onComplete?: () => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const stage = document.getElementById('stage');
    if (!stage) throw new Error('Missing #stage');
    this.stage = stage;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.28;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.camera = new THREE.PerspectiveCamera(42, 16 / 9, 0.06, 240);
    this.scene.background = new THREE.Color(0x0a0e0d);
    this.scene.fog = new THREE.Fog(0x93a99b, 28, 95);

    // A soft fill that follows the camera keeps the character readable in the
    // stylised, low-key lighting of the world.
    const fill = new THREE.DirectionalLight(0xfff0d4, 1.35);
    fill.castShadow = false;
    this.scene.add(fill);
    this.scene.add(fill.target);
    this.fillLight = fill;

    this.field = buildFieldWorld();
    this.tunnel = buildTunnelWorld();
    this.meadow = buildMeadowWorld();
    this.town = buildTownWorld();
    this.bathhouse = buildBathhouseWorld();
    this.field.group.visible = false;
    this.tunnel.group.visible = false;
    this.meadow.group.visible = false;
    this.town.group.visible = false;
    this.bathhouse.group.visible = false;
    this.scene.add(this.field.group, this.tunnel.group, this.meadow.group, this.town.group, this.bathhouse.group);

    this.player.add(this.modelRoot);
    this.scene.add(this.player);
    this.shadowBlob = new THREE.Mesh(
      new THREE.PlaneGeometry(1.15, 1.15),
      new THREE.MeshBasicMaterial({
        map: makeShadowTexture(),
        transparent: true,
        opacity: 0.62,
        depthWrite: false,
      }),
    );
    this.shadowBlob.rotation.x = -Math.PI / 2;
    this.shadowBlob.position.y = 0.012;
    this.player.add(this.shadowBlob);

    // click-to-move target ring
    this.clickRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.22, 0.012, 6, 32),
      new THREE.MeshBasicMaterial({
        color: 0xf0d39a,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    this.clickRing.rotation.x = -Math.PI / 2;
    this.clickRing.position.y = 0.03;
    this.scene.add(this.clickRing);

    // narrative reach marker
    this.reachRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.58, 0.018, 8, 44),
      new THREE.MeshBasicMaterial({
        color: 0xf2ce91,
        transparent: true,
        opacity: 0.72,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    this.reachRing.rotation.x = -Math.PI / 2;
    this.reachRing.position.y = 0.035;
    this.reachRing.visible = false;
    this.scene.add(this.reachRing);

    this.reachBeam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.08, 2.6, 8, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0xf2d49c,
        transparent: true,
        opacity: 0.22,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    this.reachBeam.visible = false;
    this.scene.add(this.reachBeam);

    this.reachGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: makeGlowTexture(),
        color: 0xf9dca7,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    this.reachGlow.scale.setScalar(1.9);
    this.reachGlow.visible = false;
    this.scene.add(this.reachGlow);

    const joy = document.getElementById('joystick');
    const knob = document.querySelector<HTMLElement>('.joystick-knob');
    if (!joy || !knob) throw new Error('Missing joystick');
    this.joystickEl = joy;
    this.joystickKnob = knob;
    this.bindInput();
    this.bindJoystick();

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.stage);
    this.resize();

    this.renderer.setAnimationLoop(this.loop);
  }

  private resize(): void {
    const rect = this.stage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    this.renderer.setSize(rect.width, rect.height, false);
    this.camera.aspect = rect.width / rect.height;
    this.camera.updateProjectionMatrix();
  }

  async init(onProgress: (progress: number, label?: string) => void): Promise<void> {
    onProgress(0.03, '野原をひらく');
    await wait(60);
    onProgress(0.07, '旧市街の灯をともす');
    await wait(30);
    onProgress(0.1, '千尋を呼ぶ');
    await this.loadChihiro(onProgress);
    onProgress(0.99, '風が来た');
    await wait(120);
    this.setWorld('field');
    this.prepareTitle();
    this.phase = 'title';
    this.ui.setActive(false);
    onProgress(1, '');
  }

  private loadChihiro(onProgress: (progress: number, label?: string) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath('/draco/');
      loader.setDRACOLoader(dracoLoader);
      loader.load(
        '/models/chihiro_compact.glb',
        (gltf) => {
          const model = gltf.scene;
          model.traverse((object) => {
            if (object instanceof THREE.Mesh) {
              object.castShadow = true;
              object.receiveShadow = false;
              const materials = Array.isArray(object.material) ? object.material : [object.material];
              materials.forEach((material) => {
                if (material instanceof THREE.MeshStandardMaterial) {
                  material.roughness = Math.min(0.92, Math.max(0.55, material.roughness));
                  material.metalness = Math.min(0.08, material.metalness);
                  material.envMapIntensity = 0.35;
                  material.needsUpdate = true;
                }
              });
            }
          });
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const scale = 1.42 / Math.max(0.001, size.y);
          model.scale.setScalar(scale);
          const scaledBox = new THREE.Box3().setFromObject(model);
          model.position.y -= scaledBox.min.y;
          this.model = model;
          this.modelRoot.add(model);
          this.modelRoot.rotation.y = 0;
          const clips = gltf.animations;
          if (clips.length) {
            this.mixer = new THREE.AnimationMixer(model);
            const idleClip = clips.find((clip) => /idle/i.test(clip.name)) ?? clips[0];
            const walkClip = clips.find((clip) => /walk/i.test(clip.name)) ?? clips[1] ?? clips[0];
            this.idleAction = this.mixer.clipAction(idleClip);
            this.walkAction = this.mixer.clipAction(walkClip);
            this.idleAction.setLoop(THREE.LoopRepeat, Infinity);
            this.walkAction.setLoop(THREE.LoopRepeat, Infinity);
            this.idleAction.enabled = true;
            this.walkAction.enabled = true;
            this.idleAction.setEffectiveWeight(1);
            this.walkAction.setEffectiveWeight(0);
            this.idleAction.play();
            this.walkAction.play();
            this.mixer.update(0);
          }
          resolve();
        },
        (event) => {
          const total = event.total || 3225212;
          const p = 0.1 + Math.min(0.86, (event.loaded / total) * 0.86);
          onProgress(p, '千尋の手を取る');
        },
        (error) => reject(error),
      );
    });
  }

  setChapter(chapter: 1 | 2): void {
    this.chapterNumber = chapter;
  }

  get currentChapter(): 1 | 2 {
    return this.chapterNumber;
  }

  prepareTitle(): void {
    this.phase = 'title';
    this.setWorld('field');
    this.player.position.copy(this.field.playerStart);
    this.player.rotation.y = 0.16;
    this.playerVisible = true;
    this.player.visible = true;
    this.placeParentsAt(0.36);
    this.camMode = 'title';
    this.titleTime = 0;
    this.camera.position.set(1.4, 1.9, 3.3);
    this.camera.lookAt(-0.8, 1.0, -0.4);
    this.audio.setMood('day');
  }

  async begin(): Promise<void> {
    if (this.phase !== 'title') return;
    this.chapterNumber = 1;
    this.phase = 'playing';
    this.ui.setActive(true);
    this.ui.showHud(true);
    this.audio.init();
    this.audio.setMood('day');
    this.setWorld('field');
    this.player.position.copy(this.field.playerStart);
    this.player.rotation.y = 0;
    this.parentsAuto = false;
    this.parentProgress = 0;
    this.placeParentsAt(0.3);
    this.camMode = 'cinematic';
    this.cine = {
      pos: new THREE.Vector3(this.player.position.x + 2.8, 1.95, this.player.position.z + 3.55),
      look: new THREE.Vector3(this.player.position.x + 0.12, 0.98, this.player.position.z + 0.15),
      speed: 1.35,
    };
    this.snapCamera();
    await this.ui.chapterIntro('第一章', 'トンネル', '地図の外、風が古い門を抜けていく。');
    await this.ui.narrate('夏の終わり。引っ越しの車は、地図にない土の道に止まった。');
    await this.ui.say('父さん', '見ろ、あそこに古い門がある。抜ければ近道かもしれない。');
    await this.ui.say('母さん', '千尋、ぐずぐずしないで。暗くなる前に新居へ着かないと。');
    await this.ui.say('千尋', 'こんなところ……とても近道には見えない。');
    this.ui.setObjective('両親について、古い門へ向かう');
    this.camMode = 'follow';
    this.camYaw = Math.PI;
    this.camPitch = 0.27;
    this.camDistance = 4.6;
    this.camTargetDistance = 4.6;
    this.movementEnabled = true;
    this.parentsAuto = true;
    await this.waitForReach(this.field.gateTrigger, 4.2);
    this.movementEnabled = false;
    this.parentsAuto = false;
    this.placeParentsAt(0.78);
    this.memories.push('両親について、地図の外の古い門をくぐった。');
    this.cutscene = true;
    this.ui.hideObjective();
    this.setCinematic(
      new THREE.Vector3(this.player.position.x + 3.0, 3.05, this.player.position.z - 5.7),
      new THREE.Vector3(0.35, 2.02, 23.1),
      1.7,
    );
    await this.autoWalkTo(new THREE.Vector3(1.05, 0, 20.25), 1.15, 0);
    await this.ui.say('父さん', 'ただの古い遊園地だ。行こう、暗くなる前にな。');
    await this.ui.say('母さん', '門の前でぼんやりしないで。');
    await this.ui.say('千尋', '待ってよ——');
    await this.ui.fade(true, 1000);
    await this.enterTunnel();
  }

  private async enterTunnel(): Promise<void> {
    this.setWorld('tunnel');
    this.player.position.copy(this.tunnel.playerStart);
    this.player.rotation.y = 0;
    this.camMode = 'follow';
    this.camYaw = Math.PI;
    this.camPitch = 0.22;
    this.camDistance = 3.8;
    this.camTargetDistance = 3.8;
    this.ui.setObjective('トンネルを抜ける');
    this.snapCamera();
    await this.ui.fade(false, 900);
    this.audio.setMood('mystery');
    this.audio.play('wind');
    this.cutscene = false;
    this.movementEnabled = true;
    await this.ui.narrate('トンネルの風は、古い木と草の匂いがした。');
    await this.waitForReach(this.tunnel.midpointTrigger, 2.2);
    this.movementEnabled = false;
    await this.ui.say('千尋', 'お父さん？ お母さん？');
    await this.ui.narrate('誰も答えない。足音だけが、煉瓦の壁の間で反響する。');
    this.movementEnabled = true;
    await this.waitForReach(this.tunnel.exitTrigger, 2.2);
    this.movementEnabled = false;
    this.cutscene = true;
    this.audio.play('wind');
    this.ui.flash('fire');
    await wait(600);
    await this.ui.fade(true, 1100);
    await this.enterMeadow();
  }

  private async enterMeadow(): Promise<void> {
    this.setWorld('meadow');
    this.player.position.copy(this.meadow.playerStart);
    this.player.rotation.y = 0;
    this.camMode = 'follow';
    this.camYaw = Math.PI;
    this.camPitch = 0.22;
    this.camDistance = 4.15;
    this.camTargetDistance = 4.15;
    this.ui.setObjective('草原を抜けて、市場へ');
    this.snapCamera();
    await this.ui.fade(false, 1000);
    this.audio.setMood('day');
    this.cutscene = false;
    this.movementEnabled = true;
    await this.ui.narrate('トンネルの先は来た道ではなく、陽に照らされた草原だった。');
    await this.ui.say('千尋', '広い草原……お父さん？ お母さん？');
    await this.ui.narrate('風が草の丘を渡る。遠くの屋根が、雲の影から覗いていた。');
    await this.ui.setObjective('草原を抜けて、市場へ');
    await this.waitForReach(this.meadow.statueTrigger, 4.2);
    this.movementEnabled = false;
    await this.ui.narrate('道端の石像は人の顔をしていて、苔が目元まで這い上がっている。');
    await this.ui.say('千尋', '見られてる……');
    this.memories.push('石像の草原を抜け、遠くの市場へ向かった。');
    this.movementEnabled = true;
    await this.waitForReach(this.meadow.marketTrigger, 3.2);
    this.movementEnabled = false;
    this.cutscene = true;
    await this.ui.narrate('草の丘を越えると、旧市街が午後の陽の中に広がった。');
    await this.ui.fade(true, 1000);
    await this.enterTown();
  }

  private async enterTown(): Promise<void> {
    this.setWorld('town');
    this.townTime = 0;
    this.townNight = false;
    this.townMood = 'day';
    this.town.setTime(0);
    this.applyTownFog();
    this.player.position.copy(this.town.playerStart);
    this.player.rotation.y = 0;
    this.camMode = 'follow';
    this.camYaw = Math.PI;
    this.camPitch = 0.26;
    this.camDistance = 7.2;
    this.camTargetDistance = 7.2;
    this.ui.setObjective('両親を探す');
    this.snapCamera();
    await this.ui.fade(false, 1100);
    this.audio.setMood('day');
    this.cutscene = false;
    this.movementEnabled = true;
    await this.ui.narrate('草の丘の先には、陽に照らされた旧市街があった。');
    await this.ui.say('千尋', 'いい匂い……でも、誰もいない。');
    this.ui.setObjective('市街の奥へ進む');
    await this.waitForReach(this.town.stallTrigger, 2.4);
    this.movementEnabled = false;
    this.cutscene = true;
    this.ui.hideObjective();
    this.setCinematic(
      new THREE.Vector3(-3.2, 2.35, 5.8),
      new THREE.Vector3(2.05, 1.02, 13.9),
      1.25,
    );
    await this.ui.say('父さん', '千尋、早く来い！ ここの料理は最高だ。');
    await this.ui.say('母さん', '店主はいないみたい。お金はテーブルに置いておけばいい。');
    await this.ui.say('千尋', '食べないで！ ここがどこかも分からないのに——');
    this.startTransformation();
    await wait(650);
    this.setCinematic(
      new THREE.Vector3(-1.55, 1.7, 10.9),
      new THREE.Vector3(2.3, 0.92, 14.25),
      2.4,
    );
    await wait(2200);
    await this.ui.narrate('振り返ったとき、ベンチの両親はもういなかった。');
    await this.ui.narrate('服を着た二頭の豚が、夕暮れの中で夢中で食べているだけだった。');
    this.setCinematic(
      new THREE.Vector3(-3.5, 2.55, 5.0),
      new THREE.Vector3(1.5, 1.05, 13.0),
      1.4,
    );
    await this.ui.say('千尋', 'お父さん……お母さん……？');
    await this.ui.say('千尋', 'うそでしょ……目を覚まして！');
    await this.autoStepBack(new THREE.Vector3(-0.4, 0, 7.2), 1.1);
    this.ui.setObjective('', false);
    await this.ui.narrate('遠くで電車が水の上を走る音。空が、急に暗くなった。');
    await wait(500);
    this.memories.push('旧市街の夕暮れ、両親は豚になった。');
    this.finishChapter();
  }

  async beginChapterTwo(): Promise<void> {
    if (this.phase !== 'title') return;
    this.chapterNumber = 2;
    this.phase = 'playing';
    this.ui.setActive(true);
    this.ui.showHud(true);
    this.audio.init();
    this.audio.setMood('night');
    this.audio.cinematicSwell();
    this.setWorld('bathhouse');
    this.bathStage = 'bridge';
    this.bathhouse.setStage('bridge');
    this.bathhouse.setHakuWalking(false);
    this.player.position.copy(this.bathhouse.playerStart);
    this.player.rotation.y = 0;
    this.player.visible = true;
    this.playerVisible = true;
    this.camMode = 'follow';
    this.camYaw = Math.PI;
    this.camPitch = 0.22;
    this.camDistance = 5.4;
    this.camTargetDistance = 5.4;
    this.camLookHeight = 1.55;
    this.movementEnabled = false;
    this.cutscene = true;
    this.snapCamera();
    this.ui.setObjective('', false);

    await this.ui.chapterIntro('第二章', '契約', '湯屋では、名前が自由を意味する。');
    await this.ui.narrate('橋の下の水は、鏡のように黒い。');
    await this.ui.narrate('白龍は橋の中央に立ち、背を向けていた。');
    this.ui.setObjective('白龍についていく');
    this.cutscene = false;
    this.movementEnabled = true;

    await this.waitForReach(this.bathhouse.hakuTrigger, 2.6);
    this.movementEnabled = false;
    this.cutscene = true;
    this.setCinematic(new THREE.Vector3(1.8, 1.75, 2.5), new THREE.Vector3(0, 1.05, 6.4), 1.5);
    await this.ui.say('白龍', '声を出すな。ここは湯屋の縄張りだ。');
    await this.ui.say('千尋', 'お父さんとお母さんが……豚になっちゃった。');
    await this.ui.say('白龍', '助けたいなら、ついて来い。橋を渡るときは息を止めろ。');
    this.memories.push('白龍が湯屋の長い橋で彼女を止めた。');

    this.audio.setMood('mystery');
    this.breathActive = true;
    this.breath = 1;
    this.ghostHitCooldown = 0;
    this.ui.showBreathHint();
    this.ui.setObjective('Eを押したまま息を止め、白龍について橋を渡る');
    this.bathhouse.setHakuWalking(true);
    this.camMode = 'follow';
    this.camYaw = Math.PI;
    this.camPitch = 0.2;
    this.camDistance = 5.4;
    this.camTargetDistance = 5.4;
    this.camLookHeight = 1.55;
    this.cutscene = false;
    this.movementEnabled = true;

    await this.waitForReach(this.bathhouse.entranceTrigger, 3.0);
    this.movementEnabled = false;
    this.cutscene = true;
    this.breathActive = false;
    this.ui.hideBreathHint();
    this.bathhouse.setHakuWalking(false);
    this.setCinematic(new THREE.Vector3(2.0, 2.1, 14.5), new THREE.Vector3(0, 2.2, 24.5), 1.6);
    await this.ui.say('白龍', '中に入ったら、何を見ても声を出すな。');
    await this.ui.say('千尋', 'あなたは？');
    await this.ui.say('白龍', '必ず見つける。');
    await this.ui.narrate('彼女は深く息を吸い、湯屋へ入っていった。');
    await this.ui.fade(true, 1100);
    await this.enterBoiler();
  }

  private async enterBoiler(): Promise<void> {
    this.bathStage = 'boiler';
    this.bathhouse.setStage('boiler');
    this.fillLight.intensity = 1.35;
    this.player.position.copy(this.bathhouse.boilerPlayerStart);
    this.player.rotation.y = Math.PI;
    this.camMode = 'follow';
    this.camYaw = 0;
    this.camPitch = 0.2;
    this.camDistance = 4.6;
    this.camTargetDistance = 4.6;
    this.camLookHeight = 1.5;
    this.cutscene = true;
    this.movementEnabled = false;
    this.snapCamera();
    await this.ui.fade(false, 900);
    await this.ui.narrate('ボイラー室は外より熱い。配管が血管のように壁を這っている。');
    this.setCinematic(new THREE.Vector3(3.2, 2.5, 3.2), new THREE.Vector3(-1.4, 2.0, -3.0), 1.4);
    await this.ui.say('釜爺', 'また人間か。白龍が連れてきたのか？');
    await this.ui.say('千尋', 'お願いします。ここで働かせてください。');
    await this.ui.say('釜爺', '人手は足りている。上へ行って、湯婆婆に頼め。');
    await this.ui.say('千尋', '両親が豚にされてしまったんです……ここに残らないと。');
    await this.ui.say('リン', '釜爺、私が上まで連れて行きます。');
    await this.ui.say('釜爺', 'まず、この石炭を炉にくべろ。');
    this.memories.push('釜爺が彼女に最初の仕事をくれた。');

    this.camMode = 'follow';
    this.camYaw = 0;
    this.camPitch = 0.2;
    this.camDistance = 4.6;
    this.camTargetDistance = 4.6;
    this.camLookHeight = 1.5;
    this.cutscene = false;
    this.movementEnabled = true;
    this.ui.setObjective('石炭を炉口へ運ぶ');
    this.bathhouse.coal.visible = true;
    await this.waitForInteract(this.bathhouse.coal.position, 1.8, '石炭を拾う');
    this.ui.hideInteractHint();
    this.bathhouse.coal.visible = false;
    const coal = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.2, 0),
      new THREE.MeshStandardMaterial({ color: 0x171616, roughness: 0.86 }),
    );
    coal.position.set(0, 1.05, 0.22);
    this.player.add(coal);
    this.carryingCoal = coal;
    this.ui.toast('石炭を拾った', 1200);
    this.ui.setObjective('石炭を炉口へ入れる');
    await this.waitForInteract(this.bathhouse.furnaceTrigger, 2.0, '石炭を炉口へ入れる');
    this.ui.hideInteractHint();
    if (this.carryingCoal) {
      this.player.remove(this.carryingCoal);
      this.carryingCoal.geometry.dispose();
      (this.carryingCoal.material as THREE.Material).dispose();
      this.carryingCoal = null;
    }
    this.audio.play('stamp');
    this.ui.flash('fire');
    this.shake(0.45, 0.08);
    this.ui.hideObjective();
    this.cutscene = true;
    this.movementEnabled = false;
    this.setCinematic(new THREE.Vector3(3.2, 2.5, 1.8), new THREE.Vector3(-1.4, 2.0, -3.0), 1.5);
    await this.ui.say('釜爺', 'なかなか手際がいい。上へ行け。私が入れたとは言うなよ。');
    await this.ui.say('リン', 'ついて来て。人間だってことは、誰にも言わないで。');
    await this.ui.fade(true, 1000);
    await this.enterOffice();
  }

  private async enterOffice(): Promise<void> {
    this.bathStage = 'office';
    this.bathhouse.setStage('office');
    this.fillLight.intensity = 1.1;
    this.player.position.copy(this.bathhouse.officePlayerStart);
    this.player.rotation.y = Math.PI;
    this.camMode = 'cinematic';
    this.setCinematic(new THREE.Vector3(0.35, 2.5, 6.2), new THREE.Vector3(0, 1.38, -2.8), 1.4);
    this.snapCamera();
    await this.ui.fade(false, 900);
    await this.ui.narrate('紙灯籠が頭の上で揺れている。湯婆婆が机の向こうに座っていた。');
    this.ui.setObjective('湯婆婆に仕事を願い出る');
    await this.ui.say('湯婆婆', '人間？ 誰が入れた？');
    await this.ui.say('千尋', '仕事をください。');
    await this.ui.say('湯婆婆', 'ここに人間は置かない。警備を呼ぶ前に出ていけ。');
    await this.ui.say('千尋', '両親が豚にされました。ここに残って、助けたいんです。');
    await this.ui.say('坊', 'お母さん、この子を置いてあげて！');
    await this.ui.say('湯婆婆', '黙りな、坊。');
    await this.ui.say('三つの頭', '残して……残して……');
    await this.ui.say('湯婆婆', '……見かけより頑固な子だね。');
    await this.ui.say('千尋', '何でもします。仕事をください。');
    await this.ui.say('湯婆婆', 'なら契約だ。名前は？');
    await this.ui.say('千尋', '荻野千尋。');
    this.ui.setObjective('', false);
    await this.ui.say('湯婆婆', '今日からお前の名は「千」だ。');
    this.ui.showNameCard('荻野千尋', '千');
    await wait(2500);
    this.ui.hideNameCard();
    await this.ui.say('千尋', '千……？');
    await this.ui.say('湯婆婆', '契約成立。お前の名前、もらったよ。');
    await this.ui.narrate('彼女は契約書を見下ろす。ふと、元の名前を思い出せなくなっていた。');
    await wait(700);
    await this.ui.fade(true, 1200);
    this.memories.push('湯婆婆が名前を奪い、「千」だけを残した。');
    this.finishChapterTwo();
  }

  private finishChapterTwo(): void {
    this.audio.setMood('ending');
    this.phase = 'ended';
    this.ui.setActive(false);
    this.ui.hideHint();
    this.ui.hideObjective();
    this.ui.hideInteractHint();
    this.ui.hideBreathHint();
    this.movementEnabled = false;
    this.onComplete?.();
  }

  private finishChapter(): void {
    this.audio.setMood('ending');
    this.phase = 'ended';
    this.ui.setActive(false);
    this.ui.hideHint();
    this.ui.hideObjective();
    this.ui.hideInteractHint();
    this.ui.hideBreathHint();
    this.movementEnabled = false;
    this.onComplete?.();
  }

  private applyTownFog(): void {
    if (this.scene.background instanceof THREE.Color) this.scene.background.copy(this.town.fogColor);
    else this.scene.background = this.town.fogColor.clone();
    if (this.scene.fog instanceof THREE.Fog) {
      this.scene.fog.color.copy(this.town.fogColor);
      this.scene.fog.near = this.town.fogNear;
      this.scene.fog.far = this.town.fogFar;
    }
  }

  private setWorld(name: WorldName): void {
    this.world = name;
    this.field.group.visible = name === 'field';
    this.tunnel.group.visible = name === 'tunnel';
    this.meadow.group.visible = name === 'meadow';
    this.town.group.visible = name === 'town';
    this.bathhouse.group.visible = name === 'bathhouse';
    if (name === 'field') {
      this.scene.background = new THREE.Color(0x8bb0b4);
      this.scene.fog = new THREE.Fog(0xb8c8b2, 38, 125);
      this.camDistance = 4.6;
      this.camTargetDistance = 4.6;
    } else if (name === 'tunnel') {
      this.scene.background = new THREE.Color(0x090b09);
      this.scene.fog = new THREE.Fog(0x11110f, 2.5, 34);
      this.camDistance = 3.8;
      this.camTargetDistance = 3.8;
    } else if (name === 'meadow') {
      this.scene.background = new THREE.Color(0x9ac9e4);
      this.scene.fog = new THREE.Fog(0xd7e7da, 48, 155);
      this.camDistance = 4.5;
      this.camTargetDistance = 4.5;
      this.camLookHeight = 1.72;
      this.camera.fov = 52;
      this.camera.updateProjectionMatrix();
    } else {
      this.scene.background = this.town.fogColor.clone();
      this.scene.fog = new THREE.Fog(this.town.fogColor.clone(), this.town.fogNear, this.town.fogFar);
      this.camDistance = 4.35;
      this.camTargetDistance = 4.35;
    }
    if (name !== 'meadow' && this.camera.fov !== 42) {
      this.camera.fov = 42;
      this.camera.updateProjectionMatrix();
    }
    this.camLookHeight = name === 'meadow' ? 1.72 : 1.02;
    this.moveTarget = null;
  }

  private placeParentsAt(progress: number): void {
    const positions = [progress - 0.012, progress + 0.015];
    this.field.parents.forEach((parent, i) => {
      const u = THREE.MathUtils.clamp(positions[i], 0.02, 0.96);
      const p = this.field.path.getPoint(u);
      const tangent = this.field.path.getTangent(u);
      parent.position.set(p.x + (i === 0 ? -0.26 : 0.26), 0, p.z);
      parent.rotation.y = Math.atan2(tangent.x, tangent.z);
      parent.userData.baseY = 0;
    });
  }

  private waitForReach(point: THREE.Vector3, radius: number): Promise<void> {
    return new Promise((resolve) => {
      this.reachTarget = { point: point.clone(), radius, resolve };
      const ground = point.y + 0.04;
      this.reachRing.position.set(point.x, ground, point.z);
      this.reachBeam.position.set(point.x, point.y + 1.3, point.z);
      this.reachGlow.position.set(point.x, point.y + 1.0, point.z);
      this.reachRing.visible = true;
      this.reachBeam.visible = true;
      this.reachGlow.visible = true;
    });
  }

  private waitForInteract(point: THREE.Vector3, radius: number, text: string): Promise<void> {
    return new Promise((resolve) => {
      this.interactTarget = { point: point.clone(), radius, text, resolve };
      this.ui.hideInteractHint();
    });
  }

  private resolveInteract(): void {
    if (!this.interactTarget) return;
    const target = this.interactTarget;
    this.interactTarget = null;
    this.ui.hideInteractHint();
    this.audio.play('confirm');
    target.resolve();
  }

  private updateInteractHint(): void {
    if (!this.interactTarget) {
      this.ui.hideInteractHint();
      return;
    }
    const d = Math.hypot(
      this.player.position.x - this.interactTarget.point.x,
      this.player.position.z - this.interactTarget.point.z,
    );
    if (d <= this.interactTarget.radius && !this.ui.blocking && this.movementEnabled) {
      this.ui.showInteractHint(this.interactTarget.text);
    } else {
      this.ui.hideInteractHint();
    }
  }

  private updateBreathAndGhosts(dt: number): void {
    if (this.world !== 'bathhouse' || this.bathStage !== 'bridge') return;
    const held = this.breathActive && this.keys.has('KeyE');
    if (this.breathActive) {
      if (held) this.breath = Math.max(0, this.breath - dt * 0.034);
      else this.breath = Math.min(1, this.breath + dt * 0.15);
      this.ui.setBreath(this.breath, held);
    }
    this.ghostHitCooldown = Math.max(0, this.ghostHitCooldown - dt);
    const t = this.clock.elapsedTime;
    this.bathhouse.ghosts.forEach((ghost) => {
      const materials = ghost.userData.materials as THREE.MeshStandardMaterial[];
      const targetOpacity = !this.breathActive ? 0.26 : held ? 0.3 : 0.78;
      materials.forEach((material) => {
        material.opacity += (targetOpacity - material.opacity) * Math.min(1, dt * 4.5);
      });
      const baseX = Number(ghost.userData.baseX) || 0;
      const baseZ = Number(ghost.userData.baseZ) || 0;
      const phase = Number(ghost.userData.phase) || 0;
      let x = baseX + Math.sin(t * 0.35 + phase) * 0.22;
      let z = baseZ + Math.cos(t * 0.28 + phase) * 0.12;
      if (this.breathActive && !held) {
        const dx = this.player.position.x - ghost.position.x;
        const dz = this.player.position.z - ghost.position.z;
        const dist = Math.hypot(dx, dz);
        if (dist > 0.01) ghost.rotation.y = Math.atan2(dx, dz);
        x = ghost.position.x + dx * Math.min(0.6, dt * 0.3);
        z = ghost.position.z + dz * Math.min(0.6, dt * 0.3);
        if (dist < 1.25 && this.ghostHitCooldown <= 0) {
          this.ghostHitCooldown = 2.8;
          this.breath = 0.42;
          this.player.position.z = Math.max(6.2, this.player.position.z - 2.3);
          this.ui.flash('red');
          this.audio.play('wind');
          this.shake(0.45, 0.1);
          this.ui.toast('息を止めろ！ 見つかったぞ', 2300);
        }
      } else {
        ghost.rotation.y = baseX < 0 ? Math.PI / 2 : -Math.PI / 2;
      }
      ghost.position.x = x;
      ghost.position.z = z;
    });
  }

  private resolveReach(): void {
    if (!this.reachTarget) return;
    const target = this.reachTarget;
    this.reachTarget = null;
    this.reachRing.visible = false;
    this.reachBeam.visible = false;
    this.reachGlow.visible = false;
    this.audio.play('confirm');
    target.resolve();
  }

  private setCinematic(pos: THREE.Vector3, look: THREE.Vector3, speed = 2.0): void {
    this.camMode = 'cinematic';
    this.cine = { pos: pos.clone(), look: look.clone(), speed };
  }

  private snapCamera(): void {
    this.updateFollowDesired();
    if (this.camMode === 'cinematic' && this.cine) {
      this.camera.position.copy(this.cine.pos);
      this.followLook.copy(this.cine.look);
      this.camera.lookAt(this.cine.look);
    } else {
      this.camera.position.copy(this.followPos);
      this.followLook.copy(this.followLookTarget);
      this.camera.lookAt(this.followLook);
    }
  }

  private updateFollowDesired(): void {
    const target = this.player.position;
    const horizontal = this.camDistance * Math.cos(this.camPitch);
    const height = target.y + 1.1 + this.camDistance * Math.sin(this.camPitch);
    this.followPos.set(
      target.x + Math.sin(this.camYaw) * horizontal,
      height,
      target.z + Math.cos(this.camYaw) * horizontal,
    );
    this.followLookTarget.set(target.x, target.y + this.camLookHeight, target.z);
  }

  private updateCamera(dt: number): void {
    const p = this.player.position;
    this.fillLight.position.set(this.camera.position.x, this.camera.position.y + 2.4, this.camera.position.z);
    this.fillLight.target.position.set(p.x, p.y + 0.9, p.z);
    if (this.camMode === 'title') {
      this.titleTime += dt;
      const angle = 0.66 + Math.sin(this.titleTime * 0.07) * 0.035;
      const radius = 4.25 + Math.sin(this.titleTime * 0.11) * 0.16;
      const desired = new THREE.Vector3(
        p.x + Math.sin(angle) * radius,
        1.82 + Math.sin(this.titleTime * 0.17) * 0.06,
        p.z + Math.cos(angle) * radius,
      );
      this.camera.position.lerp(desired, 1 - Math.exp(-dt * 1.8));
      const look = new THREE.Vector3(p.x + 0.32, 1.02, p.z + 0.4);
      this.followLook.lerp(look, 1 - Math.exp(-dt * 2.3));
      this.camera.lookAt(this.followLook);
      return;
    }

    this.camDistance = damp(this.camDistance, this.camTargetDistance, 5, dt);
    this.updateFollowDesired();
    let desiredPos = this.followPos;
    let desiredLook = this.followLookTarget;
    if (this.camMode === 'cinematic' && this.cine) {
      desiredPos = this.cine.pos;
      desiredLook = this.cine.look;
    }
    const speed = this.camMode === 'cinematic' ? (this.cine?.speed ?? 2.2) : 7.0;
    this.camera.position.lerp(desiredPos, 1 - Math.exp(-dt * speed));
    const lookDamp = 1 - Math.exp(-dt * (this.camMode === 'cinematic' ? speed * 1.6 : 9));
    this.followLook.lerp(desiredLook, lookDamp);
    this.camera.lookAt(this.followLook);
  }

  private startTransformation(): void {
    this.townNight = true;
    this.transforming = true;
    this.transformTime = 0;
    this.transformed = false;
    this.shake(1.4, 0.1);
    this.audio.play('roar');
    this.ui.flash('fire');
    this.town.magicRing.visible = true;
    this.town.magicParticles.visible = true;
  }

  private updateTransformation(dt: number): void {
    if (!this.transforming) return;
    this.transformTime += dt;
    const t = this.transformTime;
    const ringMat = this.town.magicRing.material as THREE.MeshBasicMaterial;
    ringMat.opacity = Math.min(0.85, t * 2.2) * (t > 2.4 ? Math.max(0, 1 - (t - 2.4) / 1.4) : 1);
    this.town.magicRing.scale.setScalar(1 + Math.sin(t * 4) * 0.06 + Math.min(t * 0.28, 0.5));
    this.town.magicRing.rotation.z = t * 0.44;
    const pMat = this.town.magicParticles.material as THREE.PointsMaterial;
    pMat.opacity = Math.min(0.85, t * 2.0) * (t > 2.6 ? Math.max(0, 1 - (t - 2.6) / 1.2) : 1);
    this.town.magicParticles.rotation.y = t * 0.4;
    this.town.magicParticles.position.y = Math.sin(t * 2.2) * 0.05;

    this.town.humanParents.forEach((human, index) => {
      if (this.transformed) return;
      const home = human.userData.home as THREE.Vector3 | undefined;
      if (!home) return;
      const jitter = Math.min(1, t * 2.2) * 0.035;
      human.position.x = home.x + Math.sin(t * 47 + index * 2.3) * jitter;
      human.position.z = home.z + Math.cos(t * 39 + index * 1.7) * jitter;
    });

    if (!this.transformed && t >= 0.72) {
      this.transformed = true;
      this.town.humanParents.forEach((p) => (p.visible = false));
      this.town.pigs.forEach((p, i) => {
        p.visible = true;
        p.position.y = 0.5;
        p.scale.setScalar(i === 0 ? 0.25 : 0.23);
      });
      this.ui.flash('red');
      this.audio.play('stamp');
      this.shake(1.0, 0.18);
    }
    if (this.transformed) {
      const grow = Math.min(1, (t - 0.72) / 0.7);
      this.town.pigs.forEach((p, i) => {
        const base = i === 0 ? 1.0 : 0.94;
        p.scale.setScalar(THREE.MathUtils.lerp(0.25, base, grow));
      });
    }
    if (t > 3.8) {
      this.transforming = false;
      this.town.magicRing.visible = false;
      this.town.magicParticles.visible = false;
    }
  }

  private updateParents(dt: number): void {
    if (this.world !== 'field') return;
    const parents = this.field.parents;
    if (this.parentsAuto) {
      this.parentProgress = Math.min(0.5, this.parentProgress + dt * 0.06);
      this.placeParentsAt(0.3 + this.parentProgress);
      this.parentWalkPhase += dt * 7;
      parents.forEach((p, i) => {
        p.position.y = Math.abs(Math.sin(this.parentWalkPhase + i * 2.6)) * 0.018;
      });
    } else {
      parents.forEach((p) => {
        p.position.y = Math.sin(this.clock.elapsedTime * 1.3 + p.id) * 0.006;
      });
    }
  }

  private getInput(): { forward: number; turn: number } {
    let forward = 0;
    let turn = 0;
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) forward += 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) forward -= 1;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) turn += 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) turn -= 1;
    forward += -this.joystick.y;
    turn += -this.joystick.x;
    forward = THREE.MathUtils.clamp(forward, -1, 1);
    turn = THREE.MathUtils.clamp(turn, -1, 1);
    if (Math.abs(forward) < 0.08) forward = 0;
    if (Math.abs(turn) < 0.08) turn = 0;
    return { forward, turn };
  }

  private updateAnimation(dt: number): void {
    if (!this.mixer || !this.idleAction || !this.walkAction) return;
    const target = this.animMoving ? 1 : 0;
    this.walkWeight = THREE.MathUtils.damp(this.walkWeight, target, 10, dt);
    this.walkAction.setEffectiveWeight(this.walkWeight);
    this.idleAction.setEffectiveWeight(1 - this.walkWeight);
    const base = this.animSpeed > 0 ? this.animSpeed : 2.7;
    const scale = THREE.MathUtils.clamp(base / 2.2, 0.8, 1.7) * (this.animBackward ? -1 : 1);
    this.walkAction.setEffectiveTimeScale(scale);
    this.idleAction.setEffectiveTimeScale(1);
    this.mixer.update(dt);
  }

  private canMove(): boolean {
    return this.phase === 'playing' && this.movementEnabled && !this.paused && !this.cutscene && !this.ui.blocking;
  }

  private updatePlayer(dt: number): void {
    const input = this.getInput();
    this.animBackward = input.forward < 0;
    const hasForward = Math.abs(input.forward) > 0.05;
    const hasTurn = Math.abs(input.turn) > 0.05;
    const running = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
    let direction = new THREE.Vector3();
    let turning = false;
    let walking = false;

    if (this.canMove()) {
      // tank controls: A / D turn the character, W / S move along her facing
      if (hasTurn) {
        this.player.rotation.y += input.turn * 2.15 * dt;
        turning = true;
      }
      if (hasForward) {
        this.moveTarget = null;
        const baseSpeed = this.world === 'meadow' ? 3.0 : 2.7;
        const speed = input.forward > 0 ? (running ? 4.35 : baseSpeed) : 1.8;
        direction.set(Math.sin(this.player.rotation.y), 0, Math.cos(this.player.rotation.y)).multiplyScalar(input.forward);
        const next = this.player.position.clone().addScaledVector(direction, speed * dt);
        this.clampPlayerPosition(next);
        this.player.position.copy(next);
        walking = true;
      } else if (this.moveTarget) {
        const toTarget = new THREE.Vector3(
          this.moveTarget.x - this.player.position.x,
          0,
          this.moveTarget.z - this.player.position.z,
        );
        if (toTarget.length() < 0.3) {
          this.moveTarget = null;
        } else {
          toTarget.normalize();
          const desiredHeading = Math.atan2(toTarget.x, toTarget.z);
          this.player.rotation.y = smoothAngle(this.player.rotation.y, desiredHeading, 1 - Math.exp(-dt * 7));
          const baseSpeed = this.world === 'meadow' ? 3.0 : 2.7;
          const speed = running ? 4.35 : baseSpeed;
          const next = this.player.position.clone().addScaledVector(toTarget, speed * dt);
          this.clampPlayerPosition(next);
          this.player.position.copy(next);
          walking = true;
        }
      }
      if (turning || walking || hasForward) {
        const behind = this.player.rotation.y + Math.PI;
        this.camYaw = smoothAngle(this.camYaw, behind, 1 - Math.exp(-dt * 4.0));
      }
    }

    if (walking) {
      this.animMoving = true;
      this.animSpeed =
        Math.abs(input.forward) > 0
          ? Math.abs(input.forward) * (running ? 4.35 : this.world === 'meadow' ? 3.0 : 2.7)
          : running
            ? 4.35
            : this.world === 'meadow'
              ? 3.0
              : 2.7;
      if (!this.mixer) {
        this.walkPhase += dt * (running ? 12.5 : 8.4);
        this.modelRoot.position.y = Math.abs(Math.sin(this.walkPhase)) * 0.028;
        this.modelRoot.rotation.z = Math.sin(this.walkPhase * 0.5) * 0.009 - input.turn * 0.018;
      }
      const cadence = this.animSpeed > 0 ? 0.43 * (2.7 / this.animSpeed) : 0.43;
      if (this.clock.elapsedTime - this.lastStep > (running ? 0.3 : cadence)) {
        this.lastStep = this.clock.elapsedTime;
        this.audio.play('step');
        this.spawnStepPuff();
      }
    } else if (turning) {
      if (!this.mixer) {
        this.walkPhase += dt * 3.0;
        this.modelRoot.position.y = Math.abs(Math.sin(this.walkPhase)) * 0.008;
        this.modelRoot.rotation.z = -input.turn * 0.026;
      }
    } else if (!this.mixer) {
      this.walkPhase += dt * 1.4;
      this.modelRoot.position.y = Math.sin(this.clock.elapsedTime * 1.5) * 0.006;
      this.modelRoot.rotation.z = 0;
    }

    if (!this.autoWalk) this.animMoving = walking;

    this.shadowBlob.position.y = 0.012;

    if (this.reachTarget) {
      const d = Math.hypot(
        this.player.position.x - this.reachTarget.point.x,
        this.player.position.z - this.reachTarget.point.z,
      );
      if (d <= this.reachTarget.radius) this.resolveReach();
    }
    this.updateInteractHint();

    this.updateClickRing(dt);
    this.updateReachMarker(dt);
  }

  private spawnStepPuff(): void {
    const material = new THREE.SpriteMaterial({
      map: this.stepGlowTexture,
      color: this.world === 'field' ? 0xcdb88b : this.world === 'tunnel' ? 0x9a876b : 0x8f7963,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sprite = new THREE.Sprite(material);
    sprite.position.set(
      this.player.position.x + (Math.random() - 0.5) * 0.25,
      this.player.position.y + 0.09,
      this.player.position.z + (Math.random() - 0.5) * 0.25,
    );
    sprite.scale.setScalar(0.36);
    this.scene.add(sprite);
    this.stepPuffs.push({ sprite, life: 0 });
  }

  private clampPlayerPosition(p: THREE.Vector3): void {
    if (this.world === 'field') {
      p.x = THREE.MathUtils.clamp(p.x, -15, 15);
      p.z = THREE.MathUtils.clamp(p.z, -4.5, 22.5);
    } else if (this.world === 'tunnel') {
      p.x = THREE.MathUtils.clamp(p.x, -2.25, 2.25);
      p.z = THREE.MathUtils.clamp(p.z, 1.2, 29.2);
    } else if (this.world === 'meadow') {
      p.x = THREE.MathUtils.clamp(p.x, -18, 18);
      p.z = THREE.MathUtils.clamp(p.z, -2.5, 36);
      p.y = this.meadow.heightAt(p.x, p.z);
    } else if (this.world === 'bathhouse') {
      if (this.bathStage === 'office') {
        p.x = THREE.MathUtils.clamp(p.x, -4.7, 4.7);
        p.z = THREE.MathUtils.clamp(p.z, -0.2, 4.6);
      } else if (this.bathStage === 'boiler') {
        p.x = THREE.MathUtils.clamp(p.x, -5.7, 5.7);
        p.z = THREE.MathUtils.clamp(p.z, -4.7, 4.8);
      } else {
        p.x = THREE.MathUtils.clamp(p.x, -1.7, 1.7);
        p.z = THREE.MathUtils.clamp(p.z, 0.0, 20.2);
      }
      p.y = 0;
    } else {
      p.x = THREE.MathUtils.clamp(p.x, -4.55, 4.55);
      p.z = THREE.MathUtils.clamp(p.z, 0.6, 34);
      p.y = 0;
    }
  }

  private updateClickRing(dt: number): void {
    const mat = this.clickRing.material as THREE.MeshBasicMaterial;
    if (this.moveTarget) {
      this.clickRing.visible = true;
      this.clickRing.position.x = this.moveTarget.x;
      this.clickRing.position.y = this.moveTarget.y + 0.035;
      this.clickRing.position.z = this.moveTarget.z;
      this.clickRing.rotation.z += dt * 1.5;
      mat.opacity = 0.35 + Math.sin(this.clock.elapsedTime * 4) * 0.1;
    } else {
      mat.opacity = Math.max(0, mat.opacity - dt * 2);
      if (mat.opacity <= 0.01) this.clickRing.visible = false;
    }
  }

  private updateReachMarker(dt: number): void {
    if (!this.reachTarget) return;
    const t = this.clock.elapsedTime;
    const pulse = 1 + Math.sin(t * 2.8) * 0.08;
    this.reachRing.scale.setScalar(pulse);
    this.reachRing.rotation.z += dt * 0.65;
    this.reachGlow.position.y = this.reachTarget.point.y + 1.0 + Math.sin(t * 1.8) * 0.08;
    (this.reachGlow.material as THREE.SpriteMaterial).opacity = 0.4 + Math.sin(t * 2.6) * 0.12;
    this.reachBeam.position.y = this.reachTarget.point.y + 1.28;
  }

  private updateAmbient(dt: number): void {
    const t = this.clock.elapsedTime;
    if (this.world === 'field') {
      const dust = this.field.group.children.find((c) => c instanceof THREE.Points);
      if (dust) dust.rotation.y += dt * 0.008;
      this.field.group.children.forEach((c) => {
        if (c instanceof THREE.Group && c.userData.cloud) c.position.x += dt * 0.1;
      });
    } else if (this.world === 'tunnel') {
      this.tunnel.dust.rotation.y += dt * 0.004;
      this.tunnel.dust.position.z = Math.sin(t * 0.12) * 0.8;
    } else if (this.world === 'meadow') {
      this.meadow.clouds.forEach((cloud, i) => {
        cloud.position.x += dt * (0.18 + i * 0.025);
        if (cloud.position.x > 120) cloud.position.x = -120;
      });
      this.meadow.pollen.rotation.y += dt * 0.01;
      this.meadow.pollen.position.y = Math.sin(t * 0.35) * 0.12;
    } else if (this.world === 'bathhouse') {
      this.bathhouse.update(t, dt);
      this.updateBreathAndGhosts(dt);
    } else {
      const target = this.townNight
        ? 1
        : THREE.MathUtils.clamp((this.player.position.z - 1.5) / 15, 0, 0.82);
      this.townTime = THREE.MathUtils.damp(this.townTime, target, 0.9, dt);
      this.town.setTime(this.townTime);
      this.applyTownFog();
      this.fillLight.intensity = THREE.MathUtils.lerp(0.9, 0.12, this.townTime);
      if (this.townTime > 0.45 && this.townMood === 'day') {
        this.townMood = 'dusk';
        this.audio.setMood('dusk');
      }
      if (this.townTime > 0.82 && this.townMood !== 'night') {
        this.townMood = 'night';
        this.audio.setMood('night');
      }
      const steam = this.town.steam;
      if (steam) {
        steam.rotation.y += dt * 0.05;
        const mat = steam.material as THREE.PointsMaterial;
        mat.opacity = 0.13 + Math.sin(t * 0.8) * 0.04;
      }
    }
    this.updateTransformation(dt);
    for (let i = this.stepPuffs.length - 1; i >= 0; i--) {
      const puff = this.stepPuffs[i];
      puff.life += dt;
      const age = puff.life / 0.65;
      const mat = puff.sprite.material as THREE.SpriteMaterial;
      mat.opacity = Math.max(0, 0.18 * (1 - age));
      puff.sprite.position.y += dt * 0.18;
      puff.sprite.scale.setScalar(0.36 + age * 0.45);
      if (age >= 1) {
        this.scene.remove(puff.sprite);
        mat.dispose();
        this.stepPuffs.splice(i, 1);
      }
    }
    this.shakeTime = Math.max(0, this.shakeTime - dt);
    if (this.shakeTime > 0) {
      const s = this.shakeAmount;
      this.camera.position.x += (Math.random() - 0.5) * s;
      this.camera.position.y += (Math.random() - 0.5) * s * 0.6;
    }
  }

  private updateAutoWalk(dt: number): void {
    if (!this.autoWalk) return;
    const walk = this.autoWalk;
    walk.t = Math.min(1, walk.t + dt / walk.duration);
    const e = 1 - Math.pow(1 - walk.t, 3);
    this.player.position.lerpVectors(walk.from, walk.to, e);
    this.player.rotation.y = smoothAngle(this.player.rotation.y, walk.heading, 1 - Math.exp(-dt * 6));
    this.animMoving = true;
    this.animBackward = false;
    this.animSpeed = 2.1;
    if (!this.mixer) this.modelRoot.position.y = Math.abs(Math.sin(walk.t * Math.PI * 5)) * 0.022;
    if (walk.t >= 1) {
      this.autoWalk = null;
      this.animMoving = false;
      if (!this.mixer) this.modelRoot.position.y = 0;
      walk.resolve();
    }
  }

  private autoWalkTo(to: THREE.Vector3, duration: number, heading = 0): Promise<void> {
    return new Promise((resolve) => {
      this.autoWalk = {
        from: this.player.position.clone(),
        to: to.clone(),
        t: 0,
        duration,
        heading,
        resolve,
      };
    });
  }

  private autoStepBack(to: THREE.Vector3, duration: number): Promise<void> {
    return this.autoWalkTo(to, duration, Math.PI);
  }

  private shake(time: number, amount: number): void {
    this.shakeTime = Math.max(this.shakeTime, time);
    this.shakeAmount = Math.max(this.shakeAmount, amount);
  }

  private update(dt: number): void {
    if (this.paused) return;
    this.ui.update(dt);
    if (this.phase === 'title') {
      this.updateCamera(dt);
      this.updateAmbient(dt);
      this.updateAnimation(dt);
      return;
    }
    if (this.phase !== 'playing') {
      this.updateCamera(dt);
      this.updateAmbient(dt);
      this.updateAnimation(dt);
      return;
    }
    this.updateAutoWalk(dt);
    this.updatePlayer(dt);
    this.updateParents(dt);
    this.updateCamera(dt);
    this.updateAmbient(dt);
    this.updateAnimation(dt);
  }

  private loop = (): void => {
    if (this.disposed) return;
    const dt = Math.min(0.05, this.clock.getDelta());
    this.update(dt);
    this.renderer.render(this.scene, this.camera);
    const hint = document.getElementById('controls-hint');
    if (hint) {
      hint.classList.toggle('hidden', this.phase !== 'playing' || this.cutscene || this.ui.blocking || !this.movementEnabled);
    }
    if (this.pointerLocked && (this.phase !== 'playing' || this.ui.blocking || this.cutscene || !this.movementEnabled)) {
      document.exitPointerLock?.();
    }
    const joystick = document.getElementById('joystick');
    if (joystick) {
      const touch = matchMedia('(pointer: coarse)').matches;
      joystick.classList.toggle('hidden', !touch || this.phase !== 'playing' || this.cutscene || this.ui.blocking || !this.movementEnabled);
    }
  };

  private bindInput(): void {
    window.addEventListener('keydown', (event) => {
      if (event.code === 'ArrowUp' || event.code === 'ArrowDown' || event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
        event.preventDefault();
      }
      if (event.code === 'Escape') {
        this.freeLook = false;
        this.canvas.classList.remove('free-look');
        document.exitPointerLock?.();
      }
      if (event.code === 'KeyE' && !event.repeat && this.interactTarget) {
        const d = Math.hypot(
          this.player.position.x - this.interactTarget.point.x,
          this.player.position.z - this.interactTarget.point.z,
        );
        if (d <= this.interactTarget.radius) {
          event.preventDefault();
          this.resolveInteract();
          return;
        }
      }
      this.keys.add(event.code);
    });
    window.addEventListener('keyup', (event) => this.keys.delete(event.code));
    window.addEventListener('blur', () => this.keys.clear());

    const coarsePointer = () => matchMedia('(pointer: coarse)').matches;
    const canLook = () =>
      this.phase === 'playing' &&
      !this.paused &&
      !this.ui.blocking &&
      !this.cutscene &&
      this.movementEnabled;
    const enableFreeLook = () => {
      this.freeLook = true;
      this.canvas.classList.add('free-look');
      this.freeLookLast.x = window.innerWidth / 2;
      this.freeLookLast.y = window.innerHeight / 2;
    };
    document.addEventListener('pointerlockchange', () => {
      this.pointerLocked = document.pointerLockElement === this.canvas;
      this.canvas.classList.toggle('mouse-look', this.pointerLocked);
      if (this.pointerLocked) {
        this.freeLook = false;
        this.canvas.classList.remove('free-look');
      }
      if (!this.pointerLocked) this.canvas.classList.remove('dragging');
    });
    document.addEventListener('pointerlockerror', () => {
      this.pointerLocked = false;
      this.pointerLockFailed = true;
      this.canvas.classList.remove('mouse-look');
      enableFreeLook();
      this.ui.toast('マウスロックが使えないため、フリー視点に切り替えました', 2200);
    });
    document.addEventListener('mousemove', (event) => {
      if (!canLook()) return;
      if (this.pointerLocked) {
        this.camYaw -= event.movementX * 0.0024;
        this.camPitch = THREE.MathUtils.clamp(this.camPitch + event.movementY * 0.0022, 0.08, 0.62);
        return;
      }
      if (!this.freeLook || event.target !== this.canvas) return;
      const dx = THREE.MathUtils.clamp(event.clientX - this.freeLookLast.x, -70, 70);
      const dy = THREE.MathUtils.clamp(event.clientY - this.freeLookLast.y, -70, 70);
      this.freeLookLast.x = event.clientX;
      this.freeLookLast.y = event.clientY;
      this.camYaw -= dx * 0.0034;
      this.camPitch = THREE.MathUtils.clamp(this.camPitch + dy * 0.0024, 0.08, 0.62);
    });
    this.canvas.addEventListener('pointerdown', (event) => {
      if (event.button !== undefined && event.button !== 0) return;
      if (this.phase !== 'playing' || this.paused) return;
      if (this.ui.blocking) {
        this.ui.advance();
        return;
      }
      if (!coarsePointer() && !this.pointerLocked) {
        this.freeLook = true;
        this.freeLookLast.x = event.clientX;
        this.freeLookLast.y = event.clientY;
        this.canvas.classList.add('free-look');
        if (!this.pointerLockFailed && typeof this.canvas.requestPointerLock === 'function') {
          try {
            const request = this.canvas.requestPointerLock();
            if (request && typeof (request as Promise<void>).catch === 'function') {
              (request as Promise<void>).catch(() => {
                this.pointerLockFailed = true;
                enableFreeLook();
              });
            }
          } catch {
            this.pointerLockFailed = true;
            enableFreeLook();
          }
        }
        return;
      }
      if (this.pointerLocked) return;
      this.pointerId = event.pointerId;
      this.dragging = true;
      this.dragMoved = false;
      this.dragLast.x = event.clientX;
      this.dragLast.y = event.clientY;
      this.canvas.setPointerCapture?.(event.pointerId);
      this.canvas.classList.add('dragging');
    });
    this.canvas.addEventListener('pointermove', (event) => {
      if (!this.dragging || event.pointerId !== this.pointerId) return;
      const dx = event.clientX - this.dragLast.x;
      const dy = event.clientY - this.dragLast.y;
      if (Math.abs(dx) + Math.abs(dy) > 2) this.dragMoved = true;
      this.dragLast.x = event.clientX;
      this.dragLast.y = event.clientY;
      if (this.dragMoved) {
        this.camYaw -= dx * 0.005;
        this.camPitch = THREE.MathUtils.clamp(this.camPitch + dy * 0.0028, 0.08, 0.62);
      }
    });
    const endDrag = (event: PointerEvent) => {
      if (!this.dragging) return;
      const wasDrag = this.dragMoved;
      this.dragging = false;
      this.canvas.classList.remove('dragging');
      if (!wasDrag && event.pointerId === this.pointerId) {
        this.tryClickMove(event.clientX, event.clientY);
      }
      this.pointerId = -1;
    };
    this.canvas.addEventListener('pointerup', endDrag);
    this.canvas.addEventListener('pointercancel', endDrag);
    this.canvas.addEventListener(
      'wheel',
      (event) => {
        if (this.phase !== 'playing' || this.paused) return;
        event.preventDefault();
        this.camTargetDistance = THREE.MathUtils.clamp(
          this.camTargetDistance + event.deltaY * 0.0022,
          2.5,
          this.world === 'town' ? 11 : 6.5,
        );
      },
      { passive: false },
    );
  }

  private tryClickMove(clientX: number, clientY: number): void {
    if (!this.canMove()) return;
    const rect = this.canvas.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    );
    const ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, this.camera);
    if (Math.abs(ray.ray.direction.y) < 0.0001) return;
    const t = -ray.ray.origin.y / ray.ray.direction.y;
    if (t <= 0) return;
    const target = ray.ray.origin.clone().addScaledVector(ray.ray.direction, t);
    if (target.distanceTo(this.player.position) > 18) return;
    this.clampPlayerPosition(target);
    this.moveTarget = target;
    this.clickRing.position.set(target.x, target.y + 0.035, target.z);
    this.clickRing.visible = true;
    (this.clickRing.material as THREE.MeshBasicMaterial).opacity = 0.45;
    this.audio.play('click');
  }

  private bindJoystick(): void {
    const knob = this.joystickKnob;
    const el = this.joystickEl;
    let center = { x: 0, y: 0 };
    let radius = 1;
    const update = (clientX: number, clientY: number) => {
      let dx = clientX - center.x;
      let dy = clientY - center.y;
      const len = Math.hypot(dx, dy);
      if (len > radius) {
        dx = (dx / len) * radius;
        dy = (dy / len) * radius;
      }
      this.joystick.x = dx / radius;
      this.joystick.y = dy / radius;
      knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    };
    el.addEventListener('pointerdown', (event) => {
      event.stopPropagation();
      el.setPointerCapture(event.pointerId);
      const rect = el.getBoundingClientRect();
      center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      radius = rect.width * 0.32;
      this.joystick.active = true;
      this.joystick.pointer = event.pointerId;
      update(event.clientX, event.clientY);
    });
    el.addEventListener('pointermove', (event) => {
      if (!this.joystick.active || event.pointerId !== this.joystick.pointer) return;
      event.stopPropagation();
      update(event.clientX, event.clientY);
    });
    const end = (event: PointerEvent) => {
      if (!this.joystick.active || event.pointerId !== this.joystick.pointer) return;
      this.joystick = { x: 0, y: 0, active: false, pointer: -1 };
      knob.style.transform = 'translate(-50%, -50%)';
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
  }

  setPaused(paused: boolean): void {
    this.paused = paused;
    this.ui.paused = paused;
    if (paused) this.keys.clear();
  }

  destroy(): void {
    this.disposed = true;
    this.renderer.setAnimationLoop(null);
    this.resizeObserver.disconnect();
    this.audio.dispose();
    this.renderer.dispose();
  }
}
