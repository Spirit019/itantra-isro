// Web Audio API and Speech Synthesis Engine for iTantra Demo

class AudioEngine {
  constructor() {
    this.audioCtx = null;
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  }

  initAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // Play a radio chirp / squelch sound
  playRadioChirp(frequency = 880, duration = 0.08) {
    try {
      this.initAudioContext();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(frequency * 1.5, this.audioCtx.currentTime + duration);

      gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('Audio chirp failed:', e);
    }
  }

  // Play tactical FSK packet transmission burst sound
  playPacketBurst(durationMs = 250) {
    try {
      this.initAudioContext();
      if (!this.audioCtx) return;

      const duration = durationMs / 1000;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1200, this.audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(2400, this.audioCtx.currentTime + duration * 0.5);
      osc.frequency.linearRampToValueAtTime(1800, this.audioCtx.currentTime + duration);

      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('Packet burst sound error:', e);
    }
  }

  // Play Emergency Siren Sound
  playEmergencySiren() {
    try {
      this.initAudioContext();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      const now = this.audioCtx.currentTime;

      osc.frequency.setValueAtTime(600, now);
      osc.frequency.linearRampToValueAtTime(1200, now + 0.3);
      osc.frequency.linearRampToValueAtTime(600, now + 0.6);
      osc.frequency.linearRampToValueAtTime(1200, now + 0.9);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1.0);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 1.0);
    } catch (e) {
      console.warn('Siren sound error:', e);
    }
  }

  // Speak text in native Indian language using SpeechSynthesis API
  speakText(text, langCode = 'hi-IN', rate = 1.0, pitch = 1.0) {
    return new Promise((resolve) => {
      if (!this.synth) {
        resolve();
        return;
      }

      this.synth.cancel(); // stop previous speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = pitch;

      // Map language code
      const langMap = {
        'hi': 'hi-IN',
        'ta': 'ta-IN',
        'te': 'te-IN',
        'bn': 'bn-IN',
        'mr': 'mr-IN',
        'gu': 'gu-IN',
        'kn': 'kn-IN',
        'ml': 'ml-IN',
        'or': 'or-IN',
        'en': 'en-IN',
      };

      const targetLang = langMap[langCode] || langCode || 'hi-IN';
      utterance.lang = targetLang;

      // Try finding voice matching the language
      const voices = this.synth.getVoices();
      const matchedVoice = voices.find(v => v.lang.startsWith(targetLang.split('-')[0]) || v.lang === targetLang);
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onend = () => {
        resolve();
      };

      utterance.onerror = (err) => {
        console.warn('SpeechSynthesis error:', err);
        resolve();
      };

      this.synth.speak(utterance);
    });
  }

  stopSpeech() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

export const audioEngine = new AudioEngine();
