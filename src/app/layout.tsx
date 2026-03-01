import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Toaster } from "sonner";
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
      <html lang="en" className="dark">
        <body>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#1a1a24",
                border: "1px solid #2a2a3a",
                color: "#e8eaf0",
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
