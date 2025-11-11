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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Save, Loader2, CheckCircle2, XCircle, AlertCircle, ArrowLeft, Crown } from "lucide-react";
import { toast } from "sonner";
import useSWR from "swr";
import Link from "next/link";

const domainSchema = z.object({
  custom_domain: z
    .string()
    .min(1, "Domain is required")
    .regex(
      /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/,
      "Please enter a valid domain (e.g., card.yoursite.com)"
    )
    .optional()
    .or(z.literal("")),
});

type DomainFormInput = z.infer<typeof domainSchema>;

interface DevCardData {
  id: string;
  custom_domain: string | null;
  custom_domain_verified: boolean;
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

export default function CustomDomainPage() {
  const [isSaving, setIsSaving] = React.useState(false);
  const [isVerifying, setIsVerifying] = React.useState(false);

  const { data: devcard, error: devcardError, isLoading: isLoadingCard, mutate } = useSWR<DevCardData>(
    "/api/cards/me",
    fetcher
  );

  const { data: user, isLoading: isLoadingUser } = useSWR<UserData>(
    "/api/app/me",
    fetcher
  );

  const form = useForm<DomainFormInput>({
    resolver: zodResolver(domainSchema),
    defaultValues: {
      custom_domain: "",
    },
  });

  // Update form values when devcard data is loaded
  React.useEffect(() => {
    if (devcard) {
      form.reset({
        custom_domain: devcard.custom_domain || "",
      });
    }
  }, [devcard, form]);

  const onSubmit = async (data: DomainFormInput) => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/cards/domain", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          custom_domain: data.custom_domain || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update custom domain");
      }

      const updatedCard = await response.json();
      await mutate(updatedCard, false);

      toast.success("Custom domain updated successfully!");
    } catch (error) {
      console.error("Error updating custom domain:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update custom domain");
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerifyDomain = async () => {
    if (!devcard?.custom_domain) {
      toast.error("Please save a custom domain first");
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch("/api/cards/domain/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to verify domain");
      }

      const result = await response.json();

      if (result.verified) {
        toast.success("Domain verified successfully!");
        await mutate();
      } else {
        toast.error("Domain verification failed. Please check your DNS records.");
      }
    } catch (error) {
      console.error("Error verifying domain:", error);
      toast.error(error instanceof Error ? error.message : "Failed to verify domain");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRemoveDomain = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/cards/domain", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          custom_domain: null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to remove custom domain");
      }

      const updatedCard = await response.json();
      await mutate(updatedCard, false);
      form.reset({ custom_domain: "" });

      toast.success("Custom domain removed successfully!");
    } catch (error) {
      console.error("Error removing custom domain:", error);
      toast.error(error instanceof Error ? error.message : "Failed to remove custom domain");
    } finally {
      setIsSaving(false);
    }
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
        <h1 className="text-3xl font-bold tracking-tight">Custom Domain</h1>
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
              <h1 className="text-3xl font-bold tracking-tight">Custom Domain</h1>
            </div>
            <p className="text-muted-foreground">
              Use your own domain for your DevCard
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
              Custom domains are only available for premium users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              With a premium subscription, you can:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Use your own custom domain (e.g., card.yoursite.com)</li>
              <li>Professional branding for your DevCard</li>
              <li>Custom theme colors and fonts</li>
              <li>Priority support</li>
            </ul>
            <Button className="bg-[#1cf491] hover:bg-[#1cf491]/90 text-black font-medium">
              Upgrade to Premium
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const verificationRecordName = `_devcard-verify.${devcard.custom_domain || "yourdomain.com"}`;
  const verificationRecordValue = `devcard-site-verification=${devcard.id}`;

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
            <h1 className="text-3xl font-bold tracking-tight">Custom Domain</h1>
            <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
              Premium
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Use your own domain for your DevCard
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Form */}
        <div className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Domain Configuration Card */}
              <Card className="bg-[#04080f] border-[#121824]">
                <CardHeader>
                  <CardTitle>Domain Configuration</CardTitle>
                  <CardDescription>Configure your custom domain</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="custom_domain"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Domain</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="card.yoursite.com"
                            {...field}
                            className="bg-[#04080f] border-[#121824]"
                          />
                        </FormControl>
                        <FormDescription>
                          Enter the domain you want to use for your DevCard
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Verification Status */}
                  {devcard.custom_domain && (
                    <div className="p-4 rounded-lg border border-[#121824] bg-[#121824]/30">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium">Verification Status:</span>
                        {devcard.custom_domain_verified ? (
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Not Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Current domain: <code className="text-[#1cf491]">{devcard.custom_domain}</code>
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="bg-[#1cf491] hover:bg-[#1cf491]/90 text-black font-medium"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Domain
                        </>
                      )}
                    </Button>

                    {devcard.custom_domain && !devcard.custom_domain_verified && (
                      <Button
                        type="button"
                        onClick={handleVerifyDomain}
                        disabled={isVerifying}
                        variant="outline"
                      >
                        {isVerifying ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Verify Domain
                          </>
                        )}
                      </Button>
                    )}

                    {devcard.custom_domain && (
                      <Button
                        type="button"
                        onClick={handleRemoveDomain}
                        disabled={isSaving}
                        variant="destructive"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </form>
          </Form>
        </div>

        {/* Right Column: Instructions */}
        <div className="space-y-6">
          {/* DNS Instructions Card */}
          <Card className="bg-[#04080f] border-[#121824]">
            <CardHeader>
              <CardTitle>DNS Configuration</CardTitle>
              <CardDescription>Follow these steps to configure your domain</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm mb-2">Step 1: Add TXT Record</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    Add this TXT record to verify domain ownership:
                  </p>
                  <div className="p-3 rounded bg-[#121824]/50 border border-[#121824] space-y-2">
                    <div>
                      <span className="text-xs text-muted-foreground">Type:</span>
                      <code className="ml-2 text-xs text-[#1cf491]">TXT</code>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Name:</span>
                      <code className="ml-2 text-xs text-[#1cf491] break-all">
                        {verificationRecordName}
                      </code>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Value:</span>
                      <code className="ml-2 text-xs text-[#1cf491] break-all">
                        {verificationRecordValue}
                      </code>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Step 2: Add CNAME Record</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    Point your domain to our servers:
                  </p>
                  <div className="p-3 rounded bg-[#121824]/50 border border-[#121824] space-y-2">
                    <div>
                      <span className="text-xs text-muted-foreground">Type:</span>
                      <code className="ml-2 text-xs text-[#1cf491]">CNAME</code>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Name:</span>
                      <code className="ml-2 text-xs text-[#1cf491]">
                        {devcard.custom_domain || "yourdomain.com"}
                      </code>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Value:</span>
                      <code className="ml-2 text-xs text-[#1cf491]">devcard.yourdomain.com</code>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Step 3: Verify</h4>
                  <p className="text-xs text-muted-foreground">
                    After adding the DNS records, click the "Verify Domain" button above. DNS propagation
                    may take up to 24 hours.
                  </p>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <strong>Note:</strong> DNS changes can take up to 24 hours to propagate. If verification
                  fails, please wait and try again later.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Help Card */}
          <Card className="bg-[#04080f] border-[#121824]">
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                If you're having trouble setting up your custom domain, please check our documentation or
                contact support.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href="/docs/custom-domains" target="_blank" rel="noopener noreferrer">
                    View Documentation
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="/contact" target="_blank" rel="noopener noreferrer">
                    Contact Support
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
