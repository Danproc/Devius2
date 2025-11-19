'use client';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ConnectButton } from './connect-button';
import { MapPin, Globe, Github, Instagram, Crown, Twitter, Linkedin, Briefcase } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { ACHIEVEMENT_DEFINITIONS, RARITY_CONFIG, type AchievementType } from '@/db/schema/user-achievements';

interface ProfileSectionProps {
  displayName: string | null;
  githubUsername: string;
  avatarUrl: string;
  customBio?: string | null;
  location?: string | null;
  availabilityStatus?: 'open' | 'available' | 'not-available' | 'custom' | null;
  availabilityMessage?: string | null;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
    portfolio?: string;
    instagram?: string;
  } | null;
  techStack?: string[] | null;
  ranking?: number;
  isPremium?: boolean;
  targetUserId?: string;
  targetUsername?: string;
  achievements?: Array<{
    id: string;
    achievement_type: string;
    earned_at: Date | string;
    is_displayed: boolean;
  }>;
}

export function ProfileSection({
  displayName,
  githubUsername,
  avatarUrl,
  customBio,
  location,
  availabilityStatus,
  availabilityMessage,
  socialLinks,
  techStack,
  ranking,
  isPremium = false,
  targetUserId,
  targetUsername,
  achievements,
}: ProfileSectionProps) {
  const getAvailabilityBadge = () => {
    if (!availabilityStatus) return null;

    const statusConfig = {
      open: {
        label: 'Open to Work',
        className: 'bg-devcard-green/20 text-devcard-green border-devcard-green/30 font-medium'
      },
      available: {
        label: 'Available',
        className: 'bg-devcard-green/20 text-devcard-green border-devcard-green/30 font-medium'
      },
      'not-available': {
        label: 'Not Available',
        className: 'bg-muted text-muted-foreground border-border'
      },
      custom: {
        label: availabilityMessage || 'Custom Status',
        className: 'bg-muted/50 text-foreground border-border'
      },
    };

    const config = statusConfig[availabilityStatus];
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const initials = (displayName || githubUsername || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative flex flex-col items-center gap-6 text-center">
      {/* Premium Badge - top right (T115) */}
      {isPremium && (
        <div className="absolute -top-2 right-0">
          <Badge className="bg-yellow-500 text-black hover:bg-yellow-600 font-semibold px-4 py-1.5 text-sm flex items-center gap-1">
            <Crown className="h-3 w-3" />
            Premium
          </Badge>
        </div>
      )}

      {/* Avatar - clean circular, NO green ring */}
      <div className="relative mt-4">
        <Avatar className="size-32 md:size-40">
          <AvatarImage src={avatarUrl} alt={displayName || githubUsername} />
          <AvatarFallback className="text-3xl md:text-4xl bg-devcard-green/10 text-devcard-green">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Name with Member ID Badge - Superscript Pill Style */}
      <div className="relative inline-block">
        <h1 className="text-4xl font-medium text-devcard-heading pr-12">
          {displayName || githubUsername}
        </h1>
        <Badge
          variant="secondary"
          className="absolute -top-1 -right-0 bg-devcard-green/10 text-devcard-green border-devcard-green/30 font-bold text-xs px-2 py-0.5 shadow-sm"
        >
          #{ranking ?? 1}
        </Badge>
      </div>

      {/* Bio */}
      {customBio && (
        <p className="text-devcard-text max-w-md leading-relaxed text-base px-4">
          {customBio}
        </p>
      )}

      {/* Availability Status Badge */}
      {getAvailabilityBadge()}

      {/* Achievement Icons with Tooltips */}
      {achievements && achievements.filter(a => a.is_displayed).length > 0 && (
        <TooltipProvider>
          <div className="flex flex-wrap items-center justify-center gap-1">
            {achievements
              .filter(a => a.is_displayed)
              .slice(0, 10) // Show max 10 badges
              .map((achievement) => {
                const definition = ACHIEVEMENT_DEFINITIONS[achievement.achievement_type as AchievementType];
                const rarityConfig = RARITY_CONFIG[definition.rarity];

                // Get Lucide icon component
                const IconComponent = (LucideIcons as any)[definition.icon] || LucideIcons.Award;

                return (
                  <Tooltip key={achievement.id}>
                    <TooltipTrigger asChild>
                      <div className={`w-6 h-6 rounded-full border ${rarityConfig.borderColor} bg-devcard-base/50 backdrop-blur-sm flex items-center justify-center cursor-help hover:scale-110 hover:bg-devcard-base transition-all`}>
                        <IconComponent className={`h-3 w-3 ${rarityConfig.textColor}`} strokeWidth={1.5} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-devcard-base border-devcard-border max-w-xs">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-devcard-heading">{definition.name}</p>
                          <Badge className={`${rarityConfig.color} text-xs capitalize`}>
                            {definition.rarity}
                          </Badge>
                        </div>
                        <p className="text-xs text-devcard-text">{definition.description}</p>
                        <p className="text-xs text-devcard-text/70 pt-1">
                          Earned {new Date(achievement.earned_at).toLocaleDateString()}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
          </div>
        </TooltipProvider>
      )}

      {/* Connect Button */}
      {targetUserId && targetUsername && (
        <div className="w-full max-w-sm mx-auto">
          <ConnectButton
            targetUserId={targetUserId}
            targetUsername={targetUsername}
            className="w-full bg-devcard-green hover:bg-devcard-green/90 text-black font-medium py-4 rounded-xl shadow-lg shadow-devcard-green/20 transition-all hover:shadow-xl hover:shadow-devcard-green/30"
          />
        </div>
      )}

      {/* All Links in One Inline List */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-devcard-text">
        {/* Location */}
        {location && (
          <div className="flex items-center gap-1.5 hover:text-devcard-green transition-colors">
            <MapPin className="size-4" />
            <span>{location}</span>
          </div>
        )}

        {/* GitHub */}
        <a
          href={`https://github.com/${githubUsername}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:text-devcard-green transition-colors"
        >
          <Github className="size-4" />
          <span>@{githubUsername}</span>
        </a>

        {/* Twitter */}
        {socialLinks?.twitter && (
          <a
            href={socialLinks.twitter.startsWith('http') ? socialLinks.twitter : `https://twitter.com/${socialLinks.twitter}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-devcard-green transition-colors"
          >
            <Twitter className="size-4" />
            <span>Twitter</span>
          </a>
        )}

        {/* LinkedIn */}
        {socialLinks?.linkedin && (
          <a
            href={socialLinks.linkedin.startsWith('http') ? socialLinks.linkedin : `https://linkedin.com/in/${socialLinks.linkedin}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-devcard-green transition-colors"
          >
            <Linkedin className="size-4" />
            <span>LinkedIn</span>
          </a>
        )}

        {/* Instagram */}
        {socialLinks?.instagram && (
          <a
            href={`https://instagram.com/${socialLinks.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-devcard-green transition-colors"
          >
            <Instagram className="size-4" />
            <span>Instagram</span>
          </a>
        )}

        {/* Website */}
        {socialLinks?.website && (
          <a
            href={socialLinks.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-devcard-green transition-colors"
          >
            <Globe className="size-4" />
            <span>{socialLinks.website.replace(/^https?:\/\//, '')}</span>
          </a>
        )}

        {/* Portfolio */}
        {socialLinks?.portfolio && (
          <a
            href={socialLinks.portfolio}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-devcard-green transition-colors"
          >
            <Briefcase className="size-4" />
            <span>Portfolio</span>
          </a>
        )}
      </div>

      {/* Tech Stack */}
      {techStack && techStack.length > 0 && (
        <div className="w-full">
          <h3 className="text-sm font-medium text-devcard-heading mb-3">Tech Stack</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {techStack.map((tech) => (
              <Badge
                key={tech}
                variant="secondary"
                className="bg-devcard-green/10 text-devcard-green border-devcard-green/20 hover:bg-devcard-green/20 transition-colors"
              >
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
