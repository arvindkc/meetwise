import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import type { MeetingStats } from "@/types";
import { useSettingsStore } from "@/stores/settingsStore";

interface StatsPanelProps {
  stats: MeetingStats;
}

export function StatsPanel({ stats }: StatsPanelProps) {
  const { targetHours, setTargetHours } = useSettingsStore();
  const isOverTarget = stats.totalHours > targetHours;
  const progressPercentage = isOverTarget
    ? 100
    : (stats.totalHours / targetHours) * 100;

  const formatHours = (hours: number) => {
    return hours.toFixed(2);
  };

  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Meeting Time This Week</h2>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <div className="flex items-center">
              <span className="text-sm text-gray-600">
                Meeting Hours: {formatHours(stats.totalHours)}h
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Target Hours:</span>
              <Input
                type="number"
                value={targetHours}
                onChange={(e) => setTargetHours(Number(e.target.value))}
                min="0"
                className="w-20 h-8"
              />
            </div>
          </div>
          <Progress
            value={progressPercentage}
            className={isOverTarget ? "bg-gray-200" : ""}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-600">
              Available Hours:{" "}
              {formatHours(Math.max(0, targetHours - stats.totalHours))}h
            </span>
          </div>

          {isOverTarget ? (
            <div>
              <span className="text-sm text-red-500">
                Over Target: +
                {formatHours(Math.max(0, stats.totalHours - targetHours))}h
              </span>
            </div>
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </Card>
  );
}
