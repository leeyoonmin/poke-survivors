// Web Audio API Chiptune & SFX Engine for Poké Survivors
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('poke_muted') === 'true';
    this.bgmPlaying = false;
    this.bgmTimer = null;
    this.step = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('poke_muted', String(this.muted));
    if (this.muted) {
      this.stopBGM();
    } else if (window.game && window.game.state === 'PLAYING') {
      this.startBGM();
    }
    return this.muted;
  }

  playTone(freq, type, duration, vol = 0.08, slideTo = null, delay = 0) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), now + duration);
    }

    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  playHit() {
    this.playTone(180 + Math.random() * 60, 'square', 0.06, 0.04, 70);
  }

  playGem() {
    const base = 660 + Math.random() * 120;
    this.playTone(base, 'sine', 0.07, 0.045, base * 1.35);
  }

  playClick() {
    this.playTone(520, 'triangle', 0.06, 0.06, 780);
  }

  playHeal() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, i) => this.playTone(n, 'triangle', 0.14, 0.07, null, i * 0.07));
  }

  playLevelUp() {
    // Classic RPG fanfare
    const notes = [
      { f: 440, d: 0.09, t: 0 },
      { f: 440, d: 0.09, t: 0.1 },
      { f: 440, d: 0.09, t: 0.2 },
      { f: 587.33, d: 0.32, t: 0.3 }
    ];
    notes.forEach(n => this.playTone(n.f, 'square', n.d, 0.07, null, n.t));
  }

  playEvolve() {
    const melody = [
      523.25, 587.33, 659.25, 698.46, 783.99, 880.0, 987.77, 1046.5
    ];
    melody.forEach((f, i) => {
      this.playTone(f, 'square', 0.12, 0.08, null, i * 0.08);
      this.playTone(f * 0.5, 'triangle', 0.12, 0.06, null, i * 0.08);
    });
  }

  playBossAlert() {
    for (let i = 0; i < 3; i++) {
      this.playTone(220, 'sawtooth', 0.22, 0.09, 440, i * 0.28);
    }
  }

  startBGM() {
    if (this.muted || this.bgmPlaying) return;
    this.init();
    this.bgmPlaying = true;
    this.step = 0;

    // Upbeat 8-bit Pokemon battle style bass & lead loop
    const leadNotes = [
      330, 392, 440, 392, 494, 440, 392, 330,
      294, 349, 392, 349, 440, 392, 349, 294,
      330, 392, 523, 494, 440, 392, 440, 494,
      523, 587, 659, 587, 523, 494, 440, 392
    ];
    const bassNotes = [
      110, 110, 165, 110, 147, 147, 196, 147,
      131, 131, 196, 131, 165, 165, 196, 147
    ];

    this.bgmTimer = setInterval(() => {
      if (this.muted || !this.bgmPlaying) return;
      if (window.game && window.game.state !== 'PLAYING') return;

      const lead = leadNotes[this.step % leadNotes.length];
      const bass = bassNotes[this.step % bassNotes.length];

      this.playTone(lead, 'square', 0.13, 0.022);
      if (this.step % 2 === 0) {
        this.playTone(bass, 'triangle', 0.22, 0.035);
      }
      this.step++;
    }, 170);
  }

  stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

window.sound = new SoundEngine();
