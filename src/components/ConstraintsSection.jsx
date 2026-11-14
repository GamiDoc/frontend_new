import InfoTooltip from './InfoTooltip';
import AiFieldNotes from './AiFieldNotes';
import {
    ACCESSIBILITY_OPTIONS,
    PARTICIPANT_OPTIONS,
    TIME_OPTIONS,
    EXTRA_CONSTRAINTS,
    CONSTRAINTS_INFO,
} from '../data/evaluationOptions';

function ConstraintsSection({
    participants = '',
    onParticipantsChange,
    accessibility = '',
    onAccessibilityChange,
    time = '',
    onTimeChange,
    extraConstraints = [],
    onExtraConstraintsChange,
    hasParticipantsError,
}) {
    function toggleExtra(option) {
        if (!onExtraConstraintsChange) return;
        const next = extraConstraints.includes(option)
            ? extraConstraints.filter((c) => c !== option)
            : [...extraConstraints, option];
        onExtraConstraintsChange(next);
    }

    return (
        <section className="constraints-section">
            <div className="constraints-box">
                <h2 className="section-title">
                    Constraints
                    <InfoTooltip
                        text="Practical constraints — participants, time, and ethics — shape which evaluation methods are feasible for your study."
                        learnMore={CONSTRAINTS_INFO}
                    />
                </h2>
                <p className="section-description">
                    Are there any constraints affecting evaluation?
                </p>

                <div className="constraint-group">
                    <h3>How accessible are the end users?</h3>
                    <AiFieldNotes step={1} field="accessibility" />
                    <div className="constraint-options-row">
                        {ACCESSIBILITY_OPTIONS.map((option, index) => (
                            <label key={index} className="constraint-option">
                                <input
                                    type="radio"
                                    name="accessibility"
                                    checked={accessibility === option}
                                    onChange={() =>
                                        onAccessibilityChange &&
                                        onAccessibilityChange(option)
                                    }
                                />
                                <span>{option}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div
                    className={`constraint-group${hasParticipantsError ? ' section--error' : ''}`}
                    style={
                        hasParticipantsError
                            ? {
                                  borderRadius: 8,
                                  padding: '12px',
                                  marginTop: 28,
                              }
                            : {}
                    }
                >
                    <h3>How many participants can you recruit?</h3>
                    <AiFieldNotes step={1} field="participants" />
                    <div className="constraint-options-row">
                        {PARTICIPANT_OPTIONS.map((option, index) => (
                            <label key={index} className="constraint-option">
                                <input
                                    type="radio"
                                    name="participants"
                                    checked={participants === option}
                                    onChange={() =>
                                        onParticipantsChange &&
                                        onParticipantsChange(option)
                                    }
                                />
                                <span>{option}</span>
                            </label>
                        ))}
                    </div>
                    {hasParticipantsError && (
                        <p className="field-error">
                            Select a participant range.
                        </p>
                    )}
                </div>

                <div className="constraint-group">
                    <h3>How much time do you have?</h3>
                    <AiFieldNotes step={1} field="time" />
                    <div className="constraint-options-row">
                        {TIME_OPTIONS.map((option, index) => (
                            <label key={index} className="constraint-option">
                                <input
                                    type="radio"
                                    name="time"
                                    checked={time === option}
                                    onChange={() =>
                                        onTimeChange && onTimeChange(option)
                                    }
                                />
                                <span>{option}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="constraint-group">
                    <h3>Technical and ethical constraints</h3>
                    <AiFieldNotes step={1} field="extraConstraints" />
                    <div className="constraint-options-column">
                        {EXTRA_CONSTRAINTS.map((option, index) => (
                            <label key={index} className="constraint-option">
                                <input
                                    type="checkbox"
                                    checked={extraConstraints.includes(option)}
                                    onChange={() => toggleExtra(option)}
                                />
                                <span>{option}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ConstraintsSection;
