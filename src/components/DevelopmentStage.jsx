import InfoTooltip from "./InfoTooltip";

function DevelopmentStage() {
  const stages = [
    "Concept / idea",
    "Low-fidelity prototype",
    "High-fidelity prototype",
    "Deployed system"
  ];

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
          {stages.map((stage, index) => (
            <label key={index} className="development-option">
              <input type="checkbox" />
              <span>{stage}</span>
            </label>
          ))}
        </div>
      </div>
    </section>
  );
}

export default DevelopmentStage;