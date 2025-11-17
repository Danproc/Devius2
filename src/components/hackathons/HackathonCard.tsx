import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, Users, ArrowRight } from 'lucide-react';
import type { Hackathon } from '@/types/hackathons';

interface HackathonCardProps {
  hackathon: Hackathon;
}

export function HackathonCard({ hackathon }: HackathonCardProps) {
  const prizes = hackathon.prizes as { first: number; second: number; third: number };
  const totalPrize = prizes.first + prizes.second + prizes.third;
  const deadline = new Date(hackathon.submission_deadline_at);
  const now = new Date();
  const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const statusColor = {
    upcoming: 'bg-blue-500',
    active: 'bg-devcard-green',
    voting: 'bg-yellow-500',
    completed: 'bg-purple-500',
  }[hackathon.status] || 'bg-gray-500';

  return (
    <Card className="border-devcard-border bg-devcard-base hover:border-devcard-green/50 transition-all">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-devcard-heading">{hackathon.title}</CardTitle>
            <CardDescription className="text-devcard-text mt-1">
              {hackathon.theme}
            </CardDescription>
          </div>
          <Badge className={statusColor}>
            {hackathon.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-devcard-text line-clamp-3">
          {hackathon.description}
        </p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-devcard-green" />
            <div>
              <div className="text-devcard-text text-xs">Deadline</div>
              <div className="text-devcard-heading font-medium">
                {deadline.toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-devcard-green" />
            <div>
              <div className="text-devcard-text text-xs">Prize Pool</div>
              <div className="text-devcard-heading font-medium">
                ${totalPrize.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {daysRemaining > 0 && hackathon.status === 'active' && (
          <div className="text-center py-2 bg-devcard-green/10 border border-devcard-green/30 rounded">
            <div className="text-2xl font-bold text-devcard-green">{daysRemaining}</div>
            <div className="text-xs text-devcard-text">days remaining</div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button
          asChild
          className="w-full bg-devcard-green hover:bg-devcard-green/90 text-black font-medium rounded-full"
        >
          <Link href={`/hackathons/${hackathon.id}`}>
            View Details
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
