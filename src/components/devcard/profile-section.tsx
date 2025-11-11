import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Globe, Github, Instagram, Crown } from 'lucide-react';

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
  ranking?: number;
  isPremium?: boolean;
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
  ranking,
  isPremium = false,
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

  const initials = (displayName || githubUsername)
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

      {/* Name with Member ID Badge */}
      <div className="flex items-center justify-center gap-3">
        <h1 className="text-4xl font-medium text-[#dde3ed]">
          {displayName || githubUsername}
        </h1>
        <span className="text-2xl font-medium text-[#5b6a7f]">
          #{ranking || 1}
        </span>
      </div>

      {/* Bio */}
      {customBio && (
        <p className="text-[#5b6a7f] max-w-md leading-relaxed text-base px-4">
          {customBio}
        </p>
      )}

      {/* Location and Social Links - Two Rows */}
      <div className="flex flex-col gap-2">
        {/* First Row: Location, GitHub, Instagram */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-[#5b6a7f]">
          {location && (
            <div className="flex items-center gap-1.5 hover:text-devcard-green transition-colors">
              <MapPin className="size-4" />
              <span>{location}</span>
            </div>
          )}

          <a
            href={`https://github.com/${githubUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-devcard-green transition-colors"
          >
            <Github className="size-4" />
            <span>@{githubUsername}</span>
          </a>

          {socialLinks?.instagram && (
            <a
              href={`https://instagram.com/${socialLinks.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-devcard-green transition-colors"
            >
              <Instagram className="size-4" />
              <span>@{socialLinks.instagram}</span>
            </a>
          )}
        </div>

        {/* Second Row: Website */}
        {socialLinks?.website && (
          <div className="flex items-center justify-center gap-1.5 text-sm text-[#5b6a7f] hover:text-devcard-green transition-colors">
            <Globe className="size-4" />
            <a
              href={socialLinks.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              {socialLinks.website.replace(/^https?:\/\//, '')}
            </a>
          </div>
        )}
      </div>

      {/* Connect Button */}
      <Button
        className="w-full bg-[#1cf491] hover:bg-[#19e085] text-[#04080f] font-semibold text-base py-6 rounded-full"
        size="lg"
      >
        Connect with {displayName?.split(' ')[0] || githubUsername}
      </Button>
    </div>
  );
}
