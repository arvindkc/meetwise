import { useSettingsStore } from "../stores/settingsStore";
import {
  getDateRanges,
  filterMeetingsByDateRange,
} from "../services/calendarService";

export function Insights() {
  const { meetings } = useSettingsStore();
  const dateRanges = getDateRanges();
  const historicalMeetings = filterMeetingsByDateRange(
    meetings,
    dateRanges.insights.start,
    dateRanges.insights.end
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Meeting Insights</h2>
      <p>Historical meetings from past 90 days: {historicalMeetings.length}</p>
      {/* Add your insights content here */}
    </div>
  );
}
