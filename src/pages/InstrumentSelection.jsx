import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Stepper from "../components/Stepper";
import NavigationButtons from "../components/NavigationButtons";
import SelectionSummary from "../components/SelectionSummary";
import InstrumentSection from "../components/InstrumentSection";
import AlternativeInstrumentsBox from "../components/AlternativeInstrumentsBox";
function InstrumentSelection() {
         const previousSelections = {
    goals: ["Usability", "Engagement"],
    developmentStage: "Low-fidelity prototype",
    constraints: ["Limited time", "Limited participants"],
    methods: ["Usability testing", "Questionnaire & methods"]
  };

  const usabilityInstruments = [
    {
      id: "task-protocol",
      title: "Task based protocol",
      description: "Guide users through specific tasks to identify usability issues.",
      tags: ["Usability"],
      note: "Fits your participant burden - Recommended for quick, focused usability evaluations",
      icon: "🎯"
    },
    {
      id: "think-aloud",
      title: "Think-Aloud script",
      description: "Instruct users to think aloud and explain their thought process.",
      tags: ["Engagement"],
      note: "Fits your limited time - Suited for in-depth, exploratory sessions",
      icon: "📋"
    }
      
  ];


  const questionnaireInstruments = [
    {
      id: "umux-lite",
      title: "UMUX-Lite",
      description: "Measure perceived usability with 2 items.",
      tags: ["Perceived Usability"],
      note: "Fits your limited time and early-stage prototype",
      icon: "📝"
    },
    {
      id: "sus",
      title: "SUS",
      description: "10-item usability scale.",
      tags: ["Usability"],
      note: "Requires more participant time and is better suited for comprehensive evaluations.",
      icon: "📋"
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

      <Stepper currentStep={3} />

      <main className="instrument-selection-page">
        <section className="instrument-selection-intro">
          <div className="instrument-selection-container">
            <h2>Instrument Selection</h2>
            <p>
              Select specific instruments, such as questionnaires, protocols, or scripts,
              to operationalize your chosen evaluation methods.
            </p>
            <p>
              The following recommendations are based on your selections.
            </p>
          </div>
        </section>

        <SelectionSummary
          goals={previousSelections.goals}
          developmentStage={previousSelections.developmentStage}
          constraints={previousSelections.constraints}
          methods={previousSelections.methods}
        />

        <InstrumentSection
          title="Recommended Instruments for usability testing"
          instruments={usabilityInstruments}
        />

        <InstrumentSection
          title="Recommended Instruments for Surveys & Questionnaires"
          instruments={questionnaireInstruments}
        />

        <AlternativeInstrumentsBox />

        <NavigationButtons
          onBack={() => console.log("Back to method selection")}
          onNext={() => console.log("Go to evaluation")}
          nextLabel="Next: Evaluation"
        />
      </main>

      <Footer />
    </div>
  );


   
} // Instrument selection


export default InstrumentSelection;