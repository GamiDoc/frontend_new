import Icon from './Icon';
import MatchRationale from './MatchRationale';

function MethodCard({
  title,
  description,
  tags,
  icon,
  tagClass = '',
  selected = false,
  onToggle,
  rationale,
  matchChips = [],
}) {
  return (
    <div className={`method-card${selected ? ' method-card--selected' : ''}`} onClick={() => onToggle && onToggle(title)} style={{ cursor: 'pointer' }}>
      <div className="method-card-left">
        <div className="method-card-icon"><Icon name={icon || 'clipboard'} size={22} /></div>

        <div className="method-card-content">
          <h4>{title}</h4>
          <p>{description}</p>

          <div className="method-card-tags">
            {tags.map((tag, index) => (
              <span key={index} className={`method-tag ${tagClass}`}>
                {tag}
              </span>
            ))}
          </div>

          <MatchRationale rationale={rationale} chips={matchChips} />
        </div>
      </div>

      <div className="method-card-right">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggle && onToggle(title)}
          onClick={e => e.stopPropagation()}
        />
      </div>
    </div>
  );
}

export default MethodCard;
