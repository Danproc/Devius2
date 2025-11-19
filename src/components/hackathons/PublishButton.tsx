'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';

interface PublishButtonProps {
  hackathonId: string;
}

export function PublishButton({ hackathonId }: PublishButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePublish = async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/hackathons/${hackathonId}/publish`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to publish hackathon');
      }

      toast.success('Hackathon published!');
      router.refresh();
    } catch (error: any) {
      console.error('Error publishing:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePublish}
      disabled={loading}
      size="sm"
      className="bg-devcard-green hover:bg-devcard-green/90 text-black"
    >
      <Upload className="h-4 w-4 mr-1" />
      {loading ? 'Publishing...' : 'Publish'}
    </Button>
  );
}
