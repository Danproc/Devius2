'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Trophy, Award, Medal } from 'lucide-react';

interface WinnerSelectorProps {
  hackathonId: string;
}

export function WinnerSelector({ hackathonId }: WinnerSelectorProps) {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [scores, setScores] = useState<Record<string, any>>({});
  const [firstPlace, setFirstPlace] = useState('');
  const [secondPlace, setSecondPlace] = useState('');
  const [thirdPlace, setThirdPlace] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/hackathons/${hackathonId}/judging`)
      .then(res => res.json())
      .then(async (data) => {
        const subs = data.submissions || [];
        setSubmissions(subs);

        // Fetch scores for all submissions
        if (subs.length > 0) {
          const scorePromises = subs.map((item: any) =>
            fetch(`/api/hackathons/submissions/${item.submission.id}/score`)
              .then(res => res.json())
              .then(data => ({ id: item.submission.id, score: data.score }))
          );

          const scoreResults = await Promise.all(scorePromises);
          const scoresMap: Record<string, any> = {};
          scoreResults.forEach(result => {
            if (result.score) {
              scoresMap[result.id] = result.score;
            }
          });
          setScores(scoresMap);
        }
      });
  }, [hackathonId]);

  const handleDeclareWinners = async () => {
    if (!firstPlace) {
      toast.error('Please select at least a 1st place winner');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/hackathons/${hackathonId}/declare-winners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hackathon_id: hackathonId,
          first_place_submission_id: firstPlace,
          second_place_submission_id: secondPlace && secondPlace !== 'none' ? secondPlace : undefined,
          third_place_submission_id: thirdPlace && thirdPlace !== 'none' ? thirdPlace : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to declare winners');
      }

      const result = await response.json();
      toast.success(`Winners declared! ${result.badges_created} badges awarded`);
      router.push('/admin/hackathons');
      router.refresh();
    } catch (error: any) {
      console.error('Error declaring winners:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-devcard-green/30 bg-devcard-base">
      <CardHeader>
        <CardTitle className="text-devcard-heading flex items-center gap-2">
          <Trophy className="h-5 w-5 text-devcard-green" />
          Declare Winners
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-devcard-heading flex items-center gap-2 mb-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              1st Place (Required)
            </Label>
            <Select value={firstPlace} onValueChange={setFirstPlace}>
              <SelectTrigger className="bg-devcard-base border-devcard-border text-devcard-heading">
                <SelectValue placeholder="Select winner..." />
              </SelectTrigger>
              <SelectContent>
                {submissions.map((item: any) => {
                  const score = scores[item.submission.id];
                  return (
                    <SelectItem key={item.submission.id} value={item.submission.id}>
                      {item.submission.project_title} ({item.submission.vote_count} votes{score ? `, ${score.total_score}/100` : ''})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-devcard-heading flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-gray-400" />
              2nd Place (Optional)
            </Label>
            <Select value={secondPlace} onValueChange={setSecondPlace}>
              <SelectTrigger className="bg-devcard-base border-devcard-border text-devcard-heading">
                <SelectValue placeholder="Select winner..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {submissions
                  .filter((item: any) => item.submission.id !== firstPlace)
                  .map((item: any) => {
                    const score = scores[item.submission.id];
                    return (
                      <SelectItem key={item.submission.id} value={item.submission.id}>
                        {item.submission.project_title} ({item.submission.vote_count} votes{score ? `, ${score.total_score}/100` : ''})
                      </SelectItem>
                    );
                  })}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-devcard-heading flex items-center gap-2 mb-2">
              <Medal className="h-4 w-4 text-amber-600" />
              3rd Place (Optional)
            </Label>
            <Select value={thirdPlace} onValueChange={setThirdPlace}>
              <SelectTrigger className="bg-devcard-base border-devcard-border text-devcard-heading">
                <SelectValue placeholder="Select winner..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {submissions
                  .filter((item: any) => item.submission.id !== firstPlace && item.submission.id !== secondPlace)
                  .map((item: any) => {
                    const score = scores[item.submission.id];
                    return (
                      <SelectItem key={item.submission.id} value={item.submission.id}>
                        {item.submission.project_title} ({item.submission.vote_count} votes{score ? `, ${score.total_score}/100` : ''})
                      </SelectItem>
                    );
                  })}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={handleDeclareWinners}
          disabled={loading || !firstPlace}
          className="w-full bg-devcard-green hover:bg-devcard-green/90 text-black font-medium rounded-full"
          size="lg"
        >
          {loading ? 'Declaring Winners...' : 'Declare Winners & Award Badges'}
        </Button>
      </CardContent>
    </Card>
  );
}
