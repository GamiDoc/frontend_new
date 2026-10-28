import { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Icon from '../components/Icon';
import { projectApi } from '../api/project';
import { designApi } from '../api/design';
import ConstructionButton from '../components/ConstructionButton';
import { useWizard } from '../context/WizardContext';
import { useAuth } from '../context/AuthContext';
import { evaluationSummary, designSummary } from '../data/projectProcesses';

const PAGE_SIZE = 8;

/* Overall state of a project card, from its two processes:
   complete = every started process is complete; in-progress = at least one started. */
function getProjectStatus(processes) {
    const started = processes.filter((p) => p.summary.state !== 'not_started');
    if (started.length === 0) return 'not-started';
    if (started.every((p) => p.summary.state === 'complete')) return 'complete';
    return 'in-progress';
}

function Dashboard({ onOpenLogin, onOpenSignup }) {
    const { setPage, setCurrentProjectId } = useWizard();
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    // projectId → design status (null = no design yet). The project list does not
    // include the design, so it is loaded only for the projects on screen.
    const [designById, setDesignById] = useState({});
    // "Create New Project": inline name form
    const [creating, setCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [createBusy, setCreateBusy] = useState(false);

    useEffect(() => {
        if (!user) return;
        projectApi
            .list()
            .then((data) => setProjects(data.projects || []))
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, [user]);

    function formatDate(iso) {
        if (!iso) return '—';
        return new Date(iso).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    }

    const filteredProjects = projects.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    const visibleProjects = filteredProjects.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
    );
    const visibleIds = useMemo(
        () => visibleProjects.map((p) => p.projectId).join(','),
        [visibleProjects],
    );

    // Load the design status of the projects on the current page (once each).
    useEffect(() => {
        const missing = visibleIds
            .split(',')
            .filter((id) => id && !(id in designById));
        if (missing.length === 0) return;
        let cancelled = false;
        Promise.allSettled(
            missing.map((id) => designApi.get({ kind: 'project', id })),
        ).then((results) => {
            if (cancelled) return;
            setDesignById((prev) => {
                const next = { ...prev };
                missing.forEach((id, i) => {
                    next[id] =
                        results[i].status === 'fulfilled'
                            ? results[i].value
                            : null;
                });
                return next;
            });
        });
        return () => {
            cancelled = true;
        };
    }, [visibleIds, designById]);

    function processesOf(project) {
        return [
            {
                id: 'design',
                name: 'Design System',
                summary: designSummary(designById[project.projectId]),
            },
            {
                id: 'evaluation',
                name: 'UX Evaluation',
                summary: evaluationSummary(project),
            },
        ];
    }

    function openProject(id) {
        setCurrentProjectId(id);
        setPage('project-detail');
    }

    // New empty project: the processes are added from the project page.
    async function handleCreateProject(e) {
        e.preventDefault();
        const name = newName.trim();
        if (!name) return;
        setCreateBusy(true);
        setError(null);
        try {
            const project = await projectApi.create(name, '');
            openProject(project.projectId);
        } catch (err) {
            setError(err.message || 'Unable to create the project.');
            setCreateBusy(false);
        }
    }

    if (!user) {
        return (
            <div>
                <Navbar onLogin={onOpenLogin} onSignup={onOpenSignup} />
                <div className="dashboard-unauthenticated">
                    <h2>Please log in to access your dashboard</h2>
                    <button className="btn btn-primary" onClick={onOpenLogin}>
                        Log In
                    </button>
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
                    <p className="dashboard-subtitle">
                        Start a new gamification project or continue working on
                        an existing one.
                    </p>
                    {/* R6 — the project / document distinction was reported as unclear. */}
                    <p className="dashboard-hierarchy-note">
                        A <strong>project</strong> is one gamified system. In
                        each project you can run a{' '}
                        <strong>Design System</strong>, a{' '}
                        <strong>UX Evaluation</strong>, or both, and keep all
                        the PDF <strong>documents</strong> they produce.
                    </p>

                    <div className="dashboard-grid">
                        {/* My Projects */}
                        <div className="dashboard-card dashboard-card--projects">
                            <h2>My Projects</h2>

                            {creating ? (
                                <form
                                    className="dashboard-new-project-form"
                                    onSubmit={handleCreateProject}
                                >
                                    <input
                                        className="dashboard-search-input"
                                        type="text"
                                        placeholder="Project name"
                                        value={newName}
                                        onChange={(e) =>
                                            setNewName(e.target.value)
                                        }
                                        autoFocus
                                    />
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={createBusy || !newName.trim()}
                                    >
                                        {createBusy ? 'Creating…' : 'Create'}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setCreating(false);
                                            setNewName('');
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </form>
                            ) : (
                                <button
                                    className="dashboard-new-project-btn"
                                    onClick={() => setCreating(true)}
                                >
                                    + Create New Project
                                </button>
                            )}

                            {loading && (
                                <p style={{ color: '#888', marginTop: '1rem' }}>
                                    Loading…
                                </p>
                            )}
                            {error && <p className="auth-error">{error}</p>}

                            <div className="dashboard-search-wrapper">
                                <Icon
                                    name="search"
                                    size={15}
                                    className="dashboard-search-icon"
                                />
                                <input
                                    className="dashboard-search-input"
                                    type="text"
                                    placeholder="Search projects…"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>

                            <div className="dashboard-project-list">
                                {visibleProjects.map((p) => {
                                    const processes = processesOf(p);
                                    const status = getProjectStatus(processes);
                                    const started = processes.filter(
                                        (pr) =>
                                            pr.summary.state !== 'not_started',
                                    );
                                    return (
                                        <div
                                            key={p.projectId}
                                            className={`dashboard-project-card dashboard-project-card--${status}`}
                                            onClick={() =>
                                                openProject(p.projectId)
                                            }
                                        >
                                            <div className="dashboard-project-icon">
                                                {status === 'complete' && (
                                                    <Icon
                                                        name="checkCircle"
                                                        size={22}
                                                        color="#4a8c3f"
                                                    />
                                                )}
                                                {status === 'in-progress' && (
                                                    <Icon
                                                        name="circle"
                                                        size={22}
                                                        color="#999"
                                                    />
                                                )}
                                                {status === 'not-started' && (
                                                    <Icon
                                                        name="fileText"
                                                        size={22}
                                                        color="#999"
                                                    />
                                                )}
                                            </div>
                                            <div className="dashboard-project-info">
                                                <span className="dashboard-project-name">
                                                    {p.name}
                                                </span>
                                                {/* One badge per started process: Design System and/or UX Evaluation */}
                                                <span className="dashboard-project-processes">
                                                    {started.length === 0 ? (
                                                        <span className="dashboard-project-desc">
                                                            No process started
                                                            yet
                                                        </span>
                                                    ) : (
                                                        started.map((pr) => (
                                                            <span
                                                                key={pr.id}
                                                                className={`dashboard-process-badge dashboard-process-badge--${pr.id} dashboard-process-badge--${pr.summary.state}`}
                                                            >
                                                                {pr.name} ·{' '}
                                                                {
                                                                    pr.summary
                                                                        .label
                                                                }
                                                            </span>
                                                        ))
                                                    )}
                                                </span>
                                            </div>
                                            <span className="dashboard-project-date">
                                                {p.updatedAt
                                                    ? `Last Update ${formatDate(p.updatedAt)}`
                                                    : `Created ${formatDate(p.createdAt)}`}
                                            </span>
                                        </div>
                                    );
                                })}
                                {filteredProjects.length === 0 && !loading && (
                                    <p
                                        style={{
                                            color: '#888',
                                            marginTop: '1rem',
                                        }}
                                    >
                                        {searchQuery
                                            ? 'No projects match your search.'
                                            : 'No projects yet. Create your first one!'}
                                    </p>
                                )}
                            </div>

                            {filteredProjects.length > PAGE_SIZE && (
                                <div className="dashboard-pagination">
                                    <button
                                        className="dashboard-pagination-btn"
                                        onClick={() =>
                                            setCurrentPage((p) => p - 1)
                                        }
                                        disabled={currentPage === 1}
                                    >
                                        &lt; Prev
                                    </button>
                                    <span className="dashboard-pagination-info">
                                        {currentPage} /{' '}
                                        {Math.ceil(
                                            filteredProjects.length / PAGE_SIZE,
                                        )}
                                    </span>
                                    <button
                                        className="dashboard-pagination-btn"
                                        onClick={() =>
                                            setCurrentPage((p) => p + 1)
                                        }
                                        disabled={
                                            currentPage ===
                                            Math.ceil(
                                                filteredProjects.length /
                                                    PAGE_SIZE,
                                            )
                                        }
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
                                    <p>
                                        Access articles, frameworks, and best
                                        practices to support your gamification
                                        design and evaluation effort
                                    </p>
                                    <ConstructionButton className="btn btn-primary dashboard-card-btn">
                                        Browse Resources
                                    </ConstructionButton>
                                </div>
                            </div>

                            <div className="dashboard-card dashboard-card--info">
                                <div className="dashboard-card-icon">
                                    <Icon name="clipboardCheck" size={28} />
                                </div>
                                <div>
                                    <h3>Reviewed Design</h3>
                                    <p>
                                        Explore evaluated gamified systems
                                        shared by other users and get insights
                                        from their experiences.
                                    </p>
                                    <ConstructionButton className="btn btn-primary dashboard-card-btn">
                                        Browse Designs
                                    </ConstructionButton>
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
