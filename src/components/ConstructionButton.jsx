import { useState } from 'react';
import ConstructionModal from './ConstructionModal';

function ConstructionButton({ children, className }) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <button className={className} onClick={() => setVisible(true)}>
        {children}
      </button>
      {visible && <ConstructionModal onClose={() => setVisible(false)} />}
    </>
  );
}

export default ConstructionButton;
