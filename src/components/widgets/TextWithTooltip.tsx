"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TextWithTooltipProps {
  text?: string | null;
  maxWidth?: string; // masalan: "160px", "200px"
  className?: string;
}

export function TextWithTooltip({
  text,
  maxWidth = "180px",
  className = "",
}: TextWithTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`block truncate cursor-pointer ${className}`}
            style={{ maxWidth }}
          >
            {text || <span className="text-red-500">--</span>}
          </span>
        </TooltipTrigger>

        {text && (
          <TooltipContent className="max-w-sm whitespace-pre-wrap break-words">
            {text}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
