/**
 * Upgrade Prompt Component
 * T117: Add "Upgrade to Premium" prompts in theme settings, domain settings, and analytics pages
 */

'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Sparkles, Lock } from 'lucide-react';
import Link from 'next/link';

interface UpgradePromptProps {
  feature: string;
  description: string;
  benefits?: string[];
  inline?: boolean;
  className?: string;
}

export function UpgradePrompt({
  feature,
  description,
  benefits,
  inline = false,
  className = '',
}: UpgradePromptProps) {
  if (inline) {
    return (
      <div className={`flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg ${className}`}>
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <Crown className="h-5 w-5 text-yellow-500" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-sm">Premium Feature</h4>
              <Badge variant="secondary" className="bg-yellow-500 text-black hover:bg-yellow-600">
                Pro
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <Link href="/billing/plans">
          <Button size="sm" className="ml-4">
            <Crown className="h-4 w-4 mr-2" />
            Upgrade
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <Card className={`border-yellow-200 dark:border-yellow-900 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-yellow-500" />
            <CardTitle>{feature} - Premium Feature</CardTitle>
          </div>
          <Badge className="bg-yellow-500 text-black hover:bg-yellow-600">
            <Crown className="h-3 w-3 mr-1" />
            Premium
          </Badge>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      {benefits && benefits.length > 0 && (
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm font-medium mb-3">What you'll get:</p>
            <ul className="space-y-2">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      )}

      <CardFooter>
        <Link href="/billing/plans" className="w-full">
          <Button size="lg" className="w-full">
            <Crown className="h-4 w-4 mr-2" />
            Upgrade to Premium
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

export function ThemeUpgradePrompt() {
  return (
    <UpgradePrompt
      feature="Custom Themes"
      description="Customize your DevCard with unique colors, fonts, and styling to match your personal brand."
      benefits={[
        'Unlimited custom color schemes',
        'Custom font selection',
        'Advanced styling options',
        'Dark and light theme variants',
        'Export and import themes',
      ]}
    />
  );
}

export function DomainUpgradePrompt() {
  return (
    <UpgradePrompt
      feature="Custom Domain"
      description="Use your own custom domain for your DevCard and build your professional brand."
      benefits={[
        'Use your own domain (e.g., card.yourdomain.com)',
        'Professional branding',
        'SSL certificate included',
        'Easy DNS setup guidance',
        'Multiple domain support',
      ]}
    />
  );
}

export function AnalyticsUpgradePrompt() {
  return (
    <UpgradePrompt
      feature="Advanced Analytics"
      description="Get deeper insights into your DevCard performance with premium analytics features."
      benefits={[
        'City-level geographic data',
        'Full referrer source tracking',
        'Export analytics data',
        'Extended data retention (1 year)',
        'Real-time visitor tracking',
        'Custom date ranges',
      ]}
    />
  );
}

export function OrganizationUpgradePrompt() {
  return (
    <UpgradePrompt
      feature="Organization Profiles"
      description="Create and manage organization profiles to showcase your team's work."
      benefits={[
        'Team member management',
        'Organization-wide analytics',
        'Branded organization page',
        'Member access controls',
        'Shared repositories showcase',
      ]}
    />
  );
}
