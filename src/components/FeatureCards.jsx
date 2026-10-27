import projectIcon from '../assets/icons/project.svg';
import knowledgeIcon from '../assets/icons/knowledge.svg';
import evaluationIcon from '../assets/icons/evaluation.svg';
import FeatureCard from './FeatureCard';
import { useWizard } from '../context/WizardContext';
import { useDesign } from '../context/DesignContext';

function FeatureCards() {
    const { setPage } = useWizard();
    const {
        hasDesign,
        startDesign,
        resumeDesign,
        loading: designLoading,
    } = useDesign();

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

                {/* Ingresso al Design System: posizione e testi provvisori, i mockup non lo mostrano. */}
                <FeatureCard
                    icon={projectIcon}
                    title="Design your gamification"
                    description="Go from a raw idea to a structured gamification model in six sections."
                    buttonText={
                        designLoading
                            ? 'Starting…'
                            : hasDesign
                              ? 'Continue design'
                              : 'Start designing'
                    }
                    onClick={() => (hasDesign ? resumeDesign() : startDesign())}
                />
            </div>
        </section>
    );
}

export default FeatureCards;
