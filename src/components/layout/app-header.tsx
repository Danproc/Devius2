"use client";

import { appConfig } from "@/lib/config";
import Link from "next/link";
import { Trophy, Users } from "lucide-react";
import { UserButton } from "@/components/layout/user-button";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#121824] bg-[#04080f]/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/app" className="flex items-center">
              <span className="text-xl font-bold">
                <span className="text-devcard-heading">Stack</span>
                <span className="text-devcard-green">Pass</span>
              </span>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/hackathons"
                className="flex items-center gap-2 text-sm text-devcard-text hover:text-devcard-green transition-colors"
              >
                <Trophy className="h-4 w-4" />
                Hackathons
              </Link>
              <Link
                href="/app/members"
                className="flex items-center gap-2 text-sm text-devcard-text hover:text-devcard-green transition-colors"
              >
                <Users className="h-4 w-4" />
                Members
              </Link>
            </nav>
          </div>

          {/* User Menu */}
          <UserButton />
        </div>
      </div>
    </header>
  );
} 