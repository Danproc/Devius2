import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger } from '@/components/ui/sidebar';
import { LayoutDashboard, Trophy, Users, Settings } from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-devcard-base">
        <Sidebar className="border-r border-devcard-border bg-devcard-base">
          <SidebarContent className="bg-devcard-base">
            <SidebarGroup>
              <SidebarGroupLabel className="text-devcard-heading">Admin Dashboard</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className="text-devcard-text hover:text-devcard-green hover:bg-devcard-border/30">
                      <a href="/admin">
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Dashboard</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className="text-devcard-text hover:text-devcard-green hover:bg-devcard-border/30">
                      <a href="/admin/hackathons">
                        <Trophy className="h-4 w-4" />
                        <span>Hackathons</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className="text-devcard-text hover:text-devcard-green hover:bg-devcard-border/30">
                      <a href="/super-admin/users">
                        <Users className="h-4 w-4" />
                        <span>Users</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className="text-devcard-text hover:text-devcard-green hover:bg-devcard-border/30">
                      <a href="/admin/settings">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 bg-devcard-base">
          <div className="border-b border-devcard-border bg-devcard-base p-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-devcard-heading" />
              <h1 className="text-xl font-bold text-devcard-heading">Admin Panel</h1>
            </div>
          </div>
          <div className="p-6 bg-devcard-base">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
