import { useMemo } from 'react';
import { Card, ProgressBar, Badge, Row, Col, Button } from 'react-bootstrap';
import { FiTrendingUp, FiBarChart2, FiRotateCw, FiAward, FiMic, FiUser, FiBook } from 'react-icons/fi';
import { useLessonStore } from '../../store/userStore';
import { getAllTopics } from '../../content/loansModule';

/**
 * Performance bands per FRD Section 9
 */
const BANDS = [
  { min: 85, label: 'Expert',      color: 'success', meaning: 'You are ready to engage real BFSI customers with confidence.' },
  { min: 70, label: 'Proficient',  color: 'info',    meaning: 'Good understanding with minor gaps to address.' },
  { min: 50, label: 'Developing',  color: 'warning', meaning: 'Building the right foundation — keep practising.' },
  { min: 0,  label: 'Beginner',    color: 'danger',  meaning: 'Revisit the modules and take the quizzes again.' },
];

function getBand(score) {
  return BANDS.find((b) => score >= b.min) || BANDS[BANDS.length - 1];
}

/**
 * FRD Formula:
 * Score = (0.40 × Assessment) + (0.35 × ModuleCompletion) + (0.15 × Voice) + (0.10 × Profile)
 */
function computeScore({ assessmentPct, completionPct, voicePct, profilePct }) {
  const raw = 0.40 * assessmentPct + 0.35 * completionPct + 0.15 * voicePct + 0.10 * profilePct;
  return Math.round(Math.min(100, Math.max(0, raw)));
}

const COMPONENTS = [
  { key: 'assessment',  label: 'Assessment Scores', weight: 40, icon: FiBarChart2, color: '#3b82f6' },
  { key: 'completion',  label: 'Module Completion',  weight: 35, icon: FiBook,     color: '#10b981' },
  { key: 'voice',       label: 'Voice Practice',     weight: 15, icon: FiMic,      color: '#f59e0b' },
  { key: 'profile',     label: 'Profile Completeness', weight: 10, icon: FiUser,  color: '#8b5cf6' },
];

export default function EmployabilityScorecard({ onPracticeAgain, onClose }) {
  const scores      = useLessonStore((s) => s.scores);
  const submissions = useLessonStore((s) => s.submissions);
  const topics      = getAllTopics();

  // Assessment score: average of all quiz percentage scores
  const assessmentPct = useMemo(() => {
    const vals = Object.values(scores).map(Number).filter((v) => !isNaN(v));
    if (!vals.length) return 0;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }, [scores]);

  // Module completion: only count submissions belonging to active module topics
  const completionPct = useMemo(() => {
    const topicIds = new Set(topics.map((t) => t.id));
    const done = Object.keys(submissions).filter((id) => topicIds.has(id)).length;
    return Math.round(Math.min(1, done / topics.length) * 100);
  }, [submissions, topics]);

  // Voice score: session count × 10, capped at 100
  // Voice sessions not yet tracked — read from localStorage as fallback
  const voicePct = useMemo(() => {
    try {
      const sessions = JSON.parse(localStorage.getItem('voice_sessions') || '0');
      return Math.min(100, Number(sessions) * 10);
    } catch { return 0; }
  }, []);

  // Profile completeness: filled fields / 6 total onboarding fields
  const profilePct = useMemo(() => {
    try {
      const profile = JSON.parse(localStorage.getItem('onboarding_profile') || 'null');
      if (!profile) return 0;
      const fields = ['preferred_languages', 'user_type', 'goal', 'industry', 'target_role', 'learning_pace'];
      const filled = fields.filter((f) => {
        const v = profile[f];
        return v && (Array.isArray(v) ? v.length > 0 : v.trim?.() !== '');
      }).length;
      return Math.round((filled / fields.length) * 100);
    } catch { return 0; }
  }, []);

  const componentValues = { assessment: assessmentPct, completion: completionPct, voice: voicePct, profile: profilePct };
  const totalScore = computeScore({ assessmentPct, completionPct, voicePct, profilePct });
  const band = getBand(totalScore);

  return (
    <Card className="border-0 shadow-lg" style={{ borderRadius: '20px', overflow: 'hidden' }}>
      <Card.Header
        className="text-white p-4 text-center"
        style={{ background: 'linear-gradient(135deg, #1f4fd6 0%, #6366f1 100%)' }}
      >
        <div style={{ fontSize: '2.5rem' }} className="mb-2">🏆</div>
        <h3 className="mb-1">Employability Score</h3>
        <p className="mb-0 small opacity-90">Your BFSI career readiness index</p>
      </Card.Header>

      <Card.Body className="p-4 p-lg-5">
        {/* Overall score */}
        <div className="text-center mb-4 p-4 rounded-3 bg-light border border-2 border-primary border-opacity-25">
          <div style={{ fontSize: '3.5rem' }} className="fw-bold text-primary mb-2">{totalScore}%</div>
          <Badge
            bg={band.color}
            className="mb-3 fs-6 py-2 px-3 d-inline-flex align-items-center gap-2"
          >
            <FiAward size={16} /> {band.label}
          </Badge>
          <p className="text-muted small mt-2 mb-0">{band.meaning}</p>
        </div>

        {/* Overall bar */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <small className="fw-semibold d-flex align-items-center gap-1 text-primary">
              <FiTrendingUp size={15} /> Overall Progress
            </small>
            <small className="fw-bold text-primary">{totalScore}%</small>
          </div>
          <ProgressBar
            now={totalScore}
            variant={band.color}
            className="rounded-pill"
            style={{ height: '12px' }}
          />
        </div>

        {/* 4-component breakdown — FRD formula */}
        <div className="mb-4">
          <h6 className="mb-3 d-flex align-items-center gap-2 fw-bold text-primary">
            <FiBarChart2 size={18} /> Score Breakdown
          </h6>
          <Row className="g-3">
            {COMPONENTS.map(({ key, label, weight, icon: Icon, color }) => {
              const pct = componentValues[key];
              const isExcellent = pct >= 80;
              const isGood = pct >= 60;
              const bgColor = isExcellent
                ? 'rgba(16, 185, 129, 0.07)'
                : isGood
                  ? 'rgba(245, 158, 11, 0.07)'
                  : 'transparent';

              return (
                <Col key={key} xs={12} md={6}>
                  <Card className="border-0 shadow-sm h-100 rounded-3" style={{ backgroundColor: bgColor }}>
                    <Card.Body className="p-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <Icon size={15} style={{ color }} />
                          <div>
                            <div className="fw-semibold small">{label}</div>
                            <div className="text-muted" style={{ fontSize: '0.7rem' }}>{weight}% weight</div>
                          </div>
                        </div>
                        <Badge bg={isExcellent ? 'success' : isGood ? 'warning' : 'secondary'} className="ms-2">
                          {pct}%
                        </Badge>
                      </div>
                      <ProgressBar
                        now={pct}
                        className="rounded-pill"
                        style={{ height: '7px', '--bs-progress-bar-bg': color }}
                        variant={isExcellent ? 'success' : isGood ? 'warning' : 'secondary'}
                      />
                      {isExcellent && (
                        <div className="mt-1 text-success fw-semibold" style={{ fontSize: '0.7rem' }}>✓ Excellent</div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>

        {/* Action buttons */}
        <div className="d-flex gap-2 mt-4 flex-wrap justify-content-center">
          {onPracticeAgain && (
            <Button
              variant="primary"
              onClick={onPracticeAgain}
              className="d-flex align-items-center gap-2"
              style={{ borderRadius: '12px' }}
            >
              <FiRotateCw size={16} /> Practice Again
            </Button>
          )}
          {onClose && (
            <Button
              variant="outline-secondary"
              onClick={onClose}
              className="d-flex align-items-center gap-2"
              style={{ borderRadius: '12px' }}
            >
              Back to Dashboard
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}
