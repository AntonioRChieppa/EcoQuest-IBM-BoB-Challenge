const express         = require('express');
const router          = express.Router();
const questController = require('../controllers/questController');

router.post('/generate-quests',        questController.generateQuests);
router.post('/claim-quest',            questController.claimQuest);
router.get('/quests/:user_id',         questController.getActiveQuests);
router.get('/chest-stats/:user_id',    questController.getChestStats);

module.exports = router;
