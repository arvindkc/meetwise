import { Meeting } from "@/types";

interface CalendarEvent {
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

export const transformCalendarEvents = (events: CalendarEvent[]): Meeting[] => {
  return events.map((event, index) => ({
    id: event.id,
    title: event.title,
    startTime: event.startTime,
    endTime: event.endTime,
    duration: event.duration,
    rank: index + 1,
    location: event.location,
    description: event.description,
    participants: event.participants,
    priority: index + 1,
    isImportant: false,
    needsPrep: false,
    dayOfWeek: event.dayOfWeek,
    comments: [],
    icon: "calendar",
    preworkIcon: "file-text",
    showActions: true,
    comment: "",
  }));
};

export const importCalendarData = async (file: File): Promise<Meeting[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const events = JSON.parse(e.target?.result as string);
        const meetings = transformCalendarEvents(events);
        resolve(meetings);
      } catch (error) {
        reject(new Error(`Failed to parse calendar data: ${error}`));
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
};
