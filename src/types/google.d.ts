interface GoogleOAuthResponse {
  access_token: string;
  error?: string;
}

interface GoogleCalendarEvent {
  id: string;
  summary?: string;
  description?: string;
  location?: string;
  start: {
    dateTime: string;
    date?: string;
  };
  end: {
    dateTime: string;
    date?: string;
  };
  attendees?: { email: string }[];
  transparency?: string;
  eventType?: string;
}

interface Window {
  google: {
    accounts: {
      oauth2: {
        initTokenClient: (config: TokenClientConfig) => TokenClient;
      };
    };
  };
  gapi: {
    client: {
      init: (config: { discoveryDocs: string[] }) => Promise<void>;
      calendar: {
        events: {
          list: (params: {
            calendarId: string;
            timeMin: string;
            timeMax?: string;
            showDeleted: boolean;
            singleEvents: boolean;
            orderBy: string;
          }) => Promise<{ result: { items: GoogleCalendarEvent[] } }>;
        };
      };
    };
    load: (api: string, callback: () => void) => void;
  };
}

interface TokenClient {
  requestAccessToken: () => void;
  callback?: (response: GoogleOAuthResponse) => void;
}

interface TokenClientConfig {
  client_id: string;
  scope: string;
  callback: (response: GoogleOAuthResponse) => void;
}
