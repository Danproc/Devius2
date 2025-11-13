'use client';

import React from 'react';
import { CustomProject } from '@/types/projects';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Github, ExternalLink, Star, GitFork } from 'lucide-react';

interface ProjectShowcaseProps {
  projects: CustomProject[];
}

export function ProjectShowcase({ projects }: ProjectShowcaseProps) {
  if (!projects || projects.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {projects.map((project) => (
        <Card
          key={project.id}
          className="bg-devcard-base border-devcard-border hover:border-devcard-green/50 transition-all duration-300 group"
        >
          <CardContent className="p-6">
            {/* Header */}
            <div className="mb-4">
              <h3 className="text-xl font-bold text-devcard-heading group-hover:text-devcard-green transition-colors mb-2">
                {project.title}
              </h3>
              <p className="text-sm text-devcard-text line-clamp-3">
                {project.description}
              </p>
            </div>

            {/* Tech Stack */}
            <div className="flex flex-wrap gap-2 mb-4">
              {project.techStack.slice(0, 4).map((tech) => (
                <Badge
                  key={tech}
                  variant="secondary"
                  className="text-xs bg-devcard-green/10 text-devcard-green border-devcard-green/20"
                >
                  {tech}
                </Badge>
              ))}
              {project.techStack.length > 4 && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-devcard-border text-devcard-text"
                >
                  +{project.techStack.length - 4}
                </Badge>
              )}
            </div>

            {/* GitHub Stats (if available) */}
            {(project.stars !== undefined || project.forks !== undefined || project.language) && (
              <div className="flex items-center gap-3 text-sm text-devcard-text mb-4 py-3 px-4 rounded-lg bg-devcard-border/30 border border-devcard-border">
                {project.stars !== undefined && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-semibold text-devcard-heading">
                      {project.stars.toLocaleString()}
                    </span>
                  </div>
                )}
                {project.forks !== undefined && (
                  <div className="flex items-center gap-1">
                    <GitFork className="h-4 w-4" />
                    <span className="font-semibold text-devcard-heading">
                      {project.forks.toLocaleString()}
                    </span>
                  </div>
                )}
                {project.language && (
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-devcard-green"></span>
                    <span>{project.language}</span>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              {project.projectUrl && (
                <Button
                  asChild
                  variant="default"
                  size="sm"
                  className="flex-1 bg-devcard-green hover:bg-devcard-green/90 text-black font-semibold"
                >
                  <a
                    href={project.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Visit Project
                  </a>
                </Button>
              )}
              {project.githubUrl && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className={`border-devcard-border hover:bg-devcard-border/50 ${!project.projectUrl ? 'flex-1' : ''}`}
                >
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    <Github className="h-4 w-4" />
                    {project.projectUrl ? 'Code' : 'View on GitHub'}
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
