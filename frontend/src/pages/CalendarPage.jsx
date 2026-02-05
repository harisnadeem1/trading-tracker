
import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { ChevronLeft, ChevronRight, BarChart, TrendingUp, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

// Import new components
import CalendarGrid from '@/components/calendar/CalendarGrid';
import DayTileModal from '@/components/calendar/DayTileModal';

const CalendarPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState({});
  const [selectedDateKey, setSelectedDateKey] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load data on mount
  useEffect(() => {
    if (user?.email) {
      const storedData = localStorage.getItem(`trading_calendar_data_${user.email}`);
      if (storedData) {
        setCalendarData(JSON.parse(storedData));
      }
    }
  }, [user]);

  // Navigation Handlers
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Date Key Helper
  const getDateKey = (day, month, year) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // Interaction Handlers
  const handleDayClick = (day, month, year) => {
    const key = getDateKey(day, month, year);
    setSelectedDateKey(key);
    setIsModalOpen(true);
  };

  const handleSaveDayData = (dateKey, newData) => {
    const updatedData = {
      ...calendarData,
      [dateKey]: newData
    };
    
    setCalendarData(updatedData);
    localStorage.setItem(`trading_calendar_data_${user.email}`, JSON.stringify(updatedData));
    
    toast({
      title: "Entry Saved",
      description: "Your trading journal has been updated successfully.",
      className: "bg-emerald-500 border-none text-white"
    });
  };

  // Calculate Monthly Statistics
  const stats = useMemo(() => {
    const currentMonthStr = String(currentDate.getMonth() + 1).padStart(2, '0');
    const currentYearStr = String(currentDate.getFullYear());
    
    let totalPL = 0;
    let totalTrades = 0;
    let wins = 0;
    let daysTraded = 0;

    Object.entries(calendarData).forEach(([date, data]) => {
      const [y, m] = date.split('-');
      if (y === currentYearStr && m === currentMonthStr) {
        totalPL += data.profitLoss || 0;
        totalTrades += data.trades || 0;
        if (data.trades > 0) {
          daysTraded++;
          if (data.profitLoss > 0) wins++;
        }
      }
    });

    return {
      totalPL,
      totalTrades,
      winRate: daysTraded > 0 ? ((wins / daysTraded) * 100).toFixed(1) : 0
    };
  }, [calendarData, currentDate]);

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  return (
    <>
      <Helmet>
        <title>Calendar - TradingJournal</title>
        <meta name="description" content="Manage your daily trading performance" />
      </Helmet>

      <div className="min-h-screen bg-gray-950 pt-20 sm:pt-24 px-4 pb-12 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
          
          {/* Top Bar: Title & Navigation */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Trading Calendar</h1>
              <p className="text-gray-400 mt-1 text-sm sm:text-base">Track your daily performance and psychology</p>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end gap-2 w-full md:w-auto">
              <div className="flex items-center bg-gray-900 p-1 rounded-xl border border-gray-800 flex-1 sm:flex-initial justify-between sm:justify-center">
                <Button onClick={prevMonth} variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg h-10 w-10">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <div className="px-4 py-1 text-center min-w-[120px] sm:min-w-[140px]">
                  <span className="text-sm font-semibold text-white block">
                    {monthNames[currentDate.getMonth()]}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    {currentDate.getFullYear()}
                  </span>
                </div>
                <Button onClick={nextMonth} variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg h-10 w-10">
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
              
              <Button onClick={goToToday} variant="outline" className="hidden sm:flex border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 h-12 sm:h-10">
                Today
              </Button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900/50 backdrop-blur border border-gray-800 p-4 sm:p-5 rounded-2xl flex items-center space-x-4"
            >
              <div className={`p-3 rounded-xl ${stats.totalPL >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                <DollarSign className={`w-6 h-6 ${stats.totalPL >= 0 ? 'text-emerald-500' : 'text-red-500'}`} />
              </div>
              <div>
                <p className="text-sm text-gray-400 font-medium">Net P/L</p>
                <p className={`text-xl sm:text-2xl font-bold ${stats.totalPL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {stats.totalPL >= 0 ? '+' : ''}{stats.totalPL.toFixed(2)}
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-900/50 backdrop-blur border border-gray-800 p-4 sm:p-5 rounded-2xl flex items-center space-x-4"
            >
              <div className="p-3 rounded-xl bg-blue-500/10">
                <BarChart className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400 font-medium">Total Trades</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{stats.totalTrades}</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900/50 backdrop-blur border border-gray-800 p-4 sm:p-5 rounded-2xl flex items-center space-x-4"
            >
              <div className="p-3 rounded-xl bg-purple-500/10">
                <TrendingUp className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400 font-medium">Win Rate</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{stats.winRate}%</p>
              </div>
            </motion.div>
          </div>

          {/* Main Calendar Grid */}
          <div className="bg-gray-900/30 border border-gray-800 rounded-3xl p-2 sm:p-4 lg:p-6 shadow-2xl overflow-hidden">
            <CalendarGrid 
              currentDate={currentDate} 
              calendarData={calendarData} 
              onDayClick={handleDayClick} 
            />
          </div>
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
