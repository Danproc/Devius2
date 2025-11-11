"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { FaGoogle, FaSpinner, FaGithub } from "react-icons/fa";
import { toast } from "sonner";
import { appConfig } from "@/lib/config";
import { loginSchema, type LoginInput } from "@/lib/validations/auth.schema";
import Link from "next/link";

interface AuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  callbackUrl?: string;
}

export function AuthForm({ className, callbackUrl, ...props }: AuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [email, setEmail] = React.useState<string>("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const showPasswordAuth = appConfig.auth?.enablePasswordAuth;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });


  const handleImpersonation = React.useCallback(async (token: string) => {
    setIsLoading(true);
    try {
      const result = await signIn("impersonation", {
        signedToken: token,
        redirect: false,
        callbackUrl: callbackUrl || searchParams?.get("callbackUrl") || "/app",
      });

      if (result?.error) {
        toast.error("Failed to impersonate user");
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch (error) {
      console.error("Impersonation error:", error);
      toast.error("Failed to impersonate user");
    } finally {
      setIsLoading(false);
    }
  }, [callbackUrl, searchParams, router]);

  
  React.useEffect(() => {
    const impersonateToken = searchParams?.get("impersonateToken");
    if (impersonateToken) {
      handleImpersonation(impersonateToken);
    }
  }, [searchParams, handleImpersonation]);

  const handleGitHubSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("github", {
        callbackUrl: callbackUrl || searchParams?.get("callbackUrl") || "/app",
      });
    } catch (error) {
      console.error("Authentication error:", error);
      toast.error("Failed to connect with GitHub");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", {
        callbackUrl: callbackUrl || searchParams?.get("callbackUrl") || "/app",
      });
    } catch (error) {
      console.error("Authentication error:", error);
      toast.error("Failed to continue with Google");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSignIn = async (data: LoginInput) => {
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
        callbackUrl: callbackUrl || searchParams?.get("callbackUrl") || "/app",
      });

      if (result?.error) {
        toast.error("Invalid email or password");
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch (error) {
      console.error("Authentication error:", error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("email", {
        email,
        redirect: false,
        callbackUrl: callbackUrl || searchParams?.get("callbackUrl") || "/app",
      });

      if (result?.error) {
        toast.error("Failed to send login email");
      } else {
        toast.success("Check your email for the login link");
        setEmail("");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="text-center mb-4">
        <p className="text-sm text-muted-foreground">
          DevCard requires GitHub to auto-generate your developer card
        </p>
      </div>

      <Button
        type="button"
        disabled={isLoading}
        onClick={handleGitHubSignIn}
        className="w-full py-6 bg-[#00FF88] hover:bg-[#00DD77] text-black border-0 font-semibold"
      >
        {isLoading ? (
          <FaSpinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <FaGithub className="mr-2 h-5 w-5" />
        )}
        Connect with GitHub
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        By connecting, you authorize DevCard to access your public GitHub profile, repositories, and stats
      </p>
    </div>
  );
}
