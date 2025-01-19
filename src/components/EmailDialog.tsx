import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Cross1Icon } from "@radix-ui/react-icons";
import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { Meeting } from "@/types";
import { ampEmailService } from "@/services/ampEmailService";

interface EmailDialogProps {
  meetings: Meeting[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EmailDialog({
  meetings,
  open,
  onOpenChange,
  onSuccess,
}: EmailDialogProps) {
  const [recipients, setRecipients] = useState<{ email: string }[]>([
    { email: "" },
  ]);
  const [isSending, setIsSending] = useState(false);

  const resetDialog = () => {
    setRecipients([{ email: "" }]);
    setIsSending(false);
  };

  const handleSendEmail = async () => {
    const validRecipients = recipients.filter((r) => r.email.trim());
    if (validRecipients.length === 0) {
      alert("Please add at least one recipient");
      return;
    }

    try {
      setIsSending(true);
      await ampEmailService.sendEmail(meetings, validRecipients);
      onSuccess?.();
      setTimeout(() => {
        onOpenChange(false);
        resetDialog();
      }, 2000);
    } catch (error) {
      console.error("Failed to send email:", error);
      alert("Failed to send email. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const addRecipient = () => {
    setRecipients([...recipients, { email: "" }]);
  };

  const removeRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle>Send Report</DialogTitle>
        <div className="space-y-4 mt-4">
          {recipients.map((recipient, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                placeholder="Enter email address"
                value={recipient.email}
                onChange={(e) => {
                  const newRecipients = [...recipients];
                  newRecipients[index].email = e.target.value;
                  setRecipients(newRecipients);
                }}
              />
              {recipients.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRecipient(index)}
                  className="p-2"
                >
                  <Cross1Icon className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            variant="outline"
            type="button"
            onClick={addRecipient}
            className="w-full"
          >
            Add another recipient
          </Button>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSendEmail} disabled={isSending}>
            {isSending ? "Sending..." : "Send Report"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
