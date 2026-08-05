import { useWizard } from '../context/WizardContext';

const STEPS = [
  "Evaluation Planning",
  "Method Selection",
  "Instrument Selection",
  "Evaluation"
];

function Stepper({ currentStep }) {
  const { effectiveMaxStep, navigateToStep } = useWizard();

  return (
    <div className="stepper-simple">
      <div className="stepper-box">
        <div className="stepper-labels">
          {STEPS.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = currentStep === stepNumber;
            // R6 — states read forward: done → current → upcoming.
            const isDone = stepNumber < currentStep && stepNumber <= effectiveMaxStep;
            const isClickable = stepNumber !== currentStep && stepNumber <= effectiveMaxStep;

            const stateClass = isActive ? 'active' : isDone ? 'step-item--done' : 'step-item--upcoming';

            return (
              <div
                key={index}
                className={`step-item ${stateClass}${isClickable ? ' step-item--clickable' : ''}`}
                onClick={isClickable ? () => navigateToStep(stepNumber) : undefined}
                aria-current={isActive ? 'step' : undefined}
                title={isClickable ? `Go to ${step}` : undefined}
              >
                <div className="step-number">{isDone ? '✓' : stepNumber}</div>
                <span className="step-text">{step}</span>
              </div>
            );
          })}
        </div>

        <div className="stepper-line">
          <div
            className="stepper-progress"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          ></div>
        </div>

        <p className="stepper-caption">Step {currentStep} of {STEPS.length} — {STEPS[currentStep - 1]}</p>
      </div>
    </div>
  );
}

export default Stepper;
