# AGENTS.md
This file provides global guidelines for AI agents working on this repository.

## Project Context
Project: Eco-Quest (Agenda 2030 - Goals 7 & 13)
Goal: A lean RPG web app highlighting AI quest generation and a gamified Level-Up system.

## Tech Stack Rules
- **Backend:** Node.js with Express.
- **Database:** Sequelize with SQLite (use a local `database.sqlite` file).
- **Frontend:** AngularJS (1.x). Keep it in a `public` folder served statically by Express.
- **Styling:** Sass (.scss). Code must be written in `styles/main.scss` and compiled to `public/style.css`.

## Coding Philosophy
- FOCUS ON THE CORE LOOP: Generate quests, claim them, add XP, level up, and show the chest.
- No complex authentication. Use a simple pseudo-login saving the `user_id` in `localStorage`.
- For the first iteration, MOCK the AI responses in the Express routes. We will plug the real LLM API in the second iteration.