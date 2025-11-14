import { Metadata } from "next"
import Link from "next/link"
import { appConfig } from "@/lib/config"
import { SignUpForm } from "@/components/auth/signup-form"
import { AuthForm } from "@/components/auth/auth-form"

export const metadata: Metadata = {
  title: "Sign Up",
  description: `Create your ${appConfig.projectName} account`,
}

export default function SignUpPage() {
  const showPasswordAuth = appConfig.auth?.enablePasswordAuth;

  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-devcard-heading mb-2">
          Create your StackPass
        </h1>
        <p className="text-sm text-devcard-heading/70">
          Join the network of builders
        </p>
      </div>

      {showPasswordAuth ? <SignUpForm /> : <AuthForm />}

      <div className="mt-6 text-center">
        <Link
          href="/sign-in"
          className="text-sm text-devcard-green hover:text-devcard-green/80 font-medium"
        >
          Already have an account? Sign in
        </Link>
      </div>
    </>
  )
}
