function FeatureCard({icon, title,description,buttonText}){
  
    return(
 <div className="feature-card">
          <div className="card-icon">
            <img src={icon} alt="Project icon" />
          </div>
          <h3>{title}</h3>
          <p>{description}</p>
          <button className="btn btn-secondary">{buttonText}</button>
        </div>
    );
}
export default FeatureCard;