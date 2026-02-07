// backend/src/controllers/dashboardController.js
const pool = require('../config/db');

const parseDateOrNull = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
};

const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const fromParam = parseDateOrNull(req.query.from);
    const toParam = parseDateOrNull(req.query.to);

    // Build query:
    // - If from/to are provided -> apply as filters
    // - If not -> return ALL entries for this user (past + future)
    let query = `
      SELECT trade_date, profit_loss, trades_count, amount_invested
      FROM daily_entries
      WHERE user_id = $1
    `;
    const params = [userId];
    let paramIndex = 2;

    if (fromParam) {
      query += ` AND trade_date >= $${paramIndex++}`;
      params.push(fromParam);
    }

    if (toParam) {
      query += ` AND trade_date <= $${paramIndex++}`;
      params.push(toParam);
    }

    query += ` ORDER BY trade_date ASC`;

    const result = await pool.query(query, params);
    const rows = result.rows || [];

    // No data case
    if (rows.length === 0) {
      return res.json({
        kpi: {
          totalPL: 0,
          winRate: 0,
          totalTrades: 0,
          profitFactor: 0,
          avgWin: 0,
          avgLoss: 0,
        },
        metrics: {
          sharpeRatio: 0,
          maxDrawdown: 0,
          avgWin: 0,
          avgLoss: 0,
          largestWin: 0,
          largestLoss: 0,
        },
        charts: {
          daily: [],
          cumulative: [],
        },
        range: {
          from: fromParam,
          to: toParam,
        },
      });
    }

    // If no explicit from/to were passed, infer range from DB
    let inferredFrom = fromParam;
    let inferredTo = toParam;

    const firstDate = rows[0].trade_date.toISOString().slice(0, 10);
    const lastDate = rows[rows.length - 1].trade_date.toISOString().slice(0, 10);

    if (!inferredFrom) inferredFrom = firstDate;
    if (!inferredTo) inferredTo = lastDate;

    // ------------------------------
    // Core calculations
    // ------------------------------
    const daily = [];
    const cumulative = [];

    let cumulativePL = 0;
    let totalPL = 0;
    let totalTrades = 0;

    let winDays = 0;
    let lossDays = 0;

    let winSum = 0;
    let lossSum = 0;

    let largestWin = Number.NEGATIVE_INFINITY;
    let largestLoss = Number.POSITIVE_INFINITY;

    const plValues = []; // for Sharpe

    rows.forEach((row) => {
      // Defensive: ensure numeric PL
      const pl = row.profit_loss !== null && row.profit_loss !== undefined
        ? Number(row.profit_loss)
        : 0;

      const tradesCount = row.trades_count !== null && row.trades_count !== undefined
        ? Number(row.trades_count)
        : 0;

      const dateStr = row.trade_date.toISOString().slice(0, 10);

      // 1) Daily P/L point (what the bar chart uses)
      daily.push({ date: dateStr, value: pl });

      // 2) Cumulative equity curve
      cumulativePL += pl;
      cumulative.push({ date: dateStr, value: cumulativePL });

      // 3) Totals
      totalPL += pl;
      totalTrades += tradesCount;

      // 4) Win/loss day stats
      if (pl > 0) {
        winDays += 1;
        winSum += pl;
        if (pl > largestWin) largestWin = pl;
      } else if (pl < 0) {
        lossDays += 1;
        lossSum += pl; // negative
        if (pl < largestLoss) largestLoss = pl;
      }

      plValues.push(pl);
    });

    // If no wins/losses, normalize extremes
    if (largestWin === Number.NEGATIVE_INFINITY) largestWin = 0;
    if (largestLoss === Number.POSITIVE_INFINITY) largestLoss = 0;

    const positiveCount = winDays;
    const negativeCount = lossDays;

    const avgWin = positiveCount > 0 ? winSum / positiveCount : 0;
    const avgLoss = negativeCount > 0 ? lossSum / negativeCount : 0; // will be negative

    const daysWithResult = winDays + lossDays;
    const winRate = daysWithResult > 0 ? (winDays / daysWithResult) * 100 : 0;

    let profitFactor = 0;
    const grossLoss = Math.abs(lossSum); // positive number
    if (grossLoss > 0) {
      profitFactor = winSum / grossLoss;
    }

    // Sanity: totalPL should equal last cumulative value
    const lastEquity = cumulative[cumulative.length - 1].value;
    // If there is any floating weirdness, you could force:
    // totalPL = lastEquity;
    // but normally they should already match.

    // Sharpe ratio approximation (using daily PL as "returns")
    let sharpeRatio = 0;
    if (plValues.length > 1) {
      const n = plValues.length;
      const mean = plValues.reduce((acc, v) => acc + v, 0) / n;
      const variance =
        plValues.reduce((acc, v) => acc + (v - mean) ** 2, 0) / (n - 1);
      const stdDev = Math.sqrt(variance);
      if (stdDev > 0) {
        const annualizedFactor = Math.sqrt(252); // 252 trading days
        sharpeRatio = (mean / stdDev) * annualizedFactor;
      }
    }

    // Max drawdown from equity curve
    let maxEquity = cumulative[0].value;
    let maxDrawdownPct = 0; // will be negative or 0

    cumulative.forEach((point) => {
      if (point.value > maxEquity) {
        maxEquity = point.value;
      }
      if (maxEquity !== 0) {
        const drawdown = ((point.value - maxEquity) / maxEquity) * 100;
        if (drawdown < maxDrawdownPct) {
          maxDrawdownPct = drawdown;
        }
      }
    });

    const response = {
      kpi: {
        // ✅ Net P/L = sum of all profit_loss for user (equals last equity point)
        totalPL,
        winRate,
        totalTrades,
        profitFactor,
        avgWin,
        avgLoss,
      },
      metrics: {
        sharpeRatio,
        maxDrawdown: maxDrawdownPct, // e.g. -12.5
        avgWin,
        avgLoss,
        largestWin,
        largestLoss,
      },
      charts: {
        daily,
        cumulative,
      },
      range: {
        from: inferredFrom,
        to: inferredTo,
      },
    };

    return res.json(response);
  } catch (err) {
    next(err);
  }
};

module.exports = getDashboardSummary;
