"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CardPreview } from "@/components/devcard/card-preview";
import { ShareButtonWrapper } from "@/components/sharing/share-button-wrapper";
import { Copy, CheckCircle2, ExternalLink, RefreshCw, Users, Edit } from "lucide-react";
import { toast } from "sonner";
import useSWR from "swr";

interface DevCardData {
  id: string;
  user_id: string;
  url_slug: string;
  is_public: boolean;
  display_name: string | null;
  custom_bio: string | null;
  location: string | null;
  avatar_url: string;
  github_username: string;
  github_stats: {
    public_repos: number;
    followers: number;
    following: number;
    total_stars: number;
    contribution_streak: number;
  } | null;
  social_links: {
    twitter?: string;
    linkedin?: string;
    website?: string;
    portfolio?: string;
  } | null;
  featured_repos: string[] | null;
  tech_stack: string[] | null;
  availability_status: 'open' | 'available' | 'not-available' | 'custom' | null;
  availability_message: string | null;
  theme: {
    name: string;
    colors?: {
      primary?: string;
      background?: string;
      text?: string;
    };
    font?: string;
  } | null;
  view_count: number;
  created_at: string;
  updated_at: string;
}

interface GitHubRepo {
  full_name: string;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to fetch DevCard');
  }
  return res.json();
};

export default function DashboardPage() {
  const [copied, setCopied] = React.useState(false);
  const { data: devcard, error, isLoading, mutate } = useSWR<DevCardData>('/api/cards/me', fetcher);
  const { data: reposData } = useSWR<{ repositories: GitHubRepo[] }>(
    '/api/github/repos?sort=stars&limit=50',
    fetcher
  );

  const shareableUrl = React.useMemo(() => {
    if (!devcard) return '';
    // Use window.location.origin for client-side URL
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/${devcard.url_slug}`;
  }, [devcard]);

  // Get actual repo objects for featured repos
  const featuredRepoObjects = React.useMemo(() => {
    if (!reposData?.repositories || !devcard?.featured_repos?.length) return [];
    return reposData.repositories
      .filter((repo) => devcard.featured_repos!.includes(repo.full_name))
      .sort((a, b) => {
        const aIndex = devcard.featured_repos!.indexOf(a.full_name);
        const bIndex = devcard.featured_repos!.indexOf(b.full_name);
        return aIndex - bIndex;
      });
  }, [reposData, devcard?.featured_repos]);

  const handleCopyUrl = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  }, [shareableUrl]);

  const handleRefresh = React.useCallback(async () => {
    toast.promise(
      mutate(),
      {
        loading: 'Refreshing DevCard...',
        success: 'DevCard refreshed!',
        error: 'Failed to refresh DevCard',
      }
    );
  }, [mutate]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-64 bg-devcard-base/30" />
          <Skeleton className="h-5 w-96 bg-devcard-base/30" />
        </div>
        <Card className="bg-devcard-base/30 border-devcard-border">
          <CardHeader>
            <Skeleton className="h-6 w-48 bg-devcard-base/30" />
            <Skeleton className="h-4 w-full bg-devcard-base/30" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-12 w-full bg-devcard-base/30" />
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Skeleton className="h-96 w-full bg-devcard-base/30" />
        </div>
      </div>
    );
  }

  if (error || !devcard) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-devcard-heading">Dashboard</h1>
          <p className="text-devcard-text">
            Manage your DevCard and view your shareable profile
          </p>
        </div>

        <Alert variant="destructive">
          <AlertDescription>
            {error?.message || 'Failed to load your DevCard. Please try again later.'}
          </AlertDescription>
        </Alert>

        <Card className="bg-devcard-base/30 border-devcard-border">
          <CardHeader>
            <CardTitle className="text-devcard-heading">No DevCard Found</CardTitle>
            <CardDescription className="text-devcard-text">
              It looks like you haven't created a DevCard yet. Your DevCard should have been automatically created when you signed in with GitHub.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleRefresh} variant="outline" className="border-devcard-border hover:bg-devcard-border/50 text-devcard-heading">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-devcard-heading">Your DevCard Dashboard</h1>
        <p className="text-devcard-text">
          Your developer profile is live! Share it with the world.
        </p>
      </div>

      {/* Shareable URL Card */}
      <Card className="border-devcard-green/20 bg-gradient-to-br from-devcard-base/50 to-devcard-green/5 shadow-lg shadow-devcard-green/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-devcard-heading">
            <CheckCircle2 className="h-5 w-5 text-devcard-green" />
            Your DevCard is Live!
          </CardTitle>
          <CardDescription className="text-devcard-text">
            Share this URL to showcase your developer profile and projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-lg bg-devcard-base/30 border border-devcard-border">
              <code className="text-sm font-mono flex-1 truncate text-devcard-heading">
                {shareableUrl}
              </code>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCopyUrl}
                variant={copied ? "secondary" : "default"}
                className="min-w-[100px] bg-devcard-green hover:bg-devcard-green/90 text-black font-medium"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
              <ShareButtonWrapper
                username={devcard.url_slug}
                displayName={devcard.display_name || devcard.github_username}
                customBio={devcard.custom_bio || undefined}
                avatarUrl={devcard.avatar_url}
                variant="outline"
                size="icon"
                className="border-devcard-green/30 hover:bg-devcard-green/10"
                showLabel={false}
              />
              <Button
                asChild
                variant="outline"
                className="border-devcard-green/30 hover:bg-devcard-green/10"
              >
                <a href={shareableUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-devcard-base/30 border-devcard-border">
          <CardHeader className="pb-2">
            <CardDescription className="text-devcard-text">Views</CardDescription>
            <CardTitle className="text-3xl text-devcard-heading">{devcard.view_count.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-devcard-base/30 border-devcard-border">
          <CardHeader className="pb-2">
            <CardDescription className="text-devcard-text">Status</CardDescription>
            <CardTitle className="text-3xl capitalize">
              {devcard.is_public ? (
                <span className="text-devcard-green">Public</span>
              ) : (
                <span className="text-devcard-text">Private</span>
              )}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-devcard-base/30 border-devcard-border">
          <CardHeader className="pb-2">
            <CardDescription className="text-devcard-text">Username</CardDescription>
            <CardTitle className="text-2xl truncate text-devcard-heading">@{devcard.github_username}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-devcard-green/20 bg-gradient-to-br from-devcard-base/50 to-devcard-green/5">
          <CardHeader className="pb-2">
            <CardDescription className="text-devcard-text">Network</CardDescription>
            <CardTitle className="text-lg text-devcard-heading">Connect with developers</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full border-devcard-green/30 hover:bg-devcard-green/10 hover:border-devcard-green/50 text-devcard-heading"
            >
              <Link href="/app/network">
                <Users className="mr-2 h-4 w-4" />
                My Network
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* DevCard Preview Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-devcard-heading">Preview</h2>
            <p className="text-sm text-devcard-text">
              This is how your DevCard appears to visitors
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild className="bg-devcard-green hover:bg-devcard-green/90 text-black font-medium">
              <Link href="/app/card/edit">
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Link>
            </Button>
            <Button onClick={handleRefresh} variant="outline" size="sm" className="border-devcard-border hover:bg-devcard-border/50 text-devcard-heading">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Card Preview */}
        <div className="rounded-lg border border-devcard-border bg-gradient-to-br from-devcard-base/30 to-devcard-base/10 p-6">
          <CardPreview
            displayName={devcard.display_name}
            githubUsername={devcard.github_username}
            avatarUrl={devcard.avatar_url}
            customBio={devcard.custom_bio}
            location={devcard.location}
            availabilityStatus={devcard.availability_status}
            availabilityMessage={devcard.availability_message}
            socialLinks={devcard.social_links}
            githubStats={devcard.github_stats}
            techStack={devcard.tech_stack}
            featuredRepos={featuredRepoObjects}
            viewCount={devcard.view_count}
            theme={devcard.theme}
          />
        </div>
      </div>

      {/* Additional Actions */}
      <Card className="border-dashed border-devcard-border bg-devcard-base/20">
        <CardHeader>
          <CardTitle className="text-sm text-devcard-heading">Next Steps</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-devcard-text space-y-2">
          <ul className="list-disc list-inside space-y-1">
            <li>Customize your DevCard profile and featured repositories</li>
            <li>Share your unique URL on social media and portfolios</li>
            <li>Track views and engagement on your profile</li>
            <li>Keep your GitHub profile updated to sync latest stats</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
