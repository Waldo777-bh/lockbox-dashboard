"use client";

import { useState } from "react";
import { OnboardingWizard } from "./onboarding-wizard";

interface OnboardingWrapperProps {
  showWizard: boolean;
}

export function OnboardingWrapper({ showWizard }: OnboardingWrapperProps) {
  const [visible, setVisible] = useState(showWizard);

  if (!visible) return null;

  return <OnboardingWizard onComplete={() => setVisible(false)} />;
}
