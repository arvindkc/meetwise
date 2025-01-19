import { Meeting } from "@/types";
import { CalendarEvent } from "@/types/calendar";

import { googleCalendarService } from "@/services/googleCalendarService";

// Constants for date ranges
const DAYS_AGO = 30;
const DAYS_AHEAD = 7;

export const getDateRanges = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today

  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + DAYS_AHEAD);
  nextWeek.setHours(23, 59, 59, 999); // End of last day

  const ninetyDaysAgo = new Date(today);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - DAYS_AGO);
  ninetyDaysAgo.setHours(0, 0, 0, 0);

  return {
    schedule: {
      start: today,
      end: nextWeek,
    },
    insights: {
      start: ninetyDaysAgo,
      end: new Date(today.getTime() - 24 * 60 * 60 * 1000), // Yesterday
    },
  };
};

export const importGoogleCalendar = async () => {
  try {
    const dateRanges = getDateRanges();
    const events = await googleCalendarService.getCalendarEvents(
      dateRanges.insights.start,
      dateRanges.schedule.end // Include future events
    );

    if (!events || events.length === 0) {
      return [];
    }

    return events.map((event, index) => ({
      ...event,
      rank: index + 1,
      isImportant: false,
      needsPrep: false,
      comments: [],
      icon: "calendar",
      preworkIcon: "file-text",
      showActions: true,
      comment: "",
    }));
  } catch (error) {
    console.error("Failed to import Google Calendar:", error);
    throw new Error(
      "Failed to import Google Calendar: " + (error as Error).message
    );
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

export const filterMeetingsByDateRange = (
  meetings: Meeting[],
  start: Date,
  end: Date
) => {
  console.log(
    "Filtering meetings:",
    meetings.length,
    "between",
    start,
    "and",
    end
  );

  const filtered = meetings
    .filter((meeting) => {
      const meetingTime = new Date(meeting.startTime).getTime();
      return meetingTime >= start.getTime() && meetingTime <= end.getTime();
    })
    .map((meeting, index) => ({
      ...meeting,
      rank: index + 1, // Reset rank to start from 1
    }));

  console.log("Filtered meetings:", filtered.length);
  return filtered;
};
