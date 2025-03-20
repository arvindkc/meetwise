import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  UploadIcon,
  EnvelopeClosedIcon,
  CalendarIcon,
} from "@radix-ui/react-icons";
import { Meeting } from "@/types";
import {
  importCalendarData,
  importGoogleCalendar,
  setDaysAhead,
  getDaysBetween,
  DAYS_AGO,
} from "@/services/calendarService";
import { googleCalendarService } from "@/services/googleCalendarService";
import { db } from "@/services/db";
import { ExportInstructions } from "./ExportInstructions";
import { EmailDialog } from "./EmailDialog";
import { mockMeetings } from "@/mockData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "./ui/dialog";

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
  const [isClearing, setIsClearing] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [showEmailSuccess, setShowEmailSuccess] = useState(false);
  const [toDate, setToDate] = useState<Date>(getDefaultEndDate());
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Calculate default end date (7 days from now)
  function getDefaultEndDate(): Date {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date;
  }

  // Format date for date input
  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split("T")[0];
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

  const handleMockData = () => {
    setMeetings(mockMeetings);
    setUseMockData(true);
  };

  const handleGoogleImport = async () => {
    try {
      setIsImporting(true);
      setDatePickerOpen(false); // Close the date picker dialog

      // Update the DAYS_AHEAD parameter based on the selected end date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const daysAhead = getDaysBetween(today, toDate);
      setDaysAhead(daysAhead);

      await googleCalendarService.authenticate();

      // Create the date range with DAYS_AGO as start and the selected end date
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - DAYS_AGO); // Use the constant
      startDate.setHours(0, 0, 0, 0);

      const dateRange = {
        startDate: startDate,
        endDate: toDate,
      };

      const meetings = await importGoogleCalendar(dateRange);

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
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">MeetWise</h1>
        <ExportInstructions />
      </div>
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
        <Button
          variant="outline"
          onClick={handleMockData}
          disabled={useMockData}
        >
          <CalendarIcon className="w-4 h-4 mr-2" />
          Use Mock Data
        </Button>

        <Button
          variant="outline"
          disabled={isImporting}
          onClick={() => setDatePickerOpen(true)}
        >
          <CalendarIcon className="w-4 h-4 mr-2" />
          Import from Google
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

      <Dialog open={datePickerOpen} onOpenChange={setDatePickerOpen}>
        <DialogContent
          className="sm:max-w-[425px]"
          aria-describedby="date-picker-description"
        >
          <DialogHeader>
            <DialogTitle>Select End Date</DialogTitle>
            <DialogDescription id="date-picker-description">
              Choose the end date for importing Google Calendar events.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">
                Events will be imported from {DAYS_AGO} days ago until the
                selected date.
              </p>
              <label htmlFor="end-date" className="text-sm font-medium">
                End Date
              </label>
              <Input
                id="end-date"
                type="date"
                value={formatDateForInput(toDate)}
                onChange={(e) => setToDate(new Date(e.target.value))}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDatePickerOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGoogleImport} disabled={isImporting}>
              {isImporting ? "Importing..." : "Import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
