import GoalCard from "../components/GoalCard";

function EvaluationGoals() {
  const goalCategories = [
    {
      title: "Pragmatic UX",
      description: "Task efficiency and usability.",
      options: ["Usability & Efficiency", "Guidance & Feedback"]
    },
    {
      title: "Hedonic UX",
      description: "Enjoyment and aesthetic appeal.",
      options: ["Novelty / Curiosity", "Aesthetic & Attractiveness"]
    },
    {
      title: "Psychological Needs",
      description: "Autonomy, competence, and relatedness.",
      options: [
        "Competence / Mastery",
        "Autonomy / Perceived Choice",
        "Social Connection / Relatedness"
      ]
    },
    {
      title: "Cognitive Engagement",
      description: "Attention, immersion, and focus.",
      options: [
        "Progress / Accomplishment",
        "Engagement",
        "Immersion / Flow / Focused Attention"
      ]
    }
  ];

  return (
    <section className="evaluation-goals-section">
      <div className="evaluation-goals-box">
        <h2>Evaluation Goals</h2>
        <p className="section-description">Define your evaluation goals.</p>

        <div className="goals-grid">
          {goalCategories.map((category, index) => (
            <GoalCard
              key={index}
              title={category.title}
              description={category.description}
              options={category.options}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default EvaluationGoals;