import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Cross1Icon, CheckIcon } from "@radix-ui/react-icons";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@radix-ui/react-dialog";
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
  const [isSuccess, setIsSuccess] = useState(false);

  const resetDialog = () => {
    setRecipients([{ email: "" }]);
    setIsSending(false);
    setIsSuccess(false);
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const hasValidEmails = () => {
    const filledEmails = recipients.filter((r) => r.email.trim());
    return (
      filledEmails.length > 0 &&
      filledEmails.every((r) => isValidEmail(r.email))
    );
  };

  const handleSendEmail = async () => {
    const validRecipients = recipients.filter(
      (r) => r.email.trim() && isValidEmail(r.email)
    );
    if (validRecipients.length === 0) {
      alert("Please add at least one valid email address");
      return;
    }

    try {
      setIsSending(true);
      await ampEmailService.sendEmail(meetings, validRecipients);
      setIsSuccess(true);
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
      {open && <div className="fixed inset-0 bg-black/50" />}
      <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-[480px] shadow-lg z-50">
        <DialogTitle className="text-2xl font-normal mb-6">
          Send Report
        </DialogTitle>
        <DialogDescription className="sr-only">
          Add email recipients to send the meeting report
        </DialogDescription>
        <div className="space-y-3">
          {recipients.map((recipient, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex items-center gap-2 w-full">
                <span className="text-gray-400">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12Z"
                      fill="currentColor"
                    />
                    <path
                      d="M12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={recipient.email}
                  onChange={(e) => {
                    const newRecipients = [...recipients];
                    newRecipients[index].email = e.target.value;
                    setRecipients(newRecipients);
                  }}
                  className="border-0 border-b border-gray-200 rounded-none focus:ring-0 px-2 py-2"
                  aria-label={`Recipient ${index + 1} email`}
                  required
                />
              </div>
              {recipients.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRecipient(index)}
                  className="p-1 hover:bg-transparent"
                  aria-label={`Remove recipient ${index + 1}`}
                >
                  <Cross1Icon className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            variant="ghost"
            type="button"
            onClick={addRecipient}
            className="w-full text-gray-600 justify-start px-0 hover:bg-transparent"
          >
            <span className="text-xl mr-2">+</span> Add another recipient
          </Button>
        </div>
        <div className="flex justify-end gap-3 mt-8">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-gray-600"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendEmail}
            disabled={isSending || isSuccess || !hasValidEmails()}
            className={`${
              isSuccess
                ? "bg-green-600 hover:bg-green-600"
                : "bg-gray-600 hover:bg-gray-700"
            } flex items-center gap-2`}
          >
            {isSuccess ? (
              <>
                <CheckIcon className="h-4 w-4" />
                Email Sent
              </>
            ) : isSending ? (
              "Sending..."
            ) : (
              "Send Report"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
