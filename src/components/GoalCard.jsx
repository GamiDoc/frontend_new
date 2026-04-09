import InfoTooltip from "./InfoTooltip";


function GoalCard({ title, description, options }) {
  return (
    <div className="goal-card">
      <h3>
        {title}
        <InfoTooltip text={description} />
      </h3>
      <p className="goal-card-description">{description}</p>

      <div className="goal-options">
        {options.map((option, index) => (
          <label key={index} className="goal-option">
            <input type="checkbox" />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default GoalCard;