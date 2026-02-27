import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lockbox Dashboard",
  description: "Manage your encrypted API key vaults",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#22d68a",
          colorBackground: "#141820",
          colorInputBackground: "#0f1218",
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
                background: "#141820",
                border: "1px solid #1e2432",
                color: "#e8eaf0",
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
