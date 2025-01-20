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

interface ZoomInfo {
  joinUrl: string;
  meetingId: string;
  passcode: string;
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
    .replace(/[-_]{3,}/g, "")
    .trim();
};

export const restoreAnchors = (content: string, anchors: string[]): string => {
  return content.replace(
    /{{ANCHOR(\d+)}}/g,
    (_, index) => anchors[parseInt(index)]
  );
};

const extractPreReadLinks = (
  anchors: string[]
): Array<{ url: string; title: string }> => {
  return anchors
    .map((anchor) => {
      const urlMatch = anchor.match(/href="([^"]+)"/);
      const titleMatch = anchor.match(/>([^<]+)</);
      return urlMatch && titleMatch
        ? { url: urlMatch[1], title: titleMatch[1] }
        : null;
    })
    .filter((link): link is { url: string; title: string } => link !== null);
};

const extractAttendees = (sections: string[]): string[] => {
  const attendeeSection = sections.find(
    (section) =>
      section.toLowerCase().includes("attendees:") || section.includes("@")
  );

  return attendeeSection
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
};

const extractZoomInfo = (sections: string[]): ZoomInfo => {
  const zoomSection = sections.find((section) =>
    section.includes("Zoom Meeting")
  );
  return {
    joinUrl: zoomSection?.match(/https:\/\/[^\s]+/)?.[0] || "",
    meetingId: zoomSection?.match(/Meeting ID: ([^\s]+)/)?.[1] || "",
    passcode: zoomSection?.match(/Passcode: ([^\s]+)/)?.[1] || "",
  };
};

export const parseMeetingContent = (
  content: string
): FormattedMeetingContent => {
  // Clean horizontal lines from raw content first
  const initialCleanContent = content
    .replace(/[-_]{3,}/g, "")
    .replace(/\n[-_]{3,}\n/g, "\n");

  const { processedContent, anchors } = preserveAnchors(initialCleanContent);
  const cleanContent = cleanHtml(processedContent);
  const finalContent = restoreAnchors(cleanContent, anchors);
  const sections = finalContent.split("\n\n").filter(Boolean);

  const preReadLinks = extractPreReadLinks(anchors);
  const attendees = extractAttendees(sections);
  const zoomInfo = extractZoomInfo(sections);

  const agendaSection = sections.find((section) =>
    section.toLowerCase().startsWith("agenda:")
  );

  return {
    title: sections[0] || "",
    ...zoomInfo,
    phoneNumbers: [],
    preReadLinks,
    attendees,
    agenda: agendaSection || "",
    rawContent: finalContent,
  };
};
