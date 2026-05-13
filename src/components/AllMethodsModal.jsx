import ALL_METHODS from '../data/methods';

function AllMethodsModal({ selectedMethods = [], onToggleMethod, onClose }) {
  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="all-methods-modal" onClick={(e) => e.stopPropagation()}>

        <div className="all-methods-modal-header">
          <div>
            <h2>All Available Methods</h2>
            <p>Select one or more methods to add to your evaluation plan.</p>
          </div>
          <button className="auth-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="all-methods-modal-list">
          {ALL_METHODS.map((method) => {
            const isSelected = selectedMethods.includes(method.name);
            return (
              <div
                key={method.id}
                className={`all-methods-modal-item${isSelected ? ' all-methods-modal-item--selected' : ''}`}
                onClick={() => onToggleMethod(method.name)}
              >
                <div className="all-methods-modal-item-left">
                  <div className="all-methods-modal-icon">{method.icon}</div>
                  <div className="all-methods-modal-content">
                    <h4>{method.name}</h4>
                    <p>{method.description}</p>
                    {method.rationale && (
                      <p className="all-methods-rationale">💡 {method.rationale}</p>
                    )}
                  </div>
                </div>
                <div className="all-methods-modal-check">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleMethod(method.name)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="all-methods-modal-footer">
          <span className="all-methods-modal-count">
            {selectedMethods.length} method{selectedMethods.length !== 1 ? 's' : ''} selected
          </span>
          <button className="btn btn-primary" onClick={onClose}>
            Confirm selection
          </button>
        </div>

      </div>
    </div>
  );
}

export default AllMethodsModal;
