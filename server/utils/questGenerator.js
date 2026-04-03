const categories = ['Fitness', 'Money', 'Learning', 'Social', 'Fun', 'Random'];
const difficulties = {
  Easy: 40,
  Medium: 70,
  Hard: 110,
};

const mockQuestBank = [
  {
    title: '5-Minute Power Walk',
    description: 'Take a brisk 5-minute walk and notice one thing you never saw before in your neighborhood.',
    category: 'Fitness',
    difficulty: 'Easy',
  },
  {
    title: 'Micro-Investment Sprint',
    description: 'Research one beginner-friendly investment concept and write down 3 key takeaways.',
    category: 'Money',
    difficulty: 'Medium',
  },
  {
    title: 'Teach a Tiny Lesson',
    description: 'Explain something you learned today to a friend, sibling, or voice memo in under 3 minutes.',
    category: 'Learning',
    difficulty: 'Easy',
  },
  {
    title: 'Kindness Combo',
    description: 'Send one encouraging message and compliment one person in real life today.',
    category: 'Social',
    difficulty: 'Medium',
  },
  {
    title: 'Analog Adventure',
    description: 'Spend 20 minutes doing a no-screen fun activity: drawing, puzzle, journaling, or doodling.',
    category: 'Fun',
    difficulty: 'Easy',
  },
  {
    title: 'Random Courage Roll',
    description: 'Do one thing slightly outside your comfort zone and record how it felt afterward.',
    category: 'Random',
    difficulty: 'Hard',
  },
];

function randomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

async function generateQuestWithOpenAI() {
  const prompt = `Create one real-life side quest as JSON with keys: title, description, category, difficulty.
category must be one of ${categories.join(', ')}.
difficulty must be one of Easy, Medium, Hard.
Keep it positive, actionable, and under 30 words for description.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You generate concise real-life gamified productivity quests.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.9,
    }),
  });

  if (!response.ok) {
    throw new Error('OpenAI request failed');
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  const parsed = JSON.parse(content);

  if (!parsed.title || !parsed.description) {
    throw new Error('Malformed AI quest payload');
  }

  const difficulty = difficulties[parsed.difficulty] ? parsed.difficulty : 'Medium';
  const category = categories.includes(parsed.category) ? parsed.category : 'Random';

  return {
    title: parsed.title,
    description: parsed.description,
    category,
    difficulty,
    xpReward: difficulties[difficulty],
  };
}

function generateMockQuest() {
  const base = randomItem(mockQuestBank);
  const difficulty = base.difficulty || randomItem(Object.keys(difficulties));

  return {
    title: base.title,
    description: base.description,
    category: base.category || randomItem(categories),
    difficulty,
    xpReward: difficulties[difficulty],
  };
}

async function generateQuest() {
  if (process.env.OPENAI_API_KEY) {
    try {
      return await generateQuestWithOpenAI();
    } catch (error) {
      return generateMockQuest();
    }
  }

  return generateMockQuest();
}

module.exports = {
  categories,
  difficulties,
  generateQuest,
  generateMockQuest,
};
