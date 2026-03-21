const express = require('express');
const router = express.Router();
const { getMissions, createMission, updateMission, deleteMission } = require('../controllers/missionController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, getMissions);
router.post('/', verifyToken, createMission);
router.put('/:id', verifyToken, updateMission);
router.delete('/:id', verifyToken, deleteMission);

module.exports = router;
