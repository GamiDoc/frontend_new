import { useState } from 'react';
import Navbar from '../components/Navbar';
import ALL_INSTRUMENTS from '../data/instruments';
import { useWizard } from '../context/WizardContext';

const INSTRUMENT_TYPES = ['Observational', 'Self-report', 'Expert review', 'Behavioral logging'];
const STAGES = ['Early / Exploratory', 'Concept / idea', 'High-fidelity prototype', 'Low-fidelity prototype', 'Deployed system'];
const CONSTRAINTS = ['Limited time', 'Small Samples', 'Ethical or sensitive concerns', 'Technical limitations'];
const GOALS = ['Usability', 'Engagement', 'Perceived Usability', 'Learning', 'Motivation'];

function BrowseInstruments({ onOpenLogin, onOpenSignup }) {
  const { step1Data, step3Data, setStep3Data, setPage } = useWizard();

  const [filterGoals, setFilterGoals] = useState([]);
  const [filterTypes, setFilterTypes] = useState([]);
  const [filterStages, setFilterStages] = useState([]);
  const [filterConstraints, setFilterConstraints] = useState([]);

  function toggleFilter(list, setList, value) {
    setList((prev) => prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]);
  }

  function toggleInstrument(name) {
    setStep3Data((prev) => {
      const sel = prev.selectedInstruments;
      const next = sel.includes(name) ? sel.filter((i) => i !== name) : [...sel, name];
      return { ...prev, selectedInstruments: next };
    });
  }

  const filtered = ALL_INSTRUMENTS.filter((inst) => {
    if (filterGoals.length && !inst.tags.some((t) => filterGoals.includes(t))) return false;
    if (filterTypes.length && !filterTypes.includes(inst.type)) return false;
    if (filterStages.length && !inst.stages.some((s) => filterStages.includes(s))) return false;
    if (filterConstraints.length && !inst.constraints.some((c) => filterConstraints.includes(c))) return false;
    return true;
  });

  function clearAll() {
    setFilterGoals([]); setFilterTypes([]); setFilterStages([]); setFilterConstraints([]);
  }

  return (
    <div>
      <Navbar onLogin={onOpenLogin} onSignup={onOpenSignup} />

      <div className="browse-page">
        <div className="browse-breadcrumb" onClick={() => setPage('instruments')}>
          ← Instrument selection
        </div>

        <h1 className="browse-title">Browse Evaluation Instruments</h1>
        <p className="browse-subtitle">
          Select specific instruments to support your chosen evaluation methods. Use filters to narrow down suitable options.
        </p>

        <div className="browse-layout">
          {/* Filters sidebar */}
          <aside className="browse-filters">
            <div className="browse-filter-group">
              <div className="browse-filter-header">
                <span>Evaluation goals</span>
                <button className="browse-clear" onClick={() => setFilterGoals([])}>Clear All</button>
              </div>
              {GOALS.map((g) => (
                <label key={g} className="browse-filter-option">
                  <input type="checkbox" checked={filterGoals.includes(g)} onChange={() => toggleFilter(filterGoals, setFilterGoals, g)} />
                  <span>{g}</span>
                </label>
              ))}
            </div>

            <div className="browse-filter-group">
              <div className="browse-filter-header">
                <span>Instrument type</span>
                <button className="browse-clear" onClick={() => setFilterTypes([])}>Clear All</button>
              </div>
              {INSTRUMENT_TYPES.map((t) => (
                <label key={t} className="browse-filter-option">
                  <input type="checkbox" checked={filterTypes.includes(t)} onChange={() => toggleFilter(filterTypes, setFilterTypes, t)} />
                  <span>{t}</span>
                </label>
              ))}
            </div>

            <div className="browse-filter-group">
              <div className="browse-filter-header">
                <span>Project stage</span>
                <button className="browse-clear" onClick={() => setFilterStages([])}>Clear All</button>
              </div>
              {STAGES.map((s) => (
                <label key={s} className="browse-filter-option">
                  <input type="checkbox" checked={filterStages.includes(s)} onChange={() => toggleFilter(filterStages, setFilterStages, s)} />
                  <span>{s}</span>
                </label>
              ))}
            </div>

            <div className="browse-filter-group">
              <div className="browse-filter-header">
                <span>Constraints</span>
                <button className="browse-clear" onClick={() => setFilterConstraints([])}>Clear All</button>
              </div>
              {CONSTRAINTS.map((c) => (
                <label key={c} className="browse-filter-option">
                  <input type="checkbox" checked={filterConstraints.includes(c)} onChange={() => toggleFilter(filterConstraints, setFilterConstraints, c)} />
                  <span>{c}</span>
                </label>
              ))}
            </div>

            {(filterGoals.length + filterTypes.length + filterStages.length + filterConstraints.length) > 0 && (
              <button className="browse-clear-all" onClick={clearAll}>Clear all filters</button>
            )}
          </aside>

          {/* Instruments list */}
          <div className="browse-results">
            {filtered.length === 0 ? (
              <p style={{ color: '#888' }}>No instruments match your filters.</p>
            ) : filtered.map((inst) => {
              const selected = step3Data.selectedInstruments.includes(inst.name);
              return (
                <div key={inst.id} className={`browse-instrument-card${selected ? ' browse-instrument-card--selected' : ''}`}>
                  <div className="browse-instrument-main">
                    <div className="browse-instrument-icon">{inst.icon}</div>
                    <div className="browse-instrument-content">
                      <div className="browse-instrument-top">
                        <h4>{inst.name}</h4>
                        <button className="browse-view-details">View Details</button>
                      </div>
                      <p>{inst.description}</p>
                      <div className="method-card-tags">
                        {inst.tags.map((t) => <span key={t} className="method-tag">{t}</span>)}
                      </div>
                      <div className="browse-attributes">
                        {inst.attributes.map((a, i) => (
                          <span key={i} className="browse-attribute">⚡ {a}</span>
                        ))}
                      </div>
                    </div>
                    <div className="browse-instrument-check">
                      <input type="checkbox" checked={selected} onChange={() => toggleInstrument(inst.name)} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="browse-footer">
          <button className="btn btn-secondary" onClick={() => setPage('instruments')}>Cancel</button>
          <button className="btn btn-primary" onClick={() => setPage('instruments')}>
            Next: Evaluation →
          </button>
        </div>
      </div>
    </div>
  );
}

export default BrowseInstruments;
