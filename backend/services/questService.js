const User     = require('../models/User');
const Quest    = require('../models/Quest');
const questAI  = require('./questAI');
const { Op }   = require('sequelize');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const MAX_LEVEL       = 15;
const XP_PER_LEVEL    = 500;  // XP within a level before advancing
const XP_DAILY        = 100;  // fixed XP for daily quests
const XP_WEEKLY       = 300;  // fixed XP for weekly quests
const MAX_GENERATES   = 8;    // generate-quest calls allowed per session/day (demo)

// ---------------------------------------------------------------------------
// RPG Rank Ladder — grade changes only at milestone levels
// Between milestones the class shows "Lv N · <CurrentRank>"
// ---------------------------------------------------------------------------
const RANK_MILESTONES = [
  { level: 1,  class: 'Recluta Inquinante'        },
  { level: 3,  class: 'Apprendista Green'          },
  { level: 6,  class: 'Esploratore Sostenibile'   },
  { level: 10, class: 'Guardiano dell\'Energia'   },
  { level: 15, class: 'Campione dell\'Agenda 2030' },
];

/**
 * Returns the rpg_class for a given level.
 * Between milestones: "Lv N · <BaseRank>".
 * At a milestone: "<NewRank>".
 */
function getRpgClass(level) {
  // find highest milestone reached
  let current = RANK_MILESTONES[0];
  for (const m of RANK_MILESTONES) {
    if (level >= m.level) current = m;
    else break;
  }
  // exact milestone → just the class name
  if (current.level === level) return current.class;
  // between milestones → annotate with level
  return `Lv ${level} · ${current.class}`;
}

/**
 * Returns true if this level triggers a rank (class name) change.
 */
function isRankUp(level) {
  return RANK_MILESTONES.some((m) => m.level === level);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Today's date as YYYY-MM-DD string */
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Service: generateQuests
// ---------------------------------------------------------------------------

/**
 * Generates 3 daily + 3 weekly quests for the user via QuestAI Agent.
 * - Respects the MAX_GENERATES per day limit.
 * - Excludes titles the user has already seen/completed to avoid repetition.
 * - Returns quests + generates_left counter.
 *
 * @param {string} user_id
 * @returns {Promise<{ quests: Quest[], generates_left: number }>}
 */
async function generateQuests(user_id) {
  const user = await User.findByPk(user_id);
  if (!user) throw Object.assign(new Error('User not found.'), { status: 404 });

  // Reset daily counter if it's a new day
  const today = todayStr();
  if (user.quest_generates_date !== today) {
    user.quest_generates_today = 0;
    user.quest_generates_date  = today;
  }

  if (user.quest_generates_today >= MAX_GENERATES) {
    throw Object.assign(
      new Error(`Hai esaurito le ${MAX_GENERATES} rigenerazioni disponibili oggi.`),
      { status: 429 }
    );
  }

  // Collect titles already seen (completed or active) to pass to QuestAI
  const seenQuests = await Quest.findAll({
    where: { user_id, status: { [Op.in]: ['active', 'completed'] } },
    attributes: ['title'],
  });
  const seenTitles = new Set(seenQuests.map((q) => q.title));

  // Remove currently active quests (will be replaced)
  await Quest.destroy({ where: { user_id, status: 'active' } });

  // QuestAI generates 3 daily + 3 weekly, avoiding already-seen titles
  const { quests: questData } = questAI.generateQuests({
    age:        user.age,
    gender:     user.gender,
    level:      user.level,
    rpg_class:  user.rpg_class,
    seenTitles: Array.from(seenTitles),
  });

  // Override xp_reward with fixed values by type
  const enriched = questData.map((q) => ({
    ...q,
    xp_reward: q.type === 'weekly' ? XP_WEEKLY : XP_DAILY,
    user_id,
  }));

  const quests = await Quest.bulkCreate(enriched);

  // Increment daily counter
  user.quest_generates_today += 1;
  user.quest_generates_date   = today;
  await user.save();

  return {
    quests,
    generates_left: MAX_GENERATES - user.quest_generates_today,
  };
}

// ---------------------------------------------------------------------------
// Service: claimQuest  ← KILLER FEATURE
// ---------------------------------------------------------------------------

/**
 * Marks a quest completed, awards fixed XP, applies level-up + rank-up logic.
 *
 * XP rules:
 *  - xp_reward is always the fixed value (daily=100, weekly=300).
 *  - xp_total grows forever (lifetime, used for Loot Chest).
 *  - xp_current_level resets to overflow on level-up.
 *
 * Rank-Up: rpg_class changes only at milestone levels (3, 6, 10, 15).
 *
 * @param {string} user_id
 * @param {string} quest_id
 * @returns {Promise<{ quest, user, leveled_up: boolean, rank_up: boolean }>}
 */
async function claimQuest(user_id, quest_id) {
  const quest = await Quest.findOne({ where: { id: quest_id, user_id } });
  if (!quest) throw Object.assign(new Error('Quest not found.'), { status: 404 });
  if (quest.status === 'completed') {
    throw Object.assign(new Error('Quest already completed.'), { status: 400 });
  }

  const user = await User.findByPk(user_id);
  if (!user) throw Object.assign(new Error('User not found.'), { status: 404 });

  // 1. Complete the quest
  quest.status = 'completed';
  await quest.save();

  // 2. Award XP (fixed by type, but use stored xp_reward for safety)
  const xp = quest.xp_reward;
  user.xp_total         += xp;
  user.xp_current_level += xp;

  // 3. Level-Up loop with carry-over overflow
  let leveled_up = false;
  let rank_up    = false;
  while (user.level < MAX_LEVEL && user.xp_current_level >= XP_PER_LEVEL) {
    const overflow        = user.xp_current_level - XP_PER_LEVEL;
    user.level           += 1;
    user.xp_current_level = overflow;
    leveled_up            = true;
    if (isRankUp(user.level)) {
      rank_up = true;
    }
  }

  // Update rpg_class after all level-ups
  if (leveled_up) {
    user.rpg_class = getRpgClass(user.level);
  }

  await user.save();

  return { quest, user, leveled_up, rank_up };
}

// ---------------------------------------------------------------------------
// Service: getActiveQuests
// ---------------------------------------------------------------------------

/**
 * Returns all active quests for a user (hidden completed ones client-side).
 */
async function getActiveQuests(user_id) {
  return Quest.findAll({ where: { user_id, status: 'active' } });
}

// ---------------------------------------------------------------------------
// Service: getGeneratesLeft
// ---------------------------------------------------------------------------

/**
 * Returns how many generate-quest calls the user has left today.
 */
async function getGeneratesLeft(user_id) {
  const user = await User.findByPk(user_id);
  if (!user) throw Object.assign(new Error('User not found.'), { status: 404 });
  const today = todayStr();
  if (user.quest_generates_date !== today) return MAX_GENERATES;
  return Math.max(0, MAX_GENERATES - user.quest_generates_today);
}

// ---------------------------------------------------------------------------
// Service: getChestStats
// ---------------------------------------------------------------------------

/**
 * Converts total XP into real-world impact via QuestAI Agent.
 */
async function getChestStats(user_id) {
  const user = await User.findByPk(user_id);
  if (!user) throw Object.assign(new Error('User not found.'), { status: 404 });
  return questAI.chestStats(user.xp_total);
}

module.exports = { generateQuests, claimQuest, getActiveQuests, getGeneratesLeft, getChestStats };
