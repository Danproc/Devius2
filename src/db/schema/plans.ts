import {
  boolean,
  timestamp,
  pgTable,
  text,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";
import { z } from "zod";

export const quotaSchema = z.object({
  permiumSupport: z.boolean().default(true),
  monthlyImages: z.number(),
  somethingElse: z.string(),
});

export type Quotas = z.infer<typeof quotaSchema>;

export const defaultQuotas: Quotas = {
  permiumSupport: false,
  monthlyImages: 10,
  somethingElse: "something",
};

export const plans = pgTable("plans", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  codename: text("codename").unique(),
  default: boolean("default").default(false),

  // Premium tier identification
  tier_code: text("tier_code").unique(), // 'premium', 'premium_pro', etc. - maps to users.premium_tier
  active: boolean("active").default(true).notNull(), // Controls tier visibility on pricing page

  requiredCouponCount: integer("requiredCouponCount").default(0), // For LTD plans: Number of coupons required to redeem the plan

  hasOnetimePricing: boolean("hasOnetimePricing").default(false),
  hasMonthlyPricing: boolean("hasMonthlyPricing").default(false),
  hasYearlyPricing: boolean("hasYearlyPricing").default(false),

  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),

  monthlyPrice: integer("monthlyPrice"),
  monthlyPriceAnchor: integer("monthlyPriceAnchor"),
  monthlyStripePriceId: text("monthlyStripePriceId"),
  monthlyLemonSqueezyVariantId: text("monthlyLemonSqueezyVariantId"),
  monthlyDodoProductId: text("monthlyDodoProductId"),
  // Paypal plan id
  monthlyPaypalPlanId: text("monthlyPaypalPlanId"),

  yearlyPrice: integer("yearlyPrice"),
  yearlyPriceAnchor: integer("yearlyPriceAnchor"),
  yearlyStripePriceId: text("yearlyStripePriceId"),
  yearlyLemonSqueezyVariantId: text("yearlyLemonSqueezyVariantId"),
  yearlyDodoProductId: text("yearlyDodoProductId"),
  yearlyPaypalPlanId: text("yearlyPaypalPlanId"),
  
  onetimePrice: integer("onetimePrice"),
  onetimePriceAnchor: integer("onetimePriceAnchor"),
  onetimeStripePriceId: text("onetimeStripePriceId"),
  onetimeLemonSqueezyVariantId: text("onetimeLemonSqueezyVariantId"),
  onetimeDodoProductId: text("onetimeDodoProductId"),
  onetimePaypalPlanId: text("onetimePaypalPlanId"), // Not Required, Added for standardization

  quotas: jsonb("quotas").$type<Quotas>(),

  // DevCard Features (DevCard V2)
  features: jsonb('features').$type<{
    custom_themes?: boolean;
    custom_domain?: boolean;
    advanced_analytics?: boolean;
    priority_support?: boolean;
    organization_profiles?: boolean;
  }>(),
});
