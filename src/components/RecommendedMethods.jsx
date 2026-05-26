import { useState } from "react";
import MethodCard from "./MethodCard";

const COLLAPSED_COUNT = 3;

function RecommendedMethods({ methods, selectedMethods = [], onToggleMethod, hasError }) {
  const [expanded, setExpanded] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const visible = expanded ? methods : methods.slice(0, COLLAPSED_COUNT);
  const hiddenCount = methods.length - COLLAPSED_COUNT;

  return (
    <section className="recommended-methods-section">
      <div className={`recommended-methods-container${hasError ? ' section--error' : ''}`}
           style={hasError ? { padding: '1rem', borderRadius: 8 } : {}}>
        <div className="recommended-instruments-header" onClick={() => setCollapsed(v => !v)}>
          <h3>Recommended methods based on your selections</h3>
          <span className={`recommended-instruments-arrow${collapsed ? ' recommended-instruments-arrow--collapsed' : ''}`}>
            ›
          </span>
        </div>

        {!collapsed && (
          <>
            <p>
              These methods are suggested based on your selected goals, development
              stage, and constraints.
            </p>

            <div className="methods-list">
              {visible.map((method) => (
                <MethodCard
                  key={method.id}
                  title={method.name || method.title}
                  description={method.description}
                  tags={method.tags || (method.priority ? [method.priority] : [])}
                  tagClass={method.priority === 'Added' ? 'method-tag--added' : ''}
                  icon={method.icon || 'clipboard'}
                  selected={selectedMethods.includes(method.name || method.title)}
                  onToggle={onToggleMethod}
                />
              ))}
            </div>

            {hiddenCount > 0 && (
              <button
                className="instruments-expand-btn"
                onClick={() => setExpanded((v) => !v)}
              >
                {expanded ? '↑ Show less' : `↓ Show ${hiddenCount} more methods`}
              </button>
            )}

            {hasError && (
              <p className="field-error" style={{ marginTop: '0.75rem' }}>
                Select at least one method.
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export default RecommendedMethods;
