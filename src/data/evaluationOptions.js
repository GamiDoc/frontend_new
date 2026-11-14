/* Options of the UX Evaluation set-up (step 1): evaluation goals, development stage and
   constraints. Used by the step components and exported to the backend
   (npm run export-evaluation-catalog) for the AI that fills in the evaluation. */

export const GOAL_CATEGORIES = [
    {
        title: 'Pragmatic UX',
        description: 'Task efficiency and usability.',
        options: ['Usability & Efficiency', 'Guidance & Feedback'],
        learnMore: {
            title: 'Pragmatic UX',
            intro: 'Pragmatic UX focuses on how useful, usable, and efficient the product is in allowing people to achieve their goals. It is the foundation of any evaluation — ensuring the core functionality works before assessing higher-order qualities.',
            items: [
                {
                    name: 'Usability & Efficiency',
                    desc: 'How well a system helps users achieve goals quickly, clearly, and without mistakes. In gamification, efficiency ensures that playful features (points, badges, challenges) add value rather than confusion. Recommended instruments: AttrakDiff, UEQ, meCUE.',
                },
                {
                    name: 'Guidance & Feedback',
                    desc: 'The quality of information the system provides to help users understand what is happening and how well they are performing. In gamification, feedback mechanics such as progress bars and scores are central — timely, specific, and meaningful feedback drives learning. Recommended instruments: SUS, UMUX, meCUE.',
                },
            ],
        },
    },
    {
        title: 'Hedonic UX',
        description: 'Enjoyment, novelty, and aesthetic appeal.',
        options: ['Novelty / Curiosity', 'Aesthetic & Attractiveness'],
        learnMore: {
            title: 'Hedonic UX',
            intro: 'Hedonic UX refers to the experiential and aesthetic qualities of a product that go beyond usability — novelty, stimulation, and visual appeal. These qualities are especially important in gamified systems, where engagement and enjoyment are core goals.',
            items: [
                {
                    name: 'Stimulation / Novelty',
                    desc: 'How exciting, curious, and engaging a product feels. Varied challenges, surprise rewards, and evolving mechanics prevent habituation and sustain long-term engagement. Recommended instruments: AttrakDiff, UEQ, GEQ.',
                },
                {
                    name: 'Aesthetic & Attractiveness',
                    desc: 'The visual and sensory appeal of a product. A visually polished system signals craftsmanship and care, increasing user confidence and enjoyment of the experience. Recommended instruments: AttrakDiff, VisAWI, UEQ.',
                },
            ],
        },
    },
    {
        title: 'Emotional Experience',
        description:
            'Affective states and psychological pressure during interaction.',
        options: ['Affective Experience', 'Tension / Pressure'],
        learnMore: {
            title: 'Emotional Experience',
            intro: 'Emotional experience captures the feelings, moods, and emotional responses users have during interaction. In gamification, managing the emotional journey is critical — well-designed systems trigger positive affect while avoiding frustration and anxiety.',
            items: [
                {
                    name: 'Affective Experience',
                    desc: 'The emotional states arising during interaction: joy, excitement, and pride on the positive side; frustration, anxiety, and boredom on the negative. Reward systems and feedback loops should be calibrated to optimize the emotional balance. Recommended instruments: SAM, PANAS, GEQ.',
                },
                {
                    name: 'Tension / Pressure',
                    desc: 'The psychological stress or urgency users feel. Moderate tension increases excitement and engagement, but excessive pressure leads to disengagement. Challenge mechanics and time limits must be carefully calibrated. Recommended instruments: GEQ, NASA-TLX, SAM.',
                },
            ],
        },
    },
    {
        title: 'Psychological Needs',
        description: 'Autonomy, competence, and relatedness.',
        options: [
            'Competence / Mastery',
            'Autonomy / Perceived Choice',
            'Social Connection / Relatedness',
        ],
        learnMore: {
            title: 'Psychological Needs',
            intro: 'Based on Self-Determination Theory (SDT), psychological needs — competence, autonomy, and relatedness — are fundamental drivers of intrinsic motivation. Gamification that satisfies these needs fosters deep, lasting engagement.',
            items: [
                {
                    name: 'Competence / Mastery',
                    desc: 'The feeling of being effective and skilled. Progressive difficulty, skill-based challenges, and clear performance feedback support competence. Badges, levels, and leaderboards reinforce mastery when designed thoughtfully. Recommended instruments: PENS, IMI, BNS.',
                },
                {
                    name: 'Autonomy / Perceived Choice',
                    desc: 'The sense of control and self-direction. Providing real choices — branching paths, customizable goals, flexible progressions — deepens personal investment and avoids the feeling of being coerced. Recommended instruments: PENS, IMI, BNS.',
                },
                {
                    name: 'Social Connection / Relatedness',
                    desc: 'The sense of belonging and community. Social mechanics like guilds, leaderboards, collaborative challenges, and social sharing amplify motivation and long-term engagement. Designing for positive social dynamics while avoiding toxic competition is key. Recommended instruments: PENS, Social Presence Scale, GEQ.',
                },
            ],
        },
    },
    {
        title: 'Motivational Dynamics',
        description:
            'Intrinsic vs. extrinsic motivation and behavioural impact.',
        options: ['Motivation Spectrum', 'Behavioral Impact'],
        learnMore: {
            title: 'Motivational Dynamics',
            intro: 'Motivational dynamics describe how gamification influences the type and quality of user motivation over time — from externally driven behavior to genuinely self-determined engagement.',
            items: [
                {
                    name: 'Motivation Spectrum',
                    desc: 'Ranges from purely external motivation (earning points for rewards) to fully internal motivation (playing because it is genuinely enjoyable and meaningful). Gameful design aims to move users toward more autonomous forms. Over-reliance on extrinsic rewards can undermine intrinsic motivation — known as the overjustification effect. Recommended instruments: IMI, SMS, BREQ.',
                },
                {
                    name: 'Behavioral Impact',
                    desc: 'Measures how gamification affects actual user actions and habits over time. Behavioral metrics capture whether the system genuinely changes behavior — completion rates, return visits, goal achievement — beyond self-reported attitudes. Recommended instruments: BREQ, IMI, Goal Attainment Scale.',
                },
            ],
        },
    },
    {
        title: 'Cognitive Engagement',
        description: 'Attention, immersion, progress, and flow.',
        options: [
            'Progress / Accomplishment',
            'Engagement',
            'Immersion / Flow / Focused Attention',
        ],
        learnMore: {
            title: 'Cognitive Engagement',
            intro: 'Cognitive engagement captures the depth of mental investment users bring to a system — including their sense of progress, focused attention, and flow states where time seems to disappear.',
            items: [
                {
                    name: 'Progress / Accomplishment',
                    desc: 'The sense of advancement as users move through a system. XP bars, levels, streaks, and achievement unlocks are among the most effective drivers of continued engagement — provided the progress feels earned and meaningful, not arbitrary. Recommended instruments: FSS-2, GEQ, EGameFlow.',
                },
                {
                    name: 'Engagement',
                    desc: "The depth and quality of involvement — going beyond mere usage to genuine absorption, interest, and investment. Multi-layered challenges, meaningful choices, and social dynamics combine to create systems that hold attention and build lasting habits. Recommended instruments: UES, GEQ, O'Brien & Toms Scale.",
                },
                {
                    name: 'Immersion / Flow / Focused Attention',
                    desc: 'Flow is a state of optimal experience in which a person is fully immersed, losing track of time and self-consciousness. It requires balance between challenge and skill. Adaptive difficulty, clear goals, and immediate feedback all contribute to flow-inducing experiences. Recommended instruments: FSS-2, EGameFlow, GEQ.',
                },
            ],
        },
    },
    {
        title: 'Eudaimonic Experience',
        description: 'Meaning, purpose, and transcendence.',
        options: [
            'Personal Meaning & Relevance',
            'Purpose & Values Alignment',
            'Self-Transcendence',
        ],
        learnMore: {
            title: 'Eudaimonic Experience',
            intro: "Eudaimonic UX goes beyond fun and engagement — it asks whether the experience is meaningful, fulfilling, and aligned with users' higher goals and values. Gamification with eudaimonic qualities creates lasting, transformative impact.",
            items: [
                {
                    name: 'Personal Meaning & Relevance',
                    desc: "How well an experience aligns with users' personal goals and values. When users see an activity as meaningful, they are far more likely to sustain engagement over time. Recommended instruments: miniPXI, MEEGA+, IMI.",
                },
                {
                    name: 'Purpose & Values Alignment',
                    desc: "The degree to which an experience supports users' broader life goals. When a gamified system aligns with what users care about — self-improvement, learning, helping others — it transitions from entertainment to genuine enrichment. Recommended instruments: miniPXI, SDT Scale, GEQ.",
                },
                {
                    name: 'Self-Transcendence',
                    desc: 'Experiences that extend beyond personal gain — contributing to something larger, connecting with others, or achieving a sense of legacy. Cooperative challenges and prosocial mechanics can trigger these transcendent experiences. Recommended instruments: PERMA Scale, miniPXI, Character Strengths Survey.',
                },
            ],
        },
    },
];

export const STAGES = [
    'Concept / idea',
    'Low-fidelity prototype',
    'High-fidelity prototype',
    'Deployed system',
];

export const DEVELOPMENT_STAGE_INFO = {
    title: 'Development Stage',
    intro: 'The development stage defines how mature your gamified system is. It directly shapes which evaluation methods are meaningful and feasible — different stages call for different approaches.',
    items: [
        {
            name: 'Concept / Idea',
            desc: 'Early exploration phase. Expert reviews, personas, and interviews are ideal for validating assumptions before any resource is committed to building.',
        },
        {
            name: 'Low-fidelity prototype',
            desc: 'Paper sketches or simple wireframes. Think-aloud sessions and focus groups can surface usability issues at very low cost.',
        },
        {
            name: 'High-fidelity prototype',
            desc: 'Interactive, near-final interfaces. Structured usability tests and validated questionnaires become applicable for the first time.',
        },
        {
            name: 'Deployed system',
            desc: 'Live product with real users. Longitudinal methods like diary studies, surveys, and behavioral analytics capture actual usage patterns and satisfaction over time.',
        },
    ],
};

export const ACCESSIBILITY_OPTIONS = ['Easy', 'Moderate', 'Difficult'];
export const PARTICIPANT_OPTIONS = ['< 10', '10-30', '30-100', '100+'];
export const TIME_OPTIONS = ['1 week', '1-2 weeks', '1 month', '3+ months'];
export const EXTRA_CONSTRAINTS = [
    'Technical limitation',
    'Sensitive population',
];

export const CONSTRAINTS_INFO = {
    title: 'Evaluation Constraints',
    intro: 'Constraints are practical limitations that shape which evaluation methods are feasible for your study. Identifying them early prevents selecting methods that cannot be realistically executed.',
    items: [
        {
            name: 'Participant access',
            desc: 'The ease of reaching your target users determines whether lab studies, remote sessions, or self-administered instruments are realistic. Difficult-to-access populations (e.g., clinical users, children, domain experts) require adapted recruitment strategies.',
        },
        {
            name: 'Sample size',
            desc: 'The number of participants directly affects statistical reliability. Fewer than 10 participants suits qualitative methods like interviews or think-aloud; 30 or more enables quantitative analyses with validated questionnaires.',
        },
        {
            name: 'Time',
            desc: 'Study duration constrains the depth of data you can collect. Short windows (1 week) suit quick usability tests; longitudinal designs (3+ months) are needed to capture behavioral change or learning effects over time.',
        },
        {
            name: 'Technical and ethical constraints',
            desc: 'Sensitive populations (e.g., minors, patients) require additional ethical approval and limit data collection approaches. Technical limitations may restrict logging, screen recording, or the use of specific instruments.',
        },
    ],
};
