import { useState } from 'react';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Stepper from "../components/Stepper";

function EvaluationSetup() {
  return (
    <div>
      <Navbar/>
      
   <Stepper currentStep={3} />
    </div>
  );
}

export default EvaluationSetup;