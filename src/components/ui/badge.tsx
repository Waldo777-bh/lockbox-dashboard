import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-brand-accent/10 text-brand-accent",
        secondary:
          "border-transparent bg-brand-card text-brand-text-secondary",
        destructive:
          "border-transparent bg-brand-danger/10 text-brand-danger",
        outline: "border-brand-border text-brand-text-secondary",
        warning:
          "border-transparent bg-brand-warning/10 text-brand-warning",
        blue: "border-transparent bg-brand-blue/10 text-brand-blue",
        purple:
          "border-transparent bg-brand-purple/10 text-brand-purple",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
