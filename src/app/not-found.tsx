import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * Custom 404 Page
 * Returns proper 404 status code (prevents soft 404s)
 */
export default function NotFound() {
  return (
    <div className="bg-devcard-base min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-devcard-heading mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-devcard-heading mb-4">
          Page Not Found
        </h2>
        <p className="text-devcard-text mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/">
            <Button className="bg-devcard-green text-black hover:bg-devcard-green/90">
              Back to Home
            </Button>
          </Link>
          <Link href="/hackathons">
            <Button variant="outline" className="border-devcard-border text-devcard-text hover:text-devcard-green">
              Browse Hackathons
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
