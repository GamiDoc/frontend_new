import { useState } from 'react';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Stepper from "../components/Stepper";
import EvaluationGoals from "../components/EvaluationGoals";
import DevelopmentStage from "../components/DevelopmentStage";
import ConstraintsSection from "../components/ConstraintsSection";

function EvaluationSetup() {
  return (
    <div>
      <Navbar/>

      <section className='evaluation-header'>
        <div className='container evaluation-header-inner'>
           <h1> Evaluation & UX Methods</h1>
            <p>Follow these steps to create evaluation</p>
        </div>
       
      </section>
   <Stepper currentStep={3} />
   <EvaluationGoals />
   <DevelopmentStage />
   <ConstraintsSection />
   
    </div>
  );
}

export default EvaluationSetup;