"use client";

import { cn } from "@/lib/utils";

interface SecurityScoreProps {
  score: number;
}

function getScoreColor(score: number) {
  if (score < 40) return { stroke: "#e8485c", text: "text-brand-danger" };
  if (score <= 70) return { stroke: "#f0a744", text: "text-brand-warning" };
  return { stroke: "#22d68a", text: "text-brand-accent" };
}

export function SecurityScore({ score }: SecurityScoreProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const { stroke, text } = getScoreColor(clampedScore);

  // SVG circle parameters
  const size = 96;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (clampedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-brand-border"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{
              transition: "stroke-dashoffset 0.6s ease-out",
            }}
          />
        </svg>
        {/* Score number in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("text-2xl font-bold", text)}>
            {clampedScore}
          </span>
        </div>
      </div>
      <span className="text-sm font-medium text-brand-text-secondary">
        Security Score
      </span>
    </div>
  );
}
