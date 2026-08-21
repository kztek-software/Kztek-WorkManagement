"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DropdownContextType {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DropdownContext = React.createContext<DropdownContextType | null>(null);

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div ref={containerRef} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

export function DropdownMenuTrigger({
  children,
  asChild,
  className,
  ...props
}: React.HTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const context = React.useContext(DropdownContext);
  if (!context) return null;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    context.setOpen((prev) => !prev);
    if (props.onClick) props.onClick(e);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (props.onPointerDown) props.onPointerDown(e);
  };

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{
      onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
      onPointerDown?: (e: React.PointerEvent<HTMLButtonElement>) => void;
      className?: string;
    }>;
    return React.cloneElement(child, {
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
        handleClick(e);
        if (child.props.onClick) child.props.onClick(e);
      },
      onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
        handlePointerDown(e);
        if (child.props.onPointerDown) child.props.onPointerDown(e);
      },
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      className={cn("cursor-pointer", className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function DropdownMenuPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function DropdownMenuContent({
  className,
  align = "end",
  side = "bottom",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { align?: "start" | "end" | "center"; side?: "top" | "bottom"; sideOffset?: number }) {
  const context = React.useContext(DropdownContext);
  if (!context || !context.open) return null;

  return (
    <div
      className={cn(
        "absolute z-50 min-w-[180px] overflow-hidden rounded-xl border border-line-strong bg-surface-2 p-1.5 shadow-2xl animate-fade-in-up",
        side === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5",
        align === "end" ? "right-0" : align === "start" ? "left-0" : "left-1/2 -translate-x-1/2",
        className
      )}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({
  className,
  destructive,
  onClick,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { destructive?: boolean }) {
  const context = React.useContext(DropdownContext);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClick) onClick(e);
    if (context) context.setOpen(false);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (props.onPointerDown) props.onPointerDown(e);
  };

  return (
    <div
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      className={cn(
        "flex cursor-pointer select-none items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold outline-none transition-colors",
        destructive
          ? "text-accent hover:bg-accent/10 focus:bg-accent/10"
          : "text-foreground hover:bg-surface-3 focus:bg-surface-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function DropdownMenuSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("my-1 h-px bg-line", className)} {...props} />;
}
