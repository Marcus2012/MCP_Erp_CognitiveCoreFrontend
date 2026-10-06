import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  Package, 
  Users, 
  ShoppingCart, 
  FileCheck, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { MOCK_ODOO_PARTNERS, MOCK_ODOO_PRODUCTS, MOCK_ODOO_ORDERS } from '@/services/mockData';
import { OdooPartner, OdooProduct, OdooSaleOrder } from '@/types';

interface OdooWorkspaceProps {
  onAskAgent: (query: string) => void;
}

export const OdooWorkspace: React.FC<OdooWorkspaceProps> = ({ onAskAgent }) => {
  const [activeSection, setActiveSection] = useState<'products' | 'orders' | 'partners'>('products');
  const [search, setSearch] = useState('');

  const filteredProducts = MOCK_ODOO_PRODUCTS.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.defaultCode.toLowerCase().includes(search.toLowerCase())
  );

  const filteredPartners = MOCK_ODOO_PARTNERS.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  const filteredOrders = MOCK_ODOO_ORDERS.filter(o => 
    o.name.toLowerCase().includes(search.toLowerCase()) || 
    o.partnerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950/40 overflow-y-auto p-6 space-y-6">
      {/* Top Banner & Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900/60 to-slate-950 border border-purple-500/20 backdrop-blur-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-white">Odoo ERP Connector</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                MCP Sincronizado
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Instancia: <code className="text-purple-300 font-mono">odoo.empresa.com</code> (v17 Enterprise | DB: <code className="text-slate-300">erp_prod_2026</code>)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onAskAgent('Realiza un resumen ejecutivo de las ventas y stock crítico en Odoo')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition shadow-lg shadow-purple-600/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Auditoría IA de Odoo</span>
          </button>
        </div>
      </div>

      {/* Section Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 w-full sm:w-auto">
          <button
            onClick={() => setActiveSection('products')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition ${
              activeSection === 'products'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Inventario & Stock</span>
            <span className="text-[10px] px-1.5 rounded-full bg-slate-800 text-slate-400">{MOCK_ODOO_PRODUCTS.length}</span>
          </button>

          <button
            onClick={() => setActiveSection('orders')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition ${
              activeSection === 'orders'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Órdenes de Venta</span>
            <span className="text-[10px] px-1.5 rounded-full bg-slate-800 text-slate-400">{MOCK_ODOO_ORDERS.length}</span>
          </button>

          <button
            onClick={() => setActiveSection('partners')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition ${
              activeSection === 'partners'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Clientes & Partners</span>
            <span className="text-[10px] px-1.5 rounded-full bg-slate-800 text-slate-400">{MOCK_ODOO_PARTNERS.length}</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar en Odoo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
          />
        </div>
      </div>

      {/* Content Table / Cards */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 overflow-hidden backdrop-blur-sm">
        {activeSection === 'products' && (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 font-medium">
              <tr>
                <th className="py-3 px-4">Producto</th>
                <th className="py-3 px-4">Referencia (SKU)</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4">Stock Disponible</th>
                <th className="py-3 px-4">Precio Lista</th>
                <th className="py-3 px-4 text-right">Acción IA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3.5 px-4 font-medium text-slate-100">{p.name}</td>
                  <td className="py-3.5 px-4 font-mono text-purple-300">{p.defaultCode}</td>
                  <td className="py-3.5 px-4 text-slate-400">{p.category}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                      p.qtyAvailable < 10 ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                    }`}>
                      {p.qtyAvailable} uds
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-200 font-medium">{p.listPrice.toLocaleString()} €</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onAskAgent(`Consulta el stock detallado y movimientos de ${p.name} (${p.defaultCode}) en Odoo`)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition text-[11px]"
                    >
                      <Sparkles className="w-3 h-3" />
                      Consultar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeSection === 'orders' && (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 font-medium">
              <tr>
                <th className="py-3 px-4">Nº Pedido</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acción IA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-cyan-300">{o.name}</td>
                  <td className="py-3.5 px-4 text-slate-200 font-medium">{o.partnerName}</td>
                  <td className="py-3.5 px-4 text-slate-400">{o.dateOrder}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-100">{o.amountTotal.toLocaleString()} €</td>
                  <td className="py-3.5 px-4">
                    <span className="capitalize px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-medium">
                      {o.state}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onAskAgent(`Explícame el estado de la orden ${o.name} de Odoo y prepara un mensaje de actualización para el cliente`)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition text-[11px]"
                    >
                      <Sparkles className="w-3 h-3" />
                      Analizar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeSection === 'partners' && (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 font-medium">
              <tr>
                <th className="py-3 px-4">Nombre / Empresa</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Teléfono</th>
                <th className="py-3 px-4">Ciudad</th>
                <th className="py-3 px-4">Total Facturado</th>
                <th className="py-3 px-4 text-right">Acción IA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPartners.map((pt) => (
                <tr key={pt.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3.5 px-4 font-semibold text-slate-100">{pt.name}</td>
                  <td className="py-3.5 px-4 text-slate-300 font-mono">{pt.email}</td>
                  <td className="py-3.5 px-4 text-slate-400">{pt.phone}</td>
                  <td className="py-3.5 px-4 text-slate-400">{pt.city}</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-semibold">{pt.totalInvoiced.toLocaleString()} €</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onAskAgent(`Crea un presupuesto para el cliente ${pt.name} en Odoo`)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition text-[11px]"
                    >
                      <Sparkles className="w-3 h-3" />
                      Crear SO
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
