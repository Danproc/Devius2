import AnimationContainer from '@/components/global/animation-container';
import MaxWidthWrapper from '@/components/global/max-width-wrapper';
import MagicBadge from '@/components/ui/magic-badge';
import MagicCard from '@/components/ui/magic-card';
import { Github, Smartphone, Users } from 'lucide-react';

const steps = [
  {
    icon: Github,
    title: 'Connect GitHub',
    description: 'We sync your public stats and repos automatically.',
  },
  {
    icon: Smartphone,
    title: 'Get your pass',
    description: 'Add to Apple/Google Wallet and scan to connect anywhere.',
  },
  {
    icon: Users,
    title: 'Join hackathons',
    description: 'Team up (or go solo), ship a demo, and get discovered.',
  },
];

export function Process() {
  return (
    <MaxWidthWrapper className="py-10" id="how-it-works">
      <AnimationContainer delay={0.1}>
        <div className="flex flex-col items-center justify-center w-full py-8 max-w-xl mx-auto">
          <MagicBadge title="The Process" />
          <h2 className="text-center text-3xl md:text-5xl !leading-[1.1] font-bold text-devcard-heading mt-6">
            How it works
          </h2>
          <p className="mt-4 text-center text-lg text-devcard-heading/70 max-w-2xl">
            From sign-up to building together—fast.
          </p>
        </div>
      </AnimationContainer>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full py-8 gap-4 md:gap-8">
        {steps.map((step, id) => (
          <AnimationContainer delay={0.2 * id} key={id}>
            <MagicCard className="group md:py-8">
              <div className="flex flex-col items-start justify-center w-full">
                <step.icon strokeWidth={1.5} className="w-10 h-10 text-devcard-green" />
                <div className="flex flex-col relative items-start">
                  <span className="absolute -top-6 right-0 border-2 border-devcard-border text-devcard-heading font-medium text-2xl rounded-full w-12 h-12 flex items-center justify-center">
                    {id + 1}
                  </span>
                  <h3 className="text-base mt-6 font-bold text-devcard-heading">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-devcard-heading/70">
                    {step.description}
                  </p>
                </div>
              </div>
            </MagicCard>
          </AnimationContainer>
        ))}
      </div>
    </MaxWidthWrapper>
  );
}
