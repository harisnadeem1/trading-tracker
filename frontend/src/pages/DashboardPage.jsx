
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ArrowRight } from 'lucide-react';

// Import Dashboard Components
import KPICards from '@/components/dashboard/KPICards';
import DailyPLChart from '@/components/dashboard/DailyPLChart';
import CumulativeProfitChart from '@/components/dashboard/CumulativeProfitChart';
import DateRangeSelector from '@/components/dashboard/DateRangeSelector';

// Import Utils
import { getDashboardData, getAvailableMonths } from '@/lib/dashboardUtils';

const DashboardPage = () => {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  // State
  const [selectedMonth, setSelectedMonth] = useState('');
  const [availableMonths, setAvailableMonths] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Authentication Check
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  // Load Initial Data Configuration
  useEffect(() => {
    if (user?.email) {
      const months = getAvailableMonths(user.email);
      setAvailableMonths(months);
      
      // Default to current month if available, else first available
      const currentMonthStr = new Date().toISOString().substring(0, 7);
      if (months.includes(currentMonthStr)) {
        setSelectedMonth(currentMonthStr);
      } else if (months.length > 0) {
        setSelectedMonth(months[0]);
      }
    }
  }, [user]);

  // Fetch Dashboard Data when selection changes
  useEffect(() => {
    if (user?.email) {
      setIsLoading(true);
      // Simulate small network delay for smooth feel
      const timer = setTimeout(() => {
        const data = getDashboardData(user.email, selectedMonth);
        setDashboardData(data);
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user, selectedMonth]);

  if (isAuthLoading) return null; // Or a full screen spinner

  return (
    <>
      <Helmet>
        <title>Dashboard - TradingJournal</title>
        <meta name="description" content="Analyze your trading performance with detailed charts and metrics." />
      </Helmet>

      <div className="min-h-screen bg-gray-950 pt-20 sm:pt-24 px-4 pb-16 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Welcome back, <span className="text-emerald-400">{user?.username}</span>
              </h1>
              <p className="text-gray-400 mt-1 text-sm sm:text-base">Here's what your trading performance looks like.</p>
            </motion.div>

            {/* Controls */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 w-full md:w-auto"
            >
              <div className="flex-1 md:flex-none">
                <DateRangeSelector 
                  months={availableMonths} 
                  selectedMonth={selectedMonth}
                  onMonthChange={setSelectedMonth}
                />
              </div>
              <Link to="/calendar" className="flex-none">
                <Button variant="outline" className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 h-11 sm:h-10">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Journal</span>
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Empty State or Main Content */}
          {!dashboardData && !isLoading ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-16 sm:py-20 bg-gray-900/30 rounded-3xl border border-gray-800 border-dashed px-4 text-center"
            >
              <div className="bg-gray-800 p-4 rounded-full mb-4">
                <CalendarIcon className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">No Trading Data Found</h2>
              <p className="text-gray-400 text-center max-w-md mb-6 text-sm sm:text-base">
                You haven't logged any trades for this period yet. Head over to the calendar to start journaling your journey!
              </p>
              <Link to="/calendar" className="w-full sm:w-auto">
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white w-full sm:w-auto h-12 sm:h-10">
                  Go to Calendar <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-6 sm:space-y-8">
              
              {/* KPIs */}
              <KPICards kpiData={dashboardData?.kpi} isLoading={isLoading} />

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Daily P/L Chart Container */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white">Daily Profit & Loss</h3>
                    {selectedMonth && (
                      <span className="text-xs font-medium text-gray-500 px-2 py-1 bg-gray-800 rounded">
                        {selectedMonth}
                      </span>
                    )}
                  </div>
                  {isLoading ? (
                     <div className="h-[250px] sm:h-[300px] w-full bg-gray-800/20 animate-pulse rounded-xl" />
                  ) : (
                    <DailyPLChart data={dashboardData?.charts.daily} />
                  )}
                </motion.div>

                {/* Cumulative P/L Chart Container */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white">Cumulative Growth</h3>
                    <div className="flex items-center space-x-2">
                       <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                       <span className="text-xs text-gray-400">Equity Curve</span>
                    </div>
                  </div>
                  {isLoading ? (
                     <div className="h-[250px] sm:h-[300px] w-full bg-gray-800/20 animate-pulse rounded-xl" />
                  ) : (
                    <CumulativeProfitChart data={dashboardData?.charts.cumulative} />
                  )}
                </motion.div>

              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
