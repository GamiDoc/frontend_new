import { useEffect, useState } from 'react';
import { designApi } from '../api/design';
import { projectApi } from '../api/project';
import { useWizard } from '../context/WizardContext';
import ReportProgress from './design/ReportProgress';
import ConfirmDialog from './ConfirmDialog';

/* "Let the AI fill in the evaluation" — top of the evaluation set-up (step 1).

   Shown for a project whose design has had a first pass (same rule as the design PDFs).
   The backend job (POST …/design/evaluation/ai-fill) reads the design and fills the four
   steps from the evaluation catalog, explaining each choice; its progress is in
   project.wizardStatus.aiFill, read again every few seconds, so it is shown also after
   leaving the page and coming back. When it is done the project is loaded again into the
   wizard: the user reviews step by step, with the AI's reasons next to the choices
   (AiFieldNotes, next to each choice). */

const POLL_INTERVAL = 3000;
const STALE_AFTER_MS = 12 * 60 * 1000; // a job still "running" after this is lost

function designReady(status) {
    if (!status?.firstPassDone) return false;
    return Object.values(status.sections || {}).some(
        (section) =>
            section?.content && Object.keys(section.content).length > 0,
    );
}

function EvaluationAiFill() {
    const { editingProjectId, aiFill, setAiFill, loadProject, step1Data } =
        useWizard();
    const [ready, setReady] = useState(false);
    const [starting, setStarting] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [error, setError] = useState(null);

    // Is there a design to start from?
    useEffect(() => {
        if (!editingProjectId) return undefined;
        let alive = true;
        designApi
            .get({ kind: 'project', id: editingProjectId })
            .then((status) => alive && setReady(designReady(status)))
            .catch(() => alive && setReady(false));
        return () => {
            alive = false;
        };
    }, [editingProjectId]);

    const running = aiFill?.state === 'running';
    const runningJobId = running ? aiFill.jobId : null;

    // While the AI works, read the project again; when done, load it into the wizard.
    useEffect(() => {
        if (!runningJobId || !editingProjectId) return undefined;
        let cancelled = false;
        const timer = setTimeout(async () => {
            try {
                const project = await projectApi.get(editingProjectId);
                if (cancelled) return;
                const next = project.wizardStatus?.aiFill;
                if (next?.state === 'running') {
                    // a job still "running" long after its start was lost (e.g. a restart)
                    if (
                        Date.now() - Date.parse(next.startedAt) >
                        STALE_AFTER_MS
                    ) {
                        setAiFill({ ...next, state: 'failed' });
                        setError(
                            'The AI could not fill in the evaluation this time. Please try again.',
                        );
                        return;
                    }
                    setAiFill({ ...next });
                    return;
                }
                if (next?.state === 'failed')
                    setError(
                        'The AI could not fill in the evaluation this time. Please try again.',
                    );
                await loadProject(project, 'setup');
            } catch {
                if (!cancelled)
                    setAiFill((prev) => (prev ? { ...prev } : prev));
            }
        }, POLL_INTERVAL);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [runningJobId, aiFill, editingProjectId, setAiFill, loadProject]);

    if (!editingProjectId || (!ready && !running && !aiFill)) return null;

    const hasChoices =
        step1Data.evaluationGoals.length > 0 ||
        Boolean(step1Data.developmentStage);

    async function start() {
        setConfirming(false);
        setStarting(true);
        setError(null);
        try {
            const result = await designApi.evaluationFill(editingProjectId);
            setAiFill(result.wizardStatus?.aiFill || null);
        } catch (e) {
            setError(e.message || 'The AI could not start.');
        } finally {
            setStarting(false);
        }
    }

    return (
        <section className="ai-fill" aria-labelledby="ai-fill-title">
            <div className="ai-fill-box">
                {running ? (
                    <ReportProgress
                        title="The AI is filling in the evaluation from your design…"
                        startedAt={aiFill.startedAt}
                        timing="usually 1–3 minutes. The steps are filled in when it is done."
                    />
                ) : (
                    <>
                        <h2 id="ai-fill-title">
                            {aiFill?.state === 'done'
                                ? 'Filled in by the AI from your design'
                                : 'Let the AI fill in the evaluation'}
                        </h2>
                        {aiFill?.state === 'done' && aiFill.summary ? (
                            <p className="ai-fill-summary">{aiFill.summary}</p>
                        ) : (
                            <p>
                                Your project has a design: the AI can choose the
                                goals, constraints, research questions, methods
                                and instruments that best test it, and explain
                                every choice.
                            </p>
                        )}
                        {aiFill?.state === 'done' && (
                            <p className="ai-fill-hint">
                                Its reasons are shown in every step: review them
                                and change anything before going on.
                            </p>
                        )}
                        {/* Once the AI has filled in the evaluation the button goes away:
                            the user reviews and changes the choices in the steps. */}
                        {ready && aiFill?.state !== 'done' && (
                            <button
                                type="button"
                                className="btn btn-primary ai-fill-btn"
                                disabled={starting}
                                onClick={() =>
                                    hasChoices ? setConfirming(true) : start()
                                }
                            >
                                {starting
                                    ? 'Starting…'
                                    : 'Let AI fill in the evaluation'}
                            </button>
                        )}
                    </>
                )}
                {error && (
                    <p className="field-error" role="alert">
                        {error}
                    </p>
                )}
            </div>
            {confirming && (
                <ConfirmDialog
                    title="Replace your current choices?"
                    message="The AI will fill in all four steps again from your design: the goals, constraints, methods, instruments and next steps entered now will be replaced."
                    confirmLabel="Let AI fill in"
                    onConfirm={start}
                    onCancel={() => setConfirming(false)}
                />
            )}
        </section>
    );
}

export default EvaluationAiFill;
