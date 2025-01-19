import { Meeting } from "../types";
import { googleCalendarService } from "./googleCalendarService";

interface EmailRecipient {
  email: string;
}

// Helper functions for formatting meeting data
const formatDuration = (duration: number): string => {
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  return `${hours}h ${minutes}m`;
};

const hasMeetingChanges = (meetingId: string): boolean => {
  // Check if meeting has any pending actions or unresolved changes
  const pendingActions = formatMeetingActions(meetingId);
  const pendingComments = formatComments(meetingId);

  return !!(pendingActions || pendingComments);
};

const formatMeetingActions = (meetingId: string): string => {
  return `Action needed for meeting ${meetingId}`; // Basic implementation
};

const formatComments = (meetingId: string): string => {
  return `Comments for meeting ${meetingId}`; // Basic implementation
};

export class AmpEmailService {
  private generateAmpEmailContent(meetings: Meeting[]): string {
    // Only get meetings with ratings or changes
    const meetingsWithChanges = meetings
      .filter((m) => hasMeetingChanges(m.id))
      .sort((a, b) => Number(a.rank) - Number(b.rank));

    const topMeetings = meetings
      .sort((a, b) => Number(a.rank) - Number(b.rank))
      .slice(0, 5);

    const ratedMeetings = meetings.filter((m) => m.rating);

    return `
      <html>
      <body>
        ${
          meetingsWithChanges.length > 0
            ? `
          <h2>Meetings Requiring Action</h2>
          ${meetingsWithChanges
            .map(
              (m) => `
            <div>
              <strong>${m.rank}. ${m.title}</strong>
              <div>Duration: ${formatDuration(m.duration)}</div>
              <div>Location: ${
                m.location !== "No location specified"
                  ? m.location
                  : "No location"
              }</div>
            </div>
          `
            )
            .join("")}
        `
            : ""
        }

        <h2>Top Priority Meetings</h2>
        ${topMeetings
          .map(
            (m) => `
          <div>
            <strong>${m.rank}. ${m.title}</strong>
            <div>Duration: ${formatDuration(m.duration)}</div>
            <div>Location: ${
              m.location !== "No location specified"
                ? m.location
                : "No location"
            }</div>
          </div>
        `
          )
          .join("")}

        ${
          ratedMeetings.length > 0
            ? `
          <h2>Previously Rated Meetings</h2>
          ${ratedMeetings
            .map(
              (m) => `
            <div>
              <strong>${m.title}</strong>
              <div>Rating: ${m.rating}/5</div>
            </div>
          `
            )
            .join("")}
        `
            : ""
        }

        <div style="margin-top: 20px; color: #666;">
          Generated: ${new Date().toLocaleDateString()}
        </div>
      </body>
      </html>
    `;
  }

  async sendEmail(
    meetings: Meeting[],
    recipients: EmailRecipient[]
  ): Promise<void> {
    try {
      const accessToken = await googleCalendarService.getAuth();
      const emailContent = this.generateAmpEmailContent(meetings);

      // Create email data with proper MIME formatting
      const emailData = [
        'Content-Type: text/html; charset="UTF-8"',
        "MIME-Version: 1.0",
        `To: ${recipients.map((r) => r.email).join(", ")}`,
        "Subject: Meeting Changes Needed",
        "",
        emailContent,
      ].join("\r\n");

      // Properly encode Unicode characters
      const encoder = new TextEncoder();
      const bytes = encoder.encode(emailData);
      const encodedEmail = btoa(String.fromCharCode(...bytes))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      const response = await fetch(
        "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            raw: encodedEmail,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send email");
      }
    } catch (error) {
      console.error("Failed to send email:", error);
      throw error;
    }
  }
}

// Export a singleton instance
export const ampEmailService = new AmpEmailService();
