import DesignField from './DesignField';

/* ═══════════════════════════════════════════════════════════════════════════
   DesignSectionForm — il corpo di una sezione, costruito dallo schema
   ═══════════════════════════════════════════════════════════════════════════
   Per ogni gruppo dello schema (section.groups) disegna un blocco con intestazione e
   campi. Non contiene logica: riceve i valori e passa ogni modifica a `onChange(chiave, valore)`.

   PER LA GRAFICA
   - Contenitore: `.ds-section-form` + `.ds-section-form--<id sezione>`
     (context, timeline, personification, gameful-core, technology, impacts, evaluation),
     utile per stili specifici di una sola sezione.
   - Ogni gruppo è una card: <section class="ds-group ds-group--<id gruppo>" id="ds-group-<id>">.
     Intestazione: `.ds-group-phase` (solo Experience Timeline, "Phase 1…4"),
     `.ds-group-title` (etichetta piccola, es. "DOMAIN"), `.ds-group-question` (domanda grande),
     `.ds-group-description` (testo di supporto).
   - Experience Timeline: la barra a schede in alto (`.ds-tabs`, link `.ds-tab--<fase>`)
     porta all'ancora del gruppo. I colori delle quattro fasi si possono dare con
     .ds-tab--onboarding / --engagement / --mastering / --fidelity e .ds-group--<fase>.
   - Gameful Core, "Game loop": ogni loop è un <details class="ds-loop ds-loop--<short|long|social>">
     apribile; nel <summary> ci sono `.ds-loop-badge` e `.ds-loop-title`.
   ═══════════════════════════════════════════════════════════════════════════ */
function DesignSectionForm({ section, values, onChange }) {
  const tabs = section.groups.filter((g) => g.tab);

  // Campi di un gruppo (e, per i loop del Gameful Core, di un solo loop).
  function renderFields(groupId, loopId) {
    return section.fields
      .filter((f) => f.group === groupId && (loopId === undefined || f.loop === loopId))
      .map((f) => (
        <DesignField key={f.key} field={f} value={values[f.key]} onChange={(v) => onChange(f.key, v)} />
      ));
  }

  return (
    <div className={`ds-section-form ds-section-form--${section.id}`}>
      {tabs.length > 0 && (
        <nav className="ds-tabs" aria-label={`${section.title} phases`}>
          {tabs.map((g) => (
            <a key={g.id} href={`#ds-group-${g.id}`} className={`ds-tab ds-tab--${g.id}`}>{g.tab}</a>
          ))}
        </nav>
      )}

      {section.groups.map((group) => (
        <section key={group.id} id={`ds-group-${group.id}`} className={`ds-group ds-group--${group.id}`}>
          <header className="ds-group-header">
            {group.phase && <span className="ds-group-phase">Phase {group.phase}</span>}
            <span className="ds-group-title">{group.title}</span>
            {group.question && <h2 className="ds-group-question">{group.question}</h2>}
            {group.description && <p className="ds-group-description">{group.description}</p>}
          </header>

          {section.loops && group.id === 'loops'
            ? section.loops.map((loop) => (
              <details key={loop.id} className={`ds-loop ds-loop--${loop.id}`}>
                <summary>
                  <span className="ds-loop-badge">{loop.badge}</span>
                  <span className="ds-loop-title">{loop.title}</span>
                </summary>
                {renderFields(group.id, loop.id)}
              </details>
            ))
            : renderFields(group.id)}
        </section>
      ))}
    </div>
  );
}

export default DesignSectionForm;
