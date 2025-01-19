import { useState } from "react";
import {
  StarFilledIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChatBubbleIcon,
} from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { useSettingsStore } from "../stores/settingsStore";
import type { MeetingComment } from "../types";

interface MeetingRaterProps {
  meeting: {
    id: string;
    title: string;
    startTime: string;
    duration: number;
  };
}

export function MeetingRater({ meeting }: MeetingRaterProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const {
    setMeetingRating,
    meetingComments = {},
    setMeetingComment,
    deleteMeetingComment,
    updateMeetingComment,
  } = useSettingsStore();

  const handleRating = async (newRating: number) => {
    setRating(newRating);
    await setMeetingRating(meeting.id, {
      rating: newRating,
      comment: "",
      timestamp: new Date().toISOString(),
    });
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
    <div className="flex flex-col p-3 bg-card rounded-lg border">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium truncate">{meeting.title}</h4>
          <p className="text-xs text-muted-foreground">
            {new Date(meeting.startTime).toLocaleDateString()} (
            {meeting.duration.toFixed(2)}h)
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRating(star)}
                className={cn(
                  "p-1 hover:text-yellow-400 transition-colors",
                  rating >= star ? "text-yellow-400" : "text-gray-300"
                )}
              >
                <StarFilledIcon className="w-5 h-5" />
              </button>
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <ChatBubbleIcon className="w-4 h-4" />
            Add Note
            {isExpanded ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="flex flex-col gap-2 w-full mt-2">
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

          <div className="bg-gray-50 p-3 rounded-md">
            <Textarea
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[60px] text-sm w-full"
              rows={3}
            />
            <div className="flex justify-end gap-2 mt-2">
              <Button size="sm" onClick={addComment}>
                Add
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
