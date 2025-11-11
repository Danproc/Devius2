CREATE TYPE "public"."transaction_type" AS ENUM('credit', 'debit', 'expired');--> statement-breakpoint
CREATE TABLE "analytics_daily" (
	"username" text NOT NULL,
	"date" timestamp NOT NULL,
	"total_views" integer DEFAULT 0 NOT NULL,
	"unique_visitors" integer DEFAULT 0 NOT NULL,
	"qr_scans" integer DEFAULT 0 NOT NULL,
	"shares" integer DEFAULT 0 NOT NULL,
	"connection_requests" integer DEFAULT 0 NOT NULL,
	"countries" jsonb,
	"referrers" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "analytics_daily_username_date_pk" PRIMARY KEY("username","date")
);
--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" text NOT NULL,
	"devcard_id" text,
	"username" text NOT NULL,
	"visitor_id" text,
	"referrer" text,
	"country" text,
	"share_method" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blocked_users" (
	"user_id" text NOT NULL,
	"blocked_user_id" text NOT NULL,
	"blocked_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blocked_users_user_id_blocked_user_id_pk" PRIMARY KEY("user_id","blocked_user_id")
);
--> statement-breakpoint
CREATE TABLE "connections" (
	"requester_id" text NOT NULL,
	"recipient_id" text NOT NULL,
	"status" text NOT NULL,
	"message" text,
	"requested_at" timestamp DEFAULT now() NOT NULL,
	"responded_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "connections_requester_id_recipient_id_pk" PRIMARY KEY("requester_id","recipient_id")
);
--> statement-breakpoint
CREATE TABLE "contact" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"company" text,
	"message" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"read_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "coupon" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"userId" text,
	"createdAt" timestamp DEFAULT now(),
	"usedAt" timestamp,
	"expired" boolean DEFAULT false,
	CONSTRAINT "coupon_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "credit_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"transaction_type" "transaction_type" NOT NULL,
	"credit_type" text NOT NULL,
	"amount" integer NOT NULL,
	"payment_id" text,
	"expiration_date" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "devcards" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"github_username" text NOT NULL,
	"github_id" integer NOT NULL,
	"github_access_token_expires" timestamp,
	"url_slug" text NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"custom_domain" text,
	"custom_domain_verified" boolean DEFAULT false,
	"display_name" text,
	"custom_bio" text,
	"location" text,
	"avatar_url" text NOT NULL,
	"social_links" jsonb,
	"featured_repos" jsonb,
	"tech_stack" jsonb,
	"availability_status" text,
	"availability_message" text,
	"theme" jsonb,
	"view_count" integer DEFAULT 0 NOT NULL,
	"last_github_sync" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "devcards_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "devcards_url_slug_unique" UNIQUE("url_slug")
);
--> statement-breakpoint
CREATE TABLE "github_cache" (
	"id" text PRIMARY KEY NOT NULL,
	"devcard_id" text NOT NULL,
	"login" text NOT NULL,
	"name" text,
	"bio" text,
	"location" text,
	"email" text,
	"avatar_url" text NOT NULL,
	"html_url" text NOT NULL,
	"public_repos" integer DEFAULT 0 NOT NULL,
	"public_gists" integer DEFAULT 0 NOT NULL,
	"followers" integer DEFAULT 0 NOT NULL,
	"following" integer DEFAULT 0 NOT NULL,
	"total_stars" integer DEFAULT 0,
	"contribution_streak" integer DEFAULT 0,
	"repositories" jsonb,
	"contributions" jsonb,
	"cached_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"action_url" text,
	"metadata" jsonb,
	"is_read" boolean DEFAULT false NOT NULL,
	"is_dismissed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"read_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "paypal_access_tokens" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "paypal_context" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"plan_id" text,
	"user_id" text,
	"frequency" text NOT NULL,
	"paypal_order_id" text,
	"paypal_subscription_id" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"purchase_type" text DEFAULT 'plan' NOT NULL,
	"credit_type" text,
	"credit_amount" text
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"codename" text,
	"default" boolean DEFAULT false,
	"requiredCouponCount" integer DEFAULT 0,
	"hasOnetimePricing" boolean DEFAULT false,
	"hasMonthlyPricing" boolean DEFAULT false,
	"hasYearlyPricing" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now(),
	"monthlyPrice" integer,
	"monthlyPriceAnchor" integer,
	"monthlyStripePriceId" text,
	"monthlyLemonSqueezyVariantId" text,
	"monthlyDodoProductId" text,
	"monthlyPaypalPlanId" text,
	"yearlyPrice" integer,
	"yearlyPriceAnchor" integer,
	"yearlyStripePriceId" text,
	"yearlyLemonSqueezyVariantId" text,
	"yearlyDodoProductId" text,
	"yearlyPaypalPlanId" text,
	"onetimePrice" integer,
	"onetimePriceAnchor" integer,
	"onetimeStripePriceId" text,
	"onetimeLemonSqueezyVariantId" text,
	"onetimeDodoProductId" text,
	"onetimePaypalPlanId" text,
	"quotas" jsonb,
	"features" jsonb,
	CONSTRAINT "plans_codename_unique" UNIQUE("codename")
);
--> statement-breakpoint
CREATE TABLE "account" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "authenticator" (
	"credentialID" text NOT NULL,
	"userId" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"credentialPublicKey" text NOT NULL,
	"counter" integer NOT NULL,
	"credentialDeviceType" text NOT NULL,
	"credentialBackedUp" boolean NOT NULL,
	"transports" text,
	CONSTRAINT "authenticator_userId_credentialID_pk" PRIMARY KEY("userId","credentialID"),
	CONSTRAINT "authenticator_credentialID_unique" UNIQUE("credentialID")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"emailVerified" timestamp,
	"image" text,
	"password" text,
	"createdAt" timestamp DEFAULT now(),
	"credits" jsonb DEFAULT '{}'::jsonb,
	"github_id" integer,
	"github_username" text,
	"is_premium" boolean DEFAULT false NOT NULL,
	"premium_expires_at" timestamp,
	"stripeCustomerId" text,
	"stripeSubscriptionId" text,
	"lemonSqueezyCustomerId" text,
	"lemonSqueezySubscriptionId" text,
	"dodoCustomerId" text,
	"dodoSubscriptionId" text,
	"planId" text,
	CONSTRAINT "app_user_email_unique" UNIQUE("email"),
	CONSTRAINT "app_user_github_id_unique" UNIQUE("github_id"),
	CONSTRAINT "app_user_github_username_unique" UNIQUE("github_username")
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE "waitlist" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"twitterAccount" text,
	"email" text,
	"createdAt" timestamp DEFAULT now(),
	CONSTRAINT "waitlist_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_devcard_id_devcards_id_fk" FOREIGN KEY ("devcard_id") REFERENCES "public"."devcards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocked_users" ADD CONSTRAINT "blocked_users_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocked_users" ADD CONSTRAINT "blocked_users_blocked_user_id_app_user_id_fk" FOREIGN KEY ("blocked_user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_requester_id_app_user_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_recipient_id_app_user_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon" ADD CONSTRAINT "coupon_userId_app_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."app_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_userId_app_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devcards" ADD CONSTRAINT "devcards_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "github_cache" ADD CONSTRAINT "github_cache_devcard_id_devcards_id_fk" FOREIGN KEY ("devcard_id") REFERENCES "public"."devcards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paypal_context" ADD CONSTRAINT "paypal_context_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paypal_context" ADD CONSTRAINT "paypal_context_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_app_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "authenticator" ADD CONSTRAINT "authenticator_userId_app_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_app_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_user" ADD CONSTRAINT "app_user_planId_plans_id_fk" FOREIGN KEY ("planId") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_analytics_daily_date" ON "analytics_daily" USING btree ("date");--> statement-breakpoint
CREATE INDEX "idx_analytics_username_timestamp" ON "analytics_events" USING btree ("username","timestamp");--> statement-breakpoint
CREATE INDEX "idx_analytics_devcard_type" ON "analytics_events" USING btree ("devcard_id","event_type");--> statement-breakpoint
CREATE INDEX "idx_analytics_timestamp" ON "analytics_events" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "idx_blocked_users_user" ON "blocked_users" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_connections_recipient" ON "connections" USING btree ("recipient_id","status");--> statement-breakpoint
CREATE INDEX "idx_connections_requester" ON "connections" USING btree ("requester_id","status");--> statement-breakpoint
CREATE INDEX "idx_devcards_url_slug" ON "devcards" USING btree ("url_slug");--> statement-breakpoint
CREATE INDEX "idx_devcards_github_username" ON "devcards" USING btree ("github_username");--> statement-breakpoint
CREATE INDEX "idx_devcards_user_id" ON "devcards" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_github_cache_devcard_id" ON "github_cache" USING btree ("devcard_id");--> statement-breakpoint
CREATE INDEX "idx_github_cache_expires_at" ON "github_cache" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_notifications_user_unread" ON "notifications" USING btree ("user_id","is_read");--> statement-breakpoint
CREATE INDEX "idx_notifications_created" ON "notifications" USING btree ("created_at");