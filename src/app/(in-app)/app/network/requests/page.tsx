"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ConnectionRequest } from "@/components/network/connection-request";
import { ArrowLeft, Inbox, Send, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import useSWR from "swr";

interface ConnectionRequestData {
  requester_id: string;
  recipient_id: string;
  status: string;
  message: string | null;
  requested_at: string;
  responded_at: string | null;
  requester_name: string | null;
  requester_email: string | null;
  requester_image: string | null;
  recipient_name?: string | null;
  recipient_email?: string | null;
  recipient_image?: string | null;
  direction: "received" | "sent";
}

interface RequestsResponse {
  requests: ConnectionRequestData[];
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to fetch connection requests");
  }
  return res.json();
};

export default function ConnectionRequestsPage() {
  const { data, error, isLoading, mutate } = useSWR<RequestsResponse>(
    "/api/connections/requests?status=pending",
    fetcher
  );

  const handleRefresh = React.useCallback(async () => {
    toast.promise(mutate(), {
      loading: "Refreshing requests...",
      success: "Requests refreshed!",
      error: "Failed to refresh requests",
    });
  }, [mutate]);

  const handleAccept = React.useCallback(
    async (requesterId: string) => {
      try {
        const res = await fetch(`/api/connections/requests/${requesterId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "accept" }),
        });

        if (!res.ok) {
          throw new Error("Failed to accept request");
        }

        await mutate();
      } catch (error) {
        throw error;
      }
    },
    [mutate]
  );

  const handleDecline = React.useCallback(
    async (requesterId: string) => {
      try {
        const res = await fetch(`/api/connections/requests/${requesterId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "decline" }),
        });

        if (!res.ok) {
          throw new Error("Failed to decline request");
        }

        await mutate();
      } catch (error) {
        throw error;
      }
    },
    [mutate]
  );

  const handleBlock = React.useCallback(
    async (requesterId: string) => {
      try {
        const res = await fetch(`/api/connections/requests/${requesterId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "block" }),
        });

        if (!res.ok) {
          throw new Error("Failed to block user");
        }

        await mutate();
      } catch (error) {
        throw error;
      }
    },
    [mutate]
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="flex-1">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-5 w-96 mt-2" />
          </div>
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/app/network">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">Connection Requests</h1>
            <p className="text-muted-foreground">
              Manage incoming and outgoing connection requests
            </p>
          </div>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.message || "Failed to load connection requests. Please try again later."}
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

  const requests = data?.requests || [];
  const receivedRequests = requests.filter((r) => r.direction === "received");
  const sentRequests = requests.filter((r) => r.direction === "sent");

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/app/network">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Connection Requests</h1>
          <p className="text-muted-foreground">
            Manage incoming and outgoing connection requests
          </p>
        </div>
        <Button onClick={handleRefresh} variant="ghost" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs for Received and Sent */}
      <Tabs defaultValue="received" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="received" className="relative">
            <Inbox className="mr-2 h-4 w-4" />
            Received
            {receivedRequests.length > 0 && (
              <Badge
                variant="default"
                className="ml-2 bg-devcard-green text-black font-semibold"
              >
                {receivedRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent">
            <Send className="mr-2 h-4 w-4" />
            Sent
            {sentRequests.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {sentRequests.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Received Requests Tab */}
        <TabsContent value="received" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Inbox className="h-5 w-5" />
                Received Requests
              </CardTitle>
              <CardDescription>
                {receivedRequests.length === 0
                  ? "No pending connection requests"
                  : receivedRequests.length === 1
                  ? "1 pending connection request"
                  : `${receivedRequests.length} pending connection requests`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {receivedRequests.length > 0 ? (
                <div className="space-y-3">
                  {receivedRequests.map((request) => (
                    <ConnectionRequest
                      key={`${request.requester_id}-${request.requested_at}`}
                      requesterId={request.requester_id}
                      requesterName={request.requester_name}
                      requesterGithubUsername={
                        request.requester_email?.split("@")[0] || null
                      }
                      requesterImage={request.requester_image}
                      message={request.message}
                      requestedAt={request.requested_at}
                      direction={request.direction}
                      onAccept={handleAccept}
                      onDecline={handleDecline}
                      onBlock={handleBlock}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Inbox className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No pending connection requests
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    You'll see connection requests from other developers here
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    className="border-devcard-green/30 hover:bg-devcard-green/10"
                  >
                    <Link href="/app/network">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Network
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sent Requests Tab */}
        <TabsContent value="sent" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Sent Requests
              </CardTitle>
              <CardDescription>
                {sentRequests.length === 0
                  ? "No pending sent requests"
                  : sentRequests.length === 1
                  ? "1 pending sent request"
                  : `${sentRequests.length} pending sent requests`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sentRequests.length > 0 ? (
                <div className="space-y-3">
                  {sentRequests.map((request) => (
                    <ConnectionRequest
                      key={`${request.recipient_id}-${request.requested_at}`}
                      requesterId={request.recipient_id}
                      requesterName={request.recipient_name || null}
                      requesterGithubUsername={
                        request.recipient_email?.split("@")[0] || null
                      }
                      requesterImage={request.recipient_image || null}
                      message={request.message}
                      requestedAt={request.requested_at}
                      direction={request.direction}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Send className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No sent requests</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Visit other developers' DevCards to send connection requests
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    className="border-devcard-green/30 hover:bg-devcard-green/10"
                  >
                    <Link href="/app/network">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Network
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
