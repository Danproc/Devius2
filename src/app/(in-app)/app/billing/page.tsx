/**
 * Billing Management Page
 * T113: Create src/app/(in-app)/app/billing/page.tsx with subscription management page
 */

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { checkPremium, formatExpiryDate, isExpiringSoon } from '@/lib/premium/check-premium';
import { getUserSubscription } from '@/lib/stripe/subscriptions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Crown, CreditCard, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default async function BillingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const userId = session.user.id;
  const premiumStatus = await checkPremium(userId);
  const subscription = await getUserSubscription(userId);

  return (
    <div className="container max-w-5xl mx-auto py-12 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Billing & Subscription</h1>
        <p className="text-muted-foreground">
          Manage your premium subscription and billing information
        </p>
      </div>

      {/* Success/Canceled Messages */}
      {typeof window !== 'undefined' && (
        <>
          {new URLSearchParams(window.location.search).get('success') === 'true' && (
            <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                Payment successful! Your premium subscription is now active.
              </AlertDescription>
            </Alert>
          )}
          {new URLSearchParams(window.location.search).get('canceled') === 'true' && (
            <Alert className="mb-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-600">
                Payment was canceled. You can try again anytime.
              </AlertDescription>
            </Alert>
          )}
        </>
      )}

      {/* Premium Status Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {premiumStatus.isPremium ? (
                  <>
                    <Crown className="h-5 w-5 text-yellow-500" />
                    Premium Active
                  </>
                ) : (
                  'Free Plan'
                )}
              </CardTitle>
              <CardDescription>
                {premiumStatus.isPremium
                  ? 'You have access to all premium features'
                  : 'Upgrade to unlock premium features'}
              </CardDescription>
            </div>
            {premiumStatus.isPremium ? (
              <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">
                Premium
              </Badge>
            ) : (
              <Badge variant="outline">Free</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {premiumStatus.isPremium && premiumStatus.expiresAt && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {isExpiringSoon(premiumStatus.expiresAt) ? (
                    <span className="text-yellow-600 font-medium">
                      ⚠️ {formatExpiryDate(premiumStatus.expiresAt)}
                    </span>
                  ) : (
                    <span>Renews on {formatExpiryDate(premiumStatus.expiresAt)}</span>
                  )}
                </span>
              </div>

              {/* Premium Features List */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Active Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {premiumStatus.features.custom_themes && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Custom Themes</span>
                    </div>
                  )}
                  {premiumStatus.features.priority_support && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Priority Support</span>
                    </div>
                  )}
                  {premiumStatus.features.organization_profiles && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Organization Profiles</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {!premiumStatus.isPremium && (
            <div className="text-sm text-muted-foreground">
              Upgrade to premium to unlock:
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Custom themes and branding</li>
                <li>Priority support</li>
                <li>Organization profiles</li>
              </ul>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-3">
          {premiumStatus.isPremium ? (
            <form action="/api/billing/portal" method="POST">
              <Button type="submit" variant="outline">
                <CreditCard className="h-4 w-4 mr-2" />
                Manage Subscription
              </Button>
            </form>
          ) : (
            <Link href="/app/billing/plans">
              <Button>
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Premium
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          )}
        </CardFooter>
      </Card>

      {/* Subscription Details */}
      {subscription && premiumStatus.isPremium && (
        <Card>
          <CardHeader>
            <CardTitle>Subscription Details</CardTitle>
            <CardDescription>Current subscription information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                {subscription.status}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Billing Interval</span>
              <span className="font-medium capitalize">
                {subscription.items.data[0]?.price?.recurring?.interval || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-medium">
                ${(subscription.items.data[0]?.price?.unit_amount || 0) / 100} /{' '}
                {subscription.items.data[0]?.price?.recurring?.interval || 'period'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Next Billing Date</span>
              <span className="font-medium">
                {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
