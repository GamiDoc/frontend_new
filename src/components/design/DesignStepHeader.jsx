import { useDesign } from '../../context/DesignContext';
import { DESIGN_SECTIONS, TOTAL_STEPS } from '../../data/designSections';
import Icon from '../IconDesign';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * DesignStepHeader — Step Bar at the top of all main Design System pages
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Shows step bars, label "STEP X OUT OF Y", and current bar title (i.e Ideation for The Spark).
 *
 * * "stepNumber" is computed by the context (null on the Spark, which is not counted).
 * * "Overview" goes to dashboard and is initially disabled until it is not unlocked (FR-11)
 * * Every bar is a `.ds-step-slot`. Bars of sections that can be opened (all of them after the
 *   first pass, before it only the visited ones) are <button class="ds-step-slot ds-step-slot--link">
 *   that jump to that section: free navigation without going through the Overview
 * * ChatBot button (function is not implemented, only the graphic is present)
 * */
function DesignStepHeader({ stepNumber, label }) {
    const { dashboardUnlocked, goToDashboard, canOpenSection, goToSection } =
        useDesign();

    function segmentClass(position) {
        if (position === stepNumber)
            return 'ds-step-segment ds-step-segment--current';
        if (stepNumber && position < stepNumber)
            return 'ds-step-segment ds-step-segment--done';
        return 'ds-step-segment';
    }

    return (
        <header className="ds-step-header">
            <div className="ds-step-progress">
                <nav className="ds-step-segments" aria-label="Sections">
                    {Array.from({ length: TOTAL_STEPS }, (_, i) => {
                        const position = i + 1;
                        // If the bar represents the current section, add another span that will be used for animation
                        const bar = (
                            <span className={segmentClass(position)}>
                                {position == stepNumber && (
                                    <span className="ds-progress-bar-animation"></span>
                                )}
                            </span>
                        );
                        const section = DESIGN_SECTIONS[i];
                        if (
                            position === stepNumber ||
                            !canOpenSection(section.number)
                        )
                            return (
                                <span
                                    key={i}
                                    className="ds-step-slot"
                                    aria-hidden="true"
                                >
                                    {bar}
                                </span>
                            );
                        return (
                            <button
                                key={i}
                                type="button"
                                className="ds-step-slot ds-step-slot--link"
                                title={section.navName}
                                aria-label={`Go to ${section.navName}`}
                                onClick={() => goToSection(section.number)}
                            >
                                {bar}
                            </button>
                        );
                    })}
                </nav>
                <div className="ds-progress-bar-labels">
                    <span className="ds-step-count">
                        {stepNumber
                            ? `STEP ${stepNumber} OF ${TOTAL_STEPS}`
                            : ''}
                    </span>
                    <span className="ds-step-label">{label}</span>
                </div>
            </div>

            <button
                type="button"
                className="ds-btn ds-btn--primary ds-overview-btn"
                onClick={goToDashboard}
                disabled={!dashboardUnlocked}
                title={
                    dashboardUnlocked
                        ? 'Project overview'
                        : 'Available after a first pass through all sections'
                }
            >
                Overview
            </button>
            <span className="ds-chat-btn" title={'Chat Feature'}>
                {Icon('chat', '', { fill: '#fff', size: 40 })}
            </span>
        </header>
    );
}

export default DesignStepHeader;
