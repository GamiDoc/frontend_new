import { useEffect, useRef, useState } from 'react';
import Navbar from '../../components/Navbar';
import DesignStepHeader from '../../components/design/DesignStepHeader';
import SaveDraftButton from '../../components/design/SaveDraftButton';
import { useDesign } from '../../context/DesignContext';
import { SPARK_STEP, DESIGN_SECTIONS } from '../../data/designSections';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `ds-spark` Page — Step 0 "The Spark" (FR-1…FR-3)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Free optional text:
 * * "Skip this step": go to Context without saving anything
 * * "Let AI analyze & continue": save text; the backend starts the AI prefill of the empty
 *   sections in the background. The page shows its progress (`.ds-prefill`) and goes to
 *   Context when it ends; "Continue without waiting" leaves at once (sections keep filling).
 *   If nothing is typed (or the AI is not configured), it works like the skip button.
 * * "Save as a draft": save text then the draft
 *
 * Progress markup: `.ds-prefill` (role status) with `.ds-prefill-title`, `.ds-prefill-step`,
 * the bar `.ds-prefill-bar` > `.ds-prefill-bar-fill` (width = percent; `--indeterminate` while
 * nothing is done yet, e.g. single-call mode) and the list
 * `.ds-prefill-sections` (`li.ds-prefill-section--done|--current|--failed|--skipped|--pending`).
 * */

const STEPS = DESIGN_SECTIONS.length + 1; // analysis + sections

function prefillPercent(prefill) {
    const done =
        (prefill.analysis ? 1 : 0) +
        (prefill.completedSections?.length || 0) +
        (prefill.failedSections?.length || 0) +
        (prefill.skippedSections?.length || 0);
    return Math.min(100, Math.round((done / STEPS) * 100));
}

function sectionState(prefill, number) {
    if (prefill.failedSections?.includes(number)) return 'failed';
    if (prefill.skippedSections?.includes(number)) return 'skipped';
    if (prefill.completedSections?.includes(number)) return 'done';
    if (prefill.analysis && prefill.currentSection === number) return 'current';
    return 'pending';
}

const STATE_LABEL = {
    done: 'drafted',
    current: 'drafting…',
    failed: 'not drafted',
    skipped: 'kept yours',
    pending: '',
};

function PrefillProgress({ prefill, onContinue }) {
    const current = DESIGN_SECTIONS.find(
        (s) => s.number === prefill.currentSection,
    );
    const percent = prefillPercent(prefill);
    // The panel appears under the notes: bring it into view, or the page looks idle.
    const panelRef = useRef(null);
    useEffect(() => {
        panelRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        });
    }, []);
    return (
        <section
            ref={panelRef}
            className="ds-group ds-prefill"
            role="status"
            aria-live="polite"
        >
            <span className="ds-group-title ds-prefill-title">
                AI is drafting your design
            </span>
            <p className="ds-prefill-step">
                {prefill.analysis
                    ? `Drafting “${current?.title || 'the sections'}”…`
                    : 'Understanding your project and drafting the sections…'}
            </p>
            {prefill.analysis?.summary && (
                <p className="ds-group-description ds-prefill-summary">
                    {prefill.analysis.summary}
                </p>
            )}
            <p className="ds-group-description">
                This usually takes 2–5 minutes.
            </p>
            <div
                className={`ds-prefill-bar${percent === 0 ? ' ds-prefill-bar--indeterminate' : ''}`}
                aria-hidden="true"
            >
                <div
                    className="ds-prefill-bar-fill"
                    style={percent === 0 ? undefined : { width: `${percent}%` }}
                />
            </div>
            <ul className="ds-prefill-sections">
                {DESIGN_SECTIONS.map((section) => {
                    const state = sectionState(prefill, section.number);
                    return (
                        <li
                            key={section.number}
                            className={`ds-prefill-section ds-prefill-section--${state}`}
                        >
                            {section.navName}
                            {STATE_LABEL[state] && (
                                <span className="ds-prefill-section-state">
                                    {' — '}
                                    {STATE_LABEL[state]}
                                </span>
                            )}
                        </li>
                    );
                })}
            </ul>
            <p className="ds-group-description">
                Every suggestion stays editable, and each field drafted by the
                AI shows why it was chosen.
            </p>
            <button
                type="button"
                className="ds-btn ds-btn--secondary"
                onClick={onContinue}
            >
                Continue without waiting &nbsp;&nbsp; &gt;
            </button>
        </section>
    );
}

function DesignSpark({ onOpenLogin, onOpenSignup }) {
    const {
        status,
        submitSpark,
        skipSpark,
        saving,
        error,
        prefill,
        prefillRunning,
        awaitingPrefill,
        continueWithoutWaiting,
        prefillMissing,
    } = useDesign();
    const [text, setText] = useState(status?.spark || '');
    const trimmed = text.trim();
    const changed = trimmed !== (status?.spark || '');
    const busy = saving || awaitingPrefill;

    function handleContinue() {
        // Same Spark: re-run the AI only if some sections it could not draft are still empty.
        if (!trimmed || (!changed && prefillMissing.length === 0))
            return skipSpark();
        return submitSpark(text);
    }

    return (
        <div className="ds-page ds-page--spark">
            <Navbar onLogin={onOpenLogin} onSignup={onOpenSignup} />
            <DesignStepHeader stepNumber={null} label={SPARK_STEP.navLabel} />

            <main className="ds-main">
                <h1>{SPARK_STEP.title}</h1>
                <p className="ds-intro">{SPARK_STEP.description}</p>

                <section className="ds-group ds-group--spark">
                    <label htmlFor="ds-spark-text" className="ds-group-title">
                        Your Project Notes
                    </label>
                    <p className="ds-group-description">
                        What kind of experience or game do you want to build?
                        Write freely — no structure needed. The more you say
                        about your users, their context and the behaviour you
                        want to encourage, the better the AI draft.
                    </p>
                    <textarea
                        id="ds-spark-text"
                        className="ds-textarea"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        disabled={awaitingPrefill}
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
                            disabled={busy}
                        >
                            {busy
                                ? 'Analyzing…'
                                : 'Let AI analyze & continue    >'}
                        </button>
                    </div>
                </section>

                {awaitingPrefill && prefillRunning && prefill && (
                    <PrefillProgress
                        prefill={prefill}
                        onContinue={continueWithoutWaiting}
                    />
                )}

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
                        disabled={busy}
                    >
                        Skip this step &nbsp;&nbsp; &gt;&gt;
                    </button>
                </div>
            </main>
        </div>
    );
}

export default DesignSpark;
