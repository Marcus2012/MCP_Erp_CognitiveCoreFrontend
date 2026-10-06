'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { ChatContainer } from '@/components/ChatContainer';
import { OdooWorkspace } from '@/components/OdooWorkspace';
import { OmnichannelHub } from '@/components/OmnichannelHub';
import { McpInspector } from '@/components/McpInspector';
import { Message, ChatSession, OdooEntityPreview, ToolCall } from '@/types';
import { sendMessageToAgent } from '@/services/api';

const DEFAULT_SESSIONS: ChatSession[] = [
  {
    id: 'session-1',
    title: 'Consultas Odoo & Stock',
    mode: 'odoo',
    createdAt: '06/10/2026',
    updatedAt: '10:14',
    messageCount: 3,
    lastMessageSnippet: 'Presupuesto SO0504 generado...',
  },
  {
    id: 'session-2',
    title: 'Soporte Clientes WhatsApp',
    mode: 'omnichannel',
    createdAt: '06/10/2026',
    updatedAt: '09:40',
    messageCount: 5,
    lastMessageSnippet: 'Mensaje enviado a Deco Addict SL...',
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
      content: `¡Bienvenido a **Cognitive Core MCP Frontend**! 🚀\n\nEstoy conectado con tu backend para interactuar con **ERP Cognitive Core** y tus canales de comunicación (**WhatsApp** y **Telegram**).\n\nPuedes pedirme verificar inventario, emitir presupuestos de venta o enviar notificaciones a clientes.`,
      timestamp: '10:00',
    },
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
      title: mode === 'odoo' ? 'Nueva Consulta Odoo' : mode === 'omnichannel' ? 'Nuevo Chat Omnicanal' : 'Nueva Conversación IA',
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
    if (action === 'confirm_so') {
      handleSendMessage(`Confirmar y validar la orden de venta ${entity.name} en Odoo ERP.`);
    } else if (action === 'send_whatsapp_doc') {
      handleSendMessage(`Enviar el presupuesto en PDF de ${entity.name} por WhatsApp al contacto del cliente.`);
    } else if (action === 'create_quote') {
      handleSendMessage(`Generar un nuevo presupuesto para el producto ${entity.name} en Odoo.`);
    } else {
      handleSendMessage(`Ejecutar acción "${action}" para la entidad ${entity.name} en Odoo.`);
    }
    setCurrentTab('chat');
  };

  const handleAskAgent = (prompt: string) => {
    setCurrentTab('chat');
    handleSendMessage(prompt);
  };

  const handleRunToolDirect = (toolName: string) => {
    setCurrentTab('chat');
    handleSendMessage(`Ejecuta la herramienta MCP "${toolName}" con parámetros de prueba y muestra el resultado.`);
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
          onRefreshBackend={() => setBackendOnline(true)}
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
