import InfoTooltip from "./InfoTooltip";

const ACCESSIBILITY_OPTIONS = ["Easy", "Moderate", "Difficult"];
const PARTICIPANT_OPTIONS = ["< 10", "10-30", "30-100", "100+"];
const TIME_OPTIONS = ["1 week", "1-2 weeks", "1 month", "3+ months"];
const EXTRA_CONSTRAINTS = ["Technical limitation", "Sensitive population"];

function ConstraintsSection({
  participants = '',
  onParticipantsChange,
  accessibility = '',
  onAccessibilityChange,
  time = '',
  onTimeChange,
  extraConstraints = [],
  onExtraConstraintsChange,
  hasParticipantsError,
}) {
  function toggleExtra(option) {
    if (!onExtraConstraintsChange) return;
    const next = extraConstraints.includes(option)
      ? extraConstraints.filter((c) => c !== option)
      : [...extraConstraints, option];
    onExtraConstraintsChange(next);
  }

  return (
    <section className="constraints-section">
      <div className="constraints-box">
        <h2 className="section-title">
          Constraints
          <InfoTooltip text="Define practical limitations that may affect your evaluation design." />
        </h2>
        <p className="section-description">
          Are there any constraints affecting evaluation?
        </p>

        <div className="constraint-group">
          <h3>How accessible are the end users?</h3>
          <div className="constraint-options-row">
            {ACCESSIBILITY_OPTIONS.map((option, index) => (
              <label key={index} className="constraint-option">
                <input
                  type="radio"
                  name="accessibility"
                  checked={accessibility === option}
                  onChange={() => onAccessibilityChange && onAccessibilityChange(option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div className={`constraint-group${hasParticipantsError ? ' section--error' : ''}`}
             style={hasParticipantsError ? { borderRadius: 8, padding: '12px', marginTop: 28 } : {}}>
          <h3>How many participants can you recruit?</h3>
          <div className="constraint-options-row">
            {PARTICIPANT_OPTIONS.map((option, index) => (
              <label key={index} className="constraint-option">
                <input
                  type="radio"
                  name="participants"
                  checked={participants === option}
                  onChange={() => onParticipantsChange && onParticipantsChange(option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
          {hasParticipantsError && (
            <p className="field-error">Select a participant range.</p>
          )}
        </div>

        <div className="constraint-group">
          <h3>How much time do you have?</h3>
          <div className="constraint-options-row">
            {TIME_OPTIONS.map((option, index) => (
              <label key={index} className="constraint-option">
                <input
                  type="radio"
                  name="time"
                  checked={time === option}
                  onChange={() => onTimeChange && onTimeChange(option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="constraint-group">
          <h3>Technical and ethical constraints</h3>
          <div className="constraint-options-column">
            {EXTRA_CONSTRAINTS.map((option, index) => (
              <label key={index} className="constraint-option">
                <input
                  type="checkbox"
                  checked={extraConstraints.includes(option)}
                  onChange={() => toggleExtra(option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ConstraintsSection;
