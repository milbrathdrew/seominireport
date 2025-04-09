import { redirect } from 'next/navigation';

export default function ActionPlanPage() {
  // Redirect to admin page as action items functionality has been removed
  redirect('/admin');
} 