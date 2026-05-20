function NavigationButtons({ onBack, onNext, nextLabel = 'Next', error }) {
  return (
    <div className="nav-buttons">
      <button className="btn-secondary" onClick={onBack}>
        Back
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {error && <span className="nav-error">{error}</span>}
        <button className="btn-primary" onClick={onNext}>
          {nextLabel}
        </button>
      </div>
    </div>
  );
}

export default NavigationButtons;
