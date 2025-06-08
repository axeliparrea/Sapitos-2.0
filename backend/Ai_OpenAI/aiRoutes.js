const express = require('express');
const router = express.Router();
const aiController = require('./aiController');

// Ruta para hacer preguntas al asistente
router.post('/ask', aiController.askAssistant);

// Ruta para verificar el estado de la conexión con OpenAI
router.get('/status', aiController.getAIStatus);

module.exports = router; 