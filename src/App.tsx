import { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { UploadIcon, EnvelopeClosedIcon } from "@radix-ui/react-icons";
import { StatsPanel } from "./components/StatsPanel";
import { mockMeetings } from "./mockData";
import type { Meeting, MeetingStats } from "./types";
import { MeetingCard } from "./components/MeetingCard";
import { sendEmail } from "@/services/emailService";
import { useSettingsStore } from "./stores/settingsStore";
import { importCalendarData } from "@/services/calendarService";

function App() {
  const {
    meetings: storedMeetings,
    setMeetings,
    clearAllData,
    targetHours,
  } = useSettingsStore();
  const [meetings, setLocalMeetings] = useState<Meeting[]>(storedMeetings);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<MeetingStats>({
    totalHours: storedMeetings.reduce(
      (acc, meeting) => acc + meeting.duration,
      0
    ),
    targetHours,
    availableHours: Math.max(
      0,
      targetHours -
        storedMeetings.reduce((acc, meeting) => acc + meeting.duration, 0)
    ),
    overHours: Math.max(
      0,
      storedMeetings.reduce((acc, meeting) => acc + meeting.duration, 0) -
        targetHours
    ),
  });
  const [useMockData, setUseMockData] = useState<boolean>(false);

  useEffect(() => {
    updateStats(meetings);
  }, [targetHours, meetings]);

  const updateStats = (meetings: Meeting[]) => {
    const { targetHours } = useSettingsStore.getState();
    const totalHours = meetings.reduce(
      (acc, meeting) => acc + meeting.duration,
      0
    );
    const overHours = Math.max(0, totalHours - targetHours);
    const availableHours = Math.max(0, targetHours - totalHours);

    setStats({
      totalHours,
      targetHours,
      availableHours,
      overHours,
    });
  };

  const updateMeetings = (newMeetings: Meeting[]) => {
    setLocalMeetings(newMeetings);
    setMeetings(newMeetings);
  };

  useEffect(() => {
    try {
      if (useMockData) {
        const rankedMeetings = mockMeetings.map((meeting, index) => ({
          ...meeting,
          rank: index + 1,
        }));
        updateMeetings(rankedMeetings);
        updateStats(rankedMeetings);
      }
    } catch (error) {
      console.error("Error loading mock data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [useMockData]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importedMeetings = await importCalendarData(file);
      updateMeetings(importedMeetings);
      updateStats(importedMeetings);
    } catch (error) {
      console.error("Error importing calendar:", error);
      // Add user feedback here (e.g., toast notification)
    }
  };

  const handleMeetingAction = (action: string, meetingId: string) => {
    const store = useSettingsStore.getState();
    console.log("Current store state:", store);
    console.log("Action:", action, "MeetingId:", meetingId);

    const currentStatus = store.meetingStatus?.[meetingId] || {
      needsCancel: false,
      needsShorten: false,
      needsReschedule: false,
      prepRequired: false,
    };

    console.log("Current status:", currentStatus);

    // Update the status based on the action
    const newStatus = {
      ...currentStatus,
      needsCancel:
        action === "cancel"
          ? !currentStatus.needsCancel
          : currentStatus.needsCancel,
      needsShorten:
        action === "shorten"
          ? !currentStatus.needsShorten
          : currentStatus.needsShorten,
      needsReschedule:
        action === "reschedule"
          ? !currentStatus.needsReschedule
          : currentStatus.needsReschedule,
      prepRequired:
        action === "prep"
          ? !currentStatus.prepRequired
          : currentStatus.prepRequired,
    };

    console.log("New status:", newStatus);
    store.setMeetingStatus?.(meetingId, newStatus);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(meetings);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedItems = items.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

    updateMeetings(updatedItems);
    updateStats(updatedItems);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

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
            <Button
              variant="destructive"
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to clear all data? This cannot be undone."
                  )
                ) {
                  clearAllData();
                  setLocalMeetings([]);
                  updateStats([]);
                }
              }}
            >
              Clear All Data
            </Button>
            <Button
              variant="outline"
              onClick={() => setUseMockData(!useMockData)}
            >
              {useMockData ? "Use Real Data" : "Use Mock Data"}
            </Button>
          </div>
        </div>

        <StatsPanel stats={stats} />

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="meetings">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-1"
              >
                {meetings.map((meeting, index) => {
                  const runningTotal = meetings
                    .slice(0, index + 1)
                    .reduce((acc, m) => acc + m.duration, 0);

                  const currentTargetHours =
                    useSettingsStore.getState().targetHours;

                  return (
                    <Draggable
                      key={meeting.id}
                      draggableId={meeting.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <MeetingCard
                            meeting={meeting}
                            isOverTarget={runningTotal > currentTargetHours}
                            onAction={handleMeetingAction}
                          />
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}

export default App;
