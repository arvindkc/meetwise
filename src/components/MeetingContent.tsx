import { parseMeetingContent } from "@/utils/meetingContentFormatter";

interface MeetingContentProps {
  content: string;
  participants: string[];
}

export function MeetingContent({ content, participants }: MeetingContentProps) {
  const formattedContent = parseMeetingContent(content);
  const filteredParticipants = participants.filter(
    (participant) => !participant.includes("resource.calendar.google.com")
  );

  return (
    <div className="space-y-4">
      <h3 className="font-medium">{formattedContent.title}</h3>

      {formattedContent.preReadLinks.length > 0 && (
        <div className="space-y-1 bg-blue-50 p-3 rounded-md">
          <h4 className="text-sm font-medium text-blue-800">
            Pre-read Materials:
          </h4>
          <ul className="text-sm space-y-1">
            {formattedContent.preReadLinks.map((link, index) => (
              <li key={index}>
                <a
                  href={link.url}
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.title || "Agenda"}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {formattedContent.agenda && (
        <div className="space-y-1 bg-green-50 p-3 rounded-md">
          <h4 className="text-sm font-medium text-green-800">Agenda</h4>
          <div className="text-sm text-green-900">
            {formattedContent.agenda.replace(/^Agenda:\s*/i, "")}
          </div>
        </div>
      )}

      {filteredParticipants.length > 0 && (
        <div className="space-y-1 bg-gray-50 p-3 rounded-md">
          <h4 className="text-sm font-medium">Attendees:</h4>
          <div className="flex flex-wrap gap-2">
            {filteredParticipants.map((participant, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm bg-gray-100 text-gray-800"
              >
                {participant}
              </span>
            ))}
          </div>
        </div>
      )}

      {formattedContent.joinUrl && (
        <div className="space-y-2">
          <div className="flex space-x-2">
            <a
              href={formattedContent.joinUrl}
              className="text-blue-600 hover:underline text-sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              Join Zoom Meeting
            </a>
          </div>
          {formattedContent.meetingId && (
            <p className="text-sm text-gray-600">
              Meeting ID: {formattedContent.meetingId}
            </p>
          )}
          {formattedContent.passcode && (
            <p className="text-sm text-gray-600">
              Passcode: {formattedContent.passcode}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
