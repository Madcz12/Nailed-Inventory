import DashboardLayout from '@/components/DashboardLayout/DashboardLayout';
import { getSession } from '@/lib/auth';

export default async function DashLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  
  return <DashboardLayout user={session}>{children}</DashboardLayout>;
}
