import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import SaveDraftButton from '../../components/design/SaveDraftButton';
import { useDesign } from '../../context/DesignContext';
import { DESIGN_SECTIONS } from '../../data/designSections';

// Testo del badge di stato di ogni card.
const STATUS_LABEL = {
  complete: 'Complete',
  in_progress: 'In progress',
  current: 'Current',
  not_started: 'Not started',
};

/* ═══════════════════════════════════════════════════════════════════════════
   Pagina `ds-dashboard` — "Your project overview" (FR-11…FR-15, FR-22…FR-27)
   ═══════════════════════════════════════════════════════════════════════════
   Avanzamento del progetto e accesso a tutte le sezioni. Si apre solo dopo il primo
   passaggio con almeno una sezione compilata; prima mostra un messaggio e "Continue".

   - Click su una card o su una voce della barra in alto → apre quella sezione.
   - "Export summary"            → genera i due PDF (Standard e AI-Enhanced) e mostra i link.
                                   La specifica lo chiama "Download PDF Report".
   - "Continue where I left off" → prima sezione del percorso non ancora completa.
   - "Previous reports"          → storico dei PDF generati (FR-27); non è nei mockup.

   PER LA GRAFICA
   - Barra sezioni: `.ds-dashboard-nav` con pulsanti `.ds-dashboard-nav-item`
   - Testata: `.ds-dashboard-header`, percentuale grande `.ds-dashboard-percent`,
     barra <progress class="ds-progress">
   - Card: <button class="ds-dashboard-card ds-dashboard-card--<stato>"> con stato
       complete · in_progress · current · not_started
     Dentro: `.ds-card-title`, `.ds-card-status` (badge), <progress class="ds-progress">,
     `.ds-card-summary`, `.ds-card-percent`
   - Report: `.ds-reports-latest` (ultimi generati) e `.ds-reports-history` (storico)
   ═══════════════════════════════════════════════════════════════════════════ */
function DesignDashboard({ onOpenLogin, onOpenSignup }) {
  const {
    dashboardUnlocked, dashboardSections, overall, loadDashboard, goToSection,
    continueWhereLeftOff, generateReports, loadReportHistory, saving, error,
  } = useDesign();
  const [backendLocked, setBackendLocked] = useState(false);
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);

  // Il backend conferma che la dashboard è accessibile; intanto si carica lo storico dei report.
  useEffect(() => {
    let cancelled = false;
    loadDashboard().then((d) => { if (!cancelled) setBackendLocked(!d); });
    loadReportHistory().then((h) => { if (!cancelled) setHistory(h); }).catch(() => {});
    return () => { cancelled = true; };
  }, [loadDashboard, loadReportHistory]);

  async function handleExport() {
    const result = await generateReports();
    if (!result) return;
    setLatest(result);
    loadReportHistory().then(setHistory).catch(() => {});
  }

  if (backendLocked || !dashboardUnlocked) {
    return (
      <div className="ds-page ds-page--dashboard ds-page--locked">
        <Navbar onLogin={onOpenLogin} onSignup={onOpenSignup} />
        <main className="ds-main">
          <p>The overview opens after a first pass through all seven sections, with at least one section filled in.</p>
          <button type="button" className="ds-btn ds-btn--primary" onClick={continueWhereLeftOff}>Continue</button>
        </main>
      </div>
    );
  }

  return (
    <div className="ds-page ds-page--dashboard">
      <Navbar onLogin={onOpenLogin} onSignup={onOpenSignup} />

      <nav className="ds-dashboard-nav" aria-label="Sections">
        {DESIGN_SECTIONS.map((s) => (
          <button key={s.number} type="button" className="ds-dashboard-nav-item" onClick={() => goToSection(s.number)}>
            {s.navLabel}
          </button>
        ))}
      </nav>

      <main className="ds-main">
        <header className="ds-dashboard-header">
          <h1>Your project overview</h1>
          <p>{overall.completeCount} of {overall.sectionCount} required categories complete</p>
          <p className="ds-dashboard-overall">
            <span className="ds-dashboard-percent">{overall.percent}%</span> overall progress
          </p>
          <progress className="ds-progress" max={100} value={overall.percent}>{overall.percent}%</progress>
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
                <span className="ds-card-status">{STATUS_LABEL[s.status]}</span>
                <progress className="ds-progress" max={100} value={s.percent}>{s.percent}%</progress>
                <span className="ds-card-summary">{s.summary}</span>
                <span className="ds-card-percent">{s.percent}%</span>
              </button>
            </li>
          ))}
        </ul>

        {error && <p className="ds-error" role="alert">{error}</p>}

        <div className="ds-actions">
          <SaveDraftButton onOpenLogin={onOpenLogin} />
          <button type="button" className="ds-btn ds-btn--secondary" onClick={handleExport} disabled={saving}>
            {saving ? 'Generating…' : 'Export summary'}
          </button>
          <button type="button" className="ds-btn ds-btn--primary" onClick={continueWhereLeftOff}>
            Continue where I left off »
          </button>
        </div>

        {latest && (
          <section className="ds-reports-latest" aria-live="polite">
            <h2>Your reports are ready</h2>
            <a href={latest.standard.url} target="_blank" rel="noreferrer">Standard version (PDF)</a>
            <a href={latest.enhanced.url} target="_blank" rel="noreferrer">AI-Enhanced version (PDF)</a>
          </section>
        )}

        {history.length > 0 && (
          <section className="ds-reports-history">
            <h2>Previous reports</h2>
            <ul>
              {history.map((r) => (
                <li key={r.reportId}>
                  <a href={r.url} target="_blank" rel="noreferrer">
                    {r.version === 'enhanced' ? 'AI-Enhanced' : 'Standard'} · {new Date(r.createdAt).toLocaleString()}
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
