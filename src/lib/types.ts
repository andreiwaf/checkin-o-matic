
export interface CheckTimeRecord {
  id: string;
  type: 'check-in' | 'check-out';
  timestamp: Date;
  notes?: string;
}

export interface DayRecord {
  date: Date;
  records: CheckTimeRecord[];
  totalHours: number | null;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  created_at: string;
}
