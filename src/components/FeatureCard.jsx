import ConstructionButton from './ConstructionButton';

function FeatureCard({ icon, title, description, buttonText, onClick }) {
  return (
    <div className="feature-card">
      <div className="card-icon">
        <img src={icon} alt="Project icon" />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {onClick
        ? <button className="btn btn-secondary" onClick={onClick}>{buttonText}</button>
        : <ConstructionButton className="btn btn-secondary">{buttonText}</ConstructionButton>
      }
    </div>
  );
}

export default FeatureCard;
