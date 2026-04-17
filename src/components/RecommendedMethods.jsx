import MethodCard from "./MethodCard";

function RecommendedMethods({ methods }) {
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
              title={method.title}
              description={method.description}
              tags={method.tags}
              icon={method.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default RecommendedMethods;