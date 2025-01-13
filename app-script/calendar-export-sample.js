function exportCalendarEvents() {
  const startDate = new Date("2025-01-13");
  const endDate = new Date("2025-01-17");

  const calendar = CalendarApp.getDefaultCalendar();
  const events = calendar.getEvents(startDate, endDate);

  // Filter out all-day events and single-attendee events
  const filteredEvents = events.filter((event) => {
    const isAllDay = event.isAllDayEvent();
    const attendees = event.getGuestList();
    const isOnlyMe =
      attendees.length === 0 ||
      (attendees.length === 1 &&
        attendees[0].getEmail() === Session.getActiveUser().getEmail());

    return !isAllDay && !isOnlyMe;
  });

  const formattedEvents = filteredEvents.map((event, index) => ({
    id: (index + 1).toString(),
    title: event.getTitle(),
    startTime: event.getStartTime().toISOString(),
    endTime: event.getEndTime().toISOString(),
    duration: (event.getEndTime() - event.getStartTime()) / (1000 * 60 * 60),
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

  const fileContent = JSON.stringify(formattedEvents, null, 2);
  DriveApp.createFile("calendar-export.json", fileContent, "application/json");
}
