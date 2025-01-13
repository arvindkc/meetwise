function exportCalendarEvents() {
  // Set your date range
  const startDate = new Date("2024-01-15"); // Monday
  const endDate = new Date("2024-01-19"); // Friday

  // Get calendar events
  const calendar = CalendarApp.getDefaultCalendar();
  const events = calendar.getEvents(startDate, endDate);

  // Format events for export
  const formattedEvents = events.map((event, index) => ({
    id: (index + 1).toString(),
    title: event.getTitle(),
    startTime: event.getStartTime().toISOString(),
    endTime: event.getEndTime().toISOString(),
    duration: (event.getEndTime() - event.getStartTime()) / (1000 * 60 * 60), // hours
    rank: index + 1,
    location: event.getLocation() || "No location specified",
    description: event.getDescription() || "",
    participants: event.getGuestList().map((guest) => guest.getEmail()),
    priority: index + 1,
    isImportant: false,
    needsPrep: false,
    dayOfWeek: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ][event.getStartTime().getDay()],
    comments: [],
    icon: "calendar",
    preworkIcon: "file-text",
    showActions: true,
    comment: "",
  }));

  // Create JSON file
  const fileContent = JSON.stringify(formattedEvents, null, 2);
  DriveApp.createFile("calendar-export.json", fileContent, "application/json");
}
