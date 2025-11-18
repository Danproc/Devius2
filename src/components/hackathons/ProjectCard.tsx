import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Github, ExternalLink, Video, Heart } from 'lucide-react';

interface ProjectCardProps {
  submission: {
    id: string;
    project_title: string;
    description: string;
    github_url: string;
    demo_url: string | null;
    video_url: string | null;
    tech_stack: string[];
    vote_count: number;
    status: string;
  };
  hackathon: {
    title: string;
    slug: string;
    theme: string | null;
  };
  creator: {
    id: string;
    name: string | null;
    github_username: string | null;
    image: string | null;
  };
  placement?: 'first' | 'second' | 'third';
}

export function ProjectCard({ submission, hackathon, creator, placement }: ProjectCardProps) {
  const placementConfig = {
    first: {
      badge: '1st Place',
      icon: '🥇',
      color: 'bg-yellow-500 text-black',
      borderColor: 'border-yellow-500/50',
    },
    second: {
      badge: '2nd Place',
      icon: '🥈',
      color: 'bg-gray-400 text-black',
      borderColor: 'border-gray-400/50',
    },
    third: {
      badge: '3rd Place',
      icon: '🥉',
      color: 'bg-orange-600 text-white',
      borderColor: 'border-orange-600/50',
    },
  };

  const config = placement ? placementConfig[placement] : null;
  const displayName = creator.name || creator.github_username || 'Unknown';
  const username = creator.github_username || creator.id.slice(0, 8);

  return (
    <Card className={`border-devcard-border bg-devcard-base flex flex-col ${config?.borderColor || ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-3">
          <CardTitle className="text-devcard-heading text-lg line-clamp-2">
            {submission.project_title}
          </CardTitle>
          {config && (
            <Badge className={config.color}>
              {config.icon} {config.badge}
            </Badge>
          )}
        </div>

        {/* Hackathon Info */}
        <div className="mb-3">
          <Link
            href={`/gallery/hackathons/${hackathon.slug}`}
            className="text-sm text-devcard-green hover:underline"
          >
            {hackathon.title}
          </Link>
          {hackathon.theme && (
            <p className="text-xs text-devcard-text mt-1">{hackathon.theme}</p>
          )}
        </div>

        <CardDescription className="text-devcard-text line-clamp-3">
          {submission.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-grow space-y-4">
        {/* Creator */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-devcard-base/50 border border-devcard-border">
          <Avatar className="h-8 w-8">
            <AvatarImage src={creator.image || undefined} />
            <AvatarFallback className="bg-devcard-green text-black text-xs">
              {displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <Link
              href={`/${username}`}
              className="text-sm font-medium text-devcard-heading hover:text-devcard-green truncate block"
            >
              {displayName}
            </Link>
            <p className="text-xs text-devcard-text truncate">@{username}</p>
          </div>
          {submission.vote_count > 0 && (
            <div className="flex items-center gap-1 text-sm text-devcard-text">
              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
              <span>{submission.vote_count}</span>
            </div>
          )}
        </div>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-2">
          {submission.tech_stack.slice(0, 6).map((tech, idx) => (
            <Badge
              key={idx}
              variant="outline"
              className="border-devcard-green/30 text-devcard-green text-xs"
            >
              {tech}
            </Badge>
          ))}
          {submission.tech_stack.length > 6 && (
            <Badge variant="outline" className="border-devcard-border text-devcard-text text-xs">
              +{submission.tech_stack.length - 6}
            </Badge>
          )}
        </div>

        {/* Links */}
        <div className="flex flex-col gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-devcard-border justify-start"
          >
            <a href={submission.github_url} target="_blank" rel="noopener noreferrer">
              <Github className="h-4 w-4 mr-2" />
              View Code
            </a>
          </Button>

          {submission.demo_url && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-devcard-border justify-start"
            >
              <a href={submission.demo_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Live Demo
              </a>
            </Button>
          )}

          {submission.video_url && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-devcard-border justify-start"
            >
              <a href={submission.video_url} target="_blank" rel="noopener noreferrer">
                <Video className="h-4 w-4 mr-2" />
                Watch Video
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
