import { CalendarEvent } from "@/types/calendar";

const GOOGLE_API_SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];
const DISCOVERY_DOC =
  "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest";

interface TokenClient {
  requestAccessToken: () => void;
}

export interface GoogleCalendarService {
  initializeGoogleApi: (clientId: string) => Promise<void>;
  authenticate: () => void;
  getCalendarEvents: (
    startDate?: Date,
    endDate?: Date
  ) => Promise<CalendarEvent[]>;
}

class GoogleCalendarServiceImpl implements GoogleCalendarService {
  private tokenClient: TokenClient | null;
  private gapiInited: boolean;
  private gisInited: boolean;
  private accessToken: string | null;

  constructor() {
    this.tokenClient = null;
    this.gapiInited = false;
    this.gisInited = false;
    this.accessToken = null;
  }

  async initializeGoogleApi(clientId: string) {
    if (!clientId) {
      throw new Error("Google Client ID not configured");
    }

    const loadGapiScript = new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://apis.google.com/js/api.js";
      script.onload = resolve;
      document.head.appendChild(script);
    });

    const loadGisScript = new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.onload = resolve;
      document.head.appendChild(script);
    });

    await Promise.all([loadGapiScript, loadGisScript]);
    await this.initializeGapiClient();
    this.initializeGisClient(clientId);
  }

  async initializeGapiClient() {
    await window.gapi.load("client", async () => {
      await window.gapi.client.init({
        discoveryDocs: [DISCOVERY_DOC],
      });
      this.gapiInited = true;
    });
  }

  initializeGisClient(clientId: string) {
    this.tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: GOOGLE_API_SCOPES.join(" "),
      callback: (response) => {
        if (response.error) return;
        this.accessToken = response.access_token;
      },
    });
    this.gisInited = true;
  }

  authenticate() {
    if (!this.tokenClient) {
      throw new Error("Google API not initialized");
    }
    return new Promise<void>((resolve) => {
      this.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: GOOGLE_API_SCOPES.join(" "),
        callback: (response: GoogleOAuthResponse) => {
          if (response.error) return;
          this.accessToken = response.access_token;
          resolve();
        },
      });
      this.tokenClient.requestAccessToken();
    });
  }

  async getCalendarEvents(startDate: Date = new Date(), endDate?: Date) {
    if (!this.accessToken) {
      throw new Error("Not authenticated");
    }

    // Default end date to end of next week if not provided
    const defaultEndDate = new Date();
    defaultEndDate.setDate(defaultEndDate.getDate() + 7); // 1 week from today

    const timeMin = startDate.toISOString();
    const timeMax = (endDate || defaultEndDate).toISOString();

    // Wait for GAPI to be fully initialized
    if (!this.gapiInited) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const response = await window.gapi.client.calendar.events.list({
      calendarId: "primary",
      timeMin,
      timeMax,
      showDeleted: false,
      singleEvents: true,
      orderBy: "startTime",
    });

    return response.result.items
      .filter((event) => {
        // Filter out events with no other attendees
        const hasOtherAttendees = (event.attendees?.length ?? 0) > 1;

        // Filter out all-day events (they have date but no dateTime)
        const isAllDay = event.start?.date && !event.start?.dateTime;

        // Filter out holidays (usually marked with 'holiday' in transparency or eventType)
        const isHoliday =
          event.transparency === "transparent" ||
          event.eventType === "holiday" ||
          event.summary?.toLowerCase().includes("holiday");

        return hasOtherAttendees && !isAllDay && !isHoliday;
      })
      .map((event) => ({
        id: event.id || crypto.randomUUID(),
        title: event.summary || "Untitled Event",
        startTime:
          event.start?.dateTime ||
          event.start?.date ||
          new Date().toISOString(),
        endTime:
          event.end?.dateTime || event.end?.date || new Date().toISOString(),
        duration:
          event.start?.dateTime && event.end?.dateTime
            ? (new Date(event.end.dateTime).getTime() -
                new Date(event.start.dateTime).getTime()) /
              (1000 * 60 * 60)
            : 1,
        location: event.location || "",
        description: event.description || "",
        participants: event.attendees?.map((a) => a.email) || [],
        dayOfWeek: event.start?.dateTime
          ? new Date(event.start.dateTime).toLocaleDateString("en-US", {
              weekday: "long",
            })
          : new Date().toLocaleDateString("en-US", { weekday: "long" }),
      }));
  }
}

export const googleCalendarService: GoogleCalendarService =
  new GoogleCalendarServiceImpl();