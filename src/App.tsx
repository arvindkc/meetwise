import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { UploadIcon, DownloadIcon } from "@radix-ui/react-icons";
import { StatsPanel } from "./components/StatsPanel";
import { mockMeetings } from "./mockData";
import type { Meeting, MeetingStats } from "./types";
import { MeetingCard } from "./components/MeetingCard";

function App() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<MeetingStats>({
    totalHours: 0,
    targetHours: 40,
    availableHours: 40,
    overHours: 0,
  });

  const updateStats = (meetings: Meeting[]) => {
    const totalHours = meetings.reduce(
      (acc, meeting) => acc + meeting.duration,
      0
    );
    const overHours = Math.max(0, totalHours - stats.targetHours);
    const availableHours = Math.max(0, stats.targetHours - totalHours);

    setStats({
      totalHours,
      targetHours: stats.targetHours,
      availableHours,
      overHours,
    });
  };

  useEffect(() => {
    try {
      const rankedMeetings = mockMeetings.map((meeting, index) => ({
        ...meeting,
        rank: index + 1,
      }));
      setMeetings(rankedMeetings);
      updateStats(rankedMeetings);
    } catch (error) {
      console.error("Error loading mock data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedMeetings = JSON.parse(e.target?.result as string);
          setMeetings(importedMeetings);
          updateStats(importedMeetings);
        } catch (error) {
          console.error("Error parsing file:", error);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleMeetingAction = (action: string, meetingId: string) => {
    console.log(`Action ${action} for meeting ${meetingId}`);
  };

  const exportData = () => {
    const dataStr = JSON.stringify(meetings, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = "meetings.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(meetings);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedItems = items.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

    setMeetings(updatedItems);
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
          <h1 className="text-2xl font-bold">Meeting Manager</h1>
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
            <Button variant="outline" onClick={exportData}>
              <DownloadIcon className="w-4 h-4 mr-2" />
              Export
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
                className="space-y-4"
              >
                {meetings.map((meeting, index) => (
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
                          isOverTarget={
                            stats.totalHours > stats.targetHours &&
                            index >= Math.floor(stats.targetHours)
                          }
                          onAction={handleMeetingAction}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
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
