/* R3 — Rationale personalization.
   Turns the backend `matchedOn` signals (and, for locally derived suggestions,
   the catalog metadata) into short chips that state why an item fits *this*
   project rather than being a generic recommendation. */

import { METHOD_NAME_TO_ID } from './instruments';

const METHOD_ID_TO_NAME = Object.fromEntries(
  Object.entries(METHOD_NAME_TO_ID).map(([name, id]) => [id, name])
);

const SIGNAL_LABELS = {
  goal: 'Goal',
  method: 'Method',
  projectType: 'Project',
  participants: 'Participants',
  developmentStage: 'Stage',
  accessibility: 'User access',
  time: 'Time',
  constraint: 'Constraint',
  research: 'Research',
};

/* Backend signals → display chips. */
export function formatMatchedOn(matchedOn = []) {
  return matchedOn
    .filter((s) => s && s.value)
    .map((s) => ({
      label: SIGNAL_LABELS[s.kind] || s.kind,
      value: s.kind === 'method' ? METHOD_ID_TO_NAME[s.value] || s.value : s.value,
    }));
}

/* Chips for items that were not produced by the rule engine (catalog fallbacks
   and manually browsed additions), derived from the same user inputs. */
export function localMatchReasons(item, step1Data = {}, selectedMethodNames = []) {
  if (!item) return [];
  const chips = [];
  const goals = step1Data.evaluationGoals || [];

  const itemGoals = item.coversGoals || item.goals || [];
  itemGoals.filter((g) => goals.includes(g)).forEach((g) => {
    chips.push({ label: 'Goal', value: g });
  });

  if (step1Data.developmentStage && (item.stages || []).includes(step1Data.developmentStage)) {
    chips.push({ label: 'Stage', value: step1Data.developmentStage });
  }

  (item.constraints || [])
    .filter((c) => c === step1Data.time || (step1Data.extraConstraints || []).includes(c))
    .forEach((c) => chips.push({ label: 'Constraint', value: c }));

  (item.forMethodIds || []).forEach((id) => {
    const name = METHOD_ID_TO_NAME[id];
    if (name && selectedMethodNames.includes(name)) {
      chips.push({ label: 'Method', value: name });
    }
  });

  return chips;
}

/* Merge backend signals with catalog-derived ones, keeping them unique. */
export function matchChips(item, step1Data, selectedMethodNames, catalogEntry) {
  const chips = [
    ...formatMatchedOn(item?.matchedOn),
    ...localMatchReasons(catalogEntry || item, step1Data, selectedMethodNames),
  ];
  const seen = new Set();
  return chips.filter(({ label, value }) => {
    const key = `${label}::${value}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/* Fallback sentence when neither the rule nor the catalog carries one. */
export function fallbackRationale(chips) {
  const goals = chips.filter((c) => c.label === 'Goal').map((c) => c.value);
  if (goals.length > 0) {
    return `Measures the evaluation goals you selected: ${goals.join(', ')}.`;
  }
  const stage = chips.find((c) => c.label === 'Stage');
  if (stage) return `Suited to your ${stage.value.toLowerCase()} development stage.`;
  return null;
}

export { METHOD_ID_TO_NAME };
