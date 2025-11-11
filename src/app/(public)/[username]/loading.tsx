import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-[#04080f]">
      <div className="w-full max-w-4xl mx-auto animate-fade-in">
        <Card className="overflow-hidden bg-[#04080f] border border-[#121824] rounded-3xl">
          <div className="p-6 md:p-8 space-y-8">
            {/* Profile Section Skeleton - NO green ring */}
            <div className="flex flex-col items-center gap-4 text-center">
              <Skeleton className="size-32 md:size-40 rounded-full animate-pulse" />
              <div className="flex flex-col gap-2 w-full items-center">
                <Skeleton className="h-10 w-48 animate-pulse" />
                <Skeleton className="h-5 w-32 animate-pulse" />
              </div>
              <Skeleton className="h-7 w-32 animate-pulse rounded-full" />
              <Skeleton className="h-20 w-full max-w-md animate-pulse" />
              <div className="flex gap-4">
                <Skeleton className="h-5 w-24 animate-pulse" />
                <Skeleton className="h-5 w-24 animate-pulse" />
              </div>
            </div>

            {/* Tech Stack Skeleton */}
            <div className="flex flex-col gap-3">
              <Skeleton className="h-5 w-24 animate-pulse" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-7 w-20 animate-pulse" />
                ))}
              </div>
            </div>

            {/* Stats Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-40 animate-pulse" />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[#121824] bg-[#04080f]">
                    <Skeleton className="size-5 animate-pulse" />
                    <Skeleton className="h-8 w-16 animate-pulse" />
                    <Skeleton className="h-3 w-20 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            {/* Repos Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-48 animate-pulse" />
              <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-5 rounded-xl border border-[#121824] bg-[#04080f] space-y-3">
                    <Skeleton className="h-6 w-3/4 animate-pulse" />
                    <Skeleton className="h-4 w-full animate-pulse" />
                    <Skeleton className="h-4 w-full animate-pulse" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16 animate-pulse" />
                      <Skeleton className="h-6 w-16 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
