
/**
 * Tactical Soundscape Service & TacticalAlertService
 * Uses Web Audio API to synthesize real-time tactical feedback sounds and alerts.
 */

export class AudioController {
  private ctx: AudioContext | null = null;
  private droneGain: GainNode | null = null;
  private isMuted: boolean = false;
  public tacticalAlerts!: TacticalAlertService;

  constructor() {
    this.tacticalAlerts = new TacticalAlertService(this);
  }

  public initCtx() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public getContext(): AudioContext | null {
    return this.initCtx();
  }

  public ensureContext(): AudioContext {
    const ctx = this.initCtx();
    if (!ctx) {
      throw new Error("Web Audio API not supported in this environment");
    }
    return ctx;
  }

  public isAudioMuted(): boolean {
    return this.isMuted;
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.droneGain && this.ctx) {
      this.droneGain.gain.setTargetAtTime(muted ? 0 : 0.05, this.ctx.currentTime, 0.5);
    }
  }

  /**
   * Starts the low-frequency background hum (Mission Control Drone)
   */
  public startAmbientDrone() {
    const ctx = this.initCtx();
    if (!ctx || this.droneGain) return;

    this.droneGain = ctx.createGain();
    this.droneGain.gain.setValueAtTime(0, ctx.currentTime);
    this.droneGain.connect(ctx.destination);

    // Layer 1: Fundamental
    this.createOscillator(60, 'sine', 0.5, this.droneGain);
    // Layer 2: Sub-harmonic
    this.createOscillator(30, 'sine', 0.3, this.droneGain);
    // Layer 3: Technical buzz
    this.createOscillator(120, 'sawtooth', 0.05, this.droneGain);

    if (!this.isMuted) {
      this.droneGain.gain.setTargetAtTime(0.05, ctx.currentTime, 2);
    }
  }

  private createOscillator(freq: number, type: OscillatorType, volume: number, destination: AudioNode) {
    if (!this.ctx) return null;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    
    osc.connect(gain);
    gain.connect(destination);
    
    osc.start();
    return osc;
  }

  /**
   * High-pitched data "chirp" for status changes
   */
  public playChirp() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }

  /**
   * Warning "blip" for alerts or jams
   */
  public playAlert() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(220, ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }

  /**
   * Deep pulse for quantum triggers
   */
  public playPulse() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 0.5);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  }

  /**
   * General tactical beep at custom frequency
   */
  public playBeep(freq: number = 880, type: OscillatorType = 'sine', duration: number = 0.08) {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  /**
   * Double chirp for successful verification or execution
   */
  public playDoubleChirp() {
    this.playBeep(880, 'triangle', 0.06);
    setTimeout(() => {
      this.playBeep(1320, 'triangle', 0.08);
    }, 80);
  }

  /**
   * Tactical Voice Alerts
   */
  public playSystemVoice(message: string) {
    if (this.isMuted) return;
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 1.1;
      utterance.pitch = 0.85;
      utterance.volume = 0.55;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech synthesis not permitted in current browser context
    }
  }

  public triggerCriticalAlert() {
    this.tacticalAlerts.triggerCriticalAlert();
  }

  public triggerJammingAlert(active: boolean) {
    this.tacticalAlerts.triggerJammingCue(active);
  }
}

/**
 * TacticalAlertService
 * Monitors system telemetry status and jamming state, triggering distinct sound cues.
 */
export class TacticalAlertService {
  private audio: AudioController;
  private currentTelemetryStatus: string = 'NOMINAL';
  private isJammingActive: boolean = false;
  private lastCriticalAlert: number = 0;
  private lastJammingAlert: number = 0;
  private lastVoiceAlert: number = 0;
  private voiceAlertsEnabled: boolean = true;

  constructor(audio: AudioController) {
    this.audio = audio;
  }

  public setVoiceAlerts(enabled: boolean) {
    this.voiceAlertsEnabled = enabled;
  }

  public getStatus() {
    return {
      telemetryStatus: this.currentTelemetryStatus,
      isJamming: this.isJammingActive,
      voiceAlerts: this.voiceAlertsEnabled,
      lastCriticalAlert: this.lastCriticalAlert,
      lastJammingAlert: this.lastJammingAlert
    };
  }

  /**
   * Synthesizes a military dual-tone alternating alert siren/warble
   * specifically triggered when telemetry reports 'CRITICAL'
   */
  public playCriticalWarble() {
    if (this.audio.isAudioMuted()) return;
    const ctx = this.audio.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Master gain for this critical alert cue
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.24, now);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
    masterGain.connect(ctx.destination);

    // Deep sub-harmonic punch (75Hz -> 30Hz)
    try {
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(75, now);
      subOsc.frequency.exponentialRampToValueAtTime(32, now + 0.35);
      subGain.gain.setValueAtTime(0.35, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      subOsc.connect(subGain);
      subGain.connect(masterGain);
      subOsc.start(now);
      subOsc.stop(now + 0.35);
    } catch {}

    // Alternating sharp two-tone klaxon sequence: 940Hz and 700Hz
    const tones = [
      { freq: 940, start: 0.00, dur: 0.11 },
      { freq: 700, start: 0.12, dur: 0.11 },
      { freq: 940, start: 0.24, dur: 0.11 },
      { freq: 700, start: 0.36, dur: 0.11 },
      { freq: 940, start: 0.48, dur: 0.11 },
      { freq: 700, start: 0.60, dur: 0.15 }
    ];

    tones.forEach(t => {
      try {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(t.freq, now + t.start);
        
        g.gain.setValueAtTime(0.001, now + t.start);
        g.gain.linearRampToValueAtTime(0.18, now + t.start + 0.015);
        g.gain.exponentialRampToValueAtTime(0.001, now + t.start + t.dur);
        
        osc.connect(g);
        g.connect(masterGain);
        osc.start(now + t.start);
        osc.stop(now + t.start + t.dur);
      } catch {}
    });
  }

  /**
   * Synthesizes an electronic warfare RF jamming sweep + noise modulation cue
   * specifically triggered when jamming is enabled
   */
  public playJammingSweep() {
    if (this.audio.isAudioMuted()) return;
    const ctx = this.audio.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.22, now);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
    masterGain.connect(ctx.destination);

    try {
      // Swept FM carrier oscillator (280Hz -> 2600Hz -> 650Hz)
      const carrier = ctx.createOscillator();
      const carrierGain = ctx.createGain();
      carrier.type = 'sawtooth';

      carrier.frequency.setValueAtTime(280, now);
      carrier.frequency.exponentialRampToValueAtTime(2600, now + 0.22);
      carrier.frequency.exponentialRampToValueAtTime(650, now + 0.55);

      // Fast LFO vibrato (32Hz)
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(32, now);
      lfoGain.gain.setValueAtTime(140, now);
      lfo.connect(carrier.frequency);
      lfo.start(now);
      lfo.stop(now + 0.6);

      carrierGain.gain.setValueAtTime(0.001, now);
      carrierGain.gain.linearRampToValueAtTime(0.18, now + 0.04);
      carrierGain.gain.setValueAtTime(0.18, now + 0.35);
      carrierGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      carrier.connect(carrierGain);
      carrierGain.connect(masterGain);
      carrier.start(now);
      carrier.stop(now + 0.6);
    } catch {}

    // Broadband RF static noise burst
    try {
      const bufferSize = Math.floor(ctx.sampleRate * 0.35);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2400, now);
      filter.Q.setValueAtTime(2.2, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.12, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      noiseSource.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(masterGain);

      noiseSource.start(now);
      noiseSource.stop(now + 0.35);
    } catch {}
  }

  /**
   * Sound cue for jamming deactivation
   */
  public playJammingCease() {
    if (this.audio.isAudioMuted()) return;
    const ctx = this.audio.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1100, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.28);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
    } catch {}
  }

  /**
   * Triggers the critical alert acoustic sequence and optional tactical voice cue
   */
  public triggerCriticalAlert() {
    const now = Date.now();
    if (now - this.lastCriticalAlert < 3500) return; // Throttle sound cues
    this.lastCriticalAlert = now;

    this.playCriticalWarble();

    if (this.voiceAlertsEnabled && now - this.lastVoiceAlert > 12000) {
      this.lastVoiceAlert = now;
      this.audio.playSystemVoice("Warning: system telemetry critical.");
    }
  }

  /**
   * Triggers the electronic jamming acoustic sequence
   */
  public triggerJammingCue(active: boolean) {
    const now = Date.now();
    if (active) {
      if (now - this.lastJammingAlert < 2000) return;
      this.lastJammingAlert = now;
      this.playJammingSweep();

      if (this.voiceAlertsEnabled && now - this.lastVoiceAlert > 10000) {
        this.lastVoiceAlert = now;
        this.audio.playSystemVoice("Electronic countermeasure active. Jamming enabled.");
      }
    } else {
      this.playJammingCease();
      if (this.voiceAlertsEnabled && now - this.lastVoiceAlert > 10000) {
        this.lastVoiceAlert = now;
        this.audio.playSystemVoice("Jamming neutralized.");
      }
    }
  }

  /**
   * Telemetry status listener.
   * Automatically invokes critical alert when entering 'CRITICAL'.
   */
  public updateTelemetryStatus(status: string) {
    const norm = (status || '').toUpperCase();
    const prev = this.currentTelemetryStatus;
    this.currentTelemetryStatus = norm;

    if (norm === 'CRITICAL') {
      if (prev !== 'CRITICAL' || Date.now() - this.lastCriticalAlert > 14000) {
        this.triggerCriticalAlert();
      }
    } else if (prev === 'CRITICAL' && (norm === 'NOMINAL' || norm === 'DEGRADED')) {
      // Telemetry recovery cue
      this.audio.playDoubleChirp();
    }
  }

  /**
   * Jamming status listener.
   * Automatically invokes electronic warfare sound cue when jamming state toggles.
   */
  public setJammingState(isJamming: boolean) {
    if (isJamming !== this.isJammingActive) {
      this.isJammingActive = isJamming;
      this.triggerJammingCue(isJamming);
    }
  }
}

export const audioController = new AudioController();
export const tacticalAlertService = audioController.tacticalAlerts;
export const playSystemVoice = (msg: string) => audioController.playSystemVoice(msg);
