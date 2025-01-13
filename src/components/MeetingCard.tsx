import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Clock,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Flag,
  BookOpen,
  MapPin,
  Users,
} from "lucide-react";
import type { Meeting } from "@/types";
import { cn } from "@/lib/utils";

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
        <GripVertical className="text-gray-400" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold">#{meeting.priority}</span>
              <h3 className="font-medium">{meeting.title}</h3>
              {meeting.isImportant && <Flag className="w-4 h-4 text-red-500" />}
              {meeting.needsPrep && (
                <BookOpen className="w-4 h-4 text-blue-500" />
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp /> : <ChevronDown />}
            </Button>
          </div>

          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
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
              <MapPin className="w-4 h-4" />
              <span>{meeting.location}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users className="w-4 h-4" />
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
