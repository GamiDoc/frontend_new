import ALL_INSTRUMENTS from '../data/instruments';

/* R4 — a coverage checklist: for every evaluation goal the user declared in
   step 1, show whether the current instrument selection actually measures it,
   and name a candidate when it does not. */
function GoalCoverage({ userGoals = [], selectedInstruments = [], selectedMethodIds = [], onAdd }) {
  if (userGoals.length === 0) return null;

  const selected = selectedInstruments
    .map((name) => ALL_INSTRUMENTS.find((i) => i.name === name))
    .filter(Boolean);

  const rows = userGoals.map((goal) => {
    const covering = selected.filter((i) => (i.coversGoals || []).includes(goal));
    const suggestion = covering.length > 0
      ? null
      : ALL_INSTRUMENTS.find((i) =>
          (i.coversGoals || []).includes(goal) &&
          (selectedMethodIds.length === 0 || i.forMethodIds.some((m) => selectedMethodIds.includes(m)))
        );
    return { goal, covering, suggestion };
  });

  const coveredCount = rows.filter((r) => r.covering.length > 0).length;

  return (
    <section className="coverage-section">
      <div className="coverage-box">
        <div className="coverage-header">
          <h3>Goal coverage</h3>
          <span className={`coverage-score${coveredCount === rows.length ? ' coverage-score--full' : ''}`}>
            {coveredCount} of {rows.length} goals measured
          </span>
        </div>
        <p>
          Your current selection is checked against the evaluation goals you defined in
          step 1. Uncovered goals will have no data behind them in the final plan.
        </p>

        <ul className="coverage-list">
          {rows.map(({ goal, covering, suggestion }) => (
            <li key={goal} className={`coverage-row${covering.length > 0 ? ' coverage-row--ok' : ' coverage-row--gap'}`}>
              <span className="coverage-mark">{covering.length > 0 ? '✓' : '!'}</span>
              <span className="coverage-goal">{goal}</span>
              {covering.length > 0 ? (
                <span className="coverage-detail">{covering.map((i) => i.name).join(', ')}</span>
              ) : suggestion ? (
                <span className="coverage-detail">
                  Not measured —{' '}
                  <button className="coverage-add-btn" onClick={() => onAdd(suggestion.name)}>
                    add {suggestion.name}
                  </button>
                </span>
              ) : (
                <span className="coverage-detail">
                  Not measured — no catalog instrument matches your selected methods.
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default GoalCoverage;
