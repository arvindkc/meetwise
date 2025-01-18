interface FormattedMeetingContent {
  title: string;
  joinUrl: string;
  meetingId: string;
  passcode: string;
  phoneNumbers: string[];
  preReadLinks: Array<{ url: string; title: string }>;
  attendees: string[];
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

  // Extract attendees (emails)
  const attendees =
    sections
      .find((section) => section.includes("@"))
      ?.split(",")
      .map((email) => email.trim())
      .filter((email) => email.includes("@")) ?? [];

  // Extract Zoom info
  const zoomSection = sections.find((section) =>
    section.includes("Zoom Meeting")
  );
  const joinUrl = zoomSection?.match(/https:\/\/[^\s]+/)?.[0] || "";
  const meetingId = zoomSection?.match(/Meeting ID: ([^\s]+)/)?.[1] || "";
  const passcode = zoomSection?.match(/Passcode: ([^\s]+)/)?.[1] || "";

  // Extract phone numbers more accurately, excluding Zoom numbers
  const phoneNumbers =
    finalContent
      .match(/\+\d+(\s\d+)*/g)
      ?.filter((num) => {
        // Filter out common Zoom phone number patterns
        const zoomPatterns = [
          /^\+1[0-9]{10}$/, // US/Canada format
          /^\+\d{2}\s\d{2}\s\d{3}\s\d{4}$/, // International format
          /^\+\d{2}\s\d{2}\s\d{4}\s\d{4}$/, // Alternative international format
        ];
        return !zoomPatterns.some((pattern) =>
          pattern.test(num.replace(/\s/g, ""))
        );
      })
      .map((num) => num.trim()) ?? [];

  return {
    title: sections[0] || "",
    joinUrl,
    meetingId,
    passcode,
    phoneNumbers,
    preReadLinks,
    attendees,
    rawContent: finalContent,
  };
};
