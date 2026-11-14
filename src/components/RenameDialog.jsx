import { useEffect, useState } from 'react';

/* Popup to rename something (e.g. a PDF of a project): a text field, Cancel and Save.
   Enter saves, Escape or a click outside cancels. */
function RenameDialog({
    title,
    label = 'Name',
    initialValue = '',
    hint = null,
    busy = false,
    error = null,
    onSave,
    onCancel,
}) {
    const [value, setValue] = useState(initialValue);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape' && !busy) onCancel();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [busy, onCancel]);

    function submit(e) {
        e.preventDefault();
        if (value.trim() && !busy) onSave(value.trim());
    }

    return (
        <div className="confirm-overlay" onClick={() => !busy && onCancel()}>
            <form
                className="confirm-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="rename-dialog-title"
                onClick={(e) => e.stopPropagation()}
                onSubmit={submit}
            >
                <h2 id="rename-dialog-title">{title}</h2>
                <label
                    htmlFor="rename-dialog-input"
                    className="confirm-dialog-label"
                >
                    {label}
                </label>
                <input
                    id="rename-dialog-input"
                    className="confirm-dialog-input"
                    type="text"
                    maxLength={100}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    disabled={busy}
                    autoFocus
                    onFocus={(e) => e.target.select()}
                />
                {hint && <p className="confirm-dialog-hint">{hint}</p>}
                {error && (
                    <p className="confirm-dialog-error" role="alert">
                        {error}
                    </p>
                )}
                <div className="confirm-dialog-actions">
                    <button
                        type="button"
                        className="confirm-dialog-cancel"
                        onClick={onCancel}
                        disabled={busy}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="confirm-dialog-save"
                        disabled={busy || !value.trim()}
                    >
                        {busy ? 'Saving…' : 'Save'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default RenameDialog;
