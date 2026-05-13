import MethodCard from "./MethodCard";

function RecommendedMethods({ methods, selectedMethods = [], onToggleMethod }) {
  return (
    <section className="recommended-methods-section">
      <div className="recommended-methods-container">
        <h3>Recommended methods based on your selections</h3>
        <p>
          These methods are suggested based on your selected goals, development
          stage, and constraints.
        </p>

        <div className="methods-list">
          {methods.map((method) => (
            <MethodCard
              key={method.id}
              title={method.name || method.title}
              description={method.description}
              tags={method.tags || (method.priority ? [method.priority] : [])}
              tagClass={method.priority === 'Added' ? 'method-tag--added' : ''}
              icon={method.icon || '📋'}
              selected={selectedMethods.includes(method.name || method.title)}
              onToggle={onToggleMethod}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default RecommendedMethods;
