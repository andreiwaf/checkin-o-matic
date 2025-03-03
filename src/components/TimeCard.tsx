
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Clock, LogIn, LogOut } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { CheckTimeRecord } from "@/lib/types";

const TimeCard = () => {
  const { selectedDate, getDayRecords } = useAppStore();
  const { records, totalHours } = getDayRecords(selectedDate);
  
  const formatTime = (date: Date) => {
    return format(date, "h:mm a");
  };
  
  const formatDuration = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    
    return `${wholeHours}h ${minutes}m`;
  };
  
  const getRecordIcon = (type: 'check-in' | 'check-out') => {
    return type === 'check-in' ? (
      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
        <LogIn size={16} />
      </div>
    ) : (
      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
        <LogOut size={16} />
      </div>
    );
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-panel rounded-xl p-6 flex-1"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium">
          {format(selectedDate, "MMMM d, yyyy")}
        </h2>
        
        {totalHours !== null && (
          <div className="flex items-center gap-2 text-sm">
            <Clock size={14} className="text-muted-foreground" />
            <span>Total: {formatDuration(totalHours)}</span>
          </div>
        )}
      </div>
      
      {records.length > 0 ? (
        <div className="space-y-4">
          {records.map((record, index) => (
            <TimeRecordItem 
              key={record.id} 
              record={record}
              prevRecord={index > 0 ? records[index - 1] : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
          No activity recorded for this day
        </div>
      )}
    </motion.div>
  );
};

interface TimeRecordItemProps {
  record: CheckTimeRecord;
  prevRecord?: CheckTimeRecord;
}

const TimeRecordItem = ({ record, prevRecord }: TimeRecordItemProps) => {
  const isPair = prevRecord && 
                 prevRecord.type === 'check-in' && 
                 record.type === 'check-out';
  
  let duration: string | null = null;
  
  if (isPair) {
    const diffMs = record.timestamp.getTime() - prevRecord.timestamp.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    duration = diffHours.toFixed(1) + 'h';
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-4"
    >
      {getRecordIcon(record.type)}
      
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">
            {record.type === 'check-in' ? 'Checked in' : 'Checked out'}
          </h3>
          
          {isPair && duration && (
            <span className="text-xs px-2 py-1 bg-secondary rounded-full">
              {duration}
            </span>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground">
          {format(record.timestamp, "h:mm a")}
        </div>
      </div>
    </motion.div>
  );
};

export default TimeCard;
