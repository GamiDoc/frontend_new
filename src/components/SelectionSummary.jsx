import { useState } from 'react';

function SelectionSummary({ goals, developmentStage, constraints, selectedMethods }) {
  const [open, setOpen] = useState(true);

  return (
    <section className="selection-summary-section">
      <div className="selection-summary-box">
        <div className="selection-summary-header" onClick={() => setOpen((v) => !v)} style={{ cursor: 'pointer' }}>
          <span className="selection-summary-arrow">{open ? '⌄' : '›'}</span>
          <h3>Summary of Your Previous Selections</h3>
        </div>

        {open && (
          <div className="selection-summary-content">
            <div className="selection-summary-row">
              <div className="selection-summary-label">
                <span className="selection-summary-icon">◎</span>
                <span>Evaluation goals:</span>
              </div>
              <div className="selection-summary-value">
                {(goals || []).map((goal, i) => <span key={i} className="summary-tag">{goal}</span>)}
              </div>
            </div>

            <div className="selection-summary-row">
              <div className="selection-summary-label">
                <span className="selection-summary-icon">▦</span>
                <span>Development stage:</span>
              </div>
              <div className="selection-summary-value">
                <span>{developmentStage || '—'}</span>
              </div>
            </div>

            <div className="selection-summary-row">
              <div className="selection-summary-label">
                <span className="selection-summary-icon">◔</span>
                <span>Constraints:</span>
              </div>
              <div className="selection-summary-value">
                <span>{(constraints || []).filter(Boolean).join(', ') || '—'}</span>
              </div>
            </div>

            {selectedMethods && selectedMethods.length > 0 && (
              <div className="selection-summary-row">
                <div className="selection-summary-label">
                  <span className="selection-summary-icon">⬡</span>
                  <span>Selected methods:</span>
                </div>
                <div className="selection-summary-value" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                  {selectedMethods.map((m, i) => (
                    <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: '#4caf50' }}>✓</span> {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default SelectionSummary;
