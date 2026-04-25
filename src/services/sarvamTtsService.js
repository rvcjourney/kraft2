/**
 * Sarvam Text-to-Speech Service
 * Streams audio from Sarvam AI TTS API
 */

const SARVAM_API_ENDPOINT = "https://api.sarvam.ai/text-to-speech/stream";
const SARVAM_API_KEY = import.meta.env.VITE_SARVAM_API_KEY;

// Track currently playing audio globally
let currentAudio = null;

/**
 * Stop any currently playing Sarvam audio
 */
export function stopCurrentAudio() {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      if (currentAudio.src?.startsWith("blob:")) {
        URL.revokeObjectURL(currentAudio.src);
      }
    } catch (_) { /* ignore */ }
    currentAudio = null;
  }
}

/**
 * Stream TTS from Sarvam and return an Audio element ready to play
 */
async function streamSarvamTTS(text, speaker = "priya", language = "en-IN") {
  if (!text?.trim()) throw new Error("Text cannot be empty");
  if (!SARVAM_API_KEY) throw new Error("VITE_SARVAM_API_KEY is not set in .env");

  const response = await fetch(SARVAM_API_ENDPOINT, {
    method: "POST",
    headers: {
      "api-subscription-key": SARVAM_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      target_language_code: language,
      speaker,
      model: "bulbul:v3",
      pace: 1.0,
      speech_sample_rate: 22050,
      output_audio_codec: "mp3",
      enable_preprocessing: true,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Sarvam API error: ${response.status} — ${errText}`);
  }

  const audio = new Audio();

  // Helper: wait until sourceBuffer is no longer updating
  const waitForUpdateEnd = (sb) =>
    new Promise((res) => {
      if (!sb.updating) return res();
      sb.addEventListener("updateend", res, { once: true });
    });

  // Helper: safely close MediaSource only when ready
  const safeEndStream = async (ms, sb) => {
    await waitForUpdateEnd(sb);
    if (ms.readyState === "open") ms.endOfStream();
  };

  // Use MediaSource streaming when supported
  if ("MediaSource" in window && MediaSource.isTypeSupported("audio/mpeg")) {
    const mediaSource = new MediaSource();
    audio.src = URL.createObjectURL(mediaSource);

    await new Promise((resolveOpen) => {
      mediaSource.addEventListener("sourceopen", async () => {
        resolveOpen();
        const sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");
        const reader = response.body.getReader();
        // Append each chunk immediately as it arrives so canplay fires
        // after the first chunk — avoids waiting for the full download
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            await waitForUpdateEnd(sourceBuffer);
            sourceBuffer.appendBuffer(value);
          }

          await safeEndStream(mediaSource, sourceBuffer);
        } catch (err) {
          console.warn("[Sarvam] Stream error:", err.message);
          // Try to close cleanly; if it fails silently move on
          try { await safeEndStream(mediaSource, sourceBuffer); } catch (_) { /* ignore */ }
        }
      }, { once: true });
    });
  } else {
    // Fallback: buffer everything then play
    const chunks = [];
    const reader = response.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    audio.src = URL.createObjectURL(new Blob(chunks, { type: "audio/mpeg" }));
  }

  return audio;
}

/**
 * Split text into sentences for chunked TTS playback.
 * Keeps chunks meaningful but short enough to reduce first-audio latency.
 */
function splitIntoSentences(text) {
  // Split on sentence-ending punctuation, keeping the delimiter
  const raw = text.match(/[^.!?।]+[.!?।]+/g) || [text];
  const sentences = [];
  let current = '';
  for (const s of raw) {
    current += s;
    // Emit chunk once we have a full sentence or it's getting long
    if (current.trim().length >= 30 || s.match(/[.!?।]\s*$/)) {
      sentences.push(current.trim());
      current = '';
    }
  }
  if (current.trim()) sentences.push(current.trim());
  return sentences.filter(Boolean);
}

// Incremented each time playSarvamAudio is called; lets the sentence
// chain detect if playback was superseded by a new call or stopCurrentAudio.
let playGeneration = 0;

/**
 * Play Sarvam TTS audio for the given text.
 * Stops any currently playing audio first.
 * Splits long text into sentences and starts playback on the first sentence
 * immediately, queuing the rest — reduces time-to-first-audio significantly.
 *
 * @param {string}   text     - Text to speak
 * @param {string}   speaker  - Sarvam speaker name (default: "priya")
 * @param {string}   language - Language code (default: "en-IN")
 * @param {Function} onEnd    - Called when all sentences finish playing
 * @returns {Promise<HTMLAudioElement>} The first audio element
 */
export async function playSarvamAudio(text, speaker = "priya", language = "en-IN", onEnd = null) {
  stopCurrentAudio();
  const gen = ++playGeneration;

  const sentences = splitIntoSentences(text);

  // Load a sentence: fetch TTS then wait for canplay
  const load = async (sentence) => {
    const audio = await streamSarvamTTS(sentence, speaker, language);
    await new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error("Audio load timeout")), 30000);
      audio.addEventListener("canplay", () => { clearTimeout(t); resolve(); }, { once: true });
      audio.addEventListener("error", (e) => { clearTimeout(t); reject(new Error(`Audio error: ${e.message || "unknown"}`)); }, { once: true });
    });
    return audio;
  };

  // Recursively plays sentences[idx], using prefetchedAudio if available.
  // Pre-fetches sentences[idx+1] while current sentence plays.
  const playSentence = async (idx, prefetchedAudio) => {
    if (gen !== playGeneration || idx >= sentences.length) {
      if (gen === playGeneration && onEnd) onEnd();
      return;
    }

    let audio;
    try {
      audio = prefetchedAudio ?? await load(sentences[idx]);
    } catch {
      if (gen === playGeneration && onEnd) onEnd();
      return;
    }

    if (gen !== playGeneration) return;

    currentAudio = audio;

    // Pre-fetch the next sentence while this one plays
    const nextPromise = idx + 1 < sentences.length
      ? load(sentences[idx + 1]).catch(() => null)
      : Promise.resolve(null);

    try { await audio.play(); } catch { return; }

    audio.addEventListener("ended", async () => {
      if (currentAudio === audio) currentAudio = null;
      playSentence(idx + 1, await nextPromise);
    }, { once: true });
  };

  // Load and start first sentence immediately (caller awaits this)
  const firstAudio = await load(sentences[0]);
  if (gen !== playGeneration) return firstAudio;

  currentAudio = firstAudio;

  // Pre-fetch second sentence while first is loading into the player
  const secondPromise = sentences.length > 1
    ? load(sentences[1]).catch(() => null)
    : Promise.resolve(null);

  await firstAudio.play();

  firstAudio.addEventListener("ended", async () => {
    if (currentAudio === firstAudio) currentAudio = null;
    playSentence(1, await secondPromise);
  }, { once: true });

  return firstAudio;
}

/**
 * All Sarvam voices
 */
export const SARVAM_VOICES = {
  priya:    "Priya",
  anushka:  "Anushka",
  arya:     "Arya",
  neha:     "Neha",
  ishita:   "Ishita",
  kavya:    "Kavya",
  rahul:    "Rahul",
  rohan:    "Rohan",
  aditya:   "Aditya",
  advait:   "Advait",
};

/**
 * Voices grouped by language for UI filtering
 * en-IN: all voices work
 * hi-IN: female-first selection works best
 */
export const VOICES_BY_LANGUAGE = {
  en: [
    { id: "priya",   name: "Priya",   gender: "Female" },
    { id: "anushka", name: "Anushka", gender: "Female" },
    { id: "arya",    name: "Arya",    gender: "Female" },
    { id: "neha",    name: "Neha",    gender: "Female" },
    { id: "kavya",   name: "Kavya",   gender: "Female" },
    { id: "rahul",   name: "Rahul",   gender: "Male"   },
    { id: "rohan",   name: "Rohan",   gender: "Male"   },
    { id: "aditya",  name: "Aditya",  gender: "Male"   },
  ],
  hi: [
    { id: "priya",   name: "Priya",   gender: "Female" },
    { id: "anushka", name: "Anushka", gender: "Female" },
    { id: "neha",    name: "Neha",    gender: "Female" },
    { id: "ishita",  name: "Ishita",  gender: "Female" },
    { id: "advait",  name: "Advait",  gender: "Male"   },
    { id: "aditya",  name: "Aditya",  gender: "Male"   },
  ],
};
