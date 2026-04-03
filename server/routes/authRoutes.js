const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');
const { getUsers, saveUsers } = require('../utils/db');

const router = express.Router();

function createToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'username, email, and password are required.' });
  }

  const users = getUsers();
  const existingUser = users.find((user) => user.email.toLowerCase() === email.toLowerCase());

  if (existingUser) {
    return res.status(409).json({ message: 'Email already in use.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = {
    id: nanoid(),
    username,
    email,
    passwordHash,
    xp: 0,
    streak: 0,
    lastCompletedDate: null,
    completedQuests: 0,
    quests: [],
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  const token = createToken(newUser.id);

  return res.status(201).json({
    token,
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      xp: newUser.xp,
      streak: newUser.streak,
      completedQuests: newUser.completedQuests,
    },
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required.' });
  }

  const users = getUsers();
  const user = users.find((entry) => entry.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const token = createToken(user.id);

  return res.status(200).json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      xp: user.xp,
      streak: user.streak,
      completedQuests: user.completedQuests,
    },
  });
});

module.exports = router;
