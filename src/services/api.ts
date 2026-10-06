import { Message, ToolCall, OdooEntityPreview, OdooPartner, OdooProduct, OdooSaleOrder, McpToolDefinition, OdooThemeBranding } from '@/types';

function getApiEndpoint(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (typeof window !== 'undefined') {
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

// ==========================================
// 1. CONTACTOS (res.partner) - READ, CREATE, UPDATE
// ==========================================
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

export async function createLiveContact(data: {
  name: string;
  email?: string;
  phone?: string;
  vat?: string;
  is_company?: boolean;
  street?: string;
  city?: string;
}): Promise<any> {
  const endpoint = getApiEndpoint('/api/contacts');
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Error al crear contacto: ${err}`);
  }
  return await res.json();
}

export async function updateLiveContact(partnerId: number, data: Partial<{
  name: string;
  email: string;
  phone: string;
  vat: string;
  street: string;
  city: string;
}>): Promise<any> {
  const endpoint = getApiEndpoint(`/api/contacts/${partnerId}`);
  const res = await fetch(endpoint, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Error al actualizar contacto: ${err}`);
  }
  return await res.json();
}

// ==========================================
// 2. PRODUCTOS (product.product) - READ, CREATE, UPDATE
// ==========================================
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

export async function createLiveProduct(data: {
  name: string;
  default_code?: string;
  list_price?: number;
  standard_price?: number;
  type?: 'consu' | 'service' | 'product';
  categ_id?: number;
}): Promise<any> {
  const endpoint = getApiEndpoint('/api/inventory/products');
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Error al crear producto: ${err}`);
  }
  return await res.json();
}

export async function updateLiveProduct(productId: number, data: {
  name?: string;
  list_price?: number;
  standard_price?: number;
  default_code?: string;
}): Promise<any> {
  const endpoint = getApiEndpoint(`/api/inventory/products/${productId}`);
  const res = await fetch(endpoint, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Error al actualizar producto: ${err}`);
  }
  return await res.json();
}

// ==========================================
// 3. VENTAS (sale.order) - READ, CREATE, UPDATE
// ==========================================
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

export async function createLiveOrder(data: {
  partner_id: number;
  lines?: Array<{ product_id: number; product_uom_qty: number; price_unit?: number }>;
  note?: string;
}): Promise<any> {
  const endpoint = getApiEndpoint('/api/sales/orders');
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Error al crear orden de venta: ${err}`);
  }
  return await res.json();
}

// ==========================================
// 4. FACTURAS (account.move)
// ==========================================
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

// ==========================================
// 5. CRM LEADS, TAREAS Y AGENDA
// ==========================================
export async function createLiveLead(data: {
  name: string;
  partner_id?: number;
  email_from?: string;
  phone?: string;
  expected_revenue?: number;
  probability?: number;
}): Promise<any> {
  const endpoint = getApiEndpoint('/api/crm/leads');
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Error al crear oportunidad CRM: ${err}`);
  }
  return await res.json();
}

export async function createLiveTask(data: {
  name: string;
  project_id?: number;
  description?: string;
  priority?: '0' | '1';
  date_deadline?: string;
}): Promise<any> {
  const endpoint = getApiEndpoint('/api/projects/tasks');
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Error al crear tarea: ${err}`);
  }
  return await res.json();
}

// ==========================================
// 6. HERRAMIENTAS MCP DIRECTAS
// ==========================================
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

// ==========================================
// 7. THEME & BRANDING
// ==========================================
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

// ==========================================
// 8. HEALTH CHECK
// ==========================================
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

// ==========================================
// 9. AGENT CHAT INTENT NLP (CRU INTEGRATION)
// ==========================================
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

  // ----------------------------------------------------
  // A. CREAR CONTACTO (contacts_create / POST /api/contacts)
  // ----------------------------------------------------
  if (
    (lower.includes('crear') || lower.includes('agrega') || lower.includes('registra') || lower.includes('nuevo')) &&
    (lower.includes('contacto') || lower.includes('cliente') || lower.includes('partner') || lower.includes('proveedor'))
  ) {
    const startTime = Date.now();
    const nameMatch = userText.match(/(?:llamado|para|nombre|de)\s+([A-Za-zÀ-ÿ0-9\.\s]+?)(?:con|email|teléfono|telefono|ruc|vat|$)/i);
    const emailMatch = userText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);
    const phoneMatch = userText.match(/(?:\+?\d{2,4}\s?)?\d{8,11}/);
    const vatMatch = userText.match(/(?:ruc|vat|dni|nif)\s*:?\s*(\d{8,11})/i);

    const contactName = nameMatch ? nameMatch[1].trim() : (lower.includes('empresa') ? 'Nueva Empresa Odoo' : 'Nuevo Contacto Odoo');
    const contactEmail = emailMatch ? emailMatch[1] : undefined;
    const contactPhone = phoneMatch ? phoneMatch[0] : undefined;
    const contactVat = vatMatch ? vatMatch[1] : undefined;

    const tc: ToolCall = {
      id: `tc-${Date.now()}`,
      name: 'contacts_create',
      args: {
        name: contactName,
        email: contactEmail,
        phone: contactPhone,
        vat: contactVat,
        is_company: lower.includes('empresa') || lower.includes('e.i.r.l') || lower.includes('s.a.c') || lower.includes('sl'),
      },
      status: 'running',
    };
    callbacks.onToolCallStart?.(tc);

    try {
      const created = await createLiveContact(tc.args as any);
      tc.status = 'completed';
      tc.executionTimeMs = Date.now() - startTime;
      tc.result = created;
      callbacks.onToolCallEnd?.(tc);
      toolCalls.push(tc);

      odooPreview = {
        type: 'partner',
        id: created.id || created.partner_id || 'new',
        name: contactName,
        status: 'Creado en Odoo 20',
        details: {
          'ID Odoo': created.id || created.partner_id || '-',
          'Email': contactEmail || 'No asignado',
          'Teléfono': contactPhone || 'No asignado',
          'RUC / VAT': contactVat || 'No asignado',
        },
        actions: [
          { label: 'Editar Contacto', action: 'edit_contact', variant: 'primary' },
          { label: 'Crear Presupuesto', action: 'create_so', variant: 'secondary' },
        ],
      };

      responseContent = `✅ **Contacto creado exitosamente en Odoo 20 Community** mediante **\`contacts_create\`**.\n\n- 👤 **Nombre:** **${contactName}**\n- 🆔 **ID en Odoo:** \`${created.id || created.partner_id}\`\n- ✉️ **Email:** \`${contactEmail || 'Sin registrar'}\`\n- 📞 **Teléfono:** \`${contactPhone || 'Sin registrar'}\`\n\n¿Deseas emitir un presupuesto de venta o registrar una llamada/reunión para este contacto?`;
    } catch (err: any) {
      tc.status = 'failed';
      tc.result = { error: err.message };
      callbacks.onToolCallEnd?.(tc);
      toolCalls.push(tc);
      responseContent = `❌ Ocurrió un error al crear el contacto en Odoo 20: ${err.message}`;
    }
  }

  // ----------------------------------------------------
  // B. ACTUALIZAR / EDITAR CONTACTO (contacts_update / PUT /api/contacts/{id})
  // ----------------------------------------------------
  else if (
    (lower.includes('actualiza') || lower.includes('edita') || lower.includes('cambia') || lower.includes('modifica')) &&
    (lower.includes('contacto') || lower.includes('cliente') || lower.includes('teléfono') || lower.includes('telefono') || lower.includes('correo') || lower.includes('email') || lower.includes('kevin') || lower.includes('willy'))
  ) {
    const startTime = Date.now();
    const liveContacts = await fetchLiveContacts('', 50);

    const targetPartner = liveContacts.find(c => 
      (lower.includes('kevin') && c.name.toLowerCase().includes('kevin')) ||
      (lower.includes('willy') && c.name.toLowerCase().includes('willy')) ||
      (lower.includes('cognitive') && c.name.toLowerCase().includes('cognitive')) ||
      (userText.toLowerCase().includes(c.name.toLowerCase()))
    ) || (liveContacts.length > 0 ? liveContacts[0] : null);

    if (targetPartner) {
      const emailMatch = userText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);
      const phoneMatch = userText.match(/(?:\+?\d{2,4}\s?)?\d{8,11}/);

      const updatePayload: any = {};
      if (emailMatch) updatePayload.email = emailMatch[1];
      if (phoneMatch) updatePayload.phone = phoneMatch[0];
      if (lower.includes('ciudad') || lower.includes('lima')) updatePayload.city = 'Lima';

      const tc: ToolCall = {
        id: `tc-${Date.now()}`,
        name: 'contacts_update',
        args: { partner_id: targetPartner.id, ...updatePayload },
        status: 'running',
      };
      callbacks.onToolCallStart?.(tc);

      try {
        const updated = await updateLiveContact(targetPartner.id, updatePayload);
        tc.status = 'completed';
        tc.executionTimeMs = Date.now() - startTime;
        tc.result = updated;
        callbacks.onToolCallEnd?.(tc);
        toolCalls.push(tc);

        responseContent = `✏️ **Contacto actualizado con éxito en Odoo 20** mediante **\`contacts_update\`**.\n\n- 👤 **Contacto:** **${targetPartner.name}** (ID: \`${targetPartner.id}\`)\n` +
          Object.entries(updatePayload).map(([k, v]) => `- **${k.toUpperCase()}:** \`${v}\``).join('\n') +
          `\n\nLos cambios ya están guardados en tu servidor \`https://erp.cognitivecore.pe\`.`;
      } catch (err: any) {
        tc.status = 'failed';
        tc.result = { error: err.message };
        callbacks.onToolCallEnd?.(tc);
        toolCalls.push(tc);
        responseContent = `❌ Error al actualizar contacto: ${err.message}`;
      }
    } else {
      responseContent = `No encontré el contacto especificado en Odoo 20 para editarlo. Por favor especifica el nombre o ID.`;
    }
  }

  // ----------------------------------------------------
  // C. CREAR PRODUCTO / SERVICIO (inventory_create_product)
  // ----------------------------------------------------
  else if (
    (lower.includes('crear') || lower.includes('agrega') || lower.includes('nuevo')) &&
    (lower.includes('producto') || lower.includes('servicio') || lower.includes('item') || lower.includes('artículo'))
  ) {
    const startTime = Date.now();
    const priceMatch = userText.match(/(?:precio|costo|valor)?\s*(?:s\/\.?|pen|\$|€)?\s*(\d+(?:\.\d{1,2})?)/i);
    const codeMatch = userText.match(/(?:código|codigo|sku|ref)\s*:?\s*([A-Za-z0-9_-]+)/i);

    const prodName = lower.includes('licencia') ? 'Licencia Cloud ERP CognitiveCore' : 'Nuevo Servicio Especializado ERP';
    const prodPrice = priceMatch ? parseFloat(priceMatch[1]) : 1500.0;
    const prodCode = codeMatch ? codeMatch[1].toUpperCase() : `SRV-${Date.now().toString().slice(-4)}`;

    const tc: ToolCall = {
      id: `tc-${Date.now()}`,
      name: 'inventory_create_product',
      args: {
        name: prodName,
        default_code: prodCode,
        list_price: prodPrice,
        type: 'service',
      },
      status: 'running',
    };
    callbacks.onToolCallStart?.(tc);

    try {
      const createdProd = await createLiveProduct(tc.args as any);
      tc.status = 'completed';
      tc.executionTimeMs = Date.now() - startTime;
      tc.result = createdProd;
      callbacks.onToolCallEnd?.(tc);
      toolCalls.push(tc);

      odooPreview = {
        type: 'product',
        id: createdProd.id || createdProd.product_id || 'new',
        name: prodName,
        details: {
          'Referencia (SKU)': prodCode,
          'Precio Lista': `S/. ${prodPrice.toFixed(2)}`,
          'Tipo': 'Servicio',
          'Estado': 'Registrado en Odoo 20',
        },
        status: 'Activo',
        total: prodPrice,
        currency: 'S/.',
        actions: [
          { label: 'Crear Presupuesto con este Producto', action: 'create_so', variant: 'primary' },
        ],
      };

      responseContent = `📦 **Producto/Servicio creado exitosamente en Odoo 20 Community** mediante **\`inventory_create_product\`**.\n\n- **Nombre:** **${prodName}**\n- **Código:** \`${prodCode}\`\n- **Precio:** **S/. ${prodPrice.toFixed(2)}**\n\nYa está disponible para incluir en presupuestos y facturas.`;
    } catch (err: any) {
      tc.status = 'failed';
      tc.result = { error: err.message };
      callbacks.onToolCallEnd?.(tc);
      toolCalls.push(tc);
      responseContent = `❌ Error al crear producto en Odoo 20: ${err.message}`;
    }
  }

  // ----------------------------------------------------
  // D. CREAR TAREA EN PROYECTO (projects_create_task)
  // ----------------------------------------------------
  else if (
    (lower.includes('crear') || lower.includes('agrega') || lower.includes('nueva')) &&
    (lower.includes('tarea') || lower.includes('task') || lower.includes('to-do') || lower.includes('pendiente'))
  ) {
    const startTime = Date.now();
    const taskNameMatch = userText.match(/(?:tarea|task|de)\s*:?\s*([A-Za-zÀ-ÿ0-9\.\s-]+)/i);
    const taskName = taskNameMatch ? taskNameMatch[1].trim() : 'Nueva Tarea MCP ERP';

    const tc: ToolCall = {
      id: `tc-${Date.now()}`,
      name: 'projects_create_task',
      args: { name: taskName, description: 'Creada vía Cognitive Core Chat MCP' },
      status: 'running',
    };
    callbacks.onToolCallStart?.(tc);

    try {
      const createdTask = await createLiveTask(tc.args as any);
      tc.status = 'completed';
      tc.executionTimeMs = Date.now() - startTime;
      tc.result = createdTask;
      callbacks.onToolCallEnd?.(tc);
      toolCalls.push(tc);

      responseContent = `📌 **Tarea creada con éxito en Odoo 20 Proyectos** (\`projects_create_task\`):\n\n- 📝 **Tarea:** **${taskName}**\n- 🆔 **ID:** \`${createdTask.id || createdTask.task_id}\`\n- ⏱️ **Fecha:** ${new Date().toLocaleDateString('es-ES')}`;
    } catch (err: any) {
      tc.status = 'failed';
      tc.result = { error: err.message };
      callbacks.onToolCallEnd?.(tc);
      toolCalls.push(tc);
      responseContent = `❌ Error al crear tarea: ${err.message}`;
    }
  }

  // ----------------------------------------------------
  // E. LISTAR CONTACTOS (READ)
  // ----------------------------------------------------
  else if (
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
        'Protocolo': 'MCP Server CRU',
      },
      items: liveContacts,
      actions: [
        { label: 'Crear Nuevo Contacto', action: 'create_contact', variant: 'primary' },
        { label: 'Exportar a WhatsApp', action: 'export_whatsapp', variant: 'secondary' },
      ],
    };

    if (liveContacts.length > 0) {
      responseContent = `He consultado el modelo **\`res.partner\`** en tu servidor **Odoo 20 Community (\`https://erp.cognitivecore.pe\`)** mediante **\`contacts_list\`**.\n\nSe obtuvieron **${liveContacts.length} contactos reales**:\n\n` +
        liveContacts.map(c => `- 👤 **${c.name}** | ✉️ \`${c.email}\` | 📞 \`${c.phone}\` | 📍 ${c.street !== '-' ? c.street : c.city} | RUC/VAT: \`${c.vat}\``).join('\n') +
        `\n\n💡 *Puedes pedirme: "Crea un contacto para..." o "Actualiza el teléfono de..." directamente desde aquí.*`;
    } else {
      responseContent = `He consultado **Odoo 20 Community** mediante MCP pero no se encontraron contactos con el término de búsqueda solicitado.`;
    }
  }

  // ----------------------------------------------------
  // F. LISTAR PRODUCTOS (READ)
  // ----------------------------------------------------
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
        `\n\n💡 *Puedes pedirme: "Crea un producto llamado..." o "Actualiza el precio de..." en el chat.*`;
    } else {
      responseContent = `No se encontraron productos registrados actualmente en el catálogo de tu Odoo 20 Community. Puedes pedirme crear uno.`;
    }
  }

  // ----------------------------------------------------
  // G. VENTAS (sale.order)
  // ----------------------------------------------------
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
      responseContent = `He consultado el modelo **\`sale.order\`** en tu Odoo 20 Community (**\`https://erp.cognitivecore.pe\`**).\n\nActualmente **no hay órdenes de venta registradas**. Puedes pedirme: *"Crea un presupuesto para COGNITIVE CORE E.I.R.L."* para generar uno.`;
    }
  }

  // ----------------------------------------------------
  // H. THEME & BRANDING
  // ----------------------------------------------------
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

      responseContent = `🎨 **Branding y Tema actual de Odoo 20 Community**:\n\n- 🏢 **Empresa:** **${liveTheme.name || 'Cognitive Core'}**\n- 🔵 **Color Primario:** \`${liveTheme.primary_color}\`\n- 🔷 **Color Secundario:** \`${liveTheme.secondary_color}\`\n- ✍️ **Tipografía:** \`${liveTheme.font || 'Lato'}\`\n\nPuedes editar los colores en la pestaña **🎨 Theme & Branding**.`;
    } else {
      responseContent = `He consultado la configuración de Branding en Odoo 20.`;
    }
  }

  // ----------------------------------------------------
  // I. DEFAULT / HELP
  // ----------------------------------------------------
  else {
    responseContent = `¡Hola! Soy **Cognitive Core Copilot**, con soporte **CRU completo (Crear, Consultar y Editar)** en tu **Odoo 20 Community (\`https://erp.cognitivecore.pe\`)** mediante **MCP**.\n\nAcciones disponibles en lenguaje natural:\n- ➕ **Crear:** *"Crea un contacto para Juan Pérez con email juan@empresa.pe"* o *"Crea un producto llamado Licencia Cloud ERP con precio 1500"*\n- ✏️ **Editar:** *"Actualiza el teléfono de Kevin Galarza a +51 988 777 666"*\n- 🔍 **Consultar:** *"Dame la lista de contactos"*, *"Ver catálogo de productos"* o *"Listar órdenes de venta"*\n- 🎨 **Branding:** *"Personalizar tema de Odoo"*`;
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
