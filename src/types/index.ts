export type ChannelType = 'whatsapp' | 'telegram' | 'odoo' | 'web';

export type ToolStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, any>;
  result?: any;
  status: ToolStatus;
  executionTimeMs?: number;
}

export interface OdooEntityPreview {
  type: 'sale_order' | 'invoice' | 'product' | 'partner' | 'stock';
  id: string | number;
  name: string;
  details: Record<string, any>;
  status?: string;
  total?: number;
  currency?: string;
  actions?: { label: string; action: string; variant?: 'primary' | 'secondary' | 'danger' }[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  toolCalls?: ToolCall[];
  odooPreview?: OdooEntityPreview;
  channel?: ChannelType;
  tokensUsed?: number;
}

export interface ChatSession {
  id: string;
  title: string;
  mode: 'general' | 'odoo' | 'omnichannel';
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessageSnippet?: string;
}

export interface OdooPartner {
  id: number;
  name: string;
  email: string;
  phone: string;
  city: string;
  totalInvoiced: number;
}

export interface OdooSaleOrder {
  id: number;
  name: string;
  partnerName: string;
  dateOrder: string;
  amountTotal: number;
  state: 'draft' | 'sent' | 'sale' | 'done' | 'cancel';
}

export interface OdooProduct {
  id: number;
  name: string;
  defaultCode: string;
  qtyAvailable: number;
  listPrice: number;
  category: string;
}

export interface IntegrationChannel {
  id: string;
  name: string;
  type: ChannelType;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  accountInfo: string;
  lastSync: string;
  activeChatsCount: number;
  webhookUrl: string;
  config: Record<string, string>;
}

export interface McpToolDefinition {
  name: string;
  description: string;
  category: 'odoo' | 'whatsapp' | 'telegram' | 'cognitive_core';
  parameters: {
    type: string;
    properties: Record<string, { type: string; description: string; required?: boolean }>;
    required?: string[];
  };
}
