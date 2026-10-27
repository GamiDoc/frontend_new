import DesignField from './DesignField';
import { isFieldVisible } from '../../data/designSections';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * DesignSectionForm — section body
 * ═══════════════════════════════════════════════════════════════════════════
 * Each group of the schema (section.groups) is a card with a title, an optional
 * description and its fields. Groups marked `collapsible` are rendered as
 * <details class="ds-group ds-group--collapsible"> (title in the <summary>).
 * It does not contain any logic: it receives the values and sends any change to
 * `onChange(key, value)`.
 * */
function DesignSectionForm({ section, values, onChange }) {
    function renderFields(groupId) {
        return section.fields
            .filter((f) => f.group === groupId && isFieldVisible(f, values))
            .map((f) => (
                <DesignField
                    key={f.key}
                    field={f}
                    values={values}
                    onChange={onChange}
                />
            ));
    }

    return (
        <div className={`ds-section-form ds-section-form--${section.id}`}>
            {section.groups.map((group) => {
                const className = `ds-group ds-group--${group.id}`;
                if (group.collapsible) {
                    return (
                        <details
                            key={group.id}
                            id={`ds-group-${group.id}`}
                            className={`${className} ds-group--collapsible`}
                        >
                            <summary className="ds-group-title">
                                {group.title}
                            </summary>
                            {group.description && (
                                <p className="ds-group-description">
                                    {group.description}
                                </p>
                            )}
                            {renderFields(group.id)}
                        </details>
                    );
                }
                return (
                    <section
                        key={group.id}
                        id={`ds-group-${group.id}`}
                        className={className}
                    >
                        <header className="ds-group-header">
                            <span className="ds-group-title">
                                {group.title}
                            </span>
                            {group.description && (
                                <p className="ds-group-description">
                                    {group.description}
                                </p>
                            )}
                        </header>
                        {renderFields(group.id)}
                    </section>
                );
            })}
        </div>
    );
}

export default DesignSectionForm;
