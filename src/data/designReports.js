/* Final documents of the Design System, written by the AI on the backend from the sections
   (backend: internal/design/document.go). The user picks one: each button generates one PDF. */
export const REPORT_FORMATS = [
    {
        id: 'report',
        title: 'Design report',
        description:
            'A reasoned report: for every choice, why it was made, how it shows up in the design and what to watch out for, with references.',
        button: 'Generate the design report',
    },
    {
        id: 'gdd',
        title: 'Game Design Document',
        description:
            'A reference document for the team: design on one page, one card per game system, player journey, feedback, risks and metrics.',
        button: 'Generate the GDD',
    },
];

/* Reasoned UX evaluation report: written by the AI from the evaluation wizard (and the
   design), generated from the project page. Stored with the design documents. */
export const EVALUATION_REPORT = {
    id: 'evaluation',
    title: 'UX evaluation report',
    button: 'Generate the reasoned report',
};

/* Name of a stored report (`version`), including the formats of earlier versions. */
export function reportLabel(version) {
    if (version === EVALUATION_REPORT.id) return EVALUATION_REPORT.title;
    const format = REPORT_FORMATS.find((f) => f.id === version);
    if (format) return format.title;
    if (version === 'enhanced') return 'AI-Enhanced report';
    if (version === 'standard') return 'Standard report';
    return 'Design document';
}
