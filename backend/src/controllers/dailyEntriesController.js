// backend/src/controllers/dailyEntries.controller.js

const pool = require('../config/db');

/**
 * GET /api/daily-entries?year=YYYY&month=MM
 * Returns all daily entries for the authenticated user for a given month.
 */
const getDailyEntriesForMonth = async (req, res, next) => {
  try {
    const userId = req.user.id; // from auth.middleware
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ message: 'year and month are required query params' });
    }

    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10); // 1–12

    if (
      Number.isNaN(yearNum) ||
      Number.isNaN(monthNum) ||
      monthNum < 1 ||
      monthNum > 12
    ) {
      return res.status(400).json({ message: 'Invalid year or month' });
    }

    // Start of this month (inclusive)
    const startDate = new Date(Date.UTC(yearNum, monthNum - 1, 1));
    // Start of next month (exclusive)
    const endDate = new Date(Date.UTC(yearNum, monthNum, 1));

    const query = `
      SELECT
        id,
        user_id,
        trade_date,
        profit_loss,
        trades_count,
        amount_invested,
        roi_percent,
        notes,
        created_at,
        updated_at
      FROM daily_entries
      WHERE user_id = $1
        AND trade_date >= $2::date
        AND trade_date < $3::date
      ORDER BY trade_date ASC;
    `;

    const { rows } = await pool.query(query, [
      userId,
      startDate.toISOString().slice(0, 10), // 'YYYY-MM-DD'
      endDate.toISOString().slice(0, 10),
    ]);

    // Frontend will receive an array of entries
    return res.json(rows);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/daily-entries/:date
 * Upserts a single daily entry (create or update) for the authenticated user.
 * :date is in YYYY-MM-DD format.
 */
const upsertDailyEntry = async (req, res, next) => {
  try {
    const userId = req.user.id; // from auth.middleware
    const { date } = req.params;

    if (!date) {
      return res.status(400).json({ message: 'Date param is required (YYYY-MM-DD)' });
    }

    // Very basic YYYY-MM-DD check
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: 'Invalid date format, expected YYYY-MM-DD' });
    }

    const {
      trade_date, // optional if you want; we’ll trust :date
      profit_loss,
      trades_count,
      amount_invested,
      roi_percent,
      notes,
    } = req.body;

    // Use route param as source of truth for date
    const tradeDate = trade_date || date;

    // Basic required checks (aligned with DB constraints)
    if (profit_loss === undefined || trades_count === undefined) {
      return res.status(400).json({
        message: 'profit_loss and trades_count are required in the body',
      });
    }

    const query = `
      INSERT INTO daily_entries (
        user_id,
        trade_date,
        profit_loss,
        trades_count,
        amount_invested,
        roi_percent,
        notes
      )
      VALUES ($1, $2::date, $3, $4, $5, $6, $7)
      ON CONFLICT (user_id, trade_date)
      DO UPDATE SET
        profit_loss = EXCLUDED.profit_loss,
        trades_count = EXCLUDED.trades_count,
        amount_invested = EXCLUDED.amount_invested,
        roi_percent = EXCLUDED.roi_percent,
        notes = EXCLUDED.notes,
        updated_at = NOW()
      RETURNING
        id,
        user_id,
        trade_date,
        profit_loss,
        trades_count,
        amount_invested,
        roi_percent,
        notes,
        created_at,
        updated_at;
    `;

    const values = [
      userId,
      tradeDate,
      profit_loss,
      trades_count,
      amount_invested ?? null,
      roi_percent ?? null,
      notes ?? null,
    ];

    const { rows } = await pool.query(query, values);

    return res.status(200).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDailyEntriesForMonth,
  upsertDailyEntry,
};
