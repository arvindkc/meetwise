import { useSettingsStore } from "../stores/settingsStore";

export function Insights() {
  const { meetings } = useSettingsStore();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Meeting Insights</h2>
      {/* Add your insights content here */}
      <p>Coming soon...</p>
    </div>
  );
} 