"use client";

import React, { useState, useMemo } from "react";
import { UserCardMini } from "./user-card-mini";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

interface Connection {
  id: string;
  name: string | null;
  github_username: string | null;
  avatar_url: string | null;
  url_slug: string | null;
  custom_bio: string | null;
}

interface ConnectionsListProps {
  connections: Connection[];
  onRemove?: (userId: string) => void;
  showRemoveButton?: boolean;
}

const ITEMS_PER_PAGE = 50;

export function ConnectionsList({
  connections,
  onRemove,
  showRemoveButton = false,
}: ConnectionsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"name" | "username">("name");

  // Filter connections based on search query
  const filteredConnections = useMemo(() => {
    if (!searchQuery.trim()) return connections;

    const query = searchQuery.toLowerCase();
    return connections.filter((conn) => {
      const name = conn.name?.toLowerCase() || "";
      const username = conn.github_username?.toLowerCase() || "";
      const bio = conn.custom_bio?.toLowerCase() || "";

      return name.includes(query) || username.includes(query) || bio.includes(query);
    });
  }, [connections, searchQuery]);

  // Sort connections
  const sortedConnections = useMemo(() => {
    return [...filteredConnections].sort((a, b) => {
      if (sortBy === "name") {
        const nameA = a.name || a.github_username || "";
        const nameB = b.name || b.github_username || "";
        return nameA.localeCompare(nameB);
      } else {
        const usernameA = a.github_username || "";
        const usernameB = b.github_username || "";
        return usernameA.localeCompare(usernameB);
      }
    });
  }, [filteredConnections, sortBy]);

  // Pagination
  const totalPages = Math.ceil(sortedConnections.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedConnections = sortedConnections.slice(startIndex, endIndex);

  // Reset to page 1 when search query changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy]);

  const handleRemove = (userId: string) => {
    if (onRemove) {
      onRemove(userId);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search connections by name, username, or bio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background border-border/50 focus:border-devcard-green/50"
          />
        </div>
        <Select value={sortBy} onValueChange={(value: "name" | "username") => setSortBy(value)}>
          <SelectTrigger className="w-full sm:w-[180px] bg-background border-border/50">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Sort by Name</SelectItem>
            <SelectItem value="username">Sort by Username</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {filteredConnections.length === connections.length
            ? `${connections.length} connection${connections.length !== 1 ? "s" : ""}`
            : `${filteredConnections.length} of ${connections.length} connection${connections.length !== 1 ? "s" : ""}`}
        </span>
        {totalPages > 1 && (
          <span>
            Page {currentPage} of {totalPages}
          </span>
        )}
      </div>

      {/* Connections Grid */}
      {paginatedConnections.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paginatedConnections.map((connection) => (
            <UserCardMini
              key={connection.id}
              id={connection.id}
              name={connection.name}
              github_username={connection.github_username}
              avatar_url={connection.avatar_url}
              url_slug={connection.url_slug}
              custom_bio={connection.custom_bio}
              onRemove={handleRemove}
              showRemoveButton={showRemoveButton}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          {searchQuery ? (
            <p>No connections found matching "{searchQuery}"</p>
          ) : (
            <p>No connections yet</p>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="border-border/50 hover:bg-devcard-green/10 hover:border-devcard-green/50 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground px-3">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="border-border/50 hover:bg-devcard-green/10 hover:border-devcard-green/50 disabled:opacity-50"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
