"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import MaxWidthWrapper from "@/components/global/max-width-wrapper";
import { cn } from "@/lib/utils";

const navItems: { label: string; href: string }[] = [
  { label: "Features", href: "/#features" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Hackathons", href: "/hackathons" },
  { label: "Pricing", href: "/#pricing" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scroll, setScroll] = useState(false);

  const handleScroll = () => {
    if (window.scrollY > 8) {
      setScroll(true);
    } else {
      setScroll(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 inset-x-0 h-14 w-full border-b border-transparent z-[99999] select-none transition-all",
        scroll && "border-devcard-border/80 bg-devcard-base/60 backdrop-blur-md"
      )}
      style={{ position: 'sticky' }}
    >
      <div className="h-full mx-auto w-full max-w-full md:max-w-screen-xl px-4 md:px-12 lg:px-20 flex items-center justify-between h-14 relative">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span className="text-xl font-bold">
            <span className="text-devcard-heading">Stack</span>
            <span className="text-devcard-green">Pass</span>
          </span>
        </Link>

        {/* Desktop Navigation - Absolutely Centered */}
        <nav className="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-devcard-text hover:text-devcard-green transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center space-x-4 md:flex">
          <Link
            href="/sign-in"
            className="text-sm font-medium text-devcard-text hover:text-devcard-green transition-colors"
          >
            Sign in
          </Link>
          <Button
            asChild
            className="bg-devcard-green hover:bg-devcard-green/90 text-black font-medium text-sm px-6 rounded-full"
          >
            <Link href="/sign-up">Get your pass</Link>
          </Button>
        </div>

        {/* Mobile CTA & Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/sign-in"
            className="text-xs font-medium text-devcard-text hover:text-devcard-green transition-colors"
          >
            Sign in
          </Link>
          <Button
            asChild
            size="sm"
            className="bg-devcard-green hover:bg-devcard-green/90 text-black font-medium text-xs px-3 rounded-full h-8"
          >
            <Link href="/sign-up">Get pass</Link>
          </Button>
          <button
            className="inline-flex items-center justify-center rounded-md p-2 text-devcard-text hover:bg-devcard-border/50 hover:text-devcard-green transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="border-t border-devcard-border/30 md:hidden bg-devcard-base/95 backdrop-blur-md">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block rounded-md px-3 py-2 text-base font-medium text-devcard-text hover:bg-devcard-border/50 hover:text-devcard-green transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/sign-in"
              className="block rounded-md px-3 py-2 text-base font-medium text-devcard-text hover:bg-devcard-border/50 hover:text-devcard-green transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Sign in
            </Link>
            <div className="px-3 py-2">
              <Button className="w-full bg-devcard-green hover:bg-devcard-green/90 text-black font-semibold rounded-full" asChild>
                <Link href="/sign-up">Get your pass</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
