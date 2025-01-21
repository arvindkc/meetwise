import { Meeting } from "../types";
import { parseMeetingContent } from "@/utils/meetingContentFormatter";
import {
  ClockIcon,
  PersonIcon,
  ExclamationTriangleIcon,
  FileTextIcon,
} from "@radix-ui/react-icons";

interface MeetingInsightsProps {
  meetings: Meeting[];
}

export function MeetingInsights({ meetings }: MeetingInsightsProps) {
  // Calculate continuous working time blocks
  const getContinuousWorkingTimePercentage = (meetings: Meeting[]) => {
    // Group meetings by day
    const meetingsByDay = meetings.reduce((acc, meeting) => {
      const date = new Date(meeting.startTime).toDateString();
      acc[date] = acc[date] || [];
      acc[date].push(meeting);
      return acc;
    }, {} as Record<string, Meeting[]>);

    let daysWithLongBlocks = 0;
    const totalDays = Object.keys(meetingsByDay).length;

    Object.values(meetingsByDay).forEach((dayMeetings) => {
      // Sort meetings by start time
      const sortedMeetings = dayMeetings.sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );

      let currentBlockDuration = 0;
      for (let i = 0; i < sortedMeetings.length; i++) {
        currentBlockDuration += sortedMeetings[i].duration;
        if (currentBlockDuration >= 1) {
          daysWithLongBlocks++;
          break;
        }
      }
    });

    return totalDays ? Math.round((daysWithLongBlocks / totalDays) * 100) : 0;
  };

  // Calculate maximum back-to-back meetings
  const getMaxBackToBackMeetings = (meetings: Meeting[]) => {
    const sortedMeetings = [...meetings].sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    let maxStreak = 0;
    let currentStreak = 1;

    for (let i = 1; i < sortedMeetings.length; i++) {
      const prevMeetingEnd =
        new Date(sortedMeetings[i - 1].startTime).getTime() +
        sortedMeetings[i - 1].duration * 60 * 60 * 1000;
      const currentMeetingStart = new Date(
        sortedMeetings[i].startTime
      ).getTime();

      if (currentMeetingStart - prevMeetingEnd <= 15 * 60 * 1000) {
        // 15 minutes or less gap
        currentStreak++;
      } else {
        currentStreak = 1;
      }
      maxStreak = Math.max(maxStreak, currentStreak);
    }

    return maxStreak;
  };

  // Calculate meetings with more than 12 attendees
  const getLargeMeetingsCount = (meetings: Meeting[]) => {
    return meetings.filter((meeting) => {
      const filteredParticipants = meeting.participants.filter(
        (participant) => !participant.includes("resource.calendar.google.com")
      );
      return filteredParticipants.length > 12;
    }).length;
  };

  // Calculate meetings with more than 3 attendees but no pre-read
  const getMeetingsNeedingPreRead = (meetings: Meeting[]) => {
    return meetings.filter((meeting) => {
      const filteredParticipants = meeting.participants.filter(
        (participant) => !participant.includes("resource.calendar.google.com")
      );
      const formattedContent = parseMeetingContent(meeting.description || "");
      return (
        filteredParticipants.length > 3 &&
        formattedContent.preReadLinks.length === 0
      );
    });
  };

  const continuousWorkingTimePercentage =
    getContinuousWorkingTimePercentage(meetings);
  const maxBackToBack = getMaxBackToBackMeetings(meetings);
  const largeMeetingsCount = getLargeMeetingsCount(meetings);
  const meetingsNeedingPreRead = getMeetingsNeedingPreRead(meetings);

  return (
    <div className="bg-white rounded-lg shadow p-4 grid grid-cols-2 gap-4">
      <div className="p-3 bg-gray-50 rounded">
        <div className="flex items-center gap-2">
          <ClockIcon className="w-4 h-4 text-gray-600" />
          <h4 className="font-semibold text-sm text-gray-600">
            Continuous Work Time
          </h4>
        </div>
        <p className="text-xl font-bold">{continuousWorkingTimePercentage}%</p>
        <p className="text-xs text-gray-500">days with &gt;1hr blocks</p>
      </div>
      <div className="p-3 bg-gray-50 rounded">
        <div className="flex items-center gap-2">
          <ExclamationTriangleIcon className="w-4 h-4 text-gray-600" />
          <h4 className="font-semibold text-sm text-gray-600">Back-to-Back</h4>
        </div>
        <p className="text-xl font-bold">{maxBackToBack}</p>
        <p className="text-xs text-gray-500">max consecutive meetings</p>
      </div>
      <div className="p-3 bg-gray-50 rounded">
        <div className="flex items-center gap-2">
          <PersonIcon className="w-4 h-4 text-gray-600" />
          <h4 className="font-semibold text-sm text-gray-600">
            Large Meetings
          </h4>
        </div>
        <p className="text-xl font-bold">{largeMeetingsCount}</p>
        <p className="text-xs text-gray-500">meetings with &gt;12 attendees</p>
      </div>
      <div className="p-3 bg-gray-50 rounded">
        <div className="flex items-center gap-2">
          <FileTextIcon className="w-4 h-4 text-gray-600" />
          <h4 className="font-semibold text-sm text-gray-600">
            Missing Pre-read
          </h4>
        </div>
        <p className="text-xl font-bold">{meetingsNeedingPreRead.length}</p>
        <p className="text-xs text-gray-500">meetings needing pre-read</p>
      </div>
    </div>
  );
}
