import { useDesign } from '../../context/DesignContext';
import { TOTAL_STEPS } from '../../data/designSections';

/* ═══════════════════════════════════════════════════════════════════════════
   DesignStepHeader — barra in alto di ogni step del Design System
   ═══════════════════════════════════════════════════════════════════════════
   Mostra "STEP n OF 8", un segmento di avanzamento per ogni step, il nome dello step
   corrente e il pulsante "Overview".

   - `stepNumber` lo calcola il context in base al percorso scelto (A o B): non va
     scritto a mano nelle pagine (nei mockup era fisso, ed era sbagliato in un caso).
   - "Overview" porta alla dashboard ed è disabilitato finché la dashboard non è
     sbloccata (FR-11): conviene mostrarlo come non cliccabile, il title spiega perché.
   - Il pulsante del chatbot (icona a fumetto nei mockup) non è ancora implementato:
     andrà aggiunto in fondo a questa barra.

   PER LA GRAFICA
   - `.ds-step-header` contenitore · `.ds-step-count` testo "Step n of 8"
   - `.ds-step-segments` lista dei segmenti; ogni `.ds-step-segment` può avere
       `--done` (step già passati) o `--current` (step attuale)
   - `.ds-step-label` nome dello step · `.ds-overview-btn` (stato :disabled)
   ═══════════════════════════════════════════════════════════════════════════ */
function DesignStepHeader({ stepNumber, label }) {
  const { dashboardUnlocked, goToDashboard } = useDesign();

  function segmentClass(position) {
    if (position === stepNumber) return 'ds-step-segment ds-step-segment--current';
    if (stepNumber && position < stepNumber) return 'ds-step-segment ds-step-segment--done';
    return 'ds-step-segment';
  }

  return (
    <header className="ds-step-header">
      <div className="ds-step-progress">
        <span className="ds-step-count">Step {stepNumber ?? '–'} of {TOTAL_STEPS}</span>
        <ol className="ds-step-segments" aria-hidden="true">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => <li key={i} className={segmentClass(i + 1)} />)}
        </ol>
        <span className="ds-step-label">{label}</span>
      </div>

      <button
        type="button"
        className="ds-overview-btn"
        onClick={goToDashboard}
        disabled={!dashboardUnlocked}
        title={dashboardUnlocked ? 'Project overview' : 'Available after a first pass through all sections'}
      >
        Overview
      </button>
    </header>
  );
}

export default DesignStepHeader;
