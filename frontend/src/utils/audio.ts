/**
 * High-Tech Industrial Subsea Audio Synthesizer
 * Uses Web Audio API to create authentic, pleasant, cinematic control-room sounds
 */

class SubseaAudioManager {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  private isUnlocked: boolean = false;
  private continuousInterval: any = null;
  public isAlarmActive: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const unlock = () => {
        this.initContext();
        if (this.ctx && this.ctx.state === 'running') {
          this.isUnlocked = true;
          window.removeEventListener('click', unlock);
          window.removeEventListener('keydown', unlock);
        }
      };
      window.addEventListener('click', unlock);
      window.addEventListener('keydown', unlock);
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Continuous Breach Alert Loop:
   * Repeatedly fires the high-tech alert pulse every 1.8 seconds while breach is active.
   */
  public startContinuousBreachAlert(intervalMs: number = 1800) {
    this.isAlarmActive = true;
    if (this.continuousInterval) return; // already looping

    // Immediately play first alert pulse
    this.playBreachAlert();

    // Rhythmic continuous loop
    this.continuousInterval = setInterval(() => {
      if (!this.isMuted && this.isAlarmActive) {
        this.playBreachAlert();
      }
    }, intervalMs);
  }

  /**
   * Stop Continuous Alert Loop:
   * Silences ongoing breach alert sirens.
   */
  public stopContinuousBreachAlert() {
    this.isAlarmActive = false;
    if (this.continuousInterval) {
      clearInterval(this.continuousInterval);
      this.continuousInterval = null;
    }
  }

  /**
   * Toggle mute state safely with continuous alert awareness
   */
  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      // Temporarily suppress sound without clearing alarm state
    } else {
      if (this.isAlarmActive) {
        this.playBreachAlert();
      } else {
        this.playSonarPing();
      }
    }
    return this.isMuted;
  }

  /**
   * Premium Cinematic Breach / Error Alert:
   * Smooth, high-tech two-tone resonant acoustic chime with sub-bass pulse.
   * Pleasant, unmistakable, and modern (no harsh buzzing).
   */
  public playBreachAlert() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // Master output limiter/compressor
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(0.24, now);
      masterGain.connect(this.ctx.destination);

      // --- Tone 1: High-Tech Resonant Chime (First Pulse: 880 Hz & 440 Hz) ---
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.exponentialRampToValueAtTime(740, now + 0.18);

      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.linearRampToValueAtTime(0.35, now + 0.02);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain1);
      gain1.connect(masterGain);
      osc1.start(now);
      osc1.stop(now + 0.36);

      // --- Tone 2: Harmonized Second Chime (Second Pulse: 660 Hz -> 554 Hz) ---
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      const t2 = now + 0.16;
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(660, t2);
      osc2.frequency.exponentialRampToValueAtTime(554, t2 + 0.22);

      gain2.gain.setValueAtTime(0.001, t2);
      gain2.gain.linearRampToValueAtTime(0.32, t2 + 0.02);
      gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.45);

      osc2.connect(gain2);
      gain2.connect(masterGain);
      osc2.start(t2);
      osc2.stop(t2 + 0.46);

      // --- Tone 3: Subsea Hull Resonance (Deep Underwater Sine Sub-Bass) ---
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'triangle';
      subOsc.frequency.setValueAtTime(110, now);
      subOsc.frequency.exponentialRampToValueAtTime(65, now + 0.5);

      subGain.gain.setValueAtTime(0.001, now);
      subGain.gain.linearRampToValueAtTime(0.28, now + 0.04);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      subOsc.connect(subGain);
      subGain.connect(masterGain);
      subOsc.start(now);
      subOsc.stop(now + 0.56);
    } catch {
      // Audio autoplay policy catch
    }
  }

  /** Alias for playBreachAlert */
  public playEmergencyAlert() {
    this.playBreachAlert();
  }

  /**
   * Subsea Sonar Acoustic Ping:
   * Authentic ocean acoustic transducer echo
   */
  public playSonarPing() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(950, now);
      osc.frequency.exponentialRampToValueAtTime(1420, now + 0.12);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.8);
    } catch {
      // Safe catch
    }
  }

  /**
   * Hydraulic Valve Actuation:
   * Heavy mechanical subsea isolation valve engagement sound
   */
  public playValveActuation() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.28);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.33);
    } catch {
      // Safe catch
    }
  }

  /**
   * Crisp, subtle tactile click sound for interactive buttons & sliders
   */
  public playClickSound() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(640, now);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.04);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Safe catch
    }
  }
}

export const audioManager = new SubseaAudioManager();
