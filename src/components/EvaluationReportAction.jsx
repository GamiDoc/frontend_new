import { useEffect, useState } from 'react';
import { designApi } from '../api/design';
import { EVALUATION_REPORT } from '../data/designReports';
import Icon from './Icon';
import ReportProgress from './design/ReportProgress';

/* "Reasoned report (AI)" button of the evaluation review (step 4), next to the evaluation
   plan. Projects only: the report is written in the background by the backend
   (POST …/design/generate-pdf, format "evaluation") and its progress is in the design
   status (reportJob), read again every few seconds, so the bar is shown also after leaving
   the page and coming back. When the report is ready, a link opens it. */

const POLL_INTERVAL = 3000;

function EvaluationReportAction({ projectId }) {
    const scope = { kind: 'project', id: projectId };
    const [job, setJob] = useState(null);
    const [error, setError] = useState(null);
    const [starting, setStarting] = useState(false);

    // Last document job of the project (it may be running already).
    useEffect(() => {
        let alive = true;
        designApi
            .get({ kind: 'project', id: projectId })
            .then((status) => alive && setJob(status?.reportJob || null))
            .catch(() => {});
        return () => {
            alive = false;
        };
    }, [projectId]);

    const running = job?.state === 'running';
    const runningJobId = running ? job.jobId : null;
    useEffect(() => {
        if (!runningJobId) return undefined;
        let cancelled = false;
        const timer = setTimeout(async () => {
            try {
                const status = await designApi.get({
                    kind: 'project',
                    id: projectId,
                });
                if (cancelled) return;
                const next = status?.reportJob || null;
                setJob(next ? { ...next } : null);
                if (next?.jobId === runningJobId && next.state === 'failed')
                    setError(
                        next.error || 'The report could not be generated.',
                    );
            } catch {
                if (!cancelled) setJob((prev) => (prev ? { ...prev } : prev));
            }
        }, POLL_INTERVAL);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [runningJobId, job, projectId]);

    async function start() {
        setStarting(true);
        setError(null);
        try {
            const result = await designApi.generatePDF(
                scope,
                EVALUATION_REPORT.id,
            );
            setJob(result.reportJob || result.designStatus?.reportJob || null);
        } catch (e) {
            setError(e.message || 'The report could not be started.');
        } finally {
            setStarting(false);
        }
    }

    const writingThis = running && job.format === EVALUATION_REPORT.id;
    const ready =
        job?.state === 'done' &&
        job.format === EVALUATION_REPORT.id &&
        job.report?.url;

    const button = (
        <button
            type="button"
            className="btn eval-btn-download"
            onClick={start}
            disabled={starting || running}
            title={
                running && !writingThis
                    ? 'Another document is being written'
                    : undefined
            }
        >
            {starting || writingThis ? (
                'Writing…'
            ) : (
                <>
                    <Icon name="download" size={16} /> Reasoned report (AI)
                </>
            )}
        </button>
    );

    // The progress and the link take a whole row of the actions bar (flex-wrap).
    const below = (
        <div className="eval-report-below">
            {running && (
                <ReportProgress
                    label={writingThis ? EVALUATION_REPORT.title : 'document'}
                    startedAt={job.startedAt}
                />
            )}
            {ready && !running && (
                <p className="eval-report-ready" aria-live="polite">
                    Your {EVALUATION_REPORT.title} is ready:{' '}
                    <a href={job.report.url} target="_blank" rel="noreferrer">
                        open the PDF
                    </a>
                </p>
            )}
            {error && (
                <p className="auth-error" style={{ marginTop: '0.75rem' }}>
                    {error}
                </p>
            )}
        </div>
    );

    return (
        <>
            {button}
            {below}
        </>
    );
}

export default EvaluationReportAction;
