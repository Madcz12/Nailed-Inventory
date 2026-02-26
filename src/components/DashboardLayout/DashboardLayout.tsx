'use client';

import Sidebar from '@/components/Sidebar/Sidebar';
import Header from '@/components/Header/Header';
import styles from './DashboardLayout.module.scss';

interface User {
  userId: number;
  email: string;
  role: string;
  name: string;
}

export default function DashboardLayout({ 
  children, 
  user 
}: { 
  children: React.ReactNode;
  user: User | null;
}) {
  return (
    <div className={styles.layout}>
      <Sidebar user={user} />
      <div className={styles.main}>
        <Header user={user} />
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
}
