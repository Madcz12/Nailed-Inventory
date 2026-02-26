'use client';

import { useState, useEffect } from 'react';
import { FiSave, FiUser, FiMail, FiLock, FiCheckCircle } from 'react-icons/fi';
import s from '@/styles/shared.module.scss';

export default function PerfilPage() {
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    documentNumber: '',
    status: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: string }[]>([]);

  const toast = (msg: string, type = 'success') => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/auth/me'); // Assuming there's an endpoint to get current user
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setForm({
          fullName: data.fullName || '',
          email: data.email || '',
          password: '',
          confirmPassword: '',
          documentNumber: data.documentNumber || '',
          status: data.status ?? true,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email) {
      return toast('Nombre y correo son obligatorios', 'error');
    }
    if (form.password && form.password !== form.confirmPassword) {
      return toast('Las contraseñas no coinciden', 'error');
    }

    setSaving(true);
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          fullName: form.fullName,
          email: form.email,
          password: form.password || undefined,
          role: user.role, // Keep role
          status: user.status, // Keep status
          documentNumber: user.documentNumber, // Keep doc
        }),
      });

      if (res.ok) {
        toast('Perfil actualizado correctamente');
        // Optionally refresh page or update global state
      } else {
        const err = await res.json();
        toast(err.error || 'Error al actualizar', 'error');
      }
    } catch (error) {
      toast('Error de conexión', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={s.loading}>Cargando...</div>;

  return (
    <>
      <div className={s.toastContainer}>
        {toasts.map((t) => (
          <div key={t.id} className={`${s.toast} ${s[`toast--${t.type}`]}`}>
            {t.msg}
          </div>
        ))}
      </div>

      <div className={s.pageHeader}>
        <h1 className={s.pageTitle}>Mi Perfil</h1>
        <p className={s.pageSubtitle}>Configura tu información personal y contraseña</p>
      </div>

      <div className={s.formCard} style={{ maxWidth: '600px', margin: '0 auto' }}>
        <form onSubmit={handleSave} className={s.formGrid}>
          <div className={s.fieldGroup}>
            <label className={s.fieldLabel}>
              <FiUser size={14} /> Nombre Completo
            </label>
            <input
              className={s.fieldInput}
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Tu nombre"
              required
            />
          </div>

          <div className={s.fieldGroup}>
            <label className={s.fieldLabel}>
              <FiMail size={14} /> Correo Electrónico
            </label>
            <input
              className={s.fieldInput}
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
              required
            />
          </div>

          <div style={{ gridColumn: '1 / -1', margin: '10px 0', borderTop: '1px solid #eee', paddingTop: '20px' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '15px' }}>Cambiar Contraseña</h3>
            <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '15px' }}>
              Deja estos campos vacíos si no deseas cambiar tu contraseña actual.
            </p>
          </div>

          <div className={s.fieldGroup}>
            <label className={s.fieldLabel}>
              <FiLock size={14} /> Nueva Contraseña
            </label>
            <input
              className={s.fieldInput}
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div className={s.fieldGroup}>
            <label className={s.fieldLabel}>
              <FiLock size={14} /> Confirmar Contraseña
            </label>
            <input
              className={s.fieldInput}
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Repite la contraseña"
            />
          </div>

          <div className={s.formActions} style={{ gridColumn: '1 / -1', marginTop: '20px' }}>
            <button type="submit" className={s.btnPrimary} disabled={saving} style={{ width: '100%' }}>
              <FiSave size={16} /> {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
