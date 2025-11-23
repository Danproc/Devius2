/**
 * Dynamic Pricing Page
 * T013: Fetch premium tiers from database and display with homepage design
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface PremiumTier {
  id: string;
  tier_code: string;
  name: string;
  features: Record<string, boolean>;
  monthlyPrice: number;
  monthlyStripePriceId: string;
  yearlyPrice: number;
  yearlyStripePriceId: string;
}

const freePlan = {
  name: 'Free',
  price: '$0',
  description: 'Get started with the basics',
  features: [
    'Public developer profile',
    'GitHub auto-sync (stats, repos)',
    'Wallet pass (Apple/Google)',
    'Up to 3 featured projects',
    'Connection requests',
    'Basic tech stack display',
  ],
};

const proPlanFeatures = [
  'Everything in Free',
  'Enter Sprints & Seasons',
  'Compete for prizes & badges',
  'Priority profile placement',
  'Advanced analytics',
  'Custom project showcases',
  'Early access to new features',
  'Pro member badge',
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [tiers, setTiers] = useState<PremiumTier[]>([]);
  const [loadingTiers, setLoadingTiers] = useState(true);
  const router = useRouter();

  // Fetch premium tiers from database
  useEffect(() => {
    async function fetchTiers() {
      try {
        const response = await fetch('/api/pricing/tiers');
        if (!response.ok) {
          throw new Error('Failed to fetch pricing tiers');
        }
        const data = await response.json();
        setTiers(data.tiers || []);
      } catch (error) {
        console.error('Error fetching tiers:', error);
        toast.error('Failed to load pricing plans');
      } finally {
        setLoadingTiers(false);
      }
    }

    fetchTiers();
  }, []);

  const handleSubscribe = async (tierCode: string) => {
    setLoading(tierCode);

    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tierCode,
          billingFrequency: 'annual', // Always annual for $49/year
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create checkout session');
      }

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start checkout. Please try again.');
      setLoading(null);
    }
  };

  if (loadingTiers) {
    return (
      <div className="min-h-screen bg-devcard-base py-24 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-devcard-green" />
        </div>
      </div>
    );
  }

  // Get the Premium tier (should only be one)
  const premiumTier = tiers.find(t => t.tier_code === 'premium');

  return (
    <section className="min-h-screen bg-devcard-base py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="h-8 w-8 text-devcard-green" />
            <h1 className="text-3xl md:text-4xl font-bold text-devcard-heading">
              Simple pricing
            </h1>
          </div>
          <p className="text-lg text-devcard-text max-w-2xl mx-auto">
            Start free. Go Pro to compete and win.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="flex flex-col h-full p-8 rounded-2xl bg-devcard-border/10 border border-devcard-border hover:border-devcard-border transition-all">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-devcard-heading mb-2">
                {freePlan.name}
              </h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold text-devcard-heading">
                  {freePlan.price}
                </span>
              </div>
              <p className="text-sm text-devcard-text">{freePlan.description}</p>
            </div>

            <ul className="space-y-3 mb-8 flex-grow">
              {freePlan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-devcard-green flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-devcard-text">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              asChild
              variant="outline"
              className="w-full border-devcard-border bg-devcard-base hover:bg-devcard-green/10 hover:border-devcard-green text-devcard-text font-medium rounded-full"
            >
              <a href="/">
                Current Plan
              </a>
            </Button>
          </div>

          {/* Premium Plan */}
          {premiumTier ? (
            <div className="relative flex flex-col h-full p-8 rounded-2xl bg-devcard-green/5 border-2 border-devcard-green/50 hover:border-devcard-green transition-all shadow-lg shadow-devcard-green/10">
              {/* Highlighted Badge */}
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-devcard-green text-black font-bold px-4 py-1">
                <Sparkles className="h-3 w-3 mr-1" />
                MOST POPULAR
              </Badge>

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-devcard-heading mb-2">
                  Pro
                </h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold text-devcard-green">
                    ${(premiumTier.yearlyPrice / 100).toFixed(0)}
                  </span>
                  <span className="text-devcard-heading">/year</span>
                </div>
                <p className="text-sm text-devcard-heading">Compete, win, and stand out</p>
              </div>

              <ul className="space-y-3 mb-8 flex-grow">
                {proPlanFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-devcard-green flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-devcard-heading">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSubscribe(premiumTier.tier_code)}
                disabled={loading !== null}
                className="w-full bg-devcard-green hover:bg-devcard-green/90 text-black font-medium rounded-full"
              >
                {loading === premiumTier.tier_code ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Get Pro access
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col h-full p-8 rounded-2xl bg-devcard-border/10 border border-devcard-border">
              <div className="flex items-center justify-center h-full text-devcard-text">
                Premium tier not configured
              </div>
            </div>
          )}
        </div>

        {/* Bottom Note */}
        <p className="text-center text-sm text-devcard-text mt-12">
          All prices in USD. Cancel anytime. Founders #001–#500 get permanent recognition.
        </p>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8 text-devcard-heading">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2 text-devcard-heading">Can I cancel anytime?</h3>
              <p className="text-devcard-text text-sm">
                Yes, you can cancel your subscription at any time. You'll continue to have access to premium
                features until the end of your billing period.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-devcard-heading">What payment methods do you accept?</h3>
              <p className="text-devcard-text text-sm">
                We accept all major credit cards through Stripe, including Visa, Mastercard, American Express,
                and more.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-devcard-heading">What if I'm already a founder member (#001-#500)?</h3>
              <p className="text-devcard-text text-sm">
                Founder members maintain their permanent recognition badge. Pro membership adds hackathon access
                and competition features on top of your founder status.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-devcard-heading">Do you offer refunds?</h3>
              <p className="text-devcard-text text-sm">
                We offer a 30-day money-back guarantee. If you're not satisfied with your premium subscription,
                contact us within 30 days for a full refund.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
