import { Meeting } from "@/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { startOfWeek, format, parse } from "date-fns";

interface WeeklyMeetingChartProps {
  meetings: Meeting[];
}

interface WeekData {
  weekStart: string;
  totalHours: number;
}

export function WeeklyMeetingLoad({ meetings }: WeeklyMeetingChartProps) {
  // Group meetings by week
  const weeklyData = meetings.reduce((acc: WeekData[], meeting) => {
    const meetingDate = new Date(meeting.startTime);
    const weekStart = startOfWeek(meetingDate, { weekStartsOn: 1 }); // Monday
    const weekStartStr = format(weekStart, "MMM d, yyyy");

    const existingWeek = acc.find((w) => w.weekStart === weekStartStr);
    if (existingWeek) {
      existingWeek.totalHours = +(
        existingWeek.totalHours + meeting.duration
      ).toFixed(2);
    } else {
      acc.push({
        weekStart: weekStartStr,
        totalHours: +meeting.duration.toFixed(2),
      });
    }

    return acc;
  }, []);

  // Sort by week start date with year
  weeklyData.sort((a, b) => {
    const dateA = parse(a.weekStart, "MMM d, yyyy", new Date());
    const dateB = parse(b.weekStart, "MMM d, yyyy", new Date());
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div className="w-full h-[300px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={weeklyData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 25,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="weekStart"
            label={{ value: "Week Starting", position: "bottom" }}
          />
          <YAxis
            label={{
              value: "Total Hours",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Tooltip formatter={(value: number) => value.toFixed(2)} />
          <Line
            type="monotone"
            dataKey="totalHours"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
