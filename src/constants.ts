import { Topic } from './types';

export const TOPICS: Topic[] = [
  {
    id: 'topic1',
    title: 'Refeeding Syndrome',
    texts: {
      human: {
        id: 't1h',
        title: 'Refeeding Syndrome (Human)',
        type: 'human',
        content: `Refeeding syndrome can happen when somebody who is malnourished begins feeding again. Malnourished means your body is deprived of nutrients. When your body tries to metabolize nutrients again, severe shifts — related to electrolyte deficiencies — can occur in your body’s chemistry. They can cause dangerous complications, affecting your muscles, lungs, heart and brain. When your body is starved for nutrients, it makes certain changes to adapt. It changes its metabolism — the way it converts food into energy. Instead of carbohydrates from food, your body metabolizes its own fat and muscle. Metabolism also slows down. Your resting metabolic rate — how much energy you spend while at rest — reduces by as much as 20%. This type of metabolism takes fewer resources. It doesn't use micronutrients — vitamins, minerals and electrolytes — the way normal metabolism does. But when refeeding begins, normal carbohydrate metabolism resumes. Your body reaches deep into its pockets for the micronutrients it needs to get the job done. If your stores are too low, now is when you will feel the effects.`
      },
      ai: {
        id: 't1a',
        title: 'Refeeding Syndrome (AI)',
        type: 'ai',
        content: `Refeeding syndrome develops when a person who has been lacking proper nutrition begins eating again. In a malnourished state, the body adjusts by slowing its metabolism and relying on fat and muscle instead of carbohydrates for energy. This adaptation reduces the need for essential micronutrients such as vitamins and electrolytes. However, once food intake resumes, the body shifts back to processing carbohydrates. This sudden change increases the demand for micronutrients, which can overwhelm the body if its nutrient stores are depleted. As a result, significant electrolyte imbalances may occur, leading to serious complications that can impact vital organs, including the heart, lungs, muscles, and brain.`
      }
    },
    questions: [
      {
        id: 't1q1',
        type: 'comprehension',
        text: 'Why can refeeding syndrome become dangerous after a malnourished person starts eating again?',
        options: [
          'Because the body cannot digest food anymore',
          'Because the body suddenly needs nutrients that are not available',
          'Because metabolism permanently stops',
          'Because fat and muscle increase too quickly'
        ],
        correctAnswer: 'Because the body suddenly needs nutrients that are not available'
      },
      {
        id: 't1q2',
        type: 'inference',
        text: "What is the main purpose of the body's metabolic slowdown during starvation?",
        options: [
          'To improve digestion efficiency',
          'To store extra carbohydrates',
          'To conserve energy and resources',
          'To increase vitamin usage'
        ],
        correctAnswer: 'To conserve energy and resources'
      },
      {
        id: 't1q3',
        type: 'critical',
        text: 'Which assumption explains why refeeding causes problems in malnourished individuals?',
        options: [
          'The body has unlimited nutrient reserves',
          'The body cannot switch energy sources',
          'The body’s stored micronutrients may be insufficient',
          'The body prefers fat over carbohydrates'
        ],
        correctAnswer: 'The body’s stored micronutrients may be insufficient'
      },
      {
        id: 't1q4',
        type: 'critical',
        text: 'If a patient has normal electrolyte levels before refeeding, what is most likely to happen?',
        options: [
          'They will definitely develop refeeding syndrome',
          'They are less likely to experience severe complications',
          'Their metabolism will stop changing',
          'They will not need carbohydrates'
        ],
        correctAnswer: 'They are less likely to experience severe complications'
      },
      {
        id: 't1q5',
        type: 'critical',
        text: 'Which process is MOST directly responsible for the complications of refeeding syndrome?',
        options: [
          'Increased fat breakdown',
          'Decreased heart rate',
          'Rapid electrolyte shifts during renewed metabolism',
          'Reduced oxygen intake'
        ],
        correctAnswer: 'Rapid electrolyte shifts during renewed metabolism'
      }
    ]
  },
  {
    id: 'topic2',
    title: 'Mount Tambora Eruption',
    texts: {
      human: {
        id: 't2h',
        title: 'Mount Tambora (Human)',
        type: 'human',
        content: `The eruption of Mount Tambora in Indonesia in 1815 triggered a change in the global climate. The heavier material fell to the ground and the ocean’s surface. However, when lighter particulates reached the stratosphere, they spread out and created an aerosol cloud the size of Australia.The cloud blocked sunlight from reaching the earth and changed the global climate by 2-7 degrees Fahrenheit, the effects of which devastated much of the world in what should have been the summer of 1816. Crops failed across Europe and the U.S. due to the cold or lack of sunshine causing grain and oat prices to soar, torrential rains flooded crops in Ireland, novel strains of cholera killed millions in India, crime became rampant, and people starved in many countries. Early European settlers were drawn to the temperate climate of the eastern U.S. as spring rains and summer warmth created the perfect recipe for productive farming. Plentiful yields fed them throughout the bitter winters and were key to their survival. But in 1816, summer never came to the New England states. May frost killed off most of the crops in New York, Massachusetts, New Hampshire, and Vermont. In June, heavy snow smothered the ground in Albany, New York and Dennysville, Maine, while frost persisted for five consecutive nights in Cape May, New Jersey. The relentless cold weather extended into late summer, in what would have normally been harvest season. In July, lakes and rivers remained frozen as far south as northwestern Pennsylvania, while frost remained in Virginia into late August. Temperatures dipped from above-normal summer temperatures to near-freezing within mere hours. All because of a volcanic eruption on the other side of the world.`
      },
      ai: {
        id: 't2a',
        title: 'Mount Tambora (AI)',
        type: 'ai',
        content: `The 1815 eruption of Mount Tambora had far-reaching effects on Earth’s climate. While heavier volcanic debris settled quickly, lighter particles rose into the upper atmosphere and formed an aerosol cloud that spread across the globe. This cloud reduced the amount of sunlight reaching the Earth, leading to a significant drop in global temperatures.As a result, the year 1816 experienced severe and unusual weather conditions. Crops failed in many regions due to cold temperatures and insufficient sunlight, causing food prices to rise and contributing to widespread hunger. In some areas, flooding and disease further worsened living conditions. In the eastern United States, where agriculture depended on predictable seasonal weather, the disruption was especially damaging. Frost, snow, and prolonged cold temperatures occurred during months that were normally warm, destroying crops and preventing normal harvests. These extreme conditions, all linked to the volcanic eruption, created widespread hardship across multiple continents.`
      }
    },
    questions: [
      {
        id: 't2q1',
        type: 'comprehension',
        text: 'How did the volcanic eruption lead to widespread starvation?',
        options: [
          'Lava directly destroyed farms worldwide',
          'The eruption reduced sunlight, which led to crop failure',
          'The eruption increased rainfall everywhere',
          'The eruption caused immediate temperature increases'
        ],
        correctAnswer: 'The eruption reduced sunlight, which led to crop failure'
      },
      {
        id: 't2q2',
        type: 'inference',
        text: 'Why did a volcanic eruption in Indonesia affect regions like Europe and the United States?',
        options: [
          'Because lava traveled across continents',
          'Because people spread the effects through trade',
          'Because particles in the atmosphere spread globally',
          'Because oceans carried heat away'
        ],
        correctAnswer: 'Because particles in the atmosphere spread globally'
      },
      {
        id: 't2q3',
        type: 'critical',
        text: 'What was the key factor that caused temperatures to drop after the eruption?',
        options: [
          'Increased ocean currents',
          'Blocked sunlight from atmospheric particles',
          'Increased wind speeds',
          'Reduced volcanic activity'
        ],
        correctAnswer: 'Blocked sunlight from atmospheric particles'
      },
      {
        id: 't2q4',
        type: 'critical',
        text: 'If a similar eruption happened today, which sector would MOST likely be immediately affected?',
        options: [
          'Space exploration',
          'Agriculture',
          'Internet communication',
          'Transportation laws'
        ],
        correctAnswer: 'Agriculture'
      },
      {
        id: 't2q5',
        type: 'critical',
        text: 'Why were early settlers in the eastern United States especially vulnerable to the climate changes?',
        options: [
          'They relied heavily on consistent seasonal farming',
          'They had advanced food storage systems',
          'They imported most of their food',
          'They lived in warmer climates year-round'
        ],
        correctAnswer: 'They relied heavily on consistent seasonal farming'
      }
    ]
  }
];
