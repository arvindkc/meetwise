import fs from "fs";
import path from "path";
import type { Meeting } from "../src/types";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper function to create dates relative to today
const getRelativeDate = (
  daysFromNow: number,
  hours: number,
  minutes: number = 0
) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
};

// Helper to generate a random meeting
const generateMeeting = (id: number, daysFromNow: number) => {
  const startHour = 9 + Math.floor(Math.random() * 7);
  const duration = [0.5, 1, 1.5, 2][Math.floor(Math.random() * 4)];
  const participantCount = Math.floor(Math.random() * 15) + 2;

  const meetingTypes = [
    {
      title: "Team Sync",
      desc: "Regular team sync to discuss progress and blockers",
    },
    {
      title: "Project Review",
      desc: "Review of ongoing project milestones and deliverables",
    },
    {
      title: "Planning Session",
      desc: "Strategic planning and roadmap discussion",
    },
    {
      title: "Client Meeting",
      desc: "Meeting with client stakeholders to discuss requirements",
    },
    {
      title: "Design Review",
      desc: "Review of design proposals and feedback session",
    },
  ];

  const randomType =
    meetingTypes[Math.floor(Math.random() * meetingTypes.length)];
  const hasPreRead = Math.random() > 0.6;

  return {
    id: id.toString(),
    title: `${randomType.title} ${id}`,
    startTime: getRelativeDate(daysFromNow, startHour),
    endTime: getRelativeDate(daysFromNow, startHour + duration),
    duration,
    rank: id,
    location: Math.random() > 0.5 ? "Virtual - Zoom" : "Conference Room A",
    description: hasPreRead
      ? `${randomType.desc}\n\nPre-read: https://docs.example.com/doc${id}`
      : randomType.desc,
    participants: Array(participantCount)
      .fill(null)
      .map((_, i) => `Team Member ${i + 1}`),
    isImportant: Math.random() > 0.7,
    needsPrep: Math.random() > 0.5,
    dayOfWeek: new Date(
      getRelativeDate(daysFromNow, startHour)
    ).toLocaleDateString("en-US", { weekday: "long" }),
    comments:
      Math.random() > 0.7
        ? [
            {
              id: `c${id}`,
              text: "Please review materials before the meeting",
              author: "Team Lead",
              timestamp: new Date().toISOString(),
            },
          ]
        : [],
    icon: "calendar",
    preworkIcon: "file-text",
    showActions: true,
    comment: "",
    rating: 0,
  };
};

// Generate meetings for past 90 days and future 10 days
const generateMeetings = () => {
  const meetings: Meeting[] = [];
  let id = 1;

  for (let day = -90; day <= 10; day++) {
    const date = new Date();
    date.setDate(date.getDate() + day);
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      const meetingsPerDay = Math.floor(Math.random() * 4) + 2;
      for (let m = 0; m < meetingsPerDay; m++) {
        meetings.push(generateMeeting(id++, day));
      }
    }
  }

  return meetings.sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
};

// Generate the mock data file content
const generateMockDataFile = () => {
  const meetings = generateMeetings();
  const fileContent = `
import type { Meeting } from "@/types";

export const mockMeetings: Meeting[] = ${JSON.stringify(meetings, null, 2)};
`;

  const outputPath = path.join(__dirname, "../src/mockData.ts");
  fs.writeFileSync(outputPath, fileContent);
  console.log(
    `Generated mock data with ${meetings.length} meetings at ${outputPath}`
  );
};

generateMockDataFile();
