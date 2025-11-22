import { db } from "@/db";
import { plans } from "@/db/schema/plans";
import { users } from "@/db/schema/user";
import { render } from "@react-email/components";
import { eq } from "drizzle-orm";
import { appConfig } from "../config";
import Welcome from "@/emails/Welcome";
import sendMail from "../email/sendMail";
import { enableCredits, onRegisterCredits } from "../credits/config";
import { type CreditType } from "../credits/credits";
import { addCredits } from "../credits/recalculate";
import { addDays } from "date-fns";
import { createDevCard } from "../devcard/generate";

const onUserCreate = async (newUser: {
  id: string;
  email: string | null;
  name?: string | null;
}) => {
  const defaultPlan = await db
    .select()
    .from(plans)
    .where(eq(plans.default, true))
    .limit(1);

  if (defaultPlan.length > 0) {
    await db
      .update(users)
      .set({ planId: defaultPlan[0].id })
      .where(eq(users.id, newUser.id));
  }

  if (enableCredits) {
    // Add welcome credits based on configuration
    for (const [creditType, config] of Object.entries(onRegisterCredits)) {
      const expiryDate = config.expiryAfter
        ? addDays(new Date(), config.expiryAfter)
        : null;

      await addCredits(
        newUser.id,
        creditType as CreditType,
        config.amount,
        `welcome_credits_${creditType}_${newUser.id}`,
        {
          reason: "Welcome credits",
        },
        expiryDate
      );
    }
  }

  // TIP: Send welcome email to user

  const html = await render(
    Welcome({
      userName: newUser.name || "User",
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/app/dashboard`,
    })
  );
  await sendMail(newUser.email!, `Welcome to ${appConfig.projectName}`, html);

  // Create DevCard if user signed up with GitHub
  try {
    // Fetch user data to check if they have GitHub connected
    const [userData] = await db
      .select()
      .from(users)
      .where(eq(users.id, newUser.id))
      .limit(1);

    if (userData?.github_id && userData?.github_username) {
      // User has GitHub connected, create their DevCard
      const result = await createDevCard(newUser.id);
      console.log(`DevCard created for user ${newUser.id} at ${result.url}`);
    }
  } catch (error) {
    // Log error but don't fail user creation
    console.error('Failed to create DevCard on user signup:', error);
  }
};

export default onUserCreate;
