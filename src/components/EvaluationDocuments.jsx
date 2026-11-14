import { useEffect, useState } from 'react';
import { designApi } from '../api/design';
import {
    EVALUATION_FORMATS,
    isEvaluationFormat,
    progressTexts,
    reportLabel,
} from '../data/designReports';
import Icon from './Icon';
import ReportProgress from './design/ReportProgress';

/* The two documents of the UX evaluation in the Evaluation step (projects only), like the
   design report and the GDD: "Generate the plan" (built from the data, seconds) and
   "Generate the reasoned report" (written by the AI, minutes).

   The backend writes them in the background (POST …/design/generate-pdf); the progress is
   in the design status (reportJob), read again every few seconds, so it is shown also
   after leaving the page and coming back. When a document is ready, a link downloads it;
   every document is also listed on the project page. */

const POLL_INTERVAL = 3000;

function EvaluationDocuments({ projectId }) {
    const [job, setJob] = useState(null);
    const [error, setError] = useState(null);
    const [starting, setStarting] = useState(null); // format being started

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
                        next.error || 'The document could not be generated.',
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

    async function generate(format) {
        setStarting(format);
        setError(null);
        try {
            const result = await designApi.generatePDF(
                { kind: 'project', id: projectId },
                format,
            );
            setJob(result.reportJob || result.designStatus?.reportJob || null);
        } catch (e) {
            setError(e.message || 'The document could not be started.');
        } finally {
            setStarting(null);
        }
    }

    const ready =
        job?.state === 'done' && isEvaluationFormat(job.format) && job.report;

    return (
        <>
            {EVALUATION_FORMATS.map((format) => {
                const busy =
                    starting === format.id ||
                    (running && job.format === format.id);
                return (
                    <button
                        key={format.id}
                        type="button"
                        className="btn eval-btn-download"
                        onClick={() => generate(format.id)}
                        disabled={Boolean(starting) || running}
                        title={format.description}
                    >
                        {busy ? 'Generating…' : format.button}
                    </button>
                );
            })}
            <div className="eval-report-below">
                {running && (
                    <ReportProgress
                        label={reportLabel(job.format)}
                        startedAt={job.startedAt}
                        {...progressTexts(job.format)}
                    />
                )}
                {ready && !running && (
                    <p className="eval-report-ready" aria-live="polite">
                        Your {reportLabel(job.format)} is ready:{' '}
                        <a
                            href={job.report.url}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Icon name="download" size={14} /> download the PDF
                        </a>
                        . You also find it on the project page.
                    </p>
                )}
                {error && (
                    <p className="auth-error" style={{ marginTop: '0.75rem' }}>
                        {error}
                    </p>
                )}
            </div>
        </>
    );
}

export default EvaluationDocuments;
