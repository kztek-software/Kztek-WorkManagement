"use client";

import * as React from "react";
import { Dropdown as PrimeDropdown, type DropdownProps as PrimeDropdownProps } from "primereact/dropdown";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectContextType {
  value: string;
  onValueChange?: (value: string) => void;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SelectContext = React.createContext<SelectContextType | null>(null);

export function Select({
  value,
  defaultValue = "",
  onValueChange,
  children,
}: {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const currentValue = value !== undefined ? value : internalValue;

  const handleValueChange = (val: string) => {
    setInternalValue(val);
    if (onValueChange) onValueChange(val);
    setOpen(false);
  };

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
    <SelectContext.Provider
      value={{
        value: currentValue,
        onValueChange: handleValueChange,
        open,
        setOpen,
      }}
    >
      <div ref={containerRef} className="relative inline-block w-full text-left">
        {children}
      </div>
    </SelectContext.Provider>
  );
}

export function SelectGroup({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const context = React.useContext(SelectContext);
  return <span>{context?.value || placeholder || ""}</span>;
}

export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(SelectContext);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    context?.setOpen((prev) => !prev);
    if (props.onClick) props.onClick(e);
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={handleClick}
      className={cn(
        "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-lg border border-line bg-surface px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-3.5 w-3.5 opacity-50 ml-1 shrink-0" />
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

export function SelectContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const context = React.useContext(SelectContext);
  if (!context?.open) return null;

  return (
    <div
      className={cn(
        "absolute left-0 top-full mt-1 z-50 max-h-60 w-full overflow-y-auto rounded-xl border border-line bg-surface-2 p-1 text-foreground shadow-2xl animate-fade-in-up",
        className
      )}
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      {children}
    </div>
  );
}

export function SelectItem({
  value,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  const context = React.useContext(SelectContext);
  const isSelected = context?.value === value;

  const handleClick = () => {
    context?.onValueChange?.(value);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center justify-between rounded-lg py-1.5 pl-2.5 pr-2 text-xs font-semibold outline-none transition-colors",
        isSelected ? "bg-accent/15 text-accent" : "text-foreground hover:bg-surface-3",
        className
      )}
      {...props}
    >
      <span>{children}</span>
      {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-accent ml-2" />}
    </div>
  );
}

export { PrimeDropdown };
export type { PrimeDropdownProps };
