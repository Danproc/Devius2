"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
import { Save, Loader2, ArrowLeft, Crown, Palette } from "lucide-react";
import { toast } from "sonner";
import useSWR from "swr";
import Link from "next/link";
import { CardPreview } from "@/components/devcard/card-preview";

const themeSchema = z.object({
  theme: z.object({
    name: z.string(),
    colors: z
      .object({
        primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color").optional(),
        background: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color").optional(),
        text: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color").optional(),
      })
      .optional(),
    font: z.string().optional(),
  }),
});

type ThemeFormInput = z.infer<typeof themeSchema>;

interface DevCardData {
  id: string;
  display_name: string | null;
  github_username: string;
  avatar_url: string;
  custom_bio: string | null;
  location: string | null;
  availability_status: "open" | "available" | "not-available" | "custom" | null;
  availability_message: string | null;
  social_links: {
    twitter?: string;
    linkedin?: string;
    website?: string;
    portfolio?: string;
  } | null;
  tech_stack: string[] | null;
  github_stats: {
    public_repos: number;
    followers: number;
    following: number;
    total_stars: number;
    contribution_streak: number;
  } | null;
  view_count: number;
  theme: {
    name: string;
    colors?: {
      primary?: string;
      background?: string;
      text?: string;
    };
    font?: string;
  } | null;
}

interface UserData {
  is_premium: boolean;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to fetch data");
  }
  return res.json();
};

// Theme Presets
const THEME_PRESETS = [
  {
    name: "default",
    label: "Default",
    colors: {
      primary: "#1cf491",
      background: "#04080f",
      text: "#ffffff",
    },
  },
  {
    name: "midnight",
    label: "Midnight",
    colors: {
      primary: "#7c3aed",
      background: "#0a0a0f",
      text: "#e5e7eb",
    },
  },
  {
    name: "ocean",
    label: "Ocean",
    colors: {
      primary: "#06b6d4",
      background: "#0c1821",
      text: "#f0f9ff",
    },
  },
  {
    name: "sunset",
    label: "Sunset",
    colors: {
      primary: "#f97316",
      background: "#1a0f0a",
      text: "#fef3c7",
    },
  },
  {
    name: "forest",
    label: "Forest",
    colors: {
      primary: "#10b981",
      background: "#0a1a0f",
      text: "#d1fae5",
    },
  },
  {
    name: "custom",
    label: "Custom",
    colors: {
      primary: "#1cf491",
      background: "#04080f",
      text: "#ffffff",
    },
  },
];

// Font Options
const FONT_OPTIONS = [
  { value: "inter", label: "Inter (Default)" },
  { value: "roboto", label: "Roboto" },
  { value: "poppins", label: "Poppins" },
  { value: "montserrat", label: "Montserrat" },
  { value: "lato", label: "Lato" },
  { value: "open-sans", label: "Open Sans" },
  { value: "source-code-pro", label: "Source Code Pro" },
  { value: "jetbrains-mono", label: "JetBrains Mono" },
];

export default function ThemeCustomizationPage() {
  const [isSaving, setIsSaving] = React.useState(false);
  const [selectedPreset, setSelectedPreset] = React.useState("default");

  const { data: devcard, error: devcardError, isLoading: isLoadingCard, mutate } = useSWR<DevCardData>(
    "/api/cards/me",
    fetcher
  );

  const { data: user, isLoading: isLoadingUser } = useSWR<UserData>(
    "/api/app/me",
    fetcher
  );

  const form = useForm<ThemeFormInput>({
    resolver: zodResolver(themeSchema),
    defaultValues: {
      theme: {
        name: "default",
        colors: {
          primary: "#1cf491",
          background: "#04080f",
          text: "#ffffff",
        },
        font: "inter",
      },
    },
  });

  // Update form values when devcard data is loaded
  React.useEffect(() => {
    if (devcard?.theme) {
      form.reset({
        theme: {
          name: devcard.theme.name || "default",
          colors: devcard.theme.colors || {
            primary: "#1cf491",
            background: "#04080f",
            text: "#ffffff",
          },
          font: devcard.theme.font || "inter",
        },
      });
      setSelectedPreset(devcard.theme.name || "default");
    }
  }, [devcard, form]);

  const watchedTheme = form.watch("theme");

  // Debounced preview values
  const deferredPreviewTheme = React.useDeferredValue(watchedTheme);

  const onSubmit = async (data: ThemeFormInput) => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/cards/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          theme: data.theme,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update theme");
      }

      const updatedCard = await response.json();
      await mutate(updatedCard, false);

      toast.success("Theme updated successfully!");
    } catch (error) {
      console.error("Error updating theme:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update theme");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePresetChange = (presetName: string) => {
    setSelectedPreset(presetName);
    const preset = THEME_PRESETS.find((p) => p.name === presetName);
    if (preset) {
      form.setValue("theme", {
        name: presetName,
        colors: preset.colors,
        font: form.getValues("theme.font"),
      });
    }
  };

  const handleColorChange = (colorType: "primary" | "background" | "text", value: string) => {
    // Switch to custom preset when colors are manually changed
    if (selectedPreset !== "custom") {
      setSelectedPreset("custom");
      form.setValue("theme.name", "custom");
    }
    form.setValue(`theme.colors.${colorType}`, value);
  };

  if (isLoadingCard || isLoadingUser) {
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
        <h1 className="text-3xl font-bold tracking-tight">Theme Customization</h1>
        <Alert variant="destructive">
          <AlertDescription>
            {devcardError?.message || "Failed to load your DevCard. Please try again later."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show upgrade prompt if user is not premium
  if (!user?.is_premium) {
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
              <h1 className="text-3xl font-bold tracking-tight">Theme Customization</h1>
            </div>
            <p className="text-muted-foreground">
              Customize colors and fonts for your DevCard
            </p>
          </div>
        </div>

        {/* Premium Required Card */}
        <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Crown className="h-6 w-6 text-yellow-500" />
              <CardTitle>Premium Feature</CardTitle>
            </div>
            <CardDescription>
              Theme customization is only available for premium users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              With a premium subscription, you can:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Customize your DevCard colors (primary, background, text)</li>
              <li>Choose from multiple font families</li>
              <li>Use pre-made theme presets</li>
              <li>Create your own custom theme</li>
              <li>See live preview of your changes</li>
            </ul>
            <Button className="bg-[#1cf491] hover:bg-[#1cf491]/90 text-black font-medium">
              Upgrade to Premium
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold tracking-tight">Theme Customization</h1>
            <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
              Premium
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Customize colors and fonts for your DevCard
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Form */}
        <div className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Theme Presets Card */}
              <Card className="bg-[#04080f] border-[#121824]">
                <CardHeader>
                  <CardTitle>Theme Presets</CardTitle>
                  <CardDescription>Choose a pre-made theme or create your own</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {THEME_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => handlePresetChange(preset.name)}
                        className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                          selectedPreset === preset.name
                            ? "border-[#1cf491] bg-[#1cf491]/10"
                            : "border-[#121824] bg-[#121824]/30"
                        }`}
                      >
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-1 mb-2">
                            <div
                              className="w-full h-8 rounded"
                              style={{ backgroundColor: preset.colors.primary }}
                            />
                          </div>
                          <div className="flex gap-1">
                            <div
                              className="w-1/2 h-6 rounded"
                              style={{ backgroundColor: preset.colors.background }}
                            />
                            <div
                              className="w-1/2 h-6 rounded"
                              style={{ backgroundColor: preset.colors.text }}
                            />
                          </div>
                          <span className="text-sm font-medium mt-1">{preset.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Custom Colors Card */}
              <Card className="bg-[#04080f] border-[#121824]">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    <CardTitle>Custom Colors</CardTitle>
                  </div>
                  <CardDescription>Fine-tune your theme colors</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="theme.colors.primary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Color</FormLabel>
                        <div className="flex gap-3">
                          <FormControl>
                            <Input
                              type="color"
                              {...field}
                              onChange={(e) => handleColorChange("primary", e.target.value)}
                              className="h-12 w-20 cursor-pointer"
                            />
                          </FormControl>
                          <Input
                            type="text"
                            value={field.value}
                            onChange={(e) => handleColorChange("primary", e.target.value)}
                            placeholder="#1cf491"
                            className="bg-[#04080f] border-[#121824] font-mono"
                          />
                        </div>
                        <FormDescription>
                          Used for buttons, links, and accents
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="theme.colors.background"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Background Color</FormLabel>
                        <div className="flex gap-3">
                          <FormControl>
                            <Input
                              type="color"
                              {...field}
                              onChange={(e) => handleColorChange("background", e.target.value)}
                              className="h-12 w-20 cursor-pointer"
                            />
                          </FormControl>
                          <Input
                            type="text"
                            value={field.value}
                            onChange={(e) => handleColorChange("background", e.target.value)}
                            placeholder="#04080f"
                            className="bg-[#04080f] border-[#121824] font-mono"
                          />
                        </div>
                        <FormDescription>
                          Main background color of your card
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="theme.colors.text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Text Color</FormLabel>
                        <div className="flex gap-3">
                          <FormControl>
                            <Input
                              type="color"
                              {...field}
                              onChange={(e) => handleColorChange("text", e.target.value)}
                              className="h-12 w-20 cursor-pointer"
                            />
                          </FormControl>
                          <Input
                            type="text"
                            value={field.value}
                            onChange={(e) => handleColorChange("text", e.target.value)}
                            placeholder="#ffffff"
                            className="bg-[#04080f] border-[#121824] font-mono"
                          />
                        </div>
                        <FormDescription>
                          Primary text color
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Font Selection Card */}
              <Card className="bg-[#04080f] border-[#121824]">
                <CardHeader>
                  <CardTitle>Font Family</CardTitle>
                  <CardDescription>Choose a font for your DevCard</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="theme.font"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Font</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="bg-[#04080f] border-[#121824]">
                            <SelectValue placeholder="Select a font" />
                          </SelectTrigger>
                          <SelectContent>
                            {FONT_OPTIONS.map((font) => (
                              <SelectItem key={font.value} value={font.value}>
                                {font.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end gap-3 sticky bottom-0 bg-background/95 backdrop-blur py-4 border-t">
                <Link href="/app/dashboard">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-[#1cf491] hover:bg-[#1cf491]/90 text-black font-medium min-w-[120px]"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Theme
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
              See how your theme looks in real-time
            </p>
          </div>
          <div className="rounded-lg border border-border/50 bg-gradient-to-br from-muted/30 to-background p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            <CardPreview
              displayName={devcard.display_name}
              githubUsername={devcard.github_username}
              avatarUrl={devcard.avatar_url}
              customBio={devcard.custom_bio}
              location={devcard.location}
              availabilityStatus={devcard.availability_status}
              availabilityMessage={devcard.availability_message}
              socialLinks={devcard.social_links}
              githubStats={devcard.github_stats}
              techStack={devcard.tech_stack}
              featuredRepos={[]}
              viewCount={devcard.view_count}
              theme={deferredPreviewTheme}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
