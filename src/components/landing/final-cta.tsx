import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/db';
import { devcards } from '@/db/schema/devcard';
import { count, eq } from 'drizzle-orm';

export async function FinalCTA() {
  // Fetch real-time developer count
  const [developerCount] = await db
    .select({ count: count() })
    .from(devcards)
    .where(eq(devcards.is_public, true));

  const devCount = developerCount?.count || 0;

  return (
    <section className="py-24 px-4 bg-devcard-base border-t border-devcard-border/30">
      <div className="container mx-auto max-w-4xl text-center">
        {/* Main Headline */}
        <h2 className="text-3xl md:text-5xl font-bold text-devcard-heading mb-6 leading-tight">
          From <span className="font-bold text-devcard-green">commits</span> to <span className="font-bold text-devcard-green">connections</span>.
        </h2>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-devcard-text mb-10 max-w-2xl mx-auto leading-relaxed">
          Join <span className="font-bold text-devcard-green">{devCount}</span> developers who've ditched the CV and let their GitHub do the talking.
          Get your StackPass in less than 60 seconds.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            size="lg"
            className="bg-devcard-green hover:bg-devcard-green/90 text-black font-medium text-sm px-12 py-6 rounded-full"
          >
            <Link href="/sign-up">
              Create your pass
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            className="bg-devcard-border hover:bg-devcard-border/70 text-devcard-heading font-medium text-sm px-8 py-6 rounded-full border border-devcard-heading/20"
          >
            <Link href="/danproc">
              See a demo profile
            </Link>
          </Button>
        </div>

        {/* Bottom Note */}
        <p className="text-sm text-devcard-text mt-8">
          No Credit Card. No CV. Just your GitHub.
        </p>
      </div>
    </section>
  );
}
