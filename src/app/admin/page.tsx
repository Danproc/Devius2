import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Users, TrendingUp } from 'lucide-react';
import { db } from '@/db';
import { hackathons } from '@/db/schema/hackathons';
import { users } from '@/db/schema/user';
import { count } from 'drizzle-orm';

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/sign-in');
  }

  // Check if user is admin
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim());
  if (!adminEmails.includes(session.user.email)) {
    redirect('/app/dashboard');
  }

  // Fetch stats
  const [hackathonCount] = await db.select({ count: count() }).from(hackathons);
  const [userCount] = await db.select({ count: count() }).from(users);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-devcard-heading">Admin Dashboard</h1>
        <p className="text-devcard-text mt-2">
          Welcome to the StackPass admin panel
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-devcard-border bg-devcard-base">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-devcard-heading">
              Total Hackathons
            </CardTitle>
            <Trophy className="h-4 w-4 text-devcard-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-devcard-heading">{hackathonCount.count}</div>
            <p className="text-xs text-devcard-text">
              Active competitions
            </p>
          </CardContent>
        </Card>

        <Card className="border-devcard-border bg-devcard-base">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-devcard-heading">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-devcard-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-devcard-heading">{userCount.count}</div>
            <p className="text-xs text-devcard-text">
              Registered members
            </p>
          </CardContent>
        </Card>

        <Card className="border-devcard-border bg-devcard-base">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-devcard-heading">
              Platform Health
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-devcard-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-devcard-green">Online</div>
            <p className="text-xs text-devcard-text">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card className="border-devcard-border bg-devcard-base">
        <CardHeader>
          <CardTitle className="text-devcard-heading">Quick Actions</CardTitle>
          <CardDescription className="text-devcard-text">
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <a
            href="/admin/hackathons"
            className="block p-3 rounded-lg border border-devcard-border hover:bg-devcard-border/50 transition-colors"
          >
            <p className="font-medium text-devcard-heading">Manage Hackathons</p>
            <p className="text-sm text-devcard-text">Create, edit, and monitor competitions</p>
          </a>
          <a
            href="/super-admin/users"
            className="block p-3 rounded-lg border border-devcard-border hover:bg-devcard-border/50 transition-colors"
          >
            <p className="font-medium text-devcard-heading">Manage Users</p>
            <p className="text-sm text-devcard-text">View and manage user accounts</p>
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
