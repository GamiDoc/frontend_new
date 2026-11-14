import { useWizard } from '../context/WizardContext';

/* Why the AI chose what is selected in a step of the evaluation wizard
   (wizardStatus.aiFill.notes[step], written when the AI filled in the evaluation).
   Only the choices still selected are listed; nothing is shown otherwise. */

const FIELD_LABELS = {
    evaluationGoals: 'Evaluation goals',
    developmentStage: 'Development stage',
    participants: 'Participants',
    accessibility: 'Participant access',
    time: 'Study duration',
    extraConstraints: 'Other constraints',
    research: 'Research questions',
    selectedMethods: 'Methods',
    selectedInstruments: 'Instruments',
};

function stillChosen(note, data) {
    if (note.field === 'research') return Boolean(data.researchEnabled);
    const current = data[note.field];
    if (Array.isArray(current)) return current.includes(note.value);
    return current === note.value;
}

function AiChoicesPanel({ step }) {
    const { aiFill, step1Data, step2Data, step3Data } = useWizard();
    if (aiFill?.state !== 'done') return null;

    const data = { 1: step1Data, 2: step2Data, 3: step3Data }[step] || {};
    const notes = (aiFill.notes?.[String(step)] || []).filter((note) =>
        stillChosen(note, data),
    );
    if (notes.length === 0) return null;

    return (
        <section className="ai-choices" aria-label="Why the AI chose this">
            <div className="ai-choices-box">
                <h2>Why the AI chose this</h2>
                <ul>
                    {notes.map((note) => (
                        <li key={`${note.field}|${note.value}`}>
                            <span className="ai-choices-field">
                                {FIELD_LABELS[note.field] || note.field}
                                {note.value ? ` · ${note.value}` : ''}
                            </span>
                            <span className="ai-choices-reason">
                                {note.reason}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

export default AiChoicesPanel;
