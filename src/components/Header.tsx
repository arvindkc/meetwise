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
import { db } from "@/services/db";
import { ExportInstructions } from "./ExportInstructions";
import { EmailDialog } from "./EmailDialog";
// import { mockMeetings } from "@/mockData";

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
}: // useMockData,
// setUseMockData,
HeaderProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [showEmailSuccess, setShowEmailSuccess] = useState(false);

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

  const handleClearData = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear all data? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setIsClearing(true);
      await db.clearAll();
      clearAllData();
    } catch (error) {
      console.error("Failed to clear data:", error);
    } finally {
      setIsClearing(false);
    }
  };

  //   const handleMockData = () => {
  //     setMeetings(mockMeetings);
  //     setUseMockData(true);
  //   };

  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold">MeetWise</h1>
      <div className="flex gap-2">
        <div className="flex items-center">
          <Button
            variant="outline"
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            <UploadIcon className="w-4 h-4 mr-2" />
            Import
          </Button>
          <ExportInstructions />
        </div>
        <Input
          id="file-upload"
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileUpload}
        />
        <Button variant="outline" onClick={() => setEmailDialogOpen(true)}>
          <EnvelopeClosedIcon className="w-4 h-4 mr-2" />
          {showEmailSuccess ? "Email Sent!" : "Send Email"}
        </Button>
        <Button
          variant="outline"
          onClick={handleClearData}
          disabled={isClearing}
          className="text-destructive hover:text-destructive"
        >
          {isClearing ? "Clearing..." : "Clear Data"}
        </Button>

        {/* Removing mock data from the UI for now */}
        {/* <Button
          variant="outline"
          onClick={handleMockData}
          disabled={useMockData}
        >
          Use Mock Data
        </Button> */}
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

      <EmailDialog
        meetings={meetings}
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        onSuccess={() => {
          setShowEmailSuccess(true);
          setTimeout(() => setShowEmailSuccess(false), 2000);
        }}
      />
    </div>
  );
}
