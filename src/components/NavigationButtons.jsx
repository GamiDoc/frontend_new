function NavigationButtons({ onBack, onNext, nextLabel = 'Next', error }) {
  return (
    <div>
      <div className="nav-buttons">
        <button className="btn-secondary" onClick={onBack}>
          Back
        </button>
        <button className="btn-primary" onClick={onNext}>
          {nextLabel}
        </button>
      </div>
      {error && <p className="nav-error" style={{ textAlign: 'center', marginTop: '0.5rem' }}>{error}</p>}
    </div>
  );
}

export default NavigationButtons;
