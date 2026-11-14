import { useEffect, useState } from 'react';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ReportProgress — progress of a design document being written (PDF)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * The backend only says that the job is running (no steps), so the bar follows the
 * elapsed time: it moves quickly at first and slows down near the end, never reaching
 * 100% before the document is ready. Next to it, the elapsed time.
 * Used in the design overview and in the project page.
 *
 * Markup: `.ds-report-progress` (role status) with `.ds-report-progress-title`, the bar
 * `.ds-prefill-bar` > `.ds-prefill-bar-fill` (same look as the Spark) and
 * `.ds-report-progress-time`.
 * */

const TYPICAL_SECONDS = 150; // half of the bar after ~1.7 minutes, ~80% after 4

function formatElapsed(seconds) {
    const m = Math.floor(seconds / 60);
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
}

// title / timing replace the default texts (e.g. the AI fill of the evaluation).
function ReportProgress({ label, startedAt, title, timing }) {
    const start = startedAt ? Date.parse(startedAt) : null;
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const elapsed = start ? Math.max(0, Math.round((now - start) / 1000)) : 0;
    const percent = Math.min(
        95,
        Math.round(100 * (1 - Math.exp(-elapsed / TYPICAL_SECONDS))),
    );

    return (
        <div className="ds-report-progress" role="status" aria-live="polite">
            <p className="ds-report-progress-title">
                {title || `The AI is writing your ${label}…`}
            </p>
            <div className="ds-prefill-bar" aria-hidden="true">
                <div
                    className="ds-prefill-bar-fill"
                    style={{ width: `${Math.max(percent, 4)}%` }}
                />
            </div>
            <p className="ds-report-progress-time">
                {formatElapsed(elapsed)} ·{' '}
                {timing ||
                    'usually 2–4 minutes. You can keep working meanwhile.'}
            </p>
        </div>
    );
}

export default ReportProgress;
