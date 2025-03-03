
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAppStore } from "@/lib/store";

const Calendar = () => {
  const { setSelectedDate, getDaysWithRecords } = useAppStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthsOfYear = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  const daysWithRecords = getDaysWithRecords(year, month);
  
  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };
  
  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };
  
  // Generate calendar days
  const calendarDays = [];
  
  // Add empty cells for days before the first day of month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(
      <div key={`empty-${i}`} className="h-10 w-10" />
    );
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const isToday = 
      date.getDate() === new Date().getDate() &&
      date.getMonth() === new Date().getMonth() &&
      date.getFullYear() === new Date().getFullYear();
    
    const hasRecords = daysWithRecords.includes(day);
    
    calendarDays.push(
      <motion.button
        key={`day-${day}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setSelectedDate(date)}
        className={`
          h-10 w-10 rounded-full flex items-center justify-center relative
          ${isToday ? 'font-bold' : ''}
          ${hasRecords ? 'text-primary' : ''}
        `}
      >
        {day}
        {isToday && (
          <div className="absolute inset-0 border-2 border-primary rounded-full" />
        )}
        {hasRecords && !isToday && (
          <div className="absolute bottom-0.5 h-1 w-1 bg-primary rounded-full" />
        )}
      </motion.button>
    );
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-panel rounded-xl p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <motion.h2 
          key={`${monthsOfYear[month]}-${year}`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-xl font-medium"
        >
          {monthsOfYear[month]} {year}
        </motion.h2>
        
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={prevMonth}
            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-secondary"
          >
            <ChevronLeft size={18} />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={nextMonth}
            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-secondary"
          >
            <ChevronRight size={18} />
          </motion.button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {daysOfWeek.map(day => (
          <div key={day} className="text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={`calendar-${month}-${year}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-7 gap-1 justify-items-center"
        >
          {calendarDays}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default Calendar;
