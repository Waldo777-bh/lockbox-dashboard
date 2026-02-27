"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Shield, Terminal, Zap, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface OnboardingWizardProps {
  onComplete: () => void;
}

const TOTAL_STEPS = 4;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
};

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [vaultId, setVaultId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Step 1 form state
  const [vaultName, setVaultName] = useState("");

  // Step 2 form state
  const [service, setService] = useState("");
  const [keyName, setKeyName] = useState("");
  const [keyValue, setKeyValue] = useState("");

  function goToStep(next: number) {
    setDirection(next > step ? 1 : -1);
    setStep(next);
    updateOnboarding(next);
  }

  async function updateOnboarding(stepNum: number, completed?: boolean) {
    try {
      await fetch("/api/onboarding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: stepNum,
          ...(completed !== undefined && { completed }),
        }),
      });
    } catch {
      // Silently fail - onboarding state is non-critical
    }
  }

  async function handleSkip() {
    await updateOnboarding(step, true);
    onComplete();
    router.refresh();
  }

  async function handleCreateVault(e: React.FormEvent) {
    e.preventDefault();
    if (!vaultName.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/vaults", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: vaultName.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create vault");
      }

      const vault = await res.json();
      setVaultId(vault.id);
      toast.success("Vault created!");
      goToStep(2);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create vault"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleAddKey(e: React.FormEvent) {
    e.preventDefault();
    if (!vaultId || !service.trim() || !keyName.trim() || !keyValue.trim())
      return;

    setLoading(true);
    try {
      const res = await fetch(`/api/vaults/${vaultId}/keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: service.trim(),
          keyName: keyName.trim(),
          value: keyValue.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add key");
      }

      toast.success("Key added!");
      goToStep(3);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add key"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleFinish() {
    await updateOnboarding(3, true);
    onComplete();
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-bg/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative w-full max-w-lg rounded-xl border border-brand-border bg-brand-card p-8 shadow-2xl"
      >
        {/* Progress Dots */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-2 w-2 rounded-full transition-all duration-300",
                i <= step
                  ? "bg-brand-accent"
                  : "bg-brand-border"
              )}
            />
          ))}
        </div>

        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="absolute right-4 top-4 text-sm text-brand-text-muted hover:text-brand-text-secondary transition-colors"
        >
          Skip
        </button>

        {/* Steps */}
        <AnimatePresence mode="wait" custom={direction}>
          {step === 0 && (
            <motion.div
              key="step-0"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="flex flex-col items-center text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.1,
                }}
                className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-accent"
              >
                <Lock className="h-8 w-8 text-brand-bg" />
              </motion.div>

              <h2 className="text-2xl font-bold text-brand-text">
                Welcome to Lockbox
              </h2>
              <p className="mt-2 text-brand-text-secondary">
                Your secure vault for API keys and secrets. Let&apos;s get you
                set up in under a minute.
              </p>

              <div className="mt-8 w-full space-y-3">
                {[
                  {
                    icon: Shield,
                    label: "Encrypted storage",
                    desc: "AES-256-GCM encryption for all your secrets",
                  },
                  {
                    icon: Terminal,
                    label: "CLI access",
                    desc: "Manage secrets from your terminal",
                  },
                  {
                    icon: Zap,
                    label: "Lightning fast",
                    desc: "Instant access to your keys when you need them",
                  },
                ].map((feature) => (
                  <div
                    key={feature.label}
                    className="flex items-center gap-3 rounded-lg border border-brand-border bg-brand-bg-secondary p-3 text-left"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-accent/10">
                      <feature.icon className="h-4 w-4 text-brand-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-brand-text">
                        {feature.label}
                      </p>
                      <p className="text-xs text-brand-text-muted">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Button className="mt-8 w-full" onClick={() => goToStep(1)}>
                Get Started
              </Button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step-1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <h2 className="text-xl font-bold text-brand-text">
                Create your first vault
              </h2>
              <p className="mt-1 text-sm text-brand-text-secondary">
                Vaults help you organize secrets by project or environment.
              </p>

              <form onSubmit={handleCreateVault} className="mt-6 space-y-4">
                <div>
                  <Label htmlFor="onboard-vault-name">Vault Name</Label>
                  <Input
                    id="onboard-vault-name"
                    placeholder="e.g. Production, Staging, Personal"
                    value={vaultName}
                    onChange={(e) => setVaultName(e.target.value)}
                    className="mt-2"
                    autoFocus
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || !vaultName.trim()}
                >
                  {loading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Vault
                </Button>
              </form>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <h2 className="text-xl font-bold text-brand-text">
                Add your first key
              </h2>
              <p className="mt-1 text-sm text-brand-text-secondary">
                Store an API key or secret securely in your new vault.
              </p>

              <form onSubmit={handleAddKey} className="mt-6 space-y-4">
                <div>
                  <Label htmlFor="onboard-service">Service</Label>
                  <Input
                    id="onboard-service"
                    placeholder="e.g. openai, stripe, github"
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="mt-2"
                    autoFocus
                  />
                </div>
                <div>
                  <Label htmlFor="onboard-key-name">Key Name</Label>
                  <Input
                    id="onboard-key-name"
                    placeholder="e.g. API_KEY, SECRET_KEY"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="onboard-key-value">Value</Label>
                  <Input
                    id="onboard-key-value"
                    type="password"
                    placeholder="Your secret value"
                    value={keyValue}
                    onChange={(e) => setKeyValue(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    loading ||
                    !service.trim() ||
                    !keyName.trim() ||
                    !keyValue.trim()
                  }
                >
                  {loading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add Key
                </Button>
              </form>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="flex flex-col items-center text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.1,
                }}
                className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-accent/10"
              >
                <CheckCircle2 className="h-8 w-8 text-brand-accent" />
              </motion.div>

              <h2 className="text-2xl font-bold text-brand-text">
                You&apos;re all set!
              </h2>
              <p className="mt-2 text-brand-text-secondary">
                Your vault is created and your first secret is safely encrypted.
                You can now manage everything from your dashboard.
              </p>

              <Button className="mt-8 w-full" onClick={handleFinish}>
                Go to Dashboard
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
