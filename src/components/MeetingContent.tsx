import { parseMeetingContent } from "@/utils/meetingContentFormatter";

interface MeetingContentProps {
  content: string;
}

export function MeetingContent({ content }: MeetingContentProps) {
  const formattedContent = parseMeetingContent(content);

  return (
    <div className="space-y-4">
      <h3 className="font-medium">{formattedContent.title}</h3>

      {formattedContent.preReadLinks.length > 0 && (
        <div className="space-y-1">
          <h4 className="text-sm font-medium">Pre-read Materials:</h4>
          <ul className="text-sm space-y-1">
            {formattedContent.preReadLinks.map((link, index) => (
              <li key={index}>
                <a
                  href={link.url}
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {formattedContent.attendees.length > 0 && (
        <div className="space-y-1">
          <h4 className="text-sm font-medium">Attendees:</h4>
          <p className="text-sm text-gray-600">
            {formattedContent.attendees.join(", ")}
          </p>
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

      {formattedContent.phoneNumbers.length > 0 && (
        <div className="text-xs text-gray-500 space-y-1">
          <h4 className="font-medium">Dial-in Numbers:</h4>
          <div className="space-y-0.5">
            {formattedContent.phoneNumbers.map((number, index) => (
              <p key={index}>{number}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
