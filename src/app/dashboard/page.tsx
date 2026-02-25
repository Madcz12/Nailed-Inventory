'use client';

import React, { useEffect, useState } from 'react';
import { FiUsers, FiShoppingBag, FiTruck, FiPieChart, FiPackage, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import s from '@/styles/shared.module.scss';
import Link from 'next/link';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F', '#FFBB28'];

interface DashboardStats {
  dailyData: any[];
  categoryStats: any[];
  summary: {
    totalClients: number;
    totalProducts: number;
    totalSales: number;
    currentStock: number;
  };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching stats:', err);
        setLoading(false);
      });
  }, []);

  const quickAccess = [
    { label: 'Productos', icon: <FiPackage size={20} />, link: '/dashboard/inventario', value: stats?.summary.totalProducts || 0, color: '#7c3aed' },
    { label: 'Clientes', icon: <FiUsers size={20} />, link: '/dashboard/clientes', value: stats?.summary.totalClients || 0, color: '#ec4899' },
    { label: 'Ventas Totales', icon: <FiShoppingBag size={20} />, link: '/dashboard/ventas', value: stats?.summary.totalSales || 0, color: '#f59e0b' },
    { label: 'Stock Actual', icon: <FiPieChart size={20} />, link: '/dashboard/inventario', value: stats?.summary.currentStock || 0, color: '#10b981' },
  ];

  if (loading) return <div className={s.pageHeader}><h1 className={s.pageTitle}>Cargando Dashboard...</h1></div>;

  return (
    <>
      <div className={s.pageHeader}>
        <h1 className={s.pageTitle}>Panel de Control</h1>
        <p className={s.pageSubtitle}>Resumen general de operaciones y rendimiento</p>
      </div>

      {/* Quick Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        {quickAccess.map((item, index) => (
          <Link href={item.link} key={index} style={{ textDecoration: 'none' }}>
            <div className={s.tableSide} style={{ 
              display: 'flex', 
              flexDirection: 'row', 
              alignItems: 'center', 
              gap: '15px', 
              padding: '20px',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}>
              <div style={{ 
                background: `${item.color}15`, 
                color: item.color, 
                padding: '12px', 
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center'
              }}>
                {item.icon}
              </div>
              <div>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '0.85rem', fontWeight: 500 }}>{item.label}</p>
                <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#1f2937' }}>{item.value}</h3>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        {/* Daily Movements Chart */}
        <div className={s.tableSide} style={{ padding: '20px' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '1.1rem', color: '#374151' }}>Movimientos de Inventario (7 días)</h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#F3F4F6' }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="entries" name="Entradas" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="exits" name="Salidas" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales vs Purchases Chart */}
        <div className={s.tableSide} style={{ padding: '20px' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '1.1rem', color: '#374151' }}>Ventas vs Compras ($)</h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.dailyData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="sales" name="Ventas" stroke="#7c3aed" fillOpacity={1} fill="url(#colorSales)" strokeWidth={3} />
                <Area type="monotone" dataKey="purchases" name="Compras" stroke="#ec4899" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 2fr', gap: '20px' }}>
        {/* Category Pie Chart */}
        <div className={s.tableSide} style={{ padding: '20px' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '1.1rem', color: '#374151' }}>Productos por Categoría</h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.categoryStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats?.categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Links / Recent Activity Mockup */}
        <div className={s.tableSide} style={{ padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ background: 'rgba(124, 58, 237, 0.05)', padding: '40px', borderRadius: '50%', marginBottom: '20px' }}>
            <FiPieChart size={60} color="#7c3aed" opacity={0.5} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '10px', color: '#1f2937' }}>Visión Clara de tu Negocio</h2>
          <p style={{ color: '#6b7280', maxWidth: '400px', margin: '0 auto 20px' }}>
            Utiliza estos gráficos para tomar decisiones basadas en datos reales sobre tus existencias, flujos de caja y preferencias de clientes.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link href="/dashboard/inventario" className={s.btnPrimary} style={{ textDecoration: 'none' }}>Revisar Stock</Link>
          </div>
        </div>
      </div>
    </>
  );
}

