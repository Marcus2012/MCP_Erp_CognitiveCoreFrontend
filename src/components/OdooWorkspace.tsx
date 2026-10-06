import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Search, 
  Package, 
  Users, 
  ShoppingCart, 
  FileCheck, 
  Sparkles, 
  RefreshCw, 
  Loader2, 
  Mail, 
  Phone, 
  Building2, 
  FileText,
  Plus,
  Edit2,
  X,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { OdooPartner, OdooProduct, OdooSaleOrder } from '@/types';
import { 
  fetchLiveContacts, 
  fetchLiveProducts, 
  fetchLiveOrders, 
  fetchLiveInvoices,
  createLiveContact,
  updateLiveContact,
  createLiveProduct,
  updateLiveProduct
} from '@/services/api';

interface OdooWorkspaceProps {
  onAskAgent: (query: string) => void;
}

export const OdooWorkspace: React.FC<OdooWorkspaceProps> = ({ onAskAgent }) => {
  const [activeSection, setActiveSection] = useState<'contacts' | 'products' | 'orders' | 'invoices'>('contacts');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [contacts, setContacts] = useState<OdooPartner[]>([]);
  const [products, setProducts] = useState<OdooProduct[]>([]);
  const [orders, setOrders] = useState<OdooSaleOrder[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);

  // Modals state
  const [showContactModal, setShowContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState<OdooPartner | null>(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    vat: '',
    street: '',
    city: 'Lima',
    is_company: false,
  });

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<OdooProduct | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    default_code: '',
    list_price: 100,
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cts, prds, ords, invs] = await Promise.all([
        fetchLiveContacts('', 50),
        fetchLiveProducts('', 50),
        fetchLiveOrders(undefined, 50),
        fetchLiveInvoices(50),
      ]);
      setContacts(cts);
      setProducts(prds);
      setOrders(ords);
      setInvoices(invs);
    } catch (err) {
      console.error('Error loading live Odoo 20 data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreateContact = () => {
    setEditingContact(null);
    setContactForm({
      name: '',
      email: '',
      phone: '',
      vat: '',
      street: '',
      city: 'Lima',
      is_company: false,
    });
    setShowContactModal(true);
  };

  const handleOpenEditContact = (c: OdooPartner) => {
    setEditingContact(c);
    setContactForm({
      name: c.name,
      email: c.email !== '-' ? c.email : '',
      phone: c.phone !== '-' ? c.phone : '',
      vat: c.vat !== '-' ? (c.vat || '') : '',
      street: c.street !== '-' ? (c.street || '') : '',
      city: c.city !== '-' ? c.city : 'Lima',
      is_company: c.isCompany || false,
    });
    setShowContactModal(true);
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name.trim()) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      if (editingContact) {
        await updateLiveContact(editingContact.id, {
          name: contactForm.name,
          email: contactForm.email || undefined,
          phone: contactForm.phone || undefined,
          vat: contactForm.vat || undefined,
          street: contactForm.street || undefined,
          city: contactForm.city || undefined,
        });
        setFeedback({ type: 'success', text: `Contacto "${contactForm.name}" actualizado en Odoo 20.` });
      } else {
        await createLiveContact(contactForm);
        setFeedback({ type: 'success', text: `Contacto "${contactForm.name}" creado en Odoo 20.` });
      }
      setShowContactModal(false);
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Error al guardar contacto.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenCreateProduct = () => {
    setEditingProduct(null);
    setProductForm({ name: '', default_code: '', list_price: 1500 });
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (p: OdooProduct) => {
    setEditingProduct(p);
    setProductForm({ name: p.name, default_code: p.defaultCode, list_price: p.listPrice });
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim()) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      if (editingProduct) {
        await updateLiveProduct(editingProduct.id, {
          name: productForm.name,
          list_price: Number(productForm.list_price),
          default_code: productForm.default_code,
        });
        setFeedback({ type: 'success', text: `Producto "${productForm.name}" actualizado en Odoo 20.` });
      } else {
        await createLiveProduct({
          name: productForm.name,
          default_code: productForm.default_code || `SKU-${Date.now().toString().slice(-4)}`,
          list_price: Number(productForm.list_price),
          type: 'service',
        });
        setFeedback({ type: 'success', text: `Producto "${productForm.name}" creado en Odoo 20.` });
      }
      setShowProductModal(false);
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Error al guardar producto.' });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredContacts = contacts.filter(c => 
    (c.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.vat || '').toLowerCase().includes(search.toLowerCase())
  );

  const filteredProducts = products.filter(p => 
    (p.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (p.defaultCode || '').toLowerCase().includes(search.toLowerCase())
  );

  const filteredOrders = orders.filter(o => 
    (o.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (o.partnerName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950/40 overflow-y-auto p-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900/60 to-slate-950 border border-purple-500/20 backdrop-blur-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-white">Odoo 20 Community CRU Workspace</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                Crear & Editar Activo
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Instancia: <code className="text-purple-300 font-mono">https://erp.cognitivecore.pe</code> (Conexión MCP en vivo)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {activeSection === 'contacts' && (
            <button
              onClick={handleOpenCreateContact}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition shadow-lg shadow-purple-600/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Contacto</span>
            </button>
          )}

          {activeSection === 'products' && (
            <button
              onClick={handleOpenCreateProduct}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition shadow-lg shadow-purple-600/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Producto</span>
            </button>
          )}

          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 text-xs font-medium transition"
            title="Recargar datos desde Odoo 20"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-purple-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
          feedback.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Section Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveSection('contacts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition ${
              activeSection === 'contacts'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Contactos</span>
            <span className="text-[10px] px-1.5 rounded-full bg-slate-800 text-slate-300 font-mono">{contacts.length}</span>
          </button>

          <button
            onClick={() => setActiveSection('products')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition ${
              activeSection === 'products'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Catálogo & Servicios</span>
            <span className="text-[10px] px-1.5 rounded-full bg-slate-800 text-slate-300 font-mono">{products.length}</span>
          </button>

          <button
            onClick={() => setActiveSection('orders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition ${
              activeSection === 'orders'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Ventas</span>
            <span className="text-[10px] px-1.5 rounded-full bg-slate-800 text-slate-300 font-mono">{orders.length}</span>
          </button>

          <button
            onClick={() => setActiveSection('invoices')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition ${
              activeSection === 'invoices'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Facturas</span>
            <span className="text-[10px] px-1.5 rounded-full bg-slate-800 text-slate-300 font-mono">{invoices.length}</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar en Odoo 20..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
          />
        </div>
      </div>

      {/* Content Table / Cards */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 overflow-hidden backdrop-blur-sm min-h-[300px]">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            <p className="text-xs">Sincronizando datos en vivo desde Odoo 20 Community...</p>
          </div>
        ) : (
          <>
            {/* CONTACTOS */}
            {activeSection === 'contacts' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 font-medium">
                  <tr>
                    <th className="py-3 px-4">Contacto / Empresa</th>
                    <th className="py-3 px-4">Correo Electrónico</th>
                    <th className="py-3 px-4">Teléfono</th>
                    <th className="py-3 px-4">RUC / VAT</th>
                    <th className="py-3 px-4">Ubicación</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredContacts.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3.5 px-4 font-semibold text-slate-100 flex items-center gap-2">
                        {c.isCompany ? <Building2 className="w-4 h-4 text-purple-400" /> : <Users className="w-4 h-4 text-cyan-400" />}
                        <span>{c.name}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">{c.email}</td>
                      <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">{c.phone}</td>
                      <td className="py-3.5 px-4 font-mono text-purple-300">{c.vat}</td>
                      <td className="py-3.5 px-4 text-slate-400 truncate max-w-[160px]">{c.street !== '-' ? c.street : c.city}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditContact(c)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition text-[11px]"
                            title="Editar contacto en Odoo"
                          >
                            <Edit2 className="w-3 h-3 text-cyan-400" />
                            <span>Editar</span>
                          </button>
                          <button
                            onClick={() => onAskAgent(`Muestra la información completa y opciones para ${c.name} en Odoo 20`)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition text-[11px]"
                          >
                            <Sparkles className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredContacts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                        No se encontraron contactos en Odoo 20.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {/* PRODUCTOS */}
            {activeSection === 'products' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 font-medium">
                  <tr>
                    <th className="py-3 px-4">Producto / Servicio</th>
                    <th className="py-3 px-4">Referencia (SKU)</th>
                    <th className="py-3 px-4">Categoría</th>
                    <th className="py-3 px-4">Precio Lista</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3.5 px-4 font-medium text-slate-100">{p.name}</td>
                      <td className="py-3.5 px-4 font-mono text-purple-300">{p.defaultCode}</td>
                      <td className="py-3.5 px-4 text-slate-400">{p.category}</td>
                      <td className="py-3.5 px-4 text-emerald-400 font-semibold">S/. {p.listPrice.toFixed(2)}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditProduct(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition text-[11px]"
                            title="Editar precio o datos"
                          >
                            <Edit2 className="w-3 h-3 text-cyan-400" />
                            <span>Editar</span>
                          </button>
                          <button
                            onClick={() => onAskAgent(`Genera una cotización para el producto ${p.name} (${p.defaultCode}) en Odoo 20`)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition text-[11px]"
                          >
                            <Sparkles className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                        No hay productos registrados en el catálogo de Odoo 20.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {/* VENTAS */}
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
                      <td className="py-3.5 px-4 font-semibold text-slate-100">S/. {o.amountTotal.toFixed(2)}</td>
                      <td className="py-3.5 px-4">
                        <span className="capitalize px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-medium">
                          {o.state}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onAskAgent(`Explícame el estado de la orden ${o.name} en Odoo 20`)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition text-[11px]"
                        >
                          <Sparkles className="w-3 h-3" />
                          Detalles
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                        No hay órdenes de venta registradas actualmente en Odoo 20.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {/* FACTURAS */}
            {activeSection === 'invoices' && (
              <div className="p-8 text-center text-slate-500 text-xs">
                No hay facturas contabilizadas en este momento en tu Odoo 20 Community.
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL: Crear / Editar Contacto */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span>{editingContact ? 'Editar Contacto en Odoo 20' : 'Crear Nuevo Contacto en Odoo 20'}</span>
              </h4>
              <button onClick={() => setShowContactModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Nombre o Razón Social *</label>
                <input
                  type="text"
                  required
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  placeholder="ej. Juan Pérez o Empresa SAC"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="correo@ejemplo.pe"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    placeholder="+51 999 888 777"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">RUC / DNI / VAT</label>
                  <input
                    type="text"
                    value={contactForm.vat}
                    onChange={(e) => setContactForm({ ...contactForm, vat: e.target.value })}
                    placeholder="20612345678"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500/50 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Ciudad</label>
                  <input
                    type="text"
                    value={contactForm.city}
                    onChange={(e) => setContactForm({ ...contactForm, city: e.target.value })}
                    placeholder="Lima"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Dirección</label>
                <input
                  type="text"
                  value={contactForm.street}
                  onChange={(e) => setContactForm({ ...contactForm, street: e.target.value })}
                  placeholder="Av. Principal 123"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_company"
                  checked={contactForm.is_company}
                  onChange={(e) => setContactForm({ ...contactForm, is_company: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-800 text-purple-600 focus:ring-0"
                />
                <label htmlFor="is_company" className="text-slate-300 cursor-pointer">Es una empresa / persona jurídica</label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{editingContact ? 'Guardar Cambios' : 'Crear en Odoo'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Crear / Editar Producto */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-purple-400" />
                <span>{editingProduct ? 'Editar Producto / Servicio' : 'Nuevo Producto / Servicio'}</span>
              </h4>
              <button onClick={() => setShowProductModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Nombre del Servicio o Producto *</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="ej. Consultoría Cloud ERP"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Código (SKU)</label>
                  <input
                    type="text"
                    value={productForm.default_code}
                    onChange={(e) => setProductForm({ ...productForm, default_code: e.target.value })}
                    placeholder="ERP002"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500/50 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Precio de Venta (PEN / S/.) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.list_price}
                    onChange={(e) => setProductForm({ ...productForm, list_price: parseFloat(e.target.value) || 0 })}
                    placeholder="1500.00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500/50 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{editingProduct ? 'Actualizar Precio' : 'Crear en Catálogo'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
