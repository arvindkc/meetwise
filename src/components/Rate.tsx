import { useSettingsStore } from "../stores/settingsStore";
import { MeetingRater } from "./MeetingRater";
import {
  getDateRanges,
  filterMeetingsByDateRange,
} from "../services/calendarService";

export function Rate() {
  const { meetings } = useSettingsStore();
  const dateRanges = getDateRanges();
  const lastWeekMeetings = filterMeetingsByDateRange(
    meetings,
    dateRanges.rate.start,
    dateRanges.rate.end
  );

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">
        Rate meetings from the past week: {lastWeekMeetings.length}
      </h3>
      <div className="space-y-2">
        {lastWeekMeetings.map((meeting) => (
          <MeetingRater key={meeting.id} meeting={meeting} />
        ))}
      </div>
    </div>
  );
}