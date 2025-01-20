import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
} from "@radix-ui/react-icons";
import type { Meeting, MeetingComment } from "../types";
import { cn } from "../lib/utils";
import { useSettingsStore } from "../stores/settingsStore";
import { MeetingContent } from "@/components/MeetingContent";
import { parseMeetingContent } from "@/utils/meetingContentFormatter";

interface MeetingCardProps {
  meeting: Meeting;
  isOverTarget: boolean;
  onAction: (action: string, meetingId: string) => void;
  displayRank: number;
}

export function MeetingCard({
  meeting,
  isOverTarget,
  onAction,
  displayRank,
}: MeetingCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { meetingStatus = {} } = useSettingsStore();
  const status = meetingStatus[meeting.id] || {
    needsCancel: false,
    needsShorten: false,
    needsReschedule: false,
    prepRequired: false,
  };
  const {
    meetingComments = {},
    setMeetingComment,
    deleteMeetingComment,
    updateMeetingComment,
  } = useSettingsStore();
  const [comment, setComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const getStatusCount = () => {
    return Object.values(status).filter(Boolean).length;
  };

  const addComment = () => {
    if (comment.trim()) {
      const newComment = {
        id: Date.now().toString(),
        text: comment,
        author: "You",
        timestamp: new Date().toISOString(),
      };

      setMeetingComment(meeting.id, newComment);
      setComment("");
    }
  };

  const startEditing = (comment: MeetingComment) => {
    setEditingCommentId(comment.id);
    setEditText(comment.text);
  };

  const saveEdit = (commentId: string) => {
    if (editText.trim()) {
      updateMeetingComment(meeting.id, commentId, editText);
      setEditingCommentId(null);
      setEditText("");
    }
  };

  const comments = Array.isArray(meetingComments[meeting.id])
    ? meetingComments[meeting.id]
    : [];

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

  const hasPreRead =
    meeting.description &&
    parseMeetingContent(meeting.description).preReadLinks.length > 0;

  return (
    <Card
      className={cn(
        "mb-2 hover:shadow-lg transition-shadow duration-200",
        isOverTarget ? "border-red-500 border-2 bg-red-50" : "border-gray-200"
      )}
    >
      <CardHeader className="p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DragHandleHorizontalIcon className="w-4 h-4 text-gray-400 cursor-move" />
            <span className="text-base font-semibold">#{displayRank}</span>
            <span className="text-base">{meeting.title}</span>
            {hasPreRead && (
              <FileTextIcon
                className="h-4 w-4 text-blue-600"
                aria-label="Has pre-read materials"
              />
            )}
            <div className="flex items-center">
              <Users className="w-3 h-3 mr-1" />
              <span className="text-sm text-gray-600">
                {meeting.participants.length}
              </span>
            </div>
            {getStatusCount() > 0 && (
              <span className="bg-red-100 text-red-600 text-xs px-1.5 py-0.5 rounded-full">
                {getStatusCount()} action{getStatusCount() !== 1 ? "s" : ""}{" "}
                needed
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center text-gray-500 text-xs">
              <Clock className="w-3 h-3 mr-1" />
              <span>{formatDuration(meeting.duration)}</span>
              <span className="mx-1">•</span>
              <span>{formatDateTime(meeting.startTime)}</span>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? (
                <ChevronUpIcon className="w-4 h-4" />
              ) : (
                <ChevronDownIcon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="px-2 pb-2">
          {meeting.description && (
            <MeetingContent
              content={meeting.description}
              participants={meeting.participants}
            />
          )}
          <div className="mb-4 space-y-1 text-xs text-gray-600">
            <div className="flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              <span>{meeting.location}</span>
            </div>
            <div className="flex items-start">
              <Users className="w-3 h-3 mr-1 mt-0.5" />
              <span>{meeting.participants.join(", ")}</span>
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

            {comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 p-3 rounded-md">
                {editingCommentId === comment.id ? (
                  <div className="flex gap-2">
                    <Textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="flex-1"
                      rows={2}
                    />
                    <div className="flex flex-col gap-2">
                      <Button size="sm" onClick={() => saveEdit(comment.id)}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingCommentId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm">{comment.text}</p>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-500">
                        {comment.author} •{" "}
                        {new Date(comment.timestamp).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditing(comment)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700"
                          onClick={() =>
                            deleteMeetingComment(meeting.id, comment.id)
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}

            <div className="flex space-x-2">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1"
                rows={1}
              />
              <Button onClick={addComment}>Add</Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
