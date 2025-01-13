import { Meeting, MeetingComment } from "../types";
import { useSettingsStore } from "../stores/settingsStore";

const formatMeetingActions = (meetingId: string): string => {
  const status = useSettingsStore.getState().meetingStatus?.[meetingId] || {
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

const formatComments = (comments: MeetingComment[]): string => {
  return comments.length > 0
    ? `\nComments:\n${comments
        .map((c) => `• ${c.text} (${c.author})`)
        .join("\n")}`
    : "";
};

const formatMeeting = (meeting: Meeting): string => {
  const meetingComments = Array.isArray(
    useSettingsStore.getState().meetingComments[meeting.id]
  )
    ? useSettingsStore.getState().meetingComments[meeting.id]
    : [];

  return `
${meeting.rank}. ${meeting.title}
Duration: ${meeting.duration}h
Location: ${meeting.location}
${formatMeetingActions(meeting.id)}
${formatComments(meetingComments)}
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

  try {
    // Check if the Web Share API is available
    if (navigator.share) {
      await navigator.share({
        title: "Meeting Updates Summary",
        text: emailBody,
      });
    } else {
      // Fallback to mailto
      const mailtoLink = `mailto:?subject=Meeting Updates Summary&body=${encodeURIComponent(
        emailBody
      )}`;
      window.location.href = mailtoLink;
    }
  } catch (error) {
    console.error("Error sharing:", error);
    // Fallback to mailto if sharing fails
    const mailtoLink = `mailto:?subject=Meeting Updates Summary&body=${encodeURIComponent(
      emailBody
    )}`;
    window.location.href = mailtoLink;
  }
};
