'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { ChatContainer } from '@/components/ChatContainer';
import { OdooWorkspace } from '@/components/OdooWorkspace';
import { OmnichannelHub } from '@/components/OmnichannelHub';
import { McpInspector } from '@/components/McpInspector';
import { Message, ChatSession, OdooEntityPreview, ToolCall } from '@/types';
import { sendMessageToAgent, checkBackendHealth } from '@/services/api';

const DEFAULT_SESSIONS: ChatSession[] = [
  {
    id: 'session-1',
    title: 'Consultas Odoo 20 Community',
    mode: 'odoo',
    createdAt: '06/10/2026',
    updatedAt: '10:00',
    messageCount: 1,
    lastMessageSnippet: 'Conexión activa con erp.cognitivecore.pe',
  },
  {
    id: 'session-2',
    title: 'Hub Omnicanal WhatsApp & Telegram',
    mode: 'omnichannel',
    createdAt: '06/10/2026',
    updatedAt: '09:40',
    messageCount: 0,
    lastMessageSnippet: 'Canales vinculados al ERP',
  },
];

export default function Home() {
  const [currentTab, setCurrentTab] = useState<'chat' | 'odoo' | 'channels' | 'mcp'>('chat');
  const [chatMode, setChatMode] = useState<'general' | 'odoo' | 'omnichannel'>('general');
  const [sessions, setSessions] = useState<ChatSession[]>(DEFAULT_SESSIONS);
  const [activeSessionId, setActiveSessionId] = useState<string>('session-1');
  const [backendOnline, setBackendOnline] = useState<boolean>(true);
  
  // Active conversation state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `¡Bienvenido a **Cognitive Core MCP Frontend**! 🚀\n\nConectado en vivo con **Odoo 20 Community (\`https://erp.cognitivecore.pe\`)** y canales de mensajería (**WhatsApp** y **Telegram**).\n\nPuedes pedirme consultar contactos, catálogo de productos/servicios, emitir presupuestos o enviar notificaciones.`,
      timestamp: '10:00',
    },
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const verifyHealth = async () => {
    const health = await checkBackendHealth();
    setBackendOnline(health.online);
  };

  useEffect(() => {
    verifyHealth();
    const interval = setInterval(verifyHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async (text: string) => {
    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    let activeToolCalls: ToolCall[] = [];
    let assistantMsgId = `ast-${Date.now()}`;

    // Add empty assistant placeholder for streaming
    setMessages((prev) => [
      ...prev,
      {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolCalls: [],
      },
    ]);

    await sendMessageToAgent(
      text,
      [...messages, userMsg],
      {
        onToken: (token) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId ? { ...m, content: m.content + token } : m
            )
          );
        },
        onToolCallStart: (tc) => {
          activeToolCalls = [...activeToolCalls, tc];
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId ? { ...m, toolCalls: [...activeToolCalls] } : m
            )
          );
        },
        onToolCallEnd: (tc) => {
          activeToolCalls = activeToolCalls.map((t) => (t.id === tc.id ? tc : t));
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId ? { ...m, toolCalls: [...activeToolCalls] } : m
            )
          );
        },
        onFinish: (fullMsg) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? {
                    ...m,
                    content: fullMsg.content,
                    toolCalls: fullMsg.toolCalls || activeToolCalls,
                    odooPreview: fullMsg.odooPreview,
                  }
                : m
            )
          );
          setIsLoading(false);
        },
        onError: (err) => {
          console.error(err);
          setIsLoading(false);
        },
      },
      chatMode
    );
  };

  const handleNewSession = (mode: 'general' | 'odoo' | 'omnichannel') => {
    const newId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: mode === 'odoo' ? 'Nueva Consulta Odoo 20' : mode === 'omnichannel' ? 'Nuevo Chat Omnicanal' : 'Nueva Conversación IA',
      mode,
      createdAt: new Date().toLocaleDateString('es-ES'),
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messageCount: 0,
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
    setMessages([]);
    setChatMode(mode);
    setCurrentTab('chat');
  };

  const handleOdooAction = (action: string, entity: OdooEntityPreview) => {
    if (action === 'create_contact') {
      handleSendMessage(`Quiero registrar un nuevo contacto en Odoo 20 Community.`);
    } else if (action === 'export_whatsapp') {
      handleSendMessage(`Enviar ficha de contacto por WhatsApp.`);
    } else if (action === 'create_so') {
      handleSendMessage(`Generar un presupuesto en Odoo 20 para el servicio ${entity.name}.`);
    } else {
      handleSendMessage(`Ejecutar acción "${action}" para la entidad ${entity.name} en Odoo 20.`);
    }
    setCurrentTab('chat');
  };

  const handleAskAgent = (prompt: string) => {
    setCurrentTab('chat');
    handleSendMessage(prompt);
  };

  const handleRunToolDirect = (toolName: string) => {
    setCurrentTab('chat');
    handleSendMessage(`Ejecuta la herramienta MCP "${toolName}" en Odoo 20 y muestra el resultado.`);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#090d16] text-slate-100 font-sans">
      {/* Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => setActiveSessionId(id)}
        onNewSession={handleNewSession}
        backendOnline={backendOnline}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header
          currentTab={currentTab}
          chatMode={chatMode}
          setChatMode={setChatMode}
          onRefreshBackend={verifyHealth}
          backendOnline={backendOnline}
        />

        <main className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden">
          {currentTab === 'chat' && (
            <ChatContainer
              messages={messages}
              isLoading={isLoading}
              onSendMessage={handleSendMessage}
              chatMode={chatMode}
              onOdooAction={handleOdooAction}
            />
          )}

          {currentTab === 'odoo' && (
            <OdooWorkspace onAskAgent={handleAskAgent} />
          )}

          {currentTab === 'channels' && (
            <OmnichannelHub onSendMessageToChat={handleAskAgent} />
          )}

          {currentTab === 'mcp' && (
            <McpInspector onRunTool={handleRunToolDirect} />
          )}
        </main>
      </div>
    </div>
  );
}
