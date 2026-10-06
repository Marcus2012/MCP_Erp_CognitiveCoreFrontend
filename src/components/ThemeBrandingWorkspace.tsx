import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Sparkles, 
  Save, 
  RefreshCw, 
  Check, 
  Eye, 
  Type, 
  Layout, 
  Loader2,
  Sliders,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { OdooThemeBranding } from '@/types';
import { fetchLiveTheme, updateNavbarTheme } from '@/services/api';

const THEME_PRESETS = [
  {
    name: 'Cognitive Core Cyan',
    primary: '#06b6d4',
    secondary: '#0e7490',
    emailPrimary: '#0891b2',
    emailSecondary: '#164e63',
    font: 'Inter',
  },
  {
    name: 'Odoo Purple Enterprise',
    primary: '#714B67',
    secondary: '#00A09D',
    emailPrimary: '#FFFFFF',
    emailSecondary: '#714B67',
    font: 'Lato',
  },
  {
    name: 'Deep Oceanic Blue',
    primary: '#427293',
    secondary: '#092d53',
    emailPrimary: '#FFFFFF',
    emailSecondary: '#427293',
    font: 'Lato',
  },
  {
    name: 'Emerald FinTech',
    primary: '#10b981',
    secondary: '#047857',
    emailPrimary: '#059669',
    emailSecondary: '#064e3b',
    font: 'Roboto',
  },
  {
    name: 'Obsidian Amber',
    primary: '#f59e0b',
    secondary: '#b45309',
    emailPrimary: '#d97706',
    emailSecondary: '#78350f',
    font: 'Montserrat',
  },
];

const AVAILABLE_FONTS = ['Lato', 'Roboto', 'Inter', 'Open Sans', 'Montserrat', 'Poppins'];

interface ThemeBrandingWorkspaceProps {
  onAskAgent?: (prompt: string) => void;
}

export const ThemeBrandingWorkspace: React.FC<ThemeBrandingWorkspaceProps> = ({ onAskAgent }) => {
  const [theme, setTheme] = useState<OdooThemeBranding>({
    primary_color: '#427293',
    secondary_color: '#092d53',
    email_primary_color: '#FFFFFF',
    email_secondary_color: '#875A7B',
    font: 'Lato',
    name: 'Cognitive Core',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadTheme = async () => {
    setLoading(true);
    try {
      const live = await fetchLiveTheme();
      if (live) {
        setTheme({
          primary_color: live.primary_color || '#427293',
          secondary_color: live.secondary_color || '#092d53',
          email_primary_color: live.email_primary_color || '#FFFFFF',
          email_secondary_color: live.email_secondary_color || '#875A7B',
          font: live.font || 'Lato',
          name: live.name || 'Cognitive Core',
          uses_default_logo: live.uses_default_logo,
          custom_css_installed: live.custom_css_installed,
          custom_css_active: live.custom_css_active,
        });
      }
    } catch (err) {
      console.error('Error loading live theme:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTheme();
  }, []);

  const handleApplyPreset = (preset: typeof THEME_PRESETS[0]) => {
    setTheme((prev) => ({
      ...prev,
      primary_color: preset.primary,
      secondary_color: preset.secondary,
      email_primary_color: preset.emailPrimary,
      email_secondary_color: preset.emailSecondary,
      font: preset.font,
    }));
  };

  const handleSaveTheme = async () => {
    setSaving(true);
    setStatusMessage(null);
    try {
      const result = await updateNavbarTheme({
        primary_color: theme.primary_color,
        secondary_color: theme.secondary_color,
        email_primary_color: theme.email_primary_color,
        email_secondary_color: theme.email_secondary_color,
        font: theme.font,
      });

      if (result.success) {
        setStatusMessage({ type: 'success', text: '¡Tema y Navbar actualizados exitosamente en Odoo 20!' });
      } else {
        setStatusMessage({ type: 'error', text: result.error || 'No se pudo guardar el tema en Odoo 20.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error de conexión.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950/40 overflow-y-auto p-6 space-y-6">
      {/* Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-pink-950/40 via-purple-950/40 to-slate-950 border border-pink-500/20 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-white">Módulo de Theme & Branding Odoo 20</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20 font-medium">
                Live Customizer
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Personaliza la paleta corporativa, colores del Navbar, botones y tipografía de tu ERP en tiempo real.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadTheme}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 text-xs font-medium transition"
            title="Recargar tema actual de Odoo"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-pink-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Recargar</span>
          </button>

          <button
            onClick={handleSaveTheme}
            disabled={saving || loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 disabled:bg-slate-800 text-white text-xs font-semibold transition shadow-lg shadow-pink-600/20"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saving ? 'Guardando en Odoo...' : 'Aplicar en Odoo 20'}</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-xl text-xs flex items-center gap-2 border ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
          <p className="text-xs">Obteniendo configuración de branding desde Odoo 20...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Color Controls & Presets (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Presets */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 backdrop-blur-sm space-y-3">
              <span className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pink-400" /> Paletas Predefinidas
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {THEME_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handleApplyPreset(preset)}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 hover:border-pink-500/50 transition text-left flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-pink-300 transition">
                        {preset.name}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Fuente: {preset.font}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: preset.primary }} />
                      <span className="w-4 h-4 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: preset.secondary }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Color Pickers */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 backdrop-blur-sm space-y-4">
              <span className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-pink-400" /> Colores Personalizados
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Primary Color */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-300">Color Primario (Navbar & Botones)</span>
                    <span className="text-[11px] font-mono text-pink-300 uppercase">{theme.primary_color}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={theme.primary_color}
                      onChange={(e) => setTheme({ ...theme, primary_color: e.target.value })}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={theme.primary_color}
                      onChange={(e) => setTheme({ ...theme, primary_color: e.target.value })}
                      className="flex-1 bg-slate-900 border border-slate-800 text-xs text-slate-200 font-mono rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                {/* Secondary Color */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-300">Color Secundario (Acentos)</span>
                    <span className="text-[11px] font-mono text-pink-300 uppercase">{theme.secondary_color}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={theme.secondary_color}
                      onChange={(e) => setTheme({ ...theme, secondary_color: e.target.value })}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={theme.secondary_color}
                      onChange={(e) => setTheme({ ...theme, secondary_color: e.target.value })}
                      className="flex-1 bg-slate-900 border border-slate-800 text-xs text-slate-200 font-mono rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                {/* Email Primary */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-300">Color Primario Email</span>
                    <span className="text-[11px] font-mono text-pink-300 uppercase">{theme.email_primary_color || '#FFFFFF'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={theme.email_primary_color || '#FFFFFF'}
                      onChange={(e) => setTheme({ ...theme, email_primary_color: e.target.value })}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={theme.email_primary_color || '#FFFFFF'}
                      onChange={(e) => setTheme({ ...theme, email_primary_color: e.target.value })}
                      className="flex-1 bg-slate-900 border border-slate-800 text-xs text-slate-200 font-mono rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                {/* Typography */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5 text-pink-400" /> Tipografía del Sistema
                  </span>
                  <select
                    value={theme.font || 'Lato'}
                    onChange={(e) => setTheme({ ...theme, font: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-pink-500/50"
                  >
                    {AVAILABLE_FONTS.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Real-Time Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 backdrop-blur-sm space-y-4">
              <span className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-4 h-4 text-pink-400" /> Previsualización Odoo 20 Live
              </span>

              {/* Simulated Odoo Window */}
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
                {/* Navbar */}
                <div
                  className="px-4 py-3 text-white flex items-center justify-between transition-colors duration-300"
                  style={{ backgroundColor: theme.primary_color }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-white/80" />
                    <span className="font-bold text-xs tracking-tight">Odoo 20 | {theme.name || 'Cognitive Core'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] opacity-90">
                    <span>Contactos</span>
                    <span>Ventas</span>
                    <span>Inventario</span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 space-y-3 bg-slate-900 text-slate-200 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h5 className="font-semibold text-white">Directorio de Contactos</h5>
                    <button
                      className="px-3 py-1 rounded text-[11px] text-white font-medium transition"
                      style={{ backgroundColor: theme.secondary_color }}
                    >
                      + Nuevo Contacto
                    </button>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
                    <div className="font-semibold text-white">COGNITIVE CORE E.I.R.L.</div>
                    <div className="text-[11px] text-slate-400">RUC: 20615693996 | datadriven111@gmail.com</div>
                    <div className="flex items-center gap-2 pt-1">
                      <span
                        className="text-[10px] px-2 py-0.5 rounded font-semibold text-white"
                        style={{ backgroundColor: theme.primary_color }}
                      >
                        Cliente Activo
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 leading-relaxed text-center">
                Al hacer clic en <strong>"Aplicar en Odoo 20"</strong>, los cambios se persisten inmediatamente en el backend mediante el endpoint <code className="text-pink-300 font-mono">/api/theme/navbar</code>.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
