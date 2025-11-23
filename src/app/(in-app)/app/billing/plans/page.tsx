/**
 * Dynamic Pricing Page
 * T013: Fetch premium tiers from database and display with monthly/annual options
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Toggle } from '@/components/ui/toggle';
import { Check, Crown, Zap, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type BillingInterval = 'monthly' | 'annual';

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

export default function PricingPage() {
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('monthly');
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

  const handleSubscribe = async (tierCode: string, billingFrequency: BillingInterval, tierName: string) => {
    const tier = tiers.find(t => t.tier_code === tierCode);
    if (!tier) {
      toast.error('Invalid pricing tier');
      return;
    }

    const priceId = billingFrequency === 'monthly'
      ? tier.monthlyStripePriceId
      : tier.yearlyStripePriceId;

    setLoading(priceId);

    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tierCode,
          billingFrequency,
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

  const getPrice = (tier: PremiumTier) => {
    const price = billingInterval === 'monthly' ? tier.monthlyPrice : tier.yearlyPrice;
    return (price / 100).toFixed(2); // Convert cents to dollars
  };

  const getSavings = (tier: PremiumTier) => {
    const monthlyCost = tier.monthlyPrice * 12;
    const annualCost = tier.yearlyPrice;
    return Math.round(((monthlyCost - annualCost) / monthlyCost) * 100);
  };

  const getFeatureList = (features: Record<string, boolean>): string[] => {
    return Object.entries(features)
      .filter(([_, enabled]) => enabled)
      .map(([key, _]) => {
        // Convert snake_case to Title Case
        return key
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      });
  };

  if (loadingTiers) {
    return (
      <div className="container max-w-6xl mx-auto py-12 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (tiers.length === 0) {
    return (
      <div className="container max-w-6xl mx-auto py-12 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Premium Tiers Available</h1>
          <p className="text-muted-foreground">
            Premium subscription plans are currently being configured. Please check back soon.
          </p>
        </div>
      </div>
    );
  }

  // Mark first tier as popular by default
  const tiersWithPopular = tiers.map((tier, index) => ({
    ...tier,
    popular: index === 0,
  }));

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Crown className="h-8 w-8 text-yellow-500" />
          <h1 className="text-4xl font-bold">Upgrade to Premium</h1>
        </div>
        <p className="text-xl text-muted-foreground mb-6">
          Unlock all features and take your StackPass to the next level
        </p>

        {/* Billing Interval Toggle */}
        <div className="flex items-center justify-center gap-4 mb-2">
          <span className={billingInterval === 'monthly' ? 'font-medium' : 'text-muted-foreground'}>
            Monthly
          </span>
          <Toggle
            pressed={billingInterval === 'annual'}
            onPressedChange={(pressed) => setBillingInterval(pressed ? 'annual' : 'monthly')}
            aria-label="Toggle billing interval"
            className="data-[state=on]:bg-devcard-green"
          >
            <span className="sr-only">Switch to annual billing</span>
          </Toggle>
          <span className={billingInterval === 'annual' ? 'font-medium' : 'text-muted-foreground'}>
            Annual
          </span>
        </div>
        {billingInterval === 'annual' && (
          <p className="text-sm text-green-600 font-medium">
            <Zap className="inline h-4 w-4 mr-1" />
            Save up to {Math.max(...tiers.map(getSavings))}% with annual billing
          </p>
        )}
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {tiersWithPopular.map((tier) => {
          const featureList = getFeatureList(tier.features);
          const priceId = billingInterval === 'monthly'
            ? tier.monthlyStripePriceId
            : tier.yearlyStripePriceId;

          return (
            <Card
              key={tier.id}
              className={`relative ${
                tier.popular
                  ? 'border-devcard-green shadow-lg scale-105'
                  : 'border-devcard-border'
              }`}
            >
              {tier.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-devcard-green text-black hover:bg-devcard-green/90">
                  Most Popular
                </Badge>
              )}

              <CardHeader>
                <CardTitle className="text-2xl text-devcard-heading">{tier.name}</CardTitle>
                <CardDescription>Perfect for individual developers</CardDescription>
                <div className="mt-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-devcard-heading">${getPrice(tier)}</span>
                    <span className="text-devcard-text">
                      /{billingInterval === 'monthly' ? 'mo' : 'yr'}
                    </span>
                  </div>
                  {billingInterval === 'annual' && (
                    <p className="text-sm text-green-600 mt-1">
                      Save {getSavings(tier)}% compared to monthly
                    </p>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {featureList.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-devcard-green flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-devcard-text">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className={tier.popular ? 'w-full bg-devcard-green hover:bg-devcard-green/90 text-black' : 'w-full'}
                  size="lg"
                  variant={tier.popular ? 'default' : 'outline'}
                  onClick={() => handleSubscribe(tier.tier_code, billingInterval, tier.name)}
                  disabled={loading !== null}
                >
                  {loading === priceId ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Crown className="h-4 w-4 mr-2" />
                      Subscribe to {tier.name}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

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
            <h3 className="font-medium mb-2 text-devcard-heading">Can I switch plans later?</h3>
            <p className="text-devcard-text text-sm">
              Absolutely! You can upgrade or downgrade your plan at any time from your billing settings.
              Changes will be prorated.
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
  );
}
