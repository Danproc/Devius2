import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ACHIEVEMENT_DEFINITIONS, RARITY_CONFIG, type AchievementType } from '@/db/schema/user-achievements';
import { Calendar } from 'lucide-react';

interface AchievementBadgeProps {
  achievement: {
    achievement_type: AchievementType;
    earned_at: Date | string;
    metadata?: string | null;
  };
  size?: 'sm' | 'md' | 'lg';
}

export function AchievementBadge({ achievement, size = 'md' }: AchievementBadgeProps) {
  const definition = ACHIEVEMENT_DEFINITIONS[achievement.achievement_type];
  const rarityConfig = RARITY_CONFIG[definition.rarity];

  const sizeClasses = {
    sm: 'text-base',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <Card className={`border-devcard-border bg-devcard-base ${rarityConfig.borderColor} hover:scale-105 transition-transform`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1">
            <div className={`${sizeClasses[size]} mb-2`}>{definition.icon}</div>
            <CardTitle className="text-devcard-heading text-lg">
              {definition.name}
            </CardTitle>
            <CardDescription className="text-devcard-text text-sm mt-1">
              {definition.description}
            </CardDescription>
          </div>
          <Badge className={`${rarityConfig.color} capitalize flex-shrink-0`}>
            {definition.rarity}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-devcard-text mt-2 pt-2 border-t border-devcard-border">
          <Calendar className="h-3 w-3" />
          <span>Earned {new Date(achievement.earned_at).toLocaleDateString()}</span>
        </div>
      </CardHeader>
    </Card>
  );
}
