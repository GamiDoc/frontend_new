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

/* The two documents of the UX evaluation (backend: internal/design/evaluation_report.go),
   generated from the project page and from the Evaluation step; stored with the design
   documents. `ai`: written by the AI (minutes) or built from the data (seconds). */
export const EVALUATION_FORMATS = [
    {
        id: 'evaluation-plan',
        title: 'UX evaluation plan',
        description:
            'Your choices in one document: every goal, method and instrument with its description. Ready in a few seconds.',
        button: 'Generate the plan',
        ai: false,
    },
    {
        id: 'evaluation',
        title: 'UX evaluation report',
        description:
            'Written by the AI: why each choice fits your project, what it measures, how to read the results, limits and sources.',
        button: 'Generate the reasoned report',
        ai: true,
    },
];

export const isEvaluationFormat = (version) =>
    EVALUATION_FORMATS.some((f) => f.id === version);

/* Texts of the progress bar of a document being generated. */
export function progressTexts(version) {
    const format = EVALUATION_FORMATS.find((f) => f.id === version);
    if (format && !format.ai)
        return {
            title: `Preparing your ${format.title}…`,
            timing: 'a few seconds.',
        };
    return {};
}

/* Name of a stored report (`version`), including the formats of earlier versions. */
export function reportLabel(version) {
    const evaluation = EVALUATION_FORMATS.find((f) => f.id === version);
    if (evaluation) return evaluation.title;
    const format = REPORT_FORMATS.find((f) => f.id === version);
    if (format) return format.title;
    if (version === 'enhanced') return 'AI-Enhanced report';
    if (version === 'standard') return 'Standard report';
    return 'Design document';
}
