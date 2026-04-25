import { FiBook, FiLayers, FiCheckSquare, FiTrendingUp, FiClock, FiCheck } from 'react-icons/fi';

const TYPE_META = {
  lesson:               { icon: FiBook,        color: '#3b82f6', bg: '#eff6ff', label: 'Lesson' },
  cards:                { icon: FiLayers,       color: '#8b5cf6', bg: '#f5f3ff', label: 'Cards' },
  knowledge_test:       { icon: FiCheckSquare,  color: '#10b981', bg: '#f0fdf4', label: 'Quiz' },
  lesson_with_progress: { icon: FiTrendingUp,   color: '#f59e0b', bg: '#fffbeb', label: 'Deep Dive' },
};

function DifficultyDots({ level }) {
  const colors = ['#10b981', '#f59e0b', '#ef4444'];
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {[1, 2, 3].map((d) => (
        <span
          key={d}
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: d <= level ? colors[level - 1] : '#e5e7eb',
            display: 'inline-block',
          }}
        />
      ))}
    </div>
  );
}

export default function TopicCard({ topic, points, isCompleted, onClick, topicIndex }) {
  const meta = TYPE_META[topic.type] || TYPE_META.lesson;
  const Icon = meta.icon;

  // Difficulty: 1 for topics 1-4, 2 for 5-8, 3 for 9+
  const difficulty = topic.number <= 4 ? 1 : topic.number <= 8 ? 2 : 3;

  // Short description from content
  const desc = topic.content
    ? topic.content.replace(/\n/g, ' ').slice(0, 72) + '…'
    : `${meta.label} — Topic ${topic.number}`;

  return (
    <div
      className={`topic-card ${isCompleted ? 'topic-card--done' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      {/* Icon header */}
      <div className="tc-icon-wrap" style={{ background: meta.bg }}>
        <Icon size={22} color={meta.color} />
        {isCompleted && (
          <span className="tc-done-badge">
            <FiCheck size={10} />
          </span>
        )}
      </div>

      {/* Body */}
      <div className="tc-body">
        <div className="tc-type-label" style={{ color: meta.color }}>{meta.label}</div>
        <div className="tc-title">{topic.title}</div>
        <div className="tc-desc">{desc}</div>
      </div>

      {/* Footer */}
      <div className="tc-footer">
        <DifficultyDots level={difficulty} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {topic.estimatedMinutes && (
            <span className="tc-min">
              <FiClock size={11} /> {topic.estimatedMinutes}m
            </span>
          )}
          <span className="tc-pts">{points} pts</span>
        </div>
      </div>
    </div>
  );
}
