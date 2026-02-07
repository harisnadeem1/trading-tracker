import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Target,
  Activity,
  PieChart,
  RefreshCw,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Award,
  AlertCircle,
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const formatCurrency = (value, compact = false) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '$0';
  }

  const num = Number(value);
  const abs = Math.abs(num);

  if (compact) {
    if (abs >= 1000000) return `${num >= 0 ? '+' : '-'}$${(abs / 1000000).toFixed(2)}M`;
    if (abs >= 1000) return `${num >= 0 ? '+' : '-'}$${(abs / 1000).toFixed(1)}K`;
  }

  return `${num >= 0 ? '+' : ''}${num.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  })}`;
};

const formatNumber = (num) => {
  if (num === null || num === undefined || Number.isNaN(Number(num))) return '0';
  return Number(num).toLocaleString('en-US', { maximumFractionDigits: 2 });
};

const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendValue, color = 'emerald', delay = 0 }) => {
  const isPositive = trend === 'up';
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  const colorClasses = {
    emerald: 'text-emerald-400',
    red: 'text-red-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
  };

  const bgClasses = {
    emerald: 'bg-emerald-500/10',
    red: 'bg-red-500/10',
    blue: 'bg-blue-500/10',
    purple: 'bg-purple-500/10',
  };

  const iconClasses = {
    emerald: 'text-emerald-500',
    red: 'text-red-500',
    blue: 'text-blue-500',
    purple: 'text-purple-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-xl p-4 sm:p-6 hover:bg-white/[0.04] transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 sm:mb-2">{title}</p>
          <h3 className={`text-xl sm:text-3xl font-bold ${colorClasses[color]}`}>
            {value}
          </h3>
          {subtitle && <p className="text-xs text-gray-500 mt-1 sm:mt-2">{subtitle}</p>}
        </div>
        <div className={`p-2 sm:p-3 rounded-lg ${bgClasses[color]}`}>
          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${iconClasses[color]}`} />
        </div>
      </div>

      {trendValue && (
        <div className="flex items-center gap-2 pt-2 sm:pt-3 border-t border-white/[0.05]">
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
              isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
            }`}
          >
            <TrendIcon className="w-3 h-3" />
            {trendValue}
          </div>
          <span className="text-xs text-gray-500">vs last period</span>
        </div>
      )}
    </motion.div>
  );
};

// Enhanced Daily Performance Bar Chart
const DailyPLBarChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] sm:h-[400px] text-gray-500">
        <div className="text-center">
          <BarChart3 className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-30" />
          <p className="text-xs sm:text-sm">No trading data available</p>
        </div>
      </div>
    );
  }

  const maxAbsValue = Math.max(...data.map((d) => Math.abs(d.value || 0))) || 1;
  const profitDays = data.filter((d) => d.value > 0).length;
  const lossDays = data.filter((d) => d.value < 0).length;
  const avgWin =
    data.filter((d) => d.value > 0).reduce((sum, d) => sum + d.value, 0) / (profitDays || 1);
  const avgLoss =
    data.filter((d) => d.value < 0).reduce((sum, d) => sum + d.value, 0) / (lossDays || 1);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="text-center">
          <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Win Days</p>
          <p className="text-base sm:text-2xl font-bold text-emerald-400">{profitDays}</p>
          <p className="text-[10px] sm:text-xs text-gray-600 mt-1">{formatCurrency(avgWin, true)} avg</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Loss Days</p>
          <p className="text-base sm:text-2xl font-bold text-red-400">{lossDays}</p>
          <p className="text-[10px] sm:text-xs text-gray-600 mt-1">{formatCurrency(avgLoss, true)} avg</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Best Day</p>
          <p className="text-base sm:text-2xl font-bold text-blue-400">
            {formatCurrency(Math.max(...data.map((d) => d.value || 0)), true)}
          </p>
          <p className="text-[10px] sm:text-xs text-gray-600 mt-1">peak profit</p>
        </div>
      </div>

      {/* Chart */}
      <div className="relative bg-gradient-to-b from-white/[0.01] to-transparent rounded-lg p-2 sm:p-4">
        <div className="flex items-end justify-between h-[180px] sm:h-[240px] gap-[1px]">
          {data.map((day, idx) => {
            const heightPercent = Math.max((Math.abs(day.value || 0) / maxAbsValue) * 92, 4);
            const isProfit = (day.value || 0) >= 0;

            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center justify-end group relative h-full"
              >
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: `${heightPercent}%`, opacity: 1 }}
                  transition={{
                    delay: idx * 0.005,
                    duration: 0.6,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  className={`w-full transition-all duration-200 ${
                    isProfit
                      ? 'bg-gradient-to-t from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400'
                      : 'bg-gradient-to-t from-red-600 to-red-500 hover:from-red-500 hover:to-red-400'
                  } cursor-pointer rounded-t-[1px]`}
                  style={{ minHeight: '4px' }}
                />

                {/* Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute bottom-full mb-2 sm:mb-3 bg-gray-950/98 border border-white/[0.15] rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs whitespace-nowrap z-10 shadow-2xl backdrop-blur-sm pointer-events-none">
                  <div className="font-medium text-gray-300 mb-1 text-[9px] sm:text-[10px]">
                    {day.date}
                  </div>
                  <div
                    className={`font-bold text-sm sm:text-base ${
                      isProfit ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {formatCurrency(day.value)}
                  </div>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-gray-950/98 border-r border-b border-white/[0.15]" />
                </div>
              </div>
            );
          })}
        </div>

        {/* X-axis */}
        <div className="flex justify-between text-[9px] sm:text-[10px] text-gray-500 mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-white/[0.05]">
          {data
            .filter((_, idx) => idx % Math.ceil(data.length / (window.innerWidth < 640 ? 3 : 5) || 1) === 0)
            .map((day, idx) => (
              <span key={idx} className="font-medium">
                {day.date?.split('-').slice(1).join('/')}
              </span>
            ))}
        </div>
      </div>
    </div>
  );
};

const CumulativeGrowthChart = ({ data }) => {
  const [hoverPoint, setHoverPoint] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] sm:h-[400px] text-gray-500">
        <div className="text-center">
          <Activity className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-30" />
          <p className="text-xs sm:text-sm">No growth data available</p>
        </div>
      </div>
    );
  }

  const values = data.map((d) => d.value || 0);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  const paddedMax = max + range * 0.1;
  const paddedMin = min - range * 0.1;
  const paddedRange = paddedMax - paddedMin || 1;

  const svgPoints = data.map((point, idx) => {
    const x = (idx / (data.length - 1 || 1)) * 100;
    const y = 100 - (((point.value || 0) - paddedMin) / paddedRange) * 100;
    return {
      x,
      y,
      value: point.value || 0,
      date: point.date,
    };
  });

  const polylinePoints = svgPoints.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPoints = `0,100 ${polylinePoints} 100,100`;

  const firstVal = data[0]?.value || 0;
  const lastVal = data[data.length - 1]?.value || 0;
  const totalGain = lastVal - firstVal;
  const percentGain = firstVal !== 0 ? (totalGain / firstVal) * 100 : 0;

  const yAxisLabels = [
    paddedMax,
    paddedMin + paddedRange * 0.75,
    paddedMin + paddedRange * 0.5,
    paddedMin + paddedRange * 0.25,
    paddedMin,
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="text-center">
          <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Total Gain</p>
          <p className="text-base sm:text-2xl font-bold text-emerald-400">
            {formatCurrency(totalGain, true)}
          </p>
          <p className="text-[10px] sm:text-xs text-gray-600 mt-1">net profit</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Growth</p>
          <p className="text-base sm:text-2xl font-bold text-blue-400">
            {totalGain >= 0 ? '+' : ''}
            {percentGain.toFixed(1)}%
          </p>
          <p className="text-[10px] sm:text-xs text-gray-600 mt-1">return</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Peak</p>
          <p className="text-base sm:text-2xl font-bold text-purple-400">
            {formatCurrency(max, true)}
          </p>
          <p className="text-[10px] sm:text-xs text-gray-600 mt-1">all-time high</p>
        </div>
      </div>

      {/* Chart */}
      <div className="relative bg-gradient-to-b from-white/[0.01] to-transparent rounded-lg p-0 sm:p-4">
        <div className="flex gap-2 sm:gap-3">
          {/* Y-axis labels */}
          <div className="flex flex-col justify-between text-[9px] sm:text-[10px] text-gray-500 font-medium h-[180px] sm:h-[240px] pt-1 pb-1">
            {yAxisLabels.map((label, idx) => (
              <div key={idx} className="text-right leading-none">
                ${(label / 1000).toFixed(1)}K
              </div>
            ))}
          </div>

          {/* Chart area */}
          <div className="flex-1 h-[180px] sm:h-[240px] relative">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {[0, 25, 50, 75, 100].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="100"
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.02)"
                  strokeWidth="0.5"
                  strokeDasharray="3,3"
                />
              ))}

              <defs>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="rgb(16, 185, 129)" stopOpacity="0" />
                </linearGradient>
              </defs>

              <polygon points={areaPoints} fill="url(#areaGradient)" />

              <polyline
                points={polylinePoints}
                fill="none"
                stroke="rgb(16, 185, 129)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {svgPoints.map((p, idx) => (
                <rect
                  key={idx}
                  x={idx === 0 ? 0 : (svgPoints[idx - 1].x + p.x) / 2}
                  y="0"
                  width={
                    idx === 0 || idx === svgPoints.length - 1
                      ? 100 / (svgPoints.length - 1 || 1)
                      : (svgPoints[idx + 1].x - svgPoints[idx - 1].x) / 2
                  }
                  height="100"
                  fill="transparent"
                  onMouseEnter={() => setHoverPoint(p)}
                  onMouseLeave={() => setHoverPoint(null)}
                />
              ))}

              {svgPoints.map((p, idx) => {
                const isEdge = idx === 0 || idx === svgPoints.length - 1;
                if (!isEdge) return null;
                return (
                  <g key={idx}>
                    <circle cx={p.x} cy={p.y} r="1" className="fill-emerald-400" />
                    <circle cx={p.x} cy={p.y} r="2.5" className="fill-emerald-400/20" />
                  </g>
                );
              })}
            </svg>

            {hoverPoint && (
              <div
                className="absolute bg-gray-950/98 border border-white/[0.15] rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs whitespace-nowrap shadow-2xl backdrop-blur-sm pointer-events-none"
                style={{
                  left: `${hoverPoint.x}%`,
                  top: `${hoverPoint.y}%`,
                  transform: 'translate(-50%, -120%)',
                }}
              >
                <div className="font-medium text-gray-300 mb-1 text-[9px] sm:text-[10px]">
                  {hoverPoint.date}
                </div>
                <div className="font-bold text-sm sm:text-base text-emerald-400">
                  {formatCurrency(hoverPoint.value)}
                </div>
                <div className="absolute left-1/2 bottom-[-6px] -translate-x-1/2 w-2 h-2 rotate-45 bg-gray-950/98 border-r border-b border-white/[0.15]" />
              </div>
            )}
          </div>
        </div>

        {/* X-axis */}
        <div className="flex justify-between text-[9px] sm:text-[10px] text-gray-500 mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-white/[0.05] ml-8 sm:ml-12">
          <span>{data[0]?.date?.split('-').slice(1).join('/')}</span>
          <span className="hidden sm:inline">
            {data[Math.floor(data.length / 2)]?.date
              ?.split('-')
              .slice(1)
              .join('/')}
          </span>
          <span>
            {data[data.length - 1]?.date
              ?.split('-')
              .slice(1)
              .join('/')}
          </span>
        </div>
      </div>
    </div>
  );
};

// Refresh Button
const RefreshButton = ({ onRefresh, isLoading }) => {
  return (
    <Button
      onClick={onRefresh}
      variant="ghost"
      size="icon"
      disabled={isLoading}
      className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-white/[0.02] border border-white/[0.05] text-gray-400 hover:text-white hover:bg-white/[0.05] disabled:opacity-50 transition-all"
    >
      <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
    </Button>
  );
};

const DashboardPage = () => {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('token');

      const res = await fetch(`${API_BASE_URL}/api/dashboard/summary`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error(`Failed to load dashboard (${res.status})`);
      }

      const data = await res.json();
      setDashboardData(data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.message || 'Failed to load dashboard data');
      setDashboardData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!isAuthLoading && isAuthenticated) {
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isAuthLoading]);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  if (isAuthLoading) return null;

  return (
    <>
      <Helmet>
        <title>Dashboard - Trading Journal</title>
        <meta
          name="description"
          content="Professional trading analytics and performance metrics"
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 pt-16 sm:pt-20 md:pt-24 px-3 sm:px-4 pb-12 sm:pb-16 lg:px-8">
        <div className="max-w-[1400px] mx-auto space-y-6 sm:space-y-8">
          

          {error && (
            <div className="text-xs text-red-400 bg-red-500/5 border border-red-500/30 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          {/* Main Content */}
          {isLoading ? (
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-28 sm:h-32 bg-white/[0.02] animate-pulse rounded-xl" />
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="h-[400px] sm:h-[500px] bg-white/[0.02] animate-pulse rounded-xl" />
                <div className="h-[400px] sm:h-[500px] bg-white/[0.02] animate-pulse rounded-xl" />
              </div>
            </div>
          ) : !dashboardData ? (
            <div className="text-xs sm:text-sm text-gray-400 bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 sm:p-6">
              No dashboard data found. Add some daily entries to see analytics here.
            </div>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatCard
                  title="Net P/L"
                  value={formatCurrency(dashboardData.kpi?.totalPL || 0, true)}
                  subtitle={`${dashboardData.kpi?.totalTrades || 0} trades`}
                  icon={DollarSign}
                  color={dashboardData.kpi?.totalPL >= 0 ? 'emerald' : 'red'}
                  trend={dashboardData.kpi?.totalPL >= 0 ? 'up' : 'down'}
                  delay={0}
                />

                <StatCard
                  title="Win Rate"
                  value={`${formatNumber(dashboardData.kpi?.winRate || 0)}%`}
                  subtitle="Success ratio"
                  icon={Target}
                  color={dashboardData.kpi?.winRate >= 50 ? 'emerald' : 'red'}
                  trend={dashboardData.kpi?.winRate >= 50 ? 'up' : 'down'}
                  delay={0.05}
                />

                <StatCard
                  title="Profit Factor"
                  value={formatNumber(dashboardData.kpi?.profitFactor || 0)}
                  subtitle="Risk efficiency"
                  icon={BarChart3}
                  color={dashboardData.kpi?.profitFactor >= 1 ? 'emerald' : 'red'}
                  trend={dashboardData.kpi?.profitFactor >= 1 ? 'up' : 'down'}
                  delay={0.1}
                />

                <StatCard
                  title="Total Trades"
                  value={dashboardData.kpi?.totalTrades || 0}
                  subtitle="All time"
                  icon={Activity}
                  color="blue"
                  trend="up"
                  delay={0.15}
                />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Daily Performance */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-xl p-4 sm:p-6"
                >
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-white">Daily Performance</h3>
                      <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Profit & loss by trading day</p>
                    </div>
                    <div className="p-2 sm:p-2.5 bg-emerald-500/10 rounded-lg">
                      <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                    </div>
                  </div>

                  <DailyPLBarChart data={dashboardData.charts?.daily || []} />
                </motion.div>

                {/* Equity Curve */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.4 }}
                  className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-xl p-4 sm:p-6"
                >
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-white">Equity Curve</h3>
                      <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                        Cumulative profit progression
                      </p>
                    </div>
                    <div className="p-2 sm:p-2.5 bg-emerald-500/10 rounded-lg">
                      <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                    </div>
                  </div>

                  <CumulativeGrowthChart data={dashboardData.charts?.cumulative || []} />
                </motion.div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default DashboardPage;