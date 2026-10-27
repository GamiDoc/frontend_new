import { useDesign } from '../../context/DesignContext';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SaveDraftButton — button to "Save as a draft" (FR-20, FR-21)
 * ═══════════════════════════════════════════════════════════════════════════
 * * Non-logged user: immediately save and show "Draft saved."
 * * Guest: open login (`onOpenLogin`) and show message. After successful login DesignContext automatically saves the work in a project
 * * `beforeSave` (optional): action to do before saving the whole work, e.g. save the Spark text
 * */
function SaveDraftButton({
    onOpenLogin,
    beforeSave,
    className = 'ds-btn ds-btn--secondary',
}) {
    const { saveAsDraft, saving, pendingDraftSave, draftSavedAt, isGuest } =
        useDesign();

    async function handleClick() {
        if (beforeSave) await beforeSave();
        const result = await saveAsDraft();
        if (result === 'needs-auth') onOpenLogin?.();
    }

    let statusMessage = null;
    if (pendingDraftSave)
        statusMessage = 'Log in or register to save your draft.';
    else if (draftSavedAt && !isGuest) statusMessage = 'Draft saved.';

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
