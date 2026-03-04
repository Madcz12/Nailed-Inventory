'use client';

import { useState, useEffect, useRef } from 'react';
import { FiArrowDown, FiArrowUp, FiRefreshCw, FiUploadCloud, FiTrash2, FiSearch } from 'react-icons/fi';
import { IoClose } from 'react-icons/io5';
import * as XLSX from 'xlsx';
import s from '@/styles/shared.module.scss';
import { Dialog } from '@headlessui/react';
/* import { Filter, Search } from "lucide-react"; */

// interface para el inventario
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
  const [items, setItems] = useState<InventoryItem[]>([]); // estado para los items
  const [loading, setLoading] = useState(true); // estado para el loading
  const [importing, setImporting] = useState(false); // estado para el importando
  const fileInputRef = useRef<HTMLInputElement>(null); // ref para el input de archivo
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // filtrar items por nombre o codigo
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    item.code.toLowerCase().includes(search.toLowerCase())
  );

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


  // manejo del archivo 
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return; // si no hay archivo, retorna

    setImporting(true); // se pone en true el estado de importando
    const reader = new FileReader();
    reader.onload = async (event) => { // cuando se carga el archivo
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer); // se convierte el archivo a un array de bytes
        const workbook = XLSX.read(data, { type: 'array' }); // se lee el archivo
        const sheetName = workbook.SheetNames[0]; // se obtiene el nombre de la hoja
        const worksheet = workbook.Sheets[sheetName]; // se obtiene la hoja
        const json = XLSX.utils.sheet_to_json(worksheet);

        // mapeo de columnas para nuestro formato esperado
        const mappedItems = json.map((row: any) => ({ // se mapea el archivo
          code: row['Código'] || row['Codigo'] || row['Code'] || '',
          name: row['Producto'] || row['Nombre'] || row['Name'] || '',
          category: row['Categoría'] || row['Categoria'] || row['Category'] || 'General',
          bottleSize: Number(row['Presentación'] || row['Presentacion'] || row['Tamaño'] || row['Size'] || 0),
          stock: Number(row['Cantidad'] || row['Stock'] || row['Existencias'] || 0),
          salePrice: Number(row['Precio'] || row['Price'] || 0),
        })).filter(item => item.code && item.name); // se filtra el archivo

        if (mappedItems.length === 0) {
          alert('No se encontraron datos válidos en el archivo. Verifique los encabezados.'); // si no hay datos, muestra un alert
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

  const handleClearInventory = async () => {
    if (!window.confirm('¿Estás seguro de que deseas limpiar todo el inventario? Esta acción eliminará permanentemente todos los productos y registros relacionados.')) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/inventory/clear', {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('Inventario limpiado con éxito.');
        setItems([]);
      } else {
        const error = await res.json();
        alert(`Error al limpiar el inventario: ${error.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Clear inventory error:', error);
      alert('Ocurrió un error al intentar limpiar el inventario.');
    } finally {
      setLoading(false);
    }
  };

  
  const handleRowClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
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
            <div className={s.searchWrapper}>
              <FiSearch className={s.searchIcon} size={18} style={{ color: '#8b46ff' }} />
              <input
                type="text"
                className={s.searchInput}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre o código..."
              />
              {search && (
                <button 
                  className={s.clearSearch} 
                  onClick={() => setSearch('')}
                  title="Limpiar búsqueda"
                >
                  <IoClose size={20} />
                </button>
              )}
            </div>
            <button 
              className={s.btnPrimary} 
              onClick={handleImportClick} 
              disabled={importing}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <FiUploadCloud size={18} /> {importing ? 'Importando...' : 'Importar Excel'}
            </button>
            <button 
              className={s.btnDanger} 
              onClick={handleClearInventory} 
              disabled={loading || items.length === 0}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <FiTrash2 size={18} /> Limpiar Inventario
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
              ) : filteredItems.length === 0 ? (
                <tr><td colSpan={8} className={s.emptyState}>No se encontraron productos</td></tr>
              ) : (
                filteredItems.map((item) => (
                  <tr 
                    key={item.id} 
                    onClick={() => handleRowClick(item)}
                    style={{ cursor: 'pointer' }}
                    className={selectedItem?.id === item.id ? s.selected : ''}
                  >
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

      <Dialog 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-lg w-full bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className={s.pageHeader} style={{ marginBottom: 0, padding: '24px 28px', background: '#f8f9fc', borderBottom: '1px solid #edf2f7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Dialog.Title className={s.pageTitle} style={{ fontSize: '1.25rem', marginBottom: '2px' }}>Detalles del Producto</Dialog.Title>
                <Dialog.Description className={s.pageSubtitle} style={{ fontSize: '0.875rem' }}>Información técnica y existencias</Dialog.Description>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <IoClose size={24} color="#64748b" />
              </button>
            </div>

            <div className={s.detailCard} style={{ border: 'none', boxShadow: 'none', padding: '28px' }}>
              <div className={s.detailGrid} style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                <div className={s.detailField}>
                  <div className={s.detailLabel}>Código</div>
                  <div className={s.detailValue} style={{ fontWeight: 700, color: '#8b46ff' }}>{selectedItem?.code}</div>
                </div>
                <div className={s.detailField}>
                  <div className={s.detailLabel}>Categoría</div>
                  <div className={s.detailValue}>{selectedItem?.category}</div>
                </div>
                <div className={s.detailField}>
                  <div className={s.detailLabel}>Producto</div>
                  <div className={s.detailValue}>{selectedItem?.name}</div>
                </div>
                <div className={s.detailField}>
                  <div className={s.detailLabel}>Presentación</div>
                  <div className={s.detailValue}>{selectedItem?.bottleSize} ml</div>
                </div>
                <div className={s.detailField}>
                  <div className={s.detailLabel}>Precio de Venta</div>
                  <div className={s.detailValue} style={{ color: '#22c55e', fontWeight: 600 }}>${selectedItem?.salePrice}</div>
                </div>
                <div className={s.detailField}>
                  <div className={s.detailLabel}>Stock Actual</div>
                  <div className={s.detailValue}>
                    <span className={`${s.statusBadge} ${selectedItem && selectedItem.stock > 0 ? s.active : s.inactive}`} style={{ fontSize: '0.9rem', padding: '4px 12px' }}>
                      {selectedItem?.stock} unidades
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '10px', padding: '16px', background: '#f1f5f9', borderRadius: '12px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
                 <div style={{ textAlign: 'center' }}>
                    <div className={s.detailLabel} style={{ marginBottom: '4px' }}>Total Entradas</div>
                    <div style={{ color: '#22c55e', fontWeight: 700, fontSize: '1.1rem' }}>+{selectedItem?.entries}</div>
                 </div>
                 <div style={{ width: '1px', background: '#cbd5e1' }}></div>
                 <div style={{ textAlign: 'center' }}>
                    <div className={s.detailLabel} style={{ marginBottom: '4px' }}>Total Salidas</div>
                    <div style={{ color: '#ef4444', fontWeight: 700, fontSize: '1.1rem' }}>-{selectedItem?.exits}</div>
                 </div>
              </div>

              <div className={s.detailActions} style={{ justifyContent: 'flex-end', marginTop: '24px' }}>
                <button 
                  className={s.btnSecondary} 
                  onClick={() => setIsModalOpen(false)}
                  style={{ minWidth: '120px' }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

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
