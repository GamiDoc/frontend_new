import {
    REPORT_FORMATS,
    EVALUATION_REPORT,
    reportLabel,
} from '../data/designReports';
import ReportProgress from '../components/design/ReportProgress';
import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Icon from '../components/Icon';
import { projectApi } from '../api/project';
import { documentFileName, fileNameFromUrl } from '../utils/documentName';
import ConfirmDialog from '../components/ConfirmDialog';
import RenameDialog from '../components/RenameDialog';
import { designApi } from '../api/design';
import { useWizard } from '../context/WizardContext';
import { useDesign } from '../context/DesignContext';
import { activityApi } from '../api/activity';
import {
    evaluationSummary,
    designSummary,
    EVALUATION_STEP_TO_PAGE,
} from '../data/projectProcesses';

function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

// Design status + report history of a project. A failure counts as "no design yet".
async function fetchDesign(projectId) {
    const [status, reports] = await Promise.allSettled([
        designApi.get({ kind: 'project', id: projectId }),
        designApi.reports(projectId),
    ]);
    return {
        status: status.status === 'fulfilled' ? status.value : null,
        reports:
            reports.status === 'fulfilled' ? reports.value.reports || [] : [],
    };
}

// While a design document is being written (status.reportJob running), the page reads the
// design status again at this interval.
const REPORT_POLL_INTERVAL = 3000;

// Download a Blob as a file (the evaluation PDF needs the auth header, so it is fetched as a blob).
function saveBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/* =====================================================
   PROJECT DETAIL
   A project holds two independent processes, each started,
   continued and documented from here:
   - Design System (6 sections, DesignContext) → two kinds of PDF document
     (design report, Game Design Document), one button each; all kept
   - UX Evaluation (4-step wizard, WizardContext) → the evaluation
     plan PDF (the latest generation)
   "Documents" lists every PDF of the project, newest first.
   ===================================================== */
function ProjectDetail({ projectId, onOpenLogin, onOpenSignup }) {
    const { setPage, loadProject } = useWizard();
    const { openDesignProject } = useDesign();
    const [project, setProject] = useState(null);
    const [design, setDesign] = useState(null); // design status, null = none yet
    const [designReports, setDesignReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingName, setEditingName] = useState(false);
    const [nameInput, setNameInput] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [busy, setBusy] = useState(null); // 'evaluation-pdf' | 'design-<format>' | null
    // PDF being deleted or renamed (popup open): an entry of `documents`
    const [docToDelete, setDocToDelete] = useState(null);
    const [docToRename, setDocToRename] = useState(null);
    const [docBusy, setDocBusy] = useState(false);
    const [docError, setDocError] = useState(null);

    const designScope = { kind: 'project', id: projectId };

    const applyDesign = useCallback(({ status, reports }) => {
        setDesign(status);
        setDesignReports(reports);
    }, []);

    const reloadDesign = useCallback(
        async () => applyDesign(await fetchDesign(projectId)),
        [projectId, applyDesign],
    );

    useEffect(() => {
        if (!projectId) return;
        Promise.all([projectApi.get(projectId), fetchDesign(projectId)])
            .then(([p, d]) => {
                setProject(p);
                setNameInput(p.name);
                applyDesign(d);
            })
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, [projectId, applyDesign]);

    async function handleRename() {
        if (!nameInput.trim()) return;
        try {
            const updated = await projectApi.update(
                projectId,
                nameInput.trim(),
                project.description,
            );
            setProject(updated);
            setEditingName(false);
        } catch (e) {
            setError(e.message);
        }
    }

    // ── UX Evaluation ────────────────────────────────────
    // Opens the wizard on this project, at the step where it was left.
    function openEvaluation() {
        const step = project.wizardStatus?.currentStep;
        loadProject(project, EVALUATION_STEP_TO_PAGE[step] || 'setup');
    }

    async function handleEvaluationPDF() {
        setBusy('evaluation-pdf');
        setError(null);
        try {
            await projectApi.generatePDF(projectId);
            saveBlob(
                await projectApi.downloadPDF(projectId),
                documentFileName(project?.name, 'evaluation-plan'),
            );
            setProject(await projectApi.get(projectId));
        } catch (e) {
            setError(e.message || 'Failed to generate the evaluation PDF.');
        } finally {
            setBusy(null);
        }
    }

    async function handleDownloadEvaluationPDF() {
        try {
            saveBlob(
                await projectApi.downloadPDF(projectId),
                fileNameFromUrl(project?.pdfUrl) ||
                    documentFileName(project?.name, 'evaluation-plan'),
            );
        } catch (e) {
            setError(e.message || 'Download failed.');
        }
    }

    // ── Design System ────────────────────────────────────
    // One document per click (format: 'report' | 'gdd'), written in the background. The
    // job lives in the design status (status.reportJob), so its progress is shown also
    // after leaving the page and coming back, or when it was started from the overview.
    async function handleDesignPDF(format) {
        setBusy(`design-${format}`);
        setError(null);
        try {
            const result = await designApi.generatePDF(designScope, format);
            setDesign(result.designStatus);
        } catch (e) {
            setError(e.message || 'Failed to generate the document.');
        } finally {
            setBusy(null);
        }
    }

    // While the job runs, read the status again; when it ends, reload the documents.
    const reportJob = design?.reportJob || null;
    const runningJob = reportJob?.state === 'running' ? reportJob : null;
    const runningJobId = runningJob?.jobId;
    useEffect(() => {
        if (!runningJobId) return undefined;
        let cancelled = false;
        const timer = setTimeout(async () => {
            const next = await fetchDesign(projectId);
            if (cancelled || !next.status) return;
            applyDesign(next);
            const job = next.status.reportJob;
            if (job?.jobId === runningJobId && job.state === 'failed')
                setError(job.error || 'Failed to generate the document.');
        }, REPORT_POLL_INTERVAL);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [runningJobId, design, projectId, applyDesign]);

    // ── Project documents: delete / rename ───────────────
    function closeDocDialog() {
        if (docBusy) return;
        setDocToDelete(null);
        setDocToRename(null);
        setDocError(null);
    }

    async function confirmDeleteDoc() {
        setDocBusy(true);
        setDocError(null);
        try {
            if (docToDelete.id === 'evaluation-plan')
                await projectApi.deletePDF(projectId);
            else await designApi.deleteReport(projectId, docToDelete.id);
            const [p] = await Promise.all([
                projectApi.get(projectId),
                reloadDesign(),
            ]);
            setProject(p);
            setDocToDelete(null);
        } catch (e) {
            setDocError(e.message || 'The PDF could not be deleted.');
        } finally {
            setDocBusy(false);
        }
    }

    async function saveDocName(name) {
        setDocBusy(true);
        setDocError(null);
        try {
            if (docToRename.id === 'evaluation-plan') {
                await projectApi.renamePDF(projectId, name);
                setProject(await projectApi.get(projectId));
            } else {
                await designApi.renameReport(projectId, docToRename.id, name);
                await reloadDesign();
            }
            setDocToRename(null);
        } catch (e) {
            setDocError(e.message || 'The PDF could not be renamed.');
        } finally {
            setDocBusy(false);
        }
    }

    async function handleDelete() {
        if (
            !window.confirm(
                `Delete project "${project.name}"? This cannot be undone.`,
            )
        )
            return;
        setDeleting(true);
        try {
            await projectApi.delete(projectId);
            activityApi.record('frontend.project_deleted', {
                page: 'project-detail',
                projectId,
            });
            setPage('dashboard');
        } catch (e) {
            setError(e.message);
            setDeleting(false);
        }
    }

    if (loading) return <div className="project-detail-loading">Loading…</div>;
    if (!project)
        return (
            <div className="project-detail-loading project-detail-error">
                {error}
            </div>
        );

    const evaluation = evaluationSummary(project);
    const designState = designSummary(design);
    // Same rule as the backend: reports need a full first pass with some content.
    const canGenerateDesignPDF =
        Boolean(design?.firstPassDone) && designState.percent > 0;

    // Every PDF of the project, newest first. A design report whose file is gone
    // (backend `missing`, e.g. lost with an earlier deploy) is listed without a download;
    // a lost evaluation PDF is not listed at all (the backend clears pdfUrl).
    const documents = [
        ...(project.pdfUrl
            ? [
                  {
                      id: 'evaluation-plan',
                      process: 'evaluation',
                      name: 'Evaluation Plan',
                      fileName: fileNameFromUrl(project.pdfUrl),
                      date: project.updatedAt,
                  },
              ]
            : []),
        ...designReports.map((r) => ({
            id: r.reportId,
            process:
                r.version === EVALUATION_REPORT.id ? 'evaluation' : 'design',
            name: reportLabel(r.version),
            version: r.version,
            fileName: r.fileName || null,
            date: r.createdAt,
            url: r.url,
            missing: Boolean(r.missing),
        })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div>
            <Navbar onLogin={onOpenLogin} onSignup={onOpenSignup} />

            {docToDelete && (
                <ConfirmDialog
                    title="Delete this PDF?"
                    message={`"${docToDelete.fileName || docToDelete.name}" (${formatDate(docToDelete.date)}) will be deleted for good. This cannot be undone.`}
                    busy={docBusy}
                    error={docError}
                    onConfirm={confirmDeleteDoc}
                    onCancel={closeDocDialog}
                />
            )}
            {docToRename && (
                <RenameDialog
                    title="Rename PDF"
                    label="File name"
                    initialValue={(
                        docToRename.fileName ||
                        documentFileName(
                            project.name,
                            docToRename.id === 'evaluation-plan'
                                ? 'evaluation-plan'
                                : docToRename.version === 'gdd'
                                  ? 'game-design-document'
                                  : docToRename.version === 'evaluation'
                                    ? 'evaluation-report'
                                    : 'design-report',
                        )
                    ).replace(/\.pdf$/, '')}
                    hint="Letters, digits, _ and - are kept; spaces and other characters become -."
                    busy={docBusy}
                    error={docError}
                    onSave={saveDocName}
                    onCancel={closeDocDialog}
                />
            )}

            <main className="project-detail-main">
                <div className="project-detail-container">
                    <div
                        className="project-detail-breadcrumb"
                        onClick={() => setPage('dashboard')}
                    >
                        ← Project Dashboard
                    </div>

                    <div className="project-detail-header">
                        <div>
                            {editingName ? (
                                <div className="project-rename">
                                    <input
                                        className="project-type-input project-rename-input"
                                        value={nameInput}
                                        onChange={(e) =>
                                            setNameInput(e.target.value)
                                        }
                                        onKeyDown={(e) =>
                                            e.key === 'Enter' && handleRename()
                                        }
                                        autoFocus
                                    />
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleRename}
                                    >
                                        Save
                                    </button>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => setEditingName(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <h1 className="project-detail-title">
                                    {project.name}
                                    <button
                                        className="project-edit-btn"
                                        onClick={() => setEditingName(true)}
                                        title="Rename"
                                    >
                                        <Icon name="edit" size={18} />
                                    </button>
                                </h1>
                            )}
                            <p className="project-detail-desc">
                                {project.description || 'No description'}
                            </p>
                        </div>

                        <div className="project-detail-actions">
                            <button
                                className="btn btn-secondary project-delete-btn"
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                {deleting ? (
                                    'Deleting…'
                                ) : (
                                    <>
                                        <Icon name="trash" size={16} /> Delete
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {error && <p className="auth-error">{error}</p>}

                    <div className="project-detail-body">
                        <div className="project-detail-content">
                            {/* ── Processes ───────────────────────────── */}
                            <section className="project-processes">
                                <h2>Processes</h2>
                                <div className="project-process-grid">
                                    <ProcessCard
                                        id="design"
                                        title="Design System"
                                        description="Structure the gamified system in six sections, from context to technical requirements."
                                        summary={designState}
                                        startLabel="Start Design"
                                        continueLabel="Continue Design"
                                        onOpen={() =>
                                            openDesignProject(projectId)
                                        }
                                        pdfActions={REPORT_FORMATS.map(
                                            (format) => ({
                                                id: format.id,
                                                label: format.button,
                                                onClick: () =>
                                                    handleDesignPDF(format.id),
                                                generating:
                                                    busy ===
                                                        `design-${format.id}` ||
                                                    runningJob?.format ===
                                                        format.id,
                                            }),
                                        )}
                                        canGeneratePDF={
                                            canGenerateDesignPDF &&
                                            !busy &&
                                            !runningJob
                                        }
                                        pdfHint="Available after a first pass through all six sections."
                                    />
                                    <ProcessCard
                                        id="evaluation"
                                        title="UX Evaluation"
                                        description="Plan the evaluation: goals, methods and validated instruments."
                                        summary={evaluation}
                                        startLabel="Start Evaluation"
                                        continueLabel="Continue Evaluation"
                                        completeLabel="Edit Evaluation"
                                        onOpen={openEvaluation}
                                        pdfActions={[
                                            {
                                                id: 'evaluation',
                                                label: project.pdfUrl
                                                    ? 'Regenerate the plan'
                                                    : 'Generate the plan',
                                                onClick: handleEvaluationPDF,
                                                generating:
                                                    busy === 'evaluation-pdf',
                                            },
                                            {
                                                id: EVALUATION_REPORT.id,
                                                label: EVALUATION_REPORT.button,
                                                onClick: () =>
                                                    handleDesignPDF(
                                                        EVALUATION_REPORT.id,
                                                    ),
                                                generating:
                                                    busy ===
                                                        `design-${EVALUATION_REPORT.id}` ||
                                                    runningJob?.format ===
                                                        EVALUATION_REPORT.id,
                                                // one AI document at a time
                                                disabled: Boolean(runningJob),
                                            },
                                        ]}
                                        canGeneratePDF={
                                            evaluation.state === 'complete'
                                        }
                                        pdfHint="Available once all four wizard steps are complete."
                                    />
                                </div>
                                {runningJob && (
                                    <ReportProgress
                                        label={reportLabel(runningJob.format)}
                                        startedAt={runningJob.startedAt}
                                    />
                                )}
                            </section>

                            {/* ── Documents ───────────────────────────── */}
                            <section className="project-detail-docs">
                                <h2>Project Documents</h2>
                                <p className="project-docs-note">
                                    Every PDF generated for this project. Design
                                    reports are kept for each generation; the
                                    evaluation plan shows its latest version.
                                </p>

                                {documents.length === 0 ? (
                                    <div className="project-doc-empty">
                                        <p>
                                            No documents yet. Generate a PDF
                                            from one of the processes above.
                                        </p>
                                    </div>
                                ) : (
                                    <ul className="project-doc-list">
                                        {documents.map((doc) => (
                                            <li
                                                key={doc.id}
                                                className={`project-doc-card project-doc-card--${doc.process}`}
                                            >
                                                <div className="project-doc-icon">
                                                    <Icon
                                                        name="fileText"
                                                        size={26}
                                                    />
                                                </div>
                                                <div className="project-doc-info">
                                                    <span className="project-doc-name">
                                                        {doc.fileName
                                                            ? doc.fileName.replace(
                                                                  /\.pdf$/,
                                                                  '',
                                                              )
                                                            : doc.name}
                                                    </span>
                                                    <span className="project-doc-date">
                                                        {doc.fileName
                                                            ? `${doc.name} · `
                                                            : ''}
                                                        {formatDate(doc.date)}
                                                    </span>
                                                </div>
                                                <div className="project-doc-actions">
                                                    {doc.missing ? (
                                                        <span
                                                            className="project-doc-missing"
                                                            title="Generate it again from the Design System card"
                                                        >
                                                            No longer available
                                                        </span>
                                                    ) : doc.url ? (
                                                        <a
                                                            className="btn btn-secondary"
                                                            href={doc.url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                        >
                                                            Download PDF
                                                        </a>
                                                    ) : (
                                                        <button
                                                            className="btn btn-secondary"
                                                            onClick={
                                                                handleDownloadEvaluationPDF
                                                            }
                                                        >
                                                            Download PDF
                                                        </button>
                                                    )}
                                                    {!doc.missing && (
                                                        <button
                                                            type="button"
                                                            className="pdf-delete-btn pdf-rename-btn"
                                                            title="Rename"
                                                            aria-label={`Rename ${doc.fileName || doc.name}`}
                                                            onClick={() =>
                                                                setDocToRename(
                                                                    doc,
                                                                )
                                                            }
                                                        >
                                                            <Icon
                                                                name="edit"
                                                                size={17}
                                                            />
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        className="pdf-delete-btn"
                                                        title="Delete"
                                                        aria-label={`Delete ${doc.fileName || doc.name}`}
                                                        onClick={() =>
                                                            setDocToDelete(doc)
                                                        }
                                                    >
                                                        <Icon
                                                            name="trash"
                                                            size={17}
                                                        />
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </section>
                        </div>

                        {/* ── Project Info sidebar ─────────────────── */}
                        <aside className="project-detail-info">
                            <h2>Project Info</h2>
                            <InfoRow
                                label="Created:"
                                value={formatDate(project.createdAt)}
                            />
                            <InfoRow
                                label="Last Updated:"
                                value={formatDate(project.updatedAt)}
                            />
                            <InfoRow
                                label="Documents:"
                                value={documents.length}
                            />
                            <InfoRow
                                label="Design System:"
                                value={designState.label}
                            />
                            <InfoRow
                                label="UX Evaluation:"
                                value={evaluation.label}
                            />
                        </aside>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="project-info-row">
            <span className="project-info-label">{label}</span>
            <span>{value}</span>
        </div>
    );
}

/* One process of the project (Design System or UX Evaluation): state, progress,
   the button that opens it and one button per PDF it can generate (`pdfActions`). */
function ProcessCard({
    id,
    title,
    description,
    summary,
    startLabel,
    continueLabel,
    completeLabel = continueLabel,
    onOpen,
    pdfActions,
    canGeneratePDF,
    pdfHint,
}) {
    const openLabel = {
        not_started: startLabel,
        in_progress: continueLabel,
        complete: completeLabel,
    }[summary.state];

    return (
        <article
            className={`project-process-card project-process-card--${id} project-process-card--${summary.state}`}
        >
            <header className="project-process-header">
                <h3>{title}</h3>
                <span className="project-process-status">{summary.label}</span>
            </header>
            <p className="project-process-desc">{description}</p>
            <progress
                className="project-process-progress"
                max={100}
                value={summary.percent}
            >
                {summary.percent}%
            </progress>
            <div className="project-process-actions">
                <button className="btn btn-primary" onClick={onOpen}>
                    {openLabel}
                </button>
                {summary.state !== 'not_started' &&
                    pdfActions.map((action) => (
                        <button
                            key={action.id}
                            className="btn btn-secondary"
                            onClick={action.onClick}
                            disabled={
                                !canGeneratePDF ||
                                action.generating ||
                                action.disabled
                            }
                            title={canGeneratePDF ? undefined : pdfHint}
                        >
                            {action.generating ? 'Generating…' : action.label}
                        </button>
                    ))}
            </div>
        </article>
    );
}

export default ProjectDetail;
