"use client";

import React from "react";
import Link from "next/link";
import AnimationContainer from "@/components/global/animation-container";

const productLinks = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/#pricing" },
  { label: "How it works", href: "/#how-it-works" },
];

const legalLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export function Footer() {
  return (
    <footer className="flex flex-col relative items-center justify-center pt-16 pb-16 md:pb-20 px-6 lg:px-8 w-full max-w-6xl mx-auto lg:pt-32">

      {/* Brand Section - Centered */}
      <AnimationContainer delay={0.1}>
        <div className="flex flex-col items-center justify-center text-center mb-12">
          <Link href="/" className="mb-4">
            <span className="text-2xl font-bold">
              <span className="text-devcard-heading">Stack</span>
              <span className="text-devcard-green">Pass</span>
            </span>
          </Link>
          <p className="text-devcard-text text-sm">
            Your GitHub, beautifully networked.
          </p>
          <span className="mt-2 text-devcard-heading/60 text-sm">
            Built by developers, for developers
          </span>

          {/* Inline Links Below */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8 text-sm text-devcard-text">
            {productLinks.map((link, index) => (
              <React.Fragment key={link.label}>
                <Link href={link.href} className="hover:text-devcard-green transition-all duration-300">
                  {link.label}
                </Link>
                {index < productLinks.length - 1 && <span className="text-devcard-border">•</span>}
              </React.Fragment>
            ))}
            <span className="text-devcard-border">•</span>
            {legalLinks.map((link, index) => (
              <React.Fragment key={link.label}>
                <Link href={link.href} className="hover:text-devcard-green transition-all duration-300">
                  {link.label}
                </Link>
                {index < legalLinks.length - 1 && <span className="text-devcard-border">•</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </AnimationContainer>

      {/* Copyright - Centered */}
      <AnimationContainer delay={0.6}>
        <p className="text-sm text-devcard-text text-center">
          &copy; {new Date().getFullYear()} StackPass. All rights reserved.
        </p>
      </AnimationContainer>
    </footer>
  );
}
