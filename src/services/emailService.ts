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

export const generateEmailContent = (meetings: Meeting[]): string => {
  return `
📅 MEETING CHANGES SUMMARY
══════════════════════════

${meetings
  .map(
    (meeting) => `
${meeting.rank}. ${meeting.title.toUpperCase()}
───────────────────
Location: ${meeting.location}
Duration: ${meeting.duration}h
${formatMeetingActions(meeting.id)}
${formatComments(meeting.id)}
`
  )
  .join("\n")}

Generated: ${new Date().toLocaleDateString()}
`;
};

export const sendEmail = async (meetings: Meeting[]) => {
  const emailBody = generateEmailContent(meetings);
  const gmailComposeUrl = `https://mail.google.com/mail/u/0/?view=cm&fs=1&tf=1&su=${encodeURIComponent(
    "Meeting Updates Summary"
  )}&body=${encodeURIComponent(emailBody)}`;
  window.open(gmailComposeUrl, "_blank");
};
