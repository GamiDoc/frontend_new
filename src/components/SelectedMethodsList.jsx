import ALL_METHODS from '../data/methods';
import Icon from './Icon';

function resolveMethod(name, recommendations) {
  const fromRec = recommendations.find((r) => (r.name || r.title) === name);
  if (fromRec) return fromRec;
  const fromAll = ALL_METHODS.find((m) => m.name === name);
  return fromAll || { name, description: '', priority: '', icon: 'clipboard' };
}

function SelectedMethodsList({ selectedMethods, recommendations, onRemove }) {
  if (!selectedMethods || selectedMethods.length === 0) return null;

  return (
    <section className="selected-methods-section">
      <div className="selected-methods-container">
        <h3>Your selected methods</h3>
        <div className="methods-list">
          {selectedMethods.map((name) => {
            const m = resolveMethod(name, recommendations);
            return (
              <div key={name} className="method-card method-card--selected">
                <div className="method-card-left">
                  <div className="method-card-icon"><Icon name={m.icon || 'clipboard'} size={22} /></div>
                  <div className="method-card-content">
                    <h4>{m.name || m.title || name}</h4>
                    {m.description && <p>{m.description}</p>}
                    <div className="method-card-tags">
                      {m.priority && (
                        <span className="method-tag">{m.priority}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="method-card-right">
                  <button
                    className="selected-method-remove"
                    onClick={() => onRemove(name)}
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
  );
}

export default SelectedMethodsList;
