function AlternativeMethodsBox({ onOpen }) {
  return (
    <section className="alternative-methods-section">
      <div className="alternative-methods-box">
        <div className="alternative-methods-header">
          <span className="alternative-methods-arrow">›</span>
          <span>Looking for alternative methods?</span>
        </div>

        <button className="alternative-methods-link" onClick={onOpen}>
          Browse all methods
        </button>
      </div>
    </section>
  );
}

export default AlternativeMethodsBox;
