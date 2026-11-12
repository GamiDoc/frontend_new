/* Exports the Design System section schema (src/data/designSections.js) as JSON for the
   backend, which uses it to let the AI pre-fill the sections from the Spark.

   Usage (from frontend_new/):
     npm run export-schema                      → ../backend/internal/design/schema/sections.json
     node scripts/export-design-schema.mjs <output path>

   Run it again after every change to designSections.js, then rebuild the backend. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    DESIGN_SECTIONS,
    normalizeOptions,
} from '../src/data/designSections.js';

const here = dirname(fileURLToPath(import.meta.url));
const output = resolve(
    process.argv[2] ||
        resolve(here, '../../backend/internal/design/schema/sections.json'),
);

const FIELD_PROPS = [
    'key',
    'label',
    'title',
    'hint',
    'group',
    'type',
    'display',
    'placeholder',
    'itemLabel',
    'badge',
    'description',
    'popupIntro',
    'loop',
];

function exportField(field) {
    const out = {};
    for (const prop of FIELD_PROPS) {
        if (typeof field[prop] === 'string' && field[prop] !== '')
            out[prop] = field[prop];
    }
    if (field.options) out.options = normalizeOptions(field.options);
    if (field.other) out.other = true;
    if (field.required) out.required = true;
    if (field.numbered) out.numbered = true;
    if (field.showIf)
        out.showIf = (
            Array.isArray(field.showIf) ? field.showIf : [field.showIf]
        ).map(({ key, includes, keep }) => ({
            key,
            includes,
            keep: Boolean(keep),
        }));
    if (field.itemFields) out.itemFields = field.itemFields.map(exportField);
    return out;
}

const sections = DESIGN_SECTIONS.map((section) => ({
    number: section.number,
    title: section.title,
    description: section.description,
    summary: section.summary,
    optional: Boolean(section.optional),
    groups: section.groups.map(({ id, title, description }) => ({
        id,
        title,
        ...(description ? { description } : {}),
    })),
    fields: section.fields.map(exportField),
}));

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify({ sections }, null, 2)}\n`);
console.log(`Design schema (${sections.length} sections) → ${output}`);
