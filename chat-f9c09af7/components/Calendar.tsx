import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import './Calendar.css';

interface CalendarDay {
  date: number;
  month: number;
  year: number;
  isToday: boolean;
  isSelected: boolean;
  isCurrentMonth: boolean;
  hasEvents?: boolean;
}

interface CalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  showEvents?: boolean;
  compact?: boolean;
}

export const Calendar: React.FC<CalendarProps> = ({
  selectedDate = new Date(),
  onDateSelect,
  showEvents = true,
  compact = false
}) => {
  const [currentDate, setCurrentDate] = useState(new Date(selectedDate));
  const [selected, setSelected] = useState(selectedDate);
  const [days, setDays] = useState<CalendarDay[]>([]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const generateCalendarDays = (date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const today = new Date();
    const generatedDays: CalendarDay[] = [];

    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      generatedDays.push({
        date: currentDate.getDate(),
        month: currentDate.getMonth(),
        year: currentDate.getFullYear(),
        isToday:
          currentDate.getDate() === today.getDate() &&
          currentDate.getMonth() === today.getMonth() &&
          currentDate.getFullYear() === today.getFullYear(),
        isSelected:
          currentDate.getDate() === selected.getDate() &&
          currentDate.getMonth() === selected.getMonth() &&
          currentDate.getFullYear() === selected.getFullYear(),
        isCurrentMonth: currentDate.getMonth() === month,
        hasEvents: Math.random() > 0.7 // Random events for demo
      });
    }

    return generatedDays;
  };

  useEffect(() => {
    setDays(generateCalendarDays(currentDate));
  }, [currentDate, selected]);

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const handleDayClick = (day: CalendarDay) => {
    const newSelectedDate = new Date(day.year, day.month, day.date);
    setSelected(newSelectedDate);
    if (onDateSelect) {
      onDateSelect(newSelectedDate);
    }
  };

  return (
    <div className={`calendar ${compact ? 'calendar-compact' : ''}`}>
      {/* Calendar Header */}
      <div className="calendar-header">
        <div className="calendar-nav">
          <button
            className="calendar-nav-btn"
            onClick={handlePrevMonth}
            aria-label="Previous month"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="calendar-title">
            <h3 className="calendar-month">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
          </div>

          <button
            className="calendar-nav-btn"
            onClick={handleNextMonth}
            aria-label="Next month"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Week Days */}
      <div className="calendar-weekdays">
        {weekDays.map(day => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="calendar-days">
        {days.map((day, index) => (
          <button
            key={index}
            className={`calendar-day ${day.isToday ? 'calendar-day-today' : ''} ${
              day.isSelected ? 'calendar-day-selected' : ''
            } ${!day.isCurrentMonth ? 'calendar-day-other-month' : ''} ${
              day.hasEvents && showEvents ? 'calendar-day-has-events' : ''
            }`}
            onClick={() => handleDayClick(day)}
            disabled={!day.isCurrentMonth}
          >
            <span className="calendar-day-number">{day.date}</span>
            {day.hasEvents && showEvents && (
              <div className="calendar-day-indicator"></div>
            )}
          </button>
        ))}
      </div>

      {/* Calendar Footer */}
      {!compact && (
        <div className="calendar-footer">
          <div className="calendar-today-btn">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                const today = new Date();
                setCurrentDate(today);
                setSelected(today);
                if (onDateSelect) onDateSelect(today);
              }}
            >
              <CalendarIcon size={16} />
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};