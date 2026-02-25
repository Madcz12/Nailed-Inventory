'use client';

import { useState, useEffect } from 'react';
import { FiSave, FiRotateCcw, FiTrash2 } from 'react-icons/fi';
import s from '@/styles/shared.module.scss';

interface Client {
  id: number;
  documentNumber: string;
  fullName: string;
  email: string;
  phone: string;
  status: boolean;
}

const emptyForm = { documentNumber: '', fullName: '', email: '', phone: '', status: 'true' };

export default function ClientesPage() {
  const [form, setForm] = useState(emptyForm);
  const [items, setItems] = useState<Client[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: string }[]>([]);

  const toast = (msg: string, type = 'success') => { const id = Date.now(); setToasts(t => [...t, { id, msg, type }]); setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000); };
  const fetchData = async () => { const r = await fetch('/api/clients', { cache: 'no-store' }); if (r.ok) setItems(await r.json()); };
  useEffect(() => { fetchData(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSelect = (item: Client) => {
    if (selectedId === item.id) { setSelectedId(null); setForm(emptyForm); }
    else { setSelectedId(item.id); setForm({ documentNumber: item.documentNumber, fullName: item.fullName, email: item.email, phone: item.phone, status: String(item.status) }); }
  };

  const handleSave = async () => {
    if (!form.documentNumber || !form.fullName) return toast('Complete los campos obligatorios', 'error');
    const method = selectedId ? 'PUT' : 'POST';
    const body = { ...form, status: form.status === 'true', id: selectedId };
    const res = await fetch('/api/clients', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) { toast(selectedId ? 'Cliente actualizado' : 'Cliente registrado'); setForm(emptyForm); setSelectedId(null); fetchData(); }
    else { const err = await res.json(); toast(err.error || 'Error', 'error'); }
  };

  const handleDelete = async () => {
    if (!selectedId) return toast('Seleccione un cliente', 'error');
    const res = await fetch('/api/clients', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selectedId }) });
    if (res.ok) { toast('Cliente eliminado'); setForm(emptyForm); setSelectedId(null); fetchData(); }
  };

  return (
    <>
      <div className="toast-container">{toasts.map(t => <div key={t.id} className={`toast toast--${t.type}`}>{t.msg}</div>)}</div>
      <div className={s.pageHeader}><h1 className={s.pageTitle}>Clientes</h1><p className={s.pageSubtitle}>Gestión de clientes</p></div>
      <div className={s.formTableLayout}>
        <div className={s.formSide}>
          <h3 className={s.formTitle}>{selectedId ? 'Modificar Cliente' : 'Registrar Cliente'}</h3>
          <div className={s.formGrid}>
            <div className={s.fieldGroup}><label className={s.fieldLabel}>Nro Documento</label><input className={s.fieldInput} name="documentNumber" value={form.documentNumber} onChange={handleChange} placeholder="Ej: V-12345678" /></div>
            <div className={s.fieldGroup}><label className={s.fieldLabel}>Nombre Completo</label><input className={s.fieldInput} name="fullName" value={form.fullName} onChange={handleChange} placeholder="Nombre y apellido" /></div>
            <div className={s.fieldGroup}><label className={s.fieldLabel}>Correo</label><input className={s.fieldInput} name="email" type="email" value={form.email} onChange={handleChange} placeholder="correo@ejemplo.com" /></div>
            <div className={s.fieldGroup}><label className={s.fieldLabel}>Teléfono</label><input className={s.fieldInput} name="phone" value={form.phone} onChange={handleChange} placeholder="+58 412-1234567" /></div>
            <div className={s.fieldGroup}><label className={s.fieldLabel}>Estado</label><select className={s.fieldSelect} name="status" value={form.status} onChange={handleChange}><option value="true">Activo</option><option value="false">Inactivo</option></select></div>
          </div>
          <div className={s.formActions}>
            <button className={s.btnPrimary} onClick={handleSave}><FiSave size={16} /> Guardar</button>
            <button className={s.btnSecondary} onClick={() => { setForm(emptyForm); setSelectedId(null); }}><FiRotateCcw size={16} /> Limpiar</button>
            <button className={s.btnDanger} onClick={handleDelete}><FiTrash2 size={16} /> Borrar</button>
          </div>
        </div>
        <div className={s.tableSide}>
          <h3 className={s.tableTitle}>Clientes Registrados</h3>
          <div className={s.tableWrapper}>
            <table className={s.dataTable}>
              <thead><tr><th className={s.checkboxCell}></th><th>Nro Documento</th><th>Nombre</th><th>Correo</th><th>Teléfono</th><th>Estado</th></tr></thead>
              <tbody>
                {items.length === 0 ? <tr><td colSpan={6} className={s.emptyState}>No hay clientes registrados</td></tr> : items.map(c => (
                  <tr key={c.id} className={selectedId === c.id ? s.selected : ''}>
                    <td className={s.checkboxCell}><input type="checkbox" className={s.checkbox} checked={selectedId === c.id} onChange={() => handleSelect(c)} /></td>
                    <td>{c.documentNumber}</td><td>{c.fullName}</td><td>{c.email}</td><td>{c.phone}</td>
                    <td><span className={`${s.statusBadge} ${c.status ? s.active : s.inactive}`}><span className={s.statusDot}></span>{c.status ? 'Activo' : 'Inactivo'}</span></td>
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
