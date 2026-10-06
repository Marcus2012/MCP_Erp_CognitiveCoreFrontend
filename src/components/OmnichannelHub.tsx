import React, { useState } from 'react';
import { 
  Share2, 
  Send, 
  QrCode, 
  CheckCircle2, 
  AlertTriangle, 
  Radio, 
  Bot, 
  Sparkles, 
  Smartphone, 
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { INITIAL_CHANNELS } from '@/services/mockData';
import { IntegrationChannel } from '@/types';

interface OmnichannelHubProps {
  onSendMessageToChat: (prompt: string) => void;
}

export const OmnichannelHub: React.FC<OmnichannelHubProps> = ({ onSendMessageToChat }) => {
  const [channels, setChannels] = useState<IntegrationChannel[]>(INITIAL_CHANNELS);
  const [copiedWebhook, setCopiedWebhook] = useState<string | null>(null);
  const [testMessage, setTestMessage] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('ch-whatsapp-1');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedWebhook(id);
    setTimeout(() => setCopiedWebhook(null), 2000);
  };

  const handleSendTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testMessage.trim()) return;
    const targetChannel = channels.find(c => c.id === selectedChannel);
    onSendMessageToChat(`Simula enviar el siguiente mensaje a través de ${targetChannel?.name}: "${testMessage}"`);
    setTestMessage('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950/40 overflow-y-auto p-6 space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-slate-950 border border-emerald-500/20 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-white">Hub de Integraciones Omnicanal</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                2 Canales Activos
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Conexión directa con WhatsApp Business Cloud API & Telegram Bot API sincronizados con el ERP.
            </p>
          </div>
        </div>

        <button
          onClick={() => onSendMessageToChat('Comprueba el estado de salud de todos los canales omnicanal')}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition shadow-lg shadow-emerald-600/20 self-start sm:self-auto"
        >
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>Test de Conectividad</span>
        </button>
      </div>

      {/* Active Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {channels.filter(c => c.type !== 'odoo').map((ch) => (
          <div
            key={ch.id}
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 backdrop-blur-sm space-y-4 hover:border-slate-700 transition"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${ch.type === 'whatsapp' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                  {ch.type === 'whatsapp' ? <Smartphone className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">{ch.name}</h4>
                  <p className="text-[11px] text-slate-400 font-mono">{ch.accountInfo}</p>
                </div>
              </div>

              <span className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Conectado
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-[10px] text-slate-500">Conversaciones Activas</span>
                <p className="text-sm font-bold text-slate-200 mt-0.5">{ch.activeChatsCount} chats</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-[10px] text-slate-500">Última Sincronización</span>
                <p className="text-sm font-bold text-slate-200 mt-0.5">{ch.lastSync}</p>
              </div>
            </div>

            {/* Webhook details */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-medium">Webhook Endpoint</span>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300">
                <span className="truncate max-w-[280px]">{ch.webhookUrl}</span>
                <button
                  onClick={() => copyToClipboard(ch.webhookUrl, ch.id)}
                  className="p-1 rounded hover:bg-slate-850 text-slate-400 hover:text-white transition"
                  title="Copiar URL"
                >
                  {copiedWebhook === ch.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dispatch Outbound Test Message */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 backdrop-blur-sm space-y-4">
        <h4 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
          <Send className="w-4 h-4 text-emerald-400" /> Despacho de Mensaje de Prueba
        </h4>

        <form onSubmit={handleSendTest} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500/50"
            >
              <option value="ch-whatsapp-1">🟢 WhatsApp (+34 612 345 678)</option>
              <option value="ch-telegram-1">🔵 Telegram (@CognitiveCoreErp_Bot)</option>
            </select>

            <input
              type="text"
              placeholder="Escribe el mensaje o notificación de alerta..."
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 placeholder-slate-500"
            />

            <button
              type="submit"
              disabled={!testMessage.trim()}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white text-xs font-medium transition shadow-lg shadow-emerald-600/20"
            >
              Enviar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
