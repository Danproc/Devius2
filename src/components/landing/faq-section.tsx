'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'What is StackPass?',
    answer:
      'StackPass is a developer profile that syncs with your GitHub, works as a scannable wallet pass, and lets Pro members compete in Sprints and Seasons for prizes and badges.',
  },
  {
    question: 'Is it free?',
    answer:
      'Yes! The core profile, wallet pass, and GitHub sync are 100% free. Pro membership ($10/month) unlocks competition entry and advanced features.',
  },
  {
    question: 'How does the wallet pass work?',
    answer:
      'After signing in, download your pass to Apple Wallet or Google Wallet. Anyone can scan it to instantly view your profile—no app download needed.',
  },
  {
    question: 'What are Sprints and Seasons?',
    answer:
      'Sprints are weekly coding challenges. Seasons are month-long competitions. Both are exclusive to Pro members and award cash prizes and permanent badges.',
  },
  {
    question: 'Do I need to keep my GitHub public?',
    answer:
      'Yes, StackPass syncs from your public GitHub profile and repos. Private repos are never accessed or displayed.',
  },
  {
    question: 'Can I customize my profile?',
    answer:
      'Absolutely. You can set custom bio, location, availability, tech stack, featured projects, and social links. GitHub stats auto-update.',
  },
  {
    question: 'What are founder numbers?',
    answer:
      'The first 500 users get a permanent founder badge (#001–#500) on their profile. It\'s a one-time recognition for early adopters.',
  },
  {
    question: 'How do I win prizes?',
    answer:
      'Join a Sprint or Season as a Pro member, ship your project before the deadline, and submit it. Top entries win cash prizes and badges that appear on your StackPass forever.',
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="py-24 px-4 bg-devcard-base">
      <div className="container mx-auto max-w-3xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-devcard-heading mb-4">
            Frequently asked questions
          </h2>
          <p className="text-lg text-devcard-text">
            Everything you need to know about StackPass.
          </p>
        </div>

        {/* FAQ Accordion */}
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="rounded-lg bg-devcard-border/10 border border-devcard-border px-6 data-[state=open]:border-devcard-green/50"
            >
              <AccordionTrigger className="text-left text-base font-semibold text-devcard-heading hover:text-devcard-green hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-devcard-text leading-relaxed pt-2">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
