/* R3 — explains a single recommendation in terms of the user's own inputs. */
function MatchRationale({ rationale, chips = [] }) {
  if (!rationale && chips.length === 0) return null;

  return (
    <div className="match-rationale">
      <span className="match-rationale-title">Why this fits your project</span>
      {rationale && <p className="match-rationale-text">{rationale}</p>}
      {chips.length > 0 && (
        <div className="match-rationale-chips">
          {chips.map(({ label, value }, i) => (
            <span key={`${label}-${value}-${i}`} className="match-chip">
              <span className="match-chip-label">{label}</span>
              {value}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default MatchRationale;
