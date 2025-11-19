import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Info } from 'lucide-react';

export default async function AdminSettingsPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/sign-in');
  }

  // Check if user is admin
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim());
  if (!adminEmails.includes(session.user.email)) {
    redirect('/app/dashboard');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-devcard-heading">Platform Settings</h1>
        <p className="text-devcard-text mt-2">
          Configure StackPass platform settings
        </p>
      </div>

      <Alert className="border-devcard-border bg-devcard-base">
        <Info className="h-4 w-4 text-devcard-green" />
        <AlertDescription className="text-devcard-text">
          Platform settings and configuration options coming soon. For now, manage hackathons, plans, and users through their respective sections.
        </AlertDescription>
      </Alert>

      <Card className="border-devcard-border bg-devcard-base">
        <CardHeader>
          <CardTitle className="text-devcard-heading flex items-center gap-2">
            <Settings className="h-5 w-5 text-devcard-green" />
            Environment Configuration
          </CardTitle>
          <CardDescription className="text-devcard-text">
            Current platform configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div className="flex justify-between items-center p-3 rounded-lg bg-devcard-base/50 border border-devcard-border">
              <span className="text-sm text-devcard-text">Admin Emails</span>
              <span className="text-sm text-devcard-heading font-mono">{adminEmails.join(', ')}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-devcard-base/50 border border-devcard-border">
              <span className="text-sm text-devcard-text">Environment</span>
              <span className="text-sm text-devcard-heading font-mono">
                {process.env.NODE_ENV}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-devcard-base/50 border border-devcard-border">
              <span className="text-sm text-devcard-text">App URL</span>
              <span className="text-sm text-devcard-heading font-mono">
                {process.env.NEXT_PUBLIC_APP_URL || 'localhost:3000'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
