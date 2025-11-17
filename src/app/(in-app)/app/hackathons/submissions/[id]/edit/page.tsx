/**
 * Hackathon Submission Edit Page
 * Allows users to edit their existing submission
 */

import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { db } from '@/db';
import { hackathon_submissions } from '@/db/schema/hackathon-submissions';
import { hackathons } from '@/db/schema/hackathons';
import { eq } from 'drizzle-orm';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { SubmissionForm } from '@/components/hackathons/SubmissionForm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function EditSubmissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const { id: submissionId } = await params;

  // Get submission
  const [submission] = await db
    .select()
    .from(hackathon_submissions)
    .where(eq(hackathon_submissions.id, submissionId));

  if (!submission) {
    redirect('/app/hackathons');
  }

  // Check ownership
  if (submission.user_id !== session.user.id) {
    redirect('/app/hackathons');
  }

  // Get hackathon
  const [hackathon] = await db
    .select()
    .from(hackathons)
    .where(eq(hackathons.id, submission.hackathon_id));

  if (!hackathon) {
    redirect('/app/hackathons');
  }

  // Check if submission can be edited
  const canEdit =
    submission.status !== 'disqualified' &&
    submission.status !== 'winner_first' &&
    submission.status !== 'winner_second' &&
    submission.status !== 'winner_third';

  if (!canEdit) {
    return (
      <div className="min-h-screen bg-devcard-base">
        <div className="container mx-auto py-8 max-w-4xl">
          <Alert className="border-red-500/30 bg-red-500/10">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-500">
              This submission cannot be edited (status: {submission.status}).
            </AlertDescription>
          </Alert>
          <div className="mt-6">
            <Button asChild variant="outline" className="border-devcard-border">
              <Link href={`/app/hackathons/${hackathon.slug}`}>Back to Hackathon</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Check deadline
  const deadline = new Date(hackathon.submission_deadline_at);
  const now = new Date();
  if (now > deadline) {
    return (
      <div className="min-h-screen bg-devcard-base">
        <div className="container mx-auto py-8 max-w-4xl">
          <Alert className="border-red-500/30 bg-red-500/10">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-500">
              The submission deadline has passed. You can no longer edit your submission.
            </AlertDescription>
          </Alert>
          <div className="mt-6">
            <Button asChild variant="outline" className="border-devcard-border">
              <Link href={`/app/hackathons/${hackathon.slug}`}>Back to Hackathon</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const prizes = hackathon.prizes as { first: number; second: number; third: number };

  const statusBadgeColor = {
    draft: 'bg-gray-500',
    submitted: 'bg-devcard-green',
  }[submission.status as 'draft' | 'submitted'] || 'bg-gray-500';

  return (
    <div className="min-h-screen bg-devcard-base">
      <div className="container mx-auto py-8 max-w-4xl">
        {/* Hackathon Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-devcard-heading">{hackathon.title}</h1>
            <Badge className={statusBadgeColor}>
              {submission.status === 'draft' ? 'Draft' : 'Submitted'}
            </Badge>
          </div>
          {hackathon.theme && (
            <p className="text-lg text-devcard-green font-medium">{hackathon.theme}</p>
          )}
        </div>

        {/* Info Card */}
        <Card className="border-devcard-border bg-devcard-base mb-6">
          <CardHeader>
            <CardTitle className="text-devcard-heading">Edit Your Submission</CardTitle>
            <CardDescription className="text-devcard-text">
              Update your project details below. Changes will be saved immediately.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <span className="text-devcard-text">Deadline:</span>{' '}
                <span className="text-devcard-heading font-semibold">
                  {deadline.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-devcard-text">Prize Pool:</span>{' '}
                <span className="text-devcard-green font-semibold">
                  ${prizes.first + prizes.second + prizes.third}
                </span>
              </div>
            </div>

            {submission.status === 'draft' && (
              <Alert className="border-yellow-500/30 bg-yellow-500/5">
                <AlertDescription className="text-yellow-600 text-sm">
                  Your submission is currently a draft. Make sure to submit it before the deadline to be eligible for the competition.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Submission Form */}
        <Card className="border-devcard-border bg-devcard-base">
          <CardContent className="pt-6">
            <SubmissionForm
              hackathonId={hackathon.id}
              existingSubmission={submission}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
