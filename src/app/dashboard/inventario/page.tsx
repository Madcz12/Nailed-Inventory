'use client';

import { useState, useEffect, useRef } from 'react';
import { FiArrowDown, FiArrowUp, FiRefreshCw, FiUploadCloud } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import s from '@/styles/shared.module.scss';

interface InventoryItem {
  id: number;
  code: string;
  name: string;
  category: string;
  bottleSize: number;
  salePrice: number;
  entries: number;
  exits: number;
  stock: number;
}

export default function InventarioPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inventory', { cache: 'no-store' });
      if (res.ok) {
        setItems(await res.json());
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        // Map column names to our expected format
        const mappedItems = json.map((row: any) => ({
          code: row['Código'] || row['Codigo'] || row['Code'] || '',
          name: row['Producto'] || row['Nombre'] || row['Name'] || '',
          category: row['Categoría'] || row['Categoria'] || row['Category'] || 'General',
          bottleSize: Number(row['Presentación'] || row['Presentacion'] || row['Tamaño'] || row['Size'] || 0),
          stock: Number(row['Cantidad'] || row['Stock'] || row['Existencias'] || 0),
          salePrice: Number(row['Precio'] || row['Price'] || 0),
        })).filter(item => item.code && item.name);

        if (mappedItems.length === 0) {
          alert('No se encontraron datos válidos en el archivo. Verifique los encabezados.');
          return;
        }

        const res = await fetch('/api/inventory/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: mappedItems })
        });

        if (res.ok) {
          const result = await res.json();
          alert(`Importación exitosa: ${result.created} creados, ${result.skipped} omitidos.`);
          fetchData();
        } else {
          alert('Error al importar los datos.');
        }
      } catch (error) {
        console.error('Import error:', error);
        alert('Ocurrió un error al procesar el archivo.');
      } finally {
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <>
      <div className={s.pageHeader}>
        <h1 className={s.pageTitle}>Inventario de Producto</h1>
        <p className={s.pageSubtitle}>Control de existencias, entradas y salidas</p>
      </div>

      <div className={s.tableSide} style={{ marginTop: '0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 className={s.tableTitle}>Resumen de Existencias</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept=".xlsx, .xls, .csv" 
              onChange={handleFileUpload}
            />
            <button 
              className={s.btnPrimary} 
              onClick={handleImportClick} 
              disabled={importing}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <FiUploadCloud size={18} /> {importing ? 'Importando...' : 'Importar Excel'}
            </button>
            <button className={s.btnSecondary} onClick={fetchData} disabled={loading}>
              <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Actualizar
            </button>
          </div>
        </div>

        <div className={s.tableWrapper}>
          <table className={s.dataTable}>
            <thead>
              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th>Presentación</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <FiArrowDown color="#22c55e" /> Entradas
                  </div>
                </th>
                <th>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <FiArrowUp color="#ef4444" /> Salidas
                  </div>
                </th>
                <th>Stock Actual</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className={s.emptyState}>Cargando inventario...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={8} className={s.emptyState}>No hay productos registrados</td></tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: '600' }}>{item.code}</td>
                    <td>{item.name}</td>
                    <td>{item.bottleSize} ml</td>
                    <td>{item.category}</td>
                    <td>${item.salePrice || 0}</td>
                    <td style={{ color: '#22c55e', fontWeight: '500' }}>+{item.entries}</td>
                    <td style={{ color: '#ef4444', fontWeight: '500' }}>-{item.exits}</td>
                    <td>
                      <span className={`${s.statusBadge} ${item.stock > 0 ? s.active : s.inactive}`}>
                        <span className={s.statusDot}></span>
                        {item.stock} unidades
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
