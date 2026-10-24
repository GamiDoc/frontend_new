import Navbar from '../../components/Navbar';
import DesignStepHeader from '../../components/design/DesignStepHeader';
import DesignSectionForm from '../../components/design/DesignSectionForm';
import SaveDraftButton from '../../components/design/SaveDraftButton';
import LoginReminder from '../../components/design/LoginReminder';
import { useDesign } from '../../context/DesignContext';
import { getSection, SPARK_STEP } from '../../data/designSections';

/* ═══════════════════════════════════════════════════════════════════════════
   Pagina `ds-section` — una delle 7 sezioni (Context, Experience Timeline, …)
   ═══════════════════════════════════════════════════════════════════════════
   Una sola pagina per tutte le sezioni: quale mostrare lo dice `currentSection` del
   context, e i campi arrivano dallo schema (src/data/designSections.js). Per cambiare
   l'aspetto di una sezione specifica si usa la classe `.ds-page--<id sezione>`.

   - "Go back to …"      → sezione precedente nel percorso scelto (per Context: la Spark).
                           L'etichetta è calcolata: nei mockup era scritta a mano e sbagliata.
   - "Continue"          → salva e va avanti (scelta del percorso, sezione dopo o dashboard).
   - "Skip this section" → solo al primo passaggio, sulla sezione da fare (FR-7).
                           Non è nei mockup: posizione e stile sono da definire.
   - Le modifiche alle sezioni già visitate si salvano da sole (auto-save).
   - Se si arriva a una sezione non ancora apribile, la pagina lo dice e propone quella giusta.

   PER LA GRAFICA
   - Pagina: `.ds-page.ds-page--section.ds-page--<id>` · contenuto in `.ds-main`
   - Form: vedi DesignSectionForm e DesignField · pulsanti in `.ds-actions`
     (`.ds-btn--secondary`, `.ds-btn--link`, `.ds-btn--primary`) · errori `.ds-error`
   ═══════════════════════════════════════════════════════════════════════════ */
function DesignSection({ onOpenLogin, onOpenSignup }) {
  const {
    currentSection, drafts, updateField, canOpenSection, frontier, firstPassDone,
    stepNumberOf, previousOf, continueFrom, goBackFrom, goToSection, saving, error,
  } = useDesign();

  const section = getSection(currentSection);

  // Sezione bloccata (primo passaggio non ancora arrivato qui).
  if (!section || !canOpenSection(currentSection)) {
    return (
      <div className="ds-page ds-page--locked">
        <Navbar onLogin={onOpenLogin} onSignup={onOpenSignup} />
        <main className="ds-main">
          <p>On the first pass, sections open in order.</p>
          {frontier && (
            <button type="button" className="ds-btn ds-btn--primary" onClick={() => goToSection(frontier)}>
              Go to {getSection(frontier).title}
            </button>
          )}
        </main>
      </div>
    );
  }

  const previous = previousOf(currentSection);
  const backLabel = previous ? getSection(previous).title : SPARK_STEP.navLabel;
  const canSkip = !firstPassDone && currentSection === frontier;

  return (
    <div className={`ds-page ds-page--section ds-page--${section.id}`}>
      <Navbar onLogin={onOpenLogin} onSignup={onOpenSignup} />
      <DesignStepHeader stepNumber={stepNumberOf(currentSection)} label={section.title} />
      <LoginReminder onOpenLogin={onOpenLogin} />

      <main className="ds-main">
        <h1>{section.title}</h1>

        <DesignSectionForm
          section={section}
          values={drafts[currentSection]}
          onChange={(key, value) => updateField(currentSection, key, value)}
        />

        {error && <p className="ds-error" role="alert">{error}</p>}

        <div className="ds-actions">
          <button type="button" className="ds-btn ds-btn--secondary" onClick={() => goBackFrom(currentSection)} disabled={saving}>
            ‹ Go back to {backLabel}
          </button>
          <SaveDraftButton onOpenLogin={onOpenLogin} />
          {canSkip && (
            <button type="button" className="ds-btn ds-btn--link" onClick={() => continueFrom(currentSection, { skip: true })} disabled={saving}>
              Skip this section
            </button>
          )}
          <button type="button" className="ds-btn ds-btn--primary" onClick={() => continueFrom(currentSection)} disabled={saving}>
            {saving ? 'Saving…' : 'Continue ›'}
          </button>
        </div>
      </main>
    </div>
  );
}

export default DesignSection;
