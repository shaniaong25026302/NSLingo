/* ============================================================
   NSLingo — Mock data (frontend-first)
   Mirrors the MongoDB Atlas collections in the spec:
   dictionaryTerms, quizQuestions, translationExamples, userProgress.
   The API service layer (services/api.js) returns this data until a
   real backend (VITE_API_BASE_URL) is configured.
   ============================================================ */

/* ---------- dictionaryTerms ---------- */
export const dictionaryTerms = [
  { term: 'Arrow', meaning: 'To be assigned (often unfairly) an extra duty or task.', example: '"Why I always kena arrow to do guard duty?"', category: 'Common Phrases' },
  { term: 'Book In', meaning: 'To report back to camp at the start of the work week or after a break.', example: '"Book in by 2359 on Sunday."', category: 'Admin Speak' },
  { term: 'Book Out', meaning: 'To leave camp and go home, usually on weekends.', example: '"Eh, what time we book out today?"', category: 'Admin Speak' },
  { term: 'Buddy', meaning: 'Your assigned partner during training; you look out for each other.', example: '"Where is your buddy? Never leave him behind."', category: 'Common Phrases' },
  { term: 'Chao Keng', meaning: 'To malinger — to fake or exaggerate illness/injury to avoid work.', example: '"He chao keng again, MC for the route march."', category: 'Common Phrases' },
  { term: 'Confirm Plus Chop', meaning: 'Absolutely certain, guaranteed.', example: '"Confirm plus chop we have IPPT next week."', category: 'Common Phrases' },
  { term: 'Cookhouse', meaning: 'The camp canteen / dining hall where meals are served.', example: '"Fall in at the cookhouse for dinner."', category: 'Admin Speak' },
  { term: 'Fall In', meaning: 'Command to assemble in formation.', example: '"Fall in! Three rows!"', category: 'Basic Commands' },
  { term: 'Fall Out', meaning: 'Command to dismiss / break formation.', example: '"Fall out and grab your water."', category: 'Basic Commands' },
  { term: 'Field Pack', meaning: 'The heavy backpack carried during field training and route marches.', example: '"Pack your field pack, 20kg minimum."', category: 'Equipment Terms' },
  { term: 'Outfield', meaning: 'Training conducted in the field/jungle, away from camp comforts.', example: '"Three days outfield, no shower."', category: 'Exercise Lingo' },
  { term: 'Ez Link / 11B', meaning: '11B is the SAF identity card. Must be carried at all times.', example: '"Show your 11B at the gate."', category: 'Admin Speak' },
  { term: 'IPPT', meaning: 'Individual Physical Proficiency Test — push-ups, sit-ups, 2.4km run.', example: '"Pass your IPPT for the cash award."', category: 'Exercise Lingo' },
  { term: 'Jiak Liao Bee', meaning: 'Someone seen as useless or freeloading (lit. "eat already, finished").', example: '"Don\'t be jiak liao bee, help carry."', category: 'Common Phrases' },
  { term: 'Kena', meaning: 'To get / to be subjected to (something unpleasant).', example: '"I kena extra duty this weekend."', category: 'Common Phrases' },
  { term: 'Knock It Down', meaning: 'Order to do push-ups as a punishment.', example: '"Knock it down 20!"', category: 'Basic Commands' },
  { term: 'Mess Tin', meaning: 'Metal container used to cook/eat rations in the field.', example: '"Heat your rations in the mess tin."', category: 'Equipment Terms' },
  { term: 'OC', meaning: 'Officer Commanding — the officer in charge of a company.', example: '"The OC is doing a spot check."', category: 'Rank & Structure' },
  { term: 'CSM', meaning: 'Company Sergeant Major — senior warrant officer of a company.', example: '"The CSM wants the bunk spotless."', category: 'Rank & Structure' },
  { term: 'Encik', meaning: 'Respectful term for a Warrant Officer.', example: '"Morning, Encik!"', category: 'Rank & Structure' },
  { term: 'Recruit', meaning: 'A serviceman in Basic Military Training (BMT).', example: '"Recruit! Stand by your bed!"', category: 'Rank & Structure' },
  { term: 'Sergeant', meaning: 'A non-commissioned officer; often your section commander in BMT.', example: '"Yes, Sergeant!"', category: 'Rank & Structure' },
  { term: 'Regular', meaning: 'A full-time career soldier (as opposed to an NSF).', example: '"He signed on as a regular."', category: 'Rank & Structure' },
  { term: 'NSF', meaning: 'Full-time National Serviceman serving his two years.', example: '"As an NSF, your allowance is fixed."', category: 'Rank & Structure' },
  { term: 'Pump', meaning: 'To do push-ups, usually as punishment.', example: '"Go and pump 20 now."', category: 'Basic Commands' },
  { term: 'Recce', meaning: 'Reconnaissance — to scout ahead and gather information.', example: '"Send a team to recce the area."', category: 'Exercise Lingo' },
  { term: 'Route March', meaning: 'A long-distance march carrying full field pack.', example: '"24km route march this Friday."', category: 'Exercise Lingo' },
  { term: 'SOC', meaning: 'Standard Obstacle Course — timed course of physical obstacles.', example: '"Clear the SOC under time."', category: 'Exercise Lingo' },
  { term: 'Sai Kang', meaning: 'Menial, dirty, or undesirable work.', example: '"Always give me sai kang one."', category: 'Common Phrases' },
  { term: 'Stand By Bed', meaning: 'Order to stand at attention beside your bunk bed for inspection.', example: '"Stand by your bed in 5 minutes!"', category: 'Basic Commands' },
  { term: 'Stand Down', meaning: 'To stand easy / be released from duty for the day.', example: '"Ok, stand down, good work today."', category: 'Basic Commands' },
  { term: 'Tekan', meaning: 'To be punished, harassed, or put through tough physical training.', example: '"Later kenna tekan because of you!"', category: 'Common Phrases' },
  { term: 'Wayang', meaning: 'To put on a show / pretend to work hard when superiors watch.', example: '"He only wayang when officer around."', category: 'Common Phrases' },
  { term: 'Zai', meaning: 'Capable, strong, impressive.', example: '"That recruit damn zai, finish first."', category: 'Common Phrases' },
  { term: 'Admin Time', meaning: 'Allocated time for personal admin: showering, washing, resting.', example: '"You have 30 minutes admin time."', category: 'Admin Speak' },
  { term: 'Lobang', meaning: 'A good opportunity, tip, or connection.', example: '"He got lobang for early book out."', category: 'Common Phrases' },
]

/* ---------- modules + lessons (Learning Path) ---------- */
export const modules = [
  {
    id: 'basic-commands',
    order: 1,
    title: 'Basic Commands',
    icon: '📣',
    blurb: 'The drill commands you\'ll hear from day one.',
    xp: 60,
    lessons: [
      {
        id: 'attention-parade-rest',
        title: 'Attention & Parade Rest',
        proTip: 'When you hear "Sedia!" snap to attention instantly — eyes front, heels together.',
        xp: 20,
        cards: [
          { term: 'Fall In', meaning: 'Assemble in formation.' },
          { term: 'Fall Out', meaning: 'Dismiss / break formation.' },
          { term: 'Stand By Bed', meaning: 'Stand at attention beside your bunk for inspection.' },
          { term: 'Stand Down', meaning: 'Be released from duty for the day.' },
        ],
      },
      {
        id: 'punishment-commands',
        title: 'Punishment Commands',
        proTip: 'Don\'t argue. "Knock it down" means drop and push — the faster you start, the faster it ends.',
        xp: 20,
        cards: [
          { term: 'Knock It Down', meaning: 'Do push-ups as punishment.' },
          { term: 'Pump', meaning: 'Do push-ups.' },
          { term: 'Tekan', meaning: 'To be punished or put through tough PT.' },
        ],
      },
    ],
  },
  {
    id: 'rank-structure',
    order: 2,
    title: 'Rank & Structure',
    icon: '🎖️',
    blurb: 'Who\'s who — address everyone correctly.',
    xp: 60,
    lessons: [
      {
        id: 'who-is-who',
        title: 'Who Is Who',
        proTip: 'Address Warrant Officers as "Encik" — never by rank abbreviation.',
        xp: 30,
        cards: [
          { term: 'Recruit', meaning: 'Serviceman in BMT.' },
          { term: 'Sergeant', meaning: 'Your section commander in BMT.' },
          { term: 'Encik', meaning: 'Respectful term for a Warrant Officer.' },
          { term: 'OC', meaning: 'Officer Commanding a company.' },
          { term: 'CSM', meaning: 'Company Sergeant Major.' },
        ],
      },
      {
        id: 'nsf-vs-regular',
        title: 'NSF vs Regular',
        proTip: 'NSFs serve two years; Regulars sign on as a career.',
        xp: 30,
        cards: [
          { term: 'NSF', meaning: 'Full-time National Serviceman.' },
          { term: 'Regular', meaning: 'Career soldier.' },
        ],
      },
    ],
  },
  {
    id: 'common-phrases',
    order: 3,
    title: 'Common Phrases',
    icon: '💬',
    blurb: 'The everyday slang in every bunk.',
    xp: 70,
    lessons: [
      {
        id: 'survival-slang',
        title: 'Survival Slang',
        proTip: 'If you "kena arrow", you got picked for an extra task. Look busy to avoid it.',
        xp: 35,
        cards: [
          { term: 'Kena', meaning: 'To get / be subjected to something unpleasant.' },
          { term: 'Arrow', meaning: 'Assigned an extra task, often unfairly.' },
          { term: 'Sai Kang', meaning: 'Menial, undesirable work.' },
          { term: 'Chao Keng', meaning: 'To fake illness to avoid work.' },
          { term: 'Wayang', meaning: 'To put on a show for superiors.' },
        ],
      },
      {
        id: 'bunk-talk',
        title: 'Bunk Talk',
        proTip: 'Calling someone "zai" is a compliment. "Jiak liao bee" is not.',
        xp: 35,
        cards: [
          { term: 'Zai', meaning: 'Capable, strong, impressive.' },
          { term: 'Lobang', meaning: 'A good opportunity or tip.' },
          { term: 'Buddy', meaning: 'Your assigned partner; look out for each other.' },
          { term: 'Confirm Plus Chop', meaning: 'Absolutely guaranteed.' },
        ],
      },
    ],
  },
  {
    id: 'equipment-terms',
    order: 4,
    title: 'Equipment Terms',
    icon: '🎒',
    blurb: 'Know your kit before you draw it.',
    xp: 50,
    lessons: [
      {
        id: 'field-kit',
        title: 'Field Kit',
        proTip: 'Pack your field pack tight — loose straps chafe on a route march.',
        xp: 25,
        cards: [
          { term: 'Field Pack', meaning: 'Heavy backpack for field training.' },
          { term: 'Mess Tin', meaning: 'Metal container to cook/eat rations.' },
          { term: '11B', meaning: 'Your SAF identity card — carry it always.' },
        ],
      },
    ],
  },
  {
    id: 'exercise-lingo',
    order: 5,
    title: 'Exercise Lingo',
    icon: '🏃',
    blurb: 'Training, tests, and the great outfield.',
    xp: 70,
    lessons: [
      {
        id: 'tests-and-courses',
        title: 'Tests & Courses',
        proTip: 'Train for IPPT early — the 2.4km run trips up most recruits.',
        xp: 35,
        cards: [
          { term: 'IPPT', meaning: 'Physical proficiency test: push-ups, sit-ups, 2.4km run.' },
          { term: 'SOC', meaning: 'Standard Obstacle Course (timed).' },
          { term: 'Route March', meaning: 'Long march with full field pack.' },
        ],
      },
      {
        id: 'in-the-field',
        title: 'In The Field',
        proTip: 'Outfield means no comforts — pack baby wipes, you won\'t shower.',
        xp: 35,
        cards: [
          { term: 'Outfield', meaning: 'Training in the field/jungle.' },
          { term: 'Recce', meaning: 'Reconnaissance — scout ahead.' },
        ],
      },
    ],
  },
  {
    id: 'admin-speak',
    order: 6,
    title: 'Admin Speak',
    icon: '📋',
    blurb: 'Booking in, booking out, and the cookhouse.',
    xp: 50,
    lessons: [
      {
        id: 'camp-routine',
        title: 'Camp Routine',
        proTip: 'Always book in on time — being late ("status late") gets you charged.',
        xp: 25,
        cards: [
          { term: 'Book In', meaning: 'Report back to camp.' },
          { term: 'Book Out', meaning: 'Leave camp to go home.' },
          { term: 'Cookhouse', meaning: 'The camp dining hall.' },
          { term: 'Admin Time', meaning: 'Personal time to shower, wash, rest.' },
        ],
      },
    ],
  },
]

/* ---------- quizQuestions (scenario-framed, keyed by module) ---------- */
export const quizQuestions = {
  'basic-commands': [
    {
      id: 'q1',
      speaker: 'Your sergeant shouts',
      scenario: '"Later kena tekan!"',
      question: 'What should you expect?',
      options: ['A reward for good work', 'Tough physical punishment', 'Extra book-out time', 'A change of uniform'],
      correctIndex: 1,
      feedback: '"Tekan" means to be punished or put through tough PT. Brace yourself.',
    },
    {
      id: 'q2',
      speaker: 'The commander orders',
      scenario: '"Knock it down 20!"',
      question: 'What are you being told to do?',
      options: ['Knock on 20 doors', 'Do 20 push-ups', 'Run 20 rounds', 'Pack in 20 minutes'],
      correctIndex: 1,
      feedback: '"Knock it down" is the order to do push-ups as punishment.',
    },
    {
      id: 'q3',
      speaker: 'Over the PA system',
      scenario: '"All recruits, fall in at the parade square!"',
      question: 'What do you do?',
      options: ['Lie down to rest', 'Assemble in formation', 'Return to the bunk', 'Start the obstacle course'],
      correctIndex: 1,
      feedback: '"Fall in" means assemble in formation. Move fast.',
    },
  ],
  'rank-structure': [
    {
      id: 'q1',
      speaker: 'You greet a Warrant Officer',
      scenario: 'He walks past your bunk in the morning.',
      question: 'How should you address him?',
      options: ['"Morning, Sir!"', '"Morning, Encik!"', '"Morning, Sergeant!"', '"Morning, Recruit!"'],
      correctIndex: 1,
      feedback: 'Warrant Officers are addressed as "Encik" out of respect.',
    },
    {
      id: 'q2',
      speaker: 'A friend tells you',
      scenario: '"The OC is doing a spot check now."',
      question: 'Who is coming?',
      options: ['The cookhouse chef', 'The Officer Commanding the company', 'Another recruit', 'A regular soldier'],
      correctIndex: 1,
      feedback: 'OC = Officer Commanding, the officer in charge of your company.',
    },
  ],
  'common-phrases': [
    {
      id: 'q1',
      speaker: 'Your bunkmate complains',
      scenario: '"Why I always kena arrow one?"',
      question: 'What happened to him?',
      options: ['He got promoted', 'He keeps getting assigned extra tasks', 'He got injured', 'He booked out early'],
      correctIndex: 1,
      feedback: 'To "kena arrow" is to be (often unfairly) assigned extra work.',
    },
    {
      id: 'q2',
      speaker: 'A sergeant mutters',
      scenario: '"This one always wayang when officer around."',
      question: 'What is the person doing?',
      options: ['Watching a show', 'Pretending to work hard for show', 'Sleeping on duty', 'Cooking rations'],
      correctIndex: 1,
      feedback: '"Wayang" means to put on a performance of hard work for superiors.',
    },
    {
      id: 'q3',
      speaker: 'Your buddy whispers',
      scenario: '"Eh, I got lobang for early book out."',
      question: 'What does he have?',
      options: ['A punishment', 'A good opportunity or tip', 'A field pack', 'An injury'],
      correctIndex: 1,
      feedback: '"Lobang" is a useful opportunity, tip, or connection.',
    },
  ],
  'equipment-terms': [
    {
      id: 'q1',
      speaker: 'The storeman says',
      scenario: '"Draw your field pack and mess tin from the store."',
      question: 'What are you collecting?',
      options: ['A rifle and helmet', 'A backpack and a ration container', 'A uniform and boots', 'A map and compass'],
      correctIndex: 1,
      feedback: 'Field pack = heavy backpack; mess tin = metal container to cook/eat rations.',
    },
    {
      id: 'q2',
      speaker: 'At the gate the guard says',
      scenario: '"Show me your 11B."',
      question: 'What does he want?',
      options: ['Your phone', 'Your SAF identity card', 'Your meal card', 'Your book-out chit'],
      correctIndex: 1,
      feedback: 'The 11B is your SAF identity card — carry it at all times.',
    },
  ],
  'exercise-lingo': [
    {
      id: 'q1',
      speaker: 'Your commander announces',
      scenario: '"Three days outfield starting tomorrow."',
      question: 'What does this mean?',
      options: ['Three days of leave', 'Training in the field with no camp comforts', 'Three days at the cookhouse', 'Three IPPT attempts'],
      correctIndex: 1,
      feedback: '"Outfield" is field/jungle training — no showers, no beds, pack accordingly.',
    },
    {
      id: 'q2',
      speaker: 'A senior advises',
      scenario: '"Better train hard, IPPT next week."',
      question: 'What is IPPT?',
      options: ['A parade rehearsal', 'A physical fitness test', 'An inspection', 'A cookhouse duty'],
      correctIndex: 1,
      feedback: 'IPPT = Individual Physical Proficiency Test: push-ups, sit-ups and a 2.4km run.',
    },
  ],
  'admin-speak': [
    {
      id: 'q1',
      speaker: 'The duty sergeant reminds you',
      scenario: '"Book in by 2359 on Sunday."',
      question: 'What must you do?',
      options: ['Leave camp by midnight', 'Report back to camp by 11:59pm', 'Finish a book by Sunday', 'Reserve a bunk'],
      correctIndex: 1,
      feedback: '"Book in" means report back to camp — here, by 11:59pm Sunday.',
    },
    {
      id: 'q2',
      speaker: 'Your mate calls out',
      scenario: '"Fall in at the cookhouse for dinner!"',
      question: 'Where are you going?',
      options: ['The armoury', 'The camp dining hall', 'The parade square', 'The medical centre'],
      correctIndex: 1,
      feedback: 'The cookhouse is the camp canteen / dining hall.',
    },
  ],
}

/* ---------- translationExamples (worked examples for the Translator) ---------- */
export const translationExamples = [
  {
    input: 'Eh bro, later kena tekan because someone never stand by bed.',
    output: 'Hey friend, later we\'ll get tough punishment because someone did not stand at attention by their bunk for inspection.',
  },
  {
    input: 'Don\'t chao keng lah, just book in on time and don\'t kena arrow.',
    output: 'Don\'t fake being sick — just report back to camp on time and don\'t get assigned extra tasks.',
  },
  {
    input: 'The encik say IPPT confirm plus chop next week, better train.',
    output: 'The Warrant Officer says the physical fitness test is definitely happening next week, so you should train.',
  },
]

/* ---------- badge catalogue ---------- */
export const badges = [
  { id: 'first-steps', emoji: '🥾', title: 'First Steps', desc: 'Complete your first lesson.', unlocked: true },
  { id: 'sharp-shooter', emoji: '🎯', title: 'Sharp Shooter', desc: 'Score a perfect quiz.', unlocked: true },
  { id: 'streak-5', emoji: '🔥', title: 'On Fire', desc: 'Keep a 5-day streak.', unlocked: true },
  { id: 'commando', emoji: '🪖', title: 'Commando', desc: 'Finish the Basic Commands module.', unlocked: true },
  { id: 'linguist', emoji: '🗣️', title: 'Bunk Linguist', desc: 'Learn 25 slang terms.', unlocked: false },
  { id: 'rank-up', emoji: '🎖️', title: 'Rank Up', desc: 'Finish Rank & Structure.', unlocked: false },
  { id: 'field-ready', emoji: '🎒', title: 'Field Ready', desc: 'Finish Equipment Terms.', unlocked: false },
  { id: 'ns-ready', emoji: '🏅', title: 'NS Ready', desc: 'Reach 100% NS Readiness.', unlocked: false },
]

/* ---------- userProgress (initial seed) ---------- */
export const initialProgress = {
  goal: 'Regular',
  readiness: 30,
  streak: 5,
  totalXp: 180,
  perfectScores: 2,
  completedModules: ['basic-commands'],
  completedLessons: ['attention-parade-rest', 'punishment-commands'],
  weeklyActivity: [20, 40, 0, 60, 30, 50, 30], // XP per day, Mon–Sun
  moduleProgress: {
    'basic-commands': 100,
    'rank-structure': 30,
    'common-phrases': 0,
    'equipment-terms': 0,
    'exercise-lingo': 0,
    'admin-speak': 0,
  },
}

export const goalOptions = [
  { id: 'Casual', label: 'Casual', minutes: 5, desc: '5 min/day — ease into the lingo.', emoji: '🌱' },
  { id: 'Regular', label: 'Regular', minutes: 10, desc: '10 min/day — steady progress.', emoji: '⚡' },
  { id: 'Serious', label: 'Serious', minutes: 20, desc: '20 min/day — book in fully prepared.', emoji: '🔥' },
]
