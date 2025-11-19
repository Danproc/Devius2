import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Plus } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  icon,
}: EmptyStateProps) {
  return (
    <Card className="border-devcard-border bg-devcard-base">
      <CardContent className="py-16 text-center">
        <div className="mb-4">
          {icon || <Trophy className="h-16 w-16 text-devcard-text/30 mx-auto" />}
        </div>
        <h3 className="text-xl font-bold text-devcard-heading mb-2">{title}</h3>
        <p className="text-devcard-text mb-6 max-w-md mx-auto">{description}</p>
        {actionLabel && actionHref && (
          <Button asChild className="bg-devcard-green hover:bg-devcard-green/90 text-black">
            <Link href={actionHref}>
              <Plus className="mr-2 h-4 w-4" />
              {actionLabel}
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
