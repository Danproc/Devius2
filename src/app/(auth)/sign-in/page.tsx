import { Metadata } from "next";
import Link from "next/link";
import { appConfig } from "@/lib/config";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Sign In",
  description: `Sign in to your ${appConfig.projectName} account`,
};

export default function SignInPage() {
  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-devcard-heading mb-2">
          Welcome back
        </h1>
        <p className="text-sm text-devcard-heading/70">
          Sign in to your StackPass account
        </p>
      </div>

      <AuthForm />

      <div className="mt-6 text-center">
        <Link
          href="/sign-up"
          className="text-sm text-devcard-green hover:text-devcard-green/80 font-medium"
        >
          Don&apos;t have an account? Sign up
        </Link>
      </div>
    </>
  );
}
