# Triviabook API

A Node/Express + PostgreSQL API for trivia questions, organized with the model → controller → router pattern.

## Database schema

**topics**

| Column | Type | Notes |
|---|---|---|
| id | SERIAL | Primary key |
| name | VARCHAR(100) | NOT NULL, UNIQUE (stored lowercase) |

**questions**

| Column | Type | Notes |
|---|---|---|
| id | SERIAL | Primary key |
| topic_id | INTEGER | NOT NULL, foreign key → `topics(id)`, ON DELETE CASCADE |
| question | TEXT | NOT NULL |
| answer | TEXT | NOT NULL |
| difficulty | VARCHAR(10) | NOT NULL, CHECK in (`easy`, `medium`, `hard`) |

Relationship: one topic has many questions (one-to-many).

## Setup

1. Install [Node.js](https://nodejs.org) and [PostgreSQL](https://www.postgresql.org).
2. Clone the repo and install dependencies:
   ```bash
   git clone <your-repo-url>
   cd triviabook
   npm install
   ```
3. Create the database:
   ```bash
   createdb triviabook
   # or in psql: CREATE DATABASE triviabook;
   ```
4. Copy `.env.example` to `.env` and set your connection string:
   ```
   PORT=3000
   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/triviabook
   ```
5. Create the tables and load the seed data (re-running this resets the data):
   ```bash
   npm run db:setup
   ```
6. Start the server:
   ```bash
   npm start        # or: npm run dev  (auto-restarts with nodemon)
   ```
   The API runs at `http://localhost:3000`.

## Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/triviabook/topics` | List all topics |
| GET | `/triviabook/topic/:topic` | List questions for a topic. Optional query params: `limit` (positive integer), `difficulty` (`easy`, `medium`, `hard`) |
| GET | `/triviabook/random` | One random question (answer not included) |
| POST | `/triviabook/answer` | Check a guess. Body: `{ "id": 1, "guess": "mars" }` |
| POST | `/triviabook/question/add` | Add a question (creates the topic if needed). Body: `{ "topic", "question", "answer", "difficulty" }` |

### Examples

`GET /triviabook/topic/science?difficulty=easy&limit=1`
```json
[
  { "id": 1, "topic": "science", "question": "What planet is known as the Red Planet?", "answer": "Mars", "difficulty": "easy" }
]
```

`GET /triviabook/random`
```json
{ "id": 4, "topic": "geography", "question": "What is the capital of Australia?", "difficulty": "medium" }
```

`POST /triviabook/answer` with body `{ "id": 5, "guess": "  the nile " }`
```json
{ "id": 5, "question": "Which river flows through Cairo?", "guess": "  the nile ", "correct": true, "answer": "The Nile" }
```

`POST /triviabook/question/add` with body
```json
{ "topic": "history", "question": "In what year did WWII end?", "answer": "1945", "difficulty": "easy" }
```
returns `201` and the full list of `history` questions.

### Error responses

| Situation | Status | Example body |
|---|---|---|
| Topic doesn't exist | 404 | `{ "error": "Topic 'sports' not found." }` |
| Invalid `limit` or `difficulty` | 400 | `{ "error": "difficulty must be one of: easy, medium, hard." }` |
| Missing `id` or `guess` | 400 | `{ "error": "Both id and guess are required in the request body." }` |
| Question id not found | 404 | `{ "error": "Question with id 99 not found." }` |
| Missing field when adding a question | 400 | `{ "error": "Missing or empty required field(s): answer." }` |
| Invalid JSON body | 400 | `{ "error": "Request body must be valid JSON." }` |
| Server/database error | 500 | `{ "error": "Could not retrieve topics." }` |

## Notes

- Topic names are case-insensitive: they're saved in lowercase, so `/topic/Science` and `/topic/science` return the same results.
- Answer checking ignores case and leading/trailing whitespace.
- All queries are parameterized to prevent SQL injection.
- https://trivia-table.onrender.com
