import InfoTooltip from "./InfoTooltip";



function ConstraintsSection() {
  const accessibilityOptions = ["Easy", "Moderate", "Difficult"];
  const participantOptions = ["< 10", "10-30", "30-100", "100+"];
  const timeOptions = ["1 week", "1-2 weeks", "1 month", "3+ months"];
  const extraConstraints = ["Technical limitation", "Sensitive population"];

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
            {accessibilityOptions.map((option, index) => (
              <label key={index} className="constraint-option">
                <input type="radio" name="accessibility" />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="constraint-group">
          <h3>How many participants can you recruit?</h3>
          <div className="constraint-options-row">
            {participantOptions.map((option, index) => (
              <label key={index} className="constraint-option">
                <input type="radio" name="participants" />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="constraint-group">
          <h3>How much time do you have?</h3>
          <div className="constraint-options-row">
            {timeOptions.map((option, index) => (
              <label key={index} className="constraint-option">
                <input type="radio" name="time" />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="constraint-group">
          <h3>Technical and ethical constraints</h3>
          <div className="constraint-options-column">
            {extraConstraints.map((option, index) => (
              <label key={index} className="constraint-option">
                <input type="checkbox" />
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