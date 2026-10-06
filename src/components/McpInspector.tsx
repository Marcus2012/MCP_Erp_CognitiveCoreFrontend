import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Terminal, 
  Code, 
  Play, 
  CheckCircle, 
  Clock, 
  Zap, 
  Server,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { McpToolDefinition } from '@/types';
import { fetchLiveMcpTools, executeMcpToolLive } from '@/services/api';

interface McpInspectorProps {
  onRunTool: (toolName: string, args: Record<string, any>) => void;
}

export const McpInspector: React.FC<McpInspectorProps> = ({ onRunTool }) => {
  const [tools, setTools] = useState<McpToolDefinition[]>([]);
  const [selectedTool, setSelectedTool] = useState<McpToolDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);

  const loadTools = async () => {
    setLoading(true);
    try {
      const liveTools = await fetchLiveMcpTools();
      setTools(liveTools);
      if (liveTools.length > 0) {
        setSelectedTool(liveTools[0]);
      }
    } catch (err) {
      console.error('Error fetching live MCP tools:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTools();
  }, []);

  const handleExecuteLive = async () => {
    if (!selectedTool) return;
    setExecuting(true);
    setExecutionResult(null);
    try {
      const res = await executeMcpToolLive(selectedTool.name, {});
      setExecutionResult({ success: true, data: res });
    } catch (err: any) {
      setExecutionResult({ success: false, error: err.message });
    } finally {
      setExecuting(false);
    }
  };

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
              <h3 className="text-base font-semibold text-white">Inspector de Herramientas MCP Odoo 20</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                {tools.length} Tools Registradas en Vivo
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Protocolo Model Context Protocol (MCP) sincronizado directamente con tu backend FastAPI y Odoo 20 Community.
            </p>
          </div>
        </div>

        <button
          onClick={loadTools}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 text-xs font-medium transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Sincronizar Tools</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          <p className="text-xs">Cargando herramientas desde /api/mcp/tools...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Tools List */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
              Herramientas MCP Registradas
            </span>
            <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
              {tools.map((t) => (
                <button
                  key={t.name}
                  onClick={() => {
                    setSelectedTool(t);
                    setExecutionResult(null);
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-1 ${
                    selectedTool?.name === t.name
                      ? 'bg-amber-500/15 border-amber-500/40 text-white shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-amber-300 truncate max-w-[170px]">{t.name}</span>
                    <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
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
            {selectedTool ? (
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 backdrop-blur-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h4 className="text-sm font-mono font-bold text-amber-300">{selectedTool.name}</h4>
                    <p className="text-xs text-slate-400 mt-1">{selectedTool.description}</p>
                  </div>

                  <button
                    onClick={handleExecuteLive}
                    disabled={executing}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 text-slate-950 font-bold text-xs transition shadow-lg shadow-amber-500/20"
                  >
                    {executing ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-slate-950" />
                    )}
                    <span>{executing ? 'Ejecutando...' : 'Ejecutar en Odoo'}</span>
                  </button>
                </div>

                {/* Schema Properties */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                    Parámetros de Entrada (JSON Schema)
                  </span>
                  <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto max-h-60">
                    {JSON.stringify(selectedTool.parameters, null, 2)}
                  </pre>
                </div>

                {/* Execution Result */}
                {executionResult && (
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                      Resultado de Ejecución en Vivo
                    </span>
                    <pre className={`p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-64 border ${
                      executionResult.success
                        ? 'bg-slate-950 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-950 border-rose-500/40 text-rose-300'
                    }`}>
                      {JSON.stringify(executionResult.data || executionResult.error, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs">
                Selecciona una herramienta para inspeccionar su esquema.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
