export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  duration: number;
  location: string;
  description: string;
  participants: string[];
  dayOfWeek: string;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}
