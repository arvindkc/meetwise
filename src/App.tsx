import { useState, useEffect } from "react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import {
  UploadIcon,
  EnvelopeClosedIcon,
  CalendarIcon,
} from "@radix-ui/react-icons";
import { mockMeetings } from "./mockData";
import { sendEmail } from "@/services/emailService";
import { useSettingsStore } from "./stores/settingsStore";
import { importCalendarData } from "@/services/calendarService";
import { googleCalendarService } from "./services/googleCalendarService";
import { importGoogleCalendar } from "./services/calendarService";
import { Schedule } from "./components/Schedule";
import { Insights } from "./components/Insights";
import { cn } from "@/lib/utils";

function App() {
  const { meetings, setMeetings, clearAllData } = useSettingsStore();
  const [isImporting, setIsImporting] = useState(false);
  const [useMockData, setUseMockData] = useState(false);
  const [activeTab, setActiveTab] = useState<"schedule" | "insights">(
    "schedule"
  );

  useEffect(() => {
    googleCalendarService.initializeGoogleApi(
      import.meta.env.VITE_GOOGLE_CLIENT_ID
    );
  }, []);

  useEffect(() => {
    if (useMockData) {
      const rankedMeetings = mockMeetings.map((meeting, index) => ({
        ...meeting,
        rank: index + 1,
      }));
      setMeetings(rankedMeetings);
    }
  }, [useMockData, setMeetings]);

  const handleClearData = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all data? This cannot be undone."
      )
    ) {
      clearAllData();
      setMeetings([]);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importedMeetings = await importCalendarData(file);
      setMeetings(importedMeetings);
    } catch (error) {
      console.error("Error importing calendar:", error);
    }
  };

  const handleMockData = () => {
    if (!useMockData) {
      setMeetings(mockMeetings);
    } else {
      setMeetings([]);
    }
    setUseMockData(!useMockData);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">MeetWise</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <UploadIcon className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Input
              id="file-upload"
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button variant="outline" onClick={() => sendEmail(meetings)}>
              <EnvelopeClosedIcon className="w-4 h-4 mr-2" />
              Send Email
            </Button>
            <Button variant="destructive" onClick={handleClearData}>
              Clear All Data
            </Button>
            <Button variant="outline" onClick={handleMockData}>
              {useMockData ? "Use Real Data" : "Use Mock Data"}
            </Button>
            <Button
              variant="outline"
              disabled={isImporting}
              onClick={async () => {
                try {
                  setIsImporting(true);
                  await googleCalendarService.authenticate();
                  const meetings = await importGoogleCalendar();
                  setMeetings(meetings);
                } catch (error) {
                  console.error("Error importing from Google Calendar:", error);
                } finally {
                  setIsImporting(false);
                }
              }}
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              {isImporting ? "Importing..." : "Import from Google"}
            </Button>
          </div>
        </div>

        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab("schedule")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md",
              activeTab === "schedule"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
          >
            Schedule
          </button>
          <button
            onClick={() => setActiveTab("insights")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md",
              activeTab === "insights"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
          >
            Insights
          </button>
        </div>

        {activeTab === "schedule" ? <Schedule /> : <Insights />}
      </div>
    </div>
  );
}

export default App;
