export default function EvaluationReport({ data }) {
  if (!data) return null;

  const { session, subtitle, totalScore, maxScore, percentage, performanceLevel, categories = [], analysis } = data;

  const levelColor = {
    Excellent: '#16a34a',
    Good: '#2563eb',
    Average: '#d97706',
    Poor: '#dc2626',
  }[performanceLevel] ?? '#6b7280';

  return (
    <div className="eval-report">

      {/* ── Header ── */}
      <div className="eval-header">
        <div className="eval-header-left">
          <h2 className="eval-title">Performance Report</h2>
          {subtitle && <p className="eval-subtitle">{subtitle}</p>}
        </div>
        <div className="eval-header-right">
          <span className="eval-total-score">{totalScore}/{maxScore}</span>
          <span className="eval-pct">{percentage}%</span>
        </div>
      </div>

      {/* ── Level badge ── */}
      <div className="eval-level-row">
        <span className="eval-level-badge" style={{ background: levelColor }}>
          {performanceLevel}
        </span>
        <span className="eval-session-tag">{session}</span>
      </div>

      {/* ── Category cards ── */}
      <div className="eval-categories">
        {categories.map((cat, i) => (
          <div key={i} className="eval-cat-card">
            <div className="eval-cat-header">
              <span className="eval-cat-name">{cat.name}</span>
              <span className="eval-cat-score">{cat.score}/{cat.maxScore}</span>
            </div>

            <div className="eval-items">
              {(cat.items ?? []).map((item, j) => (
                <div key={j} className="eval-item">
                  <span className={`eval-item-icon ${item.passed ? 'eval-item-icon--pass' : 'eval-item-icon--fail'}`}>
                    {item.passed ? '✓' : '✗'}
                  </span>
                  <div className="eval-item-body">
                    <p className="eval-item-question">{item.question}</p>
                    {item.feedback && (
                      <p className="eval-item-feedback">💡 {item.feedback}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Analysis ── */}
      {analysis && (
        <div className="eval-analysis">
          <h3 className="eval-analysis-title">Overall Analysis</h3>
          <p className="eval-analysis-text">{analysis}</p>
        </div>
      )}

    </div>
  );
}
