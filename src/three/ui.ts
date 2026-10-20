import { VoiceOver } from '../voice';
import { ZH_SUBTITLES } from '../zhSubs';
import { getDialogue, getMode, getUi } from '../textConfig';
import { SPEAKER_ZH, UI_ZH } from '../uiZh';

// Dialogue audio is intentionally off until every chapter has a final voice pass.
const DIALOGUE_VOICE_ENABLED = false;

export const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

export interface ChoiceOption {
  id: string;
  label: string;
  sub?: string;
}

interface DialogueState {
  full: string;
  chars: number;
  complete: boolean;
  resolve: () => void;
}

function byId<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing #${id}`);
  return node as T;
}

export class StoryUI {
  private dialogueEl = byId<HTMLDivElement>('dialogue');
  private speakerEl = byId<HTMLSpanElement>('speaker-name');
  private speakerZhEl = byId<HTMLElement>('speaker-zh');
  private textEl = byId<HTMLParagraphElement>('dialogue-text');
  private translationEl = byId<HTMLParagraphElement>('dialogue-translation');
  private continueMark = document.querySelector<HTMLDivElement>('.continue-mark')!;
  private choicesEl = byId<HTMLDivElement>('choices');
  private objectiveEl = byId<HTMLDivElement>('objective');
  private objectiveTextEl = byId<HTMLSpanElement>('objective-text');
  private objectiveTextZh = byId<HTMLElement>('objective-text-zh');
  private toastEl = byId<HTMLDivElement>('toast');
  private hintEl = byId<HTMLDivElement>('activity-hint');
  private hintTextEl = byId<HTMLSpanElement>('activity-hint-text');
  private interactHint = byId<HTMLDivElement>('interact-hint');
  private interactHintText = byId<HTMLSpanElement>('interact-hint-text');
  private interactHintZh = byId<HTMLElement>('interact-hint-zh');
  private breathHint = byId<HTMLDivElement>('breath-hint');
  private breathLabel = byId<HTMLSpanElement>('breath-label');
  private breathFill = byId<HTMLElement>('breath-fill');
  private breathLabelZh = byId<HTMLElement>('breath-label-zh');
  private chapterCard = byId<HTMLDivElement>('chapter-card');
  private chapterCardNumber = byId<HTMLDivElement>('chapter-card-number');
  private chapterCardTitle = byId<HTMLDivElement>('chapter-card-title');
  private chapterCardSubtitle = byId<HTMLDivElement>('chapter-card-subtitle');
  private chapterCardTranslation = byId<HTMLDivElement>('chapter-card-translation');
  private chapterCardTitleZh = byId<HTMLDivElement>('chapter-card-title-zh');
  private fadeEl = byId<HTMLDivElement>('fade');
  private flashEl = byId<HTMLDivElement>('scene-flash');
  private nameCard = byId<HTMLDivElement>('name-card');
  private nameOld = byId<HTMLSpanElement>('name-old');
  private nameNew = byId<HTMLSpanElement>('name-new');
  private voice = new VoiceOver();

  private dialogue: DialogueState | null = null;
  private translationText = '';
  private choiceResolve: ((id: string) => void) | null = null;
  private choiceOptions: ChoiceOption[] = [];
  private toastTimer = 0;
  private active = false;
  paused = false;
  objective = '';

  constructor() {
    this.dialogueEl.addEventListener('pointerdown', (event) => {
      event.stopPropagation();
      this.advance();
    });
    window.addEventListener('keydown', (event) => {
      if (!this.active || this.paused) return;
      if (event.code === 'Space' || event.code === 'Enter') {
        if (this.choiceResolve) return;
        if (this.dialogue) {
          event.preventDefault();
          this.advance();
        }
      }
      if (this.choiceResolve && /^Digit[1-4]$/.test(event.code)) {
        const idx = Number(event.code.slice(-1)) - 1;
        if (this.choiceOptions[idx]) this.selectChoice(this.choiceOptions[idx].id);
      }
    });
  }

  setActive(active: boolean): void {
    this.active = active;
    if (!active) {
      this.voice.stop();
      this.translationEl.classList.add('hidden');
      this.translationEl.classList.remove('visible');
      this.hideInteractHint();
      this.hideBreathHint();
    }
  }

  get blocking(): boolean {
    return Boolean(this.dialogue || this.choiceResolve);
  }

  get isDialogueActive(): boolean {
    return Boolean(this.dialogue);
  }

  private revealTranslation(): void {
    if (!this.translationText) return;
    this.translationEl.classList.remove('hidden');
    requestAnimationFrame(() => this.translationEl.classList.add('visible'));
  }

  update(dt: number): void {
    if (!this.dialogue || this.dialogue.complete || this.paused) return;
    this.dialogue.chars += dt * 34;
    if (this.dialogue.chars >= this.dialogue.full.length) {
      this.dialogue.chars = this.dialogue.full.length;
      this.dialogue.complete = true;
      this.textEl.textContent = this.dialogue.full;
      this.continueMark.classList.add('ready');
      this.revealTranslation();
    } else {
      this.textEl.textContent = this.dialogue.full.slice(0, Math.floor(this.dialogue.chars));
    }
  }

  advance(): void {
    if (!this.active || this.paused || !this.dialogue) return;
    if (!this.dialogue.complete) {
      this.dialogue.chars = this.dialogue.full.length;
      this.dialogue.complete = true;
      this.textEl.textContent = this.dialogue.full;
      this.continueMark.classList.add('ready');
      this.revealTranslation();
      return;
    }
    const resolve = this.dialogue.resolve;
    this.dialogue = null;
    this.translationText = '';
    this.translationEl.classList.add('hidden');
    this.translationEl.classList.remove('visible');
    this.dialogueEl.classList.add('hidden');
    this.continueMark.classList.remove('ready');
    this.voice.stop();
    resolve();
  }

  async say(speaker: string, line: string, translation?: string): Promise<void> {
    const mode = getMode();
    const entry = getDialogue(line);
    const ja = entry?.ja ?? line;
    const zh = translation ?? entry?.zh ?? ZH_SUBTITLES[line] ?? '';
    const primary = mode === 'zh' ? (zh || ja) : ja;
    const secondary = mode === 'both' ? zh : '';
    const speakerJa = entry?.speaker ?? speaker;
    const speakerZh = entry?.speakerZh ?? getUi(speaker)?.zh ?? SPEAKER_ZH[speaker] ?? '';
    const speakerPrimary = mode === 'zh' ? (speakerZh || speakerJa) : speakerJa;
    const speakerSecondary = mode === 'both' ? speakerZh : '';
    this.translationText = secondary;
    this.translationEl.textContent = secondary;
    this.translationEl.classList.toggle('hidden', !secondary);
    this.translationEl.classList.remove('visible');
    this.dialogueEl.classList.remove('hidden');
    this.dialogueEl.classList.toggle('narration', speaker === '' || speaker === 'ナレーション');
    this.speakerEl.textContent = speaker === 'ナレーション' ? '' : speakerPrimary;
    this.speakerZhEl.textContent = speakerSecondary;
    this.speakerZhEl.classList.toggle('hidden', !speakerSecondary);
    this.textEl.textContent = '';
    this.continueMark.classList.remove('ready');
    const promise = new Promise<void>((resolve) => {
      this.dialogue = { full: primary, chars: 0, complete: false, resolve };
    });
    if (DIALOGUE_VOICE_ENABLED && speaker && speaker !== 'ナレーション') this.voice.speak(line, speaker);
    await promise;
  }

  async narrate(line: string, translation?: string): Promise<void> {
    await this.say('', line, translation);
  }

  async think(line: string, translation?: string): Promise<void> {
    await this.say('千尋', line, translation);
  }

  async choose(options: ChoiceOption[]): Promise<string> {
    this.hideDialogue();
    this.choiceOptions = options;
    return new Promise<string>((resolve) => {
      this.choiceResolve = resolve;
      this.choicesEl.innerHTML = '';
      options.forEach((option) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'choice-btn';
        button.innerHTML = `<span>${option.label}</span>`;
        if (option.sub) {
          const sub = document.createElement('small');
          sub.textContent = option.sub;
          sub.style.cssText =
            'display:block;margin-top:4px;font-family:var(--sans);font-size:.6em;letter-spacing:.08em;color:rgba(200,188,166,.46);';
          button.appendChild(sub);
        }
        button.addEventListener('click', (event) => {
          event.stopPropagation();
          this.selectChoice(option.id);
        });
        this.choicesEl.appendChild(button);
      });
      this.choicesEl.classList.remove('hidden');
    });
  }

  private selectChoice(id: string): void {
    if (!this.choiceResolve) return;
    const resolve = this.choiceResolve;
    this.choiceResolve = null;
    this.choicesEl.classList.add('hidden');
    this.choicesEl.innerHTML = '';
    resolve(id);
  }

  hideDialogue(): void {
    this.dialogueEl.classList.add('hidden');
    this.continueMark.classList.remove('ready');
    this.translationText = '';
    this.translationEl.classList.add('hidden');
    this.translationEl.classList.remove('visible');
    this.dialogue = null;
    this.voice.stop();
  }

  setVoiceEnabled(enabled: boolean): void {
    this.voice.setEnabled(enabled);
  }

  primeVoice(): void {
    this.voice.prime();
  }

  get voiceSupported(): boolean {
    return this.voice.isSupported;
  }

  async chapterIntro(no: string, title: string, subtitle: string, translation?: string): Promise<void> {
    this.chapterCardNumber.textContent = no;
    this.chapterCardTitle.textContent = title;
    this.chapterCardTitleZh.textContent = UI_ZH[title] ?? '';
    this.chapterCardSubtitle.textContent = subtitle;
    const zh = translation ?? ZH_SUBTITLES[subtitle] ?? '';
    this.chapterCardTranslation.textContent = zh;
    this.chapterCardTranslation.classList.toggle('hidden', !zh);
    this.chapterCard.classList.remove('hidden');
    await wait(30);
    this.chapterCard.classList.add('show');
    await wait(2700);
    this.chapterCard.classList.remove('show');
    await wait(900);
    this.chapterCard.classList.add('hidden');
  }

  async fade(on: boolean, ms = 850): Promise<void> {
    this.fadeEl.style.transitionDuration = `${ms}ms`;
    this.fadeEl.classList.toggle('on', on);
    await wait(ms);
  }

  flash(kind: 'fire' | 'red' = 'fire'): void {
    this.flashEl.classList.remove('fire', 'red');
    void this.flashEl.offsetWidth;
    this.flashEl.classList.add(kind);
  }

  setObjective(text: string, visible = true): void {
    this.objective = text;
    this.objectiveTextEl.textContent = text;
    const zh = UI_ZH[text] ?? '';
    this.objectiveTextZh.textContent = zh;
    this.objectiveTextZh.classList.toggle('hidden', !zh);
    this.objectiveEl.classList.toggle('hidden', !visible || !text);
    if (visible && text) {
      this.objectiveEl.classList.add('hide');
      window.setTimeout(() => this.objectiveEl.classList.remove('hide'), 30);
    }
  }

  hideObjective(): void {
    this.objectiveEl.classList.add('hidden');
  }

  toast(message: string, duration = 1800): void {
    window.clearTimeout(this.toastTimer);
    const zh = UI_ZH[message] ?? '';
    this.toastEl.innerHTML = zh
      ? `<span>${message}</span><small class="hint-zh">${zh}</small>`
      : message;
    this.toastEl.classList.remove('hidden');
    this.toastTimer = window.setTimeout(() => this.toastEl.classList.add('hidden'), duration);
  }

  showHint(text: string): void {
    this.hintTextEl.textContent = text;
    this.hintEl.classList.remove('hidden');
  }

  hideHint(): void {
    this.hintEl.classList.add('hidden');
  }

  showInteractHint(text: string): void {
    this.interactHintText.textContent = text;
    const zh = UI_ZH[text] ?? '';
    this.interactHintZh.textContent = zh;
    this.interactHintZh.classList.toggle('hidden', !zh);
    this.interactHint.classList.remove('hidden');
  }

  hideInteractHint(): void {
    this.interactHint.classList.add('hidden');
  }

  showBreathHint(): void {
    this.breathHint.classList.remove('hidden');
    this.setBreath(1, false);
  }

  hideBreathHint(): void {
    this.breathHint.classList.add('hidden');
  }

  setBreath(value: number, held: boolean): void {
    const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
    this.breathFill.style.width = `${pct}%`;
    this.breathLabel.textContent = held ? '息止め中' : '息を止める';
    this.breathLabelZh.textContent = held ? '屏息中' : '屏住呼吸';
    this.breathHint.classList.toggle('low', value < 0.28);
  }

  showNameCard(oldName: string, newName: string): void {
    this.nameOld.textContent = oldName;
    this.nameNew.textContent = newName;
    this.nameCard.classList.remove('hidden');
    requestAnimationFrame(() => this.nameCard.classList.add('show'));
    this.audioCue();
  }

  hideNameCard(): void {
    this.nameCard.classList.remove('show');
    window.setTimeout(() => this.nameCard.classList.add('hidden'), 700);
  }

  private audioCue(): void {
    const event = new CustomEvent('qianxun:name-card');
    window.dispatchEvent(event);
  }

  setDialogueVisible(visible: boolean): void {
    this.dialogueEl.classList.toggle('hidden', !visible);
  }

  showHud(show: boolean): void {
    byId<HTMLElement>('hud').classList.toggle('hidden', !show);
  }
}
