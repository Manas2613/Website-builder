const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const questRoutes = require('./routes/questRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

if (!process.env.JWT_SECRET) {
  console.warn('Warning: JWT_SECRET not set. Falling back to a weak development secret.');
  process.env.JWT_SECRET = 'dev-secret-change-me';
}

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api', questRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'sidequest-api' });
});

app.use(express.static(path.join(__dirname, '..', 'client')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Sidequest server running on http://localhost:${PORT}`);
});
