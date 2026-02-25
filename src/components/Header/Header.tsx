'use client';

import { useRouter } from 'next/navigation';
import { FiBell, FiUser, FiLogOut } from 'react-icons/fi';
import styles from './Header.module.scss';
import { useState } from 'react';

export default function Header() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <h2 className={styles.greeting}>Panel de Control</h2>
      </div>
      <div className={styles.right}>
        <button className={styles.iconBtn} aria-label="Notificaciones">
          <FiBell size={18} />
        </button>
        <div className={styles.userBadge}>
          <div className={styles.avatar}>
            <FiUser size={16} />
          </div>
          <span className={styles.userName}>Admin</span>
        </div>
        <button
          className={`${styles.iconBtn} ${styles.logoutBtn}`}
          aria-label="Cerrar sesión"
          onClick={handleLogout}
          disabled={loggingOut}
          title="Cerrar sesión"
        >
          <FiLogOut size={18} />
        </button>
      </div>
    </header>
  );
}
