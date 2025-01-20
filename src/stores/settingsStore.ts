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
  updateMeetings: (meetings: Meeting[]) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      meetingIcons: {},
      preworkIcons: {},
      showActions: {},
      meetingComments: {},
      meetingStatus: {},
      targetHours: 40,
      meetings: [],
      isLoading: true,
      meetingRatings: {},

      setMeetingIcon: async (meetingId, icon) => {
        await db.setMeetingIcon(meetingId, icon);
        set((state) => ({
          meetingIcons: { ...state.meetingIcons, [meetingId]: icon },
        }));
      },

      setPreworkIcon: async (meetingId, icon) => {
        await db.setPreworkIcon(meetingId, icon);
        set((state) => ({
          preworkIcons: { ...state.preworkIcons, [meetingId]: icon },
        }));
      },

      toggleActions: async (meetingId) => {
        const newValue = !get().showActions[meetingId];
        await db.setShowActions(meetingId, newValue);
        set((state) => ({
          showActions: {
            ...state.showActions,
            [meetingId]: newValue,
          },
        }));
      },

      setMeetingComment: async (meetingId: string, comment: Comment) => {
        const currentComments = (await db.getMeetingComments(meetingId)) || [];
        const updatedComments = [...currentComments, comment];
        await db.setMeetingComments(meetingId, updatedComments);
        set((state) => ({
          meetingComments: {
            ...state.meetingComments,
            [meetingId]: updatedComments,
          },
        }));
      },

      deleteMeetingComment: async (meetingId: string, commentId: string) => {
        const currentComments = (await db.getMeetingComments(meetingId)) || [];
        const updatedComments = currentComments.filter(
          (c) => c.id !== commentId
        );
        await db.setMeetingComments(meetingId, updatedComments);
        set((state) => ({
          meetingComments: {
            ...state.meetingComments,
            [meetingId]: updatedComments,
          },
        }));
      },

      updateMeetingComment: async (
        meetingId: string,
        commentId: string,
        newText: string
      ) => {
        const currentComments = (await db.getMeetingComments(meetingId)) || [];
        const updatedComments = currentComments.map((c) =>
          c.id === commentId ? { ...c, text: newText } : c
        );
        await db.setMeetingComments(meetingId, updatedComments);
        set((state) => ({
          meetingComments: {
            ...state.meetingComments,
            [meetingId]: updatedComments,
          },
        }));
      },

      setMeetingStatus: async (meetingId: string, status: MeetingStatus) => {
        await db.setMeetingStatus(meetingId, status);
        set((state) => ({
          meetingStatus: {
            ...state.meetingStatus,
            [meetingId]: status,
          },
        }));
      },

      setTargetHours: async (hours: number) => {
        await db.setSetting("targetHours", hours);
        set(() => ({ targetHours: hours }));
      },

      setMeetings: async (meetings) => {
        await Promise.all(meetings.map((meeting) => db.setMeeting(meeting)));
        set({ meetings });
      },

      clearAllData: async () => {
        await db.clearAll();
        set({
          meetings: [],
          meetingIcons: {},
          preworkIcons: {},
          showActions: {},
          meetingComments: {},
          meetingStatus: {},
          meetingRatings: {},
          targetHours: 40,
        });
      },

      initializeStore: async () => {
        try {
          const [
            meetings,
            targetHours,
            meetingIcons,
            preworkIcons,
            showActions,
            meetingComments,
            meetingStatus,
            meetingRatings,
          ] = await Promise.all([
            db.getAllMeetings(),
            db.getSetting<number>("targetHours"),
            db.getAllMeetingIcons(),
            db.getAllPreworkIcons(),
            db.getAllShowActions(),
            db.getAllMeetingComments(),
            db.getAllMeetingStatus(),
            db.getAllMeetingRatings(),
          ]);

          // Sort meetings by rank when loading
          const sortedMeetings = meetings.sort(
            (a, b) => (a.rank || 0) - (b.rank || 0)
          );

          set({
            meetings: sortedMeetings,
            targetHours: targetHours ?? 40,
            meetingIcons,
            preworkIcons,
            showActions,
            meetingComments,
            meetingStatus,
            meetingRatings,
            isLoading: false,
          });
        } catch (error) {
          console.error("Failed to initialize store:", error);
          set({ isLoading: false });
        }
      },

      setMeetingRating: async (meetingId: string, rating: MeetingRating) => {
        await db.setMeetingRating(meetingId, rating);
        set((state) => ({
          meetingRatings: {
            ...state.meetingRatings,
            [meetingId]: rating,
          },
        }));
      },

      updateMeetings: async (meetings: Meeting[]) => {
        // Ensure meetings are sorted by rank before saving
        const sortedMeetings = [...meetings].sort(
          (a, b) => (a.rank || 0) - (b.rank || 0)
        );

        // Save each meeting with its rank
        await Promise.all(
          sortedMeetings.map(async (meeting) => {
            await db.setMeeting({
              ...meeting,
              rank: meeting.rank || 0,
            });
          })
        );

        set({ meetings: sortedMeetings });
      },
    }),
    {
      name: "settings-storage",
      partialize: (state) => ({
        targetHours: state.targetHours,
        isLoading: state.isLoading,
      }),
      version: 2,
      migrate: (persistedState: unknown, version) => {
        if (version === 1) {
          return {
            targetHours: 40,
            isLoading: false,
          };
        }
        return persistedState as { targetHours: number; isLoading: boolean };
      },
    }
  )
);
