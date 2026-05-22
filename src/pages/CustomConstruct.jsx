import { useState } from 'react';
import Navbar from '../components/Navbar';
import ALL_INSTRUMENTS from '../data/instruments';
import { useWizard } from '../context/WizardContext';

const GOALS = [...new Set(ALL_INSTRUMENTS.flatMap(i => i.coversGoals))].sort();

function CustomConstruct({ onOpenLogin, onOpenSignup }) {
  const { step3Data, setStep3Data, setPage } = useWizard();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [error, setError] = useState('');

  function toggleGoal(g) {
    setSelectedGoals((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]);
  }

  function handleAdd() {
    if (!name.trim()) { setError('Please enter a construct name.'); return; }
    if (!description.trim()) { setError('Please describe what you want to measure.'); return; }
    setStep3Data((prev) => ({
      ...prev,
      selectedInstruments: [...prev.selectedInstruments, name.trim()],
    }));
    setPage('instruments');
  }

  return (
    <div>
      <Navbar onLogin={onOpenLogin} onSignup={onOpenSignup} />

      <div className="browse-page">
        <div className="browse-breadcrumb" onClick={() => setPage('instruments')}>
          ← Instrument selection
        </div>

        <h1 className="browse-title">Define Custom Evaluation Construct</h1>
        <p className="browse-subtitle">
          Carefully define your own evaluation construct. Explore existing validated instruments before creating a custom one.
        </p>

        <div className="custom-construct-form">
          <div className="custom-construct-section">
            <label className="custom-construct-label">Construct name</label>
            <input
              className="project-type-input"
              placeholder="Name of this construct (e.g., Early-stage usability perception)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="custom-construct-section">
            <div className="custom-construct-info-box">
              <span className="custom-construct-info-icon">ℹ️</span>
              <p>A construct should represent a measurable aspect of user experience (e.g., perceived clarity of instructions, sense of competence, social belonging).</p>
            </div>
          </div>

          <div className="custom-construct-section">
            <label className="custom-construct-label">Describe what you want to measure</label>
            <textarea
              className="custom-construct-textarea"
              placeholder="Describe the construct you want to measure"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <p className="custom-construct-hint">Be specific and measurable (e.g., perceived clarity of instructions)</p>
          </div>

          <div className="custom-construct-section">
            <label className="custom-construct-label">This construct relates to which evaluation goals?</label>
            <div className="custom-construct-goals">
              {GOALS.map((g) => (
                <label key={g} className="browse-filter-option">
                  <input type="checkbox" checked={selectedGoals.includes(g)} onChange={() => toggleGoal(g)} />
                  <span>{g}</span>
                </label>
              ))}
            </div>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <div className="custom-construct-actions">
            <button className="btn btn-secondary" onClick={() => setPage('instruments')}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAdd}>Add construct</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomConstruct;
