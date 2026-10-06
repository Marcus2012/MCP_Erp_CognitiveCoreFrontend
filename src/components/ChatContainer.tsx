import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Paperclip, 
  RefreshCw, 
  Layers, 
  Database, 
  Share2, 
  ArrowDown,
  Loader2,
  Terminal
} from 'lucide-react';
import { Message, OdooEntityPreview } from '@/types';
import { ChatMessage } from './ChatMessage';

interface ChatContainerProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  chatMode: 'general' | 'odoo' | 'omnichannel';
  onOdooAction?: (action: string, entity: OdooEntityPreview) => void;
}

const QUICK_PROMPTS = [
  { label: '📦 Stock de Servidores en Odoo', prompt: '¿Cuál es el stock actual de Servidor Rack 2U Enterprise AI en Odoo?' },
  { label: '📄 Crear Presupuesto SO', prompt: 'Crea un presupuesto en Odoo para el cliente Innova Tech Solutions por 2 Servidores AI' },
  { label: '👥 Buscar Clientes en ERP', prompt: 'Busca los datos de contacto y total facturado del cliente Deco Addict SL' },
  { label: '📱 Resumen por WhatsApp & Telegram', prompt: 'Verifica el estado de los canales de WhatsApp y Telegram para alertas' },
];

export const ChatContainer: React.FC<ChatContainerProps> = ({
  messages,
  isLoading,
  onSendMessage,
  chatMode,
  onOdooAction,
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    setInput('');
    onSendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950/40 relative overflow-hidden">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center shadow-xl shadow-cyan-500/10">
              <Sparkles className="w-8 h-8 text-cyan-400" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">Cognitive Core ERP Copilot</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Asistente inteligente conectado a **Odoo ERP** y canales omnicanal (**WhatsApp, Telegram**) mediante el protocolo **MCP (Model Context Protocol)**.
              </p>
            </div>

            {/* Quick action chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
              {QUICK_PROMPTS.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(qp.prompt)}
                  className="p-3 text-left rounded-xl bg-slate-900/60 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 transition-all text-xs text-slate-300 hover:text-white group"
                >
                  <div className="font-medium text-slate-200 group-hover:text-cyan-300 transition flex items-center justify-between">
                    <span>{qp.label}</span>
                    <Sparkles className="w-3 h-3 text-cyan-500/0 group-hover:text-cyan-400 transition" />
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">{qp.prompt}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              onOdooAction={onOdooAction}
            />
          ))
        )}

        {/* Loading Indicator / Streaming */}
        {isLoading && (
          <div className="flex gap-3 max-w-4xl mx-auto items-center text-xs text-slate-400">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-300 font-medium">Cognitive Core pensando...</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <form
          onSubmit={handleSubmit}
          className="max-w-4xl mx-auto relative rounded-2xl bg-slate-900/90 border border-slate-800 focus-within:border-cyan-500/60 focus-within:ring-1 focus-within:ring-cyan-500/30 transition-all shadow-xl"
        >
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              chatMode === 'odoo'
                ? 'Pregunta a Odoo (ej. stock, crear presupuesto, buscar cliente)...'
                : chatMode === 'omnichannel'
                ? 'Enviar mensaje o consultar estado de WhatsApp / Telegram...'
                : 'Escribe tu consulta para Cognitive Core MCP...'
            }
            className="w-full bg-transparent px-4 py-3.5 pr-24 text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none max-h-32 min-h-[52px]"
          />

          <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5">
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`p-2 rounded-xl transition-all flex items-center justify-center ${
                input.trim() && !isLoading
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20 hover:scale-105 active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
        <div className="text-center mt-2">
          <span className="text-[10px] text-slate-500">
            Presiona <kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono">Enter</kbd> para enviar, <kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono">Shift+Enter</kbd> para salto de línea
          </span>
        </div>
      </div>
    </div>
  );
};
