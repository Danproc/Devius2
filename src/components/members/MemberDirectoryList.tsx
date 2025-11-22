import { MemberSummary } from '@/lib/members/types';
import { MemberListItem } from './MemberListItem';
import { Skeleton } from '@/components/ui/skeleton';

interface MemberDirectoryListProps {
  members: MemberSummary[];
  isLoading?: boolean;
}

export function MemberDirectoryList({ members, isLoading }: MemberDirectoryListProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="border rounded-lg overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-3 w-[400px]" />
            </div>
            <Skeleton className="h-4 w-[100px]" />
          </div>
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

  // List layout
  return (
    <div className="border border-[#121824] rounded-lg overflow-hidden bg-[#0a0f1a]">
      {members.map((member) => (
        <MemberListItem key={member.id} member={member} />
      ))}
    </div>
  );
}
