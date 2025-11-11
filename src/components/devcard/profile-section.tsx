import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MapPin, Globe, Linkedin, Twitter } from 'lucide-react';

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
  } | null;
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
    <div className="flex flex-col items-center gap-4 text-center">
      {/* Avatar - clean circular, NO green ring */}
      <div className="relative">
        <Avatar className="size-32 md:size-40">
          <AvatarImage src={avatarUrl} alt={displayName || githubUsername} />
          <AvatarFallback className="text-3xl md:text-4xl bg-devcard-green/10 text-devcard-green">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Name and Username */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#dde3ed]">
          {displayName || githubUsername}
        </h1>
        {displayName && (
          <a
            href={`https://github.com/${githubUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#5b6a7f] hover:text-devcard-green transition-colors text-base font-mono"
          >
            @{githubUsername}
          </a>
        )}
      </div>

      {/* Availability Badge */}
      {availabilityStatus && (
        <div className="flex justify-center">{getAvailabilityBadge()}</div>
      )}

      {/* Bio */}
      {customBio && (
        <p className="text-[#5b6a7f] max-w-md leading-relaxed text-base">
          {customBio}
        </p>
      )}

      {/* Location and Social Links */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-[#5b6a7f]">
        {location && (
          <div className="flex items-center gap-1.5 hover:text-devcard-green transition-colors">
            <MapPin className="size-4" />
            <span>{location}</span>
          </div>
        )}

        {socialLinks?.website && (
          <a
            href={socialLinks.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-devcard-green transition-colors"
          >
            <Globe className="size-4" />
            <span>Website</span>
          </a>
        )}

        {socialLinks?.portfolio && (
          <a
            href={socialLinks.portfolio}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-devcard-green transition-colors"
          >
            <Globe className="size-4" />
            <span>Portfolio</span>
          </a>
        )}

        {socialLinks?.twitter && (
          <a
            href={`https://twitter.com/${socialLinks.twitter}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-devcard-green transition-colors"
          >
            <Twitter className="size-4" />
            <span>Twitter</span>
          </a>
        )}

        {socialLinks?.linkedin && (
          <a
            href={socialLinks.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-devcard-green transition-colors"
          >
            <Linkedin className="size-4" />
            <span>LinkedIn</span>
          </a>
        )}
      </div>
    </div>
  );
}
