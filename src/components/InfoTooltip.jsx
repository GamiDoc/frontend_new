function InfoTooltip({ text }) {
  return (
    <span className="info-wrapper">
      <span className="info-icon">i</span>

      <span className="tooltip-box">
        {text}{" "}
        <a href="#" className="tooltip-link">
          Learn more
        </a>
      </span>
    </span>
  );
}

export default InfoTooltip;