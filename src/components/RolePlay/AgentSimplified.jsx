import { useState, useEffect, useRef, useCallback } from 'react';
import { Spinner } from 'react-bootstrap';
import {
  FiMic, FiVolume2, FiVolumeX,
  FiPlay, FiSquare, FiChevronLeft, FiZap,
} from 'react-icons/fi';
import { generateN8nResponse } from '../../services/n8nAgentService';
import {
  playSarvamAudio,
  stopCurrentAudio as stopSarvamAudio,
  VOICES_BY_LANGUAGE,
} from '../../services/sarvamTtsService';
import EvaluationReport from './EvaluationReport';
import './AgentSimplified.css';
import './EvaluationReport.css';

function generateSessionId() {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 18);
}

// Evaluate/feedback intent — these responses are shown but NOT stored in history
// so the score report doesn't appear as a "Customer" message on the next evaluate call
function isEvaluateIntent(msg) {
  const m = msg.toLowerCase();
  return m.includes('evaluate') || m.includes('feedback') || m.includes('score') ||
    m.includes('assess') || m.includes('how did i do') || m.includes('rate me') ||
    m.includes('मूल्यांकन') || m.includes('फीडबैक') || m.includes('स्कोर') || m.includes('इवेलुएट');
}

// Render agent text: supports **bold**, numbered lists, bullet lists, line breaks
function FormattedMessage({ text }) {
  if (!text) return null;

  // Split into lines, then process each
  const lines = text.split('\n').filter((l, i, arr) => {
    // collapse more than 1 consecutive blank line
    if (l.trim() === '' && arr[i - 1]?.trim() === '') return false;
    return true;
  });

  const elements = [];
  let listItems = [];
  let listType = null; // 'ol' | 'ul'

  const flushList = (key) => {
    if (!listItems.length) return;
    const Tag = listType === 'ol' ? 'ol' : 'ul';
    elements.push(
      <Tag key={`list-${key}`} className="rp-msg-list">
        {listItems.map((li, i) => <li key={i}>{inlineFormat(li)}</li>)}
      </Tag>
    );
    listItems = [];
    listType = null;
  };

  lines.forEach((line, i) => {
    const olMatch = line.match(/^(\d+)[.)]\s+(.+)/);
    const ulMatch = line.match(/^[-•*]\s+(.+)/);

    if (olMatch) {
      if (listType === 'ul') flushList(i);
      listType = 'ol';
      listItems.push(olMatch[2]);
    } else if (ulMatch) {
      if (listType === 'ol') flushList(i);
      listType = 'ul';
      listItems.push(ulMatch[1]);
    } else {
      flushList(i);
      if (line.trim() === '') {
        elements.push(<div key={`gap-${i}`} className="rp-msg-gap" />);
      } else {
        elements.push(<p key={`p-${i}`} className="rp-msg-para">{inlineFormat(line)}</p>);
      }
    }
  });
  flushList('end');

  return <>{elements}</>;
}

// Bold (**text**) + italic (*text*) inline
function inlineFormat(str) {
  const parts = [];
  const re = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
  let last = 0, m;
  while ((m = re.exec(str)) !== null) {
    if (m.index > last) parts.push(str.slice(last, m.index));
    if (m[2]) parts.push(<strong key={m.index}>{m[2]}</strong>);
    else if (m[3]) parts.push(<em key={m.index}>{m[3]}</em>);
    last = m.index + m[0].length;
  }
  if (last < str.length) parts.push(str.slice(last));
  return parts.length ? parts : str;
}

// Animated waveform bars
function Waveform({ active, bars = 5 }) {
  return (
    <div className={`rp-waveform ${active ? 'rp-waveform--active' : ''}`}>
      {Array.from({ length: bars }).map((_, i) => (
        <span key={i} className="rp-wave-bar" style={{ animationDelay: `${i * 0.1}s` }} />
      ))}
    </div>
  );
}

// Agent avatar with animated ring
function AgentAvatar({ mode, name = 'RIA' }) {
  return (
    <div className={`rp-avatar rp-avatar--${mode}`}>
      <div className="rp-avatar-ring" />
      <div className="rp-avatar-inner">
        <span className="rp-avatar-initials">{name.toUpperCase()}</span>
      </div>
    </div>
  );
}

export default function AgentSimplified({ onBack }) {
  const [sessionId]          = useState(generateSessionId);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [introReady, setIntroReady]         = useState(false); // true once user clicks Ready after reading intro
  const [language, setLanguage]             = useState('en');
  const [selectedVoice, setSelectedVoice]   = useState('priya');

  const voiceGender = VOICES_BY_LANGUAGE[language].find(v => v.id === selectedVoice)?.gender?.toLowerCase() ?? 'female';
  const agentName   = voiceGender === 'male' ? 'Raj' : 'Ria';

  // Reset voice to first available when language changes + keep ref in sync
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    languageRef.current = lang;
    setSelectedVoice(VOICES_BY_LANGUAGE[lang][0].id);
  };
  const [messages, setMessages]             = useState([]);
  const [loading, setLoading]               = useState(false);
  const [speaking, setSpeaking]             = useState(false);
  const [listening, setListening]           = useState(false);
  const [transcript, setTranscript]         = useState('');
  const [isMuted, setIsMuted]               = useState(false);
  const [connectionError, setConnectionError] = useState('');

  const messagesEndRef   = useRef(null);
  const recognitionRef   = useRef(null);
  const currentAudioRef  = useRef(null);
  const historyRef       = useRef([]);
  const isActiveRef      = useRef(false);
  const isBusyRef        = useRef(false);
  const sendTimerRef     = useRef(null);
  const languageRef      = useRef(language);   // always holds latest language for SR closure
  const sendMessageRef   = useRef(null);        // always holds latest sendMessage for SR closure

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const stopCurrentAudio = useCallback(() => {
    stopSarvamAudio();
    currentAudioRef.current = null;
    setSpeaking(false);
  }, []);

  const appendMessage = (role, content) => {
    setMessages(prev => [...prev, { role, content, ts: Date.now() }]);
    historyRef.current = [...historyRef.current, { role, content }];
  };

  const startRecognition = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec || !isActiveRef.current || isBusyRef.current) return;
    try { rec.start(); } catch { /* already running */ }
  }, []);

  const stopRecognition = useCallback(() => {
    // abort() cuts off immediately — stop() still processes buffered audio
    // which causes the mic to hear the start of TTS playback
    try { recognitionRef.current?.abort(); } catch { /* ignore */ }
  }, []);

  const sendMessage = useCallback(async (text) => {
    const content = text?.trim();
    if (!content) return;
    stopCurrentAudio();
    setTranscript('');
    setConnectionError('');
    const isEval = isEvaluateIntent(content);
    appendMessage('user', content);
    isBusyRef.current = true;
    setLoading(true);
    stopRecognition();
    try {
      const agentText = await generateN8nResponse(sessionId, content, historyRef.current, 'session1', language, voiceGender);
      // Evaluate responses are shown in UI but NOT added to historyRef —
      // prevents the score report appearing as a "Customer" message on next evaluate
      if (isEval) {
        // Try to parse JSON from the Mentor Agent response
        let evalData = null;
        try {
          const jsonMatch = agentText.match(/\{[\s\S]*\}/);
          if (jsonMatch) evalData = JSON.parse(jsonMatch[0]);
        } catch { /* fallback to raw text */ }

        setMessages(prev => [...prev, {
          role: 'agent', content: agentText, ts: Date.now(), isEval: true, evalData
        }]);

        // Speak only the short voiceSummary, then stop — session is over after evaluation
        const ttsText = evalData?.voiceSummary ?? null;
        if (!isMuted && ttsText) {
          setSpeaking(true);
          try {
            const audio = await playSarvamAudio(ttsText, selectedVoice, language === 'hi' ? 'hi-IN' : 'en-IN', () => {
              setSpeaking(false);
              isBusyRef.current = false;
              // Do NOT restart recognition — evaluation ends the active session
            });
            currentAudioRef.current = audio;
          } catch {
            setSpeaking(false);
            isBusyRef.current = false;
          }
        } else {
          isBusyRef.current = false;
          // Do NOT restart recognition — evaluation ends the active session
        }
        isActiveRef.current = false;
      } else {
        appendMessage('agent', agentText);
        if (!isMuted) {
          setSpeaking(true);
          try {
            const audio = await playSarvamAudio(agentText, selectedVoice, language === 'hi' ? 'hi-IN' : 'en-IN', () => {
              setSpeaking(false);
              isBusyRef.current = false;
              // 600ms delay — lets room echo from speakers die out
              // before mic opens, preventing bot voice being re-captured
              setTimeout(() => startRecognition(), 600);
            });
            currentAudioRef.current = audio;
          } catch {
            setSpeaking(false);
            isBusyRef.current = false;
            setTimeout(() => startRecognition(), 600);
          }
        } else {
          isBusyRef.current = false;
          startRecognition();
        }
      }
    } catch (err) {
      setConnectionError(err.message);
      isBusyRef.current = false;
      startRecognition();
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, selectedVoice, language, isMuted, stopCurrentAudio, startRecognition, stopRecognition]);

  // Keep ref pointing to latest sendMessage — fixes stale closure in SR onresult handler
  useEffect(() => { sendMessageRef.current = sendMessage; }, [sendMessage]);

  const handleReady = useCallback(async () => {
    setIntroReady(true);
    isBusyRef.current = true;
    setLoading(true);
    try {
      const vg = VOICES_BY_LANGUAGE[language].find(v => v.id === selectedVoice)?.gender?.toLowerCase() ?? 'female';
      const agentText = await generateN8nResponse(sessionId, 'ready', [], 'session1', language, vg);
      appendMessage('agent', agentText);
      if (!isMuted) {
        setSpeaking(true);
        try {
          const audio = await playSarvamAudio(agentText, selectedVoice, language === 'hi' ? 'hi-IN' : 'en-IN', () => {
            setSpeaking(false);
            isBusyRef.current = false;
            setTimeout(() => startRecognition(), 600);
          });
          currentAudioRef.current = audio;
        } catch {
          setSpeaking(false);
          isBusyRef.current = false;
          setTimeout(() => startRecognition(), 600);
        }
      } else {
        isBusyRef.current = false;
        setTimeout(() => startRecognition(), 300);
      }
    } catch (err) {
      setConnectionError(err.message);
      isBusyRef.current = false;
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, selectedVoice, language, isMuted, startRecognition]);

  useEffect(() => {
    const SR = window['SpeechRecognition'] || window['webkitSpeechRecognition'];
    if (!SR) return;
    const rec = new SR();
    rec.continuous     = false;
    rec.interimResults = true;
    // Use ref so lang is always current when recognition restarts
    rec.lang           = languageRef.current === 'hi' ? 'hi-IN' : 'en-IN';
    rec.onstart  = () => {
      // Refresh lang each time recognition starts (picks up language changes)
      rec.lang = languageRef.current === 'hi' ? 'hi-IN' : 'en-IN';
      setListening(true);
    };
    rec.onresult = (e) => {
      clearTimeout(sendTimerRef.current);
      let interim = '', final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        e.results[i].isFinal ? (final += t + ' ') : (interim += t);
      }
      const combined = (final || interim).trim();
      setTranscript(combined);
      if (final.trim()) {
        // Use ref to always call the latest sendMessage (avoids stale closure)
        sendTimerRef.current = setTimeout(() => sendMessageRef.current?.(final.trim()), 400);
      }
    };
    rec.onend   = () => {
      setListening(false);
      if (isActiveRef.current && !isBusyRef.current) setTimeout(() => startRecognition(), 300);
    };
    rec.onerror = (e) => {
      setListening(false);
      if (e.error === 'no-speech' && isActiveRef.current && !isBusyRef.current)
        setTimeout(() => startRecognition(), 500);
    };
    recognitionRef.current = rec;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startSession = async () => {
    setSessionStarted(true);
    setIntroReady(false);
    setMessages([]);
    historyRef.current = [];
    setConnectionError('');
    isActiveRef.current = true;
    isBusyRef.current   = true;
    setLoading(true);
    try {
      const agentText = await generateN8nResponse(sessionId, 'hi', [], 'session1', language, voiceGender);
      appendMessage('agent', agentText);
      // Mic stays off — user reads the intro and clicks "I'm Ready" when done
      isBusyRef.current = false;
    } catch (err) {
      setConnectionError(err.message);
      isBusyRef.current = false;
    } finally {
      setLoading(false);
    }
  };

  const endSession = () => {
    isActiveRef.current = false;
    isBusyRef.current   = false;
    clearTimeout(sendTimerRef.current);
    stopCurrentAudio();
    stopRecognition();
    setSessionStarted(false);
    setIntroReady(false);
    setMessages([]);
    historyRef.current = [];
    setTranscript('');
    setConnectionError('');
    setLoading(false);
    setSpeaking(false);
    setListening(false);
  };

  useEffect(() => () => {
    isActiveRef.current = false;
    clearTimeout(sendTimerRef.current);
    stopSarvamAudio();
    try { recognitionRef.current?.stop(); } catch { /* ignore */ }
  }, []);

  const activityMode  = speaking ? 'speaking' : listening ? 'listening' : loading ? 'thinking' : 'idle';
  const hasSpeechAPI  = !!(window['SpeechRecognition'] || window['webkitSpeechRecognition']);
  const userTurns     = messages.filter(m => m.role === 'user').length;
  const evalComplete  = messages[messages.length - 1]?.isEval === true;
  // True while user has read the intro but hasn't clicked to start roleplay yet
  const isReadyState  = !introReady && messages.length > 0 && !loading;

  // ── PRE-SESSION SCREEN ──────────────────────────────────────────────────────
  if (!sessionStarted) {
    return (
      <div className="rp-pre">
        {onBack && (
          <button className="rp-pre-back" onClick={onBack}>
            <FiChevronLeft size={16} /> Back
          </button>
        )}

        <div className="rp-pre-card">
          {/* LEFT — Avatar + branding */}
          <div className="rp-pre-left">
            <AgentAvatar mode="idle" name={agentName} />
            <h2 className="rp-pre-name">{agentName}</h2>
            <p className="rp-pre-role">AI Sales Coach · BFSI</p>
            <div className="rp-pre-badge">Role Play</div>
          </div>

          {/* RIGHT — Details + controls */}
          <div className="rp-pre-right">
            <p className="rp-pre-desc">
              Practice real BFSI customer conversations. {agentName} plays a loan applicant — your job is to qualify, advise, and close.
            </p>

            {/* Tips */}
            <div className="rp-pre-tips">
              <div className="rp-pre-tip"><span>🎯</span><span>Ask about loan purpose &amp; timeline</span></div>
              <div className="rp-pre-tip"><span>💬</span><span>Understand applicant income &amp; obligations</span></div>
              <div className="rp-pre-tip"><span>📊</span><span>Say <strong>"evaluate"</strong> for a performance score</span></div>
            </div>

            {/* Language + Voice settings block */}
            <div className="rp-pre-settings">
              <div className="rp-pre-settings-title">Session Settings</div>

              {/* Language */}
              <div className="rp-pre-setting-row">
                <span className="rp-pre-setting-label">🌐 Language</span>
                <div className="rp-lang-toggle">
                  <button
                    className={`rp-lang-btn ${language === 'en' ? 'rp-lang-btn--active' : ''}`}
                    onClick={() => handleLanguageChange('en')}
                  >en English</button>
                  <button
                    className={`rp-lang-btn ${language === 'hi' ? 'rp-lang-btn--active' : ''}`}
                    onClick={() => handleLanguageChange('hi')}
                  >🇮🇳 हिंदी</button>
                </div>
              </div>

              {/* Voice */}
              <div className="rp-pre-setting-row">
                <span className="rp-pre-setting-label">🔊 Voice</span>
                <select
                  className="rp-voice-select"
                  value={selectedVoice}
                  onChange={e => setSelectedVoice(e.target.value)}
                >
                  {VOICES_BY_LANGUAGE[language].map(({ id, name, gender }) => (
                    <option key={id} value={id}>{name} ({gender})</option>
                  ))}
                </select>
              </div>
            </div>

            {!hasSpeechAPI && (
              <div className="rp-pre-warn">
                ⚠️ Voice input not supported in this browser. Use Chrome for best experience.
              </div>
            )}

            {/* Start CTA */}
            <button className="rp-pre-start" onClick={startSession} disabled={loading}>
              {loading
                ? <><Spinner animation="border" size="sm" className="me-2" />Connecting…</>
                : <><FiPlay size={17} className="me-2" />Start Session</>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── ACTIVE SESSION SCREEN ───────────────────────────────────────────────────
  return (
    <div className="rp-session">

      {/* ── Top Bar ──────────────────────────────────────────────────────────── */}
      <div className="rp-topbar">
        <div className="rp-topbar-left">
          <div className={`rp-topbar-dot rp-topbar-dot--${activityMode}`} />
          <div>
            <div className="rp-topbar-name">{agentName} — AI Sales Coach</div>
            <div className="rp-topbar-status">
              {activityMode === 'speaking' && 'Speaking…'}
              {activityMode === 'listening' && 'Listening…'}
              {activityMode === 'thinking' && 'Thinking…'}
              {activityMode === 'idle' && `${userTurns} turn${userTurns !== 1 ? 's' : ''} · Session active`}
            </div>
          </div>
        </div>
        <div className="rp-topbar-right">
          <button
            className={`rp-icon-btn ${isMuted ? 'rp-icon-btn--warn' : ''}`}
            title={isMuted ? 'Voice off' : 'Voice on'}
            onClick={() => { if (!isMuted) stopCurrentAudio(); setIsMuted(m => !m); }}
          >
            {isMuted ? <FiVolumeX size={17} /> : <FiVolume2 size={17} />}
          </button>
          <button className="rp-icon-btn rp-icon-btn--danger" title="End session" onClick={endSession}>
            <FiSquare size={15} />
          </button>
        </div>
      </div>

      {/* ── Error banner ─────────────────────────────────────────────────────── */}
      {connectionError && (
        <div className="rp-error-bar">
          ⚠️ {connectionError}
          <button onClick={() => setConnectionError('')}>✕</button>
        </div>
      )}

      {/* ── Messages ─────────────────────────────────────────────────────────── */}
      <div className="rp-messages">

        {/* Agent avatar row when no messages yet */}
        {messages.length === 0 && (
          <div className="rp-waiting">
            <AgentAvatar mode={activityMode} name={agentName} />
            {(speaking || loading) && <Waveform active bars={6} />}
            <p className="rp-waiting-text">
              {loading ? `${agentName} is preparing your session…` : `Waiting for ${agentName} to start…`}
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={`${msg.ts}-${idx}`} className={`rp-msg rp-msg--${msg.role} ${msg.isEval ? 'rp-msg--eval-row' : ''}`}>
            {msg.role === 'agent' && !msg.isEval && (
              <div className="rp-msg-avatar">{agentName.toUpperCase()}</div>
            )}
            <div className={msg.isEval ? 'rp-msg-eval-wrapper' : 'rp-msg-body'}>
              {msg.isEval ? (
                msg.evalData
                  ? <EvaluationReport data={msg.evalData} />
                  : <div className="rp-msg-bubble"><FormattedMessage text={msg.content} /></div>
              ) : msg.role === 'agent' ? (
                <div className="rp-msg-bubble"><FormattedMessage text={msg.content} /></div>
              ) : (
                <div className="rp-msg-bubble">{msg.content}</div>
              )}
              {!msg.isEval && (
                <div className="rp-msg-time">
                  {new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Thinking indicator */}
        {loading && messages.length > 0 && (
          <div className="rp-msg rp-msg--agent">
            <div className="rp-msg-avatar">{agentName.toUpperCase()}</div>
            <div className="rp-msg-body">
              <div className="rp-msg-bubble rp-msg-bubble--typing">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Bottom Bar ───────────────────────────────────────────────────────── */}
      <div className="rp-bottombar">

        {/* Live transcript strip — only while actively listening */}
        {listening && (
          <div className="rp-transcript">
            <FiMic size={13} className="flex-shrink-0" />
            <span>{transcript ? `"${transcript.slice(0, 120)}${transcript.length > 120 ? '…' : ''}"` : 'Listening…'}</span>
          </div>
        )}

        <div className="rp-bottombar-inner">
          {/* Left status area */}
          <div className="rp-bottom-status">
            {(speaking || listening) && <Waveform active={speaking || listening} bars={5} />}
            {loading && !speaking && (
              <div className="rp-thinking-dots">
                <span /><span /><span />
              </div>
            )}
          </div>

          {/* Central action button — play to start, mic during session */}
          <div
            className={`rp-mic-btn rp-mic-btn--${isReadyState ? 'ready' : activityMode}`}
            onClick={isReadyState ? handleReady : undefined}
            title={isReadyState ? "Click to start practice" : undefined}
          >
            {isReadyState
              ? <FiPlay size={26} />
              : listening
              ? <FiMic size={26} />
              : speaking
              ? <FiVolume2 size={26} />
              : loading
              ? <Spinner animation="border" size="sm" style={{ width: 22, height: 22 }} />
              : <FiMic size={26} />}
          </div>

          {/* Right — mute label */}
          <div className="rp-bottom-right">
            {isMuted && <span className="rp-muted-badge"><FiVolumeX size={12} /> Muted</span>}
          </div>
        </div>

      </div>

    </div>
  );
}
