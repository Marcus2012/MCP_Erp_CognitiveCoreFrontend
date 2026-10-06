import React from 'react';
import { 
  Bot, 
  Sparkles, 
  Database, 
  Share2, 
  Wifi, 
  Globe, 
  RefreshCw,
  Zap
} from 'lucide-react';

interface HeaderProps {
  currentTab: 'chat' | 'odoo' | 'channels' | 'mcp';
  chatMode: 'general' | 'odoo' | 'omnichannel';
  setChatMode: (mode: 'general' | 'odoo' | 'omnichannel') => void;
  onRefreshBackend: () => void;
  backendOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  chatMode,
  setChatMode,
  onRefreshBackend,
  backendOnline,
}) => {
  const getTabTitle = () => {
    switch (currentTab) {
      case 'chat':
        return 'Asistente Cognitivo & MCP Copilot';
      case 'odoo':
        return 'Odoo ERP Workspace & Entidades';
      case 'channels':
        return 'Hub de Mensajería: WhatsApp & Telegram';
      case 'mcp':
        return 'Inspector de Herramientas MCP';
    }
  };

  return (
    <header className="h-14 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md flex items-center justify-between px-6 select-none z-10">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
          {getTabTitle()}
        </h2>
      </div>

      {/* Mode selectors when inside Chat */}
      {currentTab === 'chat' && (
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 rounded-lg border border-slate-800">
          <button
            onClick={() => setChatMode('general')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              chatMode === 'general'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            General IA
          </button>

          <button
            onClick={() => setChatMode('odoo')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              chatMode === 'odoo'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-purple-400" />
            Odoo Copilot
          </button>

          <button
            onClick={() => setChatMode('omnichannel')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              chatMode === 'omnichannel'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
            Omnicanal
          </button>
        </div>
      )}

      {/* Action shortcuts & sync */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
          <Zap className="w-3 h-3 text-amber-400" />
          <span>MCP Protocol v1.2</span>
        </div>

        <button
          onClick={onRefreshBackend}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition text-xs font-medium"
          title="Verificar conexión con backend"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Sincronizar</span>
        </button>
      </div>
    </header>
  );
};
