"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import useUser from "@/lib/users/useUser";
import Link from "next/link";
import {
  LayoutDashboard,
  CreditCard,
  LogOut,
  UserIcon,
  Users,
  Inbox,
  Edit,
  Settings,
  Trophy,
  Shield,
} from "lucide-react";
import useSWR from "swr";

interface ConnectionRequestData {
  direction: "received" | "sent";
}

interface RequestsResponse {
  requests: ConnectionRequestData[];
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
};

export function UserButton() {
  const { user } = useUser();

  // Fetch admin status from API
  const { data: adminData } = useSWR(
    user?.email ? '/api/admin/check' : null,
    fetcher
  );

  const isAdmin = adminData?.isAdmin || false;

  // Fetch pending connection requests
  const { data } = useSWR<RequestsResponse>(
    "/api/connections/requests?status=pending",
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  );

  const pendingRequestsCount = data?.requests.filter(
    (r) => r.direction === "received"
  ).length || 0;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 outline-hidden">
        <Avatar>
          <AvatarImage src={user?.image || undefined} />
          <AvatarFallback>
            {user?.name ? (
              getInitials(user.name)
            ) : (
              <UserIcon className="w-4 h-4" />
            )}
          </AvatarFallback>
        </Avatar>
        <span className="hidden text-sm font-medium md:inline-block">
          {user?.name || user?.email}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-devcard-base border-devcard-border">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-devcard-heading">{user?.name || "-"}</p>
            {user?.email && (
              <p className="text-xs text-devcard-text">{user.email}</p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/app/dashboard" className="cursor-pointer">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/app/card/edit" className="cursor-pointer">
            <Edit className="mr-2 h-4 w-4" />
            Edit Card
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/hackathons" className="cursor-pointer">
            <Trophy className="mr-2 h-4 w-4" />
            Hackathons
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/app/network" className="cursor-pointer">
            <Users className="mr-2 h-4 w-4" />
            My Network
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/app/network/requests" className="cursor-pointer flex items-center justify-between">
            <span className="flex items-center">
              <Inbox className="mr-2 h-4 w-4" />
              Connection Requests
            </span>
            {pendingRequestsCount > 0 && (
              <Badge
                variant="default"
                className="ml-2 bg-devcard-green text-black font-semibold"
              >
                {pendingRequestsCount}
              </Badge>
            )}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {isAdmin && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/admin" className="cursor-pointer">
                <Shield className="mr-2 h-4 w-4" />
                Admin Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem asChild>
          <Link href="/app/plan" className="cursor-pointer">
            <CreditCard className="mr-2 h-4 w-4" />
            Manage Plan
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/sign-out" className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
