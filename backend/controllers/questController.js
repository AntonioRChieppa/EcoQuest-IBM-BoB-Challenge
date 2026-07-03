const questService = require('../services/questService');

/**
 * POST /api/generate-quests
 * Max 3 per session/day. Returns quests + generates_left counter.
 */
async function generateQuests(req, res) {
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ error: 'user_id is required.' });

  try {
    const result = await questService.generateQuests(user_id);
    return res.json(result);
  } catch (err) {
    console.error('[QuestController] generateQuests:', err);
    return res.status(err.status || 500).json({ error: err.message || 'Internal server error.' });
  }
}

/**
 * POST /api/claim-quest
 * Awards fixed XP (daily=100, weekly=300), handles level-up and rank-up.
 */
async function claimQuest(req, res) {
  const { user_id, quest_id } = req.body;
  if (!user_id || !quest_id) {
    return res.status(400).json({ error: 'user_id and quest_id are required.' });
  }

  try {
    const result = await questService.claimQuest(user_id, quest_id);
    return res.json(result);
  } catch (err) {
    console.error('[QuestController] claimQuest:', err);
    return res.status(err.status || 500).json({ error: err.message || 'Internal server error.' });
  }
}

/**
 * GET /api/quests/:user_id
 * Returns active quests + generates_left for the UI counter.
 */
async function getActiveQuests(req, res) {
  try {
    const [quests, generates_left] = await Promise.all([
      questService.getActiveQuests(req.params.user_id),
      questService.getGeneratesLeft(req.params.user_id),
    ]);
    return res.json({ quests, generates_left });
  } catch (err) {
    console.error('[QuestController] getActiveQuests:', err);
    return res.status(err.status || 500).json({ error: err.message || 'Internal server error.' });
  }
}

/**
 * GET /api/chest-stats/:user_id
 */
async function getChestStats(req, res) {
  try {
    const stats = await questService.getChestStats(req.params.user_id);
    return res.json(stats);
  } catch (err) {
    console.error('[QuestController] getChestStats:', err);
    return res.status(err.status || 500).json({ error: err.message || 'Internal server error.' });
  }
}

module.exports = { generateQuests, claimQuest, getActiveQuests, getChestStats };
