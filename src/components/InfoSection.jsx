
import infographic from '../assets/infographic.png';
import ConstructionLink from './ConstructionLink';

function InfoSection(){
    return(

<section className="info-section" >
          
            <h2 className="info-title">
                Designing and evaluating gamification is methodologically hard
            </h2>

            <div className="info-container">
            <div className="info-text">
              <p className="info-paragraph">
                  Researchers and practitioners often struggle to connect
                  gamification design choices with evaluation methods and
                  long-term documentation. As a result, design rationales are
                  lost, evaluations are weak, and results are hard to interpret
                  or reproduce.
              </p>

              <h3>GamiDoc addresses these issues</h3>

              <ul>
                <li>Make gamification design decisions explicit and structured</li>
                <li>Evaluation methods are often chosen late or inconsistently</li>
                <li>Design decisions are rarely documented over time</li>
              </ul>

              <ConstructionLink className="learn-link">
                Learn more about GamiDoc
              </ConstructionLink>
            </div>

            <div className="info-visual">
              <img src={infographic} alt="GamiDoc infographic" className="visual-image" />
            </div>
          </div>
        </section>

    );

}
export default InfoSection;