import { Meeting } from "@/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { startOfWeek, format } from "date-fns";

interface Props {
  meetings: Meeting[];
}

interface WeekData {
  weekStart: string;
  oneOnOne: number;
  external: number;
  other: number;
}

export function WeeklyMeetingTypeDistribution({ meetings }: Props) {
  const isOneOnOne = (meeting: Meeting) => {
    const filteredParticipants = meeting.participants.filter(
      (p) => !p.includes("resource.calendar.google.com")
    );
    return filteredParticipants.length === 2;
  };

  const isExternal = (meeting: Meeting) => {
    const filteredParticipants = meeting.participants.filter(
      (p) => !p.includes("resource.calendar.google.com")
    );
    const domains = filteredParticipants
      .map((email) => email.split("@")[1])
      .filter(Boolean);
    const uniqueDomains = new Set(domains);
    return uniqueDomains.size > 1;
  };

  const weeklyData = meetings.reduce((acc: WeekData[], meeting) => {
    const meetingDate = new Date(meeting.startTime);
    const weekStart = startOfWeek(meetingDate, { weekStartsOn: 1 });
    const weekStartStr = format(weekStart, "MMM d, yyyy");

    const existingWeek = acc.find((w) => w.weekStart === weekStartStr);
    if (existingWeek) {
      if (isOneOnOne(meeting)) existingWeek.oneOnOne += meeting.duration;
      else if (isExternal(meeting)) existingWeek.external += meeting.duration;
      else existingWeek.other += meeting.duration;
    } else {
      acc.push({
        weekStart: weekStartStr,
        oneOnOne: isOneOnOne(meeting) ? meeting.duration : 0,
        external: isExternal(meeting) ? meeting.duration : 0,
        other:
          !isOneOnOne(meeting) && !isExternal(meeting) ? meeting.duration : 0,
      });
    }

    return acc;
  }, []);

  return (
    <div className="w-full h-[300px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={weeklyData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 25,
          }}
        >
          <XAxis
            dataKey="weekStart"
            label={{ value: "Week Starting", position: "bottom" }}
          />
          <YAxis
            label={{
              value: "Hours",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Tooltip formatter={(value: number) => value.toFixed(2)} />
          <Legend verticalAlign="top" height={36} />
          <Bar dataKey="oneOnOne" name="1:1" stackId="a" fill="#8884d8" />
          <Bar dataKey="external" name="External" stackId="a" fill="#82ca9d" />
          <Bar dataKey="other" name="Other" stackId="a" fill="#ffc658" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
