import { useState } from 'react';

function AlternativeMethodsBox({ onOpen }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="alternative-methods-section">
      <div className="alternative-methods-box">
        <div
          className="alternative-methods-header"
          onClick={() => setOpen((v) => !v)}
          style={{ cursor: 'pointer' }}
        >
          <span className={`alternative-methods-arrow${open ? ' alternative-methods-arrow--open' : ''}`}>›</span>
          <span>Looking for alternative methods?</span>
        </div>

        {open && (
          <button className="alternative-methods-link" onClick={onOpen}>
            Browse all methods
          </button>
        )}
      </div>
    </section>
  );
}

export default AlternativeMethodsBox;
