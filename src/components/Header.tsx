import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  UploadIcon,
  EnvelopeClosedIcon,
  CalendarIcon,
} from "@radix-ui/react-icons";
import { Meeting } from "@/types";
import { importCalendarData } from "@/services/calendarService";
import { googleCalendarService } from "@/services/googleCalendarService";
import { importGoogleCalendar } from "@/services/calendarService";
import { sendEmail } from "@/services/emailService";
import { mockMeetings } from "@/mockData";

interface HeaderProps {
  meetings: Meeting[];
  setMeetings: (meetings: Meeting[]) => void;
  clearAllData: () => void;
  useMockData: boolean;
  setUseMockData: (useMockData: boolean) => void;
}

export function Header({
  meetings,
  setMeetings,
  clearAllData,
  useMockData,
  setUseMockData,
}: HeaderProps) {
  const [isImporting, setIsImporting] = useState(false);

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

  const handleClearData = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all data? This cannot be undone."
      )
    ) {
      clearAllData();
      setMeetings([]);
      setUseMockData(false);
    }
  };

  const handleMockData = () => {
    setMeetings(mockMeetings);
    setUseMockData(true);
  };

  return (
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
        <Button
          variant="outline"
          onClick={handleMockData}
          disabled={useMockData}
        >
          Use Mock Data
        </Button>
        <Button
          variant="outline"
          disabled={isImporting}
          onClick={async () => {
            try {
              setIsImporting(true);
              await googleCalendarService.authenticate();
              const meetings = await importGoogleCalendar();

              if (meetings.length === 0) {
                alert("No meetings found in the specified date range");
              } else {
                setMeetings(meetings);
              }
            } catch (error) {
              console.error("Error importing from Google Calendar:", error);
              alert("Failed to import calendar. Please try again.");
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
  );
}
