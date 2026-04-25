import { useMemo } from 'react';
import { FiStar } from 'react-icons/fi';
import { MODULES_CONFIG } from '../../content/modulesConfig';
import { useLessonStore } from '../../store/userStore';
import { isModuleUnlocked, getModuleCompletion, getUnlockHint } from '../../utils/moduleProgress';
import ModuleCard from './ModuleCard';
import './LessonsHome.css';
import './ModuleCard.css';

export default function LessonsHome({ onOpenModule, userEmail }) {
  const submissions = useLessonStore((s) => s.submissions);
  const lessonScores = useLessonStore((s) => s.scores);

  // Total points earned across all submissions
  const totalPoints = useMemo(() => {
    return Object.values(lessonScores).reduce((sum, s) => sum + (Number(s) || 0), 0);
  }, [lessonScores]);

  const displayName = userEmail
    ? userEmail.split('@')[0].replace(/[._]/g, ' ')
    : 'there';

  return (
    <div className="lh-shell">
      {/* Welcome Header */}
      <div className="lh-header">
        <div>
          <h1 className="lh-welcome">
            Welcome back, <span className="lh-name">{displayName}</span>!
          </h1>
          <p className="lh-sub">Your BFSI learning path — 7 modules to career readiness.</p>
        </div>
        <div className="lh-points-badge">
          <span className="lh-points-icon">🏆</span>
          <div>
            <div className="lh-points-value">{totalPoints}</div>
            <div className="lh-points-label">Total Points</div>
          </div>
        </div>
      </div>

      {/* Section heading */}
      <div className="lh-section-heading">
        <span>BFSI Learning Path</span>
        <span className="lh-section-count">{MODULES_CONFIG.length} Modules</span>
      </div>

      {/* Module cards grid */}
      <div className="lh-modules-grid">
        {MODULES_CONFIG.map((mod) => {
          const unlocked = isModuleUnlocked(mod, submissions, MODULES_CONFIG);
          const completion = getModuleCompletion(mod.id, submissions, mod.totalTopics);
          const hint = unlocked ? '' : getUnlockHint(mod, MODULES_CONFIG);

          return (
            <ModuleCard
              key={mod.id}
              module={mod}
              isUnlocked={unlocked}
              completion={completion}
              unlockHint={hint}
              onClick={() => onOpenModule(mod.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
