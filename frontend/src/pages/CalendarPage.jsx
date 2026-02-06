import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import {
  ChevronLeft,
  ChevronRight,
  BarChart,
  TrendingUp,
  DollarSign,
  Settings,
  MoreHorizontal,
  Calendar as CalendarIcon,
  Info, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const authFetch = async (path, options = {}) => {
  const token = localStorage.getItem('token');

  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      if (body?.message) message = body.message;
    } catch {
      // ignore
    }
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) return null;
  return response.json();
};

// Normalize trade_date from backend into "YYYY-MM-DD" in *local* time
const normalizeDateKey = (value) => {
  if (!value) return '';

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

// Simple currency-ish formatter for the pills / cards
const formatPL = (value) => {
  const abs = Math.abs(value);
  if (abs >= 1000000) {
    return `${value >= 0 ? '+' : '-'}$${(abs / 1000000).toFixed(2)}M`;
  }
  if (abs >= 1000) {
    return `${value >= 0 ? '+' : '-'}$${(abs / 1000).toFixed(1)}K`;
  }
  return `${value >= 0 ? (value === 0 ? '$' : '+$') : '-$'}${abs.toFixed(2)}`;
};

// Circular Progress Gauge Component
const CircularGauge = ({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  label,
  color = 'emerald',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min((value / max) * 100, 100);
  const offset = circumference - (percentage / 100) * circumference;

  const colorMap = {
    emerald: 'stroke-emerald-500',
    red: 'stroke-red-500',
  };

  const bgColorMap = {
    emerald: 'stroke-emerald-500/10',
    red: 'stroke-red-500/10',
  };

  const textColor =
    color === 'emerald' ? 'text-emerald-400' : 'text-red-400';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className={`fill-none ${bgColorMap[color]}`}
        />

        {/* Active ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className={`fill-none ${colorMap[color]} transition-all duration-700 ease-out`}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-xs font-bold ${textColor}`}>
          {value.toFixed(1)}%
        </span>
        {label && (
          <span className="text-xs text-gray-500 mt-1">{label}</span>
        )}
      </div>
    </div>
  );
};


// Fear & Greed Index Style Meter
const FearGreedMeter = ({ value }) => {
  const size = 80;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const clamped = Math.max(0, Math.min(value, 100)); // keep 0–100
  const circumference = radius * Math.PI; // half circle
  const offset = circumference - (clamped / 100) * circumference;

  // Only green (>50) or red (<=50)
  const getColor = () => {
    return clamped > 50 ? '#10b981' : '#ef4444'; // emerald / red
  };

  const color = getColor();

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size / 2 + 10} className="overflow-visible">
        {/* Background arc */}
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke="rgba(107, 114, 128, 0.2)" // tailwind gray-500/20
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Colored arc */}
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
        {/* Needle */}
        <line
          x1={size / 2}
          y1={size / 2}
          x2={size / 2 + radius * Math.cos(Math.PI * (1 - clamped / 100))}
          y2={size / 2 - radius * Math.sin(Math.PI * (1 - clamped / 100))}
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
        <circle cx={size / 2} cy={size / 2} r="3" fill={color} />
      </svg>
      <div className="absolute bottom-[-12px] left-1/2 -translate-x-1/2 text-center ">
        <div className="text-[10px] text-gray-500">Win Rate</div>
      </div>
    </div>
  );
};


// Win/Loss Bar Component
const WinLossBar = ({ avgWin, avgLoss }) => {
  const totalRange = avgWin + avgLoss;
  const winPercent = totalRange > 0 ? (avgWin / totalRange) * 100 : 50;
  const lossPercent = totalRange > 0 ? (avgLoss / totalRange) * 100 : 50;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-500"
            style={{ width: `${lossPercent}%` }}
          />
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
            style={{ width: `${winPercent}%` }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-red-400 font-semibold">-${avgLoss.toFixed(0)}</span>
        <span className="text-emerald-400 font-semibold">+${avgWin.toFixed(0)}</span>
      </div>
    </div>
  );
};


// Enhanced Calendar Grid with Weekly Profits Column
const EnhancedCalendarGrid = ({ currentDate, calendarData, onDayClick }) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const getDateKey = (day, month, year) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // Calculate weekly profits
  const weeklyProfits = useMemo(() => {
    const weeks = [0, 0, 0, 0, 0, 0]; // Max 6 weeks in a month

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = getDateKey(day, month, year);
      const dayData = calendarData[dateKey];
      if (dayData && dayData.profitLoss) {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay();
        const weekIndex = Math.floor((day - 1 + firstDay) / 7);
        weeks[weekIndex] += dayData.profitLoss;
      }
    }

    return weeks;
  }, [calendarData, month, year, daysInMonth, firstDay]);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const totalWeeks = Math.ceil((daysInMonth + firstDay) / 7);

  return (
    <div className="space-y-3">
      {/* Header with day names + Weekly P/L */}
      <div className="grid grid-cols-8 gap-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center">
            <div className="text-xs font-semibold text-gray-400">{day}</div>
          </div>
        ))}
        <div className="text-center pl-3 border-l-2 border-gray-700/50">
          <div className="text-xs font-bold text-emerald-400 mb-0.5">Week</div>
          <div className="text-[10px] text-gray-500">P/L</div>
        </div>
      </div>

      {/* Calendar rows with weekly profits */}
      {Array.from({ length: totalWeeks }, (_, weekIndex) => {
        const weekProfit = weeklyProfits[weekIndex] || 0;

        return (
          <div key={weekIndex} className="grid grid-cols-8 gap-2">
            {/* Day cells */}
            {Array.from({ length: 7 }, (_, dayIndex) => {
              const cellIndex = weekIndex * 7 + dayIndex;
              const day = cellIndex - firstDay + 1;

              if (day < 1 || day > daysInMonth) {
                return <div key={dayIndex} className="min-h-[80px]" />;
              }

              const dateKey = getDateKey(day, month, year);
              const dayData = calendarData[dateKey];
              const isToday =
                day === new Date().getDate() &&
                month === new Date().getMonth() &&
                year === new Date().getFullYear();

              const hasTrades = dayData && dayData.trades > 0;
              const profitLoss = dayData?.profitLoss || 0;
              const isProfit = profitLoss > 0;
              const isLoss = profitLoss < 0;

              return (
                <motion.button
                  key={dayIndex}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onDayClick(day, month, year)}
                  className={`
                    relative min-h-[80px] rounded-xl border-2 transition-all duration-200
                    ${isToday ? 'border-blue-500/50 bg-blue-500/5' : 'border-gray-800/50'}
                    ${hasTrades
                      ? isProfit
                        ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 hover:from-emerald-500/20 hover:to-emerald-500/10'
                        : isLoss
                          ? 'bg-gradient-to-br from-red-500/10 to-red-500/5 hover:from-red-500/20 hover:to-red-500/10'
                          : 'bg-gray-900/30 hover:bg-gray-800/50'
                      : 'bg-gray-900/20 hover:bg-gray-800/40'
                    }
                  `}
                >
                  <div className="p-2 h-full flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <span className={`text-sm font-semibold ${isToday ? 'text-blue-400' : 'text-gray-300'
                        }`}>
                        {day}
                      </span>
                      {hasTrades && (
                        <div className="w-2 h-2 rounded-full bg-gradient-to-br from-blue-400 to-purple-500" />
                      )}
                    </div>

                    {hasTrades && (
                      <div className="space-y-1">
                        <div className={`text-xs font-bold ${isProfit ? 'text-emerald-400' : isLoss ? 'text-red-400' : 'text-gray-400'
                          }`}>
                          {formatPL(profitLoss)}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          {dayData.trades} {dayData.trades === 1 ? 'trade' : 'trades'}
                        </div>
                      </div>
                    )}
                  </div>

                  {isToday && (
                    <div className="absolute inset-0 rounded-xl border-2 border-blue-500/30 pointer-events-none animate-pulse" />
                  )}
                </motion.button>
              );
            })}

            {/* Weekly Profit Cell - Now on the RIGHT */}
            <div className="flex items-center justify-center pl-3 border-l-2 border-gray-700/50">
              <div className={`w-full rounded-2xl p-3 flex flex-col items-center justify-center min-h-[80px] shadow-lg ${weekProfit > 0
                ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-2 border-emerald-500/40'
                : weekProfit < 0
                  ? 'bg-gradient-to-br from-red-500/20 to-red-600/10 border-2 border-red-500/40'
                  : 'bg-gray-800/40 border-2 border-gray-700/40'
                }`}>
                <div className="text-center space-y-1">
                  <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${weekProfit > 0
                    ? 'bg-emerald-500/30 text-emerald-300'
                    : weekProfit < 0
                      ? 'bg-red-500/30 text-red-300'
                      : 'bg-gray-700/50 text-gray-400'
                    }`}>
                    W{weekIndex + 1}
                  </div>
                  <div className={`text-base font-bold ${weekProfit > 0
                    ? 'text-emerald-400'
                    : weekProfit < 0
                      ? 'text-red-400'
                      : 'text-gray-500'
                    }`}>
                    {formatPL(weekProfit)}
                  </div>
                  {weekProfit !== 0 && (
                    <div className="flex items-center justify-center gap-1 mt-1">
                      {weekProfit > 0 ? (
                        <TrendingUp className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <TrendingUp className="w-3 h-3 text-red-400 rotate-180" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

import DayTileModal from '@/components/calendar/DayTileModal';

const CalendarPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState({});
  const [selectedDateKey, setSelectedDateKey] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingMonth, setIsLoadingMonth] = useState(false);

  const getDateKey = (day, month, year) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!user) return;

    const fetchMonthData = async () => {
      try {
        setIsLoadingMonth(true);
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;

        const entries = await authFetch(
          `/api/daily-entries?year=${encodeURIComponent(year)}&month=${encodeURIComponent(month)}`,
          { method: 'GET' }
        );

        const mapped = {};
        entries.forEach((entry) => {
          const dateKey = normalizeDateKey(entry.trade_date);
          if (!dateKey) return;

          mapped[dateKey] = {
            profitLoss: Number(entry.profit_loss ?? 0),
            trades: Number(entry.trades_count ?? 0),
            amountInvested:
              entry.amount_invested !== null && entry.amount_invested !== undefined
                ? Number(entry.amount_invested)
                : 0,
            roi:
              entry.roi_percent !== null && entry.roi_percent !== undefined
                ? Number(entry.roi_percent)
                : 0,
            notes: entry.notes || '',
          };
        });

        setCalendarData(mapped);
      } catch (error) {
        console.error('Failed to load month entries', error);
        toast({
          title: 'Error loading calendar',
          description: error.message || 'Could not fetch your entries for this month.',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingMonth(false);
      }
    };

    fetchMonthData();
  }, [user, currentDate, toast]);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (day, month, year) => {
    const key = getDateKey(day, month, year);
    setSelectedDateKey(key);
    setIsModalOpen(true);
  };

  const handleSaveDayData = async (dateKey, newData) => {
    const payload = {
      trade_date: dateKey,
      profit_loss: newData.profitLoss,
      trades_count: newData.trades,
      amount_invested: newData.amountInvested,
      roi_percent: newData.roi,
      notes: newData.notes,
    };

    await authFetch(`/api/daily-entries/${dateKey}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    setCalendarData((prev) => ({
      ...prev,
      [dateKey]: newData,
    }));

    toast({
      title: 'Entry Saved',
      description: 'Your trading journal has been updated successfully.',
      className: 'bg-emerald-500 border-none text-white',
    });
  };

  // Monthly statistics
  const stats = useMemo(() => {
    const currentMonthStr = String(currentDate.getMonth() + 1).padStart(2, '0');
    const currentYearStr = String(currentDate.getFullYear());

    let totalPL = 0;
    let totalTrades = 0;
    let wins = 0;
    let losses = 0;
    let daysTraded = 0;
    let totalInvested = 0;
    const dailyPLs = [];

    Object.entries(calendarData).forEach(([date, data]) => {
      const [y, m] = date.split('-');
      if (y === currentYearStr && m === currentMonthStr) {
        totalPL += data.profitLoss || 0;
        totalTrades += data.trades || 0;
        totalInvested += data.amountInvested || 0;
        dailyPLs.push(data.profitLoss || 0);

        if (data.trades > 0) {
          daysTraded++;
          if (data.profitLoss > 0) wins++;
          if (data.profitLoss < 0) losses++;
        }
      }
    });

    const winRate = daysTraded > 0 ? (wins / daysTraded) * 100 : 0;
    const avgWin = wins > 0 ? dailyPLs.filter(p => p > 0).reduce((a, b) => a + b, 0) / wins : 0;
    const avgLoss = losses > 0 ? Math.abs(dailyPLs.filter(p => p < 0).reduce((a, b) => a + b, 0) / losses) : 0;
    const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0;

    return {
      totalPL,
      totalTrades,
      winRate,
      daysTraded,
      profitFactor,
      avgWinLoss: avgWin - avgLoss,
      dailyPLs,
    };
  }, [calendarData, currentDate]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <>
      <Helmet>
        <title>Trading Calendar - Premium Journal</title>
        <meta name="description" content="Track your trading performance with precision" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 pt-20 sm:pt-24 px-4 pb-12 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          {/* Modern Metrics Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Net P/L Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-gray-900/90 to-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                {/* LEFT: evenly spaced with guaranteed height */}
                <div className="flex-1 flex flex-col justify-between min-h-[64px]">
                  <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                    Net P/L
                  </p>

                  <p
                    className={`text-xl font-semibold leading-none tracking-tight ${stats.totalPL >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                  >
                    {stats.totalPL >= 0 ? '+' : ''}
                    {stats.totalPL.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </p>

                  <p className="text-[10px] text-gray-500">
                    {stats.totalTrades} trades
                  </p>
                </div>

                {/* RIGHT: icon */}
                <div
                  className={`p-3 rounded-lg ${stats.totalPL >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'
                    }`}
                >
                  <DollarSign
                    className={`w-6 h-6 ${stats.totalPL >= 0 ? 'text-emerald-500' : 'text-red-500'
                      }`}
                  />
                </div>
              </div>

            </motion.div>

            {/* Win Rate Card with Fear & Greed Meter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-gradient-to-br from-gray-900/90 to-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                {/* LEFT: 3 rows, evenly spaced */}
                <div className="flex-1 flex flex-col justify-between min-h-[64px]">
                  <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                    Win Rate
                  </p>

                  <p
                    className={`text-xl font-semibold leading-none tracking-tight ${stats.winRate >= 50 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                  >
                    {stats.winRate.toFixed(1)}%
                  </p>

                  <p className="text-[10px] text-gray-500">
                    {stats.daysTraded} days
                  </p>
                </div>

                {/* RIGHT: meter */}
                <div className="flex items-center justify-center">
                  <FearGreedMeter
                    value={stats.winRate}
                    color={stats.winRate >= 50 ? 'emerald' : 'red'}
                  />
                </div>
              </div>
            </motion.div>



            {/* Avg Win/Loss Card with Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-gray-900/90 to-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4 shadow-2xl"
            >
              <div className="flex items-center justify-between gap-1">
                {/* LEFT: 3 rows, evenly spaced */}
                <div className="flex-1 flex flex-col justify-between min-h-[64px]">
                  {/* Row 1: title */}
                  <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                    Avg Win/Loss
                  </p>

                  {/* Row 2: win / loss (centered row) */}
                  <div className="flex items-center gap-2 self-start">
                    {/* Avg Win */}
                    <div className="text-center">
                      <p className="text-base font-semibold leading-none text-emerald-400">
                        +$
                        {(
                          stats.dailyPLs
                            .filter((p) => p > 0)
                            .reduce((a, b) => a + b, 0) /
                          (stats.dailyPLs.filter((p) => p > 0).length || 1)
                        ).toFixed(0)}
                      </p>
                      <p className="mt-1 text-[10px] text-gray-500">win</p>
                    </div>

                    <span className="text-gray-600 text-sm">/</span>

                    {/* Avg Loss */}
                    <div className="text-center">
                      <p className="text-base font-semibold leading-none text-red-400">
                        -$
                        {Math.abs(
                          stats.dailyPLs
                            .filter((p) => p < 0)
                            .reduce((a, b) => a + b, 0) /
                          (stats.dailyPLs.filter((p) => p < 0).length || 1)
                        ).toFixed(0)}
                      </p>
                      <p className="mt-1 text-[10px] text-gray-500">loss</p>
                    </div>
                  </div>

                  {/* Row 3: spacer to balance layout */}
                  <div />
                </div>

                {/* RIGHT: bar — hidden on mobile */}
                <div className="hidden sm:flex items-center justify-center shrink-0">
                  <div className="w-[140px] sm:w-[8vw] md:w-[8vw]">
                    <WinLossBar
                      avgWin={
                        stats.dailyPLs
                          .filter((p) => p > 0)
                          .reduce((a, b) => a + b, 0) /
                        (stats.dailyPLs.filter((p) => p > 0).length || 1)
                      }
                      avgLoss={Math.abs(
                        stats.dailyPLs
                          .filter((p) => p < 0)
                          .reduce((a, b) => a + b, 0) /
                        (stats.dailyPLs.filter((p) => p < 0).length || 1)
                      )}
                    />
                  </div>
                </div>
              </div>
            </motion.div>





            {/* Profit Factor Card with Circular Gauge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-gradient-to-br from-gray-900/90 to-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                {/* LEFT: 3 rows, evenly spaced */}
                <div className="flex-1 flex flex-col justify-between min-h-[64px]">
                  {/* Row 1: title */}
                  <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                    Profit Factor
                  </p>

                  {/* Row 2: main value */}
                  <p
                    className={`text-xl font-semibold leading-none tracking-tight ${stats.profitFactor >= 1 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                  >
                    {stats.profitFactor.toFixed(2)}
                  </p>

                  {/* Row 3: meta */}
                  <p className="text-[10px] text-gray-500">
                    {stats.profitFactor >= 1 ? 'Profitable' : 'Unprofitable'}
                  </p>
                </div>

                {/* RIGHT: gauge */}
                <div className="flex items-center justify-center -mr-1">
                  <CircularGauge
                    value={Math.min(stats.profitFactor * 50, 100)}
                    max={100}
                    size={55}
                    strokeWidth={5}
                    color={stats.profitFactor >= 1 ? 'emerald' : 'red'}
                  />
                </div>
              </div>
            </motion.div>


          </div>

          {/* Calendar Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 shadow-2xl"
          >
            {/* Calendar Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              {/* LEFT: Toolbar (actions + month + today) */}
              <div className="flex flex-wrap items-center ">


                {/* Month changer + Today */}
                <div className="inline-flex items-center gap-1 rounded-xl bg-gray-900/80 border border-gray-700/60 px-1 py-0.5 backdrop-blur">
                  <Button
                    onClick={prevMonth}
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/80"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  <div className="px-2 text-center leading-tight">
                    <span className="block text-sm font-semibold text-white">
                      {monthNames[currentDate.getMonth()]}
                    </span>
                    <span className="block text-[10px] text-gray-500">
                      {currentDate.getFullYear()}
                    </span>
                  </div>

                  <Button
                    onClick={nextMonth}
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/80"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>

                  {/* Today */}
                  <Button
                    onClick={goToToday}
                    variant="ghost"
                    className="h-7 px-3 ml-1 rounded-lg bg-gray-800/80 border border-gray-700/60 text-white hover:bg-gray-700/80 text-xs"
                  >
                    <CalendarIcon className="w-3.5 h-3.5 mr-1.5" />
                    Today
                  </Button>
                </div>

                {/* Sync indicator */}
                {isLoadingMonth && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30">
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                    <span className="text-xs text-blue-300">Syncing</span>
                  </div>
                )}
              </div>

              {/* RIGHT: Context only */}
              <div className="flex items-center gap-3">
                {/* Days traded */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/60 border border-gray-700/50">
                  <div
                    className={`w-2 h-2 rounded-full ${stats.daysTraded > 0 ? 'bg-emerald-400' : 'bg-gray-600'
                      }`}
                  />
                  <span className="text-xs font-medium text-gray-300">
                    {stats.daysTraded} {stats.daysTraded === 1 ? 'day' : 'days'} traded
                  </span>
                </div>

                {/* Action icons */}
                <div className="inline-flex items-center gap-1 rounded-xl bg-gray-900/80 border border-gray-700/60 p-1 backdrop-blur">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/80"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/80"
                  >
                    <Info className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/80"
                  >
                    <Download className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/80"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>

            </div>

            {/* Calendar Grid */}
            <EnhancedCalendarGrid
              currentDate={currentDate}
              calendarData={calendarData}
              onDayClick={handleDayClick}
            />
          </motion.div>

        </div>

        {/* Modal for Day Details */}
        <DayTileModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          date={selectedDateKey}
          initialData={calendarData[selectedDateKey]}
          onSave={handleSaveDayData}
        />
      </div>
    </>
  );
};

export default CalendarPage;