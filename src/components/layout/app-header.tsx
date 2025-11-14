"use client";

import { appConfig } from "@/lib/config";
import Link from "next/link";
import { UserButton } from "@/components/layout/user-button";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#121824] bg-[#04080f]/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/app" className="flex items-center">
              <span className="text-xl font-bold">
                <span className="text-devcard-heading">Stack</span>
                <span className="text-devcard-green">Pass</span>
              </span>
            </Link>
          </div>

          {/* User Menu */}
          <UserButton />
        </div>
      </div>
    </header>
  );
} 