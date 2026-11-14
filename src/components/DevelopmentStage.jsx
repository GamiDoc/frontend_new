import InfoTooltip from './InfoTooltip';
import { STAGES, DEVELOPMENT_STAGE_INFO } from '../data/evaluationOptions';

function DevelopmentStage({ value = '', onChange, hasError }) {
    return (
        <section className="development-stage-section">
            <div
                className={`development-stage-box${hasError ? ' section--error' : ''}`}
            >
                <h2 className="section-title">
                    Development Stage
                    <InfoTooltip
                        text="The development stage defines how mature your system is and determines which evaluation methods are appropriate."
                        learnMore={DEVELOPMENT_STAGE_INFO}
                    />
                </h2>
                <p className="section-description">
                    What is the current stage of the system?
                </p>

                <div className="development-stage-grid">
                    {STAGES.map((stage, index) => (
                        <label key={index} className="development-option">
                            <input
                                type="radio"
                                name="developmentStage"
                                checked={value === stage}
                                onChange={() => onChange && onChange(stage)}
                            />
                            <span>{stage}</span>
                        </label>
                    ))}
                </div>

                {hasError && (
                    <p className="field-error">Select a development stage.</p>
                )}
            </div>
        </section>
    );
}

export default DevelopmentStage;
