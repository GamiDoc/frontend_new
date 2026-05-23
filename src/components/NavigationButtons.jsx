function NavigationButtons({ onBack, onNext, nextLabel = 'Next', error }) {
  return (
    <>
      <div className="nav-buttons">
        <button className="btn-secondary" onClick={onBack}>
          Back
        </button>
        <button className="btn-primary" onClick={onNext}>
          {nextLabel}
        </button>
      </div>
      {error && <p className="nav-error nav-error--right">{error}</p>}
    </>
  );
}

export default NavigationButtons;
