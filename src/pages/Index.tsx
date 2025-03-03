
import { motion } from "framer-motion";
import Header from "@/components/Header";
import StatusToggle from "@/components/StatusToggle";
import Calendar from "@/components/Calendar";
import TimeCard from "@/components/TimeCard";
import { useAppStore } from "@/lib/store";

const Index = () => {
  const { getCurrentMonthHours } = useAppStore();
  const totalHoursThisMonth = getCurrentMonthHours();
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-secondary">
      <Header />
      
      <main className="flex-1 px-8 pb-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="glass-panel rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-medium">Monthly Summary</h2>
              <div className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                {totalHoursThisMonth.toFixed(1)} hours this month
              </div>
            </div>
            
            <p className="text-muted-foreground text-sm">
              Track your time and manage your work schedule efficiently. Check in when you start working
              and check out when you're done.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-8">
              <StatusToggle />
              <Calendar />
            </div>
            
            <div className="md:col-span-2">
              <TimeCard />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
