import InfoTooltip from "./InfoTooltip";

const ACCESSIBILITY_OPTIONS = ["Easy", "Moderate", "Difficult"];
const PARTICIPANT_OPTIONS = ["< 10", "10-30", "30-100", "100+"];
const TIME_OPTIONS = ["1 week", "1-2 weeks", "1 month", "3+ months"];
const EXTRA_CONSTRAINTS = ["Technical limitation", "Sensitive population"];

const CONSTRAINTS_INFO = {
  title: "Evaluation Constraints",
  intro: "Constraints are practical limitations that shape which evaluation methods are feasible for your study. Identifying them early prevents selecting methods that cannot be realistically executed.",
  items: [
    { name: "Participant access", desc: "The ease of reaching your target users determines whether lab studies, remote sessions, or self-administered instruments are realistic. Difficult-to-access populations (e.g., clinical users, children, domain experts) require adapted recruitment strategies." },
    { name: "Sample size", desc: "The number of participants directly affects statistical reliability. Fewer than 10 participants suits qualitative methods like interviews or think-aloud; 30 or more enables quantitative analyses with validated questionnaires." },
    { name: "Time", desc: "Study duration constrains the depth of data you can collect. Short windows (1 week) suit quick usability tests; longitudinal designs (3+ months) are needed to capture behavioral change or learning effects over time." },
    { name: "Technical and ethical constraints", desc: "Sensitive populations (e.g., minors, patients) require additional ethical approval and limit data collection approaches. Technical limitations may restrict logging, screen recording, or the use of specific instruments." },
  ],
};

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
          <InfoTooltip
            text="Practical constraints — participants, time, and ethics — shape which evaluation methods are feasible for your study."
            learnMore={CONSTRAINTS_INFO}
          />
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
