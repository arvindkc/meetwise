import { useSettingsStore } from "../stores/settingsStore";
import { WeeklyMeetingChart } from "./WeeklyMeetingChart";
import { WeeklyTimeDistribution } from "./WeeklyTimeDistribution";
import {
  getDateRanges,
  filterMeetingsByDateRange,
  DAYS_AGO,
} from "../services/calendarService";

export function Insights() {
  const { meetings, targetHours } = useSettingsStore();
  const dateRanges = getDateRanges();
  const historicalMeetings = filterMeetingsByDateRange(
    meetings,
    dateRanges.insights.start,
    dateRanges.insights.end
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Meeting Insights</h2>
      <p>
        Historical meetings from past {DAYS_AGO} days:{" "}
        {historicalMeetings.length}
      </p>
      <WeeklyMeetingChart meetings={historicalMeetings} />
      <WeeklyTimeDistribution
        meetings={historicalMeetings}
        targetHours={targetHours}
      />
    </div>
  );
}
