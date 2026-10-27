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
 * * Title and introduction of the section (`.ds-intro`)
 * * "Back to the …": previous section (or the Spark)
 * * "Go to the …": saves & proceeds to the next section (or the Overview after the last one)
 * Modifications to already seen sections are automatically saved (auto-save).
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
                <h1>{section.title}</h1>
                {section.description && (
                    <p className="ds-intro">{section.description}</p>
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
