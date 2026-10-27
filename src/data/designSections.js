/* ═══════════════════════════════════════════════════════════════════════════
   Design System — section schema (Flow 2.0)
   ═══════════════════════════════════════════════════════════════════════════
   Single source for the 6 sections: titles, groups (the cards), fields, options and
   which fields count towards completion. Pages and components are built from this
   file: to add/remove a question or an option, edit it here.
   Mockups: Figma "GamiDoc Framework 2.0", page Flow 2.0.

   Structure
     section  { number, id, title, navLabel, navName, description, summary, groups[], fields[] }
                navLabel → stepper / overview label · navName → "Back to the …" / "Go to the …"
     group    { id, title, description?, collapsible?, provisional? }   → one card in the page
     field    { key, label?, group, type, display?, options?, required, … }
       type     'single' | 'multi' | 'text' | 'list'
       display  options: 'chips' | 'cards' | 'checklist' | 'checks' | 'select' | 'slider'
                text:    'textarea' (default) | 'input' | 'loop'
       title / hint   sub-heading shown above the field (e.g. "Metrics / signals")
       other          adds an "Other" option; its free text is saved under `<key> · Other`
       columns        checklist laid out on N columns
       half           input or select shown at half width (two side by side)
       showIf         { key, includes } → field shown only if that multi field contains the value
       badge / description   ('loop' display) label and explanation of a game loop
       itemLabel / itemFields   ('list') repeatable block, e.g. feedback components
       required       counts for the section percentage and the "Complete" state
       provisional    not (fully) defined by the mockups yet: to be confirmed
     option   string, or { value, description?, info? }   info = tooltip text (ⓘ)

   Backend contract (PUT …/design/section/{n})
   - `content` is free JSON; the backend prints it in the PDF as "key: value" in insertion
     order. That is why `key`s are readable labels and an option's value is its visible text.
   - single → string, multi → array of strings, text → string. Empty fields are not sent.
   - list → flattened as "<key> <n> · <item field key>" (e.g. "Feedback component 1 · Timing"),
     so the PDF stays readable.
   - Keys unknown to the schema (e.g. an AI-prefilled draft) are kept.
   - Careful: renaming a `key` makes data saved with the old key unreadable. */

const INTENSITY = ['Min', 'Low', 'Medium', 'High', 'Max'];

export const SPARK_STEP = {
    title: 'The Spark',
    navLabel: 'Ideation',
    navName: 'Spark',
    description:
        'Describe your raw idea freely. AI will use this to pre-fill the following steps — you can always review and adjust.',
};

export const OVERVIEW_STEP = { navName: 'Overview' };

/* Game element taxonomy used by "Gamification & Mechanics" (Toda et al.). */
const GAME_ELEMENTS = {
    Performance: ['Acknowledgement', 'Level', 'Progression', 'Points', 'Stats'],
    Social: ['Competition', 'Cooperation', 'Reputation', 'Social pressure'],
    Personal: ['Novelty', 'Objectives', 'Puzzles', 'Renovation', 'Sensation'],
    Fictional: ['Narrative', 'Storytelling'],
    Ecological: [
        'Chance',
        'Imposed choice',
        'Economy',
        'Rarity',
        'Time pressure',
    ],
};

export const DESIGN_SECTIONS = [
    /* ── 1 · Context ─────────────────────────────────────────────────────── */
    {
        number: 1,
        id: 'context',
        title: 'The context',
        navLabel: 'Context',
        navName: 'Context',
        summary: 'Domain, User profile, Constraints',
        description:
            'Set the foundation for your project: your domain, your users, your goals, and the constraints that shape them. Everything that follows builds on what you define here.',
        groups: [
            {
                id: 'domain',
                title: 'Domain',
                description:
                    'Select one or more domains that describe your project. This sets the tone and mechanics for everything that follows.',
            },
            {
                id: 'users',
                title: 'User Profile',
                description:
                    'Describe your user — who they are, what motivates them, and their prior experience with games.',
            },
            {
                id: 'constraints',
                title: 'Constraints',
                description:
                    'Select the constraints your users or project may face, then add details on any you select.',
            },
        ],
        fields: [
            {
                key: 'Domain',
                group: 'domain',
                type: 'multi',
                display: 'chips',
                other: true,
                required: true,
                options: [
                    'Education',
                    'Health',
                    'Professional training',
                    'Entertainment',
                    'Sustainability',
                    'Software',
                    'Crowdsourcing',
                ],
            },
            {
                key: 'Aim of the software',
                label: 'Describe shortly the aim of your software:',
                group: 'domain',
                type: 'text',
                required: true,
            },
            {
                key: 'Age range',
                label: 'Age range',
                group: 'users',
                type: 'single',
                display: 'select',
                half: true,
                required: true,
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
                label: 'Gaming experience',
                group: 'users',
                type: 'single',
                display: 'select',
                half: true,
                required: true,
                options: ['None', 'Casual', 'Regular', 'Experienced gamer'],
            },
            {
                key: 'Occupation',
                label: 'Occupation',
                group: 'users',
                type: 'text',
                required: true,
            },
            {
                key: 'Encouraged behavior',
                label: 'Encouraged behavior',
                group: 'users',
                type: 'text',
                required: true,
            },
            {
                key: 'User profile · Additional information',
                label: '*Additional information',
                group: 'users',
                type: 'text',
                required: false,
            },
            {
                key: 'Constraints',
                group: 'constraints',
                type: 'multi',
                display: 'checklist',
                columns: 2,
                required: false,
                options: [
                    'Lack of autonomy',
                    'Lack of competence',
                    'Lack of relatedness',
                    'Lack of immersion',
                    'Linguistic / Cultural differences',
                    'Technical difficulties',
                    'People with special needs',
                    'Ethical responsibility regarding to data',
                ],
            },
            {
                key: 'Constraints · Additional information',
                label: '*Additional information',
                group: 'constraints',
                type: 'text',
                required: false,
            },
        ],
    },

    /* ── 2 · Experience Timeline ─────────────────────────────────────────── */
    {
        number: 2,
        id: 'timeline',
        title: 'The Experience Timeline',
        navLabel: 'Experience timeline',
        navName: 'Experience Timeline',
        summary: 'Onboarding, Updates, Retention anchors',
        description:
            "Map out how your users' experience evolves over time — from their first interaction to what keeps them coming back. This helps identify where engagement might drop and what should sustain it.",
        groups: [
            {
                id: 'onboarding',
                title: 'Onboarding',
                description:
                    "Describe how new users are introduced to your system for the first time — what they need to learn, and how you'll teach it to them.",
            },
            {
                id: 're-onboarding',
                title: 'Re-onboarding',
                collapsible: true,
                provisional: true,
            },
            {
                id: 'updates',
                title: 'Updates',
                description:
                    "Define how your system evolves after launch — how frequently you'll release something new, and what that will actually be.",
            },
            {
                id: 'retention',
                title: 'Retention anchors',
                description:
                    'Select the mechanisms that keep users emotionally or practically tied to your system, and describe how each one shows up in your design.',
            },
            {
                id: 'dropout',
                title: 'Drop-out and desistance risks',
                description:
                    'Check any risks that are relevant to your design, so the system can flag where your mechanics may need safeguards.',
            },
            {
                id: 'goals',
                title: 'Taxonomy of gamification goals',
                description: 'Check the goal types your system uses.',
            },
            {
                id: 'emotions',
                title: 'Emotional dynamics',
                description:
                    'Rate the expected intensity of each dynamic. High = primary driver. Low = side effect.',
            },
        ],
        fields: [
            {
                key: 'Onboarding methods',
                group: 'onboarding',
                type: 'multi',
                display: 'chips',
                other: true,
                required: true,
                options: [
                    'Video',
                    'Chat Bot',
                    'Interactive tutorials',
                    'In-app tooltips',
                    'Text-based instructions',
                    'Learn-by-doing',
                ],
            },
            {
                key: 'Onboarding steps and goals',
                label: 'Outline the main steps and goals of your onboarding:',
                group: 'onboarding',
                type: 'text',
                required: true,
                placeholder:
                    'e.g., First 30 seconds: safe tutorial room to practice movement. Tooltips pop up only on first interaction…',
            },
            // The mockup shows "Re-onboarding" collapsed: its content is not defined yet.
            {
                key: 'Re-onboarding',
                label: 'How are returning users re-introduced to the system?',
                group: 're-onboarding',
                type: 'text',
                required: false,
                provisional: true,
            },
            {
                key: 'Update frequency',
                group: 'updates',
                type: 'single',
                display: 'chips',
                required: true,
                options: [
                    'Never',
                    'Daily',
                    'Weekly',
                    'Monthly',
                    'Seasonal (6–12 weeks)',
                    'Expansion (6+ months)',
                    "I don't know yet",
                ],
            },
            {
                key: 'Content type',
                title: 'Content type',
                hint: "Define how your system evolves after launch — how frequently you'll release something new, and what that will actually be.",
                group: 'updates',
                type: 'multi',
                display: 'chips',
                other: true,
                required: true,
                options: [
                    'Narrative/story beats',
                    'New modes & mechanics',
                    'Content drops',
                    'Live events',
                ],
            },
            {
                key: 'Updates · Additional information',
                label: '*Additional information',
                group: 'updates',
                type: 'text',
                required: false,
            },
            {
                key: 'Retention anchors',
                group: 'retention',
                type: 'multi',
                display: 'checklist',
                required: true,
                options: [
                    {
                        value: 'Social anchors',
                        description:
                            'Guilds, clans, or alliances that require coordination with others to progress.',
                    },
                    {
                        value: 'Relationship anchors',
                        description:
                            'Friends, duos, or peer-to-peer obligations — a raid team, a co-op progress bar shared with someone specific.',
                    },
                    {
                        value: 'Ritual anchors',
                        description:
                            'Habitual touchpoints — daily login, weekly reset, streaks.',
                    },
                    {
                        value: 'Investment anchors',
                        description:
                            'Sunk costs — collections, reputation, or progress that feels too painful to abandon.',
                    },
                    {
                        value: 'Identity anchors',
                        description:
                            'Public status — cosmetics, leaderboards, titles, avatar personalization.',
                    },
                    {
                        value: 'Rarity and chance',
                        description:
                            'Unpredictable rewards — loot, drops, or pulls — that keep users coming back for the chance of a rare outcome.',
                    },
                ],
            },
            {
                key: 'Drop-out risks',
                group: 'dropout',
                type: 'multi',
                display: 'checklist',
                required: false,
                options: [
                    {
                        value: 'Skill-challenge imbalance',
                        description:
                            "If tasks were to exceed a user's current ability, they could feel overwhelmed and might give up.",
                    },
                    {
                        value: 'Commitment collapse',
                        description:
                            "If your users hit a wall they can't cross, they lose interest completely — even in goals that matter to them.",
                    },
                    {
                        value: 'Excessive difficulty',
                        description:
                            'If challenges were poorly balanced or overly harsh, users might walk away prematurely.',
                    },
                    {
                        value: 'Over-reliance on extrinsic incentives',
                        description:
                            'Relying only on badges and points makes users focus on the rewards instead of the actual goal.',
                    },
                    {
                        value: 'Lack of progress feedback',
                        description:
                            "If users can't see how they are doing, they lose direction and drop off.",
                    },
                    {
                        value: 'Absence of a "glowing choice"',
                        description:
                            "If a user is stuck too long without hints or boosters, they're much more likely to stop participating.",
                    },
                ],
            },
            {
                key: 'Drop-out risks · Additional information',
                label: '*Additional information',
                group: 'dropout',
                type: 'text',
                required: false,
            },
            {
                key: 'Goal types',
                group: 'goals',
                type: 'multi',
                display: 'checklist',
                required: true,
                options: [
                    {
                        value: 'Outcome goals',
                        description:
                            'Completing a specific result or task — finishing a quest or an exploratory mission.',
                    },
                    {
                        value: 'Performance goals',
                        description:
                            'Meeting a standard — earning a set number of points, reaching a level, hitting a leaderboard rank.',
                    },
                    {
                        value: 'Process (learning) goals',
                        description:
                            'Aimed at acquiring new skills or knowledge. In gamification.',
                    },
                    {
                        value: 'Stretch goals',
                        description:
                            'These are highly difficult or even potentially impossible goals used to stimulate creative thinking (e.g., achieving 100% completion in a game).',
                    },
                    {
                        value: 'Proximal and distal goals',
                        description:
                            'Distal goals are long-term or distant achievements (like completing a whole chapter), while proximal goals are immediate tasks that serve as stepping stones toward the distal objective.',
                    },
                    {
                        value: 'SMART goals',
                        description:
                            'Specific, measurable, attainable, realistic, and time-bound.',
                    },
                ],
            },
            {
                key: 'Expectations from the system',
                label: 'What do you expect from the system?',
                group: 'goals',
                type: 'text',
                required: false,
            },
            ...[
                'Competition',
                'Cooperation',
                'Curiosity',
                'Achievement',
                'Social status',
                'Anxiety / pressure',
            ].map((name) => ({
                key: `Emotional dynamics · ${name}`,
                label: name,
                group: 'emotions',
                type: 'single',
                display: 'slider',
                required: true,
                options: INTENSITY,
            })),
            {
                key: 'Emotional dynamics · Context',
                label: "Add context the sliders can't capture — what's driving the high ratings, and how you're managing the low ones.",
                group: 'emotions',
                type: 'text',
                required: false,
            },
        ],
    },

    /* ── 3 · Personalization and dynamics ────────────────────────────────── */
    {
        number: 3,
        id: 'personalization',
        title: 'Personalization and dynamics',
        navLabel: 'Personalization and dynamics',
        navName: 'Personalization and dynamics',
        summary: 'User types, Personalization, Dynamics',
        description:
            'Define your user types and how your system adapts to their different motives and goals. Describe what they can shape themselves, what the game adjusts automatically, and what you infer from their behavior.',
        groups: [
            {
                id: 'user-types',
                title: 'User types',
                description:
                    'Think about your users and what drives them. Understanding their primary motives and matching them to your design mechanics will help you build a system they actually want to use.',
            },
            { id: 'personalization', title: 'Personalization' },
            {
                id: 'dynamics',
                title: 'Dynamics',
                description:
                    'Define how difficulty adapts over time: what signals trigger a change, what actually gets adjusted, and how that adjustment behaves.',
            },
        ],
        fields: [
            {
                key: 'User types',
                group: 'user-types',
                type: 'multi',
                display: 'checklist',
                required: true,
                options: [
                    {
                        value: 'Philanthropist',
                        description:
                            'Motivated by purpose — enjoys helping others and sharing knowledge with no expectation of reward.',
                    },
                    {
                        value: 'Socialiser',
                        description:
                            'Motivated by relatedness — focused on interacting with others and building social connections.',
                    },
                    {
                        value: 'Free Spirit',
                        description:
                            'Motivated by autonomy — values the freedom to explore, create, and act without external control.',
                    },
                    {
                        value: 'Achiever',
                        description:
                            'Motivated by competence — seeks progress by mastering difficult tasks and overcoming challenges.',
                    },
                    {
                        value: 'Player',
                        description:
                            'Motivated by extrinsic rewards — driven to complete activities to collect points, badges, and prizes.',
                    },
                    {
                        value: 'Disruptor',
                        description:
                            "Motivated by change — tests the system's boundaries to force improvements or modifications.",
                    },
                ],
            },
            {
                key: 'User types · Additional information',
                label: '*Additional information',
                group: 'user-types',
                type: 'text',
                required: false,
            },
            {
                key: 'Player-driven customization',
                title: 'Player-driven / customization',
                hint: 'Select what players can shape directly, from how they look to how they play.',
                group: 'personalization',
                type: 'multi',
                display: 'chips',
                other: true,
                required: false,
                options: [
                    'Character creation & appearance',
                    'Loadouts, builds, skill trees',
                    'Base/home decoration',
                    'Explicit difficulty settings',
                ],
            },
            {
                key: 'Player-driven customization · Additional information',
                label: '*Additional information',
                group: 'personalization',
                type: 'text',
                required: false,
            },
            {
                key: 'Game-driven adaptive systems',
                title: 'Game-driven adaptive systems',
                hint: "Systems that react to a player's current session — adjusting in real time based on how they're playing right now, with no history required.",
                group: 'personalization',
                type: 'multi',
                display: 'chips',
                other: true,
                required: false,
                options: [
                    {
                        value: 'Dynamic difficulty adjustment (DDA)',
                        info: 'The game raises or lowers the challenge in real time based on how the player is performing.',
                    },
                    {
                        value: 'Procedural content generation',
                        info: 'Levels, items or events are generated by algorithms instead of being hand-made, so each session can differ.',
                    },
                    {
                        value: 'Narrative branching',
                        info: "The story changes direction depending on the player's choices or actions.",
                    },
                ],
            },
            {
                key: 'Game-driven adaptive systems · Additional information',
                label: '*Additional information',
                group: 'personalization',
                type: 'text',
                required: false,
            },
            {
                key: 'Data-driven personalization',
                title: 'Data-driven / algorithmic personalization',
                hint: 'Systems that use accumulated player data (across sessions or players) to shape what an individual sees, is offered, or is matched with.',
                group: 'personalization',
                type: 'multi',
                display: 'chips',
                other: true,
                required: false,
                options: [
                    {
                        value: 'Recommendation systems',
                        info: 'Suggest content, quests or items based on what the player and similar players did before.',
                    },
                    {
                        value: 'Behavioral segmentation',
                        info: 'Group players by how they behave and give each group a different experience.',
                    },
                    {
                        value: 'Live-ops targeting',
                        info: 'Offer events, rewards or messages to specific player groups after launch.',
                    },
                    {
                        value: 'Personalized matchmaking',
                        info: 'Match players with others based on skill, behavior or preferences.',
                    },
                ],
            },
            {
                key: 'Data-driven personalization · Additional information',
                label: '*Additional information',
                group: 'personalization',
                type: 'text',
                required: false,
            },
            {
                key: 'Metrics / signals',
                title: 'Metrics / signals',
                hint: "Select and describe how does the system know it's time to change the difficulty.",
                group: 'dynamics',
                type: 'multi',
                display: 'chips',
                other: true,
                required: true,
                options: [
                    'Performance',
                    'Telemetry',
                    'Emotions',
                    'Preferences',
                ],
            },
            {
                key: 'How metrics change the dynamics',
                label: 'Describe how metrics change the dynamics:',
                group: 'dynamics',
                type: 'text',
                required: false,
            },
            {
                key: 'Control variables',
                title: 'Control variables',
                hint: 'Select and describe what moves when the system adapts.',
                group: 'dynamics',
                type: 'multi',
                display: 'chips',
                other: true,
                required: true,
                options: [
                    'Spawn rate',
                    'Frequency',
                    'Starting level',
                    'AI tactics',
                    'Pacing',
                    'Hinting',
                    'Difficulty curve',
                ],
            },
            {
                key: 'How control variables change the dynamics',
                label: 'Describe how control variables change the dynamics:',
                group: 'dynamics',
                type: 'text',
                required: false,
            },
            {
                key: 'What should change',
                title: 'What should change',
                hint: 'Once triggered, select and describe how does the adjustment itself behave?',
                group: 'dynamics',
                type: 'multi',
                display: 'chips',
                other: true,
                required: true,
                options: [
                    'Update frequency',
                    'Latency',
                    'Magnitude of change',
                    'Smoothness',
                    'Persistence',
                    'Reversibility',
                    'Player visibility',
                ],
            },
            {
                key: 'How adjustments change the dynamics',
                label: 'Describe how adjustments change the dynamics:',
                group: 'dynamics',
                type: 'text',
                required: false,
            },
        ],
    },

    /* ── 4 · Gameful Core ────────────────────────────────────────────────── */
    {
        number: 4,
        id: 'gameful-core',
        title: 'Gameful Core',
        navLabel: 'Gameful Core',
        navName: 'Gameful Core',
        summary: 'Game rules and loops, Mechanics, Progression',
        description:
            'This is where the actual game lives — the loops that repeat, the mechanics that drive them, and how players move forward over time.',
        groups: [
            {
                id: 'rules',
                title: 'Game rules',
                description:
                    'Lay out the core rules of your system — the constraints and logic that make everything else possible.',
            },
            {
                id: 'mechanics',
                title: 'Gamification & Mechanics',
                description:
                    "Pick a category, select the game elements you're using within it, and describe the mechanics behind each element.",
            },
            {
                id: 'progression',
                title: 'Progression',
                description:
                    'Define how the player advances and grows over time',
            },
            {
                id: 'modality',
                title: 'Modality',
                description:
                    'Choose how players interact with each other during play.',
            },
            {
                id: 'timing',
                title: 'Timing',
                description:
                    'Choose whether players need to be active at the same time, or can participate independently, on their own schedule.',
            },
        ],
        fields: [
            {
                key: 'Game rules',
                group: 'rules',
                type: 'text',
                required: true,
                placeholder:
                    "e.g. Players earn 1 point per completed task, lose points if a task is skipped 3 days in a row, and can't advance to the next level until they've completed all core tasks in the current one.",
            },
            // "Game loops" sits in the Game rules card in the mockup. What opens on click is
            // not defined yet: each loop is a free-text description.
            {
                key: 'Core loop',
                title: 'Game loops',
                hint: 'Configure how each time-scale loop works.',
                group: 'rules',
                type: 'text',
                display: 'loop',
                badge: 'Core loop',
                description:
                    "The basic action a player repeats every few seconds to a couple of minutes. It's the fundamental verb of the game.",
                required: true,
                provisional: true,
            },
            {
                key: 'Long loop',
                group: 'rules',
                type: 'text',
                display: 'loop',
                badge: 'Long loop',
                description:
                    "The larger structure that gives the short loop purpose over minutes, hours, or the whole game. It's built from many repetitions of the short loop and typically involves progression, rewards, or strategic decisions.",
                required: true,
                provisional: true,
            },
            // "*Attach a sketch or diagram of your loop" (PNG/JPEG upload) is not implemented:
            // the design API has no file upload yet.
            {
                key: 'Game element categories',
                group: 'mechanics',
                type: 'multi',
                display: 'chips',
                required: true,
                options: [
                    {
                        value: 'Performance',
                        info: 'Elements that give the player feedback on how they are doing: acknowledgement, levels, progression, points, stats.',
                    },
                    {
                        value: 'Social',
                        info: 'Elements based on interaction between players: competition, cooperation, reputation, social pressure.',
                    },
                    {
                        value: 'Personal',
                        info: 'Elements about the player as an individual: novelty, objectives, puzzles, renovation, sensation.',
                    },
                    {
                        value: 'Fictional',
                        info: 'Elements that tie the experience to a story or context: narrative, storytelling.',
                    },
                    {
                        value: 'Ecological',
                        info: 'Elements tied to the environment the game creates: chance, imposed choice, economy, rarity, time pressure.',
                    },
                ],
            },
            // The game elements of each category are not in the mockup: they follow the
            // taxonomy by Toda et al., the same the categories come from.
            ...Object.entries(GAME_ELEMENTS).flatMap(([category, elements]) => [
                {
                    key: `${category} elements`,
                    title: `${category} elements`,
                    group: 'mechanics',
                    type: 'multi',
                    display: 'chips',
                    required: false,
                    provisional: true,
                    showIf: {
                        key: 'Game element categories',
                        includes: category,
                    },
                    options: elements,
                },
                {
                    key: `${category} mechanics`,
                    label: 'Describe the mechanics behind each element:',
                    group: 'mechanics',
                    type: 'text',
                    required: false,
                    provisional: true,
                    showIf: {
                        key: 'Game element categories',
                        includes: category,
                    },
                },
            ]),
            {
                key: 'Primary progression type',
                title: 'Primary progression type',
                group: 'progression',
                type: 'multi',
                display: 'checks',
                required: true,
                options: [
                    'Character power',
                    'Player skill',
                    'Content unlocks',
                    'Rule knowledge',
                    'Narrative progression',
                    'Collection',
                    {
                        value: 'Meta-progression',
                        info: 'Progress that persists between runs or sessions, even when a single attempt ends.',
                    },
                ],
            },
            {
                key: 'Progression structure',
                title: 'Progression structure',
                group: 'progression',
                type: 'multi',
                display: 'checks',
                required: false,
                options: [
                    'Linear',
                    {
                        value: 'Branching',
                        info: 'The player chooses between different paths, each leading to different content.',
                    },
                    {
                        value: 'Open-ended',
                        info: 'No fixed end point: players set their own goals and keep progressing.',
                    },
                    {
                        value: 'Hub-and-spoke',
                        info: 'A central hub from which the player reaches separate areas or missions and then returns.',
                    },
                    {
                        value: 'Procedural',
                        info: 'The progression path is generated by the system instead of being fixed in advance.',
                    },
                    {
                        value: 'Cyclical',
                        info: 'Progress happens in repeating cycles, such as seasons or runs, that reset and start again.',
                    },
                ],
            },
            {
                key: 'Main source of progression',
                title: 'Main source of progression',
                group: 'progression',
                type: 'multi',
                display: 'checks',
                required: false,
                options: [
                    'Core gameplay loop',
                    'Side activities',
                    'Exploration',
                    'Story progression',
                    'Defeating enemies',
                    'Crafting',
                    'Social actions',
                ],
            },
            {
                key: 'Reward type',
                title: 'Reward type',
                group: 'progression',
                type: 'multi',
                display: 'checks',
                required: false,
                options: [
                    'Power reward',
                    'Utility reward',
                    'Content access',
                    'Information reward',
                    'Narrative reward',
                    'Cosmetic reward',
                    'Resource reward',
                ],
            },
            {
                key: 'Difficulty growth',
                title: 'Difficulty growth',
                group: 'progression',
                type: 'multi',
                display: 'checks',
                required: false,
                options: [
                    'Linear',
                    {
                        value: 'Stepped',
                        info: 'Difficulty stays flat for a while and then jumps up, for example at the start of a new level.',
                    },
                    {
                        value: 'Branching',
                        info: 'Different paths have different difficulty, and the player picks one.',
                    },
                    'Adaptive',
                    'Player-selected',
                ],
            },
            {
                key: 'Role of failure',
                title: 'Role of failure',
                group: 'progression',
                type: 'multi',
                display: 'checks',
                required: false,
                options: [
                    'Full reset',
                    'Partial reset',
                    'Progress preserved',
                    'Failure enables growth',
                    'Failure does not affect progression',
                ],
            },
            {
                key: 'Progression structure in the project',
                label: 'Describe the structure of progression in your project:',
                group: 'progression',
                type: 'text',
                required: false,
            },
            {
                key: 'Modality',
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
                        value: 'Cooperative',
                        description:
                            'Real-time collaboration toward shared goals.',
                    },
                    {
                        value: 'Competitive / Cooperative',
                        description:
                            'Teams cooperate internally, but the teams compete against each other.',
                    },
                    {
                        value: 'Competitive',
                        description:
                            'Real-time competition. Requires matchmaking.',
                    },
                ],
            },
            {
                key: 'Modality · Additional information',
                label: '*Additional information',
                group: 'modality',
                type: 'text',
                required: false,
            },
            {
                key: 'Timing',
                group: 'timing',
                type: 'single',
                display: 'cards',
                required: true,
                options: [
                    {
                        value: 'Asynchronous',
                        description:
                            'Players do not need to act at the same time; interaction happens across different time frames or turns.',
                    },
                    {
                        value: 'Synchronous timing',
                        description:
                            'Players act at the same time, so the interaction depends on real-time coordination.',
                    },
                ],
            },
            {
                key: 'Timing · Additional information',
                label: '*Additional information',
                group: 'timing',
                type: 'text',
                required: false,
            },
        ],
    },

    /* ── 5 · Feedback and Evaluation ─────────────────────────────────────── */
    {
        number: 5,
        id: 'feedback',
        title: 'Feedback and Evaluation',
        navLabel: 'Evaluation and Feedback loop',
        navName: 'Feedback and Evaluation',
        summary: 'Feedback components, Evaluation',
        description:
            "Close the loop: define how the system communicates with players, then how you'll know if it's working. Work through these in order — each answer builds on the last.",
        groups: [
            { id: 'feedback', title: 'Feedback components' },
            // The mockup shows only the feedback components: the evaluation part
            // mentioned in the section description is not defined yet.
            {
                id: 'evaluation',
                title: 'Evaluation',
                provisional: true,
            },
        ],
        fields: [
            {
                key: 'Feedback component',
                group: 'feedback',
                type: 'list',
                itemLabel: 'New feedback component',
                required: true,
                itemFields: [
                    {
                        key: 'Process stage',
                        title: 'In which part of the process do you want to provide feedback?',
                        type: 'multi',
                        display: 'chips',
                        other: true,
                        options: [
                            'Onboarding',
                            'Core loop / mid-action',
                            'After failure',
                            'After success',
                            'Long loop / Milestone',
                        ],
                    },
                    {
                        key: 'Message',
                        title: 'What do you prefer to communicate to the user?',
                        type: 'text',
                        placeholder:
                            'e.g. You were spotted because you ran across a noisy surface…',
                    },
                    {
                        key: 'Typology',
                        title: 'What is the feedback typology?',
                        type: 'multi',
                        display: 'chips',
                        other: true,
                        options: [
                            'Praise / Encouragement',
                            'Correction',
                            'Status updates',
                            'Alerts / Risks',
                            'Warning',
                            'Comparisons with others',
                        ],
                    },
                    {
                        key: 'Content',
                        title: 'What is the feedback content?',
                        type: 'text',
                        placeholder:
                            "e.g. A red detection icon fills above the enemy's head, with a short alert stinger",
                    },
                    {
                        key: 'Timing',
                        title: 'What is the most suitable timing?',
                        type: 'multi',
                        display: 'chips',
                        other: true,
                        options: [
                            'Immediate',
                            'Delayed',
                            'Periodic',
                            'Milestone-based',
                        ],
                    },
                    {
                        key: 'Timing details',
                        label: '*Specify your feedback timings:',
                        type: 'text',
                    },
                    {
                        key: 'Modality',
                        title: 'What is the best modality?',
                        type: 'multi',
                        display: 'chips',
                        options: ['Visual', 'Audio', 'Haptic', 'Textual'],
                    },
                    // "Link with specific game element" opens a picker that is not in the
                    // mockups yet: for now the element is written as text.
                    {
                        key: 'Game element',
                        title: 'What is the best game element that can support feedback?',
                        type: 'text',
                        display: 'input',
                        provisional: true,
                    },
                    {
                        key: 'Presentation',
                        title: 'Feedback presentation:',
                        type: 'text',
                        placeholder:
                            'e.g. Top-right corner, 400ms fade-in, holds 2s, fades before HUD returns to idle state',
                    },
                    {
                        key: 'Implementation',
                        title: 'Feedback implementation:',
                        type: 'text',
                        placeholder:
                            'e.g. Fires from DetectionSystem.onSpotted(); suppress if player is already in combat state',
                    },
                ],
            },
            {
                key: 'Evaluation',
                label: 'How will you know if the system is working?',
                group: 'evaluation',
                type: 'text',
                required: false,
                provisional: true,
            },
        ],
    },

    /* ── 6 · Technical requirements ──────────────────────────────────────── */
    // The mockup shows the nine panels collapsed: their content is not defined yet,
    // so each one holds a single free-text field.
    {
        number: 6,
        id: 'technical',
        title: 'Technical requirements',
        navLabel: 'Technical Requirements',
        navName: 'Technical requirements',
        summary: 'Platforms, Engine, Performance, Data',
        description:
            "Ground your design in what's actually feasible to build — the platforms, engine, and constraints your team is working within.",
        groups: [
            ['platforms', 'Platforms'],
            ['engine', 'Engine and technology stack'],
            ['runtime', 'Runtime and controls'],
            ['display', 'Display, audio, haptics'],
            ['performance', 'Performance budgets'],
            ['data', 'Data, save and online'],
            ['sdks', 'External SDKs and integrations'],
            ['pipeline', 'Content pipeline'],
            ['risks', 'Technical risks'],
        ].map(([id, title]) => ({
            id,
            title,
            collapsible: true,
            provisional: true,
        })),
        fields: [
            ['platforms', 'Platforms'],
            ['engine', 'Engine and technology stack'],
            ['runtime', 'Runtime and controls'],
            ['display', 'Display, audio, haptics'],
            ['performance', 'Performance budgets'],
            ['data', 'Data, save and online'],
            ['sdks', 'External SDKs and integrations'],
            ['pipeline', 'Content pipeline'],
            ['risks', 'Technical risks'],
        ].map(([group, key]) => ({
            key,
            group,
            type: 'text',
            required: false,
            provisional: true,
        })),
    },
];

/* Number of steps in "STEP n OF N": the sections (the Spark is not counted). */
export const TOTAL_STEPS = DESIGN_SECTIONS.length;

/* Section by number (1–6), or null. */
export function getSection(number) {
    return DESIGN_SECTIONS.find((s) => s.number === number) || null;
}

/* Options can be strings or { value, description, info }: turns them all into the latter. */
export function normalizeOptions(options = []) {
    return options.map((o) => (typeof o === 'string' ? { value: o } : o));
}

/* Key under which the "Other" free text of a field is saved. */
export function otherKey(field) {
    return `${field.key} · Other`;
}

/* Key of a field of the n-th item (0-based) of a list field, as saved on the backend. */
function itemKey(field, index, sub) {
    return `${field.key} ${index + 1} · ${sub.key}`;
}

/* true if the field is shown with the current values (see `showIf`). */
export function isFieldVisible(field, values) {
    if (!field.showIf) return true;
    const source = values?.[field.showIf.key];
    return Array.isArray(source) && source.includes(field.showIf.includes);
}

/* true if the field has a value (non-empty array, non-empty string, list with content). */
export function isFilled(field, value) {
    if (field.type === 'list')
        return (
            Array.isArray(value) &&
            value.some((item) =>
                field.itemFields.some((sub) => isFilled(sub, item?.[sub.key])),
            )
        );
    if (field.type === 'multi') return Array.isArray(value) && value.length > 0;
    return typeof value === 'string' && value.trim() !== '';
}

function emptyValue(field) {
    return field.type === 'multi' || field.type === 'list' ? [] : '';
}

function readValue(field, raw) {
    if (field.type === 'multi') return Array.isArray(raw) ? raw : [];
    return typeof raw === 'string' ? raw : '';
}

/* Fields of a list item, including its name (shown on the item's tab). */
function itemFieldsOf(field) {
    return [{ key: 'Name', type: 'text' }, ...field.itemFields];
}

/* Empty item of a list field. */
export function emptyItem(field) {
    const item = {};
    for (const sub of itemFieldsOf(field)) {
        item[sub.key] = emptyValue(sub);
        if (sub.other) item[otherKey(sub)] = '';
    }
    return item;
}

/* Backend `content` → form values (every schema field present, extra keys kept). */
export function contentToValues(section, content) {
    const source =
        content && typeof content === 'object' && !Array.isArray(content)
            ? content
            : {};
    const values = { ...source };
    for (const field of section.fields) {
        if (field.type !== 'list') {
            values[field.key] = readValue(field, source[field.key]);
            continue;
        }
        // Items are rebuilt from the flattened keys "<key> <n> · <item field>".
        const items = [];
        const prefix = new RegExp(
            `^${field.key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} (\\d+) · (.+)$`,
        );
        for (const [key, raw] of Object.entries(source)) {
            const match = key.match(prefix);
            if (!match) continue;
            delete values[key];
            const index = Number(match[1]) - 1;
            items[index] = items[index] || emptyItem(field);
            const sub = itemFieldsOf(field).find(
                (f) => f.key === match[2] || otherKey(f) === match[2],
            );
            if (!sub) continue;
            if (sub.key === match[2])
                items[index][sub.key] = readValue(sub, raw);
            else items[index][otherKey(sub)] = readValue({ type: 'text' }, raw);
        }
        values[field.key] = items.filter(Boolean);
    }
    return values;
}

/* Form values → `content` for the backend: schema fields first in their order (empty ones
   are left out, an "Other" text right after its field), then the unknown keys, so nothing
   is lost. Hidden fields (`showIf`) are not sent. */
export function valuesToContent(section, values) {
    const content = {};
    const known = new Set();
    const put = (key, field, value) => {
        if (isFilled(field, value))
            content[key] = field.type === 'multi' ? [...value] : value.trim();
    };
    for (const field of section.fields) {
        known.add(field.key);
        if (field.other) known.add(otherKey(field));
        if (!isFieldVisible(field, values)) continue;
        if (field.type === 'list') {
            const items = (values[field.key] || []).filter((item) =>
                isFilled(field, [item]),
            );
            items.forEach((item, i) => {
                for (const sub of itemFieldsOf(field)) {
                    put(itemKey(field, i, sub), sub, item[sub.key]);
                    if (sub.other)
                        put(
                            itemKey(field, i, { key: otherKey(sub) }),
                            { type: 'text' },
                            item[otherKey(sub)],
                        );
                }
            });
            continue;
        }
        put(field.key, field, values[field.key]);
        if (field.other)
            put(otherKey(field), { type: 'text' }, values[otherKey(field)]);
    }
    for (const [key, value] of Object.entries(values)) {
        if (!known.has(key) && value !== undefined && value !== '')
            content[key] = value;
    }
    return content;
}

/* Completion computed on the required fields (if a section has none, on all fields).
   Hidden fields (`showIf`) are not counted. */
export function sectionProgress(section, values) {
    const visible = section.fields.filter((f) => isFieldVisible(f, values));
    const required = visible.filter((f) => f.required);
    const counted = required.length > 0 ? required : visible;
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

/* true if at least one field of the section has a value. */
export function hasAnyValue(section, values) {
    return section.fields.some((f) => isFilled(f, values[f.key]));
}
