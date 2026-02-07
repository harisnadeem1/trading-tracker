// backend/src/routes/dashboardRoutes.js
const express = require('express');


const authMiddleware = require('../middleware/authMiddleware');

const getDashboardSummary = require('../controllers/dashboardController');

const router = express.Router();

// GET /api/dashboard/summary?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get('/summary', authMiddleware, getDashboardSummary);

module.exports = router;
