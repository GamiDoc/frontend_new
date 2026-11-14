import GoalCard from '../components/GoalCard';
import { GOAL_CATEGORIES } from '../data/evaluationOptions';

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
            <div
                className={`evaluation-goals-box${hasError ? ' section--error' : ''}`}
            >
                <h2>Evaluation Goals</h2>
                <p className="section-description">
                    Define your evaluation goals.
                </p>

                <div className="goals-grid">
                    {GOAL_CATEGORIES.map((category, index) => (
                        <GoalCard
                            key={index}
                            title={category.title}
                            description={category.description}
                            options={category.options}
                            selectedOptions={value}
                            onToggle={handleToggle}
                            learnMore={category.learnMore}
                        />
                    ))}
                </div>

                {hasError && (
                    <p className="field-error">
                        Select at least one evaluation goal.
                    </p>
                )}
            </div>
        </section>
    );
}

export default EvaluationGoals;
