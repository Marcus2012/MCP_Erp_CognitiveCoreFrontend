import React from 'react';
import { 
  Bot, 
  Layers, 
  MessageSquare, 
  Share2, 
  Cpu, 
  Plus, 
  ChevronRight,
  Database,
  Radio,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import { ChatSession } from '@/types';

interface SidebarProps {
  currentTab: 'chat' | 'odoo' | 'channels' | 'mcp';
  setCurrentTab: (tab: 'chat' | 'odoo' | 'channels' | 'mcp') => void;
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: (mode: 'general' | 'odoo' | 'omnichannel') => void;
  backendOnline: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  backendOnline,
}) => {
  return (
    <aside className="w-72 bg-slate-950/80 backdrop-blur-xl border-r border-slate-800/80 flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
            <Cpu className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="font-semibold text-sm tracking-tight text-white flex items-center gap-1.5">
              Cognitive Core <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">MCP</span>
            </h1>
            <p className="text-[11px] text-slate-400">ERP & Omnichannel AI</p>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="p-3 space-y-1">
        <div className="text-[11px] font-medium text-slate-400 px-3 py-1 uppercase tracking-wider">
          Módulos
        </div>
        
        <button
          onClick={() => setCurrentTab('chat')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'chat'
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          <span className="flex-1 text-left">Agente de Chat IA</span>
          {currentTab === 'chat' && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />}
        </button>

        <button
          onClick={() => setCurrentTab('odoo')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'odoo'
              ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Database className="w-4 h-4 text-purple-400" />
          <span className="flex-1 text-left">Odoo ERP Workspace</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300">v17</span>
        </button>

        <button
          onClick={() => setCurrentTab('channels')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'channels'
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Share2 className="w-4 h-4 text-emerald-400" />
          <span className="flex-1 text-left">WhatsApp & Telegram</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </button>

        <button
          onClick={() => setCurrentTab('mcp')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'mcp'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Sliders className="w-4 h-4 text-amber-400" />
          <span className="flex-1 text-left">Inspector MCP Tools</span>
        </button>
      </div>

      {/* Chat Sessions History */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <div className="flex items-center justify-between px-3 py-1">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Conversaciones
          </span>
          <button
            onClick={() => onNewSession('general')}
            className="p-1 rounded-md text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition"
            title="Nueva Conversación"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-1">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => {
                onSelectSession(session.id);
                setCurrentTab('chat');
              }}
              className={`w-full group text-left px-3 py-2 rounded-lg transition-all text-xs flex flex-col gap-0.5 ${
                activeSessionId === session.id && currentTab === 'chat'
                  ? 'bg-slate-800/80 text-white border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium truncate max-w-[170px]">{session.title}</span>
                <span className="text-[10px] text-slate-400">{session.updatedAt}</span>
              </div>
              {session.lastMessageSnippet && (
                <p className="text-[11px] text-slate-400 truncate">{session.lastMessageSnippet}</p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Backend & Connection Status Footer */}
      <div className="p-3 border-t border-slate-800/60 bg-slate-950/40">
        <div className="flex items-center justify-between text-xs px-2 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${backendOnline ? 'bg-emerald-400' : 'bg-cyan-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${backendOnline ? 'bg-emerald-500' : 'bg-cyan-500'}`}></span>
            </span>
            <span className="text-slate-300 text-[11px] font-medium">
              {backendOnline ? 'MCP Server Conectado' : 'Cognitive Engine Ready'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
};
