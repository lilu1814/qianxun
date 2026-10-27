/**
 * Pre-rendered cinematic dialogue.
 *
 * The MP3s in /public/voice are generated from the dialogue script with
 * different neural voices for the narrator, Chihiro, her father and mother.
 * Playback goes through a small EQ/compressor/reverb chain so the lines sit in
 * the same room as the score instead of sounding like a dry browser voice.
 */
const VOICE_HASH = (key: string): string => {
  let hash = 2166136261;
  const bytes = new TextEncoder().encode(key);
  for (const byte of bytes) {
    hash ^= byte;
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
};

export class VoiceOver {
  enabled = true;
  private ctx: AudioContext | null = null;
  private reverb: ConvolverNode | null = null;
  private source: AudioBufferSourceNode | null = null;
  private output: GainNode | null = null;
  private buffers = new Map<string, AudioBuffer | null>();
  private playToken = 0;

  get isSupported(): boolean {
    return typeof window !== 'undefined' && Boolean(window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext);
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) this.stop();
  }

  prime(): void {
    const ctx = this.ensure();
    if (ctx?.state === 'suspended') void ctx.resume();
  }

  stop(): void {
    this.playToken++;
    const source = this.source;
    const output = this.output;
    this.source = null;
    this.output = null;
    if (source) {
      try {
        const ctx = this.ctx;
        if (ctx && output) {
          const now = ctx.currentTime;
          output.gain.cancelScheduledValues(now);
          output.gain.setTargetAtTime(0.0001, now, 0.035);
          source.stop(now + 0.12);
        } else {
          source.stop();
        }
      } catch {
        // already stopped
      }
    }
  }

  speak(text: string, speaker: string): void {
    if (!this.enabled || !this.isSupported) return;
    const line = text.trim();
    if (!line || !speaker || speaker === '旁白') return;
    void this.play(line, speaker);
  }

  private async play(text: string, speaker: string): Promise<void> {
    const token = ++this.playToken;
    const ctx = this.ensure();
    if (!ctx) return;
    if (ctx.state === 'suspended') await ctx.resume();
    this.stopSourceImmediate();

    const key = `${speaker}|${text}`;
    const buffer = await this.load(`voice/${VOICE_HASH(key)}.mp3`, ctx);
    if (!buffer || token !== this.playToken || !this.enabled) return;

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 85;
    highpass.Q.value = 0.7;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 9800;
    lowpass.Q.value = 0.6;

    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -20;
    compressor.knee.value = 14;
    compressor.ratio.value = 3.2;
    compressor.attack.value = 0.004;
    compressor.release.value = 0.24;

    const output = ctx.createGain();
    output.gain.value = 0.86;

    const dry = ctx.createGain();
    dry.gain.value = 1.0;
    const wet = ctx.createGain();
    wet.gain.value = 0.17;

    source.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(compressor);
    compressor.connect(dry);
    dry.connect(output);
    if (this.reverb) {
      compressor.connect(this.reverb);
      this.reverb.connect(wet);
      wet.connect(output);
    }
    output.connect(ctx.destination);

    this.source = source;
    this.output = output;
    source.onended = () => {
      if (this.source === source) {
        this.source = null;
        this.output = null;
      }
    };
    source.start();
  }

  private stopSourceImmediate(): void {
    if (!this.source) return;
    try {
      this.source.stop();
    } catch {
      // no-op
    }
    this.source = null;
    this.output = null;
  }

  private ensure(): AudioContext | null {
    if (this.ctx) return this.ctx;
    if (!this.isSupported) return null;
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    try {
      const ctx = new AC();
      const reverb = ctx.createConvolver();
      reverb.buffer = this.makeImpulse(ctx);
      this.ctx = ctx;
      this.reverb = reverb;
      return ctx;
    } catch {
      return null;
    }
  }

  private makeImpulse(ctx: AudioContext): AudioBuffer {
    const seconds = 1.15;
    const length = Math.floor(ctx.sampleRate * seconds);
    const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const t = i / length;
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 2.6) * 0.65;
      }
    }
    return impulse;
  }

  private async load(url: string, ctx: AudioContext): Promise<AudioBuffer | null> {
    if (this.buffers.has(url)) return this.buffers.get(url) ?? null;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        this.buffers.set(url, null);
        return null;
      }
      const data = await response.arrayBuffer();
      const buffer = await ctx.decodeAudioData(data);
      this.buffers.set(url, buffer);
      return buffer;
    } catch {
      this.buffers.set(url, null);
      return null;
    }
  }
}
