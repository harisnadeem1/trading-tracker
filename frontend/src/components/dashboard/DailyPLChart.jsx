
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DailyPLChart = ({ data }) => {
  const [hoveredData, setHoveredData] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 bg-gray-900/30 rounded-2xl border border-gray-800 border-dashed text-sm">
        No trading data available for this period
      </div>
    );
  }

  // Chart dimensions and scales
  const height = 250;
  const padding = 20;
  
  const maxValue = Math.max(...data.map(d => Math.abs(d.value)), 1); // Prevent div by zero
  const zeroY = height / 2; // Center zero line for P/L

  const getBarHeight = (value) => (Math.abs(value) / maxValue) * (height / 2 - padding);
  const getBarY = (value) => value >= 0 ? zeroY - getBarHeight(value) : zeroY;

  return (
    <div className="w-full h-[250px] sm:h-[300px] relative">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
        <div className="w-full border-t border-white"></div>
      </div>
      
      <div className="w-full h-full flex items-end justify-between px-2 gap-1 overflow-x-auto overflow-y-hidden no-scrollbar">
        {data.map((item, index) => {
          const barHeight = getBarHeight(item.value);
          const isPositive = item.value >= 0;
          
          return (
            <div 
              key={index}
              className="relative flex-1 group h-full flex flex-col justify-center min-w-[10px]"
              onMouseEnter={() => setHoveredData(item)}
              onMouseLeave={() => setHoveredData(null)}
              onClick={() => setHoveredData(item)} // Touch support
            >
              {/* Invisible full-height container for hover detection */}
              <div className="absolute inset-0 z-10 bg-transparent" />

              {/* The Bar */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: Math.max(barHeight, 4) }} // Min height 4px for visibility
                transition={{ duration: 0.5, delay: index * 0.02 }}
                className={`w-full max-w-[40px] mx-auto rounded-sm ${
                  isPositive ? 'bg-emerald-500' : 'bg-red-500'
                } ${item.value === 0 ? 'bg-gray-700 h-[2px]' : ''}`}
                style={{
                  position: 'absolute',
                  top: getBarY(item.value),
                  height: Math.max(barHeight, 2)
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Zero Line Label */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 -ml-8 w-6 text-right hidden sm:block">
        $0
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute z-50 top-4 left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-700 shadow-xl rounded-lg p-3 text-center pointer-events-none min-w-[140px] max-w-[200px]"
          >
            <p className="text-gray-400 text-xs mb-1">
              {new Date(hoveredData.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
            <p className={`text-base sm:text-lg font-bold ${hoveredData.value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(hoveredData.value)}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DailyPLChart;
