import { normalizeOptions } from '../../data/designSections';

/* ═══════════════════════════════════════════════════════════════════════════
   DesignField — un singolo campo di una sezione del Design System
   ═══════════════════════════════════════════════════════════════════════════
   Il tipo di controllo lo decide lo schema (src/data/designSections.js):
     field.type     'single' (una scelta) · 'multi' (più scelte) · 'text' (testo libero)
     field.display  come mostrarlo: 'chips' · 'cards' · 'radio' · 'segmented' · 'select' · 'slider'

   PER LA GRAFICA
   - Il markup è volutamente essenziale: si può cambiare liberamente struttura e classi,
     purché restino le chiamate a `onChange(...)` e i valori passati (vedi sotto).
   - Classe radice: `ds-field` + `ds-field--<display>` (es. ds-field--chips, ds-field--slider),
     per i campi di testo `ds-field--text`.
   - Opzioni (chips/cards/radio/segmented): ogni opzione è un <button class="ds-option">.
       selezionata  → classe `ds-option--selected` (+ aria-pressed / aria-checked = true)
       titolo       → `.ds-option-title`, descrizione (cards e radio) → `.ds-option-description`
     Nel 'segmented' la descrizione dell'opzione scelta compare sotto, in `.ds-option-detail`.
   - Slider: <input type="range" class="ds-range"> + <output class="ds-range-value">.
     Finché l'utente non sceglie, il range ha `data-unset="true"` e il valore mostra "—":
     conviene stilarlo come "non impostato" (es. pallino grigio).
   - Testo: <textarea class="ds-textarea">. Select: <select class="ds-select">.
   - Etichetta del campo: `.ds-field-label`.

   VALORI (non cambiarli: sono quelli che finiscono nel backend e nel PDF)
     single → stringa (il testo dell'opzione, '' se nessuna)
     multi  → array di stringhe
     text   → stringa
   ═══════════════════════════════════════════════════════════════════════════ */
function DesignField({ field, value, onChange }) {
  const options = normalizeOptions(field.options);
  const id = `ds-field-${field.key.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`;
  const className = `ds-field ds-field--${field.display || field.type}`;

  // ── Testo libero ──
  if (field.type === 'text') {
    return (
      <div className={className}>
        <label htmlFor={id} className="ds-field-label">{field.label}</label>
        <textarea
          id={id}
          className="ds-textarea"
          value={value || ''}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  // ── Menu a tendina ──
  if (field.display === 'select') {
    return (
      <div className={className}>
        <label htmlFor={id} className="ds-field-label">{field.label}</label>
        <select id={id} className="ds-select" value={value || ''} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select…</option>
          {options.map((o) => <option key={o.value} value={o.value}>{o.value}</option>)}
        </select>
      </div>
    );
  }

  // ── Slider su scala discreta ──
  // Il range lavora sull'indice dell'opzione; il valore salvato è il testo (es. "70%", "Daily").
  if (field.display === 'slider') {
    const index = options.findIndex((o) => o.value === value);
    const unset = index === -1;
    return (
      <div className={className}>
        <label htmlFor={id} className="ds-field-label">{field.label}</label>
        <input
          id={id}
          type="range"
          className="ds-range"
          min={0}
          max={options.length - 1}
          step={1}
          value={unset ? 0 : index}
          data-unset={unset ? 'true' : undefined}
          onChange={(e) => onChange(options[Number(e.target.value)].value)}
        />
        <output htmlFor={id} className="ds-range-value">{unset ? '—' : value}</output>
      </div>
    );
  }

  // ── Gruppi di opzioni: chips, cards, radio, segmented ──
  const multi = field.type === 'multi';
  const selected = multi ? value || [] : value;

  // Multi: aggiunge/toglie l'opzione. Single: la seleziona, o la deseleziona se già scelta.
  function toggle(optionValue) {
    if (multi) {
      onChange(selected.includes(optionValue)
        ? selected.filter((v) => v !== optionValue)
        : [...selected, optionValue]);
    } else {
      onChange(selected === optionValue ? '' : optionValue);
    }
  }

  const showDescriptionInside = field.display !== 'segmented';
  const activeDescription = !multi && !showDescriptionInside
    ? options.find((o) => o.value === selected)?.description
    : null;

  return (
    <div className={className}>
      <span id={id} className="ds-field-label">{field.label}</span>
      <div className="ds-options" role={multi ? 'group' : 'radiogroup'} aria-labelledby={id}>
        {options.map((o) => {
          const isOn = multi ? selected.includes(o.value) : selected === o.value;
          return (
            <button
              key={o.value}
              type="button"
              className={`ds-option${isOn ? ' ds-option--selected' : ''}`}
              role={multi ? undefined : 'radio'}
              aria-pressed={multi ? isOn : undefined}
              aria-checked={multi ? undefined : isOn}
              onClick={() => toggle(o.value)}
            >
              <span className="ds-option-title">{o.value}</span>
              {o.description && showDescriptionInside && (
                <span className="ds-option-description">{o.description}</span>
              )}
            </button>
          );
        })}
      </div>
      {activeDescription && <p className="ds-option-detail">{activeDescription}</p>}
    </div>
  );
}

export default DesignField;
