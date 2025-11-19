import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function SubmissionSkeleton() {
  return (
    <Card className="border-devcard-border bg-devcard-base">
      <CardHeader>
        <Skeleton className="h-6 w-3/4 bg-devcard-border mb-2" />
        <Skeleton className="h-4 w-full bg-devcard-border" />
        <Skeleton className="h-4 w-2/3 bg-devcard-border" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 bg-devcard-border" />
          <Skeleton className="h-6 w-20 bg-devcard-border" />
          <Skeleton className="h-6 w-16 bg-devcard-border" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-10 w-full bg-devcard-border" />
          <Skeleton className="h-10 w-full bg-devcard-border" />
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-8 w-20 bg-devcard-border" />
      </CardFooter>
    </Card>
  );
}

export function SubmissionGridSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <SubmissionSkeleton key={i} />
      ))}
    </div>
  );
}
