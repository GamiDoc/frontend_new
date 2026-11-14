import { useEffect } from 'react';

/* Confirmation popup for an action that cannot be undone (e.g. deleting a PDF).
   Escape or a click outside cancels; the confirm button shows `busyLabel` while working. */
function ConfirmDialog({
    title,
    message,
    confirmLabel = 'Delete',
    busyLabel = 'Deleting…',
    busy = false,
    error = null,
    onConfirm,
    onCancel,
}) {
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape' && !busy) onCancel();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [busy, onCancel]);

    return (
        <div className="confirm-overlay" onClick={() => !busy && onCancel()}>
            <div
                className="confirm-dialog"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-dialog-title"
                aria-describedby="confirm-dialog-message"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 id="confirm-dialog-title">{title}</h2>
                <p id="confirm-dialog-message">{message}</p>
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
                        autoFocus
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="confirm-dialog-confirm"
                        onClick={onConfirm}
                        disabled={busy}
                    >
                        {busy ? busyLabel : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmDialog;
