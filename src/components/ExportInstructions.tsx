import { InfoCircledIcon } from "@radix-ui/react-icons";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

const SCRIPT_URL = "https://pastebin.com/vZWz6YjC";

export function ExportInstructions() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <InfoCircledIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <div className="space-y-2">
          <h4 className="font-medium">How to Export Calendar Events</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
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
          <p className="text-xs text-muted-foreground mt-2">
            <strong>Privacy:</strong> All processing happens locally in your
            browser. No calendar data is sent to any servers.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
