
import React from 'react';
import DayTile from './DayTile';

const CalendarGrid = ({ currentDate, calendarData, onDayClick }) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Standard JS Date manipulation
  // Get first day of the month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  // Get number of days in the month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Previous month logic for padding
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Helper to format date key YYYY-MM-DD
  const formatDateKey = (y, m, d) => {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  };

  const gridItems = [];

  // 1. Previous Month Padding
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    gridItems.push(
      <DayTile 
        key={`prev-${day}`} 
        day={day} 
        month={month - 1}
        year={year}
        isCurrentMonth={false}
        onClick={() => {}} // Disable click for prev month or handle nav
      />
    );
  }

  // 2. Current Month Days
  const today = new Date();
  const isCurrentMonthActual = today.getMonth() === month && today.getFullYear() === year;

  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = formatDateKey(year, month, day);
    const dayData = calendarData[dateKey];
    const isToday = isCurrentMonthActual && day === today.getDate();

    gridItems.push(
      <DayTile
        key={`current-${day}`}
        day={day}
        month={month}
        year={year}
        data={dayData}
        isCurrentMonth={true}
        isToday={isToday}
        onClick={onDayClick}
      />
    );
  }

  // 3. Next Month Padding (to fill the grid to 35 or 42 cells)
  const remainingCells = 42 - gridItems.length; // Ensure 6 rows for consistency
  for (let day = 1; day <= remainingCells; day++) {
    gridItems.push(
      <DayTile
        key={`next-${day}`}
        day={day}
        month={month + 1}
        year={year}
        isCurrentMonth={false}
        onClick={() => {}} // Disable click or handle nav
      />
    );
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const mobileWeekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="w-full">
      {/* Week Headers */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
        {weekDays.map((day, idx) => (
          <div key={day} className="text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider py-2">
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{mobileWeekDays[idx]}</span>
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 lg:gap-3 auto-rows-fr">
        {gridItems}
      </div>
    </div>
  );
};

export default CalendarGrid;
