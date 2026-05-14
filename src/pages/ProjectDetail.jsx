import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { projectApi } from '../api/project';
import { useWizard } from '../context/WizardContext';

function ProjectDetail({ projectId, onOpenLogin, onOpenSignup }) {
  const { setPage } = useWizard();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    projectApi.get(projectId)
      .then((p) => { setProject(p); setNameInput(p.name); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [projectId]);

  function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  async function handleRename() {
    if (!nameInput.trim()) return;
    try {
      const updated = await projectApi.update(projectId, nameInput.trim(), project.description);
      setProject(updated);
      setEditingName(false);
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete project "${project.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await projectApi.delete(projectId);
      setPage('dashboard');
    } catch (e) {
      setError(e.message);
      setDeleting(false);
    }
  }

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading…</div>;
  if (error) return <div style={{ padding: '3rem', color: '#c00' }}>{error}</div>;
  if (!project) return null;

  const docCount = project.pdfUrl ? 1 : 0;

  return (
    <div>
      <Navbar onLogin={onOpenLogin} onSignup={onOpenSignup} />

      <main className="project-detail-main">
        <div className="project-detail-container">
          <div className="project-detail-breadcrumb" onClick={() => setPage('dashboard')}>
            ← Project Dashboard
          </div>

          <div className="project-detail-header">
            <div>
              {editingName ? (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    className="project-type-input"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                    autoFocus
                    style={{ fontSize: '1.4rem', fontWeight: 700, width: 'auto' }}
                  />
                  <button className="btn btn-primary" onClick={handleRename}>Save</button>
                  <button className="btn btn-secondary" onClick={() => setEditingName(false)}>Cancel</button>
                </div>
              ) : (
                <h1 className="project-detail-title">
                  {project.name}
                  <button className="project-edit-btn" onClick={() => setEditingName(true)} title="Rename">✏️</button>
                </h1>
              )}
              <p className="project-detail-desc">{project.description || 'No description'}</p>
            </div>

            <div className="project-detail-actions">
              <button className="btn btn-primary" onClick={() => setPage('setup')}>+ New Documents</button>
              <button className="btn btn-secondary" onClick={handleDelete} disabled={deleting} style={{ color: '#c00', borderColor: '#c00' }}>
                {deleting ? 'Deleting…' : '🗑 Delete'}
              </button>
            </div>
          </div>

          <div className="project-detail-body">
            {/* Documents */}
            <div className="project-detail-docs">
              <h2>Project Documents</h2>

              {project.pdfUrl ? (
                <div className="project-doc-card">
                  <div className="project-doc-icon">📄</div>
                  <div className="project-doc-info">
                    <span className="project-doc-name">Evaluation Plan</span>
                    <span className="project-doc-date">Created {formatDate(project.updatedAt)}</span>
                  </div>
                  <div className="project-doc-actions">
                    <a href={project.pdfUrl} target="_blank" rel="noreferrer" className="btn btn-secondary">Download PDF</a>
                  </div>
                </div>
              ) : (
                <div className="project-doc-empty">
                  <p>No documents yet.</p>
                  <button className="btn btn-primary" onClick={() => setPage('setup')}>Generate Evaluation Plan</button>
                </div>
              )}
            </div>

            {/* Project Info sidebar */}
            <aside className="project-detail-info">
              <h2>Project Info</h2>
              <div className="project-info-row">
                <span className="project-info-label">Created:</span>
                <span>{formatDate(project.createdAt)}</span>
              </div>
              <div className="project-info-row">
                <span className="project-info-label">Last Updated:</span>
                <span>{formatDate(project.updatedAt)}</span>
              </div>
              <div className="project-info-row">
                <span className="project-info-label">Documents:</span>
                <span>{docCount}</span>
              </div>
              <div className="project-info-row">
                <span className="project-info-label">Status:</span>
                <span>{project.wizardStatus?.isComplete ? 'Complete' : 'In progress'}</span>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default ProjectDetail;
