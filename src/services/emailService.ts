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

const generateCompactContent = (meetings: Meeting[]): string =>
  `📅 MEETING SUMMARY
─────────────────
${meetings
  .map(
    (m) =>
      `${m.rank}. ${m.title}
${m.duration}h | ${
        m.location !== "No location specified" ? m.location : "No location"
      }${
        formatMeetingActions(m.id)
          ? `\n${formatMeetingActions(m.id).trim()}`
          : ""
      }${formatComments(m.id) ? `\n${formatComments(m.id).trim()}` : ""}`
  )
  .join("\n\n")}

Generated: ${new Date().toLocaleDateString()}`;

export const generateEmailContent = (meetings: Meeting[]): string =>
  `📅 MEETING CHANGES SUMMARY
══════════════════════════
${meetings
  .map(
    (meeting) =>
      `${meeting.rank}. ${meeting.title.toUpperCase()}
───────────────────
Location: ${meeting.location}
Duration: ${meeting.duration}h${formatMeetingActions(
        meeting.id
      )}${formatComments(meeting.id)}`
  )
  .join("\n\n")}

Generated: ${new Date().toLocaleDateString()}`;

export const sendEmail = async (meetings: Meeting[]) => {
  const detailedContent = generateEmailContent(meetings);
  const emailBody =
    detailedContent.length > 2000
      ? generateCompactContent(meetings)
      : detailedContent;

  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&tf=1&su=Meeting+Updates+Summary&body=${encodeURIComponent(
    emailBody
  )}`;
  window.location.href = gmailUrl;
};
