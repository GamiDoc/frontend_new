import { useState } from "react";
import InfoTooltip from "./InfoTooltip";


function ResearchSpecification() {
  const [enabled, setEnabled] = useState(false);
  const [researchQuestions, setResearchQuestions] = useState([]);
  const [defineHypothesis, setDefineHypothesis] = useState(false);
  const [hypotheses, setHypotheses] = useState([]);

  const addResearchQuestion = () => {
    setResearchQuestions([...researchQuestions, ""]);
  };

  const addHypothesis = () => {
    setHypotheses([...hypotheses, ""]);
  };

  const updateResearchQuestion = (index, value) => {
    const updated = [...researchQuestions];
    updated[index] = value;
    setResearchQuestions(updated);
  };

  const updateHypothesis = (index, value) => {
    const updated = [...hypotheses];
    updated[index] = value;
    setHypotheses(updated);
  };

  return (
    <section className="research-section">
      <div className="research-box">
        <div className="research-header">
          <h2>Research specification
             <InfoTooltip text="Provide research-specific details when the evaluation is intended for academic study or publication." />


          </h2>
         

          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={enabled}
              onChange={() => setEnabled(!enabled)}
            />
            <span className="slider"></span>
          </label>
        </div>

        {enabled && (
          <>
            <div className="research-objective">
              <h3>Research Objective</h3>
              <p className="section-description">
                Enter specific details if your evaluation is for research publication.
              </p>

              <p className="question-label">
                What is the main research objective of this evaluation?
              </p>

              <input
                type="text"
                className="text-input"
                placeholder="e.g. to test whether competitive gamification increases intrinsic motivation in students."
              />
            </div>

            <div className="research-questions">
              <h3>Research Question (RQ)</h3>
              <button className="secondary-btn" onClick={addResearchQuestion}>
                + Add Research question
              </button>

              <div className="dynamic-inputs">
                {researchQuestions.map((question, index) => (
                  <input
                    key={index}
                    type="text"
                    className="text-input"
                    placeholder={`Research question ${index + 1}`}
                    value={question}
                    onChange={(e) => updateResearchQuestion(index, e.target.value)}
                  />
                ))}
              </div>
            </div>

            <div className="hypotheses">
              <h3>
                Hypotheses <span className="optional">(optional)</span>
              </h3>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={defineHypothesis}
                  onChange={() => setDefineHypothesis(!defineHypothesis)}
                />
                <span>Define Hypothesis</span>
              </label>

              {defineHypothesis && (
                <>
                  <button className="secondary-btn" onClick={addHypothesis}>
                    + Add hypotheses
                  </button>

                  <div className="dynamic-inputs">
                    {hypotheses.map((hypothesis, index) => (
                      <input
                        key={index}
                        type="text"
                        className="text-input"
                        placeholder={`Hypothesis ${index + 1}`}
                        value={hypothesis}
                        onChange={(e) => updateHypothesis(index, e.target.value)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default ResearchSpecification;