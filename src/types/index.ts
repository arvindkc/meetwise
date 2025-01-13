export interface Meeting {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  duration: number;
  location: string;
  description: string;
  participants: string[];
  priority: number;
  isImportant: boolean;
  needsPrep: boolean;
  comments: Comment[];
  dayOfWeek: string;
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  timestamp: string;
}

export interface MeetingStats {
  totalHours: number;
  targetHours: number;
  availableHours: number;
  overHours: number;
}