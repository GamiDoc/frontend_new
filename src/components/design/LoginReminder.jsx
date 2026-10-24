import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDesign } from '../../context/DesignContext';

// sessionStorage: una volta chiuso, il promemoria non riappare fino alla chiusura del browser.
const DISMISS_KEY = 'gamidoc.designLoginReminderDismissed';

/* ═══════════════════════════════════════════════════════════════════════════
   LoginReminder — promemoria non bloccante per gli ospiti (FR-17)
   ═══════════════════════════════════════════════════════════════════════════
   Ricorda che, senza login, il lavoro si perde a fine sessione. Compare nelle pagine
   delle sezioni (quindi dopo la Spark, o dopo Context se la Spark è stata saltata) e
   solo per gli ospiti. Non blocca nulla: si può chiudere.
   Nei mockup non c'è ancora: posizione e aspetto sono da definire.

   PER LA GRAFICA
   - `.ds-login-reminder` contenitore (role="status") con un testo e due pulsanti
     `.ds-btn--link` ("Log in" e "Dismiss").
   ═══════════════════════════════════════════════════════════════════════════ */
function LoginReminder({ onOpenLogin }) {
  const { user } = useAuth();
  const { isGuest } = useDesign();
  const [dismissed, setDismissed] = useState(() => {
    try { return sessionStorage.getItem(DISMISS_KEY) === '1'; } catch { return false; }
  });

  if (user || !isGuest || dismissed) return null;

  function dismiss() {
    setDismissed(true);
    try { sessionStorage.setItem(DISMISS_KEY, '1'); } catch { /* storage disabilitato */ }
  }

  return (
    <aside className="ds-login-reminder" role="status">
      <p>You are working as a guest. Log in or register to save this project and avoid losing your progress when the session ends.</p>
      <button type="button" className="ds-btn ds-btn--link" onClick={onOpenLogin}>Log in</button>
      <button type="button" className="ds-btn ds-btn--link" onClick={dismiss} aria-label="Dismiss reminder">Dismiss</button>
    </aside>
  );
}

export default LoginReminder;
