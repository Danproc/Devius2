import { MemberSummary } from '@/lib/members/types';
import { MemberCard } from './MemberCard';
import { Skeleton } from '@/components/ui/skeleton';

interface MemberDirectoryGridProps {
  members: MemberSummary[];
  isLoading?: boolean;
}

export function MemberDirectoryGrid({ members, isLoading }: MemberDirectoryGridProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 20 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    );
  }

  // Empty state
  if (members.length === 0) {
    return (
      <div className="text-center py-16 border border-[#121824] rounded-lg bg-[#0a0f1a]">
        <p className="text-devcard-heading text-lg font-semibold">No members found</p>
        <p className="text-sm text-devcard-text/70 mt-2">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  // Grid layout
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {members.map((member) => (
        <MemberCard key={member.id} member={member} />
      ))}
    </div>
  );
}
