import AnimationContainer from '@/components/global/animation-container';
import MaxWidthWrapper from '@/components/global/max-width-wrapper';
import Image from 'next/image';

const companies = [
  { name: 'Vercel', logo: '/assets/companies/vercel.svg' },
  { name: 'Supabase', logo: '/assets/companies/supabase.svg' },
  { name: 'PostHog', logo: '/assets/companies/posthog.svg' },
  { name: 'Doppler', logo: '/assets/companies/doppler.svg' },
  { name: 'Clerk', logo: '/assets/companies/clerk.svg' },
  { name: 'Hashnode', logo: '/assets/companies/hashnode.svg' },
];

export function Companies() {
  return (
    <MaxWidthWrapper>
      <AnimationContainer delay={0.4}>
        <div className="py-14">
          <div className="mx-auto px-4 md:px-8">
            <h2 className="text-center text-sm font-medium text-devcard-heading/50 uppercase tracking-wider">
              Trusted by builders at
            </h2>
            <div className="mt-8">
              <ul className="flex flex-wrap items-center gap-x-6 gap-y-6 md:gap-x-16 justify-center">
                {companies.map((company) => (
                  <li key={company.name}>
                    <div className="text-devcard-heading/40 font-mono text-lg">
                      {company.name}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-center text-xs text-devcard-heading/40 mt-6">
              Logos represent where our community builds and works.
            </p>
          </div>
        </div>
      </AnimationContainer>
    </MaxWidthWrapper>
  );
}
