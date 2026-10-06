import { IntegrationChannel, McpToolDefinition, OdooPartner, OdooProduct, OdooSaleOrder } from '@/types';

export const INITIAL_CHANNELS: IntegrationChannel[] = [
  {
    id: 'ch-whatsapp-1',
    name: 'WhatsApp Business Bot',
    type: 'whatsapp',
    status: 'connected',
    accountInfo: '+34 612 345 678 (Ventas & Soporte)',
    lastSync: 'Hace 2 min',
    activeChatsCount: 14,
    webhookUrl: 'https://api.cognitivecore.ai/webhooks/whatsapp',
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
    lastSync: 'Hace 30 seg',
    activeChatsCount: 8,
    webhookUrl: 'https://api.cognitivecore.ai/webhooks/telegram',
    config: {
      botToken: 'bot682910481:AAH...masked',
      mode: 'Webhook + Polling Fallback',
      autoReplyAi: 'true',
    },
  },
  {
    id: 'ch-odoo-1',
    name: 'Odoo 20 Community / Enterprise',
    type: 'odoo',
    status: 'connected',
    accountInfo: 'http://localhost:8069 (DB: odoo20_db)',
    lastSync: 'Tiempo real (MCP Server)',
    activeChatsCount: 29,
    webhookUrl: 'http://localhost:8000/api/mcp/tools',
    config: {
      protocol: 'Model Context Protocol (MCP) / JSON-RPC',
      user: 'admin@odoo.local',
      version: 'Odoo 20 Community & Enterprise Copilot',
      modules: 'Contacts, Sales, Invoicing, Stock, CRM, Projects, HR',
    },
  },
];

export const MOCK_ODOO_PARTNERS: OdooPartner[] = [
  { id: 14, name: 'Deco Addict SL', email: 'contacto@decoaddict.es', phone: '+34 912 345 678', city: 'Madrid', street: 'Calle Gran Vía 42', vat: 'ESA12345678', isCompany: true, totalInvoiced: 45290.50 },
  { id: 22, name: 'Innova Tech Solutions', email: 'ventas@innovatech.com', phone: '+34 934 567 890', city: 'Barcelona', street: 'Av. Diagonal 605', vat: 'ESB87654321', isCompany: true, totalInvoiced: 128400.00 },
  { id: 35, name: 'Construcciones & Logística Norte', email: 'admin@colnorte.es', phone: '+34 944 112 233', city: 'Bilbao', street: 'Polígono Ind. Asua', vat: 'ESB99887766', isCompany: true, totalInvoiced: 78900.20 },
  { id: 48, name: 'Farmacia & Salud Global', email: 'pedidos@farmahealth.es', phone: '+34 963 889 900', city: 'Valencia', street: 'Calle Colón 15', vat: 'ESA55443322', isCompany: true, totalInvoiced: 23450.80 },
  { id: 52, name: 'Carlos Mendoza (Consultor IT)', email: 'cmendoza@freelance.org', phone: '+34 600 123 456', city: 'Sevilla', street: 'Calle Sierpes 8', vat: 'ES44556677K', isCompany: false, totalInvoiced: 8900.00 },
];

export const MOCK_ODOO_PRODUCTS: OdooProduct[] = [
  { id: 101, name: 'Servidor Rack 2U Enterprise AI', defaultCode: 'SRV-2U-AI', qtyAvailable: 18, listPrice: 3450.00, category: 'Hardware' },
  { id: 102, name: 'Licencia Anual Cognitive Core MCP', defaultCode: 'LIC-CC-ANUAL', qtyAvailable: 999, listPrice: 1200.00, category: 'Software' },
  { id: 103, name: 'Switch Gestionable 48 Puertos 10G', defaultCode: 'NET-SW-48P', qtyAvailable: 4, listPrice: 890.00, category: 'Redes' },
  { id: 104, name: 'Módulo IoT Gateway Telemetría', defaultCode: 'IOT-GTW-01', qtyAvailable: 62, listPrice: 185.00, category: 'IoT' },
];

export const MOCK_ODOO_ORDERS: OdooSaleOrder[] = [
  { id: 501, name: 'SO0501', partnerName: 'Innova Tech Solutions', dateOrder: '2026-10-05', amountTotal: 12450.00, state: 'sale' },
  { id: 502, name: 'SO0502', partnerName: 'Deco Addict SL', dateOrder: '2026-10-06', amountTotal: 3450.00, state: 'draft' },
  { id: 503, name: 'SO0503', partnerName: 'Construcciones & Logística', dateOrder: '2026-10-06', amountTotal: 8900.00, state: 'sent' },
];

export const MOCK_ODOO_INVOICES = [
  { id: 901, name: 'INV/2026/00142', partnerName: 'Innova Tech Solutions', invoiceDate: '2026-10-04', amountTotal: 12450.00, state: 'posted', paymentState: 'paid' },
  { id: 902, name: 'INV/2026/00143', partnerName: 'Deco Addict SL', invoiceDate: '2026-10-05', amountTotal: 3450.00, state: 'posted', paymentState: 'not_paid' },
  { id: 903, name: 'INV/2026/00144', partnerName: 'Farmacia & Salud Global', invoiceDate: '2026-10-06', amountTotal: 1890.00, state: 'draft', paymentState: 'not_paid' },
];

export const MOCK_ODOO_TASKS = [
  { id: 301, name: 'Implementar Webhooks de WhatsApp en MCP', projectName: 'ERP Cognitive Core', stage: 'En Progreso', deadline: '2026-10-10', priority: 'Alta' },
  { id: 302, name: 'Configurar servidor XML-RPC Odoo 20', projectName: 'Infraestructura', stage: 'Completado', deadline: '2026-10-06', priority: 'Media' },
  { id: 303, name: 'Pruebas de latencia en consultas de inventario', projectName: 'ERP Cognitive Core', stage: 'Por Hacer', deadline: '2026-10-12', priority: 'Baja' },
];

export const MOCK_ODOO_LEADS = [
  { id: 401, name: 'Implantación Odoo 20 + IA Copilot (50 usuarios)', partnerName: 'Grupo Logístico Iberia', expectedRevenue: 28500.00, probability: 80, stage: 'Propuesta' },
  { id: 402, name: 'Licenciamiento MCP Cognitive Core', partnerName: 'Consultoría Digital Norte', expectedRevenue: 9800.00, probability: 60, stage: 'Calificado' },
];

export const MOCK_MCP_TOOLS: McpToolDefinition[] = [
  {
    name: 'contacts_list',
    category: 'Contactos',
    description: 'Listar o buscar contactos y clientes (res.partner) en Odoo 20 con filtros por nombre, email o NIF.',
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
    description: 'Obtener la ficha completa de un contacto de Odoo con deuda y facturas asociadas.',
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
    description: 'Consultar el inventario, catálogo de productos y stock físico disponible en Odoo.',
    parameters: {
      type: 'object',
      properties: {
        search_term: { type: 'string', description: 'Nombre o referencia/SKU del producto' },
      },
    },
  },
  {
    name: 'sales_list_orders',
    category: 'Ventas',
    description: 'Listar presupuestos y órdenes de venta (sale.order) en Odoo.',
    parameters: {
      type: 'object',
      properties: {
        partner_id: { type: 'number', description: 'Filtrar por cliente (opcional)' },
        state: { type: 'string', description: 'draft, sent, sale, done, cancel' },
      },
    },
  },
  {
    name: 'invoices_list',
    category: 'Facturación',
    description: 'Consultar facturas de cliente (account.move) y estado de pago en Odoo.',
    parameters: {
      type: 'object',
      properties: {
        payment_state: { type: 'string', description: 'paid, not_paid, partial' },
      },
    },
  },
  {
    name: 'projects_list_tasks',
    category: 'Proyectos',
    description: 'Listar tareas del proyecto y to-dos de Odoo.',
    parameters: {
      type: 'object',
      properties: {
        search_term: { type: 'string', description: 'Nombre de la tarea' },
      },
    },
  },
  {
    name: 'crm_list_leads',
    category: 'CRM',
    description: 'Listar oportunidades y prospectos comerciales en el pipeline de Odoo.',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
];
