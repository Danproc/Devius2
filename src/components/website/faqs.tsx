"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is StackPass?",
    answer:
      "StackPass is a GitHub-powered developer profile platform that showcases your coding activity, projects, and achievements. Create a shareable DevCard, add it to your Apple Wallet or Google Wallet, and participate in Sprints and Seasons to win prizes and badges.",
  },
  {
    question: "How does StackPass work?",
    answer:
      "Connect your GitHub account to automatically sync your contributions, repositories, and tech stack. Your profile updates in real-time, and you can generate a wallet pass to share your DevCard with others. Participate in hackathon-style Sprints to compete for prizes.",
  },
  {
    question: "What is a DevCard?",
    answer:
      "A DevCard is your digital developer identity card that displays your GitHub stats, tech stack, contributions, and achievements. You can share it via QR code, download it as a wallet pass, or embed it on your website.",
  },
  {
    question: "How do Sprints and Seasons work?",
    answer:
      "Sprints are time-boxed coding challenges where you compete with other developers. Complete tasks, contribute to projects, and earn points. Seasons are longer competitions with bigger prizes and special badges. Track your progress on the leaderboard.",
  },
  {
    question: "Is StackPass free?",
    answer:
      "Yes! StackPass is free to use. Create your profile, generate wallet passes, and participate in Sprints at no cost. We may introduce premium features in the future, but core functionality will always remain free.",
  },
  {
    question: "What wallets are supported?",
    answer:
      "StackPass supports both Apple Wallet (iOS) and Google Wallet (Android). Your DevCard can be added to either wallet and will display your real-time GitHub stats and achievements.",
  },
  {
    question: "How do I connect with other developers?",
    answer:
      "Use StackPass to discover developers with similar tech stacks, send connection requests, and build your professional network. View others' DevCards, check their GitHub activity, and collaborate on projects.",
  },
  {
    question: "Can I customize my DevCard?",
    answer:
      "Yes! You can customize your DevCard by selecting which stats to display, choosing your primary tech stack, and highlighting specific projects. Premium themes and additional customization options may be available in the future.",
  },
  {
    question: "How often does my profile update?",
    answer:
      "Your GitHub stats sync automatically every 24 hours. You can also manually trigger a sync from your dashboard. Real-time updates for contributions and activity streaks are reflected immediately.",
  },
  {
    question: "What if I don't have a GitHub account?",
    answer:
      "A GitHub account is required to use StackPass since we pull your coding activity and projects from GitHub. If you're new to GitHub, you can create a free account at github.com and start building your developer profile.",
  },
];

export function WebsiteFAQs() {
  return (
    <aside className="bg-muted/40 py-16 sm:py-24" aria-label="Frequently Asked Questions">
      <div className="mx-auto max-w-(--breakpoint-xl) px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-muted-foreground">
            Can&apos;t find what you&apos;re looking for? Reach out to our{" "}
            <a
              href="/support"
              className="font-medium text-primary hover:underline"
            >
              support team
            </a>{" "}
            for help
          </p>
        </div>
        <div className="mx-auto mt-12 max-w-3xl">
          <Accordion type="single" collapsible>
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </aside>
  );
}
