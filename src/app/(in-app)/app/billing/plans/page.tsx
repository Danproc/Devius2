/**
 * Pricing Page
 * T114: Create src/app/(in-app)/app/billing/plans/page.tsx with pricing page showing monthly/annual options
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Toggle } from '@/components/ui/toggle';
import { Check, Crown, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type BillingInterval = 'monthly' | 'annual';

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  monthlyPriceId: string;
  annualPriceId: string;
  features: string[];
  popular?: boolean;
}

// TODO: Replace these with actual Stripe price IDs from your Stripe dashboard
const pricingPlans: PricingPlan[] = [
  {
    id: 'premium-basic',
    name: 'Premium',
    description: 'Perfect for individual developers',
    monthlyPrice: 9,
    annualPrice: 90,
    monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PRICE_ID || 'price_monthly',
    annualPriceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_ANNUAL_PRICE_ID || 'price_annual',
    features: [
      'Custom themes and branding',
      'Custom domain support',
      'Advanced analytics',
      'Priority email support',
      'Remove DevCard branding',
      'Export analytics data',
    ],
    popular: true,
  },
  {
    id: 'premium-pro',
    name: 'Premium Pro',
    description: 'For teams and organizations',
    monthlyPrice: 29,
    annualPrice: 290,
    monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRO_MONTHLY_PRICE_ID || 'price_pro_monthly',
    annualPriceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRO_ANNUAL_PRICE_ID || 'price_pro_annual',
    features: [
      'Everything in Premium',
      'Organization profiles',
      'Team member management',
      'Advanced security features',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
    ],
  },
];

export default function PricingPage() {
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('monthly');
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleSubscribe = async (priceId: string, planName: string) => {
    setLoading(priceId);

    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
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
      toast.error('Failed to start checkout. Please try again.');
      setLoading(null);
    }
  };

  const getPrice = (plan: PricingPlan) => {
    return billingInterval === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
  };

  const getPriceId = (plan: PricingPlan) => {
    return billingInterval === 'monthly' ? plan.monthlyPriceId : plan.annualPriceId;
  };

  const getSavings = (plan: PricingPlan) => {
    const monthlyCost = plan.monthlyPrice * 12;
    const annualCost = plan.annualPrice;
    return Math.round(((monthlyCost - annualCost) / monthlyCost) * 100);
  };

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Crown className="h-8 w-8 text-yellow-500" />
          <h1 className="text-4xl font-bold">Upgrade to Premium</h1>
        </div>
        <p className="text-xl text-muted-foreground mb-6">
          Unlock all features and take your DevCard to the next level
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
            className="data-[state=on]:bg-yellow-500"
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
            Save up to 17% with annual billing
          </p>
        )}
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {pricingPlans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative ${
              plan.popular
                ? 'border-yellow-500 shadow-lg scale-105'
                : ''
            }`}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 hover:bg-yellow-600">
                Most Popular
              </Badge>
            )}

            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">${getPrice(plan)}</span>
                  <span className="text-muted-foreground">
                    /{billingInterval === 'monthly' ? 'mo' : 'yr'}
                  </span>
                </div>
                {billingInterval === 'annual' && (
                  <p className="text-sm text-green-600 mt-1">
                    Save {getSavings(plan)}% compared to monthly
                  </p>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter>
              <Button
                className="w-full"
                size="lg"
                variant={plan.popular ? 'default' : 'outline'}
                onClick={() => handleSubscribe(getPriceId(plan), plan.name)}
                disabled={loading !== null}
              >
                {loading === getPriceId(plan) ? (
                  'Loading...'
                ) : (
                  <>
                    <Crown className="h-4 w-4 mr-2" />
                    Subscribe to {plan.name}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Can I cancel anytime?</h3>
            <p className="text-muted-foreground text-sm">
              Yes, you can cancel your subscription at any time. You'll continue to have access to premium
              features until the end of your billing period.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">What payment methods do you accept?</h3>
            <p className="text-muted-foreground text-sm">
              We accept all major credit cards through Stripe, including Visa, Mastercard, American Express,
              and more.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Can I switch plans later?</h3>
            <p className="text-muted-foreground text-sm">
              Absolutely! You can upgrade or downgrade your plan at any time from your billing settings.
              Changes will be prorated.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Do you offer refunds?</h3>
            <p className="text-muted-foreground text-sm">
              We offer a 30-day money-back guarantee. If you're not satisfied with your premium subscription,
              contact us within 30 days for a full refund.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
