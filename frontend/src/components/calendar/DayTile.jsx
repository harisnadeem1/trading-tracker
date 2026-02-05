
import React from 'react';
import { motion } from 'framer-motion';

const DayTile = ({ 
  day, 
  month, 
  year, 
  data, 
  onClick, 
  isCurrentMonth = true,
  isToday = false 
}) => {
  if (!day) return <div className="aspect-square bg-transparent" />;

  const hasData = data && (data.trades > 0 || data.profitLoss !== 0 || data.notes);
  const isProfitable = data?.profitLoss > 0;
  const isLoss = data?.profitLoss < 0;
  
  // Base background
  let bgClass = "bg-gray-900";
  let borderClass = "border-gray-800";
  let textClass = "text-gray-400";

  // Dynamic styling based on P/L
  if (hasData) {
    if (isProfitable) {
      bgClass = "bg-emerald-500/10";
      borderClass = "border-emerald-500/30";
      textClass = "text-emerald-400";
    } else if (isLoss) {
      bgClass = "bg-red-500/10";
      borderClass = "border-red-500/30";
      textClass = "text-red-400";
    } else {
      bgClass = "bg-gray-800";
      borderClass = "border-gray-700";
      textClass = "text-gray-300";
    }
  }

  // Fade out days not in current month
  const opacityClass = isCurrentMonth ? "opacity-100" : "opacity-30 grayscale";

  return (
    <motion.button
      onClick={() => onClick(day, month, year)}
      whileHover={{ scale: 1.05, zIndex: 10 }}
      whileTap={{ scale: 0.95 }}
      className={`
        relative aspect-square flex flex-col justify-between p-1 sm:p-2 lg:p-3 rounded-lg sm:rounded-xl border transition-all duration-200 shadow-sm
        ${bgClass} ${borderClass} ${opacityClass}
        ${isToday ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-950' : ''}
        active:scale-95 touch-manipulation
        group overflow-hidden
      `}
    >
      <div className="flex justify-between items-start w-full">
        <span className={`text-xs sm:text-sm lg:text-base font-semibold ${isToday ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'}`}>
          {day}
        </span>
        {hasData && (
            <span className={`text-[9px] sm:text-[10px] lg:text-xs font-medium px-1 sm:px-1.5 py-0.5 rounded-full bg-black/20 ${textClass} scale-90 sm:scale-100 origin-top-right`}>
             {data.trades}t
            </span>
        )}
      </div>

      <div className="flex flex-col items-end w-full space-y-0.5 mt-auto">
        {hasData ? (
          <>
            <span className={`text-[10px] sm:text-xs lg:text-sm font-bold truncate max-w-full ${isProfitable ? 'text-emerald-400' : isLoss ? 'text-red-400' : 'text-gray-300'}`}>
              {data.profitLoss > 0 ? '+' : ''}{Math.round(data.profitLoss)}
            </span>
            {data.roi !== 0 && (
              <span className="text-[9px] text-gray-500 hidden md:inline-block">
                {data.roi > 0 ? '+' : ''}{data.roi}%
              </span>
            )}
          </>
        ) : (
          <span className="text-gray-700 text-[10px] sm:text-xs opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
            Add
          </span>
        )}
      </div>
    </motion.button>
  );
};

export default DayTile;
