import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Icon from '../components/Icon';
import { projectApi } from '../api/project';
import { useWizard } from '../context/WizardContext';
import { useAuth } from '../context/AuthContext';

function getProjectStatus(p) {
  if (p.wizardStatus?.isComplete) return 'complete';
  if (p.wizardStatus?.currentStep > 1) return 'in-progress';
  return 'not-started';
}

function Dashboard({ onOpenLogin, onOpenSignup }) {
  const { setPage, setCurrentProjectId, startWizard, createProject } = useWizard();
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const PAGE_SIZE = 8;

  useEffect(() => {
    if (!user) return;
    projectApi.list()
      .then((data) => setProjects(data.projects || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [user]);

  function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function openProject(id) {
    setCurrentProjectId(id);
    setPage('project-detail');
  }

  if (!user) {
    return (
      <div>
        <Navbar onLogin={onOpenLogin} onSignup={onOpenSignup} />
        <div className="dashboard-unauthenticated">
          <h2>Please log in to access your dashboard</h2>
          <button className="btn btn-primary" onClick={onOpenLogin}>Log In</button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navbar onLogin={onOpenLogin} onSignup={onOpenSignup} />

      <main className="dashboard-main">
        <div className="dashboard-container">
          <h1 className="dashboard-welcome">Welcome to GamiDoc!</h1>
          <p className="dashboard-subtitle">Start a new gamification project or continue working on an existing one.</p>

          <div className="dashboard-grid">
            {/* My Projects */}
            <div className="dashboard-card dashboard-card--projects">
              <h2>My Projects</h2>

              <button className="dashboard-new-project-btn" onClick={user ? createProject : startWizard}>
                + Create New Project
              </button>

              {loading && <p style={{ color: '#888', marginTop: '1rem' }}>Loading…</p>}
              {error && <p className="auth-error">{error}</p>}

              <div className="dashboard-search-wrapper">
                <Icon name="search" size={15} className="dashboard-search-icon" />
                <input
                  className="dashboard-search-input"
                  type="text"
                  placeholder="Search projects…"
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                />
              </div>

              <div className="dashboard-project-list">
                {filteredProjects.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((p) => {
                  const status = getProjectStatus(p);
                  return (
                    <div
                      key={p.projectId}
                      className={`dashboard-project-card dashboard-project-card--${status}`}
                      onClick={() => openProject(p.projectId)}
                    >
                      <div className="dashboard-project-icon">
                        {status === 'complete' && <Icon name="checkCircle" size={22} color="#4a8c3f" />}
                        {status === 'in-progress' && <Icon name="circle" size={22} color="#999" />}
                        {status === 'not-started' && <Icon name="fileText" size={22} color="#999" />}
                      </div>
                      <div className="dashboard-project-info">
                        <span className="dashboard-project-name">{p.name}</span>
                        <span className="dashboard-project-desc">
                          {status === 'complete'
                            ? (p.description || 'Evaluation')
                            : 'Not completed'}
                        </span>
                      </div>
                      <span className="dashboard-project-date">
                        {p.updatedAt ? `Last Update ${formatDate(p.updatedAt)}` : `Created ${formatDate(p.createdAt)}`}
                      </span>
                    </div>
                  );
                })}
                {filteredProjects.length === 0 && !loading && (
                  <p style={{ color: '#888', marginTop: '1rem' }}>
                    {searchQuery ? 'No projects match your search.' : 'No projects yet. Create your first one!'}
                  </p>
                )}
              </div>

              {filteredProjects.length > PAGE_SIZE && (
                <div className="dashboard-pagination">
                  <button
                    className="dashboard-pagination-btn"
                    onClick={() => setCurrentPage(p => p - 1)}
                    disabled={currentPage === 1}
                  >
                    &lt; Prev
                  </button>
                  <span className="dashboard-pagination-info">
                    {currentPage} / {Math.ceil(filteredProjects.length / PAGE_SIZE)}
                  </span>
                  <button
                    className="dashboard-pagination-btn"
                    onClick={() => setCurrentPage(p => p + 1)}
                    disabled={currentPage === Math.ceil(filteredProjects.length / PAGE_SIZE)}
                  >
                    Next &gt;
                  </button>
                </div>
              )}
            </div>

            {/* Right column */}
            <div className="dashboard-right-col">
              <div className="dashboard-card dashboard-card--info">
                <div className="dashboard-card-icon">
                  <Icon name="knowledge" size={28} />
                </div>
                <div>
                  <h3>Knowledge & Documentation</h3>
                  <p>Access articles, frameworks, and best practices to support your gamification design and evaluation effort</p>
                  <button className="btn btn-primary dashboard-card-btn">Browse Resources</button>
                </div>
              </div>

              <div className="dashboard-card dashboard-card--info">
                <div className="dashboard-card-icon">
                  <Icon name="clipboardCheck" size={28} />
                </div>
                <div>
                  <h3>Reviewed Design</h3>
                  <p>Explore evaluated gamified systems shared by other users and get insights from their experiences.</p>
                  <button className="btn btn-primary dashboard-card-btn">Browse Designs</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Dashboard;
