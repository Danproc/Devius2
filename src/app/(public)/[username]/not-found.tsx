import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserX } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 devcard-gradient-bg animate-fade-in">
      <Card className="max-w-md w-full glass-card border-white/10 shadow-2xl animate-slide-up">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <UserX className="size-16 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">DevCard Not Found</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            The DevCard you're looking for doesn't exist or is not public.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="bg-devcard-green hover:bg-devcard-green/90 text-black font-medium">
              <Link href="/">Go Home</Link>
            </Button>
            <Button asChild variant="outline" className="border-white/20 hover:bg-white/10">
              <Link href="/app">Create Your DevCard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
