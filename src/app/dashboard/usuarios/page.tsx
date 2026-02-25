'use client';

import { useState, useEffect } from 'react';
import { FiSave, FiRotateCcw, FiTrash2 } from 'react-icons/fi';
import s from '@/styles/shared.module.scss';

interface User {
  id: number;
  documentNumber: string;
  fullName: string;
  email: string;
  role: string;
  status: boolean;
}

const emptyForm = {
  documentNumber: '',
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'OPERADOR',
  status: 'true',
};

export default function UsuariosPage() {
  const [form, setForm] = useState(emptyForm);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: string }[]>([]);

  const toast = (msg: string, type = 'success') => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  };

  const fetchUsers = async () => {
    const res = await fetch('/api/users', { cache: 'no-store' });
    if (res.ok) setUsers(await res.json());
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelect = (user: User) => {
    if (selectedId === user.id) {
      setSelectedId(null);
      setForm(emptyForm);
    } else {
      setSelectedId(user.id);
      setForm({
        documentNumber: user.documentNumber,
        fullName: user.fullName,
        email: user.email,
        password: '',
        confirmPassword: '',
        role: user.role,
        status: String(user.status),
      });
    }
  };

  const handleSave = async () => {
    if (!form.documentNumber || !form.fullName || !form.email) {
      return toast('Complete los campos obligatorios', 'error');
    }
    if (!selectedId && form.password !== form.confirmPassword) {
      return toast('Las contraseñas no coinciden', 'error');
    }
    if (!selectedId && !form.password) {
      return toast('Ingrese una contraseña', 'error');
    }

    const method = selectedId ? 'PUT' : 'POST';
    const body = { ...form, status: form.status === 'true', id: selectedId };

    const res = await fetch('/api/users', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) {
      toast(selectedId ? 'Usuario actualizado' : 'Usuario registrado');
      setForm(emptyForm);
      setSelectedId(null);
      fetchUsers();
    } else {
      const err = await res.json();
      toast(err.error || 'Error al guardar', 'error');
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return toast('Seleccione un usuario', 'error');
    const res = await fetch('/api/users', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selectedId }) });
    if (res.ok) {
      toast('Usuario eliminado');
      setForm(emptyForm);
      setSelectedId(null);
      fetchUsers();
    }
  };

  const handleClear = () => {
    setForm(emptyForm);
    setSelectedId(null);
  };

  return (
    <>
      <div className={s.toastContainer}>
        {toasts.map((t) => <div key={t.id} className={`${s.toast} ${s[`toast--${t.type}`]}`}>{t.msg}</div>)}
      </div>

      <div className={s.pageHeader}>
        <h1 className={s.pageTitle}>Usuarios</h1>
        <p className={s.pageSubtitle}>Gestión de usuarios del sistema</p>
      </div>

      <div className={s.formTableLayout}>
        <div className={s.formSide}>
          <h3 className={s.formTitle}>{selectedId ? 'Modificar Usuario' : 'Registrar Usuario'}</h3>
          <div className={s.formGrid}>
            <div className={s.fieldGroup}>
              <label className={s.fieldLabel}>Nro Documento</label>
              <input className={s.fieldInput} name="documentNumber" value={form.documentNumber} onChange={handleChange} placeholder="Ej: V-12345678" />
            </div>
            <div className={s.fieldGroup}>
              <label className={s.fieldLabel}>Nombre Completo</label>
              <input className={s.fieldInput} name="fullName" value={form.fullName} onChange={handleChange} placeholder="Nombre y apellido" />
            </div>
            <div className={s.fieldGroup}>
              <label className={s.fieldLabel}>Correo</label>
              <input className={s.fieldInput} name="email" type="email" value={form.email} onChange={handleChange} placeholder="correo@ejemplo.com" />
            </div>
            <div className={s.fieldGroup}>
              <label className={s.fieldLabel}>Contraseña</label>
              <input className={s.fieldInput} name="password" type="password" value={form.password} onChange={handleChange} placeholder={selectedId ? 'Dejar vacío para no cambiar' : 'Contraseña'} />
            </div>
            <div className={s.fieldGroup}>
              <label className={s.fieldLabel}>Confirmar Contraseña</label>
              <input className={s.fieldInput} name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Repetir contraseña" />
            </div>
            <div className={s.fieldGroup}>
              <label className={s.fieldLabel}>Rol</label>
              <select className={s.fieldSelect} name="role" value={form.role} onChange={handleChange}>
                <option value="OPERADOR">Operador</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
            <div className={s.fieldGroup}>
              <label className={s.fieldLabel}>Estado</label>
              <select className={s.fieldSelect} name="status" value={form.status} onChange={handleChange}>
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>
          <div className={s.formActions}>
            <button className={s.btnPrimary} onClick={handleSave}><FiSave size={16} /> Guardar</button>
            <button className={s.btnSecondary} onClick={handleClear}><FiRotateCcw size={16} /> Limpiar</button>
            <button className={s.btnDanger} onClick={handleDelete}><FiTrash2 size={16} /> Borrar</button>
          </div>
        </div>

        <div className={s.tableSide}>
          <h3 className={s.tableTitle}>Usuarios Registrados</h3>
          <div className={s.tableWrapper}>
            <table className={s.dataTable}>
              <thead>
                <tr>
                  <th className={s.checkboxCell}></th>
                  <th>Nro Documento</th>
                  <th>Nombre Completo</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={6} className={s.emptyState}>No hay usuarios registrados</td></tr>
                ) : users.map((u) => (
                  <tr key={u.id} className={selectedId === u.id ? s.selected : ''}>
                    <td className={s.checkboxCell}>
                      <input type="checkbox" className={s.checkbox} checked={selectedId === u.id} onChange={() => handleSelect(u)} />
                    </td>
                    <td>{u.documentNumber}</td>
                    <td>{u.fullName}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>
                      <span className={`${s.statusBadge} ${u.status ? s.active : s.inactive}`}>
                        <span className={s.statusDot}></span>
                        {u.status ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
