import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TimerIcon as Clock,
  Cross2Icon as X,
  TimerIcon as TimerOff,
  CalendarIcon as CalendarRange,
  ExclamationTriangleIcon as AlertTriangle,
  ChatBubbleIcon as MessageSquare,
  ChevronDownIcon,
  ChevronUpIcon,
  PersonIcon as Users,
  HomeIcon as MapPin,
  DragHandleHorizontalIcon,
  FileTextIcon,
  GlobeIcon as Globe,
} from "@radix-ui/react-icons";
import type { Meeting } from "../types";
import { cn } from "../lib/utils";
import { useSettingsStore } from "../stores/settingsStore";
import { MeetingContent } from "./MeetingContent";
import { MeetingComments } from "./MeetingComments";
import { parseMeetingContent } from "@/utils/meetingContentFormatter";

interface MeetingCardProps {
  meeting: Meeting;
  isOverTarget: boolean;
  onAction: (action: string, meetingId: string) => void;
  displayRank: number;
  cost?: number;
}

export function MeetingCard({
  meeting,
  isOverTarget,
  onAction,
  displayRank,
  cost,
}: MeetingCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { meetingStatus = {} } = useSettingsStore();
  const status = meetingStatus[meeting.id] || {
    needsCancel: false,
    needsShorten: false,
    needsReschedule: false,
    prepRequired: false,
  };

  const getStatusCount = () => {
    return Object.values(status).filter(Boolean).length;
  };

  const formatDuration = (hours: number) => {
    if (hours >= 1) {
      return `${Math.round(hours)}h`;
    }
    const minutes = Math.round(hours * 60);
    return `${minutes}m`;
  };

  const formatDateTime = (isoString: string) => {
    return new Date(isoString).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getCostIndicator = (cost: number): string => {
    if (cost >= 50000) return "$$$$";
    if (cost >= 20000) return "$$$";
    if (cost >= 5000) return "$$";
    return "";
  };

  const hasPreRead =
    meeting.description &&
    parseMeetingContent(meeting.description).preReadLinks.length > 0;

  const isExternalMeeting = () => {
    const filteredParticipants = meeting.participants.filter(
      (p) => !p.includes("resource.calendar.google.com")
    );
    const domains = filteredParticipants
      .map((email) => email.split("@")[1])
      .filter(Boolean);
    const uniqueDomains = new Set(domains);
    return uniqueDomains.size > 1;
  };

  return (
    <Card
      className={cn(
        "mb-2 hover:shadow-lg transition-shadow duration-200",
        isOverTarget ? "border-red-500 border-2 bg-red-50" : "border-gray-200"
      )}
    >
      <CardHeader className="p-2">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-2">
            <DragHandleHorizontalIcon className="w-4 h-4 text-gray-400 cursor-move flex-shrink-0" />
            <span className="text-base font-semibold flex-shrink-0">
              #{displayRank}
            </span>
            <span className="text-base font-medium truncate">
              {meeting.title}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {hasPreRead && (
              <FileTextIcon
                className="h-4 w-4 text-blue-600 flex-shrink-0"
                aria-label="Has pre-read materials"
              />
            )}
            {isExternalMeeting() && (
              <Globe
                className="h-4 w-4 text-purple-600 flex-shrink-0"
                aria-label="External meeting"
              />
            )}
            <div className="flex items-center flex-shrink-0">
              <Users className="w-3 h-3 mr-1" />
              <span className="text-xs text-gray-600">
                {meeting.participants.length}
              </span>
            </div>
            {cost !== undefined && (
              <div className="flex items-center flex-shrink-0">
                <span className="text-xs text-gray-600">
                  $
                  {cost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
                {getCostIndicator(cost) && (
                  <span className="font-bold text-amber-500 ml-1">
                    {getCostIndicator(cost)}
                  </span>
                )}
              </div>
            )}
            {getStatusCount() > 0 && (
              <span className="bg-red-100 text-red-600 text-xs px-1.5 py-0.5 rounded-full flex-shrink-0">
                {getStatusCount()} action{getStatusCount() !== 1 ? "s" : ""}{" "}
                needed
              </span>
            )}

            <div className="flex items-center text-gray-500 text-xs ml-auto flex-shrink-0">
              <Clock className="w-3 h-3 mr-1" />
              <span>{formatDuration(meeting.duration)}</span>
              <span className="mx-1">•</span>
              <span>{formatDateTime(meeting.startTime)}</span>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-500 hover:text-gray-700 ml-2"
              >
                {isExpanded ? (
                  <ChevronUpIcon className="w-4 h-4" />
                ) : (
                  <ChevronDownIcon className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="px-2 pb-2 bg-white">
          {meeting.description && (
            <MeetingContent
              content={meeting.description}
              participants={meeting.participants}
            />
          )}
          <div className="mb-4 space-y-1 text-xs text-gray-600">
            <div className="flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              <span className="text-sm">
                {meeting.location.split("https://").shift()?.trim() ||
                  meeting.location}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1 mb-4">
            <Button
              variant={status.needsCancel ? "default" : "outline"}
              onClick={() => onAction("cancel", meeting.id)}
              className="flex items-center justify-center"
            >
              <X className="w-4 h-4 mr-2" />
              {status.needsCancel ? "Cancel Requested" : "Request Cancel"}
            </Button>
            <Button
              variant={status.needsShorten ? "default" : "outline"}
              onClick={() => onAction("shorten", meeting.id)}
              className="flex items-center justify-center"
            >
              <TimerOff className="w-4 h-4 mr-2" />
              {status.needsShorten ? "Shorten Requested" : "Request Shorter"}
            </Button>
            <Button
              variant={status.needsReschedule ? "default" : "outline"}
              onClick={() => onAction("reschedule", meeting.id)}
              className="flex items-center justify-center"
            >
              <CalendarRange className="w-4 h-4 mr-2" />
              {status.needsReschedule
                ? "Reschedule Requested"
                : "Request Reschedule"}
            </Button>
            <Button
              variant={status.prepRequired ? "default" : "outline"}
              onClick={() => onAction("prep", meeting.id)}
              className="flex items-center justify-center"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              {status.prepRequired ? "Prep Required" : "Mark Prep Required"}
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <MessageSquare className="w-3 h-3 mr-1" />
              <h4 className="font-medium text-sm">Comments</h4>
            </div>
            <MeetingComments meetingId={meeting.id} />
          </div>
        </CardContent>
      )}
    </Card>
  );
}
