import ConstructionButton from './ConstructionButton';

/* Landing option card: icon on the left, title, description and one button.
   variant 'primary' (yellow, start a project) | 'secondary' (light blue, resources).
   Without onClick the button opens the "under construction" popup. */
function FeatureCard({
    icon,
    title,
    description,
    buttonText,
    onClick,
    disabled = false,
    variant = 'primary',
}) {
    const buttonClass = `btn feature-card-btn feature-card-btn--${variant}`;

    return (
        <article className="feature-card">
            <img
                className="feature-card-icon"
                src={icon}
                alt=""
                aria-hidden="true"
            />
            <div className="feature-card-body">
                <h3>{title}</h3>
                <p>{description}</p>
                {onClick ? (
                    <button
                        className={buttonClass}
                        onClick={onClick}
                        disabled={disabled}
                    >
                        {buttonText} <span aria-hidden="true">&gt;</span>
                    </button>
                ) : (
                    <ConstructionButton className={buttonClass}>
                        {buttonText} <span aria-hidden="true">&gt;</span>
                    </ConstructionButton>
                )}
            </div>
        </article>
    );
}

export default FeatureCard;
