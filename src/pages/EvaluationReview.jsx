import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Stepper from '../components/Stepper';
import { useWizard } from '../context/WizardContext';
import { useAuth } from '../context/AuthContext';
import { sessionApi } from '../api/session';

function EvaluationReview({ onOpenLogin, onOpenSignup }) {
  const {
    step1Data, step2Data, step3Data,
    sessionId, generatePDF, setPage,
  } = useWizard();
  const { user } = useAuth();

  const [generating, setGenerating] = useState(false);
  const [pdfError, setPdfError] = useState(null);

  // Save-to-dashboard state
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [projectName, setProjectName] = useState(step1Data.projectType || '');

  async function handleSave() {
    if (!user) { onOpenLogin(); return; }
    if (!showNameInput) {
      setShowNameInput(true);
      return;
    }
    const name = projectName.trim() || step1Data.projectType || 'My Evaluation Project';
    setSaving(true);
    setSaveError(null);
    try {
      await sessionApi.convertToProject(sessionId, name, '');
      setSaved(true);
      setShowNameInput(false);
    } catch (e) {
      if (e.status === 409 || e.code === 'PROJECT_ALREADY_EXISTS') {
        setSaved(true);
        setShowNameInput(false);
      } else {
        setSaveError(e.message || 'Failed to save project.');
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDownloadPDF() {
    setPdfError(null);
    setGenerating(true);
    try {
      const result = await generatePDF();
      if (!result?.pdfUrl) {
        setPdfError('PDF generation failed — no URL returned.');
        return;
      }
      const a = document.createElement('a');
      a.href = result.pdfUrl;
      a.download = 'evaluation-plan.pdf';
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      setPdfError(e.message || 'PDF generation failed.');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div>
      <Navbar onLogin={onOpenLogin} onSignup={onOpenSignup} />

      <section className="evaluation-header">
        <div className="container evaluation-header-inner">
          <h1>Evaluation & UX Methods</h1>
          <p>Follow these steps to create your evaluation plan.</p>
        </div>
      </section>

      <Stepper currentStep={4} />

      <main className="method-selection-page">
        <section className="method-selection-intro">
          <div className="method-selection-container">
            <h2>Evaluation</h2>
            <p>Review your selected goals, methods, and instruments before conducting the evaluation.</p>
          </div>
        </section>

        {/* Summary */}
        <section className="eval-summary-section">
          <div className="eval-summary-box">
            <div className="selection-summary-header">
              <span className="selection-summary-arrow">⌄</span>
              <h3>Evaluation summary</h3>
            </div>
            <div className="eval-summary-content">
              <p className="eval-summary-group-label">Overview</p>

              <div className="eval-summary-row">
                <span className="eval-summary-icon">◎</span>
                <span className="eval-summary-key">Goals:</span>
                <div className="eval-summary-tags">
                  {step1Data.evaluationGoals.map((g) => (
                    <span key={g} className="summary-tag">{g}</span>
                  ))}
                </div>
              </div>

              <div className="eval-summary-row">
                <span className="eval-summary-icon">⬡</span>
                <span className="eval-summary-key">Methods:</span>
                <span>{step2Data.selectedMethods.join(', ') || '—'}</span>
              </div>

              <div className="eval-summary-row">
                <span className="eval-summary-icon">📋</span>
                <span className="eval-summary-key">Instruments:</span>
                <span>{step3Data.selectedInstruments.join(', ') || '—'}</span>
              </div>

              <p className="eval-summary-group-label" style={{ marginTop: '1rem' }}>
                Participants & Constraints
              </p>

              {step1Data.participants && (
                <div className="eval-summary-row">
                  <span className="eval-summary-icon">👥</span>
                  <span>{step1Data.participants} participants</span>
                </div>
              )}

              <div className="eval-summary-row">
                <span className="eval-summary-icon">📄</span>
                <span>A structured summary of your evaluation design will be included in the final Evaluation Plan document.</span>
              </div>
            </div>
          </div>
        </section>

        {/* Evaluation Plan Ready */}
        <section className="eval-plan-section">
          <div className="eval-plan-box">
            <div className="eval-plan-icon">📄</div>
            <div className="eval-plan-content">
              <h3>Evaluation Plan Ready</h3>
              <p>Use this document to conduct and document your evaluation sessions. This document includes:</p>
              <ul className="eval-plan-checklist">
                <li>✓ Evaluation goals</li>
                <li>✓ Selected methods</li>
                <li>✓ Selected instruments</li>
                <li>✓ Participant constraints</li>
              </ul>

              {/* Project name input (shown before confirming save) */}
              {showNameInput && (
                <div className="eval-name-input-row">
                  <input
                    className="project-type-input"
                    type="text"
                    placeholder="Project name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    autoFocus
                  />
                  <button
                    className="btn eval-btn-save"
                    onClick={handleSave}
                    disabled={saving}
                    style={{ marginLeft: '0.5rem' }}
                  >
                    {saving ? 'Saving…' : 'Confirm Save'}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowNameInput(false)}
                    style={{ marginLeft: '0.5rem' }}
                  >
                    Cancel
                  </button>
                </div>
              )}

              <div className="eval-plan-actions">
                <button
                  className="btn eval-btn-download"
                  onClick={handleDownloadPDF}
                  disabled={generating}
                >
                  {generating ? 'Generating…' : '⬇ Download Evaluation Plan (PDF)'}
                </button>

                {!user ? (
                  <button className="btn eval-btn-save" onClick={onOpenLogin}>
                    Log in to save
                  </button>
                ) : saved ? (
                  <button className="btn eval-btn-save" onClick={() => setPage('dashboard')}>
                    ⊞ Go to dashboard
                  </button>
                ) : (
                  !showNameInput && (
                    <button className="btn eval-btn-save" onClick={handleSave} disabled={saving}>
                      ⊞ Save to dashboard
                    </button>
                  )
                )}
              </div>

              {pdfError && <p className="auth-error" style={{ marginTop: '0.75rem' }}>{pdfError}</p>}
              {saveError && <p className="auth-error" style={{ marginTop: '0.75rem' }}>⚠️ {saveError}</p>}
              {saved && <p style={{ color: '#4caf50', marginTop: '0.75rem' }}>✅ Project saved to your dashboard.</p>}
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section className="eval-nextsteps-section">
          <div className="method-selection-container">
            <h3>Next Steps for Conducting Your Evaluation</h3>
            <ol className="eval-nextsteps-list">
              <li>Conduct a pilot test to identify potential issues and refine instructions.</li>
              <li>Coordinate with participants and schedule your evaluation sessions.</li>
              <li>Observe user interactions and collect data.</li>
            </ol>
          </div>
        </section>

        <div className="nav-buttons">
          <button className="btn btn-secondary" onClick={() => setPage('instruments')}>← Back</button>
          <button className="btn btn-primary" onClick={() => setPage('landing')}>
            Finish Evaluation Plan →
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default EvaluationReview;
