"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import { CardPreview } from "@/components/devcard/card-preview";
import { CustomProjectsSection } from "@/components/devcard/custom-projects-section";
import { devCardUpdateSchema, type DevCardUpdateInput } from "@/lib/devcard/customize";
import { Save, Loader2, X, Plus, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import useSWR from "swr";
import Link from "next/link";

interface DevCardData {
  id: string;
  user_id: string;
  url_slug: string;
  is_public: boolean;
  display_name: string | null;
  custom_bio: string | null;
  location: string | null;
  avatar_url: string;
  github_username: string;
  github_stats: {
    public_repos: number;
    followers: number;
    following: number;
    total_stars: number;
    contribution_streak: number;
  } | null;
  social_links: {
    twitter?: string;
    linkedin?: string;
    website?: string;
    portfolio?: string;
  } | null;
  featured_repos: string[] | null;
  tech_stack: string[] | null;
  availability_status: 'open' | 'available' | 'not-available' | 'custom' | null;
  availability_message: string | null;
  theme: {
    name: string;
    colors?: {
      primary?: string;
      background?: string;
      text?: string;
    };
    font?: string;
  } | null;
  member_number: number;
  view_count: number;
  created_at: string;
  updated_at: string;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to fetch data');
  }
  return res.json();
};

// Popular tech stack options
const POPULAR_TECH_STACK = [
  "TypeScript", "JavaScript", "React", "Next.js", "Node.js", "Python",
  "Java", "Go", "Rust", "PHP", "Ruby", "C++", "C#", ".NET",
  "Vue.js", "Angular", "Svelte", "Express", "NestJS", "FastAPI",
  "Django", "Flask", "Spring Boot", "PostgreSQL", "MongoDB", "MySQL",
  "Redis", "Docker", "Kubernetes", "AWS", "Azure", "GCP",
  "GraphQL", "REST API", "TailwindCSS", "SASS", "Git", "CI/CD"
];

export default function CardEditorPage() {
  const [isSaving, setIsSaving] = React.useState(false);
  const [customTechInput, setCustomTechInput] = React.useState("");

  const { data: devcard, error: devcardError, isLoading: isLoadingCard, mutate } = useSWR<DevCardData>(
    '/api/cards/me',
    fetcher
  );
  const { data: connectionsData } = useSWR(
    devcard ? `/api/cards/${devcard.user_id}/connections` : null,
    fetcher
  );

  const form = useForm<DevCardUpdateInput>({
    resolver: zodResolver(devCardUpdateSchema),
    mode: 'onChange', // Enable validation on change
    defaultValues: {
      display_name: "",
      custom_bio: "",
      location: "",
      social_links: {
        twitter: "",
        linkedin: "",
        website: "",
        portfolio: "",
      },
      tech_stack: [],
      availability_status: "available",
      availability_message: "",
    },
  });

  // Update form values when devcard data is loaded
  React.useEffect(() => {
    if (devcard) {
      form.reset({
        display_name: devcard.display_name || "",
        custom_bio: devcard.custom_bio || "",
        location: devcard.location || "",
        social_links: {
          twitter: devcard.social_links?.twitter || "",
          linkedin: devcard.social_links?.linkedin || "",
          website: devcard.social_links?.website || "",
          portfolio: devcard.social_links?.portfolio || "",
        },
        tech_stack: devcard.tech_stack || [],
        availability_status: devcard.availability_status ?? "available",
        availability_message: devcard.availability_message || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [devcard]);

  const watchedValues = form.watch();
  const watchedStatus = form.watch("availability_status");

  // Debounced values for preview to improve performance
  const deferredPreviewValues = React.useDeferredValue(watchedValues);

  const onSubmit = async (data: DevCardUpdateInput) => {
    setIsSaving(true);
    try {
      // Clean up empty social links
      const cleanedSocialLinks = data.social_links ? {
        twitter: data.social_links.twitter || undefined,
        linkedin: data.social_links.linkedin || undefined,
        website: data.social_links.website || undefined,
        portfolio: data.social_links.portfolio || undefined,
      } : undefined;

      // Clear availability_message if status is not 'custom'
      const cleanedAvailabilityMessage = data.availability_status === 'custom'
        ? data.availability_message
        : null;

      const response = await fetch('/api/cards/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          social_links: cleanedSocialLinks,
          availability_message: cleanedAvailabilityMessage,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update DevCard');
      }

      const updatedCard = await response.json();

      // Revalidate the cache
      await mutate(updatedCard, false);

      toast.success('DevCard updated successfully!');
    } catch (error) {
      console.error('Error updating DevCard:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update DevCard');
    } finally {
      setIsSaving(false);
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

  if (isLoadingCard) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (devcardError || !devcard) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Edit DevCard</h1>
        <Alert variant="destructive">
          <AlertDescription>
            {devcardError?.message || 'Failed to load your DevCard. Please try again later.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const selectedTech = form.watch("tech_stack") || [];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Link href="/app/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">Edit DevCard</h1>
          </div>
          <p className="text-muted-foreground">
            Customize your developer profile and showcase your work
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Form */}
        <div className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Profile Information Card */}
              <Card className="bg-devcard-base border-devcard-border">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Basic information about yourself</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="display_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={devcard.github_username}
                            {...field}
                            value={field.value ?? ""}
                            className="bg-devcard-base border-devcard-border"
                          />
                        </FormControl>
                        <FormDescription>
                          Override your GitHub username with a custom display name
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="custom_bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell others about yourself..."
                            className="min-h-[100px] bg-devcard-base border-devcard-border resize-none"
                            maxLength={160}
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormDescription>
                          {field.value?.length || 0} / 160 characters
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
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="San Francisco, CA"
                            {...field}
                            value={field.value ?? ""}
                            className="bg-devcard-base border-devcard-border"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Social Links Card */}
              <Card className="bg-devcard-base border-devcard-border">
                <CardHeader>
                  <CardTitle>Social Links</CardTitle>
                  <CardDescription>Connect your social media profiles</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="social_links.twitter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Twitter / X</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://twitter.com/username"
                            type="url"
                            {...field}
                            className="bg-devcard-base border-devcard-border"
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
                        <FormLabel>LinkedIn</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://linkedin.com/in/username"
                            type="url"
                            {...field}
                            className="bg-devcard-base border-devcard-border"
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
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://yourwebsite.com"
                            type="url"
                            {...field}
                            className="bg-devcard-base border-devcard-border"
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
                        <FormLabel>Portfolio</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://portfolio.com"
                            type="url"
                            {...field}
                            className="bg-devcard-base border-devcard-border"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Availability Card */}
              <Card className="bg-devcard-base border-devcard-border">
                <CardHeader>
                  <CardTitle>Availability Status</CardTitle>
                  <CardDescription>Let others know your current availability</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="availability_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || undefined}
                          defaultValue={field.value ?? "available"}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-devcard-base border-devcard-border">
                              <SelectValue placeholder="Select your availability" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="open">Open to opportunities</SelectItem>
                            <SelectItem value="available">Available</SelectItem>
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
                          <FormLabel>Custom Message</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Available for freelance work"
                              {...field}
                              value={field.value ?? ""}
                              className="bg-devcard-base border-devcard-border"
                              maxLength={35}
                            />
                          </FormControl>
                          <FormDescription>
                            {field.value?.length || 0} / 35 characters
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Tech Stack Card */}
              <Card className="bg-devcard-base border-devcard-border">
                <CardHeader>
                  <CardTitle>Tech Stack</CardTitle>
                  <CardDescription>
                    Select or add technologies you work with ({selectedTech.length}/20)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Selected Technologies */}
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

                  {/* Popular Technologies */}
                  <div>
                    <Label className="text-sm text-muted-foreground mb-2 block">
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
                                : "hover:bg-devcard-border/50"
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
                    <Label className="text-sm text-muted-foreground mb-2 block">
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
                        className="bg-devcard-base border-devcard-border"
                      />
                      <Button
                        type="button"
                        onClick={handleAddCustomTech}
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Custom Projects Section */}
              <CustomProjectsSection onProjectsChange={() => mutate()} />

              {/* Save Button */}
              <div className="flex justify-end gap-3 sticky bottom-0 bg-devcard-base/95 backdrop-blur py-4 border-t border-devcard-border">
                <Link href="/app/dashboard">
                  <Button variant="outline" type="button" className="border-devcard-border hover:bg-devcard-border/50">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isSaving || !form.formState.isValid}
                  className="bg-devcard-green hover:bg-devcard-green/90 text-black font-medium min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* Right Column: Live Preview */}
        <div className="space-y-4 lg:sticky lg:top-6 h-fit">
          <div>
            <h2 className="text-xl font-semibold mb-2">Live Preview</h2>
            <p className="text-sm text-muted-foreground mb-4">
              See how your DevCard will look to visitors
            </p>
          </div>
          <div className="rounded-lg border border-border/50 bg-gradient-to-br from-muted/30 to-background p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            <CardPreview
              displayName={deferredPreviewValues.display_name || null}
              githubUsername={devcard.github_username}
              avatarUrl={devcard.avatar_url}
              customBio={deferredPreviewValues.custom_bio || null}
              location={deferredPreviewValues.location || null}
              availabilityStatus={deferredPreviewValues.availability_status || null}
              availabilityMessage={deferredPreviewValues.availability_message || null}
              socialLinks={deferredPreviewValues.social_links || null}
              githubStats={devcard.github_stats}
              techStack={deferredPreviewValues.tech_stack || null}
              featuredRepos={[]}
              customProjects={devcard.custom_projects as any}
              viewCount={devcard.view_count}
              ranking={devcard.member_number}
              theme={devcard.theme}
              connections={connectionsData}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
