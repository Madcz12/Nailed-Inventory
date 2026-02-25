'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import styles from '../auth.module.scss';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get('registered') === 'true';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h1 className={styles.logo}>Nailed</h1>
        <p className={styles.subtitle}>Ingresa a tu cuenta para continuar</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {justRegistered && (
          <div className={styles.successBox}>
            ¡Registro exitoso! Ahora puedes iniciar sesión.
          </div>
        )}

        {error && (
          <div className={styles.errorBox}>{error}</div>
        )}

        <Input
          id="email"
          type="email"
          label="Correo Electrónico"
          placeholder="nombre@ejemplo.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        <Input
          id="password"
          type="password"
          label="Contraseña"
          placeholder="••••••••"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />

        <div className={styles.forgotPassword}>
          <Link href="/forgot-password" className={styles.link}>
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button
          type="submit"
          fullWidth
          isLoading={loading}
        >
          Iniciar Sesión
        </Button>

        <div className={styles.footer}>
          ¿No tienes una cuenta?{' '}
          <Link href="/register" className={styles.link}>
            Regístrate aquí
          </Link>
        </div>
      </form>
    </div>
  );
}
