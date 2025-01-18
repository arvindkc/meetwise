import { Meeting } from "@/types";
import { CalendarEvent } from "@/types/calendar";

import { googleCalendarService } from "@/services/googleCalendarService";

export const importGoogleCalendar = async (
  startDate?: Date,
  endDate?: Date
) => {
  try {
    const events = await googleCalendarService.getCalendarEvents(
      startDate,
      endDate
    );
    if (!events || events.length === 0) {
      throw new Error("No calendar events found");
    }
    return transformCalendarEvents(events);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to import Google Calendar: ${errorMessage}`);
  }
};

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
