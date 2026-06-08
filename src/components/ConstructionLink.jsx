import { useState } from 'react';
import ConstructionModal from './ConstructionModal';

function ConstructionLink({ children, className }) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <a
        href="#"
        className={className}
        onClick={(e) => { e.preventDefault(); setVisible(true); }}
      >
        {children}
      </a>
      {visible && <ConstructionModal onClose={() => setVisible(false)} />}
    </>
  );
}

export default ConstructionLink;
