import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MeetingComment, MeetingStatus } from "../types";

interface MeetingSettings {
  meetingIcons: Record<string, string>;
  preworkIcons: Record<string, string>;
  showActions: Record<string, boolean>;
  meetingComments: Record<string, MeetingComment[]>;
  meetingStatus: Record<string, MeetingStatus>;
}

interface Comment {
  id: string;
  text: string;
  author: string;
  timestamp: string;
}

interface SettingsState extends MeetingSettings {
  meetingComments: Record<string, Comment[]>;
  setMeetingComment: (meetingId: string, comment: Comment) => void;
  setMeetingIcon: (meetingId: string, icon: string) => void;
  setPreworkIcon: (meetingId: string, icon: string) => void;
  toggleActions: (meetingId: string) => void;
  deleteMeetingComment: (meetingId: string, commentId: string) => void;
  updateMeetingComment: (
    meetingId: string,
    commentId: string,
    newText: string
  ) => void;
  setMeetingStatus: (meetingId: string, status: MeetingStatus) => void;
  targetHours: number;
  setTargetHours: (hours: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      meetingIcons: {},
      preworkIcons: {},
      showActions: {},
      meetingComments: {},
      meetingStatus: {},
      targetHours: 40,

      setMeetingIcon: (meetingId, icon) =>
        set((state) => ({
          meetingIcons: { ...state.meetingIcons, [meetingId]: icon },
        })),

      setPreworkIcon: (meetingId, icon) =>
        set((state) => ({
          preworkIcons: { ...state.preworkIcons, [meetingId]: icon },
        })),

      toggleActions: (meetingId) =>
        set((state) => ({
          showActions: {
            ...state.showActions,
            [meetingId]: !state.showActions[meetingId],
          },
        })),

      setMeetingComment: (meetingId: string, comment: Comment) =>
        set((state) => ({
          meetingComments: {
            ...state.meetingComments,
            [meetingId]: Array.isArray(state.meetingComments[meetingId])
              ? [...state.meetingComments[meetingId], comment]
              : [comment],
          },
        })),

      deleteMeetingComment: (meetingId: string, commentId: string) =>
        set((state) => ({
          meetingComments: {
            ...state.meetingComments,
            [meetingId]:
              state.meetingComments[meetingId]?.filter(
                (c) => c.id !== commentId
              ) || [],
          },
        })),

      updateMeetingComment: (
        meetingId: string,
        commentId: string,
        newText: string
      ) =>
        set((state) => ({
          meetingComments: {
            ...state.meetingComments,
            [meetingId]:
              state.meetingComments[meetingId]?.map((c) =>
                c.id === commentId ? { ...c, text: newText } : c
              ) || [],
          },
        })),

      setMeetingStatus: (meetingId: string, status: MeetingStatus) =>
        set((state) => ({
          meetingStatus: {
            ...state.meetingStatus,
            [meetingId]: status,
          },
        })),

      setTargetHours: (hours: number) => set(() => ({ targetHours: hours })),
    }),
    {
      name: "meeting-settings",
    }
  )
);
