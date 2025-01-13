import { Meeting } from "../types";
import { useSettingsStore } from "../stores/settingsStore";

const formatMeetingActions = (meetingId: string): string => {
  // Log the store state to debug
  const store = useSettingsStore.getState();
  console.log(
    "Store state for meeting",
    meetingId,
    ":",
    store.meetingStatus?.[meetingId]
  );

  const status = store.meetingStatus?.[meetingId] || {
    needsCancel: false,
    needsShorten: false,
    needsReschedule: false,
    prepRequired: false,
  };

  const actions = [
    status.needsCancel && "Cancel Requested",
    status.needsShorten && "Shorten Requested",
    status.needsReschedule && "Reschedule Requested",
    status.prepRequired && "Prep Required",
  ].filter(Boolean);

  return actions.length > 0
    ? `\nRequested Actions:\n${actions.map((a) => `• ${a}`).join("\n")}`
    : "";
};

const formatComments = (meetingId: string): string => {
  const comments = useSettingsStore.getState().meetingComments[meetingId] || [];
  return comments.length > 0
    ? `\nComments:\n${comments
        .map((c) => `• ${c.text} (${c.author})`)
        .join("\n")}`
    : "";
};

const formatMeeting = (meeting: Meeting): string => {
  return `
${meeting.rank}. ${meeting.title}
Duration: ${meeting.duration}h
Location: ${meeting.location}
${formatMeetingActions(meeting.id)}
${formatComments(meeting.id)}
----------------------`;
};

export const generateEmailContent = (meetings: Meeting[]): string => {
  const emailBody = `
Meeting Updates Summary
----------------------

${meetings.map(formatMeeting).join("\n")}

Generated on ${new Date().toLocaleDateString()}
`;

  return emailBody;
};

export const sendEmail = async (meetings: Meeting[]) => {
  const emailBody = generateEmailContent(meetings);
  const subject = "Meeting Updates Summary";
  const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=&su=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(emailBody)}`;

  // Open Gmail compose window
  window.open(gmailLink, "_blank");
};
