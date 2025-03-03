
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Clock, LogIn, LogOut, CheckSquare, Square } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { CheckTimeRecord } from "@/lib/types";
import { useState } from "react";

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

const TimeCard = () => {
  const { selectedDate, getDayRecords } = useAppStore();
  const { records, totalHours } = getDayRecords(selectedDate);
  const [newTask, setNewTask] = useState("");
  const [tasks, setTasks] = useState<{id: string; text: string; completed: boolean}[]>([]);
  
  const formatTime = (date: Date) => {
    return format(date, "h:mm a");
  };
  
  const formatDuration = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    
    return `${wholeHours}h ${minutes}m`;
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      setTasks([...tasks, {
        id: crypto.randomUUID(),
        text: newTask.trim(),
        completed: false
      }]);
      setNewTask("");
    }
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-panel rounded-xl p-6 flex-1 flex flex-col h-full"
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
      
      <div className="flex-1 overflow-auto">
        {records.length > 0 ? (
          <div className="space-y-4 mb-6">
            {records.map((record, index) => (
              <TimeRecordItem 
                key={record.id} 
                record={record}
                prevRecord={index > 0 ? records[index - 1] : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center text-muted-foreground text-sm mb-6">
            No activity recorded for this day
          </div>
        )}
      </div>
      
      <div className="mt-auto border-t pt-4">
        <h3 className="font-medium mb-3 flex items-center gap-2">
          <CheckSquare size={16} className="text-primary" />
          Tasks
        </h3>
        
        <form onSubmit={handleAddTask} className="flex mb-3">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a task..."
            className="flex-1 px-3 py-2 text-sm rounded-md border border-border focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
          <button 
            type="submit"
            className="ml-2 bg-primary text-primary-foreground px-3 py-2 rounded-md text-sm font-medium hover:bg-primary/90"
          >
            Add
          </button>
        </form>
        
        <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
          {tasks.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-4">
              No tasks added yet
            </div>
          ) : (
            tasks.map(task => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-2 hover:bg-muted/40 rounded-md group"
              >
                <button 
                  onClick={() => toggleTaskCompletion(task.id)}
                  className="flex-shrink-0 text-muted-foreground hover:text-primary transition-colors"
                >
                  {task.completed ? 
                    <CheckSquare size={18} className="text-primary" /> : 
                    <Square size={18} />
                  }
                </button>
                <span className={`flex-1 text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {task.text}
                </span>
              </motion.div>
            ))
          )}
        </div>
      </div>
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
