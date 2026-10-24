import { useState } from 'react';
import Navbar from '../../components/Navbar';
import DesignStepHeader from '../../components/design/DesignStepHeader';
import SaveDraftButton from '../../components/design/SaveDraftButton';
import { useDesign } from '../../context/DesignContext';
import { SPARK_STEP } from '../../data/designSections';

/* ═══════════════════════════════════════════════════════════════════════════
   Pagina `ds-spark` — Step 0 "The Spark" (FR-1…FR-3), mockup "STEP 1 OF 8"
   ═══════════════════════════════════════════════════════════════════════════
   Testo libero e facoltativo sull'idea del progetto.
   - "Skip this step"             → va a Context senza salvare nulla.
   - "Let AI analyze & continue"  → salva il testo e va a Context. Il backend usa il testo
                                    per precompilare le sezioni vuote (lato frontend non c'è AI).
                                    Se il testo è vuoto o invariato si comporta come Skip.
   - "Save as a draft"            → salva prima il testo (se cambiato), poi la bozza.

   PER LA GRAFICA
   - Pagina: `.ds-page.ds-page--spark` · contenuto in `.ds-main`
   - Card "Your Project Notes": `.ds-group.ds-group--spark` con <textarea class="ds-textarea">
   - Pulsanti in `.ds-actions`: `.ds-btn--secondary` (Skip, Save) e `.ds-btn--primary` (Continue)
   - Errori: `.ds-error`
   ═══════════════════════════════════════════════════════════════════════════ */
function DesignSpark({ onOpenLogin, onOpenSignup }) {
  const { status, submitSpark, skipSpark, saving, error } = useDesign();
  const [text, setText] = useState(status?.spark || '');
  const trimmed = text.trim();
  const changed = trimmed !== (status?.spark || '');

  function handleContinue() {
    if (!trimmed || !changed) return skipSpark();
    return submitSpark(text);
  }

  return (
    <div className="ds-page ds-page--spark">
      <Navbar onLogin={onOpenLogin} onSignup={onOpenSignup} />
      <DesignStepHeader stepNumber={1} label={SPARK_STEP.navLabel} />

      <main className="ds-main">
        <h1>{SPARK_STEP.title}</h1>
        <p className="ds-intro">{SPARK_STEP.description}</p>

        <section className="ds-group ds-group--spark">
          <label htmlFor="ds-spark-text" className="ds-group-title">Your Project Notes</label>
          <p className="ds-group-description">What kind of experience or game do you want to build? Write freely — no structure needed.</p>
          <textarea id="ds-spark-text" className="ds-textarea" value={text} onChange={(e) => setText(e.target.value)} />
        </section>

        {error && <p className="ds-error" role="alert">{error}</p>}

        <div className="ds-actions">
          <button type="button" className="ds-btn ds-btn--secondary" onClick={skipSpark} disabled={saving}>
            Skip this step
          </button>
          <SaveDraftButton
            onOpenLogin={onOpenLogin}
            beforeSave={changed ? () => submitSpark(text, { navigate: false }) : undefined}
          />
          <button type="button" className="ds-btn ds-btn--primary" onClick={handleContinue} disabled={saving}>
            {saving ? 'Analyzing…' : 'Let AI analyze & continue'}
          </button>
        </div>
      </main>
    </div>
  );
}

export default DesignSpark;
