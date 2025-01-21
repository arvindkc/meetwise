import { useState } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ChatBubbleIcon,
} from "@radix-ui/react-icons";
import { Button } from "./ui/button";
import { useSettingsStore } from "../stores/settingsStore";
import type { Meeting, MeetingRating } from "../types";
import { MeetingStarRating } from "@/components/MeetingStarRating";
import { MeetingComments } from "@/components/MeetingComments";

interface MeetingRaterProps {
  meeting: Meeting;
  existingRating?: MeetingRating;
}

export function MeetingRater({ meeting, existingRating }: MeetingRaterProps) {
  const [rating, setRating] = useState(existingRating?.rating || 0);
  const [isExpanded, setIsExpanded] = useState(false);
  const { setMeetingRating } = useSettingsStore();

  const handleRating = async (newRating: number) => {
    setRating(newRating);
    await setMeetingRating(meeting.id, {
      rating: newRating,
      comment: "",
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <div className="flex flex-col p-3 bg-card rounded-lg border">
      <div className="flex items-center justify-between">
        <MeetingHeader meeting={meeting} />
        <div className="flex items-center gap-4">
          <MeetingStarRating rating={rating} onRate={handleRating} />
          <ExpandButton
            isExpanded={isExpanded}
            onClick={() => setIsExpanded(!isExpanded)}
          />
        </div>
      </div>

      {isExpanded && <MeetingComments meetingId={meeting.id} />}
    </div>
  );
}

interface MeetingHeaderProps {
  meeting: Meeting;
}

function MeetingHeader({ meeting }: MeetingHeaderProps) {
  return (
    <div className="flex-1 min-w-0">
      <h4 className="text-sm font-medium truncate">{meeting.title}</h4>
      <p className="text-xs text-muted-foreground">
        {new Date(meeting.startTime).toLocaleDateString()} (
        {meeting.duration.toFixed(2)}h)
      </p>
    </div>
  );
}

interface ExpandButtonProps {
  isExpanded: boolean;
  onClick: () => void;
}

function ExpandButton({ isExpanded, onClick }: ExpandButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="flex items-center gap-1"
      onClick={onClick}
    >
      <ChatBubbleIcon className="w-4 h-4" />
      Add Note
      {isExpanded ? (
        <ChevronUpIcon className="w-4 h-4" />
      ) : (
        <ChevronDownIcon className="w-4 h-4" />
      )}
    </Button>
  );
}
