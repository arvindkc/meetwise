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
} from "@radix-ui/react-icons";
import type { Meeting, MeetingComment } from "../types";
import { cn } from "../lib/utils";
import { useSettingsStore } from "../stores/settingsStore";

interface MeetingCardProps {
  meeting: Meeting;
  isOverTarget: boolean;
  onAction: (action: string, meetingId: string) => void;
}

export function MeetingCard({ meeting, isOverTarget }: MeetingCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [status, setStatus] = useState({
    needsCancel: false,
    needsShorten: false,
    needsReschedule: false,
    prepRequired: false,
  });
  const {
    meetingComments = {},
    setMeetingComment,
    deleteMeetingComment,
    updateMeetingComment,
  } = useSettingsStore();
  const [comment, setComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const toggleStatus = (key: keyof typeof status) => {
    setStatus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

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

  return (
    <Card
      className={cn(
        "mb-4 hover:shadow-lg transition-shadow duration-200",
        isOverTarget && "border-red-500"
      )}
    >
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-lg font-semibold">{meeting.priority}</span>
            <span className="text-lg">{meeting.title}</span>
            {getStatusCount() > 0 && (
              <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                {getStatusCount()} action{getStatusCount() !== 1 ? "s" : ""}{" "}
                needed
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-gray-500 text-sm">
              <Clock className="w-4 h-4 mr-1" />
              <span>{meeting.duration}h</span>
              <span className="mx-2">•</span>
              <span>{meeting.dayOfWeek}</span>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? (
                <ChevronUpIcon className="w-5 h-5" />
              ) : (
                <ChevronDownIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="px-4 pb-4">
          <div className="mb-6 space-y-2 text-sm text-gray-600">
            <p>{meeting.description}</p>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{meeting.location}</span>
            </div>
            <div className="flex items-start">
              <Users className="w-4 h-4 mr-2 mt-1" />
              <span>{meeting.participants.join(", ")}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-6">
            <Button
              variant={status.needsCancel ? "default" : "outline"}
              onClick={() => toggleStatus("needsCancel")}
              className="flex items-center justify-center"
            >
              <X className="w-4 h-4 mr-2" />
              {status.needsCancel ? "Cancel Requested" : "Request Cancel"}
            </Button>
            <Button
              variant={status.needsShorten ? "default" : "outline"}
              onClick={() => toggleStatus("needsShorten")}
              className="flex items-center justify-center"
            >
              <TimerOff className="w-4 h-4 mr-2" />
              {status.needsShorten ? "Shorten Requested" : "Request Shorter"}
            </Button>
            <Button
              variant={status.needsReschedule ? "default" : "outline"}
              onClick={() => toggleStatus("needsReschedule")}
              className="flex items-center justify-center"
            >
              <CalendarRange className="w-4 h-4 mr-2" />
              {status.needsReschedule
                ? "Reschedule Requested"
                : "Request Reschedule"}
            </Button>
            <Button
              variant={status.prepRequired ? "default" : "outline"}
              onClick={() => toggleStatus("prepRequired")}
              className="flex items-center justify-center"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              {status.prepRequired ? "Prep Required" : "Mark Prep Required"}
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <MessageSquare className="w-4 h-4 mr-2" />
              <h4 className="font-medium">Comments</h4>
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
