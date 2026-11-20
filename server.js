require('dotenv').config();
const express = require('express');
const triviaRoutes = require('./routes/triviaRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/triviabook', triviaRoutes);

// Unknown routes
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found.` });
});

// Malformed JSON bodies and any other unexpected errors
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body must be valid JSON.' });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`Triviabook API listening on http://localhost:${PORT}`);
});
