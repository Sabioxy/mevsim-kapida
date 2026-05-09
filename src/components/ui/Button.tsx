import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

  const sizes: Record<ButtonSize, string> = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-8 py-4 text-base",
  };

  const variants: Record<ButtonVariant, string> = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
    secondary:
      "bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200 shadow-sm",
    ghost: "bg-transparent text-emerald-700 hover:bg-emerald-50",
  };

  return (
    <button
      className={cn(base, sizes[size], variants[variant], className)}
      disabled={disabled}
      {...props}
    />
  );
}
