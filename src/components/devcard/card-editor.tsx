"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type DevCardUpdateInput } from "@/lib/devcard/customize";
import { X, Plus } from "lucide-react";
import { toast } from "sonner";

interface GitHubRepo {
  full_name: string;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
}

interface CardEditorProps {
  form: UseFormReturn<DevCardUpdateInput>;
  repos?: GitHubRepo[];
  isLoadingRepos?: boolean;
  githubUsername: string;
}

// Popular tech stack options
const POPULAR_TECH_STACK = [
  "TypeScript", "JavaScript", "React", "Next.js", "Node.js", "Python",
  "Java", "Go", "Rust", "PHP", "Ruby", "C++", "C#", ".NET",
  "Vue.js", "Angular", "Svelte", "Express", "NestJS", "FastAPI",
  "Django", "Flask", "Spring Boot", "PostgreSQL", "MongoDB", "MySQL",
  "Redis", "Docker", "Kubernetes", "AWS", "Azure", "GCP",
  "GraphQL", "REST API", "TailwindCSS", "SASS", "Git", "CI/CD"
];

/**
 * CardEditor Component
 *
 * A comprehensive form component for editing DevCard customizable fields:
 * - T062: Complete form structure for all fields
 * - T063: Custom bio with 500-character counter
 * - T064: Social links (Twitter, LinkedIn, Website, Portfolio)
 * - T065: Featured repositories selector (max 6)
 * - T066: Tech stack multi-select with predefined list
 * - T067: Availability status toggle with custom message
 *
 * Design specifications:
 * - Dark theme (devcard-base background, devcard-border borders)
 * - Labels in devcard-heading
 * - Input text in devcard-text
 * - Green (devcard-green) for selected/active states
 */
export function CardEditor({ form, repos, isLoadingRepos, githubUsername }: CardEditorProps) {
  const [customTechInput, setCustomTechInput] = React.useState("");

  const selectedRepos = form.watch("featured_repos") || [];
  const selectedTech = form.watch("tech_stack") || [];
  const watchedStatus = form.watch("availability_status");

  const handleToggleFeaturedRepo = (repoFullName: string) => {
    const currentRepos = form.getValues("featured_repos") || [];

    if (currentRepos.includes(repoFullName)) {
      form.setValue(
        "featured_repos",
        currentRepos.filter((r: string) => r !== repoFullName)
      );
    } else {
      if (currentRepos.length >= 6) {
        toast.error("You can only feature up to 6 repositories");
        return;
      }
      form.setValue("featured_repos", [...currentRepos, repoFullName]);
    }
  };

  const handleToggleTech = (tech: string) => {
    const currentTech = form.getValues("tech_stack") || [];

    if (currentTech.includes(tech)) {
      form.setValue(
        "tech_stack",
        currentTech.filter((t: string) => t !== tech)
      );
    } else {
      if (currentTech.length >= 20) {
        toast.error("You can only add up to 20 technologies");
        return;
      }
      form.setValue("tech_stack", [...currentTech, tech]);
    }
  };

  const handleAddCustomTech = () => {
    const trimmed = customTechInput.trim();
    if (!trimmed) return;

    const currentTech = form.getValues("tech_stack") || [];

    if (currentTech.includes(trimmed)) {
      toast.error("This technology is already added");
      return;
    }

    if (currentTech.length >= 20) {
      toast.error("You can only add up to 20 technologies");
      return;
    }

    if (trimmed.length > 50) {
      toast.error("Technology name must be 50 characters or less");
      return;
    }

    form.setValue("tech_stack", [...currentTech, trimmed]);
    setCustomTechInput("");
  };

  const handleRemoveTech = (tech: string) => {
    const currentTech = form.getValues("tech_stack") || [];
    form.setValue(
      "tech_stack",
      currentTech.filter((t: string) => t !== tech)
    );
  };

  return (
    <div className="space-y-6">
      {/* T062: Profile Information Card */}
      <Card className="bg-devcard-base border-devcard-border">
        <CardHeader>
          <CardTitle className="text-devcard-heading">Profile Information</CardTitle>
          <CardDescription className="text-devcard-text">Basic information about yourself</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="display_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-devcard-heading">Display Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder={githubUsername}
                    {...field}
                    className="bg-devcard-base border-devcard-border text-devcard-heading placeholder:text-devcard-text"
                  />
                </FormControl>
                <FormDescription className="text-devcard-text">
                  Override your GitHub username with a custom display name
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* T063: Custom Bio with 500-character counter */}
          <FormField
            control={form.control}
            name="custom_bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-devcard-heading">Custom Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell others about yourself..."
                    className="min-h-[100px] bg-devcard-base border-devcard-border text-devcard-heading placeholder:text-devcard-text resize-none"
                    maxLength={500}
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-devcard-text">
                  <span className={field.value && field.value.length > 450 ? "text-devcard-green" : ""}>
                    {field.value?.length || 0} / 500 characters
                  </span>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-devcard-heading">Location</FormLabel>
                <FormControl>
                  <Input
                    placeholder="San Francisco, CA"
                    {...field}
                    className="bg-devcard-base border-devcard-border text-devcard-heading placeholder:text-devcard-text"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* T064: Social Links Card */}
      <Card className="bg-devcard-base border-devcard-border">
        <CardHeader>
          <CardTitle className="text-devcard-heading">Social Links</CardTitle>
          <CardDescription className="text-devcard-text">Connect your social media profiles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="social_links.twitter"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-devcard-heading">Twitter / X</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://twitter.com/username"
                    type="url"
                    {...field}
                    className="bg-devcard-base border-devcard-border text-devcard-heading placeholder:text-devcard-text"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="social_links.linkedin"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-devcard-heading">LinkedIn</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://linkedin.com/in/username"
                    type="url"
                    {...field}
                    className="bg-devcard-base border-devcard-border text-devcard-heading placeholder:text-devcard-text"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="social_links.website"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-devcard-heading">Website</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://yourwebsite.com"
                    type="url"
                    {...field}
                    className="bg-devcard-base border-devcard-border text-devcard-heading placeholder:text-devcard-text"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="social_links.portfolio"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-devcard-heading">Portfolio</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://portfolio.com"
                    type="url"
                    {...field}
                    className="bg-devcard-base border-devcard-border text-devcard-heading placeholder:text-devcard-text"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* T067: Availability Status Card */}
      <Card className="bg-devcard-base border-devcard-border">
        <CardHeader>
          <CardTitle className="text-devcard-heading">Availability Status</CardTitle>
          <CardDescription className="text-devcard-text">Let others know your current availability</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="availability_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-devcard-heading">Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || "available"}>
                  <SelectTrigger className="bg-devcard-base border-devcard-border text-devcard-heading">
                    <SelectValue placeholder="Select your availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open to opportunities</SelectItem>
                    <SelectItem value="available">Available for collaboration</SelectItem>
                    <SelectItem value="not-available">Not available</SelectItem>
                    <SelectItem value="custom">Custom message</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {watchedStatus === "custom" && (
            <FormField
              control={form.control}
              name="availability_message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-devcard-heading">Custom Message</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Available for freelance work"
                      {...field}
                      className="bg-devcard-base border-devcard-border text-devcard-heading placeholder:text-devcard-text"
                      maxLength={200}
                    />
                  </FormControl>
                  <FormDescription className="text-devcard-text">
                    {field.value?.length || 0} / 200 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </CardContent>
      </Card>

      {/* T065: Featured Repositories Card */}
      <Card className="bg-devcard-base border-devcard-border">
        <CardHeader>
          <CardTitle className="text-devcard-heading">Featured Repositories</CardTitle>
          <CardDescription className="text-devcard-text">
            Select up to 6 repositories to showcase ({selectedRepos.length}/6)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingRepos ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : repos && repos.length > 0 ? (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {repos.map((repo) => (
                <div
                  key={repo.full_name}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    selectedRepos.includes(repo.full_name)
                      ? "border-devcard-green bg-devcard-green/5"
                      : "border-devcard-border hover:bg-devcard-border/30"
                  }`}
                  onClick={() => handleToggleFeaturedRepo(repo.full_name)}
                >
                  <Checkbox
                    checked={selectedRepos.includes(repo.full_name)}
                    onCheckedChange={() => handleToggleFeaturedRepo(repo.full_name)}
                    className="mt-1 data-[state=checked]:bg-devcard-green data-[state=checked]:border-devcard-green"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate text-devcard-heading">{repo.name}</p>
                      {repo.language && (
                        <Badge variant="secondary" className="text-xs">
                          {repo.language}
                        </Badge>
                      )}
                    </div>
                    {repo.description && (
                      <p className="text-xs text-devcard-text line-clamp-2 mt-1">
                        {repo.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-devcard-text">
                      <span>⭐ {repo.stargazers_count}</span>
                      <span>🍴 {repo.forks_count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertDescription>
                No repositories found. Create some repositories on GitHub to feature them here.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* T066: Tech Stack Card */}
      <Card className="bg-devcard-base border-devcard-border">
        <CardHeader>
          <CardTitle className="text-devcard-heading">Tech Stack</CardTitle>
          <CardDescription className="text-devcard-text">
            Select or add technologies you work with ({selectedTech.length}/20)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selected Technologies - Pills/badges display */}
          {selectedTech.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-devcard-border/30 border border-devcard-border">
              {selectedTech.map((tech) => (
                <Badge
                  key={tech}
                  variant="secondary"
                  className="bg-devcard-green/10 text-devcard-green hover:bg-devcard-green/20 border-devcard-green/20"
                >
                  {tech}
                  <button
                    type="button"
                    onClick={() => handleRemoveTech(tech)}
                    className="ml-2 hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Popular Technologies with search/filter */}
          <div>
            <Label className="text-sm text-devcard-text mb-2 block">
              Popular Technologies
            </Label>
            <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto p-2">
              {POPULAR_TECH_STACK.map((tech) => {
                const isSelected = selectedTech.includes(tech);
                return (
                  <Badge
                    key={tech}
                    variant="outline"
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-devcard-green/10 border-devcard-green text-devcard-green"
                        : "border-devcard-border text-devcard-text hover:bg-devcard-border/50 hover:text-devcard-heading"
                    }`}
                    onClick={() => handleToggleTech(tech)}
                  >
                    {tech}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Add Custom Technology */}
          <div>
            <Label className="text-sm text-devcard-text mb-2 block">
              Add Custom Technology
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter technology name"
                value={customTechInput}
                onChange={(e) => setCustomTechInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomTech();
                  }
                }}
                maxLength={50}
                className="bg-devcard-base border-devcard-border text-devcard-heading placeholder:text-devcard-text"
              />
              <Button
                type="button"
                onClick={handleAddCustomTech}
                variant="outline"
                size="icon"
                className="shrink-0 border-devcard-border hover:bg-devcard-green/10 hover:border-devcard-green"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
