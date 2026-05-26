import { useState } from 'react';
import Navbar from '../components/Navbar';
import Icon from '../components/Icon';
import ALL_METHODS from '../data/methods';
import { useWizard } from '../context/WizardContext';

const TYPES = [...new Set(ALL_METHODS.map(m => m.type))].sort();
const STAGES = [...new Set(ALL_METHODS.flatMap(m => m.stages))].sort();
const GOALS = [...new Set(ALL_METHODS.flatMap(m => m.goals))].sort();

function BrowseMethods({ onOpenLogin, onOpenSignup }) {
  const { step2Data, setStep2Data, setPage } = useWizard();

  const [filterTypes, setFilterTypes] = useState([]);
  const [filterStages, setFilterStages] = useState([]);
  const [filterGoals, setFilterGoals] = useState([]);

  function toggleFilter(list, setList, value) {
    setList((prev) => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  }

  function toggleMethod(name) {
    setStep2Data((prev) => {
      const sel = prev.selectedMethods;
      const next = sel.includes(name) ? sel.filter(m => m !== name) : [...sel, name];
      return { ...prev, selectedMethods: next };
    });
  }

  const filtered = ALL_METHODS.filter(m => {
    if (filterTypes.length && !filterTypes.includes(m.type)) return false;
    if (filterStages.length && !m.stages.some(s => filterStages.includes(s))) return false;
    if (filterGoals.length && !m.goals.some(g => filterGoals.includes(g))) return false;
    return true;
  });

  const activeCount = filterTypes.length + filterStages.length + filterGoals.length;

  function clearAll() {
    setFilterTypes([]); setFilterStages([]); setFilterGoals([]);
  }

  return (
    <div>
      <Navbar onLogin={onOpenLogin} onSignup={onOpenSignup} />

      <div className="browse-page">
        <div className="browse-breadcrumb" onClick={() => setPage('methods')}>
          ← Method selection
        </div>

        <h1 className="browse-title">Browse Evaluation Methods</h1>
        <p className="browse-subtitle">
          Select one or more evaluation methods to add to your plan. Use filters to find methods suited to your goals and project stage.
        </p>

        <div className="browse-layout">
          <aside className="browse-filters">
            <div className="browse-filter-group">
              <div className="browse-filter-header">
                <span>Method type</span>
                <button className="browse-clear" onClick={() => setFilterTypes([])}>Clear</button>
              </div>
              {TYPES.map(t => (
                <label key={t} className="browse-filter-option">
                  <input type="checkbox" checked={filterTypes.includes(t)} onChange={() => toggleFilter(filterTypes, setFilterTypes, t)} />
                  <span>{t}</span>
                </label>
              ))}
            </div>

            <div className="browse-filter-group">
              <div className="browse-filter-header">
                <span>Project stage</span>
                <button className="browse-clear" onClick={() => setFilterStages([])}>Clear</button>
              </div>
              {STAGES.map(s => (
                <label key={s} className="browse-filter-option">
                  <input type="checkbox" checked={filterStages.includes(s)} onChange={() => toggleFilter(filterStages, setFilterStages, s)} />
                  <span>{s}</span>
                </label>
              ))}
            </div>

            <div className="browse-filter-group">
              <div className="browse-filter-header">
                <span>Evaluation goals</span>
                <button className="browse-clear" onClick={() => setFilterGoals([])}>Clear</button>
              </div>
              {GOALS.map(g => (
                <label key={g} className="browse-filter-option">
                  <input type="checkbox" checked={filterGoals.includes(g)} onChange={() => toggleFilter(filterGoals, setFilterGoals, g)} />
                  <span>{g}</span>
                </label>
              ))}
            </div>

            {activeCount > 0 && (
              <button className="browse-clear-all" onClick={clearAll}>Clear all filters</button>
            )}
          </aside>

          <div className="browse-results">
            {filtered.length === 0 ? (
              <p style={{ color: '#888' }}>No methods match your filters.</p>
            ) : filtered.map(method => {
              const selected = step2Data.selectedMethods.includes(method.name);
              return (
                <div
                  key={method.id}
                  className={`browse-instrument-card${selected ? ' browse-instrument-card--selected' : ''}`}
                  onClick={() => toggleMethod(method.name)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="browse-instrument-main">
                    <div className="browse-instrument-icon"><Icon name={method.icon || 'clipboard'} size={22} /></div>
                    <div className="browse-instrument-content">
                      <div className="browse-instrument-top">
                        <h4>{method.name}</h4>
                        <span className="browse-method-type-tag">{method.type}</span>
                      </div>
                      <p>{method.description}</p>
                      {method.rationale && (
                        <p className="browse-method-rationale"><Icon name="lightbulb" size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} /> {method.rationale}</p>
                      )}
                      <div className="method-card-tags" style={{ marginTop: 6 }}>
                        {method.goals.map(g => <span key={g} className="method-tag">{g}</span>)}
                      </div>
                      <div className="browse-attributes">
                        {method.stages.map((s, i) => (
                          <span key={i} className="browse-attribute"><Icon name="target" size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} /> {s}</span>
                        ))}
                      </div>
                    </div>
                    <div className="browse-instrument-check">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleMethod(method.name)}
                        onClick={e => e.stopPropagation()}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="browse-footer">
          <button className="btn btn-secondary" onClick={() => setPage('methods')}>Cancel</button>
          <button className="btn btn-primary" onClick={() => setPage('methods')}>
            Confirm selection →
          </button>
        </div>
      </div>
    </div>
  );
}

export default BrowseMethods;
