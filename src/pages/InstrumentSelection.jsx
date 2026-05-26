import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Stepper from '../components/Stepper';
import NavigationButtons from '../components/NavigationButtons';
import SelectionSummary from '../components/SelectionSummary';
import { useWizard } from '../context/WizardContext';
import ALL_INSTRUMENTS, { METHOD_NAME_TO_ID } from '../data/instruments';

/* ── Single instrument card – mirrors MethodCard from main ── */
function InstrumentCard({ instrument, selected, onToggle, userGoals = [] }) {
  const uncoveredGoals = userGoals.filter(
    (g) => !(instrument.coversGoals || []).includes(g)
  );

  return (
    <div
      className={`method-card${selected ? ' method-card--selected' : ''}`}
      onClick={() => onToggle(instrument.name)}
      style={{ cursor: 'pointer' }}
    >
      <div className="method-card-left">
        <div className="method-card-icon">{instrument.icon}</div>
        <div className="method-card-content">
          <h4>{instrument.name}</h4>
          <p>{instrument.description}</p>
          <div className="method-card-tags">
            {instrument.tags.map((tag) => (
              <span key={tag} className="method-tag">{tag}</span>
            ))}
          </div>
          {instrument.attributes?.map((attr, i) => (
            <p key={i} className="instrument-attribute">⚡ {attr}</p>
          ))}
          {uncoveredGoals.length > 0 && (
            <p className="instrument-uncovered">
              ⚠️ Does not measure: {uncoveredGoals.join(', ')}
            </p>
          )}
        </div>
      </div>
      <div className="method-card-right">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggle(instrument.name)}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
}

const COLLAPSED_COUNT = 3;

/* ── Group of recommended instruments for one method ── */
function RecommendedInstruments({ methodName, instruments, selectedInstruments, onToggle, hasError, userGoals }) {
  const [expanded, setExpanded] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  if (instruments.length === 0) return null;

  const anySelected = instruments.some((i) => selectedInstruments.includes(i.name));
  const visible = expanded ? instruments : instruments.slice(0, COLLAPSED_COUNT);
  const hiddenCount = instruments.length - COLLAPSED_COUNT;

  return (
    <section className="recommended-methods-section">
      <div className={`recommended-methods-container${hasError && !anySelected ? ' section--error' : ''}`}
           style={hasError && !anySelected ? { padding: '1rem', borderRadius: 8 } : {}}>
        <div className="recommended-instruments-header" onClick={() => setCollapsed(v => !v)}>
          <h3>Recommended instruments for {methodName}</h3>
          <span className={`recommended-instruments-arrow${collapsed ? ' recommended-instruments-arrow--collapsed' : ''}`}>
            ›
          </span>
        </div>

        {!collapsed && (
          <>
            <p>
              These instruments are suggested based on your selected evaluation method and project
              constraints.
            </p>
            <div className="methods-list">
              {visible.map((inst) => (
                <InstrumentCard
                  key={inst.id || inst.name}
                  instrument={inst}
                  selected={selectedInstruments.includes(inst.name)}
                  onToggle={onToggle}
                  userGoals={userGoals}
                />
              ))}
            </div>

            {hiddenCount > 0 && (
              <button
                className="instruments-expand-btn"
                onClick={() => setExpanded((v) => !v)}
              >
                {expanded ? '↑ Show less' : `↓ Show ${hiddenCount} more instruments`}
              </button>
            )}

            {hasError && !anySelected && (
              <p className="field-error" style={{ marginTop: '0.75rem' }}>
                Select at least one instrument for {methodName}.
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   InstrumentSelection page
══════════════════════════════════════════════════════════ */
function InstrumentSelection({ onOpenLogin, onOpenSignup }) {
  const {
    step1Data,
    step2Data,
    step3Data, setStep3Data,
    step3Recommendations,
    submitStep3,
    setPage,
    loading,
    error,
  } = useWizard();

  const [selectionError, setSelectionError] = useState(false);
  const [altOpen, setAltOpen] = useState(false);

  /* Toggle an instrument in / out of the selection */
  function toggleInstrument(name) {
    setSelectionError(false);
    setStep3Data((prev) => {
      const sel = prev.selectedInstruments;
      const next = sel.includes(name)
        ? sel.filter((i) => i !== name)
        : [...sel, name];
      return { ...prev, selectedInstruments: next };
    });
  }

  function handleNext() {
    if (step3Data.selectedInstruments.length === 0) {
      setSelectionError(true);
      return;
    }
    setSelectionError(false);
    submitStep3();
  }

  const userGoals = step1Data.evaluationGoals || [];

  /* Build one group per selected method.
     Priority: API recommendations (context-aware).
     Fallback: all local instruments for that method when API has no matches.
     Always append manually-browsed extras not already shown.
     Sorted by how many of the user's evaluation goals each instrument covers (desc). */
  const groups = step2Data.selectedMethods.map((methodName) => {
    const methodId =
      METHOD_NAME_TO_ID[methodName] || methodName.toLowerCase().replace(/\s+/g, '-');

    // API-recommended instruments that match this method in local data
    const apiMatched = step3Recommendations
      .filter((r) => ALL_INSTRUMENTS.find((i) => i.id === r.id && i.forMethodIds.includes(methodId)))
      .map((r) => ALL_INSTRUMENTS.find((i) => i.id === r.id) || {
        id: r.id,
        name: r.name,
        description: r.description,
        tags: [r.priority].filter(Boolean),
        attributes: [],
        icon: '📋',
        forMethodIds: [],
        coversGoals: [],
      });

    // If API has no matches for this method, fall back to ALL local instruments for it
    const base = apiMatched.length > 0
      ? apiMatched
      : ALL_INSTRUMENTS.filter((i) => i.forMethodIds.includes(methodId));

    // Manually-browsed extras not already in base
    const baseIds = new Set(base.map((i) => i.id).filter(Boolean));
    const baseNames = new Set(base.map((i) => i.name));
    const extras = step3Data.selectedInstruments
      .map((name) => ALL_INSTRUMENTS.find((i) => i.name === name))
      .filter((inst) =>
        inst &&
        inst.forMethodIds.includes(methodId) &&
        !baseIds.has(inst.id) &&
        !baseNames.has(inst.name)
      );

    let all = [...base, ...extras].filter(Boolean);

    // Remove instruments that cover none of the user's goals (when goals are known).
    // Instruments with no coversGoals data are always kept (e.g. protocol instruments).
    if (userGoals.length > 0) {
      all = all.filter((inst) => {
        const cg = inst.coversGoals || [];
        return cg.length === 0 || cg.some((g) => userGoals.includes(g));
      });
    }

    // Sort: instruments covering more of the user's goals rank higher
    const coverageScore = (inst) =>
      (inst.coversGoals || []).filter((g) => userGoals.includes(g)).length;
    all.sort((a, b) => coverageScore(b) - coverageScore(a));

    return { methodName, instruments: all };
  });

  const hasAnyInstruments = groups.some((g) => g.instruments.length > 0);
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
        {/* ── Intro ── */}
        <section className="method-selection-intro">
          <div className="method-selection-container">
            <h2>Instrument Selection</h2>
            <p>
              Select specific instruments (e.g. questionnaires, protocols, scripts) to
              operationalise your chosen evaluation methods. The recommendations below are based
              on your previous selections.
            </p>
          </div>
        </section>

        {/* ── Summary of previous steps ── */}
        <SelectionSummary
          goals={step1Data.evaluationGoals}
          developmentStage={step1Data.developmentStage}
          constraints={summaryConstraints}
          selectedMethods={step2Data.selectedMethods}
        />

        {/* ── Recommended instruments per method ── */}
        {!hasAnyInstruments && (
          <section className="recommended-methods-section">
            <div className="recommended-methods-container">
              <p style={{ color: '#888' }}>
                No instrument recommendations available. Use "Browse all instruments" below to add
                instruments manually.
              </p>
            </div>
          </section>
        )}

        {groups.map(({ methodName, instruments }) => (
          <RecommendedInstruments
            key={methodName}
            methodName={methodName}
            instruments={instruments}
            selectedInstruments={step3Data.selectedInstruments}
            onToggle={toggleInstrument}
            hasError={selectionError}
            userGoals={userGoals}
          />
        ))}

        {/* ── Alternative instruments box ── */}
        <section className="alternative-methods-section">
          <div className="alternative-methods-box">
            <div
              className="alternative-methods-header"
              onClick={() => setAltOpen((v) => !v)}
              style={{ cursor: 'pointer' }}
            >
              <span className={`alternative-methods-arrow${altOpen ? ' alternative-methods-arrow--open' : ''}`}>›</span>
              <span>Looking for alternative instruments?</span>
            </div>
            {altOpen && (
              <>
                <button
                  className="alternative-methods-link"
                  onClick={() => setPage('browse-instruments')}
                >
                  Browse all instruments
                </button>
                <button
                  className="alternative-methods-link"
                  style={{ marginLeft: '1.5rem' }}
                  onClick={() => setPage('custom-construct')}
                >
                  Custom questionnaire
                </button>
              </>
            )}
          </div>
        </section>

        {/* ── Selected instruments summary ── */}
        {step3Data.selectedInstruments.length > 0 && (
          <section className="selected-methods-section">
            <div className="selected-methods-container">
              <h3>Your selected instruments</h3>
              <div className="methods-list">
                {step3Data.selectedInstruments.map((instName) => {
                  const inst = ALL_INSTRUMENTS.find((i) => i.name === instName);
                  const customIndex = (step3Data.customConstructs || []).findIndex((c) => c.name === instName);
                  const custom = customIndex !== -1 ? step3Data.customConstructs[customIndex] : null;

                  return (
                    <div key={instName} className="method-card method-card--selected">
                      <div className="method-card-left">
                        <div className="method-card-icon">{custom ? '📝' : inst?.icon || '📋'}</div>
                        <div className="method-card-content">
                          <h4>{instName}</h4>
                          {custom ? (
                            <p>{custom.description}</p>
                          ) : (
                            inst?.description && <p>{inst.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="method-card-right" style={{ display: 'flex', gap: 6 }}>
                        {custom && (
                          <button
                            className="selected-method-remove"
                            onClick={() => {
                              setStep3Data((prev) => ({ ...prev, _editingCustomIndex: customIndex }));
                              setPage('custom-construct');
                            }}
                            title="Edit"
                            style={{ borderColor: '#8aa6c8', color: '#384250' }}
                          >
                            ✎
                          </button>
                        )}
                        <button
                          className="selected-method-remove"
                          onClick={() => {
                            toggleInstrument(instName);
                            if (custom) {
                              setStep3Data((prev) => ({
                                ...prev,
                                customConstructs: (prev.customConstructs || []).filter((_, i) => i !== customIndex),
                              }));
                            }
                          }}
                          title="Remove"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── API / server error ── */}
        {error && <div className="wizard-error">{error}</div>}

        {/* ── Navigation ── */}
        <NavigationButtons
          onBack={() => setPage('methods')}
          onNext={handleNext}
          nextLabel={loading ? 'Saving…' : 'Next: Evaluation'}
          error={selectionError ? 'Select at least one instrument to continue.' : null}
        />
      </main>

      <Footer />
    </div>
  );
}

export default InstrumentSelection;
