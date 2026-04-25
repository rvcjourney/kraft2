/**
 * Text-to-Speech (TTS) Service
 * Uses Web Speech API (built-in browser) as primary method
 * Optional backend API integration for higher quality audio
 */

const DEFAULT_API_BASE = 'http://localhost:3001';

// Get speech synthesis instance
const getSynthesis = () => window.speechSynthesis;

/**
 * Play base64 encoded audio
 * @param {string} base64 - Base64 encoded mp3 audio
 */
export const playAudio = (base64) => {
  if (!base64) return;
  try {
    const audio = new Audio(`data:audio/mp3;base64,${base64}`);
    audio.play().catch(() => {
      console.warn('Audio playback failed (autoplay blocked)');
    });
  } catch (err) {
    console.error('Audio playback error:', err);
  }
};

/**
 * Stop all currently playing audio and speech
 */
export const stopAudio = () => {
  // Stop Web Speech API
  const synthesis = getSynthesis();
  if (synthesis) {
    synthesis.cancel();
  }

  // Stop HTML audio elements
  const audioElements = document.querySelectorAll('audio');
  audioElements.forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });
};

/**
 * Convert text to speech and play it
 * Uses Web Speech API (browser built-in) for immediate audio
 * @param {string} text - Text to convert to speech
 * @param {string} speaker - Speaker name (e.g., 'ria', 'coach')
 * @returns {Promise<void>}
 */
export const speakText = async (text, speaker = 'ria') => {
  if (!text || !text.trim()) {
    console.warn('Empty text provided to speakText');
    return;
  }

  // Use Web Speech API (built-in browser feature)
  const synthesis = getSynthesis();
  if (!synthesis) {
    console.warn('Web Speech API not supported in this browser');
    return;
  }

  // Cancel any ongoing speech
  synthesis.cancel();

  // Create utterance
  const utterance = new SpeechSynthesisUtterance(text.trim());

  // Configure voice based on speaker
  const voices = synthesis.getVoices();
  if (voices.length > 0) {
    // Try to find a female voice for Ria
    if (speaker === 'ria') {
      const femaleVoice = voices.find(
        (v) => v.name.includes('Female') || v.name.includes('female')
      ) || voices.find((v) => !v.name.includes('Male') && !v.name.includes('male'));
      if (femaleVoice) utterance.voice = femaleVoice;
    } else {
      utterance.voice = voices[0];
    }
  }

  // Configure speech settings
  utterance.rate = 0.95; // Slightly slower for clarity
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  // Handle errors
  utterance.onerror = (event) => {
    console.error('Speech synthesis error:', event.error);
  };

  // Speak
  synthesis.speak(utterance);

  return new Promise((resolve) => {
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve(); // Resolve even on error to avoid hanging
  });
};

/**
 * Check if Web Speech API is available
 * @returns {boolean}
 */
export const isSpeechAPIAvailable = () => {
  return !!window.speechSynthesis;
};

/**
 * Get available voices for speech synthesis
 * @returns {SpeechSynthesisVoice[]}
 */
export const getAvailableVoices = () => {
  const synthesis = getSynthesis();
  return synthesis ? synthesis.getVoices() : [];
};

/**
 * Preload audio from a URL
 * @param {string} base64 - Base64 encoded audio
 * @returns {HTMLAudioElement} - Audio element ready to play
 */
export const preloadAudio = (base64) => {
  if (!base64) return null;
  const audio = new Audio(`data:audio/mp3;base64,${base64}`);
  return audio;
};

export default {
  playAudio,
  stopAudio,
  speakText,
  preloadAudio,
  isSpeechAPIAvailable,
  getAvailableVoices,
};
