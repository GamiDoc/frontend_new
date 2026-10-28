import projectIcon from '../assets/icons/project.svg';
import FeatureCard from './FeatureCard';
import { useWizard } from '../context/WizardContext';
import { useDesign } from '../context/DesignContext';
import { useAuth } from '../context/AuthContext';

/* Landing options, in two groups:
   - Start a Project: Design System and UX Evaluation
   - Explore Resources: UX methods and reviewed designs (not built yet → "under construction")
   The two start buttons ALWAYS begin a new project; projects already started
   are continued from the Dashboard (project page).
   A design or evaluation started by a logged-in user is saved as a project. */
function FeatureCards() {
    const { user, loading: authLoading } = useAuth();
    const { startWizard, createProject, loading: wizardLoading } = useWizard();
    const { startDesign, loading: designLoading } = useDesign();

    return (
        <>
            <section className="landing-section">
                <header className="landing-section-header">
                    <h2>Start a Project</h2>
                    <p>
                        Design and evaluate a gamified system using structured
                        workflows and scientific UX methods.
                    </p>
                </header>
                <div className="cards-container">
                    <FeatureCard
                        icon={projectIcon}
                        title="Design a Gamified System"
                        description="Plan a gamification project using structured frameworks and design guidance."
                        buttonText={
                            designLoading ? 'Starting…' : 'Start Designing'
                        }
                        disabled={designLoading}
                        onClick={startDesign}
                    />
                    <FeatureCard
                        icon={projectIcon}
                        title="Evaluate a Gamified System"
                        description="Plan rigorous UX evaluation using validated questionnaires and research methods."
                        buttonText={
                            wizardLoading ? 'Starting…' : 'Start Evaluation'
                        }
                        disabled={wizardLoading || authLoading}
                        onClick={() => (user ? createProject() : startWizard())}
                    />
                </div>
            </section>

            <section className="landing-section">
                <header className="landing-section-header">
                    <h2>Explore Resources</h2>
                    <p>
                        Browse evaluation methods, frameworks, and reviewed
                        examples to support your research.
                    </p>
                </header>
                <div className="cards-container">
                    <FeatureCard
                        icon={projectIcon}
                        title="UX methods"
                        description="Browse evaluation methodologies & gamification frameworks"
                        buttonText="Browse methods"
                        variant="secondary"
                    />
                    <FeatureCard
                        icon={projectIcon}
                        title="View reviewed designs"
                        description="Explore validated UX measurement instruments."
                        buttonText="View Designs"
                        variant="secondary"
                    />
                </div>
            </section>
        </>
    );
}

export default FeatureCards;
