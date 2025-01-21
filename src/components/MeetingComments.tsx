import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useSettingsStore } from "../stores/settingsStore";
import type { MeetingComment } from "../types";

interface MeetingCommentsProps {
  meetingId: string;
}

export function MeetingComments({ meetingId }: MeetingCommentsProps) {
  const [comment, setComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const {
    meetingComments = {},
    setMeetingComment,
    deleteMeetingComment,
    updateMeetingComment,
  } = useSettingsStore();

  const addComment = () => {
    if (comment.trim()) {
      const newComment = {
        id: Date.now().toString(),
        text: comment,
        author: "You",
        timestamp: new Date().toISOString(),
      };

      setMeetingComment(meetingId, newComment);
      setComment("");
    }
  };

  const startEditing = (comment: MeetingComment) => {
    setEditingCommentId(comment.id);
    setEditText(comment.text);
  };

  const saveEdit = (commentId: string) => {
    if (editText.trim()) {
      updateMeetingComment(meetingId, commentId, editText);
      setEditingCommentId(null);
      setEditText("");
    }
  };

  const comments = Array.isArray(meetingComments[meetingId])
    ? meetingComments[meetingId]
    : [];

  return (
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
                    onClick={() => deleteMeetingComment(meetingId, comment.id)}
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
  );
}
