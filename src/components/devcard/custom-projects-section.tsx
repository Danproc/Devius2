'use client';

import React, { useState, useEffect } from 'react';
import { CustomProject } from '@/types/projects';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProjectEditor } from './project-editor';
import {
  Plus,
  Edit,
  Trash2,
  MoveUp,
  MoveDown,
  Github,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface CustomProjectsSectionProps {
  onProjectsChange?: () => void;
}

export function CustomProjectsSection({ onProjectsChange }: CustomProjectsSectionProps) {
  const [projects, setProjects] = useState<CustomProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<CustomProject | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();

      if (data.success) {
        setProjects(data.projects);
      } else {
        toast.error('Failed to load projects');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (projectData: Partial<CustomProject>) => {
    setActionLoading('create');
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.error || 'Failed to create project');
        setActionLoading(null);
        return;
      }

      toast.success('Project created successfully!');

      // Fetch fresh projects list
      await fetchProjects();

      // Close the editor
      setIsCreating(false);
      setActionLoading(null);

      // Notify parent
      onProjectsChange?.();
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
      setActionLoading(null);
    }
  };

  const handleUpdateProject = async (projectData: Partial<CustomProject>) => {
    if (!editingProject?.id) return;

    setActionLoading(editingProject.id);
    try {
      const response = await fetch('/api/projects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingProject.id, ...projectData }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.error || 'Failed to update project');
        return;
      }

      toast.success('Project updated successfully!');
      setEditingProject(null);
      await fetchProjects();
      onProjectsChange?.();
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    setActionLoading(projectId);
    try {
      const response = await fetch(`/api/projects?id=${projectId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.error || 'Failed to delete project');
        return;
      }

      toast.success('Project deleted successfully!');
      setDeleteConfirm(null);
      await fetchProjects();
      onProjectsChange?.();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReorderProject = async (projectId: string, direction: 'up' | 'down') => {
    setActionLoading(projectId);
    try {
      const response = await fetch('/api/projects/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, direction }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.error || 'Failed to reorder project');
        return;
      }

      setProjects(data.projects);
      toast.success('Project reordered!');
      onProjectsChange?.();
    } catch (error) {
      console.error('Error reordering project:', error);
      toast.error('Failed to reorder project');
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-devcard-base border-devcard-border">
        <CardHeader>
          <CardTitle className="text-devcard-heading">Custom Projects</CardTitle>
          <CardDescription className="text-devcard-text">
            Loading projects...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-devcard-green" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isCreating) {
    return (
      <ProjectEditor
        isNew
        onSave={handleCreateProject}
        onCancel={() => setIsCreating(false)}
      />
    );
  }

  if (editingProject) {
    return (
      <ProjectEditor
        project={editingProject}
        onSave={handleUpdateProject}
        onCancel={() => setEditingProject(null)}
      />
    );
  }

  return (
    <>
      <Card className="bg-devcard-base border-devcard-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-devcard-heading">Custom Projects</CardTitle>
              <CardDescription className="text-devcard-text">
                Showcase up to 3 custom projects ({projects.length}/3)
              </CardDescription>
            </div>
            {projects.length < 3 && (
              <Button
                onClick={() => setIsCreating(true)}
                className="bg-devcard-green hover:bg-devcard-green/90 text-black"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <div className="inline-block p-4 rounded-full bg-devcard-border/30">
                  <Plus className="h-8 w-8 text-devcard-text" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-devcard-heading mb-2">
                No Projects Yet
              </h3>
              <p className="text-devcard-text mb-6 max-w-md mx-auto">
                Showcase your best work! Add custom projects with descriptions, tech stacks,
                and links. GitHub repos auto-populate with stars and forks.
              </p>
              <Button
                onClick={() => setIsCreating(true)}
                className="bg-devcard-green hover:bg-devcard-green/90 text-black"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Project
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project, index) => (
                <Card
                  key={project.id}
                  className="bg-devcard-border/30 border-devcard-border"
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Reorder buttons */}
                      <div className="flex flex-col gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleReorderProject(project.id, 'up')}
                          disabled={index === 0 || actionLoading === project.id}
                          className="h-8 w-8 p-0 hover:bg-devcard-border"
                        >
                          {actionLoading === project.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoveUp className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleReorderProject(project.id, 'down')}
                          disabled={index === projects.length - 1 || actionLoading === project.id}
                          className="h-8 w-8 p-0 hover:bg-devcard-border"
                        >
                          {actionLoading === project.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoveDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      {/* Project details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-devcard-heading">
                              {project.title}
                            </h4>
                            <p className="text-sm text-devcard-text line-clamp-2 mt-1">
                              {project.description}
                            </p>
                          </div>
                        </div>

                        {/* Tech Stack */}
                        <div className="flex flex-wrap gap-1 mb-2">
                          {project.techStack.slice(0, 5).map((tech) => (
                            <Badge
                              key={tech}
                              variant="secondary"
                              className="text-xs bg-devcard-green/10 text-devcard-green border-devcard-green/20"
                            >
                              {tech}
                            </Badge>
                          ))}
                          {project.techStack.length > 5 && (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-devcard-border text-devcard-text"
                            >
                              +{project.techStack.length - 5} more
                            </Badge>
                          )}
                        </div>

                        {/* Links and Stats */}
                        <div className="flex items-center gap-4 text-sm text-devcard-text">
                          {project.githubUrl && (
                            <div className="flex items-center gap-2">
                              <Github className="h-4 w-4" />
                              {project.stars !== undefined && (
                                <span>⭐ {project.stars.toLocaleString()}</span>
                              )}
                              {project.forks !== undefined && (
                                <span>🍴 {project.forks.toLocaleString()}</span>
                              )}
                            </div>
                          )}
                          {project.projectUrl && (
                            <div className="flex items-center gap-1">
                              <ExternalLink className="h-4 w-4" />
                              <span>Live</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingProject(project)}
                          disabled={actionLoading === project.id}
                          className="h-8 w-8 p-0 hover:bg-devcard-border"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteConfirm(project.id)}
                          disabled={actionLoading === project.id}
                          className="h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-devcard-base border-devcard-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-devcard-heading">Delete Project?</AlertDialogTitle>
            <AlertDialogDescription className="text-devcard-text">
              This action cannot be undone. This will permanently delete your project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-devcard-border hover:bg-devcard-border/50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDeleteProject(deleteConfirm)}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
