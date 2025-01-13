import type { Meeting } from '@/types';

export const mockMeetings: Meeting[] = [
  {
    id: "1",
    title: "Q1 Strategy Planning",
    startTime: "2024-01-15T09:00:00Z",
    endTime: "2024-01-15T11:00:00Z",
    duration: 2,
    location: "Main Conference Room",
    description: "Quarterly strategy planning session with leadership team to align on Q1 objectives and key initiatives.",
    participants: ["Sarah Johnson", "Mike Chen", "Alex Rodriguez", "Emma Williams"],
    priority: 1,
    isImportant: true,
    needsPrep: true,
    dayOfWeek: "Monday",
    comments: [
      {
        id: "c1",
        text: "Please prepare Q4 results summary for review",
        author: "Sarah Johnson",
        timestamp: "2024-01-10T15:30:00Z"
      }
    ]
  },
  {
    id: "2",
    title: "Product Review",
    startTime: "2024-01-15T14:00:00Z",
    endTime: "2024-01-15T15:30:00Z",
    duration: 1.5,
    location: "Virtual - Zoom",
    description: "Review of new product features with the development team and stakeholders.",
    participants: ["David Kim", "Lisa Chen", "Tom Wilson"],
    priority: 2,
    isImportant: true,
    needsPrep: false,
    dayOfWeek: "Monday",
    comments: []
  },
  {
    id: "3",
    title: "Team Weekly Sync",
    startTime: "2024-01-16T10:00:00Z",
    endTime: "2024-01-16T11:00:00Z",
    duration: 1,
    location: "Meeting Room 2",
    description: "Regular team sync to discuss progress, blockers, and upcoming work.",
    participants: ["Full Team"],
    priority: 3,
    isImportant: false,
    needsPrep: false,
    dayOfWeek: "Tuesday",
    comments: [
      {
        id: "c2",
        text: "Let's keep this focused on key updates only",
        author: "Team Lead",
        timestamp: "2024-01-15T09:00:00Z"
      }
    ]
  },
  {
    id: "4",
    title: "Client Presentation",
    startTime: "2024-01-16T15:00:00Z",
    endTime: "2024-01-16T16:30:00Z",
    duration: 1.5,
    location: "Client Office",
    description: "Presentation of Q1 roadmap to key client stakeholders.",
    participants: ["Sarah Johnson", "Client Team"],
    priority: 4,
    isImportant: true,
    needsPrep: true,
    dayOfWeek: "Tuesday",
    comments: []
  },
  {
    id: "5",
    title: "HR Training Session",
    startTime: "2024-01-17T13:00:00Z",
    endTime: "2024-01-17T15:00:00Z",
    duration: 2,
    location: "Training Room",
    description: "Mandatory annual HR training session for all employees.",
    participants: ["All Staff"],
    priority: 5,
    isImportant: false,
    needsPrep: false,
    dayOfWeek: "Wednesday",
    comments: []
  }
];