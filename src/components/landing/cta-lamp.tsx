import AnimationContainer from '@/components/global/animation-container';
import MaxWidthWrapper from '@/components/global/max-width-wrapper';
import { LampContainer } from '@/components/ui/lamp';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function CTALamp() {
  return (
    <div className="w-full overflow-hidden">
      <div className="mt-20 max-w-7xl mx-auto px-4 md:px-12 lg:px-20">
        <div className="flex flex-col items-center justify-center relative w-full text-center py-20 md:py-32">
          <h2 className="bg-gradient-to-b from-devcard-heading to-devcard-heading/40 py-4 bg-clip-text text-center text-4xl md:text-7xl !leading-[1.15] font-bold tracking-tight text-transparent">
            Turn "nice to meet you"
            <br />
            into "here's the repo."
          </h2>
          <p className="text-devcard-heading/70 mt-6 max-w-md mx-auto text-lg">
            Get your wallet-ready profile and jump into the next hackathon.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="bg-devcard-green hover:bg-devcard-green/90 text-black font-medium text-sm px-12 py-6 rounded-full">
              <Link href="/sign-up">
                Get your pass
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button asChild size="lg" className="bg-devcard-border hover:bg-devcard-border/70 text-devcard-heading font-medium text-sm px-8 py-6 rounded-full border border-devcard-heading/20">
              <Link href="/danproc">
                Preview a profile
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
