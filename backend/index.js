import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import multer from 'multer';
import OpenAI from 'openai';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);

// Configure multer for voice uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) cb(null, true);
    else cb(new Error('Only audio files are allowed'));
  },
});

app.use(cors());
app.use(express.json());

// OpenAI client — used for TTS and Whisper STT
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ═══════════════════════════════════════════════════════════════
// 🎤 Voice Transcription — Whisper
// ═══════════════════════════════════════════════════════════════

app.post('/api/voice', upload.single('audio'), async (req, res) => {
  try {
    const { userId, requestId } = req.body;
    if (!req.file)             return res.status(400).json({ error: 'No audio file provided' });
    if (!userId || !requestId) return res.status(400).json({ error: 'Missing userId or requestId' });

    console.log(`🎤 [${requestId}] Transcribing ${(req.file.size / 1024).toFixed(2)} KB`);

    const transcription = await openai.audio.transcriptions.create({
      file: new File([req.file.buffer], req.file.originalname || 'voice.wav', {
        type: req.file.mimetype || 'audio/wav',
      }),
      model: 'whisper-1',
    });

    console.log(`✅ [${requestId}] Transcribed: "${transcription.text}"`);
    res.json({ success: true, transcribedText: transcription.text, requestId });
  } catch (err) {
    console.error('❌ Transcription error:', err.message);
    res.status(500).json({ error: 'Transcription failed', message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// 🔊 Text-to-Speech — OpenAI TTS
// ═══════════════════════════════════════════════════════════════

app.post('/api/tts', async (req, res) => {
  try {
    const { text, voice = 'nova' } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: 'No text provided' });

    console.log(`🔊 [TTS] "${text.substring(0, 50)}…"`);

    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice,
      input: text.trim(),
      response_format: 'mp3',
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    console.log(`✅ [TTS] ${(buffer.length / 1024).toFixed(2)} KB`);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  } catch (err) {
    console.error('❌ TTS error:', err.message);
    res.status(500).json({ error: 'TTS failed', message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// 🏥 Health Check
// ═══════════════════════════════════════════════════════════════

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    tts: '🔊 OpenAI TTS-1 (nova)',
    stt: '🎤 Whisper-1',
    llm: '🌐 n8n webhook (bfsi)',
    timestamp: new Date().toISOString(),
  });
});

// ═══════════════════════════════════════════════════════════════
// 🔧 Startup
// ═══════════════════════════════════════════════════════════════

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║        🎤  CareerKraft Backend  (n8n + OpenAI TTS)          ║
╚══════════════════════════════════════════════════════════════╝
  HTTP:      http://localhost:${PORT}
  WebSocket: ws://localhost:${PORT}
  TTS:       POST /api/tts
  STT:       POST /api/voice
  Health:    GET  /health
  LLM:       n8n → https://n8n.b2botix.ai/webhook/bfsi
`);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled rejection:', reason);
});
