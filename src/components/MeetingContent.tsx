import { parseMeetingContent } from "@/utils/meetingContentFormatter";

// Sub-components
const PreReadMaterials = ({
  links,
}: {
  links: Array<{ url: string; title: string }>;
}) => {
  // Filter out Zoom links
  const filteredLinks = links.filter(
    (link) => !link.url.toLowerCase().includes("zoom")
  );

  if (filteredLinks.length === 0) return null;

  return (
    <div className="space-y-1 bg-blue-50 p-3 rounded-md">
      <h4 className="text-sm font-medium text-blue-800">Pre-read Materials:</h4>
      <ul className="text-sm space-y-1">
        {filteredLinks.map((link, index) => (
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
  );
};

const AgendaSection = ({ agenda }: { agenda: string }) => {
  if (!agenda) return null;

  return (
    <div className="space-y-1 bg-green-50 p-3 rounded-md">
      <h4 className="text-sm font-medium text-green-800">Agenda</h4>
      <div className="text-sm text-green-900">
        {agenda.replace(/^Agenda:\s*/i, "")}
      </div>
    </div>
  );
};

const Attendees = ({ participants }: { participants: string[] }) => {
  if (participants.length === 0) return null;

  return (
    <div className="space-y-1 bg-gray-50 p-3 rounded-md">
      <h4 className="text-sm font-medium">Attendees:</h4>
      <div className="flex flex-wrap gap-2">
        {participants.map((participant, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm bg-gray-100 text-gray-800"
          >
            {participant}
          </span>
        ))}
      </div>
    </div>
  );
};

const ZoomInfo = ({
  joinUrl,
  meetingId,
  passcode,
}: {
  joinUrl: string;
  meetingId: string;
  passcode: string;
}) => {
  if (!joinUrl) return null;

  return (
    <div className="space-y-2">
      <div className="flex space-x-2">
        <a
          href={joinUrl}
          className="text-blue-600 hover:underline text-sm"
          target="_blank"
          rel="noopener noreferrer"
        >
          Join Zoom Meeting
        </a>
      </div>
      {meetingId && (
        <p className="text-sm text-gray-600">Meeting ID: {meetingId}</p>
      )}
      {passcode && (
        <p className="text-sm text-gray-600">Passcode: {passcode}</p>
      )}
    </div>
  );
};

// Main component
interface MeetingContentProps {
  content: string;
  participants: string[];
}

export function MeetingContent({ content, participants }: MeetingContentProps) {
  const formattedContent = parseMeetingContent(content);
  const filteredParticipants = participants.filter(
    (participant) => !participant.includes("resource.calendar.google.com")
  );

  // Create a linked title when the title is an anchor tag
  const TitleContent = () => {
    if (formattedContent.title.startsWith("<a href=")) {
      const link = formattedContent.preReadLinks[0];
      if (link) {
        return (
          <a
            href={link.url}
            className="font-medium text-blue-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {link.title || "Meeting"}
          </a>
        );
      }
    }
    return <span>{formattedContent.title}</span>;
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium">
        <TitleContent />
      </h3>
      <PreReadMaterials links={formattedContent.preReadLinks} />
      <AgendaSection agenda={formattedContent.agenda} />
      <Attendees participants={filteredParticipants} />
      <ZoomInfo
        joinUrl={formattedContent.joinUrl}
        meetingId={formattedContent.meetingId}
        passcode={formattedContent.passcode}
      />
    </div>
  );
}
