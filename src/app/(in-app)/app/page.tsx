import { redirect } from 'next/navigation';

/**
 * /app redirects to /app/dashboard
 * This is the default authenticated app route for DevCard V2
 */
export default function AppPage() {
  redirect('/app/dashboard');
}
