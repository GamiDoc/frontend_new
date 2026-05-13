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

  function update(field, value) {
    setStep1Data((prev) => ({ ...prev, [field]: value }));
  }

  function handleNext() {
    if (step1Data.evaluationGoals.length === 0) {
      alert('Please select at least one evaluation goal.');
      return;
    }
    if (!step1Data.projectType.trim()) {
      alert('Please enter a project type.');
      return;
    }
    if (!step1Data.participants) {
      alert('Please select a participant range.');
      return;
    }
    if (!step1Data.developmentStage) {
      alert('Please select a development stage.');
      return;
    }
    submitStep1();
  }

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
          <div className="evaluation-goals-box">
            <h2>Project Type</h2>
            <p className="section-description">
              Briefly describe the type of gamified system you are evaluating.
            </p>
            <input
              className="project-type-input"
              type="text"
              placeholder="e.g. Educational game, Health app, E-commerce platform"
              value={step1Data.projectType}
              onChange={(e) => update('projectType', e.target.value)}
            />
          </div>
        </section>

        <EvaluationGoals
          value={step1Data.evaluationGoals}
          onChange={(goals) => update('evaluationGoals', goals)}
        />

        <DevelopmentStage
          value={step1Data.developmentStage}
          onChange={(stage) => update('developmentStage', stage)}
        />

        <ConstraintsSection
          participants={step1Data.participants}
          onParticipantsChange={(v) => update('participants', v)}
        />

        <ResearchSpecification />

        {error && (
          <div className="wizard-error">
            {error}
          </div>
        )}

        <NavigationButtons
          onBack={() => setPage('landing')}
          onNext={handleNext}
          nextLabel={loading ? 'Saving…' : 'Go to Methods'}
        />
      </main>

      <Footer />
    </div>
  );
}

export default EvaluationSetup;
