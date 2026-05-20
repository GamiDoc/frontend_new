import projectIcon from '../assets/icons/project.svg';
import knowledgeIcon from '../assets/icons/knowledge.svg';
import evaluationIcon from '../assets/icons/evaluation.svg';
import FeatureCard from './FeatureCard';
import { useWizard } from '../context/WizardContext';

function FeatureCards() {
  const { setPage } = useWizard();

  return (
    <section className="cards-section">
      <div className="cards-container">

        <FeatureCard
          icon={projectIcon}
          title="Work on your project"
          description="Start a new gamification project or resume your work."
          buttonText="Go to projects"
          onClick={() => setPage('dashboard')}
        />

         <FeatureCard
          icon={knowledgeIcon}
          title="Explore UX knowledge"
          description="Browse evaluation methods and UX frameworks."
          buttonText="Browse methods"
        />

         <FeatureCard
          icon={evaluationIcon}
          title="Plan your evaluation"
          description="Define goals, select methods, choose instruments."
          buttonText="Plan evaluation"
        />

        
      </div>
    </section>
  );
}

export default FeatureCards;