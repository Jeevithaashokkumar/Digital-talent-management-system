const express = require('express');
const router = express.Router();
const { createProject, getProjects, updateProjectStatus } = require('../controllers/projectController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.post('/', verifyToken, createProject);
router.get('/', verifyToken, getProjects);
router.patch('/:id/status', [verifyToken, isAdmin], updateProjectStatus);

module.exports = router;
