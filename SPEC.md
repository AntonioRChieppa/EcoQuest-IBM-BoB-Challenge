# SPEC.md - Eco-Quest Lean Architecture

## 1. Database Model (Sequelize)
**Model 1: User**
- `id`: UUID (Primary Key)
- `username`: STRING (Unique)
- `password_hash`: STRING (bcrypt hash, NOT NULL)
- `age`: INTEGER
- `gender`: STRING
- `level`: INTEGER (default 1, max 15)
- `xp_total`: INTEGER (default 0)
- `xp_current_level`: INTEGER (default 0) — resets to 0+overflow on level-up
- `rpg_class`: STRING (default "Recluta Inquinante")
- `quest_generates_today`: INTEGER (default 0) — resets every new session
- `quest_generates_date`: DATEONLY — date of last generate, used to reset counter

**Model 2: Quest**
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key)
- `title`: STRING
- `description`: TEXT
- `type`: STRING ('daily' or 'weekly')
- `xp_reward`: INTEGER
- `status`: STRING ('active', 'completed', 'dismissed')

## 2. RPG Level Ladder (15 Livelli)

### Level-Up threshold: `xp_current_level >= XP_PER_LEVEL (500)`
- `xp_total` — cumulative lifetime XP, never resets, used for Loot Chest.
- `xp_current_level` — XP within current level only; resets to overflow on level-up.

### XP per quest type (fixed)
| Quest Type | XP Reward |
|------------|-----------|
| daily      | 100 XP    |
| weekly     | 300 XP    |

### Rank (Grado) — changes at milestone levels, NOT every level
A rank upgrade has specific level requirements. Between milestone levels, only the level number increases.

| Grado | Level Required | RPG Class                   |
|-------|----------------|-----------------------------|
| 1     | Lv 1           | Recluta Inquinante          |
| 2     | Lv 3           | Apprendista Green           |
| 3     | Lv 6           | Esploratore Sostenibile     |
| 4     | Lv 10          | Guardiano dell'Energia      |
| 5     | Lv 15          | Campione dell'Agenda 2030   |

Between milestones, rpg_class shows "Classe [N] - [CurrentRank]" to indicate progress within a rank.

### Quest Board Layout
- Always shows **3 daily** + **3 weekly** active quests (6 total).
- Daily: simple, quick tasks — 100 XP each.
- Weekly: complex, time-intensive tasks — 300 XP each.
- Completed quests are hidden and replaced by unseen quests on next generate.
- Generate button max **3 uses per session** (counter shown in UI).

## 3. Backend Routes (Express)
- `POST /api/auth/register`: register with username, password, age, gender.
- `POST /api/auth/login`: login, returns User object (no password_hash).
- `POST /api/generate-quests`:
  - Max 3 calls per session (tracked via `quest_generates_today` + date).
  - Fetches unseen quest titles from DB to avoid repeating completed ones.
  - Calls **QuestAI Agent** to generate 3 daily + 3 weekly quests.
  - Returns quests + `generates_left` counter.
- `POST /api/claim-quest`:
  - THE KILLER FEATURE. Awards fixed XP: 100 (daily) or 300 (weekly).
  - Level-Up: `xp_current_level >= 500` → level++, rpg_class updates at milestones.
  - Returns updated User, Quest, `leveled_up`, `rank_up` flags.
- `GET /api/quests/:user_id`: returns active quests.
- `GET /api/chest-stats/:user_id`: returns euro_saved, co2_saved_kg, pop_comparison.

## 4. Frontend (AngularJS + Sass)
- `frontend/styles/main.scss` compiled to `frontend/dist/style.css`.

**View 1: Auth** — Register/Login tabs.

**View 2: Dashboard**
- HUD: username, rpg_class, level (1-15), xp bar (xp_current_level/500), Loot Chest button.
- Level-Up banner on level change; Rank-Up banner when rpg_class changes.
- Quest Board split in two sections: DAILY (3) and WEEKLY (3).
- Generate button shows remaining uses: "🎲 Genera (3 rimaste)" → disabled at 0.
- Completed quests are hidden from the board (filtered client-side).
