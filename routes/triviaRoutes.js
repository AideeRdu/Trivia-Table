// Router: maps URLs to controller functions. Mounted at /triviabook in server.js.
const express = require('express');
const controller = require('../controllers/triviaController');

const router = express.Router();

router.get('/topics', controller.getTopics);
router.get('/topic/:topic', controller.getQuestionsForTopic);
router.get('/random', controller.getRandomQuestion);
router.post('/answer', controller.checkAnswer);
router.post('/question/add', controller.addQuestion);

module.exports = router;
