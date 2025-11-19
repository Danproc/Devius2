import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function HackathonSkeleton() {
  return (
    <Card className="border-devcard-border bg-devcard-base">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-3/4 bg-devcard-border" />
            <Skeleton className="h-4 w-1/2 bg-devcard-border" />
          </div>
          <Skeleton className="h-6 w-20 bg-devcard-border" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-20 w-full bg-devcard-border" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full bg-devcard-border" />
            <Skeleton className="h-10 w-full bg-devcard-border" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function HackathonListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <HackathonSkeleton key={i} />
      ))}
    </div>
  );
}
