import { useState } from 'react';
import Navbar from '../../components/Navbar';
import DesignStepHeader from '../../components/design/DesignStepHeader';
import SaveDraftButton from '../../components/design/SaveDraftButton';
import { useDesign } from '../../context/DesignContext';
import { SPARK_STEP } from '../../data/designSections';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * `ds-spark` Page — Step 0 "The Spark" (FR-1…FR-3)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Free optional text:
 * * "Skip this step": go to Context without saving anything
 * * "Let AI analyze & continue": save text & go to Context. (Pre-compile next fields). If nothing is typed, then it works as if the skip button was pressed
 * * "Save as a draft": save text then the draft
 * */
function DesignSpark({ onOpenLogin, onOpenSignup }) {
    const { status, submitSpark, skipSpark, saving, error } = useDesign();
    const [text, setText] = useState(status?.spark || '');
    const trimmed = text.trim();
    const changed = trimmed !== (status?.spark || '');

    function handleContinue() {
        if (!trimmed || !changed) return skipSpark();
        return submitSpark(text);
    }

    return (
        <div className="ds-page ds-page--spark">
            <Navbar onLogin={onOpenLogin} onSignup={onOpenSignup} />
            <DesignStepHeader stepNumber={1} label={SPARK_STEP.navLabel} />

            <main className="ds-main">
                <h1>{SPARK_STEP.title}</h1>
                <p className="ds-intro">{SPARK_STEP.description}</p>

                <section className="ds-group ds-group--spark">
                    <label htmlFor="ds-spark-text" className="ds-group-title">
                        Your Project Notes
                    </label>
                    <p className="ds-group-description">
                        What kind of experience or game do you want to build?
                        Write freely — no structure needed.
                    </p>
                    <textarea
                        id="ds-spark-text"
                        className="ds-textarea"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                    <div className="ds-spark-ai-options">
                        <SaveDraftButton
                            onOpenLogin={onOpenLogin}
                            beforeSave={
                                changed
                                    ? () =>
                                          submitSpark(text, { navigate: false })
                                    : undefined
                            }
                        />
                        <button
                            type="button"
                            className="ds-btn ds-btn--primary"
                            onClick={handleContinue}
                            disabled={saving}
                        >
                            {saving
                                ? 'Analyzing…'
                                : 'Let AI analyze & continue \u00A0\u00A0 >'}
                        </button>
                    </div>
                </section>

                {error && (
                    <p className="ds-error" role="alert">
                        {error}
                    </p>
                )}

                <div className="ds-actions">
                    <button
                        type="button"
                        className="ds-btn ds-btn--secondary"
                        onClick={skipSpark}
                        disabled={saving}
                    >
                        Skip this step &nbsp;&nbsp; &gt;&gt;
                    </button>
                </div>
            </main>
        </div>
    );
}

export default DesignSpark;
