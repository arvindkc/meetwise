import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import {
  TimerIcon as ClockIcon,
  DragHandleHorizontalIcon as DragHandleDots2Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  StarFilledIcon as FlagIcon,
  FileTextIcon as ReaderIcon,
  HomeIcon,
  PersonIcon,
} from "@radix-ui/react-icons";
import type { Meeting } from "../types";
import { cn } from "../lib/utils";

interface MeetingCardProps {
  meeting: Meeting;
  isOverTarget: boolean;
  onAction: (action: string, meetingId: string) => void;
}

export function MeetingCard({
  meeting,
  isOverTarget,
  onAction,
}: MeetingCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card
      className={cn(
        "p-4 mb-2 cursor-move relative",
        isOverTarget && "border-red-500",
        isExpanded && "shadow-lg"
      )}
    >
      <div className="flex items-center gap-2">
        <DragHandleDots2Icon className="text-gray-400" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold">#{meeting.priority}</span>
              <h3 className="font-medium">{meeting.title}</h3>
              {meeting.isImportant && (
                <FlagIcon className="w-4 h-4 text-red-500" />
              )}
              {meeting.needsPrep && (
                <ReaderIcon className="w-4 h-4 text-blue-500" />
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </Button>
          </div>

          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <ClockIcon className="w-4 h-4" />
              <span>{meeting.duration}h</span>
            </div>
            <span>{meeting.dayOfWeek}</span>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">{meeting.description}</p>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <HomeIcon className="w-4 h-4" />
              <span>{meeting.location}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <PersonIcon className="w-4 h-4" />
              <span>{meeting.participants.join(", ")}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => onAction("cancel", meeting.id)}>
              Cancel Meeting
            </Button>
            <Button size="sm" onClick={() => onAction("shorten", meeting.id)}>
              Request Shorter
            </Button>
            <Button
              size="sm"
              onClick={() => onAction("reschedule", meeting.id)}
            >
              Reschedule
            </Button>
          </div>

          {meeting.comments.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="font-medium">Comments</h4>
              {meeting.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="text-sm bg-gray-50 p-2 rounded"
                >
                  <div className="flex justify-between text-gray-500">
                    <span>{comment.author}</span>
                    <span>
                      {new Date(comment.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p>{comment.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
