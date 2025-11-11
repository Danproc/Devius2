export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profile: {
        Row: {
          id: string
          userId: string
          memberNumber: number
          username: string
          slug: string
          avatarUrl: string | null
          githubUsername: string | null
          githubId: string | null
          headline: string | null
          bio: string | null
          location: string | null
          website: string | null
          topLanguages: Json
          featuredRepositories: Json
          activityHighlights: Json | null
          frameworks: Json
          developerFingerprint: string | null
          theme: Json
          socialLinks: Json
          connectionCount: number
          profileViews: number
          isPremium: boolean
          premiumTier: string | null
          qrCodeUrl: string | null
          applePassUrl: string | null
          googlePassUrl: string | null
          isPublic: boolean
          isActive: boolean
          githubSyncedAt: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          userId: string
          memberNumber?: number
          username: string
          slug: string
          avatarUrl?: string | null
          githubUsername?: string | null
          githubId?: string | null
          headline?: string | null
          bio?: string | null
          location?: string | null
          website?: string | null
          topLanguages?: Json
          featuredRepositories?: Json
          activityHighlights?: Json | null
          frameworks?: Json
          developerFingerprint?: string | null
          theme?: Json
          socialLinks?: Json
          connectionCount?: number
          profileViews?: number
          isPremium?: boolean
          premiumTier?: string | null
          qrCodeUrl?: string | null
          applePassUrl?: string | null
          googlePassUrl?: string | null
          isPublic?: boolean
          isActive?: boolean
          githubSyncedAt?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          userId?: string
          memberNumber?: number
          username?: string
          slug?: string
          avatarUrl?: string | null
          githubUsername?: string | null
          githubId?: string | null
          headline?: string | null
          bio?: string | null
          location?: string | null
          website?: string | null
          topLanguages?: Json
          featuredRepositories?: Json
          activityHighlights?: Json | null
          frameworks?: Json
          developerFingerprint?: string | null
          theme?: Json
          socialLinks?: Json
          connectionCount?: number
          profileViews?: number
          isPremium?: boolean
          premiumTier?: string | null
          qrCodeUrl?: string | null
          applePassUrl?: string | null
          googlePassUrl?: string | null
          isPublic?: boolean
          isActive?: boolean
          githubSyncedAt?: string | null
          createdAt?: string
          updatedAt?: string
        }
      }
      connection_request: {
        Row: {
          id: string
          fromUserId: string
          toUserId: string
          status: string
          createdAt: string
        }
        Insert: {
          id?: string
          fromUserId: string
          toUserId: string
          status?: string
          createdAt?: string
        }
        Update: {
          id?: string
          fromUserId?: string
          toUserId?: string
          status?: string
          createdAt?: string
        }
      }
      connection: {
        Row: {
          id: string
          user1Id: string
          user2Id: string
          createdAt: string
        }
        Insert: {
          id?: string
          user1Id: string
          user2Id: string
          createdAt?: string
        }
        Update: {
          id?: string
          user1Id?: string
          user2Id?: string
          createdAt?: string
        }
      }
      membership: {
        Row: {
          id: string
          userId: string
          tier: string
          stripeCustomerId: string | null
          stripeSubscriptionId: string | null
          status: string
          expiresAt: string | null
          createdAt: string
        }
        Insert: {
          id?: string
          userId: string
          tier: string
          stripeCustomerId?: string | null
          stripeSubscriptionId?: string | null
          status?: string
          expiresAt?: string | null
          createdAt?: string
        }
        Update: {
          id?: string
          userId?: string
          tier?: string
          stripeCustomerId?: string | null
          stripeSubscriptionId?: string | null
          status?: string
          expiresAt?: string | null
          createdAt?: string
        }
      }
      notification: {
        Row: {
          id: string
          userId: string
          type: string
          fromUserId: string | null
          message: string | null
          read: boolean
          createdAt: string
        }
        Insert: {
          id?: string
          userId: string
          type: string
          fromUserId?: string | null
          message?: string | null
          read?: boolean
          createdAt?: string
        }
        Update: {
          id?: string
          userId?: string
          type?: string
          fromUserId?: string | null
          message?: string | null
          read?: boolean
          createdAt?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_connection_count: {
        Args: {
          user_id: string
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
