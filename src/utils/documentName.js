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
