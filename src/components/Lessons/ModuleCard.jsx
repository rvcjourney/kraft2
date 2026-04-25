import { FiLock, FiChevronRight, FiClock, FiStar } from 'react-icons/fi';

export default function ModuleCard({ module, isUnlocked, completion, unlockHint, onClick }) {
  const Icon = module.icon;
  const completionPct = Math.round(completion * 100);
  const isStarted = completion > 0;

  return (
    <div
      className={`mc-card ${!isUnlocked ? 'mc-card--locked' : ''}`}
      onClick={isUnlocked ? onClick : undefined}
      role={isUnlocked ? 'button' : undefined}
      tabIndex={isUnlocked ? 0 : undefined}
      onKeyDown={(e) => isUnlocked && e.key === 'Enter' && onClick?.()}
    >
      {/* Lock overlay */}
      {!isUnlocked && (
        <div className="mc-lock-overlay">
          <FiLock size={22} />
          <span>{unlockHint}</span>
        </div>
      )}

      {/* Header: number badge + icon */}
      <div className="mc-header">
        <div className="mc-icon-wrap" style={{ background: module.bg, color: module.color }}>
          <Icon size={22} />
        </div>
        <div className="mc-number">M{module.number}</div>
      </div>

      {/* Body */}
      <div className="mc-body">
        <div className="mc-title">{module.title}</div>
        <div className="mc-subtitle">{module.subtitle}</div>

        {/* Tags */}
        <div className="mc-tags">
          {module.tags.map((tag) => (
            <span key={tag} className="mc-tag">{tag}</span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="mc-stats">
        <span><FiStar size={12} /> {module.totalPoints} pts</span>
        <span><FiClock size={12} /> {module.estimatedHours}</span>
        <span>{module.totalTopics} topics</span>
      </div>

      {/* Progress (if started) */}
      {isUnlocked && isStarted && (
        <div className="mc-progress">
          <div className="mc-progress-bar">
            <div
              className="mc-progress-fill"
              style={{ width: `${completionPct}%`, background: module.color }}
            />
          </div>
          <span className="mc-progress-label">{completionPct}% complete</span>
        </div>
      )}

      {/* CTA row */}
      {isUnlocked && (
        <div className="mc-cta" style={{ color: module.color }}>
          <span>{isStarted ? 'Continue' : 'Start Module'}</span>
          <FiChevronRight size={16} />
        </div>
      )}
    </div>
  );
}
