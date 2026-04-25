/**
 * OpenAI TTS Service
 *
 * Provides text-to-speech conversion using OpenAI API
 * Used for all non-roleplay content (lessons, tests, etc.)
 */

/**
 * Generate speech from text using OpenAI
 * @param {string} text - Text to convert to speech
 * @param {string} voice - Optional voice override (alloy, echo, fable, onyx, nova, shimmer)
 * @returns {Promise<string>} Audio URL for playback
 */
export async function generateOpenAITTS(text, voice = 'nova') {
  try {
    if (!text || text.trim().length === 0) {
      throw new Error('Text is empty');
    }

    console.log(`🎙️  [OpenAI TTS] Generating speech for: "${text.substring(0, 50)}..."`);

    const response = await fetch('http://localhost:3001/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text.trim(),
        voice: voice || 'nova',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    // Convert response to blob and create URL
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    console.log(`✅ [OpenAI TTS] Audio generated successfully`);

    return audioUrl;
  } catch (err) {
    console.error('❌ [OpenAI TTS] Error:', err.message);
    throw err;
  }
}

/**
 * Play audio using OpenAI-generated speech
 * @param {string} text - Text to speak
 * @param {Function} onPlay - Callback when audio starts playing
 * @param {Function} onEnd - Callback when audio finishes
 * @returns {Promise<HTMLAudioElement>} Audio element
 */
export async function playOpenAIAudio(text, onPlay = null, onEnd = null) {
  try {
    console.log(`🎤 [OpenAI TTS] Playing audio...`);

    const audioUrl = await generateOpenAITTS(text);
    const audio = new Audio(audioUrl);

    // Set up event listeners
    if (onPlay) {
      audio.addEventListener('play', onPlay);
    }

    if (onEnd) {
      audio.addEventListener('ended', onEnd);
      audio.addEventListener('pause', onEnd);
    }

    // Play audio
    await audio.play();

    return audio;
  } catch (err) {
    console.error('❌ [OpenAI TTS] Playback error:', err.message);
    throw err;
  }
}

/**
 * Stop current audio playback
 * @param {HTMLAudioElement} audio - Audio element to stop
 */
export function stopAudio(audio) {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
}

/**
 * Available OpenAI voices
 */
export const OPENAI_VOICES = {
  'alloy': 'alloy',       // Balanced, neutral
  'echo': 'echo',         // Warm, friendly
  'fable': 'fable',       // Narrative, story-like
  'onyx': 'onyx',         // Deep, male
  'nova': 'nova',         // Clear, female (default)
  'shimmer': 'shimmer',   // Bright, energetic
};

export default {
  generateOpenAITTS,
  playOpenAIAudio,
  stopAudio,
  OPENAI_VOICES,
};
