import { currentUser } from "@clerk/nextjs/server";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DeleteAccountDialog } from "@/components/settings/delete-account-dialog";

export default async function SettingsPage() {
  const user = await currentUser();
  const email =
    user?.emailAddresses[0]?.emailAddress ?? "unknown@example.com";

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-brand-text">Settings</h2>
        <p className="mt-1 text-brand-text-secondary">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Your account information managed through Clerk
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-brand-danger/30">
        <CardHeader>
          <CardTitle className="text-brand-danger">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions that affect your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Separator className="mb-4" />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-brand-text">Delete Account</p>
              <p className="text-sm text-brand-text-muted">
                Permanently delete your account and all associated data
              </p>
            </div>
            <DeleteAccountDialog email={email} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
