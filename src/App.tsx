import { useState, useEffect } from "react";
import { useSettingsStore } from "./stores/settingsStore";
import { Schedule } from "./components/Schedule";
import { Insights } from "./components/Insights";
import { Header } from "./components/Header";
import { cn } from "@/lib/utils";
import { googleCalendarService } from "./services/googleCalendarService";

function App() {
  const { meetings, setMeetings, clearAllData } = useSettingsStore();
  const [useMockData, setUseMockData] = useState(false);
  const [activeTab, setActiveTab] = useState<"schedule" | "insights">(
    "schedule"
  );

  useEffect(() => {
    googleCalendarService.initializeGoogleApi(
      import.meta.env.VITE_GOOGLE_CLIENT_ID
    );
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto p-6">
        <Header
          meetings={meetings}
          setMeetings={setMeetings}
          clearAllData={clearAllData}
          useMockData={useMockData}
          setUseMockData={setUseMockData}
        />

        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab("schedule")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md",
              activeTab === "schedule"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
          >
            Schedule
          </button>
          <button
            onClick={() => setActiveTab("insights")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md",
              activeTab === "insights"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
          >
            Insights
          </button>
        </div>

        {activeTab === "schedule" ? <Schedule /> : <Insights />}
      </div>
    </div>
  );
}

export default App;
