
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { CheckTimeRecord, DayRecord } from './types';

interface AppState {
  isOnline: boolean;
  currentSession: CheckTimeRecord | null;
  records: CheckTimeRecord[];
  selectedDate: Date;
  
  // Actions
  toggleStatus: () => void;
  addRecord: (type: 'check-in' | 'check-out', notes?: string) => void;
  setSelectedDate: (date: Date) => void;
  
  // Computed
  getDayRecords: (date?: Date) => DayRecord;
  getDaysWithRecords: (year: number, month: number) => number[];
  getCurrentMonthHours: () => number;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isOnline: false,
      currentSession: null,
      records: [],
      selectedDate: new Date(),
      
      toggleStatus: () => {
        const { isOnline, currentSession } = get();
        
        if (!isOnline) {
          // Check in
          const checkInRecord: CheckTimeRecord = {
            id: uuidv4(),
            type: 'check-in',
            timestamp: new Date()
          };
          
          set({
            isOnline: true,
            currentSession: checkInRecord,
            records: [...get().records, checkInRecord]
          });
        } else {
          // Check out
          if (currentSession) {
            const checkOutRecord: CheckTimeRecord = {
              id: uuidv4(),
              type: 'check-out',
              timestamp: new Date()
            };
            
            set({
              isOnline: false,
              currentSession: null,
              records: [...get().records, checkOutRecord]
            });
          }
        }
      },
      
      addRecord: (type, notes) => {
        const newRecord: CheckTimeRecord = {
          id: uuidv4(),
          type,
          timestamp: new Date(),
          notes
        };
        
        set({ records: [...get().records, newRecord] });
      },
      
      setSelectedDate: (date) => {
        set({ selectedDate: date });
      },
      
      getDayRecords: (date = new Date()) => {
        const { records } = get();
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        const dayRecords = records.filter(
          record => record.timestamp >= startOfDay && record.timestamp <= endOfDay
        ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        
        // Calculate total hours for the day
        let totalHours: number | null = null;
        if (dayRecords.length > 0) {
          let totalMilliseconds = 0;
          let lastCheckIn: CheckTimeRecord | null = null;
          
          for (const record of dayRecords) {
            if (record.type === 'check-in') {
              lastCheckIn = record;
            } else if (record.type === 'check-out' && lastCheckIn) {
              totalMilliseconds += record.timestamp.getTime() - lastCheckIn.timestamp.getTime();
              lastCheckIn = null;
            }
          }
          
          // If still checked in, don't include the uncompleted session
          if (lastCheckIn === null || dayRecords[dayRecords.length - 1].type === 'check-out') {
            totalHours = totalMilliseconds / (1000 * 60 * 60);
          }
        }
        
        return {
          date,
          records: dayRecords,
          totalHours
        };
      },
      
      getDaysWithRecords: (year, month) => {
        const { records } = get();
        const daysWithRecords = new Set<number>();
        
        records.forEach(record => {
          const recordDate = record.timestamp;
          if (recordDate.getFullYear() === year && recordDate.getMonth() === month) {
            daysWithRecords.add(recordDate.getDate());
          }
        });
        
        return Array.from(daysWithRecords).sort((a, b) => a - b);
      },
      
      getCurrentMonthHours: () => {
        const { records } = get();
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        let totalHours = 0;
        let lastCheckIn: CheckTimeRecord | null = null;
        
        const monthRecords = records.filter(
          record => record.timestamp >= startOfMonth && record.timestamp <= now
        ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        
        for (const record of monthRecords) {
          if (record.type === 'check-in') {
            lastCheckIn = record;
          } else if (record.type === 'check-out' && lastCheckIn) {
            const sessionHours = (record.timestamp.getTime() - lastCheckIn.timestamp.getTime()) / (1000 * 60 * 60);
            totalHours += sessionHours;
            lastCheckIn = null;
          }
        }
        
        return totalHours;
      }
    }),
    {
      name: 'checkin-app-storage',
      partialize: (state) => ({
        records: state.records.map(record => ({
          ...record,
          timestamp: record.timestamp.toISOString()
        }))
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert ISO strings back to Date objects
          state.records = state.records.map(record => ({
            ...record,
            timestamp: new Date(record.timestamp)
          }));
          
          // Check if we're still in a session
          const lastRecord = state.records[state.records.length - 1];
          if (lastRecord && lastRecord.type === 'check-in') {
            state.isOnline = true;
            state.currentSession = lastRecord;
          } else {
            state.isOnline = false;
            state.currentSession = null;
          }
        }
      }
    }
  )
);
