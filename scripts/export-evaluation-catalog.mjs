/* Exports the UX Evaluation catalog (goals, development stages, constraints, methods,
   instruments) as JSON for the backend, which uses it to let the AI fill in the
   evaluation from the design and to write the reasoned evaluation report.

   Usage (from frontend_new/):
     npm run export-evaluation-catalog   → ../backend/internal/evaluation/catalog/catalog.json
     node scripts/export-evaluation-catalog.mjs <output path>

   Run it again after every change to src/data/evaluationOptions.js, methods.js or
   instruments.js, then rebuild the backend. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    GOAL_CATEGORIES,
    STAGES,
    DEVELOPMENT_STAGE_INFO,
    ACCESSIBILITY_OPTIONS,
    PARTICIPANT_OPTIONS,
    TIME_OPTIONS,
    EXTRA_CONSTRAINTS,
} from '../src/data/evaluationOptions.js';
import ALL_METHODS from '../src/data/methods.js';
import ALL_INSTRUMENTS from '../src/data/instruments.js';

const here = dirname(fileURLToPath(import.meta.url));
const output = resolve(
    process.argv[2] ||
        resolve(here, '../../backend/internal/evaluation/catalog/catalog.json'),
);

const normalize = (text) => String(text || '').toLowerCase().replace(/[^a-z]/g, '');

// Description of an option from the "learn more" items (matched by name).
function describe(items, name) {
    const item = (items || []).find((i) => normalize(i.name) === normalize(name));
    return item?.desc || '';
}

const goals = GOAL_CATEGORIES.flatMap((category) =>
    category.options.map((name) => ({
        name,
        category: category.title,
        description: describe(category.learnMore?.items, name),
    })),
);

const stages = STAGES.map((name) => ({
    name,
    description: describe(DEVELOPMENT_STAGE_INFO.items, name),
}));

const pick = (object, keys) =>
    Object.fromEntries(
        keys
            .filter((key) => object[key] !== undefined && object[key] !== '')
            .map((key) => [key, object[key]]),
    );

const catalog = {
    goals,
    stages,
    participants: PARTICIPANT_OPTIONS,
    accessibility: ACCESSIBILITY_OPTIONS,
    time: TIME_OPTIONS,
    extraConstraints: EXTRA_CONSTRAINTS,
    methods: ALL_METHODS.map((m) =>
        pick(m, ['id', 'name', 'description', 'type', 'stages', 'goals']),
    ),
    instruments: ALL_INSTRUMENTS.map((i) =>
        pick(i, [
            'id',
            'name',
            'description',
            'type',
            'attributes',
            'stages',
            'constraints',
            'forMethodIds',
            'coversGoals',
        ]),
    ),
};

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, JSON.stringify(catalog, null, 2) + '\n');
console.log(
    `Wrote ${output}: ${goals.length} goals, ${catalog.methods.length} methods, ${catalog.instruments.length} instruments`,
);
