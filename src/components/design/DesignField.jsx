import { normalizeOptions } from '../../data/designSections';

/*
FOR FUTURE CSS STYLING (comment to later move to pertinent CSS files):
 * * Markup is needed: it can be used to change structure and classes
 * * The classes used are `ds-field` + `ds-field--<display>` (es. ds-field--chips, ds-field--slider) and `ds-field--text`
 * * Options (chips/cards/radio/segmented): every option is a  <button class="ds-option"> that can be selected
 * `ds-option--selected` (+ aria-pressed / aria-checked = true) and have a title (`.ds-option-title`and for cards & radio, `.ds-option-description`)
 * * In 'segmented' the description of the chosen option appears in `.ds-option-detail`
 * * Slider: <input type="range" class="ds-range"> + <output class="ds-range-value">. Until the user chooses, the range has `data-unset="true"` and the value shows "—"
 * * Text: <textarea class="ds-textarea">
 * * Select: <select class="ds-select">
 * * Field Label: `.ds-field-label`
 */
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * DesignField — single field in the design system sections
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * The control type is decided by "src/data/designSections.js":
 * * field.type: can be 'single', 'multi' and 'text' (free text)
 * * field.display: can be shown as 'chips', 'cards', 'radio', 'segmented', 'select' and 'slider'
 */
function DesignField({ field, value, onChange }) {
    const options = normalizeOptions(field.options);
    const id = `ds-field-${field.key.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`;
    const className = `ds-field ds-field--${field.display || field.type}`;

    // -- Free text -----------------------------------------------------
    if (field.type === 'text') {
        return (
            <div className={className}>
                <label htmlFor={id} className="ds-field-label">
                    {field.label}
                </label>
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

    // -- Drop-down Menu ---------------------------------------------
    if (field.display === 'select') {
        return (
            <div className={className}>
                <label htmlFor={id} className="ds-field-label">
                    {field.label}
                </label>
                <select
                    id={id}
                    className="ds-select"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                >
                    <option value="">Select…</option>
                    {options.map((o) => (
                        <option key={o.value} value={o.value}>
                            {o.value}
                        </option>
                    ))}
                </select>
            </div>
        );
    }

    // -- Slider (with discrete numbers) -------------------------------------------------------------
    // The value saved is the text (e.g "70%", "Daily").
    if (field.display === 'slider') {
        const index = options.findIndex((o) => o.value === value);
        const unset = index === -1;
        return (
            <div className={className}>
                <label htmlFor={id} className="ds-field-label">
                    {field.label}
                </label>
                <input
                    id={id}
                    type="range"
                    className="ds-range"
                    min={0}
                    max={options.length - 1}
                    step={1}
                    value={unset ? 0 : index}
                    data-unset={unset ? 'true' : undefined}
                    onChange={(e) =>
                        onChange(options[Number(e.target.value)].value)
                    }
                />
                <output htmlFor={id} className="ds-range-value">
                    {unset ? '—' : value}
                </output>
            </div>
        );
    }

    // -- Optional groups: chips, cards, radio, segmented -----------------------------
    const multi = field.type === 'multi';
    const selected = multi ? value || [] : value;

    // Multi: add/remove option. Single: select/deselect (if already chosen).
    function toggle(optionValue) {
        if (multi) {
            onChange(
                selected.includes(optionValue)
                    ? selected.filter((v) => v !== optionValue)
                    : [...selected, optionValue],
            );
        } else {
            onChange(selected === optionValue ? '' : optionValue);
        }
    }

    const showDescriptionInside = field.display !== 'segmented';
    const activeDescription =
        !multi && !showDescriptionInside
            ? options.find((o) => o.value === selected)?.description
            : null;

    return (
        <div className={className}>
            <span id={id} className="ds-field-label">
                {field.label}
            </span>
            <div
                className="ds-options"
                role={multi ? 'group' : 'radiogroup'}
                aria-labelledby={id}
            >
                {options.map((o) => {
                    const isOn = multi
                        ? selected.includes(o.value)
                        : selected === o.value;
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
                                <span className="ds-option-description">
                                    {o.description}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
            {activeDescription && (
                <p className="ds-option-detail">{activeDescription}</p>
            )}
        </div>
    );
}

export default DesignField;
