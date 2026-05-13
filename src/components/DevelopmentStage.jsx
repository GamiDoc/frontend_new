import InfoTooltip from "./InfoTooltip";

const STAGES = [
  "Concept / idea",
  "Low-fidelity prototype",
  "High-fidelity prototype",
  "Deployed system",
];

function DevelopmentStage({ value = '', onChange }) {
  return (
    <section className="development-stage-section">
      <div className="development-stage-box">
        <h2 className="section-title">
          Development Stage
          <InfoTooltip text="Select the current maturity level of your system." />
        </h2>
        <p className="section-description">
          What is the current stage of the system?
        </p>

        <div className="development-stage-grid">
          {STAGES.map((stage, index) => (
            <label key={index} className="development-option">
              <input
                type="radio"
                name="developmentStage"
                checked={value === stage}
                onChange={() => onChange && onChange(stage)}
              />
              <span>{stage}</span>
            </label>
          ))}
        </div>
      </div>
    </section>
  );
}

export default DevelopmentStage;
