import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserX } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#04080f] animate-fade-in">
      <Card className="max-w-md w-full bg-[#04080f] border border-[#121824] rounded-3xl animate-slide-up">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <UserX className="size-16 text-[#5b6a7f]" />
          </div>
          <CardTitle className="text-2xl text-[#dde3ed]">DevCard Not Found</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-[#5b6a7f]">
            The DevCard you're looking for doesn't exist or is not public.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="bg-devcard-green hover:bg-devcard-green/90 text-black font-medium">
              <Link href="/">Go Home</Link>
            </Button>
            <Button asChild variant="outline" className="border-[#121824] hover:bg-white/5 text-[#5b6a7f]">
              <Link href="/app">Create Your DevCard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
