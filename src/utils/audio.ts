// Enhanced Procedural Web Audio API sound synthesizer with stereo Doppler, turbo flutter, backfires & engine harmonics

class SoundController {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private musicInterval: number | null = null;
  private engineOsc: OscillatorNode | null = null;
  private engineSubOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private currentTrack: string = 'beach';
  private isPlayingMusic: boolean = false;
  private wasBoosting: boolean = false;

  constructor() {
    const saved = localStorage.getItem('redline_sound_muted');
    if (saved !== null) {
      this.isMuted = saved === 'true';
    }
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('redline_sound_muted', String(this.isMuted));
    if (this.isMuted) {
      this.stopEngine();
      this.stopMusic();
    } else {
      this.startMusic(this.currentTrack);
    }
    return this.isMuted;
  }

  // --- Dynamic Engine Sound with Harmonic Richness ---
  public updateEngine(speedKmh: number, maxSpeed: number, isBoosting: boolean, pitchMod: number = 1.0) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const speedRatio = Math.max(0.04, Math.min(1.25, speedKmh / maxSpeed));
      const targetFreq = (45 + speedRatio * 175 * pitchMod) * (isBoosting ? 1.28 : 1.0);

      // Check if boost just ended -> trigger turbo blow-off valve flutter!
      if (this.wasBoosting && !isBoosting && speedKmh > 180) {
        this.playBlowOff();
      }
      this.wasBoosting = isBoosting;

      if (!this.engineOsc || !this.engineGain) {
        this.engineOsc = this.ctx.createOscillator();
        this.engineSubOsc = this.ctx.createOscillator();
        this.engineGain = this.ctx.createGain();

        this.engineOsc.type = 'sawtooth';
        this.engineSubOsc.type = 'triangle';

        this.engineOsc.frequency.setValueAtTime(targetFreq, this.ctx.currentTime);
        this.engineSubOsc.frequency.setValueAtTime(targetFreq * 0.5, this.ctx.currentTime);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320 + speedRatio * 450, this.ctx.currentTime);

        const distGain = this.ctx.createGain();
        distGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

        this.engineOsc.connect(filter);
        this.engineSubOsc.connect(filter);
        filter.connect(distGain);
        distGain.connect(this.engineGain);
        this.engineGain.connect(this.ctx.destination);

        this.engineOsc.start();
        this.engineSubOsc.start();
      } else {
        const now = this.ctx.currentTime;
        this.engineOsc.frequency.setTargetAtTime(targetFreq, now, 0.06);
        if (this.engineSubOsc) {
          this.engineSubOsc.frequency.setTargetAtTime(targetFreq * 0.5, now, 0.06);
        }
        this.engineGain.gain.setTargetAtTime(isBoosting ? 0.12 : 0.07, now, 0.06);
      }
    } catch {
      // Audio safeguard
    }
  }

  public stopEngine() {
    if (this.engineOsc) {
      try {
        this.engineOsc.stop();
        this.engineOsc.disconnect();
        if (this.engineSubOsc) {
          this.engineSubOsc.stop();
          this.engineSubOsc.disconnect();
        }
      } catch {
        // Ignored
      }
      this.engineOsc = null;
      this.engineSubOsc = null;
      this.engineGain = null;
    }
  }

  // --- Turbo Blow-Off Valve Flutter (pssh-tsu-tsu-tsu) ---
  public playBlowOff() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // 3 rapid fluttering bursts of filtered noise
      [0, 0.07, 0.14].forEach((delay, idx) => {
        const bufferSize = Math.floor(this.ctx!.sampleRate * 0.08);
        const buffer = this.ctx!.createBuffer(1, bufferSize, this.ctx!.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx!.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx!.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2200 - idx * 300, now + delay);
        filter.Q.value = 4.0;

        const gain = this.ctx!.createGain();
        gain.gain.setValueAtTime(0.18 / (idx + 1), now + delay);
        gain.gain.exponentialRampToValueAtTime(0.005, now + delay + 0.07);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx!.destination);

        noise.start(now + delay);
        noise.stop(now + delay + 0.07);
      });
    } catch {
      // Ignored
    }
  }

  // --- Exhaust Backfire Pop ---
  public playBackfire() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(25, now + 0.09);

      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Ignored
    }
  }

  // --- Nitro Boost Sound ---
  public playNitro() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // Heavy Sub drop
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(360, now);
      osc.frequency.exponentialRampToValueAtTime(38, now + 0.65);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.65);

      // Jet supersonic white noise roar
      const bufferSize = this.ctx.sampleRate * 0.55;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(900, now);
      filter.frequency.exponentialRampToValueAtTime(4200, now + 0.55);
      filter.Q.value = 2.0;

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.25, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.55);
    } catch {
      // Ignored
    }
  }

  // --- Tire Screech / Drift Sound ---
  public playDrift() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(950 + Math.random() * 250, now);
      osc.frequency.linearRampToValueAtTime(620, now + 0.22);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch {
      // Ignored
    }
  }

  // --- Collision Impact ---
  public playCollision() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(25, now + 0.28);

      gain.gain.setValueAtTime(0.38, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
    } catch {
      // Ignored
    }
  }

  // --- Near Miss Stereo Doppler Whoosh ---
  public playNearMiss(panX: number = 0) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Doppler pitch drop: high approaching -> low departing
      osc.type = 'sine';
      osc.frequency.setValueAtTime(820, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.22);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

      // Stereo Panner if available
      if (this.ctx.createStereoPanner) {
        const panner = this.ctx.createStereoPanner();
        panner.pan.setValueAtTime(Math.max(-0.8, Math.min(0.8, panX)), now);
        osc.connect(gain);
        gain.connect(panner);
        panner.connect(this.ctx.destination);
      } else {
        osc.connect(gain);
        gain.connect(this.ctx.destination);
      }

      osc.start(now);
      osc.stop(now + 0.22);
    } catch {
      // Ignored
    }
  }

  // --- Pickup Item Chime ---
  public playPickup(type: 'nitro' | 'coin' | 'repair') {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes =
        type === 'nitro'
          ? [440, 660, 880, 1100]
          : type === 'coin'
          ? [523, 659, 784, 1046, 1318]
          : [349, 440, 587, 880];

      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.045);

        gain.gain.setValueAtTime(0.18, now + idx * 0.045);
        gain.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.045 + 0.16);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + idx * 0.045);
        osc.stop(now + idx * 0.045 + 0.16);
      });
    } catch {
      // Ignored
    }
  }

  // --- Button UI Click ---
  public playUiClick() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(940, now + 0.06);

      gain.gain.setValueAtTime(0.11, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // Ignored
    }
  }

  // --- Procedural Upbeat Anime Arcade Music Loop ---
  public startMusic(track: string = 'beach') {
    this.currentTrack = track;
    if (this.isMuted) return;
    if (this.isPlayingMusic) return;

    this.initCtx();
    if (!this.ctx) return;

    this.isPlayingMusic = true;
    let step = 0;

    const baseScale =
      track === 'city'
        ? [110, 130.8, 146.8, 164.8, 196, 220, 261.6]
        : track === 'mountain'
        ? [130.8, 146.8, 164.8, 196, 220, 246.9, 261.6]
        : [146.8, 164.8, 185, 220, 246.9, 293.7, 329.6];

    const stepDurationMs = 125; // ~120-136 BPM Driving feel

    this.musicInterval = window.setInterval(() => {
      if (!this.ctx || this.isMuted) return;

      try {
        const now = this.ctx.currentTime;
        step = (step + 1) % 32;

        // Bass pulse on quarters
        if (step % 2 === 0) {
          const bassOsc = this.ctx.createOscillator();
          const bassGain = this.ctx.createGain();
          const bassFreq = baseScale[step % 4] * 0.5;

          bassOsc.type = 'sawtooth';
          bassOsc.frequency.setValueAtTime(bassFreq, now);

          const bassFilter = this.ctx.createBiquadFilter();
          bassFilter.type = 'lowpass';
          bassFilter.frequency.setValueAtTime(260, now);

          bassGain.gain.setValueAtTime(0.055, now);
          bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

          bassOsc.connect(bassFilter);
          bassFilter.connect(bassGain);
          bassGain.connect(this.ctx.destination);

          bassOsc.start(now);
          bassOsc.stop(now + 0.15);
        }

        // Synth lead note pattern
        if (step % 2 === 1 || step % 4 === 0) {
          const melodyIndex = (step * 3) % baseScale.length;
          const leadFreq = baseScale[melodyIndex] * 2;

          const leadOsc = this.ctx.createOscillator();
          const leadGain = this.ctx.createGain();

          leadOsc.type = 'sine';
          leadOsc.frequency.setValueAtTime(leadFreq, now);

          leadGain.gain.setValueAtTime(0.038, now);
          leadGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

          leadOsc.connect(leadGain);
          leadGain.connect(this.ctx.destination);

          leadOsc.start(now);
          leadOsc.stop(now + 0.13);
        }

        // Hi-hat / snare on syncopation
        if (step % 4 === 2) {
          const hatOsc = this.ctx.createOscillator();
          const hatGain = this.ctx.createGain();
          hatOsc.type = 'triangle';
          hatOsc.frequency.setValueAtTime(1600, now);
          hatOsc.frequency.exponentialRampToValueAtTime(180, now + 0.05);

          hatGain.gain.setValueAtTime(0.045, now);
          hatGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

          hatOsc.connect(hatGain);
          hatGain.connect(this.ctx.destination);
          hatOsc.start(now);
          hatOsc.stop(now + 0.05);
        }
      } catch {
        // Fallback
      }
    }, stepDurationMs);
  }

  public stopMusic() {
    this.isPlayingMusic = false;
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const sound = new SoundController();
