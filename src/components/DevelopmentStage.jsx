import InfoTooltip from "./InfoTooltip";

const STAGES = [
  "Concept / idea",
  "Low-fidelity prototype",
  "High-fidelity prototype",
  "Deployed system",
];

const DEVELOPMENT_STAGE_INFO = {
  title: "Development Stage",
  intro: "The development stage defines how mature your gamified system is. It directly shapes which evaluation methods are meaningful and feasible — different stages call for different approaches.",
  items: [
    { name: "Concept / Idea", desc: "Early exploration phase. Expert reviews, personas, and interviews are ideal for validating assumptions before any resource is committed to building." },
    { name: "Low-fidelity prototype", desc: "Paper sketches or simple wireframes. Think-aloud sessions and focus groups can surface usability issues at very low cost." },
    { name: "High-fidelity prototype", desc: "Interactive, near-final interfaces. Structured usability tests and validated questionnaires become applicable for the first time." },
    { name: "Deployed system", desc: "Live product with real users. Longitudinal methods like diary studies, surveys, and behavioral analytics capture actual usage patterns and satisfaction over time." },
  ],
};

function DevelopmentStage({ value = '', onChange, hasError }) {
  return (
    <section className="development-stage-section">
      <div className={`development-stage-box${hasError ? ' section--error' : ''}`}>
        <h2 className="section-title">
          Development Stage
          <InfoTooltip
            text="The development stage defines how mature your system is and determines which evaluation methods are appropriate."
            learnMore={DEVELOPMENT_STAGE_INFO}
          />
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

        {hasError && (
          <p className="field-error">Select a development stage.</p>
        )}
      </div>
    </section>
  );
}

export default DevelopmentStage;
