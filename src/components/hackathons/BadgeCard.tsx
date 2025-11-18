import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Calendar } from 'lucide-react';

interface BadgeCardProps {
  badge: {
    id: string;
    placement: number;
    awarded_at: Date | string;
  };
  hackathon: {
    id: string;
    title: string;
    slug: string;
    theme: string | null;
  };
}

export function BadgeCard({ badge, hackathon }: BadgeCardProps) {
  const placementConfig = {
    1: {
      label: '1st Place',
      icon: '🥇',
      color: 'bg-yellow-500 text-black',
      borderColor: 'border-yellow-500/50',
    },
    2: {
      label: '2nd Place',
      icon: '🥈',
      color: 'bg-gray-400 text-black',
      borderColor: 'border-gray-400/50',
    },
    3: {
      label: '3rd Place',
      icon: '🥉',
      color: 'bg-orange-600 text-white',
      borderColor: 'border-orange-600/50',
    },
  };

  const config = placementConfig[badge.placement as 1 | 2 | 3];

  return (
    <Link href={`/gallery/hackathons/${hackathon.slug}`}>
      <Card className={`border-devcard-border bg-devcard-base hover:border-devcard-green transition-colors cursor-pointer ${config?.borderColor || ''}`}>
        <CardHeader>
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <CardTitle className="text-devcard-heading text-lg line-clamp-1 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-devcard-green flex-shrink-0" />
                {hackathon.title}
              </CardTitle>
              {hackathon.theme && (
                <CardDescription className="text-devcard-text text-sm mt-1 line-clamp-1">
                  {hackathon.theme}
                </CardDescription>
              )}
            </div>
            {config && (
              <Badge className={`${config.color} flex-shrink-0`}>
                {config.icon} {config.label}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-devcard-text mt-2">
            <Calendar className="h-3 w-3" />
            <span>
              Awarded {new Date(badge.awarded_at).toLocaleDateString()}
            </span>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}
