import { TextContent, Question } from './types';

export const PROBLEM_CATEGORIES = [
  { id: 'EVIDENCE', name: 'Lack of Evidence', definition: 'Assertions without supporting data or research' },
  { id: 'LOGIC', name: 'Logical Gap', definition: 'Incomplete reasoning in the A→B transition' },
  { id: 'ASSUMPTION', name: 'Unstated Assumption', definition: 'Implicit premises that are not explicitly stated' },
  { id: 'SCOPE', name: 'Unclear Scope', definition: 'Overgeneralization or limited applicability' },
  { id: 'MISSING_INFO', name: 'Missing Information', definition: 'Lack of critical background context' },
  { id: 'VAGUE', name: 'Vague Language', definition: 'Ambiguous terms or unclear metaphors' },
] as const;

export const TEXTS: TextContent[] = [
  {
    id: 'refeeding-main',
    topic: 'refeeding_syndrome',
    version: 'A',
    content: `Refeeding syndrome can occur when someone who has not eaten enough for a long time starts eating again. During starvation, the body changes how it gets energy, and some important minerals may become low.
When food is eaten again, the body reacts, and these minerals may move quickly, which can cause health problems like heart issues, muscle weakness, or confusion. Many patients might face these problems if care is not taken. Doctors usually give small amounts of food, check the body, and sometimes give supplements. Watching how the body responds can help reduce risks, though the exact causes are not always explained.`,
    sentences: [
      { id: '1', text: 'Refeeding syndrome can occur when someone who has not eaten enough for a long time starts eating again.' },
      { id: '2', text: 'During starvation, the body changes how it gets energy, and some important minerals may become low.' },
      { id: '3', text: 'When food is eaten again, the body reacts, and these minerals may move quickly, which can cause health problems like heart issues, muscle weakness, or confusion.' },
      { id: '4', text: 'Many patients might face these problems if care is not taken.' },
      { id: '5', text: 'Doctors usually give small amounts of food, check the body, and sometimes give supplements.' },
      { id: '6', text: 'Watching how the body responds can help reduce risks, though the exact causes are not always explained.' }
    ]
  },
  {
    id: 'summer-1816',
    topic: 'year_without_summer',
    version: 'A',
    content: `The Year Without a Summer refers to 1816, when unusual weather caused problems for many regions in Europe and North America. During this time, crops did not grow well, and people faced food shortages. The event has often been linked to a volcanic eruption that happened earlier.
The eruption released ash into the atmosphere, and this affected the environment in different ways. After that, many regions experienced colder weather, unusual rain, and difficulties with farming. These changes made it harder for people to produce food and maintain stable living conditions.
Many historical accounts describe rising food prices and hardship among populations. In some places, people struggled to find enough food, and social conditions became more difficult. This event is often remembered as an example of how natural events can influence human societies, although the exact processes are not always clearly described.`,
    sentences: [
      { id: '1', text: 'The Year Without a Summer refers to 1816, when unusual weather caused problems for many regions in Europe and North America.' },
      { id: '2', text: 'During this time, crops did not grow well, and people faced food shortages.' },
      { id: '3', text: 'The event has often been linked to a volcanic eruption that happened earlier.' },
      { id: '4', text: 'The eruption released ash into the atmosphere, and this affected the environment in different ways.' },
      { id: '5', text: 'After that, many regions experienced colder weather, unusual rain, and difficulties with farming.' },
      { id: '6', text: 'These changes made it harder for people to produce food and maintain stable living conditions.' },
      { id: '7', text: 'Many historical accounts describe rising food prices and hardship among populations.' },
      { id: '8', text: 'In some places, people struggled to find enough food, and social conditions became more difficult.' },
      { id: '9', text: 'This event is often remembered as an example of how natural events can influence human societies, although the exact processes are not always clearly described.' }
    ]
  }
];

export const QUESTIONS: Question[] = [
  {
    id: 'q1',
    textId: 'refeeding-main',
    type: 'MC',
    instruction: 'Which sentence best describes the full causal chain of mineral depletion leading to health problems?',
    options: [
      '“During starvation, the body changes how it gets energy, and some important minerals may become low.”',
      '“When food is eaten again, the body reacts, and these minerals may move quickly, which can cause health problems like heart issues, muscle weakness, or confusion.”',
      '“Doctors usually give small amounts of food, check the body, and sometimes give supplements.”',
      '“Paying attention to how the body responds can help reduce risks.”'
    ],
    correctAnswer: 1,
    reasoning: 'Only B clearly connects mineral movement to health problems. A mentions mineral loss but does not explain consequences; C and D describe interventions or general advice, not causality.'
  },
  {
    id: 'q2',
    textId: 'refeeding-main',
    type: 'MC',
    instruction: 'Which option best describes how the text explains the concept of “minerals”?',
    options: [
      'The text clearly explains which minerals are involved and their function.',
      'The text mentions minerals but does not explain what they do.',
      'The text does not mention minerals at all.'
    ],
    correctAnswer: 1,
    reasoning: 'The text mentions minerals but does not explain their roles in the body, so the concept is referenced but not clarified.'
  },
  {
    id: 'q3',
    textId: 'refeeding-main',
    type: 'CLICK_SENTENCE',
    instruction: 'Click the sentence(s) in the text that lack necessary quantitative data to support the risk claims.',
    correctAnswer: ['4'],
    reasoning: 'This sentence claims risk but does not provide percentages, studies, or specific evidence. Users can also click other sentences mentioning “risks” without numbers to receive partial credit.'
  },
  {
    id: 'q4',
    textId: 'refeeding-main',
    type: 'CLICK_PAIR',
    instruction: 'Click the pair of sentences that have a logical jump or missing connection.',
    correctAnswer: ['3', '5'],
    reasoning: 'The text jumps from mineral movement to intervention without explaining why or how the intervention addresses the previous problem. Users can also mark other logical gaps.'
  },
  {
    id: 'q5',
    textId: 'refeeding-main',
    type: 'CLICK_SENTENCE',
    instruction: 'Click the sentence(s) that omit key information necessary to understand the cause-and-effect fully.',
    correctAnswer: ['2'],
    reasoning: 'This sentence mentions mineral loss but does not explain why minerals decrease, what triggers the change, or the consequences. Users can mark additional sentences they believe are missing key information for partial credit.'
  },
  // New Article: Year Without a Summer
  {
    id: 's1',
    textId: 'summer-1816',
    type: 'MC',
    instruction: 'Which sentence best explains the cause-and-effect relationship behind the unusual weather during the Year Without a Summer?',
    options: [
      '“In 1816, many regions experienced cold temperatures and crop failures.”',
      '“A volcanic eruption released large amounts of ash into the atmosphere, which blocked sunlight and caused global temperatures to drop.”',
      '“People faced food shortages and economic difficulties.”',
      '“The event is remembered as an unusual historical period.”'
    ],
    correctAnswer: 1,
    reasoning: 'Only B clearly connects the cause (volcanic eruption) to the effect (blocked sunlight → temperature drop). The others describe outcomes or general context without causal explanation.'
  },
  {
    id: 's2',
    textId: 'summer-1816',
    type: 'MC',
    instruction: 'How does the text explain the concept of “ash in the atmosphere”?',
    options: [
      'The text clearly explains what ash is and how it affects sunlight and temperature.',
      'The text mentions ash but does not clearly explain how it affects the climate.',
      'The text does not mention ash or the atmosphere at all.'
    ],
    correctAnswer: 1,
    reasoning: 'In the weaker version, ash is mentioned but its mechanism (blocking sunlight, affecting radiation) is not clearly explained, so the concept is referenced but not clarified.'
  },
  {
    id: 's3',
    textId: 'summer-1816',
    type: 'CLICK_SENTENCE',
    instruction: 'Click the sentence(s) that make claims about impact or severity without providing specific data or evidence.',
    correctAnswer: ['7', '8'],
    reasoning: 'These sentences describe rising food prices, hardship, and struggling for food, but provide no numbers, dates, or measurable evidence (e.g., crop yield percentages, death rates).'
  },
  {
    id: 's4',
    textId: 'summer-1816',
    type: 'CLICK_PAIR',
    instruction: 'Click the pair of sentences where there is a logical jump or missing explanation between them.',
    correctAnswer: ['4', '5'],
    reasoning: 'The connection is incomplete because the text does not explain how ash leads to cooling (missing step: blocking sunlight → reduced temperature). This creates a logical gap in the chain of reasoning.'
  },
  {
    id: 's5',
    textId: 'summer-1816',
    type: 'CLICK_SENTENCE',
    instruction: 'Click the sentence(s) that omit key information needed to fully understand the event.',
    correctAnswer: ['4'],
    reasoning: 'This sentence identifies an event but does not specify which volcano, when it happened, or how much ash was released. It lacks essential details needed for full understanding.'
  }
];
