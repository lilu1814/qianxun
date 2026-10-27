import './style.css';
import { ChapterOne3D } from './three/ChapterOne';
import { wait } from './three/ui';
import { MEMORY_ZH, UI_ZH } from './uiZh';
import { applyTextConfig, loadTextConfig, observeTextConfig } from './textConfig';

declare global {
  interface Window {
    __QIANXUN_CHAPTER__?: ChapterOne3D;
  }
}

const SAVE_KEY = 'shenyin-chapter-one-3d-v1';
const SOUND_KEY = 'shenyin-qianxun-sound-v1';

interface SaveData {
  completed: boolean;
  completedAt: number;
  chapter2Unlocked: boolean;
  chapter2Completed: boolean;
}

const canvas = document.getElementById('scene3d') as HTMLCanvasElement;
const loading = document.getElementById('loading-screen')!;
const loadingProgress = document.getElementById('loading-progress')!;
const loadingPercent = document.getElementById('loading-percent')!;
const loadingSub = document.querySelector<HTMLDivElement>('.loading-sub')!;
const titleScreen = document.getElementById('title-screen')!;
const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
const continueBtn = document.getElementById('continue-btn') as HTMLButtonElement;
const helpBtn = document.getElementById('chapters-btn') as HTMLButtonElement;
const debugBtn = document.getElementById('debug-btn') as HTMLButtonElement;
const debugOverlay = document.getElementById('debug-menu')!;
const debugGrid = document.getElementById('debug-grid')!;
const debugClose = document.getElementById('debug-close') as HTMLButtonElement;
const pauseMenu = document.getElementById('pause-menu')!;
const pauseResume = document.getElementById('pause-resume') as HTMLButtonElement;
const pauseHome = document.getElementById('pause-home') as HTMLButtonElement;
const helpOverlay = document.getElementById('chapter-select')!;
const helpClose = document.getElementById('chapter-select-close')!;
const helpList = document.getElementById('chapter-list')!;
const journal = document.getElementById('journal')!;
const journalBtn = document.getElementById('journal-btn') as HTMLButtonElement;
const journalClose = document.getElementById('journal-close')!;
const journalChapters = document.getElementById('journal-chapters')!;
const journalObjective = document.getElementById('journal-objective')!;
const journalObjectiveZh = document.getElementById('journal-objective-zh')!;
const journalMemories = document.getElementById('journal-memories')!;
const journalRestart = document.getElementById('journal-restart')!;
const journalTitle = document.getElementById('journal-title')!;
const soundBtn = document.getElementById('sound-btn') as HTMLButtonElement;
const ending = document.getElementById('ending')!;
const replayBtn = document.getElementById('replay-btn') as HTMLButtonElement;
const nextChapterBtn = document.getElementById('next-chapter-btn') as HTMLButtonElement;
const endingTitleBtn = document.getElementById('ending-title-btn') as HTMLButtonElement;
const params = new URLSearchParams(location.search);

let chapter: ChapterOne3D | null = null;
let ready = false;
let started = false;
let save = loadSave();

function loadSave(): SaveData | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SaveData;
    return {
      completed: Boolean(data.completed),
      completedAt: Number(data.completedAt) || 0,
      chapter2Unlocked: Boolean(data.chapter2Unlocked),
      chapter2Completed: Boolean(data.chapter2Completed),
    };
  } catch {
    return null;
  }
}

function writeSave(data: SaveData): void {
  save = data;
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

function setButtonText(button: HTMLButtonElement, japanese: string, chinese: string): void {
  const main = button.querySelector('span');
  const sub = button.querySelector('i');
  if (main) main.textContent = japanese;
  if (sub) sub.textContent = chinese;
}

function setLoadingProgress(value: number, label?: string): void {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  loadingProgress.style.width = `${pct}%`;
  loadingPercent.textContent = `${pct}%`;
  if (label) loadingSub.textContent = label;
}

function setSoundUi(): void {
  if (!chapter) return;
  const enabled = chapter.audio.enabled;
  soundBtn.classList.toggle('muted', !enabled);
  soundBtn.title = enabled ? 'サウンドをオフ（音楽）' : 'サウンドをオン（音楽）';
  soundBtn.setAttribute('aria-label', enabled ? 'サウンドをオフ（音楽）' : 'サウンドをオン（音楽）');
}

function showLoadError(error: unknown): void {
  loadingSub.innerHTML = 'ドアが開きませんでした。WebGLが利用できるか確認し、ページを再読み込みしてください。<small class="hint-zh">门没有打开。请确认 WebGL 可用，并刷新页面。</small>';
  loadingPercent.textContent = '—';
  loadingProgress.style.width = '100%';
  loadingProgress.style.background = 'rgba(181,59,49,.5)';
  const retry = document.createElement('button');
  retry.className = 'text-btn';
  retry.innerHTML = '再試行<small class="hint-zh">重试</small>';
  retry.style.marginTop = '22px';
  retry.addEventListener('click', () => location.reload());
  loading.appendChild(retry);
  console.error(error);
}

async function boot(): Promise<void> {
  await loadTextConfig();
  const stage = document.getElementById('stage');
  if (stage) {
    applyTextConfig(stage);
    observeTextConfig(stage);
  }
  try {
    chapter = new ChapterOne3D(canvas);
    if (params.get('outfit') === 'work') chapter.setOutfit('work');
    window.__QIANXUN_CHAPTER__ = chapter;
  } catch (error) {
    showLoadError(error);
    return;
  }

  const pref = localStorage.getItem(SOUND_KEY);
  chapter.audio.enabled = pref !== 'off';
  chapter.ui.setVoiceEnabled(pref !== 'off');
  setSoundUi();
  chapter.ui.setActive(false);
  chapter.ui.showHud(false);

  try {
    await chapter.init((progress, label) => setLoadingProgress(progress, label));
  } catch (error) {
    showLoadError(error);
    return;
  }

  ready = true;
  chapter.audio.setMood('day');
  loading.classList.add('done');
  await wait(750);
  loading.classList.add('hidden');
  titleScreen.classList.remove('hidden');
  setupMenu();
  wire();
  if (save?.completed) setButtonText(startBtn, '第一章をもう一度', '重温第一章');

  // The scene selector is intentionally hidden from the normal title menu.
  // Add ?menu=1 (or ?levels=1 / ?select=1) to expose and open it.
  const levelMenuRequested = ['1', 'true', 'scenes', 'levels', 'debug'].includes(
    (params.get('menu') ?? params.get('levels') ?? params.get('select') ?? '').toLowerCase(),
  );
  debugBtn.classList.toggle('hidden', !levelMenuRequested);
  if (levelMenuRequested) {
    debugOverlay.classList.remove('hidden');
    return;
  }

  const directScene = params.get('scene');
  if (directScene === 'town' || directScene === 'market') {
    started = true;
    titleScreen.classList.add('hidden');
    chapter.audio.init();
    chapter.enterMarketScene();
    return;
  }

  const autoplay = params.get('autoplay');
  if (autoplay === '1' || autoplay === '2') {
    titleScreen.classList.add('hidden');
    await wait(400);
    void startJourney(autoplay === '2' ? 2 : 1);
  }
}

function setupMenu(): void {
  const canContinue = Boolean(save?.chapter2Unlocked);
  continueBtn.classList.toggle('hidden', !canContinue);
  if (canContinue) {
    setButtonText(continueBtn, save?.chapter2Completed ? '第二章をもう一度' : '第二章を続ける', save?.chapter2Completed ? '重温第二章' : '继续第二章');
  }
  setButtonText(startBtn, save?.completed ? '第一章をもう一度' : 'トンネルへ', save?.completed ? '重温第一章' : '走入隧道');
  helpList.innerHTML = '';
  const helps = [
    { key: 'W / A / S / D', label: '移動', detail: 'A / D で左右、W / S で前後に歩きます。Shiftを押すと速く歩けます。', labelZh: '移动', detailZh: 'A / D 左右移动，W / S 前进 / 后退。按住 Shift 可以快走。' },
    { key: 'マウス', label: '視点', detail: '画面をクリックしてマウスを固定。マウスで視点、Escで解除。ホイールでズーム。', labelZh: '视角', detailZh: '点击画面锁定鼠标，移动鼠标调整视角，Esc 释放；滚轮缩放。' },
    { key: 'E', label: '人物と交流', detail: '人物や調べられる物の近くでEを押します。長い橋では、Eを押したまま息を止めます。', labelZh: '人物交互', detailZh: '靠近人物或可调查的物体时按 E。汤屋长桥上按住 E 屏住呼吸。' },
    { key: 'スペース', label: '会話を進める', detail: '対話中にスペースを押すと、次の台詞へ進みます。', labelZh: '推进剧情对话', detailZh: '剧情对话中按空格键，进入下一句台词。' },
  ];
  helps.forEach((help) => {
    const card = document.createElement('div');
    card.className = 'help-card';
    card.innerHTML = `<span class="help-key">${help.key}</span><span class="help-label">${help.label}</span><span class="help-label-zh">${help.labelZh}</span><span class="help-detail">${help.detail}</span><span class="help-detail-zh">${help.detailZh}</span>`;
    helpList.appendChild(card);
  });
}

function openPauseMenu(): void {
  if (!chapter || !started) return;
  if (!titleScreen.classList.contains('hidden')) return;
  if (!ending.classList.contains('hidden')) return;
  document.exitPointerLock?.();
  chapter.setPaused(true);
  pauseMenu.classList.remove('hidden');
}

function closePauseMenu(): void {
  pauseMenu.classList.add('hidden');
  chapter?.setPaused(false);
}

function wire(): void {
  if (!chapter) return;
  const armTitleAudio = () => {
    if (!chapter) return;
    chapter.audio.init();
    chapter.audio.setMood('title');
  };
  window.addEventListener('pointerdown', armTitleAudio, { once: true, capture: true });
  window.addEventListener('keydown', armTitleAudio, { once: true, capture: true });
  startBtn.addEventListener('click', () => {
    if (started) return;
    chapter?.audio.init();
    chapter?.ui.primeVoice();
    chapter?.audio.cinematicSwell();
    startBtn.blur();
    titleScreen.classList.add('leaving');
    void startJourney(1);
  });

  continueBtn.addEventListener('click', () => {
    if (started) return;
    chapter?.audio.init();
    chapter?.ui.primeVoice();
    chapter?.audio.cinematicSwell();
    continueBtn.blur();
    titleScreen.classList.add('leaving');
    void startJourney(2);
  });

  nextChapterBtn.addEventListener('click', () => {
    location.href = `${location.pathname}?autoplay=2`;
  });
  window.addEventListener('qianxun:name-card', () => chapter?.audio.play('stamp'));

  helpBtn.addEventListener('click', () => {
    chapter?.audio.play('page');
    helpOverlay.classList.remove('hidden');
  });
  helpClose.addEventListener('click', () => helpOverlay.classList.add('hidden'));

  debugBtn.addEventListener('click', () => {
    chapter?.audio.init();
    chapter?.audio.play('page');
    debugOverlay.classList.remove('hidden');
  });
  debugClose.addEventListener('click', () => debugOverlay.classList.add('hidden'));
  debugOverlay.addEventListener('click', (event) => {
    if (event.target === debugOverlay) debugOverlay.classList.add('hidden');
  });
  debugGrid.querySelectorAll<HTMLButtonElement>('[data-scene]').forEach((button) => {
    button.addEventListener('click', () => {
      const scene = button.dataset.scene;
      if (!scene || !chapter || !ready || started) return;
      started = true;
      debugOverlay.classList.add('hidden');
      titleScreen.classList.add('hidden');
      const ch2 = scene === 'bridge' || scene === 'boiler' || scene === 'office';
      const chapterNo = document.getElementById('chapter-no');
      const chapterName = document.getElementById('chapter-name');
      const chapterNameZh = document.getElementById('chapter-name-zh');
      if (chapterNo) chapterNo.textContent = ch2 ? '第二章' : '第一章';
      if (chapterName) chapterName.textContent = ch2 ? '契約' : 'トンネル';
      if (chapterNameZh) chapterNameZh.textContent = ch2 ? '契约' : '隧道';
      chapter.audio.init();
      chapter.audio.cinematicSwell();
      void chapter.startDebugScene(scene);
    });
  });

  pauseResume.addEventListener('click', () => {
    closePauseMenu();
    pauseResume.blur();
  });
  pauseHome.addEventListener('click', () => {
    location.href = location.pathname;
  });
  helpOverlay.addEventListener('click', (event) => {
    if (event.target === helpOverlay) helpOverlay.classList.add('hidden');
  });

  soundBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    if (!chapter) return;
    chapter.audio.init();
    const enabled = chapter.audio.toggle();
    chapter.ui.setVoiceEnabled(enabled);
    localStorage.setItem(SOUND_KEY, enabled ? 'on' : 'off');
    setSoundUi();
  });

  journalBtn.addEventListener('click', () => {
    if (!chapter || started === false) return;
    openJournal();
  });
  journalClose.addEventListener('click', closeJournal);
  journal.addEventListener('click', (event) => {
    if (event.target === journal) closeJournal();
  });
  journalRestart.addEventListener('click', () => location.reload());
  journalTitle.addEventListener('click', () => {
    location.href = location.pathname;
  });

  replayBtn.addEventListener('click', () => {
    const id = chapter?.currentChapter === 2 ? 2 : 1;
    location.href = `${location.pathname}?autoplay=${id}`;
  });
  endingTitleBtn.addEventListener('click', () => {
    location.href = location.pathname;
  });

  window.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    if (!pauseMenu.classList.contains('hidden')) {
      closePauseMenu();
      return;
    }
    // Any open utility panel is dismissed first; if the game is running, the
    // same Escape press then opens the pause menu.
    if (!helpOverlay.classList.contains('hidden')) helpOverlay.classList.add('hidden');
    if (!debugOverlay.classList.contains('hidden')) debugOverlay.classList.add('hidden');
    if (!journal.classList.contains('hidden')) closeJournal();
    openPauseMenu();
  });

  window.addEventListener(
    'pointerdown',
    () => {
      chapter?.audio.init();
    },
    { once: true },
  );
}

async function startJourney(chapterNumber: 1 | 2 = 1): Promise<void> {
  if (!chapter || !ready || started) return;
  started = true;
  chapter.setChapter(chapterNumber);
  const chapterNo = document.getElementById('chapter-no');
  const chapterName = document.getElementById('chapter-name');
  const chapterNameZh = document.getElementById('chapter-name-zh');
  if (chapterNo) chapterNo.textContent = chapterNumber === 2 ? '第二章' : '第一章';
  if (chapterName) chapterName.textContent = chapterNumber === 2 ? '契約' : 'トンネル';
  if (chapterNameZh) chapterNameZh.textContent = chapterNumber === 2 ? '契约' : '隧道';
  chapter.onComplete = handleComplete;
  chapter.ui.setActive(true);
  chapter.ui.showHud(true);
  chapter.audio.init();
  if (chapterNumber === 1) chapter.audio.playTheme('audio/that_summer.mp3', 0.6);
  titleScreen.classList.add('leaving');
  await wait(550);
  titleScreen.classList.add('hidden');
  chapter.audio.init();
  if (chapterNumber === 2) void chapter.beginChapterTwo();
  else void chapter.begin();
}

function handleComplete(): void {
  if (!chapter) return;
  const chapterNumber = chapter.currentChapter;
  window.setTimeout(() => {
    chapter?.setPaused(true);
    chapter?.ui.showHud(false);
    chapter?.ui.hideObjective();
    document.getElementById('controls-hint')?.classList.add('hidden');
    document.getElementById('joystick')?.classList.add('hidden');
    const base = save ?? { completed: false, completedAt: 0, chapter2Unlocked: false, chapter2Completed: false };
    if (chapterNumber === 2) {
      writeSave({ ...base, chapter2Completed: true });
    } else {
      writeSave({ ...base, completed: true, completedAt: Date.now(), chapter2Unlocked: true });
    }
    const kicker = document.getElementById('ending-kicker')!;
    const title = document.getElementById('ending-title')!;
    const titleZh = document.getElementById('ending-title-zh')!;
    const quote = document.getElementById('ending-quote')!;
    const quoteZh = document.getElementById('ending-quote-zh')!;
    const copy = document.getElementById('ending-copy')!;
    const copyZh = document.getElementById('ending-copy-zh')!;
    const credits = document.getElementById('ending-credits')!;
    const creditsZh = document.getElementById('ending-credits-zh')!;
    if (chapterNumber === 2) {
      kicker.textContent = 'CHAPTER TWO · THE CONTRACT';
      title.textContent = '名前';
      titleZh.textContent = '名字';
      quote.textContent = '「今日からお前の名は、千だ。」';
      quoteZh.textContent = '“从今天起，你就叫千。”';
      copy.innerHTML = '<p>湯婆婆は彼女の名前を奪い、契約は成立した。帰り道は、さらに遠くなる。</p><p>白龍はまだ、湯屋のどこかで彼女を待っている。</p>';
      copyZh.innerHTML = '<p>汤婆婆收走了她的名字。契约成立，回家的路却更远了。</p><p>而白龙，还在汤屋的某个角落等她。</p>';
      credits.innerHTML = '<p>第二章 · 完　｜　次章「湯屋」</p><p>同人インタラクティブ作品 · 3Dシーン／プログラム制作 · 非営利</p>';
      creditsZh.innerHTML = '<p>第二章 · 完　｜　下一章「汤屋」</p><p>同人互动作品 · 3D 场景与程序绘制 · 非商业用途</p>';
      setButtonText(replayBtn, '第二章をもう一度', '再走一遍第二章');
      nextChapterBtn.classList.add('hidden');
    } else {
      kicker.textContent = 'CHAPTER ONE · THE BRIDGE';
      title.textContent = '橋';
      titleZh.textContent = '桥';
      quote.textContent = '「橋を渡るときは、息を止めろ。」';
      quoteZh.textContent = '“过桥的时候，屏住呼吸。”';
      copy.innerHTML = '<p>市場を抜け、長い石段を上った先に、白龍が待っていた。千尋は息を止め、湯屋へ続く橋を渡る。</p><p>神隠しの世界へ、一歩踏み入れた。</p>';
      copyZh.innerHTML = '<p>穿过集市，走上长长的石阶，白龙正在尽头等候。千寻屏住呼吸，踏上通往汤屋的长桥。</p><p>她终于一步踏入了神隐的世界。</p>';
      credits.innerHTML = '<p>第一章 · 完　｜　次章「契約」</p><p>同人インタラクティブ作品 · 3Dシーン／プログラム制作 · 非営利</p>';
      creditsZh.innerHTML = '<p>第一章 · 完　｜　下一章「契约」</p><p>同人互动作品 · 3D 场景与程序绘制 · 非商业用途</p>';
      setButtonText(replayBtn, '第一章をもう一度', '再走一遍第一章');
      nextChapterBtn.classList.remove('hidden');
    }
    ending.classList.remove('hidden');
    chapter?.audio.play('chime');
  }, 800);
}

function openJournal(): void {
  if (!chapter) return;
  chapter.setPaused(true);
  chapter.audio.play('page');
  const objective = chapter.ui.objective || '両親の話を聞いて、ついていく。';
  journalObjective.textContent = objective;
  journalObjectiveZh.textContent = UI_ZH[objective] ?? '听父母说话，跟着他们走。';
  const currentChapter = chapter.currentChapter;
  const ch2Unlocked = Boolean(save?.chapter2Unlocked) || currentChapter === 2;
  const ch2State = currentChapter === 2 ? '現在' : save?.chapter2Completed ? '完了' : ch2Unlocked ? '入れる' : '準備中';
  const ch1State = currentChapter === 1 ? '現在' : '完了';
  const ch2StateZh = currentChapter === 2 ? '当前' : save?.chapter2Completed ? '已完成' : ch2Unlocked ? '可进入' : '准备中';
  const ch1StateZh = currentChapter === 1 ? '当前' : '已完成';
  journalChapters.innerHTML = `
    <button type="button" class="journal-chapter unlocked ${currentChapter === 1 ? 'current' : ''}">
      <span class="jc-no">第一章</span>
      <span>
        <span class="jc-title">トンネル</span>
        <span class="jc-title-zh">隧道</span>
        <span class="jc-sub">古い門から、誰もいない町へ。</span>
        <span class="jc-sub-zh">从旧门楼到无人的小镇。</span>
      </span>
      <span class="jc-state">${ch1State}<span class="jc-state-zh">${ch1StateZh}</span></span>
    </button>
    <button type="button" class="journal-chapter ${ch2Unlocked ? 'unlocked' : 'locked'} ${currentChapter === 2 ? 'current' : ''}" ${ch2Unlocked ? '' : 'disabled'}>
      <span class="jc-no">第二章</span>
      <span>
        <span class="jc-title">契約</span>
        <span class="jc-title-zh">契约</span>
        <span class="jc-sub">湯屋では、名前が自由を意味する。</span>
        <span class="jc-sub-zh">在汤屋，名字就是自由。</span>
      </span>
      <span class="jc-state">${ch2State}<span class="jc-state-zh">${ch2StateZh}</span></span>
    </button>
  `;
  journalChapters.querySelectorAll<HTMLButtonElement>('.journal-chapter').forEach((button, index) => {
    button.addEventListener('click', () => {
      if (button.disabled) return;
      location.href = `${location.pathname}?autoplay=${index + 1}`;
    });
  });
  journalMemories.innerHTML = '';
  const memories = [...chapter.memories];
  if (save?.completed && !memories.includes('旧市街の夕暮れ、両親は豚になった。')) {
    memories.push('旧市街の夕暮れ、両親は豚になった。');
  }
  journal.classList.remove('hidden');
  if (memories.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'まだ何も拾っていない。';
    const zh = document.createElement('small');
    zh.className = 'memory-zh';
    zh.textContent = '还没有拾起任何记忆。';
    li.appendChild(zh);
    journalMemories.appendChild(li);
    return;
  }
  memories.forEach((memory) => {
    const li = document.createElement('li');
    li.textContent = memory;
    const zh = MEMORY_ZH[memory];
    if (zh) {
      const small = document.createElement('small');
      small.className = 'memory-zh';
      small.textContent = zh;
      li.appendChild(small);
    }
    journalMemories.appendChild(li);
  });
}

function closeJournal(): void {
  if (journal.classList.contains('hidden')) return;
  journal.classList.add('hidden');
  chapter?.setPaused(false);
  chapter?.audio.play('page');
}

void boot();
