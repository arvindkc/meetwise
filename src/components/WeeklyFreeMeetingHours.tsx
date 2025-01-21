import { Meeting } from "@/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { startOfWeek, format, parse } from "date-fns";

interface WeeklyTimeDistributionProps {
  meetings: Meeting[];
  targetHours: number;
}

interface WeekData {
  weekStart: string;
  meetingHours: number;
  freeHours: number;
}

export function WeeklyFreeMeetingHours({
  meetings,
  targetHours,
}: WeeklyTimeDistributionProps) {
  // Group meetings by week
  const weeklyData = meetings.reduce((acc: WeekData[], meeting) => {
    const meetingDate = new Date(meeting.startTime);
    const weekStart = startOfWeek(meetingDate, { weekStartsOn: 1 });
    const weekStartStr = format(weekStart, "MMM d, yyyy");

    const existingWeek = acc.find((w) => w.weekStart === weekStartStr);
    if (existingWeek) {
      existingWeek.meetingHours = +(
        existingWeek.meetingHours + meeting.duration
      ).toFixed(2);
      existingWeek.freeHours = +(
        targetHours - existingWeek.meetingHours
      ).toFixed(2);
    } else {
      acc.push({
        weekStart: weekStartStr,
        meetingHours: +meeting.duration.toFixed(2),
        freeHours: +(targetHours - meeting.duration).toFixed(2),
      });
    }

    return acc;
  }, []);

  // Sort by week start date
  weeklyData.sort((a, b) => {
    const dateA = parse(a.weekStart, "MMM d, yyyy", new Date());
    const dateB = parse(b.weekStart, "MMM d, yyyy", new Date());
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div className="w-full h-[300px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={weeklyData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 45,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
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
          <Bar
            dataKey="meetingHours"
            name="Meeting Hours"
            stackId="a"
            fill="#8884d8"
          />
          <Bar
            dataKey="freeHours"
            name="Available Hours"
            stackId="a"
            fill="#82ca9d"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
