import React, { useState } from 'react';
import { 
  Sliders, 
  Terminal, 
  Code, 
  Play, 
  CheckCircle, 
  Clock, 
  Zap, 
  Server,
  Sparkles
} from 'lucide-react';
import { MOCK_MCP_TOOLS } from '@/services/mockData';
import { McpToolDefinition } from '@/types';

interface McpInspectorProps {
  onRunTool: (toolName: string, args: Record<string, any>) => void;
}

export const McpInspector: React.FC<McpInspectorProps> = ({ onRunTool }) => {
  const [selectedTool, setSelectedTool] = useState<McpToolDefinition>(MOCK_MCP_TOOLS[0]);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950/40 overflow-y-auto p-6 space-y-6">
      {/* Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900/60 to-slate-950 border border-amber-500/20 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-white">Inspector de Herramientas MCP</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                {MOCK_MCP_TOOLS.length} Tools Registradas
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Protocolo Model Context Protocol (MCP) sincronizado entre tu backend y el cliente.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Tools List & Schema Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Tools List */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
            Herramientas Disponibles
          </span>
          <div className="space-y-2">
            {MOCK_MCP_TOOLS.map((t) => (
              <button
                key={t.name}
                onClick={() => setSelectedTool(t)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1 ${
                  selectedTool.name === t.name
                    ? 'bg-amber-500/15 border-amber-500/40 text-white shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-amber-300">{t.name}</span>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.2 rounded bg-slate-800 text-slate-400">
                    {t.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">{t.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Tool Schema & Playground */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h4 className="text-sm font-mono font-bold text-amber-300">{selectedTool.name}</h4>
                <p className="text-xs text-slate-400 mt-1">{selectedTool.description}</p>
              </div>

              <button
                onClick={() => onRunTool(selectedTool.name, {})}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-amber-500/20"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>Ejecutar Test</span>
              </button>
            </div>

            {/* Schema Properties */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                Parámetros de Entrada (JSON Schema)
              </span>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
                {JSON.stringify(selectedTool.parameters, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
