import React from 'react';
import styles from './auth.module.scss';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.authWrapper}>
      <div className={styles.contentArea}>
        {children}
      </div>
    </div>
  );
}
