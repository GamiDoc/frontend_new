import { useAuth } from '../context/AuthContext';
import { useWizard } from '../context/WizardContext';

/* R1 — registration is postponed to the end of the wizard. This makes that
   promise explicit so anonymous users do not abandon the flow at step 1. */
function WizardAccountNotice({ onOpenLogin }) {
  const { user } = useAuth();
  const { editingProjectId } = useWizard();

  if (user || editingProjectId) return null;

  return (
    <section className="wizard-notice-section">
      <div className="wizard-notice">
        <span className="wizard-notice-badge">No account needed</span>
        <span className="wizard-notice-text">
          Your plan is kept in this browser while you work. You only need an account
          at the last step, to save it to a dashboard — nothing you enter is lost.
        </span>
        {onOpenLogin && (
          <button className="wizard-notice-link" onClick={onOpenLogin}>
            Already have an account?
          </button>
        )}
      </div>
    </section>
  );
}

export default WizardAccountNotice;
