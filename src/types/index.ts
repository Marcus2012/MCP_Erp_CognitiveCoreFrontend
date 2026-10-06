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
  type: 'sale_order' | 'invoice' | 'product' | 'partner' | 'stock' | 'contacts_list' | 'lead' | 'task' | 'employee' | 'meeting' | 'theme';
  id: string | number;
  name: string;
  details: Record<string, any>;
  items?: any[];
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
  street?: string;
  vat?: string;
  isCompany?: boolean;
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

export interface OdooThemeBranding {
  id?: number;
  name?: string;
  primary_color: string;
  secondary_color: string;
  email_primary_color?: string;
  email_secondary_color?: string;
  font?: string;
  uses_default_logo?: boolean;
  custom_css_installed?: boolean;
  custom_css_active?: boolean;
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
  category: string;
  parameters: {
    type: string;
    properties?: Record<string, any>;
    required?: string[];
  };
}
