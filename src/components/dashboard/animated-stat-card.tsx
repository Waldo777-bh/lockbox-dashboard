"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Lock, KeyRound, Activity, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const iconMap = {
  lock: Lock,
  keyRound: KeyRound,
  activity: Activity,
} as const;

type IconName = keyof typeof iconMap;

interface AnimatedStatCardProps {
  value: number;
  label: string;
  iconName: IconName;
  href: string;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
}

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function AnimatedStatCard({
  value,
  label,
  iconName,
  href,
  trend,
}: AnimatedStatCardProps) {
  const Icon = iconMap[iconName];
  const [displayValue, setDisplayValue] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (value === 0) {
      setDisplayValue(0);
      return;
    }

    const duration = 800;
    const startTime = performance.now();

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOut(progress);

      setDisplayValue(Math.round(easedProgress * value));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    }

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value]);

  return (
    <Link href={href}>
      <Card className="transition-all duration-200 hover:border-brand-border-bright hover:shadow-[0_0_20px_rgba(34,214,138,0.06)]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-brand-text-secondary">
            {label}
          </CardTitle>
          <Icon className="h-4 w-4 text-brand-text-muted" />
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold text-brand-text">
              {displayValue}
            </div>
            {trend && (
              <div
                className={cn(
                  "flex items-center gap-0.5 text-xs font-medium",
                  trend.direction === "up"
                    ? "text-brand-accent"
                    : "text-brand-danger"
                )}
              >
                {trend.direction === "up" ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {trend.value}%
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
