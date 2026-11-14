/* Names of the generated documents: "<project>_<document type>.pdf", e.g.
   "GreenStep_design-report.pdf". Same rule as the backend (internal/docname). */

// Letters and digits (accents removed), the rest becomes "-"; empty → "your-project".
export function fileSlug(title) {
    const slug = String(title || '')
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .replace(/[^A-Za-z0-9]+/g, '-')
        .slice(0, 60)
        .replace(/^-+|-+$/g, '');
    return slug || 'your-project';
}

// docType: 'design-report' | 'game-design-document' | 'evaluation-plan'
export function documentFileName(title, docType) {
    return `${fileSlug(title)}_${docType}.pdf`;
}

// Files stored before documents had names: "<uuid>.pdf" or "<timestamp>.pdf".
const LEGACY_NAME =
    /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|[0-9]+)\.pdf$/;

// File name of a stored PDF from its URL; null for files stored before documents had names.
export function fileNameFromUrl(url) {
    if (!url) return null;
    let base = String(url).split('?')[0].split('/').pop() || '';
    try {
        base = decodeURIComponent(base);
    } catch {
        // keep it as it is
    }
    if (!base.endsWith('.pdf') || LEGACY_NAME.test(base)) return null;
    return base;
}
