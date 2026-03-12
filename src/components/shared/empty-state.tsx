import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  /** Optional SVG illustration slot rendered above the icon */
  illustration?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  illustration,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
      {/* Decorative illustration */}
      {illustration ? (
        <div className="mb-4">{illustration}</div>
      ) : (
        /* Animated ring pattern behind icon */
        <div className="relative mb-4">
          <div className="absolute inset-0 rounded-full bg-brand-accent/5 animate-ping" style={{ animationDuration: "3s" }} />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-brand-accent/10 border border-brand-accent/20">
            <Icon className="h-8 w-8 text-brand-accent" />
          </div>
        </div>
      )}
      <h3 className="text-lg font-semibold text-brand-text">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-brand-text-secondary">
        {description}
      </p>
      {action && (
        action.href ? (
          <Button asChild className="mt-6">
            <Link href={action.href}>{action.label}</Link>
          </Button>
        ) : action.onClick ? (
          <Button className="mt-6" onClick={action.onClick}>
            {action.label}
          </Button>
        ) : null
      )}
    </div>
  );
}
