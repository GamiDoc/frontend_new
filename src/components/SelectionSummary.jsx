function SelectionSummary({ goals, developmentStage, constraints }) {
  return (
    <section className="selection-summary-section">
      <div className="selection-summary-box">
        <div className="selection-summary-header">
          <span className="selection-summary-arrow">⌄</span>
          <h3>Summary of Your Previous Selections</h3>
        </div>

        <div className="selection-summary-content">
          <div className="selection-summary-row">
            <div className="selection-summary-label">
              <span className="selection-summary-icon">◎</span>
              <span>Evaluation goals:</span>
            </div>

            <div className="selection-summary-value">
              {goals.map((goal, index) => (
                <span key={index} className="summary-tag">
                  {goal}
                </span>
              ))}
            </div>
          </div>

          <div className="selection-summary-row">
            <div className="selection-summary-label">
              <span className="selection-summary-icon">▦</span>
              <span>Development stage:</span>
            </div>

            <div className="selection-summary-value">
              <span>{developmentStage}</span>
            </div>
          </div>

          <div className="selection-summary-row">
            <div className="selection-summary-label">
              <span className="selection-summary-icon">◔</span>
              <span>Constraints:</span>
            </div>

            <div className="selection-summary-value">
              <span>{constraints.join(", ")}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SelectionSummary;