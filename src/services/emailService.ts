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
  const minutes = Math.max(1, Math.round(hours * 60));
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

const formatMeetingEntry = (meeting: Meeting): string => {
  return `${meeting.rank}. ${meeting.title}
${formatDuration(meeting.duration)} | ${
    meeting.location !== "No location specified"
      ? meeting.location
      : "No location"
  }${
    formatMeetingActions(meeting.id)
      ? `\n${formatMeetingActions(meeting.id).trim()}`
      : ""
  }${
    formatComments(meeting.id) ? `\n${formatComments(meeting.id).trim()}` : ""
  }`;
};

const generateEmailContent = (meetings: Meeting[]): string => {
  const meetingsWithChanges = meetings
    .filter((m) => hasMeetingChanges(m.id))
    .sort((a, b) => Number(a.rank) - Number(b.rank));

  // Group meetings by priority
  const highPriorityMeetings = meetings
    .filter((m) => m.priorityLevel === "high")
    .sort((a, b) => Number(a.rank) - Number(b.rank));

  const regularMeetings = meetings
    .filter((m) => m.priorityLevel === "regular" || !m.priorityLevel)
    .sort((a, b) => Number(a.rank) - Number(b.rank));

  const lowPriorityMeetings = meetings
    .filter((m) => m.priorityLevel === "low")
    .sort((a, b) => Number(a.rank) - Number(b.rank));

  return `
CHANGES NEEDED
─────────────
${meetingsWithChanges.map(formatMeetingEntry).join("\n\n")}

PRIORITY MEETINGS
─────────────

HIGH PRIORITY
────────────
${
  highPriorityMeetings.length > 0
    ? highPriorityMeetings.map(formatMeetingEntry).join("\n\n")
    : "No high priority meetings"
}

REGULAR MEETINGS
────────────
${
  regularMeetings.length > 0
    ? regularMeetings.slice(0, 5).map(formatMeetingEntry).join("\n\n")
    : "No regular meetings"
}

LOW PRIORITY
────────────
${
  lowPriorityMeetings.length > 0
    ? lowPriorityMeetings.slice(0, 3).map(formatMeetingEntry).join("\n\n")
    : "No low priority meetings"
}

Generated: ${new Date().toLocaleDateString()}`;
};

export const sendEmail = async (meetings: Meeting[]) => {
  const emailBody = generateEmailContent(meetings);
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&tf=1&su=Meeting+Changes+Needed&body=${encodeURIComponent(
    emailBody
  )}`;
  window.location.href = gmailUrl;
};
