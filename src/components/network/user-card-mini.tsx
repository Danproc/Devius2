"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ExternalLink, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserCardMiniProps {
  id: string;
  name: string | null;
  github_username: string | null;
  avatar_url: string | null;
  url_slug: string | null;
  custom_bio: string | null;
  onRemove?: (userId: string) => void;
  showRemoveButton?: boolean;
}

export function UserCardMini({
  id,
  name,
  github_username,
  avatar_url,
  url_slug,
  custom_bio,
  onRemove,
  showRemoveButton = false,
}: UserCardMiniProps) {
  const displayName = name || github_username || "DevCard User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const cardUrl = url_slug ? `/${url_slug}` : "#";
  const githubUrl = github_username ? `https://github.com/${github_username}` : null;

  const bioSnippet = custom_bio
    ? custom_bio.length > 80
      ? `${custom_bio.slice(0, 80)}...`
      : custom_bio
    : null;

  return (
    <Card className="group relative overflow-hidden border-border/50 bg-card hover:border-devcard-green/30 hover:shadow-md hover:shadow-devcard-green/5 transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          {/* Avatar and Name */}
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12 border-2 border-border">
              <AvatarImage src={avatar_url || undefined} alt={displayName} />
              <AvatarFallback className="bg-devcard-green/10 text-devcard-green font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{displayName}</h3>
              {github_username && (
                <p className="text-xs text-muted-foreground truncate">
                  @{github_username}
                </p>
              )}
            </div>
          </div>

          {/* Bio Snippet */}
          {bioSnippet && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {bioSnippet}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-border/50">
            {url_slug && (
              <Button
                asChild
                size="sm"
                variant="outline"
                className="flex-1 h-8 text-xs border-devcard-green/30 hover:bg-devcard-green/10 hover:border-devcard-green/50"
              >
                <Link href={cardUrl}>
                  <ExternalLink className="mr-1.5 h-3 w-3" />
                  View Card
                </Link>
              </Button>
            )}
            {githubUrl && (
              <Button
                asChild
                size="sm"
                variant="ghost"
                className="h-8 px-2 text-xs hover:bg-muted"
              >
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  GitHub
                </a>
              </Button>
            )}
            {showRemoveButton && onRemove && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive ml-auto"
                onClick={() => onRemove(id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
