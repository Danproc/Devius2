/**
 * Plan Management Page
 * Redirects to the billing page where subscription management is handled
 */

import { redirect } from 'next/navigation';

export default function PlanPage() {
  redirect('/app/billing');
}
