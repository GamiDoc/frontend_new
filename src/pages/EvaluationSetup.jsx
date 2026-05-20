import { useState } from 'react';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Stepper from "../components/Stepper";
import EvaluationGoals from "../components/EvaluationGoals";
import DevelopmentStage from "../components/DevelopmentStage";
import ConstraintsSection from "../components/ConstraintsSection";
import ResearchSpecification from "../components/ResearchSpecification";
import NavigationButtons from "../components/NavigationButtons";
import { useWizard } from "../context/WizardContext";

function EvaluationSetup({ onOpenLogin, onOpenSignup }) {
  const { step1Data, setStep1Data, submitStep1, setPage, loading, error } = useWizard();
  const [errors, setErrors] = useState({});

  function update(field, value) {
    setStep1Data((prev) => ({ ...prev, [field]: value }));
    // Clear the error for this field as soon as user interacts
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: false }));
  }

  function handleNext() {
    const newErrors = {
      evaluationGoals: step1Data.evaluationGoals.length === 0,
      projectType:     !step1Data.projectType.trim(),
      participants:    !step1Data.participants,
      developmentStage: !step1Data.developmentStage,
    };

    if (Object.values(newErrors).some(Boolean)) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    submitStep1();
  }

  const navError = Object.values(errors).some(Boolean)
    ? 'Complete the highlighted fields to continue.'
    : null;

  return (
    <div>
      <Navbar onLogin={onOpenLogin} onSignup={onOpenSignup} />

      <section className="evaluation-header">
        <div className="container evaluation-header-inner">
          <h1>Evaluation & UX Methods</h1>
          <p>Follow these steps to create evaluation</p>
        </div>
      </section>

      <Stepper currentStep={1} />

      <main>
        <section className="evaluation-goals-section">
          <div className={`evaluation-goals-box${errors.projectType ? ' section--error' : ''}`}>
            <h2>Project Type</h2>
            <p className="section-description">
              Briefly describe the type of gamified system you are evaluating.
            </p>
            <input
              className={`project-type-input${errors.projectType ? ' input--error' : ''}`}
              type="text"
              placeholder="e.g. Educational game, Health app, E-commerce platform"
              value={step1Data.projectType}
              onChange={(e) => update('projectType', e.target.value)}
            />
            {errors.projectType && (
              <p className="field-error">Describe the project type.</p>
            )}
          </div>
        </section>

        <EvaluationGoals
          value={step1Data.evaluationGoals}
          onChange={(goals) => update('evaluationGoals', goals)}
          hasError={errors.evaluationGoals}
        />

        <DevelopmentStage
          value={step1Data.developmentStage}
          onChange={(stage) => update('developmentStage', stage)}
          hasError={errors.developmentStage}
        />

        <ConstraintsSection
          participants={step1Data.participants}
          onParticipantsChange={(v) => update('participants', v)}
          accessibility={step1Data.accessibility}
          onAccessibilityChange={(v) => update('accessibility', v)}
          time={step1Data.time}
          onTimeChange={(v) => update('time', v)}
          extraConstraints={step1Data.extraConstraints}
          onExtraConstraintsChange={(v) => update('extraConstraints', v)}
          hasParticipantsError={errors.participants}
        />

        <ResearchSpecification
          enabled={step1Data.researchEnabled}
          onEnabledChange={(v) => update('researchEnabled', v)}
          objective={step1Data.researchObjective}
          onObjectiveChange={(v) => update('researchObjective', v)}
          researchQuestions={step1Data.researchQuestions}
          onResearchQuestionsChange={(v) => update('researchQuestions', v)}
          hypotheses={step1Data.hypotheses}
          onHypothesesChange={(v) => update('hypotheses', v)}
        />

        {error && <div className="wizard-error">{error}</div>}

        <NavigationButtons
          onBack={() => setPage('landing')}
          onNext={handleNext}
          nextLabel={loading ? 'Saving…' : 'Go to Methods'}
          error={navError}
        />
      </main>

      <Footer />
    </div>
  );
}

export default EvaluationSetup;
