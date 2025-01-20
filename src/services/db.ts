import Dexie, { Table } from "dexie";
import { EncryptionManager } from "./encryption";
import type {
  Meeting,
  MeetingComment,
  MeetingStatus,
  MeetingRating,
} from "../types";

interface EncryptedRecord {
  id: string;
  encrypted: string;
}

export class MeetWiseDB extends Dexie {
  meetings!: Table<EncryptedRecord>;
  meetingIcons!: Table<EncryptedRecord>;
  preworkIcons!: Table<EncryptedRecord>;
  showActions!: Table<EncryptedRecord>;
  meetingComments!: Table<EncryptedRecord>;
  meetingStatus!: Table<EncryptedRecord>;
  meetingRatings!: Table<EncryptedRecord>;
  settings!: Table<EncryptedRecord>;

  private encryption: EncryptionManager;

  constructor() {
    super("meetwise-db");
    this.encryption = new EncryptionManager();

    this.version(2).stores({
      meetings: "id, encrypted",
      meetingIcons: "id, encrypted",
      preworkIcons: "id, encrypted",
      showActions: "id, encrypted",
      meetingComments: "id, encrypted",
      meetingStatus: "id, encrypted",
      meetingRatings: "id, encrypted",
      settings: "id, encrypted",
    });
  }

  // Meeting methods
  async getMeeting(id: string): Promise<Meeting | undefined> {
    const record = await this.meetings.get(id);
    if (!record) return undefined;
    return this.encryption.decrypt(record.encrypted);
  }

  async setMeeting(meeting: Meeting): Promise<void> {
    const encrypted = await this.encryption.encrypt(meeting);
    await this.meetings.put({ id: meeting.id, encrypted });
  }

  async getAllMeetings(): Promise<Meeting[]> {
    const records = await this.meetings.toArray();
    return Promise.all(
      records.map(async (record) => this.encryption.decrypt(record.encrypted))
    );
  }

  // Icon methods
  async getMeetingIcon(id: string): Promise<string | undefined> {
    const record = await this.meetingIcons.get(id);
    if (!record) return undefined;
    return this.encryption.decrypt(record.encrypted);
  }

  async setMeetingIcon(id: string, icon: string): Promise<void> {
    const encrypted = await this.encryption.encrypt(icon);
    await this.meetingIcons.put({ id, encrypted });
  }

  async getAllMeetingIcons(): Promise<Record<string, string>> {
    const records = await this.meetingIcons.toArray();
    const decrypted = await Promise.all(
      records.map(async (record) => ({
        id: record.id,
        value: await this.encryption.decrypt<string>(record.encrypted),
      }))
    );
    return Object.fromEntries(decrypted.map((item) => [item.id, item.value]));
  }

  // Prework icon methods
  async getPreworkIcon(id: string): Promise<string | undefined> {
    const record = await this.preworkIcons.get(id);
    if (!record) return undefined;
    return this.encryption.decrypt(record.encrypted);
  }

  async setPreworkIcon(id: string, icon: string): Promise<void> {
    const encrypted = await this.encryption.encrypt(icon);
    await this.preworkIcons.put({ id, encrypted });
  }

  async getAllPreworkIcons(): Promise<Record<string, string>> {
    const records = await this.preworkIcons.toArray();
    const decrypted = await Promise.all(
      records.map(async (record) => ({
        id: record.id,
        value: await this.encryption.decrypt<string>(record.encrypted),
      }))
    );
    return Object.fromEntries(decrypted.map((item) => [item.id, item.value]));
  }

  // Show actions methods
  async getShowActions(id: string): Promise<boolean | undefined> {
    const record = await this.showActions.get(id);
    if (!record) return undefined;
    return this.encryption.decrypt(record.encrypted);
  }

  async setShowActions(id: string, show: boolean): Promise<void> {
    const encrypted = await this.encryption.encrypt(show);
    await this.showActions.put({ id, encrypted });
  }

  async getAllShowActions(): Promise<Record<string, boolean>> {
    const records = await this.showActions.toArray();
    const decrypted = await Promise.all(
      records.map(async (record) => ({
        id: record.id,
        value: await this.encryption.decrypt<boolean>(record.encrypted),
      }))
    );
    return Object.fromEntries(decrypted.map((item) => [item.id, item.value]));
  }

  // Comment methods
  async getMeetingComments(id: string): Promise<MeetingComment[] | undefined> {
    const record = await this.meetingComments.get(id);
    if (!record) return undefined;
    return this.encryption.decrypt(record.encrypted);
  }

  async setMeetingComments(
    id: string,
    comments: MeetingComment[]
  ): Promise<void> {
    const encrypted = await this.encryption.encrypt(comments);
    await this.meetingComments.put({ id, encrypted });
  }

  async getAllMeetingComments(): Promise<Record<string, MeetingComment[]>> {
    const records = await this.meetingComments.toArray();
    const decrypted = await Promise.all(
      records.map(async (record) => ({
        id: record.id,
        value: await this.encryption.decrypt<MeetingComment[]>(
          record.encrypted
        ),
      }))
    );
    return Object.fromEntries(decrypted.map((item) => [item.id, item.value]));
  }

  // Status methods
  async getMeetingStatus(id: string): Promise<MeetingStatus | undefined> {
    const record = await this.meetingStatus.get(id);
    if (!record) return undefined;
    return this.encryption.decrypt(record.encrypted);
  }

  async setMeetingStatus(id: string, status: MeetingStatus): Promise<void> {
    const encrypted = await this.encryption.encrypt(status);
    await this.meetingStatus.put({ id, encrypted });
  }

  async getAllMeetingStatus(): Promise<Record<string, MeetingStatus>> {
    const records = await this.meetingStatus.toArray();
    const decrypted = await Promise.all(
      records.map(async (record) => ({
        id: record.id,
        value: await this.encryption.decrypt<MeetingStatus>(record.encrypted),
      }))
    );
    return Object.fromEntries(decrypted.map((item) => [item.id, item.value]));
  }

  // Rating methods
  async getMeetingRating(id: string): Promise<MeetingRating | undefined> {
    const record = await this.meetingRatings.get(id);
    if (!record) return undefined;
    return this.encryption.decrypt(record.encrypted);
  }

  async setMeetingRating(id: string, rating: MeetingRating): Promise<void> {
    const encrypted = await this.encryption.encrypt(rating);
    await this.meetingRatings.put({ id, encrypted });
  }

  async getAllMeetingRatings(): Promise<Record<string, MeetingRating>> {
    const records = await this.meetingRatings.toArray();
    const decrypted = await Promise.all(
      records.map(async (record) => ({
        id: record.id,
        value: await this.encryption.decrypt<MeetingRating>(record.encrypted),
      }))
    );
    return Object.fromEntries(decrypted.map((item) => [item.id, item.value]));
  }

  // Settings methods
  async getSetting<T>(key: string): Promise<T | undefined> {
    const record = await this.settings.get(key);
    if (!record) return undefined;
    return this.encryption.decrypt(record.encrypted);
  }

  async setSetting<T>(key: string, value: T): Promise<void> {
    const encrypted = await this.encryption.encrypt(value);
    await this.settings.put({ id: key, encrypted });
  }

  async getAllSettings(): Promise<Record<string, unknown>> {
    const records = await this.settings.toArray();
    const decrypted = await Promise.all(
      records.map(async (record) => ({
        id: record.id,
        value: await this.encryption.decrypt(record.encrypted),
      }))
    );
    return Object.fromEntries(decrypted.map((item) => [item.id, item.value]));
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
