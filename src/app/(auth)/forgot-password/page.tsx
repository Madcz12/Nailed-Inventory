'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import styles from '../auth.module.scss';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al solicitar recuperación');
      }

      setSuccess('Si el correo existe, recibirás un enlace de recuperación pronto.');
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al solicitar recuperación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h1 className={styles.logo}>Nailed</h1>
        <p className={styles.subtitle}>Recuperar Contraseña</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '10px', textAlign: 'center' }}>
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
        </p>

        {success && (
          <div className={styles.successBox}>{success}</div>
        )}

        {error && (
          <div className={styles.errorBox}>{error}</div>
        )}

        {!success && (
          <>
            <Input
              id="email"
              type="email"
              label="Correo Electrónico"
              placeholder="nombre@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button
              type="submit"
              fullWidth
              isLoading={loading}
            >
              Enviar Enlace
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
