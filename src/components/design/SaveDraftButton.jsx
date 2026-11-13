import { useDesign } from '../../context/DesignContext';
import { useAuth } from '../../context/AuthContext';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * SaveDraftButton — button to "Save as a draft" (FR-20, FR-21)
 * ═══════════════════════════════════════════════════════════════════════════
 * * Logged-in user: the design is saved automatically, so the button shows "Saved"
 *   (disabled); with `dirty` (something not auto-saved, e.g. the Spark text) it saves.
 * * Guest: open login (`onOpenLogin`) and show message. After successful login DesignContext automatically saves the work in a project
 * * `beforeSave` (optional): action to do before saving the whole work, e.g. save the Spark text
 * */
function SaveDraftButton({
    onOpenLogin,
    beforeSave,
    dirty = false,
    className = 'ds-btn ds-btn--secondary',
}) {
    const { saveAsDraft, saving, pendingDraftSave, draftSavedAt, isGuest } =
        useDesign();
    const { user } = useAuth();
    const autoSaved = Boolean(user) && !isGuest && !dirty;

    async function handleClick() {
        if (beforeSave) await beforeSave();
        const result = await saveAsDraft();
        if (result === 'needs-auth') onOpenLogin?.();
    }

    let statusMessage = null;
    if (pendingDraftSave)
        statusMessage = 'Log in or register to save your draft.';
    else if (draftSavedAt && !isGuest && !autoSaved)
        statusMessage = 'Draft saved.';

    if (autoSaved) {
        return (
            <button
                type="button"
                className={`${className} ds-btn--saved`}
                disabled
                title="Your design is saved automatically"
            >
                {saving ? 'Saving…' : '✓  Saved'}
            </button>
        );
    }

    return (
        <>
            {statusMessage && (
                <span className="ds-draft-status" role="status">
                    {statusMessage}
                </span>
            )}
            <button
                type="button"
                className={className}
                onClick={handleClick}
                disabled={saving}
            >
                +&nbsp;&nbsp;Save as a draft
            </button>
        </>
    );
}

export default SaveDraftButton;
