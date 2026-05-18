export interface MigraineEntry {
  id: string;
  date: string; // ISO string
  durationHours: number;
  severity: number; // 1-10
  prostrating: boolean; // Crucial for VA claims
  symptoms: string[];
  triggers: string[];
  medication: string;
  notes: string;
}

export type TabType = 'dashboard' | 'add' | 'history';
