const express = require('express');
const router = express.Router();
const aiController = require('./aiController');

router.post('/ask', aiController.askAssistant);
router.get('/status', aiController.getAIStatus);

module.exports = router; 