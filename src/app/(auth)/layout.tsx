import { appConfig } from "@/lib/config";
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-devcard-base py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <h2 className="text-4xl font-bold mb-3">
            <span className="text-devcard-heading">Stack</span>
            <span className="text-devcard-green">Pass</span>
          </h2>
          <p className="text-sm text-devcard-green font-mono tracking-wider">[ AUTH ]</p>
        </div>

        <div className="relative bg-devcard-border/10 py-8 px-4 sm:px-10 border border-devcard-border">
          {/* Corner brackets for techy look */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-devcard-green" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-devcard-green" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-devcard-green" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-devcard-green" />

          {children}
        </div>

        <p className="text-center text-xs text-devcard-heading/60">
          By continuing, you agree to our{" "}
          <Link
            href="/terms"
            className="font-medium text-devcard-green hover:text-devcard-green/80"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="font-medium text-devcard-green hover:text-devcard-green/80"
          >
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
