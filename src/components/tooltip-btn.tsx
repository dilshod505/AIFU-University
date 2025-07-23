import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

type TooltipBtnProps = any & {
  children: React.ReactNode;
};

const TooltipBtn = ({ children, ...props }: TooltipBtnProps) => {
  const tooltipText = props.title || props["aria-label"];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button {...props} title={undefined}>
          {children}
        </Button>
      </TooltipTrigger>
      {tooltipText && (
        <TooltipContent sideOffset={5}>{tooltipText}</TooltipContent>
      )}
    </Tooltip>
  );
};

export default TooltipBtn;
