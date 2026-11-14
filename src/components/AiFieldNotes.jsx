import { useWizard } from '../context/WizardContext';

/* Why the AI chose a value of the evaluation wizard, shown next to the choice itself
   (same look as the AI notes of the Design System: `.ds-ai-note`).

   Notes come from wizardStatus.aiFill.notes[step] (the AI fill of the evaluation from the
   design). Only the notes of values still chosen are shown, so a note disappears when the
   user changes the choice. `value` limits the notes to one option (e.g. one method). */

function stillChosen(note, data) {
    if (note.field === 'research') return Boolean(data.researchEnabled);
    const current = data[note.field];
    if (Array.isArray(current)) return current.includes(note.value);
    return current === note.value;
}

function AiFieldNotes({ step, field, value }) {
    const { aiFill, step1Data, step2Data, step3Data } = useWizard();
    if (aiFill?.state !== 'done') return null;

    const data = { 1: step1Data, 2: step2Data, 3: step3Data }[step] || {};
    const notes = (aiFill.notes?.[String(step)] || []).filter(
        (note) =>
            note.field === field &&
            (value === undefined || note.value === value) &&
            stillChosen(note, data),
    );
    if (notes.length === 0) return null;

    return (
        <div className="ai-field-notes">
            {notes.map((note) => {
                const assumed = Boolean(note.assumed);
                return (
                    <p
                        key={`${note.field}|${note.value}`}
                        className={`ds-ai-note ds-ai-note--${assumed ? 'low' : 'medium'}`}
                        role="note"
                    >
                        <span className="ds-ai-note-badge">
                            ✦ AI
                            {note.value && value === undefined
                                ? ` · ${note.value}`
                                : ''}
                            {assumed ? ' · please check' : ''}
                        </span>{' '}
                        <span className="ds-ai-note-reason">{note.reason}</span>
                    </p>
                );
            })}
        </div>
    );
}

export default AiFieldNotes;
