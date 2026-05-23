import { useEffect } from 'react';
import { createPortal } from 'react-dom';

function LearnMoreModal({ title, intro, items, onClose }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div className="lm-overlay" onClick={onClose}>
      <div className="lm-modal" onClick={e => e.stopPropagation()}>
        <div className="lm-header">
          <h2 className="lm-title">{title}</h2>
          <button className="lm-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="lm-body">
          {intro && <p className="lm-intro">{intro}</p>}
          {items && items.length > 0 && (
            <ul className="lm-items">
              {items.map((item, i) => (
                <li key={i} className="lm-item">
                  <strong className="lm-item-name">{item.name}</strong>
                  <p className="lm-item-desc">{item.desc}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default LearnMoreModal;
