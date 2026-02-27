import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-bg">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-accent">
              <svg
                className="h-6 w-6 text-brand-bg"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <span className="font-mono text-xl font-bold text-brand-text">
              Lockbox
            </span>
          </div>
          <p className="text-sm text-brand-text-secondary">
            Sign in to manage your encrypted vaults
          </p>
        </div>
        <div className="flex justify-center">
          <SignIn afterSignInUrl="/dashboard" />
        </div>
      </div>
    </div>
  );
}
