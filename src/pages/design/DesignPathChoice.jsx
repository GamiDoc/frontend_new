import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { useDesign } from '../../context/DesignContext';
import { PATH_INFO } from '../../data/designSections';

/* ═══════════════════════════════════════════════════════════════════════════
   Pagina `ds-path` — "Where to next?" dopo Context (FR-5, FR-6)
   ═══════════════════════════════════════════════════════════════════════════
   L'utente sceglie il percorso del primo passaggio:
     A = Experience Timeline & Personification prima (1,2,3,4,5,6,7)
     B = Gameful Core & Technology prima           (1,4,5,2,3,6,7)
   Il backend suggerisce un percorso: se c'è la Spark il suggerimento viene dall'AI
   (basis 'spark'), altrimenti è A di default (basis 'default') e il testo lo dice.
   L'opzione suggerita è preselezionata; la scelta è definitiva (il backend non la fa cambiare).

   PER LA GRAFICA
   - Le due card sono <button class="ds-path-option"> con role="radio";
     quella scelta ha `ds-path-option--selected` e aria-checked="true".
   - Dentro: `.ds-path-badge` ("Recommended" / "Alternative"), `.ds-path-title`,
     `.ds-path-blurb`, `.ds-path-tags`. I testi stanno in PATH_INFO (designSections.js).
   ═══════════════════════════════════════════════════════════════════════════ */
function DesignPathChoice({ onOpenLogin, onOpenSignup }) {
  const { loadBranchRecommendation, choosePath, goToSection, saving, error } = useDesign();
  const [recommendation, setRecommendation] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let cancelled = false;
    loadBranchRecommendation().then((r) => {
      if (cancelled) return;
      setRecommendation(r);
      setSelected(r.recommendedPath);
    });
    return () => { cancelled = true; };
  }, [loadBranchRecommendation]);

  if (!recommendation) {
    return (
      <div className="ds-page ds-page--path">
        <Navbar onLogin={onOpenLogin} onSignup={onOpenSignup} />
        <main className="ds-main"><p className="ds-loading">Loading…</p></main>
      </div>
    );
  }

  const recommended = recommendation.recommendedPath;
  const alternative = recommended === 'A' ? 'B' : 'A';

  return (
    <div className="ds-page ds-page--path">
      <Navbar onLogin={onOpenLogin} onSignup={onOpenSignup} />
      <main className="ds-main">
        <h1>Where to next?</h1>
        <p className="ds-intro">
          {recommendation.basis === 'spark'
            ? "Based on your project notes, here's what AI recommends."
            : 'Choose which part of your design to work on next.'}
        </p>

        <div className="ds-path-options" role="radiogroup" aria-label="Next sections">
          {[recommended, alternative].map((p) => (
            <button
              key={p}
              type="button"
              role="radio"
              aria-checked={selected === p}
              className={`ds-path-option${selected === p ? ' ds-path-option--selected' : ''}`}
              onClick={() => setSelected(p)}
            >
              <span className="ds-path-badge">{p === recommended ? 'Recommended' : 'Alternative'}</span>
              <span className="ds-path-title">{PATH_INFO[p].title}</span>
              <span className="ds-path-blurb">{PATH_INFO[p].blurb}</span>
              <span className="ds-path-tags">{PATH_INFO[p].tags.join(' · ')}</span>
            </button>
          ))}
        </div>

        {error && <p className="ds-error" role="alert">{error}</p>}

        <div className="ds-actions">
          <button type="button" className="ds-btn ds-btn--secondary" onClick={() => goToSection(1)} disabled={saving}>
            ‹ Go back
          </button>
          <button type="button" className="ds-btn ds-btn--primary" onClick={() => choosePath(selected)} disabled={saving || !selected}>
            Proceed to the next step ›
          </button>
        </div>
      </main>
    </div>
  );
}

export default DesignPathChoice;
