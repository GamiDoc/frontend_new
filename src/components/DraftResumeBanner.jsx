import Icon from './Icon';

/* Offers to pick up an unfinished plan that is still held in this browser,
   so nothing is lost when a visitor leaves before creating an account. */
function DraftResumeBanner({ onResume, onDiscard }) {
  return (
    <section className="draft-banner-section">
      <div className="draft-banner">
        <span className="draft-banner-icon"><Icon name="fileText" size={20} /></span>
        <div className="draft-banner-text">
          <strong>You have an unfinished evaluation plan</strong>
          <span>It is stored in this browser — no account needed to continue.</span>
        </div>
        <div className="draft-banner-actions">
          <button className="btn btn-primary" onClick={onResume}>Continue plan</button>
          <button className="btn btn-secondary" onClick={onDiscard}>Discard</button>
        </div>
      </div>
    </section>
  );
}

export default DraftResumeBanner;
