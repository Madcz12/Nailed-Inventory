'use client';

import { useState, useEffect } from 'react';
import { FiSave, FiRotateCcw, FiTrash2, FiUpload } from 'react-icons/fi';
import s from '@/styles/shared.module.scss';

// ============== TYPES ==============
interface Category { id: number; description: string; status: boolean; }
interface Product { id: number; code: string; name: string; description: string; categoryId: number; status: boolean; bottleSize: number; unitQuantity: number; salePrice: number; stock: number; category?: Category; }
interface Business { id: number; name: string; rif: string; address: string; logoUrl: string | null; }

// ============== COMPONENT ==============
// ... (lines 13-111 skipped for conciseness in this thought, but replace_file_content needs context)
export default function MantenedorPage() {
  const [activeTab, setActiveTab] = useState<'categoria' | 'producto' | 'negocio'>('categoria');

  return (
    <>
      <div className={s.pageHeader}>
        <h1 className={s.pageTitle}>Mantenedor</h1>
        <p className={s.pageSubtitle}>Gestión de categorías, productos y datos del negocio</p>
      </div>

      <div className={s.tabSwitcher}>
        <button className={`${s.tab} ${activeTab === 'categoria' ? s.activeTab : ''}`} onClick={() => setActiveTab('categoria')}>Categoría</button>
        <button className={`${s.tab} ${activeTab === 'producto' ? s.activeTab : ''}`} onClick={() => setActiveTab('producto')}>Producto</button>
        <button className={`${s.tab} ${activeTab === 'negocio' ? s.activeTab : ''}`} onClick={() => setActiveTab('negocio')}>Negocio</button>
      </div>

      {activeTab === 'categoria' && <CategoriaSection />}
      {activeTab === 'producto' && <ProductoSection />}
      {activeTab === 'negocio' && <NegocioSection />}
    </>
  );
}

// ============== CATEGORIA ==============
function CategoriaSection() {
  const emptyForm = { description: '', status: 'true' };
  const [form, setForm] = useState(emptyForm);
  const [items, setItems] = useState<Category[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: string }[]>([]);

  const toast = (msg: string, type = 'success') => {
    const id = Date.now(); setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  };

  const fetchData = async () => { const r = await fetch('/api/categories', { cache: 'no-store' }); if (r.ok) setItems(await r.json()); };
  useEffect(() => { fetchData(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSelect = (item: Category) => {
    if (selectedId === item.id) { setSelectedId(null); setForm(emptyForm); }
    else { setSelectedId(item.id); setForm({ description: item.description, status: String(item.status) }); }
  };

  const handleSave = async () => {
    if (!form.description) return toast('Ingrese una descripción', 'error');
    const method = selectedId ? 'PUT' : 'POST';
    const body = { ...form, status: form.status === 'true', id: selectedId };
    const res = await fetch('/api/categories', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) { toast(selectedId ? 'Categoría actualizada' : 'Categoría registrada'); setForm(emptyForm); setSelectedId(null); fetchData(); }
    else { const err = await res.json(); toast(err.error || 'Error', 'error'); }
  };

  const handleDelete = async () => {
    if (!selectedId) return toast('Seleccione una categoría', 'error');
    const res = await fetch('/api/categories', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selectedId }) });
    if (res.ok) { toast('Categoría eliminada'); setForm(emptyForm); setSelectedId(null); fetchData(); }
  };

  return (
    <>
      <div className="toast-container">{toasts.map(t => <div key={t.id} className={`toast toast--${t.type}`}>{t.msg}</div>)}</div>
      <div className={s.formTableLayout}>
        <div className={s.formSide}>
          <h3 className={s.formTitle}>{selectedId ? 'Modificar Categoría' : 'Registrar Categoría'}</h3>
          <div className={s.formGrid}>
            <div className={s.fieldGroup}><label className={s.fieldLabel}>Descripción</label><input className={s.fieldInput} name="description" value={form.description} onChange={handleChange} placeholder="Nombre de la categoría" /></div>
            <div className={s.fieldGroup}><label className={s.fieldLabel}>Estado</label><select className={s.fieldSelect} name="status" value={form.status} onChange={handleChange}><option value="true">Activo</option><option value="false">Inactivo</option></select></div>
          </div>
          <div className={s.formActions}>
            <button className={s.btnPrimary} onClick={handleSave}><FiSave size={16} /> Guardar</button>
            <button className={s.btnSecondary} onClick={() => { setForm(emptyForm); setSelectedId(null); }}><FiRotateCcw size={16} /> Limpiar</button>
            <button className={s.btnDanger} onClick={handleDelete}><FiTrash2 size={16} /> Borrar</button>
          </div>
        </div>
        <div className={s.tableSide}>
          <h3 className={s.tableTitle}>Categorías Registradas</h3>
          <div className={s.tableWrapper}>
            <table className={s.dataTable}>
              <thead><tr><th className={s.checkboxCell}></th><th>ID</th><th>Descripción</th><th>Estado</th></tr></thead>
              <tbody>
                {items.length === 0 ? <tr><td colSpan={4} className={s.emptyState}>No hay categorías</td></tr> : items.map(c => (
                  <tr key={c.id} className={selectedId === c.id ? s.selected : ''}>
                    <td className={s.checkboxCell}><input type="checkbox" className={s.checkbox} checked={selectedId === c.id} onChange={() => handleSelect(c)} /></td>
                    <td>{c.id}</td><td>{c.description}</td>
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

interface Product { id: number; code: string; name: string; description: string; categoryId: number; status: boolean; bottleSize: number; unitQuantity: number; stock: number; category?: Category; }
// ... (negocio skipped)

// ============== PRODUCTO ==============
function ProductoSection() {
  const emptyForm = { code: '', name: '', description: '', categoryId: '', status: 'true', bottleSize: '', unitQuantity: '1', salePrice: '', initialStock: '0' };
  const [form, setForm] = useState(emptyForm);
  const [items, setItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: string }[]>([]);

  const toast = (msg: string, type = 'success') => { const id = Date.now(); setToasts(t => [...t, { id, msg, type }]); setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000); };

  const fetchData = async () => {
    const [pRes, cRes] = await Promise.all([
      fetch('/api/products', { cache: 'no-store' }), 
      fetch('/api/categories', { cache: 'no-store' })
    ]);
    if (pRes.ok) setItems(await pRes.json());
    if (cRes.ok) setCategories(await cRes.json());
  };
  useEffect(() => { fetchData(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSelect = (item: Product) => {
    if (selectedId === item.id) { setSelectedId(null); setForm(emptyForm); }
    else { setSelectedId(item.id); setForm({ ...emptyForm, code: item.code, name: item.name, description: item.description || '', categoryId: String(item.categoryId), status: String(item.status), bottleSize: String(item.bottleSize), unitQuantity: String(item.unitQuantity), salePrice: String(item.salePrice || 0) }); }
  };

  const handleSave = async () => {
    if (!form.code || !form.name || !form.categoryId) return toast('Complete los campos obligatorios', 'error');
    const method = selectedId ? 'PUT' : 'POST';
    const body = { 
      ...form, 
      categoryId: Number(form.categoryId), 
      status: form.status === 'true', 
      id: selectedId,
      unitQuantity: Number(form.unitQuantity),
      bottleSize: Number(form.bottleSize),
      salePrice: Number(form.salePrice),
      initialStock: !selectedId ? Number(form.initialStock) : 0 
    };
    const res = await fetch('/api/products', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) { toast(selectedId ? 'Producto actualizado' : 'Producto registrado'); setForm(emptyForm); setSelectedId(null); fetchData(); }
    else { const err = await res.json(); toast(err.error || 'Error', 'error'); }
  };

  const handleDelete = async () => {
    if (!selectedId) return toast('Seleccione un producto', 'error');
    const res = await fetch('/api/products', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selectedId }) });
    if (res.ok) { toast('Producto eliminado'); setForm(emptyForm); setSelectedId(null); fetchData(); }
  };

  return (
    <>
      <div className="toast-container">{toasts.map(t => <div key={t.id} className={`toast toast--${t.type}`}>{t.msg}</div>)}</div>
      <div className={s.formTableLayout}>
        <div className={s.formSide}>
          <h3 className={s.formTitle}>{selectedId ? 'Modificar Producto' : 'Registrar Producto'}</h3>
          <div className={s.formGrid}>
            <div className={s.fieldGroup}><label className={s.fieldLabel}>Código</label><input className={s.fieldInput} name="code" value={form.code} onChange={handleChange} placeholder="Ej: PROD-001" /></div>
            <div className={s.fieldGroup}><label className={s.fieldLabel}>Producto (Nombre)</label><input className={s.fieldInput} name="name" value={form.name} onChange={handleChange} placeholder="Nombre del producto" /></div>
            <div className={s.fieldGroup}><label className={s.fieldLabel}>Presentación (Tamaño ml)</label><input className={s.fieldInput} name="bottleSize" type="number" value={form.bottleSize} onChange={handleChange} placeholder="Ej: 15" /></div>
            <div className={s.fieldGroup}><label className={s.fieldLabel}>Precio</label><input className={s.fieldInput} name="salePrice" type="number" value={form.salePrice} onChange={handleChange} placeholder="Ej: 15.00" /></div>
            <div className={s.fieldGroup}><label className={s.fieldLabel}>Unidades por Pack</label><input className={s.fieldInput} name="unitQuantity" type="number" value={form.unitQuantity} onChange={handleChange} placeholder="Ej: 12" /></div>
            {!selectedId && <div className={s.fieldGroup}><label className={s.fieldLabel}>Stock Inicial (Cantidad)</label><input className={s.fieldInput} name="initialStock" type="number" value={form.initialStock} onChange={handleChange} placeholder="Cantidad actual" /></div>}
            <div className={s.fieldGroup}>
              <label className={s.fieldLabel}>Categoría</label>
              <select className={s.fieldSelect} name="categoryId" value={form.categoryId} onChange={handleChange}>
                <option value="">Seleccione...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.description}</option>)}
              </select>
            </div>
            <div className={s.fieldGroup}><label className={s.fieldLabel}>Estado</label><select className={s.fieldSelect} name="status" value={form.status} onChange={handleChange}><option value="true">Activo</option><option value="false">Inactivo</option></select></div>
            <div className={s.fieldGroup} style={{ gridColumn: 'span 2' }}><label className={s.fieldLabel}>Descripción (Opcional)</label><input className={s.fieldInput} name="description" value={form.description} onChange={handleChange} placeholder="Detalles adicionales" /></div>
          </div>
          <div className={s.formActions}>
            <button className={s.btnPrimary} onClick={handleSave}><FiSave size={16} /> Guardar</button>
            <button className={s.btnSecondary} onClick={() => { setForm(emptyForm); setSelectedId(null); }}><FiRotateCcw size={16} /> Limpiar</button>
            <button className={s.btnDanger} onClick={handleDelete}><FiTrash2 size={16} /> Borrar</button>
          </div>
        </div>
        <div className={s.tableSide}>
          <h3 className={s.tableTitle}>Productos Registrados</h3>
          <div className={s.tableWrapper}>
            <table className={s.dataTable}>
              <thead><tr><th className={s.checkboxCell}></th><th>Código</th><th>Producto</th><th>Presentación</th><th>Precio</th><th>Estado</th></tr></thead>
              <tbody>
                {items.length === 0 ? <tr><td colSpan={6} className={s.emptyState}>No hay productos</td></tr> : items.map(p => (
                   <tr key={p.id} className={selectedId === p.id ? s.selected : ''}>
                    <td className={s.checkboxCell}><input type="checkbox" className={s.checkbox} checked={selectedId === p.id} onChange={() => handleSelect(p)} /></td>
                    <td>{p.code}</td><td>{p.name}</td><td>{p.bottleSize} ml</td><td>${p.salePrice || 0}</td>
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

// ============== NEGOCIO ==============
function NegocioSection() {
  const emptyForm = { name: '', rif: '', address: '' };
  const [form, setForm] = useState(emptyForm);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [items, setItems] = useState<Business[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: string }[]>([]);

  const toast = (msg: string, type = 'success') => { const id = Date.now(); setToasts(t => [...t, { id, msg, type }]); setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000); };

  const fetchData = async () => { const r = await fetch('/api/businesses', { cache: 'no-store' }); if (r.ok) setItems(await r.json()); };
  useEffect(() => { fetchData(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSelect = (item: Business) => {
    if (selectedId === item.id) { setSelectedId(null); setForm(emptyForm); setLogoFile(null); }
    else { setSelectedId(item.id); setForm({ name: item.name, rif: item.rif, address: item.address }); setLogoFile(null); }
  };

  const handleSave = async () => {
    if (!form.name || !form.rif || !form.address) return toast('Complete todos los campos', 'error');

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('rif', form.rif);
    formData.append('address', form.address);
    if (selectedId) formData.append('id', String(selectedId));
    if (logoFile) formData.append('logo', logoFile);

    const method = selectedId ? 'PUT' : 'POST';
    const res = await fetch('/api/businesses', { method, body: formData });
    if (res.ok) { toast(selectedId ? 'Negocio actualizado' : 'Negocio registrado'); setForm(emptyForm); setSelectedId(null); setLogoFile(null); fetchData(); }
    else { const err = await res.json(); toast(err.error || 'Error', 'error'); }
  };

  const handleDelete = async () => {
    if (!selectedId) return toast('Seleccione un negocio', 'error');
    const res = await fetch('/api/businesses', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selectedId }) });
    if (res.ok) { toast('Negocio eliminado'); setForm(emptyForm); setSelectedId(null); fetchData(); }
  };

  return (
    <>
      <div className="toast-container">{toasts.map(t => <div key={t.id} className={`toast toast--${t.type}`}>{t.msg}</div>)}</div>
      <div className={s.formTableLayout}>
        <div className={s.formSide}>
          <h3 className={s.formTitle}>{selectedId ? 'Modificar Negocio' : 'Registrar Negocio'}</h3>
          <div className={s.formGrid}>
            <div className={s.fieldGroup}><label className={s.fieldLabel}>Nombre del Negocio</label><input className={s.fieldInput} name="name" value={form.name} onChange={handleChange} placeholder="Nombre del negocio" /></div>
            <div className={s.fieldGroup}><label className={s.fieldLabel}>RIF</label><input className={s.fieldInput} name="rif" value={form.rif} onChange={handleChange} placeholder="J-12345678-9" /></div>
            <div className={s.fieldGroup}><label className={s.fieldLabel}>Dirección</label><input className={s.fieldInput} name="address" value={form.address} onChange={handleChange} placeholder="Dirección del negocio" /></div>
            <div className={s.fieldGroup}>
              <label className={s.fieldLabel}>Logo</label>
              <div className={s.fileUpload}>
                <label className={s.fileUploadBtn}><FiUpload size={14} /> Cargar imagen<input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} /></label>
                {logoFile && <span className={s.fileName}>{logoFile.name}</span>}
              </div>
            </div>
          </div>
          <div className={s.formActions}>
            <button className={s.btnPrimary} onClick={handleSave}><FiSave size={16} /> Guardar</button>
            <button className={s.btnSecondary} onClick={() => { setForm(emptyForm); setSelectedId(null); setLogoFile(null); }}><FiRotateCcw size={16} /> Limpiar</button>
            <button className={s.btnDanger} onClick={handleDelete}><FiTrash2 size={16} /> Borrar</button>
          </div>
        </div>
        <div className={s.tableSide}>
          <h3 className={s.tableTitle}>Negocios Registrados</h3>
          <div className={s.tableWrapper}>
            <table className={s.dataTable}>
              <thead><tr><th className={s.checkboxCell}></th><th>ID</th><th>Nombre</th><th>RIF</th><th>Dirección</th></tr></thead>
              <tbody>
                {items.length === 0 ? <tr><td colSpan={5} className={s.emptyState}>No hay negocios</td></tr> : items.map(b => (
                  <tr key={b.id} className={selectedId === b.id ? s.selected : ''}>
                    <td className={s.checkboxCell}><input type="checkbox" className={s.checkbox} checked={selectedId === b.id} onChange={() => handleSelect(b)} /></td>
                    <td>{b.id}</td><td>{b.name}</td><td>{b.rif}</td><td>{b.address}</td>
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
