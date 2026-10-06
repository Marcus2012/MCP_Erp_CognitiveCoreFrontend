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
    name: 'Odoo ERP v17 Enterprise',
    type: 'odoo',
    status: 'connected',
    accountInfo: 'https://odoo.empresa.com (DB: erp_prod_2026)',
    lastSync: 'Tiempo real (MCP Server)',
    activeChatsCount: 29,
    webhookUrl: 'https://odoo.empresa.com/jsonrpc',
    config: {
      protocol: 'XML-RPC / JSON-RPC / MCP Connector',
      user: 'admin_mcp@empresa.com',
      modules: 'Sales, Invoicing, Stock, CRM, Contacts',
    },
  },
];

export const MOCK_MCP_TOOLS: McpToolDefinition[] = [
  {
    name: 'odoo_search_partner',
    category: 'odoo',
    description: 'Busca clientes o proveedores en Odoo por nombre, email, NIF o teléfono.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Nombre o dato del cliente a buscar' },
        limit: { type: 'number', description: 'Número máximo de resultados' },
      },
      required: ['query'],
    },
  },
  {
    name: 'odoo_get_stock_levels',
    category: 'odoo',
    description: 'Consulta el stock físico y virtual de productos en los almacenes de Odoo.',
    parameters: {
      type: 'object',
      properties: {
        product_query: { type: 'string', description: 'Nombre o referencia/SKU del producto' },
        warehouse_id: { type: 'number', description: 'ID del almacén específico (opcional)' },
      },
      required: ['product_query'],
    },
  },
  {
    name: 'odoo_create_sale_order',
    category: 'odoo',
    description: 'Genera un nuevo presupuesto o pedido de venta (SO) en Odoo ERP.',
    parameters: {
      type: 'object',
      properties: {
        partner_id: { type: 'number', description: 'ID del cliente' },
        order_lines: { type: 'string', description: 'Lista JSON con product_id, cantidad y precio' },
      },
      required: ['partner_id', 'order_lines'],
    },
  },
  {
    name: 'whatsapp_send_document',
    category: 'whatsapp',
    description: 'Envía un PDF de factura o presupuesto de Odoo al cliente por WhatsApp.',
    parameters: {
      type: 'object',
      properties: {
        phone: { type: 'string', description: 'Número con prefijo internacional' },
        document_url: { type: 'string', description: 'URL o base64 del documento' },
        caption: { type: 'string', description: 'Texto del mensaje acompañante' },
      },
      required: ['phone', 'document_url'],
    },
  },
  {
    name: 'telegram_send_alert',
    category: 'telegram',
    description: 'Envía notificación de alerta ERP o métricas al grupo/canal de Telegram.',
    parameters: {
      type: 'object',
      properties: {
        chat_id: { type: 'string', description: 'ID del chat o canal' },
        message: { type: 'string', description: 'Contenido del mensaje con formato Markdown' },
      },
      required: ['chat_id', 'message'],
    },
  },
];

export const MOCK_ODOO_PARTNERS: OdooPartner[] = [
  { id: 14, name: 'Deco Addict SL', email: 'contacto@decoaddict.es', phone: '+34 912 345 678', city: 'Madrid', totalInvoiced: 45290.50 },
  { id: 22, name: 'Innova Tech Solutions', email: 'ventas@innovatech.com', phone: '+34 934 567 890', city: 'Barcelona', totalInvoiced: 128400.00 },
  { id: 35, name: 'Construcciones & Logística Norte', email: 'admin@colnorte.es', phone: '+34 944 112 233', city: 'Bilbao', totalInvoiced: 78900.20 },
  { id: 48, name: 'Farmacia & Salud Global', email: 'pedidos@farmahealth.es', phone: '+34 963 889 900', city: 'Valencia', totalInvoiced: 23450.80 },
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
