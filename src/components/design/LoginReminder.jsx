import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDesign } from '../../context/DesignContext';

// sessionStorage: once closed, the popup does not reappear until the browser is closed.
const DISMISS_KEY = 'gamidoc.designLoginReminderDismissed';

/** ═══════════════════════════════════════════════════════════════════════════
 * 
 * LoginReminder — non blocking popup for guest users (FR-17)
 * ═══════════════════════════════════════════════════════════════════════════
 * Reminds users that without login, the work will be lost once the session ends. It appears
 * after Spark or after Context (if the Spark is skipped) only for guests.
 * It can be closed and it does not block the user. (reminder to be defined style-wise in the mockup)
 * */
function LoginReminder({ onOpenLogin }) {
    const { user } = useAuth();
    const { isGuest } = useDesign();
    const [dismissed, setDismissed] = useState(() => {
        try {
            return sessionStorage.getItem(DISMISS_KEY) === '1';
        } catch {
            return false;
        }
    });

    if (user || !isGuest || dismissed) return null;

    function dismiss() {
        setDismissed(true);
        try {
            sessionStorage.setItem(DISMISS_KEY, '1');
        } catch {
            /* storage disabled */
        }
    }

    return (
        <aside className="ds-login-reminder" role="status">
            <p>
                You are working as a guest. Log in or register to save this
                project and avoid losing your progress when the session ends.
            </p>
            <button
                type="button"
                className="ds-btn ds-btn--link"
                onClick={onOpenLogin}
            >
                Log in
            </button>
            <button
                type="button"
                className="ds-btn ds-btn--link"
                onClick={dismiss}
                aria-label="Dismiss reminder"
            >
                ×
            </button>
        </aside>
    );
}

export default LoginReminder;
