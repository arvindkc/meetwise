import { useSettingsStore } from "../stores/settingsStore";
import { WeeklyMeetingChart } from "./WeeklyMeetingChart";
import { WeeklyTimeDistribution } from "./WeeklyTimeDistribution";
import {
  getDateRanges,
  filterMeetingsByDateRange,
  DAYS_AGO,
} from "../services/calendarService";

export function Review() {
  const { meetings, targetHours } = useSettingsStore();
  const dateRanges = getDateRanges();
  const historicalMeetings = filterMeetingsByDateRange(
    meetings,
    dateRanges.review.start,
    dateRanges.review.end
  );

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">
        Historical meetings from past {DAYS_AGO} days:{" "}
        {historicalMeetings.length}
      </h3>
      <div className="border rounded-lg p-6 bg-card">
        <WeeklyMeetingChart meetings={historicalMeetings} />
      </div>
      <div className="border rounded-lg p-6 bg-card">
        <WeeklyTimeDistribution
          meetings={historicalMeetings}
          targetHours={targetHours}
        />
      </div>
    </div>
  );
}
