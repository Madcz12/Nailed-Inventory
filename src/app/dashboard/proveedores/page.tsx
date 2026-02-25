'use client';

import { useState, useEffect } from 'react';
import { FiSave, FiRotateCcw, FiTrash2 } from 'react-icons/fi';
import s from '@/styles/shared.module.scss';

interface Supplier {
  id: number;
  documentNumber: string;
  companyName: string;
  email: string;
  phone: string;
  status: boolean;
}

const emptyForm = { documentNumber: '', companyName: '', email: '', phone: '', status: 'true' };

export default function ProveedoresPage() {
  const [form, setForm] = useState(emptyForm);
  const [items, setItems] = useState<Supplier[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: string }[]>([]);

  const toast = (msg: string, type = 'success') => { const id = Date.now(); setToasts(t => [...t, { id, msg, type }]); setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000); };
  const fetchData = async () => { const r = await fetch('/api/suppliers', { cache: 'no-store' }); if (r.ok) setItems(await r.json()); };
  useEffect(() => { fetchData(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSelect = (item: Supplier) => {
    if (selectedId === item.id) { setSelectedId(null); setForm(emptyForm); }
    else { setSelectedId(item.id); setForm({ documentNumber: item.documentNumber, companyName: item.companyName, email: item.email, phone: item.phone, status: String(item.status) }); }
  };

  const handleSave = async () => {
    if (!form.documentNumber || !form.companyName) return toast('Complete los campos obligatorios', 'error');
    const method = selectedId ? 'PUT' : 'POST';
    const body = { ...form, status: form.status === 'true', id: selectedId };
    const res = await fetch('/api/suppliers', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) { toast(selectedId ? 'Proveedor actualizado' : 'Proveedor registrado'); setForm(emptyForm); setSelectedId(null); fetchData(); }
    else { const err = await res.json(); toast(err.error || 'Error', 'error'); }
  };

  const handleDelete = async () => {
    if (!selectedId) return toast('Seleccione un proveedor', 'error');
    const res = await fetch('/api/suppliers', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selectedId }) });
    if (res.ok) { toast('Proveedor eliminado'); setForm(emptyForm); setSelectedId(null); fetchData(); }
  };

  return (
    <>
      <div className="toast-container">{toasts.map(t => <div key={t.id} className={`toast toast--${t.type}`}>{t.msg}</div>)}</div>
      <div className={s.pageHeader}><h1 className={s.pageTitle}>Proveedores</h1><p className={s.pageSubtitle}>Gestión de proveedores</p></div>
      <div className={s.formTableLayout}>
        <div className={s.formSide}>
          <h3 className={s.formTitle}>{selectedId ? 'Modificar Proveedor' : 'Registrar Proveedor'}</h3>
          <div className={s.formGrid}>
            <div className={s.fieldGroup}><label className={s.fieldLabel}>Nro Documento</label><input className={s.fieldInput} name="documentNumber" value={form.documentNumber} onChange={handleChange} placeholder="Ej: J-12345678-9" /></div>
            <div className={s.fieldGroup}><label className={s.fieldLabel}>Razón Social</label><input className={s.fieldInput} name="companyName" value={form.companyName} onChange={handleChange} placeholder="Nombre de la empresa" /></div>
            <div className={s.fieldGroup}><label className={s.fieldLabel}>Correo</label><input className={s.fieldInput} name="email" type="email" value={form.email} onChange={handleChange} placeholder="correo@empresa.com" /></div>
            <div className={s.fieldGroup}><label className={s.fieldLabel}>Teléfono</label><input className={s.fieldInput} name="phone" value={form.phone} onChange={handleChange} placeholder="+58 212-1234567" /></div>
            <div className={s.fieldGroup}><label className={s.fieldLabel}>Estado</label><select className={s.fieldSelect} name="status" value={form.status} onChange={handleChange}><option value="true">Activo</option><option value="false">Inactivo</option></select></div>
          </div>
          <div className={s.formActions}>
            <button className={s.btnPrimary} onClick={handleSave}><FiSave size={16} /> Guardar</button>
            <button className={s.btnSecondary} onClick={() => { setForm(emptyForm); setSelectedId(null); }}><FiRotateCcw size={16} /> Limpiar</button>
            <button className={s.btnDanger} onClick={handleDelete}><FiTrash2 size={16} /> Borrar</button>
          </div>
        </div>
        <div className={s.tableSide}>
          <h3 className={s.tableTitle}>Proveedores Registrados</h3>
          <div className={s.tableWrapper}>
            <table className={s.dataTable}>
              <thead><tr><th className={s.checkboxCell}></th><th>Nro Documento</th><th>Razón Social</th><th>Correo</th><th>Teléfono</th><th>Estado</th></tr></thead>
              <tbody>
                {items.length === 0 ? <tr><td colSpan={6} className={s.emptyState}>No hay proveedores registrados</td></tr> : items.map(p => (
                  <tr key={p.id} className={selectedId === p.id ? s.selected : ''}>
                    <td className={s.checkboxCell}><input type="checkbox" className={s.checkbox} checked={selectedId === p.id} onChange={() => handleSelect(p)} /></td>
                    <td>{p.documentNumber}</td><td>{p.companyName}</td><td>{p.email}</td><td>{p.phone}</td>
                    <td><span className={`${s.statusBadge} ${p.status ? s.active : s.inactive}`}><span className={s.statusDot}></span>{p.status ? 'Activo' : 'Inactivo'}</span></td>
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
