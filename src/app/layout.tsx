import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/layout/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Lockbox Dashboard",
    template: "%s | Lockbox",
  },
  description: "Securely manage your encrypted API keys and secrets",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Lockbox Dashboard",
    description: "Securely manage your encrypted API keys and secrets",
    type: "website",
    siteName: "Lockbox",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      signUpUrl="/sign-up"
      signInUrl="/sign-in"
      afterSignOutUrl="/sign-in"
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#00d87a",
          colorBackground: "#1a1a24",
          colorInputBackground: "#0f0f14",
          colorInputText: "#e8eaf0",
        },
      }}
    >
      {/* N5: default to dark; ThemeProvider swaps class dynamically on mount */}
      <html lang="en" className="dark" suppressHydrationWarning>
        <body>
          <ThemeProvider>
            {children}
          </ThemeProvider>
          <Toaster
            position="bottom-right"
            duration={4000}
            closeButton
            toastOptions={{
              style: {
                background: "rgb(var(--brand-card))",
                border: "1px solid rgb(var(--brand-border))",
                color: "rgb(var(--brand-text))",
              },
              className: "lockbox-toast",
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
