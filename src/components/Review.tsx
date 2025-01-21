import { useState } from "react";
import { useSettingsStore } from "../stores/settingsStore";
import { WeeklyMeetingLoad } from "./WeeklyMeetingLoad";
import { WeeklyFreeMeetingHours } from "./WeeklyFreeMeetingHours";
import { WeeklyMeetingTypeDistribution } from "./WeeklyMeetingTypeDistribution";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  getDateRanges,
  filterMeetingsByDateRange,
  DAYS_AGO,
} from "../services/calendarService";
import { DragHandleHorizontalIcon } from "@radix-ui/react-icons";

interface DashboardItem {
  id: string;
  title: string;
  component: JSX.Element;
}

export function Review() {
  const { meetings, targetHours } = useSettingsStore();
  const dateRanges = getDateRanges();
  const historicalMeetings = filterMeetingsByDateRange(
    meetings,
    dateRanges.review.start,
    dateRanges.review.end
  );

  const [dashboardItems, setDashboardItems] = useState<DashboardItem[]>([
    {
      id: "weekly-chart",
      title: "Weekly Meeting Hours",
      component: <WeeklyMeetingLoad meetings={historicalMeetings} />,
    },
    {
      id: "time-distribution",
      title: "Free Meeting Hours",
      component: (
        <WeeklyFreeMeetingHours
          meetings={historicalMeetings}
          targetHours={targetHours}
        />
      ),
    },
    {
      id: "meeting-type-distribution",
      title: "Meeting Type Distribution",
      component: (
        <WeeklyMeetingTypeDistribution meetings={historicalMeetings} />
      ),
    },
  ]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(dashboardItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setDashboardItems(items);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">
        Historical meetings from past {DAYS_AGO} days:{" "}
        {historicalMeetings.length}
      </h3>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="dashboard">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-6"
            >
              {dashboardItems.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="border rounded-lg p-6 bg-card"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <div
                          {...provided.dragHandleProps}
                          className="cursor-move"
                        >
                          <DragHandleHorizontalIcon className="w-4 h-4 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold">{item.title}</h3>
                      </div>
                      {item.component}
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
  );
}
