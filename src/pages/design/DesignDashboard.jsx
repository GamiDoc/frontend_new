import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import SaveDraftButton from '../../components/design/SaveDraftButton';
import { useDesign } from '../../context/DesignContext';
import { DESIGN_SECTIONS } from '../../data/designSections';
import { REPORT_FORMATS, reportLabel } from '../../data/designReports';
import Icon from '../../components/IconDesign';

// Badge text for each card status
const STATUS_LABEL = {
    complete: 'Complete',
    in_progress: 'In progress',
    current: 'Current',
    not_started: 'Not started',
};
/*
COMMENTS FOR STYLING TO BE LATER MOVED TO APPROPRIATE SECTIONS
   - Barra sezioni: `.ds-dashboard-nav` → `.ds-dashboard-nav-main` (progress bar + buttons
     `.ds-dashboard-nav-item`), then the current-page "Overview" `.ds-dashboard-nav-overview`
     and the chat icon `.ds-chat-btn`, as in the step bar of the sections
   - Incipit: `.ds-dashboard-header`, big percentage `.ds-dashboard-percent`, <progress class="ds-progress">
   - Card: <button class="ds-dashboard-card ds-dashboard-card--<stato>"> with state
       complete · in_progress · current · not_started
     Inside: `.ds-card-title` (+ `.ds-optional-tag` for optional sections), `.ds-card-status` (badge), <progress class="ds-progress">,
     `.ds-card-summary`, `.ds-card-percent`
   - Documents: `.ds-reports` with one `.ds-report-option` per format (`.ds-report-option-title`,
     `.ds-report-option-description`, button); status `.ds-report-status` (role status) and
     `.ds-reports-latest` (link to the last generated); `.ds-reports-history` (history)
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
 * * "Export your design": two documents to choose from (Design report, Game Design Document),
 *   written by the AI on the backend in 1–3 minutes; the page shows the progress and the link
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
        generateReport,
        loadReportHistory,
        reportJob,
        reportRunning,
        error,
    } = useDesign();
    const [backendLocked, setBackendLocked] = useState(false);
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

    // A document just finished: refresh the history.
    const finishedReportId =
        reportJob?.state === 'done' ? reportJob.report?.reportId : null;
    useEffect(() => {
        if (!finishedReportId) return;
        loadReportHistory()
            .then(setHistory)
            .catch(() => {});
    }, [finishedReportId, loadReportHistory]);

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
                <div className="ds-dashboard-nav-main">
                    <progress
                        id="overview-nav-progress"
                        className="ds-progress"
                        max={100}
                        value={overall.percent}
                    ></progress>
                    <div id="overview-nav-sections">
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
                    </div>
                </div>
                <span className="ds-dashboard-nav-overview" aria-current="page">
                    Overview
                </span>
                <span className="ds-chat-btn" title={'Chat Feature'}>
                    {Icon('chat', '', { fill: '#fff', size: 40 })}
                </span>
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
                                <span className="ds-card-title">
                                    {s.title}
                                    {s.optional && (
                                        <span className="ds-optional-tag">
                                            Optional
                                        </span>
                                    )}
                                </span>
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
                        className="ds-btn ds-btn--primary"
                        onClick={continueWhereLeftOff}
                    >
                        Continue where I left off »
                    </button>
                </div>

                <section
                    className="ds-reports"
                    aria-labelledby="ds-reports-title"
                >
                    <h2 id="ds-reports-title">Export your design</h2>
                    <p className="ds-group-description">
                        Choose the document you prefer. The AI writes it from
                        your sections; it usually takes 1–3 minutes, and you can
                        keep working meanwhile.
                    </p>
                    <div className="ds-report-options">
                        {REPORT_FORMATS.map((format) => (
                            <div key={format.id} className="ds-report-option">
                                <h3 className="ds-report-option-title">
                                    {format.title}
                                </h3>
                                <p className="ds-report-option-description">
                                    {format.description}
                                </p>
                                <button
                                    type="button"
                                    className="ds-btn ds-btn--primary"
                                    onClick={() => generateReport(format.id)}
                                    disabled={reportRunning}
                                >
                                    {reportRunning &&
                                    reportJob?.format === format.id
                                        ? 'Writing…'
                                        : format.button}
                                </button>
                            </div>
                        ))}
                    </div>

                    {reportRunning && (
                        <p className="ds-report-status" role="status">
                            The AI is writing your{' '}
                            {reportLabel(reportJob.format)}… this usually takes
                            1–3 minutes.
                        </p>
                    )}
                    {reportJob?.state === 'done' && reportJob.report && (
                        <p className="ds-reports-latest" aria-live="polite">
                            Your {reportLabel(reportJob.format)} is ready:{' '}
                            <a
                                href={reportJob.report.url}
                                target="_blank"
                                rel="noreferrer"
                            >
                                open the PDF
                            </a>
                        </p>
                    )}
                    {reportJob?.state === 'failed' && (
                        <p className="ds-error" role="alert">
                            The {reportLabel(reportJob.format)} could not be
                            generated. Please try again.
                        </p>
                    )}
                </section>

                {history.length > 0 && (
                    <section className="ds-reports-history">
                        <h2>Previous reports</h2>
                        <ul>
                            {history.map((r) => (
                                <li key={r.reportId}>
                                    {r.missing ? (
                                        // file lost (e.g. with an earlier deploy): no link
                                        <span className="ds-reports-missing">
                                            {reportLabel(r.version)} ·{' '}
                                            {new Date(
                                                r.createdAt,
                                            ).toLocaleString()}{' '}
                                            · no longer available
                                        </span>
                                    ) : (
                                        <a
                                            href={r.url}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            {reportLabel(r.version)} ·{' '}
                                            {new Date(
                                                r.createdAt,
                                            ).toLocaleString()}
                                        </a>
                                    )}
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
