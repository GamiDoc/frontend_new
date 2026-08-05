/* R4 — Automated filter architecture.
   Pre-packaged instrument suites so practitioners are not left ticking single
   checkboxes out of the full catalog. A suite bundles instruments that are
   routinely reported together for one UX dimension, with the burden it adds. */

import ALL_INSTRUMENTS from './instruments';

const BUNDLES = [
  {
    id: 'core-usability',
    name: 'Core usability suite',
    description: 'The minimum defensible usability set: one validated scale plus a task protocol.',
    instrumentIds: ['sus', 'umux-lite', 'task-based-protocol'],
    goals: ['Usability & Efficiency', 'Guidance & Feedback'],
    burden: 'Low — about 15 items plus session notes',
  },
  {
    id: 'pragmatic-hedonic',
    name: 'Pragmatic + hedonic UX suite',
    description: 'Covers both the utilitarian and the experiential side of the interface.',
    instrumentIds: ['attrakdiff', 'ueq', 'mecue'],
    goals: ['Usability & Efficiency', 'Novelty / Curiosity', 'Aesthetic & Attractiveness'],
    burden: 'Medium — three self-report scales',
  },
  {
    id: 'affect',
    name: 'Emotional experience suite',
    description: 'Captures affective state and perceived pressure during play.',
    instrumentIds: ['panas', 'sam', 'nasa-tlx'],
    goals: ['Affective Experience', 'Tension / Pressure'],
    burden: 'Medium — two short affect scales plus workload',
  },
  {
    id: 'sdt-needs',
    name: 'Psychological needs suite (SDT)',
    description: 'Self-Determination Theory battery for competence, autonomy, and relatedness.',
    instrumentIds: ['pens', 'imi', 'bns'],
    goals: [
      'Competence / Mastery',
      'Autonomy / Perceived Choice',
      'Social Connection / Relatedness',
      'Motivation Spectrum',
    ],
    burden: 'High — three multi-subscale questionnaires',
  },
  {
    id: 'engagement-flow',
    name: 'Engagement & flow suite',
    description: 'Immersion, focused attention, and sense of progress in gameful systems.',
    instrumentIds: ['ues', 'fss2', 'egameflow', 'geq'],
    goals: [
      'Engagement',
      'Immersion / Flow / Focused Attention',
      'Progress / Accomplishment',
    ],
    burden: 'High — long game-experience batteries',
  },
  {
    id: 'eudaimonic',
    name: 'Meaning & learning suite',
    description: 'Personal relevance, values alignment, and educational game quality.',
    instrumentIds: ['minipxi', 'meega'],
    goals: [
      'Personal Meaning & Relevance',
      'Purpose & Values Alignment',
      'Self-Transcendence',
    ],
    burden: 'Low — two compact scales',
  },
  {
    id: 'expert-inspection',
    name: 'Expert inspection suite',
    description: 'Runs without participants — for concept and low-fidelity stages.',
    instrumentIds: ['heuristic-checklist', 'observation-grid'],
    goals: ['Usability & Efficiency', 'Guidance & Feedback', 'Aesthetic & Attractiveness'],
    burden: 'None — no participants required',
  },
];

/* Resolve a bundle against the catalog and against what the user actually
   selected, so the UI can rank suites and show what each one adds. */
export function resolveBundle(bundle, { userGoals = [], selectedMethodIds = [], selectedInstruments = [] } = {}) {
  const instruments = bundle.instrumentIds
    .map((id) => ALL_INSTRUMENTS.find((i) => i.id === id))
    .filter(Boolean)
    // Only keep instruments reachable from the methods the user picked.
    .filter((i) =>
      selectedMethodIds.length === 0 ||
      i.forMethodIds.some((m) => selectedMethodIds.includes(m))
    );

  const coveredGoals = bundle.goals.filter((g) => userGoals.includes(g));
  const missing = instruments.filter((i) => !selectedInstruments.includes(i.name));

  return {
    ...bundle,
    instruments,
    coveredGoals,
    missing,
    applied: instruments.length > 0 && missing.length === 0,
  };
}

export function rankedBundles(options) {
  return BUNDLES
    .map((b) => resolveBundle(b, options))
    .filter((b) => b.instruments.length > 0 && b.coveredGoals.length > 0)
    .sort((a, b) => b.coveredGoals.length - a.coveredGoals.length);
}

export default BUNDLES;
