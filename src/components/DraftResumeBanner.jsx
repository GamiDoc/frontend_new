import Icon from './Icon';

/* Offers to pick up unfinished work from the landing page, so nothing is lost
   when a visitor leaves before creating an account. Used for both processes:
   the evaluation plan (default texts) and the Design System (texts via props). */
function DraftResumeBanner({
    onResume,
    onDiscard,
    title = 'You have an unfinished evaluation plan',
    text = 'It is stored in this browser — no account needed to continue.',
    resumeLabel = 'Continue plan',
}) {
    return (
        <section className="draft-banner-section">
            <div className="draft-banner">
                <span className="draft-banner-icon">
                    <Icon name="fileText" size={20} />
                </span>
                <div className="draft-banner-text">
                    <strong>{title}</strong>
                    <span>{text}</span>
                </div>
                <div className="draft-banner-actions">
                    <button className="btn btn-primary" onClick={onResume}>
                        {resumeLabel}
                    </button>
                    <button className="btn btn-secondary" onClick={onDiscard}>
                        Discard
                    </button>
                </div>
            </div>
        </section>
    );
}

export default DraftResumeBanner;
