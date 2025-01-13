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
  rank: number;
  isImportant: boolean;
  needsPrep: boolean;
  comments: MeetingComment[];
  dayOfWeek: string;
  icon?: string;
  preworkIcon?: string;
  showActions?: boolean;
  comment?: string;
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

export interface MeetingComment {
  id: string;
  text: string;
  author: string;
  timestamp: string;
}
