import { IntegrationChannel, McpToolDefinition, OdooPartner, OdooProduct, OdooSaleOrder } from '@/types';

export const INITIAL_CHANNELS: IntegrationChannel[] = [
  {
    id: 'ch-whatsapp-1',
    name: 'WhatsApp Business Bot',
    type: 'whatsapp',
    status: 'connected',
    accountInfo: '+51 965 777 514 (Cognitive Core)',
    lastSync: 'Hace 1 min',
    activeChatsCount: 5,
    webhookUrl: 'https://api.cognitivecore.pe/webhooks/whatsapp',
    config: {
      provider: 'Meta Cloud API / Baileys',
      sessionStatus: 'ACTIVE_AUTHENTICATED',
      autoReplyAi: 'true',
    },
  },
  {
    id: 'ch-telegram-1',
    name: 'Telegram ERP Agent',
    type: 'telegram',
    status: 'connected',
    accountInfo: '@CognitiveCoreErp_Bot',
    lastSync: 'Hace 20 seg',
    activeChatsCount: 3,
    webhookUrl: 'https://api.cognitivecore.pe/webhooks/telegram',
    config: {
      botToken: 'bot682910481:AAH...masked',
      mode: 'Webhook + Polling Fallback',
      autoReplyAi: 'true',
    },
  },
  {
    id: 'ch-odoo-1',
    name: 'Odoo 20 Community (Cognitive Core)',
    type: 'odoo',
    status: 'connected',
    accountInfo: 'https://erp.cognitivecore.pe',
    lastSync: 'Tiempo real (MCP Server)',
    activeChatsCount: 5,
    webhookUrl: 'http://localhost:8000/api/mcp/tools',
    config: {
      protocol: 'Model Context Protocol (MCP) / JSON-RPC',
      host: 'https://erp.cognitivecore.pe',
      version: 'Odoo 20 Community Copilot',
      modules: 'Contacts, Sales, Invoicing, Stock, CRM, Projects',
    },
  },
];

// Contactos reales de tu Odoo 20 en https://erp.cognitivecore.pe/odoo/contacts
export const MOCK_ODOO_PARTNERS: OdooPartner[] = [
  { 
    id: 1, 
    name: 'COGNITIVE CORE E.I.R.L.', 
    email: 'mcp@cognitivecore.pe', 
    phone: '+51 965 777 514', 
    city: 'Lima', 
    street: 'Perú', 
    vat: '20612345678', 
    isCompany: true, 
    totalInvoiced: 0.00 
  },
  { 
    id: 2, 
    name: 'COGNITIVE CORE E.I.R.L., Cognitive Core', 
    email: 'datadriven111@gmail.com', 
    phone: '+51965777514', 
    city: 'Lima', 
    street: 'Perú', 
    vat: '20612345678', 
    isCompany: true, 
    totalInvoiced: 0.00 
  },
  { 
    id: 3, 
    name: 'Cognitive MCP', 
    email: 'mcp@cognitivecore.pe', 
    phone: '+51 965 777 514', 
    city: 'Lima', 
    street: 'Perú', 
    vat: '-', 
    isCompany: false, 
    totalInvoiced: 0.00 
  },
  { 
    id: 4, 
    name: 'Kevin Galarza', 
    email: 'datadriven111@gmail.com', 
    phone: '+51 965 777 514', 
    city: 'Lima', 
    street: 'Perú', 
    vat: '-', 
    isCompany: false, 
    totalInvoiced: 0.00 
  },
  { 
    id: 5, 
    name: 'Willy Hinostroza', 
    email: 'contacto@cognitivecore.pe', 
    phone: '+51 959 766 536', 
    city: 'Lima', 
    street: 'Perú', 
    vat: '-', 
    isCompany: false, 
    totalInvoiced: 0.00 
  },
];

export const MOCK_ODOO_PRODUCTS: OdooProduct[] = [
  { id: 101, name: 'Servicio de Consultoría Cognitive Core IA', defaultCode: 'SRV-CC-IA', qtyAvailable: 999, listPrice: 2500.00, category: 'Servicios' },
  { id: 102, name: 'Licencia MCP Connector Odoo 20', defaultCode: 'LIC-MCP-O20', qtyAvailable: 999, listPrice: 1200.00, category: 'Software' },
  { id: 103, name: 'Módulo WhatsApp Business CRM Bot', defaultCode: 'MOD-WPP-CRM', qtyAvailable: 999, listPrice: 850.00, category: 'Integraciones' },
];

export const MOCK_ODOO_ORDERS: OdooSaleOrder[] = [
  { id: 501, name: 'SO001', partnerName: 'COGNITIVE CORE E.I.R.L.', dateOrder: '2026-10-06', amountTotal: 2500.00, state: 'draft' },
];

export const MOCK_ODOO_INVOICES = [
  { id: 901, name: 'INV/2026/00001', partnerName: 'COGNITIVE CORE E.I.R.L.', invoiceDate: '2026-10-06', amountTotal: 2500.00, state: 'draft', paymentState: 'not_paid' },
];

export const MOCK_ODOO_TASKS = [
  { id: 301, name: 'Sincronizar contactos reales con MCP Server', projectName: 'ERP Cognitive Core', stage: 'En Progreso', deadline: '2026-10-08', priority: 'Alta' },
];

export const MOCK_ODOO_LEADS = [
  { id: 401, name: 'Integración Omnicanal WhatsApp + Odoo 20', partnerName: 'Kevin Galarza', expectedRevenue: 5000.00, probability: 90, stage: 'Calificado' },
];

export const MOCK_MCP_TOOLS: McpToolDefinition[] = [
  {
    name: 'contacts_list',
    category: 'Contactos',
    description: 'Listar contactos y clientes (res.partner) en Odoo 20 desde https://erp.cognitivecore.pe.',
    parameters: {
      type: 'object',
      properties: {
        search_term: { type: 'string', description: 'Nombre, empresa o dato del cliente a buscar' },
        limit: { type: 'number', description: 'Número máximo de resultados' },
      },
    },
  },
  {
    name: 'contacts_get',
    category: 'Contactos',
    description: 'Obtener la ficha completa de un contacto de Odoo 20.',
    parameters: {
      type: 'object',
      properties: {
        partner_id: { type: 'number', description: 'ID del contacto' },
      },
      required: ['partner_id'],
    },
  },
  {
    name: 'inventory_list_products',
    category: 'Inventario',
    description: 'Consultar el catálogo de productos y servicios en Odoo 20.',
    parameters: {
      type: 'object',
      properties: {
        search_term: { type: 'string', description: 'Nombre o referencia/SKU' },
      },
    },
  },
  {
    name: 'sales_list_orders',
    category: 'Ventas',
    description: 'Listar presupuestos y órdenes de venta (sale.order) en Odoo 20.',
    parameters: {
      type: 'object',
      properties: {
        partner_id: { type: 'number', description: 'Filtrar por cliente (opcional)' },
      },
    },
  },
];
