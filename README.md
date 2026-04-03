# Sidequest 🎮

Sidequest is a gamified productivity web app where users complete real-life missions to earn XP, level up, and maintain streaks.

## Features

- Secure sign up / login using hashed passwords (`bcryptjs`) and JWT authentication.
- Dashboard with XP, level, streak, and visual XP progress bar.
- Quest system with categories, difficulty, XP rewards, and completion state.
- AI quest generation via OpenAI API (with automatic mock fallback).
- Search and filter quests by category and difficulty.
- Persistent user progress using JSON storage (`server/data/db.json`).
- Modern dark theme, responsive layout, and smooth animations.

## Project Structure

```
/client
  index.html
  style.css
  script.js
/server
  server.js
  .env.example
  /routes
    authRoutes.js
    questRoutes.js
  /utils
    authMiddleware.js
    db.js
    questGenerator.js
  /data
    db.json
```

## Run Locally

### 1) Install dependencies

```bash
cd server
npm install
```

### 2) Configure environment

```bash
cp .env.example .env
```

Open `.env` and set:

- `JWT_SECRET` to a strong random value.
- `OPENAI_API_KEY` (optional). If missing, Sidequest uses built-in mock quest generation.

### 3) Start the app

```bash
npm start
```

Server runs at: `http://localhost:4000`

The Express app serves the frontend from `/client`, so you can open the URL directly.

## API Endpoints

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/profile`
- `GET /api/quests?category=&difficulty=&q=`
- `POST /api/quests/generate`
- `POST /api/quests/seed`
- `POST /api/quests/:questId/complete`

## Notes

- Level formula: `floor(XP / 100) + 1`
- Streak rule: completing at least one quest daily increases streak; missing a day resets it.
- JSON storage was selected to keep setup beginner-friendly. Migrating to MongoDB later is straightforward by replacing the DB utility.
