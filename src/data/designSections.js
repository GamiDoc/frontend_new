/* ═══════════════════════════════════════════════════════════════════════════
   Schema delle sezioni del Design System
   ═══════════════════════════════════════════════════════════════════════════
   Unica fonte per le 7 sezioni: titoli, gruppi (le card), campi, opzioni e quali campi
   contano per il completamento. Pagine e componenti si costruiscono da qui: per
   aggiungere/togliere una domanda o un'opzione basta modificare questo file.

   Struttura
     sezione  { number, id, title, navLabel, summary, groups[], fields[], loops? }
     gruppo   { id, title, question?, description?, tab?, phase? }   → una card nella pagina
     campo    { key, label, group, type, display, options?, required, placeholder?, provisional? }
       type     'single' | 'multi' | 'text'
       display  'chips' | 'cards' | 'radio' | 'segmented' | 'select' | 'slider'
       required se true conta per la percentuale e per lo stato "Complete"
     opzione  stringa, oppure { value, description }

   Contratto con il backend (PUT .../design/section/{n})
   - `content` è JSON libero; il backend lo stampa nel PDF come "chiave: valore" nell'ordine
     di inserimento. Per questo le `key` sono etichette leggibili e il valore di
     un'opzione è il testo mostrato all'utente.
   - single → stringa, multi → array di stringhe, text → stringa. I campi vuoti non si inviano.
   - Le chiavi sconosciute allo schema (es. una bozza precompilata dall'AI) vengono conservate.
   - Attenzione: cambiare una `key` rende illeggibili i dati già salvati con la vecchia chiave.

   I campi con `provisional: true` non hanno ancora un mockup (sezioni 5–7 e alcune liste
   di opzioni che i mockup lasciano vuote) e vanno confermati. */

const PERCENT = [
    '0%',
    '10%',
    '20%',
    '30%',
    '40%',
    '50%',
    '60%',
    '70%',
    '80%',
    '90%',
    '100%',
];
const INTENSITY = ['Min', 'Low', 'Med', 'High'];

export const SPARK_STEP = {
    title: 'The Spark',
    navLabel: 'Ideation',
    description:
        'Describe your raw idea freely. AI will use this to pre-fill the following steps — you can always review and adjust.',
};

export const DESIGN_SECTIONS = [
    {
        number: 1,
        id: 'context',
        title: 'The Context',
        navLabel: 'Context',
        summary: 'Domain, user profile, objectives',
        groups: [
            {
                id: 'domain',
                title: 'Domain',
                question: 'What sector is your application in?',
                description:
                    'Choose the primary domain. This shapes the tone, mechanics, and expectations of your users.',
            },
            {
                id: 'users',
                title: 'User profile',
                question: 'Who are your users?',
                description:
                    'Demographics and psychographics — who they are, what motivates them, and their prior experience with games.',
            },
            {
                id: 'objectives',
                title: 'Objectives',
                question: 'What should the gamified system achieve?',
                provisional: true,
            },
        ],
        fields: [
            {
                key: 'Domain',
                label: 'Domain',
                group: 'domain',
                type: 'single',
                display: 'chips',
                required: true,
                options: [
                    'Education',
                    'Health & fitness',
                    'Corporate training',
                    'Entertainment',
                    'Sustainability',
                    'Finance',
                    'Social impact',
                    'Other',
                ],
            },
            {
                key: 'Age range',
                label: 'Age range',
                group: 'users',
                type: 'single',
                display: 'select',
                required: true,
                provisional: true,
                options: [
                    'Under 13',
                    '13–17',
                    '18–24',
                    '25–34',
                    '35–49',
                    '50–64',
                    '65+',
                    'Mixed ages',
                ],
            },
            {
                key: 'Game experience',
                label: 'Game experience',
                group: 'users',
                type: 'single',
                display: 'select',
                required: true,
                provisional: true,
                options: ['None', 'Casual', 'Regular', 'Experienced gamer'],
            },
            {
                key: 'Primary motivations',
                label: 'Primary motivations',
                group: 'users',
                type: 'multi',
                display: 'chips',
                required: true,
                options: [
                    'Achievement',
                    'Social connection',
                    'Exploration',
                    'Self-improvement',
                    'Competition',
                    'Creativity',
                    'Escapism',
                ],
            },
            {
                key: 'Objectives',
                label: 'Objectives',
                group: 'objectives',
                type: 'text',
                required: false,
                provisional: true,
                placeholder:
                    'e.g. Increase weekly active learners and course completion…',
            },
        ],
    },
    {
        number: 2,
        id: 'timeline',
        title: 'The Experience Timeline',
        navLabel: 'Experience',
        summary: 'Onboarding, engagement, mastery',
        groups: [
            {
                id: 'onboarding',
                title: 'Onboarding — discovery',
                tab: 'Onboarding',
                phase: 1,
                description:
                    "The user's first experience. They need to feel capable immediately and understand the core loop within minutes.",
            },
            {
                id: 'engagement',
                title: 'Engagement — habit formation',
                tab: 'Engagement',
                phase: 2,
                description:
                    "Turn early curiosity into a routine. The game needs to earn a regular slot in the user's life.",
            },
            {
                id: 'mastering',
                title: 'Mastering — proficiency',
                tab: 'Mastering',
                phase: 3,
                description:
                    'The user wants to feel genuinely skilled. Challenge must scale with ability — too easy is boring, too hard is frustrating.',
            },
            {
                id: 'fidelity',
                title: 'Fidelity — long-term retention',
                tab: 'Fidelity',
                phase: 4,
                description:
                    'Novelty has faded. Identity and community are what keep users invested. The game must mean something to them.',
            },
        ],
        fields: [
            {
                key: 'Onboarding · Target completion',
                label: 'Target completion',
                group: 'onboarding',
                type: 'single',
                display: 'slider',
                required: true,
                options: PERCENT,
            },
            {
                key: 'Onboarding · Time to first win',
                label: 'Time to first win',
                group: 'onboarding',
                type: 'single',
                display: 'slider',
                required: true,
                provisional: true,
                options: [
                    '< 30 sec',
                    '30 sec–1 min',
                    '1–2 min',
                    '2–5 min',
                    '5+ min',
                ],
            },
            {
                key: 'Onboarding · Key mechanics',
                label: 'Key mechanics for this phase',
                group: 'onboarding',
                type: 'multi',
                display: 'chips',
                required: true,
                options: [
                    'Tutorial overlay',
                    'Guided first task',
                    'Progress indicator',
                    'Welcome reward',
                ],
            },
            {
                key: 'Onboarding · Main drop-off risk',
                label: 'Main drop-off risk',
                group: 'onboarding',
                type: 'text',
                required: false,
                placeholder:
                    "e.g. Users abandon if they don't understand the value within 2 minutes…",
            },

            {
                key: 'Engagement · Target session frequency',
                label: 'Target session freq.',
                group: 'engagement',
                type: 'single',
                display: 'slider',
                required: true,
                provisional: true,
                options: [
                    'Occasionally',
                    'Weekly',
                    'A few times a week',
                    'Daily',
                    'Several times a day',
                ],
            },
            {
                key: 'Engagement · Average session length',
                label: 'Avg. session length',
                group: 'engagement',
                type: 'single',
                display: 'slider',
                required: true,
                provisional: true,
                options: [
                    '< 2 min',
                    '2–5 min',
                    '5–15 min',
                    '15–30 min',
                    '30+ min',
                ],
            },
            {
                key: 'Engagement · Key mechanics',
                label: 'Key mechanics for this phase',
                group: 'engagement',
                type: 'multi',
                display: 'chips',
                required: true,
                options: [
                    'Streak / daily challenge',
                    'Notifications',
                    'Leaderboard',
                    'Unlockables',
                ],
            },
            {
                key: 'Engagement · Main drop-off risk',
                label: 'Main drop-off risk',
                group: 'engagement',
                type: 'text',
                required: false,
                placeholder:
                    'e.g. Users churn if rewards feel predictable or sessions feel like a chore…',
            },

            {
                key: 'Mastering · Difficulty scaling',
                label: 'Difficulty scaling approach',
                group: 'mastering',
                type: 'single',
                display: 'chips',
                required: true,
                options: [
                    'Adaptive (AI-driven)',
                    'Manual levels',
                    'Player-chosen',
                    'Peer-matched',
                ],
            },
            {
                key: 'Mastering · Mastery signals',
                label: 'Mastery signals',
                group: 'mastering',
                type: 'multi',
                display: 'chips',
                required: true,
                options: [
                    'Rank / level badge',
                    'Skill tree unlock',
                    'Performance stats',
                ],
            },
            {
                key: 'Mastering · Notes',
                label: 'Notes on mastery design',
                group: 'mastering',
                type: 'text',
                required: false,
                placeholder:
                    'e.g. Provide clear skill trees so users always know what to work toward…',
            },

            {
                key: 'Fidelity · Retention anchors',
                label: 'Retention anchors',
                group: 'fidelity',
                type: 'multi',
                display: 'chips',
                required: true,
                options: [
                    'Community / guilds',
                    'Seasonal content',
                    'User-generated content',
                    'Mentorship roles',
                ],
            },
            {
                key: 'Fidelity · Target retention (D30)',
                label: 'Target retention (D30)',
                group: 'fidelity',
                type: 'single',
                display: 'slider',
                required: true,
                options: PERCENT,
            },
            {
                key: 'Fidelity · Long-term meaning',
                label: 'What gives this game long-term meaning?',
                group: 'fidelity',
                type: 'text',
                required: false,
                placeholder:
                    'e.g. Players become part of a ranked community and contribute to a shared story…',
            },
        ],
    },
    {
        number: 3,
        id: 'personification',
        title: 'Personification and Dynamics',
        navLabel: 'Personification',
        summary: 'Adaptivity, personalization',
        groups: [
            {
                id: 'adaptivity',
                title: 'Adaptivity level',
                question: 'How does the system respond to user behavior?',
                description:
                    "Choose the level that matches your team's capacity to build and maintain it — higher adaptivity means more data and more risk.",
            },
            {
                id: 'personalization',
                title: 'Personalization',
                question: 'What can be customized to the individual?',
                description:
                    'Select everything the system can tailor. More dimensions = more powerful, but also more data and complexity to manage.',
            },
            {
                id: 'timeline',
                title: 'Importance of timeline',
                question:
                    'How strictly does the system enforce phase progression?',
                description:
                    'Some users will naturally skip phases. Decide whether your design allows that — or whether the arc is a core part of the experience.',
            },
        ],
        fields: [
            {
                key: 'Adaptivity level',
                label: 'Adaptivity level',
                group: 'adaptivity',
                type: 'single',
                display: 'radio',
                required: true,
                options: [
                    {
                        value: 'Fixed — same for everyone',
                        description:
                            'No adaptation. Every user follows the exact same path and sees the same content.',
                    },
                    {
                        value: 'Rule-based — if/then logic',
                        description:
                            'Predefined rules trigger changes. E.g. "If user fails 3 times, lower difficulty."',
                    },
                    {
                        value: 'Profile-driven — segments and types',
                        description:
                            'Users are grouped by behavior or preference. Each group gets a tailored experience.',
                    },
                    {
                        value: 'AI-driven — fully dynamic',
                        description:
                            'A model continuously adjusts content, pacing, and challenge per individual in real time.',
                    },
                ],
            },
            {
                key: 'Adaptation signals',
                label: 'What signals will the system use to adapt?',
                group: 'adaptivity',
                type: 'multi',
                display: 'chips',
                required: false,
                options: [
                    'Session frequency',
                    'Task completion rate',
                    'Error patterns',
                    'Time on task',
                    'Explicit preferences',
                    'Social behavior',
                    'Device / context',
                ],
            },
            {
                key: 'Personalized content and experience',
                label: 'Content and experience',
                group: 'personalization',
                type: 'multi',
                display: 'chips',
                required: true,
                options: [
                    'Difficulty curve',
                    'Content topics',
                    'Narrative path',
                    'Challenge type',
                ],
            },
            {
                key: 'Personalized interface and identity',
                label: 'Interface and identity',
                group: 'personalization',
                type: 'multi',
                display: 'chips',
                required: false,
                options: [
                    'Avatar / character',
                    'Language and tone',
                    'Visual theme',
                    'Notification timing',
                ],
            },
            {
                key: 'Data privacy approach',
                label: 'Data privacy approach',
                group: 'personalization',
                type: 'single',
                display: 'chips',
                required: true,
                options: [
                    'Minimal — anonymised only',
                    'Standard — behavioural data',
                    'Rich — full profile + consent',
                ],
            },
            {
                key: 'Timeline enforcement',
                label: 'Timeline enforcement',
                group: 'timeline',
                type: 'single',
                display: 'segmented',
                required: true,
                options: [
                    {
                        value: 'Freeform',
                        description:
                            'Phases are a loose guide; users move however they like.',
                        provisional: true,
                    },
                    {
                        value: 'Guided',
                        description:
                            'Users are nudged towards the next phase but nothing is blocked.',
                        provisional: true,
                    },
                    {
                        value: 'Structured',
                        description:
                            'Users are gently guided through phases but can skip or revisit freely. Progression is suggested, not enforced.',
                    },
                    {
                        value: 'Strict',
                        description:
                            'Phases unlock in order; users cannot skip ahead.',
                        provisional: true,
                    },
                ],
            },
            {
                key: 'Timeline enforcement notes',
                label: 'Notes on timeline enforcement',
                group: 'timeline',
                type: 'text',
                required: false,
                placeholder:
                    'e.g. We want casual users to feel no friction, but power users should unlock…',
            },
        ],
    },
    {
        number: 4,
        id: 'gameful-core',
        title: 'Gameful Core',
        navLabel: 'Gameful core',
        summary: 'Mechanics, dynamics, game loop',
        groups: [
            {
                id: 'mechanics',
                title: 'Mechanics — rules and actions',
                question: 'What can users do in your game?',
                description:
                    'Select the core mechanics. Each produces dynamics — intended and unintended. Choose deliberately.',
            },
            {
                id: 'modality',
                title: 'Modality',
                question: 'How do users play — alone or together?',
                description:
                    "Modality determines which social mechanics above are feasible and which feedback loops you'll need to design.",
            },
            {
                id: 'dynamics',
                title: 'Dynamics — runtime behaviors',
                question: 'What behaviors will your mechanics produce?',
                description:
                    'Rate the expected intensity of each dynamic. High = primary driver. Low = side effect.',
            },
            {
                id: 'loops',
                title: 'Game loop — feedback loops',
                question: 'How does the system respond to users?',
                description:
                    'Design at least one short loop and one long loop. Expand each to configure triggers and responses.',
            },
        ],
        fields: [
            {
                key: 'Mechanics',
                label: 'Mechanics',
                group: 'mechanics',
                type: 'multi',
                display: 'cards',
                required: true,
                options: [
                    {
                        value: 'Points',
                        description:
                            'Numeric score for actions. Flexible, universal.',
                    },
                    {
                        value: 'Badges',
                        description: 'Symbolic rewards for milestones.',
                    },
                    {
                        value: 'Leaderboards',
                        description:
                            'Public ranking. Motivates top performers.',
                    },
                    {
                        value: 'Quests / missions',
                        description:
                            'Structured goals with clear start and end.',
                    },
                    {
                        value: 'Challenges',
                        description: 'Time-limited events with rewards.',
                    },
                    {
                        value: 'Collaboration',
                        description: 'Shared goals requiring multiple users.',
                    },
                    {
                        value: 'Levels',
                        description:
                            'Tiered progression gating content or status.',
                    },
                    {
                        value: 'Unlockables',
                        description:
                            'Content revealed through play or achievement.',
                    },
                    {
                        value: 'Gifting / trading',
                        description: 'Social exchange of items or rewards.',
                    },
                    {
                        value: 'Narrative choices',
                        description:
                            'Branching decisions that shape the outcome.',
                    },
                ],
            },
            {
                key: 'Custom mechanics',
                label: 'Custom mechanics',
                group: 'mechanics',
                type: 'text',
                required: false,
                placeholder:
                    'e.g. Users earn "impact tokens" for real life actions…',
            },
            {
                key: 'Modality',
                label: 'Modality',
                group: 'modality',
                type: 'single',
                display: 'cards',
                required: true,
                options: [
                    {
                        value: 'Single player',
                        description:
                            'Solo experience. Simpler infrastructure, personal focus.',
                    },
                    {
                        value: 'Asynchronous social',
                        description:
                            'Users interact via scores, gifts, or challenges — not live.',
                    },
                    {
                        value: 'Cooperative (live)',
                        description:
                            'Real-time collaboration toward shared goals.',
                    },
                    {
                        value: 'Competitive (live)',
                        description:
                            'Real-time competition. Requires matchmaking.',
                    },
                ],
            },
            {
                key: 'Dynamics · Competition',
                label: 'Competition',
                group: 'dynamics',
                type: 'single',
                display: 'slider',
                required: true,
                options: INTENSITY,
            },
            {
                key: 'Dynamics · Cooperation',
                label: 'Cooperation',
                group: 'dynamics',
                type: 'single',
                display: 'slider',
                required: true,
                options: INTENSITY,
            },
            {
                key: 'Dynamics · Curiosity',
                label: 'Curiosity',
                group: 'dynamics',
                type: 'single',
                display: 'slider',
                required: true,
                options: INTENSITY,
            },
            {
                key: 'Dynamics · Achievement',
                label: 'Achievement',
                group: 'dynamics',
                type: 'single',
                display: 'slider',
                required: true,
                options: INTENSITY,
            },
            {
                key: 'Dynamics · Social status',
                label: 'Social status',
                group: 'dynamics',
                type: 'single',
                display: 'slider',
                required: true,
                options: INTENSITY,
            },
            {
                key: 'Dynamics · Anxiety / pressure',
                label: 'Anxiety / pressure',
                group: 'dynamics',
                type: 'single',
                display: 'slider',
                required: true,
                options: INTENSITY,
            },
            {
                key: 'Unintended dynamics',
                label: 'Unintended dynamics to watch for',
                group: 'dynamics',
                type: 'text',
                required: false,
                placeholder: 'e.g. Leaderboards may discourage mid-tier users…',
            },
            // Game loop: il mockup mostra righe apribili senza contenuto; "Trigger"/"Response" è un'ipotesi.
            {
                key: 'Short loop (immediate feedback) · Trigger',
                label: 'Trigger',
                group: 'loops',
                loop: 'short',
                type: 'text',
                required: true,
                provisional: true,
            },
            {
                key: 'Short loop (immediate feedback) · Response',
                label: 'Response',
                group: 'loops',
                loop: 'short',
                type: 'text',
                required: true,
                provisional: true,
            },
            {
                key: 'Long loop (sustained progression) · Trigger',
                label: 'Trigger',
                group: 'loops',
                loop: 'long',
                type: 'text',
                required: true,
                provisional: true,
            },
            {
                key: 'Long loop (sustained progression) · Response',
                label: 'Response',
                group: 'loops',
                loop: 'long',
                type: 'text',
                required: true,
                provisional: true,
            },
            {
                key: 'Social loop (peer-driven engagement) · Trigger',
                label: 'Trigger',
                group: 'loops',
                loop: 'social',
                type: 'text',
                required: false,
                provisional: true,
            },
            {
                key: 'Social loop (peer-driven engagement) · Response',
                label: 'Response',
                group: 'loops',
                loop: 'social',
                type: 'text',
                required: false,
                provisional: true,
            },
        ],
        loops: [
            { id: 'short', badge: 'Short loop', title: 'Immediate feedback' },
            { id: 'long', badge: 'Long loop', title: 'Sustained progression' },
            {
                id: 'social',
                badge: 'Social loop',
                title: 'Peer-driven engagement',
            },
        ],
    },
    // Sezioni 5–7: nessun mockup, i campi seguono le descrizioni delle card della dashboard.
    {
        number: 5,
        id: 'technology',
        title: 'Technology',
        navLabel: 'Technology',
        summary: 'Resources, visual, UX/UI',
        provisional: true,
        groups: [
            {
                id: 'resources',
                title: 'Resources',
                question:
                    'What platforms, devices and team resources are available?',
            },
            {
                id: 'visual',
                title: 'Visual',
                question: 'What is the visual and aesthetic direction?',
            },
            {
                id: 'uxui',
                title: 'UX/UI',
                question: 'Which interface patterns will carry the experience?',
            },
        ],
        fields: [
            {
                key: 'Resources',
                label: 'Resources',
                group: 'resources',
                type: 'text',
                required: true,
                provisional: true,
            },
            {
                key: 'Visual',
                label: 'Visual',
                group: 'visual',
                type: 'text',
                required: true,
                provisional: true,
            },
            {
                key: 'UX/UI',
                label: 'UX/UI',
                group: 'uxui',
                type: 'text',
                required: true,
                provisional: true,
            },
        ],
    },
    {
        number: 6,
        id: 'impacts',
        title: 'Impacts & Benefits',
        navLabel: 'Impacts',
        summary: 'Performance, social, ecological',
        provisional: true,
        groups: [
            {
                id: 'performance',
                title: 'Performance',
                question:
                    'What behavioural, learning or business outcomes do you expect?',
            },
            {
                id: 'social',
                title: 'Social',
                question:
                    'What effect should the system have on people and communities?',
            },
            {
                id: 'ecological',
                title: 'Ecological',
                question:
                    'Does the system have an environmental impact or benefit?',
            },
        ],
        fields: [
            {
                key: 'Performance impact',
                label: 'Performance',
                group: 'performance',
                type: 'text',
                required: true,
                provisional: true,
            },
            {
                key: 'Social impact',
                label: 'Social',
                group: 'social',
                type: 'text',
                required: true,
                provisional: true,
            },
            {
                key: 'Ecological impact',
                label: 'Ecological',
                group: 'ecological',
                type: 'text',
                required: false,
                provisional: true,
            },
        ],
    },
    {
        number: 7,
        id: 'evaluation',
        title: 'Evaluation & Feedback',
        navLabel: 'Evaluation',
        summary: 'Impact assessment, adjustment',
        provisional: true,
        groups: [
            {
                id: 'assessment',
                title: 'Impact assessment',
                question: "How will you measure the system's effect?",
            },
            {
                id: 'adjustment',
                title: 'Adjustment',
                question: 'How will results feed back into the design?',
            },
        ],
        fields: [
            {
                key: 'Impact assessment',
                label: 'Impact assessment',
                group: 'assessment',
                type: 'text',
                required: true,
                provisional: true,
            },
            {
                key: 'Adjustment',
                label: 'Adjustment',
                group: 'adjustment',
                type: 'text',
                required: true,
                provisional: true,
            },
        ],
    },
];

/* Ordine del primo passaggio per ciascun percorso (uguale al backend, internal/design/domain.go). */
export const PATHS = {
    A: [1, 2, 3, 4, 5, 6, 7],
    B: [1, 4, 5, 2, 3, 6, 7],
};

/* Testi della scelta "Where to next?" dopo Context. */
export const PATH_INFO = {
    A: {
        title: 'Experience Timeline & Personification',
        blurb: 'Start with the user journey.',
        tags: ['Onboarding', 'Engagement', 'Mastery', 'Adaptivity'],
    },
    B: {
        title: 'Gameful Core & Technology',
        blurb: 'Define the mechanics early.',
        tags: [
            'Mechanics',
            'Modality',
            'Game Loop',
            'Aesthetic',
            'Dynamics',
            'Technology',
        ],
    },
};

/* Step totali di "STEP n OF 8": la Spark + 7 sezioni. */
export const TOTAL_STEPS = DESIGN_SECTIONS.length + 1;

/* Sezione dato il numero (1–7), o null. */
export function getSection(number) {
    return DESIGN_SECTIONS.find((s) => s.number === number) || null;
}

/* Le opzioni possono essere stringhe o { value, description }: le porta tutte alla seconda forma. */
export function normalizeOptions(options = []) {
    return options.map((o) => (typeof o === 'string' ? { value: o } : o));
}

/* true se il campo ha un valore (array non vuoto, stringa non vuota). */
export function isFilled(field, value) {
    if (field.type === 'multi') return Array.isArray(value) && value.length > 0;
    return typeof value === 'string' && value.trim() !== '';
}

/* `content` del backend → valori del form (ogni campo dello schema presente, chiavi extra mantenute). */
export function contentToValues(section, content) {
    const source =
        content && typeof content === 'object' && !Array.isArray(content)
            ? content
            : {};
    const values = { ...source };
    for (const field of section.fields) {
        const raw = source[field.key];
        if (field.type === 'multi')
            values[field.key] = Array.isArray(raw) ? raw : [];
        else values[field.key] = typeof raw === 'string' ? raw : '';
    }
    return values;
}

/* Valori del form → `content` per il backend: prima i campi dello schema nel loro ordine
   (quelli vuoti vengono omessi), poi le chiavi sconosciute, così non si perde nulla. */
export function valuesToContent(section, values) {
    const content = {};
    const known = new Set(section.fields.map((f) => f.key));
    for (const field of section.fields) {
        const value = values[field.key];
        if (isFilled(field, value))
            content[field.key] =
                field.type === 'multi' ? [...value] : value.trim();
    }
    for (const [key, value] of Object.entries(values)) {
        if (!known.has(key) && value !== undefined && value !== '')
            content[key] = value;
    }
    return content;
}

/* Completamento calcolato sui campi obbligatori (se una sezione non ne ha, su tutti i campi). */
export function sectionProgress(section, values) {
    const required = section.fields.filter((f) => f.required);
    const counted = required.length > 0 ? required : section.fields;
    const filled = counted.filter((f) => isFilled(f, values[f.key])).length;
    const percent =
        counted.length === 0 ? 0 : Math.round((filled / counted.length) * 100);
    return {
        filled,
        total: counted.length,
        percent,
        complete: filled === counted.length,
    };
}

/* true se almeno un campo della sezione ha un valore. */
export function hasAnyValue(section, values) {
    return section.fields.some((f) => isFilled(f, values[f.key]));
}
