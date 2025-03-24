import { Meeting } from "../types";
import { googleCalendarService } from "./googleCalendarService";
import { getDateRanges } from "./calendarService";
import { db } from "./db";

interface EmailRecipient {
  email: string;
}

// Helper function for formatting meeting duration
const formatDuration = (duration: number): string => {
  const minutes = Math.max(1, Math.round(duration * 60));
  return `${minutes} minutes`;
};

export class AmpEmailService {
  private getGoogleCalendarLink(
    meeting: Meeting,
    recipientEmail: string
  ): string {
    // Convert the ID and append recipient's email for the full Google Calendar event edit URL
    const encodedId = btoa(`${meeting.id} ${recipientEmail}`)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    return `https://calendar.google.com/calendar/u/0/r/eventedit/${encodedId}`;
  }

  private async generateAmpEmailContent(
    meetings: Meeting[],
    recipientEmail: string
  ): Promise<string> {
    const dateRanges = getDateRanges();
    const weeklyPriorities =
      (await db.getSetting<string>("weeklyPriorities")) || "";

    // Pre-fetch calendar links for all meetings
    const calendarLinks = new Map<string, string>();
    for (const meeting of meetings) {
      calendarLinks.set(
        meeting.id,
        this.getGoogleCalendarLink(meeting, recipientEmail)
      );
    }

    // Get meetings with changes (status or comments)
    const upcomingMeetingsWithChanges = await Promise.all(
      meetings
        .filter((m) => {
          const meetingTime = new Date(m.startTime).getTime();
          return (
            meetingTime >= dateRanges.plan.start.getTime() &&
            meetingTime <= dateRanges.plan.end.getTime()
          );
        })
        .map(async (m) => {
          const status = await db.getMeetingStatus(m.id);
          const comments = await db.getMeetingComments(m.id);
          return {
            meeting: m,
            status,
            comments,
            hasChanges: !!(status || comments?.length),
          };
        })
    );

    // Get all upcoming meetings and group by priority
    const upcomingMeetings = meetings.filter((m) => {
      const meetingTime = new Date(m.startTime).getTime();
      return (
        meetingTime >= dateRanges.plan.start.getTime() &&
        meetingTime <= dateRanges.plan.end.getTime()
      );
    });

    // Group meetings by priority
    const highPriorityMeetings = upcomingMeetings
      .filter((m) => m.priorityLevel === "high")
      .sort((a, b) => Number(a.rank) - Number(b.rank))
      .map((meeting, index) => ({ ...meeting, computedRank: index + 1 }));

    const regularMeetings = upcomingMeetings
      .filter((m) => m.priorityLevel === "regular" || !m.priorityLevel)
      .sort((a, b) => Number(a.rank) - Number(b.rank))
      .map((meeting, index) => ({ ...meeting, computedRank: index + 1 }));

    const lowPriorityMeetings = upcomingMeetings
      .filter((m) => m.priorityLevel === "low")
      .sort((a, b) => Number(a.rank) - Number(b.rank))
      .map((meeting, index) => ({ ...meeting, computedRank: index + 1 }));

    // For backward compatibility
    const upcomingPriorityMeetings = upcomingMeetings
      .sort((a, b) => Number(a.rank) - Number(b.rank))
      .map((meeting, index) => ({ ...meeting, computedRank: index + 1 }));

    // Get rated meetings from last week
    const recentRatedMeetings = await Promise.all(
      meetings
        .filter((m) => {
          const meetingTime = new Date(m.startTime).getTime();
          return (
            meetingTime >= dateRanges.rate.start.getTime() &&
            meetingTime <= dateRanges.rate.end.getTime()
          );
        })
        .map(async (m) => {
          const rating = await db.getMeetingRating(m.id);
          return { meeting: m, rating };
        })
    );

    // Helper function to render a meeting
    const renderMeeting = (m: Meeting & { computedRank?: number }) => `
      <div style="margin-bottom: 15px; border: 1px solid #eee; padding: 15px; border-radius: 8px;">
        <strong>#${m.computedRank || "-"}. 
          <a href="${calendarLinks.get(
            m.id
          )}" style="color: #0066cc; text-decoration: none;">
            ${m.title}
          </a>
        </strong>
        <div>Time: ${new Date(m.startTime).toLocaleString()}</div>
        <div>Duration: ${formatDuration(m.duration)}</div>
        <div>Location: ${
          m.location !== "No location specified" ? m.location : "No location"
        }</div>
      </div>
    `;

    return `
      <html>
      <body>
        ${
          weeklyPriorities
            ? `
        <div style="margin-bottom: 20px; border: 1px solid #eee; padding: 15px; border-radius: 8px; background-color: #f9f9f9;">
          <h2>Weekly Priorities</h2>
          <div style="white-space: pre-wrap;">${weeklyPriorities}</div>
        </div>
        `
            : ""
        }
        
        ${
          upcomingMeetingsWithChanges.filter((m) => m.hasChanges).length > 0
            ? `
          <h2>Meetings Requiring Action</h2>
          ${upcomingMeetingsWithChanges
            .filter((m) => m.hasChanges)
            .map(
              ({ meeting: m, status, comments }) => `
              <div style="margin-bottom: 15px; border: 1px solid #eee; padding: 15px; border-radius: 8px;">
                <strong>#${
                  upcomingPriorityMeetings.find((pm) => pm.id === m.id)
                    ?.computedRank || "-"
                }. 
                  <a href="${calendarLinks.get(
                    m.id
                  )}" style="color: #0066cc; text-decoration: none;">
                    ${m.title}
                  </a>
                </strong>
                <div>Time: ${new Date(m.startTime).toLocaleString()}</div>
                <div>Duration: ${formatDuration(m.duration)}</div>
                <div>Location: ${
                  m.location !== "No location specified"
                    ? m.location
                    : "No location"
                }</div>
                
                ${
                  status
                    ? `
                  <div style="margin-top: 10px;">
                    <strong>Status:</strong>
                    ${status.needsCancel ? "<div>• Cancel requested</div>" : ""}
                    ${
                      status.needsShorten
                        ? "<div>• Shorten requested</div>"
                        : ""
                    }
                    ${
                      status.needsReschedule
                        ? "<div>• Reschedule requested</div>"
                        : ""
                    }
                    ${status.prepRequired ? "<div>• Prep required</div>" : ""}
                  </div>
                `
                    : ""
                }
                
                ${
                  comments?.length
                    ? `
                  <div style="margin-top: 10px;">
                    <strong>Comments:</strong>
                    ${comments
                      .map(
                        (comment) => `
                      <div style="margin-top: 5px; padding-left: 10px; border-left: 2px solid #eee;">
                        ${comment.text}
                        <div style="font-size: 0.8em; color: #666;">
                          ${comment.author} • ${new Date(
                          comment.timestamp
                        ).toLocaleDateString()}
                        </div>
                      </div>
                    `
                      )
                      .join("")}
                  </div>
                `
                    : ""
                }
              </div>
            `
            )
            .join("")}
        `
            : ""
        }

        <h2>Priority Meetings</h2>
        
        <h3 style="color: #D97706; margin-top: 20px;">High Priority Meetings</h3>
        <div style="border-left: 4px solid #D97706; padding-left: 15px;">
          ${
            highPriorityMeetings.length > 0
              ? highPriorityMeetings.map(renderMeeting).join("")
              : '<div style="font-style: italic; color: #666;">No high priority meetings</div>'
          }
        </div>

        <h3 style="color: #2563EB; margin-top: 20px;">Regular Meetings</h3>
        <div style="border-left: 4px solid #2563EB; padding-left: 15px;">
          ${
            regularMeetings.length > 0
              ? regularMeetings.map(renderMeeting).join("")
              : '<div style="font-style: italic; color: #666;">No regular meetings</div>'
          }
        </div>

        <h3 style="color: #6B7280; margin-top: 20px;">Low Priority Meetings</h3>
        <div style="border-left: 4px solid #6B7280; padding-left: 15px;">
          ${
            lowPriorityMeetings.length > 0
              ? lowPriorityMeetings.map(renderMeeting).join("")
              : '<div style="font-style: italic; color: #666;">No low priority meetings</div>'
          }
        </div>

        ${
          recentRatedMeetings.filter((m) => m.rating).length > 0
            ? `
          <h2>Rated Meetings</h2>
          ${recentRatedMeetings
            .filter((m) => m.rating)
            .map(
              ({ meeting: m, rating }) => `
              <div style="margin-bottom: 15px; border: 1px solid #eee; padding: 15px; border-radius: 8px;">
                <strong>
                  <a href="${calendarLinks.get(
                    m.id
                  )}" style="color: #0066cc; text-decoration: none;">
                    ${m.title}
                  </a>
                </strong>
                <div>Time: ${new Date(m.startTime).toLocaleString()}</div>
                <div>Rating: ${rating?.rating}/5</div>
                ${
                  rating?.comment
                    ? `<div>Comments: ${rating.comment}</div>`
                    : ""
                }
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
    // Send separate emails to each recipient with their own calendar links
    for (const recipient of recipients) {
      const emailContent = await this.generateAmpEmailContent(
        meetings,
        recipient.email
      );
      try {
        const accessToken = await googleCalendarService.getAuth();

        // Create email data with proper MIME formatting
        const emailData = [
          'Content-Type: text/html; charset="UTF-8"',
          "MIME-Version: 1.0",
          `To: ${recipient.email}`,
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
        console.error(`Failed to send email to ${recipient.email}:`, error);
      }
    }
  }
}

// Export a singleton instance
export const ampEmailService = new AmpEmailService();
