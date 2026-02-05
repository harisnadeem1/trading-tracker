
import React from 'react';
import { motion } from 'framer-motion';

const KPICard = ({ title, value, subValue, icon: Icon, trend, className, delay = 0 }) => {
  const isPositive = trend === 'up' || (typeof value === 'string' && !value.includes('-'));
  const isNegative = trend === 'down' || (typeof value === 'string' && value.includes('-'));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className={`bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-5 sm:p-6 relative overflow-hidden group touch-manipulation ${className}`}
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        {Icon && <Icon className="w-16 h-16" />}
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center space-x-2 mb-2">
          {Icon && <Icon className="w-5 h-5 text-gray-500" />}
          <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        </div>
        
        <div className="space-y-1">
          <p className="text-2xl font-bold text-white tracking-tight break-words">
            {value}
          </p>
          {subValue && (
            <p className={`text-xs font-medium ${
              subValue.includes('+') ? 'text-emerald-400' : 
              subValue.includes('-') ? 'text-red-400' : 'text-gray-500'
            }`}>
              {subValue}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default KPICard;
