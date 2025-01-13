import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { MeetingStats } from '@/types';

interface StatsPanelProps {
  stats: MeetingStats;
}

export function StatsPanel({ stats }: StatsPanelProps) {
  const progressPercentage = (stats.totalHours / stats.targetHours) * 100;
  const isOverTarget = stats.totalHours > stats.targetHours;

  return (
    <Card className="p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Meeting Statistics</h2>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600">Total Hours</span>
            <span className="font-medium">{stats.totalHours}h</span>
          </div>
          <Progress value={progressPercentage} className={isOverTarget ? "text-red-500" : ""} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-600">Target Hours</span>
            <p className="font-medium">{stats.targetHours}h</p>
          </div>
          
          <div>
            <span className="text-sm text-gray-600">Available Hours</span>
            <p className="font-medium">{stats.availableHours}h</p>
          </div>
          
          {isOverTarget && (
            <div className="col-span-2">
              <span className="text-sm text-red-500">Over Target</span>
              <p className="font-medium text-red-500">+{stats.overHours}h</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}