import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { type EmailConfig } from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from "./db/schema/user";
import onUserCreate from "./lib/users/onUserCreate";
import { render } from "@react-email/components";
import MagicLinkEmail from "./emails/MagicLinkEmail";
import sendMail from "./lib/email/sendMail";
import { appConfig } from "./lib/config";
import { decryptJson } from "./lib/encryption/edge-jwt";
import { eq } from "drizzle-orm";

// Overrides default session type
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      impersonatedBy?: string;
    };
    expires: string;
  }
}

interface ImpersonateToken {
  impersonateIntoId: string;
  impersonateIntoEmail: string;
  impersonator: string;
  expiry: string;
}

const emailProvider: EmailConfig = {
  id: "email",
  type: "email",
  name: "Email",
  async sendVerificationRequest(params) {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `Magic link for ${params.identifier}: ${params.url} expires at ${params.expires}`
      );
    }
    const html = await render(
      MagicLinkEmail({ url: params.url, expiresAt: params.expires })
    );

    await sendMail(
      params.identifier,
      `Sign in to ${appConfig.projectName}`,
      html
    );
  },
};

const adapter = DrizzleAdapter(db, {
  usersTable: users,
  accountsTable: accounts,
  sessionsTable: sessions,
  verificationTokensTable: verificationTokens,
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/sign-in",
    signOut: "/sign-out",
  },
  session: {
    strategy: "jwt",
  },
  adapter: {
    ...adapter,
    createUser: async (user) => {
      if (!adapter.createUser) {
        throw new Error("Adapter is not initialized");
      }
      const newUser = await adapter.createUser(user);
      // Update the user with the default plan
      await onUserCreate(newUser);

      return newUser;
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Check if sign-in is enabled
      if (process.env.NEXT_PUBLIC_SIGNIN_ENABLED !== "true") {
        return false;
      }

      // Handle GitHub OAuth - store GitHub data and create StackPass
      if (account?.provider === "github" && profile && user?.id) {
        console.log("🔵 GitHub sign-in detected for", (profile as any).login);
        console.log("User ID:", user.id);

        try {
          const githubProfile = profile as any;
          const userId = user.id;

          // Update user with GitHub data
          await db
            .update(users)
            .set({
              github_id: githubProfile.id,
              github_username: githubProfile.login,
            })
            .where(eq(users.id, userId));

          console.log("✅ GitHub data stored for", githubProfile.login);

          // Create StackPass for this user
          const { createDevCard } = await import("./lib/devcard/generate");
          try {
            console.log("🔵 Creating StackPass for", githubProfile.login);
            const result = await createDevCard(userId);
            console.log(`✅ StackPass created at /${result.devcard.url_slug}`);
          } catch (err: any) {
            console.error("❌ Failed to create StackPass:", err);
            console.error("Error message:", err?.message);
            console.error("Error stack:", err?.stack);
            // Log detailed error for debugging
            if (err?.cause) {
              console.error("Error cause:", err.cause);
            }
            // Don't block sign-in if StackPass creation fails
          }

          // Check for connection intent (user wanted to connect before signing in)
          try {
            const { cookies } = await import('next/headers');
            const cookieStore = await cookies();
            const connectionIntent = cookieStore.get('connection_intent')?.value;

            if (connectionIntent && connectionIntent !== userId) {
              console.log("🔗 Connection intent found for user:", connectionIntent);

              // Send connection request directly via database
              const { connections } = await import('./db/schema/connections');

              await db.insert(connections).values({
                requester_id: userId,
                recipient_id: connectionIntent,
                message: 'I would like to connect with you!',
                status: 'pending',
              });

              console.log("✅ Connection request auto-sent to:", connectionIntent);

              // Clear the connection intent cookie
              cookieStore.delete('connection_intent');
            }
          } catch (err) {
            console.error("❌ Error handling connection intent:", err);
            // Don't block sign-in if connection fails
          }
        } catch (error) {
          console.error("❌ Error in GitHub OAuth callback:", error);
        }
      }

      return true;
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      if (token.email) {
        session.user.email = token.email;
      }
      if (token.impersonatedBy) {
        session.user.impersonatedBy = token.impersonatedBy as string;
      }
      return session;
    },
    async jwt({ token, user, account, profile }) {
      // If user object is available (after sign in), check if impersonation is happening
      if (user && "impersonatedBy" in user) {
        token.impersonatedBy = user.impersonatedBy;
      }

      // Store GitHub account info for StackPass creation
      if (account?.provider === "github" && profile) {
        const githubProfile = profile as any;
        token.githubId = githubProfile.id;
        token.githubUsername = githubProfile.login;
      }

      // NOTE: Do not add anything else to the token, except for the sub
      // This avoids stale data problems, while increasing db roundtrips
      // which is acceptable while starting small.
      return {
        sub: token.sub,
        email: token.email,
        impersonatedBy: token.impersonatedBy,
        githubId: token.githubId,
        githubUsername: token.githubUsername,
        iat: token.iat,
        exp: token.exp,
        jti: token.jti,
      };
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    // GitHub OAuth for StackPass
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email public_repo',
        },
      },
      allowDangerousEmailAccountLinking: true,
    }),
    emailProvider,
    // Password-based authentication
    ...(appConfig.auth?.enablePasswordAuth
      ? [
          CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
              email: {
                label: "Email",
                type: "email",
                placeholder: "name@example.com",
              },
              password: {
                label: "Password",
                type: "password",
              },
            },
            async authorize(credentials) {
              if (!credentials?.email || !credentials?.password) {
                return null;
              }

              try {
                // Find user by email
                const user = await db
                  .select({
                    id: users.id,
                    email: users.email,
                    name: users.name,
                    password: users.password,
                  })
                  .from(users)
                  .where(eq(users.email, credentials.email as string))
                  .limit(1)
                  .then((users) => users[0]);

                if (!user || !user.password) {
                  return null;
                }

                const { verifyPassword } = await import("./lib/auth/password");
                // Verify password
                const passwordCorrect = await verifyPassword(
                  credentials.password as string,
                  user.password
                );

                if (!passwordCorrect) {
                  return null;
                }

                return {
                  id: user.id,
                  email: user.email,
                  name: user.name,
                };
              } catch (error) {
                console.error("Error during password authentication:", error);
                return null;
              }
            },
          }),
        ]
      : []),
    // Impersonation provider (super admin only)
    CredentialsProvider({
      id: "impersonation",
      name: "Impersonation",
      credentials: {
        signedToken: {
          label: "Signed Token",
          type: "text",
          placeholder: "Signed Token",
          required: true,
        },
      },
      async authorize(credentials) {
        if (!credentials?.signedToken) {
          return null;
        }

        try {
          // The token is already URL encoded, decryptJson handles the decoding
          const impersonationToken = await decryptJson<ImpersonateToken>(
            credentials.signedToken as string
          );

          // Validate token expiry
          if (new Date(impersonationToken.expiry) < new Date()) {
            throw new Error("Impersonation token expired");
          }

          // Trust the decrypted token without additional database validations
          return {
            id: impersonationToken.impersonateIntoId,
            email: impersonationToken.impersonateIntoEmail,
            impersonatedBy: impersonationToken.impersonator,
          };
        } catch (error) {
          console.error("Error during impersonation:", error);
          return null;
        }
      },
    }),
    // TIP: Add more providers here as needed like Apple, Facebook, etc.
  ],
});
