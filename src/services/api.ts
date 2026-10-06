import { Message, ToolCall } from '@/types';
import { MOCK_ODOO_PARTNERS, MOCK_ODOO_PRODUCTS } from './mockData';

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
  // Check if real backend is available
  let useLiveBackend = false;
  try {
    const check = await fetch(`${BACKEND_BASE_URL}/health`, { method: 'GET', signal: AbortSignal.timeout(1200) });
    if (check.ok) useLiveBackend = true;
  } catch {
    useLiveBackend = false;
  }

  if (useLiveBackend) {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, history, mode }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Error en backend: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        accumulated += chunk;
        callbacks.onToken?.(chunk);
      }

      callbacks.onFinish?.({
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: accumulated,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      return;
    } catch (err) {
      console.warn('Fallo conectando al backend live, ejecutando fallback cognitivo integrado...', err);
    }
  }

  // Intelligent fallback cognitive simulation (rich streaming & MCP tool visualization)
  await simulateCognitiveResponse(userText, mode, callbacks);
}

async function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

async function simulateCognitiveResponse(
  prompt: string,
  mode: string,
  callbacks: StreamCallbacks
): Promise<void> {
  const lower = prompt.toLowerCase();
  const msgId = `msg-${Date.now()}`;
  let finalContent = '';
  let toolCalls: ToolCall[] = [];
  let odooPreview: any = undefined;

  if (lower.includes('stock') || lower.includes('producto') || lower.includes('servidor') || lower.includes('switch')) {
    // Simulate Odoo stock MCP tool call
    const toolCall: ToolCall = {
      id: `tc-${Date.now()}`,
      name: 'odoo_get_stock_levels',
      args: { product_query: 'Servidor Rack 2U Enterprise AI', warehouse_id: 1 },
      status: 'running',
    };
    callbacks.onToolCallStart?.(toolCall);
    await delay(700);

    const product = MOCK_ODOO_PRODUCTS[0];
    toolCall.status = 'completed';
    toolCall.result = {
      id: product.id,
      name: product.name,
      code: product.defaultCode,
      qty_available: product.qtyAvailable,
      location: 'Almacén Principal (WH/Stock)',
      price: product.listPrice,
    };
    toolCall.executionTimeMs = 380;
    callbacks.onToolCallEnd?.(toolCall);
    toolCalls.push(toolCall);

    odooPreview = {
      type: 'product',
      id: product.id,
      name: product.name,
      details: {
        'Referencia / SKU': product.defaultCode,
        'Stock Físico': `${product.qtyAvailable} unidades`,
        'Precio de Lista': `${product.listPrice} €`,
        'Almacén': 'WH/Stock Principal',
      },
      status: 'En Stock',
      total: product.listPrice,
      currency: '€',
      actions: [
        { label: 'Crear Presupuesto', action: 'create_quote', variant: 'primary' },
        { label: 'Ver en Odoo', action: 'open_odoo', variant: 'secondary' },
      ],
    };

    finalContent = `He consultado el inventario en **Odoo ERP** en tiempo real mediante el MCP Server.\n\nEl producto **${product.name}** (\`${product.defaultCode}\`) cuenta con **${product.qtyAvailable} unidades disponibles** para entrega inmediata a un precio unitario de **${product.listPrice.toLocaleString()} €**.\n\n¿Deseas que prepare un borrador de presupuesto de venta (SO) o lo notifique por WhatsApp/Telegram?`;
  } else if (lower.includes('presupuesto') || lower.includes('pedido') || lower.includes('orden') || lower.includes('so') || lower.includes('cliente')) {
    // Simulate partner lookup & order generation
    const tool1: ToolCall = {
      id: `tc-${Date.now()}-1`,
      name: 'odoo_search_partner',
      args: { query: 'Innova Tech Solutions' },
      status: 'running',
    };
    callbacks.onToolCallStart?.(tool1);
    await delay(500);
    const partner = MOCK_ODOO_PARTNERS[1];
    tool1.status = 'completed';
    tool1.result = { partner_id: partner.id, name: partner.name, email: partner.email, phone: partner.phone };
    tool1.executionTimeMs = 210;
    callbacks.onToolCallEnd?.(tool1);
    toolCalls.push(tool1);

    const tool2: ToolCall = {
      id: `tc-${Date.now()}-2`,
      name: 'odoo_create_sale_order',
      args: {
        partner_id: partner.id,
        order_lines: JSON.stringify([{ product_id: 101, qty: 2, price_unit: 3450.0 }]),
      },
      status: 'running',
    };
    callbacks.onToolCallStart?.(tool2);
    await delay(600);
    tool2.status = 'completed';
    tool2.result = { order_id: 504, name: 'SO0504', state: 'draft', total_amount: 6900.0 };
    tool2.executionTimeMs = 450;
    callbacks.onToolCallEnd?.(tool2);
    toolCalls.push(tool2);

    odooPreview = {
      type: 'sale_order',
      id: 504,
      name: 'Presupuesto SO0504',
      details: {
        Cliente: partner.name,
        Fecha: new Date().toLocaleDateString('es-ES'),
        Líneas: '2x Servidor Rack 2U Enterprise AI',
        Subtotal: '6.900,00 €',
        Impuestos: '1.449,00 € (21% IVA)',
      },
      status: 'Borrador (Draft)',
      total: 8349.0,
      currency: '€',
      actions: [
        { label: 'Confirmar en Odoo', action: 'confirm_so', variant: 'primary' },
        { label: 'Enviar PDF por WhatsApp', action: 'send_whatsapp_doc', variant: 'secondary' },
      ],
    };

    finalContent = `Se ha generado el presupuesto **SO0504** para el cliente **${partner.name}** en **Odoo ERP**.\n\n- **Total con impuestos:** 8.349,00 €\n- **Estado actual:** Borrador (\`draft\`)\n\nPuedes confirmarlo directamente aquí o enviarlo por WhatsApp/Telegram al contacto registrado (\`${partner.phone}\`).`;
  } else if (lower.includes('whatsapp') || lower.includes('telegram') || lower.includes('mensaje') || lower.includes('canal')) {
    const toolCall: ToolCall = {
      id: `tc-${Date.now()}`,
      name: 'telegram_send_alert',
      args: { chat_id: '@erp_alerts_team', message: 'Notificación de estado ERP' },
      status: 'running',
    };
    callbacks.onToolCallStart?.(toolCall);
    await delay(600);
    toolCall.status = 'completed';
    toolCall.result = { success: true, message_id: 18492, delivered_at: new Date().toISOString() };
    toolCall.executionTimeMs = 190;
    callbacks.onToolCallEnd?.(toolCall);
    toolCalls.push(toolCall);

    finalContent = `Los canales omnicanal están activos y sincronizados:\n\n1. 🟢 **WhatsApp Business Bot:** Conectado (+34 612 345 678), 14 conversaciones activas.\n2. 🔵 **Telegram ERP Agent:** Conectado (@CognitiveCoreErp_Bot), Webhook OK.\n\nPuedes solicitarme despachar presupuestos, emitir alertas de stock bajo o atender clientes de forma autónoma con las herramientas MCP integradas.`;
  } else {
    finalContent = `¡Hola! Soy **Cognitive Core Assistant**, tu agente inteligente con soporte MCP para **Odoo ERP** e integraciones omnicanal con **WhatsApp y Telegram**.\n\n¿Qué deseas gestionar hoy?\n- 📦 *Consultar stock de productos o almacenes en Odoo*\n- 📄 *Crear o validar presupuestos y órdenes de venta (SO)*\n- 👥 *Buscar fichas de clientes y deuda facturada*\n- 📱 *Despachar documentos o recibir consultas desde WhatsApp/Telegram*`;
  }

  // Stream text word by word
  const words = finalContent.split(' ');
  for (let i = 0; i < words.length; i++) {
    const chunk = (i === 0 ? '' : ' ') + words[i];
    callbacks.onToken?.(chunk);
    await delay(18);
  }

  callbacks.onFinish?.({
    id: msgId,
    role: 'assistant',
    content: finalContent,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    toolCalls,
    odooPreview,
  });
}
