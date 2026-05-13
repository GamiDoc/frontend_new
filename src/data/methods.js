// All available step-2 methods extracted from backend rule/recommendations.json
const ALL_METHODS = [
  {
    id: 'think-aloud',
    name: 'Think-aloud testing',
    description: 'Users verbalize thoughts while interacting with the system to surface usability issues in real time.',
    priority: 'Recommended',
    rationale: 'Useful for early usability evaluation with limited participants.',
    icon: '🗣️',
  },
  {
    id: 'surveys',
    name: 'Surveys & Questionnaires',
    description: 'Collect structured user feedback through standardized questionnaires measuring attitudes, satisfaction, and engagement.',
    priority: 'Recommended',
    rationale: 'Helpful for measuring perceived usability and satisfaction at scale.',
    icon: '📋',
  },
  {
    id: 'heuristic-evaluation',
    name: 'Heuristic evaluation',
    description: 'Experts inspect the interface against established usability principles to identify design problems.',
    priority: 'Recommended',
    rationale: 'Useful for identifying guidance and feedback issues early without requiring users.',
    icon: '🔍',
  },
  {
    id: 'expert-review',
    name: 'Expert review',
    description: 'A focused expert inspection of the proposed experience and interaction flow at concept level.',
    priority: 'Engagement',
    rationale: 'Useful when the project is still at concept level and direct user testing is limited.',
    icon: '👁️',
  },
];

export default ALL_METHODS;
