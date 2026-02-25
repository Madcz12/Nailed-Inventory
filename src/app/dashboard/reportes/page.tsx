'use client';

import { useState, useEffect } from 'react';
import { FiSearch, FiChevronRight } from 'react-icons/fi';
import s from '@/styles/shared.module.scss';

interface Supplier { id: number; documentNumber: string; companyName: string; }

interface ReportRow {
  id: number;
  date: string;
  documentType: string;
  documentNumber: string;
  totalAmount: number;
  userName: string;
  clientDocument: string;
  clientName: string;
  productCode: string;
  productName: string;
  category: string;
  salePrice: number;
  quantity: number;
  subtotal: number;
}

const filterOptions = [
  { value: '', label: 'Todos los campos' },
  { value: 'date', label: 'Fecha de registro' },
  { value: 'documentType', label: 'Tipo de documento' },
  { value: 'documentNumber', label: 'Número de documento' },
  { value: 'totalAmount', label: 'Monto total' },
  { value: 'userName', label: 'Usuario registrado' },
  { value: 'clientDocument', label: 'Documento cliente' },
  { value: 'clientName', label: 'Nombre cliente' },
  { value: 'productCode', label: 'Código de producto' },
  { value: 'productName', label: 'Nombre de producto' },
  { value: 'category', label: 'Categoría' },
  { value: 'salePrice', label: 'Precio venta' },
  { value: 'quantity', label: 'Cantidad' },
  { value: 'subtotal', label: 'Subtotal' },
];

export default function ReportesPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [results, setResults] = useState<ReportRow[]>([]);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [filterColumn, setFilterColumn] = useState('');
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: string }[]>([]);

  const toast = (msg: string, type = 'success') => { const id = Date.now(); setToasts(t => [...t, { id, msg, type }]); setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000); };

  useEffect(() => { fetch('/api/suppliers').then(r => r.json()).then(setSuppliers).catch(() => {}); }, []);

  const handleSearch = async () => {
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    if (supplierId) params.set('supplierId', supplierId);

    const r = await fetch(`/api/reports?${params.toString()}`);
    if (r.ok) {
      const data = await r.json();
      setResults(data);
      if (data.length === 0) toast('No se encontraron resultados', 'info');
    } else {
      toast('Error al buscar', 'error');
    }
  };

  const visibleColumns = filterColumn
    ? ['date', 'documentType', 'documentNumber', 'totalAmount', 'userName', 'clientDocument', 'clientName', 'productCode', 'productName', 'category', 'salePrice', 'quantity', 'subtotal'].filter(c => c === filterColumn)
    : ['date', 'documentType', 'documentNumber', 'totalAmount', 'userName', 'clientDocument', 'clientName', 'productCode', 'productName', 'category', 'salePrice', 'quantity', 'subtotal'];

  const columnLabels: Record<string, string> = {
    date: 'Fecha', documentType: 'Tipo Doc', documentNumber: 'Nro Doc', totalAmount: 'Monto Total',
    userName: 'Usuario', clientDocument: 'Doc Cliente', clientName: 'Nombre Cliente',
    productCode: 'Cod Producto', productName: 'Producto', category: 'Categoría',
    salePrice: 'P. Venta', quantity: 'Cantidad', subtotal: 'Subtotal',
  };

  const formatCell = (row: ReportRow, col: string) => {
    const val = row[col as keyof ReportRow];
    if (col === 'date') return new Date(val as string).toLocaleDateString('es-VE');
    if (['totalAmount', 'salePrice', 'subtotal'].includes(col)) return Number(val).toFixed(2);
    return String(val ?? '-');
  };

  return (
    <>
      <div className="toast-container">{toasts.map(t => <div key={t.id} className={`toast toast--${t.type}`}>{t.msg}</div>)}</div>

      <div className={s.pageHeader}><h1 className={s.pageTitle}>Reportes</h1><p className={s.pageSubtitle}>Consulta y análisis de operaciones</p></div>

      <div className={s.filterBar}>
        <div className={s.filterField}>
          <label>Fecha Inicio</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div className={s.filterField}>
          <label>Fecha Fin</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
        <div className={s.filterField}>
          <label>Proveedor</label>
          <select value={supplierId} onChange={e => setSupplierId(e.target.value)}>
            <option value="">Todos</option>
            {suppliers.map(p => <option key={p.id} value={p.id}>{p.companyName}</option>)}
          </select>
        </div>
        <button className={s.btnPrimary} onClick={handleSearch}><FiSearch size={16} /> Buscar</button>
      </div>

      <div className={s.tableSide} style={{ marginTop: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 className={s.tableTitle} style={{ margin: 0 }}>Resultados</h3>
          <div className={s.filterField} style={{ minWidth: 220 }}>
            <select value={filterColumn} onChange={e => setFilterColumn(e.target.value)}>
              {filterOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div className={s.tableWrapper}>
          <table className={s.dataTable}>
            <thead>
              <tr>
                <th style={{ width: 40 }}></th>
                {visibleColumns.map(col => <th key={col}>{columnLabels[col]}</th>)}
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr><td colSpan={visibleColumns.length + 1} className={s.emptyState}>Sin resultados. Use los filtros para buscar.</td></tr>
              ) : results.map((row) => (
                <tr key={row.id} className={selectedRow === row.id ? s.selected : ''}>
                  <td>
                    <button
                      className={`${s.selectRow} ${selectedRow === row.id ? s.selectedRow : ''}`}
                      onClick={() => setSelectedRow(selectedRow === row.id ? null : row.id)}
                    >
                      <FiChevronRight size={14} />
                    </button>
                  </td>
                  {visibleColumns.map(col => <td key={col}>{formatCell(row, col)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
