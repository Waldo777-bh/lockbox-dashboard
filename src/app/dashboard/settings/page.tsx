"use client";

import { useUser } from "@clerk/nextjs";
import {
  User,
  Terminal,
  KeyRound,
  AlertTriangle,
  ExternalLink,
  Chrome,
} from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteAccountDialog } from "@/components/settings/delete-account-dialog";
import { CliSetup } from "@/components/settings/cli-setup";
import { BrowserExtension } from "@/components/settings/browser-extension";
import { PageTransition } from "@/components/layout/page-transition";

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const email =
    user?.emailAddresses[0]?.emailAddress ?? "unknown@example.com";

  return (
    <PageTransition>
      <div className="max-w-2xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-brand-text">Settings</h2>
          <p className="mt-1 text-brand-text-secondary">
            Manage your account and preferences
          </p>
        </div>

        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile" className="gap-1.5">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="cli" className="gap-1.5">
              <Terminal className="h-4 w-4" />
              CLI Setup
            </TabsTrigger>
            <TabsTrigger value="extension" className="gap-1.5">
              <Chrome className="h-4 w-4" />
              Extension
            </TabsTrigger>
            <TabsTrigger value="tokens" className="gap-1.5">
              <KeyRound className="h-4 w-4" />
              API Tokens
            </TabsTrigger>
            <TabsTrigger value="danger" className="gap-1.5">
              <AlertTriangle className="h-4 w-4" />
              Danger Zone
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>
                  Your account information managed through Clerk
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isLoaded ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-brand-text-secondary">
                          Name
                        </p>
                        <p className="mt-1 text-brand-text">
                          {user?.firstName} {user?.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-brand-text-secondary">
                          Email
                        </p>
                        <p className="mt-1 text-brand-text">{email}</p>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href="https://accounts.clerk.dev/user"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Manage Profile on Clerk
                        </a>
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* CLI Setup Tab */}
          <TabsContent value="cli">
            <Card>
              <CardHeader>
                <CardTitle>CLI Setup</CardTitle>
                <CardDescription>
                  Get started with the Lockbox CLI and MCP integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CliSetup />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Browser Extension Tab */}
          <TabsContent value="extension">
            <Card>
              <CardHeader>
                <CardTitle>Browser Extension</CardTitle>
                <CardDescription>
                  Install the Lockbox Chrome extension for quick access to your keys
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BrowserExtension />
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Tokens Tab */}
          <TabsContent value="tokens">
            <Card>
              <CardHeader>
                <CardTitle>API Tokens</CardTitle>
                <CardDescription>
                  Manage API keys for CLI and programmatic access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-brand-text-secondary">
                  API tokens are used to authenticate the Lockbox CLI and any
                  third-party integrations with your account.
                </p>
                <Button asChild>
                  <Link href="/dashboard/api-keys">
                    <KeyRound className="mr-2 h-4 w-4" />
                    Manage API Keys
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Danger Zone Tab */}
          <TabsContent value="danger">
            <Card className="border-brand-danger/30">
              <CardHeader>
                <CardTitle className="text-brand-danger">
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Irreversible actions that affect your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-brand-danger/30 bg-brand-danger/5 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-brand-text">
                        Delete Account
                      </p>
                      <p className="text-sm text-brand-text-muted">
                        Permanently delete your account and all associated data
                      </p>
                    </div>
                    <DeleteAccountDialog email={email} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
}
