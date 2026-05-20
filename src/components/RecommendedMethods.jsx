import MethodCard from "./MethodCard";

function RecommendedMethods({ methods, selectedMethods = [], onToggleMethod, hasError }) {
  return (
    <section className="recommended-methods-section">
      <div className={`recommended-methods-container${hasError ? ' section--error' : ''}`}
           style={hasError ? { padding: '1rem', borderRadius: 8 } : {}}>
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

        {hasError && (
          <p className="field-error" style={{ marginTop: '0.75rem' }}>
            Select at least one method.
          </p>
        )}
      </div>
    </section>
  );
}

export default RecommendedMethods;
