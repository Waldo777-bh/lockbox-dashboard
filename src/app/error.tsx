"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-bg px-4">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-danger/10">
        <AlertTriangle className="h-8 w-8 text-brand-danger" />
      </div>
      <h1 className="mb-2 text-2xl font-bold text-brand-text">
        Something went wrong
      </h1>
      <p className="mb-8 text-center text-brand-text-secondary">
        An unexpected error occurred. Please try again.
      </p>
      <Button onClick={reset}>Try Again</Button>
    </div>
  );
}
