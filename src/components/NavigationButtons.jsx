function NavigationButtons({ onBack, onNext, nextLabel = "Next" }) {
  return (
    <div className="nav-buttons">
      <button className="btn-secondary" onClick={onBack}>
        Back
      </button>

      <button className="btn-primary" onClick={onNext}>
        {nextLabel}
      </button>
    </div>
  );
}

export default NavigationButtons;