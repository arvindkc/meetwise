import { useState, useLayoutEffect, useCallback, useRef } from "react";
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
import { WeeklyPriorities } from "./WeeklyPriorities";

export function Plan() {
  const { targetHours } = useSettingsStore();
  const dateRanges = getDateRanges();

  // Group meetings by priority
  const [highPriorityMeetings, setHighPriorityMeetings] = useState<Meeting[]>(
    []
  );
  const [regularMeetings, setRegularMeetings] = useState<Meeting[]>([]);
  const [lowPriorityMeetings, setLowPriorityMeetings] = useState<Meeting[]>([]);

  // Lock flag to prevent infinite loops
  const isProcessingRef = useRef(false);

  // Stats state
  const [stats, setStats] = useState<MeetingStats>({
    totalHours: 0,
    targetHours,
    availableHours: targetHours,
    overHours: 0,
  });

  // Function to load meetings from store and update state
  const loadMeetings = useCallback(() => {
    if (isProcessingRef.current) return;

    try {
      isProcessingRef.current = true;

      const store = useSettingsStore.getState();
      const filtered = filterMeetingsByDateRange(
        store.meetings,
        dateRanges.plan.start,
        dateRanges.plan.end
      ).sort((a, b) => (a.rank || 0) - (b.rank || 0));

      // Sort into priority buckets
      const highPriority = filtered.filter((m) => m.priorityLevel === "high");
      const regular = filtered.filter(
        (m) => m.priorityLevel === "regular" || !m.priorityLevel
      );
      const lowPriority = filtered.filter((m) => m.priorityLevel === "low");

      // Update local state with filtered meetings
      setHighPriorityMeetings(highPriority);
      setRegularMeetings(regular);
      setLowPriorityMeetings(lowPriority);

      // Update stats
      const allMeetings = [...highPriority, ...regular, ...lowPriority];
      const totalHours = allMeetings.reduce(
        (acc, meeting) => acc + meeting.duration,
        0
      );

      setStats({
        totalHours,
        targetHours,
        availableHours: Math.max(0, targetHours - totalHours),
        overHours: Math.max(0, totalHours - targetHours),
      });
    } finally {
      isProcessingRef.current = false;
    }
  }, [dateRanges.plan.start, dateRanges.plan.end, targetHours]);

  // Use useLayoutEffect for initialization - only runs once
  useLayoutEffect(() => {
    loadMeetings();

    // Set up a subscription to the store - with correct signature
    const unsubscribe = useSettingsStore.subscribe(() => {
      // When store changes, reload meetings
      if (!isProcessingRef.current) {
        loadMeetings();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []); // Empty dependency array to run only on mount

  // Get all meetings across buckets for components that need the full list
  const getAllMeetings = useCallback((): Meeting[] => {
    return [
      ...highPriorityMeetings,
      ...regularMeetings,
      ...lowPriorityMeetings,
    ] as Meeting[];
  }, [highPriorityMeetings, regularMeetings, lowPriorityMeetings]);

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

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    const store = useSettingsStore.getState();

    // Make copies of all bucket states to modify
    const highPrioritySnapshot = [...highPriorityMeetings];
    const regularSnapshot = [...regularMeetings];
    const lowPrioritySnapshot = [...lowPriorityMeetings];

    // Handle sorting within the same bucket
    if (source.droppableId === destination.droppableId) {
      let targetBucket: Meeting[];
      let setTargetBucket: React.Dispatch<React.SetStateAction<Meeting[]>>;

      // Select the correct bucket
      if (source.droppableId === "high-priority") {
        targetBucket = highPrioritySnapshot;
        setTargetBucket = setHighPriorityMeetings;
      } else if (source.droppableId === "regular") {
        targetBucket = regularSnapshot;
        setTargetBucket = setRegularMeetings;
      } else {
        targetBucket = lowPrioritySnapshot;
        setTargetBucket = setLowPriorityMeetings;
      }

      // Perform the reordering
      const [reorderedItem] = targetBucket.splice(source.index, 1);
      targetBucket.splice(destination.index, 0, reorderedItem);

      // Update ranks
      const updatedBucket = targetBucket.map((item, index) => ({
        ...item,
        rank: (index + 1) * 1000,
      }));

      // Update UI immediately
      setTargetBucket(updatedBucket);

      // Prepare store update
      const allMeetings = [...store.meetings];
      for (const meeting of updatedBucket) {
        const storeIndex = allMeetings.findIndex((m) => m.id === meeting.id);
        if (storeIndex !== -1) {
          allMeetings[storeIndex] = {
            ...allMeetings[storeIndex],
            rank: meeting.rank,
          };
        }
      }

      // Update store
      try {
        isProcessingRef.current = true;
        await store.updateMeetings(allMeetings as Meeting[]);
      } catch (error) {
        console.error("Failed to update meetings:", error);
      } finally {
        isProcessingRef.current = false;
      }
    }
    // Handle moving between buckets
    else {
      let sourceBucket: Meeting[];
      let destBucket: Meeting[];
      let setSourceBucket: React.Dispatch<React.SetStateAction<Meeting[]>>;
      let setDestBucket: React.Dispatch<React.SetStateAction<Meeting[]>>;
      let priorityLevel: "high" | "regular" | "low";

      // Determine buckets and priority level
      if (source.droppableId === "high-priority") {
        sourceBucket = highPrioritySnapshot;
        setSourceBucket = setHighPriorityMeetings;
      } else if (source.droppableId === "regular") {
        sourceBucket = regularSnapshot;
        setSourceBucket = setRegularMeetings;
      } else {
        sourceBucket = lowPrioritySnapshot;
        setSourceBucket = setLowPriorityMeetings;
      }

      if (destination.droppableId === "high-priority") {
        destBucket = highPrioritySnapshot;
        setDestBucket = setHighPriorityMeetings;
        priorityLevel = "high";
      } else if (destination.droppableId === "regular") {
        destBucket = regularSnapshot;
        setDestBucket = setRegularMeetings;
        priorityLevel = "regular";
      } else {
        destBucket = lowPrioritySnapshot;
        setDestBucket = setLowPriorityMeetings;
        priorityLevel = "low";
      }

      // Perform the move
      const [movedItem] = sourceBucket.splice(source.index, 1);
      const updatedMovedItem = {
        ...movedItem,
        priorityLevel,
      };
      destBucket.splice(destination.index, 0, updatedMovedItem);

      // Update ranks for both buckets
      const updatedSourceBucket = sourceBucket.map(
        (item: Meeting, index: number) => ({
          ...item,
          rank: (index + 1) * 1000,
        })
      );

      const updatedDestBucket = destBucket.map(
        (item: Meeting, index: number) => ({
          ...item,
          rank: (index + 1) * 1000,
        })
      );

      // Update UI immediately - critical to prevent staleness
      setSourceBucket(updatedSourceBucket);
      setDestBucket(updatedDestBucket);

      // Prepare store update
      const allMeetings = [...store.meetings];

      // Update moved item in store
      const movedItemIndex = allMeetings.findIndex(
        (m) => m.id === movedItem.id
      );
      if (movedItemIndex !== -1) {
        allMeetings[movedItemIndex] = {
          ...allMeetings[movedItemIndex],
          priorityLevel,
          rank:
            updatedDestBucket.find((item) => item.id === movedItem.id)?.rank ||
            1000,
        };
      }

      // Update ranks for all affected items
      for (const item of updatedSourceBucket) {
        const index = allMeetings.findIndex((m) => m.id === item.id);
        if (index !== -1) {
          allMeetings[index] = {
            ...allMeetings[index],
            rank: item.rank,
          };
        }
      }

      for (const item of updatedDestBucket) {
        // Skip the moved item as we already handled it
        if (item.id === movedItem.id) continue;

        const index = allMeetings.findIndex((m) => m.id === item.id);
        if (index !== -1) {
          allMeetings[index] = {
            ...allMeetings[index],
            rank: item.rank,
          };
        }
      }

      try {
        // Mark as processing to prevent duplicate updates
        isProcessingRef.current = true;
        // Update store
        await store.updateMeetings(allMeetings as Meeting[]);
      } catch (error) {
        console.error("Failed to update meetings:", error);
      } finally {
        isProcessingRef.current = false;
      }
    }
  };

  // Helper for rendering a meeting card within a bucket
  const renderMeetingCard = (
    meeting: Meeting,
    index: number,
    bucket: Meeting[]
  ) => {
    const runningTotal = bucket
      .slice(0, index + 1)
      .reduce((acc, m) => acc + m.duration, 0);

    const currentTargetHours = useSettingsStore.getState().targetHours;

    return (
      <Draggable key={meeting.id} draggableId={meeting.id} index={index}>
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
              cost={
                meeting.participants.filter(
                  (p) => !p.includes("resource.calendar.google.com")
                ).length *
                meeting.duration *
                200
              }
            />
          </div>
        )}
      </Draggable>
    );
  };

  return (
    <div className="space-y-6">
      <WeeklyPriorities />
      <MeetingInsights meetings={getAllMeetings()} />
      <StatsPanel stats={stats} />

      <DragDropContext onDragEnd={handleDragEnd}>
        {/* High Priority Bucket */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2 text-amber-600">
            High Priority Meetings
          </h2>
          <Droppable droppableId="high-priority">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-1 min-h-[50px] bg-amber-50 p-2 rounded-md"
              >
                {highPriorityMeetings.map((meeting, index) =>
                  renderMeetingCard(meeting, index, highPriorityMeetings)
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>

        {/* Regular Meetings Bucket */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2 text-blue-600">
            Regular Meetings
          </h2>
          <Droppable droppableId="regular">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-1 min-h-[50px] bg-blue-50 p-2 rounded-md"
              >
                {regularMeetings.map((meeting, index) =>
                  renderMeetingCard(meeting, index, regularMeetings)
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>

        {/* Low Priority Bucket */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2 text-gray-600">
            Low Priority Meetings
          </h2>
          <Droppable droppableId="low-priority">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-1 min-h-[50px] bg-gray-50 p-2 rounded-md"
              >
                {lowPriorityMeetings.map((meeting, index) =>
                  renderMeetingCard(meeting, index, lowPriorityMeetings)
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>
    </div>
  );
}
