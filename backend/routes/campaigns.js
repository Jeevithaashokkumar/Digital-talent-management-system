const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const { createCampaign, getCampaigns, updateCampaign, deleteCampaign } = require('../controllers/campaignController');

// All campaigns require authentication.
router.get('/', verifyToken, getCampaigns);
router.post('/', verifyToken, createCampaign);
router.put('/:id', verifyToken, updateCampaign);
router.delete('/:id', verifyToken, deleteCampaign);

module.exports = router;
