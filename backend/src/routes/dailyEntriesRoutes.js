// backend/src/routes/dailyEntries.routes.js

const express = require('express');
const router = express.Router();

const {
  getDailyEntriesForMonth,
  upsertDailyEntry,
} = require('../controllers/dailyEntriesController');

const authMiddleware = require('../middleware/authMiddleware');

// Protect all routes below – user must be logged in
router.use(authMiddleware);

// GET /api/daily-entries?year=YYYY&month=MM
router.get('/', getDailyEntriesForMonth);

// PUT /api/daily-entries/:date (YYYY-MM-DD)
router.put('/:date', upsertDailyEntry);

module.exports = router;
