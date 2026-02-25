/**
 * Sound Effects Utility
 * Plays UI sounds and combat effects
 */

class SoundManager {
  constructor() {
    this.enabled = true;
    this.volume = 0.3;
    
    // Try to load from localStorage
    const savedEnabled = localStorage.getItem('rpg-sound-enabled');
    const savedVolume = localStorage.getItem('rpg-sound-volume');
    
    if (savedEnabled !== null) {
      this.enabled = savedEnabled === 'true';
    }
    if (savedVolume !== null) {
      this.volume = parseFloat(savedVolume);
    }
  }

  /**
   * Play a sound effect
   * Uses Web Audio API for simple sounds
   */
  play(soundType) {
    if (!this.enabled) return;

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      gainNode.gain.value = this.volume;

      switch (soundType) {
        case 'hit':
          // Sword hit - quick descending tone
          oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.1);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.1);
          break;

        case 'miss':
          // Whoosh sound - quick swoosh
          oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.08);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.08);
          break;

        case 'spell':
          // Magic spell - ethereal tone
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.3);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          oscillator.type = 'sine';
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.3);
          break;

        case 'heal':
          // Healing - ascending gentle tone
          oscillator.frequency.setValueAtTime(262, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(523, audioContext.currentTime + 0.2);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
          oscillator.type = 'sine';
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.2);
          break;

        case 'victory':
          // Victory fanfare - ascending tones
          this.playNote(audioContext, 262, 0, 0.1);
          this.playNote(audioContext, 330, 0.1, 0.1);
          this.playNote(audioContext, 392, 0.2, 0.2);
          break;

        case 'defeat':
          // Defeat - descending sad tones
          this.playNote(audioContext, 330, 0, 0.15);
          this.playNote(audioContext, 277, 0.15, 0.15);
          this.playNote(audioContext, 220, 0.3, 0.3);
          break;

        case 'button':
          // UI button click - short beep
          oscillator.frequency.value = 400;
          gainNode.gain.value = this.volume * 0.5;
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.05);
          break;

        case 'error':
          // Error sound - harsh buzz
          oscillator.type = 'square';
          oscillator.frequency.value = 150;
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.1);
          break;

        default:
          // Default click
          oscillator.frequency.value = 440;
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.05);
      }
    } catch (error) {
      console.error('Sound playback error:', error);
    }
  }

  /**
   * Helper to play a single note
   */
  playNote(audioContext, frequency, startTime, duration) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    gainNode.gain.setValueAtTime(this.volume, audioContext.currentTime + startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + startTime + duration);

    oscillator.start(audioContext.currentTime + startTime);
    oscillator.stop(audioContext.currentTime + startTime + duration);
  }

  /**
   * Toggle sound on/off
   */
  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('rpg-sound-enabled', this.enabled.toString());
    return this.enabled;
  }

  /**
   * Set volume (0-1)
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('rpg-sound-volume', this.volume.toString());
  }

  /**
   * Check if sound is enabled
   */
  isEnabled() {
    return this.enabled;
  }
}

// Create singleton instance
const soundManager = new SoundManager();

export default soundManager;
