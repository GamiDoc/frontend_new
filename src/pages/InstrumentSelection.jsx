import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Stepper from '../components/Stepper';
import NavigationButtons from '../components/NavigationButtons';
import SelectionSummary from '../components/SelectionSummary';
import { useWizard } from '../context/WizardContext';
import ALL_INSTRUMENTS, { METHOD_NAME_TO_ID } from '../data/instruments';

function InstrumentCard({ instrument, selected, onToggle }) {
  return (
    <div className={`instrument-card${selected ? ' instrument-card--selected' : ''}`}>
      <div className="instrument-card-left">
        <div className="method-card-icon">{instrument.icon}</div>
        <div className="instrument-card-content">
          <h4>{instrument.name}</h4>
          <p>{instrument.description}</p>
          <div className="method-card-tags">
            {instrument.tags.map((t) => <span key={t} className="method-tag">{t}</span>)}
          </div>
          {instrument.attributes.map((a, i) => (
            <p key={i} className="instrument-attribute">⚡ {a}</p>
          ))}
        </div>
      </div>
      <div className="method-card-right">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggle(instrument.name)}
        />
      </div>
    </div>
  );
}

function InstrumentSelection({ onOpenLogin, onOpenSignup }) {
  const {
    step1Data, step2Data, step3Data, setStep3Data,
    step3Recommendations, submitStep3, setPage, loading, error,
  } = useWizard();

  function toggleInstrument(name) {
    setStep3Data((prev) => {
      const sel = prev.selectedInstruments;
      const next = sel.includes(name) ? sel.filter((i) => i !== name) : [...sel, name];
      return { ...prev, selectedInstruments: next };
    });
  }

  function handleNext() {
    if (step3Data.selectedInstruments.length === 0) {
      alert('Please select at least one instrument.');
      return;
    }
    submitStep3();
  }

  // Group recommended instruments by selected method
  const recommendedIds = step3Recommendations.map((r) => r.id);

  const groups = step2Data.selectedMethods.map((methodName) => {
    const methodId = METHOD_NAME_TO_ID[methodName] || methodName.toLowerCase().replace(/\s+/g, '-');
    // API-recommended instruments for this method
    const apiInstruments = step3Recommendations.filter((r) =>
      ALL_INSTRUMENTS.find((i) => i.id === r.id && i.forMethodIds.includes(methodId))
    );
    // Extras selected from browse page not yet in API list
    const extras = step3Data.selectedInstruments
      .filter((name) => {
        const loc = ALL_INSTRUMENTS.find((i) => i.name === name);
        return loc && loc.forMethodIds.includes(methodId) && !apiInstruments.find((r) => r.name === name);
      })
      .map((name) => ALL_INSTRUMENTS.find((i) => i.name === name));

    const allForMethod = [
      ...apiInstruments.map((r) => ALL_INSTRUMENTS.find((i) => i.id === r.id) || { ...r, tags: [r.priority], attributes: [], icon: '📋', forMethodIds: [] }),
      ...extras,
    ].filter(Boolean);

    return { methodName, instruments: allForMethod };
  });

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

      <Stepper currentStep={3} />

      <main className="method-selection-page">
        <section className="method-selection-intro">
          <div className="method-selection-container">
            <h2>Instrument Selection</h2>
            <p>Select specific instruments (e.g., questionnaires, protocols, scripts) to operationalize
              your chosen evaluation methods. The following recommendations are based on your selections.</p>
          </div>
        </section>

        <SelectionSummary
          goals={step1Data.evaluationGoals}
          developmentStage={step1Data.developmentStage}
          constraints={summaryConstraints}
          selectedMethods={step2Data.selectedMethods}
        />

        {groups.every((g) => g.instruments.length === 0) && (
          <section className="recommended-methods-section">
            <div className="recommended-methods-container">
              <p style={{ color: '#888' }}>No instrument recommendations available. Use "Browse all instruments" below.</p>
            </div>
          </section>
        )}

        {groups.map(({ methodName, instruments }) =>
          instruments.length === 0 ? null : (
            <section key={methodName} className="recommended-methods-section">
              <div className="recommended-methods-container">
                <h3>Recommended Instruments for {methodName}</h3>
                <div className="methods-list">
                  {instruments.map((inst) => (
                    <InstrumentCard
                      key={inst.id || inst.name}
                      instrument={inst}
                      selected={step3Data.selectedInstruments.includes(inst.name)}
                      onToggle={toggleInstrument}
                    />
                  ))}
                </div>
              </div>
            </section>
          )
        )}

        <section className="alternative-methods-section">
          <div className="alternative-methods-box">
            <div className="alternative-methods-header">
              <span className="alternative-methods-arrow">›</span>
              <span>Looking for alternative instruments?</span>
            </div>
            <button className="alternative-methods-link" onClick={() => setPage('browse-instruments')}>
              Browse all instruments
            </button>
            <button className="alternative-methods-link" style={{ marginLeft: '1.5rem' }} onClick={() => setPage('custom-construct')}>
              Custom questionnaire
            </button>
          </div>
        </section>

        {error && <div className="wizard-error">{error}</div>}

        <NavigationButtons
          onBack={() => setPage('methods')}
          onNext={handleNext}
          nextLabel={loading ? 'Saving…' : 'Next: Evaluation'}
        />
      </main>

      <Footer />
    </div>
  );
}

export default InstrumentSelection;
