/**
 * Dev Test Panel — only shown in development (import.meta.env.DEV)
 */
import { useState } from 'react';
import { FiMinus, FiMaximize2 } from 'react-icons/fi';
import { useLessonStore } from '../../store/userStore';
import { getAllTopics } from '../../content/loansModule';

const PROGRESS_SCENARIOS = [
  { label: '0 Topics (Fresh)', count: 0 },
  { label: '3 Topics Done (27%)', count: 3 },
  { label: '6 Topics Done (55%) → M2 unlocks', count: 6 },
  { label: '11 Topics Done (100%) → M3/M4/M7 unlock', count: 11 },
];

export default function DevTestPanel() {
  if (!import.meta.env.DEV) return null;

  const recordSubmission = useLessonStore((s) => s.recordSubmission);
  const recordScore      = useLessonStore((s) => s.recordScore);
  const reset            = useLessonStore((s) => s.reset);
  const submissions      = useLessonStore((s) => s.submissions);
  const topics           = getAllTopics();

  const [minimized, setMinimized] = useState(false);
  const [unlockAll, setUnlockAll] = useState(
    () => localStorage.getItem('__dev_unlock_all') === 'true'
  );

  const doneCount = Object.keys(submissions).length;

  const applyProgress = (count) => {
    // Clear all store state first
    reset();
    if (count === 0) return;
    // Add submissions for first N topics
    topics.slice(0, count).forEach((t) => {
      recordSubmission(t.id, { isCorrect: true, pointsEarned: 20, timestamp: Date.now() });
      recordScore(t.id, 80);
    });
  };

  const toggleUnlockAll = () => {
    const next = !unlockAll;
    setUnlockAll(next);
    localStorage.setItem('__dev_unlock_all', next ? 'true' : 'false');
    // Force re-render by nudging the store
    reset();
  };

  const btnStyle = (active) => ({
    background: active ? '#1d4ed8' : '#334155',
    border: active ? '1px solid #3b82f6' : 'none',
    borderRadius: 7,
    color: '#e2e8f0',
    padding: '5px 10px',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: 11,
    fontWeight: 500,
    width: '100%',
  });

  return (
    <div style={{
      position: 'fixed',
      bottom: 80,
      right: 16,
      background: '#1e293b',
      color: '#e2e8f0',
      border: '1px solid #334155',
      borderRadius: 12,
      zIndex: 9999,
      fontSize: 12,
      width: minimized ? 'auto' : 230,
      boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
      overflow: 'hidden',
    }}>
      {/* Header — always visible */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        cursor: 'pointer',
        borderBottom: minimized ? 'none' : '1px solid #334155',
        gap: 8,
      }}>
        <span style={{ fontWeight: 700, color: '#facc15', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
          🛠 DEV Panel
        </span>
        <button
          onClick={() => setMinimized((v) => !v)}
          title={minimized ? 'Maximize' : 'Minimize'}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '2px 4px',
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          {minimized ? <FiMaximize2 size={13} /> : <FiMinus size={13} />}
        </button>
      </div>

      {/* Body — hidden when minimized */}
      {!minimized && (
        <div style={{ padding: '10px 14px' }}>
          <div style={{ marginBottom: 8, color: '#94a3b8' }}>
            Topics done: <strong style={{ color: '#fff' }}>{doneCount} / {topics.length}</strong>
          </div>

          {/* Unlock All toggle */}
          <button
            onClick={toggleUnlockAll}
            style={{
              ...btnStyle(unlockAll),
              background: unlockAll ? '#166534' : '#334155',
              border: unlockAll ? '1px solid #22c55e' : 'none',
              marginBottom: 8,
              color: unlockAll ? '#86efac' : '#e2e8f0',
            }}
          >
            {unlockAll ? '🔓 All Modules Unlocked (click to lock)' : '🔒 Unlock All Modules'}
          </button>

          <div style={{ color: '#64748b', fontSize: 10, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Module 1 Progress
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {PROGRESS_SCENARIOS.map((s) => (
              <button
                key={s.label}
                onClick={() => applyProgress(s.count)}
                style={btnStyle(doneCount === s.count)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
