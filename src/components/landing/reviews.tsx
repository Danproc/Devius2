import AnimationContainer from '@/components/global/animation-container';
import MaxWidthWrapper from '@/components/global/max-width-wrapper';
import MagicBadge from '@/components/ui/magic-badge';
import MagicCard from '@/components/ui/magic-card';

const reviews = [
  {
    name: 'Lina K.',
    title: 'Frontend Engineer',
    quote: 'Scan, connect, build. I met my teammate on Saturday and we shipped a demo by Sunday.',
  },
  {
    name: 'Ahmed R.',
    title: 'Indie Hacker',
    quote: 'Finally a dev network that rewards working code, not noise.',
  },
  {
    name: 'Priya S.',
    title: 'Hiring Manager',
    quote: 'We hired two finalists straight from the Gallery.',
  },
];

export function Reviews() {
  return (
    <MaxWidthWrapper className="py-10">
      <AnimationContainer delay={0.1}>
        <div className="flex flex-col items-center justify-center w-full py-8 max-w-xl mx-auto">
          <MagicBadge title="Testimonials" />
          <h2 className="text-center text-3xl md:text-5xl !leading-[1.1] font-bold text-devcard-heading mt-6">
            What builders say
          </h2>
        </div>
      </AnimationContainer>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 py-10">
        {reviews.map((review, index) => (
          <AnimationContainer delay={0.2 * index} key={index}>
            <MagicCard className="h-full">
              <div className="flex flex-col h-full">
                <p className="text-devcard-heading/70 text-sm leading-relaxed mb-6">
                  "{review.quote}"
                </p>
                <div className="mt-auto">
                  <p className="text-devcard-heading font-medium text-sm">
                    {review.name}
                  </p>
                  <p className="text-devcard-heading/50 text-xs">
                    {review.title}
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
