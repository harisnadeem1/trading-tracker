
import React from 'react';
import { Calendar } from 'lucide-react';

const DateRangeSelector = ({ months, selectedMonth, onMonthChange }) => {
  const formatMonth = (monthStr) => {
    if (!monthStr) return 'All Time';
    const [year, month] = monthStr.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="flex items-center space-x-2 bg-gray-900 border border-gray-800 rounded-lg p-1 pr-3 w-full sm:w-auto h-11 sm:h-10">
      <div className="p-2 bg-gray-800 rounded-md">
        <Calendar className="w-4 h-4 text-emerald-500" />
      </div>
      <select
        value={selectedMonth || ''}
        onChange={(e) => onMonthChange(e.target.value || null)}
        className="bg-transparent border-none text-white text-sm font-medium focus:ring-0 cursor-pointer outline-none w-full sm:min-w-[140px]"
      >
        <option value="" className="bg-gray-900 text-white">All Time</option>
        {months.map(month => (
          <option key={month} value={month} className="bg-gray-900 text-white">
            {formatMonth(month)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DateRangeSelector;
