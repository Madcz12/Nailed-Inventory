'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FiUsers,
  FiSettings,
  FiUserCheck,
  FiTruck,
  FiShoppingCart,
  FiDollarSign,
  FiBarChart2,
  FiChevronLeft,
  FiMenu,
  FiPackage
} from 'react-icons/fi';
import styles from './Sidebar.module.scss';

const menuItems = [
  { label: 'Usuarios', icon: FiUsers, href: '/dashboard/usuarios' },
  { label: 'Mantenedor', icon: FiSettings, href: '/dashboard/mantenedor' },
  { label: 'Inventario', icon: FiPackage, href: '/dashboard/inventario' },
  { label: 'Clientes', icon: FiUserCheck, href: '/dashboard/clientes' },
  { label: 'Proveedores', icon: FiTruck, href: '/dashboard/proveedores' },
  { label: 'Compras', icon: FiShoppingCart, href: '/dashboard/compras' },
  { label: 'Ventas', icon: FiDollarSign, href: '/dashboard/ventas' },
  { label: 'Reportes', icon: FiBarChart2, href: '/dashboard/reportes' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.logo}>
        {!collapsed && (
          <Link href="/dashboard" className={styles.logoLink}>
            <span className={styles.logoText}>💅 Nailed</span>
          </Link>
        )}
        <button
          className={styles.toggleBtn}
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <FiMenu size={20} /> : <FiChevronLeft size={20} />}
        </button>
      </div>

      <nav className={styles.nav}>
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              title={item.label}
            >
              <item.icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        {!collapsed && (
          <p className={styles.footerText}>Nailed Inventory v1.0</p>
        )}
      </div>
    </aside>
  );
}
