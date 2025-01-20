interface FormattedMeetingContent {
  title: string;
  joinUrl: string;
  meetingId: string;
  passcode: string;
  phoneNumbers: string[];
  preReadLinks: Array<{ url: string; title: string }>;
  attendees: string[];
  agenda: string;
  rawContent: string;
}

export const preserveAnchors = (
  content: string
): {
  processedContent: string;
  anchors: string[];
} => {
  const anchors: string[] = [];
  const processedContent = content.replace(
    /<a\s+(?:[^>]*?\s+)?href="([^"]*)"[^>]*>(.*?)<\/a>/g,
    (match) => {
      anchors.push(match);
      return `{{ANCHOR${anchors.length - 1}}}`;
    }
  );
  return { processedContent, anchors };
};

export const cleanHtml = (content: string): string => {
  return content
    .replace(/<br>/g, "\n")
    .replace(/<(?!\/?(a|br))[^>]*>/g, "")
    .replace(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"[^>]*>(.*?)<\/a>/g, "$2")
    .trim();
};

export const restoreAnchors = (content: string, anchors: string[]): string => {
  return content.replace(
    /{{ANCHOR(\d+)}}/g,
    (_, index) => anchors[parseInt(index)]
  );
};

export const parseMeetingContent = (
  content: string
): FormattedMeetingContent => {
  const { processedContent, anchors } = preserveAnchors(content);
  const cleanContent = cleanHtml(processedContent);
  const finalContent = restoreAnchors(cleanContent, anchors);
  const sections = finalContent.split("\n\n").filter(Boolean);

  // Extract pre-read links
  const preReadLinks = anchors
    .map((anchor) => {
      const urlMatch = anchor.match(/href="([^"]+)"/);
      const titleMatch = anchor.match(/>([^<]+)</);
      return urlMatch && titleMatch
        ? { url: urlMatch[1], title: titleMatch[1] }
        : null;
    })
    .filter((link): link is { url: string; title: string } => link !== null);

  // Extract attendees (only real email addresses, excluding SIP)
  const attendeeSection = sections.find(
    (section) =>
      section.toLowerCase().includes("attendees:") || section.includes("@")
  );
  const attendees = attendeeSection
    ? attendeeSection
        .split(/[,\n]/)
        .map((email) => email.trim())
        .filter(
          (email) =>
            email.includes("@") &&
            !email.toLowerCase().includes("join by sip") &&
            !email.includes("@zoomcrc.com")
        )
    : [];

  // Extract agenda section
  const agendaSection = sections.find((section) =>
    section.toLowerCase().startsWith("agenda:")
  );

  // Extract Zoom info
  const zoomSection = sections.find((section) =>
    section.includes("Zoom Meeting")
  );
  const joinUrl = zoomSection?.match(/https:\/\/[^\s]+/)?.[0] || "";
  const meetingId = zoomSection?.match(/Meeting ID: ([^\s]+)/)?.[1] || "";
  const passcode = zoomSection?.match(/Passcode: ([^\s]+)/)?.[1] || "";

  return {
    title: sections[0] || "",
    joinUrl,
    meetingId,
    passcode,
    phoneNumbers: [],
    preReadLinks,
    attendees,
    agenda: agendaSection || "",
    rawContent: finalContent,
  };
};
