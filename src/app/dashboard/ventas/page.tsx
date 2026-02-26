'use client';

import { useState, useEffect } from 'react';
import { FiSave, FiPlus, FiTrash2, FiSearch, FiDownload } from 'react-icons/fi';
import s from '@/styles/shared.module.scss';

interface Client { id: number; documentNumber: string; fullName: string; }
interface Product { id: number; code: string; name: string; salePrice: number; stock: number; }
interface CartItem { productId: number; code: string; name: string; price: number; stock: number; quantity: number; }
interface SaleDetail {
  id: number; date: string; documentType: string; documentNumber: string;
  client: { documentNumber: string; fullName: string; };
  user: { fullName: string; };
  items: { product: { code: string; name: string; }; price: number; quantity: number; }[];
}

export default function VentasPage() {
  const [activeTab, setActiveTab] = useState<'registrar' | 'detalle'>('registrar'); // estado para el tab
  return (
    <>
      <div className={s.pageHeader}><h1 className={s.pageTitle}>Ventas</h1><p className={s.pageSubtitle}>Registro y consulta de ventas</p></div>
      <div className={s.tabSwitcher}>
        <button className={`${s.tab} ${activeTab === 'registrar' ? s.activeTab : ''}`} onClick={() => setActiveTab('registrar')}>Registrar</button>
        <button className={`${s.tab} ${activeTab === 'detalle' ? s.activeTab : ''}`} onClick={() => setActiveTab('detalle')}>Ver Detalle</button>
      </div>
      {activeTab === 'registrar' ? <RegistrarVenta /> : <VerDetalle />}
    </>
  );
}

function RegistrarVenta() {
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], documentType: 'FACTURA', documentNumber: '' });
  const [clientDoc, setClientDoc] = useState('');
  const [client, setClient] = useState<Client | null>(null);
  const [productCode, setProductCode] = useState('');
  const [product, setProduct] = useState<Product | null>(null);
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: string }[]>([]);

  const toast = (msg: string, type = 'success') => { const id = Date.now(); setToasts(t => [...t, { id, msg, type }]); setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000); };
  useEffect(() => { fetch('/api/products').then(r => r.json()).then(setProducts).catch(() => {}); }, []);

  const searchClient = async () => { // funcion para buscar cliente
    if (!clientDoc) return;
    const r = await fetch(`/api/clients?documentNumber=${clientDoc}`); // peticion para buscar cliente
    if (r.ok) { const data = await r.json(); if (Array.isArray(data) && data.length > 0) { setClient(data[0]); } else if (data.id) { setClient(data); } else { toast('Cliente no encontrado', 'error'); setClient(null); } }
  };

  const searchProduct = () => {
    const found = products.find(p => p.code === productCode);
    if (found) { setProduct(found); setPrice(String(found.salePrice)); } else toast('Producto no encontrado', 'error');
  };

  const addToCart = () => {
    if (!product || !price || !quantity) return toast('Complete los datos del producto', 'error');
    if (Number(quantity) > product.stock) return toast('Stock insuficiente', 'error');
    setCart([...cart, { productId: product.id, code: product.code, name: product.name, price: Number(price), stock: product.stock, quantity: Number(quantity) }]);
    setProductCode(''); setProduct(null); setPrice(''); setQuantity('');
  };

  const removeFromCart = (idx: number) => setCart(cart.filter((_, i) => i !== idx));
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleSave = async () => {
    if (!form.documentNumber || !client || cart.length === 0) return toast('Complete toda la información', 'error');
    const body = { date: form.date, documentType: form.documentType, documentNumber: form.documentNumber, clientId: client.id, userId: 1, items: cart.map(i => ({ productId: i.productId, price: i.price, quantity: i.quantity })) };
    const res = await fetch('/api/sales', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) { toast('Venta registrada exitosamente'); setForm({ date: new Date().toISOString().split('T')[0], documentType: 'FACTURA', documentNumber: '' }); setClientDoc(''); setClient(null); setCart([]); }
    else { const err = await res.json(); toast(err.error || 'Error', 'error'); }
  };

  return (
    <>
      <div className="toast-container">{toasts.map(t => <div key={t.id} className={`toast toast--${t.type}`}>{t.msg}</div>)}</div>
      <div className={s.detailCard}>
        <h3 className={s.sectionTitle}>Información de la Venta</h3>
        <div className={s.inlineFields} style={{ marginBottom: 20 }}>
          <div className={s.fieldGroup}><label className={s.fieldLabel}>Fecha</label><input className={s.fieldInput} type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
          <div className={s.fieldGroup}><label className={s.fieldLabel}>Tipo de Documento</label><select className={s.fieldSelect} value={form.documentType} onChange={e => setForm({ ...form, documentType: e.target.value })}><option>FACTURA</option><option>NOTA DE ENTREGA</option><option>TICKET</option></select></div>
          <div className={s.fieldGroup}><label className={s.fieldLabel}>Nro Documento</label><input className={s.fieldInput} value={form.documentNumber} onChange={e => setForm({ ...form, documentNumber: e.target.value })} placeholder="Nro de documento" /></div>
        </div>

        <h3 className={s.sectionTitle}>Información del Cliente</h3>
        <div className={s.inlineFields} style={{ marginBottom: 20 }}>
          <div className={s.fieldGroup}>
            <label className={s.fieldLabel}>Cédula</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className={s.fieldInput} value={clientDoc} onChange={e => setClientDoc(e.target.value)} placeholder="Buscar cliente..." />
              <button className={s.btnSecondary} onClick={searchClient} style={{ padding: '8px 12px' }}><FiSearch size={16} /></button>
            </div>
          </div>
          <div className={s.fieldGroup}><label className={s.fieldLabel}>Nombre Completo</label><input className={s.fieldInput} value={client?.fullName || ''} readOnly /></div>
        </div>

        <h3 className={s.sectionTitle}>Información del Producto</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr 0.7fr auto', gap: 12, alignItems: 'flex-end', marginBottom: 16 }}>
          <div className={s.fieldGroup}>
            <label className={s.fieldLabel}>Cod Producto</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className={s.fieldInput} value={productCode} onChange={e => setProductCode(e.target.value)} placeholder="Código" />
              <button className={s.btnSecondary} onClick={searchProduct} style={{ padding: '8px 12px' }}><FiSearch size={16} /></button>
            </div>
          </div>
          <div className={s.fieldGroup}><label className={s.fieldLabel}>Producto</label><input className={s.fieldInput} value={product?.name || ''} readOnly /></div>
          <div className={s.fieldGroup}><label className={s.fieldLabel}>Precio</label><input className={s.fieldInput} type="number" value={price} onChange={e => setPrice(e.target.value)} /></div>
          <div className={s.fieldGroup}><label className={s.fieldLabel}>Cantidad</label><input className={s.fieldInput} type="number" value={quantity} onChange={e => setQuantity(e.target.value)} /></div>
          <button className={s.btnSuccess} onClick={addToCart} style={{ height: 42 }}><FiPlus size={16} /></button>
        </div>

        <div className={s.tableWrapper}>
          <table className={s.dataTable}>
            <thead><tr><th>Código</th><th>Producto</th><th>Precio</th><th>Cant</th><th>Subtotal</th><th></th></tr></thead>
            <tbody>
              {cart.length === 0 ? <tr><td colSpan={6} className={s.emptyState}>Agregue productos</td></tr> : cart.map((item, i) => (
                <tr key={i}><td>{item.code}</td><td>{item.name}</td><td>{item.price.toFixed(2)}</td><td>{item.quantity}</td><td>{(item.price * item.quantity).toFixed(2)}</td>
                  <td><button className={s.btnDanger} onClick={() => removeFromCart(i)} style={{ padding: '4px 8px' }}><FiTrash2 size={14} /></button></td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={s.totalRow}><span>Total:</span><span>{total.toFixed(2)}</span></div>
        <div className={s.detailActions}><button className={s.btnPrimary} onClick={handleSave}><FiSave size={16} /> Registrar Venta</button></div>
      </div>
    </>
  );
}

function VerDetalle() {
  const [docNumber, setDocNumber] = useState('');
  const [detail, setDetail] = useState<SaleDetail | null>(null);
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: string }[]>([]);
  const toast = (msg: string, type = 'success') => { const id = Date.now(); setToasts(t => [...t, { id, msg, type }]); setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000); };

  const search = async () => { // funcion para buscar venta
    if (!docNumber) return;
    const r = await fetch(`/api/sales?documentNumber=${docNumber}`); // peticion para buscar venta
    if (r.ok) { const data = await r.json(); if (data) setDetail(data); else { toast('Venta no encontrada', 'error'); setDetail(null); } }
    else { toast('Venta no encontrada', 'error'); setDetail(null); }
  };

  const downloadPDF = async () => { // funcion para descargar pdf
    if (!detail) return;
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    const doc = new jsPDF();
    doc.setFontSize(18); doc.text('Detalle de Venta', 14, 22);
    doc.setFontSize(11);
    doc.text(`Documento: ${detail.documentNumber}`, 14, 35);
    doc.text(`Fecha: ${new Date(detail.date).toLocaleDateString('es-VE')}`, 14, 42);
    doc.text(`Tipo: ${detail.documentType}`, 14, 49);
    doc.text(`Cliente: ${detail.client.fullName} (${detail.client.documentNumber})`, 14, 56);
    doc.text(`Registrado por: ${detail.user.fullName}`, 14, 63);

    autoTable(doc, {
      startY: 72,
      head: [['Código', 'Producto', 'Precio', 'Cant', 'Subtotal']],
      body: detail.items.map(i => [i.product.code, i.product.name, i.price.toFixed(2), i.quantity, (i.price * i.quantity).toFixed(2)]),
    });

    const total = detail.items.reduce((a, i) => a + i.price * i.quantity, 0);
    const finalY = (doc as unknown as Record<string, number>).lastAutoTable?.finalY || 100;
    doc.setFontSize(12); doc.text(`Total: ${total.toFixed(2)}`, 14, finalY + 10);
    doc.save(`venta_${detail.documentNumber}.pdf`);
  };

  return (
    <>
      <div className="toast-container">{toasts.map(t => <div key={t.id} className={`toast toast--${t.type}`}>{t.msg}</div>)}</div>
      <div className={s.detailCard}>
        <h3 className={s.formTitle}>Buscar Venta</h3>
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <input className={s.fieldInput} value={docNumber} onChange={e => setDocNumber(e.target.value)} placeholder="Nro de documento de venta" style={{ maxWidth: 400 }} />
          <button className={s.btnPrimary} onClick={search}><FiSearch size={16} /> Buscar</button>
        </div>

        {detail && (
          <>
            <div className={s.detailGrid}>
              <div className={s.detailField}><div className={s.detailLabel}>Documento</div><div className={s.detailValue}>{detail.documentNumber}</div></div>
              <div className={s.detailField}><div className={s.detailLabel}>Fecha</div><div className={s.detailValue}>{new Date(detail.date).toLocaleDateString('es-VE')}</div></div>
              <div className={s.detailField}><div className={s.detailLabel}>Tipo</div><div className={s.detailValue}>{detail.documentType}</div></div>
              <div className={s.detailField}><div className={s.detailLabel}>Cliente</div><div className={s.detailValue}>{detail.client.fullName}</div></div>
              <div className={s.detailField}><div className={s.detailLabel}>Doc. Cliente</div><div className={s.detailValue}>{detail.client.documentNumber}</div></div>
              <div className={s.detailField}><div className={s.detailLabel}>Usuario</div><div className={s.detailValue}>{detail.user.fullName}</div></div>
            </div>

            <div className={s.tableWrapper}>
              <table className={s.dataTable}>
                <thead><tr><th>Código</th><th>Producto</th><th>Precio</th><th>Cant</th><th>Subtotal</th></tr></thead>
                <tbody>
                  {detail.items.map((item, i) => (
                    <tr key={i}><td>{item.product.code}</td><td>{item.product.name}</td><td>{item.price.toFixed(2)}</td><td>{item.quantity}</td><td>{(item.price * item.quantity).toFixed(2)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={s.totalRow}><span>Total:</span><span>{detail.items.reduce((a, i) => a + i.price * i.quantity, 0).toFixed(2)}</span></div>
            <div className={s.detailActions}><button className={s.btnPrimary} onClick={downloadPDF}><FiDownload size={16} /> Descargar PDF</button></div>
          </>
        )}
      </div>
    </>
  );
}
