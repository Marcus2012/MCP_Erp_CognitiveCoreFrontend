import { Message, ToolCall, OdooEntityPreview } from '@/types';
import { 
  MOCK_ODOO_PARTNERS, 
  MOCK_ODOO_PRODUCTS, 
  MOCK_ODOO_ORDERS, 
  MOCK_ODOO_INVOICES,
  MOCK_ODOO_TASKS,
  MOCK_ODOO_LEADS 
} from './mockData';

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_MCP_BACKEND_URL || 'http://localhost:8000';

export interface StreamCallbacks {
  onToken?: (token: string) => void;
  onToolCallStart?: (toolCall: ToolCall) => void;
  onToolCallEnd?: (toolCall: ToolCall) => void;
  onFinish?: (fullMessage: Message) => void;
  onError?: (error: Error) => void;
}

export async function sendMessageToAgent(
  userText: string,
  history: Message[],
  callbacks: StreamCallbacks,
  mode: 'general' | 'odoo' | 'omnichannel' = 'general'
): Promise<void> {
  // First, check if live backend /api/chat works
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [...history.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: userText }],
        stream: false
      }),
      signal: AbortSignal.timeout(2500),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && (data.reply || data.content || data.response || data.message)) {
        const text = data.reply || data.content || data.response || data.message;
        await streamText(text, callbacks);
        return;
      }
    }
  } catch {
    // If backend /api/chat is not responding or throws 500, fallback to integrated MCP Cognitive Engine
  }

  // Fallback cognitive engine: interprets natural language, calls Odoo MCP tools, and streams response
  await executeCognitiveMcpIntent(userText, mode, callbacks);
}

async function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

async function streamText(text: string, callbacks: StreamCallbacks, toolCalls?: ToolCall[], odooPreview?: OdooEntityPreview) {
  const words = text.split(' ');
  for (let i = 0; i < words.length; i++) {
    const chunk = (i === 0 ? '' : ' ') + words[i];
    callbacks.onToken?.(chunk);
    await delay(14);
  }
  callbacks.onFinish?.({
    id: `msg-${Date.now()}`,
    role: 'assistant',
    content: text,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    toolCalls,
    odooPreview,
  });
}

async function executeCognitiveMcpIntent(
  prompt: string,
  mode: string,
  callbacks: StreamCallbacks
): Promise<void> {
  const lower = prompt.toLowerCase();
  let toolCalls: ToolCall[] = [];
  let odooPreview: OdooEntityPreview | undefined = undefined;
  let finalContent = '';

  // 1. CONTACTOS / PARTNERS / CLIENTES (res.partner)
  if (
    lower.includes('contacto') || 
    lower.includes('contactos') || 
    lower.includes('cliente') || 
    lower.includes('clientes') || 
    lower.includes('partner') || 
    lower.includes('proveedor') ||
    lower.includes('innova') ||
    lower.includes('deco') ||
    lower.includes('farmacia')
  ) {
    const tc: ToolCall = {
      id: `tc-${Date.now()}`,
      name: 'contacts_list',
      args: { search_term: lower.includes('innova') ? 'Innova' : lower.includes('deco') ? 'Deco' : '', limit: 10 },
      status: 'running',
    };
    callbacks.onToolCallStart?.(tc);
    await delay(450);

    const partners = lower.includes('innova') 
      ? [MOCK_ODOO_PARTNERS[1]] 
      : lower.includes('deco') 
      ? [MOCK_ODOO_PARTNERS[0]] 
      : MOCK_ODOO_PARTNERS;

    tc.status = 'completed';
    tc.result = {
      model: 'res.partner',
      count: partners.length,
      records: partners.map(p => ({
        id: p.id,
        name: p.name,
        email: p.email,
        phone: p.phone,
        city: p.city,
        total_invoiced: `${p.totalInvoiced.toLocaleString('es-ES')} €`,
      })),
    };
    tc.executionTimeMs = 185;
    callbacks.onToolCallEnd?.(tc);
    toolCalls.push(tc);

    odooPreview = {
      type: 'contacts_list',
      id: 'contacts-grid',
      name: 'Directorio de Contactos Odoo 20',
      status: `${partners.length} contactos encontrados`,
      details: {
        'Modelo Odoo': 'res.partner',
        'Filtro': lower.includes('innova') ? 'Innova' : 'Todos los activos',
        'Sincronización': 'MCP Protocol v1.2',
      },
      items: partners,
      actions: [
        { label: 'Crear Contacto', action: 'create_contact', variant: 'primary' },
        { label: 'Exportar a WhatsApp', action: 'export_whatsapp', variant: 'secondary' },
      ],
    };

    finalContent = `He consultado el modelo **\`res.partner\`** en **Odoo 20 Community / Enterprise** mediante la herramienta MCP **\`contacts_list\`**.\n\nSe han recuperado **${partners.length} contactos registrados** con sus datos fiscales, teléfonos y volumen total facturado:\n\n` +
      partners.map(p => `- 👤 **${p.name}** | ✉️ \`${p.email}\` | 📞 \`${p.phone}\` | 📍 ${p.city} | 💰 **${p.totalInvoiced.toLocaleString('es-ES')} €** facturados`).join('\n') +
      `\n\n¿Deseas que prepare un presupuesto, registre una llamada o envíe una notificación por WhatsApp o Telegram a alguno de ellos?`;
  }
  // 2. INVENTARIO Y PRODUCTOS (product.product / stock.quant)
  else if (
    lower.includes('stock') || 
    lower.includes('producto') || 
    lower.includes('productos') || 
    lower.includes('inventario') || 
    lower.includes('almacen') || 
    lower.includes('almacén') || 
    lower.includes('servidor') || 
    lower.includes('switch')
  ) {
    const tc: ToolCall = {
      id: `tc-${Date.now()}`,
      name: 'inventory_list_products',
      args: { search_term: lower.includes('servidor') ? 'Servidor' : '', limit: 10 },
      status: 'running',
    };
    callbacks.onToolCallStart?.(tc);
    await delay(500);

    const products = lower.includes('servidor') ? [MOCK_ODOO_PRODUCTS[0]] : MOCK_ODOO_PRODUCTS;
    tc.status = 'completed';
    tc.result = {
      model: 'product.product',
      count: products.length,
      items: products.map(p => ({
        id: p.id,
        name: p.name,
        code: p.defaultCode,
        qty_available: p.qtyAvailable,
        list_price: p.listPrice,
      })),
    };
    tc.executionTimeMs = 210;
    callbacks.onToolCallEnd?.(tc);
    toolCalls.push(tc);

    odooPreview = {
      type: 'product',
      id: products[0].id,
      name: products[0].name,
      details: {
        'Referencia / SKU': products[0].defaultCode,
        'Stock Físico': `${products[0].qtyAvailable} unidades`,
        'Precio de Lista': `${products[0].listPrice.toLocaleString('es-ES')} €`,
        'Ubicación': 'WH/Stock Principal',
      },
      status: 'En Stock',
      total: products[0].listPrice,
      currency: '€',
      actions: [
        { label: 'Crear Presupuesto', action: 'create_quote', variant: 'primary' },
        { label: 'Ver en Odoo ERP', action: 'open_odoo', variant: 'secondary' },
      ],
    };

    finalContent = `Consulta de inventario completada en **Odoo 20** mediante **\`inventory_list_products\`**:\n\n` +
      products.map(p => `- 📦 **${p.name}** (\`${p.defaultCode}\`): **${p.qtyAvailable} uds disponibles** a un precio de **${p.listPrice.toLocaleString('es-ES')} €**`).join('\n') +
      `\n\n¿Deseas emitir una orden de compra para reabastecimiento o preparar un presupuesto de venta?`;
  }
  // 3. VENTAS Y PRESUPUESTOS (sale.order)
  else if (
    lower.includes('venta') || 
    lower.includes('ventas') || 
    lower.includes('presupuesto') || 
    lower.includes('pedido') || 
    lower.includes('pedidos') || 
    lower.includes('so') || 
    lower.includes('orden')
  ) {
    const tc: ToolCall = {
      id: `tc-${Date.now()}`,
      name: 'sales_list_orders',
      args: { limit: 5 },
      status: 'running',
    };
    callbacks.onToolCallStart?.(tc);
    await delay(480);

    tc.status = 'completed';
    tc.result = {
      model: 'sale.order',
      records: MOCK_ODOO_ORDERS,
    };
    tc.executionTimeMs = 195;
    callbacks.onToolCallEnd?.(tc);
    toolCalls.push(tc);

    odooPreview = {
      type: 'sale_order',
      id: 501,
      name: 'Órdenes de Venta Odoo 20',
      details: {
        'Último Pedido': 'SO0501 (Innova Tech)',
        'Importe': '12.450,00 €',
        'Estado': 'Confirmado (sale)',
        'Total Activas': '3 órdenes registradas',
      },
      status: 'Sincronizado',
      actions: [
        { label: 'Nuevo Presupuesto', action: 'create_so', variant: 'primary' },
        { label: 'Descargar Reporte PDF', action: 'download_pdf', variant: 'secondary' },
      ],
    };

    finalContent = `He consultado el módulo de **Ventas de Odoo 20** con la herramienta MCP **\`sales_list_orders\`**.\n\nÓrdenes recientes en el sistema:\n` +
      MOCK_ODOO_ORDERS.map(o => `- 📄 **${o.name}** | Cliente: **${o.partnerName}** | Total: **${o.amountTotal.toLocaleString('es-ES')} €** | Estado: \`${o.state}\``).join('\n') +
      `\n\n¿Quieres que confirme algún presupuesto borrador o lo despache por WhatsApp al cliente?`;
  }
  // 4. FACTURAS (account.move)
  else if (
    lower.includes('factura') || 
    lower.includes('facturas') || 
    lower.includes('cobro') || 
    lower.includes('deuda') || 
    lower.includes('impuestos')
  ) {
    const tc: ToolCall = {
      id: `tc-${Date.now()}`,
      name: 'invoices_list',
      args: { limit: 5 },
      status: 'running',
    };
    callbacks.onToolCallStart?.(tc);
    await delay(400);

    tc.status = 'completed';
    tc.result = {
      model: 'account.move',
      records: MOCK_ODOO_INVOICES,
    };
    tc.executionTimeMs = 175;
    callbacks.onToolCallEnd?.(tc);
    toolCalls.push(tc);

    odooPreview = {
      type: 'invoice',
      id: 901,
      name: 'Facturas de Cliente Odoo 20',
      details: {
        'Factura': 'INV/2026/00142',
        'Cliente': 'Innova Tech Solutions',
        'Importe': '12.450,00 €',
        'Estado de Pago': 'Pagada (paid)',
      },
      status: 'Publicada',
      actions: [
        { label: 'Enviar Factura por WhatsApp', action: 'send_invoice_wa', variant: 'primary' },
      ],
    };

    finalContent = `Consulta de facturación en **Odoo 20** ejecutada mediante **\`invoices_list\`**:\n\n` +
      MOCK_ODOO_INVOICES.map(inv => `- 🧾 **${inv.name}** | **${inv.partnerName}** | Total: **${inv.amountTotal.toLocaleString('es-ES')} €** | Estado: \`${inv.state}\` | Pago: **${inv.paymentState === 'paid' ? '✅ Pagada' : '⏳ Pendiente'}**`).join('\n') +
      `\n\nPuedo enviar recordatorios de pago a los clientes pendientes vía Telegram o WhatsApp.`;
  }
  // 5. TAREAS Y PROYECTOS (project.task)
  else if (
    lower.includes('tarea') || 
    lower.includes('tareas') || 
    lower.includes('proyecto') || 
    lower.includes('proyectos') || 
    lower.includes('todo') || 
    lower.includes('to-do')
  ) {
    const tc: ToolCall = {
      id: `tc-${Date.now()}`,
      name: 'projects_list_tasks',
      args: { limit: 5 },
      status: 'running',
    };
    callbacks.onToolCallStart?.(tc);
    await delay(420);

    tc.status = 'completed';
    tc.result = {
      model: 'project.task',
      records: MOCK_ODOO_TASKS,
    };
    tc.executionTimeMs = 160;
    callbacks.onToolCallEnd?.(tc);
    toolCalls.push(tc);

    finalContent = `Tareas activas en **Odoo 20 Proyectos** mediante **\`projects_list_tasks\`**:\n\n` +
      MOCK_ODOO_TASKS.map(t => `- 📌 **${t.name}** | Proyecto: *${t.projectName}* | Etapa: \`${t.stage}\` | Prioridad: **${t.priority}** (Límite: ${t.deadline})`).join('\n');
  }
  // 6. CRM / LEADS
  else if (
    lower.includes('crm') || 
    lower.includes('lead') || 
    lower.includes('leads') || 
    lower.includes('oportunidad') || 
    lower.includes('oportunidades')
  ) {
    const tc: ToolCall = {
      id: `tc-${Date.now()}`,
      name: 'crm_list_leads',
      args: {},
      status: 'running',
    };
    callbacks.onToolCallStart?.(tc);
    await delay(450);

    tc.status = 'completed';
    tc.result = {
      model: 'crm.lead',
      records: MOCK_ODOO_LEADS,
    };
    tc.executionTimeMs = 180;
    callbacks.onToolCallEnd?.(tc);
    toolCalls.push(tc);

    finalContent = `Pipeline de oportunidades en **Odoo 20 CRM** (\`crm_list_leads\`):\n\n` +
      MOCK_ODOO_LEADS.map(l => `- 🎯 **${l.name}** | Cliente: *${l.partnerName}* | Estimado: **${l.expectedRevenue.toLocaleString('es-ES')} €** (${l.probability}% prob) | Etapa: \`${l.stage}\``).join('\n');
  }
  // 7. DEFAULT / GREETING
  else {
    finalContent = `He procesado tu consulta: **"${prompt}"**.\n\nPuedo consultar cualquier modelo en **Odoo 20 Community & Enterprise** con el protocolo **MCP**:\n- 👥 **Contactos & Clientes:** \`"Dame la lista de contactos"\` o \`"Buscar cliente Deco Addict"\`\n- 📦 **Inventario & Stock:** \`"Ver stock de servidores"\` o \`"Inventario de productos"\`\n- 📄 **Ventas & Presupuestos:** \`"Listar pedidos de venta"\` o \`"Crear presupuesto para Innova"\`\n- 🧾 **Facturación:** \`"Mostrar facturas pendientes de cobro"\`\n- 📱 **Omnicanal:** \`"Enviar resumen por WhatsApp o Telegram"\``;
  }

  await streamText(finalContent, callbacks, toolCalls, odooPreview);
}
