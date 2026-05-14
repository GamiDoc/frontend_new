import InstrumentCard from "./InstrumentCard";

function InstrumentSection({ title, instruments }) {
  return (
    <section className="instrument-section">
      <div className="instrument-container">
        <h3>{title}</h3>

        <div className="instrument-list">
          {instruments.map((instrument) => (
            <InstrumentCard key={instrument.id} instrument={instrument} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default InstrumentSection;