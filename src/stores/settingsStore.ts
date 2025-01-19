import { create } from "zustand";
import { db } from "@/services/db";
import type { MeetingComment, MeetingStatus, Meeting } from "../types";
import { persist } from "zustand/middleware";

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

interface MeetingRating {
  rating: number;
  comment: string;
  timestamp: string;
}

interface DBItem {
  id: string;
  value: unknown;
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
  meetings: Meeting[];
  setMeetings: (meetings: Meeting[]) => void;
  clearAllData: () => void;
  setMeetingRating: (meetingId: string, rating: MeetingRating) => Promise<void>;
  isLoading: boolean;
  initializeStore: () => Promise<void>;
  meetingRatings: Record<string, MeetingRating>;
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
      meetings: [],
      isLoading: true,
      meetingRatings: {},

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

      setMeetings: async (meetings) => {
        await db.meetings.bulkPut(meetings);
        set({ meetings });
      },

      clearAllData: async () => {
        await Promise.all([
          db.meetings.clear(),
          db.meetingIcons.clear(),
          db.preworkIcons.clear(),
          db.showActions.clear(),
          db.meetingComments.clear(),
          db.meetingStatus.clear(),
          db.settings.clear(),
        ]);

        set({
          meetings: [],
          meetingIcons: {},
          preworkIcons: {},
          showActions: {},
          meetingComments: {},
          meetingStatus: {},
          targetHours: 40,
        });
      },

      initializeStore: async () => {
        try {
          const meetings = await db.meetings.toArray();
          const targetHours =
            (await db.getSetting<number>("targetHours")) ?? 40;

          const [icons, prework, actions, comments, status] = await Promise.all(
            [
              db.meetingIcons.toArray(),
              db.preworkIcons.toArray(),
              db.showActions.toArray(),
              db.meetingComments.toArray(),
              db.meetingStatus.toArray(),
            ]
          );

          const ratings = await db.meetingRatings.toArray();

          set({
            meetings,
            targetHours: targetHours,
            meetingIcons: Object.fromEntries(icons.map((i) => [i.id, i.value])),
            preworkIcons: Object.fromEntries(
              prework.map((p) => [p.id, p.value])
            ),
            showActions: Object.fromEntries(
              actions.map((a) => [a.id, a.value])
            ),
            meetingComments: Object.fromEntries(
              comments.map((c) => [c.id, c.value])
            ),
            meetingStatus: Object.fromEntries(
              status.map((s) => [s.id, s.value])
            ),
            meetingRatings: Object.fromEntries(
              ratings.map((r: DBItem) => [r.id, r.value as MeetingRating])
            ),
            isLoading: false,
          });
        } catch (error) {
          console.error("Failed to initialize store:", error);
          set({ isLoading: false });
        }
      },

      setMeetingRating: async (meetingId: string, rating: MeetingRating) => {
        await db.meetingRatings.put({ id: meetingId, value: rating });
        set((state) => ({
          meetingRatings: {
            ...state.meetingRatings,
            [meetingId]: rating,
          },
        }));
      },
    }),
    {
      name: "settings-storage",
    }
  )
);
