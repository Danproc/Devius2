import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MemberSummary } from '@/lib/members/types';
import Link from 'next/link';
import { MapPin, Trophy } from 'lucide-react';
import { memo } from 'react';

interface MemberCardProps {
  member: MemberSummary;
}

function MemberCardComponent({ member }: MemberCardProps) {
  // Display name priority: display_name > github_username
  const displayName = member.display_name || member.github_username;

  // Truncate bio to 150 characters
  const bioSnippet = member.custom_bio
    ? member.custom_bio.slice(0, 150) + (member.custom_bio.length > 150 ? '...' : '')
    : null;

  // Tech stack badges (max 5, then "+ N more")
  const displayedTechStack = member.tech_stack?.slice(0, 5) || [];
  const remainingTechCount = (member.tech_stack?.length || 0) - 5;

  return (
    <Link href={`/${member.url_slug}`} className="block">
      <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer h-full">
        <div className="flex items-start gap-3 mb-3">
          {/* Avatar (T029: graceful fallback) */}
          <img
            src={member.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`}
            alt={displayName}
            className="w-16 h-16 rounded-full flex-shrink-0"
            onError={(e) => {
              e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`;
            }}
          />

          {/* Name and username */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{displayName}</h3>
            <p className="text-sm text-muted-foreground truncate">@{member.github_username}</p>

            {/* Location */}
            {member.location && (
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{member.location}</span>
              </div>
            )}
          </div>

          {/* Member number */}
          <div className="text-xs text-muted-foreground font-mono flex-shrink-0">
            #{member.member_number}
          </div>
        </div>

        {/* Bio */}
        {bioSnippet && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {bioSnippet}
          </p>
        )}

        {/* Tech stack */}
        {displayedTechStack.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {displayedTechStack.map((tech) => (
              <Badge key={tech} variant="secondary" className="text-xs">
                {tech}
              </Badge>
            ))}
            {remainingTechCount > 0 && (
              <Badge variant="outline" className="text-xs">
                +{remainingTechCount} more
              </Badge>
            )}
          </div>
        )}

        {/* Achievements and hackathon badges */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {/* Achievement count */}
          {member.achievement_count > 0 && (
            <div className="flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              <span>{member.achievement_count} achievement{member.achievement_count !== 1 ? 's' : ''}</span>
            </div>
          )}

          {/* Hackathon badges */}
          {member.hackathon_badges.length > 0 && (
            <div className="flex gap-1">
              {member.hackathon_badges.slice(0, 3).map((badge, idx) => (
                <span
                  key={idx}
                  className="text-base"
                  title={`${badge.badge_type} - ${badge.hackathon_name}`}
                >
                  {badge.badge_type === 'gold' && '🥇'}
                  {badge.badge_type === 'silver' && '🥈'}
                  {badge.badge_type === 'bronze' && '🥉'}
                </span>
              ))}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}

// T032: Performance optimization with React.memo
export const MemberCard = memo(MemberCardComponent);
