import { useState } from 'react';
import { useDesign } from '../../context/DesignContext';
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
 * * Image (display 'image'): drop zone `.ds-image-drop` (`--over` while dragging, `--busy` while uploading),
 *   then the preview `.ds-image-preview` with <img> and `.ds-image-remove`; errors in `.ds-image-error`
 * * Game loop (display 'loop'): clickable row `.ds-loop` with `.ds-loop-badge` and `.ds-loop-description`;
 *   it opens <dialog class="ds-popup"> with `.ds-popup-title`, `.ds-popup-intro` and the loop's questions
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
 * `popupFields` ('loop' display only) are the questions shown inside the loop's pop-up.
 */
function DesignField({ field, values, onChange, popupFields = [] }) {
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
            {field.title && (
                <span className="ds-field-title">{field.title}</span>
            )}
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

    // -- Game loop: row that opens a pop-up with the loop's questions ----
    if (field.display === 'loop') {
        // Function to show/hide pop up
        const openPopup = (key) => {
            const dialog = document.getElementById(`ds-popup-${key}`);
            dialog.showModal();
        };
        const closePopup = (key) => {
            const dialog = document.getElementById(`ds-popup-${key}`);
            dialog.close();
        };
        return (
            <>
                <dialog
                    className="ds-popup"
                    id={`ds-popup-${id}`}
                    popover="auto"
                >
                    <div>
                        <button
                            type="button"
                            className="ds-btn ds-btn-popup--close top-popup-btn"
                            onClick={() => closePopup(id)}
                        >
                            &lt;&lt;&nbsp;&nbsp;Back to the Gameful Core
                        </button>
                        <h2 className="ds-popup-title">{field.badge}</h2>
                        {field.popupIntro && (
                            <p className="ds-popup-intro">{field.popupIntro}</p>
                        )}
                        {popupFields.map((f) => (
                            <DesignField
                                key={f.key}
                                field={f}
                                values={values}
                                onChange={onChange}
                            />
                        ))}
                        <button
                            type="button"
                            className="ds-btn ds-btn-popup--close bottom-popup-btn"
                            onClick={() => closePopup(id)}
                        >
                            &lt;&nbsp;&nbsp;Back
                        </button>
                    </div>
                </dialog>
                <div className={className}>
                    {heading}
                    <div
                        className="ds-loop"
                        onClick={() => openPopup(id)}
                        popoverTarget={`ds-popup-${id}`}
                    >
                        <span className="ds-loop-badge ds-btn">
                            {field.badge}
                        </span>
                        <span className="ds-loop-description">
                            {field.description}
                        </span>
                    </div>
                </div>
            </>
        );
    }

    // -- Image upload (value = URL of the uploaded file) ----------------
    if (field.display === 'image') {
        return (
            <div className={className}>
                {heading}
                {label}
                <ImageField
                    id={id}
                    field={field}
                    value={value}
                    onChange={set}
                />
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

    if (field.display == 'cards') {
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
                            <span className="ds-option-outer-icon">
                                <span className="ds-option-inner-icon"></span>
                            </span>

                            {o.other && (
                                <span
                                    className="ds-option-plus"
                                    aria-hidden="true"
                                >
                                    +
                                </span>
                            )}
                            <span className="ds-option-content">
                                <span className="ds-option-title">
                                    {o.value}
                                </span>
                                {info(o)}
                                {o.description && (
                                    <span className="ds-option-description">
                                        {o.description}
                                    </span>
                                )}
                            </span>
                        </button>
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
                        <span className="ds-option-content">
                            <span className="ds-option-title">{o.value}</span>
                            {info(o)}
                            {o.description && (
                                <span className="ds-option-description">
                                    {o.description}
                                </span>
                            )}
                        </span>
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

/* PNG/JPEG drop zone: the file is uploaded at once and the field keeps its URL.
   Click or drag & drop; the preview has a "Remove" button (the file stays on the server).
   Before the upload the image is compressed in the browser (see compressImage). */
const IMAGE_TYPES = ['image/png', 'image/jpeg'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // same limit as the backend
const MAX_IMAGE_SIDE = 2000; // px: plenty for a sketch, the PDF prints it at 17 cm
const KEEP_AS_IS_BYTES = 500 * 1024; // small enough: uploaded untouched
const JPEG_QUALITY = 0.85;

/* Shrinks the image to MAX_IMAGE_SIDE and re-encodes it: JPEG for photos and opaque
   images, PNG when it has transparency (JPEG would lose it). Small images, and results
   that would not be lighter, keep the original file. */
async function compressImage(file) {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(
        1,
        MAX_IMAGE_SIDE / Math.max(bitmap.width, bitmap.height),
    );
    if (scale === 1 && file.size <= KEEP_AS_IS_BYTES) {
        bitmap.close();
        return file;
    }

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const transparent =
        file.type === 'image/png' && hasTransparency(ctx, canvas);
    const type = transparent ? 'image/png' : 'image/jpeg';
    if (type === 'image/jpeg') {
        // JPEG has no alpha: paint a white background under the image
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, type, JPEG_QUALITY),
    );
    if (!blob || (scale === 1 && blob.size >= file.size)) return file;

    const name =
        file.name.replace(/\.\w+$/, '') + (transparent ? '.png' : '.jpg');
    return new File([blob], name, { type });
}

function hasTransparency(ctx, canvas) {
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 3; i < data.length; i += 4) if (data[i] < 255) return true;
    return false;
}

function ImageField({ id, field, value, onChange }) {
    const { uploadImage } = useDesign();
    const [over, setOver] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);

    async function handleFile(original) {
        if (!original) return;
        if (!IMAGE_TYPES.includes(original.type)) {
            setError('Only PNG and JPEG images are accepted.');
            return;
        }
        setError(null);
        setBusy(true);
        try {
            let file = original;
            try {
                file = await compressImage(original);
            } catch {
                // the browser could not decode it: try the original file
            }
            if (file.size > MAX_IMAGE_BYTES) {
                setError('The image is larger than 5 MB, even compressed.');
                return;
            }
            onChange(await uploadImage(file));
        } catch (e) {
            setError(e.message || 'Upload failed. Please try again.');
        } finally {
            setBusy(false);
        }
    }

    if (value) {
        return (
            <div className="ds-image-preview">
                <img src={value} alt={field.label || field.key} />
                <button
                    type="button"
                    className="ds-image-remove"
                    onClick={() => onChange('')}
                >
                    Remove
                </button>
            </div>
        );
    }

    return (
        <>
            <label
                htmlFor={id}
                className={`ds-image-drop${over ? ' ds-image-drop--over' : ''}${busy ? ' ds-image-drop--busy' : ''}`}
                onDragOver={(e) => {
                    e.preventDefault();
                    setOver(true);
                }}
                onDragLeave={() => setOver(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setOver(false);
                    handleFile(e.dataTransfer.files[0]);
                }}
            >
                <span className="ds-image-drop-title">
                    {busy
                        ? 'Uploading…'
                        : 'Drop an image here or click to choose'}
                </span>
                <span className="ds-image-drop-hint">
                    PNG or JPEG, up to 5 MB
                </span>
                <input
                    id={id}
                    type="file"
                    accept="image/png,image/jpeg"
                    hidden
                    disabled={busy}
                    onChange={(e) => {
                        handleFile(e.target.files[0]);
                        e.target.value = '';
                    }}
                />
            </label>
            {error && (
                <p className="ds-image-error" role="alert">
                    {error}
                </p>
            )}
        </>
    );
}

export default DesignField;
