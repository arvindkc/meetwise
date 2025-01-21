import { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { StatsPanel } from "./StatsPanel";
import { MeetingCard } from "./MeetingCard";
import { useSettingsStore } from "../stores/settingsStore";
import type { Meeting, MeetingStats } from "../types";
import {
  getDateRanges,
  filterMeetingsByDateRange,
} from "../services/calendarService";
import { MeetingInsights } from "./MeetingInsights";

export function Plan() {
  const { meetings: storedMeetings, targetHours } = useSettingsStore();
  const dateRanges = getDateRanges();
  const filteredMeetings = filterMeetingsByDateRange(
    storedMeetings,
    dateRanges.plan.start,
    dateRanges.plan.end
  ).sort((a, b) => (a.rank || 0) - (b.rank || 0));
  const [meetings, setLocalMeetings] = useState<Meeting[]>(filteredMeetings);
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

  useEffect(() => {
    const filtered = filterMeetingsByDateRange(
      storedMeetings,
      dateRanges.plan.start,
      dateRanges.plan.end
    ).sort((a, b) => (a.rank || 0) - (b.rank || 0));
    setLocalMeetings(filtered);
  }, [storedMeetings]);

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

  const handleMeetingAction = async (action: string, meetingId: string) => {
    const store = useSettingsStore.getState();
    const currentStatus = store.meetingStatus?.[meetingId] || {
      needsCancel: false,
      needsShorten: false,
      needsReschedule: false,
      prepRequired: false,
    };

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

    await store.setMeetingStatus(meetingId, newStatus);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const store = useSettingsStore.getState();

    // Create new items array with updated positions
    const items = Array.from(meetings);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update ranks starting from a high number to ensure proper sorting
    const updatedItems = items.map((item, index) => ({
      ...item,
      rank: (index + 1) * 1000, // Using larger intervals for potential future insertions
    }));

    // Update store first, preserving the exact order of updatedItems
    const finalMeetings = store.meetings.map((meeting) => {
      const updatedMeeting = updatedItems.find(
        (item) => item.id === meeting.id
      );
      if (updatedMeeting) {
        return updatedMeeting;
      }
      // If meeting is not in updatedItems, preserve its original state
      return {
        ...meeting,
        rank: meeting.rank || 0, // Ensure all meetings have a rank
      };
    });

    // Important: Sort the meetings before updating the store
    const sortedMeetings = finalMeetings.sort(
      (a, b) => (a.rank || 0) - (b.rank || 0)
    );

    store.updateMeetings(sortedMeetings);
    setLocalMeetings(updatedItems);
  };

  return (
    <div className="space-y-6">
      <MeetingInsights meetings={meetings} />
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
                          displayRank={index + 1}
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
  );
}
