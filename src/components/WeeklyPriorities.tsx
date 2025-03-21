import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useSettingsStore } from "../stores/settingsStore";

export function WeeklyPriorities() {
  const { weeklyPriorities, setWeeklyPriorities } = useSettingsStore();
  const [editMode, setEditMode] = useState(false);
  const [localPriorities, setLocalPriorities] = useState(
    weeklyPriorities || ""
  );

  useEffect(() => {
    setLocalPriorities(weeklyPriorities || "");
  }, [weeklyPriorities]);

  const handleSave = async () => {
    await setWeeklyPriorities(localPriorities);
    setEditMode(false);
  };

  const handleCancel = () => {
    setLocalPriorities(weeklyPriorities || "");
    setEditMode(false);
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">
          This Week's Priorities
        </CardTitle>
        {!editMode ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditMode(true)}
            className="h-8 px-2 lg:px-3"
          >
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="h-8 px-2 lg:px-3"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              className="h-8 px-2 lg:px-3"
            >
              Save
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {editMode ? (
          <Textarea
            value={localPriorities}
            onChange={(e) => setLocalPriorities(e.target.value)}
            className="min-h-[100px] resize-y"
            placeholder="Enter your weekly priorities here..."
          />
        ) : (
          <div className="whitespace-pre-wrap">
            {weeklyPriorities ? (
              weeklyPriorities
            ) : (
              <span className="text-gray-400">
                No priorities set for this week. Click Edit to add some.
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
