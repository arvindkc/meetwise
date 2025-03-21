import { CalendarEvent } from "@/types/calendar";

declare const gapi: {
  client: {
    oauth2: {
      userinfo: {
        get: () => Promise<{ result: { email: string } }>;
      };
    };
  };
};

const GOOGLE_API_SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/gmail.send",
];
const DISCOVERY_DOC =
  "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest";

interface TokenClient {
  requestAccessToken: () => void;
}

interface GoogleCalendarParams {
  calendarId: string;
  timeMin: string;
  timeMax?: string;
  showDeleted: boolean;
  singleEvents: boolean;
  orderBy: string;
  maxResults?: number;
}

export interface GoogleCalendarService {
  initializeGoogleApi: (clientId: string) => Promise<void>;
  authenticate: () => void;
  getCalendarEvents: (
    startDate?: Date,
    endDate?: Date
  ) => Promise<CalendarEvent[]>;
  getAuth: () => Promise<string>;
  getUserEmail: () => Promise<string>;
}

export class GoogleCalendarServiceImpl implements GoogleCalendarService {
  private tokenClient: TokenClient | null;
  private gapiInited: boolean;
  private accessToken: string | null;

  constructor() {
    this.tokenClient = null;
    this.gapiInited = false;
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
  }

  authenticate() {
    if (!this.tokenClient) {
      throw new Error("Google API not initialized");
    }
    return new Promise<void>((resolve, reject) => {
      try {
        this.tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          scope: GOOGLE_API_SCOPES.join(" "),
          callback: (response: GoogleOAuthResponse) => {
            if (response.error) {
              console.error("Google authentication error:", response.error);
              reject(new Error(`Authentication error: ${response.error}`));
              return;
            }
            this.accessToken = response.access_token;
            resolve();
          },
        });

        // Set a timeout in case the request hangs
        const timeoutId = setTimeout(() => {
          reject(
            new Error("Authentication request timed out. Please try again.")
          );
        }, 30000); // 30 seconds timeout

        this.tokenClient.requestAccessToken();

        // Clear timeout on promise resolution
        Promise.race([
          new Promise<void>((res) => {
            const originalResolve = resolve;
            resolve = () => {
              clearTimeout(timeoutId);
              originalResolve();
              res();
            };
          }),
          new Promise<void>((_, rej) => {
            const originalReject = reject;
            reject = (reason) => {
              clearTimeout(timeoutId);
              originalReject(reason);
              rej(reason);
            };
          }),
        ]).catch(() => {
          // This is just to handle the promise race
          // The actual error is handled by the reject function
        });
      } catch (error) {
        console.error("Error during Google authentication:", error);
        reject(
          error instanceof Error
            ? error
            : new Error("Unknown authentication error")
        );
      }
    });
  }

  async getCalendarEvents(
    startDate: Date = new Date(),
    endDate: Date = new Date()
  ) {
    if (!this.accessToken) {
      throw new Error("Not authenticated");
    }

    // Wait for GAPI to be fully initialized
    if (!this.gapiInited) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // console.log(
    //   "Fetching Google Calendar events from:",
    //   startDate.toISOString(),
    //   "to:",
    //   endDate.toISOString()
    // );
    const response = await window.gapi.client.calendar.events.list({
      calendarId: "primary",
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      maxResults: 2500,
      showDeleted: false,
      singleEvents: true,
      orderBy: "startTime",
    } as GoogleCalendarParams);

    // console.log("Total events before filtering:", response.result.items.length);

    const filteredEvents = response.result.items.filter((event) => {
      // Include events where user is the organizer or an attendee
      // This replaces the old hasOtherAttendees check that required multiple attendees
      const hasAttendees = event.attendees ? event.attendees.length > 0 : true;

      // Filter out all-day events (they have date but no dateTime)
      const isAllDay = event.start?.date && !event.start?.dateTime;

      // Filter out holidays
      const isHoliday =
        event.transparency === "transparent" ||
        event.eventType === "holiday" ||
        event.summary?.toLowerCase().includes("holiday");

      // Log events being filtered for debugging
      // if (isAllDay) {
      //   console.log("Filtered out all-day event:", event.summary);
      // }
      // if (isHoliday) {
      //   console.log("Filtered out holiday event:", event.summary);
      // }

      return hasAttendees && !isAllDay && !isHoliday;
    });

    // console.log("Total events after filtering:", filteredEvents.length);

    return filteredEvents.map((event) => ({
      id: event.id || crypto.randomUUID(),
      title: event.summary || "Untitled Event",
      startTime:
        event.start?.dateTime || event.start?.date || new Date().toISOString(),
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

  async getAuth() {
    await this.authenticate();
    if (!this.accessToken) throw new Error("Not authenticated");
    return this.accessToken;
  }

  async getUserEmail(): Promise<string> {
    const response = await gapi.client.oauth2.userinfo.get();
    return response.result.email;
  }
}

export const googleCalendarService: GoogleCalendarService =
  new GoogleCalendarServiceImpl();
