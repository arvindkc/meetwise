import { useState } from "react";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";

interface DateRangePickerProps {
  onDateSelect: (startDate: Date, endDate: Date) => void;
}

export function DateRangePicker({ onDateSelect }: DateRangePickerProps) {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {startDate ? format(startDate, "PP") : "Pick dates"}
          {endDate && " - " + format(endDate, "PP")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={{ from: startDate, to: endDate }}
          onSelect={(range) => {
            if (range?.from && range?.to) {
              setStartDate(range.from);
              setEndDate(range.to);
              onDateSelect(range.from, range.to);
            }
          }}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
