import { useState, useMemo } from 'react';
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { getAllTopics } from '../../content/loansModule';
import { MODULES_CONFIG } from '../../content/modulesConfig';
import { useLessonStore } from '../../store/userStore';
import TopicCard from './TopicCard';

const TOPIC_POINTS = {
  what_is_loan:       20,
  types_of_loans:     20,
  home_loan_overview: 20,
  eligibility_criteria: 25,
  emi_calculation:    20,
  documentation_kyc:  20,
  loan_processing:    25,
  disbursement:       20,
  repayment_foreclosure: 20,
  tax_benefits:       20,
  module_assessment:  60,
};

const FILTER_TABS = [
  { id: 'all',                  label: 'All' },
  { id: 'lesson',               label: 'Lessons' },
  { id: 'lesson_with_progress', label: 'Deep Dives' },
  { id: 'cards',                label: 'Card Sets' },
  { id: 'knowledge_test',       label: 'Quizzes' },
];

export default function ModuleTopicsView({ moduleId, onBack, onOpenTopic }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const topics = useMemo(() => getAllTopics(), []);
  const submissions = useLessonStore((s) => s.submissions);

  const moduleConfig = MODULES_CONFIG.find((m) => m.id === moduleId);
  const completedIds = new Set(Object.keys(submissions));
  const completedCount = topics.filter((t) => completedIds.has(t.id)).length;

  const filtered = activeFilter === 'all'
    ? topics
    : topics.filter((t) => t.type === activeFilter);

  return (
    <div className="mtv-shell">
      {/* Header */}
      <div className="mtv-header">
        <button className="mtv-back-btn" onClick={onBack}>
          <FiArrowLeft size={16} />
          All Modules
        </button>

        <div className="mtv-module-info">
          <div className="mtv-module-title">
            {moduleConfig?.icon && <moduleConfig.icon size={20} color={moduleConfig.color} />}
            {moduleConfig?.title || 'Module Topics'}
          </div>
          <div className="mtv-module-meta">
            <span className="mtv-chip" style={{ background: moduleConfig?.bg, color: moduleConfig?.color }}>
              M{moduleConfig?.number} · {moduleConfig?.tags?.[1] || 'Beginner'}
            </span>
            <span className="mtv-chip mtv-chip--gray">
              <FiCheckCircle size={12} /> {completedCount} / {topics.length} done
            </span>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mtv-tabs">
        {FILTER_TABS.map(({ id, label }) => (
          <button
            key={id}
            className={`mtv-tab ${activeFilter === id ? 'mtv-tab--active' : ''}`}
            onClick={() => setActiveFilter(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Topic cards grid */}
      <div className="lh-grid">
        {filtered.map((topic) => {
          const globalIdx = topics.findIndex((t) => t.id === topic.id);
          return (
            <TopicCard
              key={topic.id}
              topic={topic}
              points={TOPIC_POINTS[topic.id] ?? 20}
              isCompleted={completedIds.has(topic.id)}
              topicIndex={globalIdx}
              onClick={() => onOpenTopic(globalIdx)}
            />
          );
        })}
      </div>
    </div>
  );
}
