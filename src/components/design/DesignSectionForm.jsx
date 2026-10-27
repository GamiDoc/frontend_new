import DesignField from './DesignField';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * DesignSectionForm — section body
 * ═══════════════════════════════════════════════════════════════════════════
 * Each group of the schema (section.groups) is made up by a title and several fields. It does not
 * contain any logic: it receives only values and it and it send any change to `onChange(key, value)`.
 * */
function DesignSectionForm({ section, values, onChange }) {
    const tabs = section.groups.filter((g) => g.tab);

    // Field of a group 
    function renderFields(groupId, loopId) {
        return section.fields
            .filter(
                (f) =>
                    f.group === groupId &&
                    (loopId === undefined || f.loop === loopId),
            )
            .map((f) => (
                <DesignField
                    key={f.key}
                    field={f}
                    value={values[f.key]}
                    onChange={(v) => onChange(f.key, v)}
                />
            ));
    }

    return (
        <div className={`ds-section-form ds-section-form--${section.id}`}>
            {tabs.length > 0 && (
                <nav className="ds-tabs" aria-label={`${section.title} phases`}>
                    {tabs.map((g) => (
                        <a
                            key={g.id}
                            href={`#ds-group-${g.id}`}
                            className={`ds-tab ds-tab--${g.id}`}
                        >
                            {g.tab}
                        </a>
                    ))}
                </nav>
            )}

            {section.groups.map((group) => (
                <section
                    key={group.id}
                    id={`ds-group-${group.id}`}
                    className={`ds-group ds-group--${group.id}`}
                >
                    <header className="ds-group-header">
                        {group.phase && (
                            <span className="ds-group-phase">
                                Phase {group.phase}
                            </span>
                        )}
                        <span className="ds-group-title">{group.title}</span>
                        {group.question && (
                            <h2 className="ds-group-question">
                                {group.question}
                            </h2>
                        )}
                        {group.description && (
                            <p className="ds-group-description">
                                {group.description}
                            </p>
                        )}
                    </header>

                    {section.loops && group.id === 'loops'
                        ? section.loops.map((loop) => (
                              <details
                                  key={loop.id}
                                  className={`ds-loop ds-loop--${loop.id}`}
                              >
                                  <summary>
                                      <span className="ds-loop-badge">
                                          {loop.badge}
                                      </span>
                                      <span className="ds-loop-title">
                                          {loop.title}
                                      </span>
                                  </summary>
                                  {renderFields(group.id, loop.id)}
                              </details>
                          ))
                        : renderFields(group.id)}
                </section>
            ))}
        </div>
    );
}

export default DesignSectionForm;
