import Navbar from '../../components/Navbar';
import DesignStepHeader from '../../components/design/DesignStepHeader';
import DesignSectionForm from '../../components/design/DesignSectionForm';
import SaveDraftButton from '../../components/design/SaveDraftButton';
import LoginReminder from '../../components/design/LoginReminder';
import { useDesign } from '../../context/DesignContext';
import { getSection, SPARK_STEP } from '../../data/designSections';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * `ds-section` Page — one of the main sections to fill (Context, Experience Timeline, …)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Components in the page:
 * * "Go back to …"
 * * "Continue": saves & proceeds
 * * "Skip this section": only for Spark (FR-7)
 * Modifications to already seen sections are automatically saved(auto-save).
 * */
function DesignSection({ onOpenLogin, onOpenSignup }) {
    const {
        currentSection,
        drafts,
        updateField,
        canOpenSection,
        frontier,
        firstPassDone,
        stepNumberOf,
        previousOf,
        continueFrom,
        goBackFrom,
        goToSection,
        saving,
        error,
    } = useDesign();

    const section = getSection(currentSection);

    // Blocked Section 
    if (!section || !canOpenSection(currentSection)) {
        return (
            <div className="ds-page ds-page--locked">
                <Navbar onLogin={onOpenLogin} onSignup={onOpenSignup} />
                <main className="ds-main">
                    <p>On the first pass, sections open in order.</p>
                    {frontier && (
                        <button
                            type="button"
                            className="ds-btn ds-btn--primary"
                            onClick={() => goToSection(frontier)}
                        >
                            Go to {getSection(frontier).title}
                        </button>
                    )}
                </main>
            </div>
        );
    }

    const previous = previousOf(currentSection);
    const backLabel = previous
        ? getSection(previous).title
        : SPARK_STEP.navLabel;
    const canSkip = !firstPassDone && currentSection === frontier;

    return (
        <div className={`ds-page ds-page--section ds-page--${section.id}`}>
            <Navbar onLogin={onOpenLogin} onSignup={onOpenSignup} />
            <DesignStepHeader
                stepNumber={stepNumberOf(currentSection)}
                label={section.title}
            />
            <LoginReminder onOpenLogin={onOpenLogin} />

            <main className="ds-main">
                <h1>{section.title}</h1>

                <DesignSectionForm
                    section={section}
                    values={drafts[currentSection]}
                    onChange={(key, value) =>
                        updateField(currentSection, key, value)
                    }
                />

                {error && (
                    <p className="ds-error" role="alert">
                        {error}
                    </p>
                )}

                <div className="ds-actions">
                    <button
                        type="button"
                        className="ds-btn ds-btn--secondary"
                        onClick={() => goBackFrom(currentSection)}
                        disabled={saving}
                    >
                        ‹ Go back to {backLabel}
                    </button>
                    <SaveDraftButton onOpenLogin={onOpenLogin} />
                    {canSkip && (
                        <button
                            type="button"
                            className="ds-btn ds-btn--link"
                            onClick={() =>
                                continueFrom(currentSection, { skip: true })
                            }
                            disabled={saving}
                        >
                            Skip this section
                        </button>
                    )}
                    <button
                        type="button"
                        className="ds-btn ds-btn--primary"
                        onClick={() => continueFrom(currentSection)}
                        disabled={saving}
                    >
                        {saving ? 'Saving…' : 'Continue ›'}
                    </button>
                </div>
            </main>
        </div>
    );
}

export default DesignSection;
