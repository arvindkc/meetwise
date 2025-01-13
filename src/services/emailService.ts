import { Meeting } from "../types";
import { useSettingsStore } from "../stores/settingsStore";

const formatMeetingActions = (meetingId: string): string => {
  const status = useSettingsStore.getState().meetingStatus?.[meetingId] || {
    needsCancel: false,
    needsShorten: false,
    needsReschedule: false,
    prepRequired: false,
  };

  const actions = [
    status.needsCancel && "⛔ Cancel Requested",
    status.needsShorten && "⏱️ Shorten Requested",
    status.needsReschedule && "📅 Reschedule Requested",
    status.prepRequired && "⚠️ Prep Required",
  ].filter(Boolean);

  return actions.length > 0
    ? `\nACTIONS NEEDED:\n${actions.map((a) => `• ${a}`).join("\n")}`
    : "";
};

const formatComments = (meetingId: string): string => {
  const comments = useSettingsStore.getState().meetingComments[meetingId] || [];
  return comments.length > 0
    ? `\nComments:\n${comments
        .map((c) => `• ${c.author}: ${c.text}`)
        .join("\n")}`
    : "";
};

const formatDuration = (hours: number): string => {
  const minutes = Math.round(hours * 60);
  return `${minutes}min`;
};

const hasMeetingChanges = (meetingId: string): boolean => {
  const status = useSettingsStore.getState().meetingStatus?.[meetingId];
  const comments = useSettingsStore.getState().meetingComments[meetingId] || [];
  return !!(
    status?.needsCancel ||
    status?.needsShorten ||
    status?.needsReschedule ||
    status?.prepRequired ||
    comments.length > 0
  );
};

const generateEmailContent = (meetings: Meeting[]): string => {
  // Get meetings with changes, sorted by priority
  const meetingsWithChanges = meetings
    .filter((m) => hasMeetingChanges(m.id))
    .sort((a, b) => Number(a.priority) - Number(b.priority));

  // Get top 5 meetings by priority
  const topMeetings = [...meetings]
    .sort((a, b) => Number(a.priority) - Number(b.priority))
    .slice(0, 5);

  return `
CHANGES NEEDED
─────────────
${meetingsWithChanges
  .map(
    (m) =>
      `${m.rank}. ${m.title}
${formatDuration(m.duration)} | ${
        m.location !== "No location specified" ? m.location : "No location"
      }${
        formatMeetingActions(m.id)
          ? `\n${formatMeetingActions(m.id).trim()}`
          : ""
      }${formatComments(m.id) ? `\n${formatComments(m.id).trim()}` : ""}`
  )
  .join("\n\n")}

TOP 5 MEETINGS
─────────────
${topMeetings
  .map(
    (m) =>
      `${m.rank}. ${m.title}
${formatDuration(m.duration)} | ${
        m.location !== "No location specified" ? m.location : "No location"
      }`
  )
  .join("\n\n")}

Generated: ${new Date().toLocaleDateString()}`;
};

export const sendEmail = async (meetings: Meeting[]) => {
  const emailBody = generateEmailContent(meetings);
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&tf=1&su=Meeting+Changes+Needed&body=${encodeURIComponent(
    emailBody
  )}`;
  window.location.href = gmailUrl;
};
