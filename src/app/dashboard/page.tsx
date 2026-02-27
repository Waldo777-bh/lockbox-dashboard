import { Lock, KeyRound, Activity } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageTransition } from "@/components/layout/page-transition";
import { OnboardingWrapper } from "@/components/onboarding/onboarding-wrapper";
import { OnboardingChecklist } from "@/components/onboarding/onboarding-checklist";
import { AnimatedStatCard } from "@/components/dashboard/animated-stat-card";
import { RecentVaults } from "@/components/dashboard/recent-vaults";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { CliStatus } from "@/components/dashboard/cli-status";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  const [vaultCount, keyCount, apiKeyCount, recentLogs, recentVaults, latestApiKey] =
    await Promise.all([
      db.vault.count({ where: { userId: user.id } }),
      db.key.count({
        where: { vault: { userId: user.id } },
      }),
      db.apiKey.count({ where: { userId: user.id } }),
      db.auditLog.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      db.vault.findMany({
        where: { userId: user.id },
        include: {
          _count: {
            select: { keys: true },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 3,
      }),
      db.apiKey.findFirst({
        where: { userId: user.id },
        orderBy: { lastUsed: "desc" },
        select: { lastUsed: true },
      }),
    ]);

  const showWizard = !user.onboardingCompleted && vaultCount === 0;
  const showChecklist =
    !user.onboardingCompleted && vaultCount > 0;

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Onboarding Wizard (full-screen overlay) */}
        <OnboardingWrapper showWizard={showWizard} />

        {/* Welcome */}
        <div>
          <h2 className="text-2xl font-bold text-brand-text">Welcome back</h2>
          <p className="mt-1 text-brand-text-secondary">
            Here&apos;s an overview of your encrypted vaults
          </p>
        </div>

        {/* Onboarding Checklist */}
        {showChecklist && (
          <OnboardingChecklist
            vaultCount={vaultCount}
            keyCount={keyCount}
            apiKeyCount={apiKeyCount}
          />
        )}

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatedStatCard
            value={vaultCount}
            label="Total Vaults"
            icon={Lock}
            href="/dashboard/vaults"
          />
          <AnimatedStatCard
            value={keyCount}
            label="Total Keys"
            icon={KeyRound}
            href="/dashboard/vaults"
          />
          <AnimatedStatCard
            value={recentLogs.length}
            label="Recent Activity"
            icon={Activity}
            href="/dashboard/audit"
          />
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Two-column grid: Recent Vaults + Activity Timeline */}
        <div className="grid gap-8 lg:grid-cols-2">
          <RecentVaults vaults={recentVaults} />
          <ActivityTimeline logs={recentLogs} />
        </div>

        {/* CLI Status */}
        <CliStatus
          hasApiKeys={apiKeyCount > 0}
          lastCliUsed={latestApiKey?.lastUsed}
        />
      </div>
    </PageTransition>
  );
}
