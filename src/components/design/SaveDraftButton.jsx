import { useDesign } from '../../context/DesignContext';

/* ═══════════════════════════════════════════════════════════════════════════
   SaveDraftButton — pulsante "Save as a draft" (FR-20, FR-21)
   ═══════════════════════════════════════════════════════════════════════════
   - Utente loggato: salva subito e mostra "Draft saved.".
   - Ospite: apre il login (`onOpenLogin`) e mostra un messaggio; appena il login riesce,
     DesignContext completa da solo il salvataggio spostando il lavoro in un progetto.
   - `beforeSave` (facoltativo): azione da eseguire prima, es. salvare il testo della Spark.

   PER LA GRAFICA
   - Il pulsante ha classe `ds-btn ds-btn--secondary` (sostituibile con la prop `className`).
   - Il messaggio di stato è `.ds-draft-status`: si può spostare (es. toast) senza toccare la logica.
   ═══════════════════════════════════════════════════════════════════════════ */
function SaveDraftButton({ onOpenLogin, beforeSave, className = 'ds-btn ds-btn--secondary' }) {
  const { saveAsDraft, saving, pendingDraftSave, draftSavedAt, isGuest } = useDesign();

  async function handleClick() {
    if (beforeSave) await beforeSave();
    const result = await saveAsDraft();
    if (result === 'needs-auth') onOpenLogin?.();
  }

  let statusMessage = null;
  if (pendingDraftSave) statusMessage = 'Log in or register to save your draft.';
  else if (draftSavedAt && !isGuest) statusMessage = 'Draft saved.';

  return (
    <>
      <button type="button" className={className} onClick={handleClick} disabled={saving}>
        + Save as a draft
      </button>
      {statusMessage && <span className="ds-draft-status" role="status">{statusMessage}</span>}
    </>
  );
}

export default SaveDraftButton;
