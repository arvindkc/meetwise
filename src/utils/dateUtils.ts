import { DateRange } from "@/types/calendar";

/**
 * Returns the date range for the current week (Sunday to Saturday)
 */
export function getDefaultDateRange(): DateRange {
  const today = new Date();
  const startOfWeek = new Date(today);
  const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday

  // Set to beginning of current week (Sunday)
  startOfWeek.setDate(today.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);

  // End of week is 6 days after start (Saturday)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return {
    startDate: startOfWeek,
    endDate: endOfWeek,
  };
}
