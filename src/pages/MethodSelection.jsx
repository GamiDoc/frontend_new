import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Stepper from "../components/Stepper";
import NavigationButtons from "../components/NavigationButtons";
import SelectionSummary from "../components/SelectionSummary";
import RecommendedMethods from "../components/RecommendedMethods";
import AlternativeMethodsBox from "../components/AlternativeMethodsBox";

function MethodSelection() {
  const previousSelections = {
    goals: ["Usability", "Engagement"],
    developmentStage: "Low-fidelity prototype",
    constraints: ["Limited time", "Limited participants"]
  };

  const recommendedMethods = [
    {
      id: 1,
      title: "Usability Testing",
      description:
        "Observe users as they interact with the system to identify usability issues and pain points.",
      tags: ["Usability", "Engagement"],
      icon: "ðŸ–¥ï¸"
    },
    {
      id: 2,
      title: "Surveys & Questionnaires",
      description:
        "Collect quantitative data by asking users structured questions to measure attitudes, engagement, and learning outcomes.",
      tags: ["Learning Outcomes", "Engagement"],
      icon: "ðŸ“‹"
    }
  ];

  return (
    <div>
      <Navbar />

      <section className="evaluation-header">
        <div className="container evaluation-header-inner">
          <h1>Evaluation & UX Methods</h1>
          <p>Follow these steps to create your evaluation plan.</p>
        </div>
      </section>

      <Stepper currentStep={2} />

      <main className="method-selection-page">
        <section className="method-selection-intro">
          <div className="method-selection-container">
            <h2>Method Selection</h2>
            <p>
              Select appropriate evaluation methods based on your defined goals
              and constraints.
            </p>
          </div>
        </section>

        <SelectionSummary
          goals={previousSelections.goals}
          developmentStage={previousSelections.developmentStage}
          constraints={previousSelections.constraints}
        />

        <RecommendedMethods methods={recommendedMethods} />

        <AlternativeMethodsBox />

        <NavigationButtons
          onBack={() => console.log("Back to evaluation setup")}
          onNext={() => console.log("Go to instrument selection")}
          nextLabel="Next: Instrument Selection"
        />
      </main>

      <Footer />
    </div>
  );
}

export default MethodSelection;