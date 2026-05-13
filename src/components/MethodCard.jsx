function MethodCard({ title, description, tags, icon, tagClass = '', selected = false, onToggle }) {
  return (
    <div className={`method-card${selected ? ' method-card--selected' : ''}`}>
      <div className="method-card-left">
        <div className="method-card-icon">{icon}</div>

        <div className="method-card-content">
          <h4>{title}</h4>
          <p>{description}</p>

          <div className="method-card-tags">
            {tags.map((tag, index) => (
              <span key={index} className={`method-tag ${tagClass}`}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="method-card-right">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggle && onToggle(title)}
        />
      </div>
    </div>
  );
}

export default MethodCard;
