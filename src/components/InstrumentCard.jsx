import { useState } from "react";

function InstrumentCard({ instrument }) {
  const [selected, setSelected] = useState(false);

  const handleToggle = () => {
    setSelected((prev) => !prev);
  };

  return (
    <div
      className={`instrument-card ${selected ? "selected" : ""}`}
      onClick={handleToggle}
    >
      <div className="instrument-card-left">
        <div className="instrument-icon">
          {instrument.icon}
        </div>

        <div className="instrument-content">
          <h4>{instrument.title}</h4>
          <p>{instrument.description}</p>

          <div className="instrument-tags">
            {instrument.tags.map((tag, index) => (
              <span key={index} className="instrument-tag">
                {tag}
              </span>
            ))}
          </div>

          <p className="instrument-note">⚡ {instrument.note}</p>
        </div>
      </div>

      <input
        type="checkbox"
        className="instrument-checkbox"
        checked={selected}
        readOnly
      />
    </div>
  );
}

export default InstrumentCard;