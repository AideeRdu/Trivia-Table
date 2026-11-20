// Controller: validates the request, calls the model, and sends the response.
const Trivia = require('../models/triviaModel');

const DIFFICULTIES = ['easy', 'medium', 'hard'];

// Topic names are stored lowercase so "Science" and "science" are the same topic
const normalizeTopic = (topic) => String(topic).trim().toLowerCase();

const isNonEmptyString = (value) => typeof value === 'string' && value.trim() !== '';

// GET /triviabook/topics
async function getTopics(req, res) {
  try {
    const topics = await Trivia.getAllTopics();
    res.status(200).json(topics);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not retrieve topics.' });
  }
}

// GET /triviabook/topic/:topic?limit=2&difficulty=easy
async function getQuestionsForTopic(req, res) {
  const topicName = normalizeTopic(req.params.topic);
  const { limit, difficulty } = req.query;

  // Validate optional query parameters
  let parsedLimit;
  if (limit !== undefined) {
    parsedLimit = Number(limit);
    if (!Number.isInteger(parsedLimit) || parsedLimit < 1) {
      return res.status(400).json({ error: 'limit must be a positive whole number.' });
    }
  }

  let normalizedDifficulty;
  if (difficulty !== undefined) {
    normalizedDifficulty = String(difficulty).trim().toLowerCase();
    if (!DIFFICULTIES.includes(normalizedDifficulty)) {
      return res
        .status(400)
        .json({ error: `difficulty must be one of: ${DIFFICULTIES.join(', ')}.` });
    }
  }

  try {
    const topic = await Trivia.getTopicByName(topicName);
    if (!topic) {
      return res.status(404).json({ error: `Topic '${req.params.topic}' not found.` });
    }

    const questions = await Trivia.getQuestionsByTopic(topicName, {
      difficulty: normalizedDifficulty,
      limit: parsedLimit,
    });
    res.status(200).json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not retrieve questions.' });
  }
}

// GET /triviabook/random
async function getRandomQuestion(req, res) {
  try {
    const question = await Trivia.getRandomQuestion();
    if (!question) {
      return res.status(404).json({ error: 'There are no questions in the database yet.' });
    }
    res.status(200).json(question);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not retrieve a random question.' });
  }
}

// POST /triviabook/answer   body: { id, guess }
async function checkAnswer(req, res) {
  const { id, guess } = req.body || {};

  if (id === undefined || id === null || id === '' || guess === undefined || guess === null) {
    return res.status(400).json({ error: 'Both id and guess are required in the request body.' });
  }

  const questionId = Number(id);
  if (!Number.isInteger(questionId) || questionId < 1) {
    return res.status(400).json({ error: 'id must be a positive whole number.' });
  }

  try {
    const question = await Trivia.getQuestionById(questionId);
    if (!question) {
      return res.status(404).json({ error: `Question with id ${questionId} not found.` });
    }

    const correct =
      String(guess).trim().toLowerCase() === question.answer.trim().toLowerCase();

    res.status(200).json({
      id: question.id,
      question: question.question,
      guess,
      correct,
      answer: question.answer,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not check the answer.' });
  }
}

// POST /triviabook/question/add   body: { topic, question, answer, difficulty }
async function addQuestion(req, res) {
  const { topic, question, answer, difficulty } = req.body || {};

  const missing = Object.entries({ topic, question, answer, difficulty })
    .filter(([, value]) => !isNonEmptyString(value))
    .map(([key]) => key);

  if (missing.length > 0) {
    return res
      .status(400)
      .json({ error: `Missing or empty required field(s): ${missing.join(', ')}.` });
  }

  const normalizedDifficulty = difficulty.trim().toLowerCase();
  if (!DIFFICULTIES.includes(normalizedDifficulty)) {
    return res
      .status(400)
      .json({ error: `difficulty must be one of: ${DIFFICULTIES.join(', ')}.` });
  }

  const topicName = normalizeTopic(topic);

  try {
    await Trivia.addQuestion({
      topic: topicName,
      question: question.trim(),
      answer: answer.trim(),
      difficulty: normalizedDifficulty,
    });

    const questions = await Trivia.getQuestionsByTopic(topicName);
    res.status(201).json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not add the question.' });
  }
}

module.exports = {
  getTopics,
  getQuestionsForTopic,
  getRandomQuestion,
  checkAnswer,
  addQuestion,
};
