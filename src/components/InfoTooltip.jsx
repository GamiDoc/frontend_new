import { useState } from 'react';
import LearnMoreModal from './LearnMoreModal';

function InfoTooltip({ text, learnMore }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <span className="info-wrapper">
        <span className="info-icon">i</span>
        <span className="tooltip-box">
          {text}
          {learnMore && (
            <a
              href="#"
              className="tooltip-link"
              onClick={e => { e.preventDefault(); e.currentTarget.blur(); setOpen(true); }}
            >
              {' '}Learn more
            </a>
          )}
        </span>
      </span>
      {open && learnMore && (
        <LearnMoreModal
          title={learnMore.title}
          intro={learnMore.intro}
          items={learnMore.items}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

export default InfoTooltip;
