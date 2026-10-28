import infographic from '../assets/infographic.png';

/* Landing "why GamiDoc" section: problem statement and goals on the left,
   infographic of the GamiDoc cycle on the right. */
function InfoSection() {
    return (
        <section className="info-section">
            <div className="info-container">
                <div className="info-text">
                    <h2 className="info-title">
                        Designing and evaluating gamification is
                        methodologically hard
                    </h2>
                    <p className="info-paragraph">
                        Researchers and practitioners often struggle to connect
                        gamification design choices with evaluation methods and
                        long-term documentation. As a result, design rationales
                        are lost, evaluations are weak, and results are hard to
                        interpret or reproduce.
                    </p>

                    <h3>GamiDoc addresses these issues</h3>
                    <ul>
                        <li>
                            Make gamification design decisions explicit and
                            structured
                        </li>
                        <li>
                            Evaluation methods are often chosen late or
                            inconsistently
                        </li>
                        <li>
                            Design decisions are rarely documented over time
                        </li>
                    </ul>
                </div>

                <div className="info-visual">
                    <img
                        src={infographic}
                        alt="The GamiDoc cycle: define context, design the gameful system, plan the UX evaluation, generate the report"
                        className="visual-image"
                    />
                </div>
            </div>
        </section>
    );
}

export default InfoSection;
