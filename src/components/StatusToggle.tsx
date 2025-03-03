
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { useAppStore } from "@/lib/store";

const StatusToggle = () => {
  const { isOnline, toggleStatus, currentSession } = useAppStore();
  const { toast } = useToast();
  const [sessionTime, setSessionTime] = useState<string>("00:00:00");
  
  useEffect(() => {
    let interval: number | null = null;
    
    if (isOnline && currentSession) {
      interval = window.setInterval(() => {
        const startTime = currentSession.timestamp;
        const now = new Date();
        const diffMs = now.getTime() - startTime.getTime();
        
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
        
        const formattedHours = hours.toString().padStart(2, '0');
        const formattedMinutes = minutes.toString().padStart(2, '0');
        const formattedSeconds = seconds.toString().padStart(2, '0');
        
        setSessionTime(`${formattedHours}:${formattedMinutes}:${formattedSeconds}`);
      }, 1000);
    } else {
      setSessionTime("00:00:00");
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOnline, currentSession]);
  
  const handleToggle = () => {
    toggleStatus();
    
    toast({
      title: isOnline ? "Checked out" : "Checked in",
      description: isOnline 
        ? "You have successfully checked out."
        : "You have successfully checked in.",
      duration: 3000,
    });
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-panel rounded-xl p-6 flex flex-col items-center"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isOnline ? "online" : "offline"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-5 text-center"
        >
          <div className="text-sm uppercase tracking-wider text-muted-foreground mb-2">
            Status
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div 
              className={`h-3 w-3 rounded-full ${isOnline ? 'bg-status-online animate-pulse' : 'bg-status-offline'}`}
            />
            <div className="font-medium">{isOnline ? "Online" : "Offline"}</div>
          </div>
          {isOnline && (
            <div className="text-sm text-muted-foreground">
              Current session: {sessionTime}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleToggle}
        className={`
          w-full py-3 px-6 rounded-lg font-medium transition-all duration-200
          ${isOnline 
            ? 'bg-white text-gray-800 border border-gray-200 hover:bg-gray-100' 
            : 'bg-primary text-white hover:bg-primary/90'
          }
        `}
      >
        {isOnline ? "Check out" : "Check in"}
      </motion.button>
    </motion.div>
  );
};

export default StatusToggle;
