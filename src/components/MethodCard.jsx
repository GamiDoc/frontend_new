function MethodCard({ title, description, tags, icon }) {
  return (
    <div className="method-card">
      <div className="method-card-left">
        <div className="method-card-icon">{icon}</div>

        <div className="method-card-content">
          <h4>{title}</h4>
          <p>{description}</p>

          <div className="method-card-tags">
            {tags.map((tag, index) => (
              <span key={index} className="method-tag">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="method-card-right">
        <input type="checkbox" />
      </div>
    </div>
  );
}

export default MethodCard;