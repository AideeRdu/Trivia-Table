// Model: all SQL lives here. Every query is parameterized ($1, $2...) to prevent SQL injection.
const pool = require('../db');

async function getAllTopics() {
  const result = await pool.query('SELECT id, name FROM topics ORDER BY name');
  return result.rows;
}

async function getTopicByName(name) {
  const result = await pool.query('SELECT id, name FROM topics WHERE name = $1', [name]);
  return result.rows[0]; // undefined if the topic doesn't exist
}

// Questions for a topic, with optional difficulty filter and limit
async function getQuestionsByTopic(topicName, { difficulty, limit } = {}) {
  const params = [topicName];
  let sql = `
    SELECT q.id, t.name AS topic, q.question, q.answer, q.difficulty
    FROM questions q
    JOIN topics t ON t.id = q.topic_id
    WHERE t.name = $1`;

  if (difficulty) {
    params.push(difficulty);
    sql += ` AND q.difficulty = $${params.length}`;
  }

  sql += ' ORDER BY q.id';

  if (limit) {
    params.push(limit);
    sql += ` LIMIT $${params.length}`;
  }

  const result = await pool.query(sql, params);
  return result.rows;
}

// One random question, answer deliberately left out
async function getRandomQuestion() {
  const result = await pool.query(`
    SELECT q.id, t.name AS topic, q.question, q.difficulty
    FROM questions q
    JOIN topics t ON t.id = q.topic_id
    ORDER BY RANDOM()
    LIMIT 1`);
  return result.rows[0];
}

async function getQuestionById(id) {
  const result = await pool.query('SELECT id, question, answer FROM questions WHERE id = $1', [id]);
  return result.rows[0];
}

// Creates the topic if needed, then inserts the question, inside one transaction
async function addQuestion({ topic, question, answer, difficulty }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert the topic, or fetch the existing one's id if it's already there
    const topicResult = await client.query(
      `INSERT INTO topics (name) VALUES ($1)
       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [topic]
    );
    const topicId = topicResult.rows[0].id;

    await client.query(
      'INSERT INTO questions (topic_id, question, answer, difficulty) VALUES ($1, $2, $3, $4)',
      [topicId, question, answer, difficulty]
    );

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  getAllTopics,
  getTopicByName,
  getQuestionsByTopic,
  getRandomQuestion,
  getQuestionById,
  addQuestion,
};
