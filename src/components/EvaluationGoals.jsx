import GoalCard from "../components/GoalCard";

const GOAL_CATEGORIES = [
  {
    title: "Pragmatic UX",
    description: "Task efficiency and usability.",
    options: ["Usability & Efficiency", "Guidance & Feedback"],
  },
  {
    title: "Hedonic UX",
    description: "Enjoyment and aesthetic appeal.",
    options: ["Novelty / Curiosity", "Aesthetic & Attractiveness"],
  },
  {
    title: "Psychological Needs",
    description: "Autonomy, competence, and relatedness.",
    options: [
      "Competence / Mastery",
      "Autonomy / Perceived Choice",
      "Social Connection / Relatedness",
    ],
  },
  {
    title: "Cognitive Engagement",
    description: "Attention, immersion, and focus.",
    options: [
      "Progress / Accomplishment",
      "Engagement",
      "Immersion / Flow / Focused Attention",
    ],
  },
];

function EvaluationGoals({ value = [], onChange, hasError }) {
  function handleToggle(option) {
    if (!onChange) return;
    const next = value.includes(option)
      ? value.filter((g) => g !== option)
      : [...value, option];
    onChange(next);
  }

  return (
    <section className="evaluation-goals-section">
      <div className={`evaluation-goals-box${hasError ? ' section--error' : ''}`}>
        <h2>Evaluation Goals</h2>
        <p className="section-description">Define your evaluation goals.</p>

        <div className="goals-grid">
          {GOAL_CATEGORIES.map((category, index) => (
            <GoalCard
              key={index}
              title={category.title}
              description={category.description}
              options={category.options}
              selectedOptions={value}
              onToggle={handleToggle}
            />
          ))}
        </div>

        {hasError && (
          <p className="field-error">Select at least one evaluation goal.</p>
        )}
      </div>
    </section>
  );
}

export default EvaluationGoals;
