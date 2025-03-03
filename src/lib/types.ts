
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
