import { useState } from 'react';

function EvaluationSetup() {
  const [constraints, setConstraints] = useState([]);

  function toggleConstraint(value) {
    if (constraints.includes(value)) {
      setConstraints(constraints.filter((item) => item !== value));
    } else {
      setConstraints([...constraints, value]);
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">Plan your evaluation</h1>

      <div className="form-container">
        <div className="form-section">
          <h2>Constraints</h2>
          <p>Are there any constraints affecting evaluation?</p>

          <div className="checkbox-group">
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={constraints.includes('time')}
                onChange={() => toggleConstraint('time')}
              />
              Limited time
            </label>

            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={constraints.includes('participants')}
                onChange={() => toggleConstraint('participants')}
              />
              Limited participants
            </label>

            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={constraints.includes('budget')}
                onChange={() => toggleConstraint('budget')}
              />
              Low budget
            </label>

            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={constraints.includes('access')}
                onChange={() => toggleConstraint('access')}
              />
              Restricted access to users
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EvaluationSetup;