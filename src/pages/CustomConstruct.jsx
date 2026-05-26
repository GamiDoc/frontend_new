import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Icon from '../components/Icon';
import ALL_INSTRUMENTS from '../data/instruments';
import { useWizard } from '../context/WizardContext';

const GOALS = [...new Set(ALL_INSTRUMENTS.flatMap(i => i.coversGoals))].sort();

function CustomConstruct({ onOpenLogin, onOpenSignup }) {
  const { step3Data, setStep3Data, setPage } = useWizard();

  const editIndex = step3Data._editingCustomIndex ?? null;
  const existing = editIndex !== null ? step3Data.customConstructs[editIndex] : null;

  const [name, setName] = useState(existing?.name || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [selectedGoals, setSelectedGoals] = useState(existing?.goals || []);
  const [error, setError] = useState('');

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setDescription(existing.description);
      setSelectedGoals(existing.goals || []);
    }
  }, [editIndex]);

  function toggleGoal(g) {
    setSelectedGoals((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]);
  }

  function handleSave() {
    if (!name.trim()) { setError('Please enter a construct name.'); return; }
    if (!description.trim()) { setError('Please describe what you want to measure.'); return; }

    const construct = { name: name.trim(), description: description.trim(), goals: selectedGoals };

    setStep3Data((prev) => {
      const customs = [...(prev.customConstructs || [])];
      let instruments = [...prev.selectedInstruments];

      if (editIndex !== null) {
        const oldName = customs[editIndex].name;
        customs[editIndex] = construct;
        if (oldName !== construct.name) {
          instruments = instruments.map((n) => n === oldName ? construct.name : n);
        }
      } else {
        customs.push(construct);
        if (!instruments.includes(construct.name)) {
          instruments.push(construct.name);
        }
      }

      const { _editingCustomIndex, ...rest } = prev;
      return { ...rest, customConstructs: customs, selectedInstruments: instruments };
    });
    setPage('instruments');
  }

  function goBack() {
    setStep3Data((prev) => {
      const { _editingCustomIndex, ...rest } = prev;
      return rest;
    });
    setPage('instruments');
  }

  return (
    <div>
      <Navbar onLogin={onOpenLogin} onSignup={onOpenSignup} />

      <div className="browse-page">
        <div className="browse-breadcrumb" onClick={goBack}>
          ← Instrument selection
        </div>

        <h1 className="browse-title">
          {editIndex !== null ? 'Edit Custom Evaluation Construct' : 'Define Custom Evaluation Construct'}
        </h1>
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
              <span className="custom-construct-info-icon"><Icon name="info" size={18} /></span>
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
            <button className="btn btn-secondary" onClick={goBack}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>
              {editIndex !== null ? 'Save changes' : 'Add construct'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomConstruct;
