import Navbar from '../../components/Navbar';
import DesignStepHeader from '../../components/design/DesignStepHeader';
import DesignSectionForm from '../../components/design/DesignSectionForm';
import LoginReminder from '../../components/design/LoginReminder';
import { useDesign } from '../../context/DesignContext';
import {
    getSection,
    SPARK_STEP,
    OVERVIEW_STEP,
} from '../../data/designSections';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `ds-section` Page — one of the main sections to fill (Context, Experience Timeline, …)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Components in the page:
 * * Title and introduction of the section (`.ds-intro`); optional sections add the tag
 *   `.ds-optional-tag` next to the title and the note `.ds-optional-note`
 * * "Back to the …": previous section (or the Spark)
 * * "Go to the …": saves & proceeds to the next section (or the Overview after the last one)
 * Modifications to already seen sections are automatically saved (auto-save).
 * `.ds-prefill-notice`: banner while the AI prefill runs, or when the section was drafted by it.
 * */
function DesignSection({ onOpenLogin, onOpenSignup }) {
    const {
        currentSection,
        drafts,
        updateField,
        canOpenSection,
        frontier,
        stepNumberOf,
        previousOf,
        nextOf,
        continueFrom,
        goBackFrom,
        goToSection,
        saving,
        error,
        prefill,
        prefillRunning,
        prefillMissing,
        retryPrefill,
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
    const next = nextOf(currentSection);
    const backLabel = previous
        ? getSection(previous).navName
        : SPARK_STEP.navName;
    const nextLabel = next ? getSection(next).navName : OVERVIEW_STEP.navName;

    return (
        <div className={`ds-page ds-page--section ds-page--${section.id}`}>
            <Navbar onLogin={onOpenLogin} onSignup={onOpenSignup} />
            <DesignStepHeader
                stepNumber={stepNumberOf(currentSection)}
                label={section.title}
            />
            <LoginReminder onOpenLogin={onOpenLogin} />

            <main className="ds-main">
                <h1>
                    {section.title}
                    {section.optional && (
                        <span className="ds-optional-tag">Optional</span>
                    )}
                </h1>
                {section.optional && (
                    <p className="ds-optional-note">
                        You can skip this section: it does not count towards
                        your project's completion.
                    </p>
                )}
                {section.description && (
                    <p className="ds-intro">{section.description}</p>
                )}
                {prefillRunning && (
                    <p className="ds-prefill-notice" role="status">
                        ✦ The AI is still drafting your sections from the Spark:
                        empty sections fill in as they are ready.
                    </p>
                )}
                {prefillMissing.length > 0 && (
                    <div className="ds-prefill-notice ds-prefill-notice--retry">
                        <span>
                            ✦ The AI could not draft:{' '}
                            {prefillMissing
                                .map((n) => getSection(n).navName)
                                .join(', ')}
                            .
                        </span>
                        <button
                            type="button"
                            className="ds-btn ds-btn--secondary"
                            onClick={retryPrefill}
                            disabled={saving}
                        >
                            Retry with AI
                        </button>
                    </div>
                )}
                {!prefillRunning &&
                    prefill?.notes?.[String(currentSection)]?.length > 0 && (
                        <p className="ds-prefill-notice">
                            ✦ This section was drafted by the AI from your
                            Spark. Review each suggestion: the notes explain why
                            it was chosen and disappear once you edit the field.
                        </p>
                    )}

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
                        {'‹  '}Back to the {backLabel}
                    </button>
                    <button
                        type="button"
                        className="ds-btn ds-btn--primary"
                        onClick={() => continueFrom(currentSection)}
                        disabled={saving}
                    >
                        {saving ? 'Saving…' : `Go to the ${nextLabel}`}
                    </button>
                </div>
            </main>
        </div>
    );
}

export default DesignSection;
