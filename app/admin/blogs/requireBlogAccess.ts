import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/adminAuth';

/** Sends anyone without blog access (e.g. "Price lists only" users) back to the dashboard. */
export async function requireBlogAccess(): Promise<void> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin/login/');
  if (!admin.permissions.includes('blogs:manage')) redirect('/admin/');
}
