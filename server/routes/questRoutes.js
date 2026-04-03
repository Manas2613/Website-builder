const express = require('express');
const { nanoid } = require('nanoid');
const authMiddleware = require('../utils/authMiddleware');
const { getUsers, saveUsers } = require('../utils/db');
const { generateQuest, generateMockQuest } = require('../utils/questGenerator');

const router = express.Router();

const MS_IN_DAY = 24 * 60 * 60 * 1000;

function getLevel(xp) {
  return Math.floor(xp / 100) + 1;
}

function getUser(users, userId) {
  return users.find((entry) => entry.id === userId);
}

function normalizeDate(date) {
  const utcDate = new Date(date);
  return new Date(Date.UTC(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate()));
}

function updateStreak(user) {
  if (!user.lastCompletedDate) {
    user.streak = 1;
    user.lastCompletedDate = new Date().toISOString();
    return;
  }

  const lastDate = normalizeDate(user.lastCompletedDate);
  const nowDate = normalizeDate(new Date());
  const diffDays = Math.floor((nowDate - lastDate) / MS_IN_DAY);

  if (diffDays === 0) {
    return;
  }

  if (diffDays === 1) {
    user.streak += 1;
  } else {
    user.streak = 1;
  }

  user.lastCompletedDate = new Date().toISOString();
}

router.use(authMiddleware);

router.get('/profile', (req, res) => {
  const users = getUsers();
  const user = getUser(users, req.userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  return res.status(200).json({
    id: user.id,
    username: user.username,
    email: user.email,
    xp: user.xp,
    level: getLevel(user.xp),
    streak: user.streak,
    completedQuests: user.completedQuests,
    quests: user.quests,
  });
});

router.get('/quests', (req, res) => {
  const { category, difficulty, q } = req.query;

  const users = getUsers();
  const user = getUser(users, req.userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  let filtered = [...user.quests];

  if (category && category !== 'All') {
    filtered = filtered.filter((quest) => quest.category === category);
  }

  if (difficulty && difficulty !== 'All') {
    filtered = filtered.filter((quest) => quest.difficulty === difficulty);
  }

  if (q) {
    const needle = q.toLowerCase();
    filtered = filtered.filter(
      (quest) =>
        quest.title.toLowerCase().includes(needle) ||
        quest.description.toLowerCase().includes(needle)
    );
  }

  return res.status(200).json(filtered);
});

router.post('/quests/generate', async (req, res) => {
  const users = getUsers();
  const user = getUser(users, req.userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const questPayload = await generateQuest();
  const quest = {
    id: nanoid(),
    ...questPayload,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  user.quests.unshift(quest);

  if (user.quests.length > 50) {
    user.quests = user.quests.slice(0, 50);
  }

  saveUsers(users);

  return res.status(201).json(quest);
});

router.post('/quests/seed', (req, res) => {
  const users = getUsers();
  const user = getUser(users, req.userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  if (user.quests.length > 0) {
    return res.status(200).json(user.quests);
  }

  const starterQuests = Array.from({ length: 5 }).map(() => ({
    id: nanoid(),
    ...generateMockQuest(),
    completed: false,
    createdAt: new Date().toISOString(),
  }));

  user.quests = starterQuests;
  saveUsers(users);

  return res.status(201).json(starterQuests);
});

router.post('/quests/:questId/complete', (req, res) => {
  const users = getUsers();
  const user = getUser(users, req.userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const quest = user.quests.find((entry) => entry.id === req.params.questId);

  if (!quest) {
    return res.status(404).json({ message: 'Quest not found.' });
  }

  if (quest.completed) {
    return res.status(400).json({ message: 'Quest already completed.' });
  }

  quest.completed = true;
  quest.completedAt = new Date().toISOString();

  user.xp += quest.xpReward;
  user.completedQuests += 1;
  updateStreak(user);

  saveUsers(users);

  return res.status(200).json({
    quest,
    profile: {
      xp: user.xp,
      level: getLevel(user.xp),
      streak: user.streak,
      completedQuests: user.completedQuests,
    },
  });
});

module.exports = router;
