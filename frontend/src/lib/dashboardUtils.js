
export const getDashboardData = (userEmail, selectedMonth = null) => {
  if (!userEmail) return null;

  try {
    const storageKey = `trading_calendar_data_${userEmail}`;
    const storedData = localStorage.getItem(storageKey);
    
    if (!storedData) return null;

    const calendarData = JSON.parse(storedData);
    let entries = Object.entries(calendarData).map(([date, data]) => ({
      date,
      ...data
    }));

    // Filter by month if selected (format YYYY-MM)
    if (selectedMonth) {
      entries = entries.filter(entry => entry.date.startsWith(selectedMonth));
    }

    // Sort by date ascending
    entries.sort((a, b) => new Date(a.date) - new Date(b.date));

    if (entries.length === 0) return null;

    // Calculate KPIs
    const totalTrades = entries.reduce((acc, curr) => acc + (parseInt(curr.trades) || 0), 0);
    const totalPL = entries.reduce((acc, curr) => acc + (parseFloat(curr.profitLoss) || 0), 0);
    
    // Win Rate Calculation (based on profitable days)
    const tradingDays = entries.filter(e => (parseInt(e.trades) || 0) > 0);
    const winningDays = tradingDays.filter(e => (parseFloat(e.profitLoss) || 0) > 0);
    const winRate = tradingDays.length > 0 
      ? ((winningDays.length / tradingDays.length) * 100) 
      : 0;

    const avgDailyPL = tradingDays.length > 0 
      ? totalPL / tradingDays.length 
      : 0;

    const plValues = entries.map(e => parseFloat(e.profitLoss) || 0);
    const bestDay = Math.max(...plValues, 0);
    const worstDay = Math.min(...plValues, 0);

    // Prepare Daily Chart Data
    const dailyChartData = entries.map(entry => ({
      date: entry.date,
      value: parseFloat(entry.profitLoss) || 0
    }));

    // Prepare Cumulative Chart Data
    let runningTotal = 0;
    const cumulativeChartData = entries.map(entry => {
      runningTotal += parseFloat(entry.profitLoss) || 0;
      return {
        date: entry.date,
        value: runningTotal
      };
    });

    return {
      kpi: {
        totalPL,
        totalTrades,
        winRate,
        avgDailyPL,
        bestDay,
        worstDay,
        tradingDaysCount: tradingDays.length
      },
      charts: {
        daily: dailyChartData,
        cumulative: cumulativeChartData
      }
    };

  } catch (error) {
    console.error("Error processing dashboard data:", error);
    return null;
  }
};

export const getAvailableMonths = (userEmail) => {
  if (!userEmail) return [];
  
  try {
    const storageKey = `trading_calendar_data_${userEmail}`;
    const storedData = localStorage.getItem(storageKey);
    if (!storedData) return [];

    const calendarData = JSON.parse(storedData);
    const months = new Set();

    Object.keys(calendarData).forEach(date => {
      // date format YYYY-MM-DD
      const monthStr = date.substring(0, 7); // YYYY-MM
      months.add(monthStr);
    });

    return Array.from(months).sort().reverse();
  } catch (error) {
    console.error("Error getting available months:", error);
    return [];
  }
};
