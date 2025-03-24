import { Meeting } from "@/types";
import { CalendarEvent } from "@/types/calendar";

import { googleCalendarService } from "@/services/googleCalendarService";

// Constants for date ranges
export const DAYS_AGO = 90;
export let DAYS_AHEAD = 7;

// Function to update DAYS_AHEAD
export const setDaysAhead = (days: number) => {
  DAYS_AHEAD = days;
  return DAYS_AHEAD;
};

// Calculate days between two dates
export const getDaysBetween = (startDate: Date, endDate: Date): number => {
  const difference = endDate.getTime() - startDate.getTime();
  return Math.ceil(difference / (1000 * 3600 * 24));
};

export const getDateRanges = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + DAYS_AHEAD);
  nextWeek.setHours(23, 59, 59, 999);

  const ninetyDaysAgo = new Date(today);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - DAYS_AGO);
  ninetyDaysAgo.setHours(0, 0, 0, 0);

  const lastWeekStart = new Date(today);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  lastWeekStart.setHours(0, 0, 0, 0);

  return {
    plan: {
      start: today,
      end: nextWeek,
    },
    review: {
      start: ninetyDaysAgo,
      end: new Date(today.getTime() - 24 * 60 * 60 * 1000),
    },
    rate: {
      start: lastWeekStart,
      end: today,
    },
  };
};

export const importGoogleCalendar = async (dateRange?: {
  startDate: Date;
  endDate: Date;
}) => {
  try {
    // If no date range is provided, use the default date ranges
    const dateRanges = getDateRanges();

    // Use provided date range or default to fetching both review and planned meetings
    const startDate = dateRange?.startDate || dateRanges.review.start;
    const endDate = dateRange?.endDate || dateRanges.plan.end;

    // console.log(
    //   "Fetching Google Calendar events from:",
    //   startDate.toISOString(),
    //   "to:",
    //   endDate.toISOString()
    // );

    const events = await googleCalendarService.getCalendarEvents(
      startDate,
      endDate
    );

    // console.log("Fetched events count:", events?.length);

    if (!events || events.length === 0) {
      return [];
    }

    const transformedEvents = events.map((event, index) => ({
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

    // console.log("Transformed events count:", transformedEvents.length);
    return transformedEvents;
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
    rating: 0,
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
  const filtered = meetings
    .filter((meeting) => {
      const meetingTime = new Date(meeting.startTime).getTime();
      return meetingTime >= start.getTime() && meetingTime <= end.getTime();
    })
    .filter((meeting) => {
      // Count human participants (excluding room resources)
      const humanParticipants = meeting.participants.filter(
        (participant) => !participant.includes("resource.calendar.google.com")
      );
      // Filter out meetings with only one human participant
      return humanParticipants.length > 1;
    })
    .map((meeting, index) => ({
      ...meeting,
      rank: index + 1, // Reset rank to start from 1
    }));
  return filtered;
};
