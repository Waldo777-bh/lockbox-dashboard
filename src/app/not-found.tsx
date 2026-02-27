import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-bg px-4">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-accent/10">
        <Lock className="h-8 w-8 text-brand-accent" />
      </div>
      <h1 className="mb-2 text-4xl font-bold text-brand-text">404</h1>
      <p className="mb-8 text-brand-text-secondary">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Button asChild>
        <Link href="/dashboard">Back to Dashboard</Link>
      </Button>
    </div>
  );
}
