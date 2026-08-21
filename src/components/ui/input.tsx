import * as React from "react";
import { InputText, type InputTextProps } from "primereact/inputtext";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> &
  Partial<Omit<InputTextProps, keyof React.InputHTMLAttributes<HTMLInputElement>>>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <InputText
        className={cn(
          "w-full text-sm placeholder:text-muted transition-colors focus-visible:outline-none focus:border-accent disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref as any}
        {...(props as any)}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
