import { Badge } from '@/components/ui/badge';
import { MemberSummary } from '@/lib/members/types';
import Link from 'next/link';
import { MapPin, Trophy } from 'lucide-react';
import { memo } from 'react';

interface MemberListItemProps {
  member: MemberSummary;
}

function MemberListItemComponent({ member }: MemberListItemProps) {
  const displayName = member.display_name || member.github_username;

  return (
    <Link href={`/${member.url_slug}`}>
      <div className="flex items-center gap-4 p-4 border-b hover:bg-accent/50 transition-colors cursor-pointer">
        {/* Avatar (T029: graceful fallback) */}
        <img
          src={member.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`}
          alt={displayName}
          className="w-12 h-12 rounded-full flex-shrink-0"
          onError={(e) => {
            e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`;
          }}
        />

        {/* Name and username */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <h3 className="font-semibold truncate">{displayName}</h3>
            <span className="text-sm text-muted-foreground">@{member.github_username}</span>
          </div>

          {/* Location and bio on second line */}
          <div className="flex items-center gap-3 mt-1">
            {member.location && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span className="truncate max-w-[200px]">{member.location}</span>
              </div>
            )}
            {member.custom_bio && (
              <p className="text-xs text-muted-foreground truncate flex-1">
                {member.custom_bio.slice(0, 100)}
              </p>
            )}
          </div>
        </div>

        {/* Tech stack badges (mini) */}
        {member.tech_stack && member.tech_stack.length > 0 && (
          <div className="hidden md:flex gap-1 flex-wrap max-w-[300px]">
            {member.tech_stack.slice(0, 3).map((tech) => (
              <Badge key={tech} variant="secondary" className="text-xs px-2 py-0">
                {tech}
              </Badge>
            ))}
            {member.tech_stack.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{member.tech_stack.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Achievement count and badges */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {member.achievement_count > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Trophy className="w-3 h-3" />
              <span>{member.achievement_count}</span>
            </div>
          )}

          {member.hackathon_badges.length > 0 && (
            <div className="flex gap-0.5">
              {member.hackathon_badges.slice(0, 3).map((badge, idx) => (
                <span key={idx} className="text-sm">
                  {badge.badge_type === 'gold' && '🥇'}
                  {badge.badge_type === 'silver' && '🥈'}
                  {badge.badge_type === 'bronze' && '🥉'}
                </span>
              ))}
            </div>
          )}

          {/* Member number */}
          <span className="text-xs text-muted-foreground font-mono">
            #{member.member_number}
          </span>
        </div>
      </div>
    </Link>
  );
}

// T032: Performance optimization with React.memo
export const MemberListItem = memo(MemberListItemComponent);
