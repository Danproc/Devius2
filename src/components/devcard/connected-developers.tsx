import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface Developer {
  username: string;
  avatarUrl: string;
}

interface ConnectedDevelopersProps {
  count?: number;
  developers?: Developer[];
}

export function ConnectedDevelopers({
  count = 0,
  developers = [],
}: ConnectedDevelopersProps) {
  // Only show avatars if there are actual connections
  const displayDevelopers = developers.length > 0 ? developers : [];

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-devcard-text text-base">
        Connected with{' '}
        <span className="text-devcard-green font-semibold">{count}</span>{' '}
        {count === 1 ? 'developer' : 'developers'}
      </p>

      {displayDevelopers.length > 0 && (
        <div className="flex items-center justify-center -space-x-3">
          {displayDevelopers.map((dev, index) => (
            <Avatar
              key={dev.username}
              className="size-12 border-2 border-devcard-base ring-1 ring-devcard-border"
              style={{ zIndex: displayDevelopers.length - index }}
            >
              <AvatarImage src={dev.avatarUrl} alt={dev.username} />
              <AvatarFallback className="bg-devcard-green/10 text-devcard-green text-sm">
                {dev.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
      )}
    </div>
  );
}
