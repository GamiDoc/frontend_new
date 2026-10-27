import { useState } from 'react';
import {
    normalizeOptions,
    otherKey,
    emptyItem,
} from '../../data/designSections';

/*
FOR FUTURE CSS STYLING (comment to later move to pertinent CSS files):
 * * Markup is needed: it can be used to change structure and classes
 * * The classes used are `ds-field` + `ds-field--<display>` (es. ds-field--chips, ds-field--slider) and `ds-field--text`
 *   `ds-field--half` marks a text input meant to sit next to another one
 * * Sub-heading above a field (field.title / field.hint): `.ds-field-title`, `.ds-field-hint`
 * * Options (chips/cards): every option is a <button class="ds-option"> that can be selected
 *   `ds-option--selected` (+ aria-pressed / aria-checked = true) and have a title (`.ds-option-title`and for cards, `.ds-option-description`)
 * * "Other" option: `.ds-option--other`; when selected, an input `.ds-other-input` appears below
 * * Checkboxes (checklist / checks): <label class="ds-check"> with <input type="checkbox" class="ds-check-input">,
 *   `.ds-check-title` and optional `.ds-check-description`. Checklist columns: `.ds-checks--cols-<n>`
 * * Info icon (ⓘ) next to an option: `.ds-info` (the text is in the `title` attribute)
 * * Slider: <input type="range" class="ds-range"> + <output class="ds-range-value">. Until the user chooses, the range has `data-unset="true"` and the value shows "—"
 * * Text: <textarea class="ds-textarea"> or, for one-line fields, <input class="ds-input">
 * * Select: <select class="ds-select">
 * * Game loop (display 'loop'): <details class="ds-loop"> with `.ds-loop-badge` and `.ds-loop-description` in the summary
 * * List (repeatable blocks, e.g. feedback components): `.ds-list`, tabs `.ds-list-tab` (`--active`),
 *   add button `.ds-list-add`, the open item `.ds-list-item` with `.ds-list-item-name` and `.ds-list-remove`
 * * Field Label: `.ds-field-label`
 */
/**
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * DesignField — single field in the design system sections
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * The control type is decided by "src/data/designSections.js":
 * * field.type: 'single', 'multi', 'text' (free text) or 'list' (repeatable block)
 * * field.display: 'chips', 'cards', 'checklist', 'checks', 'select', 'slider' for options;
 *   'textarea' (default), 'input' or 'loop' for text
 *
 * `values` holds all the values of the section: the field reads `values[field.key]` and,
 * for "Other", `values[otherKey(field)]`. Changes go to `onChange(key, value)`.
 */
function DesignField({ field, values, onChange }) {
    const id = `ds-field-${field.key.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`;
    const className = [
        'ds-field',
        `ds-field--${field.display || field.type}`,
        field.half && 'ds-field--half',
    ]
        .filter(Boolean)
        .join(' ');
    const value = values[field.key];
    const set = (v) => onChange(field.key, v);

    const heading = (field.title || field.hint) && (
        <div className="ds-field-heading">
            {field.title && <h3 className="ds-field-title">{field.title}</h3>}
            {field.hint && <p className="ds-field-hint">{field.hint}</p>}
        </div>
    );
    const label = field.label && (
        <label htmlFor={id} className="ds-field-label">
            {field.label}
        </label>
    );

    // -- Repeatable block (e.g. feedback components) -------------------
    if (field.type === 'list') {
        return (
            <div className={className}>
                {heading}
                <DesignList field={field} items={value || []} onChange={set} />
            </div>
        );
    }

    // -- Game loop: expandable row with a free-text description --------
    if (field.display === 'loop') {
        return (
            <div className={className}>
                {heading}
                <details className="ds-loop">
                    <summary>
                        <span className="ds-loop-badge">{field.badge}</span>
                        <span className="ds-loop-description">
                            {field.description}
                        </span>
                    </summary>
                    <textarea
                        id={id}
                        className="ds-textarea"
                        aria-label={field.badge}
                        value={value || ''}
                        placeholder="Type here"
                        onChange={(e) => set(e.target.value)}
                    />
                </details>
            </div>
        );
    }

    // -- Free text -----------------------------------------------------
    if (field.type === 'text') {
        const Control = field.display === 'input' ? 'input' : 'textarea';
        return (
            <div className={className}>
                {heading}
                {label}
                <Control
                    id={id}
                    className={
                        field.display === 'input' ? 'ds-input' : 'ds-textarea'
                    }
                    aria-label={
                        field.label ? undefined : field.title || field.key
                    }
                    value={value || ''}
                    placeholder={field.placeholder || 'Type here'}
                    onChange={(e) => set(e.target.value)}
                />
            </div>
        );
    }

    const options = normalizeOptions(field.options);

    // -- Drop-down menu ------------------------------------------------
    if (field.display === 'select') {
        return (
            <div className={className}>
                {heading}
                {label}
                <select
                    id={id}
                    className="ds-select"
                    value={value || ''}
                    onChange={(e) => set(e.target.value)}
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

    // -- Slider (with discrete steps) ----------------------------------
    // The value saved is the text (e.g "Medium").
    if (field.display === 'slider') {
        const index = options.findIndex((o) => o.value === value);
        const unset = index === -1;
        return (
            <div className={className}>
                {heading}
                {label}
                <input
                    id={id}
                    type="range"
                    className="ds-range"
                    min={0}
                    max={options.length - 1}
                    step={1}
                    value={unset ? 0 : index}
                    data-unset={unset ? 'true' : undefined}
                    onChange={(e) => set(options[Number(e.target.value)].value)}
                />
                <output htmlFor={id} className="ds-range-value">
                    {unset ? '—' : value}
                </output>
            </div>
        );
    }

    // -- Option groups: chips, cards, checklist, checks -----------------
    const multi = field.type === 'multi';
    const selected = multi ? value || [] : value;
    const isOn = (v) => (multi ? selected.includes(v) : selected === v);

    // Multi: add/remove option. Single: select/deselect (if already chosen).
    function toggle(optionValue) {
        if (multi)
            set(
                isOn(optionValue)
                    ? selected.filter((v) => v !== optionValue)
                    : [...selected, optionValue],
            );
        else set(selected === optionValue ? '' : optionValue);
    }

    const all = field.other
        ? [...options, { value: 'Other', other: true }]
        : options;
    const otherInput = field.other && isOn('Other') && (
        <input
            className="ds-input ds-other-input"
            aria-label={`${field.title || field.label || field.key}: other`}
            placeholder="Specify other"
            value={values[otherKey(field)] || ''}
            onChange={(e) => onChange(otherKey(field), e.target.value)}
        />
    );
    const info = (o) =>
        o.info && (
            <span className="ds-info" title={o.info} aria-label={o.info}>
                ⓘ
            </span>
        );

    if (field.display === 'checklist' || field.display === 'checks') {
        return (
            <div className={className}>
                {heading}
                {label}
                <div
                    className={`ds-checks${field.columns ? ` ds-checks--cols-${field.columns}` : ''}`}
                    role="group"
                    aria-label={field.title || field.label || field.key}
                >
                    {all.map((o) => (
                        <label
                            key={o.value}
                            className={`ds-check${o.other ? ' ds-check--other' : ''}`}
                        >
                            <input
                                type="checkbox"
                                className="ds-check-input"
                                checked={isOn(o.value)}
                                onChange={() => toggle(o.value)}
                            />
                            <span className="ds-check-text">
                                <span className="ds-check-title">
                                    {o.value}
                                    {info(o)}
                                </span>
                                {o.description && (
                                    <span className="ds-check-description">
                                        {o.description}
                                    </span>
                                )}
                            </span>
                        </label>
                    ))}
                </div>
                {otherInput}
            </div>
        );
    }

    return (
        <div className={className}>
            {heading}
            {label}
            <div
                className="ds-options"
                role={multi ? 'group' : 'radiogroup'}
                aria-label={field.title || field.label || field.key}
            >
                {all.map((o) => (
                    <button
                        key={o.value}
                        type="button"
                        className={`ds-option${isOn(o.value) ? ' ds-option--selected' : ''}${o.other ? ' ds-option--other' : ''}`}
                        role={multi ? undefined : 'radio'}
                        aria-pressed={multi ? isOn(o.value) : undefined}
                        aria-checked={multi ? undefined : isOn(o.value)}
                        onClick={() => toggle(o.value)}
                    >
                        {o.other && (
                            <span className="ds-option-plus" aria-hidden="true">
                                +
                            </span>
                        )}
                        <span className="ds-option-title">{o.value}</span>
                        {info(o)}
                        {o.description && (
                            <span className="ds-option-description">
                                {o.description}
                            </span>
                        )}
                    </button>
                ))}
            </div>
            {otherInput}
        </div>
    );
}

/**
 * DesignList — repeatable block: one tab per item, the selected item is shown below.
 * Each item is an object { Name, <item field key>: value, … }.
 */
function DesignList({ field, items, onChange }) {
    const [selected, setSelected] = useState(0);
    const active = Math.min(selected, items.length - 1);

    function update(index, key, value) {
        onChange(
            items.map((item, i) =>
                i === index ? { ...item, [key]: value } : item,
            ),
        );
    }

    function add() {
        onChange([...items, emptyItem(field)]);
        setSelected(items.length);
    }

    function remove(index) {
        onChange(items.filter((_, i) => i !== index));
        setSelected(Math.max(0, index - 1));
    }

    const item = items[active];
    const prefix = `${field.key} ${active + 1}`;

    return (
        <div className="ds-list">
            <div className="ds-list-tabs" role="tablist">
                {items.map((it, i) => (
                    <button
                        key={i}
                        type="button"
                        role="tab"
                        aria-selected={i === active}
                        className={`ds-list-tab${i === active ? ' ds-list-tab--active' : ''}`}
                        onClick={() => setSelected(i)}
                    >
                        {it.Name || field.itemLabel}
                    </button>
                ))}
                <button type="button" className="ds-list-add" onClick={add}>
                    + {field.itemLabel}
                </button>
            </div>

            {item && (
                <div className="ds-list-item" role="tabpanel">
                    <div className="ds-list-item-header">
                        <input
                            className="ds-input ds-list-item-name"
                            aria-label="Component name"
                            placeholder={field.itemLabel}
                            value={item.Name || ''}
                            onChange={(e) =>
                                update(active, 'Name', e.target.value)
                            }
                        />
                        <button
                            type="button"
                            className="ds-list-remove"
                            onClick={() => remove(active)}
                        >
                            Delete
                        </button>
                    </div>
                    {field.itemFields.map((sub) => {
                        const key = `${prefix} · ${sub.key}`;
                        return (
                            <DesignField
                                key={key}
                                field={{ ...sub, key }}
                                values={{
                                    [key]: item[sub.key],
                                    [`${key} · Other`]: item[otherKey(sub)],
                                }}
                                onChange={(k, value) =>
                                    update(
                                        active,
                                        k === key ? sub.key : otherKey(sub),
                                        value,
                                    )
                                }
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default DesignField;
