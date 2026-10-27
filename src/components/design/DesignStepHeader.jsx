import { useDesign } from '../../context/DesignContext';
import { TOTAL_STEPS } from '../../data/designSections';
import chatIcon from '../../assets/icons/chat_icon.svg';
import { useState } from 'react';

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
 * * ChatBot button (function is not implemented, only the graphic is present)
 * */
function DesignStepHeader({ stepNumber, label }) {
    const { dashboardUnlocked, goToDashboard } = useDesign();

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
                <div className="ds-step-segments" aria-hidden="true">
                    {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                        // If the bar represents the current section, add another span that will be used for animation
                        <span key={i} className={segmentClass(i + 1)}>
                            {i + 1 == stepNumber && (
                                <span
                                    key={'bar-animation' + i}
                                    className="ds-progress-bar-animation"
                                ></span>
                            )}
                        </span>
                    ))}
                </div>
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
                <svg height="40" width="40">
                    <circle r="20" cx="20" cy="20" fill="#547194" />
                    <image
                        x="7.5"
                        y="7.5"
                        width="25"
                        height="25"
                        href={chatIcon}
                    />
                </svg>
            </span>
        </header>
    );
}

export default DesignStepHeader;
