import * as React from "react";
import { InputTextarea, type InputTextareaProps } from "primereact/inputtextarea";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  autoResize?: boolean;
} & Partial<Omit<InputTextareaProps, keyof React.TextareaHTMLAttributes<HTMLTextAreaElement>>>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, autoResize = true, ...props }, ref) => {
    return (
      <InputTextarea
        autoResize={autoResize}
        className={cn(
          "flex min-h-[60px] w-full text-sm placeholder:text-muted focus-visible:outline-none focus:border-accent disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref as any}
        {...(props as any)}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
