import { useState } from 'react';
import Icon from './Icon';
import { rankedBundles } from '../data/bundles';

/* R4 — one-click instrument suites, offered before the per-instrument lists so
   the default path is a coherent bundle rather than manual checkbox picking. */
function InstrumentBundles({ userGoals, selectedMethodIds, selectedInstruments, onApply, onRemove }) {
  const [open, setOpen] = useState(true);
  const bundles = rankedBundles({ userGoals, selectedMethodIds, selectedInstruments });

  if (bundles.length === 0) return null;

  return (
    <section className="bundles-section">
      <div className="bundles-box">
        <div className="recommended-instruments-header" onClick={() => setOpen((v) => !v)}>
          <h3>Suggested instrument suites</h3>
          <span className={`recommended-instruments-arrow${!open ? ' recommended-instruments-arrow--collapsed' : ''}`}>›</span>
        </div>

        {open && (
          <>
            <p>
              Each suite bundles instruments that are commonly reported together for one
              UX dimension. Add a suite in one click, then refine it below if needed.
            </p>

            <div className="bundles-grid">
              {bundles.map((bundle) => (
                <div
                  key={bundle.id}
                  className={`bundle-card${bundle.applied ? ' bundle-card--applied' : ''}`}
                >
                  <div className="bundle-card-head">
                    <h4>{bundle.name}</h4>
                    {bundle.applied && <span className="bundle-applied-badge">✓ Added</span>}
                  </div>
                  <p className="bundle-card-desc">{bundle.description}</p>

                  <div className="bundle-card-goals">
                    {bundle.coveredGoals.map((g) => (
                      <span key={g} className="match-chip">
                        <span className="match-chip-label">Goal</span>{g}
                      </span>
                    ))}
                  </div>

                  <ul className="bundle-card-instruments">
                    {bundle.instruments.map((i) => (
                      <li key={i.id}>
                        <span className={selectedInstruments.includes(i.name) ? 'bundle-inst--in' : ''}>
                          {selectedInstruments.includes(i.name) ? '✓' : '+'} {i.name}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <p className="bundle-card-burden">
                    <Icon name="scale" size={13} /> {bundle.burden}
                  </p>

                  {bundle.applied ? (
                    <button
                      className="btn btn-secondary bundle-card-btn"
                      onClick={() => onRemove(bundle.instruments.map((i) => i.name))}
                    >
                      Remove suite
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary bundle-card-btn"
                      onClick={() => onApply(bundle.missing.map((i) => i.name))}
                    >
                      Add suite ({bundle.missing.length})
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default InstrumentBundles;
