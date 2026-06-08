function ConstructionModal({ onClose }) {
  return (
    <div className="construction-overlay" onClick={onClose}>
      <div className="construction-modal" onClick={(e) => e.stopPropagation()}>
        <p>This feature is not available right now. It is under construction.</p>
        <button className="construction-ok" onClick={onClose}>OK</button>
      </div>
    </div>
  );
}

export default ConstructionModal;
