import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

/* Popup to delete one's own account: lists what is deleted and asks for the password.
   Escape or a click outside cancels (not while deleting). */
function DeleteAccountDialog({ onCancel, onDeleted }) {
    const { user, deleteAccount } = useAuth();
    const [password, setPassword] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape' && !busy) onCancel();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [busy, onCancel]);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!password) {
            setError('Enter your password to confirm.');
            return;
        }
        setBusy(true);
        setError(null);
        try {
            await deleteAccount(password);
            onDeleted();
        } catch (err) {
            setBusy(false);
            if (err.code === 'WRONG_PASSWORD') {
                setError('The password is not correct.');
            } else if (err.code === 'NETWORK_ERROR') {
                setError(
                    'Unable to connect to the server. Please check your connection and try again.',
                );
            } else {
                setError('The account could not be deleted. Please try again.');
            }
        }
    }

    return (
        <div className="confirm-overlay" onClick={() => !busy && onCancel()}>
            <form
                className="confirm-dialog"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="delete-account-title"
                aria-describedby="delete-account-message"
                onClick={(e) => e.stopPropagation()}
                onSubmit={handleSubmit}
                noValidate
            >
                <h2 id="delete-account-title">Delete your account?</h2>
                <div id="delete-account-message">
                    <p>
                        The account <strong>{user?.email}</strong> will be
                        deleted with all its projects: designs, UX evaluations
                        and every PDF document. This cannot be undone.
                    </p>
                </div>
                <label className="delete-account-label">
                    Type your password to confirm
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setError(null);
                        }}
                        autoComplete="current-password"
                        disabled={busy}
                        autoFocus
                    />
                </label>
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
                        className="confirm-dialog-confirm"
                        disabled={busy}
                    >
                        {busy ? 'Deleting…' : 'Delete my account'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default DeleteAccountDialog;
