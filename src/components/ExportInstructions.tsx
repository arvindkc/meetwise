import { useState } from "react";
import { InfoCircledIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";

const SCRIPT_URL = "https://pastebin.com/vZWz6YjC";

export function ExportInstructions() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-4 bg-blue-50 rounded-lg border border-blue-200">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between text-blue-800 hover:bg-blue-100 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <InfoCircledIcon className="w-5 h-5" />
          <span className="font-medium">How to Export Calendar Events</span>
        </div>
        <ChevronDownIcon
          className={cn(
            "w-5 h-5 transition-transform duration-200",
            isExpanded ? "transform rotate-180" : ""
          )}
        />
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 text-sm space-y-3 text-gray-600">
          <div className="space-y-2">
            <ol className="list-decimal list-inside space-y-2">
              <li>
                Go to{" "}
                <a
                  href="https://script.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Google Apps Script
                </a>
              </li>
              <li>Click "New Project"</li>
              <li>
                Copy the script from{" "}
                <a
                  href={SCRIPT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  here
                </a>
              </li>
              <li>Paste it into the editor</li>
              <li>Modify the date range in the script (optional)</li>
              <li>Click "Run" ▶️</li>
              <li>Authorize the script when prompted</li>
              <li>Find the exported JSON file in your Google Drive</li>
              <li>Download and import it here</li>
            </ol>
          </div>

          <div className="mt-4 p-3 bg-blue-100 rounded">
            <p className="text-xs">
              <strong>Privacy:</strong> All processing happens locally in your
              browser. No calendar data is sent to any servers.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
