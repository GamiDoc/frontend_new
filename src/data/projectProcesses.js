/* =====================================================
   PROJECT PROCESSES
   A project can hold two independent processes:
   - UX Evaluation  → project.wizardStatus (4-step wizard)
   - Design System  → GET /projects/{id}/design (6 sections)
   These helpers turn each one into the same small summary,
   used by the projects list (Dashboard) and ProjectDetail.

   summary = { state, label, percent }
     state  'not_started' | 'in_progress' | 'complete'
     label  short text for badges, e.g. "Step 2 of 4", "40%"
   ===================================================== */
import {
    DESIGN_SECTIONS,
    contentToValues,
    sectionProgress,
} from './designSections';

export const EVALUATION_STEPS = 4;

// Wizard step → page of the evaluation wizard (see WizardContext).
export const EVALUATION_STEP_TO_PAGE = {
    1: 'setup',
    2: 'methods',
    3: 'instruments',
    4: 'evaluation',
};

/* UX Evaluation, from project.wizardStatus.
   Started = step 1 saved (the backend moves currentStep past 1). */
export function evaluationSummary(project) {
    const wizard = project?.wizardStatus;
    if (wizard?.isComplete) {
        return { state: 'complete', label: 'Complete', percent: 100 };
    }
    const step = wizard?.currentStep || 1;
    if (step <= 1 && !wizard?.steps?.['1']) {
        return { state: 'not_started', label: 'Not started', percent: 0 };
    }
    const done = step - 1;
    return {
        state: 'in_progress',
        label: `Step ${step} of ${EVALUATION_STEPS}`,
        percent: Math.round((done / EVALUATION_STEPS) * 100),
    };
}

/* Design System, from the design status returned by the backend.
   Percent = average completion of the 6 sections (same rule as the
   Design System overview); complete = every section complete. */
export function designSummary(designStatus) {
    if (!designStatus) {
        return { state: 'not_started', label: 'Not started', percent: 0 };
    }
    const progresses = DESIGN_SECTIONS.map((section) => {
        const content =
            designStatus.sections?.[String(section.number)]?.content;
        return sectionProgress(section, contentToValues(section, content));
    });
    const percent = Math.round(
        progresses.reduce((sum, p) => sum + p.percent, 0) /
            DESIGN_SECTIONS.length,
    );
    const started =
        Boolean(designStatus.spark) || designStatus.cursor > 0 || percent > 0;
    if (!started) {
        return { state: 'not_started', label: 'Not started', percent: 0 };
    }
    if (progresses.every((p) => p.complete)) {
        return { state: 'complete', label: 'Complete', percent: 100 };
    }
    // Spark written but no field filled yet: "Started" reads better than "0%".
    const label = percent > 0 ? `${percent}%` : 'Started';
    return { state: 'in_progress', label, percent };
}
