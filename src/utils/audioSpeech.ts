/**
 * Speech synthesis for accessibility (Tamil and English readout of epigraphs)
 */

export interface SpeechState {
  isPlaying: boolean;
  activeLanguage: 'ta' | 'en' | null;
  speed: number;
}

class EpigraphSpeechManager {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private onStateChange: ((state: SpeechState) => void) | null = null;
  private state: SpeechState = {
    isPlaying: false,
    activeLanguage: null,
    speed: 0.9,
  };

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public subscribe(callback: (state: SpeechState) => void) {
    this.onStateChange = callback;
    callback(this.state);
  }

  public setSpeed(speed: number) {
    this.state.speed = speed;
    if (this.currentUtterance) {
      this.currentUtterance.rate = speed;
    }
    this.notify();
  }

  public speak(text: string, language: 'ta' | 'en') {
    if (!this.synth) {
      console.warn('SpeechSynthesis is not supported in this browser.');
      return;
    }

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'ta' ? 'ta-IN' : 'en-US';
    utterance.rate = this.state.speed;
    utterance.pitch = 1.0;

    // Pick a preferred voice if available
    const voices = this.synth.getVoices();
    if (language === 'ta') {
      const taVoice = voices.find(v => v.lang.includes('ta'));
      if (taVoice) utterance.voice = taVoice;
    } else {
      const enVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
      if (enVoice) utterance.voice = enVoice;
    }

    utterance.onstart = () => {
      this.state.isPlaying = true;
      this.state.activeLanguage = language;
      this.notify();
    };

    utterance.onend = () => {
      this.state.isPlaying = false;
      this.state.activeLanguage = null;
      this.currentUtterance = null;
      this.notify();
    };

    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      this.state.isPlaying = false;
      this.state.activeLanguage = null;
      this.currentUtterance = null;
      this.notify();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.state.isPlaying = false;
    this.state.activeLanguage = null;
    this.currentUtterance = null;
    this.notify();
  }

  private notify() {
    if (this.onStateChange) {
      this.onStateChange({ ...this.state });
    }
  }
}

export const epigraphSpeech = new EpigraphSpeechManager();
