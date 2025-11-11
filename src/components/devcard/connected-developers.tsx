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
  count = 25,
  developers,
}: ConnectedDevelopersProps) {
  // Default developer avatars (using placeholder for mockup purposes)
  const defaultDevelopers: Developer[] = Array.from({ length: 5 }, (_, i) => ({
    username: `dev${i + 1}`,
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=dev${i + 1}`,
  }));

  const displayDevelopers = developers || defaultDevelopers;

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-[#5b6a7f] text-base">
        Connected with{' '}
        <span className="text-devcard-green font-semibold">{count}</span>{' '}
        developers
      </p>

      <div className="flex items-center justify-center -space-x-3">
        {displayDevelopers.map((dev, index) => (
          <Avatar
            key={dev.username}
            className="size-12 border-2 border-[#04080f] ring-1 ring-[#121824]"
            style={{ zIndex: displayDevelopers.length - index }}
          >
            <AvatarImage src={dev.avatarUrl} alt={dev.username} />
            <AvatarFallback className="bg-devcard-green/10 text-devcard-green text-sm">
              {dev.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
    </div>
  );
}
