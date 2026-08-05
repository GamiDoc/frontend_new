import { useWizard } from '../context/WizardContext';

const STEP_LABELS = {
  1: 'Evaluation Planning',
  2: 'Method Selection',
  3: 'Instrument Selection',
};

/* R6 — when a step is opened from the review page, editing stays forward-facing:
   the user is told where they came from and can return in one click. */
function EditReturnBar({ step }) {
  const { reviewReturn, returnToReview } = useWizard();

  if (!reviewReturn) return null;

  return (
    <section className="edit-return-section">
      <div className="edit-return-bar">
        <span className="edit-return-text">
          Editing <strong>{STEP_LABELS[step] || `step ${step}`}</strong> from your evaluation review.
          Saving this step takes you straight back.
        </span>
        <button className="edit-return-btn" onClick={returnToReview}>
          Return to Evaluation without saving →
        </button>
      </div>
    </section>
  );
}

export default EditReturnBar;
