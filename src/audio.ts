type Mood = 'title' | 'day' | 'dusk' | 'mystery' | 'warm' | 'train' | 'night' | 'ending';

interface MoodConfig {
  root: number;
  chord: number[];
  filter: number;
  gain: number;
  melody: number[];
}

const MOODS: Record<Mood, MoodConfig> = {
  title: { root: 110, chord: [1, 2.25, 3.0, 4.02], filter: 620, gain: 0.042, melody: [440, 523.25, 659.25, 783.99, 659.25, 523.25] },
  day: { root: 146.83, chord: [1, 1.5, 2.0, 2.52], filter: 980, gain: 0.034, melody: [587.33, 659.25, 783.99, 880, 783.99, 659.25] },
  dusk: { root: 130.81, chord: [1, 1.5, 2.0, 2.4], filter: 520, gain: 0.04, melody: [523.25, 622.25, 783.99, 622.25, 466.16] },
  mystery: { root: 98, chord: [1, 1.335, 2.0, 2.67], filter: 420, gain: 0.046, melody: [392, 466.16, 523.25, 466.16, 349.23] },
  warm: { root: 164.81, chord: [1, 1.25, 1.5, 2.0], filter: 760, gain: 0.035, melody: [659.25, 783.99, 987.77, 783.99, 659.25] },
  train: { root: 123.47, chord: [1, 1.5, 2.0, 3.0], filter: 700, gain: 0.038, melody: [493.88, 587.33, 739.99, 587.33, 493.88, 392] },
  night: { root: 87.31, chord: [1, 1.5, 2.25, 3.0], filter: 340, gain: 0.05, melody: [349.23, 440, 523.25, 440, 349.23] },
  ending: { root: 174.61, chord: [1, 1.25, 1.5, 2.0], filter: 900, gain: 0.038, melody: [698.46, 880, 1046.5, 880, 698.46] },
};

const THREE_CLAMP = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

export class Soundtrack {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private padGain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private delay: DelayNode | null = null;
  private delayGain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private scoreGain: GainNode | null = null;
  private scoreFilter: BiquadFilterNode | null = null;
  private scoreOscillators: OscillatorNode[] = [];
  private mood: Mood = 'title';
  private melodyTimer: number | null = null;
  private noise: AudioBufferSourceNode | null = null;
  private theme: HTMLAudioElement | null = null;
  private themeFadeTimer: number | null = null;
  private themeVolume = 0.5;
  private synthMusicMuted = false;
  enabled = true;

  init(): void {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    this.ctx = ctx;

    this.master = ctx.createGain();
    this.master.gain.value = this.enabled ? 0.72 : 0;
    this.master.connect(ctx.destination);

    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 620;
    this.filter.Q.value = 0.7;

    this.padGain = ctx.createGain();
    this.padGain.gain.value = 0.0001;
    this.padGain.connect(this.filter);
    this.filter.connect(this.master);

    this.delay = ctx.createDelay(2.0);
    this.delay.delayTime.value = 0.42;
    this.delayGain = ctx.createGain();
    this.delayGain.gain.value = 0.22;
    this.delay.connect(this.delayGain);
    this.delayGain.connect(this.master);
    this.delayGain.connect(this.delay);

    this.startPad();
    this.startNoise();
    this.startScore();
    this.scheduleMelody();
    this.setMood(this.mood);
  }

  private startPad(): void {
    if (!this.ctx || !this.padGain) return;
    const ctx = this.ctx;
    const cfg = MOODS[this.mood];
    for (let i = 0; i < 4; i++) {
      const osc = ctx.createOscillator();
      osc.type = i === 3 ? 'triangle' : 'sine';
      const base = cfg.root * cfg.chord[i];
      osc.frequency.value = base;
      osc.detune.value = (i - 1.5) * 5;
      const gain = ctx.createGain();
      gain.gain.value = 0.12 / (i + 1.2);
      osc.connect(gain);
      gain.connect(this.padGain);
      osc.start();
      this.oscillators.push(osc);
    }
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.055;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.018;
    lfo.connect(lfoGain);
    lfoGain.connect(this.padGain.gain);
    lfo.start();
    void this.padGain.gain.setTargetAtTime(cfg.gain, ctx.currentTime, 2.5);
  }

  private startScore(): void {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const cfg = MOODS[this.mood];
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = cfg.filter * 0.85;
    filter.Q.value = 0.45;
    const gain = ctx.createGain();
    gain.gain.value = 0.0001;
    filter.connect(gain);
    gain.connect(this.master);
    if (this.delay) gain.connect(this.delay);
    this.scoreFilter = filter;
    this.scoreGain = gain;

    // Low string bed — a slow, wide chord underneath the ambient pad.
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = (cfg.root * cfg.chord[i]) / 2;
      osc.detune.value = (i - 1) * 5;
      const voiceGain = ctx.createGain();
      voiceGain.gain.value = 0.026 / (i + 1.4);
      osc.connect(voiceGain);
      voiceGain.connect(filter);
      osc.start();
      this.scoreOscillators.push(osc);
    }
    // Sub drone for the cinematic weight.
    const sub = ctx.createOscillator();
    sub.type = 'sine';
    sub.frequency.value = cfg.root / 2;
    const subGain = ctx.createGain();
    subGain.gain.value = 0.035;
    sub.connect(subGain);
    subGain.connect(filter);
    sub.start();
    this.scoreOscillators.push(sub);

    gain.gain.setTargetAtTime(0.022, ctx.currentTime, 3.2);
  }

  /** A soft orchestral swell used when a chapter or a cutscene begins. */
  cinematicSwell(): void {
    if (!this.ctx || !this.master || !this.enabled) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const cfg = MOODS[this.mood];
    const notes = [cfg.root / 2, cfg.root * 1.5, cfg.root * 2.0];
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.022 / (index + 1), now + 1.3);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.8);
      osc.connect(gain);
      gain.connect(this.master!);
      if (this.delay) gain.connect(this.delay);
      osc.start(now);
      osc.stop(now + 5.0);
    });
    this.tone(cfg.root / 2, 'sine', 1.8, 0.03, cfg.root * 0.42);
  }

  private startNoise(): void {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const length = ctx.sampleRate * 3;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      last = last * 0.985 + white * 0.015;
      data[i] = last * 2.4;
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 180;
    filter.Q.value = 0.4;
    const gain = ctx.createGain();
    gain.gain.value = 0.035;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    src.start();
    this.noise = src;
  }

  private scheduleMelody(): void {
    if (this.melodyTimer) window.clearInterval(this.melodyTimer);
    const play = () => {
      if (!this.enabled || !this.ctx || this.synthMusicMuted) return;
      const cfg = MOODS[this.mood];
      const note = cfg.melody[Math.floor(Math.random() * cfg.melody.length)];
      this.pluck(note, 0.026, 3.8);
    };
    this.melodyTimer = window.setInterval(play, 5200 + Math.random() * 1600);
    window.setTimeout(play, 1200);
  }

  setMood(mood: Mood): void {
    this.mood = mood;
    if (!this.ctx) return;
    const cfg = MOODS[mood];
    const now = this.ctx.currentTime;
    this.oscillators.forEach((osc, i) => {
      const target = cfg.root * cfg.chord[i];
      osc.frequency.cancelScheduledValues(now);
      osc.frequency.setTargetAtTime(target, now, 2.2);
    });
    this.filter?.frequency.setTargetAtTime(cfg.filter, now, 2);
    const musicLevel = this.synthMusicMuted ? 0.0001 : 1;
    this.padGain?.gain.setTargetAtTime(cfg.gain * musicLevel, now, 2);
    this.scoreFilter?.frequency.setTargetAtTime(cfg.filter * 0.85, now, 2.4);
    this.scoreGain?.gain.setTargetAtTime(cfg.gain * 0.55 * musicLevel, now, 2.4);
    this.scoreOscillators.forEach((osc, i) => {
      const target = i < 3 ? (cfg.root * cfg.chord[i]) / 2 : cfg.root / 2;
      osc.frequency.cancelScheduledValues(now);
      osc.frequency.setTargetAtTime(target, now, 2.6);
    });
    this.scheduleMelody();
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!this.ctx || !this.master) return;
    this.master.gain.setTargetAtTime(enabled ? 0.72 : 0, this.ctx.currentTime, 0.2);
    this.fadeThemeTo(enabled ? this.themeVolume : 0, 220);
  }

  /** Play a produced music track on top of the ambient soundscape. */
  playTheme(src: string, volume = 0.5): void {
    if (this.theme && this.theme.dataset.src === src && !this.theme.paused) {
      this.themeVolume = volume;
      this.setSynthMusicMuted(true);
      return;
    }
    this.stopTheme(0);
    this.themeVolume = volume;
    const audio = new Audio(src);
    audio.dataset.src = src;
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0;
    this.theme = audio;
    this.setSynthMusicMuted(true);
    audio.play().then(() => {
      this.fadeThemeTo(this.enabled ? volume : 0, 1400);
    }).catch(() => {
      // Autoplay can be blocked before a user gesture; synth ambience stays off
      // only until the next explicit play attempt.
      if (this.theme === audio) this.setSynthMusicMuted(false);
    });
  }

  stopTheme(fadeMs = 1400): void {
    const audio = this.theme;
    this.setSynthMusicMuted(false);
    if (!audio) return;
    if (fadeMs <= 0) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      if (this.theme === audio) this.theme = null;
      return;
    }
    this.fadeThemeTo(0, fadeMs);
    window.setTimeout(() => {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      if (this.theme === audio) this.theme = null;
    }, fadeMs + 80);
  }

  private setSynthMusicMuted(muted: boolean): void {
    this.synthMusicMuted = muted;
    if (!this.ctx) return;
    const cfg = MOODS[this.mood];
    const now = this.ctx.currentTime;
    this.padGain?.gain.setTargetAtTime(muted ? 0.0001 : cfg.gain, now, 0.5);
    this.scoreGain?.gain.setTargetAtTime(muted ? 0.0001 : cfg.gain * 0.55, now, 0.5);
  }

  private fadeThemeTo(target: number, duration: number): void {
    if (!this.theme) return;
    if (this.themeFadeTimer) window.clearTimeout(this.themeFadeTimer);
    const audio = this.theme;
    const start = audio.volume;
    const started = performance.now();
    const tick = () => {
      if (this.theme !== audio) return;
      const k = Math.min(1, (performance.now() - started) / Math.max(1, duration));
      audio.volume = THREE_CLAMP(start + (target - start) * k, 0, 1);
      if (k < 1) {
        this.themeFadeTimer = window.setTimeout(tick, 40);
      }
    };
    tick();
  }

  toggle(): boolean {
    this.enabled = !this.enabled;
    this.setEnabled(this.enabled);
    if (this.ctx?.state === 'suspended') void this.ctx.resume();
    return this.enabled;
  }

  pluck(freq: number, volume = 0.05, decay = 2.2): void {
    if (!this.ctx || !this.master || !this.enabled) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);
    osc.connect(gain);
    gain.connect(this.master);
    if (this.delay) gain.connect(this.delay);
    osc.start(now);
    osc.stop(now + decay + 0.1);
  }

  private tone(freq: number, type: OscillatorType, duration: number, volume: number, slide?: number): void {
    if (!this.ctx || !this.master || !this.enabled) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slide !== undefined) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slide), now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  private burst(duration = 0.2, volume = 0.05, freq = 900): void {
    if (!this.ctx || !this.master || !this.enabled) return;
    const ctx = this.ctx;
    const length = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    filter.Q.value = 0.8;
    const gain = ctx.createGain();
    gain.gain.value = volume;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    src.start();
  }

  play(name: 'click' | 'confirm' | 'page' | 'erase' | 'splash' | 'chime' | 'roar' | 'stamp' | 'wind' | 'step' | 'arrive' | 'heart'): void {
    switch (name) {
      case 'click':
        this.pluck(880, 0.02, 0.55);
        break;
      case 'confirm':
        this.pluck(523.25, 0.035, 1.4);
        window.setTimeout(() => this.pluck(783.99, 0.028, 1.8), 110);
        break;
      case 'page':
        this.burst(0.14, 0.025, 1200);
        break;
      case 'erase':
        this.burst(0.12, 0.035, 2600);
        break;
      case 'splash':
        this.burst(0.45, 0.055, 700);
        this.tone(180, 'sine', 0.5, 0.03, 90);
        break;
      case 'chime':
        this.pluck(1046.5, 0.026, 3.4);
        window.setTimeout(() => this.pluck(1318.5, 0.018, 3), 140);
        break;
      case 'roar':
        this.tone(130, 'sawtooth', 0.8, 0.045, 55);
        this.burst(0.7, 0.03, 160);
        break;
      case 'stamp':
        this.tone(90, 'sine', 0.25, 0.08, 55);
        this.burst(0.1, 0.04, 500);
        break;
      case 'wind':
        this.burst(1.2, 0.018, 320);
        break;
      case 'step':
        this.tone(90, 'sine', 0.09, 0.018, 60);
        break;
      case 'arrive':
        this.pluck(392, 0.03, 2.2);
        window.setTimeout(() => this.pluck(523.25, 0.025, 2.6), 380);
        break;
      case 'heart':
        this.tone(62, 'sine', 0.22, 0.05, 48);
        break;
    }
  }

  dispose(): void {
    if (this.melodyTimer) window.clearInterval(this.melodyTimer);
    if (this.themeFadeTimer) window.clearTimeout(this.themeFadeTimer);
    this.theme?.pause();
    this.theme = null;
    try {
      this.noise?.stop();
      this.oscillators.forEach((o) => o.stop());
      this.scoreOscillators.forEach((o) => o.stop());
      void this.ctx?.close();
    } catch {
      // no-op
    }
    this.ctx = null;
    this.oscillators = [];
    this.scoreOscillators = [];
  }
}
