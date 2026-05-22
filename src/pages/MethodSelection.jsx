import { useState, useCallback } from 'react';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Stepper from "../components/Stepper";
import NavigationButtons from "../components/NavigationButtons";
import SelectionSummary from "../components/SelectionSummary";
import RecommendedMethods from "../components/RecommendedMethods";
import AlternativeMethodsBox from "../components/AlternativeMethodsBox";
import SelectedMethodsList from "../components/SelectedMethodsList";
import ALL_METHODS from "../data/methods";
import { useWizard } from "../context/WizardContext";

function MethodSelection({ onOpenLogin, onOpenSignup }) {
  const {
    step1Data,
    step2Data, setStep2Data,
    recommendations,
    submitStep2,
    setPage,
    loading, error,
  } = useWizard();

  const [selectionError, setSelectionError] = useState(false);

  function handleToggleMethod(methodName) {
    setSelectionError(false);
    setStep2Data((prev) => {
      const selected = prev.selectedMethods;
      const next = selected.includes(methodName)
        ? selected.filter((m) => m !== methodName)
        : [...selected, methodName];
      return { ...prev, selectedMethods: next };
    });
  }

  function handleNext() {
    if (step2Data.selectedMethods.length === 0) {
      setSelectionError(true);
      return;
    }
    setSelectionError(false);
    submitStep2();
  }

  // Names of methods already shown via recommendations
  const recommendedNames = recommendations.map((r) => r.name || r.title);

  // Methods selected from the popup that are NOT already in recommendations
  const extraMethods = step2Data.selectedMethods
    .filter((name) => !recommendedNames.includes(name))
    .map((name) => {
      const found = ALL_METHODS.find((m) => m.name === name);
      return found
        ? { ...found, priority: 'Added' }
        : { id: name, name, description: '', priority: 'Added', icon: '📋' };
    });

  // Final list: API recommendations first, then manually added ones
  const displayMethods = [...recommendations, ...extraMethods];

  const summaryConstraints = [step1Data.participants].filter(Boolean);

  return (
    <div>
      <Navbar onLogin={onOpenLogin} onSignup={onOpenSignup} />

      <section className="evaluation-header">
        <div className="container evaluation-header-inner">
          <h1>Evaluation & UX Methods</h1>
          <p>Follow these steps to create your evaluation plan.</p>
        </div>
      </section>

      <Stepper currentStep={2} />

      <main className="method-selection-page">
        <section className="method-selection-intro">
          <div className="method-selection-container">
            <h2>Method Selection</h2>
            <p>
              Select appropriate evaluation methods based on your defined goals
              and constraints.
            </p>
          </div>
        </section>

        <SelectionSummary
          goals={step1Data.evaluationGoals}
          developmentStage={step1Data.developmentStage}
          constraints={summaryConstraints}
        />

        {displayMethods.length > 0 ? (
          <RecommendedMethods
            methods={displayMethods}
            selectedMethods={step2Data.selectedMethods}
            onToggleMethod={handleToggleMethod}
            hasError={selectionError}
          />
        ) : (
          <section className="recommended-methods-section">
            <div className={`recommended-methods-container${selectionError ? ' section--error' : ''}`}
                 style={{ padding: '1rem', borderRadius: 8, border: selectionError ? undefined : 'none' }}>
              <p style={{ color: '#888' }}>
                No recommendations available. Use "Browse all methods" below to add one.
              </p>
              {selectionError && <p className="field-error">Select at least one method.</p>}
            </div>
          </section>
        )}

        <AlternativeMethodsBox onOpen={() => setPage('browse-methods')} />

        <SelectedMethodsList
          selectedMethods={step2Data.selectedMethods}
          recommendations={recommendations}
          onRemove={handleToggleMethod}
        />

        {error && <div className="wizard-error">{error}</div>}

        <NavigationButtons
          onBack={() => setPage('setup')}
          onNext={handleNext}
          nextLabel={loading ? 'Saving…' : 'Next: Instrument Selection'}
          error={selectionError ? 'Select at least one method to continue.' : null}
        />
      </main>

      <Footer />
    </div>
  );
}

export default MethodSelection;
