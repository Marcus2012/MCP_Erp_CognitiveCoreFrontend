import React, { useState } from 'react';
import { 
  Bot, 
  User, 
  Terminal, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Copy, 
  Check, 
  ExternalLink, 
  FileText, 
  ShoppingCart, 
  Package, 
  ChevronDown, 
  ChevronUp, 
  Send,
  MessageSquare
} from 'lucide-react';
import { Message, ToolCall, OdooEntityPreview } from '@/types';

interface ChatMessageProps {
  message: Message;
  onOdooAction?: (action: string, entity: OdooEntityPreview) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onOdooAction }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [expandedTools, setExpandedTools] = useState<Record<string, boolean>>({});

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleTool = (id: string) => {
    setExpandedTools((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div
      className={`flex gap-3.5 max-w-4xl w-full mx-auto transition-all ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-cyan-500/10 mt-0.5 border border-white/10">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}

      <div className={`flex flex-col gap-2 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Tool Calls Accordion (if any) */}
        {!isUser && message.toolCalls && message.toolCalls.length > 0 && (
          <div className="w-full space-y-1.5 mb-1">
            {message.toolCalls.map((tc) => {
              const isExpanded = !!expandedTools[tc.id];
              return (
                <div
                  key={tc.id}
                  className="rounded-lg border border-slate-800/90 bg-slate-900/60 overflow-hidden text-xs"
                >
                  <button
                    onClick={() => toggleTool(tc.id)}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-slate-800/40 transition text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="font-mono text-cyan-300 font-medium">{tc.name}</span>
                      {tc.status === 'completed' && (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          <CheckCircle className="w-2.5 h-2.5" /> Completado {tc.executionTimeMs && `(${tc.executionTimeMs}ms)`}
                        </span>
                      )}
                      {tc.status === 'running' && (
                        <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded animate-pulse">
                          <Clock className="w-2.5 h-2.5" /> Ejecutando...
                        </span>
                      )}
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="p-3 bg-slate-950/80 border-t border-slate-800/80 font-mono text-[11px] space-y-2">
                      <div>
                        <div className="text-slate-500 text-[10px] uppercase font-semibold mb-1">Argumentos</div>
                        <pre className="text-slate-300 bg-slate-900/80 p-2 rounded border border-slate-800 overflow-x-auto">
                          {JSON.stringify(tc.args, null, 2)}
                        </pre>
                      </div>
                      {tc.result && (
                        <div>
                          <div className="text-slate-500 text-[10px] uppercase font-semibold mb-1">Respuesta MCP</div>
                          <pre className="text-emerald-300 bg-slate-900/80 p-2 rounded border border-slate-800 overflow-x-auto">
                            {JSON.stringify(tc.result, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={`relative group rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm transition-all ${
            isUser
              ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-tr-none'
              : 'bg-slate-900/85 text-slate-100 border border-slate-800/80 backdrop-blur-sm rounded-tl-none'
          }`}
        >
          {/* Formatted Markdown-like Content */}
          <div className="whitespace-pre-wrap break-words space-y-2">
            {message.content.split('\n\n').map((paragraph, pIdx) => {
              return (
                <p key={pIdx}>
                  {paragraph.split(/(\*\*.*?\*\*|`.*?`)/g).map((part, idx) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return <strong key={idx} className="font-semibold text-cyan-200">{part.slice(2, -2)}</strong>;
                    }
                    if (part.startsWith('`') && part.endsWith('`')) {
                      return (
                        <code key={idx} className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-xs text-amber-300 border border-slate-700">
                          {part.slice(1, -1)}
                        </code>
                      );
                    }
                    return part;
                  })}
                </p>
              );
            })}
          </div>

          {/* Odoo Entity Rich Card Preview */}
          {message.odooPreview && (
            <div className="mt-3.5 p-3.5 rounded-xl bg-slate-950/70 border border-purple-500/30 shadow-lg space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                    {message.odooPreview.type === 'sale_order' ? (
                      <ShoppingCart className="w-4 h-4" />
                    ) : (
                      <Package className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-100">{message.odooPreview.name}</h4>
                    <span className="text-[10px] text-purple-300 uppercase tracking-wider font-mono">Odoo ERP Live Widget</span>
                  </div>
                </div>
                {message.odooPreview.status && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {message.odooPreview.status}
                  </span>
                )}
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(message.odooPreview.details).map(([k, v]) => (
                  <div key={k} className="flex flex-col">
                    <span className="text-[10px] text-slate-400">{k}</span>
                    <span className="font-medium text-slate-200 truncate">{String(v)}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              {message.odooPreview.actions && message.odooPreview.actions.length > 0 && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                  {message.odooPreview.actions.map((act, i) => (
                    <button
                      key={i}
                      onClick={() => onOdooAction?.(act.action, message.odooPreview!)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                        act.variant === 'primary'
                          ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/20'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      }`}
                    >
                      {act.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Message Meta footer & Copy button */}
          <div className="flex items-center justify-between gap-4 mt-2 pt-1 border-t border-white/5 text-[10px] text-slate-400">
            <div className="flex items-center gap-2">
              <span>{message.timestamp}</span>
              {message.channel && (
                <span className="capitalize px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-medium">
                  {message.channel}
                </span>
              )}
            </div>

            <button
              onClick={handleCopy}
              className="opacity-0 group-hover:opacity-100 transition flex items-center gap-1 hover:text-slate-200"
              title="Copiar texto"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center flex-shrink-0 shadow-md mt-0.5 border border-white/10">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
};
