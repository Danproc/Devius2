"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConnectionsList } from "@/components/network/connections-list";
import { Users, Inbox, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import useSWR from "swr";

interface Connection {
  id: string;
  name: string | null;
  github_username: string | null;
  avatar_url: string | null;
  url_slug: string | null;
  custom_bio: string | null;
}

interface ConnectionsResponse {
  connections: Connection[];
  total: number;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to fetch connections");
  }
  return res.json();
};

export default function NetworkPage() {
  const { data, error, isLoading, mutate } = useSWR<ConnectionsResponse>(
    "/api/connections",
    fetcher
  );

  const handleRefresh = React.useCallback(async () => {
    toast.promise(mutate(), {
      loading: "Refreshing connections...",
      success: "Connections refreshed!",
      error: "Failed to refresh connections",
    });
  }, [mutate]);

  const handleRemoveConnection = React.useCallback(
    async (userId: string) => {
      // TODO: Implement remove connection API call
      toast.info("Remove connection feature coming soon");
    },
    []
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">My Network</h1>
          <p className="text-muted-foreground">
            Connect with developers and grow your professional network
          </p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.message || "Failed to load your network. Please try again later."}
          </AlertDescription>
        </Alert>

        <Card>
          <CardContent className="pt-6">
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const connections = data?.connections || [];
  const totalConnections = data?.total || 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-[#dde3ed]">My Network</h1>
        <p className="text-[#5b6a7f]">
          Connect with developers and grow your professional network
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-[#04080f] border-[#121824] shadow-lg shadow-[#1cf491]/5">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2 text-[#5b6a7f]">
              <Users className="h-4 w-4" />
              Total Connections
            </CardDescription>
            <CardTitle className="text-4xl text-[#1cf491]">
              {totalConnections.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#5b6a7f]">
              {totalConnections === 0
                ? "Start connecting with other developers"
                : totalConnections === 1
                ? "You have 1 connection"
                : `You're connected with ${totalConnections} developers`}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#04080f] border-[#121824]">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2 text-[#5b6a7f]">
              <Inbox className="h-4 w-4" />
              Connection Requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#5b6a7f] mb-3">
              View and manage your connection requests
            </p>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="bg-[#1cf491]/10 border-[#1cf491]/30 text-[#1cf491] hover:bg-[#1cf491]/20 hover:border-[#1cf491]/50"
            >
              <Link href="/app/network/requests">
                <Inbox className="mr-2 h-4 w-4" />
                View Requests
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Connections List */}
      <Card className="bg-[#04080f] border-[#121824]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#dde3ed]">All Connections</CardTitle>
              <CardDescription className="text-[#5b6a7f]">
                {connections.length > 0
                  ? "Your professional network on DevCard"
                  : "You don't have any connections yet"}
              </CardDescription>
            </div>
            <Button onClick={handleRefresh} variant="ghost" size="sm" className="text-[#5b6a7f] hover:text-[#1cf491]">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {connections.length > 0 ? (
            <ConnectionsList
              connections={connections}
              onRemove={handleRemoveConnection}
              showRemoveButton={false}
            />
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-[#5b6a7f]/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-[#dde3ed]">No connections yet</h3>
              <p className="text-sm text-[#5b6a7f] mb-6">
                Start connecting with other developers to build your network
              </p>
              <Button
                asChild
                variant="outline"
                className="bg-[#1cf491]/10 border-[#1cf491]/30 text-[#1cf491] hover:bg-[#1cf491]/20"
              >
                <Link href="/app/network/requests">
                  <Inbox className="mr-2 h-4 w-4" />
                  Check Connection Requests
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help Card */}
      {connections.length === 0 && (
        <Card className="bg-[#04080f] border-[#121824] border-dashed">
          <CardHeader>
            <CardTitle className="text-sm text-[#dde3ed]">How to Connect</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[#5b6a7f] space-y-2">
            <ul className="list-disc list-inside space-y-1">
              <li>Visit other developers' DevCards and send connection requests</li>
              <li>Accept incoming connection requests from your network</li>
              <li>Build meaningful professional relationships</li>
              <li>Share your DevCard to receive more connection requests</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
