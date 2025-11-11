/**
 * Organization Profile Page
 * T119: Create src/app/(in-app)/app/organization/page.tsx for organization profile management (premium only)
 */

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { checkPremium } from '@/lib/premium/check-premium';
import { OrganizationUpgradePrompt } from '@/components/premium/upgrade-prompt';
import { db } from '@/db';
import { devcards } from '@/db/schema/devcard';
import { eq } from 'drizzle-orm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building2, Users, Globe, Calendar } from 'lucide-react';

export default async function OrganizationPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const userId = session.user.id;
  const premiumStatus = await checkPremium(userId);

  // Check if user has access to organization profiles
  if (!premiumStatus.features.organization_profiles) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Organization Profile</h1>
          <p className="text-muted-foreground">
            Manage your organization's DevCard presence
          </p>
        </div>
        <OrganizationUpgradePrompt />
      </div>
    );
  }

  // Get user's devcard with organization profile
  const [devcard] = await db
    .select()
    .from(devcards)
    .where(eq(devcards.user_id, userId))
    .limit(1);

  const organizationProfile = devcard?.organization_profile || {};

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
          <Building2 className="h-8 w-8" />
          Organization Profile
        </h1>
        <p className="text-muted-foreground">
          Showcase your organization and team on your DevCard
        </p>
      </div>

      <form action="/api/cards/me" method="POST" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organization Details
            </CardTitle>
            <CardDescription>
              Basic information about your organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization Name</Label>
              <Input
                id="org-name"
                name="organization_name"
                placeholder="Acme Inc."
                defaultValue={organizationProfile.name || ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="org-description">Description</Label>
              <Textarea
                id="org-description"
                name="organization_description"
                placeholder="Tell us about your organization..."
                rows={4}
                defaultValue={organizationProfile.description || ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="org-website" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Website
              </Label>
              <Input
                id="org-website"
                name="organization_website"
                type="url"
                placeholder="https://example.com"
                defaultValue={organizationProfile.website || ''}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="org-size" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Company Size
                </Label>
                <select
                  id="org-size"
                  name="organization_size"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  defaultValue={organizationProfile.company_size || ''}
                >
                  <option value="">Select size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501-1000">501-1000 employees</option>
                  <option value="1000+">1000+ employees</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="org-industry">Industry</Label>
                <Input
                  id="org-industry"
                  name="organization_industry"
                  placeholder="Technology, Finance, etc."
                  defaultValue={organizationProfile.industry || ''}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="org-founded" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Founded Year
              </Label>
              <Input
                id="org-founded"
                name="organization_founded"
                type="number"
                placeholder="2020"
                min="1900"
                max={new Date().getFullYear()}
                defaultValue={organizationProfile.founded_year || ''}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Members
            </CardTitle>
            <CardDescription>
              Add team members to showcase on your organization profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {organizationProfile.members && organizationProfile.members.length > 0 ? (
                <div className="space-y-3">
                  {organizationProfile.members.map((member: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {member.display_name || member.github_username}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          @{member.github_username} · {member.role}
                        </p>
                      </div>
                      <Button type="button" variant="ghost" size="sm">
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No team members added yet. Click "Add Member" to get started.
                </p>
              )}
              <Button type="button" variant="outline" className="w-full">
                <Users className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit">
            Save Organization Profile
          </Button>
        </div>
      </form>
    </div>
  );
}
