function FeatureCard({icon, title, description, buttonText, onClick}){

    return(
 <div className="feature-card">
          <div className="card-icon">
            <img src={icon} alt="Project icon" />
          </div>
          <h3>{title}</h3>
          <p>{description}</p>
          <button className="btn btn-secondary" onClick={onClick}>{buttonText}</button>
        </div>
    );
}
export default FeatureCard;