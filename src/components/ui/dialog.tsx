"use client";

import * as React from "react";
import { Dialog as PrimeDialog, type DialogProps as PrimeDialogProps } from "primereact/dialog";
import { cn } from "@/lib/utils";

export interface CustomDialogProps extends PrimeDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const Dialog: React.FC<CustomDialogProps> = ({
  open,
  visible,
  onOpenChange,
  onHide,
  children,
  className,
  ...props
}) => {
  const isVisible = visible !== undefined ? visible : open !== undefined ? open : false;
  const handleHide = () => {
    if (onHide) onHide();
    if (onOpenChange) onOpenChange(false);
  };

  return (
    <PrimeDialog
      visible={isVisible}
      onHide={handleHide}
      className={cn("w-full max-w-2xl border border-line bg-surface rounded-2xl shadow-2xl overflow-hidden", className)}
      contentClassName="p-5"
      {...props}
    >
      {children}
    </PrimeDialog>
  );
};

const DialogTrigger = ({ children }: { children: React.ReactNode; asChild?: boolean }) => <>{children}</>;
const DialogPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const DialogOverlay = ({ children }: { children?: React.ReactNode }) => null;
const DialogClose = ({ children }: { children: React.ReactNode }) => <>{children}</>;

const DialogContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("space-y-4", className)}>{children}</div>
);

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1 text-left pb-2 border-b border-line", className)} {...props} />
);

const DialogTitle = ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2 className={cn("text-base font-bold text-foreground", className)} {...props}>
    {children}
  </h2>
);

const DialogDescription = ({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-xs text-muted font-normal mt-0.5", className)} {...props}>
    {children}
  </p>
);

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  PrimeDialog,
};
