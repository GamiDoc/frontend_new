//import { useState } from 'react';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Stepper from "../components/Stepper";
import EvaluationGoals from "../components/EvaluationGoals";
import DevelopmentStage from "../components/DevelopmentStage";
import ConstraintsSection from "../components/ConstraintsSection";
import ResearchSpecification from "../components/ResearchSpecification";
import NavigationButtons from "../components/NavigationButtons";

function EvaluationSetup() {
  return (
    <div>
      <Navbar />

      <section className="evaluation-header">
        <div className="container evaluation-header-inner">
          <h1>Evaluation & UX Methods</h1>
          <p>Follow these steps to create evaluation</p>
        </div>
      </section>

      <Stepper currentStep={1} />

      <main>
        <EvaluationGoals />
        <DevelopmentStage />
        <ConstraintsSection />
        <ResearchSpecification />

        <NavigationButtons
          onBack={() => console.log("Back")}
          onNext={() => console.log("Next")}
          nextLabel="Go to Methods"
        />
      </main>

      <Footer />
    </div>
  );
}

export default EvaluationSetup;