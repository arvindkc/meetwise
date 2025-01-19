import Dexie, { Table } from "dexie";
import type {
  Meeting,
  MeetingComment,
  MeetingStatus,
  MeetingRating,
} from "../types";

export class MeetWiseDB extends Dexie {
  meetings!: Table<Meeting>;
  meetingIcons!: Table<{ id: string; value: string }>;
  preworkIcons!: Table<{ id: string; value: string }>;
  showActions!: Table<{ id: string; value: boolean }>;
  meetingComments!: Table<{ id: string; value: MeetingComment[] }>;
  meetingStatus!: Table<{ id: string; value: MeetingStatus }>;
  meetingRatings!: Table<{ id: string; value: MeetingRating }, string>;
  settings!: Table<{ id: string; value: unknown }>;

  constructor() {
    super("meetwise-db");

    this.version(1).stores({
      meetings: "id, title, startTime, endTime",
      meetingIcons: "id, value",
      preworkIcons: "id, value",
      showActions: "id, value",
      meetingComments: "id, value",
      meetingStatus: "id, value",
      meetingRatings: "id, value",
      settings: "id, value",
    });
  }

  // Meeting methods
  async getMeeting(id: string): Promise<Meeting | undefined> {
    return await this.meetings.get(id);
  }

  async setMeeting(meeting: Meeting): Promise<void> {
    await this.meetings.put(meeting);
  }

  async getAllMeetings(): Promise<Meeting[]> {
    const meetings = await this.meetings.toArray();
    return meetings;
  }

  // Icon methods
  async getMeetingIcon(meetingId: string): Promise<string | undefined> {
    const icon = await this.meetingIcons.get(meetingId);
    return icon?.value;
  }

  async setMeetingIcon(meetingId: string, icon: string): Promise<void> {
    await this.meetingIcons.put({ id: meetingId, value: icon });
  }

  async getAllMeetingIcons(): Promise<Record<string, string>> {
    const icons = await this.meetingIcons.toArray();
    return Object.fromEntries(icons.map((i) => [i.id, i.value]));
  }

  // Prework icon methods
  async getPreworkIcon(meetingId: string): Promise<string | undefined> {
    const icon = await this.preworkIcons.get(meetingId);
    return icon?.value;
  }

  async setPreworkIcon(meetingId: string, icon: string): Promise<void> {
    await this.preworkIcons.put({ id: meetingId, value: icon });
  }

  async getAllPreworkIcons(): Promise<Record<string, string>> {
    const icons = await this.preworkIcons.toArray();
    return Object.fromEntries(icons.map((i) => [i.id, i.value]));
  }

  // Show actions methods
  async getShowActions(meetingId: string): Promise<boolean | undefined> {
    const actions = await this.showActions.get(meetingId);
    return actions?.value;
  }

  async setShowActions(meetingId: string, show: boolean): Promise<void> {
    await this.showActions.put({ id: meetingId, value: show });
  }

  async getAllShowActions(): Promise<Record<string, boolean>> {
    const actions = await this.showActions.toArray();
    return Object.fromEntries(actions.map((a) => [a.id, a.value]));
  }

  // Comment methods
  async getMeetingComments(
    meetingId: string
  ): Promise<MeetingComment[] | undefined> {
    const comments = await this.meetingComments.get(meetingId);
    return comments?.value;
  }

  async setMeetingComments(
    meetingId: string,
    comments: MeetingComment[]
  ): Promise<void> {
    await this.meetingComments.put({ id: meetingId, value: comments });
  }

  async getAllMeetingComments(): Promise<Record<string, MeetingComment[]>> {
    const comments = await this.meetingComments.toArray();
    return Object.fromEntries(comments.map((c) => [c.id, c.value]));
  }

  // Status methods
  async getMeetingStatus(
    meetingId: string
  ): Promise<MeetingStatus | undefined> {
    const status = await this.meetingStatus.get(meetingId);
    return status?.value;
  }

  async setMeetingStatus(
    meetingId: string,
    status: MeetingStatus
  ): Promise<void> {
    await this.transaction("rw", this.meetingStatus, async () => {
      await this.meetingStatus.put({ id: meetingId, value: status });
    });
  }

  async getAllMeetingStatus(): Promise<Record<string, MeetingStatus>> {
    const statuses = await this.meetingStatus.toArray();
    return Object.fromEntries(statuses.map((s) => [s.id, s.value]));
  }

  // Rating methods
  async getMeetingRating(
    meetingId: string
  ): Promise<MeetingRating | undefined> {
    const rating = await this.meetingRatings.get(meetingId);
    return rating?.value;
  }

  async setMeetingRating(
    meetingId: string,
    rating: MeetingRating
  ): Promise<void> {
    await this.meetingRatings.put({ id: meetingId, value: rating });
  }

  async getAllMeetingRatings(): Promise<Record<string, MeetingRating>> {
    const ratings = await this.meetingRatings.toArray();
    return Object.fromEntries(ratings.map((r) => [r.id, r.value]));
  }

  // Settings methods
  async getSetting<T>(key: string): Promise<T | undefined> {
    const setting = await this.settings.get(key);
    return setting?.value as T;
  }

  async setSetting<T>(key: string, value: T): Promise<void> {
    await this.settings.put({ id: key, value });
  }

  async getAllSettings(): Promise<Record<string, unknown>> {
    const settings = await this.settings.toArray();
    return Object.fromEntries(settings.map((s) => [s.id, s.value]));
  }

  // Clear methods
  async clearAll(): Promise<void> {
    await Promise.all([
      this.meetings.clear(),
      this.meetingIcons.clear(),
      this.preworkIcons.clear(),
      this.showActions.clear(),
      this.meetingComments.clear(),
      this.meetingStatus.clear(),
      this.meetingRatings.clear(),
      this.settings.clear(),
    ]);
  }
}

export const db = new MeetWiseDB();
