import * as React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CalendarIcon,
  VideoIcon,
  PersonIcon,
  FileTextIcon,
  ClipboardIcon,
  BellIcon,
  StarFilledIcon as FlagIcon,
  StarIcon,
  HomeIcon,
  LaptopIcon,
  MobileIcon as PhoneIcon,
  EnvelopeClosedIcon,
  ChatBubbleIcon,
} from "@radix-ui/react-icons";

const ICONS = {
  calendar: CalendarIcon,
  video: VideoIcon,
  users: PersonIcon,
  "file-text": FileTextIcon,
  clipboard: ClipboardIcon,
  bell: BellIcon,
  flag: FlagIcon,
  star: StarIcon,
  home: HomeIcon,
  laptop: LaptopIcon,
  phone: PhoneIcon,
  mail: EnvelopeClosedIcon,
  "message-circle": ChatBubbleIcon,
} as const;

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  className?: string;
}

export function IconPicker({ value, onChange, className }: IconPickerProps) {
  const IconComponent = ICONS[value as keyof typeof ICONS] || CalendarIcon;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("w-8 h-8 p-0", className)}
        >
          <IconComponent className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-2">
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(ICONS).map(([name, Icon]) => (
            <Button
              key={name}
              variant="ghost"
              size="sm"
              className={cn("w-8 h-8 p-0", value === name && "bg-muted")}
              onClick={() => onChange(name)}
            >
              <Icon className="w-4 h-4" />
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
