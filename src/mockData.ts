import type { Meeting } from "@/types";

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

export const mockMeetings: Meeting[] = [
  {
    id: "1",
    title: "Q1 Strategy Planning",
    startTime: getRelativeDate(0, 9), // Today at 9 AM
    endTime: getRelativeDate(0, 11), // Today at 11 AM
    duration: 2,
    rank: 1,
    location: "Main Conference Room",
    description:
      "Quarterly strategy planning session with leadership team to align on Q1 objectives and key initiatives.",
    participants: [
      "Sarah Johnson",
      "Mike Chen",
      "Alex Rodriguez",
      "Emma Williams",
    ],
    isImportant: true,
    needsPrep: true,
    dayOfWeek: "Monday",
    comments: [
      {
        id: "c1",
        text: "Please prepare Q4 results summary for review",
        author: "Sarah Johnson",
        timestamp: "2024-01-10T15:30:00Z",
      },
    ],
    icon: "calendar",
    preworkIcon: "file-text",
    showActions: true,
    comment: "",
  },
  {
    id: "2",
    title: "Product Review",
    startTime: getRelativeDate(1, 14), // Tomorrow at 2 PM
    endTime: getRelativeDate(1, 15, 30), // Tomorrow at 3:30 PM
    duration: 1.5,
    rank: 2,
    location: "Virtual - Zoom",
    description:
      "Review of new product features with the development team and stakeholders.",
    participants: ["David Kim", "Lisa Chen", "Tom Wilson"],
    isImportant: true,
    needsPrep: false,
    dayOfWeek: "Monday",
    comments: [],
    icon: "video",
    preworkIcon: "file-text",
    showActions: true,
    comment: "",
  },
  {
    id: "3",
    title: "Team Weekly Sync",
    startTime: getRelativeDate(2, 10), // 2 days from now at 10 AM
    endTime: getRelativeDate(2, 11), // 2 days from now at 11 AM
    duration: 1,
    rank: 3,
    location: "Meeting Room 2",
    description:
      "Regular team sync to discuss progress, blockers, and upcoming work.",
    participants: ["Full Team"],
    isImportant: false,
    needsPrep: false,
    dayOfWeek: "Tuesday",
    comments: [
      {
        id: "c2",
        text: "Let's keep this focused on key updates only",
        author: "Team Lead",
        timestamp: "2024-01-15T09:00:00Z",
      },
    ],
    icon: "calendar",
    preworkIcon: "file-text",
    showActions: true,
    comment: "",
  },
  {
    id: "4",
    title: "Client Presentation",
    startTime: getRelativeDate(3, 15), // 3 days from now at 3 PM
    endTime: getRelativeDate(3, 16, 30), // 3 days from now at 4:30 PM
    duration: 1.5,
    rank: 4,
    location: "Client Office",
    description: "Presentation of Q1 roadmap to key client stakeholders.",
    participants: ["Sarah Johnson", "Client Team"],
    isImportant: true,
    needsPrep: true,
    dayOfWeek: "Tuesday",
    comments: [],
    icon: "calendar",
    preworkIcon: "file-text",
    showActions: true,
    comment: "",
  },
  {
    id: "5",
    title: "HR Training Session",
    startTime: getRelativeDate(4, 13), // 4 days from now at 1 PM
    endTime: getRelativeDate(4, 15), // 4 days from now at 3 PM
    duration: 2,
    rank: 5,
    location: "Training Room",
    description: "Mandatory annual HR training session for all employees.",
    participants: ["All Staff"],
    isImportant: false,
    needsPrep: false,
    dayOfWeek: "Wednesday",
    comments: [],
    icon: "calendar",
    preworkIcon: "file-text",
    showActions: true,
    comment: "",
  },
];
