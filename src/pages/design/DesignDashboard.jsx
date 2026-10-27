import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import SaveDraftButton from '../../components/design/SaveDraftButton';
import { useDesign } from '../../context/DesignContext';
import { DESIGN_SECTIONS } from '../../data/designSections';

// Badge text for each card status
const STATUS_LABEL = {
    complete: 'Complete',
    in_progress: 'In progress',
    current: 'Current',
    not_started: 'Not started',
};
/*
COMMENTS FOR STYLING TO BE LATER MOVED TO APPROPRIATE SECTIONS
   - Barra sezioni: `.ds-dashboard-nav` with buttons `.ds-dashboard-nav-item`
   - Incipit: `.ds-dashboard-header`, big percentage `.ds-dashboard-percent`, <progress class="ds-progress">
   - Card: <button class="ds-dashboard-card ds-dashboard-card--<stato>"> with state
       complete · in_progress · current · not_started
     Inside: `.ds-card-title`, `.ds-card-status` (badge), <progress class="ds-progress">,
     `.ds-card-summary`, `.ds-card-percent`
   - Report: `.ds-reports-latest` (last generated) e `.ds-reports-history` (history)
 */
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * `ds-dashboard`Page — "Your project overview" (FR-11…FR-15, FR-22…FR-27)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This page can be reached only after a first viewing of all sections with at least one of them filled.
 * At first it shows a message and then "Continue".
 * 
 * * Clicking on a card opens the section
 * * "Export summary" generates 2 PDF (Standard e AI-Enhanced) and shows the links
 * * "Continue where I left off" 
 * * "Previous reports" shows the history of the generated PDFs (FR-27)
 * */
function DesignDashboard({ onOpenLogin, onOpenSignup }) {
    const {
        dashboardUnlocked,
        dashboardSections,
        overall,
        loadDashboard,
        goToSection,
        continueWhereLeftOff,
        generateReports,
        loadReportHistory,
        saving,
        error,
    } = useDesign();
    const [backendLocked, setBackendLocked] = useState(false);
    const [latest, setLatest] = useState(null);
    const [history, setHistory] = useState([]);

    // The backend confirms whether the dashboard should be accessible; in the meantime a report history is loaded.
    useEffect(() => {
        let cancelled = false;
        loadDashboard().then((d) => {
            if (!cancelled) setBackendLocked(!d);
        });
        loadReportHistory()
            .then((h) => {
                if (!cancelled) setHistory(h);
            })
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    }, [loadDashboard, loadReportHistory]);

    async function handleExport() {
        const result = await generateReports();
        if (!result) return;
        setLatest(result);
        loadReportHistory()
            .then(setHistory)
            .catch(() => {});
    }

    if (backendLocked || !dashboardUnlocked) {
        return (
            <div className="ds-page ds-page--dashboard ds-page--locked">
                <Navbar onLogin={onOpenLogin} onSignup={onOpenSignup} />
                <main className="ds-main">
                    <p>
                        The overview opens after a first pass through all six
                        sections, with at least one section filled in.
                    </p>
                    <button
                        type="button"
                        className="ds-btn ds-btn--primary"
                        onClick={continueWhereLeftOff}
                    >
                        Continue
                    </button>
                </main>
            </div>
        );
    }

    return (
        <div className="ds-page ds-page--dashboard">
            <Navbar onLogin={onOpenLogin} onSignup={onOpenSignup} />

            <nav className="ds-dashboard-nav" aria-label="Sections">
                {DESIGN_SECTIONS.map((s) => (
                    <button
                        key={s.number}
                        type="button"
                        className="ds-dashboard-nav-item"
                        onClick={() => goToSection(s.number)}
                    >
                        {s.navLabel}
                    </button>
                ))}
            </nav>

            <main className="ds-main">
                <header className="ds-dashboard-header">
                    <h1>Your project overview</h1>
                    <p>
                        {overall.completeCount} of {overall.sectionCount}{' '}
                        required categories complete
                    </p>
                    <p className="ds-dashboard-overall">
                        <span className="ds-dashboard-percent">
                            {overall.percent}%
                        </span>{' '}
                        overall progress
                    </p>
                    <progress
                        className="ds-progress"
                        max={100}
                        value={overall.percent}
                    >
                        {overall.percent}%
                    </progress>
                </header>

                <ul className="ds-dashboard-cards">
                    {dashboardSections.map((s) => (
                        <li key={s.number}>
                            <button
                                type="button"
                                className={`ds-dashboard-card ds-dashboard-card--${s.status}`}
                                onClick={() => goToSection(s.number)}
                            >
                                <span className="ds-card-title">{s.title}</span>
                                <span className="ds-card-status">
                                    {STATUS_LABEL[s.status]}
                                </span>
                                <progress
                                    className="ds-progress"
                                    max={100}
                                    value={s.percent}
                                >
                                    {s.percent}%
                                </progress>
                                <span className="ds-card-summary">
                                    {s.summary}
                                </span>
                                <span className="ds-card-percent">
                                    {s.percent}%
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>

                {error && (
                    <p className="ds-error" role="alert">
                        {error}
                    </p>
                )}

                <div className="ds-actions">
                    <SaveDraftButton onOpenLogin={onOpenLogin} />
                    <button
                        type="button"
                        className="ds-btn ds-btn--secondary"
                        onClick={handleExport}
                        disabled={saving}
                    >
                        {saving ? 'Generating…' : 'Export summary'}
                    </button>
                    <button
                        type="button"
                        className="ds-btn ds-btn--primary"
                        onClick={continueWhereLeftOff}
                    >
                        Continue where I left off »
                    </button>
                </div>

                {latest && (
                    <section className="ds-reports-latest" aria-live="polite">
                        <h2>Your reports are ready</h2>
                        <a
                            href={latest.standard.url}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Standard version (PDF)
                        </a>
                        <a
                            href={latest.enhanced.url}
                            target="_blank"
                            rel="noreferrer"
                        >
                            AI-Enhanced version (PDF)
                        </a>
                    </section>
                )}

                {history.length > 0 && (
                    <section className="ds-reports-history">
                        <h2>Previous reports</h2>
                        <ul>
                            {history.map((r) => (
                                <li key={r.reportId}>
                                    <a
                                        href={r.url}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {r.version === 'enhanced'
                                            ? 'AI-Enhanced'
                                            : 'Standard'}{' '}
                                        ·{' '}
                                        {new Date(r.createdAt).toLocaleString()}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </main>
        </div>
    );
}

export default DesignDashboard;
