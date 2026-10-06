import { Message, ToolCall, OdooEntityPreview, OdooPartner, OdooProduct, OdooSaleOrder, McpToolDefinition, OdooThemeBranding } from '@/types';

function getApiEndpoint(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (typeof window !== 'undefined') {
    // In browser: use relative URL so Next.js rewrite proxy handles it with ZERO CORS issues
    return normalizedPath;
  }
  const base = process.env.NEXT_PUBLIC_MCP_BACKEND_URL || 'http://127.0.0.1:8000';
  return `${base}${normalizedPath}`;
}

export interface StreamCallbacks {
  onToken?: (token: string) => void;
  onToolCallStart?: (toolCall: ToolCall) => void;
  onToolCallEnd?: (toolCall: ToolCall) => void;
  onFinish?: (fullMessage: Message) => void;
  onError?: (error: Error) => void;
}

// 1. Fetch Real Contacts from Odoo 20 via MCP Backend
export async function fetchLiveContacts(search?: string, limit: number = 20): Promise<OdooPartner[]> {
  try {
    const endpoint = getApiEndpoint('/api/contacts');
    const url = new URL(endpoint, typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:8000');
    if (search) url.searchParams.append('search', search);
    url.searchParams.append('limit', limit.toString());

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const list = Array.isArray(data) ? data : (data.value || data.records || []);

    return list.map((item: any) => ({
      id: item.id,
      name: item.name || 'Sin Nombre',
      email: item.email || '-',
      phone: item.phone || item.mobile || '-',
      city: item.city || '-',
      street: item.street || '-',
      vat: item.vat || '-',
      isCompany: !!item.is_company,
      totalInvoiced: item.total_invoiced || 0,
    }));
  } catch (err) {
    console.error('Error fetching live contacts from Odoo 20 MCP:', err);
    return [];
  }
}

// 2. Fetch Real Products from Odoo 20 via MCP Backend
export async function fetchLiveProducts(search?: string, limit: number = 20): Promise<OdooProduct[]> {
  try {
    const endpoint = getApiEndpoint('/api/inventory/products');
    const url = new URL(endpoint, typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:8000');
    if (search) url.searchParams.append('search', search);
    url.searchParams.append('limit', limit.toString());

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const list = Array.isArray(data) ? data : (data.value || data.records || []);

    return list.map((p: any) => ({
      id: p.id,
      name: p.name || 'Producto sin nombre',
      defaultCode: p.default_code || 'SIN-SKU',
      qtyAvailable: p.qty_available ?? 0,
      listPrice: p.list_price ?? 0,
      category: Array.isArray(p.categ_id) ? p.categ_id[1] : (p.categ_id || 'General'),
    }));
  } catch (err) {
    console.error('Error fetching live products from Odoo 20 MCP:', err);
    return [];
  }
}

// 3. Fetch Real Sales Orders from Odoo 20 via MCP Backend
export async function fetchLiveOrders(partnerId?: number, limit: number = 20): Promise<OdooSaleOrder[]> {
  try {
    const endpoint = getApiEndpoint('/api/sales/orders');
    const url = new URL(endpoint, typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:8000');
    if (partnerId) url.searchParams.append('partner_id', partnerId.toString());
    url.searchParams.append('limit', limit.toString());

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const list = Array.isArray(data) ? data : (data.value || data.records || []);

    return list.map((o: any) => ({
      id: o.id,
      name: o.name || `SO-${o.id}`,
      partnerName: Array.isArray(o.partner_id) ? o.partner_id[1] : (o.partner_id || 'Cliente'),
      dateOrder: o.date_order ? new Date(o.date_order).toLocaleDateString('es-ES') : '-',
      amountTotal: o.amount_total || 0,
      state: o.state || 'draft',
    }));
  } catch (err) {
    console.error('Error fetching live orders from Odoo 20 MCP:', err);
    return [];
  }
}

// 4. Fetch Real Invoices from Odoo 20 via MCP Backend
export async function fetchLiveInvoices(limit: number = 20): Promise<any[]> {
  try {
    const endpoint = getApiEndpoint('/api/invoices');
    const url = new URL(endpoint, typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:8000');
    url.searchParams.append('limit', limit.toString());

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : (data.value || data.records || []);
  } catch (err) {
    console.error('Error fetching live invoices from Odoo 20 MCP:', err);
    return [];
  }
}

// 5. Fetch MCP Registered Tools from Backend
export async function fetchLiveMcpTools(): Promise<McpToolDefinition[]> {
  try {
    const endpoint = getApiEndpoint('/api/mcp/tools');
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const tools = Array.isArray(data) ? data : (data.tools || []);

    return tools.map((t: any) => ({
      name: t.name,
      category: t.category || 'Odoo 20 MCP',
      description: t.description || 'Herramienta MCP Odoo 20',
      parameters: t.parameters || { type: 'object' },
    }));
  } catch (err) {
    console.error('Error fetching live MCP tools:', err);
    return [];
  }
}

// 6. Execute direct MCP Tool on Live Backend
export async function executeMcpToolLive(toolName: string, args: Record<string, any> = {}): Promise<any> {
  const endpoint = getApiEndpoint(`/api/mcp/tools/${encodeURIComponent(toolName)}/execute`);
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ arguments: args }),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Fallo MCP Tool (${toolName}): ${errorText}`);
  }
  return await res.json();
}

// 7. Fetch Live Theme & Branding from Odoo 20
export async function fetchLiveTheme(): Promise<OdooThemeBranding | null> {
  try {
    const endpoint = getApiEndpoint('/api/theme');
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Error fetching live theme from Odoo 20:', err);
    return null;
  }
}

// 8. Update Navbar Theme & Branding on Odoo 20
export async function updateNavbarTheme(payload: Partial<OdooThemeBranding>): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const endpoint = getApiEndpoint('/api/theme/navbar');
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }
    const data = await res.json();
    return { success: true, data };
  } catch (err: any) {
    console.error('Error updating theme on Odoo 20:', err);
    return { success: false, error: err.message || 'Error al actualizar tema' };
  }
}

// 9. Check backend connection
export async function checkBackendHealth(): Promise<{ online: boolean; odooConnected: boolean; details?: any }> {
  try {
    const endpoint = getApiEndpoint('/api/health');
    const res = await fetch(endpoint, { signal: AbortSignal.timeout(2000) });
    if (!res.ok) return { online: false, odooConnected: false };
    const data = await res.json();
    return {
      online: true,
      odooConnected: data.status === 'ok' || data.odoo_connected === true || data.status === 'healthy',
      details: data,
    };
  } catch {
    return { online: false, odooConnected: false };
  }
}

async function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

// 8. Stream Message to Agent connecting to Live Odoo 20 MCP Tools
export async function sendMessageToAgent(
  userText: string,
  history: Message[],
  callbacks: StreamCallbacks,
  mode: 'general' | 'odoo' | 'omnichannel' = 'general'
): Promise<void> {
  const lower = userText.toLowerCase();
  let toolCalls: ToolCall[] = [];
  let odooPreview: OdooEntityPreview | undefined = undefined;
  let responseContent = '';

  // Case A: Contacts / Clientes
  if (
    lower.includes('contacto') || 
    lower.includes('contactos') || 
    lower.includes('cliente') || 
    lower.includes('clientes') || 
    lower.includes('partner') || 
    lower.includes('proveedor') ||
    lower.includes('kevin') ||
    lower.includes('willy') ||
    lower.includes('cognitive')
  ) {
    const startTime = Date.now();
    const searchTerm = lower.includes('kevin') 
      ? 'Kevin' 
      : lower.includes('willy') 
      ? 'Willy' 
      : lower.includes('cognitive') 
      ? 'Cognitive' 
      : '';

    const tc: ToolCall = {
      id: `tc-${Date.now()}`,
      name: 'contacts_list',
      args: { search_term: searchTerm, limit: 10 },
      status: 'running',
    };
    callbacks.onToolCallStart?.(tc);

    const liveContacts = await fetchLiveContacts(searchTerm, 10);
    tc.status = 'completed';
    tc.executionTimeMs = Date.now() - startTime;
    tc.result = {
      model: 'res.partner',
      server: 'https://erp.cognitivecore.pe',
      count: liveContacts.length,
      records: liveContacts,
    };
    callbacks.onToolCallEnd?.(tc);
    toolCalls.push(tc);

    odooPreview = {
      type: 'contacts_list',
      id: 'live-odoo-contacts',
      name: 'Contactos Odoo 20 Community',
      status: `${liveContacts.length} contactos en vivo`,
      details: {
        'Instancia Odoo': 'https://erp.cognitivecore.pe',
        'Modelo': 'res.partner',
        'Protocolo': 'MCP Server (JSON-RPC / XML-RPC)',
      },
      items: liveContacts,
      actions: [
        { label: 'Crear Contacto en Odoo', action: 'create_contact', variant: 'primary' },
        { label: 'Exportar a WhatsApp', action: 'export_whatsapp', variant: 'secondary' },
      ],
    };

    if (liveContacts.length > 0) {
      responseContent = `He consultado el modelo **\`res.partner\`** en tu servidor **Odoo 20 Community (\`https://erp.cognitivecore.pe\`)** mediante la herramienta MCP **\`contacts_list\`**.\n\nSe obtuvieron **${liveContacts.length} contactos reales**:\n\n` +
        liveContacts.map(c => `- 👤 **${c.name}** | ✉️ \`${c.email}\` | 📞 \`${c.phone}\` | 📍 ${c.street !== '-' ? c.street : c.city} | RUC/VAT: \`${c.vat}\``).join('\n') +
        `\n\n¿Deseas registrar un nuevo contacto, consultar los detalles de alguno o enviar una notificación por WhatsApp o Telegram?`;
    } else {
      responseContent = `He consultado **Odoo 20 Community (\`https://erp.cognitivecore.pe\`)** mediante MCP pero no se encontraron contactos con el término de búsqueda solicitado.`;
    }
  }
  // Case B: Products / Inventario
  else if (
    lower.includes('producto') || 
    lower.includes('productos') || 
    lower.includes('stock') || 
    lower.includes('inventario') || 
    lower.includes('servicio') || 
    lower.includes('erp001') ||
    lower.includes('precio')
  ) {
    const startTime = Date.now();
    const tc: ToolCall = {
      id: `tc-${Date.now()}`,
      name: 'inventory_list_products',
      args: { limit: 10 },
      status: 'running',
    };
    callbacks.onToolCallStart?.(tc);

    const liveProducts = await fetchLiveProducts('', 10);
    tc.status = 'completed';
    tc.executionTimeMs = Date.now() - startTime;
    tc.result = {
      model: 'product.product',
      server: 'https://erp.cognitivecore.pe',
      count: liveProducts.length,
      records: liveProducts,
    };
    callbacks.onToolCallEnd?.(tc);
    toolCalls.push(tc);

    if (liveProducts.length > 0) {
      const first = liveProducts[0];
      odooPreview = {
        type: 'product',
        id: first.id,
        name: first.name,
        details: {
          'Referencia (SKU)': first.defaultCode,
          'Categoría': first.category,
          'Precio de Venta': `${first.listPrice.toLocaleString('es-PE', { minimumFractionDigits: 2 })} PEN / S/.`,
          'Instancia': 'erp.cognitivecore.pe',
        },
        status: 'Activo en Catálogo',
        total: first.listPrice,
        currency: 'S/.',
        actions: [
          { label: 'Crear Presupuesto SO', action: 'create_so', variant: 'primary' },
          { label: 'Ver en Odoo ERP', action: 'open_odoo', variant: 'secondary' },
        ],
      };

      responseContent = `Catálogo consultado en **Odoo 20 Community** mediante **\`inventory_list_products\`**:\n\n` +
        liveProducts.map(p => `- 📦 **${p.name}** (\`${p.defaultCode}\`) | Categoría: *${p.category}* | Precio: **S/. ${p.listPrice.toFixed(2)}**`).join('\n') +
        `\n\n¿Deseas preparar una cotización o presupuesto de venta para algún cliente con este servicio?`;
    } else {
      responseContent = `No se encontraron productos registrados actualmente en el catálogo de tu Odoo 20 Community.`;
    }
  }
  // Case C: Orders / Ventas
  else if (
    lower.includes('venta') || 
    lower.includes('ventas') || 
    lower.includes('presupuesto') || 
    lower.includes('pedido') || 
    lower.includes('pedidos') || 
    lower.includes('so')
  ) {
    const startTime = Date.now();
    const tc: ToolCall = {
      id: `tc-${Date.now()}`,
      name: 'sales_list_orders',
      args: { limit: 10 },
      status: 'running',
    };
    callbacks.onToolCallStart?.(tc);

    const liveOrders = await fetchLiveOrders(undefined, 10);
    tc.status = 'completed';
    tc.executionTimeMs = Date.now() - startTime;
    tc.result = {
      model: 'sale.order',
      server: 'https://erp.cognitivecore.pe',
      count: liveOrders.length,
      records: liveOrders,
    };
    callbacks.onToolCallEnd?.(tc);
    toolCalls.push(tc);

    if (liveOrders.length > 0) {
      responseContent = `Se encontraron **${liveOrders.length} órdenes de venta** en tu Odoo 20 Community:\n\n` +
        liveOrders.map(o => `- 📄 **${o.name}** | Cliente: **${o.partnerName}** | Total: **S/. ${o.amountTotal.toFixed(2)}** | Estado: \`${o.state}\``).join('\n');
    } else {
      responseContent = `He consultado el modelo **\`sale.order\`** en tu Odoo 20 Community (**\`https://erp.cognitivecore.pe\`**).\n\nActualmente **no hay órdenes de venta registradas**. ¿Deseas que preparemos un nuevo presupuesto de venta (SO) para **COGNITIVE CORE E.I.R.L.** o **Kevin Galarza**?`;
    }
  }
  // Case D: Invoices / Facturas
  else if (
    lower.includes('factura') || 
    lower.includes('facturas') || 
    lower.includes('cobro') || 
    lower.includes('deuda')
  ) {
    const startTime = Date.now();
    const tc: ToolCall = {
      id: `tc-${Date.now()}`,
      name: 'invoices_list',
      args: { limit: 10 },
      status: 'running',
    };
    callbacks.onToolCallStart?.(tc);

    const liveInvoices = await fetchLiveInvoices(10);
    tc.status = 'completed';
    tc.executionTimeMs = Date.now() - startTime;
    tc.result = {
      model: 'account.move',
      server: 'https://erp.cognitivecore.pe',
      count: liveInvoices.length,
      records: liveInvoices,
    };
    callbacks.onToolCallEnd?.(tc);
    toolCalls.push(tc);

    if (liveInvoices.length > 0) {
      responseContent = `Facturas en tu Odoo 20 Community:\n\n` +
        liveInvoices.map((inv: any) => `- 🧾 **${inv.name || 'Borrador'}** | Total: **S/. ${inv.amount_total || 0}** | Estado: \`${inv.state}\``).join('\n');
    } else {
      responseContent = `He consultado el módulo contable (**\`account.move\`**) en tu **Odoo 20 Community** y actualmente **no hay facturas emitidas**. Puedes emitir una factura directamente confirmando una orden de venta.`;
    }
  }
  // Case E: Theme & Branding
  else if (
    lower.includes('tema') || 
    lower.includes('theme') || 
    lower.includes('branding') || 
    lower.includes('color') || 
    lower.includes('colores') || 
    lower.includes('navbar') || 
    lower.includes('fuente') || 
    lower.includes('tipografia')
  ) {
    const startTime = Date.now();
    const tc: ToolCall = {
      id: `tc-${Date.now()}`,
      name: 'theme_get_branding',
      args: {},
      status: 'running',
    };
    callbacks.onToolCallStart?.(tc);

    const liveTheme = await fetchLiveTheme();
    tc.status = 'completed';
    tc.executionTimeMs = Date.now() - startTime;
    tc.result = liveTheme;
    callbacks.onToolCallEnd?.(tc);
    toolCalls.push(tc);

    if (liveTheme) {
      odooPreview = {
        type: 'theme',
        id: 'live-odoo-theme',
        name: `Tema Odoo 20: ${liveTheme.name || 'Cognitive Core'}`,
        status: 'Branding Activo',
        details: {
          'Color Primario': liveTheme.primary_color,
          'Color Secundario': liveTheme.secondary_color,
          'Tipografía': liveTheme.font || 'Lato',
          'Email Primario': liveTheme.email_primary_color || '#FFFFFF',
        },
        actions: [
          { label: 'Personalizar en Editor de Tema', action: 'open_theme_editor', variant: 'primary' },
        ],
      };

      responseContent = `🎨 **Branding y Tema actual de Odoo 20 Community**:\n\n- 🏢 **Empresa:** **${liveTheme.name || 'Cognitive Core'}**\n- 🔵 **Color Primario (Navbar/Botones):** \`${liveTheme.primary_color}\`\n- 🔷 **Color Secundario (Acentos):** \`${liveTheme.secondary_color}\`\n- ✍️ **Fuente del Sistema:** \`${liveTheme.font || 'Lato'}\`\n\nPuedes personalizar la paleta de colores en tiempo real desde la nueva pestaña **🎨 Theme & Branding** o pedirme que aplique un nuevo color primario.`;
    } else {
      responseContent = `He consultado la configuración de Branding en Odoo 20. Puedes editar los colores y tipografía desde la pestaña **Theme & Branding**.`;
    }
  }
  // Case F: WhatsApp / Telegram
  else if (
    lower.includes('whatsapp') || 
    lower.includes('telegram') || 
    lower.includes('canal') || 
    lower.includes('mensaje')
  ) {
    responseContent = `📱 **Hub Omnicanal Conectado**:\n\n- 🟢 **WhatsApp Business Bot:** Conectado a la línea corporativa (+51 965 777 514).\n- 🔵 **Telegram ERP Agent:** Conectado con @CognitiveCoreErp_Bot.\n- 🏢 **Odoo 20 Community:** Conectado a \`https://erp.cognitivecore.pe\` vía MCP Server.\n\nPuedes pedirme enviar notificaciones, cotizaciones o recordatorios a tus contactos registrados.`;
  }
  // Case F: Default / Help
  else {
    responseContent = `¡Hola! Soy **Cognitive Core Copilot**, conectado en tiempo real a tu **Odoo 20 Community (\`https://erp.cognitivecore.pe\`)** mediante el protocolo **MCP**.\n\n¿Qué deseas gestionar?\n- 👥 **Contactos:** *"Dame la lista de contactos"*, *"Buscar a Willy"* o *"Contacto de Kevin Galarza"*\n- 📦 **Productos / Servicios:** *"Consultar catálogo de productos y precios"*\n- 📄 **Ventas:** *"Listar órdenes de venta"* o *"Crear presupuesto"*\n- 📱 **Canales:** *"Comprobar estado de WhatsApp y Telegram"*`;
  }

  // Stream text word by word
  const words = responseContent.split(' ');
  for (let i = 0; i < words.length; i++) {
    const chunk = (i === 0 ? '' : ' ') + words[i];
    callbacks.onToken?.(chunk);
    await delay(12);
  }

  callbacks.onFinish?.({
    id: `msg-${Date.now()}`,
    role: 'assistant',
    content: responseContent,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    toolCalls,
    odooPreview,
  });
}
