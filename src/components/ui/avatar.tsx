"use client";

import * as React from "react";
import { Avatar as PrimeAvatar, type AvatarProps as PrimeAvatarProps } from "primereact/avatar";
import { AvatarGroup as PrimeAvatarGroup } from "primereact/avatargroup";
import { cn } from "@/lib/utils";

export interface CustomAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  image?: string;
  label?: string;
  color?: string;
}

const Avatar = React.forwardRef<HTMLDivElement, CustomAvatarProps>(
  ({ className, image, label, color, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("relative flex h-7 w-7 shrink-0 overflow-hidden rounded-full", className)}
        {...props}
      >
        {image ? (
          <PrimeAvatar image={image} shape="circle" className="h-full w-full" />
        ) : label ? (
          <PrimeAvatar
            label={label}
            shape="circle"
            className="h-full w-full text-[11px] font-bold text-white"
            style={color ? { backgroundColor: color } : undefined}
          />
        ) : (
          children
        )}
      </div>
    );
  }
);
Avatar.displayName = "Avatar";

const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { color?: string }
>(({ className, color, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full text-[11px] font-semibold text-white",
      className
    )}
    style={color ? { backgroundColor: color } : undefined}
    {...props}
  >
    {children}
  </div>
));
AvatarFallback.displayName = "AvatarFallback";

export function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export { Avatar, AvatarFallback, PrimeAvatar, PrimeAvatarGroup };

