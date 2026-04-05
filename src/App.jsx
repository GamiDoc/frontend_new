



import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeatureCards from './components/FeatureCards';
import InfoSection from './components/InfoSection';
import Footer from './components/Footer';
import EvaluationSetup from './pages/EvaluationSetup';


function App() {
  return (
    
    <div className="page">
 
      

      <main>
         <Navbar />
        <Hero />
        <FeatureCards />
        <InfoSection />
      </main>
     
       {/* <EvaluationSetup /> */}

      <Footer />

    </div>
  );
}

export default App;