"use client";

import * as React from "react";
import { Tooltip as PrimeTooltip } from "primereact/tooltip";
import { cn } from "@/lib/utils";

/**
 * Convenient wrapper for PrimeReact tooltip
 */
export function Tooltip({
  content,
  children,
  side = "top",
  className,
}: {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  delayDuration?: number;
  className?: string;
}) {
  const id = React.useId().replace(/:/g, "");
  const targetClass = `p-tip-${id}`;

  if (!content) return <>{children}</>;

  return (
    <>
      <PrimeTooltip
        target={`.${targetClass}`}
        position={side}
        className={cn("text-xs font-semibold z-50", className)}
        showDelay={100}
      />
      {React.isValidElement(children) ? (
        React.cloneElement(children as React.ReactElement<{ className?: string; "data-pr-tooltip"?: string }>, {
          className: cn(targetClass, (children.props as any).className),
          "data-pr-tooltip": typeof content === "string" ? content : undefined,
        })
      ) : (
        <span className={targetClass} data-pr-tooltip={typeof content === "string" ? content : undefined}>
          {children}
        </span>
      )}
    </>
  );
}

const TooltipProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const TooltipRoot = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const TooltipTrigger = ({ children }: { children: React.ReactNode; asChild?: boolean }) => <>{children}</>;
const TooltipContent = ({ children, className }: { children: React.ReactNode; className?: string; side?: string; align?: string }) => (
  <span className={cn("p-tooltip-text text-xs", className)}>{children}</span>
);

export { TooltipRoot, TooltipTrigger, TooltipContent, TooltipProvider, PrimeTooltip };

