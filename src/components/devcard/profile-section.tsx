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
      open: { label: 'Open to Work', variant: 'default' as const },
      available: { label: 'Available', variant: 'default' as const },
      'not-available': { label: 'Not Available', variant: 'secondary' as const },
      custom: {
        label: availabilityMessage || 'Custom Status',
        variant: 'outline' as const,
      },
    };

    const config = statusConfig[availabilityStatus];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const initials = (displayName || githubUsername)
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      {/* Avatar */}
      <Avatar className="size-24 border-2 border-border">
        <AvatarImage src={avatarUrl} alt={displayName || githubUsername} />
        <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
      </Avatar>

      {/* Name and Username */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">
          {displayName || githubUsername}
        </h1>
        {displayName && (
          <a
            href={`https://github.com/${githubUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors text-sm"
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
        <p className="text-muted-foreground max-w-md leading-relaxed">
          {customBio}
        </p>
      )}

      {/* Location and Social Links */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
        {location && (
          <div className="flex items-center gap-1.5">
            <MapPin className="size-4" />
            <span>{location}</span>
          </div>
        )}

        {socialLinks?.website && (
          <a
            href={socialLinks.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
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
            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
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
            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
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
            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <Linkedin className="size-4" />
            <span>LinkedIn</span>
          </a>
        )}
      </div>
    </div>
  );
}
