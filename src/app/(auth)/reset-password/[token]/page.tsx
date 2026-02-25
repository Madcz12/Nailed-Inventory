'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import styles from '../../auth.module.scss';

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al restablecer contraseña');
      }

      setSuccess('Tu contraseña ha sido actualizada correctamente. Ahora puedes iniciar sesión.');
      
      // Redirect after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al restablecer contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h1 className={styles.logo}>Nailed</h1>
        <p className={styles.subtitle}>Restablecer Contraseña</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {success && (
          <div className={styles.successBox}>{success}</div>
        )}

        {error && (
          <div className={styles.errorBox}>{error}</div>
        )}

        {!success && (
          <>
            <Input
              id="password"
              type="password"
              label="Nueva Contraseña"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />

            <Input
              id="confirmPassword"
              type="password"
              label="Confirmar Contraseña"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
            />

            <Button
              type="submit"
              fullWidth
              isLoading={loading}
            >
              Restablecer Contraseña
            </Button>
          </>
        )}

        <div className={styles.footer}>
          Regresar al{' '}
          <Link href="/login" className={styles.link}>
            Inicio de sesión
          </Link>
        </div>
      </form>
    </div>
  );
}
