const express = require('express');
const router = express.Router();
const { getKnowledgeNodes, createKnowledgeNode, createRelationship, syncKnowledge } = require('../controllers/knowledgeController');
const { verifyToken } = require('../middleware/auth');

router.get('/nodes', verifyToken, getKnowledgeNodes);
router.post('/nodes', verifyToken, createKnowledgeNode);
router.post('/relationships', verifyToken, createRelationship);
router.post('/sync', verifyToken, syncKnowledge);

module.exports = router;
