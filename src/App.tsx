import { useState, useEffect } from "react";
import { useSettingsStore } from "./stores/settingsStore";
import { Plan } from "./components/Plan";
import { Review } from "./components/Review";
import { Rate } from "./components/Rate";
import { Header } from "./components/Header";
import { cn } from "@/lib/utils";
import { googleCalendarService } from "./services/googleCalendarService";

function App() {
  const { meetings, setMeetings, clearAllData, initializeStore, isLoading } =
    useSettingsStore();
  const [useMockData, setUseMockData] = useState(false);
  const [activeTab, setActiveTab] = useState<"review" | "rate" | "plan">(
    "review"
  );
  const [storeInitialized, setStoreInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        // Initialize Google API with proper error handling
        await googleCalendarService.initializeGoogleApi(
          import.meta.env.VITE_GOOGLE_CLIENT_ID
        );
      } catch (error) {
        console.error("Failed to initialize Google API:", error);
        // Continue with the app even if Google API fails
      }

      // Initialize store regardless of Google API status
      await initializeStore();
      setStoreInitialized(true);
    };

    init();
  }, [initializeStore]);

  if (isLoading || !storeInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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

        <div className="flex flex-col gap-2">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab("review")}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md",
                activeTab === "review"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              Review
            </button>
            <button
              onClick={() => setActiveTab("rate")}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md",
                activeTab === "rate"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              Rate
            </button>
            <button
              onClick={() => setActiveTab("plan")}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md",
                activeTab === "plan"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              Plan
            </button>
          </div>
          <div className="h-px bg-gray-200 mb-4" />
        </div>

        {activeTab === "review" ? (
          <Review />
        ) : activeTab === "rate" ? (
          <Rate />
        ) : (
          <Plan />
        )}
      </div>
    </div>
  );
}

export default App;
