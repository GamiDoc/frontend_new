function Stepper({ currentStep }) {
  const steps = [
    "Evaluation Planning",
    "Method Selection",
    "Instrument Selection",
    "Evaluation"
  ];

  return (
    <div className="stepper-simple">
      <div className="stepper-box">
        <div className="stepper-labels">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = currentStep === stepNumber;

            return (
              <div
                key={index}
                className={`step-item ${isActive ? "active" : ""}`}
              >
                <div className="step-number">{stepNumber}</div>
                <span className="step-text">{step}</span>
              </div>
            );
          })}
        </div>

        <div className="stepper-line">
          <div
            className="stepper-progress"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default Stepper;