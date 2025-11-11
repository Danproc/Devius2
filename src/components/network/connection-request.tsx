"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Ban, ExternalLink, Clock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ConnectionRequestProps {
  requesterId: string;
  requesterName: string | null;
  requesterGithubUsername: string | null;
  requesterImage: string | null;
  requesterUrlSlug?: string | null;
  message?: string | null;
  requestedAt: string;
  direction: "received" | "sent";
  onAccept?: (requesterId: string) => void;
  onDecline?: (requesterId: string) => void;
  onBlock?: (requesterId: string) => void;
}

export function ConnectionRequest({
  requesterId,
  requesterName,
  requesterGithubUsername,
  requesterImage,
  requesterUrlSlug,
  message,
  requestedAt,
  direction,
  onAccept,
  onDecline,
  onBlock,
}: ConnectionRequestProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const displayName = requesterName || requesterGithubUsername || "DevCard User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const githubUrl = requesterGithubUsername
    ? `https://github.com/${requesterGithubUsername}`
    : null;

  const cardUrl = requesterUrlSlug ? `/${requesterUrlSlug}` : null;

  const formattedDate = new Date(requestedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const handleAccept = async () => {
    if (!onAccept || isProcessing) return;
    setIsProcessing(true);
    try {
      await onAccept(requesterId);
      toast.success("Connection request accepted!");
    } catch (error) {
      toast.error("Failed to accept connection request");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!onDecline || isProcessing) return;
    setIsProcessing(true);
    try {
      await onDecline(requesterId);
      toast.success("Connection request declined");
    } catch (error) {
      toast.error("Failed to decline connection request");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBlock = async () => {
    if (!onBlock || isProcessing) return;
    setIsProcessing(true);
    try {
      await onBlock(requesterId);
      toast.success("User blocked");
    } catch (error) {
      toast.error("Failed to block user");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="border-border/50 hover:border-devcard-green/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Avatar and Info */}
          <div className="flex gap-3 flex-1">
            <Avatar className="h-12 w-12 border-2 border-border shrink-0">
              <AvatarImage src={requesterImage || undefined} alt={displayName} />
              <AvatarFallback className="bg-devcard-green/10 text-devcard-green font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 flex-wrap">
                <h3 className="font-semibold text-sm">{displayName}</h3>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    direction === "received"
                      ? "border-devcard-green/30 text-devcard-green"
                      : "border-muted-foreground/30 text-muted-foreground"
                  )}
                >
                  {direction === "received" ? "Received" : "Sent"}
                </Badge>
              </div>

              {requesterGithubUsername && (
                <p className="text-xs text-muted-foreground mt-1">
                  @{requesterGithubUsername}
                </p>
              )}

              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Clock className="h-3 w-3" />
                <span>{formattedDate}</span>
              </div>

              {message && (
                <div className="mt-2 text-sm text-foreground bg-muted/50 rounded-md p-2 border border-border/50">
                  <p className="italic">"{message}"</p>
                </div>
              )}

              {/* Links */}
              <div className="flex gap-2 mt-3">
                {cardUrl && (
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs border-devcard-green/30 hover:bg-devcard-green/10"
                  >
                    <a href={cardUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-1 h-3 w-3" />
                      View Card
                    </a>
                  </Button>
                )}
                {githubUrl && (
                  <Button
                    asChild
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs hover:bg-muted"
                  >
                    <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                      GitHub
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons - Only show for received requests */}
          {direction === "received" && (onAccept || onDecline || onBlock) && (
            <div className="flex sm:flex-col gap-2 sm:justify-start">
              {onAccept && (
                <Button
                  size="sm"
                  onClick={handleAccept}
                  disabled={isProcessing}
                  className="flex-1 sm:flex-none bg-devcard-green hover:bg-devcard-green/90 text-black font-medium"
                >
                  <Check className="mr-1.5 h-4 w-4" />
                  Accept
                </Button>
              )}
              {onDecline && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDecline}
                  disabled={isProcessing}
                  className="flex-1 sm:flex-none border-border/50 hover:bg-muted"
                >
                  <X className="mr-1.5 h-4 w-4" />
                  Decline
                </Button>
              )}
              {onBlock && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleBlock}
                  disabled={isProcessing}
                  className="flex-1 sm:flex-none text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Ban className="mr-1.5 h-4 w-4" />
                  Block
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
