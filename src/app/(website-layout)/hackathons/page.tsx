/**
 * Public Hackathons Browse Page
 * Marketing page showing active and past hackathons (no auth required)
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, Users, Gem, ArrowRight, Calendar, DollarSign } from 'lucide-react';
import { db } from '@/db';
import { hackathons } from '@/db/schema/hackathons';
import { inArray, eq } from 'drizzle-orm';

export const revalidate = 600; // Revalidate every 10 minutes

export default async function PublicHackathonsPage() {
  // Fetch active hackathons (including upcoming)
  const activeHackathons = await db
    .select()
    .from(hackathons)
    .where(inArray(hackathons.status, ['upcoming', 'registration', 'active', 'voting']))
    .orderBy(hackathons.start_at);

  // Fetch past hackathons
  const pastHackathons = await db
    .select()
    .from(hackathons)
    .where(eq(hackathons.status, 'completed'))
    .orderBy(hackathons.start_at);

  return (
    <div className="min-h-screen bg-devcard-base">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="mb-6 inline-block">
            <Trophy className="h-16 w-16 text-devcard-green mx-auto mb-4" />
          </div>
          <h1 className="text-5xl font-bold text-devcard-heading mb-6">
            StackPass Hackathons
          </h1>
          <p className="text-xl text-devcard-text mb-4 max-w-3xl mx-auto">
            Compete with developers worldwide. Build, Ship, Win.
          </p>
          <p className="text-lg text-devcard-text/80 mb-8 max-w-2xl mx-auto">
            Join elite developers in competitive coding challenges. Win cash prizes,
            earn exclusive badges, and showcase your skills on your profile.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-devcard-green hover:bg-devcard-green/90 text-black font-semibold rounded-full px-8"
          >
            <a href="#active-hackathons">
              Browse Active Hackathons
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
        </div>
      </section>

      {/* Active Hackathons Section */}
      <section id="active-hackathons" className="py-16 px-4 bg-devcard-base/50">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-devcard-heading mb-2">Active Hackathons</h2>
            <p className="text-devcard-text">Join now and start competing</p>
          </div>

          {activeHackathons.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeHackathons.map((hackathon) => {
                const prizes = hackathon.prizes as { first: number; second: number; third: number };
                const totalPrize = prizes.first + prizes.second + prizes.third;

                return (
                  <Card key={hackathon.id} className="border-devcard-border bg-devcard-base hover:border-devcard-green/50 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-devcard-heading text-lg">{hackathon.title}</CardTitle>
                        <Badge className="bg-devcard-green text-black">{hackathon.status}</Badge>
                      </div>
                      {hackathon.theme && (
                        <CardDescription className="text-devcard-green text-sm">{hackathon.theme}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-devcard-text">
                        <DollarSign className="h-4 w-4 text-devcard-green" />
                        <span className="font-semibold text-devcard-green">${totalPrize}</span>
                        <span>prize pool</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-devcard-text">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(hackathon.start_at).toLocaleDateString()}</span>
                      </div>
                      <Button asChild className="w-full bg-devcard-green hover:bg-devcard-green/90 text-black">
                        <Link href={`/hackathons/${hackathon.slug}`}>
                          View Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border-devcard-border bg-devcard-base">
              <CardContent className="py-12 text-center">
                <Trophy className="h-12 w-12 text-devcard-text/30 mx-auto mb-4" />
                <p className="text-devcard-text">No active hackathons right now. Check back soon!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-devcard-heading mb-12 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-devcard-green/10 border-2 border-devcard-green flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-devcard-green" />
              </div>
              <h3 className="text-xl font-semibold text-devcard-heading mb-2">1. Register</h3>
              <p className="text-devcard-text">Join during registration period. Form a team or go solo.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-devcard-green/10 border-2 border-devcard-green flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-devcard-green" />
              </div>
              <h3 className="text-xl font-semibold text-devcard-heading mb-2">2. Build</h3>
              <p className="text-devcard-text">Create your project. Submit GitHub repo + demo.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-devcard-green/10 border-2 border-devcard-green flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-devcard-green" />
              </div>
              <h3 className="text-xl font-semibold text-devcard-heading mb-2">3. Vote & Win</h3>
              <p className="text-devcard-text">Community votes. Top 3 win prizes + badges.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Past Hackathons */}
      {pastHackathons.length > 0 && (
        <section className="py-16 px-4 bg-devcard-base/50">
          <div className="container mx-auto max-w-6xl">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-devcard-heading mb-2">Past Hackathons</h2>
              <p className="text-devcard-text">Explore winning projects from previous competitions</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastHackathons.map((hackathon) => {
                const prizes = hackathon.prizes as { first: number; second: number; third: number };

                return (
                  <Card key={hackathon.id} className="border-devcard-border bg-devcard-base">
                    <CardHeader>
                      <CardTitle className="text-devcard-heading text-lg">{hackathon.title}</CardTitle>
                      {hackathon.theme && (
                        <CardDescription className="text-devcard-text text-sm">{hackathon.theme}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-devcard-text">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span>Winners announced</span>
                      </div>
                      <Button asChild variant="outline" className="w-full border-devcard-border">
                        <Link href={`/hackathons/${hackathon.slug}`}>
                          View Winners
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Benefits */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-devcard-heading mb-12 text-center">Why Join StackPass Hackathons?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-lg bg-devcard-green/10 flex items-center justify-center flex-shrink-0">
                <DollarSign className="h-6 w-6 text-devcard-green" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-devcard-heading mb-1">Cash Prizes</h3>
                <p className="text-devcard-text">Win up to $500 per competition. Top 3 winners share the prize pool.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-lg bg-devcard-green/10 flex items-center justify-center flex-shrink-0">
                <Trophy className="h-6 w-6 text-devcard-green" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-devcard-heading mb-1">Exclusive Badges</h3>
                <p className="text-devcard-text">Showcase your wins with placement badges on your StackPass profile.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-lg bg-devcard-green/10 flex items-center justify-center flex-shrink-0">
                <Target className="h-6 w-6 text-devcard-green" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-devcard-heading mb-1">Build Portfolio</h3>
                <p className="text-devcard-text">Add winning projects to your profile. Impress recruiters and clients.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-lg bg-devcard-green/10 flex items-center justify-center flex-shrink-0">
                <Users className="h-6 w-6 text-devcard-green" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-devcard-heading mb-1">Network</h3>
                <p className="text-devcard-text">Team up with developers. Build connections that last.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-devcard-base/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-devcard-heading mb-4">Ready to Compete?</h2>
          <p className="text-devcard-text mb-12">Hackathons are exclusive to Pro members</p>

          <Card className="border-devcard-green/30 bg-devcard-base max-w-md mx-auto">
            <CardHeader>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Gem className="h-6 w-6 text-devcard-green" />
                <CardTitle className="text-2xl text-devcard-heading">StackPass Pro</CardTitle>
              </div>
              <div className="text-4xl font-bold text-devcard-green">$49<span className="text-xl text-devcard-text">/year</span></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-left">
                <div className="flex items-center gap-2 text-devcard-text">
                  <div className="w-5 h-5 rounded-full bg-devcard-green/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-devcard-green" />
                  </div>
                  <span>Join unlimited hackathons</span>
                </div>
                <div className="flex items-center gap-2 text-devcard-text">
                  <div className="w-5 h-5 rounded-full bg-devcard-green/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-devcard-green" />
                  </div>
                  <span>Form and join teams</span>
                </div>
                <div className="flex items-center gap-2 text-devcard-text">
                  <div className="w-5 h-5 rounded-full bg-devcard-green/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-devcard-green" />
                  </div>
                  <span>Vote on submissions</span>
                </div>
                <div className="flex items-center gap-2 text-devcard-text">
                  <div className="w-5 h-5 rounded-full bg-devcard-green/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-devcard-green" />
                  </div>
                  <span>Earn exclusive winner badges</span>
                </div>
                <div className="flex items-center gap-2 text-devcard-text">
                  <div className="w-5 h-5 rounded-full bg-devcard-green/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-devcard-green" />
                  </div>
                  <span>Advanced profile customization</span>
                </div>
              </div>

              <Button
                asChild
                size="lg"
                className="w-full bg-devcard-green hover:bg-devcard-green/90 text-black font-semibold rounded-full"
              >
                <Link href="/sign-up">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <p className="text-xs text-devcard-text">
                Or{' '}
                <Link href="/sign-in" className="text-devcard-green hover:underline">
                  sign in
                </Link>
                {' '}if you already have an account
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
